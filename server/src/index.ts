import "reflect-metadata";
import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import fileUpload from "express-fileupload";
import {
  createHealthHandler,
  createRootHandler,
  HealthConfig,
} from "./common/health";

// Load environment variables
dotenv.config();

// Import configurations
import { ENV } from "./config/env";
import { connectDB } from "./common/db";
import { logger } from "./common/logger";
import { errorResponse } from "./common/responses";

// Import rate limiting and CORS configurations
import {
  standardRateLimiter,
  ddosProtectionLimiter,
} from "./config/rate-limiter.config";

// Import routes
import userRoutes from "./user/user.routes";
import authRoutes from "./auth/auth.routes";
import adminRoutes from "./admin/admin.routes";
import godUserRoutes from "./god/user/user.routes";
import godOrganizationRoutes from "./god/organization/organization.routes";
import godStatisticsRoutes from "./god/statistics/statistics.routes";
import godSmtpRoutes from "./god/smtp/smtp.routes";
import godTemplatesRoutes from "./god/templates/templates.controller";
import imagekitRoutes from "./file-upload/imagekit-file-upload/imagekit.routes";
import godManagementRoutes from "./god-management/god.routes";
import publicRoutes from "./public/public.routes";

// Initialize Express app
const app: Application = express();

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://suryanshbusinesswork:education54@sibera-box.ofemtir.mongodb.net/dynamic-auth?retryWrites=true&w=majority";

// ==============================================
// PROXY TRUST - Required for proper IP extraction behind proxies (Heroku, Nginx, etc.)
// Must be set BEFORE rate limiters. Use 1 (single proxy hop) instead of true
// to prevent trivial IP-based rate-limit bypass (ERR_ERL_PERMISSIVE_TRUST_PROXY).
// ==============================================
app.set("trust proxy", 1);

// ==============================================
// DDOS PROTECTION & RATE LIMITING
// ==============================================
app.use(ddosProtectionLimiter); // DDoS protection (60 req/min)
app.use("/v1/api", standardRateLimiter); // Standard rate limiting (100 req/15min)

// ==============================================
// CORS CONFIGURATION - Allow all origins with credentials
// ==============================================
app.use(
  cors({
    origin: true, // Allow all origins
    credentials: true, // Allow cookies/credentials
  }),
);

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));

// File upload middleware
app.use(
  fileUpload({
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB max file size
    abortOnLimit: true,
    responseOnLimit: "File size limit exceeded (max 100MB)",
  }),
);

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Dynamic Auth API",
      version: "1.0.0",
      description:
        "Multi-tenant authentication system with role-based access control",
      contact: {
        name: "API Support",
        email: "support@authsystem.com",
      },
    },
    servers: [
      {
        url: `http://localhost:${ENV.PORT}`,
        description: "Development server",
      },
      {
        url: "https://exyconn-auth-server.exyconn.com",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
        apiKeyAuth: {
          type: "apiKey",
          in: "header",
          name: "x-api-key",
          description: "API key for organization authentication",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/swagger/*.ts", "./src/**/*.routes.ts", "./src/**/*.swagger.ts"],
};

// God API Swagger configuration
const godSwaggerOptions = {
  ...swaggerOptions,
  definition: {
    ...swaggerOptions.definition,
    info: {
      title: "God API Documentation",
      version: "1.0.0",
      description:
        "God-level system administration APIs. Requires God authentication (Bearer token).",
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [
    "./src/swagger/god.swagger.ts",
    "./src/swagger/index.ts",
    "./src/god/**/*.routes.ts",
    "./src/god-management/**/*.routes.ts",
  ],
};

// Admin API Swagger configuration
const adminSwaggerOptions = {
  ...swaggerOptions,
  definition: {
    ...swaggerOptions.definition,
    info: {
      title: "Admin API Documentation",
      version: "1.0.0",
      description:
        "Organization Admin APIs. Requires Admin authentication (Bearer token).",
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [
    "./src/swagger/admin.swagger.ts",
    "./src/swagger/index.ts",
    "./src/admin/**/*.routes.ts",
  ],
};

// User API Swagger configuration (Auth + Public APIs - uses API Key)
const userSwaggerOptions = {
  ...swaggerOptions,
  definition: {
    ...swaggerOptions.definition,
    info: {
      title: "User API Documentation",
      version: "1.0.0",
      description:
        "User Authentication and Public APIs. All endpoints require x-api-key header for organization identification.",
    },
    security: [{ apiKeyAuth: [] }],
  },
  apis: [
    "./src/swagger/user.swagger.ts",
    "./src/swagger/public.swagger.ts",
    "./src/swagger/index.ts",
  ],
};

const _swaggerSpec = swaggerJsdoc(swaggerOptions);
const godSwaggerSpec = swaggerJsdoc(godSwaggerOptions);
const adminSwaggerSpec = swaggerJsdoc(adminSwaggerOptions);
const userSwaggerSpec = swaggerJsdoc(userSwaggerOptions);

// ==============================================
// STANDARDIZED HEALTH CHECK CONFIGURATION
// ==============================================
const healthConfig: HealthConfig = {
  name: "exyconn-auth-server",
  version: "1.0.0",
  port: ENV.PORT,
  domain: "exyconn-auth-server.exyconn.com",
  description: "Exyconn Authentication & Authorization Server",
  uiUrl: "https://auth.exyconn.com",
  serverUrl: "https://exyconn-auth-server.exyconn.com",
  criticalPackages: ["express", "mongoose", "jsonwebtoken", "bcrypt"],
  async checkDependencies() {
    // Check MongoDB connection
    const mongoose = await import("mongoose");
    const mongoStatus = mongoose.connection.readyState === 1 ? "UP" : "DOWN";
    return { mongodb: mongoStatus };
  },
};

// Root endpoint
app.get(
  "/",
  createRootHandler({
    ...healthConfig,
    endpoints: {
      health: "/health",
      auth: "/v1/api/auth",
      user: "/v1/api/user",
      admin: "/v1/api/admin",
      god: "/v1/api/god",
      docs: "/api-docs",
    },
  }),
);

// Health check endpoint
app.get("/health", createHealthHandler(healthConfig));

// ==============================================
// API DOCUMENTATION ROUTES
// ==============================================

// God API Documentation
app.use(
  "/god/api-docs",
  swaggerUi.serveFiles(godSwaggerSpec),
  swaggerUi.setup(godSwaggerSpec, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "God API Documentation",
    customfavIcon: "/favicon.ico",
  }),
);

// Admin API Documentation
app.use(
  "/admin/api-docs",
  swaggerUi.serveFiles(adminSwaggerSpec),
  swaggerUi.setup(adminSwaggerSpec, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Admin API Documentation",
  }),
);

// User API Documentation (Auth + Public APIs)
app.use(
  "/user/api-docs",
  swaggerUi.serveFiles(userSwaggerSpec),
  swaggerUi.setup(userSwaggerSpec, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "User API Documentation",
  }),
);

// API Routes
app.use("/v1/api/user", userRoutes);
app.use("/v1/api/auth", authRoutes);
app.use("/v1/api/admin", adminRoutes);
app.use("/v1/api/god/users", godUserRoutes);
app.use("/v1/api/god/organizations", godOrganizationRoutes);
app.use("/v1/api/god/statistics", godStatisticsRoutes);
app.use("/v1/api/god/smtp", godSmtpRoutes);
app.use("/v1/api/god/templates", godTemplatesRoutes);
app.use("/v1/api", imagekitRoutes);
app.use("/v1/api/god-management", godManagementRoutes);
app.use("/v1/api/public", publicRoutes);

// 404 handler - must be after all routes
app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
    path: req.originalUrl,
    statusCode: 404,
  });
});

// Global error handler
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  logger.error("Unhandled error", {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  return errorResponse(res, err, err.message || "Internal server error");
});

// Database connection and server startup
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB(MONGODB_URI);
    logger.info("Database connected successfully");

    // Start server
    const PORT = ENV.PORT;
    app.listen(PORT, () => {
      logger.info(`Server started successfully`, {
        port: PORT,
        environment: ENV.NODE_ENV,
        nodeVersion: process.version,
      });

      logger.info(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║         🚀 Dynamic Auth API Server Started                 ║
║                                                            ║
║         Environment: ${ENV.NODE_ENV.padEnd(39)} ║
║         Port: ${String(PORT).padEnd(46)} ║
║         API Docs: http://localhost:${PORT}/api-docs${" ".repeat(15)} ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error: any) {
    logger.error("Failed to start server", {
      error: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on("uncaughtException", (error: Error) => {
  logger.error("Uncaught Exception", {
    error: error.message,
    stack: error.stack,
  });
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason: any) => {
  logger.error("Unhandled Rejection", {
    reason: reason?.message || reason,
    stack: reason?.stack,
  });
  process.exit(1);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  logger.info("SIGINT received, shutting down gracefully");
  process.exit(0);
});

// Start the server
startServer();

export default app;
