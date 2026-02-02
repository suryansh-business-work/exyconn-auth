import { Request } from "express";

/**
 * Common function to extract API Key from request header
 */
export const extractApiKey = (req: Request): string | undefined => {
  // Check Header for API key
  const headerKey = req.headers["x-api-key"];
  if (headerKey && typeof headerKey === "string") {
    return headerKey;
  }

  if (Array.isArray(headerKey)) {
    return headerKey[0];
  }

  return undefined;
};
