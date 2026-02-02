import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Container,
  IconButton,
  Button,
  Chip,
  alpha,
} from "@mui/material";
import {
  Search as SearchIcon,
  ArrowBack as ArrowBackIcon,
  People,
  BarChart,
} from "@mui/icons-material";
import UsersTable from "./organization-users/UsersTable";
import EditUserDialog from "./organization-users/EditUserDialog";
import DeleteUserDialog from "./organization-users/DeleteUserDialog";
import ViewUserDialog from "./organization-users/ViewUserDialog";
import { useOrganizationUsers } from "./organization-users/useOrganizationUsers";
import { usePageTitle } from "@exyconn/common/client/hooks";
import { useNavigate, useParams } from "react-router-dom";
import type { GodUser } from "../types/god";

const OrganizationUsers: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
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
  } = useOrganizationUsers();

  const [selectedUser, setSelectedUser] = useState<GodUser | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  usePageTitle("Users | God Panel");

  const handleView = (user: GodUser) => {
    setSelectedUser(user);
    setViewDialogOpen(true);
  };

  const handleEdit = (user: GodUser) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  const handleDelete = (user: GodUser) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  if (loading && users.length === 0) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header Section */}
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
            <IconButton
              onClick={handleBack}
              sx={{
                bgcolor: alpha("#1976d2", 0.08),
                "&:hover": { bgcolor: alpha("#1976d2", 0.15) },
              }}
            >
              <ArrowBackIcon color="primary" />
            </IconButton>
            <People sx={{ fontSize: 28, color: "primary.main" }} />
            <Box>
              <Box display="flex" alignItems="center" gap={1.5}>
                <Typography
                  variant="h5"
                  component="h1"
                  fontWeight={600}
                  color="text.primary"
                >
                  Users
                </Typography>
                {totalUsers > 0 && (
                  <Chip
                    label={totalUsers}
                    size="small"
                    color="primary"
                    sx={{ fontWeight: 600, minWidth: 40 }}
                  />
                )}
              </Box>
              {organizationName && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  {organizationName}
                </Typography>
              )}
            </Box>
          </Box>
          <Button
            variant="outlined"
            startIcon={<BarChart />}
            onClick={() => navigate(`/god/organization/${id}/statistics`)}
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
            View Statistics
          </Button>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Search Section */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          bgcolor: "background.paper",
        }}
      >
        <TextField
          fullWidth
          placeholder="Search users by name or email..."
          value={searchTerm}
          onChange={handleSearch}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
            },
          }}
        />
      </Paper>

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
        <UsersTable
          users={users}
          loading={loading}
          totalUsers={totalUsers}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Paper>

      {/* Dialogs */}
      <ViewUserDialog
        open={viewDialogOpen}
        user={selectedUser}
        onClose={() => setViewDialogOpen(false)}
      />
      <EditUserDialog
        open={editDialogOpen}
        user={selectedUser}
        roles={organizationRoles}
        onClose={() => setEditDialogOpen(false)}
        onSave={handleUpdateUser}
      />
      <DeleteUserDialog
        open={deleteDialogOpen}
        user={selectedUser}
        onClose={() => setDeleteDialogOpen(false)}
        onDelete={handleDeleteUser}
      />
    </Container>
  );
};

export default OrganizationUsers;
