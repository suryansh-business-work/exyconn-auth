/**
 * Server-side auth configuration
 */
export interface ServerAuthConfig {
  /**
   * Base URL for the Exyconn Auth API server
   * @default "https://exyconn-auth-server.exyconn.com"
   */
  apiAuthBaseUrl?: string;

  /**
   * API key for multi-tenant authentication
   */
  apiKey: string;
}

/**
 * User object returned from token validation
 */
export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  role?: string;
  isVerified?: boolean;
  [key: string]: unknown;
}

/**
 * Token validation response from the auth server
 */
export interface TokenValidationResponse {
  success: boolean;
  data?: {
    user: AuthUser;
  };
  error?: string;
  message?: string;
}
