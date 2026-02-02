import React, { useState } from "react";
import { Formik, Form, Field } from "formik";
import {
  Box,
  TextField,
  Button,
  CircularProgress,
  InputAdornment,
  IconButton,
  Divider,
  Typography,
  Link,
  alpha,
  Fade,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  ArrowForward,
} from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import { LoginSchema } from "../LoginSchema";
import Policy from "../../../components/Policy";
import { Organization } from "../../../types/organization";
import { OAuthProvider } from "../useLoginLogic";

interface ClassicLoginFormProps {
  organization: Organization | null;
  onSubmit: (values: { email: string; password: string }) => void;
  onGoogleLogin: () => void;
  submitting: boolean;
  hasEnabledOAuth?: boolean;
  enabledOAuthProviders?: Record<OAuthProvider, boolean>;
  onOAuthLogin?: (provider: OAuthProvider) => void;
}

const ClassicLoginForm: React.FC<ClassicLoginFormProps> = ({
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

  const OAUTH_PROVIDERS: {
    key: OAuthProvider;
    label: string;
    logo: string;
    hoverBg: string;
  }[] = [
    {
      key: "google",
      label: "Google",
      logo: "/assets/logos/google.svg",
      hoverBg: "#f8f9fa",
    },
    {
      key: "microsoft",
      label: "Microsoft",
      logo: "/assets/logos/microsoft.svg",
      hoverBg: "#f0f6ff",
    },
    {
      key: "apple",
      label: "Apple",
      logo: "/assets/logos/apple.svg",
      hoverBg: "#f5f5f5",
    },
    {
      key: "github",
      label: "GitHub",
      logo: "/assets/logos/github.png",
      hoverBg: "#f6f8fa",
    },
  ];

  // Common input styles
  const inputStyles = {
    "& .MuiOutlinedInput-root": {
      bgcolor: "#fafafa",
      borderRadius: 2,
      transition: "all 0.2s ease",
      "&:hover": {
        bgcolor: "#f5f5f5",
      },
      "&.Mui-focused": {
        bgcolor: "#fff",
        boxShadow: `0 0 0 3px ${alpha(primaryColor, 0.1)}`,
      },
      "& fieldset": {
        borderColor: "transparent",
        transition: "all 0.2s ease",
      },
      "&:hover fieldset": {
        borderColor: alpha(primaryColor, 0.3),
      },
      "&.Mui-focused fieldset": {
        borderColor: primaryColor,
        borderWidth: 2,
      },
    },
    "& .MuiInputLabel-root": {
      fontSize: "0.95rem",
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
              label="Email Address"
              type="email"
              fullWidth
              variant="outlined"
              error={touched.email && !!errors.email}
              helperText={touched.email && errors.email}
              sx={{ mb: 2.5, ...inputStyles }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: "text.disabled", fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
            />

            <Field
              as={TextField}
              name="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              fullWidth
              variant="outlined"
              error={touched.password && !!errors.password}
              helperText={touched.password && errors.password}
              sx={{ mb: 1, ...inputStyles }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: "text.disabled", fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                      sx={{ color: "text.disabled" }}
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

            {/* Forgot Password Link - Right aligned */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2.5 }}>
              <Link
                component={RouterLink}
                to="/forgot-password"
                underline="hover"
                sx={{
                  color: "text.secondary",
                  fontSize: "0.85rem",
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
              size="large"
              disabled={submitting || !isValid || !dirty}
              endIcon={!submitting && <ArrowForward />}
              sx={{
                py: 1.5,
                textTransform: "none",
                fontSize: "1rem",
                fontWeight: 600,
                borderRadius: 2,
                bgcolor: primaryColor,
                boxShadow: `0 4px 14px 0 ${alpha(primaryColor, 0.4)}`,
                transition: "all 0.2s ease",
                "&:hover": {
                  bgcolor: primaryColor,
                  transform: "translateY(-1px)",
                  boxShadow: `0 6px 20px 0 ${alpha(primaryColor, 0.5)}`,
                },
                "&:active": {
                  transform: "translateY(0)",
                },
                "&.Mui-disabled": {
                  bgcolor: alpha(primaryColor, 0.5),
                  color: "#fff",
                },
              }}
            >
              {submitting ? (
                <>
                  <CircularProgress
                    size={20}
                    sx={{ mr: 1.5, color: "inherit" }}
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

      {/* OAuth Section */}
      {hasEnabledOAuth && (
        <Fade in timeout={400}>
          <Box>
            <Divider sx={{ my: 3 }}>
              <Typography
                variant="body2"
                sx={{
                  color: "text.disabled",
                  px: 2,
                  fontSize: "0.8rem",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                or continue with
              </Typography>
            </Divider>

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
                      minWidth: 56,
                      height: 56,
                      borderRadius: 2,
                      bgcolor: "white",
                      borderColor: "#e5e7eb",
                      p: 0,
                      transition: "all 0.2s ease",
                      "&:hover": {
                        bgcolor: provider.hoverBg,
                        borderColor: "#d1d5db",
                        transform: "translateY(-2px)",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                      },
                    }}
                    title={`Continue with ${provider.label}`}
                  >
                    <img
                      src={provider.logo}
                      alt={provider.label}
                      style={{ width: 24, height: 24 }}
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
        <Typography variant="body2" color="text.secondary">
          Don't have an account?{" "}
          <Link
            component={RouterLink}
            to="/signup"
            underline="none"
            sx={{
              color: primaryColor,
              fontWeight: 600,
              "&:hover": {
                textDecoration: "underline",
              },
            }}
          >
            Sign up
          </Link>
        </Typography>
      </Box>

      <Box sx={{ mt: 3 }}>
        <Policy />
      </Box>
    </>
  );
};

export default ClassicLoginForm;
