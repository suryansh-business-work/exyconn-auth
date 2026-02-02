/**
 * CORS Configuration - Uses @exyconn/common for production-ready CORS setup
 */

import { createCorsOptions } from "@exyconn/common/server/configs";

// Custom allowed origins for auth service
const productionOrigins = [
  // Production domains
  "https://exyconn.com",
  "https://www.exyconn.com",
  "https://auth.exyconn.com",
  "https://services.exyconn.com",
];

const developmentOrigins = [
  // Development origins
  "http://localhost:4000",
  "http://localhost:4001",
  "http://localhost:4002",
  "http://localhost:4003",
  "http://localhost:4004",
  "http://localhost:4005",
];

// Create CORS options using @exyconn/common with custom settings
export const corsOptions = createCorsOptions({
  productionOrigins: productionOrigins,
  developmentOrigins: developmentOrigins,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
    "X-API-Key",
    "godtoken",
  ],
  credentials: true,
  maxAge: 86400,
});

export default corsOptions;
