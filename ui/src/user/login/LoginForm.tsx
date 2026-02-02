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
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
} from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import { LoginSchema } from "./LoginSchema";
import Policy from "../../components/Policy";
import { Organization } from "../../types/organization";
import { OAuthProvider } from "./useLoginLogic";

interface LoginFormProps {
  organization: Organization | null;
  onSubmit: (values: { email: string; password: string }) => void;
  onGoogleLogin: () => void;
  submitting: boolean;
  hasEnabledOAuth?: boolean;
  enabledOAuthProviders?: Record<OAuthProvider, boolean>;
  onOAuthLogin?: (provider: OAuthProvider) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  organization,
  onSubmit,
  onGoogleLogin,
  submitting,
  hasEnabledOAuth,
  enabledOAuthProviders,
  onOAuthLogin,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const primaryColor = organization?.orgTheme?.primaryColor || "#1976d2";

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
    brandColor: string;
  }[] = [
    {
      key: "google",
      label: "Google",
      logo: "/assets/logos/google.svg",
      brandColor: "#4285F4",
    },
    {
      key: "microsoft",
      label: "Microsoft",
      logo: "/assets/logos/microsoft.svg",
      brandColor: "#00A4EF",
    },
    {
      key: "apple",
      label: "Apple",
      logo: "/assets/logos/apple.svg",
      brandColor: "#000000",
    },
    {
      key: "github",
      label: "GitHub",
      logo: "/assets/logos/github.png",
      brandColor: "#333333",
    },
  ];

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
              sx={{
                mb: 2.5,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: primaryColor,
                    },
                  },
                  "&.Mui-focused": {
                    boxShadow: `0 0 0 3px ${alpha(primaryColor, 0.15)}`,
                  },
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: primaryColor,
                },
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
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: primaryColor,
                    },
                  },
                  "&.Mui-focused": {
                    boxShadow: `0 0 0 3px ${alpha(primaryColor, 0.15)}`,
                  },
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: primaryColor,
                },
              }}
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

            {/* Forgot Password Link - Above Button */}
            <Box sx={{ textAlign: "right", mb: 2 }}>
              <Link
                component={RouterLink}
                to="/forgot-password"
                underline="hover"
                sx={{
                  color: "text.secondary",
                  fontWeight: 500,
                  fontSize: "0.8125rem",
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
              startIcon={!submitting && <LoginIcon />}
              sx={{
                py: 1.5,
                textTransform: "none",
                fontSize: "1rem",
                fontWeight: 600,
                borderRadius: 2,
                bgcolor: primaryColor,
                boxShadow: `0 4px 14px 0 ${alpha(primaryColor, 0.35)}`,
                transition: "all 0.2s ease",
                "&:hover": {
                  bgcolor: primaryColor,
                  transform: "translateY(-1px)",
                  boxShadow: `0 6px 20px 0 ${alpha(primaryColor, 0.45)}`,
                },
                "&:active": {
                  transform: "translateY(0)",
                },
                "&.Mui-disabled": {
                  bgcolor: alpha(primaryColor, 0.5),
                  color: "white",
                },
              }}
            >
              {submitting ? (
                <>
                  <CircularProgress
                    size={20}
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

      {/* OAuth Section */}
      {hasEnabledOAuth && (
        <>
          <Divider sx={{ my: 3 }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ px: 2, fontSize: "0.8125rem" }}
            >
              or continue with
            </Typography>
          </Divider>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
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
                  fullWidth
                  size="large"
                  onClick={() => handleOAuthClick(provider.key)}
                  disabled={submitting}
                  startIcon={
                    <Box
                      component="img"
                      src={provider.logo}
                      alt={provider.label}
                      sx={{ width: 20, height: 20 }}
                    />
                  }
                  sx={{
                    py: 1.25,
                    textTransform: "none",
                    fontSize: "0.9375rem",
                    fontWeight: 500,
                    borderRadius: 2,
                    borderColor: "divider",
                    color: "text.primary",
                    borderWidth: 1.5,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      borderColor: provider.brandColor,
                      bgcolor: alpha(provider.brandColor, 0.04),
                      borderWidth: 1.5,
                    },
                  }}
                >
                  {provider.label}
                </Button>
              );
            })}
          </Box>
        </>
      )}

      {/* Sign Up Link */}
      <Box sx={{ mt: 4, textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          Don't have an account?{" "}
          <Link
            component={RouterLink}
            to="/signup"
            underline="hover"
            sx={{
              color: primaryColor,
              fontWeight: 600,
              "&:hover": { color: primaryColor },
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

export default LoginForm;
