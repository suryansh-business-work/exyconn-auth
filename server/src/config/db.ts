/**
 * Database Configuration - Re-exports from @exyconn/common
 */

import dotenv from "dotenv";
import { connectDB as connectDBCommon, logger } from "@exyconn/common/server";

dotenv.config();

export const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/auth";

// Export connectDB wrapper
export const connectDB = connectDBCommon;

export { logger };

export default connectDB;
