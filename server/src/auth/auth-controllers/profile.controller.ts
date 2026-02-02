import { Response } from "express";
import * as AuthService from "../auth.service";
import User from "../auth.model";
import { successResponse, errorResponse, logger } from "@exyconn/common/server";

// Get current user profile (ME endpoint) - For regular users only, not god users
export const getProfile = async (req: any, res: Response) => {
  try {
    const companyId = req.user.companyId || req.companyId;

    logger.info("📱 Profile request received:", {
      email: req.user.email,
      companyId,
    });

    // This endpoint is for regular users only, not god users
    if (companyId === "god") {
      res.status(403).json({
        success: false,
        error:
          "This endpoint is for regular users only. Use god panel profile endpoint.",
      });
      return;
    }

    // Fetch fresh user data from database to ensure we have latest info including lastLoginAt
    const user = await AuthService.findUserByEmailAndCompany(
      req.user.email,
      companyId,
    );

    logger.info("📱 User data fetched:", {
      found: !!user,
      email: user?.email,
      lastLoginAt: user?.lastLoginAt,
      mfaEnabled: user?.mfaEnabled,
      role: user?.role,
      roleType: typeof user?.role,
      hasRole: !!user?.role,
      userKeys: user ? Object.keys(user.toObject ? user.toObject() : user) : [],
    });

    if (!user) {
      res.status(404).json({ success: false, error: "User not found" });
      return;
    }

    const userResponse = user.toObject
      ? user.toObject()
      : { ...(user._doc || user) };
    delete userResponse.password;
    delete userResponse.otp;
    delete userResponse.otpExpires;
    delete userResponse.mfaSecret;

    // Get organization settings to know if MFA option should be shown
    const company = await AuthService.getCompanyById(companyId);

    // Find the full role object for the user's role
    let roleDetails = null;
    if (company?.roles && Array.isArray(company.roles)) {
      logger.info("🔍 Looking for role:", user.role);

      // Match by slug OR name (case-insensitive) to support custom roles
      const userRoleLower = user.role?.toLowerCase()?.trim();
      const foundRole = company.roles.find(
        (r: any) =>
          r.slug?.toLowerCase() === userRoleLower ||
          r.name?.toLowerCase() === userRoleLower,
      );

      if (foundRole) {
        logger.info(
          "✅ Found role:",
          foundRole.name,
          "| Permissions:",
          foundRole.permissions?.length || 0,
        );

        // Convert Mongoose subdocument to plain object to include all fields
        if (foundRole.toObject) {
          roleDetails = foundRole.toObject();
        } else if (foundRole._doc) {
          roleDetails = { ...foundRole._doc };
        } else {
          roleDetails = JSON.parse(JSON.stringify(foundRole));
        }
      } else {
        logger.warn("❌ Role not found:", user.role);
        logger.info(
          "Available roles:",
          company.roles.map((r: any) => ({ slug: r.slug, name: r.name })),
        );
      }
    } else {
      logger.warn("❌ Company has no roles array");
    }

    const responseData = {
      ...userResponse,
      hasPassword: !!user.password,
      roleDetails, // Include full role object with permissions
      orgOptions: {
        mfaEnabled: company?.orgOptions?.mfaEnabled ?? false,
        mfaRequired: company?.featureFlags?.mfaRequired ?? false,
        lastLoginDetails: company?.orgOptions?.lastLoginDetails ?? true,
        showRoleInProfile: company?.orgOptions?.showRoleInProfile ?? true,
      },
    };

    logger.info("📱 Profile response:", {
      role: roleDetails?.name,
      permissionsCount: roleDetails?.permissions?.length || 0,
      lastLoginAt: responseData.lastLoginAt,
      lastLoginIp: responseData.lastLoginIp,
    });

    res.json({
      success: true,
      data: responseData,
    });
  } catch (error: any) {
    logger.error("Profile error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateProfile = async (req: any, res: Response) => {
  try {
    const { firstName, lastName } = req.body;
    const companyId = req.user.companyId || req.companyId;

    // This endpoint is for regular users only
    if (companyId === "god") {
      res.status(403).json({
        success: false,
        error: "This endpoint is for regular users only.",
      });
      return;
    }

    const user = await AuthService.findUserByEmailAndCompany(
      req.user.email,
      companyId,
    );

    if (user) {
      user.firstName = firstName || user.firstName;
      user.lastName = lastName || user.lastName;
      await user.save();

      const userResponse = user.toObject();
      delete userResponse.password;
      delete userResponse.otp;
      delete userResponse.otpExpires;

      res.json({
        success: true,
        message: "Profile updated successfully",
        data: userResponse,
      });
    } else {
      res.status(404).json({ success: false, error: "User not found" });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateProfilePicture = async (req: any, res: Response) => {
  try {
    const { profilePicture } = req.body;
    const companyId = req.user.companyId || req.companyId;

    // This endpoint is for regular users only
    if (companyId === "god") {
      res.status(403).json({
        success: false,
        error: "This endpoint is for regular users only.",
      });
      return;
    }

    const user = await AuthService.findUserByEmailAndCompany(
      req.user.email,
      companyId,
    );

    if (user) {
      user.profilePicture = profilePicture;
      await user.save();

      const userResponse = user.toObject();
      delete userResponse.password;
      delete userResponse.otp;
      delete userResponse.otpExpires;

      res.json({
        success: true,
        message: "Profile picture updated successfully",
        data: userResponse,
      });
    } else {
      res.status(404).json({ success: false, error: "User not found" });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get recent login history for authenticated user
export const getRecentLogins = async (
  req: any,
  res: Response,
): Promise<void> => {
  try {
    const companyId = req.user.companyId || req.companyId;

    if (companyId === "god") {
      res.status(403).json({
        success: false,
        error: "This endpoint is for regular users only.",
      });
      return;
    }

    const user: any = await User.findOne({
      email: req.user.email,
      companyId: companyId,
    })
      .select("loginHistory lastLoginAt lastLoginIp")
      .lean();

    if (!user) {
      res.status(404).json({ success: false, error: "User not found" });
      return;
    }

    // Return login history (most recent first)
    const loginHistory = (user.loginHistory || []).reverse();

    successResponse(
      res,
      {
        loginHistory,
        lastLoginAt: user.lastLoginAt,
        lastLoginIp: user.lastLoginIp,
      },
      "Recent logins retrieved successfully",
    );
  } catch (error: any) {
    logger.error("Get recent logins error:", error.message);
    errorResponse(res, error, error.message);
  }
};

// Get role information for authenticated user
export const getRole = async (req: any, res: Response): Promise<void> => {
  try {
    const companyId = req.user.companyId || req.companyId;

    if (companyId === "god") {
      res.status(403).json({
        success: false,
        error: "This endpoint is for regular users only.",
      });
      return;
    }

    const user: any = await User.findOne({
      email: req.user.email,
      companyId: companyId,
    })
      .select("role")
      .lean();

    if (!user) {
      res.status(404).json({ success: false, error: "User not found" });
      return;
    }

    // Get organization to find role details
    const company = await AuthService.getCompanyById(companyId);

    let roleDetails = null;
    if (company?.roles && Array.isArray(company.roles)) {
      const userRoleLower = (user.role as string)?.toLowerCase()?.trim();
      const foundRole = company.roles.find(
        (r: any) =>
          r.slug?.toLowerCase() === userRoleLower ||
          r.name?.toLowerCase() === userRoleLower,
      );

      if (foundRole) {
        roleDetails = foundRole.toObject
          ? foundRole.toObject()
          : JSON.parse(JSON.stringify(foundRole));
      }
    }

    successResponse(
      res,
      {
        role: user.role,
        roleDetails,
      },
      "Role information retrieved successfully",
    );
  } catch (error: any) {
    logger.error("Get role error:", error.message);
    errorResponse(res, error, error.message);
  }
};

// Get comprehensive user information (/me endpoint)
export const getMe = async (req: any, res: Response): Promise<void> => {
  try {
    const companyId = req.user.companyId || req.companyId;

    if (companyId === "god") {
      res.status(403).json({
        success: false,
        error:
          "This endpoint is for regular users only. Use god panel profile endpoint.",
      });
      return;
    }

    // Fetch user data
    const user: any = await User.findOne({
      email: req.user.email,
      companyId: companyId,
    }).lean();

    if (!user) {
      res.status(404).json({ success: false, error: "User not found" });
      return;
    }

    // Get organization details
    const company = await AuthService.getCompanyById(companyId);

    // Find default logo
    const defaultLogo =
      company?.orgLogos?.find((logo: any) => logo.isDefault) ||
      company?.orgLogos?.[0];

    // Build response without role details as requested
    const responseData = {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePicture: user.profilePicture,
        isVerified: user.isVerified,
        mfaEnabled: user.mfaEnabled,
        provider: user.provider,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
        lastLoginIp: user.lastLoginIp,
        role: user.role,
        hasPassword: !!user.password,
      },
      organization: {
        id: company?._id,
        name: company?.orgName,
        email: company?.orgEmail,
        logo: defaultLogo?.url,
        website: company?.orgWebsite,
        orgOptions: company?.orgOptions,
      },
    };

    successResponse(
      res,
      responseData,
      "User information retrieved successfully",
    );
  } catch (error: any) {
    logger.error("Get me error:", error.message);
    errorResponse(res, error, error.message);
  }
};
