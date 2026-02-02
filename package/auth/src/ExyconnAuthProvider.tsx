import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { AuthState, ExyconnAuthConfig, ExyconnAuthContextValue } from './types';
import { fetchUser, fetchRole, logoutUser } from './api';

const STORAGE_KEYS = {
  token: 'authToken',
  apiKey: 'authApiKey',
  user: 'authUser',
  organization: 'authOrganization',
  role: 'authRole',
};

// Create context with undefined default
const ExyconnAuthContext = createContext<ExyconnAuthContextValue | undefined>(undefined);

interface ExyconnAuthProviderProps extends ExyconnAuthConfig {
  children: React.ReactNode;
}

/**
 * ExyconnAuthProvider - Provides authentication context for your React application
 * Supports multi-tenant authentication with both auth token and API key
 *
 * @example
 * ```tsx
 * import { ExyconnAuthProvider } from '@exyconn/auth';
 *
 * function App() {
 *   return (
 *     <ExyconnAuthProvider
 *       apiAuthBaseUrl="https://exyconn-auth-server.exyconn.com"
 *       uiAuthUrl="https://auth.exyconn.com"
 *       apiKey="exy_your_api_key"
 *     >
 *       <YourApp />
 *     </ExyconnAuthProvider>
 *   );
 * }
 * ```
 */
export const ExyconnAuthProvider: React.FC<ExyconnAuthProviderProps> = ({
  children,
  apiAuthBaseUrl,
  uiAuthUrl,
  apiKey,
  autoFetch = true,
  onAuthError,
  onAuthSuccess,
  headers,
}) => {
  // Initialize state from localStorage if available
  const getInitialState = (): AuthState => {
    if (typeof window !== 'undefined') {
      try {
        const storedUser = localStorage.getItem(STORAGE_KEYS.user);
        const storedOrg = localStorage.getItem(STORAGE_KEYS.organization);
        const storedRole = localStorage.getItem(STORAGE_KEYS.role);
        const token = localStorage.getItem(STORAGE_KEYS.token);

        if (storedUser && token) {
          return {
            user: JSON.parse(storedUser),
            organization: storedOrg ? JSON.parse(storedOrg) : null,
            role: storedRole ? JSON.parse(storedRole) : null,
            isLoading: autoFetch, // Still loading to verify with server
            isAuthenticated: true,
            error: null,
          };
        }
      } catch {
        // Ignore parse errors
      }
    }
    return {
      user: null,
      organization: null,
      role: null,
      isLoading: autoFetch,
      isAuthenticated: false,
      error: null,
    };
  };

  const [state, setState] = useState<AuthState>(getInitialState);

  // Token management
  const getToken = useCallback((): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEYS.token);
    }
    return null;
  }, []);

  const setToken = useCallback((token: string | null): void => {
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem(STORAGE_KEYS.token, token);
      } else {
        localStorage.removeItem(STORAGE_KEYS.token);
      }
    }
  }, []);

  // API Key management - always use the prop apiKey
  const getApiKey = useCallback((): string => {
    return apiKey;
  }, [apiKey]);

  const setApiKey = useCallback((newApiKey: string | null): void => {
    if (typeof window !== 'undefined' && newApiKey) {
      localStorage.setItem(STORAGE_KEYS.apiKey, newApiKey);
    }
  }, []);

  // Store API key on mount
  useEffect(() => {
    if (apiKey && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.apiKey, apiKey);
    }
  }, [apiKey]);

  // Extract token from URL on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlToken = urlParams.get('token') || urlParams.get('authToken');

      if (urlToken) {
        localStorage.setItem(STORAGE_KEYS.token, urlToken);
        // Clean up URL by removing token parameter
        const url = new URL(window.location.href);
        url.searchParams.delete('token');
        url.searchParams.delete('authToken');
        window.history.replaceState({}, '', url.toString());
      }
    }
  }, []);

  // Refresh user data
  const refreshUser = useCallback(async (): Promise<void> => {
    const token = getToken();

    if (!token) {
      setState((prev) => ({
        ...prev,
        user: null,
        organization: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      }));
      return;
    }

    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const { user, organization } = await fetchUser({
        baseUrl: apiAuthBaseUrl,
        token,
        apiKey,
        headers,
      });

      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
        localStorage.setItem(STORAGE_KEYS.organization, JSON.stringify(organization));
        console.log('[ExyconnAuth] User saved to localStorage:', user);
        console.log('[ExyconnAuth] Organization saved to localStorage:', organization);
      }

      setState((prev) => ({
        ...prev,
        user,
        organization,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      }));

      onAuthSuccess?.(user);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      console.error('[ExyconnAuth] Failed to fetch user:', errorMessage);

      // Clear stored data on error
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEYS.user);
        localStorage.removeItem(STORAGE_KEYS.organization);
      }

      setState((prev) => ({
        ...prev,
        user: null,
        organization: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage,
      }));

      onAuthError?.(error instanceof Error ? error : new Error(errorMessage));
    }
  }, [apiAuthBaseUrl, apiKey, getToken, headers, onAuthError, onAuthSuccess]);

  // Refresh role data
  const refreshRole = useCallback(async (): Promise<void> => {
    const token = getToken();

    if (!token) {
      setState((prev) => ({ ...prev, role: null }));
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEYS.role);
      }
      return;
    }

    try {
      const role = await fetchRole({
        baseUrl: apiAuthBaseUrl,
        token,
        apiKey,
        headers,
      });

      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.role, JSON.stringify(role));
        console.log('[ExyconnAuth] Role saved to localStorage:', role);
      }

      setState((prev) => ({ ...prev, role }));
    } catch (error) {
      console.warn('[ExyconnAuth] Failed to fetch role:', error);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEYS.role);
      }
      setState((prev) => ({ ...prev, role: null }));
    }
  }, [apiAuthBaseUrl, apiKey, getToken, headers]);

  // Logout
  const logout = useCallback((): void => {
    const token = getToken();

    // Clear all auth data from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.token);
      localStorage.removeItem(STORAGE_KEYS.user);
      localStorage.removeItem(STORAGE_KEYS.organization);
      localStorage.removeItem(STORAGE_KEYS.role);
      console.log('[ExyconnAuth] All auth data cleared from localStorage');
    }

    setState({
      user: null,
      organization: null,
      role: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,
    });

    // Call server logout (fire and forget)
    if (token) {
      logoutUser({ baseUrl: apiAuthBaseUrl, token, apiKey, headers });
    }
  }, [apiAuthBaseUrl, apiKey, getToken, headers]);

  // Set auth token
  const setAuthToken = useCallback(
    (token: string | null): void => {
      setToken(token);
      if (token) {
        refreshUser();
        refreshRole();
      } else {
        logout();
      }
    },
    [setToken, refreshUser, refreshRole, logout]
  );

  // Check permission
  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!state.role?.roleDetails?.permissions) return false;
      return state.role.roleDetails.permissions.some(
        (p) => `${p.resource}:${p.action}` === permission && p.allowed
      );
    },
    [state.role]
  );

  // Check role
  const hasRole = useCallback(
    (roleSlug: string): boolean => {
      return state.role?.roleDetails?.slug === roleSlug || state.user?.role === roleSlug;
    },
    [state.role, state.user]
  );

  // URL getters for auth UI
  const getLogoutUrl = useCallback((): string => {
    return `${uiAuthUrl}/logout`;
  }, [uiAuthUrl]);

  const getProfileUrl = useCallback((): string => {
    return `${uiAuthUrl}/profile`;
  }, [uiAuthUrl]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      const token = getToken();
      if (token) {
        console.log('[ExyconnAuth] Auto-fetching user and role data...');
        refreshUser();
        refreshRole();
      } else {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    }
  }, [autoFetch, getToken, refreshUser, refreshRole]);

  // Context value
  const contextValue = useMemo<ExyconnAuthContextValue>(
    () => ({
      ...state,
      uiAuthUrl,
      getLogoutUrl,
      getProfileUrl,
      refreshUser,
      refreshRole,
      logout,
      setAuthToken,
      getAuthToken: getToken,
      setApiKey,
      getApiKey,
      hasPermission,
      hasRole,
    }),
    [
      state,
      uiAuthUrl,
      getLogoutUrl,
      getProfileUrl,
      refreshUser,
      refreshRole,
      logout,
      setAuthToken,
      getToken,
      setApiKey,
      getApiKey,
      hasPermission,
      hasRole,
    ]
  );

  return <ExyconnAuthContext.Provider value={contextValue}>{children}</ExyconnAuthContext.Provider>;
};

/**
 * Hook to access the Exyconn Auth context
 *
 * @throws Error if used outside of ExyconnAuthProvider
 *
 * @example
 * ```tsx
 * const { user, isAuthenticated, logout } = useExyconnAuth();
 * ```
 */
export const useExyconnAuth = (): ExyconnAuthContextValue => {
  const context = useContext(ExyconnAuthContext);

  if (context === undefined) {
    throw new Error('useExyconnAuth must be used within an ExyconnAuthProvider');
  }

  return context;
};

export { ExyconnAuthContext };
