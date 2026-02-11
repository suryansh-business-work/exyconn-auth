import React from "react";
import {
  Container,
  Box,
  Button,
  Pagination,
  alpha,
  Typography,
  Paper,
} from "@mui/material";
import { Add, Dashboard, Business } from "@mui/icons-material";
import { SearchBarWithStats, DeleteDialog } from "../common/components";
import OrganizationsTable from "./organizations-list/OrganizationsTable";
import { useOrganizationsList } from "./organizations-list/useOrganizationsList";
import { usePageTitle } from "../lib/hooks";

const OrganizationsList: React.FC = () => {
  const {
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
    openDeleteDialog,
    closeDeleteDialog,
    handleStatusToggle,
  } = useOrganizationsList();

  usePageTitle("Organizations | God Panel");

  const searchResultsText = debouncedSearch
    ? `Showing results for: "${debouncedSearch}" ${!loading ? `(${organizations.length} found)` : ""}`
    : undefined;

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Clean Header Section */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          bgcolor: "background.paper",
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={2}>
            <Business sx={{ fontSize: 28, color: "primary.main" }} />
            <Box>
              <Typography
                variant="h5"
                component="h1"
                fontWeight={600}
                color="text.primary"
              >
                Organizations
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                Manage all organizations in the system
              </Typography>
            </Box>
          </Box>
          <Box display="flex" gap={1.5}>
            <Button
              variant="outlined"
              startIcon={<Dashboard />}
              onClick={handleDashboardClick}
              size="medium"
              sx={{
                borderRadius: 2,
                px: 2.5,
                py: 1,
                fontWeight: 500,
                textTransform: "none",
                borderColor: alpha("#1976d2", 0.5),
                color: "primary.main",
                "&:hover": {
                  borderColor: "primary.main",
                  bgcolor: alpha("#1976d2", 0.08),
                  transform: "translateY(-1px)",
                },
                transition: "all 0.2s ease",
              }}
            >
              Dashboard
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleCreateClick}
              size="medium"
              sx={{
                borderRadius: 2,
                px: 2.5,
                py: 1,
                fontWeight: 500,
                textTransform: "none",
                boxShadow: "0 2px 8px rgba(25, 118, 210, 0.25)",
                background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
                "&:hover": {
                  boxShadow: "0 4px 12px rgba(25, 118, 210, 0.35)",
                  transform: "translateY(-1px)",
                  background:
                    "linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)",
                },
                transition: "all 0.2s ease",
              }}
            >
              Add Organization
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Search Section */}
      <SearchBarWithStats
        search={search}
        onSearchChange={setSearch}
        totalCount={totalCount}
        loading={loading}
        placeholder="Search by name, email, slug..."
        searchResults={searchResultsText}
      />

      {/* Table Section */}
      <Paper
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          bgcolor: "background.paper",
          overflow: "hidden",
        }}
      >
        <OrganizationsTable
          organizations={organizations}
          loading={loading}
          updatingStatus={updatingStatus}
          debouncedSearch={debouncedSearch}
          onEdit={handleEditClick}
          onDelete={openDeleteDialog}
          onViewUsers={handleViewUsers}
          onViewDashboard={handleViewDashboard}
          onStatusToggle={handleStatusToggle}
          onCreateClick={handleCreateClick}
        />
      </Paper>

      {/* Pagination Section */}
      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
            size="medium"
            showFirstButton
            showLastButton
            sx={{
              "& .MuiPaginationItem-root": {
                borderRadius: 1.5,
              },
            }}
          />
        </Box>
      )}

      <DeleteDialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
        onConfirm={handleDelete}
        title="Delete Organization"
        itemName={selectedOrg?.orgName || ""}
        submitting={submitting}
        warning="This action cannot be undone and will permanently remove all data associated with this organization."
      />
    </Container>
  );
};

export default OrganizationsList;
