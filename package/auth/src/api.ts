import type {
  AuthUser,
  AuthRole,
  AuthOrganization,
  ApiResponse,
  UserApiResponseData,
  RoleApiResponseData,
} from './types';

interface FetchOptions {
  baseUrl: string;
  token: string;
  apiKey: string;
  headers?: Record<string, string>;
}

/**
 * Create headers for API requests including auth token and API key
 */
const createHeaders = (
  token: string,
  apiKey: string,
  customHeaders?: Record<string, string>
): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    'X-API-Key': apiKey,
    ...customHeaders,
  };

  return headers;
};

/**
 * User response from fetchUser
 */
export interface FetchUserResponse {
  user: AuthUser;
  organization: AuthOrganization;
}

/**
 * Fetch current user from /v1/api/auth/me
 */
export const fetchUser = async (options: FetchOptions): Promise<FetchUserResponse> => {
  const { baseUrl, token, apiKey, headers } = options;

  const response = await fetch(`${baseUrl}/v1/api/auth/me`, {
    method: 'GET',
    headers: createHeaders(token, apiKey, headers),
    credentials: 'include',
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Authentication failed: Invalid or expired token');
    }
    if (response.status === 403) {
      throw new Error('Authorization failed: Invalid API key or insufficient permissions');
    }
    throw new Error(`Failed to fetch user: ${response.statusText}`);
  }

  const data: ApiResponse<UserApiResponseData> = await response.json();

  if (data.status !== 'success' || !data.data) {
    throw new Error(data.message || data.error || 'Failed to fetch user data');
  }

  return {
    user: data.data.user,
    organization: data.data.organization,
  };
};

/**
 * Fetch current user's role from /v1/api/auth/role
 */
export const fetchRole = async (options: FetchOptions): Promise<AuthRole> => {
  const { baseUrl, token, apiKey, headers } = options;

  const response = await fetch(`${baseUrl}/v1/api/auth/role`, {
    method: 'GET',
    headers: createHeaders(token, apiKey, headers),
    credentials: 'include',
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Authentication failed: Invalid or expired token');
    }
    if (response.status === 403) {
      throw new Error('Authorization failed: Invalid API key or insufficient permissions');
    }
    throw new Error(`Failed to fetch role: ${response.statusText}`);
  }

  const data: ApiResponse<RoleApiResponseData> = await response.json();

  if (data.status !== 'success' || !data.data) {
    throw new Error(data.message || data.error || 'Failed to fetch role data');
  }

  return {
    role: data.data.role,
    roleDetails: data.data.roleDetails,
  };
};

/**
 * Logout user
 */
export const logoutUser = async (options: Partial<FetchOptions>): Promise<void> => {
  const { baseUrl, token, apiKey, headers } = options;

  if (!baseUrl || !token || !apiKey) return;

  try {
    await fetch(`${baseUrl}/v1/api/auth/logout`, {
      method: 'POST',
      headers: createHeaders(token, apiKey, headers),
      credentials: 'include',
    });
  } catch {
    // Silently fail - logout should clear local state regardless
  }
};
