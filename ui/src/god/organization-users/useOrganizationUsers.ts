import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "../../apis";
import {
  getRequest,
  putRequest,
  deleteRequest,
  extractData,
  extractPaginatedData,
  parseError,
} from "../../lib/api";
import type { GodUser } from "../../types/god";
import { clientLogger } from "@exyconn/common/client/logger";

interface OrganizationRole {
  name: string;
  displayName?: string;
  description?: string;
  permissions?: string[];
}

export const useOrganizationUsers = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [users, setUsers] = useState<GodUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [organizationName, setOrganizationName] = useState("");
  const [organizationRoles, setOrganizationRoles] = useState<
    OrganizationRole[]
  >([]);

  const fetchOrganizationDetails = async () => {
    try {
      const response = await getRequest(
        `${API_ENDPOINTS.GOD.ORGANIZATIONS}/${id}`,
      );
      const orgData = extractData<{
        orgName: string;
        roles?: OrganizationRole[];
      }>(response);
      setOrganizationName(orgData?.orgName || "");
      setOrganizationRoles(orgData?.roles || []);
    } catch (err) {
      clientLogger.error("Error fetching organization details:", {
        error: err,
      });
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const params: Record<string, string> = {
        page: (page + 1).toString(),
        limit: rowsPerPage.toString(),
      };
      if (searchTerm) params.search = searchTerm;
      if (id) params["filter[organizationId]"] = id;

      const response = await getRequest(API_ENDPOINTS.GOD.USERS, params);

      const paginatedData = extractPaginatedData<GodUser>(response);

      setUsers(paginatedData.items);
      setTotalUsers(paginatedData.total);
      setError(null);
    } catch (err) {
      const parsedError = parseError(err);
      setError(parsedError.message || "Failed to fetch users");
      clientLogger.error("Error fetching users:", { error: err });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchOrganizationDetails();
      fetchUsers();
    }
  }, [id, page, rowsPerPage, searchTerm]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleBack = () => {
    navigate("/god/organizations");
  };

  const handleUpdateUser = async (
    userId: string,
    updates: Partial<GodUser>,
  ) => {
    await putRequest(API_ENDPOINTS.GOD.UPDATE_USER(userId), updates);
    // Refresh the list
    await fetchUsers();
  };

  const handleDeleteUser = async (userId: string) => {
    await deleteRequest(API_ENDPOINTS.GOD.DELETE_USER(userId));
    // Refresh the list
    await fetchUsers();
  };

  const handleBulkDeleteUsers = async (ids: string[]) => {
    await deleteRequest(API_ENDPOINTS.GOD.USERS, { ids });
    // Refresh the list
    await fetchUsers();
  };

  return {
    users,
    loading,
    error,
    searchTerm,
    page,
    rowsPerPage,
    totalUsers,
    organizationName,
    organizationRoles,
    handleChangePage,
    handleChangeRowsPerPage,
    handleSearch,
    handleBack,
    handleUpdateUser,
    handleDeleteUser,
    handleBulkDeleteUsers,
    refreshUsers: fetchUsers,
  };
};
