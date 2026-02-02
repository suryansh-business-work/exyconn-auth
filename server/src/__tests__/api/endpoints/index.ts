/**
 * API Endpoints Index
 * Central export for all API endpoint definitions
 */

export * from "./userAuth.apis";

// Convenience re-exports
import { USER_AUTH_ENDPOINTS } from "./userAuth.apis";

export const API = {
  auth: USER_AUTH_ENDPOINTS,
} as const;
