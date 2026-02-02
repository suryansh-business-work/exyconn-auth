import React from "react";
import {
  Box,
  Paper,
  Typography,
  Divider,
  Alert,
  Button,
  Link,
  Chip,
} from "@mui/material";
import {
  Warning,
  AdminPanelSettings,
  InfoOutlined,
  Description,
  OpenInNew,
} from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import { ENV } from "../../config/env";

const OrganizationNotFound: React.FC = () => {
  // API docs base URL
  const apiDocsBaseUrl = ENV.API_BASE_URL.replace("/v1/api", "");

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 3,
        bgcolor: "#f5f7fa",
      }}
    >
      <Box sx={{ maxWidth: 600, width: "100%" }}>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Warning sx={{ fontSize: 48, color: "warning.main", mb: 1 }} />
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
              Organization Not Found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Multi-Tenant Authentication System
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Current Domain */}
          <Alert severity="warning" sx={{ mb: 3 }} icon={false}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              No organization is configured for this domain:
            </Typography>
            <Chip
              label={window.location.hostname}
              variant="outlined"
              color="warning"
              sx={{ fontFamily: "monospace", fontWeight: 600 }}
            />
          </Alert>

          {/* How to Fix */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                mb: 1.5,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <InfoOutlined fontSize="small" color="primary" />
              How to Fix
            </Typography>
            <Box component="ol" sx={{ pl: 2.5, m: 0, "& li": { mb: 1 } }}>
              <Typography component="li" variant="body2">
                Login to <strong>God Portal</strong> with admin credentials
              </Typography>
              <Typography component="li" variant="body2">
                Create or select an organization
              </Typography>
              <Typography component="li" variant="body2">
                Set <strong>Auth Server URL</strong> to:{" "}
                <code
                  style={{
                    background: "#f0f0f0",
                    padding: "2px 6px",
                    borderRadius: 4,
                  }}
                >
                  {window.location.origin}
                </code>
              </Typography>
              <Typography component="li" variant="body2">
                Save and refresh this page
              </Typography>
            </Box>
          </Box>

          {/* Actions */}
          <Box
            sx={{
              display: "flex",
              gap: 1.5,
              flexDirection: { xs: "column", sm: "row" },
              mb: 3,
            }}
          >
            <Button
              variant="contained"
              size="medium"
              startIcon={<AdminPanelSettings />}
              component={RouterLink}
              to="/login/god"
              fullWidth
              sx={{ textTransform: "none", fontWeight: 500 }}
            >
              Go to God Portal
            </Button>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* API Documentation Links */}
          <Box>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                mb: 1.5,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Description fontSize="small" color="primary" />
              API Documentation
            </Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              <Link
                href={`${apiDocsBaseUrl}/god/api-docs`}
                target="_blank"
                rel="noopener noreferrer"
                underline="none"
              >
                <Chip
                  label="God API"
                  size="small"
                  clickable
                  icon={<OpenInNew sx={{ fontSize: 14 }} />}
                  sx={{ "& .MuiChip-icon": { order: 1, ml: 0.5, mr: -0.5 } }}
                />
              </Link>
              <Link
                href={`${apiDocsBaseUrl}/admin/api-docs`}
                target="_blank"
                rel="noopener noreferrer"
                underline="none"
              >
                <Chip
                  label="Admin API"
                  size="small"
                  clickable
                  icon={<OpenInNew sx={{ fontSize: 14 }} />}
                  sx={{ "& .MuiChip-icon": { order: 1, ml: 0.5, mr: -0.5 } }}
                />
              </Link>
              <Link
                href={`${apiDocsBaseUrl}/user/api-docs`}
                target="_blank"
                rel="noopener noreferrer"
                underline="none"
              >
                <Chip
                  label="User API"
                  size="small"
                  clickable
                  icon={<OpenInNew sx={{ fontSize: 14 }} />}
                  sx={{ "& .MuiChip-icon": { order: 1, ml: 0.5, mr: -0.5 } }}
                />
              </Link>
            </Box>
          </Box>

          {/* Footer */}
          <Box
            sx={{
              mt: 3,
              pt: 2,
              borderTop: "1px solid",
              borderColor: "divider",
              textAlign: "center",
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Organizations are auto-detected by domain. Contact your system
              administrator for help.
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default OrganizationNotFound;
