import { Response } from "express";
import bcrypt from "bcryptjs";
import * as AuthService from "../auth.service";
import User from "../auth.model";
import {
  successResponse,
  badRequestResponse,
  errorResponse,
  logger,
} from "@exyconn/common/server";
import { getOrgEmailConfig } from "./base";

// Enable MFA for user - sends OTP email
export const enableMfa = async (req: any, res: Response): Promise<void> => {
  try {
    const user = req.user;
    const companyId = user.companyId;

    logger.info("🔐 Enable MFA request:", { email: user.email, companyId });

    // Generate OTP for MFA verification - include companyId for multi-tenant
    const otp = await AuthService.updateUserOtp(user.email, companyId);

    logger.info("🔐 MFA OTP generated:", { email: user.email });

    // Get organization for email branding
    const company = await AuthService.getCompanyById(companyId);
    const defaultLogo =
      company?.orgLogos?.find((logo: any) => logo.isDefault) ||
      company?.orgLogos?.[0];

    const emailVars = {
      otp,
      companyName: company?.orgName || "Our Platform",
      logoUrl: defaultLogo?.url || "",
      primaryColor: company?.orgTheme?.primaryColor || "#1976d2",
      firstName: user.firstName || "User",
      expiryMinutes: "10",
      year: new Date().getFullYear().toString(),
      email: user.email,
      supportEmail: company?.orgEmail || "support@example.com",
    };

    await AuthService.sendEmailService(
      user.email,
      "Enable Two-Factor Authentication",
      "mfa-enable",
      emailVars,
      company ? getOrgEmailConfig(company) : undefined,
    );

    successResponse(res, null, "MFA verification code sent to your email");
  } catch (error: any) {
    logger.error("Enable MFA error:", error.message);
    errorResponse(res, error, error.message);
  }
};

// Verify MFA OTP and enable MFA
export const verifyMfa = async (req: any, res: Response): Promise<void> => {
  try {
    const { otp } = req.body;
    const user = req.user;
    const companyId = user.companyId;

    logger.info("🔐 Verify MFA request:", {
      email: user.email,
      companyId,
      otp: otp ? "***" : "missing",
    });

    if (!otp) {
      badRequestResponse(res, "OTP is required");
      return;
    }

    // Verify OTP - must include companyId for multi-tenant
    const dbUser = await User.findOne({
      email: user.email,
      companyId: companyId,
      otp,
      otpExpires: { $gt: new Date() },
    });

    logger.info("🔐 Verify MFA - user found:", {
      found: !!dbUser,
      email: user.email,
      companyId,
    });

    if (!dbUser) {
      badRequestResponse(res, "Invalid or expired OTP");
      return;
    }

    // Enable MFA
    dbUser.mfaEnabled = true;
    dbUser.otp = undefined;
    dbUser.otpExpires = undefined;
    await dbUser.save();

    logger.info("🔐 MFA enabled successfully for:", {
      email: user.email,
      companyId,
    });

    successResponse(res, { mfaEnabled: true }, "MFA enabled successfully");
  } catch (error: any) {
    logger.error("Verify MFA error:", error.message);
    errorResponse(res, error, error.message);
  }
};

// Disable MFA
export const disableMfa = async (req: any, res: Response): Promise<void> => {
  try {
    const { password } = req.body;
    const user = req.user;

    // For OAuth users, skip password verification
    if (user.provider !== "google") {
      if (!password) {
        badRequestResponse(res, "Password is required to disable MFA");
        return;
      }

      // Verify password
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        badRequestResponse(res, "Invalid password");
        return;
      }
    }

    // Disable MFA
    await User.updateOne(
      { _id: user._id },
      { mfaEnabled: false, mfaSecret: undefined },
    );

    successResponse(res, { mfaEnabled: false }, "MFA disabled successfully");
  } catch (error: any) {
    logger.error("Disable MFA error:", error.message);
    errorResponse(res, error, error.message);
  }
};
