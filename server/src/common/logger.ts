import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";

interface LoggerConfig {
  level?: string;
  logsDir?: string;
  maxSize?: string;
  maxFiles?: string;
  errorMaxFiles?: string;
}

const defaultConfig: Required<LoggerConfig> = {
  level: process.env.LOG_LEVEL || "info",
  logsDir: "logs",
  maxSize: "20m",
  maxFiles: "14d",
  errorMaxFiles: "30d",
};

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "blue",
};

winston.addColors(colors);

const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json(),
);

const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf((info) => {
    const timestamp = info.timestamp;
    const level = info.level;
    const message = info.message;
    const stack = info.stack;
    return `${timestamp} [${level}]: ${message}${stack ? "\n" + stack : ""}`;
  }),
);

export const createLogger = (config: LoggerConfig = {}) => {
  const finalConfig = { ...defaultConfig, ...config };

  const transports: winston.transport[] = [
    new winston.transports.Console({
      format: consoleFormat,
    }),
    new DailyRotateFile({
      filename: path.join(finalConfig.logsDir, "combined-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      maxSize: finalConfig.maxSize,
      maxFiles: finalConfig.maxFiles,
      format: fileFormat,
    }),
    new DailyRotateFile({
      filename: path.join(finalConfig.logsDir, "error-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      level: "error",
      maxSize: finalConfig.maxSize,
      maxFiles: finalConfig.errorMaxFiles,
      format: fileFormat,
    }),
  ];

  return winston.createLogger({
    level: finalConfig.level,
    levels,
    format: fileFormat,
    transports,
    exitOnError: false,
  });
};

export const logger = createLogger();

export const createMorganStream = (loggerInstance: winston.Logger) => ({
  write: (message: string) => {
    loggerInstance.http(message.trim());
  },
});

export const stream = createMorganStream(logger);
