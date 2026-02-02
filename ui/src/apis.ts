import { ENV } from "./config/env";

const API_BASE = ENV.API_BASE_URL;

// Export the base URL for direct use
export const API_BASE_URL = API_BASE;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE}/auth/login`,
    SIGNUP: `${API_BASE}/auth/signup`,
    VERIFY: `${API_BASE}/auth/verify`,
    FORGOT_PASSWORD: `${API_BASE}/auth/forgot-password`,
    RESET_PASSWORD: `${API_BASE}/auth/reset-password`,
    RESEND_VERIFICATION_OTP: `${API_BASE}/auth/resend-verification-otp`,
    RESEND_PASSWORD_OTP: `${API_BASE}/auth/resend-password-otp`,
    PROFILE: `${API_BASE}/auth/profile`,
    ME: `${API_BASE}/auth/me`,
    ROLE: `${API_BASE}/auth/role`,
    RECENT_LOGINS: `${API_BASE}/auth/recent-logins`,
    PASSWORD_CHANGE: `${API_BASE}/auth/password-change`,
    COMPANIES: `${API_BASE}/auth/companies`,
    // API key lookup by domain (Production only)
    API_KEY_BY_DOMAIN: `${API_BASE}/auth/apikey-by-domain`,
    // Common API for org details - works for both local and production (uses API key)
    APIKEY_TO_ORGANIZATION: `${API_BASE}/auth/apikey-to-organization`,
    // Set API key manually (sets cookie) - used for dev/manual selection
    SET_API_KEY: `${API_BASE}/auth/set-api-key`,
    // MFA endpoints
    MFA_ENABLE: `${API_BASE}/auth/mfa/enable`,
    MFA_VERIFY: `${API_BASE}/auth/mfa/verify`,
    MFA_DISABLE: `${API_BASE}/auth/mfa/disable`,
    MFA_LOGIN_VERIFY: `${API_BASE}/auth/mfa/login-verify`,
    // Account deletion endpoints
    REQUEST_DELETION: `${API_BASE}/auth/request-deletion`,
    CONFIRM_DELETION: `${API_BASE}/auth/confirm-deletion`,
    CANCEL_DELETION: `${API_BASE}/auth/cancel-deletion`,
    DELETION_STATUS: `${API_BASE}/auth/deletion-status`,
  },
  ADMIN: {
    DASHBOARD: `${API_BASE}/admin/dashboard`,
    ORGANIZATION: `${API_BASE}/admin/organization`,
    ORGANIZATION_ROLES: `${API_BASE}/admin/organization/roles`,
    USERS: `${API_BASE}/admin/users`,
    USER_BY_ID: (userId: string) => `${API_BASE}/admin/users/${userId}`,
    CREATE_USER: `${API_BASE}/admin/users`,
    UPDATE_USER: (userId: string) => `${API_BASE}/admin/users/${userId}`,
    DELETE_USER: (userId: string) => `${API_BASE}/admin/users/${userId}`,
    RESET_USER_PASSWORD: (userId: string) =>
      `${API_BASE}/admin/users/${userId}/reset-password`,
    TOGGLE_VERIFICATION: (userId: string) =>
      `${API_BASE}/admin/users/${userId}/toggle-verification`,
  },
  GOD: {
    LOGIN: `${API_BASE}/god-management/login`,
    SEND_CREDENTIALS: `${API_BASE}/god-management/send-credentials`,
    ORGANIZATIONS: `${API_BASE}/god/organizations`,
    ORGANIZATION_STATS: `${API_BASE}/god/organizations/stats`,
    USERS: `${API_BASE}/god/users`,
    USER_BY_ID: (userId: string) => `${API_BASE}/god/users/${userId}`,
    UPDATE_USER: (userId: string) => `${API_BASE}/god/users/${userId}`,
    DELETE_USER: (userId: string) => `${API_BASE}/god/users/${userId}`,
    USER_STATISTICS: `${API_BASE}/god/users/statistics`,
    STATISTICS: `${API_BASE}/god/statistics`,
  },
  IMAGEKIT: {
    UPLOAD: `${API_BASE}/imagekit/upload`,
  },
} as const;

export type ApiEndpoints = typeof API_ENDPOINTS;
