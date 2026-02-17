import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  CircularProgress,
  Box,
  Typography,
  Avatar,
  Button,
  Paper,
  Divider,
  Alert,
} from "@mui/material";
import { useSnackbar } from "../contexts/SnackbarContext";
import { clientLogger } from "../lib/client-logger";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

interface TestModeUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
  provider: string;
  firstName?: string;
  lastName?: string;
  companyId?: string;
  role?: string;
}

/**
 * OAuth Callback - handles redirect after OAuth login
 * Token is passed in URL and stored in localStorage
 */
const OAuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const { showSnackbar } = useSnackbar();

  // Test mode states
  const [testModeActive, setTestModeActive] = useState(false);
  const [testModeUser, setTestModeUser] = useState<TestModeUser | null>(null);
  const [testModeError, setTestModeError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [redirectingTo, setRedirectingTo] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const error = searchParams.get("error");
      const company = searchParams.get("company");
      const redirectUri = searchParams.get("redirectUri");
      const success = searchParams.get("success");
      const token = searchParams.get("token");
      const testMode = searchParams.get("testMode");

      // If no relevant params, wait (don't process)
      if (!error && !token && !success) return;

      clientLogger.info("OAuth callback processing:", {
        error,
        tokenPresent: !!token,
        success,
      });

      // Handle test mode - display user info directly in this page
      if (testMode === "true") {
        setTestModeActive(true);

        if (error) {
          setTestModeError(error);
          return;
        }

        if (success === "true" && token) {
          try {
            // Base64Url to Base64 (replace - with + and _ with /)
            const base64 = token
              .split(".")[1]
              .replace(/-/g, "+")
              .replace(/_/g, "/");
            const payload = JSON.parse(atob(base64));

            const user: TestModeUser = {
              id: payload.userId,
              email: payload.email,
              name:
                `${payload.firstName || ""} ${payload.lastName || ""}`.trim() ||
                payload.email,
              picture: payload.picture || payload.profilePicture,
              provider: "google",
              firstName: payload.firstName,
              lastName: payload.lastName,
              companyId: payload.companyId || payload.organizationId,
              role: payload.role,
            };
            setTestModeUser(user);

            // Also try to post to opener if available
            if (window.opener) {
              try {
                window.opener.postMessage(
                  {
                    type: "oauth_test_result",
                    payload: { success: true, user },
                  },
                  "*",
                );
              } catch (e) {
                clientLogger.warn("Could not post to opener:", e);
              }
            }
            return;
          } catch (err) {
            clientLogger.error("Failed to decode token in test mode:", err);
            setTestModeError("Failed to decode authentication token");
            return;
          }
        }

        setTestModeError("Authentication failed - no token received");
        return;
      }

      // Normal OAuth flow (non-test mode)
      if (error) {
        if (error === "user_not_in_organization") {
          showSnackbar(
            "This user account does not belong to this organization.",
            "error",
          );
        } else if (error.includes("OAuth") || error.includes("Google")) {
          showSnackbar(error, "error");
        } else {
          showSnackbar(`Authentication failed: ${error}`, "error");
        }
        navigate(`/?company=${company || "default"}`);
        return;
      }

      // Token is passed in URL from server
      if (success === "true" && token) {
        // Store token in localStorage
        localStorage.setItem("authToken", token);
        clientLogger.info("OAuth token stored in localStorage");

        // Decode token to get user info (basic info for localStorage)
        try {
          // Base64Url to Base64
          const base64 = token
            .split(".")[1]
            .replace(/-/g, "+")
            .replace(/_/g, "/");
          const payload = JSON.parse(atob(base64));

          const userData = {
            id: payload.userId,
            email: payload.email,
            firstName: payload.firstName || "",
            lastName: payload.lastName || "",
            companyId: payload.companyId || payload.organizationId || "",
            role: payload.role || "user",
            isVerified: true,
          };

          // Use a function update to ensure we don't depend on stale state if called multiple times?
          // No, setUser is sufficient. AuthContext optimization ensures stability.
          setUser(userData);
          showSnackbar("Login successful!", "success");

          // Redirect to the specified URL or profile
          const finalRedirectUrl = redirectUri || "/profile";
          clientLogger.info("Redirecting to:", finalRedirectUrl);
          setRedirectingTo(finalRedirectUrl);

          // Small delay to ensure state updates, then redirect
          setTimeout(() => {
            // If redirect URL is external, pass token in URL
            if (finalRedirectUrl.startsWith("http")) {
              window.location.href = `${finalRedirectUrl}?token=${encodeURIComponent(token)}`;
            } else {
              navigate(finalRedirectUrl, { replace: true });
            }
          }, 100);
          return;
        } catch (err) {
          clientLogger.error("Failed to decode token:", err);
          showSnackbar("Failed to decode authentication token", "error");
        }
      }

      showSnackbar("Authentication failed", "error");
      navigate(`/?company=${company || "default"}`);
    };

    handleCallback();
  }, [searchParams, navigate, setUser, showSnackbar]);

  const handleCopyJson = () => {
    if (testModeUser) {
      navigator.clipboard.writeText(JSON.stringify(testModeUser, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCloseWindow = () => {
    window.close();
  };

  // Test mode UI
  if (testModeActive) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          p: 3,
          bgcolor: "background.default",
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            maxWidth: 500,
            width: "100%",
            borderRadius: 2,
          }}
        >
          {testModeError ? (
            <>
              <Alert severity="error" sx={{ mb: 2 }}>
                <Typography variant="body1">
                  <strong>OAuth Test Failed</strong>
                </Typography>
                <Typography variant="body2">{testModeError}</Typography>
              </Alert>
              <Button variant="contained" fullWidth onClick={handleCloseWindow}>
                Close Window
              </Button>
            </>
          ) : testModeUser ? (
            <>
              <Box sx={{ textAlign: "center", mb: 3 }}>
                <CheckCircleIcon color="success" sx={{ fontSize: 48, mb: 1 }} />
                <Typography variant="h5" gutterBottom fontWeight={600}>
                  OAuth Test Successful!
                </Typography>
              </Box>

              <Box sx={{ textAlign: "center", mb: 3 }}>
                <Avatar
                  src={testModeUser.picture}
                  alt={testModeUser.name}
                  sx={{ width: 80, height: 80, mx: "auto", mb: 2 }}
                />
                <Typography variant="h6" gutterBottom>
                  {testModeUser.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {testModeUser.email}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" gutterBottom>
                User Information (JSON):
              </Typography>
              <Box
                component="pre"
                sx={{
                  bgcolor: "grey.100",
                  p: 2,
                  borderRadius: 1,
                  overflow: "auto",
                  fontSize: "0.8rem",
                  maxHeight: 200,
                  mb: 2,
                }}
              >
                {JSON.stringify(testModeUser, null, 2)}
              </Box>

              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<ContentCopyIcon />}
                  onClick={handleCopyJson}
                  sx={{ flex: 1 }}
                >
                  {copied ? "Copied!" : "Copy JSON"}
                </Button>
                <Button
                  variant="contained"
                  onClick={handleCloseWindow}
                  sx={{ flex: 1 }}
                >
                  Close Window
                </Button>
              </Box>

              <Alert severity="success" sx={{ mt: 2 }}>
                Google OAuth is configured correctly! Users can sign in with
                Google.
              </Alert>
            </>
          ) : (
            <Box sx={{ textAlign: "center" }}>
              <CircularProgress size={48} />
              <Typography variant="body1" sx={{ mt: 2 }}>
                Processing OAuth response...
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    );
  }

  // Normal loading UI
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        gap: 2,
      }}
    >
      <CircularProgress size={60} />
      <Typography variant="h6" color="text.secondary">
        {redirectingTo ? "Redirecting..." : "Completing authentication..."}
      </Typography>
      {redirectingTo && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ maxWidth: 400, textAlign: "center", wordBreak: "break-all" }}
        >
          → {redirectingTo}
        </Typography>
      )}
    </Box>
  );
};

export default OAuthCallback;
