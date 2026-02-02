import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "./user.model";
import { companies, getCompanyById } from "../config/companies.config";
import { sendEmail } from "../common/email.service";

// Get company configuration by host
export const getCompanyFromHost = (host: string) => {
  const companyName = host.split(".")[0].replace("auth.", "");
  return companies.find((c) => c.name === companyName);
};

// Get company configuration by ID
export const getCompanyConfigById = (companyId: string) => {
  return getCompanyById(companyId);
};

// Create new user with email/password
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

// Create user via Google OAuth
export const createGoogleUser = async (
  email: string,
  firstName: string,
  lastName: string,
  role: string,
  companyId: string,
  profilePicture?: string,
) => {
  const user = new User({
    email,
    firstName,
    lastName,
    companyId,
    role,
    isVerified: true,
    profilePicture,
    provider: "google",
  });
  await user.save();
  return { user };
};

// Verify user with OTP
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

// Find user by email
export const findUserByEmail = async (email: string) => {
  return await User.findOne({ email });
};

// Find user by ID
export const findUserById = async (userId: string) => {
  return await User.findById(userId);
};

// Update user OTP
export const updateUserOtp = async (email: string) => {
  const otp = crypto.randomInt(100000, 999999).toString();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
  await User.updateOne({ email }, { otp, otpExpires });
  return otp;
};

// Reset password with OTP
export const resetPassword = async (
  email: string,
  otp: string,
  newPassword: string,
) => {
  const user = await User.findOne({
    email,
    otp,
    otpExpires: { $gt: new Date() },
  });
  if (!user) throw new Error("Invalid or expired OTP");

  user.password = await bcrypt.hash(newPassword, 10);
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();
  return user;
};

// Authenticate user with email/password
export const authenticateUser = async (
  email: string,
  password: string,
  companyId: string,
) => {
  const user = await User.findOne({ email, companyId });
  if (!user) {
    throw new Error("Invalid credentials");
  }

  if (!user.password) {
    throw new Error(
      "This account uses OAuth login. Please use Google Sign In.",
    );
  }

  if (!(await bcrypt.compare(password, user.password))) {
    throw new Error("Invalid credentials");
  }

  return user;
};

// Generate JWT token (never expires)
export const generateToken = (payload: object, secret: string) => {
  return jwt.sign(payload, secret);
};

// Update user profile
export const updateProfile = async (
  userId: string,
  updates: { firstName?: string; lastName?: string; profilePicture?: string },
) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: updates },
    { new: true, runValidators: true },
  ).select("-password -otp -otpExpires");
  return user;
};

// Send email with organization config
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
