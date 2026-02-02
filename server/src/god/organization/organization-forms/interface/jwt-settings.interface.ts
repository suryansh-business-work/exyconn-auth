/**
 * JWT Settings Interface
 * Used for JWT token configuration
 */
export interface IJwtSettings {
  algorithm?: "HS256" | "HS384" | "HS512" | "RS256" | "RS384" | "RS512";
  payloadFields?: string[]; // e.g., ['userId', 'userName', 'email', 'profilePicture', 'role']
  tokenSignKey?: string;
}
