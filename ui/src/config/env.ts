/**
 * Environment Configuration
 */

import { isProd } from "../lib/config";
import { clientLogger } from "../lib/client-logger";

// Use environment variable if set, otherwise auto-detect
const getApiBaseUrl = () => {
  // Check if we're in a browser environment
  if (typeof window === "undefined") {
    return "http://localhost:4002/v1/api";
  }

  // In production, always use the production API URL
  if (isProd()) {
    return "https://exyconn-auth-server.exyconn.com/v1/api";
  }

  // In development, use localhost
  return "http://localhost:4002/v1/api";
};

export const ENV = {
  API_BASE_URL: getApiBaseUrl(),
  IS_PRODUCTION: isProd(),
} as const;

clientLogger.info("Environment Config:", {
  hostname: typeof window !== "undefined" ? window.location.hostname : "SSR",
  isProduction: ENV.IS_PRODUCTION,
  API_BASE_URL: ENV.API_BASE_URL,
});

export type EnvConfig = typeof ENV;
