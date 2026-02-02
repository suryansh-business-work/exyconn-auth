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
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import { LoginSchema } from "../../login/LoginSchema";
import Policy from "../../../components/Policy";
import { Organization } from "../../../types/organization";
import { OAuthProvider } from "../../login/useLoginLogic";

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
    bgColor: string;
  }[] = [
    {
      key: "google",
      label: "Google",
      logo: "/assets/logos/google.svg",
      bgColor: "white",
    },
    {
      key: "microsoft",
      label: "Microsoft",
      logo: "/assets/logos/microsoft.svg",
      bgColor: "white",
    },
    {
      key: "apple",
      label: "Apple",
      logo: "/assets/logos/apple.svg",
      bgColor: "white",
    },
    {
      key: "github",
      label: "GitHub",
      logo: "/assets/logos/github.png",
      bgColor: "white",
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
                  bgcolor: "rgba(255, 255, 255, 0.9)",
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
                  bgcolor: "rgba(255, 255, 255, 0.9)",
                },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={submitting || !isValid || !dirty}
              sx={{
                mt: 1,
                mb: 2,
                py: 1.5,
                textTransform: "none",
                fontSize: "1rem",
                fontWeight: 600,
                borderRadius: 1,
                bgcolor: organization?.orgTheme?.primaryColor || "primary.main",
                "&:hover": {
                  bgcolor:
                    organization?.orgTheme?.primaryColor || "primary.dark",
                  filter: "brightness(0.9)",
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

      {/* OAuth Section - Only show if OAuth is enabled */}
      {hasEnabledOAuth && (
        <>
          <Divider sx={{ my: 2 }}>
            <Typography variant="body2" color="text.secondary">
              OR
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
                  sx={{
                    py: 1.5,
                    textTransform: "none",
                    fontSize: "1rem",
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    borderRadius: 1,
                    bgcolor: provider.bgColor,
                    borderColor: "grey.300",
                    color: "text.primary",
                    "&:hover": {
                      bgcolor: "grey.50",
                      borderColor: "grey.400",
                    },
                  }}
                >
                  <img
                    src={provider.logo}
                    alt={provider.label}
                    style={{ width: 20, height: 20 }}
                  />
                  Continue with {provider.label}
                </Button>
              );
            })}
          </Box>
        </>
      )}

      {/* Links */}
      <Box
        sx={{
          mt: 3,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        <Link
          component={RouterLink}
          to="/signup"
          underline="hover"
          sx={{
            color: "primary.main",
            fontWeight: 500,
            fontSize: "0.9rem",
          }}
        >
          Don't have an account? Sign up
        </Link>

        <Link
          component={RouterLink}
          to="/forgot-password"
          underline="hover"
          sx={{
            color: "text.secondary",
            fontWeight: 500,
            fontSize: "0.9rem",
          }}
        >
          Forgot your password?
        </Link>
      </Box>

      <Box sx={{ mt: 3 }}>
        <Policy />
      </Box>
    </>
  );
};

export default ClassicLoginForm;
