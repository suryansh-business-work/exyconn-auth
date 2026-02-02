import React, { useMemo } from "react";
import {
  Box,
  Typography,
  Container,
  Paper,
  Fade,
  Grow,
  keyframes,
  alpha,
} from "@mui/material";
import { AuthLogo } from "../../../common/components";
import ClassicLoginForm from "./ClassicLoginForm";
import { Organization } from "../../../types/organization";
import { OAuthProvider } from "../useLoginLogic";

// Subtle floating animation
const floatAnimation = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

// Gradient shift animation
const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

interface ClassicLoginPageProps {
  organization: Organization | null;
  onSubmit: (values: { email: string; password: string }) => void;
  onGoogleLogin: () => void;
  submitting: boolean;
  hasEnabledOAuth?: boolean;
  enabledOAuthProviders?: Record<OAuthProvider, boolean>;
  onOAuthLogin?: (provider: OAuthProvider) => void;
}

const ClassicLoginPage: React.FC<ClassicLoginPageProps> = ({
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
          ?.text || "Welcome Back",
      slogan:
        organization?.customTextSections?.find((s) => s.slug === "slogan")
          ?.text || "",
    }),
    [organization],
  );

  const backgroundImage = organization?.loginBgImages?.[0]?.url || "";
  const primaryColor = organization?.orgTheme?.primaryColor || "#6366f1";
  const secondaryColor = adjustColor(primaryColor, -40);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        py: 4,
        // Dynamic background
        backgroundImage: backgroundImage
          ? `url(${backgroundImage})`
          : `linear-gradient(-45deg, ${primaryColor}, ${secondaryColor}, ${adjustColor(primaryColor, 20)}, ${adjustColor(secondaryColor, 30)})`,
        backgroundSize: backgroundImage ? "cover" : "400% 400%",
        backgroundPosition: "center",
        animation: backgroundImage
          ? "none"
          : `${gradientShift} 15s ease infinite`,
        // Overlay for background image
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          background: backgroundImage
            ? `linear-gradient(135deg, ${alpha(primaryColor, 0.85)} 0%, ${alpha(secondaryColor, 0.7)} 100%)`
            : "transparent",
          backdropFilter: backgroundImage ? "blur(2px)" : "none",
        },
        // Decorative elements
        "&::after": {
          content: '""',
          position: "absolute",
          top: -100,
          right: -100,
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${alpha("#fff", 0.1)} 0%, transparent 70%)`,
          animation: `${floatAnimation} 6s ease-in-out infinite`,
        },
      }}
    >
      {/* Decorative circles */}
      <Box
        sx={{
          position: "absolute",
          bottom: -150,
          left: -150,
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${alpha("#fff", 0.08)} 0%, transparent 60%)`,
          animation: `${floatAnimation} 8s ease-in-out infinite reverse`,
        }}
      />

      <Container maxWidth="sm" sx={{ position: "relative", zIndex: 1 }}>
        {/* Header Section */}
        <Fade in timeout={600}>
          <Box sx={{ textAlign: "center", mb: 4, color: "white" }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 700,
                textShadow: "0 4px 20px rgba(0,0,0,0.3)",
                mb: 1.5,
                letterSpacing: "-1px",
                fontSize: { xs: "2.25rem", sm: "3rem", md: "3.5rem" },
                lineHeight: 1.1,
              }}
            >
              {customText.title}
            </Typography>
            {customText.slogan && (
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 400,
                  opacity: 0.9,
                  textShadow: "0 2px 10px rgba(0,0,0,0.2)",
                  maxWidth: 450,
                  mx: "auto",
                  lineHeight: 1.6,
                  fontSize: { xs: "1rem", sm: "1.125rem" },
                }}
              >
                {customText.slogan}
              </Typography>
            )}
          </Box>
        </Fade>

        {/* Login Card */}
        <Grow in timeout={800} style={{ transformOrigin: "50% 0%" }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3.5, sm: 5 },
              borderRadius: 4,
              bgcolor: "rgba(255, 255, 255, 0.98)",
              backdropFilter: "blur(20px)",
              boxShadow: `0 25px 60px -15px rgba(0, 0, 0, 0.25), 0 0 0 1px ${alpha("#fff", 0.1)}`,
              position: "relative",
              overflow: "hidden",
              // Glass effect top highlight
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 1,
                background: `linear-gradient(90deg, transparent, ${alpha("#fff", 0.5)}, transparent)`,
              },
            }}
          >
            {/* Logo and Title */}
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <Box
                sx={{
                  display: "inline-flex",
                  p: 2,
                  borderRadius: 3,
                  bgcolor: alpha(primaryColor, 0.06),
                  mb: 2.5,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "scale(1.05)",
                    bgcolor: alpha(primaryColor, 0.1),
                  },
                }}
              >
                <AuthLogo organization={organization} size={64} />
              </Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  mb: 0.5,
                  color: "text.primary",
                  fontSize: { xs: "1.5rem", sm: "1.75rem" },
                }}
              >
                Sign In
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                {organization?.orgName
                  ? `Welcome to ${organization.orgName}`
                  : "Enter your credentials to continue"}
              </Typography>
            </Box>

            <ClassicLoginForm
              organization={organization}
              onSubmit={onSubmit}
              onGoogleLogin={onGoogleLogin}
              submitting={submitting}
              hasEnabledOAuth={hasEnabledOAuth}
              enabledOAuthProviders={enabledOAuthProviders}
              onOAuthLogin={onOAuthLogin}
            />
          </Paper>
        </Grow>

        {/* Footer */}
        <Fade in timeout={1000}>
          <Box sx={{ textAlign: "center", mt: 4, color: "white" }}>
            <Typography variant="body2" sx={{ opacity: 0.85, fontWeight: 500 }}>
              © {new Date().getFullYear()}{" "}
              {organization?.orgName || "Your Organization"}
            </Typography>
            <Typography
              variant="caption"
              sx={{ opacity: 0.7, display: "block", mt: 0.5 }}
            >
              Secure Authentication Portal
            </Typography>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};

// Helper function to adjust color brightness
function adjustColor(color: string, amount: number): string {
  const hex = color.replace("#", "");
  const r = Math.max(0, Math.min(255, parseInt(hex.slice(0, 2), 16) + amount));
  const g = Math.max(0, Math.min(255, parseInt(hex.slice(2, 4), 16) + amount));
  const b = Math.max(0, Math.min(255, parseInt(hex.slice(4, 6), 16) + amount));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

export default ClassicLoginPage;
