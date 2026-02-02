import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Button,
} from "@mui/material";
import {
  Business,
  TrendingUp,
  CheckCircle,
  Cancel,
  ArrowBack,
} from "@mui/icons-material";
import { useSnackbar } from "../contexts/SnackbarContext";
import { API_ENDPOINTS } from "../apis";
import {
  getRequest,
  extractData,
  extractMessage,
  isSuccess,
  parseError,
} from "../lib/api";
import { clientLogger } from "@exyconn/common/client/logger";
import { usePageTitle } from "@exyconn/common/client/hooks";

interface OrganizationStats {
  total: number;
  active: number;
  inactive: number;
  byBusinessType: Array<{ _id: string | null; count: number }>;
  byScaleType: Array<{ _id: string | null; count: number }>;
  byOwnershipType: Array<{ _id: string | null; count: number }>;
}

const GodDashboard: React.FC = () => {
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<OrganizationStats | null>(null);
  usePageTitle("Dashboard | God Panel");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await getRequest(API_ENDPOINTS.GOD.ORGANIZATION_STATS);

      if (isSuccess(response)) {
        const statsData = extractData<OrganizationStats>(response);
        if (statsData) {
          setStats(statsData);
        }
      } else {
        const message = extractMessage(response);
        showSnackbar(message || "Failed to fetch stats", "error");
      }
    } catch (error) {
      clientLogger.error("Failed to fetch organization statistics:", { error });
      const parsedError = parseError(error);
      showSnackbar(
        parsedError.message || "Failed to fetch organization statistics",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="400px"
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box mb={4}>
        <Box display="flex" alignItems="center" mb={2}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate("/god/organizations")}
            sx={{ mr: 2 }}
          >
            Back to Organizations
          </Button>
        </Box>
        <Typography variant="h4" component="h1" gutterBottom>
          <TrendingUp sx={{ mr: 2, verticalAlign: "middle" }} />
          Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Overview of organization statistics and metrics
        </Typography>
      </Box>

      {/* Main Stats Cards */}
      {stats && (
        <>
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Total Organizations
                      </Typography>
                      <Typography variant="h3" fontWeight="bold">
                        {stats.total}
                      </Typography>
                    </Box>
                    <Business
                      sx={{ fontSize: 48, color: "primary.main", opacity: 0.3 }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Active Organizations
                      </Typography>
                      <Typography
                        variant="h3"
                        fontWeight="bold"
                        color="success.main"
                      >
                        {stats.active}
                      </Typography>
                    </Box>
                    <CheckCircle
                      sx={{ fontSize: 48, color: "success.main", opacity: 0.3 }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Inactive Organizations
                      </Typography>
                      <Typography
                        variant="h3"
                        fontWeight="bold"
                        color="error.main"
                      >
                        {stats.inactive}
                      </Typography>
                    </Box>
                    <Cancel
                      sx={{ fontSize: 48, color: "error.main", opacity: 0.3 }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Breakdown Cards */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    By Business Type
                  </Typography>
                  {stats.byBusinessType.length > 0 ? (
                    stats.byBusinessType.map((item, index) => (
                      <Box
                        key={index}
                        display="flex"
                        justifyContent="space-between"
                        py={1}
                      >
                        <Typography variant="body2">
                          {item._id || "Not Specified"}
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {item.count}
                        </Typography>
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No data available
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    By Scale Type
                  </Typography>
                  {stats.byScaleType.length > 0 ? (
                    stats.byScaleType.map((item, index) => (
                      <Box
                        key={index}
                        display="flex"
                        justifyContent="space-between"
                        py={1}
                      >
                        <Typography variant="body2">
                          {item._id || "Not Specified"}
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {item.count}
                        </Typography>
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No data available
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    By Ownership Type
                  </Typography>
                  {stats.byOwnershipType.length > 0 ? (
                    stats.byOwnershipType.map((item, index) => (
                      <Box
                        key={index}
                        display="flex"
                        justifyContent="space-between"
                        py={1}
                      >
                        <Typography variant="body2">
                          {item._id || "Not Specified"}
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {item.count}
                        </Typography>
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No data available
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </Container>
  );
};

export default GodDashboard;
