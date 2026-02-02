/**
 * Redirection Service
 * Handles role-based redirection resolution logic
 */

import {
  IOrgRedirectionSetting,
  IRedirectionUrl,
} from "../god/organization/organization-forms/merged-interface-index";
import { logger } from "@exyconn/common/server";

export interface RedirectionResult {
  url: string;
  matchType:
    | "specific-role-default"
    | "specific-role-first"
    | "any-role-default"
    | "any-role-first"
    | "fallback";
}

/**
 * Resolve the redirection URL based on role and environment
 *
 * Priority order:
 * 1. Specific Role + Default URL
 * 2. Specific Role (first URL)
 * 3. Any Role + Default URL
 * 4. Any Role (first URL)
 * 5. Fallback to Auth Application Home
 *
 * @param settings - Array of redirection settings
 * @param userRole - User's role slug
 * @param authPageUrl - Current auth page URL to match environment
 * @param fallbackUrl - Fallback URL (usually /profile)
 */
export const resolveRedirectionUrl = (
  settings: IOrgRedirectionSetting[] | undefined,
  userRole: string,
  authPageUrl: string,
  fallbackUrl: string = "/profile",
): RedirectionResult => {
  if (!settings || settings.length === 0) {
    logger.info("🔄 No redirection settings found, using fallback");
    return { url: fallbackUrl, matchType: "fallback" };
  }

  // Normalize auth page URL for comparison
  const normalizedAuthUrl = normalizeUrl(authPageUrl);

  // Filter settings that match the current auth page URL
  const matchingSettings = settings.filter(
    (s) => s.authPageUrl && normalizeUrl(s.authPageUrl) === normalizedAuthUrl,
  );

  if (matchingSettings.length === 0) {
    logger.info("🔄 No matching auth page URL found, using fallback");
    return { url: fallbackUrl, matchType: "fallback" };
  }

  // 1. Specific Role + Default URL
  const specificRoleSettings = matchingSettings.filter(
    (s) => s.roleSlug === userRole,
  );
  for (const setting of specificRoleSettings) {
    const redirectionUrls = setting.redirectionUrls || [];
    const defaultUrl = redirectionUrls.find((u) => u.isDefault);
    if (defaultUrl && defaultUrl.url) {
      logger.info(`🔄 Resolved: Specific Role (${userRole}) + Default URL`);
      return { url: defaultUrl.url, matchType: "specific-role-default" };
    }
  }

  // 2. Specific Role (first URL)
  for (const setting of specificRoleSettings) {
    const redirectionUrls = setting.redirectionUrls || [];
    if (redirectionUrls.length > 0 && redirectionUrls[0].url) {
      logger.info(`🔄 Resolved: Specific Role (${userRole}) + First URL`);
      return { url: redirectionUrls[0].url, matchType: "specific-role-first" };
    }
  }

  // 3. Any Role + Default URL
  const anyRoleSettings = matchingSettings.filter((s) => s.roleSlug === "any");
  for (const setting of anyRoleSettings) {
    const redirectionUrls = setting.redirectionUrls || [];
    const defaultUrl = redirectionUrls.find((u) => u.isDefault);
    if (defaultUrl && defaultUrl.url) {
      logger.info("🔄 Resolved: Any Role + Default URL");
      return { url: defaultUrl.url, matchType: "any-role-default" };
    }
  }

  // 4. Any Role (first URL)
  for (const setting of anyRoleSettings) {
    const redirectionUrls = setting.redirectionUrls || [];
    if (redirectionUrls.length > 0 && redirectionUrls[0].url) {
      logger.info("🔄 Resolved: Any Role + First URL");
      return { url: redirectionUrls[0].url, matchType: "any-role-first" };
    }
  }

  // 5. Fallback
  logger.info("🔄 No matching redirection found, using fallback");
  return { url: fallbackUrl, matchType: "fallback" };
};

/**
 * Normalize URL for comparison
 * Removes protocol, trailing slashes, and converts to lowercase
 */
const normalizeUrl = (url: string): string => {
  if (!url) return "";
  return url
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");
};

/**
 * Append token to URL safely
 * Handles existing query params and avoids duplicate token insertion
 */
export const appendTokenToUrl = (
  url: string,
  token: string,
  expiryTimestamp?: number,
): string => {
  if (!url || !token) return url;

  try {
    // Parse the URL
    const urlObj = new URL(url.startsWith("http") ? url : `https://${url}`);

    // Check if token already exists
    if (urlObj.searchParams.has("token")) {
      urlObj.searchParams.delete("token");
    }

    // Add encoded token
    urlObj.searchParams.set("token", encodeURIComponent(token));

    // Optionally add expiry timestamp
    if (expiryTimestamp) {
      urlObj.searchParams.set("exp", expiryTimestamp.toString());
    }

    return urlObj.toString();
  } catch (error) {
    // Fallback for invalid URLs
    const separator = url.includes("?") ? "&" : "?";
    let result = `${url}${separator}token=${encodeURIComponent(token)}`;
    if (expiryTimestamp) {
      result += `&exp=${expiryTimestamp}`;
    }
    return result;
  }
};

/**
 * Validate redirection settings
 * Ensures only one default URL per environment + role combination
 */
export const validateRedirectionSettings = (
  settings: IOrgRedirectionSetting[],
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Group by environment + role
  const groups = new Map<string, IOrgRedirectionSetting[]>();

  for (const setting of settings) {
    const key = `${setting.env || "unknown"}-${setting.roleSlug || "any"}`;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(setting);
  }

  // Check each group
  for (const [key, groupSettings] of groups) {
    let defaultCount = 0;

    for (const setting of groupSettings) {
      const redirectionUrls = setting.redirectionUrls || [];
      for (const url of redirectionUrls) {
        if (url.isDefault) {
          defaultCount++;
        }
      }
    }

    if (defaultCount > 1) {
      errors.push(
        `Multiple default URLs found for ${key}. Only one default URL is allowed per environment + role combination.`,
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Enforce single default URL per environment + role
 * Automatically disables previous defaults when a new default is set
 */
export const enforceSingleDefault = (
  settings: IOrgRedirectionSetting[],
  newDefaultEnv: string,
  newDefaultRole: string,
  newDefaultUrl: string,
): IOrgRedirectionSetting[] => {
  return settings.map((setting) => {
    if (setting.env === newDefaultEnv && setting.roleSlug === newDefaultRole) {
      const redirectionUrls = setting.redirectionUrls || [];
      return {
        ...setting,
        redirectionUrls: redirectionUrls.map((url) => ({
          ...url,
          isDefault: url.url === newDefaultUrl,
        })),
      };
    }
    return setting;
  });
};
