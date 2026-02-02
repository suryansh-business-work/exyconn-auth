/**
 * Organization Options Interface
 * Used for security and session options
 */
export interface IOrgOptions {
  mfaEnabled?: boolean;
  lastLoginDetails?: boolean;
  passwordPolicy?: {
    minLength?: number;
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    requireNumbers?: boolean;
    requireSpecialChars?: boolean;
    expiryDays?: number;
  };
  sessionTimeout?: number;
  allowedDomains?: string[];
}
