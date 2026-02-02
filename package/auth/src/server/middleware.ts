import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { validateToken } from './validateToken';

/**
 * User object attached to request after authentication
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
 * Express Request with authenticated user
 */
export interface AuthenticatedRequest extends Request {
  user: AuthUser;
}

/**
 * Options for creating auth middleware
 */
export interface AuthMiddlewareOptions {
  /**
   * API key for multi-tenant authentication
   * If not provided, will use process.env.API_KEY
   */
  apiKey?: string;

  /**
   * Base URL for the Exyconn Auth API server
   * @default process.env.AUTH_API_BASE_URL || "https://exyconn-auth-server.exyconn.com"
   */
  apiAuthBaseUrl?: string;

  /**
   * Custom error handler for authentication failures
   */
  onError?: (error: string, req: Request, res: Response) => void;

  /**
   * Whether to allow requests without authorization header to pass through
   * @default false
   */
  optional?: boolean;
}

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

/**
 * Create an auth middleware with custom options
 *
 * @example
 * ```typescript
 * import { createAuthMiddleware } from '@exyconn/auth/server';
 *
 * const authMiddleware = createAuthMiddleware({
 *   apiKey: 'your-api-key',
 *   apiAuthBaseUrl: 'https://your-auth-server.com',
 * });
 *
 * app.get('/protected', authMiddleware, (req, res) => {
 *   res.json({ user: req.user });
 * });
 * ```
 */
export function createAuthMiddleware(options: AuthMiddlewareOptions = {}): RequestHandler {
  const {
    apiKey = process.env.API_KEY,
    apiAuthBaseUrl = process.env.AUTH_API_BASE_URL || 'https://exyconn-auth-server.exyconn.com',
    onError,
    optional = false,
  } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;

      // Check for authorization header
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        if (optional) {
          return next();
        }

        const error = 'Missing or invalid authorization header';
        if (onError) {
          onError(error, req, res);
          return;
        }
        res.status(401).json({ error });
        return;
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix

      // Check API key
      if (!apiKey) {
        console.error('@exyconn/auth/server: API_KEY not configured');
        const error = 'Server configuration error';
        if (onError) {
          onError(error, req, res);
          return;
        }
        res.status(500).json({ error });
        return;
      }

      // Validate token
      const result = await validateToken({
        token,
        apiKey,
        apiAuthBaseUrl,
      });

      if (!result.valid || !result.user) {
        const error = result.error || 'Invalid or expired token';
        if (onError) {
          onError(error, req, res);
          return;
        }
        res.status(401).json({ error });
        return;
      }

      // Attach user to request
      req.user = result.user;
      next();
    } catch (error) {
      console.error('@exyconn/auth/server middleware error:', error);
      const errorMessage = 'Authentication error';
      if (onError) {
        onError(errorMessage, req, res);
        return;
      }
      res.status(500).json({ error: errorMessage });
    }
  };
}

/**
 * Default auth middleware using environment variables
 *
 * Uses:
 * - process.env.API_KEY for the API key
 * - process.env.AUTH_API_BASE_URL for the auth server URL
 *
 * @example
 * ```typescript
 * import { authMiddleware } from '@exyconn/auth/server';
 *
 * // Ensure API_KEY is set in environment
 * app.get('/protected', authMiddleware, (req, res) => {
 *   res.json({ user: req.user });
 * });
 * ```
 */
export const authMiddleware: RequestHandler = createAuthMiddleware();
