import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import axios from "axios";
import ImageKit from "imagekit";
import User from "./auth.model";
import Organization from "../god/organization/organization.model";
import { sendEmail } from "../common/email.service";
import { logger } from "@exyconn/common/server";

// ImageKit instance for profile picture uploads
const imagekit = new ImageKit({
  publicKey: "public_kgj5PULxw6pfjeO2IGwEVundBIQ=",
  privateKey: "private_n4IdSlg7DbXXn88rRAVqZhCgGVw=",
  urlEndpoint: "https://ik.imagekit.io/esdata1",
});

// Upload image from URL to ImageKit
export const uploadImageFromUrl = async (
  imageUrl: string,
  fileName: string,
  folder: string = "/profile-pictures",
): Promise<string | null> => {
  try {
    if (!imageUrl) return null;

    // Download image from URL
    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const buffer = Buffer.from(response.data);

    // Upload to ImageKit
    const uploadResponse = await imagekit.upload({
      file: buffer,
      fileName: `${fileName}-${Date.now()}.jpg`,
      folder: folder,
    });

    logger.info("✅ Profile picture uploaded to ImageKit:", uploadResponse.url);
    return uploadResponse.url;
  } catch (error: any) {
    logger.error(
      "❌ Failed to upload profile picture to ImageKit:",
      error.message,
    );
    return null;
  }
};

// Fetch location from IP
export const fetchLocationFromIP = async (ip: string) => {
  try {
    // Handle localhost
    if (ip === "127.0.0.1" || ip === "::1") {
      return {
        city: "Local Dev",
        country: "Local Dev",
        details: { ip, city: "Local Dev", country: "Local Dev" },
      };
    }

    // Call ipinfo.io
    // User provided endpoint: https://api.ipinfo.io/lite/${ip}?token=ad3be49c312343
    // We assume it returns JSON based on user sample.
    const response = await axios.get(
      `https://api.ipinfo.io/lite/${ip}?token=ad3be49c312343`,
    );

    const data = response.data;

    // User sample has 'country' but no 'city'. We use what we have.
    return {
      city: data.city, // Might be undefined
      country: data.country,
      details: data,
    };
  } catch (error: any) {
    logger.error("❌ Failed to fetch location from IP:", error.message);
    return {
      city: undefined,
      country: undefined,
      details: undefined,
    };
  }
};

// Get default role slug from organization
export const getDefaultRoleSlug = async (
  companyId: string,
): Promise<string> => {
  try {
    const org = (await Organization.findById(companyId)
      .select("roles")
      .lean()) as { roles?: any[] } | null;
    if (org?.roles && Array.isArray(org.roles)) {
      const defaultRole = org.roles.find((r: any) => r.isDefault);
      if (defaultRole) {
        return defaultRole.slug;
      }
      // If no default, check if there's a 'user' role
      const userRole = org.roles.find((r: any) => r.slug === "user");
      if (userRole) return "user";
    }
  } catch (error) {
    logger.error("Error getting default role:", error);
  }
  return "user"; // Fallback to 'user' role
};

export const getCompanyFromHost = async (host: string) => {
  const companyName = host.split(".")[0].replace("auth.", "");
  return await Organization.findOne({
    orgName: new RegExp(`^${companyName}$`, "i"),
    orgActiveStatus: true,
  });
};

export const getCompanyById = async (companyId: string) => {
  logger.info("🔍 Searching for company by _id:", companyId);

  try {
    const found = await Organization.findOne({
      _id: companyId,
      orgActiveStatus: true,
    });

    if (found) {
      logger.info("✅ Found company by _id:", found.orgName);
      return found;
    }
  } catch (error) {
    logger.info(
      "⚠️ Invalid MongoDB ID format or company not found:",
      companyId,
    );
  }

  logger.info("❌ Company not found:", companyId);
  return null;
};

export const createUser = async (
  email: string,
  password: string,
  role: string,
  companyId: string,
  firstName: string,
  lastName: string,
) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const otp = crypto.randomInt(100000, 999999).toString();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

  const user = new User({
    email,
    password: hashedPassword,
    companyId,
    role,
    firstName,
    lastName,
    otp,
    otpExpires,
  });
  await user.save();
  return { user, otp };
};

export const createGoogleUser = async (
  email: string,
  firstName: string,
  lastName: string,
  companyId: string,
  googleProfilePicture?: string,
  providedRole?: string,
) => {
  // Use provided role if valid, otherwise get default from organization
  let role = providedRole;
  if (!role) {
    role = await getDefaultRoleSlug(companyId);
  }
  logger.info("🎭 Using role for Google user:", role);

  // Upload Google profile picture to ImageKit
  let profilePicture: string | undefined;
  if (googleProfilePicture) {
    const uploadedUrl = await uploadImageFromUrl(
      googleProfilePicture,
      `google-${email.split("@")[0]}`,
      "/profile-pictures",
    );
    if (uploadedUrl) {
      profilePicture = uploadedUrl;
    }
  }

  const user = new User({
    email,
    firstName,
    lastName,
    companyId,
    role,
    isVerified: true, // Google OAuth users are pre-verified
    profilePicture,
    provider: "google",
  });
  await user.save();
  return { user };
};

export const verifyUser = async (email: string, otp: string) => {
  const user = await User.findOne({
    email,
    otp,
    otpExpires: { $gt: new Date() },
  });
  if (!user) throw new Error("Invalid or expired OTP");

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();
  return user;
};

export const findUserByEmail = async (email: string) => {
  return await User.findOne({ email });
};

export const findUserByEmailAndCompany = async (
  email: string,
  companyId: string,
) => {
  return await User.findOne({ email, companyId });
};

export const updateUserOtp = async (email: string, companyId?: string) => {
  const otp = crypto.randomInt(100000, 999999).toString();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
  const query = companyId ? { email, companyId } : { email };
  await User.updateOne(query, { otp, otpExpires });
  return otp;
};

export const resetPassword = async (
  email: string,
  otp: string,
  newPassword: string,
  companyId?: string,
) => {
  const query: any = {
    email,
    otp,
    otpExpires: { $gt: new Date() },
  };
  if (companyId) {
    query.companyId = companyId;
  }
  const user = await User.findOne(query);
  if (!user) throw new Error("Invalid or expired OTP");

  user.password = await bcrypt.hash(newPassword, 10);
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();
  return user;
};

export const authenticateUser = async (
  email: string,
  password: string,
  companyId: string,
) => {
  const user = await User.findOne({ email, companyId });
  if (!user) {
    throw new Error(
      "No account found with this email for your organization. Please check your email or sign up.",
    );
  }

  // Check if user has a password (not OAuth user)
  if (!user.password) {
    throw new Error(
      "This account uses Google Sign In. Please use the 'Continue with Google' button to login.",
    );
  }

  if (!(await bcrypt.compare(password, user.password))) {
    throw new Error(
      "Incorrect password. Please try again or use 'Forgot Password' to reset.",
    );
  }

  return user;
};

export const generateToken = (
  payload: object,
  secret: string,
  expiresIn?: string | number,
) => {
  // Token expires after specified duration (default 24h)
  return jwt.sign(payload, secret, {
    expiresIn: expiresIn || "24h",
  } as jwt.SignOptions);
};

// Generate token with organization's JWT settings
export const generateOrgToken = (user: any, organization: any) => {
  const jwtSettings = organization.jwtSettings || {};
  const algorithm = jwtSettings.algorithm || "HS256";
  const payloadFields = jwtSettings.payloadFields || [
    "userId",
    "userName",
    "email",
  ];
  const secret =
    jwtSettings.tokenSignKey ||
    organization.tokenSignKey ||
    process.env.JWT_SECRET ||
    "default-secret";

  // Build payload based on configured fields
  const payload: Record<string, any> = {};

  // Map configured fields to user data
  for (const field of payloadFields) {
    switch (field) {
      case "userId":
        payload.userId = user._id?.toString() || user.id;
        break;
      case "userName":
        payload.userName =
          `${user.firstName || ""} ${user.lastName || ""}`.trim();
        break;
      case "email":
        payload.email = user.email;
        break;
      case "firstName":
        payload.firstName = user.firstName;
        break;
      case "lastName":
        payload.lastName = user.lastName;
        break;
      case "profilePicture":
        payload.profilePicture = user.profilePicture;
        break;
      case "role":
        payload.role = user.role;
        break;
      case "organizationId":
        payload.organizationId = user.companyId || organization._id?.toString();
        break;
      case "isVerified":
        payload.isVerified = user.isVerified;
        break;
      default:
        // For custom fields, try to get from user object
        if (user[field] !== undefined) {
          payload[field] = user[field];
        }
    }
  }

  // Always include organizationId for security
  if (!payload.organizationId) {
    payload.organizationId = organization._id?.toString();
  }

  // Get token expiration from org settings (default 24 hours)
  const expiresIn = jwtSettings.tokenExpiresIn || "24h";

  // Sign with configured algorithm and expiration
  return jwt.sign(payload, secret, {
    algorithm: algorithm as jwt.Algorithm,
    expiresIn,
  });
};

// Organization email config interface
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

export const sendEmailService = async (
  to: string,
  subject: string,
  template: string,
  variables: Record<string, string>,
  organization?: OrganizationEmailConfig,
) => {
  await sendEmail(to, subject, template, variables, organization);
};
