import React, { useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Button,
  Skeleton,
} from "@mui/material";
import {
  People,
  VerifiedUser,
  PersonOff,
  AdminPanelSettings,
  TrendingUp,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import { useAdminLogic } from "./useAdminLogic";
import { useAuth } from "../contexts/AuthContext";
import { usePageTitle } from "@exyconn/common/client/hooks";

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color,
  bgColor,
}) => (
  <Card sx={{ height: "100%" }}>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" fontWeight={700} color={color}>
            {value}
          </Typography>
        </Box>
        <Avatar sx={{ bgcolor: bgColor, width: 56, height: 56 }}>{icon}</Avatar>
      </Box>
    </CardContent>
  </Card>
);

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { isUserAuthenticated, user } = useAuth();
  const {
    loading,
    stats,
    organization,
    fetchDashboardStats,
    fetchOrganization,
  } = useAdminLogic();

  usePageTitle(`Admin Dashboard - ${organization?.orgName || "Admin"}`);

  useEffect(() => {
    if (!isUserAuthenticated) {
      navigate("/");
      return;
    }
    if (user?.role !== "admin") {
      navigate("/profile");
      return;
    }
  }, [isUserAuthenticated, user, navigate]);

  useEffect(() => {
    fetchDashboardStats();
    fetchOrganization();
  }, [fetchDashboardStats, fetchOrganization]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.charAt(0) || "";
    const last = lastName?.charAt(0) || "";
    return `${first}${last}`.toUpperCase() || "U";
  };

  if (loading && !stats) {
    return (
      <AdminLayout
        orgName={organization?.orgName}
        orgLogo={organization?.orgLogos?.[0]?.url}
      >
        <Box>
          <Skeleton variant="text" width={200} height={40} sx={{ mb: 3 }} />

          <Grid container spacing={3} mb={4}>
            {[1, 2, 3, 4].map((i) => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <Card>
                  <CardContent>
                    <Skeleton variant="text" width="60%" />
                    <Skeleton variant="text" width="40%" height={48} />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Skeleton
                    variant="text"
                    width={180}
                    height={32}
                    sx={{ mb: 2 }}
                  />
                  {[1, 2, 3].map((i) => (
                    <Box
                      key={i}
                      display="flex"
                      alignItems="center"
                      gap={2}
                      mb={2}
                    >
                      <Skeleton variant="circular" width={40} height={40} />
                      <Box flexGrow={1}>
                        <Skeleton variant="text" width="60%" />
                        <Skeleton variant="text" width="40%" />
                      </Box>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Skeleton
                    variant="text"
                    width={140}
                    height={32}
                    sx={{ mb: 2 }}
                  />
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} variant="text" sx={{ mb: 2 }} />
                  ))}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      orgName={organization?.orgName}
      orgLogo={organization?.orgLogos?.[0]?.url}
    >
      <Box>
        <Typography variant="h4" fontWeight={700} mb={3}>
          Dashboard
        </Typography>

        {/* Stats Cards */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Users"
              value={stats?.totalUsers || 0}
              icon={<People sx={{ color: "#1976d2" }} />}
              color="primary.main"
              bgColor="#e3f2fd"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Verified Users"
              value={stats?.verifiedUsers || 0}
              icon={<VerifiedUser sx={{ color: "#2e7d32" }} />}
              color="success.main"
              bgColor="#e8f5e9"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Unverified Users"
              value={stats?.unverifiedUsers || 0}
              icon={<PersonOff sx={{ color: "#ed6c02" }} />}
              color="warning.main"
              bgColor="#fff3e0"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Admin Users"
              value={stats?.adminUsers || 0}
              icon={<AdminPanelSettings sx={{ color: "#9c27b0" }} />}
              color="secondary.main"
              bgColor="#f3e5f5"
            />
          </Grid>
        </Grid>

        {/* Recent Users */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={2}
                >
                  <Typography variant="h6" fontWeight={600}>
                    <TrendingUp sx={{ mr: 1, verticalAlign: "middle" }} />
                    Recent Users
                  </Typography>
                  <Button size="small" onClick={() => navigate("/admin/users")}>
                    View All
                  </Button>
                </Box>
                {stats?.recentUsers && stats.recentUsers.length > 0 ? (
                  <List>
                    {stats.recentUsers.map((recentUser) => (
                      <ListItem key={recentUser._id} divider>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: "primary.main" }}>
                            {getInitials(
                              recentUser.firstName,
                              recentUser.lastName,
                            )}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={`${recentUser.firstName} ${recentUser.lastName}`}
                          secondary={recentUser.email}
                        />
                        <Box display="flex" alignItems="center" gap={1}>
                          <Chip
                            label={
                              recentUser.isVerified ? "Verified" : "Unverified"
                            }
                            size="small"
                            color={
                              recentUser.isVerified ? "success" : "warning"
                            }
                          />
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(recentUser.createdAt)}
                          </Typography>
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    textAlign="center"
                    py={3}
                  >
                    No recent users found
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} mb={2}>
                  Quick Stats
                </Typography>
                <Box display="flex" flexDirection="column" gap={2}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Regular Users
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {stats?.regularUsers || 0}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Admin Users
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {stats?.adminUsers || 0}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Verification Rate
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {stats?.totalUsers
                        ? Math.round(
                            (stats.verifiedUsers / stats.totalUsers) * 100,
                          )
                        : 0}
                      %
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </AdminLayout>
  );
};

export default AdminDashboard;
