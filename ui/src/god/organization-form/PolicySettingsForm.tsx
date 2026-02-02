import React from "react";
import { useFormikContext } from "formik";
import {
  Box,
  Typography,
  TextField,
  Grid,
  Alert,
  Paper,
  Chip,
  InputAdornment,
} from "@mui/material";
import {
  Info as InfoIcon,
  Policy as PolicyIcon,
  OpenInNew as ExternalIcon,
  Link as LinkIcon,
} from "@mui/icons-material";
import { OrganizationFormData } from "./types";

interface PolicyField {
  name: string;
  label: string;
  description: string;
  placeholder: string;
  required: boolean;
}

const policyFields: PolicyField[] = [
  {
    name: "termsAndConditions",
    label: "Terms & Conditions",
    description: "Link to your Terms of Service page (required for login)",
    placeholder: "https://yourdomain.com/terms",
    required: true,
  },
  {
    name: "privacyPolicy",
    label: "Privacy Policy",
    description: "Link to your Privacy Policy page (required for login)",
    placeholder: "https://yourdomain.com/privacy",
    required: true,
  },
  {
    name: "dataPolicy",
    label: "Data Policy",
    description: "Link to your Data Policy/GDPR compliance page (optional)",
    placeholder: "https://yourdomain.com/data-policy",
    required: false,
  },
  {
    name: "cookiePolicy",
    label: "Cookie Policy",
    description: "Link to your Cookie Policy page (optional)",
    placeholder: "https://yourdomain.com/cookies",
    required: false,
  },
  {
    name: "refundPolicy",
    label: "Refund Policy",
    description: "Link to your Refund Policy page (optional, for e-commerce)",
    placeholder: "https://yourdomain.com/refund",
    required: false,
  },
];

const PolicySettingsForm: React.FC = () => {
  const { values, setFieldValue } = useFormikContext<OrganizationFormData>();

  const orgPoliciesLink = values.orgPoliciesLink || [];

  const getPolicyValue = (policyName: string): string => {
    const policy = orgPoliciesLink.find((p) => p.policyName === policyName);
    return policy?.policyLink || "";
  };

  const handlePolicyChange = (policyName: string, value: string) => {
    const existingIndex = orgPoliciesLink.findIndex(
      (p) => p.policyName === policyName,
    );

    if (existingIndex >= 0) {
      // Update existing
      const updated = [...orgPoliciesLink];
      if (value.trim()) {
        updated[existingIndex] = { policyName, policyLink: value };
      } else {
        // Remove if empty
        updated.splice(existingIndex, 1);
      }
      setFieldValue("orgPoliciesLink", updated);
    } else if (value.trim()) {
      // Add new only if value is not empty
      setFieldValue("orgPoliciesLink", [
        ...orgPoliciesLink,
        { policyName, policyLink: value },
      ]);
    }
  };

  // Check if URL is external
  const isExternalUrl = (url: string): boolean => {
    if (!url) return false;
    try {
      const urlObj = new URL(url);
      return urlObj.hostname !== window.location.hostname;
    } catch {
      return false;
    }
  };

  // Count configured policies
  const configuredCount = policyFields.filter((f) =>
    getPolicyValue(f.name),
  ).length;
  const requiredCount = policyFields.filter((f) => f.required).length;
  const configuredRequiredCount = policyFields.filter(
    (f) => f.required && getPolicyValue(f.name),
  ).length;

  return (
    <Box>
      <Typography
        variant="h6"
        gutterBottom
        sx={{ display: "flex", alignItems: "center", gap: 1 }}
      >
        <PolicyIcon color="primary" />
        Policy Links
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Configure links to your organization's legal policies. These links will
        be displayed on the login page and users will be redirected to the
        configured URLs when they click on them.
      </Typography>

      {/* Status Chips */}
      <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
        <Chip
          label={`${configuredCount}/${policyFields.length} Configured`}
          color={configuredCount > 0 ? "success" : "default"}
          size="small"
        />
        <Chip
          label={`${configuredRequiredCount}/${requiredCount} Required`}
          color={
            configuredRequiredCount === requiredCount ? "success" : "warning"
          }
          size="small"
        />
      </Box>

      {/* Info Alert */}
      <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Tip:</strong> External URLs will show an external link icon
          (↗) on the login page. If no links are configured, default internal
          pages will be used. URLs must include <code>https://</code>.
        </Typography>
      </Alert>

      <Paper
        elevation={0}
        sx={{
          p: 3,
          bgcolor: "background.default",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
        }}
      >
        <Grid container spacing={3}>
          {policyFields.map((field) => {
            const value = getPolicyValue(field.name);
            const isExternal = isExternalUrl(value);

            return (
              <Grid item xs={12} key={field.name}>
                <TextField
                  fullWidth
                  label={
                    <Box
                      component="span"
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      {field.label}
                      {field.required && (
                        <Typography component="span" color="error">
                          *
                        </Typography>
                      )}
                    </Box>
                  }
                  value={value}
                  onChange={(e) =>
                    handlePolicyChange(field.name, e.target.value)
                  }
                  placeholder={field.placeholder}
                  helperText={
                    <Box
                      component="span"
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      {field.description}
                      {isExternal && (
                        <Chip
                          label="External"
                          size="small"
                          color="info"
                          icon={
                            <ExternalIcon
                              sx={{ fontSize: "14px !important" }}
                            />
                          }
                          sx={{ ml: 1, height: 20 }}
                        />
                      )}
                    </Box>
                  }
                  InputProps={{
                    sx: { fontFamily: "monospace" },
                    startAdornment: value ? (
                      <InputAdornment position="start">
                        {isExternal ? (
                          <ExternalIcon color="action" />
                        ) : (
                          <LinkIcon color="action" />
                        )}
                      </InputAdornment>
                    ) : undefined,
                  }}
                />
              </Grid>
            );
          })}
        </Grid>
      </Paper>

      {/* Preview Section */}
      <Box
        sx={{
          mt: 3,
          p: 2,
          bgcolor: "grey.50",
          borderRadius: 2,
          border: "1px dashed",
          borderColor: "grey.300",
        }}
      >
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Preview (Login Page Footer)
        </Typography>
        <Typography variant="body2" color="text.secondary">
          By logging in, you agree to our{" "}
          {policyFields
            .filter((f) => f.required || getPolicyValue(f.name))
            .map((field, index, arr) => {
              const value = getPolicyValue(field.name);
              const isExternal = isExternalUrl(value);
              const isLast = index === arr.length - 1;
              const isSecondLast = index === arr.length - 2;

              return (
                <React.Fragment key={field.name}>
                  <Typography
                    component="span"
                    variant="body2"
                    color="primary"
                    sx={{
                      textDecoration: "underline",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 0.3,
                    }}
                  >
                    {field.label}
                    {isExternal && <ExternalIcon sx={{ fontSize: 12 }} />}
                  </Typography>
                  {!isLast && (isSecondLast ? ", and " : ", ")}
                </React.Fragment>
              );
            })}
          .
        </Typography>
      </Box>
    </Box>
  );
};

export default PolicySettingsForm;
