import { Request, Response } from "express";
import { validate } from "class-validator";
import * as UserService from "./user.service";
import {
  LoginDto,
  SignupDto,
  VerifyDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from "./user.validators";

import { AuthRequest } from "../middlewares/user.middleware";
import {
  badRequestResponse,
  errorResponse,
  successResponse,
  logger,
} from "../common";
import { companies } from "../config/companies.config";

// Login
export const login = async (req: Request, res: Response) => {
  try {
    const dto = Object.assign(new LoginDto(), req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
      return badRequestResponse(res, "Validation failed");
    }

    const { email, password, companyId } = dto;
    logger.info("Login attempt", { email, companyId });

    const company = UserService.getCompanyConfigById(companyId);
    if (!company) {
      return badRequestResponse(res, "Company not found");
    }

    const user = await UserService.authenticateUser(
      email,
      password,
      company.companyId,
    );
    const token = UserService.generateToken(
      {
        userId: user._id,
        email,
        companyId: company.companyId,
        role: user.role,
      },
      company.tokenSignKey,
    );

    await UserService.sendEmailService(
      email,
      "Recent Login",
      "recentLogin",
      {},
    );

    return successResponse(
      res,
      {
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          companyId: user.companyId,
          role: user.role,
          isVerified: user.isVerified,
          profilePicture: user.profilePicture,
        },
      },
      "Login successful",
    );
  } catch (error: any) {
    return errorResponse(res, error, error.message);
  }
};

// Signup
export const signup = async (req: Request, res: Response) => {
  try {
    const dto = Object.assign(new SignupDto(), req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
      return badRequestResponse(res, "Validation failed");
    }

    const { email, password, role, companyId, firstName, lastName } = dto;

    const company = UserService.getCompanyConfigById(companyId);
    if (!company) {
      return badRequestResponse(res, "Company not found");
    }

    const existingUser = await UserService.findUserByEmail(email);
    if (existingUser) {
      return badRequestResponse(res, "User already exists");
    }

    const { otp, user } = await UserService.createUser(
      email,
      password,
      role || "user",
      company.companyId,
      firstName,
      lastName,
    );

    const emailVars = {
      otp,
      companyName: company.name || "Our Platform",
      logoUrl: company.logo || "",
      primaryColor: "#1976d2",
      firstName: user.firstName || "User",
      lastName: user.lastName || "",
      expiryMinutes: "10",
      year: new Date().getFullYear().toString(),
      email,
    };

    await UserService.sendEmailService(
      email,
      "Verify Your Account",
      "welcome-verify",
      emailVars,
    );

    return successResponse(res, null, "Signup successful, check email for OTP");
  } catch (error: any) {
    return errorResponse(res, error, error.message);
  }
};

// Verify account with OTP
export const verifyAccount = async (req: Request, res: Response) => {
  try {
    const dto = Object.assign(new VerifyDto(), req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
      return badRequestResponse(res, "Validation failed");
    }

    const { email, otp } = dto;
    await UserService.verifyUser(email, otp);

    return successResponse(res, null, "Account verified successfully");
  } catch (error: any) {
    return errorResponse(res, error, error.message);
  }
};

// Forgot password
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const dto = Object.assign(new ForgotPasswordDto(), req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
      return badRequestResponse(res, "Validation failed");
    }

    const { email } = dto;
    const user = await UserService.findUserByEmail(email);
    if (!user) {
      return badRequestResponse(res, "User not found");
    }

    const otp = await UserService.updateUserOtp(email);
    await UserService.sendEmailService(
      email,
      "Reset Password OTP",
      "password-reset",
      {
        otp,
        companyName: "Our Platform",
        logoUrl: "",
        firstName: user.firstName || "User",
        expiryMinutes: "10",
      },
    );

    return successResponse(res, null, "OTP sent to email");
  } catch (error: any) {
    return errorResponse(res, error, error.message);
  }
};

// Reset password
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const dto = Object.assign(new ResetPasswordDto(), req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
      return badRequestResponse(res, "Validation failed");
    }

    const { email, otp, newPassword } = dto;
    await UserService.resetPassword(email, otp, newPassword);

    // Get user for email variables
    const user = await UserService.findUserByEmail(email);

    await UserService.sendEmailService(
      email,
      "Password Reset Success",
      "passwordResetSuccess",
      {
        firstName: user?.firstName || "User",
        companyName: "Our Platform",
        logoUrl: "",
        year: new Date().getFullYear().toString(),
      },
    );

    return successResponse(res, null, "Password reset successful");
  } catch (error: any) {
    return errorResponse(res, error, error.message);
  }
};

// Get profile
export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    return successResponse(
      res,
      {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        companyId: user.companyId,
        role: user.role,
        isVerified: user.isVerified,
        profilePicture: user.profilePicture,
      },
      "Profile retrieved successfully",
    );
  } catch (error: any) {
    return errorResponse(res, error, "Failed to get profile");
  }
};

// Update profile
export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { firstName, lastName } = req.body;
    const user = await UserService.updateProfile(req.user._id, {
      firstName,
      lastName,
    });

    return successResponse(res, user, "Profile updated successfully");
  } catch (error: any) {
    return errorResponse(res, error, "Failed to update profile");
  }
};

// Update profile picture
export const updateProfilePicture = async (req: AuthRequest, res: Response) => {
  try {
    const { profilePicture } = req.body;
    const user = await UserService.updateProfile(req.user._id, {
      profilePicture,
    });

    return successResponse(res, user, "Profile picture updated successfully");
  } catch (error: any) {
    return errorResponse(res, error, "Failed to update profile picture");
  }
};

// Resend OTP
export const resendOtp = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    const otp = await UserService.updateUserOtp(user.email);

    const emailVars = {
      otp,
      companyName: "Our Platform",
      logoUrl: "",
      primaryColor: "#1976d2",
      firstName: user.firstName || "User",
      lastName: user.lastName || "",
      expiryMinutes: "10",
      year: new Date().getFullYear().toString(),
      email: user.email,
    };

    await UserService.sendEmailService(
      user.email,
      "Verify Your Account",
      "welcome-verify",
      emailVars,
    );

    return successResponse(res, null, "OTP sent to email");
  } catch (error: any) {
    return errorResponse(res, error, "Failed to send OTP");
  }
};

export const getCompanies = (req: Request, res: Response) => {
  try {
    const companyList = companies.map((c) => ({
      id: c.companyId,
      name: c.name,
      logo: c.logo,
      domain: c.companyDomain,
    }));
    res.json({ data: companyList, total: companyList.length });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch companies" });
  }
};
