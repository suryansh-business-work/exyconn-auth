/**
 * @exyconn/auth/server - Server-side authentication utilities
 *
 * This module provides Express middleware and utilities for validating
 * authentication tokens on the server side.
 */

// Middleware
export {
  authMiddleware,
  createAuthMiddleware,
  type AuthMiddlewareOptions,
  type AuthenticatedRequest,
  type AuthUser,
} from './middleware';

// Token validation utilities
export {
  validateToken,
  type TokenValidationOptions,
  type TokenValidationResult,
} from './validateToken';

// Types
export type { ServerAuthConfig } from './types';
