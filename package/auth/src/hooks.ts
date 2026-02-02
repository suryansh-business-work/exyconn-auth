import { useExyconnAuth } from './ExyconnAuthProvider';
import type { AuthUser, AuthRole, AuthOrganization } from './types';

/**
 * Hook to check if the user is authenticated
 *
 * @returns boolean indicating if user is authenticated
 *
 * @example
 * ```tsx
 * const isAuthenticated = useIsAuthenticated();
 *
 * if (!isAuthenticated) {
 *   return <Navigate to="/login" />;
 * }
 * ```
 */
export const useIsAuthenticated = (): boolean => {
  const { isAuthenticated } = useExyconnAuth();
  return isAuthenticated;
};

/**
 * Hook to get the current user
 *
 * @returns User object or null if not authenticated
 *
 * @example
 * ```tsx
 * const user = useUser();
 *
 * if (user) {
 *   console.log(`Hello, ${user.firstName}!`);
 * }
 * ```
 */
export const useUser = (): AuthUser | null => {
  const { user } = useExyconnAuth();
  return user;
};

/**
 * Hook to get the current organization
 *
 * @returns Organization object or null if not authenticated
 *
 * @example
 * ```tsx
 * const organization = useOrganization();
 *
 * if (organization) {
 *   console.log(`Organization: ${organization.name}`);
 * }
 * ```
 */
export const useOrganization = (): AuthOrganization | null => {
  const { organization } = useExyconnAuth();
  return organization;
};

/**
 * Hook to get the current user's role
 *
 * @returns Role object or null if not authenticated
 *
 * @example
 * ```tsx
 * const role = useRole();
 *
 * if (role?.roleDetails?.slug === 'admin') {
 *   // Show admin features
 * }
 * ```
 */
export const useRole = (): AuthRole | null => {
  const { role } = useExyconnAuth();
  return role;
};

/**
 * Hook to get the user's role slug/name
 *
 * @returns Role slug string or null
 *
 * @example
 * ```tsx
 * const roleSlug = useRoleSlug();
 * console.log(`User role: ${roleSlug}`);
 * ```
 */
export const useRoleSlug = (): string | null => {
  const { role, user } = useExyconnAuth();
  return role?.roleDetails?.slug || role?.role || user?.role || null;
};

/**
 * Hook to check if user has a specific role
 *
 * @param roleSlug - The role slug to check
 * @returns boolean indicating if user has the role
 *
 * @example
 * ```tsx
 * const isAdmin = useHasRole('admin');
 *
 * if (isAdmin) {
 *   // Show admin content
 * }
 * ```
 */
export const useHasRole = (roleSlug: string): boolean => {
  const { hasRole } = useExyconnAuth();
  return hasRole(roleSlug);
};

/**
 * Hook to check if user has a specific permission
 *
 * @param permission - The permission string to check
 * @returns boolean indicating if user has the permission
 *
 * @example
 * ```tsx
 * const canEdit = useHasPermission('posts:edit');
 *
 * if (canEdit) {
 *   // Show edit button
 * }
 * ```
 */
export const useHasPermission = (permission: string): boolean => {
  const { hasPermission } = useExyconnAuth();
  return hasPermission(permission);
};

/**
 * Hook to check if user has any of the specified permissions
 *
 * @param permissions - Array of permission strings to check
 * @returns boolean indicating if user has any of the permissions
 *
 * @example
 * ```tsx
 * const canManage = useHasAnyPermission(['posts:edit', 'posts:delete']);
 * ```
 */
export const useHasAnyPermission = (permissions: string[]): boolean => {
  const { hasPermission } = useExyconnAuth();
  return permissions.some((permission) => hasPermission(permission));
};

/**
 * Hook to check if user has all of the specified permissions
 *
 * @param permissions - Array of permission strings to check
 * @returns boolean indicating if user has all of the permissions
 *
 * @example
 * ```tsx
 * const canFullyManage = useHasAllPermissions(['posts:create', 'posts:edit', 'posts:delete']);
 * ```
 */
export const useHasAllPermissions = (permissions: string[]): boolean => {
  const { hasPermission } = useExyconnAuth();
  return permissions.every((permission) => hasPermission(permission));
};

/**
 * Hook to get the auth loading state
 *
 * @returns boolean indicating if auth is loading
 *
 * @example
 * ```tsx
 * const isLoading = useAuthLoading();
 *
 * if (isLoading) {
 *   return <LoadingSpinner />;
 * }
 * ```
 */
export const useAuthLoading = (): boolean => {
  const { isLoading } = useExyconnAuth();
  return isLoading;
};

/**
 * Hook to get the auth error
 *
 * @returns Error message string or null
 *
 * @example
 * ```tsx
 * const authError = useAuthError();
 *
 * if (authError) {
 *   return <ErrorMessage message={authError} />;
 * }
 * ```
 */
export const useAuthError = (): string | null => {
  const { error } = useExyconnAuth();
  return error;
};

/**
 * Hook to get logout function
 *
 * @returns Logout function
 *
 * @example
 * ```tsx
 * const logout = useLogout();
 *
 * return <Button onClick={logout}>Logout</Button>;
 * ```
 */
export const useLogout = (): (() => void) => {
  const { logout } = useExyconnAuth();
  return logout;
};

/**
 * Hook to get token management functions
 *
 * @returns Object with getToken and setToken functions
 *
 * @example
 * ```tsx
 * const { getToken, setToken } = useAuthToken();
 *
 * // Get current token
 * const token = getToken();
 *
 * // Set new token (triggers re-authentication)
 * setToken(newToken);
 * ```
 */
export const useAuthToken = (): {
  getToken: () => string | null;
  setToken: (token: string | null) => void;
} => {
  const { getAuthToken, setAuthToken } = useExyconnAuth();
  return {
    getToken: getAuthToken,
    setToken: setAuthToken,
  };
};

/**
 * Hook to get API key management functions for multi-tenant authentication
 *
 * @returns Object with getApiKey and setApiKey functions
 *
 * @example
 * ```tsx
 * const { getApiKey, setApiKey } = useApiKey();
 *
 * // Get current API key
 * const apiKey = getApiKey();
 *
 * // Set new API key
 * setApiKey(newApiKey);
 * ```
 */
export const useApiKey = (): {
  getApiKey: () => string | null;
  setApiKey: (apiKey: string | null) => void;
} => {
  const { getApiKey, setApiKey } = useExyconnAuth();
  return {
    getApiKey,
    setApiKey,
  };
};

/**
 * Hook to get auth URLs (logout, profile, login)
 *
 * @returns Object with uiAuthUrl, getLogoutUrl, getProfileUrl, and getLoginUrl
 *
 * @example
 * ```tsx
 * const { getLogoutUrl, getProfileUrl, getLoginUrl, uiAuthUrl } = useAuthUrls();
 *
 * return (
 *   <>
 *     <a href={getLoginUrl(window.location.href)}>Login</a>
 *     <a href={getProfileUrl()}>Profile</a>
 *     <a href={getLogoutUrl()}>Logout</a>
 *   </>
 * );
 * ```
 */
export const useAuthUrls = (): {
  uiAuthUrl: string;
  getLogoutUrl: () => string;
  getProfileUrl: (returnUrl?: string) => string;
  getLoginUrl: (returnUrl?: string) => string;
} => {
  const { uiAuthUrl, getLogoutUrl, getProfileUrl } = useExyconnAuth();

  const getLoginUrl = (returnUrl?: string): string => {
    const baseLoginUrl = `${uiAuthUrl}/login`;
    if (returnUrl) {
      return `${baseLoginUrl}?redirect=${encodeURIComponent(returnUrl)}`;
    }
    return baseLoginUrl;
  };

  const getProfileUrlWithReturn = (returnUrl?: string): string => {
    const baseProfileUrl = getProfileUrl();
    if (returnUrl) {
      return `${baseProfileUrl}?redirect=${encodeURIComponent(returnUrl)}`;
    }
    return baseProfileUrl;
  };

  return {
    uiAuthUrl,
    getLogoutUrl,
    getProfileUrl: getProfileUrlWithReturn,
    getLoginUrl,
  };
};
