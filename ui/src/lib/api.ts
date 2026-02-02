/**
 * API Client - Global HTTP client using @exyconn/common
 *
 * AUTHENTICATION STRATEGY (LocalStorage Only):
 * - All tokens (authToken, godToken, apiKey) are stored in localStorage
 * - Tokens are sent via headers (Authorization, x-api-key)
 * - User data is also stored in localStorage for UI state
 * - NO cookies are used for authentication
 */

import {
  axios,
  getRequest as _getRequest,
  postRequest as _postRequest,
  putRequest as _putRequest,
  patchRequest as _patchRequest,
  deleteRequest as _deleteRequest,
  uploadFile as _uploadFile,
} from "@exyconn/common/client/http";
import { API_BASE_URL } from "../apis";
import { sessionExpiryEmitter } from "./session-expiry-emitter";

// Storage key constants
export const STORAGE_KEYS = {
  GOD_TOKEN: "godToken",
  AUTH_TOKEN: "authToken",
  API_KEY: "apiKey",
  GOD_USER_DATA: "godUserData",
  USER_DATA: "userData",
} as const;

// Flag to prevent multiple session expiry triggers
let isSessionExpired = false;

// List of public endpoints that don't require auth
const PUBLIC_ENDPOINTS = [
  "/auth/login",
  "/auth/signup",
  "/auth/verify",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/resend-verification-otp",
  "/auth/resend-password-otp",
  "/auth/logout",
  "/auth/apikey-by-domain",
  "/auth/set-api-key",
  "/auth/apikey-to-organization",
  "/auth/google",
  "/auth/google/callback",
  "/auth/google/exchange",
  "/god-management/login",
];

/**
 * Get the API key from localStorage
 */
const getApiKey = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.API_KEY);
};

/**
 * Check if the endpoint is a public endpoint that doesn't require auth
 */
const isPublicEndpoint = (url: string): boolean => {
  return PUBLIC_ENDPOINTS.some((endpoint) => url.includes(endpoint));
};

/**
 * Handle unauthorized responses - Show session expiry modal
 * Uses session expiry emitter to communicate with React context
 */
const handleUnauthorized = (): void => {
  // Prevent multiple triggers
  if (isSessionExpired) {
    return;
  }
  isSessionExpired = true;

  // Emit session expiry event - the modal will handle logout and redirect
  sessionExpiryEmitter.emit();
};

/**
 * Reset session expiry state (called after logout)
 */
export const resetSessionExpiry = (): void => {
  isSessionExpired = false;
  sessionExpiryEmitter.reset();
};

// Configure axios base URL
axios.defaults.baseURL = API_BASE_URL;

/**
 * Check if request is for a God API endpoint
 * Uses both page URL and API endpoint URL to determine context
 */
const isGodContext = (config: any): boolean => {
  const isGodPage = window.location.pathname.startsWith("/god");
  const isGodEndpoint =
    config.url?.includes("/god") || config.url?.includes("/god-management");
  return isGodPage || isGodEndpoint;
};

// Request interceptor to add auth token and API key headers
axios.interceptors.request.use(
  (config) => {
    // Block requests if session is expired (except public endpoints)
    if (
      sessionExpiryEmitter.isApiBlocked() &&
      config.url &&
      !isPublicEndpoint(config.url)
    ) {
      return Promise.reject(new Error("Session expired - API blocked"));
    }

    const isGod = isGodContext(config);

    // Add Authorization header with appropriate token
    if (isGod) {
      const godToken = localStorage.getItem(STORAGE_KEYS.GOD_TOKEN);
      if (godToken) {
        config.headers.Authorization = `Bearer ${godToken}`;
      }
    } else {
      const authToken = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (authToken) {
        config.headers.Authorization = `Bearer ${authToken}`;
      }

      // Add API key header for non-God routes
      const apiKey = getApiKey();
      if (apiKey) {
        config.headers["x-api-key"] = apiKey;
      }
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor to handle unauthorized responses
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || "";
    const status = error.response?.status;
    const message = error.response?.data?.message?.toLowerCase() || "";

    // Check for authentication failures that should trigger session expiry modal
    const isAuthFailure =
      status === 401 || // Unauthorized
      (status === 403 &&
        (message.includes("token") ||
          message.includes("authentication") ||
          message.includes("unauthorized") ||
          message.includes("invalid") ||
          message.includes("expired")));

    if (isAuthFailure && !isPublicEndpoint(url)) {
      handleUnauthorized();
    }

    return Promise.reject(error);
  },
);

/**
 * Re-export HTTP methods from @exyconn/common with base URL configured
 */
export const getRequest = _getRequest;
export const postRequest = _postRequest;
export const putRequest = _putRequest;
export const patchRequest = _patchRequest;
export const deleteRequest = _deleteRequest;
export const uploadFile = _uploadFile;

/**
 * Re-export utilities from @exyconn/common
 */
export {
  extractData,
  extractMessage,
  isSuccess,
  extractPaginatedData,
  parseResponseData,
  parseResponseMessage,
  parseResponseStatus,
  isSuccessResponse,
  isErrorResponse,
  parsePaginatedResponse,
  extractNestedData,
  safeJsonParse,
  parseError,
  parseAxiosErrorMessage,
  axios,
} from "@exyconn/common/client/http";

export type {
  ApiResponse,
  PaginatedResponse,
} from "@exyconn/common/client/http";

// For backward compatibility, export a default api object
export const api = {
  get: getRequest,
  post: postRequest,
  put: putRequest,
  patch: patchRequest,
  delete: deleteRequest,
  upload: uploadFile,
};

export default api;
