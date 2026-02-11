/**
 * CORS Configuration - Direct cors package usage
 */

import { CorsOptions } from "cors";

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

const isProduction = process.env.NODE_ENV === "production";

// Create CORS options
export const corsOptions: CorsOptions = {
  origin: isProduction
    ? (origin, callback) => {
        if (!origin || productionOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      }
    : (origin, callback) => {
        const allOrigins = [...productionOrigins, ...developmentOrigins];
        if (!origin || allOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(null, true); // Allow all in development
        }
      },
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
};

export default corsOptions;
