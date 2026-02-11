/**
 * Database Configuration - Local implementation
 */

import dotenv from "dotenv";
import { connectDB as connectDBLocal, logger } from "../common";

dotenv.config();

export const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/auth";

// Export connectDB wrapper
export const connectDB = connectDBLocal;

export { logger };

export default connectDB;
