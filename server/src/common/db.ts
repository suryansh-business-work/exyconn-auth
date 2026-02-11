/**
 * Database Connection - Local implementation replacing @exyconn/common
 */

import mongoose from "mongoose";
import { logger } from "./logger";

export const connectDB = async (
  mongoUri: string,
  options: mongoose.ConnectOptions = {},
  customLogger?: typeof logger,
): Promise<typeof mongoose> => {
  const log = customLogger || logger;

  try {
    const defaultOptions: mongoose.ConnectOptions = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      ...options,
    };

    const connection = await mongoose.connect(mongoUri, defaultOptions);

    log.info(`MongoDB connected: ${connection.connection.host}`);

    mongoose.connection.on("error", (err) => {
      log.error("MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      log.warn("MongoDB disconnected");
    });

    mongoose.connection.on("reconnected", () => {
      log.info("MongoDB reconnected");
    });

    return connection;
  } catch (error: any) {
    log.error(`MongoDB connection failed: ${error.message}`);
    throw error;
  }
};

export const disconnectDB = async (
  customLogger?: typeof logger,
): Promise<void> => {
  const log = customLogger || logger;
  try {
    await mongoose.disconnect();
    log.info("MongoDB disconnected successfully");
  } catch (error: any) {
    log.error(`MongoDB disconnect failed: ${error.message}`);
    throw error;
  }
};

export const getConnectionStatus = (): string => {
  const states: Record<number, string> = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };
  return states[mongoose.connection.readyState] || "unknown";
};
