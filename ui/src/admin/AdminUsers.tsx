import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TablePagination,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import { useAdminLogic, AdminUser } from "./useAdminLogic";
import { useAuth } from "../contexts/AuthContext";
import { usePageTitle } from "../lib/hooks";
import ConfirmationDialog from "../components/ConfirmationDialog";
import {
  UsersFilterBar,
  UsersTable,
  UserActionsMenu,
  CreateUserDialog,
  EditUserDialog,
  ResetPasswordDialog,
  useAdminUsersDialogs,
} from "./admin-users";

const AdminUsers: React.FC = () => {
  const navigate = useNavigate();
  const { isUserAuthenticated, user: currentUser } = useAuth();
  const {
    loading,
    users,
    pagination,
    organization,
    roles,
    fetchUsers,
    fetchOrganization,
    fetchRoles,
    createUser,
    updateUser,
    deleteUser,
    resetUserPassword,
    toggleUserVerification,
  } = useAdminLogic();

  const dialogs = useAdminUsersDialogs();

  usePageTitle(`User Management - ${organization?.orgName || "Admin"}`);

  // Filter states
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [verifiedFilter, setVerifiedFilter] = useState("");

  // Menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Operation states
  const [submitting, setSubmitting] = useState(false);
  const [togglingVerification, setTogglingVerification] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!isUserAuthenticated) {
      navigate("/");
      return;
    }
    if (currentUser?.role !== "admin") {
      navigate("/profile");
      return;
    }
  }, [isUserAuthenticated, currentUser, navigate]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchUsers({
      page: 1,
      search: debouncedSearch,
      role: roleFilter,
      verified: verifiedFilter,
    });
    fetchOrganization();
    fetchRoles();
  }, [
    fetchUsers,
    fetchOrganization,
    fetchRoles,
    debouncedSearch,
    roleFilter,
    verifiedFilter,
  ]);

  const refetchUsers = (page = pagination.page) => {
    fetchUsers({
      page,
      search: debouncedSearch,
      role: roleFilter,
      verified: verifiedFilter,
    });
  };

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    user: AdminUser,
  ) => {
    setAnchorEl(event.currentTarget);
    dialogs.setSelectedUser(user);
  };

  const handleMenuClose = () => setAnchorEl(null);

  const handleCreateUser = async () => {
    setSubmitting(true);
    const success = await createUser(dialogs.createForm);
    setSubmitting(false);
    if (success) {
      dialogs.closeCreateDialog();
      refetchUsers(1);
    }
  };

  const handleUpdateUser = async () => {
    if (!dialogs.selectedUser) return;
    setSubmitting(true);
    const success = await updateUser(
      dialogs.selectedUser._id,
      dialogs.editForm,
    );
    setSubmitting(false);
    if (success) {
      dialogs.closeEditDialog();
      refetchUsers();
    }
  };

  const handleResetPassword = async () => {
    if (!dialogs.selectedUser) return;
    setSubmitting(true);
    const success = await resetUserPassword(
      dialogs.selectedUser._id,
      dialogs.newPassword,
    );
    setSubmitting(false);
    if (success) dialogs.closeResetPasswordDialog();
  };

  const handleDeleteUser = async () => {
    if (!dialogs.selectedUser) return;
    setDeleting(true);
    const success = await deleteUser(dialogs.selectedUser._id);
    setDeleting(false);
    if (success) {
      dialogs.closeDeleteDialog();
      refetchUsers();
    }
  };

  const handleToggleVerification = async () => {
    if (!dialogs.selectedUser) return;
    setTogglingVerification(true);
    const success = await toggleUserVerification(dialogs.selectedUser._id);
    setTogglingVerification(false);
    if (success) refetchUsers();
    handleMenuClose();
  };

  return (
    <AdminLayout
      orgName={organization?.orgName}
      orgLogo={organization?.orgLogos?.[0]?.url}
    >
      <Box>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h4" fontWeight={700}>
            User Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={dialogs.openCreateDialog}
          >
            Add User
          </Button>
        </Box>

        <Card>
          <CardContent>
            <UsersFilterBar
              search={search}
              roleFilter={roleFilter}
              verifiedFilter={verifiedFilter}
              onSearchChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearch(e.target.value)
              }
              onRoleFilterChange={(value: string) => setRoleFilter(value)}
              onVerifiedFilterChange={(value: string) =>
                setVerifiedFilter(value)
              }
            />
            <UsersTable
              loading={loading}
              users={users}
              onMenuOpen={handleMenuOpen}
            />
            <TablePagination
              component="div"
              count={pagination.total}
              page={pagination.page - 1}
              onPageChange={(_, p) => refetchUsers(p + 1)}
              rowsPerPage={pagination.limit}
              onRowsPerPageChange={(e) =>
                fetchUsers({
                  page: 1,
                  limit: parseInt(e.target.value, 10),
                  search: debouncedSearch,
                  role: roleFilter,
                  verified: verifiedFilter,
                })
              }
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          </CardContent>
        </Card>

        <UserActionsMenu
          anchorEl={anchorEl}
          selectedUser={dialogs.selectedUser}
          currentUserId={currentUser?.id}
          togglingVerification={togglingVerification}
          onClose={handleMenuClose}
          onEdit={() => {
            if (dialogs.selectedUser)
              dialogs.openEditDialog(dialogs.selectedUser);
            handleMenuClose();
          }}
          onResetPassword={() => {
            dialogs.openResetPasswordDialog();
            handleMenuClose();
          }}
          onToggleVerification={handleToggleVerification}
          onDelete={() => {
            dialogs.openDeleteDialog();
            handleMenuClose();
          }}
        />

        <CreateUserDialog
          open={dialogs.createDialogOpen}
          form={dialogs.createForm}
          submitting={submitting}
          roles={roles}
          onClose={dialogs.closeCreateDialog}
          onFormChange={dialogs.setCreateForm}
          onSubmit={handleCreateUser}
        />

        <EditUserDialog
          open={dialogs.editDialogOpen}
          form={dialogs.editForm}
          selectedUser={dialogs.selectedUser}
          currentUserId={currentUser?.id}
          submitting={submitting}
          roles={roles}
          onClose={dialogs.closeEditDialog}
          onFormChange={dialogs.setEditForm}
          onSubmit={handleUpdateUser}
        />

        <ResetPasswordDialog
          open={dialogs.resetPasswordDialogOpen}
          selectedUser={dialogs.selectedUser}
          newPassword={dialogs.newPassword}
          submitting={submitting}
          onClose={dialogs.closeResetPasswordDialog}
          onPasswordChange={dialogs.setNewPassword}
          onSubmit={handleResetPassword}
        />

        <ConfirmationDialog
          open={dialogs.deleteDialogOpen}
          title="Delete User"
          message={`Are you sure you want to delete ${dialogs.selectedUser?.firstName} ${dialogs.selectedUser?.lastName}? This action cannot be undone.`}
          confirmText="Delete"
          severity="error"
          loading={deleting}
          onConfirm={handleDeleteUser}
          onCancel={dialogs.closeDeleteDialog}
        />
      </Box>
    </AdminLayout>
  );
};

export default AdminUsers;
