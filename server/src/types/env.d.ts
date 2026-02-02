declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Database
      MONGODB_URI: string;

      // Server
      PORT: string;
      NODE_ENV: "development" | "production" | "test";

      // JWT
      JWT_SECRET: string;
      JWT_EXPIRY: string;

      // Email/SMTP
      SMTP_HOST?: string;
      SMTP_PORT?: string;
      SMTP_SECURE?: string;
      SMTP_USER?: string;
      SMTP_PASS?: string;
      EMAIL_FROM?: string;

      // Email service
      NODEMAILER_HOST?: string;
      NODEMAILER_PORT?: string;
      NODEMAILER_SECURE?: string;
      NODEMAILER_USER?: string;
      NODEMAILER_PASS?: string;

      // OTP
      OTP_EXPIRY_MINUTES?: string;

      // CORS
      CORS_ORIGIN?: string;

      // Rate limiting
      RATE_LIMIT_WINDOW_MS?: string;
      RATE_LIMIT_MAX_REQUESTS?: string;

      // Frontend
      FRONTEND_URL?: string;
    }
  }
}

export {};
