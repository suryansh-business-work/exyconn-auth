import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Security, Refresh } from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { useSnackbar } from "../../contexts/SnackbarContext";
import { useAuth } from "../../contexts/AuthContext";
import { API_ENDPOINTS } from "../../apis";
import {
  postRequest,
  extractData,
  extractMessage,
  isSuccess,
} from "../../lib/api";
import UserLayout from "../../components/UserLayout";

const MfaVerify: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showSnackbar } = useSnackbar();
  const { setUser } = useAuth();

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  // Get email from location state (passed from login)
  const email = location.state?.email || "";

  useEffect(() => {
    // If no email, redirect to login
    if (!email) {
      navigate("/login");
    }
  }, [email, navigate]);

  const handleVerify = async () => {
    if (!otp || otp.length < 4) {
      showSnackbar("Please enter a valid OTP", "error");
      return;
    }

    setLoading(true);
    try {
      // Organization is identified via x-api-key header (set automatically by API client)
      // credentials: 'include' to receive HTTP-only cookie from server
      const response = await postRequest(
        API_ENDPOINTS.AUTH.MFA_LOGIN_VERIFY,
        {
          email,
          otp,
        },
        {
          credentials: "include",
        },
      );

      if (isSuccess(response)) {
        const data = extractData<{
          user: any;
          token?: string;
          orgRedirectionSettings?: any[];
        }>(response);

        if (data?.user && data?.token) {
          // Store auth token in localStorage
          localStorage.setItem("authToken", data.token);

          // Store user data in localStorage via setUser
          setUser(data.user);

          // Handle redirection
          const currentOrigin = window.location.origin;
          const currentHost = window.location.host;

          const matchingRedirect = data.orgRedirectionSettings?.find(
            (r: { authPageUrl?: string }) => {
              const authPageUrl = (r.authPageUrl || "").toLowerCase();
              return (
                authPageUrl === currentOrigin.toLowerCase() ||
                authPageUrl === currentHost.toLowerCase() ||
                authPageUrl.includes(currentHost.toLowerCase())
              );
            },
          );

          // Get the default or first URL from redirectionUrls array
          const redirectUrl =
            matchingRedirect?.redirectionUrls?.find((u: any) => u.isDefault)
              ?.url || matchingRedirect?.redirectionUrls?.[0]?.url;
          if (redirectUrl) {
            // Pass token in URL for external app to store
            const separator = redirectUrl.includes("?") ? "&" : "?";
            window.location.href = `${redirectUrl}${separator}token=${encodeURIComponent(data.token)}`;
          } else {
            showSnackbar("Login successful!", "success");
            navigate("/profile");
          }
        } else {
          showSnackbar("Verification failed: No user data", "error");
        }
      } else {
        const errorMessage = extractMessage(response) || "Verification failed";
        showSnackbar(errorMessage, "error");
      }
    } catch (error: any) {
      showSnackbar(error.message || "Verification failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResending(true);
    try {
      // Organization is identified via x-api-key header (set automatically by API client)
      const response = await postRequest(
        API_ENDPOINTS.AUTH.RESEND_PASSWORD_OTP,
        {
          email,
        },
      );

      if (isSuccess(response)) {
        showSnackbar("OTP sent to your email", "success");
      } else {
        const errorMessage = extractMessage(response) || "Failed to resend OTP";
        showSnackbar(errorMessage, "error");
      }
    } catch (error: any) {
      showSnackbar(error.message || "Failed to resend OTP", "error");
    } finally {
      setResending(false);
    }
  };

  return (
    <UserLayout>
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
        }}
      >
        <Card sx={{ maxWidth: 450, width: "100%" }}>
          <CardContent sx={{ p: 4 }}>
            <Box textAlign="center" mb={3}>
              <Security sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />
              <Typography variant="h5" fontWeight={600} gutterBottom>
                Two-Factor Authentication
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Enter the verification code sent to your email
              </Typography>
              <Typography
                variant="body2"
                color="primary.main"
                fontWeight={500}
                mt={1}
              >
                {email}
              </Typography>
            </Box>

            <Alert severity="info" sx={{ mb: 3 }}>
              Check your email for the 6-digit verification code. The code
              expires in 10 minutes.
            </Alert>

            <TextField
              fullWidth
              label="Verification Code"
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="Enter 6-digit code"
              inputProps={{
                maxLength: 6,
                style: {
                  textAlign: "center",
                  fontSize: "1.5rem",
                  letterSpacing: "0.5rem",
                },
              }}
              sx={{ mb: 3 }}
            />

            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleVerify}
              disabled={loading || otp.length < 6}
              sx={{ mb: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : "Verify & Login"}
            </Button>

            <Box textAlign="center">
              <Button
                variant="text"
                onClick={handleResendOtp}
                disabled={resending}
                startIcon={
                  resending ? <CircularProgress size={16} /> : <Refresh />
                }
              >
                {resending ? "Sending..." : "Resend Code"}
              </Button>
            </Box>

            <Box textAlign="center" mt={2}>
              <Button
                variant="text"
                color="inherit"
                onClick={() => navigate("/login")}
              >
                Back to Login
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </UserLayout>
  );
};

export default MfaVerify;
