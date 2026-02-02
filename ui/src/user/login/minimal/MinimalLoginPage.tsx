import React, { useMemo } from "react";
import {
  Box,
  Typography,
  Container,
  Fade,
  alpha,
  keyframes,
} from "@mui/material";
import { AuthLogo } from "../../../common/components";
import MinimalLoginForm from "./MinimalLoginForm";
import { Organization } from "../../../types/organization";
import { OAuthProvider } from "../useLoginLogic";

// Subtle pulse animation for the logo container
const pulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.1); }
  50% { box-shadow: 0 0 0 20px rgba(99, 102, 241, 0); }
`;

interface MinimalLoginPageProps {
  organization: Organization | null;
  onSubmit: (values: { email: string; password: string }) => void;
  onGoogleLogin: () => void;
  submitting: boolean;
  hasEnabledOAuth?: boolean;
  enabledOAuthProviders?: Record<OAuthProvider, boolean>;
  onOAuthLogin?: (provider: OAuthProvider) => void;
}

const MinimalLoginPage: React.FC<MinimalLoginPageProps> = ({
  organization,
  onSubmit,
  onGoogleLogin,
  submitting,
  hasEnabledOAuth,
  enabledOAuthProviders,
  onOAuthLogin,
}) => {
  const customText = useMemo(
    () => ({
      title:
        organization?.customTextSections?.find((s) => s.slug === "title")
          ?.text || "Welcome back",
      slogan:
        organization?.customTextSections?.find((s) => s.slug === "slogan")
          ?.text || "",
    }),
    [organization],
  );

  const primaryColor = organization?.orgTheme?.primaryColor || "#6366f1";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#fff",
        py: 4,
        position: "relative",
        overflow: "hidden",
        // Subtle background pattern
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          backgroundImage: `radial-gradient(${alpha(primaryColor, 0.03)} 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
          pointerEvents: "none",
        },
        // Top gradient accent
        "&::after": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, ${primaryColor}, ${alpha(primaryColor, 0.6)}, ${primaryColor})`,
          backgroundSize: "200% 100%",
        },
      }}
    >
      <Container maxWidth="xs" sx={{ position: "relative", zIndex: 1 }}>
        {/* Logo */}
        <Fade in timeout={400}>
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Box
              sx={{
                display: "inline-flex",
                p: 2,
                borderRadius: "20px",
                bgcolor: alpha(primaryColor, 0.04),
                border: `1px solid ${alpha(primaryColor, 0.08)}`,
                animation: `${pulse} 3s ease-in-out infinite`,
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "scale(1.02)",
                  bgcolor: alpha(primaryColor, 0.06),
                },
              }}
            >
              <AuthLogo organization={organization} size={56} />
            </Box>
          </Box>
        </Fade>

        {/* Title */}
        <Fade in timeout={600}>
          <Box sx={{ mb: 4, textAlign: "center" }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 600,
                letterSpacing: "-0.5px",
                color: "#111827",
                mb: 1,
                fontSize: { xs: "1.75rem", sm: "2rem" },
              }}
            >
              {customText.title}
            </Typography>
            {customText.slogan ? (
              <Typography
                variant="body1"
                sx={{
                  color: "#6b7280",
                  fontWeight: 400,
                  maxWidth: 300,
                  mx: "auto",
                  lineHeight: 1.5,
                }}
              >
                {customText.slogan}
              </Typography>
            ) : (
              <Typography
                variant="body2"
                sx={{
                  color: "#9ca3af",
                }}
              >
                Sign in to your account to continue
              </Typography>
            )}
          </Box>
        </Fade>

        {/* Login Form Card */}
        <Fade in timeout={800}>
          <Box
            sx={{
              bgcolor: "white",
              borderRadius: 3,
              p: { xs: 3, sm: 4 },
              boxShadow:
                "0 1px 3px rgba(0,0,0,0.05), 0 20px 40px rgba(0,0,0,0.03)",
              border: "1px solid #f3f4f6",
              transition: "all 0.3s ease",
              "&:hover": {
                boxShadow:
                  "0 1px 3px rgba(0,0,0,0.05), 0 25px 50px rgba(0,0,0,0.06)",
              },
            }}
          >
            <MinimalLoginForm
              organization={organization}
              onSubmit={onSubmit}
              onGoogleLogin={onGoogleLogin}
              submitting={submitting}
              hasEnabledOAuth={hasEnabledOAuth}
              enabledOAuthProviders={enabledOAuthProviders}
              onOAuthLogin={onOAuthLogin}
            />
          </Box>
        </Fade>

        {/* Footer */}
        <Fade in timeout={1000}>
          <Box sx={{ textAlign: "center", mt: 6 }}>
            <Typography
              variant="caption"
              sx={{
                color: "#d1d5db",
                fontSize: "0.75rem",
              }}
            >
              © {new Date().getFullYear()}{" "}
              {organization?.orgName || "Your Company"}. All rights reserved.
            </Typography>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};

export default MinimalLoginPage;
