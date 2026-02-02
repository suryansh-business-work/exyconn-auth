// Client-side exports - React hooks and components
// Re-export everything from the main module for client usage

// Provider
export { ExyconnAuthProvider, useExyconnAuth, ExyconnAuthContext } from '../ExyconnAuthProvider';

// Hooks
export {
  useIsAuthenticated,
  useUser,
  useOrganization,
  useRole,
  useRoleSlug,
  useHasRole,
  useHasPermission,
  useHasAnyPermission,
  useHasAllPermissions,
  useAuthLoading,
  useAuthError,
  useLogout,
  useAuthToken,
  useApiKey,
  useAuthUrls,
} from '../hooks';

// Guard Components
export {
  RequireAuth,
  RequireRole,
  RequirePermission,
  RequireAnyPermission,
  RequireAllPermissions,
} from '../components';

// Protected Route Components
export { ProtectedRoute } from './ProtectedRoute';
export type { ProtectedRouteProps } from './ProtectedRoute';

// API functions (for advanced usage)
export { fetchUser, fetchRole, logoutUser } from '../api';

// Types
export type {
  AuthUser,
  AuthOrganization,
  AuthRole,
  AuthRoleDetails,
  AuthPermission,
  AuthState,
  ExyconnAuthConfig,
  ExyconnAuthContextValue,
  ApiResponse,
} from '../types';
