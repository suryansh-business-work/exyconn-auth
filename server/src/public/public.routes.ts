/**
 * Public API Routes - Authenticated via API Key
 * These routes don't require organizationId parameter as it's derived from API key
 */
import { Router, RequestHandler } from "express";
import {
  authenticateApiKey,
  ApiKeyRequest,
} from "../middlewares/apikey.middleware";
import {
  successResponse,
  badRequestResponse,
  errorResponse,
  logger,
} from "@exyconn/common/server";
import User from "../auth/auth.model";
import { Response } from "express";

const router = Router();

/**
 * @route GET /v1/api/public/organization
 * @desc Get organization details (derived from API key)
 */
router.get(
  "/organization",
  authenticateApiKey as RequestHandler,
  async (req: ApiKeyRequest, res: Response) => {
    try {
      const org = req.organization;

      // Return safe organization data (exclude sensitive fields)
      const publicData = {
        id: org._id,
        orgName: org.orgName,
        orgEmail: org.orgEmail,
        orgSlug: org.orgSlug,
        orgLogos: org.orgLogos,
        orgFavIcon: org.orgFavIcon,
        orgTheme: org.orgTheme,
        orgOptions: org.orgOptions,
        featureFlags: org.featureFlags,
        loginPageDesign: org.loginPageDesign,
        customTextSections: org.customTextSections,
        orgPoliciesLink: org.orgPoliciesLink,
      };

      successResponse(res, publicData, "Organization details retrieved");
    } catch (error: any) {
      logger.error("Error fetching organization:", error);
      errorResponse(res, error, "Failed to fetch organization details");
    }
  },
);

/**
 * @route GET /v1/api/public/users
 * @desc Get all users for the organization
 */
router.get(
  "/users",
  authenticateApiKey as RequestHandler,
  async (req: ApiKeyRequest, res: Response) => {
    try {
      const orgId = req.organizationId;
      const { page = 1, limit = 20, search, role, isVerified } = req.query;

      const query: any = { companyId: orgId };

      // Role filter
      if (role) {
        query.role = role;
      }

      // isVerified filter
      if (isVerified !== undefined && isVerified !== "") {
        query.isVerified = isVerified === "true";
      }

      // Search filter
      if (search) {
        query.$or = [
          { firstName: { $regex: search, $options: "i" } },
          { lastName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ];
      }

      const users = await User.find(query)
        .select("_id firstName lastName email companyId role profilePicture")
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit))
        .sort({ createdAt: -1 })
        .lean();

      const total = await User.countDocuments(query);

      successResponse(
        res,
        {
          users,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit)),
          },
        },
        "Users retrieved successfully",
      );
    } catch (error: any) {
      logger.error("Error fetching users:", error);
      errorResponse(res, error, "Failed to fetch users");
    }
  },
);

/**
 * @route GET /v1/api/public/users/:userId
 * @desc Get a specific user by ID
 */
router.get(
  "/users/:userId",
  authenticateApiKey as RequestHandler,
  async (req: ApiKeyRequest, res: Response): Promise<void> => {
    try {
      const userId = req.params.userId as string;
      const orgId = req.organizationId;

      const user = await User.findOne({ _id: userId, companyId: orgId })
        .select("-password -otp -otpExpiry")
        .lean();

      if (!user) {
        badRequestResponse(res, "User not found");
        return;
      }

      successResponse(res, user, "User retrieved successfully");
    } catch (error: any) {
      logger.error("Error fetching user:", error);
      errorResponse(res, error, "Failed to fetch user");
    }
  },
);

/**
 * @route GET /v1/api/public/roles
 * @desc Get all roles for the organization that are visible on signup
 */
router.get(
  "/roles",
  authenticateApiKey as RequestHandler,
  async (req: ApiKeyRequest, res: Response) => {
    try {
      const org = req.organization;
      const allRoles = org.roles || [];

      // Filter to only return roles that should be shown on signup page
      const signupRoles = allRoles.filter(
        (role: any) => role.showOnSignup !== false,
      );

      successResponse(res, signupRoles, "Roles retrieved successfully");
    } catch (error: any) {
      logger.error("Error fetching roles:", error);
      errorResponse(res, error, "Failed to fetch roles");
    }
  },
);

/**
 * @route GET /v1/api/public/stats
 * @desc Get organization statistics
 */
router.get(
  "/stats",
  authenticateApiKey as RequestHandler,
  async (req: ApiKeyRequest, res: Response) => {
    try {
      const orgId = req.organizationId;

      const totalUsers = await User.countDocuments({ companyId: orgId });
      const verifiedUsers = await User.countDocuments({
        companyId: orgId,
        isVerified: true,
      });
      const activeUsers = await User.countDocuments({
        companyId: orgId,
        lastLoginAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      });

      successResponse(
        res,
        {
          totalUsers,
          verifiedUsers,
          activeUsers,
          lastUpdated: new Date(),
        },
        "Statistics retrieved successfully",
      );
    } catch (error: any) {
      logger.error("Error fetching stats:", error);
      errorResponse(res, error, "Failed to fetch statistics");
    }
  },
);

export default router;
