import React, { useState } from "react";
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
} from "@mui/material";
import {
  Security,
  Add,
  Delete,
  ExpandMore,
  Error as ErrorIcon,
  Lock,
} from "@mui/icons-material";
import SlugField from "../../components/SlugField";
import ConfirmationDialog from "../../components/ConfirmationDialog";
import { OrganizationFormData, Role, RolePermission } from "./types";
import { generateSlug } from "../../utils/slug";

const RoleManagementForm: React.FC = () => {
  const {
    values,
    setFieldValue,
    errors,
    touched,
    setFieldTouched,
    validateForm,
  } = useFormikContext<OrganizationFormData>();
  const [deleteRoleDialog, setDeleteRoleDialog] = useState<{
    open: boolean;
    index: number | null;
  }>({
    open: false,
    index: null,
  });
  const [deletePermissionDialog, setDeletePermissionDialog] = useState<{
    open: boolean;
    roleIndex: number | null;
    permIndex: number | null;
  }>({
    open: false,
    roleIndex: null,
    permIndex: null,
  });

  // Count roles with showOnSignup enabled for validation
  const signupRolesCount = (values.roles || []).filter(
    (role) => role.showOnSignup !== false,
  ).length;

  // Helper function to check if a role has errors
  const hasRoleError = (index: number) => {
    const roleErrors = errors.roles as any;
    const roleTouched = touched.roles as any;

    if (!roleErrors || !roleTouched) return false;
    if (!roleErrors[index] || !roleTouched[index]) return false;

    const errorObj = roleErrors[index];
    const touchedObj = roleTouched[index];
    const roleValues = values.roles && values.roles[index];

    // Only consider it an error if the field has been touched AND has a value AND there's an error
    return Object.keys(errorObj || {}).some((key) => {
      const fieldValue = roleValues && (roleValues as any)[key];
      const hasValue = fieldValue && fieldValue.toString().trim().length > 0;
      return hasValue && touchedObj && touchedObj[key] && errorObj[key];
    });
  };

  // Get error message for a specific field
  const getFieldError = (roleIndex: number, fieldName: string) => {
    const roleErrors = errors.roles as any;
    const roleTouched = touched.roles as any;

    if (!roleErrors || !roleTouched) return undefined;
    if (!roleErrors[roleIndex] || !roleTouched[roleIndex]) return undefined;

    // Only show error if field has been touched and has a value (to avoid showing errors on empty new fields)
    const fieldValue =
      values.roles &&
      values.roles[roleIndex] &&
      (values.roles[roleIndex] as any)[fieldName];
    if (fieldValue && fieldValue.toString().trim().length > 0) {
      return roleTouched[roleIndex][fieldName]
        ? roleErrors[roleIndex][fieldName]
        : undefined;
    }
    return undefined;
  };

  // Get permission error
  const getPermissionError = (
    roleIndex: number,
    permIndex: number,
    fieldName: string,
  ) => {
    const roleErrors = errors.roles as any;
    const roleTouched = touched.roles as any;

    if (!roleErrors || !roleTouched) return undefined;
    if (
      !roleErrors[roleIndex] ||
      !roleErrors[roleIndex].permissions ||
      !roleErrors[roleIndex].permissions[permIndex]
    )
      return undefined;
    if (
      !roleTouched[roleIndex] ||
      !roleTouched[roleIndex].permissions ||
      !roleTouched[roleIndex].permissions[permIndex]
    )
      return undefined;

    // Only show error if field has been touched and has a value
    const fieldValue =
      values.roles &&
      values.roles[roleIndex] &&
      values.roles[roleIndex].permissions &&
      values.roles[roleIndex].permissions[permIndex] &&
      (values.roles[roleIndex].permissions[permIndex] as any)[fieldName];
    if (fieldValue && fieldValue.toString().trim().length > 0) {
      return roleTouched[roleIndex].permissions[permIndex][fieldName]
        ? roleErrors[roleIndex].permissions[permIndex][fieldName]
        : undefined;
    }
    return undefined;
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

  const handleDeleteRoleCancel = () => {
    setDeleteRoleDialog({ open: false, index: null });
  };

  const handleDeletePermissionClick = (
    roleIndex: number,
    permIndex: number,
  ) => {
    setDeletePermissionDialog({ open: true, roleIndex, permIndex });
  };

  const handleDeletePermissionConfirm = (
    removeFunc: (index: number) => void,
  ) => {
    if (deletePermissionDialog.permIndex !== null) {
      removeFunc(deletePermissionDialog.permIndex);
    }
    setDeletePermissionDialog({
      open: false,
      roleIndex: null,
      permIndex: null,
    });
  };

  const handleDeletePermissionCancel = () => {
    setDeletePermissionDialog({
      open: false,
      roleIndex: null,
      permIndex: null,
    });
  };

  const createDefaultRole = (): Role => ({
    name: "",
    slug: "",
    description: "",
    permissions: [],
    isDefault: false,
    isSystem: false,
  });

  const createDefaultPermission = (): RolePermission => ({
    resource: "",
    action: "",
    allowed: true,
  });

  return (
    <Fade in timeout={300}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <Security color="primary" />
            <Typography variant="h6">Role Management</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Define custom roles with granular permissions. Each role can have
            multiple permissions in the format: <strong>resource.action</strong>{" "}
            (e.g., user.create, order.update, product.delete).
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Permission Format:</strong> Each permission consists of a{" "}
              <strong>Resource</strong> (e.g., user, order, product) and an{" "}
              <strong>Action</strong> (e.g., create, read, update, delete).
              System roles cannot be deleted but can be modified.
            </Typography>
          </Alert>
          {signupRolesCount < 2 && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Minimum 2 roles required:</strong> At least 2 roles must
                have "Show on Signup" enabled to display the role selector on
                the signup page.
              </Typography>
            </Alert>
          )}
        </Grid>

        <Grid item xs={12}>
          <FieldArray name="roles">
            {({ push: pushRole, remove: removeRole }) => (
              <Box>
                {(values.roles || []).map((role, roleIndex) => {
                  const roleHasError = hasRoleError(roleIndex);

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
                        transition: "all 0.3s ease",
                      }}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMore />}
                        sx={{
                          backgroundColor: "background.paper",
                          borderBottom: roleHasError
                            ? "2px solid #d32f2f"
                            : "divider",
                          "&:hover": { backgroundColor: "action.hover" },
                        }}
                      >
                        <Box
                          display="flex"
                          alignItems="center"
                          gap={1}
                          flex={1}
                        >
                          {roleHasError && (
                            <ErrorIcon
                              sx={{ color: "#d32f2f", fontSize: "20px" }}
                            />
                          )}
                          <Typography
                            variant="body2"
                            fontWeight="medium"
                            sx={{
                              color: roleHasError ? "#d32f2f" : "text.primary",
                            }}
                          >
                            {role.name || "Untitled Role"}
                          </Typography>
                          {role.isSystem && (
                            <Chip
                              icon={
                                <Lock sx={{ fontSize: "14px !important" }} />
                              }
                              label="System Role"
                              size="small"
                              color="warning"
                              sx={{ ml: 1 }}
                            />
                          )}
                          {role.isDefault && (
                            <Chip
                              label="Default"
                              size="small"
                              color="success"
                              sx={{ ml: 1 }}
                            />
                          )}
                          <Chip
                            label={`${role.permissions?.length || 0} permissions`}
                            size="small"
                            variant="outlined"
                            sx={{ ml: 1 }}
                          />
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
                          {/* Role Basic Info */}
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
                              onBlur={() => {
                                setFieldTouched(
                                  `roles.${roleIndex}.name`,
                                  true,
                                );
                                validateForm();
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
                              helperText="Auto-generated camelCase slug for API usage"
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
                              onBlur={() => {
                                setFieldTouched(
                                  `roles.${roleIndex}.description`,
                                  true,
                                );
                                validateForm();
                              }}
                              helperText="Brief description of this role"
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={role.isDefault || false}
                                  onChange={(e) => {
                                    // If setting as default, unset other defaults
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
                                    setFieldTouched(
                                      `roles.${roleIndex}.isDefault`,
                                      true,
                                    );
                                    validateForm();
                                  }}
                                />
                              }
                              label="Default Role (assigned to new users)"
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={role.showOnSignup !== false}
                                  onChange={(e) => {
                                    setFieldValue(
                                      `roles.${roleIndex}.showOnSignup`,
                                      e.target.checked,
                                    );
                                    setFieldTouched(
                                      `roles.${roleIndex}.showOnSignup`,
                                      true,
                                    );
                                    validateForm();
                                  }}
                                  color="success"
                                />
                              }
                              label="Show on Signup (allow users to select this role)"
                            />
                          </Grid>

                          <Grid item xs={12}>
                            <Divider sx={{ my: 2 }} />
                            <Typography
                              variant="subtitle2"
                              gutterBottom
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Security fontSize="small" />
                              Permissions
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              display="block"
                              gutterBottom
                            >
                              Define permissions in resource.action format
                              (e.g., user.create, user.update, user.delete)
                            </Typography>
                          </Grid>

                          {/* Permissions Array */}
                          <Grid item xs={12}>
                            <FieldArray name={`roles.${roleIndex}.permissions`}>
                              {({ push: pushPerm, remove: removePerm }) => (
                                <Box>
                                  {(role.permissions || []).map(
                                    (permission, permIndex) => (
                                      <Box
                                        key={permIndex}
                                        sx={{
                                          display: "flex",
                                          alignItems: "flex-start",
                                          gap: 2,
                                          mb: 2,
                                          p: 2,
                                          backgroundColor: "grey.50",
                                          borderRadius: 1,
                                          border: "1px solid",
                                          borderColor: "divider",
                                        }}
                                      >
                                        <TextField
                                          size="small"
                                          required
                                          label="Resource"
                                          placeholder="e.g., user"
                                          value={permission.resource}
                                          onChange={(e) =>
                                            setFieldValue(
                                              `roles.${roleIndex}.permissions.${permIndex}.resource`,
                                              e.target.value.toLowerCase(),
                                            )
                                          }
                                          onBlur={() => {
                                            setFieldTouched(
                                              `roles.${roleIndex}.permissions.${permIndex}.resource`,
                                              true,
                                            );
                                            validateForm();
                                          }}
                                          error={Boolean(
                                            getPermissionError(
                                              roleIndex,
                                              permIndex,
                                              "resource",
                                            ),
                                          )}
                                          helperText={
                                            getPermissionError(
                                              roleIndex,
                                              permIndex,
                                              "resource",
                                            ) || "Resource name"
                                          }
                                          sx={{ flex: 1 }}
                                        />
                                        <TextField
                                          size="small"
                                          required
                                          label="Action"
                                          placeholder="e.g., create"
                                          value={permission.action}
                                          onChange={(e) =>
                                            setFieldValue(
                                              `roles.${roleIndex}.permissions.${permIndex}.action`,
                                              e.target.value.toLowerCase(),
                                            )
                                          }
                                          onBlur={() => {
                                            setFieldTouched(
                                              `roles.${roleIndex}.permissions.${permIndex}.action`,
                                              true,
                                            );
                                            validateForm();
                                          }}
                                          error={Boolean(
                                            getPermissionError(
                                              roleIndex,
                                              permIndex,
                                              "action",
                                            ),
                                          )}
                                          helperText={
                                            getPermissionError(
                                              roleIndex,
                                              permIndex,
                                              "action",
                                            ) || "Action name"
                                          }
                                          sx={{ flex: 1 }}
                                        />
                                        <FormControlLabel
                                          control={
                                            <Switch
                                              checked={permission.allowed}
                                              onChange={(e) => {
                                                setFieldValue(
                                                  `roles.${roleIndex}.permissions.${permIndex}.allowed`,
                                                  e.target.checked,
                                                );
                                                setFieldTouched(
                                                  `roles.${roleIndex}.permissions.${permIndex}.allowed`,
                                                  true,
                                                );
                                                validateForm();
                                              }}
                                              color="success"
                                            />
                                          }
                                          label={
                                            permission.allowed
                                              ? "Allowed"
                                              : "Denied"
                                          }
                                          sx={{ minWidth: 120 }}
                                        />
                                        <IconButton
                                          size="small"
                                          color="error"
                                          onClick={() =>
                                            handleDeletePermissionClick(
                                              roleIndex,
                                              permIndex,
                                            )
                                          }
                                        >
                                          <Delete fontSize="small" />
                                        </IconButton>
                                      </Box>
                                    ),
                                  )}
                                  <Button
                                    startIcon={<Add />}
                                    variant="outlined"
                                    size="small"
                                    onClick={() =>
                                      pushPerm(createDefaultPermission())
                                    }
                                    sx={{ mt: 1 }}
                                  >
                                    Add Permission
                                  </Button>

                                  <ConfirmationDialog
                                    open={
                                      deletePermissionDialog.open &&
                                      deletePermissionDialog.roleIndex ===
                                        roleIndex
                                    }
                                    title="Delete Permission"
                                    message="Are you sure you want to delete this permission?"
                                    confirmText="Delete"
                                    cancelText="Cancel"
                                    severity="error"
                                    onConfirm={() =>
                                      handleDeletePermissionConfirm(removePerm)
                                    }
                                    onCancel={handleDeletePermissionCancel}
                                  />
                                </Box>
                              )}
                            </FieldArray>
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
                  message="Are you sure you want to delete this role? All associated permissions will be removed. This action cannot be undone."
                  confirmText="Delete"
                  cancelText="Cancel"
                  severity="error"
                  onConfirm={() => handleDeleteRoleConfirm(removeRole)}
                  onCancel={handleDeleteRoleCancel}
                />
              </Box>
            )}
          </FieldArray>
        </Grid>

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
      </Grid>
    </Fade>
  );
};

export default RoleManagementForm;
