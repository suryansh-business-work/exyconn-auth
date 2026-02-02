import React from "react";
import {
  Box,
  Typography,
  Chip,
  Paper,
  Grid,
  Tooltip,
  Alert,
  CircularProgress,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import {
  Security,
  CheckCircle,
  Cancel,
  Info,
  Verified,
} from "@mui/icons-material";
import { RoleDetails } from "../../../contexts/AuthContext";

interface RoleSectionProps {
  roleDetails?: RoleDetails | null;
  roleName: string;
  show: boolean;
  loading?: boolean;
}

export const RoleSection: React.FC<RoleSectionProps> = ({
  roleDetails,
  roleName,
  show,
  loading,
}) => {
  const theme = useTheme();

  if (!show) return null;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  const groupedPermissions =
    roleDetails?.permissions?.reduce(
      (acc, perm) => {
        if (!acc[perm.resource]) acc[perm.resource] = [];
        acc[perm.resource].push(perm);
        return acc;
      },
      {} as Record<string, typeof roleDetails.permissions>,
    ) || {};

  const hasPermissions =
    roleDetails?.permissions && roleDetails.permissions.length > 0;

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      {/* Role Info */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 0,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box display="flex" alignItems="center" gap={1.5} mb={3}>
          <Box
            sx={{
              p: 1,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              borderRadius: 0,
              color: "primary.main",
            }}
          >
            <Verified fontSize="small" />
          </Box>
          <Typography variant="h6" fontWeight={700}>
            Role Information
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            Current Designation:
          </Typography>
          <Chip
            label={roleDetails?.name || roleName}
            color="primary"
            variant="filled"
            sx={{ fontWeight: 700, borderRadius: 0 }}
            icon={
              roleDetails?.isSystem ? (
                <Security sx={{ fontSize: "16px !important" }} />
              ) : undefined
            }
          />
          {roleDetails?.isDefault && (
            <Chip
              label="Primary Role"
              size="small"
              color="success"
              sx={{
                fontWeight: 600,
                borderRadius: 0,
                bgcolor: alpha(theme.palette.success.main, 0.1),
                color: "success.main",
                border: "none",
              }}
            />
          )}
        </Box>

        {roleDetails?.description && (
          <Box
            sx={{
              p: 2,
              bgcolor: "action.hover",
              borderRadius: 0,
              display: "flex",
              gap: 1.5,
              alignItems: "flex-start",
            }}
          >
            <Info fontSize="small" color="primary" sx={{ mt: 0.2 }} />
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ lineHeight: 1.6 }}
            >
              {roleDetails.description}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Permissions */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 0,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box display="flex" alignItems="center" gap={1.5} mb={4}>
          <Box
            sx={{
              p: 1,
              bgcolor: alpha(theme.palette.secondary.main, 0.1),
              borderRadius: 0,
              color: "secondary.main",
            }}
          >
            <Security fontSize="small" />
          </Box>
          <Typography variant="h6" fontWeight={700}>
            Access Permissions
          </Typography>
        </Box>

        {hasPermissions ? (
          <Grid container spacing={4}>
            {Object.entries(groupedPermissions).map(([resource, perms]) => (
              <Grid item xs={12} sm={6} key={resource}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    textTransform: "uppercase",
                    fontWeight: 800,
                    letterSpacing: 1,
                    display: "block",
                    mb: 1.5,
                  }}
                >
                  {resource}
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {perms.map((perm, idx) => (
                    <Tooltip
                      key={idx}
                      title={perm.allowed ? "Access Granted" : "Access Denied"}
                      arrow
                    >
                      <Chip
                        size="small"
                        label={perm.action}
                        icon={
                          perm.allowed ? (
                            <CheckCircle sx={{ fontSize: "14px !important" }} />
                          ) : (
                            <Cancel sx={{ fontSize: "14px !important" }} />
                          )
                        }
                        sx={{
                          textTransform: "capitalize",
                          fontWeight: 600,
                          borderRadius: 0,
                          bgcolor: perm.allowed
                            ? alpha(theme.palette.success.main, 0.05)
                            : alpha(theme.palette.error.main, 0.05),
                          color: perm.allowed ? "success.main" : "error.main",
                          border: "1px solid",
                          borderColor: perm.allowed
                            ? alpha(theme.palette.success.main, 0.2)
                            : alpha(theme.palette.error.main, 0.2),
                        }}
                      />
                    </Tooltip>
                  ))}
                </Box>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Alert
            severity="info"
            variant="outlined"
            sx={{ borderRadius: 0, border: "1.5px solid" }}
          >
            No specific access permissions have been assigned to this role yet.
          </Alert>
        )}
      </Paper>
    </Box>
  );
};
