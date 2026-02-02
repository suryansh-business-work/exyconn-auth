import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useFormikContext, FieldArray } from "formik";
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
} from "@mui/material";
import {
  Add,
  Delete,
  ExpandMore,
  SwapHoriz,
  Error as ErrorIcon,
  Lightbulb as LightbulbIcon,
} from "@mui/icons-material";
import ConfirmationDialog from "../../components/ConfirmationDialog";
import { OrganizationFormData, OrgRedirectionSetting } from "./types";

const RedirectionSettingsForm: React.FC = () => {
  const { orgId } = useParams<{ orgId: string }>();
  const { values, errors, touched, handleChange, handleBlur, isSubmitting } =
    useFormikContext<OrganizationFormData>();
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    index: number | null;
  }>({
    open: false,
    index: null,
  });

  const redirectionSettings = values.orgRedirectionSettings || [];
  const isCreateMode = !orgId; // Check if creating new org

  // Helper function to generate default redirections based on website URL and auth server URL
  const generateDefaults = () => {
    let domain = "example.com";
    let authDomain = "";

    if (values.orgWebsite) {
      try {
        // Extract domain from website URL
        const url = new URL(
          values.orgWebsite.startsWith("http")
            ? values.orgWebsite
            : `https://${values.orgWebsite}`,
        );
        domain = url.hostname;
      } catch (e) {
        // If URL parsing fails, use the website value as-is
        domain = values.orgWebsite;
      }
    }

    // Extract auth server domain if available
    if (values.authServerUrl) {
      try {
        const authUrl = new URL(
          values.authServerUrl.startsWith("http")
            ? values.authServerUrl
            : `https://${values.authServerUrl}`,
        );
        authDomain = authUrl.origin;
      } catch (e) {
        authDomain = values.authServerUrl;
      }
    }

    const defaults: OrgRedirectionSetting[] = [
      {
        authPageUrl: `auth.${domain}`,
        authPagePath: `auth.${domain}`,
        redirectionUrl: `app.${domain}`,
        env: "production",
        description: "Production environment - redirects to main app",
        roleSlug: "any",
        redirectionUrls: [{ url: `https://app.${domain}`, isDefault: true }],
      },
    ];

    // Add auth server URL redirect to /profile as default
    if (authDomain) {
      defaults.push({
        authPageUrl: authDomain,
        authPagePath: authDomain,
        redirectionUrl: `${authDomain}/profile`,
        env: "development",
        description: "Auth server default - redirects to profile page",
        roleSlug: "any",
        redirectionUrls: [{ url: `${authDomain}/profile`, isDefault: true }],
      });
    }

    return defaults;
  };

  // Helper function to check if a setting has errors
  const hasError = (index: number) => {
    const settingErrors = errors.orgRedirectionSettings as any;
    const settingTouched = touched.orgRedirectionSettings as any;

    if (!settingErrors || !settingTouched) return false;
    if (!settingErrors[index] || !settingTouched[index]) return false;

    const errorObj = settingErrors[index];
    const touchedObj = settingTouched[index];

    return Object.keys(errorObj || {}).some(
      (key) => touchedObj && touchedObj[key] && errorObj[key],
    );
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

  // Check if a setting cannot be deleted (index 0 and 1 are protected)
  const isProtectedSetting = (index: number) => {
    return index === 0 || index === 1;
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1} mb={1}>
        <SwapHoriz color="primary" />
        <Typography variant="h6">Redirection Settings</Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" paragraph>
        Configure multiple redirection settings for different environments. Auth
        page path and redirection URL are mandatory fields.
      </Typography>

      {/* Show error when creating without redirections */}
      {isCreateMode && redirectionSettings.length === 0 && isSubmitting && (
        <Alert severity="error" icon={<ErrorIcon />} sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
            At least one redirection setting is required
          </Typography>
          <Typography variant="body2">
            New organizations must have at least one redirection setting
            configured before saving.
          </Typography>
        </Alert>
      )}

      {/* Show helpful suggestion when creating */}
      {isCreateMode && redirectionSettings.length === 0 && !isSubmitting && (
        <Alert severity="info" icon={<LightbulbIcon />} sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
            Quick Setup Tip
          </Typography>
          <Typography variant="body2">
            Click "Use Default Settings" to automatically generate redirection
            URLs based on your organization name.
          </Typography>
        </Alert>
      )}

      <FieldArray name="orgRedirectionSettings">
        {({ push, remove }) => (
          <Box>
            {redirectionSettings.map((setting, index) => (
              <Accordion
                key={index}
                sx={{
                  mb: 2,
                  "&:before": { display: "none" },
                  border: hasError(index) ? "2px solid" : "none",
                  borderColor: "error.main",
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMore />}
                  sx={{
                    backgroundColor: hasError(index)
                      ? "error.lighter"
                      : "background.paper",
                    "&:hover": {
                      backgroundColor: hasError(index)
                        ? "error.lighter"
                        : "action.hover",
                    },
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1} flex={1}>
                    {hasError(index) && (
                      <ErrorIcon
                        sx={{ color: "error.main", fontSize: "1.2rem" }}
                      />
                    )}
                    <Typography variant="body2" fontWeight="medium">
                      Redirection Setting #{index + 1}
                      {setting.env && ` - ${setting.env}`}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(index);
                    }}
                    disabled={isProtectedSetting(index)}
                    title={
                      isProtectedSetting(index)
                        ? "This setting cannot be deleted"
                        : "Delete setting"
                    }
                    sx={{ mr: 1 }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        required
                        label="Auth Page Path"
                        name={`orgRedirectionSettings.${index}.authPagePath`}
                        value={setting.authPagePath || ""}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={
                          touched.orgRedirectionSettings &&
                          Array.isArray(touched.orgRedirectionSettings) &&
                          touched.orgRedirectionSettings[index]?.authPagePath &&
                          Boolean(
                            errors.orgRedirectionSettings &&
                            Array.isArray(errors.orgRedirectionSettings) &&
                            (errors.orgRedirectionSettings[index] as any)
                              ?.authPagePath,
                          )
                        }
                        helperText={
                          touched.orgRedirectionSettings &&
                          Array.isArray(touched.orgRedirectionSettings) &&
                          touched.orgRedirectionSettings[index]?.authPagePath &&
                          errors.orgRedirectionSettings &&
                          Array.isArray(errors.orgRedirectionSettings) &&
                          (errors.orgRedirectionSettings[index] as any)
                            ?.authPagePath
                            ? (errors.orgRedirectionSettings[index] as any)
                                .authPagePath
                            : "e.g., localhost:8000, auth.sibera.work"
                        }
                        placeholder="localhost:8000"
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        required
                        label="Redirection URL"
                        name={`orgRedirectionSettings.${index}.redirectionUrl`}
                        value={setting.redirectionUrl || ""}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={
                          touched.orgRedirectionSettings &&
                          Array.isArray(touched.orgRedirectionSettings) &&
                          touched.orgRedirectionSettings[index]
                            ?.redirectionUrl &&
                          Boolean(
                            errors.orgRedirectionSettings &&
                            Array.isArray(errors.orgRedirectionSettings) &&
                            (errors.orgRedirectionSettings[index] as any)
                              ?.redirectionUrl,
                          )
                        }
                        helperText={
                          touched.orgRedirectionSettings &&
                          Array.isArray(touched.orgRedirectionSettings) &&
                          touched.orgRedirectionSettings[index]
                            ?.redirectionUrl &&
                          errors.orgRedirectionSettings &&
                          Array.isArray(errors.orgRedirectionSettings) &&
                          (errors.orgRedirectionSettings[index] as any)
                            ?.redirectionUrl
                            ? (errors.orgRedirectionSettings[index] as any)
                                .redirectionUrl
                            : "e.g., localhost:3000, app.sibera.work"
                        }
                        placeholder="localhost:3000"
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel id={`env-label-${index}`}>
                          Environment
                        </InputLabel>
                        <Select
                          labelId={`env-label-${index}`}
                          label="Environment"
                          name={`orgRedirectionSettings.${index}.env`}
                          value={setting.env || ""}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        >
                          <MenuItem value="">None</MenuItem>
                          <MenuItem value="Local Dev">Local Dev</MenuItem>
                          <MenuItem value="Deployed Dev">Deployed Dev</MenuItem>
                          <MenuItem value="Staging">Staging</MenuItem>
                          <MenuItem value="Production">Production</MenuItem>
                          <MenuItem value="Auth Server">Auth Server</MenuItem>
                          <MenuItem value="Test">Test</MenuItem>
                          <MenuItem value="Other">Other</MenuItem>
                        </Select>
                        <FormHelperText>
                          Optional - Select the environment type
                        </FormHelperText>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Description"
                        name={`orgRedirectionSettings.${index}.description`}
                        value={setting.description || ""}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        helperText="Optional - Brief description of this environment"
                        placeholder="This is the local dev env"
                      />
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            ))}

            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={() => {
                  // Default to auth server URL /profile if available
                  let defaultAuthPath = "";
                  let defaultRedirectUrl = "/profile";
                  let defaultEnv = "";
                  let defaultDescription = "";

                  if (values.authServerUrl) {
                    try {
                      const authUrl = new URL(
                        values.authServerUrl.startsWith("http")
                          ? values.authServerUrl
                          : `https://${values.authServerUrl}`,
                      );
                      defaultAuthPath = authUrl.origin;
                      defaultRedirectUrl = `${authUrl.origin}/profile`;
                      defaultEnv = "Auth Server";
                      defaultDescription =
                        "Auth server default - redirects to profile page";
                    } catch (e) {
                      defaultAuthPath = values.authServerUrl;
                      defaultRedirectUrl = `${values.authServerUrl}/profile`;
                      defaultEnv = "Auth Server";
                      defaultDescription =
                        "Auth server default - redirects to profile page";
                    }
                  }

                  push({
                    authPageUrl: defaultAuthPath,
                    authPagePath: defaultAuthPath,
                    redirectionUrl: defaultRedirectUrl,
                    env: defaultEnv.toLowerCase().replace(" ", "-") as any,
                    description: defaultDescription,
                    roleSlug: "any",
                    redirectionUrls: [
                      {
                        url: defaultRedirectUrl.startsWith("http")
                          ? defaultRedirectUrl
                          : `https://${defaultRedirectUrl}`,
                        isDefault: true,
                      },
                    ],
                  });
                }}
                fullWidth
              >
                Add Redirection Setting
              </Button>

              {isCreateMode &&
                redirectionSettings.length === 0 &&
                values.orgWebsite && (
                  <Button
                    variant="contained"
                    color="info"
                    onClick={() =>
                      generateDefaults().forEach((item) => push(item))
                    }
                    fullWidth
                  >
                    Use Default Settings
                  </Button>
                )}
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
          <Typography variant="body2" color="text.secondary">
            Click the button below to add your first redirection setting
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default RedirectionSettingsForm;
