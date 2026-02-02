import type { AuthUser, TokenValidationResponse } from './types';

export interface TokenValidationOptions {
  /**
   * The token to validate
   */
  token: string;

  /**
   * API key for multi-tenant authentication
   */
  apiKey: string;

  /**
   * Base URL for the Exyconn Auth API server
   * @default "https://exyconn-auth-server.exyconn.com"
   */
  apiAuthBaseUrl?: string;
}

export interface TokenValidationResult {
  /**
   * Whether the token is valid
   */
  valid: boolean;

  /**
   * The user associated with the token (if valid)
   */
  user?: AuthUser;

  /**
   * Error message (if invalid)
   */
  error?: string;
}

/**
 * Validate a token against the Exyconn Auth API
 *
 * @example
 * ```typescript
 * const result = await validateToken({
 *   token: 'user-token-here',
 *   apiKey: 'your-api-key',
 * });
 *
 * if (result.valid) {
 *   console.log('User:', result.user);
 * } else {
 *   console.error('Invalid token:', result.error);
 * }
 * ```
 */
export async function validateToken(
  options: TokenValidationOptions
): Promise<TokenValidationResult> {
  const { token, apiKey, apiAuthBaseUrl = 'https://exyconn-auth-server.exyconn.com' } = options;

  if (!token) {
    return { valid: false, error: 'No token provided' };
  }

  if (!apiKey) {
    return { valid: false, error: 'No API key configured' };
  }

  try {
    const response = await fetch(`${apiAuthBaseUrl}/token/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      return {
        valid: false,
        error: `Token validation failed: ${response.statusText}`,
      };
    }

    const data: TokenValidationResponse = await response.json();

    if (!data.success || !data.data?.user) {
      return {
        valid: false,
        error: data.error || data.message || 'Token validation failed',
      };
    }

    return {
      valid: true,
      user: data.data.user,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      valid: false,
      error: `Token validation error: ${errorMessage}`,
    };
  }
}
