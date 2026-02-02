/**
 * User interface returned from /v1/api/auth/me
 */
export interface AuthUser {
  id: string;
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  profilePicture?: string;
  isVerified?: boolean;
  isEmailVerified?: boolean;
  mfaEnabled?: boolean;
  isMfaEnabled?: boolean;
  provider?: string;
  hasPassword?: boolean;
  createdAt: string;
  updatedAt?: string;
  lastLoginAt?: string;
  lastLoginIp?: string;
  orgSlug?: string;
  [key: string]: unknown; // Allow additional properties
}

/**
 * Organization interface returned from /v1/api/auth/me
 */
export interface AuthOrganization {
  id: string;
  name: string;
  email: string;
  logo?: string;
  website?: string;
  orgOptions?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * Permission interface for role permissions
 */
export interface AuthPermission {
  resource: string;
  action: string;
  allowed: boolean;
}

/**
 * Role details interface returned from /v1/api/auth/role
 */
export interface AuthRoleDetails {
  name: string;
  slug: string;
  description?: string;
  permissions: AuthPermission[];
  isDefault?: boolean;
  isSystem?: boolean;
  showOnSignup?: boolean;
}

/**
 * Role interface (simplified for context)
 */
export interface AuthRole {
  role: string;
  roleDetails: AuthRoleDetails;
}

/**
 * Auth state interface
 */
export interface AuthState {
  user: AuthUser | null;
  organization: AuthOrganization | null;
  role: AuthRole | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

/**
 * Configuration options for ExyconnAuthProvider
 */
export interface ExyconnAuthConfig {
  /**
   * The base URL for the Exyconn Auth API server (REQUIRED)
   */
  apiAuthBaseUrl: string;

  /**
   * The base URL for the Exyconn Auth UI (for logout, profile, etc.) (REQUIRED)
   */
  uiAuthUrl: string;

  /**
   * API key for multi-tenant authentication (REQUIRED)
   */
  apiKey: string;

  /**
   * Custom API key getter function
   * @default () => localStorage.getItem('authApiKey')
   */
  getApiKey?: () => string | null;

  /**
   * Custom API key setter function
   * @default (apiKey) => localStorage.setItem('authApiKey', apiKey)
   */
  setApiKey?: (apiKey: string | null) => void;

  /**
   * Storage key for the API key
   * @default "authApiKey"
   */
  apiKeyStorageKey?: string;

  /**
   * Storage key for the user data
   * @default "authUser"
   */
  userStorageKey?: string;

  /**
   * Storage key for the role data
   * @default "authRole"
   */
  roleStorageKey?: string;

  /**
   * Custom token getter function
   * @default () => localStorage.getItem('authToken')
   */
  getToken?: () => string | null;

  /**
   * Custom token setter function
   * @default (token) => localStorage.setItem('authToken', token)
   */
  setToken?: (token: string | null) => void;

  /**
   * Storage key for the auth token
   * @default "authToken"
   */
  tokenKey?: string;

  /**
   * Whether to auto-fetch user on mount
   * @default true
   */
  autoFetch?: boolean;

  /**
   * Callback when authentication fails
   */
  onAuthError?: (error: Error) => void;

  /**
   * Callback when user is successfully authenticated
   */
  onAuthSuccess?: (user: AuthUser) => void;

  /**
   * Custom headers to include in all requests
   */
  headers?: Record<string, string>;
}

/**
 * Auth context value interface
 */
export interface ExyconnAuthContextValue extends AuthState {
  /**
   * The Auth UI base URL (for logout, profile URLs)
   */
  uiAuthUrl: string;

  /**
   * Get the logout URL
   */
  getLogoutUrl: () => string;

  /**
   * Get the profile URL
   */
  getProfileUrl: () => string;

  /**
   * Refresh user data from the server
   */
  refreshUser: () => Promise<void>;

  /**
   * Refresh role data from the server
   */
  refreshRole: () => Promise<void>;

  /**
   * Logout the current user
   */
  logout: () => void;

  /**
   * Set authentication token
   */
  setAuthToken: (token: string | null) => void;

  /**
   * Get the current auth token
   */
  getAuthToken: () => string | null;

  /**
   * Set API key for multi-tenant authentication
   */
  setApiKey: (apiKey: string | null) => void;

  /**
   * Get the current API key
   */
  getApiKey: () => string | null;

  /**
   * Check if user has a specific permission
   */
  hasPermission: (permission: string) => boolean;

  /**
   * Check if user has a specific role
   */
  hasRole: (roleSlug: string) => boolean;
}

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
  status: string;
  statusCode: number;
  message?: string;
  data?: T;
  error?: string;
}

/**
 * User API response data structure
 */
export interface UserApiResponseData {
  user: AuthUser;
  organization: AuthOrganization;
}

/**
 * Role API response data structure
 */
export interface RoleApiResponseData {
  role: string;
  roleDetails: AuthRoleDetails;
}
