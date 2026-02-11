import nodemailer from "nodemailer";
import mjml2html from "mjml";
import fs from "fs";
import path from "path";
import { logger } from "./logger";
import { DEFAULT_TEMPLATES } from "./default-email-templates";

// Default email theme colors (can be overridden per organization)
const DEFAULT_EMAIL_THEME = {
  primaryColor: "#2563eb",
  primaryColorDark: "#1e40af",
  primaryColorLight: "#3b82f6",
  secondaryColor: "#64748b",
  successColor: "#2e7d32",
  successColorDark: "#1b5e20",
  successBgColor: "#e8f5e9",
  warningColor: "#ff9800",
  warningColorDark: "#e65100",
  warningBgColor: "#fff3e0",
  errorColor: "#d32f2f",
  errorColorDark: "#991b1b",
  errorBgColor: "#ffebee",
  backgroundColor: "#f4f4f4",
  otpBoxBgColor: "#f0f9ff",
  logoWidth: "120px",
};

interface OrganizationEmailConfig {
  smtpSettings?: {
    host: string;
    port: number;
    secure?: boolean;
    user: string;
    pass: string;
  };
  orgTheme?: {
    primaryColor?: string;
    secondaryColor?: string;
  };
  orgLogos?: { url: string; size: string }[];
  orgName?: string;
  orgEmail?: string;
  emailTemplates?: Map<string, string> | Record<string, string>;
}

// Helper function to get logo URL from organization
const getLogoUrl = (org?: OrganizationEmailConfig): string => {
  if (org?.orgLogos && org.orgLogos.length > 0) {
    // Prefer 256x256 logo, fallback to first available
    const logo =
      org.orgLogos.find((l) => l.size === "256x256") || org.orgLogos[0];
    return logo.url;
  }
  return ""; // Will use default placeholder
};

// Create transporter dynamically based on organization settings
const createTransporter = (org?: OrganizationEmailConfig) => {
  const smtpSettings = org?.smtpSettings;

  if (smtpSettings?.host && smtpSettings?.user && smtpSettings?.pass) {
    const port = smtpSettings.port || 587;
    // Auto-detect secure based on port: 465 = SSL, 587/25 = STARTTLS
    const secure =
      smtpSettings.secure !== undefined ? smtpSettings.secure : port === 465;

    // Use organization-specific SMTP settings
    return nodemailer.createTransport({
      host: smtpSettings.host,
      port,
      secure,
      auth: {
        user: smtpSettings.user,
        pass: smtpSettings.pass,
      },
      tls: {
        rejectUnauthorized: false,
        // For STARTTLS (port 587), we need to upgrade the connection
        ...(port === 587 && { ciphers: "SSLv3" }),
      },
    });
  }

  // Fallback to default SMTP settings
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: "suryansh@exyconn.com",
      pass: "ylip muer ugqn xvym",
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

// Default transporter for verification
const defaultTransporter = createTransporter();

defaultTransporter.verify((error, _success) => {
  if (error) {
    logger.error("Email transporter verification failed", {
      error: error.message,
    });
  } else {
    logger.info("Email server is ready");
  }
});

export const sendEmail = async (
  to: string,
  subject: string,
  templateName: string,
  variables: Record<string, string>,
  organization?: OrganizationEmailConfig,
) => {
  try {
    let mjmlContent: string | null = null;

    // Priority 1: Check if organization has a custom template for this template name
    if (organization?.emailTemplates) {
      const templates = organization.emailTemplates;
      // Handle both Map and Record types
      const customTemplate =
        templates instanceof Map
          ? templates.get(templateName)
          : templates[templateName];

      if (customTemplate && customTemplate.trim()) {
        logger.info("Using custom email template from organization", {
          templateName,
        });
        mjmlContent = customTemplate;
      }
    }

    // Priority 2: Use embedded default templates (no file system dependency)
    if (!mjmlContent) {
      if (DEFAULT_TEMPLATES[templateName]) {
        logger.info("Using embedded default template", { templateName });
        mjmlContent = DEFAULT_TEMPLATES[templateName];
      }
    }

    // Priority 3: Try to load from file system as last resort
    if (!mjmlContent) {
      const possiblePaths = [
        path.join(process.cwd(), "src", "templates", `${templateName}.mjml`),
        path.join(process.cwd(), "dist", "templates", `${templateName}.mjml`),
        path.join(process.cwd(), "templates", `${templateName}.mjml`),
      ];

      for (const testPath of possiblePaths) {
        if (fs.existsSync(testPath)) {
          logger.info("Template found in file system", { path: testPath });
          mjmlContent = fs.readFileSync(testPath, "utf8");
          break;
        }
      }
    }

    if (!mjmlContent) {
      logger.error("Template not found", { templateName });
      throw new Error(`Email template "${templateName}" not found`);
    }

    // Merge default theme with organization theme
    const theme = {
      ...DEFAULT_EMAIL_THEME,
      ...(organization?.orgTheme?.primaryColor && {
        primaryColor: organization.orgTheme.primaryColor,
      }),
      logoUrl: getLogoUrl(organization) || variables.logoUrl || "",
    };

    // Add theme variables to the variables object
    const allVariables: Record<string, string> = {
      ...theme,
      ...variables,
      companyName:
        variables.companyName || organization?.orgName || "Auth System",
      year: new Date().getFullYear().toString(),
      supportEmail: organization?.orgEmail || "support@exyconn.com",
    };

    // Replace all variables in template
    Object.keys(allVariables).forEach((key) => {
      const regex = new RegExp(`{{${key}}}`, "g");
      mjmlContent = mjmlContent!.replace(regex, allVariables[key] || "");
    });

    // Handle empty logo URL - remove the mj-image tag if no logo is provided
    if (!allVariables.logoUrl || allVariables.logoUrl.trim() === "") {
      // Remove mj-image tags with empty or unresolved src
      mjmlContent = mjmlContent!.replace(
        /<mj-image[^>]*src=""\s*[^>]*\/>/g,
        "",
      );
      mjmlContent = mjmlContent!.replace(
        /<mj-image[^>]*src="\{\{logoUrl\}\}"[^>]*\/>/g,
        "",
      );
    }

    const htmlOutput = mjml2html(mjmlContent);

    if (htmlOutput.errors && htmlOutput.errors.length > 0) {
      logger.warn("MJML conversion warnings", { errors: htmlOutput.errors });
    }

    // Create transporter based on organization settings
    const transporter = organization
      ? createTransporter(organization)
      : defaultTransporter;
    const fromEmail =
      organization?.smtpSettings?.user || "suryansh@exyconn.com";
    const fromName = organization?.orgName || "Auth System";

    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject,
      html: htmlOutput.html,
    });

    logger.info("Email sent successfully", {
      to,
      subject,
      messageId: info.messageId,
    });
    return info;
  } catch (error: any) {
    logger.error("Failed to send email", {
      to,
      templateName,
      error: error.message,
    });
    throw error;
  }
};
