/**
 * Organization Redirection Settings Interface
 * Used for post-auth redirection configuration with role-based support
 */

/**
 * Redirection URL with default flag
 */
export interface IRedirectionUrl {
  url?: string; // Redirection URL
  isDefault?: boolean; // Whether this is the default URL for the environment + role combination
}

export interface IOrgRedirectionSetting {
  // Environment Configuration (Column 1)
  env?: "development" | "staging" | "production"; // Environment type
  description?: string; // Optional description
  authPageUrl?: string; // Auth page URL for this environment

  // Role Configuration (Column 2)
  roleSlug?: string; // Role slug - 'any' means all roles, otherwise specific role slug

  // Redirection URLs (Column 3)
  redirectionUrls?: IRedirectionUrl[]; // Array of redirection URLs with default flags
}
