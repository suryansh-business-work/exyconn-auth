import { Request, Response } from "express";
import { validate } from "class-validator";
import * as AuthService from "../auth.service";
import User from "../auth.model";
import { LoginDto, SignupDto, VerifyDto } from "../auth.validators";
import {
  successResponse,
  badRequestResponse,
  errorResponse,
  unauthorizedResponse,
  logger,
} from "../../common";
import { getOrgEmailConfig, computeRedirectionUrl } from "./base";

export const login = async (req: Request, res: Response) => {
  try {
    logger.info("🔐 Login request received:", { body: req.body });
    const dto = Object.assign(new LoginDto(), req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
      logger.info("❌ Validation errors:", errors);
      return badRequestResponse(res, "Validation failed", errors);
    }

    const { email, password } = dto;
    // Get organizationId from API key middleware
    const organizationId = (req as any).organizationId;
    logger.info("🔍 Looking for organization with ID:", organizationId);

    // Get organization by ID from API key middleware
    const company = await AuthService.getCompanyById(organizationId);
    logger.info(
      "🏢 Organization found:",
      company ? company.orgName : "NOT FOUND",
    );
    if (!company) {
      return badRequestResponse(res, "Organization not found");
    }

    const user = await AuthService.authenticateUser(
      email,
      password,
      company._id.toString(),
    );

    // Check if MFA is required (either org requires it or user has it enabled)
    const mfaRequired = company.featureFlags?.mfaRequired || user.mfaEnabled;

    if (mfaRequired) {
      // Send MFA OTP
      const otp = await AuthService.updateUserOtp(
        email,
        company._id.toString(),
      );
      const defaultLogo =
        company.orgLogos?.find((logo: any) => logo.isDefault) ||
        company.orgLogos?.[0];

      await AuthService.sendEmailService(
        email,
        "Login Verification Code",
        "mfa-login",
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

      return successResponse(
        res,
        {
          mfaRequired: true,
          email: user.email,
          organizationId: company._id.toString(),
        },
        "MFA verification required. Check your email for the code.",
      );
    }

    // Update last login and add to login history (keep last 20 entries)
    // Fetch location data
    const ipAddress =
      req.ip || req.headers["x-forwarded-for"]?.toString() || "unknown";
    const locationData = await AuthService.fetchLocationFromIP(ipAddress);

    // Update last login and add to login history (keep last 20 entries)
    const loginEntry = {
      loginAt: new Date(),
      ipAddress,
      userAgent: req.headers["user-agent"] || "Unknown",
      location: {
        city: locationData.city,
        country: locationData.country,
      },
      details: locationData.details,
    };

    const updateResult = await User.updateOne(
      { _id: user._id },
      {
        lastLoginAt: loginEntry.loginAt,
        lastLoginIp: loginEntry.ipAddress,
        $push: {
          loginHistory: {
            $each: [loginEntry],
            $slice: -20, // Keep only last 20 entries
          },
        },
      },
    );

    logger.info("🕐 Last login update result:", {
      userId: user._id,
      matched: updateResult.matchedCount,
      modified: updateResult.modifiedCount,
    });

    // Use organization's JWT settings for token generation
    const token = AuthService.generateOrgToken(user, company);

    // Get default logo
    const defaultLogo =
      company.orgLogos?.find((logo: any) => logo.isDefault) ||
      company.orgLogos?.[0];

    try {
      await AuthService.sendEmailService(
        email,
        "Recent Login",
        "recentLogin",
        {
          firstName: user.firstName || "User",
          email: user.email,
          companyName: company.orgName || "Our Platform",
          logoUrl: defaultLogo?.url || "",
          loginTime: new Date().toLocaleString(),
          time: new Date().toLocaleString(),
          location: "Unknown",
          deviceInfo: req.headers["user-agent"] || "Unknown",
          year: new Date().getFullYear().toString(),
        },
        getOrgEmailConfig(company),
      );
    } catch (emailError) {
      logger.error("Failed to send login notification email:", emailError);
      // Don't fail the login if email fails
    }

    // Token returned in response body - frontend stores in localStorage
    // Compute redirection URL based on user role
    const authPageUrl = req.headers.origin || req.headers.host || "";
    const redirection = computeRedirectionUrl(
      company.orgRedirectionSettings,
      user.role,
      authPageUrl,
      token,
    );

    return successResponse(
      res,
      {
        token, // Still return token for backward compatibility
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          organizationId: company._id.toString(),
          isVerified: user.isVerified,
          mfaEnabled: user.mfaEnabled,
          lastLoginAt: new Date(), // Return the new login time
        },
        orgRedirectionSettings: company.orgRedirectionSettings || [],
        redirection: {
          url: redirection.redirectionUrl,
          tokenAppendedUrl: redirection.tokenAppendedUrl,
          matchType: redirection.matchType,
        },
      },
      "Login successful",
    );
  } catch (error: any) {
    logger.error("❌ Login error:", error.message);

    // Handle authentication errors (OAuth users, wrong password, etc.)
    if (
      error.message.includes("OAuth") ||
      error.message.includes("password") ||
      error.message.includes("Email not found") ||
      error.message.includes("Invalid credentials")
    ) {
      return unauthorizedResponse(res, error.message);
    }

    // Other errors
    return errorResponse(res, error, error.message);
  }
};

export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    logger.info("📝 Signup request received:", { body: req.body });
    const dto = Object.assign(new SignupDto(), req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
      logger.info("❌ Validation errors:", errors);
      badRequestResponse(res, "Validation failed", errors);
      return;
    }

    const { email, password, firstName, lastName } = dto;
    // Get organizationId from API key middleware
    const organizationId = (req as any).organizationId;
    logger.info("🔍 Looking for organization with ID:", organizationId);

    // Get organization by ID from API key middleware
    const company = await AuthService.getCompanyById(organizationId);
    logger.info("🏢 Company found:", company ? company.orgName : "NOT FOUND");
    if (!company) {
      badRequestResponse(res, "Organization not found");
      return;
    }

    // Check if user already exists in this organization
    const existingUser = await AuthService.findUserByEmailAndCompany(
      email,
      company._id.toString(),
    );
    if (existingUser) {
      badRequestResponse(
        res,
        "An account with this email already exists in your organization. Please login or use a different email.",
      );
      return;
    }

    // Determine which role to use - prefer requested role if valid
    const requestedRole = dto.role;
    let roleToUse: string;

    if (requestedRole) {
      // Validate that the requested role exists in the organization and is visible on signup
      const org = await AuthService.getCompanyById(company._id.toString());
      const validRole = org?.roles?.find(
        (r: any) => r.slug === requestedRole && r.showOnSignup !== false,
      );
      if (validRole) {
        roleToUse = requestedRole;
        logger.info("🎭 Using requested role for signup:", roleToUse);
      } else {
        roleToUse = await AuthService.getDefaultRoleSlug(
          company._id.toString(),
        );
        logger.warn(
          "⚠️ Invalid/hidden role requested, using default:",
          roleToUse,
        );
      }
    } else {
      roleToUse = await AuthService.getDefaultRoleSlug(company._id.toString());
      logger.info("🎭 No role specified, using default:", roleToUse);
    }

    const { otp, user } = await AuthService.createUser(
      email,
      password,
      roleToUse,
      company._id.toString(),
      firstName,
      lastName,
    );

    // Prepare email variables
    const emailVars = {
      otp,
      companyName: company.orgName || "Our Platform",
      logoUrl:
        company.orgLogos && company.orgLogos.length > 0
          ? company.orgLogos[0].url
          : "",
      primaryColor: company.orgTheme?.primaryColor || "#1976d2",
      firstName: user.firstName || "User",
      lastName: user.lastName || "",
      expiryMinutes: "10",
      year: new Date().getFullYear().toString(),
      email,
      supportEmail: company.orgEmail || "support@example.com",
      supportUrl: company.orgWebsite || "#",
    };

    // Try to send email, but if it fails, delete the user to avoid orphaned records
    try {
      await AuthService.sendEmailService(
        email,
        "Verify Your Account",
        "welcome-verify",
        emailVars,
        getOrgEmailConfig(company),
      );
      res.json({ message: "Signup successful, check email for OTP" });
    } catch (emailError: any) {
      logger.error(
        "❌ Email sending failed, rolling back user creation:",
        emailError.message,
      );
      // Delete the user we just created
      await User.findByIdAndDelete(user._id);
      errorResponse(
        res,
        emailError,
        "Failed to send verification email. Please try again later or contact support.",
      );
    }
  } catch (error: any) {
    logger.error("❌ Signup error:", error.message);
    errorResponse(res, error, error.message);
  }
};

export const verifyAccount = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const dto = Object.assign(new VerifyDto(), req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
      badRequestResponse(res, "Validation failed");
      return;
    }

    const { email, otp } = dto;
    await AuthService.verifyUser(email, otp);
    res.json({ message: "Account verified" });
  } catch (error: any) {
    badRequestResponse(res, error.message);
  }
};

// Public endpoint to resend verification OTP (no auth required)
export const resendVerificationOtp = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ success: false, error: "Email is required" });
      return;
    }

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
      res.status(404).json({
        success: false,
        error: "No account found with this email in your organization",
      });
      return;
    }

    // Check if already verified
    if (user.isVerified) {
      res
        .status(400)
        .json({ success: false, error: "Account is already verified" });
      return;
    }

    // Generate new OTP - include companyId for multi-tenant
    const otp = await AuthService.updateUserOtp(email, company._id.toString());

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
      "Verify Your Account",
      "welcome-verify",
      emailVars,
      getOrgEmailConfig(company),
    );

    res.json({ success: true, message: "OTP sent to email" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const resendOtp = async (req: any, res: Response) => {
  try {
    const user = req.user;
    const companyId = user.companyId || user.organizationId;

    // Get organization
    const company = companyId
      ? await AuthService.getCompanyById(companyId)
      : null;
    const defaultLogo =
      company?.orgLogos?.find((logo: any) => logo.isDefault) ||
      company?.orgLogos?.[0];

    const otp = await AuthService.updateUserOtp(user.email, companyId);

    const emailVars = {
      otp,
      companyName: company?.orgName || "Our Platform",
      logoUrl: defaultLogo?.url || "",
      primaryColor: company?.orgTheme?.primaryColor || "#1976d2",
      firstName: user.firstName || "User",
      lastName: user.lastName || "",
      expiryMinutes: "10",
      year: new Date().getFullYear().toString(),
      email: user.email,
      supportEmail: company?.orgEmail || "support@example.com",
    };

    await AuthService.sendEmailService(
      user.email,
      "Verify Your Account",
      "welcome-verify",
      emailVars,
      company ? getOrgEmailConfig(company) : undefined,
    );
    res.json({ success: true, message: "OTP sent to email" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Verify MFA during login
export const verifyMfaLogin = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email, otp } = req.body;
    // Get organizationId from API key middleware
    const organizationId = (req as any).organizationId;

    if (!email || !otp) {
      badRequestResponse(res, "Email and OTP are required");
      return;
    }

    const company = await AuthService.getCompanyById(organizationId);
    if (!company) {
      badRequestResponse(res, "Organization not found");
      return;
    }

    // Verify OTP
    const user = await User.findOne({
      email,
      companyId: company._id.toString(),
      otp,
      otpExpires: { $gt: new Date() },
    });

    if (!user) {
      badRequestResponse(res, "Invalid or expired OTP");
      return;
    }

    // Fetch location data
    const ipAddress =
      req.ip || req.headers["x-forwarded-for"]?.toString() || "unknown";
    const locationData = await AuthService.fetchLocationFromIP(ipAddress);

    // Update last login and login history
    const loginEntry = {
      loginAt: new Date(),
      ipAddress,
      userAgent: req.headers["user-agent"] || "Unknown",
      location: {
        city: locationData.city,
        country: locationData.country,
      },
      details: locationData.details,
    };

    await User.updateOne(
      { _id: user._id },
      {
        lastLoginAt: loginEntry.loginAt,
        lastLoginIp: loginEntry.ipAddress,
        $push: {
          loginHistory: {
            $each: [loginEntry],
            $slice: -20,
          },
        },
        otp: undefined,
        otpExpires: undefined,
      },
    );

    // Generate token
    const token = AuthService.generateOrgToken(user, company);

    // Token returned in response body - frontend stores in localStorage
    successResponse(
      res,
      {
        token, // Still return token for backward compatibility
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          organizationId: company._id.toString(),
          isVerified: user.isVerified,
          mfaEnabled: user.mfaEnabled,
          lastLoginAt: loginEntry.loginAt,
        },
        orgRedirectionSettings: company.orgRedirectionSettings || [],
      },
      "MFA verification successful",
    );
  } catch (error: any) {
    logger.error("MFA login verify error:", error.message);
    errorResponse(res, error, error.message);
  }
};
