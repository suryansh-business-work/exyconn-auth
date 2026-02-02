import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Chip,
  Alert,
  alpha,
  useTheme,
  Stack,
  Divider,
} from "@mui/material";
import {
  LocationOn,
  Computer,
  Smartphone,
  Tablet,
  History,
  Public,
  Schedule,
} from "@mui/icons-material";
import { API_ENDPOINTS } from "../../../apis";
import { getRequest, isSuccess, extractData } from "../../../lib/api";

interface LoginHistoryEntry {
  loginAt: string;
  ipAddress: string;
  userAgent: string;
  location?: {
    city?: string;
    country?: string;
  };
}

interface RecentLoginsSectionProps {
  show?: boolean;
}

const getRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)} days ago`;

  return date.toLocaleDateString();
};

const getDeviceIcon = (ua: string) => {
  if (ua.includes("Mobi")) return <Smartphone />;
  if (ua.includes("Tablet") || ua.includes("iPad")) return <Tablet />;
  return <Computer />;
};

const parseBrowser = (ua: string) => {
  if (ua.includes("Chrome")) return "Google Chrome";
  if (ua.includes("Firefox")) return "Mozilla Firefox";
  if (ua.includes("Safari")) return "Apple Safari";
  if (ua.includes("Edge")) return "Microsoft Edge";
  return "Desktop Browser";
};

export const RecentLoginsSection: React.FC<RecentLoginsSectionProps> = ({
  show = true,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loginHistory, setLoginHistory] = useState<LoginHistoryEntry[]>([]);
  const theme = useTheme();

  useEffect(() => {
    if (show) {
      fetchRecentLogins();
    }
  }, [show]);

  const fetchRecentLogins = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getRequest(API_ENDPOINTS.AUTH.RECENT_LOGINS);
      if (isSuccess(response)) {
        const data = extractData<any>(response);
        setLoginHistory(data?.loginHistory || []);
      } else {
        setError("Failed to fetch login history");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch login history");
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py={8}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" variant="outlined" sx={{ borderRadius: 0 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Box display="flex" alignItems="center" gap={1.5} mb={1}>
        <Box
          sx={{
            p: 1,
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            borderRadius: 0,
            color: "primary.main",
          }}
        >
          <History fontSize="small" />
        </Box>
        <Typography variant="h6" fontWeight={700}>
          Session Activity
        </Typography>
      </Box>

      {loginHistory.length === 0 ? (
        <Alert severity="info" variant="outlined" sx={{ borderRadius: 0 }}>
          No login history available yet. Your future sessions will appear here.
        </Alert>
      ) : (
        <Stack spacing={2}>
          {loginHistory.map((entry, index) => {
            const isLatest = index === 0;
            return (
              <Paper
                key={index}
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 0,
                  border: "1px solid",
                  borderColor: isLatest
                    ? alpha(theme.palette.primary.main, 0.3)
                    : "divider",
                  bgcolor: isLatest
                    ? alpha(theme.palette.primary.main, 0.02)
                    : "background.paper",
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                  transition: "transform 0.2s ease",
                  "&:hover": {
                    transform: "translateX(4px)",
                    borderColor: "primary.main",
                  },
                }}
              >
                <Box
                  sx={{
                    p: 2,
                    bgcolor: alpha(
                      isLatest
                        ? theme.palette.primary.main
                        : theme.palette.action.disabled,
                      0.1,
                    ),
                    borderRadius: 0,
                    color: isLatest ? "primary.main" : "text.secondary",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {getDeviceIcon(entry.userAgent)}
                </Box>

                <Box sx={{ flexGrow: 1 }}>
                  <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                    <Typography variant="subtitle1" fontWeight={700}>
                      {parseBrowser(entry.userAgent)}
                    </Typography>
                    {isLatest && (
                      <Chip
                        label="ACTIVE"
                        size="small"
                        color="success"
                        sx={{ height: 20, fontSize: 10, fontWeight: 800 }}
                      />
                    )}
                  </Box>

                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <Public sx={{ fontSize: 14, color: "text.secondary" }} />
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        fontWeight={500}
                      >
                        {entry.ipAddress === "127.0.0.1" ||
                        entry.ipAddress === "::1"
                          ? "Local Dev"
                          : entry.ipAddress}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <LocationOn
                        sx={{ fontSize: 14, color: "text.secondary" }}
                      />
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        fontWeight={500}
                      >
                        {(() => {
                          if (
                            entry.location?.city === "Local Dev" &&
                            entry.location?.country === "Local Dev"
                          )
                            return "Local Dev";
                          return (
                            [entry.location?.city, entry.location?.country]
                              .filter(Boolean)
                              .join(", ") || "Unknown Location"
                          );
                        })()}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <Schedule
                        sx={{ fontSize: 14, color: "text.secondary" }}
                      />
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        fontWeight={500}
                      >
                        {getRelativeTime(entry.loginAt)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: { xs: "none", sm: "block" },
                    textAlign: "right",
                  }}
                >
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    color="text.primary"
                  >
                    {new Date(entry.loginAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(entry.loginAt).toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Typography>
                </Box>
              </Paper>
            );
          })}
        </Stack>
      )}

      <Divider sx={{ my: 1, opacity: 0.5 }} />
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ textAlign: "center", opacity: 0.8 }}
      >
        Showing the most recent {loginHistory.length} login sessions. For
        security, only the last 20 entries are retained.
      </Typography>
    </Box>
  );
};
