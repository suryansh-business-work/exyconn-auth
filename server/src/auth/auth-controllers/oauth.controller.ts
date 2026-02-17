import { Request, Response } from "express";
import axios from "axios";
import * as AuthService from "../auth.service";
import User from "../auth.model";
import { badRequestResponse, errorResponse, logger } from "../../common";
import { computeRedirectionUrl } from "./base";
import { ENV } from "../../config/env";

/**
 * Validate Google Client ID format
 * Valid format: 123456789-abc123.apps.googleusercontent.com
 * Invalid format: http://123456789-abc123.apps.googleusercontent.com
 */
const isValidGoogleClientId = (clientId: string): boolean => {
  if (!clientId) return false;
  // Client ID must NOT have http:// or https:// prefix
  if (clientId.startsWith("http://") || clientId.startsWith("https://")) {
    return false;
  }
  // Client ID must match Google's format
  return /^\d+(-[\w.]+)?\.apps\.googleusercontent\.com$/.test(clientId);
};

/**
 * Diagnostic endpoint to check what OAuth credentials are stored
 * Helps debug "Error 401: invalid_client"
 */
export const getOAuthDiagnostics = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const organizationId = (req as any).organizationId;

    if (!organizationId) {
      badRequestResponse(res, "Organization ID is required");
      return;
    }

    const company = await AuthService.getCompanyById(organizationId as string);
    if (!company) {
      errorResponse(res, undefined, "Organization not found");
      return;
    }

    const googleSettings = company.oauthSettings?.google;

    res.json({
      status: "success",
      data: {
        organizationId,
        organizationName: company.orgName,
        googleOAuthPresent: !!googleSettings,
        googleOAuthEnabled: googleSettings?.enabled,
        diagnostics: {
          storedClientId: googleSettings?.clientId,
          storedClientIdLength: (googleSettings?.clientId || "").length,
          storedClientIdTrimmed: (googleSettings?.clientId || "").trim(),
          storedClientIdTrimmedLength: (googleSettings?.clientId || "").trim()
            .length,
          clientIdHasLeadingWhitespace: /^\s/.test(
            googleSettings?.clientId || "",
          ),
          clientIdHasTrailingWhitespace: /\s$/.test(
            googleSettings?.clientId || "",
          ),
          clientIdFirstChars: (googleSettings?.clientId || "").substring(0, 30),
          clientIdLastChars: (googleSettings?.clientId || "").slice(-30),
          isValidGoogleClientId:
            /^\d+(-[\w.]+)\.apps\.googleusercontent\.com$/.test(
              (googleSettings?.clientId || "").trim(),
            ),
          hasClientSecret: !!googleSettings?.clientSecret,
          storedClientSecretLength: (googleSettings?.clientSecret || "").length,
        },
        instructions:
          "Compare the 'storedClientId' with your Google Cloud Console OAuth 2.0 Client ID. " +
          "It must match EXACTLY. The client type must be 'Web application', not 'Desktop' or 'iOS'. " +
          "If they don't match, go to the Organization settings and update the OAuth credentials.",
      },
    });
  } catch (error: any) {
    errorResponse(res, error, error.message);
  }
};

export const getOAuthConfig = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // Get organizationId from API key middleware
    const organizationId = (req as any).organizationId;

    if (!organizationId) {
      badRequestResponse(res, "Organization ID is required");
      return;
    }

    const company = await AuthService.getCompanyById(organizationId as string);
    if (!company) {
      errorResponse(res, undefined, "Organization not found");
      return;
    }

    // Check if Google OAuth is enabled
    if (
      !company.oauthSettings?.google?.enabled ||
      !company.oauthSettings?.google?.clientId
    ) {
      badRequestResponse(
        res,
        "Google OAuth is not configured for this organization",
      );
      return;
    }

    res.json({
      status: "success",
      data: {
        clientId: (company.oauthSettings.google.clientId || "").trim(),
        enabled: company.oauthSettings.google.enabled,
      },
    });
  } catch (error: any) {
    errorResponse(res, error, error.message);
  }
};

export const initiateGoogleOAuth = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { organizationId, origin, testMode, role } = req.query;

    if (!organizationId) {
      badRequestResponse(res, "Organization ID is required");
      return;
    }

    // Get organization and its Google OAuth settings
    const company = await AuthService.getCompanyById(organizationId as string);
    if (!company) {
      errorResponse(res, undefined, "Organization not found");
      return;
    }

    const googleSettings = company.oauthSettings?.google;

    // Try database credentials first, but validate and sanitize the format
    // Remove any http:// or https:// prefix if present (common mistake)
    let dbClientId = (googleSettings?.clientId || "").trim();

    if (dbClientId.startsWith("http://")) {
      logger.warn("Google OAuth Client ID had http:// prefix - auto-removing");
      dbClientId = dbClientId.substring(7);
    } else if (dbClientId.startsWith("https://")) {
      logger.warn("Google OAuth Client ID had https:// prefix - auto-removing");
      dbClientId = dbClientId.substring(8);
    }

    const dbClientSecret = (googleSettings?.clientSecret || "").trim();
    const isValidClientId = isValidGoogleClientId(dbClientId);

    // Only use DB credentials if they're valid and non-empty
    const useDbCredentials = isValidClientId && dbClientSecret;
    const clientId = useDbCredentials ? dbClientId : ENV.GOOGLE_OAUTH_CLIENT_ID;
    const clientSecret = useDbCredentials
      ? dbClientSecret
      : ENV.GOOGLE_OAUTH_CLIENT_SECRET;

    // Check if we have valid credentials from either source
    if (!clientId || !clientSecret) {
      badRequestResponse(
        res,
        "Google OAuth is not configured for this organization",
      );
      return;
    }
    const roleParam = (role as string) || "user";
    const state = JSON.stringify({
      organizationId,
      role: roleParam,
      origin,
      testMode: testMode === "true",
      provider: "google",
    });

    // Simple callback URL - always use the server's callback endpoint
    // The callback will then redirect to the appropriate origin
    const callbackUrl = `${process.env.API_BASE_URL || "https://exyconn-auth-server.exyconn.com"}/v1/api/auth/google/callback`;

    // Build Google OAuth URL with organization-specific credentials
    const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    authUrl.searchParams.append("client_id", clientId);
    authUrl.searchParams.append("redirect_uri", callbackUrl);
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append("scope", "openid email profile");
    authUrl.searchParams.append("state", state);

    res.redirect(authUrl.toString());
  } catch (error: any) {
    logger.error("❌ OAuth initiation error:", error);
    errorResponse(res, error, error.message);
  }
};

export const handleOrgGoogleCallback = async (req: Request, res: Response) => {
  try {
    const { code, state, error } = req.query;

    // Parse state early to get origin for error redirects
    let organizationId = "default";
    let origin = "";
    let testMode = false;
    let stateRole = "user";
    try {
      const parsed = JSON.parse((state as string) || "{}");
      organizationId = parsed.organizationId || "default";
      origin = parsed.origin || "";
      testMode = parsed.testMode || false;
      stateRole = parsed.role || "user";
    } catch (e) {
      logger.error("Failed to parse OAuth state:", e);
    }

    // Use origin from state as base redirect URL - NO hardcoded localhost fallback
    // If origin is empty, we'll handle relative redirects
    const baseRedirectUrl = origin;

    if (error) {
      logger.error("OAuth error from Google:", error);
      const errorRedirect = baseRedirectUrl
        ? `${baseRedirectUrl}/oauth-callback?error=${error}&company=${organizationId}`
        : `/oauth-callback?error=${error}&company=${organizationId}`;
      return res.redirect(errorRedirect);
    }

    if (!code || !state) {
      logger.error("Missing code or state in OAuth callback");
      const errorRedirect = baseRedirectUrl
        ? `${baseRedirectUrl}/oauth-callback?error=missing_params&company=${organizationId}`
        : `/oauth-callback?error=missing_params&company=${organizationId}`;
      return res.redirect(errorRedirect);
    }

    // Get organization and its Google OAuth settings
    const company = await AuthService.getCompanyById(organizationId);
    if (!company) {
      logger.error("Organization not found:", organizationId);
      const errorRedirect = baseRedirectUrl
        ? `${baseRedirectUrl}/oauth-callback?error=invalid_organization&company=${organizationId}`
        : `/oauth-callback?error=invalid_organization&company=${organizationId}`;
      return res.redirect(errorRedirect);
    }

    const googleSettings = company.oauthSettings?.google;

    // Try database credentials first, but validate and sanitize the format
    // Remove any http:// or https:// prefix if present (common mistake)
    let dbClientId = (googleSettings?.clientId || "").trim();
    if (dbClientId.startsWith("http://")) {
      dbClientId = dbClientId.substring(7); // Remove "http://"
    } else if (dbClientId.startsWith("https://")) {
      dbClientId = dbClientId.substring(8); // Remove "https://"
    }

    const dbClientSecret = (googleSettings?.clientSecret || "").trim();

    // Only use DB credentials if they're valid and non-empty
    const useDbCredentials =
      isValidGoogleClientId(dbClientId) && dbClientSecret;
    const clientId = useDbCredentials ? dbClientId : ENV.GOOGLE_OAUTH_CLIENT_ID;
    const clientSecret = useDbCredentials
      ? dbClientSecret
      : ENV.GOOGLE_OAUTH_CLIENT_SECRET;

    // Check if we have valid credentials from either source
    if (!clientId || !clientSecret) {
      logger.error(
        "Google OAuth credentials not configured for organization:",
        organizationId,
      );
      const errorRedirect = baseRedirectUrl
        ? `${baseRedirectUrl}/oauth-callback?error=oauth_not_configured&company=${organizationId}`
        : `/oauth-callback?error=oauth_not_configured&company=${organizationId}`;
      return res.redirect(errorRedirect);
    }

    // Use server's callback URL (must match what was set in initiation)
    const callbackUrl = `${process.env.API_BASE_URL || "https://exyconn-auth-server.exyconn.com"}/v1/api/auth/google/callback`;

    // Exchange code for token using organization's credentials
    const tokenResponse = await axios.post(
      "https://oauth2.googleapis.com/token",
      {
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: callbackUrl,
        grant_type: "authorization_code",
      },
    );

    const accessToken = tokenResponse.data.access_token;

    // Get user profile using access token
    const profileResponse = await axios.get(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    const userProfile = profileResponse.data;

    // Check if user exists in this organization
    let user = await AuthService.findUserByEmailAndCompany(
      userProfile.email,
      company._id.toString(),
    );

    if (!user) {
      // User doesn't exist - create new user with Google profile (auto signup)
      logger.info("👤 Creating new user from Google profile");
      const result = await AuthService.createGoogleUser(
        userProfile.email,
        userProfile.given_name || "",
        userProfile.family_name || "",
        company._id.toString(),
        userProfile.picture || "",
        stateRole,
      );
      user = result.user;
    } else {
      // Check if user belongs to this organization
      if (
        user.companyId &&
        user.companyId.toString() !== company._id.toString()
      ) {
        const errorRedirect = baseRedirectUrl
          ? `${baseRedirectUrl}/oauth-callback?error=user_not_in_organization&company=${organizationId}`
          : `/oauth-callback?error=user_not_in_organization&company=${organizationId}`;
        return res.redirect(errorRedirect);
      }
    }

    // Generate token
    if (!user || !user._id) {
      logger.error("❌ User or user._id is missing!", {
        user: user ? "✅" : "❌",
      });
      const errorRedirect = baseRedirectUrl
        ? `${baseRedirectUrl}/oauth-callback?error=invalid_user_data&company=${organizationId}`
        : `/oauth-callback?error=invalid_user_data&company=${organizationId}`;
      return res.redirect(errorRedirect);
    }

    // Use organization's JWT settings for token generation
    const token = AuthService.generateOrgToken(user, company);

    // Fetch location data
    const ipAddress =
      req.ip || req.headers["x-forwarded-for"]?.toString() || "unknown";
    const locationData = await AuthService.fetchLocationFromIP(ipAddress);

    // Update login history
    const loginEntry = {
      loginAt: new Date(),
      ipAddress,
      userAgent: req.headers["user-agent"] || "Unknown",
      location: {
        city: locationData.city,
        country: locationData.country,
      },
      details: locationData.details,
    };

    await User.updateOne(
      { _id: user._id },
      {
        lastLoginAt: loginEntry.loginAt,
        lastLoginIp: loginEntry.ipAddress,
        $push: {
          loginHistory: {
            $each: [loginEntry],
            $slice: -20,
          },
        },
      },
    );

    logger.info("🎉 OAuth successful, token generated and history updated:", {
      token: token ? `✅ EXISTS (length: ${token.length})` : "❌ MISSING",
      isString: typeof token === "string",
    });

    // Use the redirection service to resolve URL based on role and authPageUrl
    // This properly uses the new schema: authPageUrl, redirectionUrls (array)
    const userRole = user.role || "user";
    const authPageUrl = origin || "";

    const redirectionResult = computeRedirectionUrl(
      company.orgRedirectionSettings,
      userRole,
      authPageUrl,
      token,
    );

    const redirectUri = redirectionResult.redirectionUrl;

    logger.info("✅ Redirection resolved:", {
      origin,
      userRole,
      redirectUri,
      matchType: redirectionResult.matchType,
    });

    logger.info("📍 Final redirect configuration:", {
      baseRedirectUrl,
      redirectUri,
      isExternal: redirectUri.startsWith("http"),
    });

    // Construct final redirect URL with oAuthProvider info
    // The baseRedirectUrl is the auth server origin (e.g., https://auth.spentiva.com)
    // The redirectUri is where to go after OAuth callback (e.g., https://app.spentiva.com)
    const testModeParam = testMode ? "&testMode=true" : "";
    const oauthCallbackUrl = baseRedirectUrl
      ? `${baseRedirectUrl}/oauth-callback?success=true&company=${organizationId}&oAuthProvider=google&redirectUri=${encodeURIComponent(redirectUri)}&token=${encodeURIComponent(token)}${testModeParam}`
      : `/oauth-callback?success=true&company=${organizationId}&oAuthProvider=google&redirectUri=${encodeURIComponent(redirectUri)}&token=${encodeURIComponent(token)}${testModeParam}`;

    logger.info("🔄 Redirecting to OAuth callback:", oauthCallbackUrl);
    res.redirect(oauthCallbackUrl);
  } catch (error: any) {
    logger.error(
      "OAuth callback error:",
      error.response?.data || error.message,
    );

    // Try to get origin from state for error redirect
    let origin = "";
    try {
      const state = req.query.state as string;
      const parsed = JSON.parse(state || "{}");
      origin = parsed.origin || "";
    } catch (e) {
      // ignored
    }

    const errorMessage =
      error.response?.data?.error ||
      error.message ||
      "OAuth authentication failed";

    // Use origin for error redirect, not hardcoded localhost
    const errorRedirect = origin
      ? `${origin}/oauth-callback?error=${encodeURIComponent(errorMessage)}`
      : `/oauth-callback?error=${encodeURIComponent(errorMessage)}`;

    res.redirect(errorRedirect);
  }
};

export const exchangeOAuthCode = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { code, organizationId, origin } = req.body;

    logger.info("🔄 Exchange OAuth code request:", {
      organizationId,
      origin,
      hasCode: !!code,
    });

    // Validate required fields
    if (!code) {
      badRequestResponse(res, "OAuth code is required");
      return;
    }

    if (!organizationId) {
      badRequestResponse(res, "Organization ID is required");
      return;
    }

    // Get organization details
    const company = await AuthService.getCompanyById(organizationId);
    if (!company) {
      errorResponse(res, undefined, "Organization not found");
      return;
    }

    // Check if Google OAuth is configured (either in database or environment)
    const googleSettings = company.oauthSettings?.google;

    // Try database credentials first, but validate and sanitize the format
    // Remove any http:// or https:// prefix if present (common mistake)
    let dbClientId = (googleSettings?.clientId || "").trim();
    if (dbClientId.startsWith("http://")) {
      dbClientId = dbClientId.substring(7); // Remove "http://"
    } else if (dbClientId.startsWith("https://")) {
      dbClientId = dbClientId.substring(8); // Remove "https://"
    }

    const dbClientSecret = (googleSettings?.clientSecret || "").trim();

    // Only use DB credentials if they're valid and non-empty
    const useDbCredentials =
      isValidGoogleClientId(dbClientId) && dbClientSecret;
    const clientId = useDbCredentials ? dbClientId : ENV.GOOGLE_OAUTH_CLIENT_ID;
    const clientSecret = useDbCredentials
      ? dbClientSecret
      : ENV.GOOGLE_OAUTH_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      badRequestResponse(
        res,
        "Google OAuth is not configured for this organization",
      );
      return;
    }

    // Get the redirect URI that was used during OAuth initiation
    // Use rule-based matching if available
    let redirectUri: string | undefined;

    if (
      googleSettings.redirectionRules &&
      googleSettings.redirectionRules.length > 0
    ) {
      const originStr = origin || "";

      // Try to find matching rule by origin
      const matchingRule = googleSettings.redirectionRules.find((rule: any) => {
        if (!rule.authorizedJavaScriptOrigin || !originStr) return false;
        const ruleOrigin = rule.authorizedJavaScriptOrigin
          .replace(/\/$/, "")
          .toLowerCase();
        const reqOrigin = originStr.replace(/\/$/, "").toLowerCase();
        return (
          ruleOrigin === reqOrigin ||
          ruleOrigin.includes(reqOrigin) ||
          reqOrigin.includes(ruleOrigin)
        );
      });

      if (matchingRule?.authorizedRedirectUri) {
        redirectUri = matchingRule.authorizedRedirectUri;
      } else {
        const firstValidRule = googleSettings.redirectionRules.find(
          (rule: any) => rule.authorizedRedirectUri,
        );
        redirectUri = firstValidRule?.authorizedRedirectUri;
      }
    }

    // Legacy fallback: match by index
    if (
      !redirectUri &&
      googleSettings.authorizedJavaScriptOrigins &&
      googleSettings.authorizedRedirectUris
    ) {
      const originStr = origin || "";
      const legacyOrigins = googleSettings.authorizedJavaScriptOrigins || [];
      const legacyUris = googleSettings.authorizedRedirectUris || [];

      const originIndex = legacyOrigins.findIndex((o: string) => {
        if (!o || !originStr) return false;
        const envOrigin = o.replace(/\/$/, "").toLowerCase();
        const reqOrigin = originStr.replace(/\/$/, "").toLowerCase();
        return (
          envOrigin === reqOrigin ||
          envOrigin.includes(reqOrigin) ||
          reqOrigin.includes(envOrigin)
        );
      });

      if (originIndex !== -1 && legacyUris[originIndex]) {
        redirectUri = legacyUris[originIndex];
        logger.info("✅ Exchange: Matched legacy origin to redirect URI:", {
          origin: originStr,
          originIndex,
          redirectUri,
        });
      } else {
        redirectUri = legacyUris[0];
      }
    }

    if (!redirectUri) {
      badRequestResponse(
        res,
        "No redirect URI configured for this organization",
      );
      return;
    }

    logger.info("🔐 Exchanging auth code for token:", {
      organizationId,
      clientId,
      clientIdPrefix: clientId.substring(0, 20),
      isValidFormat: isValidGoogleClientId(clientId),
      usingEnvVar: !useDbCredentials,
      dbClientIdWasInvalid: dbClientId && !isValidGoogleClientId(dbClientId),
      redirectUri,
    });

    // Exchange the authorization code for tokens
    const tokenResponse = await axios.post(
      "https://oauth2.googleapis.com/token",
      {
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      },
    );

    const { access_token } = tokenResponse.data;

    if (!access_token) {
      logger.error("❌ No access token received from Google");
      errorResponse(res, undefined, "Failed to get access token from Google");
      return;
    }

    // Get user profile from Google
    const profileResponse = await axios.get(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: { Authorization: `Bearer ${access_token}` },
      },
    );

    const userProfile = profileResponse.data;

    logger.info("✅ Got user profile from Google:", {
      email: userProfile.email,
      firstName: userProfile.given_name,
      lastName: userProfile.family_name,
    });

    // Check if user exists in this organization
    let user = await AuthService.findUserByEmailAndCompany(
      userProfile.email,
      company._id.toString(),
    );

    if (!user) {
      // User doesn't exist - create new user with Google profile (auto signup)
      logger.info("👤 Creating new user from Google profile");
      const result = await AuthService.createGoogleUser(
        userProfile.email,
        userProfile.given_name || "",
        userProfile.family_name || "",
        company._id.toString(),
        userProfile.picture || "",
        undefined, // Use default role for code exchange flow
      );
      user = result.user;
    } else {
      // Check if user belongs to this organization
      if (
        user.companyId?.toString() !== company._id.toString() &&
        !user.companies?.some(
          (c: any) => c.companyId?.toString() === company._id.toString(),
        )
      ) {
        logger.warn("⚠️ User exists but not in this organization:", {
          email: userProfile.email,
          userCompanyId: user.companyId?.toString(),
          requestedCompanyId: company._id.toString(),
        });
        errorResponse(
          res,
          undefined,
          "User does not belong to this organization",
        );
        return;
      }
    }

    // Ensure company is in user's companies array
    const companyEntry = user.companies?.find(
      (c: any) => c.companyId?.toString() === company._id.toString(),
    );
    if (companyEntry) {
      companyEntry.isActive = true;
      await user.save();
    }

    // Get user with company context for role assignment
    const userWithRole = await User.findOne({
      _id: user._id,
      "companies.companyId": company._id,
    });

    const role =
      userWithRole?.companies?.find(
        (c: any) => c.companyId?.toString() === company._id.toString(),
      )?.role || "user";

    // Generate JWT token (generateOrgToken gets role from user object)
    // Need to set role on user object for token generation
    user.role = role;
    const token = AuthService.generateOrgToken(user, company);

    logger.info("🎉 OAuth code exchange successful:", {
      userId: user._id,
      email: userProfile.email,
      hasToken: !!token,
    });

    // Use the redirection service to resolve URL based on role and authPageUrl
    const authPageUrl = origin || "";

    const redirectionResult = computeRedirectionUrl(
      company.orgRedirectionSettings,
      role,
      authPageUrl,
      token,
    );

    const finalRedirectUrl = redirectionResult.redirectionUrl;

    logger.info("✅ Redirection resolved for code exchange:", {
      origin,
      role,
      finalRedirectUrl,
      matchType: redirectionResult.matchType,
    });

    // Return success response with redirect URL and token
    res.json({
      status: "success",
      message: "OAuth authentication successful",
      data: {
        token,
        redirectUrl: finalRedirectUrl,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role,
        },
      },
    });
  } catch (error: any) {
    logger.error("❌ OAuth code exchange error:", error);

    const errorMessage =
      error.response?.data?.error_description ||
      error.response?.data?.error ||
      error.message ||
      "OAuth authentication failed";

    errorResponse(res, error, errorMessage);
  }
};
// ============================================
// GITHUB OAUTH
// ============================================

export const initiateGitHubOAuth = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { organizationId, origin, testMode, role } = req.query;

    if (!organizationId) {
      badRequestResponse(res, "Organization ID is required");
      return;
    }

    const company = await AuthService.getCompanyById(organizationId as string);
    if (!company) {
      errorResponse(res, undefined, "Organization not found");
      return;
    }

    if (
      !company.oauthSettings?.github?.enabled ||
      !company.oauthSettings?.github?.clientId
    ) {
      badRequestResponse(
        res,
        "GitHub OAuth is not configured for this organization",
      );
      return;
    }

    const githubSettings = company.oauthSettings.github;
    const roleParam = (role as string) || "user";
    const state = JSON.stringify({
      organizationId,
      role: roleParam,
      origin,
      testMode: testMode === "true",
      provider: "github",
    });

    const callbackUrl = `${process.env.API_BASE_URL || "https://exyconn-auth-server.exyconn.com"}/v1/api/auth/github/callback`;

    logger.info("🐙 Initiating GitHub OAuth:", {
      organizationId,
      origin,
      clientId: githubSettings.clientId,
      callbackUrl,
    });

    const authUrl = new URL("https://github.com/login/oauth/authorize");
    authUrl.searchParams.append("client_id", githubSettings.clientId);
    authUrl.searchParams.append("redirect_uri", callbackUrl);
    authUrl.searchParams.append("scope", "user:email read:user");
    authUrl.searchParams.append("state", state);

    logger.info("🌐 Redirecting to GitHub:", authUrl.toString());
    res.redirect(authUrl.toString());
  } catch (error: any) {
    logger.error("❌ GitHub OAuth initiation error:", error);
    errorResponse(res, error, error.message);
  }
};

export const handleGitHubCallback = async (req: Request, res: Response) => {
  try {
    const { code, state, error } = req.query;

    logger.info("🔄 GitHub OAuth callback received:", {
      code: code ? "***" : null,
      error,
      state,
    });

    let organizationId = "default";
    let origin = "";
    let testMode = false;
    let stateRole = "user";
    try {
      const parsed = JSON.parse((state as string) || "{}");
      organizationId = parsed.organizationId || "default";
      origin = parsed.origin || "";
      testMode = parsed.testMode || false;
      stateRole = parsed.role || "user";
    } catch (e) {
      logger.error("Failed to parse state:", e);
    }

    const baseRedirectUrl = origin;

    if (error) {
      logger.error("❌ OAuth error from GitHub:", error);
      const errorRedirect = baseRedirectUrl
        ? `${baseRedirectUrl}/oauth-callback?error=${error}&company=${organizationId}`
        : `/oauth-callback?error=${error}&company=${organizationId}`;
      return res.redirect(errorRedirect);
    }

    if (!code || !state) {
      logger.error("❌ Missing code or state");
      const errorRedirect = baseRedirectUrl
        ? `${baseRedirectUrl}/oauth-callback?error=missing_params&company=${organizationId}`
        : `/oauth-callback?error=missing_params&company=${organizationId}`;
      return res.redirect(errorRedirect);
    }

    const company = await AuthService.getCompanyById(organizationId);
    if (!company) {
      logger.error("❌ Organization not found:", organizationId);
      const errorRedirect = baseRedirectUrl
        ? `${baseRedirectUrl}/oauth-callback?error=invalid_organization&company=${organizationId}`
        : `/oauth-callback?error=invalid_organization&company=${organizationId}`;
      return res.redirect(errorRedirect);
    }

    if (
      !company.oauthSettings?.github?.enabled ||
      !company.oauthSettings?.github?.clientId
    ) {
      logger.error("❌ GitHub OAuth not configured for org:", organizationId);
      const errorRedirect = baseRedirectUrl
        ? `${baseRedirectUrl}/oauth-callback?error=oauth_not_configured&company=${organizationId}`
        : `/oauth-callback?error=oauth_not_configured&company=${organizationId}`;
      return res.redirect(errorRedirect);
    }

    const githubSettings = company.oauthSettings.github;

    // Exchange code for token
    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: githubSettings.clientId,
        client_secret: githubSettings.clientSecret,
        code,
      },
      {
        headers: { Accept: "application/json" },
      },
    );

    const accessToken = tokenResponse.data.access_token;

    if (!accessToken) {
      logger.error("❌ No access token received from GitHub");
      const errorRedirect = baseRedirectUrl
        ? `${baseRedirectUrl}/oauth-callback?error=no_access_token&company=${organizationId}`
        : `/oauth-callback?error=no_access_token&company=${organizationId}`;
      return res.redirect(errorRedirect);
    }

    // Get user profile
    const profileResponse = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    // Get primary email
    const emailsResponse = await axios.get(
      "https://api.github.com/user/emails",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    const primaryEmail =
      emailsResponse.data.find((e: any) => e.primary)?.email ||
      emailsResponse.data[0]?.email ||
      profileResponse.data.email;

    if (!primaryEmail) {
      logger.error("❌ No email received from GitHub");
      const errorRedirect = baseRedirectUrl
        ? `${baseRedirectUrl}/oauth-callback?error=no_email&company=${organizationId}`
        : `/oauth-callback?error=no_email&company=${organizationId}`;
      return res.redirect(errorRedirect);
    }

    const userProfile = {
      email: primaryEmail,
      given_name:
        profileResponse.data.name?.split(" ")[0] || profileResponse.data.login,
      family_name:
        profileResponse.data.name?.split(" ").slice(1).join(" ") || "",
      picture: profileResponse.data.avatar_url,
    };

    logger.info("✅ GitHub profile received:", { email: userProfile.email });

    // Find or create user
    let user = await AuthService.findUserByEmailAndCompany(
      userProfile.email,
      company._id.toString(),
    );

    if (!user) {
      logger.info("👤 Creating new user from GitHub profile");
      const result = await AuthService.createGoogleUser(
        userProfile.email,
        userProfile.given_name,
        userProfile.family_name,
        company._id.toString(),
        userProfile.picture,
        stateRole,
      );
      user = result.user;
    }

    const token = AuthService.generateOrgToken(user, company);

    // Update login history
    const ipAddress =
      req.ip || req.headers["x-forwarded-for"]?.toString() || "unknown";
    const locationData = await AuthService.fetchLocationFromIP(ipAddress);

    await User.updateOne(
      { _id: user._id },
      {
        lastLoginAt: new Date(),
        lastLoginIp: ipAddress,
        $push: {
          loginHistory: {
            $each: [
              {
                loginAt: new Date(),
                ipAddress,
                userAgent: req.headers["user-agent"] || "Unknown",
                location: {
                  city: locationData.city,
                  country: locationData.country,
                },
                details: locationData.details,
              },
            ],
            $slice: -20,
          },
        },
      },
    );

    // Use the redirection service to resolve URL based on role and authPageUrl
    const userRole = user.role || stateRole || "user";
    const authPageUrl = origin || "";

    const redirectionResult = computeRedirectionUrl(
      company.orgRedirectionSettings,
      userRole,
      authPageUrl,
      token,
    );

    const redirectUri = redirectionResult.redirectionUrl;

    logger.info("✅ GitHub Redirection resolved:", {
      origin,
      userRole,
      redirectUri,
      matchType: redirectionResult.matchType,
    });

    const testModeParam = testMode ? "&testMode=true" : "";
    const oauthCallbackUrl = baseRedirectUrl
      ? `${baseRedirectUrl}/oauth-callback?success=true&company=${organizationId}&oAuthProvider=github&redirectUri=${encodeURIComponent(redirectUri)}&token=${encodeURIComponent(token)}${testModeParam}`
      : `/oauth-callback?success=true&company=${organizationId}&oAuthProvider=github&redirectUri=${encodeURIComponent(redirectUri)}&token=${encodeURIComponent(token)}${testModeParam}`;

    logger.info("🔄 Redirecting to OAuth callback:", oauthCallbackUrl);
    res.redirect(oauthCallbackUrl);
  } catch (error: any) {
    logger.error(
      "❌ GitHub OAuth callback error:",
      error.response?.data || error.message,
    );

    let origin = "";
    try {
      const state = req.query.state as string;
      const parsed = JSON.parse(state || "{}");
      origin = parsed.origin || "";
    } catch (e) {
      // ignored
    }

    const errorMessage =
      error.response?.data?.error ||
      error.message ||
      "GitHub OAuth authentication failed";
    const errorRedirect = origin
      ? `${origin}/oauth-callback?error=${encodeURIComponent(errorMessage)}`
      : `/oauth-callback?error=${encodeURIComponent(errorMessage)}`;

    res.redirect(errorRedirect);
  }
};

// ============================================
// MICROSOFT OAUTH
// ============================================

export const initiateMicrosoftOAuth = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { organizationId, origin, testMode, role } = req.query;

    if (!organizationId) {
      badRequestResponse(res, "Organization ID is required");
      return;
    }

    const company = await AuthService.getCompanyById(organizationId as string);
    if (!company) {
      errorResponse(res, undefined, "Organization not found");
      return;
    }

    if (
      !company.oauthSettings?.microsoft?.enabled ||
      !company.oauthSettings?.microsoft?.clientId
    ) {
      badRequestResponse(
        res,
        "Microsoft OAuth is not configured for this organization",
      );
      return;
    }

    const microsoftSettings = company.oauthSettings.microsoft;
    const roleParam = (role as string) || "user";
    const state = JSON.stringify({
      organizationId,
      role: roleParam,
      origin,
      testMode: testMode === "true",
      provider: "microsoft",
    });

    const callbackUrl = `${process.env.API_BASE_URL || "https://exyconn-auth-server.exyconn.com"}/v1/api/auth/microsoft/callback`;
    const tenantId = microsoftSettings.tenantId || "common";

    logger.info("🪟 Initiating Microsoft OAuth:", {
      organizationId,
      origin,
      clientId: microsoftSettings.clientId,
      callbackUrl,
    });

    const authUrl = new URL(
      `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize`,
    );
    authUrl.searchParams.append("client_id", microsoftSettings.clientId);
    authUrl.searchParams.append("redirect_uri", callbackUrl);
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append("scope", "openid email profile User.Read");
    authUrl.searchParams.append("state", state);
    authUrl.searchParams.append("response_mode", "query");

    logger.info("🌐 Redirecting to Microsoft:", authUrl.toString());
    res.redirect(authUrl.toString());
  } catch (error: any) {
    logger.error("❌ Microsoft OAuth initiation error:", error);
    errorResponse(res, error, error.message);
  }
};

export const handleMicrosoftCallback = async (req: Request, res: Response) => {
  try {
    const { code, state, error, error_description } = req.query;

    logger.info("🔄 Microsoft OAuth callback received:", {
      code: code ? "***" : null,
      error,
      state,
    });

    let organizationId = "default";
    let origin = "";
    let testMode = false;
    let stateRole = "user";
    try {
      const parsed = JSON.parse((state as string) || "{}");
      organizationId = parsed.organizationId || "default";
      origin = parsed.origin || "";
      testMode = parsed.testMode || false;
      stateRole = parsed.role || "user";
    } catch (e) {
      logger.error("Failed to parse state:", e);
    }

    const baseRedirectUrl = origin;

    if (error) {
      logger.error("❌ OAuth error from Microsoft:", error, error_description);
      const errorRedirect = baseRedirectUrl
        ? `${baseRedirectUrl}/oauth-callback?error=${error}&company=${organizationId}`
        : `/oauth-callback?error=${error}&company=${organizationId}`;
      return res.redirect(errorRedirect);
    }

    if (!code || !state) {
      logger.error("❌ Missing code or state");
      const errorRedirect = baseRedirectUrl
        ? `${baseRedirectUrl}/oauth-callback?error=missing_params&company=${organizationId}`
        : `/oauth-callback?error=missing_params&company=${organizationId}`;
      return res.redirect(errorRedirect);
    }

    const company = await AuthService.getCompanyById(organizationId);
    if (!company) {
      logger.error("❌ Organization not found:", organizationId);
      const errorRedirect = baseRedirectUrl
        ? `${baseRedirectUrl}/oauth-callback?error=invalid_organization&company=${organizationId}`
        : `/oauth-callback?error=invalid_organization&company=${organizationId}`;
      return res.redirect(errorRedirect);
    }

    if (
      !company.oauthSettings?.microsoft?.enabled ||
      !company.oauthSettings?.microsoft?.clientId
    ) {
      logger.error(
        "❌ Microsoft OAuth not configured for org:",
        organizationId,
      );
      const errorRedirect = baseRedirectUrl
        ? `${baseRedirectUrl}/oauth-callback?error=oauth_not_configured&company=${organizationId}`
        : `/oauth-callback?error=oauth_not_configured&company=${organizationId}`;
      return res.redirect(errorRedirect);
    }

    const microsoftSettings = company.oauthSettings.microsoft;
    const tenantId = microsoftSettings.tenantId || "common";
    const callbackUrl = `${process.env.API_BASE_URL || "https://exyconn-auth-server.exyconn.com"}/v1/api/auth/microsoft/callback`;

    // Exchange code for token
    const tokenResponse = await axios.post(
      `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
      new URLSearchParams({
        client_id: microsoftSettings.clientId,
        client_secret: microsoftSettings.clientSecret,
        code: code as string,
        redirect_uri: callbackUrl,
        grant_type: "authorization_code",
        scope: "openid email profile User.Read",
      }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      },
    );

    const accessToken = tokenResponse.data.access_token;

    if (!accessToken) {
      logger.error("❌ No access token received from Microsoft");
      const errorRedirect = baseRedirectUrl
        ? `${baseRedirectUrl}/oauth-callback?error=no_access_token&company=${organizationId}`
        : `/oauth-callback?error=no_access_token&company=${organizationId}`;
      return res.redirect(errorRedirect);
    }

    // Get user profile from Microsoft Graph
    const profileResponse = await axios.get(
      "https://graph.microsoft.com/v1.0/me",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    const profile = profileResponse.data;
    const userProfile = {
      email: profile.mail || profile.userPrincipalName,
      given_name: profile.givenName || profile.displayName?.split(" ")[0] || "",
      family_name:
        profile.surname ||
        profile.displayName?.split(" ").slice(1).join(" ") ||
        "",
      picture: "", // Microsoft Graph requires separate call for photo
    };

    if (!userProfile.email) {
      logger.error("❌ No email received from Microsoft");
      const errorRedirect = baseRedirectUrl
        ? `${baseRedirectUrl}/oauth-callback?error=no_email&company=${organizationId}`
        : `/oauth-callback?error=no_email&company=${organizationId}`;
      return res.redirect(errorRedirect);
    }

    logger.info("✅ Microsoft profile received:", { email: userProfile.email });

    // Find or create user
    let user = await AuthService.findUserByEmailAndCompany(
      userProfile.email,
      company._id.toString(),
    );

    if (!user) {
      logger.info("👤 Creating new user from Microsoft profile");
      const result = await AuthService.createGoogleUser(
        userProfile.email,
        userProfile.given_name,
        userProfile.family_name,
        company._id.toString(),
        userProfile.picture,
        stateRole,
      );
      user = result.user;
    }

    const token = AuthService.generateOrgToken(user, company);

    // Update login history
    const ipAddress =
      req.ip || req.headers["x-forwarded-for"]?.toString() || "unknown";
    const locationData = await AuthService.fetchLocationFromIP(ipAddress);

    await User.updateOne(
      { _id: user._id },
      {
        lastLoginAt: new Date(),
        lastLoginIp: ipAddress,
        $push: {
          loginHistory: {
            $each: [
              {
                loginAt: new Date(),
                ipAddress,
                userAgent: req.headers["user-agent"] || "Unknown",
                location: {
                  city: locationData.city,
                  country: locationData.country,
                },
                details: locationData.details,
              },
            ],
            $slice: -20,
          },
        },
      },
    );

    // Use the redirection service to resolve URL based on role and authPageUrl
    const userRole = user.role || stateRole || "user";
    const authPageUrl = origin || "";

    const redirectionResult = computeRedirectionUrl(
      company.orgRedirectionSettings,
      userRole,
      authPageUrl,
      token,
    );

    const redirectUri = redirectionResult.redirectionUrl;

    logger.info("✅ Microsoft Redirection resolved:", {
      origin,
      userRole,
      redirectUri,
      matchType: redirectionResult.matchType,
    });

    const testModeParam = testMode ? "&testMode=true" : "";
    const oauthCallbackUrl = baseRedirectUrl
      ? `${baseRedirectUrl}/oauth-callback?success=true&company=${organizationId}&oAuthProvider=microsoft&redirectUri=${encodeURIComponent(redirectUri)}&token=${encodeURIComponent(token)}${testModeParam}`
      : `/oauth-callback?success=true&company=${organizationId}&oAuthProvider=microsoft&redirectUri=${encodeURIComponent(redirectUri)}&token=${encodeURIComponent(token)}${testModeParam}`;

    logger.info("🔄 Redirecting to OAuth callback:", oauthCallbackUrl);
    res.redirect(oauthCallbackUrl);
  } catch (error: any) {
    logger.error(
      "❌ Microsoft OAuth callback error:",
      error.response?.data || error.message,
    );

    let origin = "";
    try {
      const state = req.query.state as string;
      const parsed = JSON.parse(state || "{}");
      origin = parsed.origin || "";
    } catch (e) {
      // ignored
    }

    const errorMessage =
      error.response?.data?.error_description ||
      error.response?.data?.error ||
      error.message ||
      "Microsoft OAuth authentication failed";
    const errorRedirect = origin
      ? `${origin}/oauth-callback?error=${encodeURIComponent(errorMessage)}`
      : `/oauth-callback?error=${encodeURIComponent(errorMessage)}`;

    res.redirect(errorRedirect);
  }
};

// ============================================
// APPLE OAUTH
// ============================================

export const initiateAppleOAuth = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { organizationId, origin, testMode, role } = req.query;

    if (!organizationId) {
      badRequestResponse(res, "Organization ID is required");
      return;
    }

    const company = await AuthService.getCompanyById(organizationId as string);
    if (!company) {
      errorResponse(res, undefined, "Organization not found");
      return;
    }

    if (
      !company.oauthSettings?.apple?.enabled ||
      !company.oauthSettings?.apple?.clientId
    ) {
      badRequestResponse(
        res,
        "Apple OAuth is not configured for this organization",
      );
      return;
    }

    const appleSettings = company.oauthSettings.apple;
    const roleParam = (role as string) || "user";
    const state = JSON.stringify({
      organizationId,
      role: roleParam,
      origin,
      testMode: testMode === "true",
      provider: "apple",
    });

    const callbackUrl = `${process.env.API_BASE_URL || "https://exyconn-auth-server.exyconn.com"}/v1/api/auth/apple/callback`;

    logger.info("🍎 Initiating Apple OAuth:", {
      organizationId,
      origin,
      clientId: appleSettings.clientId,
      callbackUrl,
    });

    const authUrl = new URL("https://appleid.apple.com/auth/authorize");
    authUrl.searchParams.append("client_id", appleSettings.clientId);
    authUrl.searchParams.append("redirect_uri", callbackUrl);
    authUrl.searchParams.append("response_type", "code id_token");
    authUrl.searchParams.append("scope", "name email");
    authUrl.searchParams.append("state", state);
    authUrl.searchParams.append("response_mode", "form_post");

    logger.info("🌐 Redirecting to Apple:", authUrl.toString());
    res.redirect(authUrl.toString());
  } catch (error: any) {
    logger.error("❌ Apple OAuth initiation error:", error);
    errorResponse(res, error, error.message);
  }
};

export const handleAppleCallback = async (req: Request, res: Response) => {
  try {
    // Apple uses POST for callback with form_post response mode
    const {
      code,
      state,
      error,
      id_token,
      user: userJson,
    } = req.body || req.query;

    logger.info("🔄 Apple OAuth callback received:", {
      code: code ? "***" : null,
      error,
      state,
      hasIdToken: !!id_token,
      hasUser: !!userJson,
    });

    let organizationId = "default";
    let origin = "";
    let testMode = false;
    let stateRole = "user";
    try {
      const parsed = JSON.parse((state as string) || "{}");
      organizationId = parsed.organizationId || "default";
      origin = parsed.origin || "";
      testMode = parsed.testMode || false;
      stateRole = parsed.role || "user";
    } catch (e) {
      logger.error("Failed to parse state:", e);
    }

    const baseRedirectUrl = origin;

    if (error) {
      logger.error("❌ OAuth error from Apple:", error);
      const errorRedirect = baseRedirectUrl
        ? `${baseRedirectUrl}/oauth-callback?error=${error}&company=${organizationId}`
        : `/oauth-callback?error=${error}&company=${organizationId}`;
      return res.redirect(errorRedirect);
    }

    if (!code || !state) {
      logger.error("❌ Missing code or state");
      const errorRedirect = baseRedirectUrl
        ? `${baseRedirectUrl}/oauth-callback?error=missing_params&company=${organizationId}`
        : `/oauth-callback?error=missing_params&company=${organizationId}`;
      return res.redirect(errorRedirect);
    }

    const company = await AuthService.getCompanyById(organizationId);
    if (!company) {
      logger.error("❌ Organization not found:", organizationId);
      const errorRedirect = baseRedirectUrl
        ? `${baseRedirectUrl}/oauth-callback?error=invalid_organization&company=${organizationId}`
        : `/oauth-callback?error=invalid_organization&company=${organizationId}`;
      return res.redirect(errorRedirect);
    }

    if (
      !company.oauthSettings?.apple?.enabled ||
      !company.oauthSettings?.apple?.clientId
    ) {
      logger.error("❌ Apple OAuth not configured for org:", organizationId);
      const errorRedirect = baseRedirectUrl
        ? `${baseRedirectUrl}/oauth-callback?error=oauth_not_configured&company=${organizationId}`
        : `/oauth-callback?error=oauth_not_configured&company=${organizationId}`;
      return res.redirect(errorRedirect);
    }

    const _appleSettings = company.oauthSettings.apple;

    // Decode the id_token to get user info (Apple includes this in the callback)
    let email = "";
    let firstName = "";
    let lastName = "";

    if (id_token) {
      try {
        // Decode JWT without verification for now (Apple's id_token)
        const payload = JSON.parse(
          Buffer.from(id_token.split(".")[1], "base64").toString(),
        );
        email = payload.email || "";
        logger.info("✅ Decoded Apple id_token:", { email, sub: payload.sub });
      } catch (e) {
        logger.error("Failed to decode Apple id_token:", e);
      }
    }

    // Apple only sends user info on first authorization
    if (userJson) {
      try {
        const userData =
          typeof userJson === "string" ? JSON.parse(userJson) : userJson;
        firstName = userData.name?.firstName || "";
        lastName = userData.name?.lastName || "";
      } catch (e) {
        logger.error("Failed to parse Apple user data:", e);
      }
    }

    if (!email) {
      // Try to get email from token exchange if id_token decode failed
      const _callbackUrl = `${process.env.API_BASE_URL || "https://exyconn-auth-server.exyconn.com"}/v1/api/auth/apple/callback`;

      // Generate client secret for Apple (requires private key)
      // For now, we'll use a simplified approach - Apple OAuth requires more complex setup
      logger.error("❌ No email received from Apple");
      const errorRedirect = baseRedirectUrl
        ? `${baseRedirectUrl}/oauth-callback?error=no_email&company=${organizationId}`
        : `/oauth-callback?error=no_email&company=${organizationId}`;
      return res.redirect(errorRedirect);
    }

    logger.info("✅ Apple profile received:", { email, firstName, lastName });

    // Find or create user
    let user = await AuthService.findUserByEmailAndCompany(
      email,
      company._id.toString(),
    );

    if (!user) {
      logger.info("👤 Creating new user from Apple profile");
      const result = await AuthService.createGoogleUser(
        email,
        firstName || "Apple",
        lastName || "User",
        company._id.toString(),
        "",
        stateRole,
      );
      user = result.user;
    } else if (firstName || lastName) {
      // Update user name if provided (Apple only sends on first auth)
      if (!user.firstName && firstName) user.firstName = firstName;
      if (!user.lastName && lastName) user.lastName = lastName;
      await user.save();
    }

    const token = AuthService.generateOrgToken(user, company);

    // Update login history
    const ipAddress =
      req.ip || req.headers["x-forwarded-for"]?.toString() || "unknown";
    const locationData = await AuthService.fetchLocationFromIP(ipAddress);

    await User.updateOne(
      { _id: user._id },
      {
        lastLoginAt: new Date(),
        lastLoginIp: ipAddress,
        $push: {
          loginHistory: {
            $each: [
              {
                loginAt: new Date(),
                ipAddress,
                userAgent: req.headers["user-agent"] || "Unknown",
                location: {
                  city: locationData.city,
                  country: locationData.country,
                },
                details: locationData.details,
              },
            ],
            $slice: -20,
          },
        },
      },
    );

    // Use the redirection service to resolve URL based on role and authPageUrl
    const userRole = user.role || stateRole || "user";
    const authPageUrl = origin || "";

    const redirectionResult = computeRedirectionUrl(
      company.orgRedirectionSettings,
      userRole,
      authPageUrl,
      token,
    );

    const redirectUri = redirectionResult.redirectionUrl;

    logger.info("✅ Apple Redirection resolved:", {
      origin,
      userRole,
      redirectUri,
      matchType: redirectionResult.matchType,
    });

    const testModeParam = testMode ? "&testMode=true" : "";
    const oauthCallbackUrl = baseRedirectUrl
      ? `${baseRedirectUrl}/oauth-callback?success=true&company=${organizationId}&oAuthProvider=apple&redirectUri=${encodeURIComponent(redirectUri)}&token=${encodeURIComponent(token)}${testModeParam}`
      : `/oauth-callback?success=true&company=${organizationId}&oAuthProvider=apple&redirectUri=${encodeURIComponent(redirectUri)}&token=${encodeURIComponent(token)}${testModeParam}`;

    logger.info("🔄 Redirecting to OAuth callback:", oauthCallbackUrl);
    res.redirect(oauthCallbackUrl);
  } catch (error: any) {
    logger.error(
      "❌ Apple OAuth callback error:",
      error.response?.data || error.message,
    );

    let origin = "";
    try {
      const state = (req.body?.state || req.query.state) as string;
      const parsed = JSON.parse(state || "{}");
      origin = parsed.origin || "";
    } catch (e) {
      // ignored
    }

    const errorMessage = error.message || "Apple OAuth authentication failed";
    const errorRedirect = origin
      ? `${origin}/oauth-callback?error=${encodeURIComponent(errorMessage)}`
      : `/oauth-callback?error=${encodeURIComponent(errorMessage)}`;

    res.redirect(errorRedirect);
  }
};
