import React from 'react';
import {
  useIsAuthenticated,
  useHasRole,
  useHasPermission,
  useHasAnyPermission,
  useHasAllPermissions,
  useAuthLoading,
} from './hooks';

interface AuthGuardProps {
  /**
   * Content to render when authenticated
   */
  children: React.ReactNode;

  /**
   * Fallback content when not authenticated
   */
  fallback?: React.ReactNode;

  /**
   * Content to render while loading
   */
  loading?: React.ReactNode;
}

/**
 * Component to protect content that requires authentication
 *
 * @example
 * ```tsx
 * <RequireAuth fallback={<LoginPage />}>
 *   <Dashboard />
 * </RequireAuth>
 * ```
 */
export const RequireAuth: React.FC<AuthGuardProps> = ({
  children,
  fallback = null,
  loading = null,
}) => {
  const isAuthenticated = useIsAuthenticated();
  const isLoading = useAuthLoading();

  if (isLoading) {
    return <>{loading}</>;
  }

  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

interface RequireRoleProps extends AuthGuardProps {
  /**
   * Required role slug
   */
  role: string;
}

/**
 * Component to protect content that requires a specific role
 *
 * @example
 * ```tsx
 * <RequireRole role="admin" fallback={<AccessDenied />}>
 *   <AdminPanel />
 * </RequireRole>
 * ```
 */
export const RequireRole: React.FC<RequireRoleProps> = ({
  children,
  role,
  fallback = null,
  loading = null,
}) => {
  const isAuthenticated = useIsAuthenticated();
  const hasRole = useHasRole(role);
  const isLoading = useAuthLoading();

  if (isLoading) {
    return <>{loading}</>;
  }

  if (!isAuthenticated || !hasRole) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

interface RequirePermissionProps extends AuthGuardProps {
  /**
   * Required permission string
   */
  permission: string;
}

/**
 * Component to protect content that requires a specific permission
 *
 * @example
 * ```tsx
 * <RequirePermission permission="posts:edit" fallback={<AccessDenied />}>
 *   <EditPostButton />
 * </RequirePermission>
 * ```
 */
export const RequirePermission: React.FC<RequirePermissionProps> = ({
  children,
  permission,
  fallback = null,
  loading = null,
}) => {
  const isAuthenticated = useIsAuthenticated();
  const hasPermission = useHasPermission(permission);
  const isLoading = useAuthLoading();

  if (isLoading) {
    return <>{loading}</>;
  }

  if (!isAuthenticated || !hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

interface RequireAnyPermissionProps extends AuthGuardProps {
  /**
   * Array of permissions (user needs at least one)
   */
  permissions: string[];
}

/**
 * Component to protect content that requires any of the specified permissions
 *
 * @example
 * ```tsx
 * <RequireAnyPermission permissions={['posts:edit', 'posts:delete']}>
 *   <ManagePostsButton />
 * </RequireAnyPermission>
 * ```
 */
export const RequireAnyPermission: React.FC<RequireAnyPermissionProps> = ({
  children,
  permissions,
  fallback = null,
  loading = null,
}) => {
  const isAuthenticated = useIsAuthenticated();
  const hasAnyPermission = useHasAnyPermission(permissions);
  const isLoading = useAuthLoading();

  if (isLoading) {
    return <>{loading}</>;
  }

  if (!isAuthenticated || !hasAnyPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

interface RequireAllPermissionsProps extends AuthGuardProps {
  /**
   * Array of permissions (user needs all)
   */
  permissions: string[];
}

/**
 * Component to protect content that requires all of the specified permissions
 *
 * @example
 * ```tsx
 * <RequireAllPermissions permissions={['admin:read', 'admin:write']}>
 *   <FullAdminAccess />
 * </RequireAllPermissions>
 * ```
 */
export const RequireAllPermissions: React.FC<RequireAllPermissionsProps> = ({
  children,
  permissions,
  fallback = null,
  loading = null,
}) => {
  const isAuthenticated = useIsAuthenticated();
  const hasAllPermissions = useHasAllPermissions(permissions);
  const isLoading = useAuthLoading();

  if (isLoading) {
    return <>{loading}</>;
  }

  if (!isAuthenticated || !hasAllPermissions) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
