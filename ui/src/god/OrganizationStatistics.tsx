import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  IconButton,
  Chip,
  Container,
  Button,
  Avatar,
  alpha,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  People as PeopleIcon,
  VerifiedUser as VerifiedUserIcon,
  DoNotDisturb as UnverifiedIcon,
  AdminPanelSettings as AdminIcon,
  Person as UserIcon,
  Google as GoogleIcon,
  Email as EmailIcon,
  BarChart as BarChartIcon,
} from "@mui/icons-material";
import { API_ENDPOINTS } from "../apis";
import { getRequest, extractData, parseError } from "../lib/api";
import { usePageTitle } from "@exyconn/common/client/hooks";
import { clientLogger } from "@exyconn/common/client/logger";

interface OrgData {
  orgName?: string;
}

interface StatisticsData {
  total?: number;
  verified?: number;
  unverified?: number;
  byRole?: Record<string, number>;
  byProvider?: Record<string, number>;
  recentUsers?: RecentUser[];
}

interface RecentUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
}

interface Statistics {
  total: number;
  verified: number;
  unverified: number;
  byRole: Record<string, number>;
  byProvider: Record<string, number>;
  recentUsers: RecentUser[];
}

const OrganizationStatistics: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  usePageTitle("Statistics | God Panel");

  const [statistics, setStatistics] = useState<Statistics>({
    total: 0,
    verified: 0,
    unverified: 0,
    byRole: {},
    byProvider: {},
    recentUsers: [],
  });
  const [organizationName, setOrganizationName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch organization details
        const orgResponse = await getRequest(
          `${API_ENDPOINTS.GOD.ORGANIZATIONS}/${id}`,
        );
        const orgData = extractData<OrgData>(orgResponse);
        setOrganizationName(orgData?.orgName || "");

        // Fetch statistics
        const statsResponse = await getRequest(
          API_ENDPOINTS.GOD.USER_STATISTICS,
          {
            organizationId: id || "",
          },
        );

        const statsData = extractData<StatisticsData>(statsResponse);
        setStatistics({
          total: statsData?.total || 0,
          verified: statsData?.verified || 0,
          unverified: statsData?.unverified || 0,
          byRole: statsData?.byRole || {},
          byProvider: statsData?.byProvider || {},
          recentUsers: statsData?.recentUsers || [],
        });

        setError(null);
      } catch (err: any) {
        const parsedError = parseError(err);
        setError(parsedError.message || "Failed to fetch statistics");
        clientLogger.error("Error fetching statistics:", { error: err });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
          }}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <IconButton
              onClick={() => navigate("/god/organizations")}
              sx={{
                bgcolor: alpha("#1976d2", 0.08),
                "&:hover": { bgcolor: alpha("#1976d2", 0.15) },
              }}
            >
              <ArrowBackIcon color="primary" />
            </IconButton>
            <BarChartIcon sx={{ fontSize: 28, color: "primary.main" }} />
            <Typography variant="h5" fontWeight={600}>
              Organization Statistics
            </Typography>
          </Box>
        </Paper>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  const StatCard: React.FC<{
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
  }> = ({ title, value, icon, color, bgColor }) => (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-start"
      >
        <Box>
          <Typography
            variant="body2"
            color="text.secondary"
            gutterBottom
            fontWeight={500}
          >
            {title}
          </Typography>
          <Typography variant="h3" fontWeight={700} color={color}>
            {value}
          </Typography>
        </Box>
        <Box
          sx={{
            bgcolor: bgColor,
            borderRadius: 2,
            p: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </Box>
      </Box>
    </Paper>
  );

  const roleEntries = Object.entries(statistics.byRole);
  const providerEntries = Object.entries(statistics.byProvider);
  const hasRoleData = roleEntries.length > 0;
  const hasProviderData = providerEntries.length > 0;
  const hasRecentUsers = statistics.recentUsers.length > 0;

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header Section */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          bgcolor: "background.paper",
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={2}>
            <IconButton
              onClick={() => navigate("/god/organizations")}
              sx={{
                bgcolor: alpha("#1976d2", 0.08),
                "&:hover": { bgcolor: alpha("#1976d2", 0.15) },
              }}
            >
              <ArrowBackIcon color="primary" />
            </IconButton>
            <BarChartIcon sx={{ fontSize: 28, color: "primary.main" }} />
            <Box>
              <Typography
                variant="h5"
                component="h1"
                fontWeight={600}
                color="text.primary"
              >
                Statistics
              </Typography>
              {organizationName && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  {organizationName}
                </Typography>
              )}
            </Box>
          </Box>
          <Button
            variant="outlined"
            startIcon={<PeopleIcon />}
            onClick={() => navigate(`/god/organization/${id}/users`)}
            size="medium"
            sx={{
              borderRadius: 2,
              px: 2.5,
              py: 1,
              fontWeight: 500,
              textTransform: "none",
              borderColor: alpha("#1976d2", 0.5),
              color: "primary.main",
              "&:hover": {
                borderColor: "primary.main",
                bgcolor: alpha("#1976d2", 0.08),
                transform: "translateY(-1px)",
              },
              transition: "all 0.2s ease",
            }}
          >
            View Users
          </Button>
        </Box>
      </Paper>

      {/* Overview Stats */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Users"
            value={statistics.total}
            icon={<PeopleIcon sx={{ color: "primary.main", fontSize: 28 }} />}
            color="primary.main"
            bgColor={alpha("#1976d2", 0.1)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Verified Users"
            value={statistics.verified}
            icon={
              <VerifiedUserIcon sx={{ color: "success.main", fontSize: 28 }} />
            }
            color="success.main"
            bgColor={alpha("#2e7d32", 0.1)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Unverified Users"
            value={statistics.unverified}
            icon={
              <UnverifiedIcon sx={{ color: "warning.main", fontSize: 28 }} />
            }
            color="warning.main"
            bgColor={alpha("#ed6c02", 0.1)}
          />
        </Grid>
      </Grid>

      {/* Distribution Section - Only show if data exists */}
      {(hasRoleData || hasProviderData) && (
        <Grid container spacing={2} mb={3}>
          {/* Role Distribution */}
          {hasRoleData && (
            <Grid item xs={12} md={hasProviderData ? 6 : 12}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Typography variant="h6" fontWeight={600} mb={2.5}>
                  Role Distribution
                </Typography>
                <Box display="flex" flexDirection="column" gap={1.5}>
                  {roleEntries.map(([role, count]) => (
                    <Box
                      key={role}
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: alpha("#1976d2", 0.04),
                        border: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={1.5}>
                        {role === "admin" ? (
                          <AdminIcon
                            sx={{ color: "error.main", fontSize: 22 }}
                          />
                        ) : (
                          <UserIcon
                            sx={{ color: "primary.main", fontSize: 22 }}
                          />
                        )}
                        <Typography
                          variant="body1"
                          textTransform="capitalize"
                          fontWeight={500}
                        >
                          {role}
                        </Typography>
                      </Box>
                      <Chip
                        label={count}
                        color={role === "admin" ? "error" : "primary"}
                        size="small"
                        sx={{ fontWeight: 600, minWidth: 40 }}
                      />
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Grid>
          )}

          {/* Provider Distribution */}
          {hasProviderData && (
            <Grid item xs={12} md={hasRoleData ? 6 : 12}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Typography variant="h6" fontWeight={600} mb={2.5}>
                  Authentication Provider
                </Typography>
                <Box display="flex" flexDirection="column" gap={1.5}>
                  {providerEntries.map(([provider, count]) => (
                    <Box
                      key={provider}
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: alpha("#1976d2", 0.04),
                        border: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={1.5}>
                        {provider === "google" ? (
                          <GoogleIcon sx={{ color: "#4285f4", fontSize: 22 }} />
                        ) : (
                          <EmailIcon
                            sx={{ color: "success.main", fontSize: 22 }}
                          />
                        )}
                        <Typography
                          variant="body1"
                          textTransform="capitalize"
                          fontWeight={500}
                        >
                          {provider}
                        </Typography>
                      </Box>
                      <Chip
                        label={count}
                        color={provider === "google" ? "info" : "success"}
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 600, minWidth: 40 }}
                      />
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Grid>
          )}
        </Grid>
      )}

      {/* Recent Users Section - Only show if data exists */}
      {hasRecentUsers && (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" fontWeight={600} mb={2.5}>
            Recent Users
          </Typography>
          <Box display="flex" flexDirection="column" gap={1.5}>
            {statistics.recentUsers.map((user) => (
              <Box
                key={user._id}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: alpha("#1976d2", 0.02),
                  border: "1px solid",
                  borderColor: "divider",
                  "&:hover": {
                    bgcolor: alpha("#1976d2", 0.05),
                  },
                  transition: "background-color 0.15s ease",
                }}
              >
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: "primary.main",
                      fontSize: "0.9rem",
                      fontWeight: 600,
                    }}
                  >
                    {user.firstName?.[0] || user.email[0].toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="body1" fontWeight={500}>
                      {user.firstName} {user.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {user.email}
                    </Typography>
                  </Box>
                </Box>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <Chip
                    label={user.role}
                    color={user.role === "admin" ? "error" : "primary"}
                    size="small"
                    sx={{ fontWeight: 500, textTransform: "capitalize" }}
                  />
                  <Chip
                    label={user.isVerified ? "Verified" : "Unverified"}
                    color={user.isVerified ? "success" : "warning"}
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 500 }}
                  />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ ml: 1, minWidth: 80 }}
                  >
                    {new Date(user.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Paper>
      )}
    </Container>
  );
};

export default OrganizationStatistics;
