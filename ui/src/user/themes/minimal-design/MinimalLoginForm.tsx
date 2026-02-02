import React, { useState } from "react";
import { Formik, Form, Field } from "formik";
import {
  Box,
  TextField,
  Button,
  CircularProgress,
  InputAdornment,
  IconButton,
  Typography,
  Link,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import { LoginSchema } from "../../login/LoginSchema";
import Policy from "../../../components/Policy";
import { Organization } from "../../../types/organization";
import { OAuthProvider } from "../../login/useLoginLogic";

interface EnabledOAuthProviders {
  google: boolean;
  microsoft: boolean;
  apple: boolean;
  github: boolean;
}

interface MinimalLoginFormProps {
  organization: Organization | null;
  onSubmit: (values: { email: string; password: string }) => void;
  onGoogleLogin: () => void;
  onOAuthLogin?: (provider: OAuthProvider) => void;
  submitting: boolean;
  hasEnabledOAuth?: boolean;
  enabledOAuthProviders?: EnabledOAuthProviders;
}

const MinimalLoginForm: React.FC<MinimalLoginFormProps> = ({
  organization,
  onSubmit,
  onGoogleLogin,
  onOAuthLogin,
  submitting,
  hasEnabledOAuth,
  enabledOAuthProviders,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  // Handle OAuth click - use specific provider handler or fallback to Google
  const handleOAuthClick = (provider: OAuthProvider) => {
    if (onOAuthLogin) {
      onOAuthLogin(provider);
    } else if (provider === "google") {
      onGoogleLogin();
    }
  };

  return (
    <>
      <Formik
        initialValues={{ email: "", password: "" }}
        validationSchema={LoginSchema}
        onSubmit={onSubmit}
      >
        {({ errors, touched, isValid, dirty }) => (
          <Form>
            <Field
              as={TextField}
              name="email"
              label="Email"
              type="email"
              fullWidth
              variant="standard"
              error={touched.email && !!errors.email}
              helperText={touched.email && errors.email}
              sx={{ mb: 3 }}
            />

            <Field
              as={TextField}
              name="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              fullWidth
              variant="standard"
              error={touched.password && !!errors.password}
              helperText={touched.password && errors.password}
              sx={{ mb: 3 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? (
                        <VisibilityOff fontSize="small" />
                      ) : (
                        <Visibility fontSize="small" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              variant="text"
              fullWidth
              disabled={submitting || !isValid || !dirty}
              sx={{
                mt: 2,
                mb: 2,
                py: 1.5,
                textTransform: "none",
                fontSize: "1rem",
                fontWeight: 600,
                color: organization?.orgTheme?.primaryColor || "primary.main",
                border: "2px solid",
                borderColor:
                  organization?.orgTheme?.primaryColor || "primary.main",
                borderRadius: 0,
                "&:hover": {
                  bgcolor:
                    organization?.orgTheme?.primaryColor || "primary.main",
                  color: "white",
                },
              }}
            >
              {submitting ? (
                <>
                  <CircularProgress
                    size={18}
                    sx={{ mr: 1, color: "inherit" }}
                  />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </Form>
        )}
      </Formik>

      {/* OAuth Section - Show all enabled providers */}
      {hasEnabledOAuth && (
        <>
          <Box sx={{ my: 3, textAlign: "center" }}>
            <Typography variant="caption" color="text.secondary" sx={{ px: 2 }}>
              or continue with
            </Typography>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {/* Google */}
            {(enabledOAuthProviders?.google ||
              organization?.oauthSettings?.google?.enabled) && (
              <Button
                variant="text"
                fullWidth
                onClick={() => handleOAuthClick("google")}
                disabled={submitting}
                sx={{
                  py: 1.5,
                  textTransform: "none",
                  fontSize: "0.9rem",
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  color: "text.secondary",
                  border: "1px solid",
                  borderColor: "grey.300",
                  borderRadius: 0,
                  "&:hover": {
                    borderColor: "grey.500",
                    bgcolor: "transparent",
                  },
                }}
              >
                <img
                  src="/assets/logos/google.svg"
                  alt="Google"
                  style={{ width: 18, height: 18 }}
                />
                Google
              </Button>
            )}

            {/* Microsoft */}
            {enabledOAuthProviders?.microsoft && (
              <Button
                variant="text"
                fullWidth
                onClick={() => handleOAuthClick("microsoft")}
                disabled={submitting}
                sx={{
                  py: 1.5,
                  textTransform: "none",
                  fontSize: "0.9rem",
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  color: "text.secondary",
                  border: "1px solid",
                  borderColor: "grey.300",
                  borderRadius: 0,
                  "&:hover": {
                    borderColor: "grey.500",
                    bgcolor: "transparent",
                  },
                }}
              >
                <img
                  src="/assets/logos/microsoft.svg"
                  alt="Microsoft"
                  style={{ width: 18, height: 18 }}
                />
                Microsoft
              </Button>
            )}

            {/* Apple */}
            {enabledOAuthProviders?.apple && (
              <Button
                variant="text"
                fullWidth
                onClick={() => handleOAuthClick("apple")}
                disabled={submitting}
                sx={{
                  py: 1.5,
                  textTransform: "none",
                  fontSize: "0.9rem",
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  color: "text.secondary",
                  border: "1px solid",
                  borderColor: "grey.300",
                  borderRadius: 0,
                  "&:hover": {
                    borderColor: "grey.500",
                    bgcolor: "transparent",
                  },
                }}
              >
                <img
                  src="/assets/logos/apple.svg"
                  alt="Apple"
                  style={{ width: 18, height: 18 }}
                />
                Apple
              </Button>
            )}

            {/* GitHub */}
            {enabledOAuthProviders?.github && (
              <Button
                variant="text"
                fullWidth
                onClick={() => handleOAuthClick("github")}
                disabled={submitting}
                sx={{
                  py: 1.5,
                  textTransform: "none",
                  fontSize: "0.9rem",
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  color: "text.secondary",
                  border: "1px solid",
                  borderColor: "grey.300",
                  borderRadius: 0,
                  "&:hover": {
                    borderColor: "grey.500",
                    bgcolor: "transparent",
                  },
                }}
              >
                <img
                  src="/assets/logos/github.png"
                  alt="GitHub"
                  style={{ width: 18, height: 18 }}
                />
                GitHub
              </Button>
            )}
          </Box>
        </>
      )}

      {/* Links */}
      <Box
        sx={{
          mt: 4,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Link
          component={RouterLink}
          to="/signup"
          underline="none"
          sx={{
            color: "text.primary",
            fontWeight: 400,
            fontSize: "0.875rem",
            letterSpacing: "0.5px",
            "&:hover": {
              color: organization?.orgTheme?.primaryColor || "primary.main",
            },
          }}
        >
          Create an account →
        </Link>

        <Link
          component={RouterLink}
          to="/forgot-password"
          underline="none"
          sx={{
            color: "text.secondary",
            fontWeight: 400,
            fontSize: "0.8rem",
            "&:hover": {
              color: "text.primary",
            },
          }}
        >
          Forgot password?
        </Link>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Policy />
      </Box>
    </>
  );
};

export default MinimalLoginForm;
