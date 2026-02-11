import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "../../contexts/SnackbarContext";
import { API_ENDPOINTS } from "../../apis";
import {
  getRequest,
  putRequest,
  deleteRequest,
  extractPaginatedData,
  parseError,
} from "../../lib/api";
import { clientLogger } from "../../lib/client-logger";
import type { GodOrganization } from "../../types/god";

export const useOrganizationsList = () => {
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState<GodOrganization[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<GodOrganization | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce search input
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to first page on new search
    }, 500);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [search]);

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {
        page: page.toString(),
        limit: "10",
      };
      if (debouncedSearch) {
        params.search = debouncedSearch;
      }

      const response = await getRequest(
        API_ENDPOINTS.GOD.ORGANIZATIONS,
        params,
      );
      clientLogger.info("Fetch Organizations Response:", response.data);

      const paginatedData = extractPaginatedData<GodOrganization>(response);
      setOrganizations(paginatedData.items);
      setTotalPages(paginatedData.totalPages || 1);
      setTotalCount(paginatedData.total);
    } catch (error) {
      clientLogger.error("Failed to fetch organizations:", error);
      const errorMsg = parseError(error).message;
      showSnackbar(errorMsg || "Failed to fetch organizations", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, [page, debouncedSearch]);

  const handleCreateClick = () => {
    navigate("/god/organization/create");
  };

  const handleDashboardClick = () => {
    navigate("/god/dashboard");
  };

  const handleEditClick = (org: GodOrganization) => {
    navigate(`/god/organization/update/${org._id}`);
  };

  const handleViewUsers = (org: GodOrganization) => {
    navigate(`/god/organization/${org._id}/users`);
  };

  const handleViewDashboard = (org: GodOrganization) => {
    navigate(`/god/organization/${org._id}/statistics`);
  };

  const handleDelete = async () => {
    if (!selectedOrg) return;

    setSubmitting(true);
    try {
      await deleteRequest(
        `${API_ENDPOINTS.GOD.ORGANIZATIONS}/${selectedOrg._id}`,
      );

      showSnackbar("Organization deleted successfully", "success");
      setDeleteDialogOpen(false);
      setSelectedOrg(null);
      fetchOrganizations();
    } catch (error) {
      clientLogger.error("Failed to delete organization:", error);
      const errorMsg = parseError(error).message;
      showSnackbar(errorMsg || "Failed to delete organization", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkDelete = async (ids: string[]) => {
    setSubmitting(true);
    try {
      await deleteRequest(API_ENDPOINTS.GOD.ORGANIZATIONS, { ids });

      showSnackbar(
        `${ids.length} organization(s) deleted successfully`,
        "success",
      );
      fetchOrganizations();
    } catch (error) {
      clientLogger.error("Failed to delete organizations:", error);
      const errorMsg = parseError(error).message;
      showSnackbar(errorMsg || "Failed to delete organizations", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const openDeleteDialog = (org: GodOrganization) => {
    setSelectedOrg(org);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedOrg(null);
  };

  const handleStatusToggle = async (org: GodOrganization) => {
    setUpdatingStatus(org._id);
    try {
      await putRequest(`${API_ENDPOINTS.GOD.ORGANIZATIONS}/${org._id}`, {
        orgActiveStatus: !org.orgActiveStatus,
      });

      showSnackbar("Organization status updated successfully", "success");
      fetchOrganizations();
    } catch (error) {
      clientLogger.error("Failed to update organization status:", error);
      const errorMsg = parseError(error).message;
      showSnackbar(errorMsg || "Failed to update organization status", "error");
    } finally {
      setUpdatingStatus(null);
    }
  };

  return {
    organizations,
    loading,
    page,
    setPage,
    totalPages,
    totalCount,
    search,
    setSearch,
    debouncedSearch,
    deleteDialogOpen,
    selectedOrg,
    submitting,
    updatingStatus,
    handleCreateClick,
    handleDashboardClick,
    handleEditClick,
    handleViewUsers,
    handleViewDashboard,
    handleDelete,
    handleBulkDelete,
    openDeleteDialog,
    closeDeleteDialog,
    handleStatusToggle,
  };
};
