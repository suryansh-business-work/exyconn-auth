import { Request, Response } from "express";
import Organization from "../../god/organization/organization.model";
import * as AuthService from "../auth.service";
import {
  successResponse,
  badRequestResponse,
  errorResponse,
  logger,
} from "@exyconn/common/server";

export const getCompanies = async (req: Request, res: Response) => {
  try {
    const organizations = await Organization.find({ orgActiveStatus: true })
      .select("_id orgName orgLogos orgEmail authServerUrl")
      .lean();

    const companyList = organizations.map((org: any) => ({
      id: org._id,
      name: org.orgName,
      logo: org.orgLogos?.primary || "",
      domain: org.orgEmail,
      authServerUrl: org.authServerUrl || "",
    }));
    res.json({ companies: companyList, total: companyList.length });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch companies" });
  }
};

/**
 * Step 1: Get API key by domain (auth server URL, website, or work domain)
 * Used in production to find which API key to use for the initial connection
 */
export const getApiKeyByDomain = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const domainFromQuery = req.query.domain as string;
    const domainFromHost = req.headers.host;
    const domain = (domainFromQuery || domainFromHost || "")
      .trim()
      .toLowerCase();

    logger.info("🌐 API Key lookup by domain:", domain);

    if (!domain || domain === "") {
      badRequestResponse(res, "Domain is required");
      return;
    }

    // Normalize the domain for comparison (remove protocol, www, auth subdomains)
    let normalizedDomain = domain;
    try {
      // If it's a full URL, extract hostname
      if (normalizedDomain.includes("://")) {
        const url = new URL(normalizedDomain);
        normalizedDomain = url.hostname;
      }

      // Simplify to root domain (last 2 parts) to ensure matching
      // e.g. app.exyconn.com -> exyconn.com
      // This allows 'app', 'dashboard', 'portal' subdomains to all match the main org domain
      const parts = normalizedDomain.split(".");
      if (parts.length > 2) {
        // Avoid slicing IP addresses
        const isIp = parts.every((p) => !isNaN(Number(p)));
        if (!isIp) {
          normalizedDomain = parts.slice(-2).join(".");
        }
      }
    } catch (e) {
      // If URL parsing fails, continue with original domain
    }

    logger.info("🔍 Searching for organization matching:", normalizedDomain);

    // Find organization by searching multiple potential domain fields
    const organization = (await Organization.findOne({
      orgActiveStatus: true,
      $or: [
        {
          authServerUrl: { $regex: normalizedDomain, $options: "i" },
        },
        {
          orgWebsite: { $regex: normalizedDomain, $options: "i" },
        },
        {
          orgWorkDomain: { $regex: normalizedDomain, $options: "i" },
        },
      ],
    })
      .select("apiKey orgName")
      .lean()) as any;

    if (!organization || !organization.apiKey) {
      logger.info("❌ No organization found for domain:", normalizedDomain);
      successResponse(
        res,
        { matched: false },
        "No organization found for this domain",
      );
      return;
    }

    logger.info("✅ API Key found for:", organization.orgName);

    // API key returned in response - frontend stores in localStorage
    successResponse(
      res,
      {
        apiKey: organization.apiKey,
        orgName: organization.orgName,
        matched: true,
      },
      "API Key fetched successfully",
    );
  } catch (error: any) {
    logger.error("❌ Error fetching API key by domain:", error.message);
    errorResponse(res, error, "Failed to resolve API key by domain");
  }
};

/**
 * Step 1.5: Verify API key (for development/manual selection)
 * Frontend stores in localStorage - no cookies used
 */
export const setManualApiKey = async (req: Request, res: Response) => {
  try {
    const { apiKey } = req.body;

    if (!apiKey) {
      successResponse(res, { cleared: true }, "API Key cleared");
      return;
    }

    // Verify API key exists
    const organization = (await Organization.findOne({
      apiKey,
      orgActiveStatus: true,
    })
      .select("_id orgName")
      .lean()) as any;

    if (!organization) {
      badRequestResponse(res, "Invalid API Key");
      return;
    }

    // API key verified - frontend stores in localStorage
    successResponse(
      res,
      {
        success: true,
        apiKey,
        orgId: organization._id,
        orgName: organization.orgName,
      },
      "API Key verified successfully",
    );
  } catch (error: any) {
    errorResponse(res, error, "Failed to verify API Key");
  }
};

/**
 * Step 2: Get full organization details using API key
 * Used in both local and production once the API key is known
 * Secured via authenticateApiKey middleware
 */
export const getPublicOrganizationDetailsByApiKey = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // Get organization from API key middleware
    const organization = (req as any).organization;

    if (!organization) {
      logger.error("❌ Organization not found in request (middleware failed)");
      errorResponse(res, undefined, "Organization authentication failed");
      return;
    }

    logger.info("🏢 Fetching public details for:", organization.orgName);

    // Configuration issues check (same as before)
    const issues = {
      critical: [] as { id: string; name: string; description: string }[],
      warning: [] as { id: string; name: string; description: string }[],
      info: [] as { id: string; name: string; description: string }[],
    };

    // Check critical settings
    if (!organization.smtpSettings?.host || !organization.smtpSettings?.user) {
      issues.critical.push({
        id: "smtp",
        name: "SMTP Settings",
        description: "Email server not configured",
      });
    }

    if (
      !organization.orgRedirectionSettings ||
      organization.orgRedirectionSettings.length === 0
    ) {
      issues.critical.push({
        id: "redirections",
        name: "Redirection Settings",
        description: "No redirect URLs configured",
      });
    }

    // Transform OAuth settings: convert to redirectionRules format, remove legacy arrays
    const transformOAuthSettings = (oauthSettings: any) => {
      if (!oauthSettings) return oauthSettings;

      const transformed: any = {};

      for (const [providerKey, provider] of Object.entries(
        oauthSettings,
      ) as any[]) {
        if (!provider) {
          transformed[providerKey] = provider;
          continue;
        }

        // Derive redirectionRules from environments or legacy arrays
        let redirectionRules: any[] = [];

        // Check if redirectionRules already exist (new schema)
        if (provider.redirectionRules && provider.redirectionRules.length > 0) {
          redirectionRules = provider.redirectionRules;
        } else if (provider.environments && provider.environments.length > 0) {
          // Fallback to environments field if present (intermediate migration)
          redirectionRules = provider.environments;
        } else {
          // Derive from legacy arrays
          const legacyOrigins = provider.authorizedJavaScriptOrigins || [];
          const legacyUris = provider.authorizedRedirectUris || [];

          if (legacyOrigins.length > 0 || legacyUris.length > 0) {
            redirectionRules = [
              {
                name: "Local Dev",
                isDefault: true,
                authorizedJavaScriptOrigin: legacyOrigins[0] || "",
                authorizedRedirectUri: legacyUris[0] || "",
              },
              {
                name: "Production",
                isDefault: true,
                authorizedJavaScriptOrigin: legacyOrigins[1] || "",
                authorizedRedirectUri: legacyUris[1] || "",
              },
            ];

            // Any additional pairs
            for (
              let i = 2;
              i < Math.max(legacyOrigins.length, legacyUris.length);
              i++
            ) {
              redirectionRules.push({
                name: `Custom ${i - 1}`,
                isDefault: false,
                authorizedJavaScriptOrigin: legacyOrigins[i] || "",
                authorizedRedirectUri: legacyUris[i] || "",
              });
            }
          }
        }

        // Return clean structure without legacy arrays
        transformed[providerKey] = {
          enabled: provider.enabled,
          clientId: provider.clientId,
          redirectionRules,
        };
      }

      return transformed;
    };

    // Return public-facing organization details
    const publicOrgData = {
      orgId: organization._id,
      _id: organization._id,
      orgName: organization.orgName,
      orgEmail: organization.orgEmail,
      orgWebsite: organization.orgWebsite,
      orgSlug: organization.orgSlug,
      orgLogos: organization.orgLogos,
      orgFavIcon: organization.orgFavIcon,
      loginBgImages: organization.loginBgImages,
      loginPageDesign: organization.loginPageDesign,
      customTextSections: organization.customTextSections,
      orgTheme: organization.orgTheme,
      oauthSettings: transformOAuthSettings(organization.oauthSettings),
      featureFlags: organization.featureFlags,
      mailSettings: organization.mailSettings,
      orgRedirectionSettings: organization.orgRedirectionSettings,
      orgPoliciesLink: organization.orgPoliciesLink || [],
      passwordPolicy: organization.orgOptions?.passwordPolicy || {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
      },
      customCss: organization.customCss,
      customHtml: organization.customHtml,
      customJs: organization.customJs,
      issues,
      apiKey: organization.apiKey, // Helper for hybrid auth (header support)
    };

    successResponse(
      res,
      publicOrgData,
      "Organization details retrieved successfully",
    );
  } catch (error: any) {
    logger.error(
      "❌ Error fetching organization details by key:",
      error.message,
    );
    errorResponse(res, error, "Failed to fetch organization details");
  }
};
