// Unified environment configuration for the server
// All companies use the same database (single shared DB)

export const ENV = {
  // Server Configuration
  PORT: process.env.PORT || 4002,
  NODE_ENV: process.env.NODE_ENV || "development",

  // Database Configuration (Single unified DB for all companies)
  MONGODB_URI:
    process.env.MONGODB_URI || "mongodb://localhost:27017/auth_system",

  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET || "your-super-secret-jwt-key",
  JWT_EXPIRY: process.env.JWT_EXPIRY || "never",

  // Email Configuration (SMTP)
  SMTP_HOST: process.env.SMTP_HOST || "smtp.gmail.com",
  SMTP_PORT: parseInt(process.env.SMTP_PORT || "587"),
  SMTP_SECURE: process.env.SMTP_SECURE === "true",
  SMTP_USER: process.env.SMTP_USER || "suryansh@exyconn.com",
  SMTP_PASS: process.env.SMTP_PASS || "ylip muer ugqn xvym",
  EMAIL_FROM: process.env.EMAIL_FROM || "noreply@authsystem.com",

  // OTP Configuration
  OTP_EXPIRY_MINUTES: parseInt(process.env.OTP_EXPIRY_MINUTES || "10"),
  OTP_LENGTH: 6,

  // CORS Configuration - Multiple allowed origins
  CORS_ORIGIN:
    process.env.CORS_ORIGIN || "http://localhost:4001,https://auth.exyconn.com",

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: parseInt(
    process.env.RATE_LIMIT_MAX_REQUESTS || "100",
  ),

  // Google OAuth (for testing/fallback only)
  GOOGLE_OAUTH_CLIENT_ID: process.env.GOOGLE_OAUTH_CLIENT_ID || "",
  GOOGLE_OAUTH_CLIENT_SECRET: process.env.GOOGLE_OAUTH_CLIENT_SECRET || "",
} as const;

export type ServerEnv = typeof ENV;
