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
  alpha,
  Fade,
} from "@mui/material";
import { Visibility, VisibilityOff, ArrowForward } from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import { LoginSchema } from "../LoginSchema";
import Policy from "../../../components/Policy";
import { Organization } from "../../../types/organization";
import { OAuthProvider } from "../useLoginLogic";

interface MinimalLoginFormProps {
  organization: Organization | null;
  onSubmit: (values: { email: string; password: string }) => void;
  onGoogleLogin: () => void;
  submitting: boolean;
  hasEnabledOAuth?: boolean;
  enabledOAuthProviders?: Record<OAuthProvider, boolean>;
  onOAuthLogin?: (provider: OAuthProvider) => void;
}

const MinimalLoginForm: React.FC<MinimalLoginFormProps> = ({
  organization,
  onSubmit,
  onGoogleLogin,
  submitting,
  hasEnabledOAuth,
  enabledOAuthProviders,
  onOAuthLogin,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const primaryColor = organization?.orgTheme?.primaryColor || "#6366f1";

  const handleOAuthClick = (provider: OAuthProvider) => {
    if (onOAuthLogin) {
      onOAuthLogin(provider);
    } else if (provider === "google") {
      onGoogleLogin();
    }
  };

  const OAUTH_PROVIDERS: { key: OAuthProvider; label: string; logo: string }[] =
    [
      { key: "google", label: "Google", logo: "/assets/logos/google.svg" },
      {
        key: "microsoft",
        label: "Microsoft",
        logo: "/assets/logos/microsoft.svg",
      },
      { key: "apple", label: "Apple", logo: "/assets/logos/apple.svg" },
      { key: "github", label: "GitHub", logo: "/assets/logos/github.png" },
    ];

  // Clean input styles for minimal design
  const inputStyles = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 2,
      bgcolor: "#f9fafb",
      transition: "all 0.2s ease",
      "& fieldset": {
        borderColor: "#e5e7eb",
      },
      "&:hover": {
        bgcolor: "#f3f4f6",
        "& fieldset": {
          borderColor: "#d1d5db",
        },
      },
      "&.Mui-focused": {
        bgcolor: "#fff",
        "& fieldset": {
          borderColor: primaryColor,
          borderWidth: 2,
        },
      },
    },
    "& .MuiInputLabel-root": {
      color: "#9ca3af",
      "&.Mui-focused": {
        color: primaryColor,
      },
    },
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
              label="Email address"
              type="email"
              fullWidth
              variant="outlined"
              size="medium"
              error={touched.email && !!errors.email}
              helperText={touched.email && errors.email}
              sx={{ mb: 2.5, ...inputStyles }}
            />

            <Field
              as={TextField}
              name="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              fullWidth
              variant="outlined"
              size="medium"
              error={touched.password && !!errors.password}
              helperText={touched.password && errors.password}
              sx={{ mb: 1, ...inputStyles }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                      sx={{ color: "#9ca3af" }}
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

            {/* Forgot Password */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
              <Link
                component={RouterLink}
                to="/forgot-password"
                underline="hover"
                sx={{
                  color: "#6b7280",
                  fontSize: "0.8125rem",
                  fontWeight: 500,
                  "&:hover": { color: primaryColor },
                }}
              >
                Forgot password?
              </Link>
            </Box>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={submitting || !isValid || !dirty}
              endIcon={!submitting && <ArrowForward sx={{ fontSize: 18 }} />}
              sx={{
                py: 1.5,
                textTransform: "none",
                fontSize: "0.9375rem",
                fontWeight: 600,
                bgcolor: primaryColor,
                borderRadius: 2,
                boxShadow: "none",
                transition: "all 0.2s ease",
                "&:hover": {
                  bgcolor: primaryColor,
                  boxShadow: `0 4px 12px ${alpha(primaryColor, 0.35)}`,
                  transform: "translateY(-1px)",
                },
                "&.Mui-disabled": {
                  bgcolor: "#e5e7eb",
                  color: "#9ca3af",
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
                "Continue"
              )}
            </Button>
          </Form>
        )}
      </Formik>

      {/* OAuth Section */}
      {hasEnabledOAuth && (
        <Fade in timeout={300}>
          <Box>
            <Box sx={{ my: 3, display: "flex", alignItems: "center", gap: 2 }}>
              <Box sx={{ flex: 1, height: 1, bgcolor: "#e5e7eb" }} />
              <Typography
                variant="caption"
                sx={{
                  color: "#9ca3af",
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                or
              </Typography>
              <Box sx={{ flex: 1, height: 1, bgcolor: "#e5e7eb" }} />
            </Box>

            <Box sx={{ display: "flex", gap: 1.5, justifyContent: "center" }}>
              {OAUTH_PROVIDERS.map((provider) => {
                const isEnabled =
                  enabledOAuthProviders?.[provider.key] ||
                  (provider.key === "google" &&
                    organization?.oauthSettings?.google?.enabled);

                if (!isEnabled) return null;

                return (
                  <Button
                    key={provider.key}
                    variant="outlined"
                    onClick={() => handleOAuthClick(provider.key)}
                    disabled={submitting}
                    sx={{
                      minWidth: 52,
                      height: 52,
                      borderRadius: 2,
                      bgcolor: "#fff",
                      borderColor: "#e5e7eb",
                      p: 0,
                      transition: "all 0.15s ease",
                      "&:hover": {
                        bgcolor: "#f9fafb",
                        borderColor: "#d1d5db",
                        transform: "translateY(-2px)",
                        boxShadow: "0 4px 8px rgba(0,0,0,0.04)",
                      },
                    }}
                    title={`Continue with ${provider.label}`}
                  >
                    <img
                      src={provider.logo}
                      alt={provider.label}
                      style={{ width: 22, height: 22 }}
                    />
                  </Button>
                );
              })}
            </Box>
          </Box>
        </Fade>
      )}

      {/* Sign Up Link */}
      <Box sx={{ mt: 4, textAlign: "center" }}>
        <Typography variant="body2" sx={{ color: "#6b7280" }}>
          Don't have an account?{" "}
          <Link
            component={RouterLink}
            to="/signup"
            underline="none"
            sx={{
              color: primaryColor,
              fontWeight: 600,
              "&:hover": { textDecoration: "underline" },
            }}
          >
            Sign up
          </Link>
        </Typography>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Policy />
      </Box>
    </>
  );
};

export default MinimalLoginForm;
