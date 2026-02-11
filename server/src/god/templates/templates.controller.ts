import { Router, Response } from "express";
import mjml2html from "mjml";
import {
  GodAuthRequest,
  authenticateGod,
} from "../../middlewares/god.middleware";
import {
  logger,
  successResponse,
  errorResponse,
  badRequestResponse,
  notFoundResponse,
} from "../../common";
import { DEFAULT_TEMPLATES } from "../../common/default-email-templates";

const router = Router();

// Apply god auth middleware to all routes
router.use(authenticateGod);

// Template metadata for display
const TEMPLATE_METADATA: Record<string, { name: string; description: string }> =
  {
    "welcome-verify": {
      name: "Welcome & Verify",
      description: "Verification email for new user signup",
    },
    "welcome-email": {
      name: "Welcome Email",
      description: "Welcome message after registration",
    },
    "mfa-enable": { name: "MFA Enable", description: "OTP to enable MFA" },
    "mfa-login": { name: "MFA Login", description: "OTP for MFA login" },
    "password-reset": {
      name: "Password Reset",
      description: "Password reset code",
    },
    passwordResetSuccess: {
      name: "Password Reset Success",
      description: "Password change confirmation",
    },
    recentLogin: {
      name: "Recent Login",
      description: "New login notification",
    },
    "blocked-account": {
      name: "Blocked Account",
      description: "Account blocked notification",
    },
    "password-breach": {
      name: "Password Breach",
      description: "Password breach alert",
    },
    "god-credentials": {
      name: "User Invitation",
      description: "Credentials for new user",
    },
  };

/**
 * @desc    Get list of all available default templates
 * @route   GET /api/god/templates
 * @access  God Protected
 */
export const getTemplateList = async (req: GodAuthRequest, res: Response) => {
  try {
    const templates = Object.keys(DEFAULT_TEMPLATES).map((key) => ({
      name: key,
      fileName: key,
      displayName: TEMPLATE_METADATA[key]?.name || key,
      description: TEMPLATE_METADATA[key]?.description || "",
    }));

    return successResponse(res, templates, "Templates retrieved successfully");
  } catch (error: any) {
    logger.error("Failed to get template list", { error: error.message });
    return errorResponse(res, error, "Failed to get template list");
  }
};

/**
 * @desc    Get default template content by name
 * @route   GET /api/god/templates/:templateName
 * @access  God Protected
 */
export const getTemplateContent = async (
  req: GodAuthRequest,
  res: Response,
) => {
  try {
    const templateName = req.params.templateName as string;

    const content = DEFAULT_TEMPLATES[templateName];

    if (!content) {
      return notFoundResponse(res, `Template "${templateName}" not found`);
    }

    return successResponse(
      res,
      {
        content,
        name: templateName,
        displayName: TEMPLATE_METADATA[templateName]?.name || templateName,
        description: TEMPLATE_METADATA[templateName]?.description || "",
      },
      "Template retrieved successfully",
    );
  } catch (error: any) {
    logger.error("Failed to get template content", {
      templateName: req.params.templateName as string,
      error: error.message,
    });
    return errorResponse(res, error, "Failed to get template content");
  }
};

/**
 * @desc    Compile MJML to HTML
 * @route   POST /api/god/templates/compile
 * @access  God Protected
 */
export const compileTemplate = async (req: GodAuthRequest, res: Response) => {
  try {
    const { mjml, variables } = req.body;

    if (!mjml) {
      return badRequestResponse(res, "MJML content is required");
    }

    // Replace variables in MJML
    let processedMjml = mjml;
    if (variables && typeof variables === "object") {
      Object.keys(variables).forEach((key) => {
        const regex = new RegExp(`{{${key}}}`, "g");
        processedMjml = processedMjml.replace(regex, variables[key] || "");
      });
    }

    // Compile MJML to HTML
    const result = mjml2html(processedMjml, {
      validationLevel: "soft",
      minify: false,
    });

    if (result.errors && result.errors.length > 0) {
      logger.warn("MJML compilation warnings", { errors: result.errors });
    }

    return successResponse(
      res,
      {
        html: result.html,
        errors: result.errors || [],
      },
      "Template compiled successfully",
    );
  } catch (error: any) {
    logger.error("Failed to compile MJML", { error: error.message });
    return badRequestResponse(res, `MJML compilation failed: ${error.message}`);
  }
};

/**
 * @desc    Format MJML content
 * @route   POST /api/god/templates/format
 * @access  God Protected
 */
export const formatTemplate = async (req: GodAuthRequest, res: Response) => {
  try {
    const { mjml } = req.body;

    if (!mjml) {
      return badRequestResponse(res, "MJML content is required");
    }

    // Basic XML/MJML formatting
    let formatted = mjml;
    const indent = "  ";
    let depth = 0;

    formatted = formatted
      .replace(/>\s*</g, ">\n<")
      .split("\n")
      .map((line: string) => {
        const trimmed = line.trim();
        if (!trimmed) return "";

        // Decrease depth for closing tags
        if (trimmed.match(/^<\/\w/)) {
          depth = Math.max(0, depth - 1);
        }

        const indented = indent.repeat(depth) + trimmed;

        // Increase depth for opening tags (not self-closing)
        if (trimmed.match(/^<\w[^>]*[^/]>$/)) {
          depth++;
        }

        return indented;
      })
      .filter((line: string) => line.trim())
      .join("\n");

    return successResponse(
      res,
      { formatted },
      "Template formatted successfully",
    );
  } catch (error: any) {
    logger.error("Failed to format MJML", { error: error.message });
    return errorResponse(res, error, "Failed to format template");
  }
};

// Routes
router.get("/", getTemplateList);
router.get("/:templateName", getTemplateContent);
router.post("/compile", compileTemplate);
router.post("/format", formatTemplate);

export default router;
