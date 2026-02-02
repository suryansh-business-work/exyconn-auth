import { Request, Response, NextFunction } from "express";
import Organization from "../god/organization/organization.model";
import { unauthorizedResponse, logger } from "@exyconn/common/server";
import { extractApiKey } from "../utils/auth-utils";

export interface ApiKeyRequest extends Request {
  organization?: any;
  organizationId?: string;
}

/**
 * Middleware to authenticate requests using API Key
 * API Key should be passed in x-api-key header
 * This retrieves organization automatically - no need to pass organizationId
 */
export const authenticateApiKey = async (
  req: ApiKeyRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const apiKey = extractApiKey(req);

    if (!apiKey) {
      logger.warn("API Key authentication failed - no key provided");
      unauthorizedResponse(res, "API key required. Pass x-api-key header.");
      return;
    }

    logger.debug("API Key received:", {
      apiKey: apiKey.substring(0, 10) + "...",
    });

    // First try to find organization by API key (regardless of active status)
    const orgWithKey = (await Organization.findOne({ apiKey }).lean()) as {
      _id: any;
      orgName?: string;
      orgActiveStatus?: boolean;
      [key: string]: any;
    } | null;

    if (!orgWithKey) {
      logger.warn("API Key authentication failed - key not found in database", {
        keyPrefix: apiKey.substring(0, 10),
      });
      unauthorizedResponse(res, "Invalid or inactive API key");
      return;
    }

    // Check if organization is active
    if (!orgWithKey.orgActiveStatus) {
      logger.warn("API Key authentication failed - organization is inactive", {
        orgId: orgWithKey._id,
        orgName: orgWithKey.orgName,
      });
      unauthorizedResponse(
        res,
        "Organization is inactive. Please contact administrator.",
      );
      return;
    }

    // Attach organization to request
    req.organization = orgWithKey;
    req.organizationId = orgWithKey._id.toString();

    logger.debug("API key authenticated", {
      orgId: orgWithKey._id,
      orgName: orgWithKey.orgName,
    });

    next();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error("API key authentication failed", { error: errorMessage });
    unauthorizedResponse(res, "API key authentication failed");
    return;
  }
};

/**
 * Generate a new API key for an organization
 */
export const generateApiKey = (): string => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const prefix = "exy_";
  let key = prefix;
  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
};
