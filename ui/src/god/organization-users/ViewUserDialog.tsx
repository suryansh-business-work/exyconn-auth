import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Divider,
  Avatar,
} from "@mui/material";
import {
  Email as EmailIcon,
  Person as PersonIcon,
  Shield as ShieldIcon,
  CalendarToday as CalendarIcon,
  Login as LoginIcon,
} from "@mui/icons-material";
import type { GodUser } from "../../types/god";

interface ViewUserDialogProps {
  open: boolean;
  user: GodUser | null;
  onClose: () => void;
}

const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | React.ReactNode;
}) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 2, py: 1.5 }}>
    <Box
      sx={{ color: "primary.main", display: "flex", alignItems: "center" }}
    >
      {icon}
    </Box>
    <Box sx={{ flex: 1 }}>
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={500} component="div">
        {value}
      </Typography>
    </Box>
  </Box>
);

const ViewUserDialog: React.FC<ViewUserDialogProps> = ({
  open,
  user,
  onClose,
}) => {
  if (!user) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600, pb: 2 }}>User Details</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* User Avatar and Name */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, pb: 2 }}>
            <Avatar
              src={user.profilePicture}
              sx={{
                width: 64,
                height: 64,
                bgcolor: "primary.main",
                fontSize: "1.5rem",
                fontWeight: 600,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              {user.firstName?.[0] || user.email[0].toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={600}>
                {user.firstName} {user.lastName}
              </Typography>
              <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
                <Chip
                  label={user.role}
                  color={user.role === "admin" ? "error" : "primary"}
                  size="small"
                  sx={{ textTransform: "capitalize", fontWeight: 500 }}
                />
                <Chip
                  label={user.isVerified ? "Verified" : "Unverified"}
                  color={user.isVerified ? "success" : "warning"}
                  size="small"
                  variant="outlined"
                  sx={{ fontWeight: 500 }}
                />
                {user.mfaEnabled && (
                  <Chip
                    icon={<ShieldIcon style={{ fontSize: "1rem" }} />}
                    label="MFA Enabled"
                    color="info"
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 500 }}
                  />
                )}
              </Box>
            </Box>
          </Box>

          <Divider />

          {/* User Information */}
          <Box>
            <InfoRow
              icon={<EmailIcon fontSize="small" />}
              label="Email"
              value={user.email}
            />
            <InfoRow
              icon={<PersonIcon fontSize="small" />}
              label="Full Name"
              value={`${user.firstName} ${user.lastName}`}
            />
            {user.provider && (
              <InfoRow
                icon={<LoginIcon fontSize="small" />}
                label="Provider"
                value={
                  <Chip
                    label={user.provider}
                    size="small"
                    variant="outlined"
                    sx={{ textTransform: "capitalize" }}
                  />
                }
              />
            )}
            <InfoRow
              icon={<CalendarIcon fontSize="small" />}
              label="Joined"
              value={new Date(user.createdAt).toLocaleString()}
            />
            {user.lastLoginAt && (
              <InfoRow
                icon={<CalendarIcon fontSize="small" />}
                label="Last Login"
                value={
                  <Box>
                    {new Date(user.lastLoginAt).toLocaleString()}
                    {user.lastLoginIp && (
                      <Typography
                        variant="caption"
                        display="block"
                        color="text.secondary"
                      >
                        IP: {user.lastLoginIp}
                      </Typography>
                    )}
                  </Box>
                }
              />
            )}

            {user.loginHistory && user.loginHistory.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Recent Login History
                </Typography>
                <Box
                  sx={{
                    maxHeight: 150,
                    overflow: "auto",
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                  }}
                >
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: "0.8rem",
                    }}
                  >
                    <thead>
                      <tr style={{ background: "#f5f5f5", textAlign: "left" }}>
                        <th style={{ padding: "8px" }}>Time</th>
                        <th style={{ padding: "8px" }}>IP</th>
                        <th style={{ padding: "8px" }}>Location</th>
                      </tr>
                    </thead>
                    <tbody>
                      {user.loginHistory.slice(0, 10).map((h, i) => (
                        <tr key={i} style={{ borderTop: "1px solid #eee" }}>
                          <td style={{ padding: "8px" }}>
                            {new Date(h.loginAt).toLocaleString()}
                          </td>
                          <td style={{ padding: "8px" }}>
                            {["127.0.0.1", "::1"].includes(h.ipAddress)
                              ? "Local Dev"
                              : h.ipAddress}
                          </td>
                          <td style={{ padding: "8px" }}>
                            {(() => {
                              if (h.location?.city === "Local Dev")
                                return "Local Dev";
                              return (
                                [h.location?.city, h.location?.country]
                                  .filter(Boolean)
                                  .join(", ") || "Unknown Location"
                              );
                            })()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewUserDialog;
