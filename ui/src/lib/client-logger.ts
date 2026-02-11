/**
 * Client Logger - Local implementation replacing @exyconn/common/client/logger
 */

type LogLevel = "debug" | "info" | "warn" | "error";

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

export class ClientLogger {
  private prefix: string;
  private minLevel: number;
  private showTimestamp: boolean;

  constructor(config: { prefix?: string; minLevel?: LogLevel; showTimestamp?: boolean } = {}) {
    this.prefix = config.prefix || "[App]";
    this.minLevel = LOG_LEVELS[config.minLevel || "debug"];
    this.showTimestamp = config.showTimestamp ?? true;
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= this.minLevel;
  }

  private formatMessage(level: LogLevel, message: string): string {
    const parts: string[] = [];
    if (this.showTimestamp) {
      parts.push(`[${new Date().toISOString()}]`);
    }
    parts.push(this.prefix);
    parts.push(`[${level.toUpperCase()}]`);
    parts.push(message);
    return parts.join(" ");
  }

  debug(message: string, ...args: unknown[]): void {
    if (this.shouldLog("debug")) {
      console.debug(this.formatMessage("debug", message), ...args);
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (this.shouldLog("info")) {
      console.info(this.formatMessage("info", message), ...args);
    }
  }

  warn(message: string, ...args: unknown[]): void {
    if (this.shouldLog("warn")) {
      console.warn(this.formatMessage("warn", message), ...args);
    }
  }

  error(message: string, ...args: unknown[]): void {
    if (this.shouldLog("error")) {
      console.error(this.formatMessage("error", message), ...args);
    }
  }
}

export const clientLogger = new ClientLogger({
  prefix: "[ExyconnAuth]",
  minLevel: import.meta.env.PROD ? "warn" : "debug",
  showTimestamp: true,
});
