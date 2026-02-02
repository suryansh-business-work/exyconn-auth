import React from "react";
import { useFormikContext } from "formik";
import {
  Box,
  Typography,
  Alert,
  Paper,
  Chip,
  Divider,
  Card,
  CardContent,
} from "@mui/material";
import {
  Settings as SettingsIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import { OrganizationFormData } from "./types";

interface ConfigurationCheck {
  id: string;
  name: string;
  description: string;
  category: "critical" | "warning" | "info";
  check: (values: OrganizationFormData) => boolean;
  fixPath?: string;
}

// Define all configuration checks
const configurationChecks: ConfigurationCheck[] = [
  // Critical Checks
  {
    id: "smtp_configured",
    name: "SMTP Settings",
    description: "Email server configuration for sending transactional emails",
    category: "critical",
    check: (values) =>
      Boolean(
        values.smtpSettings?.host &&
        values.smtpSettings?.user &&
        values.smtpSettings?.pass,
      ),
    fixPath: "smtp",
  },
  {
    id: "redirection_configured",
    name: "Redirection Settings",
    description: "Post-authentication redirect URLs for your application",
    category: "critical",
    check: (values) =>
      Boolean(
        values.orgRedirectionSettings &&
        values.orgRedirectionSettings.length > 0,
      ),
    fixPath: "redirections",
  },
  // Warning Checks
  {
    id: "oauth_google_complete",
    name: "Google OAuth",
    description: "Google OAuth is enabled but credentials may be missing",
    category: "warning",
    check: (values) => {
      if (!values.oauthSettings?.google?.enabled) return true; // Not enabled, so not a problem
      return Boolean(
        values.oauthSettings?.google?.clientId &&
        values.oauthSettings?.google?.clientSecret,
      );
    },
    fixPath: "oauth",
  },
  {
    id: "policy_links",
    name: "Policy Links",
    description: "Privacy Policy, Terms of Service, and Data Policy links",
    category: "warning",
    check: (values) =>
      Boolean(values.orgPoliciesLink && values.orgPoliciesLink.length > 0),
    fixPath: "policies",
  },
  {
    id: "branding_logos",
    name: "Organization Logos",
    description: "Brand logos for login and email templates",
    category: "info",
    check: (values) => Boolean(values.orgLogos && values.orgLogos.length > 0),
    fixPath: "branding-logos",
  },
  {
    id: "jwt_settings",
    name: "JWT Configuration",
    description: "JWT token signing configuration",
    category: "info",
    check: (values) => Boolean(values.jwtSettings?.tokenSignKey),
    fixPath: "jwt",
  },
  {
    id: "roles_configured",
    name: "Role Management",
    description: "User roles and permissions",
    category: "info",
    check: (values) => Boolean(values.roles && values.roles.length > 0),
    fixPath: "roles",
  },
];

const ConfigurationSettingsForm: React.FC = () => {
  const { values } = useFormikContext<OrganizationFormData>();

  // Group checks by category
  const criticalIssues = configurationChecks.filter(
    (c) => c.category === "critical" && !c.check(values),
  );
  const warningIssues = configurationChecks.filter(
    (c) => c.category === "warning" && !c.check(values),
  );
  const infoIssues = configurationChecks.filter(
    (c) => c.category === "info" && !c.check(values),
  );

  const passedChecks = configurationChecks.filter((c) => c.check(values));
  const totalChecks = configurationChecks.length;
  const passedCount = passedChecks.length;
  const completionPercentage = Math.round((passedCount / totalChecks) * 100);

  return (
    <Box>
      <Typography
        variant="h6"
        gutterBottom
        sx={{ display: "flex", alignItems: "center", gap: 1 }}
      >
        <SettingsIcon color="primary" />
        Configuration Health Check
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Review your organization's configuration status. These warnings will be
        shown on the login page during development to help identify missing
        configurations.
      </Typography>

      {/* Overall Status Card */}
      <Card
        sx={{
          mb: 3,
          bgcolor:
            completionPercentage === 100 ? "success.light" : "warning.light",
        }}
      >
        <CardContent>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box>
              <Typography variant="h4" fontWeight="bold">
                {completionPercentage}%
              </Typography>
              <Typography variant="body2">
                Configuration Complete ({passedCount}/{totalChecks} checks
                passed)
              </Typography>
            </Box>
            {completionPercentage === 100 ? (
              <CheckCircleIcon sx={{ fontSize: 48, color: "success.dark" }} />
            ) : (
              <WarningIcon sx={{ fontSize: 48, color: "warning.dark" }} />
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Critical Issues */}
      {criticalIssues.length > 0 && (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 2,
            border: "2px solid",
            borderColor: "error.main",
            bgcolor: "error.lighter",
          }}
        >
          <Typography
            variant="subtitle1"
            color="error.dark"
            fontWeight="bold"
            gutterBottom
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <ErrorIcon /> Critical Issues ({criticalIssues.length})
          </Typography>
          <Typography variant="body2" color="error.dark" paragraph>
            These configurations are essential for your authentication system to
            work properly.
          </Typography>
          {criticalIssues.map((issue) => (
            <Alert key={issue.id} severity="error" sx={{ mb: 1 }}>
              <strong>{issue.name}:</strong> {issue.description}
            </Alert>
          ))}
        </Paper>
      )}

      {/* Warning Issues */}
      {warningIssues.length > 0 && (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 2,
            border: "1px solid",
            borderColor: "warning.main",
            bgcolor: "warning.lighter",
          }}
        >
          <Typography
            variant="subtitle1"
            color="warning.dark"
            fontWeight="bold"
            gutterBottom
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <WarningIcon /> Warnings ({warningIssues.length})
          </Typography>
          <Typography variant="body2" color="warning.dark" paragraph>
            These configurations are recommended for a complete authentication
            experience.
          </Typography>
          {warningIssues.map((issue) => (
            <Alert key={issue.id} severity="warning" sx={{ mb: 1 }}>
              <strong>{issue.name}:</strong> {issue.description}
            </Alert>
          ))}
        </Paper>
      )}

      {/* Info Issues */}
      {infoIssues.length > 0 && (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 2,
            border: "1px solid",
            borderColor: "info.main",
            bgcolor: "info.lighter",
          }}
        >
          <Typography
            variant="subtitle1"
            color="info.dark"
            fontWeight="bold"
            gutterBottom
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <InfoIcon /> Suggestions ({infoIssues.length})
          </Typography>
          <Typography variant="body2" color="info.dark" paragraph>
            Optional configurations that enhance your authentication system.
          </Typography>
          {infoIssues.map((issue) => (
            <Alert key={issue.id} severity="info" sx={{ mb: 1 }}>
              <strong>{issue.name}:</strong> {issue.description}
            </Alert>
          ))}
        </Paper>
      )}

      {/* Passed Checks */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          border: "1px solid",
          borderColor: "success.main",
          bgcolor: "success.lighter",
        }}
      >
        <Typography
          variant="subtitle1"
          color="success.dark"
          fontWeight="bold"
          gutterBottom
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <CheckCircleIcon /> Configured ({passedChecks.length})
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={1}>
          {passedChecks.map((check) => (
            <Chip
              key={check.id}
              label={check.name}
              color="success"
              size="small"
              icon={<CheckCircleIcon />}
            />
          ))}
        </Box>
      </Paper>

      {/* Login Page Warning Settings */}
      <Divider sx={{ my: 3 }} />

      <Typography variant="subtitle1" gutterBottom>
        Login Page Configuration Warning Display
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        These settings control how configuration warnings are displayed on the
        login page. In production, warnings are never shown regardless of these
        settings.
      </Typography>

      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">
          <strong>Note:</strong> Configuration warnings are automatically shown
          only in development mode. This helps developers identify missing
          configurations without affecting production users.
        </Typography>
      </Alert>
    </Box>
  );
};

export default ConfigurationSettingsForm;

// Export configuration checks for use in Login page
export { configurationChecks };
export type { ConfigurationCheck };
