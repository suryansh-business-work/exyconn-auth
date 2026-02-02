import React, { useEffect, useRef } from "react";
import { useFormikContext, Field, FieldProps } from "formik";
import {
  Grid,
  TextField,
  FormControlLabel,
  Switch,
  Typography,
  Box,
  Fade,
  Alert,
} from "@mui/material";
import { Business, InfoOutlined } from "@mui/icons-material";
import { OrganizationFormData, OrgRedirectionSetting } from "./types";
import SlugField from "../../components/SlugField";
import { generateSlug } from "../../utils/slug";

const BasicInfoForm: React.FC = () => {
  const { values, setFieldValue } = useFormikContext<OrganizationFormData>();
  const prevAuthServerUrl = useRef<string>("");

  // Auto-generate slug from organization name in real-time
  useEffect(() => {
    if (values.orgName) {
      const slug = generateSlug(values.orgName);
      setFieldValue("orgSlug", slug);
    }
  }, [values.orgName, setFieldValue]);

  // Auto-generate auth server URL from website URL in real-time
  useEffect(() => {
    if (values.orgWebsite && values.orgWebsite.trim()) {
      try {
        const url = new URL(values.orgWebsite);
        const hostname = url.hostname;

        // Check if hostname already starts with 'auth.'
        if (!hostname.startsWith("auth.")) {
          // Add 'auth.' subdomain
          const authHostname = `auth.${hostname}`;
          const authServerUrl = `${url.protocol}//${authHostname}`;

          // Only update if the field is empty or hasn't been manually edited
          if (
            !values.authServerUrl ||
            values.authServerUrl === "" ||
            values.authServerUrl.includes(hostname.replace("auth.", ""))
          ) {
            setFieldValue("authServerUrl", authServerUrl);
          }
        } else {
          // If already has 'auth.' subdomain, use as is
          const authServerUrl = `${url.protocol}//${hostname}`;
          if (!values.authServerUrl || values.authServerUrl === "") {
            setFieldValue("authServerUrl", authServerUrl);
          }
        }
      } catch (error) {
        // Invalid URL, ignore
      }
    }
  }, [values.orgWebsite, setFieldValue]);

  // Auto-add auth server redirection when authServerUrl is set/changed
  useEffect(() => {
    if (
      values.authServerUrl &&
      values.authServerUrl !== prevAuthServerUrl.current
    ) {
      prevAuthServerUrl.current = values.authServerUrl;

      // Normalize the auth server URL
      let authDomain = values.authServerUrl;
      try {
        const authUrl = new URL(
          authDomain.startsWith("http") ? authDomain : `https://${authDomain}`,
        );
        authDomain = authUrl.origin;
      } catch (e) {
        // Keep as-is if parsing fails
        return;
      }

      const existingRedirections = values.orgRedirectionSettings || [];
      const newRedirections: OrgRedirectionSetting[] = [
        ...existingRedirections,
      ];

      // Check if localhost (LocalDev) redirect already exists
      const hasLocalhostRedirection = existingRedirections.some(
        (r: OrgRedirectionSetting) => {
          const authPath = (r.authPageUrl || "").toLowerCase();
          return authPath.includes("localhost:4001");
        },
      );

      // Check if production redirect already exists
      const hasProductionRedirection = existingRedirections.some(
        (r: OrgRedirectionSetting) => {
          const authPath = r.authPageUrl || "";
          return authPath.includes(authDomain) || authDomain.includes(authPath);
        },
      );

      // Add LocalDev redirect if not exists
      if (!hasLocalhostRedirection) {
        newRedirections.push({
          authPageUrl: "http://localhost:4001",
          redirectionUrls: [
            { url: "http://localhost:4001/profile", isDefault: true },
          ],
          env: "development",
          roleSlug: "any",
          description:
            "Local development - redirects to profile page after login",
        } as OrgRedirectionSetting);
      }

      // Add Production redirect if not exists
      if (!hasProductionRedirection) {
        newRedirections.push({
          authPageUrl: authDomain,
          redirectionUrls: [{ url: `${authDomain}/profile`, isDefault: true }],
          env: "production",
          roleSlug: "any",
          description: "Production - redirects to profile page after login",
        } as OrgRedirectionSetting);
      }

      // Only update if we added new redirections
      if (newRedirections.length > existingRedirections.length) {
        setFieldValue("orgRedirectionSettings", newRedirections);
      }
    }
  }, [values.authServerUrl, values.orgRedirectionSettings, setFieldValue]);

  return (
    <Fade in timeout={300}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <Business color="primary" />
            <Typography variant="h6">Basic Information</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Essential details about your organization
          </Typography>
        </Grid>

        {/* Important: Save Warning */}
        <Grid item xs={12}>
          <Alert severity="info" icon={<InfoOutlined />}>
            <strong>Important:</strong> Please save all changes before
            navigating to a different section or creating new entries. Unsaved
            changes will be lost.
          </Alert>
        </Grid>

        <Grid item xs={12} md={6}>
          <Field name="orgName">
            {({ field, meta }: FieldProps<string>) => (
              <TextField
                {...field}
                fullWidth
                label="Organization Name *"
                error={meta.touched && Boolean(meta.error)}
                helperText={
                  meta.touched && meta.error
                    ? meta.error
                    : "Enter the full legal name of your organization (2-100 characters)"
                }
              />
            )}
          </Field>
        </Grid>

        <Grid item xs={12} md={6}>
          <Field name="orgEmail">
            {({ field, meta }: FieldProps<string>) => (
              <TextField
                {...field}
                fullWidth
                label="Organization Email *"
                type="email"
                error={meta.touched && Boolean(meta.error)}
                helperText={
                  meta.touched && meta.error
                    ? meta.error
                    : "Primary contact email for official communications"
                }
              />
            )}
          </Field>
        </Grid>

        <Grid item xs={12} md={6}>
          <Field name="orgSlug">
            {({ field, meta }: FieldProps<string>) => (
              <SlugField
                label="Organization Slug *"
                value={field.value}
                disabled
                helperText={
                  meta.touched && meta.error
                    ? meta.error
                    : "Unique identifier (auto-generated from name)"
                }
                error={meta.touched && Boolean(meta.error)}
                required
              />
            )}
          </Field>
        </Grid>

        <Grid item xs={12} md={6}>
          <Field name="orgWebsite">
            {({ field, meta }: FieldProps<string>) => (
              <TextField
                {...field}
                fullWidth
                label="Website *"
                placeholder="https://example.com"
                error={meta.touched && Boolean(meta.error)}
                helperText={
                  meta.touched && meta.error
                    ? meta.error
                    : "Official website URL (must include https:// or http://)"
                }
              />
            )}
          </Field>
        </Grid>

        <Grid item xs={12} md={6}>
          <Field name="authServerUrl">
            {({ field, meta }: FieldProps<string>) => (
              <TextField
                {...field}
                key={field.value || "authServerUrl-empty"}
                fullWidth
                required
                label="Auth Server URL *"
                placeholder="https://auth.example.com"
                error={meta.touched && Boolean(meta.error)}
                helperText={
                  meta.touched && meta.error
                    ? meta.error
                    : "Authentication server URL (auto-generated from website URL). Users will be auto-selected when accessing from this domain."
                }
                InputLabelProps={{
                  shrink: true,
                }}
              />
            )}
          </Field>
        </Grid>

        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={values.orgActiveStatus ?? true}
                onChange={(e) =>
                  setFieldValue("orgActiveStatus", e.target.checked)
                }
              />
            }
            label="Active Status"
          />
          <Typography variant="caption" display="block" color="text.secondary">
            Enable to allow organization access; disable to temporarily suspend
            all operations
          </Typography>
        </Grid>
      </Grid>
    </Fade>
  );
};

export default BasicInfoForm;
