import { Request, Response } from "express";
import { validate } from "class-validator";
import bcrypt from "bcryptjs";
import * as AuthService from "../auth.service";
import User from "../auth.model";
import {
  ForgotPasswordDto,
  ResetPasswordDto,
  ResendPasswordOtpDto,
} from "../auth.validators";
import {
  badRequestResponse,
  errorResponse,
  successResponse,
  logger,
} from "@exyconn/common/server";
import { getOrgEmailConfig } from "./base";

export const forgotPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const dto = Object.assign(new ForgotPasswordDto(), req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
      badRequestResponse(res, "Validation failed", errors);
      return;
    }

    const { email } = dto;
    // Get organizationId from API key middleware
    const organizationId = (req as any).organizationId;

    // Get organization
    const company = await AuthService.getCompanyById(organizationId);
    if (!company) {
      badRequestResponse(res, "Organization not found");
      return;
    }

    // Check if user exists in this organization
    const user = await AuthService.findUserByEmailAndCompany(
      email,
      company._id.toString(),
    );
    if (!user) {
      badRequestResponse(
        res,
        "No account found with this email in your organization. Please check your email or sign up.",
      );
      return;
    }

    const otp = await AuthService.updateUserOtp(email, company._id.toString());

    // Get default logo
    const defaultLogo =
      company.orgLogos?.find((logo: any) => logo.isDefault) ||
      company.orgLogos?.[0];

    await AuthService.sendEmailService(
      email,
      "Reset Password OTP",
      "password-reset",
      {
        otp,
        companyName: company.orgName || "Our Platform",
        logoUrl: defaultLogo?.url || "",
        firstName: user.firstName || "User",
        expiryMinutes: "10",
        year: new Date().getFullYear().toString(),
      },
      getOrgEmailConfig(company),
    );
    res.json({ success: true, message: "OTP sent to email" });
  } catch (error: any) {
    errorResponse(res, error, error.message);
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const dto = Object.assign(new ResetPasswordDto(), req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
      badRequestResponse(res, "Validation failed", errors);
      return;
    }

    const { email, otp, newPassword } = dto;
    // Get organizationId from API key middleware
    const organizationId = (req as any).organizationId;
    await AuthService.resetPassword(email, otp, newPassword, organizationId);

    // Get user and company for email variables
    const company = await AuthService.getCompanyById(organizationId);
    const user = await AuthService.findUserByEmailAndCompany(
      email,
      organizationId,
    );
    const defaultLogo =
      company?.orgLogos?.find((logo: any) => logo.isDefault) ||
      company?.orgLogos?.[0];

    await AuthService.sendEmailService(
      email,
      "Password Reset Success",
      "passwordResetSuccess",
      {
        firstName: user?.firstName || "User",
        companyName: company?.orgName || "Our Platform",
        logoUrl: defaultLogo?.url || "",
        time: new Date().toLocaleString(),
        year: new Date().getFullYear().toString(),
      },
      company ? getOrgEmailConfig(company) : undefined,
    );
    res.json({ success: true, message: "Password reset successful" });
  } catch (error: any) {
    badRequestResponse(res, error.message);
  }
};

// Change password for authenticated user
export const changePassword = async (req: any, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!newPassword) {
      res.status(400).json({
        success: false,
        error: "New password is required",
      });
      return;
    }

    const companyId = req.user.companyId || req.companyId;
    const user = await User.findOne({ email: req.user.email, companyId });

    if (!user) {
      res.status(404).json({ success: false, error: "User not found" });
      return;
    }

    // Get organization password policy
    const company = await AuthService.getCompanyById(companyId);
    const passwordPolicy = company?.orgOptions?.passwordPolicy || {
      minLength: 6,
      requireUppercase: false,
      requireLowercase: false,
      requireNumbers: false,
      requireSpecialChars: false,
    };

    // Validate new password against policy
    const policyErrors: string[] = [];
    if (newPassword.length < (passwordPolicy.minLength || 6)) {
      policyErrors.push(
        `Password must be at least ${passwordPolicy.minLength || 6} characters long`,
      );
    }
    if (passwordPolicy.requireUppercase && !/[A-Z]/.test(newPassword)) {
      policyErrors.push("Password must contain at least one uppercase letter");
    }
    if (passwordPolicy.requireLowercase && !/[a-z]/.test(newPassword)) {
      policyErrors.push("Password must contain at least one lowercase letter");
    }
    if (passwordPolicy.requireNumbers && !/\d/.test(newPassword)) {
      policyErrors.push("Password must contain at least one number");
    }
    if (
      passwordPolicy.requireSpecialChars &&
      !/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)
    ) {
      policyErrors.push("Password must contain at least one special character");
    }

    if (policyErrors.length > 0) {
      res.status(400).json({
        success: false,
        error: policyErrors.join(". "),
        policyErrors,
      });
      return;
    }

    // If user has a password, verify current password
    if (user.password) {
      if (!currentPassword) {
        res.status(400).json({
          success: false,
          error: "Current password is required",
        });
        return;
      }

      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password,
      );
      if (!isPasswordValid) {
        res.status(400).json({
          success: false,
          error: "Current password is incorrect",
        });
        return;
      }
    }

    // Hash and save new password
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    // Get logo for email variables (company already fetched above for password policy)
    const defaultLogo =
      company?.orgLogos?.find((logo: any) => logo.isDefault) ||
      company?.orgLogos?.[0];

    // Send confirmation email
    try {
      await AuthService.sendEmailService(
        user.email,
        "Password Changed Successfully",
        "passwordResetSuccess",
        {
          firstName: user.firstName || "User",
          companyName: company?.orgName || "Our Platform",
          logoUrl: defaultLogo?.url || "",
          time: new Date().toLocaleString(),
          year: new Date().getFullYear().toString(),
        },
        company ? getOrgEmailConfig(company) : undefined,
      );
    } catch (emailError) {
      logger.error(
        "Failed to send password change confirmation email:",
        emailError,
      );
      // Don't fail the request if email fails
    }

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Public endpoint to resend password reset OTP (no auth required)
export const resendPasswordOtp = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const dto = Object.assign(new ResendPasswordOtpDto(), req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
      badRequestResponse(res, "Validation failed", errors);
      return;
    }

    const { email } = dto;
    // Get organizationId from API key middleware
    const organizationId = (req as any).organizationId;

    // Get organization
    const company = await AuthService.getCompanyById(organizationId);
    if (!company) {
      badRequestResponse(res, "Organization not found");
      return;
    }

    // Find user by email in this organization
    const user = await AuthService.findUserByEmailAndCompany(
      email,
      company._id.toString(),
    );

    if (!user) {
      badRequestResponse(
        res,
        "No account found with this email in your organization",
      );
      return;
    }

    // Generate new OTP
    const otp = await AuthService.updateUserOtp(email);

    // Get default logo
    const defaultLogo =
      company.orgLogos?.find((logo: any) => logo.isDefault) ||
      company.orgLogos?.[0];

    const emailVars = {
      otp,
      companyName: company.orgName || "Our Platform",
      logoUrl: defaultLogo?.url || "",
      primaryColor: company.orgTheme?.primaryColor || "#1976d2",
      firstName: user.firstName || "User",
      lastName: user.lastName || "",
      expiryMinutes: "10",
      year: new Date().getFullYear().toString(),
      email: user.email,
      supportEmail: company.orgEmail || "support@example.com",
    };

    await AuthService.sendEmailService(
      user.email,
      "Reset Password OTP",
      "password-reset",
      emailVars,
      getOrgEmailConfig(company),
    );

    successResponse(res, null, "OTP sent to email");
  } catch (error: any) {
    errorResponse(res, error, error.message);
  }
};
