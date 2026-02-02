import React from 'react';
import { useIsAuthenticated, useAuthLoading, useAuthUrls } from '../hooks';

export interface ProtectedRouteProps {
  /**
   * The protected content to render when authenticated
   */
  children: React.ReactNode;

  /**
   * Fallback content to show when not authenticated
   * If not provided, will redirect to login
   */
  fallback?: React.ReactNode;

  /**
   * Loading content to show while checking authentication
   */
  loading?: React.ReactNode;

  /**
   * Whether to automatically redirect to login when not authenticated
   * @default true
   */
  redirectToLogin?: boolean;

  /**
   * Custom redirect URL (instead of auth login URL)
   */
  redirectUrl?: string;

  /**
   * The return URL after login (defaults to current page)
   */
  returnUrl?: string;
}

/**
 * ProtectedRoute - A component wrapper for routes that require authentication
 *
 * @example
 * // Basic usage - redirects to login if not authenticated
 * <ProtectedRoute>
 *   <Dashboard />
 * </ProtectedRoute>
 *
 * @example
 * // With custom fallback
 * <ProtectedRoute fallback={<LoginPage />} redirectToLogin={false}>
 *   <Dashboard />
 * </ProtectedRoute>
 *
 * @example
 * // With custom loading state
 * <ProtectedRoute loading={<Spinner />}>
 *   <Dashboard />
 * </ProtectedRoute>
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  fallback = null,
  loading = null,
  redirectToLogin = true,
  redirectUrl,
  returnUrl,
}) => {
  const isAuthenticated = useIsAuthenticated();
  const isLoading = useAuthLoading();
  const { getLoginUrl } = useAuthUrls();

  // Show loading state while checking auth
  if (isLoading) {
    if (loading) {
      return <>{loading}</>;
    }
    // Default loading spinner
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            border: '3px solid #e5e7eb',
            borderTopColor: '#2563eb',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // If not authenticated
  if (!isAuthenticated) {
    // Redirect to login if enabled
    if (redirectToLogin && typeof window !== 'undefined') {
      const currentUrl = returnUrl || window.location.href;
      const loginUrl = redirectUrl || getLoginUrl(currentUrl);
      window.location.href = loginUrl;
      return null;
    }
    // Otherwise show fallback
    return <>{fallback}</>;
  }

  // User is authenticated, render children
  return <>{children}</>;
};

export default ProtectedRoute;
