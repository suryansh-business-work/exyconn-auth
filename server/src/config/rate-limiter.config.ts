/**
 * Rate Limiter Configuration - Direct express-rate-limit with IPv6-safe key generator
 */

import rateLimit from "express-rate-limit";
import { ENV } from "./env";

const isDevOrTest = ENV.NODE_ENV === "development" || ENV.NODE_ENV === "test";

/**
 * Standard rate limiter for general API endpoints
 * 100 requests per 15 minutes
 */
export const standardRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: "Too many requests, please try again later.", status: "rate-limit-exceeded", statusCode: 429 },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Strict rate limiter for sensitive endpoints (login, signup, password reset)
 * 20 requests per 15 minutes (200 in dev/test)
 */
export const strictRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDevOrTest ? 200 : 20,
  message: { message: "Too many requests, please try again later.", status: "rate-limit-exceeded", statusCode: 429 },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

/**
 * DDoS protection rate limiter
 * Applied globally to all routes
 * 60 requests per minute
 */
export const ddosProtectionLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { message: "Rate limit exceeded. Please slow down.", status: "rate-limit-exceeded", statusCode: 429 },
  standardHeaders: true,
  legacyHeaders: false,
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
