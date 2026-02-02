/**
 * Rate Limiter Configuration - Uses @exyconn/common for production-ready rate limiting
 */

import { createRateLimiter } from "@exyconn/common/server/configs";
import { ENV } from "./env";

const isDevOrTest = ENV.NODE_ENV === "development" || ENV.NODE_ENV === "test";

/**
 * Standard rate limiter for general API endpoints
 * 100 requests per 15 minutes
 */
export const standardRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 100,
  message: "Too many requests, please try again later.",
});

/**
 * Strict rate limiter for sensitive endpoints (login, signup, password reset)
 * 20 requests per 15 minutes (200 in dev/test)
 */
export const strictRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: isDevOrTest ? 200 : 20,
  message: "Too many requests, please try again later.",
  skipSuccessfulRequests: true,
});

/**
 * DDoS protection rate limiter
 * Applied globally to all routes
 * 60 requests per minute
 */
export const ddosProtectionLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 60,
  message: "Rate limit exceeded. Please slow down.",
});

export const RATE_LIMIT_CONFIG = {
  STANDARD: {
    WINDOW_MS: 15 * 60 * 1000,
    MAX_REQUESTS: 100,
    MESSAGE: "Too many requests, please try again later.",
  },
  STRICT: {
    WINDOW_MS: 15 * 60 * 1000,
    MAX_REQUESTS: 20,
    MESSAGE: "Too many requests, please try again later.",
  },
  DDOS: {
    WINDOW_MS: 60 * 1000,
    MAX_REQUESTS: 60,
    MESSAGE: "Rate limit exceeded. Please slow down.",
  },
} as const;

export default {
  standardRateLimiter,
  strictRateLimiter,
  ddosProtectionLimiter,
  RATE_LIMIT_CONFIG,
};
