import React, { useState, useEffect } from "react";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "../contexts/SnackbarContext";
import { useAuth } from "../contexts/AuthContext";
import { API_BASE_URL } from "../apis";
import { usePageTitle } from "../lib/hooks";
import {
  postRequest,
  getRequest,
  extractData,
  extractMessage,
  isSuccess,
  parseError,
} from "../lib/api";
import { clientLogger } from "../lib/client-logger";
import {
  GodLoginLoadingSkeleton,
  GodLoginWarningAlert,
  GodLoginHeader,
  GodLoginForm,
  GodLoginVideoPanel,
} from "./god-login";

interface GodLoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  redirectUrl: string;
}

const GodLogin: React.FC = () => {
  const { showSnackbar } = useSnackbar();
  const { setGodUser, isGodAuthenticated } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [sendingCredentials, setSendingCredentials] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  usePageTitle("God Panel Login");

  useEffect(() => {
    if (isGodAuthenticated) {
      navigate("/god/organizations", { replace: true });
      return;
    }

    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (values: { email: string; password: string }) => {
    setSubmitting(true);
    try {
      // Note: credentials: 'include' to receive HTTP-only cookie from server
      const response = await postRequest(
        `${API_BASE_URL}/god-management/login`,
        values,
        {
          credentials: "include",
        },
      );

      if (isSuccess(response)) {
        const innerData = extractData<GodLoginResponse>(response);
        if (innerData?.user && innerData?.token) {
          // Store god token in localStorage
          localStorage.setItem("godToken", innerData.token);

          const godUserData = {
            id: innerData.user.id,
            firstName: innerData.user.firstName,
            lastName: innerData.user.lastName,
            email: innerData.user.email,
            companyId: "god",
            role: "god" as const,
            isVerified: true,
          };

          // Store user data in localStorage via setGodUser
          setGodUser(godUserData);
          showSnackbar("God user login successful!", "success");

          setTimeout(() => {
            navigate("/god/organizations", { replace: true });
          }, 100);
        } else {
          showSnackbar("Login failed: Invalid response data", "error");
        }
      } else {
        const message = extractMessage(response);
        showSnackbar(message || "Login failed", "error");
      }
    } catch (error) {
      clientLogger.error("God login error:", { error });
      const parsedError = parseError(error);
      showSnackbar(parsedError.message || "An error occurred", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendCredentials = async () => {
    setSendingCredentials(true);
    try {
      const response = await getRequest(
        `${API_BASE_URL}/god-management/send-credentials`,
      );

      if (isSuccess(response)) {
        showSnackbar(
          "Credentials sent successfully! Check your email.",
          "success",
        );
      } else {
        const message = extractMessage(response);
        showSnackbar(message || "Failed to send credentials", "error");
      }
    } catch (error) {
      clientLogger.error("Send credentials error:", { error });
      const parsedError = parseError(error);
      showSnackbar(
        parsedError.message || "Failed to send credentials",
        "error",
      );
    } finally {
      setSendingCredentials(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Left Side - Login Form */}
      <Box
        sx={{
          flex: isMobile ? "1" : "0 0 40vw",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          p: 4,
          pb: { xs: 6, md: 4 },
          position: "relative",
          backgroundColor: "background.default",
          zIndex: 3,
        }}
      >
        {loading ? (
          <GodLoginLoadingSkeleton />
        ) : (
          <>
            <GodLoginWarningAlert />
            <Box sx={{ width: "100%", maxWidth: 450 }}>
              <GodLoginHeader />
              <GodLoginForm
                onSubmit={handleSubmit}
                onSendCredentials={handleSendCredentials}
                onNavigateToRegularLogin={() => navigate("/")}
                submitting={submitting}
                sendingCredentials={sendingCredentials}
              />
            </Box>
          </>
        )}
      </Box>

      {/* Right Side - Video */}
      {!isMobile && <GodLoginVideoPanel />}
    </Box>
  );
};

export default GodLogin;
