import React from "react";
import { useFormikContext, Field, FieldProps } from "formik";
import {
  Grid,
  TextField,
  FormControlLabel,
  Switch,
  Typography,
  Box,
  Divider,
  Fade,
} from "@mui/material";
import { Security } from "@mui/icons-material";
import { OrganizationFormData } from "./types";

const SecurityForm: React.FC = () => {
  const { values, setFieldValue } = useFormikContext<OrganizationFormData>();

  return (
    <Fade in timeout={300}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <Security color="primary" />
            <Typography variant="h6">Security & Options</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Configure security policies and authentication options
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Multi-Factor Authentication
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={values.orgOptions?.mfaEnabled ?? false}
                  onChange={(e) =>
                    setFieldValue("orgOptions.mfaEnabled", e.target.checked)
                  }
                />
              }
              label="Enable MFA"
            />
            <Typography
              variant="caption"
              display="block"
              color="text.secondary"
            >
              Allow users to enable multi-factor authentication
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={values.featureFlags?.mfaRequired ?? false}
                  onChange={(e) =>
                    setFieldValue("featureFlags.mfaRequired", e.target.checked)
                  }
                />
              }
              label="Require MFA"
            />
            <Typography
              variant="caption"
              display="block"
              color="text.secondary"
            >
              Mandate MFA for all users (users cannot disable)
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={values.orgOptions?.lastLoginDetails ?? true}
                  onChange={(e) =>
                    setFieldValue(
                      "orgOptions.lastLoginDetails",
                      e.target.checked,
                    )
                  }
                />
              }
              label="Show Last Login Details"
            />
            <Typography
              variant="caption"
              display="block"
              color="text.secondary"
            >
              Display last login information to users on profile page
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" gutterBottom>
            Password Policy
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <Field name="orgOptions.passwordPolicy.minLength">
            {({ field, meta }: FieldProps<number>) => (
              <TextField
                {...field}
                fullWidth
                label="Minimum Length"
                type="number"
                error={meta.touched && Boolean(meta.error)}
                helperText={
                  meta.touched && meta.error
                    ? meta.error
                    : "Minimum password length (4-128 characters, default: 8)"
                }
              />
            )}
          </Field>
        </Grid>

        <Grid item xs={12} md={6}>
          <Field name="orgOptions.passwordPolicy.expiryDays">
            {({ field, meta }: FieldProps<number>) => (
              <TextField
                {...field}
                fullWidth
                label="Password Expiry (days)"
                type="number"
                error={meta.touched && Boolean(meta.error)}
                helperText={
                  meta.touched && meta.error
                    ? meta.error
                    : "Days until password expires (1-365, default: 90)"
                }
              />
            )}
          </Field>
        </Grid>

        <Grid item xs={12}>
          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={
                    values.orgOptions?.passwordPolicy?.requireUppercase ?? true
                  }
                  onChange={(e) =>
                    setFieldValue(
                      "orgOptions.passwordPolicy.requireUppercase",
                      e.target.checked,
                    )
                  }
                />
              }
              label="Require Uppercase"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={
                    values.orgOptions?.passwordPolicy?.requireLowercase ?? true
                  }
                  onChange={(e) =>
                    setFieldValue(
                      "orgOptions.passwordPolicy.requireLowercase",
                      e.target.checked,
                    )
                  }
                />
              }
              label="Require Lowercase"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={
                    values.orgOptions?.passwordPolicy?.requireNumbers ?? true
                  }
                  onChange={(e) =>
                    setFieldValue(
                      "orgOptions.passwordPolicy.requireNumbers",
                      e.target.checked,
                    )
                  }
                />
              }
              label="Require Numbers"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={
                    values.orgOptions?.passwordPolicy?.requireSpecialChars ??
                    false
                  }
                  onChange={(e) =>
                    setFieldValue(
                      "orgOptions.passwordPolicy.requireSpecialChars",
                      e.target.checked,
                    )
                  }
                />
              }
              label="Require Special Characters"
            />
            <Typography
              variant="caption"
              display="block"
              color="text.secondary"
            >
              Password complexity requirements
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Fade>
  );
};

export default SecurityForm;
