/**
 * OAuth Provider Interface
 * Simplified - just enabled, clientId, clientSecret
 * Callback URLs are generated automatically by the backend
 */
export interface IOAuthProvider {
  enabled?: boolean;
  clientId?: string;
  clientSecret?: string;
}
