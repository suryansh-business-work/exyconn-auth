import React, { useState } from "react";
import { useFormikContext, FieldArray } from "formik";
import { Box, Typography, Button, Alert } from "@mui/material";
import {
  Add,
  SwapHoriz,
  Lightbulb as LightbulbIcon,
} from "@mui/icons-material";
import ConfirmationDialog from "../../../components/ConfirmationDialog";
import { OrganizationFormData, OrgRedirectionSetting } from "../types";
import RedirectionSettingCard from "./RedirectionSettingCard";

const RedirectionSettingsFormNew: React.FC = () => {
  const { values, errors, touched, setFieldValue, setFieldTouched } =
    useFormikContext<OrganizationFormData>();
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    index: number | null;
  }>({
    open: false,
    index: null,
  });

  const redirectionSettings = values.orgRedirectionSettings || [];
  const roles = values.roles || [];

  const handleFieldChange = (
    settingIndex: number,
    field: string,
    value: string | object,
  ) => {
    setFieldValue(`orgRedirectionSettings.${settingIndex}.${field}`, value);
  };

  const handleFieldBlur = (settingIndex: number, field: string) => {
    setFieldTouched(`orgRedirectionSettings.${settingIndex}.${field}`, true);
  };

  const handleDeleteClick = (index: number) => {
    setDeleteDialog({ open: true, index });
  };

  const handleDeleteConfirm = (removeFunc: (index: number) => void) => {
    if (deleteDialog.index !== null) {
      removeFunc(deleteDialog.index);
    }
    setDeleteDialog({ open: false, index: null });
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, index: null });
  };

  const getTouchedForSetting = (index: number): Record<string, boolean> => {
    const settingTouched = touched.orgRedirectionSettings;
    if (!settingTouched || !Array.isArray(settingTouched)) return {};
    return (settingTouched[index] as Record<string, boolean>) || {};
  };

  const getErrorsForSetting = (index: number): Record<string, string> => {
    const settingErrors = errors.orgRedirectionSettings;
    if (!settingErrors || !Array.isArray(settingErrors)) return {};
    return (settingErrors[index] as Record<string, string>) || {};
  };

  const createDefaultSetting = (): OrgRedirectionSetting => ({
    env: "development",
    description: "",
    authPageUrl: values.authServerUrl || "",
    roleSlug: "any",
    redirectionUrls: [
      {
        url: values.authServerUrl
          ? `${values.authServerUrl}/profile`
          : "/profile",
        isDefault: true,
      },
    ],
  });

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1} mb={1}>
        <SwapHoriz color="primary" />
        <Typography variant="h6">Redirection Settings</Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" paragraph>
        Configure environment-aware and role-aware redirection settings. After
        successful login, users will be redirected based on their role and the
        matching environment.
      </Typography>

      {/* Priority Info */}
      <Alert severity="info" icon={<LightbulbIcon />} sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
          Redirection Priority
        </Typography>
        <Typography variant="body2">
          1. Specific Role + Default URL → 2. Specific Role (first URL) → 3. Any
          Role + Default URL → 4. Any Role (first URL) → 5. Fallback to Profile
        </Typography>
      </Alert>

      <FieldArray name="orgRedirectionSettings">
        {({ push, remove }) => (
          <Box>
            {redirectionSettings.map((setting, index) => (
              <RedirectionSettingCard
                key={index}
                index={index}
                setting={setting}
                roles={roles}
                touched={getTouchedForSetting(index)}
                errors={getErrorsForSetting(index)}
                onFieldChange={handleFieldChange}
                onFieldBlur={handleFieldBlur}
                onDelete={handleDeleteClick}
                canDelete={redirectionSettings.length > 1}
              />
            ))}

            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={() => push(createDefaultSetting())}
                fullWidth
              >
                Add Redirection Setting
              </Button>
            </Box>

            <ConfirmationDialog
              open={deleteDialog.open}
              title="Delete Redirection Setting"
              message="Are you sure you want to delete this redirection setting? This action cannot be undone."
              confirmText="Delete"
              cancelText="Cancel"
              severity="error"
              onConfirm={() => handleDeleteConfirm(remove)}
              onCancel={handleDeleteCancel}
            />
          </Box>
        )}
      </FieldArray>

      {redirectionSettings.length === 0 && (
        <Box
          sx={{
            p: 4,
            textAlign: "center",
            border: "2px dashed",
            borderColor: "divider",
            borderRadius: 1,
            bgcolor: "action.hover",
            mt: 2,
          }}
        >
          <Typography variant="body1" color="text.secondary" gutterBottom>
            No redirection settings configured yet
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Click the button below to add your first redirection setting
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              const settings = values.orgRedirectionSettings || [];
              setFieldValue("orgRedirectionSettings", [
                ...settings,
                createDefaultSetting(),
              ]);
            }}
          >
            Add First Setting
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default RedirectionSettingsFormNew;
