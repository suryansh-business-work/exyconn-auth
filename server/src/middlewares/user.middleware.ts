import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../user/user.model";
import GodUser from "../god/user/user.model";
import Organization from "../god/organization/organization.model";
import { IOrganization } from "../god/organization/organization-forms/merged-interface-index";
import {
  unauthorizedResponse,
  forbiddenResponse,
} from "@exyconn/common/server";
import { logger } from "@exyconn/common/server";

export interface AuthRequest extends Request {
  user?: any;
  companyId?: string;
}

/**
 * Middleware to authenticate users using Authorization header
 * Supports both regular users and god users
 */
export const authenticateUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers["authorization"];
    // Read token from Authorization header only
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      unauthorizedResponse(res, "Access token required");
      return;
    }

    // First, decode without verification to get the organizationId
    const decodedPreview = jwt.decode(token) as any;

    if (!decodedPreview) {
      unauthorizedResponse(res, "Invalid token");
      return;
    }

    // Support both companyId and organizationId in token (for backwards compatibility)
    const tokenCompanyId =
      decodedPreview.companyId || decodedPreview.organizationId;

    // Get the organization to fetch its signing key and algorithm (if not god user)
    let secret = process.env.JWT_SECRET || "default-secret";
    let algorithm: jwt.Algorithm = "HS256";

    if (tokenCompanyId !== "god") {
      const organization = (await Organization.findById(
        tokenCompanyId,
      ).lean()) as unknown as IOrganization;

      // Get token settings from jwtSettings or fallback to tokenSignKey
      const jwtSettings = organization?.jwtSettings;
      secret =
        jwtSettings?.tokenSignKey ||
        organization?.tokenSignKey ||
        process.env.JWT_SECRET ||
        "default-secret";
      algorithm = (jwtSettings?.algorithm as jwt.Algorithm) || "HS256";
    }

    // Now verify with the correct secret and algorithm
    const decoded = jwt.verify(token, secret, {
      algorithms: [algorithm],
    }) as any;

    // Normalize companyId from token (support both companyId and organizationId)
    const companyId = decoded.companyId || decoded.organizationId;

    // Find user by userId from token (prefer userId over email for better performance)
    let user;
    if (companyId === "god") {
      // Handle god users from GodUser collection
      if (decoded.userId) {
        user = await GodUser.findById(decoded.userId);
      } else if (decoded.email) {
        user = await GodUser.findOne({ email: decoded.email });
      }
    } else {
      // Handle regular users from User collection
      if (decoded.userId) {
        user = await User.findById(decoded.userId);
      } else if (decoded.email) {
        // Fallback for old tokens without userId
        user = await User.findOne({
          email: decoded.email,
          companyId: companyId,
        });
      }
    }

    if (!user) {
      unauthorizedResponse(res, "User not found");
      return;
    }

    req.user = user;
    req.companyId = user.companyId || companyId;
    logger.debug("User authenticated", { userId: user._id, role: user.role });
    next();
  } catch (error: any) {
    logger.error("Authentication failed", { error: error.message });
    forbiddenResponse(res, "Invalid token");
    return;
  }
};

/**
 * Middleware to authenticate ONLY regular organization users (NOT god users)
 * Use this for /auth/* routes that should only work for regular users
 */
export const authenticateOrgUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers["authorization"];
    // Read token from Authorization header only
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      unauthorizedResponse(res, "Access token required");
      return;
    }

    // First, decode without verification to get the organizationId
    const decodedPreview = jwt.decode(token) as any;

    if (!decodedPreview) {
      unauthorizedResponse(res, "Invalid token");
      return;
    }

    // Support both companyId and organizationId in token
    const tokenCompanyId =
      decodedPreview.companyId || decodedPreview.organizationId;

    // If no companyId/organizationId in token, it's invalid
    if (!tokenCompanyId) {
      unauthorizedResponse(res, "Invalid token - no organization information");
      return;
    }

    // REJECT god users - this middleware is only for regular organization users
    if (tokenCompanyId === "god") {
      forbiddenResponse(
        res,
        "This endpoint is for organization users only, not god panel users",
      );
      return;
    }

    // Get the organization to fetch its signing key and algorithm
    const organization = (await Organization.findById(
      tokenCompanyId,
    ).lean()) as unknown as IOrganization;

    if (!organization) {
      unauthorizedResponse(res, "Organization not found");
      return;
    }

    // Get token settings from jwtSettings or fallback to tokenSignKey
    const jwtSettings = organization?.jwtSettings;
    const secret =
      jwtSettings?.tokenSignKey ||
      organization?.tokenSignKey ||
      process.env.JWT_SECRET ||
      "default-secret";
    const algorithm = (jwtSettings?.algorithm as jwt.Algorithm) || "HS256";

    // Now verify with the correct secret and algorithm
    const decoded = jwt.verify(token, secret, {
      algorithms: [algorithm],
    }) as any;

    // Normalize companyId from token
    const companyId = decoded.companyId || decoded.organizationId;

    // Find user from User collection only (NOT GodUser)
    let user;
    if (decoded.userId) {
      user = await User.findById(decoded.userId);
    } else if (decoded.email) {
      user = await User.findOne({
        email: decoded.email,
        companyId: companyId,
      });
    }

    if (!user) {
      unauthorizedResponse(res, "User not found");
      return;
    }

    req.user = user;
    req.companyId = user.companyId || companyId;
    logger.debug("Organization user authenticated", {
      userId: user._id,
      companyId,
    });
    next();
  } catch (error: any) {
    logger.error("Authentication failed", { error: error.message });
    forbiddenResponse(res, "Invalid token");
    return;
  }
};
