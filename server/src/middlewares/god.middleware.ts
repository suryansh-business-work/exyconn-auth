import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import GodUser from "../god/user/user.model";
import {
  unauthorizedResponse,
  forbiddenResponse,
  logger,
} from "../common";

export interface GodAuthRequest extends Request {
  godUser?: any;
}

/**
 * Middleware to authenticate God users using Authorization header
 * Token can be passed as:
 * - Authorization: Bearer <token>
 * - godtoken: <token>
 */
export const authenticateGod = async (
  req: GodAuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // Check headers for god token: godtoken header > authorization header
    const godTokenHeader =
      req.headers["godtoken"] ||
      req.headers["godToken"] ||
      req.headers["GodToken"];
    const authHeader = req.headers["authorization"];

    let token: string | null = null;

    // Priority: godtoken header > authorization header
    if (godTokenHeader && typeof godTokenHeader === "string") {
      token = godTokenHeader.replace("Bearer ", "");
    } else if (authHeader && typeof authHeader === "string") {
      token = authHeader.replace("Bearer ", "");
    }

    if (!token) {
      logger.warn("God authentication failed - no token provided", {
        headers: {
          godtoken: !!req.headers["godtoken"],
          authorization: !!req.headers["authorization"],
        },
      });
      unauthorizedResponse(res, "God access token required");
      return;
    }

    // Use JWT_SECRET for god users
    const secret = process.env.JWT_SECRET || "default-secret";

    // Verify token
    let decoded: any;
    try {
      decoded = jwt.verify(token, secret);
    } catch (jwtError: any) {
      logger.warn("God token verification failed", { error: jwtError.message });
      unauthorizedResponse(res, "Invalid or expired god token");
      return;
    }

    // Validate this is a god user token
    if (decoded.companyId !== "god") {
      logger.warn("Token is not a god user token", {
        companyId: decoded.companyId,
      });
      forbiddenResponse(res, "Access denied. God privileges required.");
      return;
    }

    // Fetch the god user
    const godUser = await GodUser.findById(decoded.userId);

    if (!godUser) {
      logger.warn("God user not found", { userId: decoded.userId });
      unauthorizedResponse(res, "God user not found");
      return;
    }

    if (!godUser.isActive) {
      logger.warn("God user is inactive", { userId: decoded.userId });
      forbiddenResponse(res, "God user account is inactive");
      return;
    }

    // Attach god user to request
    req.godUser = godUser;
    next();
  } catch (error) {
    logger.error("God authentication error:", error);
    unauthorizedResponse(res, "God authentication failed");
    return;
  }
};

/**
 * Middleware to check if authenticated god user has required role
 */
export const requireGodRole = (allowedRoles: string[]) => {
  return (req: GodAuthRequest, res: Response, next: NextFunction): void => {
    if (!req.godUser) {
      unauthorizedResponse(res, "God authentication required");
      return;
    }

    if (!allowedRoles.includes(req.godUser.role)) {
      forbiddenResponse(
        res,
        `Access denied. Required roles: ${allowedRoles.join(", ")}`,
      );
      return;
    }

    next();
  };
};
