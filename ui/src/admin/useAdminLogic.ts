import { useState, useCallback } from "react";
import { API_ENDPOINTS } from "../apis";
import { useSnackbar } from "../contexts/SnackbarContext";
import { useAuth } from "../contexts/AuthContext";
import {
  getRequest,
  postRequest,
  putRequest,
  deleteRequest,
  extractData,
  extractMessage,
  extractPaginatedData,
  isSuccess,
  parseError,
} from "../lib/api";

export interface DashboardStats {
  totalUsers: number;
  verifiedUsers: number;
  unverifiedUsers: number;
  adminUsers: number;
  regularUsers: number;
  recentUsers: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    createdAt: string;
    isVerified: boolean;
  }>;
}

export interface OrganizationRole {
  name: string;
  slug: string;
  description?: string;
  isDefault?: boolean;
  isSystem?: boolean;
  permissions?: Array<{ resource: string; action: string; allowed: boolean }>;
}

export interface OrganizationDetails {
  _id: string;
  orgName: string;
  orgDescription?: string;
  orgLogos?: Array<{ url: string }>;
  orgActiveStatus: boolean;
  roles?: OrganizationRole[];
}

export interface AdminUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isVerified: boolean;
  provider?: string;
  profilePicture?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  role?: string;
  isVerified?: boolean;
}

export const useAdminLogic = () => {
  const { showSnackbar } = useSnackbar();
  const { userLogout, isUserAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [organization, setOrganization] = useState<OrganizationDetails | null>(
    null,
  );
  const [roles, setRoles] = useState<OrganizationRole[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const handleError = useCallback(
    (error: any, defaultMessage: string) => {
      const parsedError = parseError(error);
      if (parsedError.statusCode === 401) {
        showSnackbar("Session expired. Please login again.", "error");
        userLogout();
      } else if (parsedError.statusCode === 403) {
        showSnackbar("Admin access required.", "error");
      } else {
        showSnackbar(parsedError.message || defaultMessage, "error");
      }
    },
    [showSnackbar, userLogout],
  );

  // Fetch dashboard stats
  const fetchDashboardStats = useCallback(async () => {
    if (!isUserAuthenticated) return;
    setLoading(true);
    try {
      const response = await getRequest(API_ENDPOINTS.ADMIN.DASHBOARD);
      if (isSuccess(response)) {
        const data = extractData<DashboardStats>(response);
        if (data) setStats(data);
      }
    } catch (error: any) {
      handleError(error, "Failed to fetch dashboard stats");
    } finally {
      setLoading(false);
    }
  }, [isUserAuthenticated, handleError]);

  // Fetch organization details
  const fetchOrganization = useCallback(async () => {
    if (!isUserAuthenticated) return;
    try {
      const response = await getRequest(API_ENDPOINTS.ADMIN.ORGANIZATION);
      if (isSuccess(response)) {
        const data = extractData<OrganizationDetails>(response);
        if (data) {
          setOrganization(data);
          // Also set roles from organization if available
          if (data.roles) setRoles(data.roles);
        }
      }
    } catch (error: any) {
      handleError(error, "Failed to fetch organization details");
    }
  }, [isUserAuthenticated, handleError]);

  // Fetch organization roles separately
  const fetchRoles = useCallback(async () => {
    if (!isUserAuthenticated) return;
    try {
      const response = await getRequest(API_ENDPOINTS.ADMIN.ORGANIZATION_ROLES);
      if (isSuccess(response)) {
        const data = extractData<OrganizationRole[]>(response);
        if (data) setRoles(data);
      }
    } catch (error: any) {
      handleError(error, "Failed to fetch roles");
    }
  }, [isUserAuthenticated, handleError]);

  // Fetch users with pagination and filters
  const fetchUsers = useCallback(
    async (params?: {
      page?: number;
      limit?: number;
      search?: string;
      role?: string;
      verified?: string;
      sortBy?: string;
      sortOrder?: string;
    }) => {
      if (!isUserAuthenticated) return;
      setLoading(true);
      try {
        const queryParams: Record<string, string> = {};
        if (params?.page) queryParams.page = params.page.toString();
        if (params?.limit) queryParams.limit = params.limit.toString();
        if (params?.search) queryParams.search = params.search;
        if (params?.role) queryParams["filter[role]"] = params.role;
        if (params?.verified) queryParams["filter[verified]"] = params.verified;
        if (params?.sortBy) queryParams["sort[field]"] = params.sortBy;
        if (params?.sortOrder) queryParams["sort[order]"] = params.sortOrder;

        const response = await getRequest(
          API_ENDPOINTS.ADMIN.USERS,
          queryParams,
        );
        if (isSuccess(response)) {
          const paginatedData = extractPaginatedData<AdminUser>(response);
          setUsers(paginatedData.items);
          setPagination({
            page: paginatedData.page || 1,
            limit: paginatedData.limit || 10,
            total: paginatedData.total,
            totalPages: paginatedData.totalPages || 1,
          });
        }
      } catch (error: any) {
        handleError(error, "Failed to fetch users");
      } finally {
        setLoading(false);
      }
    },
    [isUserAuthenticated, handleError],
  );

  // Create new user
  const createUser = useCallback(
    async (userData: CreateUserData): Promise<boolean> => {
      if (!isUserAuthenticated) return false;
      try {
        const response = await postRequest(
          API_ENDPOINTS.ADMIN.CREATE_USER,
          userData,
        );
        if (isSuccess(response)) {
          showSnackbar("User created successfully", "success");
          return true;
        } else {
          const message = extractMessage(response);
          showSnackbar(message || "Failed to create user", "error");
          return false;
        }
      } catch (error: any) {
        handleError(error, "Failed to create user");
        return false;
      }
    },
    [isUserAuthenticated, showSnackbar, handleError],
  );

  // Update user
  const updateUser = useCallback(
    async (userId: string, userData: UpdateUserData): Promise<boolean> => {
      if (!isUserAuthenticated) return false;
      try {
        const response = await putRequest(
          API_ENDPOINTS.ADMIN.UPDATE_USER(userId),
          userData,
        );
        if (isSuccess(response)) {
          showSnackbar("User updated successfully", "success");
          return true;
        } else {
          const message = extractMessage(response);
          showSnackbar(message || "Failed to update user", "error");
          return false;
        }
      } catch (error: any) {
        handleError(error, "Failed to update user");
        return false;
      }
    },
    [isUserAuthenticated, showSnackbar, handleError],
  );

  // Delete user
  const deleteUser = useCallback(
    async (userId: string): Promise<boolean> => {
      if (!isUserAuthenticated) return false;
      try {
        await deleteRequest(API_ENDPOINTS.ADMIN.DELETE_USER(userId));
        showSnackbar("User deleted successfully", "success");
        return true;
      } catch (error: any) {
        handleError(error, "Failed to delete user");
        return false;
      }
    },
    [isUserAuthenticated, showSnackbar, handleError],
  );

  // Bulk delete users
  const bulkDeleteUsers = useCallback(
    async (ids: string[]): Promise<boolean> => {
      if (!isUserAuthenticated) return false;
      try {
        await deleteRequest(API_ENDPOINTS.ADMIN.USERS, { ids });
        showSnackbar(`${ids.length} user(s) deleted successfully`, "success");
        return true;
      } catch (error: any) {
        handleError(error, "Failed to delete users");
        return false;
      }
    },
    [isUserAuthenticated, showSnackbar, handleError],
  );

  // Reset user password
  const resetUserPassword = useCallback(
    async (userId: string, newPassword: string): Promise<boolean> => {
      if (!isUserAuthenticated) return false;
      try {
        const response = await postRequest(
          API_ENDPOINTS.ADMIN.RESET_USER_PASSWORD(userId),
          { newPassword },
        );
        if (isSuccess(response)) {
          showSnackbar("Password reset successfully", "success");
          return true;
        } else {
          const message = extractMessage(response);
          showSnackbar(message || "Failed to reset password", "error");
          return false;
        }
      } catch (error: any) {
        handleError(error, "Failed to reset password");
        return false;
      }
    },
    [isUserAuthenticated, showSnackbar, handleError],
  );

  // Toggle user verification
  const toggleUserVerification = useCallback(
    async (userId: string): Promise<boolean> => {
      if (!isUserAuthenticated) return false;
      try {
        const response = await postRequest(
          API_ENDPOINTS.ADMIN.TOGGLE_VERIFICATION(userId),
          {},
        );
        if (isSuccess(response)) {
          showSnackbar("Verification status updated", "success");
          return true;
        } else {
          const message = extractMessage(response);
          showSnackbar(message || "Failed to update verification", "error");
          return false;
        }
      } catch (error: any) {
        handleError(error, "Failed to update verification");
        return false;
      }
    },
    [isUserAuthenticated, showSnackbar, handleError],
  );

  return {
    loading,
    stats,
    organization,
    roles,
    users,
    pagination,
    fetchDashboardStats,
    fetchOrganization,
    fetchRoles,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    bulkDeleteUsers,
    resetUserPassword,
    toggleUserVerification,
  };
};
