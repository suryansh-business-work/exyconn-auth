import { Request, Response } from "express";
import User from "../auth.model";
import * as AuthService from "../auth.service";
import {
  successResponse,
  badRequestResponse,
  errorResponse,
  logger,
} from "@exyconn/common/server";
import { getOrgEmailConfig } from "./base";

// Grace period in days before permanent deletion
const DELETION_GRACE_PERIOD_DAYS = 15;

/**
 * Request account deletion - sends OTP to user's email
 */
export const requestAccountDeletion = async (req: any, res: Response) => {
  try {
    const userId = req.user.id || req.user.userId;
    const { reason } = req.body;

    // Get user from database
    const user = await User.findById(userId);
    if (!user) {
      return badRequestResponse(res, "User not found");
    }

    // Check if already deleted
    if (user.isDeleted) {
      return badRequestResponse(
        res,
        "Account is already scheduled for deletion",
      );
    }

    // Get organization
    const company = await AuthService.getCompanyById(user.companyId);
    if (!company) {
      return badRequestResponse(res, "Organization not found");
    }

    // Generate OTP for deletion confirmation
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to user
    await User.updateOne(
      { _id: userId },
      {
        deletionOtp: otp,
        deletionOtpExpires: otpExpires,
        deletionReason: reason || "User requested account deletion",
      },
    );

    // Get default logo
    const defaultLogo =
      company.orgLogos?.find((logo: any) => logo.isDefault) ||
      company.orgLogos?.[0];

    // Send deletion OTP email
    await AuthService.sendEmailService(
      user.email,
      "Account Deletion Confirmation",
      "account-deletion-otp",
      {
        otp,
        firstName: user.firstName || "User",
        companyName: company.orgName || "Our Platform",
        logoUrl: defaultLogo?.url || "",
        expiryMinutes: "10",
        gracePeriodDays: DELETION_GRACE_PERIOD_DAYS.toString(),
        year: new Date().getFullYear().toString(),
      },
      getOrgEmailConfig(company),
    );

    logger.info("Deletion OTP sent to:", user.email);

    return successResponse(
      res,
      {
        email: user.email,
        gracePeriodDays: DELETION_GRACE_PERIOD_DAYS,
      },
      "Deletion verification code sent to your email",
    );
  } catch (error: any) {
    logger.error("Request deletion error:", error.message);
    return errorResponse(res, error, error.message);
  }
};

/**
 * Confirm account deletion with OTP - marks account as deleted
 */
export const confirmAccountDeletion = async (req: any, res: Response) => {
  try {
    const userId = req.user.id || req.user.userId;
    const { otp } = req.body;

    if (!otp) {
      return badRequestResponse(res, "OTP is required");
    }

    // Get user from database
    const user = await User.findById(userId);
    if (!user) {
      return badRequestResponse(res, "User not found");
    }

    // Check if already deleted
    if (user.isDeleted) {
      return badRequestResponse(
        res,
        "Account is already scheduled for deletion",
      );
    }

    // Verify OTP
    if (!user.deletionOtp || user.deletionOtp !== otp) {
      return badRequestResponse(res, "Invalid verification code");
    }

    // Check if OTP expired
    if (!user.deletionOtpExpires || new Date() > user.deletionOtpExpires) {
      return badRequestResponse(
        res,
        "Verification code has expired. Please request a new one.",
      );
    }

    // Calculate scheduled deletion date
    const scheduledDeletionDate = new Date();
    scheduledDeletionDate.setDate(
      scheduledDeletionDate.getDate() + DELETION_GRACE_PERIOD_DAYS,
    );

    // Mark user as deleted
    await User.updateOne(
      { _id: userId },
      {
        isDeleted: true,
        deletionRequestedAt: new Date(),
        deletionScheduledAt: scheduledDeletionDate,
        deletionOtp: undefined,
        deletionOtpExpires: undefined,
      },
    );

    // Get organization
    const company = await AuthService.getCompanyById(user.companyId);

    // Send confirmation email to user
    if (company) {
      const defaultLogo =
        company.orgLogos?.find((logo: any) => logo.isDefault) ||
        company.orgLogos?.[0];

      try {
        await AuthService.sendEmailService(
          user.email,
          "Account Deletion Confirmed",
          "account-deletion-confirmed",
          {
            firstName: user.firstName || "User",
            companyName: company.orgName || "Our Platform",
            logoUrl: defaultLogo?.url || "",
            deletionDate: scheduledDeletionDate.toLocaleDateString(),
            gracePeriodDays: DELETION_GRACE_PERIOD_DAYS.toString(),
            year: new Date().getFullYear().toString(),
          },
          getOrgEmailConfig(company),
        );
      } catch (emailError) {
        logger.error("Failed to send deletion confirmation email:", emailError);
      }

      // Notify God admin if setting is enabled
      if (company.notifyOnUserDeletion) {
        try {
          // Get God admin email from organization or use default
          const godAdminEmail = company.orgEmail || process.env.GOD_ADMIN_EMAIL;

          if (godAdminEmail) {
            await AuthService.sendEmailService(
              godAdminEmail,
              `User Self-Deleted: ${user.email}`,
              "user-self-deleted-notification",
              {
                userEmail: user.email,
                userName: `${user.firstName} ${user.lastName}`,
                organizationName: company.orgName || "Your Organization",
                deletionReason: user.deletionReason || "Not specified",
                deletionDate: new Date().toLocaleDateString(),
                scheduledPermanentDeletion:
                  scheduledDeletionDate.toLocaleDateString(),
                year: new Date().getFullYear().toString(),
              },
              getOrgEmailConfig(company),
            );
            logger.info("God admin notified about user deletion:", user.email);
          }
        } catch (notifyError) {
          logger.error("Failed to notify god admin:", notifyError);
        }
      }
    }

    logger.info("Account deletion confirmed for:", user.email);

    return successResponse(
      res,
      {
        deletionScheduledAt: scheduledDeletionDate,
        gracePeriodDays: DELETION_GRACE_PERIOD_DAYS,
      },
      "Your account has been scheduled for deletion. All your data will be permanently deleted in 15 days.",
    );
  } catch (error: any) {
    logger.error("Confirm deletion error:", error.message);
    return errorResponse(res, error, error.message);
  }
};

/**
 * Cancel account deletion (if within grace period)
 */
export const cancelAccountDeletion = async (req: any, res: Response) => {
  try {
    const userId = req.user.id || req.user.userId;

    // Get user from database
    const user = await User.findById(userId);
    if (!user) {
      return badRequestResponse(res, "User not found");
    }

    // Check if account is scheduled for deletion
    if (!user.isDeleted) {
      return badRequestResponse(res, "Account is not scheduled for deletion");
    }

    // Check if still within grace period
    if (user.deletionScheduledAt && new Date() > user.deletionScheduledAt) {
      return badRequestResponse(
        res,
        "Grace period has expired. Account cannot be recovered.",
      );
    }

    // Cancel deletion
    await User.updateOne(
      { _id: userId },
      {
        isDeleted: false,
        deletionRequestedAt: undefined,
        deletionScheduledAt: undefined,
        deletionReason: undefined,
      },
    );

    logger.info("Account deletion cancelled for:", user.email);

    return successResponse(
      res,
      null,
      "Account deletion has been cancelled. Your account is now active.",
    );
  } catch (error: any) {
    logger.error("Cancel deletion error:", error.message);
    return errorResponse(res, error, error.message);
  }
};

/**
 * Get account deletion status
 */
export const getDeletionStatus = async (req: any, res: Response) => {
  try {
    const userId = req.user.id || req.user.userId;

    const user = await User.findById(userId).select(
      "isDeleted deletionRequestedAt deletionScheduledAt deletionReason",
    );
    if (!user) {
      return badRequestResponse(res, "User not found");
    }

    return successResponse(
      res,
      {
        isDeleted: user.isDeleted || false,
        deletionRequestedAt: user.deletionRequestedAt,
        deletionScheduledAt: user.deletionScheduledAt,
        deletionReason: user.deletionReason,
        gracePeriodDays: DELETION_GRACE_PERIOD_DAYS,
      },
      "Deletion status retrieved",
    );
  } catch (error: any) {
    logger.error("Get deletion status error:", error.message);
    return errorResponse(res, error, error.message);
  }
};
