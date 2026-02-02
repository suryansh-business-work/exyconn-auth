import React, { useState, useMemo } from "react";
import { useFormikContext, FieldArray } from "formik";
import {
  Grid,
  Typography,
  Box,
  Fade,
  TextField,
  Button,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Switch,
  Chip,
  Divider,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Card,
  CardHeader,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tab,
  Tabs,
  Badge,
} from "@mui/material";
import {
  Security,
  Add,
  Delete,
  ExpandMore,
  Error as ErrorIcon,
  Lock,
  ChevronRight,
  ChevronLeft,
  KeyboardArrowRight,
  KeyboardArrowLeft,
  Dashboard,
  People,
  AdminPanelSettings,
  Api,
  Settings,
  Assessment,
  History,
  Edit,
  Visibility,
  Create,
  DeleteForever,
  Download,
  Upload,
  ManageAccounts,
  Close,
} from "@mui/icons-material";
import SlugField from "../../components/SlugField";
import ConfirmationDialog from "../../components/ConfirmationDialog";
import { OrganizationFormData } from "./types";
import { generateSlug } from "../../utils/slug";

// Access Group / Module definitions
interface Permission {
  id: string;
  resource: string;
  action: string;
  label: string;
  description: string;
}

interface AccessGroup {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: React.ReactNode;
  permissions: Permission[];
}

// Define all available access groups and their permissions
const ACCESS_GROUPS: AccessGroup[] = [
  {
    id: "dashboard",
    name: "Dashboard",
    slug: "dashboard",
    description: "Dashboard and analytics access",
    icon: <Dashboard />,
    permissions: [
      {
        id: "dashboard.read",
        resource: "dashboard",
        action: "read",
        label: "View Dashboard",
        description: "Can view dashboard and analytics",
      },
      {
        id: "dashboard.export",
        resource: "dashboard",
        action: "export",
        label: "Export Data",
        description: "Can export dashboard data",
      },
    ],
  },
  {
    id: "users",
    name: "User Management",
    slug: "users",
    description: "Manage users and accounts",
    icon: <People />,
    permissions: [
      {
        id: "users.read",
        resource: "users",
        action: "read",
        label: "View Users",
        description: "Can view user list",
      },
      {
        id: "users.create",
        resource: "users",
        action: "create",
        label: "Create Users",
        description: "Can create new users",
      },
      {
        id: "users.update",
        resource: "users",
        action: "update",
        label: "Update Users",
        description: "Can update user information",
      },
      {
        id: "users.delete",
        resource: "users",
        action: "delete",
        label: "Delete Users",
        description: "Can delete users",
      },
      {
        id: "users.manage",
        resource: "users",
        action: "manage",
        label: "Manage Roles",
        description: "Can change user roles",
      },
    ],
  },
  {
    id: "roles",
    name: "Role Management",
    slug: "roles",
    description: "Manage roles and permissions",
    icon: <AdminPanelSettings />,
    permissions: [
      {
        id: "roles.read",
        resource: "roles",
        action: "read",
        label: "View Roles",
        description: "Can view roles",
      },
      {
        id: "roles.create",
        resource: "roles",
        action: "create",
        label: "Create Roles",
        description: "Can create new roles",
      },
      {
        id: "roles.update",
        resource: "roles",
        action: "update",
        label: "Update Roles",
        description: "Can update roles",
      },
      {
        id: "roles.delete",
        resource: "roles",
        action: "delete",
        label: "Delete Roles",
        description: "Can delete roles",
      },
    ],
  },
  {
    id: "api",
    name: "API Management",
    slug: "api",
    description: "API keys and tokens",
    icon: <Api />,
    permissions: [
      {
        id: "api.read",
        resource: "api",
        action: "read",
        label: "View API Keys",
        description: "Can view API keys",
      },
      {
        id: "api.create",
        resource: "api",
        action: "create",
        label: "Generate Keys",
        description: "Can generate API keys",
      },
      {
        id: "api.delete",
        resource: "api",
        action: "delete",
        label: "Revoke Keys",
        description: "Can revoke API keys",
      },
    ],
  },
  {
    id: "settings",
    name: "Settings",
    slug: "settings",
    description: "Organization settings",
    icon: <Settings />,
    permissions: [
      {
        id: "settings.read",
        resource: "settings",
        action: "read",
        label: "View Settings",
        description: "Can view settings",
      },
      {
        id: "settings.update",
        resource: "settings",
        action: "update",
        label: "Update Settings",
        description: "Can update settings",
      },
    ],
  },
  {
    id: "reports",
    name: "Reports",
    slug: "reports",
    description: "Reports and analytics",
    icon: <Assessment />,
    permissions: [
      {
        id: "reports.read",
        resource: "reports",
        action: "read",
        label: "View Reports",
        description: "Can view reports",
      },
      {
        id: "reports.export",
        resource: "reports",
        action: "export",
        label: "Export Reports",
        description: "Can export reports",
      },
    ],
  },
  {
    id: "audit",
    name: "Audit Logs",
    slug: "audit",
    description: "System audit logs",
    icon: <History />,
    permissions: [
      {
        id: "audit.read",
        resource: "audit",
        action: "read",
        label: "View Audit Logs",
        description: "Can view audit logs",
      },
      {
        id: "audit.export",
        resource: "audit",
        action: "export",
        label: "Export Logs",
        description: "Can export audit logs",
      },
    ],
  },
];

// Get all available permissions
const ALL_PERMISSIONS = ACCESS_GROUPS.flatMap((group) => group.permissions);

// Action icons
const getActionIcon = (action: string) => {
  switch (action) {
    case "read":
      return <Visibility fontSize="small" />;
    case "create":
      return <Create fontSize="small" />;
    case "update":
      return <Edit fontSize="small" />;
    case "delete":
      return <DeleteForever fontSize="small" />;
    case "export":
      return <Download fontSize="small" />;
    case "import":
      return <Upload fontSize="small" />;
    case "manage":
      return <ManageAccounts fontSize="small" />;
    default:
      return <Security fontSize="small" />;
  }
};

// Transfer List Component
interface TransferListProps {
  allItems: Permission[];
  selectedItems: string[];
  onChange: (selected: string[]) => void;
  groupBy?: "resource" | "action";
}

const TransferList: React.FC<TransferListProps> = ({
  allItems,
  selectedItems,
  onChange,
}) => {
  const [checked, setChecked] = useState<string[]>([]);

  const leftItems = allItems.filter((item) => !selectedItems.includes(item.id));
  const rightItems = allItems.filter((item) => selectedItems.includes(item.id));

  const leftChecked = checked.filter((id) =>
    leftItems.some((item) => item.id === id),
  );
  const rightChecked = checked.filter((id) =>
    rightItems.some((item) => item.id === id),
  );

  const handleToggle = (id: string) => {
    const currentIndex = checked.indexOf(id);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(id);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };

  const handleAllRight = () => {
    onChange([...selectedItems, ...leftItems.map((item) => item.id)]);
  };

  const handleCheckedRight = () => {
    onChange([...selectedItems, ...leftChecked]);
    setChecked(checked.filter((id) => !leftChecked.includes(id)));
  };

  const handleCheckedLeft = () => {
    onChange(selectedItems.filter((id) => !rightChecked.includes(id)));
    setChecked(checked.filter((id) => !rightChecked.includes(id)));
  };

  const handleAllLeft = () => {
    onChange([]);
  };

  const handleToggleAll = (items: Permission[]) => {
    const allIds = items.map((item) => item.id);
    const allChecked = allIds.every((id) => checked.includes(id));

    if (allChecked) {
      setChecked(checked.filter((id) => !allIds.includes(id)));
    } else {
      setChecked([...new Set([...checked, ...allIds])]);
    }
  };

  const numberOfChecked = (items: Permission[]) =>
    checked.filter((id) => items.some((item) => item.id === id)).length;

  const customList = (
    title: string,
    items: Permission[],
    side: "left" | "right",
  ) => {
    // Group items by resource
    const groupedItems = items.reduce(
      (acc, item) => {
        const group = item.resource;
        if (!acc[group]) acc[group] = [];
        acc[group].push(item);
        return acc;
      },
      {} as Record<string, Permission[]>,
    );

    return (
      <Card
        elevation={0}
        sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}
      >
        <CardHeader
          sx={{ px: 2, py: 1.5, bgcolor: "background.default" }}
          avatar={
            <Checkbox
              onClick={() => handleToggleAll(items)}
              checked={
                numberOfChecked(items) === items.length && items.length !== 0
              }
              indeterminate={
                numberOfChecked(items) !== items.length &&
                numberOfChecked(items) !== 0
              }
              disabled={items.length === 0}
            />
          }
          title={title}
          subheader={`${numberOfChecked(items)}/${items.length} selected`}
        />
        <Divider />
        <List
          sx={{
            width: "100%",
            height: 320,
            overflow: "auto",
            bgcolor: "background.paper",
          }}
          dense
        >
          {Object.entries(groupedItems).map(([group, groupItems]) => (
            <React.Fragment key={group}>
              <ListItem sx={{ bgcolor: "grey.50", py: 0.5 }}>
                <ListItemText
                  primary={
                    <Typography
                      variant="caption"
                      fontWeight="bold"
                      color="text.secondary"
                      textTransform="uppercase"
                    >
                      {ACCESS_GROUPS.find((g) => g.slug === group)?.name ||
                        group}
                    </Typography>
                  }
                />
              </ListItem>
              {groupItems.map((item) => (
                <ListItemButton
                  key={item.id}
                  onClick={() => handleToggle(item.id)}
                  sx={{ pl: 4 }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Checkbox
                      checked={checked.includes(item.id)}
                      tabIndex={-1}
                      disableRipple
                      size="small"
                    />
                  </ListItemIcon>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    {getActionIcon(item.action)}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    secondary={item.description}
                    primaryTypographyProps={{ variant: "body2" }}
                    secondaryTypographyProps={{ variant: "caption" }}
                  />
                </ListItemButton>
              ))}
            </React.Fragment>
          ))}
          {items.length === 0 && (
            <ListItem>
              <ListItemText
                primary={
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    align="center"
                  >
                    {side === "left"
                      ? "All permissions assigned"
                      : "No permissions assigned"}
                  </Typography>
                }
              />
            </ListItem>
          )}
        </List>
      </Card>
    );
  };

  return (
    <Grid container spacing={2} alignItems="center">
      <Grid item xs={12} md={5}>
        {customList("Available Permissions", leftItems, "left")}
      </Grid>
      <Grid item xs={12} md={2}>
        <Grid container direction="column" alignItems="center" spacing={1}>
          <Grid item>
            <Button
              variant="outlined"
              size="small"
              onClick={handleAllRight}
              disabled={leftItems.length === 0}
              startIcon={<KeyboardArrowRight />}
            >
              All
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              size="small"
              onClick={handleCheckedRight}
              disabled={leftChecked.length === 0}
            >
              <ChevronRight />
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              size="small"
              onClick={handleCheckedLeft}
              disabled={rightChecked.length === 0}
            >
              <ChevronLeft />
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              size="small"
              onClick={handleAllLeft}
              disabled={rightItems.length === 0}
              startIcon={<KeyboardArrowLeft />}
            >
              All
            </Button>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12} md={5}>
        {customList("Assigned Permissions", rightItems, "right")}
      </Grid>
    </Grid>
  );
};

// Role Permission Editor Dialog
interface RolePermissionEditorProps {
  open: boolean;
  onClose: () => void;
  roleIndex: number;
  roleName: string;
}

const RolePermissionEditor: React.FC<RolePermissionEditorProps> = ({
  open,
  onClose,
  roleIndex,
  roleName,
}) => {
  const { values, setFieldValue } = useFormikContext<OrganizationFormData>();
  const role = values.roles?.[roleIndex];
  const [activeTab, setActiveTab] = useState(0);

  // Get current permissions from role
  const currentPermissions = useMemo(() => {
    if (!role?.permissions) return [];
    return role.permissions.map((p) => `${p.resource}.${p.action}`);
  }, [role?.permissions]);

  const handlePermissionsChange = (selectedIds: string[]) => {
    const newPermissions = selectedIds.map((id) => {
      const [resource, action] = id.split(".");
      return { resource, action, allowed: true };
    });
    setFieldValue(`roles.${roleIndex}.permissions`, newPermissions);
  };

  if (!role) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Security color="primary" />
          <Typography variant="h6">Edit Permissions: {roleName}</Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          sx={{ mb: 3 }}
        >
          <Tab label="Transfer List" />
          <Tab label="Quick Select by Module" />
        </Tabs>

        {activeTab === 0 && (
          <TransferList
            allItems={ALL_PERMISSIONS}
            selectedItems={currentPermissions}
            onChange={handlePermissionsChange}
          />
        )}

        {activeTab === 1 && (
          <Grid container spacing={2}>
            {ACCESS_GROUPS.map((group) => {
              const groupPermissionIds = group.permissions.map((p) => p.id);
              const selectedInGroup = currentPermissions.filter((p) =>
                groupPermissionIds.includes(p),
              );
              const allSelected =
                selectedInGroup.length === groupPermissionIds.length;
              const someSelected = selectedInGroup.length > 0 && !allSelected;

              return (
                <Grid item xs={12} md={6} lg={4} key={group.id}>
                  <Card
                    elevation={0}
                    sx={{ border: "1px solid", borderColor: "divider" }}
                  >
                    <CardHeader
                      avatar={group.icon}
                      title={group.name}
                      subheader={group.description}
                      action={
                        <Checkbox
                          checked={allSelected}
                          indeterminate={someSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              // Add all permissions from this group
                              const newPerms = [
                                ...new Set([
                                  ...currentPermissions,
                                  ...groupPermissionIds,
                                ]),
                              ];
                              handlePermissionsChange(newPerms);
                            } else {
                              // Remove all permissions from this group
                              const newPerms = currentPermissions.filter(
                                (p) => !groupPermissionIds.includes(p),
                              );
                              handlePermissionsChange(newPerms);
                            }
                          }}
                        />
                      }
                      titleTypographyProps={{ variant: "subtitle1" }}
                      subheaderTypographyProps={{ variant: "caption" }}
                    />
                    <Divider />
                    <List dense>
                      {group.permissions.map((perm) => (
                        <ListItemButton
                          key={perm.id}
                          onClick={() => {
                            if (currentPermissions.includes(perm.id)) {
                              handlePermissionsChange(
                                currentPermissions.filter((p) => p !== perm.id),
                              );
                            } else {
                              handlePermissionsChange([
                                ...currentPermissions,
                                perm.id,
                              ]);
                            }
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <Checkbox
                              edge="start"
                              checked={currentPermissions.includes(perm.id)}
                              size="small"
                            />
                          </ListItemIcon>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            {getActionIcon(perm.action)}
                          </ListItemIcon>
                          <ListItemText primary={perm.label} />
                        </ListItemButton>
                      ))}
                    </List>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {currentPermissions.length} of {ALL_PERMISSIONS.length} permissions
            assigned
          </Typography>
        </Box>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

// Main Component
const AdvancedRoleManagementForm: React.FC = () => {
  const { values, setFieldValue, errors, touched } =
    useFormikContext<OrganizationFormData>();
  const [deleteRoleDialog, setDeleteRoleDialog] = useState<{
    open: boolean;
    index: number | null;
  }>({
    open: false,
    index: null,
  });
  const [permissionEditorOpen, setPermissionEditorOpen] = useState<{
    open: boolean;
    roleIndex: number;
    roleName: string;
  }>({
    open: false,
    roleIndex: -1,
    roleName: "",
  });

  const hasRoleError = (index: number) => {
    const roleErrors = errors.roles as any;
    const roleTouched = touched.roles as any;
    if (!roleErrors || !roleTouched) return false;
    if (!roleErrors[index] || !roleTouched[index]) return false;
    return Object.keys(roleErrors[index] || {}).some(
      (key) => roleTouched[index]?.[key],
    );
  };

  const getFieldError = (roleIndex: number, fieldName: string) => {
    const roleErrors = errors.roles as any;
    const roleTouched = touched.roles as any;
    if (
      !roleErrors?.[roleIndex]?.[fieldName] ||
      !roleTouched?.[roleIndex]?.[fieldName]
    )
      return undefined;
    return roleErrors[roleIndex][fieldName];
  };

  const handleDeleteRoleClick = (index: number) => {
    setDeleteRoleDialog({ open: true, index });
  };

  const handleDeleteRoleConfirm = (removeFunc: (index: number) => void) => {
    if (deleteRoleDialog.index !== null) {
      removeFunc(deleteRoleDialog.index);
    }
    setDeleteRoleDialog({ open: false, index: null });
  };

  const createDefaultRole = () => ({
    name: "",
    slug: "",
    description: "",
    permissions: [],
    isDefault: false,
    isSystem: false,
  });

  const openPermissionEditor = (index: number, name: string) => {
    setPermissionEditorOpen({ open: true, roleIndex: index, roleName: name });
  };

  return (
    <Fade in timeout={300}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <Security color="primary" />
            <Typography variant="h6">Advanced Role Management</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Configure user roles with granular permissions. Each role defines
            what actions users can perform across different modules.
          </Typography>
        </Grid>

        {/* Role Structure Info */}
        <Grid item xs={12}>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Role Structure:</strong> User → Role → Permissions →
              Access Module
              <br />
              <Typography variant="caption" color="text.secondary">
                Example: A "Manager" role can have read/update access to Users
                module but no delete permission.
              </Typography>
            </Typography>
          </Alert>
        </Grid>

        {/* Access Modules Overview */}
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              mb: 2,
            }}
          >
            <Typography variant="subtitle2" gutterBottom>
              Available Access Modules
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {ACCESS_GROUPS.map((group) => (
                <Tooltip key={group.id} title={group.description}>
                  <Chip
                    icon={
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        {group.icon}
                      </Box>
                    }
                    label={`${group.name} (${group.permissions.length})`}
                    variant="outlined"
                    size="small"
                  />
                </Tooltip>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Roles List */}
        <Grid item xs={12}>
          <FieldArray name="roles">
            {({ push: pushRole, remove: removeRole }) => (
              <Box>
                {(values.roles || []).map((role, roleIndex) => {
                  const roleHasError = hasRoleError(roleIndex);
                  const permCount = role.permissions?.length || 0;

                  return (
                    <Accordion
                      key={roleIndex}
                      sx={{
                        mb: 2,
                        "&:before": { display: "none" },
                        border: roleHasError
                          ? "2px solid #d32f2f"
                          : "1px solid rgba(0, 0, 0, 0.12)",
                        backgroundColor: roleHasError
                          ? "#ffebee"
                          : "background.paper",
                      }}
                    >
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Box
                          display="flex"
                          alignItems="center"
                          gap={1}
                          flex={1}
                        >
                          {roleHasError && (
                            <ErrorIcon sx={{ color: "#d32f2f" }} />
                          )}
                          <Typography variant="body1" fontWeight="medium">
                            {role.name || "Untitled Role"}
                          </Typography>
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
                          {role.isDefault && (
                            <Chip
                              label="Default"
                              size="small"
                              color="success"
                            />
                          )}
                          <Badge
                            badgeContent={permCount}
                            color="primary"
                            sx={{ ml: 1 }}
                          >
                            <Chip
                              label="Permissions"
                              size="small"
                              variant="outlined"
                            />
                          </Badge>
                        </Box>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRoleClick(roleIndex);
                          }}
                          disabled={role.isSystem}
                          sx={{ mr: 1 }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={4}>
                            <TextField
                              fullWidth
                              required
                              label="Role Name"
                              value={role.name}
                              onChange={(e) => {
                                const name = e.target.value;
                                setFieldValue(`roles.${roleIndex}.name`, name);
                                setFieldValue(
                                  `roles.${roleIndex}.slug`,
                                  generateSlug(name),
                                );
                              }}
                              disabled={role.isSystem}
                              error={Boolean(getFieldError(roleIndex, "name"))}
                              helperText={
                                getFieldError(roleIndex, "name") ||
                                "Display name for this role"
                              }
                            />
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <SlugField
                              label="Role Slug"
                              value={role.slug}
                              disabled
                              helperText="Auto-generated for API usage"
                            />
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <TextField
                              fullWidth
                              label="Description"
                              value={role.description || ""}
                              onChange={(e) =>
                                setFieldValue(
                                  `roles.${roleIndex}.description`,
                                  e.target.value,
                                )
                              }
                              helperText="Brief description of this role"
                            />
                          </Grid>

                          <Grid item xs={12} md={6}>
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={role.isDefault || false}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      (values.roles || []).forEach((_, idx) => {
                                        if (idx !== roleIndex) {
                                          setFieldValue(
                                            `roles.${idx}.isDefault`,
                                            false,
                                          );
                                        }
                                      });
                                    }
                                    setFieldValue(
                                      `roles.${roleIndex}.isDefault`,
                                      e.target.checked,
                                    );
                                  }}
                                />
                              }
                              label="Default Role (assigned to new users)"
                            />
                          </Grid>

                          <Grid item xs={12}>
                            <Divider sx={{ my: 2 }} />
                            <Box
                              display="flex"
                              alignItems="center"
                              justifyContent="space-between"
                              mb={2}
                            >
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <Security fontSize="small" />
                                Permissions ({permCount} assigned)
                              </Typography>
                              <Button
                                variant="contained"
                                size="small"
                                startIcon={<Edit />}
                                onClick={() =>
                                  openPermissionEditor(
                                    roleIndex,
                                    role.name || "Role",
                                  )
                                }
                              >
                                Edit Permissions
                              </Button>
                            </Box>

                            {/* Permission Summary by Module */}
                            {permCount > 0 ? (
                              <Box display="flex" flexWrap="wrap" gap={1}>
                                {ACCESS_GROUPS.map((group) => {
                                  const groupPerms = (
                                    role.permissions || []
                                  ).filter((p) => p.resource === group.slug);
                                  if (groupPerms.length === 0) return null;

                                  return (
                                    <Tooltip
                                      key={group.id}
                                      title={
                                        <Box>
                                          <Typography
                                            variant="caption"
                                            fontWeight="bold"
                                          >
                                            {group.name} Permissions:
                                          </Typography>
                                          {groupPerms.map((p) => (
                                            <Typography
                                              key={`${p.resource}.${p.action}`}
                                              variant="caption"
                                              display="block"
                                            >
                                              • {p.action}
                                            </Typography>
                                          ))}
                                        </Box>
                                      }
                                    >
                                      <Chip
                                        icon={
                                          <Box
                                            sx={{ display: "flex", pl: 0.5 }}
                                          >
                                            {group.icon}
                                          </Box>
                                        }
                                        label={`${group.name}: ${groupPerms.length}`}
                                        size="small"
                                        color="primary"
                                        variant="outlined"
                                      />
                                    </Tooltip>
                                  );
                                })}
                              </Box>
                            ) : (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ fontStyle: "italic" }}
                              >
                                No permissions assigned. Click "Edit
                                Permissions" to add.
                              </Typography>
                            )}
                          </Grid>
                        </Grid>
                      </AccordionDetails>
                    </Accordion>
                  );
                })}

                <Button
                  startIcon={<Add />}
                  variant="outlined"
                  onClick={() => pushRole(createDefaultRole())}
                  fullWidth
                  sx={{ mt: 2 }}
                >
                  Add Role
                </Button>

                <ConfirmationDialog
                  open={deleteRoleDialog.open}
                  title="Delete Role"
                  message="Are you sure you want to delete this role? Users with this role will need to be reassigned."
                  confirmText="Delete"
                  cancelText="Cancel"
                  severity="error"
                  onConfirm={() => handleDeleteRoleConfirm(removeRole)}
                  onCancel={() =>
                    setDeleteRoleDialog({ open: false, index: null })
                  }
                />
              </Box>
            )}
          </FieldArray>
        </Grid>

        {/* Empty State */}
        {(!values.roles || values.roles.length === 0) && (
          <Grid item xs={12}>
            <Box
              sx={{
                p: 4,
                textAlign: "center",
                border: "2px dashed",
                borderColor: "divider",
                borderRadius: 1,
                bgcolor: "action.hover",
              }}
            >
              <Security sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
              <Typography variant="body1" color="text.secondary" gutterBottom>
                No roles configured yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Click "Add Role" to create your first custom role with
                permissions
              </Typography>
            </Box>
          </Grid>
        )}

        {/* Permission Editor Dialog */}
        <RolePermissionEditor
          open={permissionEditorOpen.open}
          onClose={() =>
            setPermissionEditorOpen({
              open: false,
              roleIndex: -1,
              roleName: "",
            })
          }
          roleIndex={permissionEditorOpen.roleIndex}
          roleName={permissionEditorOpen.roleName}
        />
      </Grid>
    </Fade>
  );
};

export default AdvancedRoleManagementForm;
