/**
 * Health Check Handlers - Local implementation replacing @exyconn/common
 */

import { Request, Response } from "express";
import os from "os";

export interface HealthConfig {
  name: string;
  version: string;
  port: number | string;
  domain?: string;
  description?: string;
  uiUrl?: string;
  serverUrl?: string;
  criticalPackages?: string[];
  checkDependencies?: () => Promise<Record<string, string>>;
}

interface RootHandlerConfig extends HealthConfig {
  endpoints?: Record<string, string>;
}

const formatUptime = (seconds: number): string => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${secs}s`);
  return parts.join(" ");
};

const getPackageVersions = (packages: string[]): Record<string, string> => {
  const versions: Record<string, string> = {};
  for (const pkg of packages) {
    try {
      const pkgJson = require(`${pkg}/package.json`);
      versions[pkg] = pkgJson.version || "unknown";
    } catch {
      versions[pkg] = "not installed";
    }
  }
  return versions;
};

export const generateHealthResponse = async (config: HealthConfig) => {
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();

  const health: Record<string, unknown> = {
    status: "UP",
    name: config.name,
    version: config.version,
    timestamp: new Date().toISOString(),
    uptime: formatUptime(uptime),
    uptimeSeconds: Math.floor(uptime),
    environment: process.env.NODE_ENV || "development",
    system: {
      platform: os.platform(),
      arch: os.arch(),
      nodeVersion: process.version,
      hostname: os.hostname(),
      cpus: os.cpus().length,
      totalMemory: `${Math.round(os.totalmem() / 1024 / 1024)}MB`,
      freeMemory: `${Math.round(os.freemem() / 1024 / 1024)}MB`,
      loadAverage: os.loadavg(),
    },
    process: {
      pid: process.pid,
      memoryUsage: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
        external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`,
      },
    },
  };

  if (config.criticalPackages?.length) {
    health.packages = getPackageVersions(config.criticalPackages);
  }

  if (config.checkDependencies) {
    try {
      health.dependencies = await config.checkDependencies();
    } catch (error: any) {
      health.dependencies = { error: error.message };
    }
  }

  return health;
};

export const createHealthHandler = (config: HealthConfig) => {
  return async (_req: Request, res: Response) => {
    try {
      const health = await generateHealthResponse(config);
      const statusCode = health.status === "UP" ? 200 : 503;
      res.status(statusCode).json(health);
    } catch (error: any) {
      res.status(503).json({
        status: "DOWN",
        name: config.name,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  };
};

export const createRootHandler = (config: RootHandlerConfig) => {
  return (_req: Request, res: Response) => {
    res.status(200).json({
      name: config.name,
      version: config.version,
      description: config.description || `${config.name} API Server`,
      status: "running",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      urls: {
        ui: config.uiUrl,
        server: config.serverUrl,
        domain: config.domain,
      },
      endpoints: config.endpoints || {},
    });
  };
};
