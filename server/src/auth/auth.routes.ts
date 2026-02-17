import { Router } from "express";
import * as AuthController from "./auth-controllers";
import { authenticateOrgUser } from "../middlewares/user.middleware";
import { authenticateApiKey } from "../middlewares/apikey.middleware";
import { strictRateLimiter } from "../config/rate-limiter.config";

const router = Router();

// All auth endpoints require API key for organization identification
// The API key tells us which organization the user belongs to

// Public auth endpoints - require API key for org identification
// strictRateLimiter: 20 requests per 15 minutes to prevent brute-force attacks
router.post(
  "/login",
  strictRateLimiter,
  authenticateApiKey,
  AuthController.login,
);
router.post(
  "/signup",
  strictRateLimiter,
  authenticateApiKey,
  AuthController.signup,
);
router.post(
  "/verify",
  strictRateLimiter,
  authenticateApiKey,
  AuthController.verifyAccount,
);
router.post(
  "/forgot-password",
  strictRateLimiter,
  authenticateApiKey,
  AuthController.forgotPassword,
);
router.post(
  "/reset-password",
  strictRateLimiter,
  authenticateApiKey,
  AuthController.resetPassword,
);
router.post(
  "/resend-verification-otp",
  strictRateLimiter,
  authenticateApiKey,
  AuthController.resendVerificationOtp,
);
router.post(
  "/resend-password-otp",
  strictRateLimiter,
  authenticateApiKey,
  AuthController.resendPasswordOtp,
);

// Logout endpoint - client clears localStorage
router.post("/logout", AuthController.logout);

// Profile endpoints (protected - API key + user token)
router.get(
  "/profile",
  authenticateApiKey,
  authenticateOrgUser,
  AuthController.getProfile,
);
router.put(
  "/profile",
  authenticateApiKey,
  authenticateOrgUser,
  AuthController.updateProfile,
);
router.put(
  "/profile/picture",
  authenticateApiKey,
  authenticateOrgUser,
  AuthController.updateProfilePicture,
);
router.post(
  "/password-change",
  authenticateApiKey,
  authenticateOrgUser,
  AuthController.changePassword,
);
router.post(
  "/resend-otp",
  authenticateApiKey,
  authenticateOrgUser,
  AuthController.resendOtp,
);

// MFA endpoints (protected - API key + user token)
router.post(
  "/mfa/enable",
  authenticateApiKey,
  authenticateOrgUser,
  AuthController.enableMfa,
);
router.post(
  "/mfa/verify",
  authenticateApiKey,
  authenticateOrgUser,
  AuthController.verifyMfa,
);
router.post(
  "/mfa/disable",
  authenticateApiKey,
  authenticateOrgUser,
  AuthController.disableMfa,
);

// MFA verification during login (API key required)
router.post(
  "/mfa/login-verify",
  authenticateApiKey,
  AuthController.verifyMfaLogin,
);

// OAuth configuration endpoint (API key required)
router.get("/oauth-config", authenticateApiKey, AuthController.getOAuthConfig);

// OAuth diagnostics endpoint - helps debug "Error 401: invalid_client" (API key required)
router.get(
  "/oauth-diagnostics",
  authenticateApiKey,
  AuthController.getOAuthDiagnostics,
);

// Organization-specific Google OAuth routes (API key from state/query)
router.get("/google", AuthController.initiateGoogleOAuth);
router.get("/google/callback", AuthController.handleOrgGoogleCallback);
router.post("/google/exchange", AuthController.exchangeOAuthCode);

// Organization-specific GitHub OAuth routes
router.get("/github", AuthController.initiateGitHubOAuth);
router.get("/github/callback", AuthController.handleGitHubCallback);

// Organization-specific Microsoft OAuth routes
router.get("/microsoft", AuthController.initiateMicrosoftOAuth);
router.get("/microsoft/callback", AuthController.handleMicrosoftCallback);

// Organization-specific Apple OAuth routes
router.get("/apple", AuthController.initiateAppleOAuth);
router.post("/apple/callback", AuthController.handleAppleCallback); // Apple uses POST with form_post

// Companies endpoint (API key required)
router.get("/companies", authenticateApiKey, AuthController.getCompanies);

// Get API key by domain (for dynamic auth)
router.get("/apikey-by-domain", AuthController.getApiKeyByDomain);

// Verify API key (for development/manual selection)
router.post("/set-api-key", AuthController.setManualApiKey);

// Get organization details using API key (used in both local and production)
router.get(
  "/apikey-to-organization",
  authenticateApiKey,
  AuthController.getPublicOrganizationDetailsByApiKey,
);

// User info endpoints (protected - API key + user token)
router.get(
  "/me",
  authenticateApiKey,
  authenticateOrgUser,
  AuthController.getMe,
);
router.get(
  "/role",
  authenticateApiKey,
  authenticateOrgUser,
  AuthController.getRole,
);
router.get(
  "/recent-logins",
  authenticateApiKey,
  authenticateOrgUser,
  AuthController.getRecentLogins,
);

// Account deletion endpoints (protected - API key + user token)
router.post(
  "/request-deletion",
  strictRateLimiter,
  authenticateApiKey,
  authenticateOrgUser,
  AuthController.requestAccountDeletion,
);
router.post(
  "/confirm-deletion",
  strictRateLimiter,
  authenticateApiKey,
  authenticateOrgUser,
  AuthController.confirmAccountDeletion,
);
router.post(
  "/cancel-deletion",
  authenticateApiKey,
  authenticateOrgUser,
  AuthController.cancelAccountDeletion,
);
router.get(
  "/deletion-status",
  authenticateApiKey,
  authenticateOrgUser,
  AuthController.getDeletionStatus,
);

export default router;
