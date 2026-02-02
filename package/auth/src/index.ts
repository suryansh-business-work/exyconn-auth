// Provider
export { ExyconnAuthProvider, useExyconnAuth, ExyconnAuthContext } from './ExyconnAuthProvider';

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
} from './hooks';

// Guard Components
export {
  RequireAuth,
  RequireRole,
  RequirePermission,
  RequireAnyPermission,
  RequireAllPermissions,
} from './components';

// Protected Route (from client)
export { ProtectedRoute } from './client/ProtectedRoute';
export type { ProtectedRouteProps } from './client/ProtectedRoute';

// API functions (for advanced usage)
export { fetchUser, fetchRole, logoutUser } from './api';

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
} from './types';
