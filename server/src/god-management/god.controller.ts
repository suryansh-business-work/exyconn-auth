import { Request, Response } from "express";
import Organization from "../god/organization/organization.model";
import User from "../auth/auth.model";
import GodUser from "../god/user/user.model";
import {
  successResponse,
  successResponseArr,
  errorResponse,
  badRequestResponse,
  logger,
} from "../common";
import { sendEmail } from "../common/email.service";
import jwt from "jsonwebtoken";

interface AuthRequest extends Request {
  user?: any;
}

/**
 * Generate secure random password
 */
const generateSecurePassword = (): string => {
  const length = 16;
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";
  let password = "";

  // Ensure at least one of each required character type
  password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)]; // Uppercase
  password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)]; // Lowercase
  password += "0123456789"[Math.floor(Math.random() * 10)]; // Number
  password += "!@#$%^&*"[Math.floor(Math.random() * 8)]; // Special char

  // Fill remaining length with random characters
  for (let i = 4; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }

  // Shuffle the password
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
};

/**
 * @desc    Send God user credentials email
 * @route   GET /api/god-management/send-credentials
 * @access  Public
 */
export const sendGodCredentialsEmail = async (req: Request, res: Response) => {
  try {
    const GOD_EMAIL = "suryansh@exyconn.com";

    // Check if God user already exists
    let godUser = await GodUser.findOne({ email: GOD_EMAIL });

    let password: string;

    if (godUser) {
      // Generate new password for existing user
      password = generateSecurePassword();
      godUser.password = password; // Will be hashed by pre-save hook
      await godUser.save();
      logger.info("God User password updated", { email: GOD_EMAIL });
    } else {
      // Create new God User
      password = generateSecurePassword();
      godUser = new GodUser({
        email: GOD_EMAIL,
        password, // Will be hashed by pre-save hook
        firstName: "God",
        lastName: "Admin",
        role: "god",
        isActive: true,
      });
      await godUser.save();
      logger.info("God User created successfully", { email: GOD_EMAIL });
    }

    // Send credentials via email
    const loginUrl = process.env.FRONTEND_URL || "http://localhost:4001";

    await sendEmail(
      GOD_EMAIL,
      "🔐 God User Credentials - Dynamic Auth System",
      "god-credentials",
      {
        email: GOD_EMAIL,
        password,
        loginUrl,
        timestamp: new Date().toLocaleString("en-US", {
          dateStyle: "full",
          timeStyle: "long",
        }),
      },
    );

    logger.info("God User credentials email sent successfully", {
      email: GOD_EMAIL,
    });

    return successResponse(res, {
      message: "✅ God User credentials sent successfully",
      email: GOD_EMAIL,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error("Failed to send God User credentials", {
      error: error.message,
      stack: error.stack,
    });
    return errorResponse(res, error.message || "Failed to send credentials");
  }
};

/**
 * @desc    God User Login (No company required)
 * @route   POST /api/god-management/login
 * @access  Public
 */
export const godLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return badRequestResponse(res, "Email and password are required");
    }

    logger.info("God user login attempt", { email });

    // Find god user
    const godUser = await GodUser.findOne({ email });

    if (!godUser) {
      logger.warn("God user login failed - user not found", { email });
      return badRequestResponse(res, "Invalid credentials");
    }

    // Check if user is active
    if (!godUser.isActive) {
      logger.warn("God user login failed - user inactive", { email });
      return badRequestResponse(res, "Account is inactive");
    }

    // Compare password
    const isPasswordValid = await godUser.comparePassword(password);

    if (!isPasswordValid) {
      logger.warn("God user login failed - invalid password", { email });
      return badRequestResponse(res, "Invalid credentials");
    }

    // Update last login
    godUser.lastLoginAt = new Date();
    await godUser.save();

    // Generate JWT token (never expires)
    const token = jwt.sign(
      {
        userId: godUser._id,
        email: godUser.email,
        role: "god",
        companyId: "god",
      },
      process.env.JWT_SECRET || "default-secret",
      { expiresIn: "365d" }, // 1 year effectively never
    );

    logger.info("God user logged in successfully", { email });

    // Send login notification email
    await sendEmail(email, "Recent Login", "recentLogin", {}).catch((err) => {
      logger.warn("Failed to send login notification email", {
        error: err.message,
      });
    });

    // Token returned in response body - frontend stores in localStorage
    return successResponse(
      res,
      {
        token, // Still return token for backward compatibility
        user: {
          id: godUser._id,
          email: godUser.email,
          firstName: godUser.firstName,
          lastName: godUser.lastName,
          role: "god",
        },
        redirectUrl: process.env.FRONTEND_URL || "http://localhost:4001",
      },
      "Login successful",
    );
  } catch (error: any) {
    logger.error("God user login error", {
      error: error.message,
      stack: error.stack,
    });
    return errorResponse(res, error, "Login failed");
  }
};

// Organization Management
export const getAllOrganizations = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 10, search = "", isActive } = req.query;

    const query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { companyId: { $regex: search, $options: "i" } },
        { domain: { $regex: search, $options: "i" } },
      ];
    }
    if (isActive !== undefined) {
      query.isActive = isActive === "true";
    }

    const organizations = await Organization.find(query)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });

    const total = await Organization.countDocuments(query);

    return successResponseArr(
      res,
      organizations,
      {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
      "Organizations retrieved successfully",
    );
  } catch (error: any) {
    return errorResponse(res, error, "Failed to fetch organizations");
  }
};

export const getOrganizationById = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const organization = await Organization.findById(id);

    if (!organization) {
      return badRequestResponse(res, "Organization not found");
    }

    // Get organization statistics
    const userCount = await User.countDocuments({
      companyId: organization._id.toString(),
    });
    const adminCount = await User.countDocuments({
      companyId: organization._id.toString(),
      role: "admin",
    });

    return successResponse(
      res,
      {
        ...organization.toObject(),
        stats: {
          userCount,
          adminCount,
        },
      },
      "Organization retrieved successfully",
    );
  } catch (error: any) {
    return errorResponse(res, error, "Failed to fetch organization");
  }
};

export const createOrganization = async (req: AuthRequest, res: Response) => {
  try {
    const { companyId, name, domain, logo, theme, settings } = req.body;

    // Check if organization already exists
    const existingOrg = await Organization.findOne({ companyId });
    if (existingOrg) {
      return badRequestResponse(
        res,
        "Organization with this companyId already exists",
      );
    }

    const organization = new Organization({
      companyId,
      name,
      domain,
      logo,
      theme,
      settings,
    });

    await organization.save();

    return successResponse(
      res,
      organization,
      "Organization created successfully",
    );
  } catch (error: any) {
    return errorResponse(res, error, error?.message);
  }
};

export const updateOrganization = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const updates = req.body;

    const organization = await Organization.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true },
    );

    if (!organization) {
      return badRequestResponse(res, "Organization not found");
    }

    return successResponse(
      res,
      organization,
      "Organization updated successfully",
    );
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to update organization",
      error: error.message,
    });
  }
};

export const deleteOrganization = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    const organization = await Organization.findById(id);
    if (!organization) {
      return badRequestResponse(res, "Organization not found");
    }

    // Check if there are users in this organization
    const userCount = await User.countDocuments({
      companyId: organization._id.toString(),
    });
    if (userCount > 0) {
      return badRequestResponse(
        res,
        `Cannot delete organization with ${userCount} users. Please remove all users first.`,
      );
    }

    await Organization.findByIdAndDelete(id);

    return successResponse(res, null, "Organization deleted successfully");
  } catch (error: any) {
    return errorResponse(res, error, "Failed to delete organization");
  }
};

// User Management (All Organizations)
export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      role,
      companyId,
      isVerified,
    } = req.query;

    const query: any = {};
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (role) {
      query.role = role;
    }
    if (companyId) {
      query.companyId = companyId;
    }
    if (isVerified !== undefined) {
      query.isVerified = isVerified === "true";
    }

    const users = await User.find(query)
      .select("-password -otp -otpExpires")
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    return successResponseArr(
      res,
      users,
      {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
      "Users fetched successfully",
    );
  } catch (error: any) {
    return errorResponse(res, error, "Failed to fetch users");
  }
};

export const getUserById = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const user = await User.findById(id).select("-password -otp -otpExpires");

    if (!user) {
      return badRequestResponse(res, "User not found");
    }

    return successResponse(res, user, "User fetched successfully");
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user",
      error: error.message,
    });
  }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { firstName, lastName, role, isVerified, companyId } = req.body;

    const updates: any = {};
    if (firstName) updates.firstName = firstName;
    if (lastName) updates.lastName = lastName;
    if (role) updates.role = role;
    if (isVerified !== undefined) updates.isVerified = isVerified;
    if (companyId) updates.companyId = companyId;

    const user = await User.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true },
    ).select("-password -otp -otpExpires");

    if (!user) {
      return badRequestResponse(res, "User not found");
    }

    return successResponse(res, user, "User updated successfully");
  } catch (error: any) {
    return errorResponse(res, error, "Failed to update user");
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return badRequestResponse(res, "User not found");
    }

    return successResponse(res, null, "User deleted successfully");
  } catch (error: any) {
    return errorResponse(res, error, "Failed to delete user");
  }
};

// Dashboard Statistics
export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const totalOrganizations = await Organization.countDocuments();
    const activeOrganizations = await Organization.countDocuments({
      isActive: true,
    });
    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    const adminUsers = await User.countDocuments({ role: "admin" });
    const godUsers = await User.countDocuments({ role: "god" });

    // Get users per organization
    const usersByOrg = await User.aggregate([
      { $group: { _id: "$companyId", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Get recent users
    const recentUsers = await User.find()
      .select("-password -otp -otpExpires")
      .sort({ createdAt: -1 })
      .limit(10);

    // Get recent organizations
    const recentOrganizations = await Organization.find()
      .sort({ createdAt: -1 })
      .limit(10);

    return res.json({
      success: true,
      data: {
        summary: {
          totalOrganizations,
          activeOrganizations,
          totalUsers,
          verifiedUsers,
          adminUsers,
          godUsers,
        },
        usersByOrg,
        recentUsers,
        recentOrganizations,
      },
    });
  } catch (error: any) {
    return errorResponse(res, error, "Failed to fetch dashboard stats");
  }
};
