/**
 * User Authentication API Endpoints
 * All endpoints require API key header (x-api-key) for organization identification
 */

const API_BASE = "/auth";

export const USER_AUTH_ENDPOINTS = {
  // ========== Public Auth (API Key Required) ==========
  /** POST - User login with email/password */
  LOGIN: `${API_BASE}/login`,

  /** POST - User registration */
  SIGNUP: `${API_BASE}/signup`,

  /** POST - Verify email with OTP */
  VERIFY: `${API_BASE}/verify`,

  /** POST - Request password reset email */
  FORGOT_PASSWORD: `${API_BASE}/forgot-password`,

  /** POST - Reset password with OTP */
  RESET_PASSWORD: `${API_BASE}/reset-password`,

  /** POST - Resend verification OTP */
  RESEND_VERIFICATION_OTP: `${API_BASE}/resend-verification-otp`,

  /** POST - Resend password reset OTP */
  RESEND_PASSWORD_OTP: `${API_BASE}/resend-password-otp`,

  /** POST - Logout (client clears localStorage) */
  LOGOUT: `${API_BASE}/logout`,

  // ========== Protected Profile (API Key + Auth Token) ==========
  /** GET - Get user profile */
  PROFILE_GET: `${API_BASE}/profile`,

  /** PUT - Update user profile */
  PROFILE_UPDATE: `${API_BASE}/profile`,

  /** PUT - Update profile picture */
  PROFILE_PICTURE: `${API_BASE}/profile/picture`,

  /** POST - Change password (authenticated) */
  PASSWORD_CHANGE: `${API_BASE}/password-change`,

  /** GET - Get current user info */
  ME: `${API_BASE}/me`,

  /** GET - Get user role details */
  ROLE: `${API_BASE}/role`,

  /** GET - Get recent login history */
  RECENT_LOGINS: `${API_BASE}/recent-logins`,

  // ========== MFA Endpoints ==========
  /** POST - Enable MFA (returns QR code) */
  MFA_ENABLE: `${API_BASE}/mfa/enable`,

  /** POST - Verify MFA setup */
  MFA_VERIFY: `${API_BASE}/mfa/verify`,

  /** POST - Disable MFA */
  MFA_DISABLE: `${API_BASE}/mfa/disable`,

  /** POST - Verify MFA during login */
  MFA_LOGIN_VERIFY: `${API_BASE}/mfa/login-verify`,

  // ========== API Key / Organization ==========
  /** GET - Get API key by domain (public) */
  APIKEY_BY_DOMAIN: `${API_BASE}/apikey-by-domain`,

  /** GET - Get organization details by API key */
  APIKEY_TO_ORG: `${API_BASE}/apikey-to-organization`,

  /** POST - Verify/set API key (for dev) */
  SET_API_KEY: `${API_BASE}/set-api-key`,

  // ========== OAuth ==========
  /** GET - Initiate Google OAuth */
  GOOGLE_OAUTH: `${API_BASE}/google`,

  /** GET - Google OAuth callback */
  GOOGLE_CALLBACK: `${API_BASE}/google/callback`,

  /** GET - Get OAuth config */
  OAUTH_CONFIG: `${API_BASE}/oauth-config`,

  // ========== Companies ==========
  /** GET - Get companies list */
  COMPANIES: `${API_BASE}/companies`,
} as const;

export type UserAuthEndpoint =
  (typeof USER_AUTH_ENDPOINTS)[keyof typeof USER_AUTH_ENDPOINTS];
