/**
 * Redirection Utility
 * Frontend implementation of role-based redirection logic
 */

import { RedirectionSetting, RedirectionUrl } from "../types/organization";

export type { RedirectionSetting, RedirectionUrl };

// Re-export for convenience
export type OrgRedirectionSetting = RedirectionSetting;

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
 * Normalize URL for comparison
 */
const normalizeUrl = (url: string): string => {
  if (!url) return "";
  return url
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");
};

/**
 * Resolve the redirection URL based on role and environment
 *
 * Priority order:
 * 1. Specific Role + Default URL
 * 2. Specific Role (first URL)
 * 3. Any Role + Default URL
 * 4. Any Role (first URL)
 * 5. Fallback to Auth Application Home
 */
export const resolveRedirectionUrl = (
  settings: OrgRedirectionSetting[] | undefined,
  userRole: string,
  authPageUrl: string,
  fallbackUrl: string = "/profile",
): RedirectionResult => {
  if (!settings || settings.length === 0) {
    console.log("🔄 No redirection settings found, using fallback");
    return { url: fallbackUrl, matchType: "fallback" };
  }

  const normalizedAuthUrl = normalizeUrl(authPageUrl);

  // Filter settings that match the current auth page URL
  const matchingSettings = settings.filter(
    (s) => normalizeUrl(s.authPageUrl) === normalizedAuthUrl,
  );

  if (matchingSettings.length === 0) {
    console.log("🔄 No matching auth page URL found, using fallback");
    return { url: fallbackUrl, matchType: "fallback" };
  }

  // 1. Specific Role + Default URL
  const specificRoleSettings = matchingSettings.filter(
    (s) => s.roleSlug === userRole,
  );
  for (const setting of specificRoleSettings) {
    const defaultUrl = setting.redirectionUrls.find((u) => u.isDefault);
    if (defaultUrl) {
      console.log(`🔄 Resolved: Specific Role (${userRole}) + Default URL`);
      return { url: defaultUrl.url, matchType: "specific-role-default" };
    }
  }

  // 2. Specific Role (first URL)
  for (const setting of specificRoleSettings) {
    if (setting.redirectionUrls.length > 0) {
      console.log(`🔄 Resolved: Specific Role (${userRole}) + First URL`);
      return {
        url: setting.redirectionUrls[0].url,
        matchType: "specific-role-first",
      };
    }
  }

  // 3. Any Role + Default URL
  const anyRoleSettings = matchingSettings.filter((s) => s.roleSlug === "any");
  for (const setting of anyRoleSettings) {
    const defaultUrl = setting.redirectionUrls.find((u) => u.isDefault);
    if (defaultUrl) {
      console.log("🔄 Resolved: Any Role + Default URL");
      return { url: defaultUrl.url, matchType: "any-role-default" };
    }
  }

  // 4. Any Role (first URL)
  for (const setting of anyRoleSettings) {
    if (setting.redirectionUrls.length > 0) {
      console.log("🔄 Resolved: Any Role + First URL");
      return {
        url: setting.redirectionUrls[0].url,
        matchType: "any-role-first",
      };
    }
  }

  // 5. Fallback
  console.log("🔄 No matching redirection found, using fallback");
  return { url: fallbackUrl, matchType: "fallback" };
};

/**
 * Append token to URL safely
 */
export const appendTokenToUrl = (
  url: string,
  token: string,
  expiryTimestamp?: number,
): string => {
  if (!url || !token) return url;

  try {
    // Ensure URL has protocol
    const fullUrl = url.startsWith("http") ? url : `https://${url}`;
    const urlObj = new URL(fullUrl);

    // Remove existing token if present
    if (urlObj.searchParams.has("token")) {
      urlObj.searchParams.delete("token");
    }

    // Add encoded token
    urlObj.searchParams.set("token", token);

    // Optionally add expiry timestamp
    if (expiryTimestamp) {
      urlObj.searchParams.set("exp", expiryTimestamp.toString());
    }

    return urlObj.toString();
  } catch {
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
 * Handle post-login redirection
 */
export const handlePostLoginRedirection = (
  settings: OrgRedirectionSetting[] | undefined,
  userRole: string,
  token: string,
  navigate: (path: string) => void,
): void => {
  const currentOrigin = window.location.origin;
  const result = resolveRedirectionUrl(settings, userRole, currentOrigin);

  if (result.matchType === "fallback") {
    // Internal navigation
    navigate(result.url);
  } else {
    // External redirection with token
    const redirectUrl = appendTokenToUrl(result.url, token);
    window.location.href = redirectUrl;
  }
};

/**
 * Get available redirection targets for a user role
 * Used for displaying in header dropdown
 */
export const getAvailableRedirectionTargets = (
  settings: OrgRedirectionSetting[] | undefined,
  userRole: string,
  authPageUrl: string,
): Array<{ url: string; env: string; isDefault: boolean }> => {
  if (!settings || settings.length === 0) return [];

  const normalizedAuthUrl = normalizeUrl(authPageUrl);
  const targets: Array<{ url: string; env: string; isDefault: boolean }> = [];

  // Get settings matching auth URL and role
  const matchingSettings = settings.filter(
    (s) =>
      normalizeUrl(s.authPageUrl) === normalizedAuthUrl &&
      (s.roleSlug === userRole || s.roleSlug === "any"),
  );

  for (const setting of matchingSettings) {
    for (const urlItem of setting.redirectionUrls) {
      targets.push({
        url: urlItem.url,
        env: setting.env,
        isDefault: urlItem.isDefault,
      });
    }
  }

  return targets;
};
