import { Response } from "express";
import bcrypt from "bcryptjs";
import User from "../auth/auth.model";
import Organization from "../god/organization/organization.model";
import { AuthRequest } from "../middlewares/user.middleware";
import {
  successResponse,
  successResponseArr,
  errorResponse,
  forbiddenResponse,
  notFoundResponse,
  badRequestResponse,
  noContentResponse,
  logger,
  parseBulkDelete,
} from "../common";
import { sendEmail } from "../common/email.service";

// Middleware to check admin role
export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: () => void,
): void => {
  if (req.user?.role !== "admin") {
    forbiddenResponse(res, "Admin access required");
    return;
  }
  next();
};

// Get admin dashboard statistics
export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId;

    const [
      totalUsers,
      verifiedUsers,
      unverifiedUsers,
      adminUsers,
      recentUsers,
    ] = await Promise.all([
      User.countDocuments({ companyId }),
      User.countDocuments({ companyId, isVerified: true }),
      User.countDocuments({ companyId, isVerified: false }),
      User.countDocuments({ companyId, role: "admin" }),
      User.find({ companyId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("firstName lastName email createdAt isVerified"),
    ]);

    const stats = {
      totalUsers,
      verifiedUsers,
      unverifiedUsers,
      adminUsers,
      regularUsers: totalUsers - adminUsers,
      recentUsers,
    };

    return successResponse(
      res,
      stats,
      "Dashboard statistics fetched successfully",
    );
  } catch (error: any) {
    logger.error("Error fetching dashboard stats", { error: error.message });
    return errorResponse(res, error, "Failed to fetch dashboard statistics");
  }
};

// Get all users in organization
export const getOrganizationUsers = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId;
    const {
      page = 1,
      limit = 10,
      search,
      filter,
      sort,
    } = (req as any).parsedQuery || {};
    const role = filter?.role;
    const verified = filter?.verified;

    const skip = (page - 1) * limit;

    // Build query
    const query: any = { companyId };

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (role && role !== "all") {
      query.role = role;
    }

    if (verified === "true") {
      query.isVerified = true;
    } else if (verified === "false") {
      query.isVerified = false;
    }

    const sortField = sort?.field || "createdAt";
    const sortOrder = sort?.order === "asc" ? 1 : -1;

    const [users, total] = await Promise.all([
      User.find(query)
        .select("-password -otp -otpExpires")
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit),
      User.countDocuments(query),
    ]);

    return successResponseArr(
      res,
      users,
      {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      "Users fetched successfully",
    );
  } catch (error: any) {
    logger.error("Error fetching organization users", { error: error.message });
    return errorResponse(res, error, "Failed to fetch users");
  }
};

// Get single user by ID
export const getUserById = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.params.userId as string;
    const companyId = req.companyId;

    const user = await User.findOne({ _id: userId, companyId }).select(
      "-password -otp -otpExpires",
    );

    if (!user) {
      return notFoundResponse(res, "User not found");
    }

    return successResponse(res, user, "User fetched successfully");
  } catch (error: any) {
    logger.error("Error fetching user", { error: error.message });
    return errorResponse(res, error, "Failed to fetch user");
  }
};

// Create a new user
export const createUser = async (req: AuthRequest, res: Response) => {
  try {
    const { firstName, lastName, email, password, role = "user" } = req.body;
    const companyId = req.companyId;

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return badRequestResponse(res, "All fields are required");
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email, companyId });
    if (existingUser) {
      return badRequestResponse(
        res,
        "A user with this email already exists in your organization",
      );
    }

    // Validate role
    if (role !== "user" && role !== "admin") {
      return badRequestResponse(res, "Invalid role. Must be 'user' or 'admin'");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user (already verified since admin is creating)
    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      companyId,
      role,
      isVerified: true,
      provider: "email",
    });

    await user.save();

    // Send welcome email
    try {
      const organization = await Organization.findById(companyId);
      await sendEmail(
        email,
        "Welcome to " + (organization?.orgName || "Our Platform"),
        "welcome-verify",
        {
          firstName,
          orgName: organization?.orgName || "Our Platform",
          verificationLink: "", // No verification needed
        },
      );
    } catch (emailError) {
      logger.warn("Failed to send welcome email", { email });
    }

    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.otp;
    delete userResponse.otpExpires;

    return successResponse(res, userResponse, "User created successfully");
  } catch (error: any) {
    logger.error("Error creating user", { error: error.message });
    return errorResponse(res, error, "Failed to create user");
  }
};

// Update user
export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.params.userId as string;
    const { firstName, lastName, role, isVerified } = req.body;
    const companyId = req.companyId;

    const user = await User.findOne({ _id: userId, companyId });

    if (!user) {
      return notFoundResponse(res, "User not found");
    }

    // Prevent admin from demoting themselves
    if (userId === req.user?._id.toString() && role && role !== "admin") {
      return badRequestResponse(res, "You cannot change your own admin role");
    }

    // Update fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (role && (role === "user" || role === "admin")) user.role = role;
    if (typeof isVerified === "boolean") user.isVerified = isVerified;

    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.otp;
    delete userResponse.otpExpires;

    return successResponse(res, userResponse, "User updated successfully");
  } catch (error: any) {
    logger.error("Error updating user", { error: error.message });
    return errorResponse(res, error, "Failed to update user");
  }
};

// Reset user password
export const resetUserPassword = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;
    const companyId = req.companyId;

    if (!newPassword || newPassword.length < 6) {
      return badRequestResponse(res, "Password must be at least 6 characters");
    }

    const user = await User.findOne({ _id: userId, companyId });

    if (!user) {
      return notFoundResponse(res, "User not found");
    }

    // Check if it's an OAuth user
    if (user.provider === "google" && !user.password) {
      return badRequestResponse(
        res,
        "Cannot reset password for Google OAuth users",
      );
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    // Get company for email variables
    const company = await Organization.findById(companyId);
    const defaultLogo =
      company?.orgLogos?.find((logo: any) => logo.isDefault) ||
      company?.orgLogos?.[0];

    // Send password reset notification
    try {
      await sendEmail(
        user.email,
        "Your Password Has Been Reset",
        "passwordResetSuccess",
        {
          firstName: user.firstName || "User",
          companyName: company?.orgName || "Our Platform",
          logoUrl: defaultLogo?.url || "",
          year: new Date().getFullYear().toString(),
        },
        company
          ? {
              smtpSettings: company.smtpSettings,
              orgTheme: company.orgTheme,
              orgLogos: company.orgLogos,
              orgName: company.orgName,
              orgEmail: company.orgEmail,
              emailTemplates: company.emailTemplates,
            }
          : undefined,
      );
    } catch (emailError) {
      logger.warn("Failed to send password reset email", { email: user.email });
    }

    return successResponse(res, null, "Password reset successfully");
  } catch (error: any) {
    logger.error("Error resetting user password", { error: error.message });
    return errorResponse(res, error, "Failed to reset password");
  }
};

// Delete user
export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const companyId = req.companyId;

    // Prevent admin from deleting themselves
    if (userId === req.user?._id.toString()) {
      return badRequestResponse(res, "You cannot delete your own account");
    }

    const user = await User.findOneAndDelete({ _id: userId, companyId });

    if (!user) {
      return notFoundResponse(res, "User not found");
    }

    return noContentResponse(res);
  } catch (error: any) {
    logger.error("Error deleting user", { error: error.message });
    return errorResponse(res, error, "Failed to delete user");
  }
};

// Toggle user verification status
export const toggleUserVerification = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const { userId } = req.params;
    const companyId = req.companyId;

    const user = await User.findOne({ _id: userId, companyId });

    if (!user) {
      return notFoundResponse(res, "User not found");
    }

    user.isVerified = !user.isVerified;
    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.otp;
    delete userResponse.otpExpires;

    return successResponse(
      res,
      userResponse,
      `User ${user.isVerified ? "verified" : "unverified"} successfully`,
    );
  } catch (error: any) {
    logger.error("Error toggling user verification", { error: error.message });
    return errorResponse(res, error, "Failed to update verification status");
  }
};

// Get organization details (for admin dashboard header)
export const getOrganizationDetails = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const companyId = req.companyId;

    const organization = await Organization.findById(companyId).select(
      "orgName orgLogos orgDescription orgActiveStatus roles orgOptions",
    );

    if (!organization) {
      return notFoundResponse(res, "Organization not found");
    }

    return successResponse(
      res,
      organization,
      "Organization details fetched successfully",
    );
  } catch (error: any) {
    logger.error("Error fetching organization details", {
      error: error.message,
    });
    return errorResponse(res, error, "Failed to fetch organization details");
  }
};

// Get organization roles (for user management)
export const getOrganizationRoles = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId;

    const organization = await Organization.findById(companyId).select("roles");

    if (!organization) {
      return notFoundResponse(res, "Organization not found");
    }

    return successResponse(
      res,
      organization.roles || [],
      "Organization roles fetched successfully",
    );
  } catch (error: any) {
    logger.error("Error fetching organization roles", { error: error.message });
    return errorResponse(res, error, "Failed to fetch organization roles");
  }
};

// Bulk delete users
export const bulkDeleteUsers = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId;
    const ids = (req as any).ids || [];
    const deleteAll = (req as any).deleteAll || false;

    // Prevent admin from deleting themselves
    const currentUserId = req.user?._id.toString();
    if (ids.includes(currentUserId || "")) {
      return badRequestResponse(res, "You cannot delete your own account");
    }

    if (deleteAll) {
      // Delete all users except the current admin
      await User.deleteMany({ companyId, _id: { $ne: currentUserId } });
    } else {
      await User.deleteMany({ _id: { $in: ids }, companyId });
    }

    return noContentResponse(res);
  } catch (error: any) {
    logger.error("Error bulk deleting users", { error: error.message });
    return errorResponse(res, error, "Failed to bulk delete users");
  }
};
