import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  Backdrop,
} from "@mui/material";
import { TimerOutlined, Login as LoginIcon } from "@mui/icons-material";
import { useSessionExpiry } from "../../contexts/SessionExpiryContext";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { STORAGE_KEYS } from "../../lib/api";

const COUNTDOWN_SECONDS = 10;

const SessionExpiryModal: React.FC = () => {
  const { isSessionExpired, resetSessionExpiry } = useSessionExpiry();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const performLogout = useCallback(() => {
    setIsLoggingOut(true);

    // Clear all auth-related data
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    localStorage.removeItem(STORAGE_KEYS.GOD_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.GOD_USER_DATA);
    localStorage.removeItem(STORAGE_KEYS.API_KEY);

    // Call context logout methods
    logout();

    // Reset session expiry state
    resetSessionExpiry();

    // Redirect to login page
    const isGodRoute = window.location.pathname.startsWith("/god");
    navigate(isGodRoute ? "/login/god" : "/");
  }, [logout, resetSessionExpiry, navigate]);

  const handleSignInAgain = useCallback(() => {
    performLogout();
  }, [performLogout]);

  // Countdown timer effect
  useEffect(() => {
    if (!isSessionExpired) {
      setCountdown(COUNTDOWN_SECONDS);
      return;
    }

    if (countdown <= 0) {
      performLogout();
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isSessionExpired, countdown, performLogout]);

  // Reset countdown when modal opens
  useEffect(() => {
    if (isSessionExpired) {
      setCountdown(COUNTDOWN_SECONDS);
    }
  }, [isSessionExpired]);

  if (!isSessionExpired) {
    return null;
  }

  return (
    <>
      {/* Blurred backdrop */}
      <Backdrop
        open={isSessionExpired}
        sx={{
          zIndex: (theme) => theme.zIndex.modal - 1,
          backdropFilter: "blur(8px)",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        }}
      />

      <Dialog
        open={isSessionExpired}
        maxWidth="xs"
        fullWidth
        disableEscapeKeyDown
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 1,
            textAlign: "center",
          },
        }}
        slotProps={{
          backdrop: {
            sx: {
              backdropFilter: "blur(8px)",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
            },
          },
        }}
      >
        <DialogContent sx={{ pt: 4, pb: 2 }}>
          {/* Timer Icon with Countdown */}
          <Box
            sx={{
              position: "relative",
              display: "inline-flex",
              mb: 3,
            }}
          >
            <CircularProgress
              variant="determinate"
              value={(countdown / COUNTDOWN_SECONDS) * 100}
              size={80}
              thickness={4}
              sx={{
                color: countdown <= 3 ? "error.main" : "warning.main",
                transition: "color 0.3s ease",
              }}
            />
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography
                variant="h4"
                component="span"
                sx={{
                  fontWeight: "bold",
                  color: countdown <= 3 ? "error.main" : "warning.main",
                }}
              >
                {countdown}
              </Typography>
            </Box>
          </Box>

          {/* Title */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              mb: 2,
            }}
          >
            <TimerOutlined sx={{ color: "warning.main", fontSize: 28 }} />
            <Typography variant="h5" fontWeight="bold">
              Session Expired
            </Typography>
          </Box>

          {/* Message */}
          <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
            Your session has expired. You will be logged out.
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Redirecting to sign-in page in <strong>{countdown}</strong>{" "}
            seconds...
          </Typography>
        </DialogContent>

        <DialogActions sx={{ justifyContent: "center", pb: 3, px: 3 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleSignInAgain}
            disabled={isLoggingOut}
            startIcon={
              isLoggingOut ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <LoginIcon />
              )
            }
            fullWidth
            sx={{
              py: 1.5,
              borderRadius: 2,
              fontWeight: "bold",
              textTransform: "none",
            }}
          >
            {isLoggingOut ? "Signing out..." : "Sign in again"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SessionExpiryModal;
