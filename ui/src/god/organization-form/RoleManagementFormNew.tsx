import React, { useState, useCallback } from "react";
import { useFormikContext } from "formik";
import {
  Grid,
  Typography,
  Box,
  Fade,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  Chip,
  Alert,
  Paper,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Card,
  CardContent,
} from "@mui/material";
import {
  Security,
  Add,
  Delete,
  Edit,
  Star,
  Lock,
  Close,
} from "@mui/icons-material";
import ConfirmationDialog from "../../components/ConfirmationDialog";
import { ColorPicker } from "../../components/ColorPicker";
import { OrganizationFormData, Role, RolePermission } from "./types";
import { generateSlug } from "../../utils/slug";

// Predefined permission suggestions
const PERMISSION_SUGGESTIONS = [
  // Dashboard
  { resource: "dashboard", action: "view", label: "Dashboard - View" },

  // Users
  { resource: "users", action: "view", label: "Users - View" },
  { resource: "users", action: "create", label: "Users - Create" },
  { resource: "users", action: "update", label: "Users - Update" },
  { resource: "users", action: "delete", label: "Users - Delete" },

  // Orders
  { resource: "orders", action: "view", label: "Orders - View" },
  { resource: "orders", action: "create", label: "Orders - Create" },
  { resource: "orders", action: "update", label: "Orders - Update" },
  { resource: "orders", action: "delete", label: "Orders - Delete" },

  // Products
  { resource: "products", action: "view", label: "Products - View" },
  { resource: "products", action: "create", label: "Products - Create" },
  { resource: "products", action: "update", label: "Products - Update" },
  { resource: "products", action: "delete", label: "Products - Delete" },

  // Reports
  { resource: "reports", action: "view", label: "Reports - View" },
  { resource: "reports", action: "create", label: "Reports - Create" },
  { resource: "reports", action: "export", label: "Reports - Export" },

  // Settings
  { resource: "settings", action: "view", label: "Settings - View" },
  { resource: "settings", action: "update", label: "Settings - Update" },

  // API
  { resource: "api", action: "access", label: "API - Access" },
  { resource: "api", action: "manage", label: "API - Manage" },

  // Roles
  { resource: "roles", action: "view", label: "Roles - View" },
  { resource: "roles", action: "create", label: "Roles - Create" },
  { resource: "roles", action: "update", label: "Roles - Update" },
  { resource: "roles", action: "delete", label: "Roles - Delete" },
];

// Role colors for visualization
const ROLE_COLORS = [
  "#1976d2",
  "#388e3c",
  "#d32f2f",
  "#7b1fa2",
  "#c2185b",
  "#0288d1",
  "#00796b",
  "#f57c00",
  "#512da8",
  "#303f9f",
  "#0097a7",
  "#689f38",
];

// Get color for permission chip based on resource
const getPermissionColor = (resource: string): string => {
  const colors: Record<string, string> = {
    dashboard: "#2196f3",
    users: "#4caf50",
    orders: "#ff9800",
    products: "#9c27b0",
    reports: "#00bcd4",
    settings: "#607d8b",
    api: "#f44336",
    roles: "#795548",
  };
  return colors[resource] || "#757575";
};

interface RoleFormData {
  name: string;
  slug: string;
  description: string;
  color: string;
  isDefault: boolean;
  isSystem: boolean;
  showOnSignup: boolean;
  permissions: RolePermission[];
}

const RoleManagementForm: React.FC = () => {
  const { values, setFieldValue } = useFormikContext<OrganizationFormData>();

  // Dialog states
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [editingRoleIndex, setEditingRoleIndex] = useState<number | null>(null);
  const [roleFormData, setRoleFormData] = useState<RoleFormData>({
    name: "",
    slug: "",
    description: "",
    color: ROLE_COLORS[0],
    isDefault: false,
    isSystem: false,
    showOnSignup: true,
    permissions: [],
  });

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    index: number | null;
  }>({
    open: false,
    index: null,
  });

  // Custom permission input
  const [customResource, setCustomResource] = useState("");
  const [customAction, setCustomAction] = useState("");

  // Get roles from form values
  const roles = values.roles || [];

  // Handlers
  const handleAddRole = useCallback(() => {
    setEditingRoleIndex(null);
    setRoleFormData({
      name: "",
      slug: "",
      description: "",
      color: ROLE_COLORS[roles.length % ROLE_COLORS.length],
      isDefault: false,
      isSystem: false,
      showOnSignup: true,
      permissions: [],
    });
    setIsRoleDialogOpen(true);
  }, [roles.length]);

  const handleEditRole = useCallback(
    (index: number) => {
      const role = roles[index];
      setEditingRoleIndex(index);
      setRoleFormData({
        name: role.name,
        slug: role.slug,
        description: role.description || "",
        color: (role as any).color || ROLE_COLORS[index % ROLE_COLORS.length],
        isDefault: role.isDefault || false,
        isSystem: role.isSystem || false,
        showOnSignup: role.showOnSignup !== false,
        permissions: role.permissions || [],
      });
      setIsRoleDialogOpen(true);
    },
    [roles],
  );

  const handleSaveRole = useCallback(() => {
    const newRole: Role & { color?: string } = {
      name: roleFormData.name,
      slug: roleFormData.slug,
      description: roleFormData.description,
      isDefault: roleFormData.isDefault,
      isSystem: roleFormData.isSystem,
      showOnSignup: roleFormData.showOnSignup,
      permissions: roleFormData.permissions,
      color: roleFormData.color,
    };

    if (editingRoleIndex !== null) {
      // Update existing role
      const updatedRoles = [...roles];
      updatedRoles[editingRoleIndex] = newRole;

      // If setting as default, unset others
      if (newRole.isDefault) {
        updatedRoles.forEach((r, idx) => {
          if (idx !== editingRoleIndex) {
            r.isDefault = false;
          }
        });
      }

      setFieldValue("roles", updatedRoles);
    } else {
      // Add new role
      const updatedRoles = [...roles];

      // If setting as default, unset others
      if (newRole.isDefault) {
        updatedRoles.forEach((r) => {
          r.isDefault = false;
        });
      }

      updatedRoles.push(newRole);
      setFieldValue("roles", updatedRoles);
    }

    setIsRoleDialogOpen(false);
    setRoleFormData({
      name: "",
      slug: "",
      description: "",
      color: ROLE_COLORS[0],
      isDefault: false,
      isSystem: false,
      showOnSignup: true,
      permissions: [],
    });
  }, [roleFormData, editingRoleIndex, roles, setFieldValue]);

  const handleDeleteClick = useCallback((index: number) => {
    setDeleteDialog({ open: true, index });
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (deleteDialog.index !== null) {
      const updatedRoles = roles.filter((_, idx) => idx !== deleteDialog.index);
      setFieldValue("roles", updatedRoles);
    }
    setDeleteDialog({ open: false, index: null });
  }, [deleteDialog.index, roles, setFieldValue]);

  // Permission handlers
  const handleAddPermission = useCallback(
    (suggestion: (typeof PERMISSION_SUGGESTIONS)[0]) => {
      const exists = roleFormData.permissions.some(
        (p) =>
          p.resource === suggestion.resource && p.action === suggestion.action,
      );

      if (!exists) {
        setRoleFormData({
          ...roleFormData,
          permissions: [
            ...roleFormData.permissions,
            {
              resource: suggestion.resource,
              action: suggestion.action,
              allowed: true,
            },
          ],
        });
      }
    },
    [roleFormData],
  );

  const handleAddCustomPermission = useCallback(() => {
    if (!customResource.trim() || !customAction.trim()) return;

    const resource = customResource.toLowerCase().trim();
    const action = customAction.toLowerCase().trim();

    const exists = roleFormData.permissions.some(
      (p) => p.resource === resource && p.action === action,
    );

    if (!exists) {
      setRoleFormData({
        ...roleFormData,
        permissions: [
          ...roleFormData.permissions,
          { resource, action, allowed: true },
        ],
      });
      setCustomResource("");
      setCustomAction("");
    }
  }, [customResource, customAction, roleFormData]);

  const handleRemovePermission = useCallback(
    (resource: string, action: string) => {
      setRoleFormData({
        ...roleFormData,
        permissions: roleFormData.permissions.filter(
          (p) => !(p.resource === resource && p.action === action),
        ),
      });
    },
    [roleFormData],
  );

  const handleTogglePermissionAllowed = useCallback(
    (resource: string, action: string) => {
      setRoleFormData({
        ...roleFormData,
        permissions: roleFormData.permissions.map((p) =>
          p.resource === resource && p.action === action
            ? { ...p, allowed: !p.allowed }
            : p,
        ),
      });
    },
    [roleFormData],
  );

  // Get available suggestions (not already added)
  const availableSuggestions = PERMISSION_SUGGESTIONS.filter(
    (s) =>
      !roleFormData.permissions.some(
        (p) => p.resource === s.resource && p.action === s.action,
      ),
  );

  return (
    <Fade in timeout={300}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            mb={1}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <Security color="primary" />
              <Typography variant="h6">Role Management</Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddRole}
              size="small"
            >
              Create Role
            </Button>
          </Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Create and manage roles with custom permissions. Add permission
            chips to define what each role can access.
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Permission Format:</strong> Each permission consists of a{" "}
              <strong>Resource</strong> (e.g., users, orders) and an{" "}
              <strong>Action</strong> (e.g., view, create, update, delete).
              Click on a permission chip to toggle allow/deny.
            </Typography>
          </Alert>
          {roles.length > 0 && !roles.some((r) => r.isDefault) && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>⚠️ No default role set:</strong> Please enable "Default
                Role" for one role. New users will be assigned this role
                automatically.
              </Typography>
            </Alert>
          )}
          {roles.filter((r) => r.showOnSignup !== false).length < 2 &&
            roles.length >= 2 && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>⚠️ Minimum 2 roles required:</strong> At least 2 roles
                  must have "Show on Signup" enabled to display the role
                  selector on the signup page.
                </Typography>
              </Alert>
            )}
        </Grid>

        {/* Roles List */}
        <Grid item xs={12}>
          {roles.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: "center" }}>
              <Security sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Roles Defined
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Create your first role to define user access levels and
                permissions.
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleAddRole}
              >
                Create First Role
              </Button>
            </Paper>
          ) : (
            <Stack spacing={2}>
              {roles.map((role, index) => (
                <Card
                  key={index}
                  variant="outlined"
                  sx={{
                    borderLeft: `4px solid ${(role as any).color || ROLE_COLORS[index % ROLE_COLORS.length]}`,
                  }}
                >
                  <CardContent>
                    <Box
                      display="flex"
                      alignItems="flex-start"
                      justifyContent="space-between"
                    >
                      <Box>
                        <Box
                          display="flex"
                          alignItems="center"
                          gap={1}
                          mb={0.5}
                        >
                          <Typography variant="h6" component="div">
                            {role.name || "Untitled Role"}
                          </Typography>
                          {role.isDefault && (
                            <Chip
                              icon={
                                <Star sx={{ fontSize: "14px !important" }} />
                              }
                              label="Default"
                              size="small"
                              color="success"
                            />
                          )}
                          {role.isSystem && (
                            <Chip
                              icon={
                                <Lock sx={{ fontSize: "14px !important" }} />
                              }
                              label="System"
                              size="small"
                              color="warning"
                            />
                          )}
                        </Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          gutterBottom
                        >
                          {role.description || "No description"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Slug: <code>{role.slug}</code>
                        </Typography>
                      </Box>
                      <Box>
                        <Tooltip title="Edit Role">
                          <IconButton
                            size="small"
                            onClick={() => handleEditRole(index)}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Role">
                          <span>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteClick(index)}
                              disabled={role.isSystem}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Box>
                    </Box>

                    {/* Permissions Display */}
                    <Box mt={2}>
                      <Typography variant="subtitle2" gutterBottom>
                        Permissions ({role.permissions?.length || 0})
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={0.5}>
                        {(role.permissions || []).length === 0 ? (
                          <Typography variant="body2" color="text.secondary">
                            No permissions assigned
                          </Typography>
                        ) : (
                          (role.permissions || []).map((perm, permIdx) => (
                            <Chip
                              key={permIdx}
                              label={`${perm.resource}.${perm.action}`}
                              size="small"
                              sx={{
                                bgcolor: perm.allowed
                                  ? `${getPermissionColor(perm.resource)}20`
                                  : "#ffebee",
                                color: perm.allowed
                                  ? getPermissionColor(perm.resource)
                                  : "#c62828",
                                borderColor: perm.allowed
                                  ? getPermissionColor(perm.resource)
                                  : "#f44336",
                                border: "1px solid",
                                fontWeight: 500,
                                fontSize: "0.75rem",
                              }}
                            />
                          ))
                        )}
                      </Box>
                    </Box>

                    {/* Role Settings - Inline Toggles */}
                    <Divider sx={{ my: 2 }} />
                    <Box
                      display="flex"
                      flexWrap="wrap"
                      gap={2}
                      alignItems="center"
                    >
                      <FormControlLabel
                        control={
                          <Switch
                            checked={role.isDefault || false}
                            onChange={(e) => {
                              const updatedRoles = [...roles];
                              if (e.target.checked) {
                                // Unset other defaults
                                updatedRoles.forEach((r, idx) => {
                                  if (idx !== index) r.isDefault = false;
                                });
                              }
                              updatedRoles[index].isDefault = e.target.checked;
                              setFieldValue("roles", updatedRoles);
                            }}
                            size="small"
                          />
                        }
                        label={
                          <Typography variant="body2">Default Role</Typography>
                        }
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={role.showOnSignup !== false}
                            onChange={(e) => {
                              const updatedRoles = [...roles];
                              updatedRoles[index] = {
                                ...updatedRoles[index],
                                showOnSignup: e.target.checked,
                              };
                              setFieldValue("roles", updatedRoles);
                            }}
                            size="small"
                            color="success"
                          />
                        }
                        label={
                          <Typography variant="body2">
                            Show on Signup
                          </Typography>
                        }
                      />
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}
        </Grid>

        {/* Role Edit/Create Dialog */}
        <Dialog
          open={isRoleDialogOpen}
          onClose={() => setIsRoleDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography variant="h6">
                {editingRoleIndex !== null ? "Edit Role" : "Create New Role"}
              </Typography>
              <IconButton
                onClick={() => setIsRoleDialogOpen(false)}
                size="small"
              >
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            <Box sx={{ mt: 1 }}>
              {/* Basic Info */}
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    label="Role Name"
                    value={roleFormData.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setRoleFormData({
                        ...roleFormData,
                        name,
                        slug: generateSlug(name),
                      });
                    }}
                    helperText="Display name for this role"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Slug"
                    value={roleFormData.slug}
                    disabled
                    helperText="Auto-generated from name"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    value={roleFormData.description}
                    onChange={(e) =>
                      setRoleFormData({
                        ...roleFormData,
                        description: e.target.value,
                      })
                    }
                    multiline
                    rows={2}
                    helperText="Brief description of this role's purpose"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <ColorPicker
                    label="Role Color"
                    value={roleFormData.color}
                    onChange={(color) =>
                      setRoleFormData({ ...roleFormData, color })
                    }
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              {/* Permissions Section */}
              <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                Permissions
              </Typography>

              {/* Add from suggestions */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Click to add predefined permissions:
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={0.5}>
                  {availableSuggestions.map((suggestion, idx) => (
                    <Chip
                      key={idx}
                      label={suggestion.label}
                      size="small"
                      onClick={() => handleAddPermission(suggestion)}
                      sx={{
                        cursor: "pointer",
                        bgcolor: `${getPermissionColor(suggestion.resource)}10`,
                        color: getPermissionColor(suggestion.resource),
                        "&:hover": {
                          bgcolor: `${getPermissionColor(suggestion.resource)}25`,
                        },
                      }}
                      icon={<Add sx={{ fontSize: "14px !important" }} />}
                    />
                  ))}
                </Box>
              </Box>

              {/* Custom Permission Input */}
              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="body2" gutterBottom fontWeight="medium">
                  Add Custom Permission
                </Typography>
                <Box display="flex" gap={1} alignItems="flex-start">
                  <TextField
                    size="small"
                    label="Resource"
                    placeholder="e.g., inventory"
                    value={customResource}
                    onChange={(e) => setCustomResource(e.target.value)}
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    size="small"
                    label="Action"
                    placeholder="e.g., manage"
                    value={customAction}
                    onChange={(e) => setCustomAction(e.target.value)}
                    sx={{ flex: 1 }}
                  />
                  <Button
                    variant="outlined"
                    onClick={handleAddCustomPermission}
                    disabled={!customResource.trim() || !customAction.trim()}
                    sx={{ height: 40 }}
                  >
                    Add
                  </Button>
                </Box>
              </Paper>

              {/* Current Permissions */}
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Current permissions (click to toggle allow/deny, × to remove):
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={0.5} minHeight={40}>
                {roleFormData.permissions.length === 0 ? (
                  <Typography
                    variant="body2"
                    color="text.disabled"
                    sx={{ fontStyle: "italic" }}
                  >
                    No permissions added yet. Add permissions from above.
                  </Typography>
                ) : (
                  roleFormData.permissions.map((perm, idx) => (
                    <Chip
                      key={idx}
                      label={`${perm.resource}.${perm.action}`}
                      size="small"
                      onClick={() =>
                        handleTogglePermissionAllowed(
                          perm.resource,
                          perm.action,
                        )
                      }
                      onDelete={() =>
                        handleRemovePermission(perm.resource, perm.action)
                      }
                      sx={{
                        bgcolor: perm.allowed
                          ? `${getPermissionColor(perm.resource)}20`
                          : "#ffebee",
                        color: perm.allowed
                          ? getPermissionColor(perm.resource)
                          : "#c62828",
                        borderColor: perm.allowed
                          ? getPermissionColor(perm.resource)
                          : "#f44336",
                        border: "1px solid",
                        fontWeight: 500,
                        cursor: "pointer",
                        "&:hover": {
                          bgcolor: perm.allowed
                            ? `${getPermissionColor(perm.resource)}35`
                            : "#ffcdd2",
                        },
                      }}
                    />
                  ))
                )}
              </Box>

              {roleFormData.permissions.length > 0 && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 1, display: "block" }}
                >
                  💡 Green = Allowed, Red = Denied. Click chip to toggle.
                </Typography>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsRoleDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSaveRole}
              variant="contained"
              disabled={!roleFormData.name}
            >
              {editingRoleIndex !== null ? "Update Role" : "Create Role"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <ConfirmationDialog
          open={deleteDialog.open}
          title="Delete Role"
          message="Are you sure you want to delete this role? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          severity="error"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteDialog({ open: false, index: null })}
        />
      </Grid>
    </Fade>
  );
};

export default RoleManagementForm;
