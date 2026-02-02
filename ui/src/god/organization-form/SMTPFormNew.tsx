import React from "react";
import { useFormikContext, Field, FieldProps } from "formik";
import {
  Grid,
  TextField,
  FormControlLabel,
  Switch,
  Typography,
  Box,
  Fade,
  Divider,
} from "@mui/material";
import { Email } from "@mui/icons-material";
import { OrganizationFormData } from "./types";
import { SmtpTerminal } from "./smtp";

const SMTPForm: React.FC = () => {
  const { values, setFieldValue } = useFormikContext<OrganizationFormData>();

  return (
    <Fade in timeout={300}>
      <Grid container spacing={2}>
        {/* Header */}
        <Grid item xs={12}>
          <Box display="flex" alignItems="center" gap={1} mb={0.5}>
            <Email color="primary" />
            <Typography variant="h6">SMTP Configuration</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Configure email server settings for sending transactional emails
          </Typography>
        </Grid>

        {/* SMTP Host */}
        <Grid item xs={12} md={6}>
          <Field name="smtpSettings.host">
            {({ field, meta }: FieldProps<string>) => (
              <TextField
                {...field}
                fullWidth
                size="small"
                label="SMTP Host"
                placeholder="smtp.gmail.com"
                error={meta.touched && Boolean(meta.error)}
                helperText={
                  meta.touched && meta.error
                    ? meta.error
                    : "e.g., smtp.gmail.com"
                }
              />
            )}
          </Field>
        </Grid>

        {/* SMTP Port */}
        <Grid item xs={12} md={6}>
          <Field name="smtpSettings.port">
            {({ field, meta }: FieldProps<number>) => (
              <TextField
                {...field}
                fullWidth
                size="small"
                label="SMTP Port"
                type="number"
                placeholder="587"
                error={meta.touched && Boolean(meta.error)}
                helperText={
                  meta.touched && meta.error
                    ? meta.error
                    : "587 (TLS), 465 (SSL), 25 (plain)"
                }
              />
            )}
          </Field>
        </Grid>

        {/* SMTP Username */}
        <Grid item xs={12} md={6}>
          <Field name="smtpSettings.user">
            {({ field, meta }: FieldProps<string>) => (
              <TextField
                {...field}
                fullWidth
                size="small"
                label="SMTP Username"
                error={meta.touched && Boolean(meta.error)}
                helperText={
                  meta.touched && meta.error
                    ? meta.error
                    : "Email or username for authentication"
                }
              />
            )}
          </Field>
        </Grid>

        {/* SMTP Password */}
        <Grid item xs={12} md={6}>
          <Field name="smtpSettings.pass">
            {({ field, meta }: FieldProps<string>) => (
              <TextField
                {...field}
                fullWidth
                size="small"
                label="SMTP Password"
                type="password"
                error={meta.touched && Boolean(meta.error)}
                helperText={
                  meta.touched && meta.error
                    ? meta.error
                    : "Password or app-specific password"
                }
              />
            )}
          </Field>
        </Grid>

        {/* SSL/TLS Toggle */}
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={values.smtpSettings?.secure ?? false}
                onChange={(e) =>
                  setFieldValue("smtpSettings.secure", e.target.checked)
                }
              />
            }
            label={
              <Typography variant="body2">
                Use SSL/TLS (recommended for ports 465 and 587)
              </Typography>
            }
          />
        </Grid>

        {/* SMTP Terminal */}
        <Grid item xs={12}>
          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle2" gutterBottom sx={{ mt: 1, mb: 1.5 }}>
            Test SMTP Configuration
          </Typography>
          <SmtpTerminal
            smtpConfig={{
              host: values.smtpSettings?.host,
              port: values.smtpSettings?.port,
              secure: values.smtpSettings?.secure,
              user: values.smtpSettings?.user,
              pass: values.smtpSettings?.pass,
            }}
          />
        </Grid>
      </Grid>
    </Fade>
  );
};

export default SMTPForm;
