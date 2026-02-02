import React, { useMemo } from "react";
import { Box, Typography, Container, Paper, Fade, Grow } from "@mui/material";
import { AuthLogo } from "../../../common/components";
import ClassicLoginForm from "./ClassicLoginForm";
import { Organization } from "../../../types/organization";
import { OAuthProvider } from "../../login/useLoginLogic";

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
  const primaryColor = organization?.orgTheme?.primaryColor || "#667eea";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage: backgroundImage
          ? `url(${backgroundImage})`
          : `linear-gradient(135deg, ${primaryColor} 0%, ${adjustColor(primaryColor, -30)} 50%, ${adjustColor(primaryColor, -50)} 100%)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        position: "relative",
        py: 4,
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          background: backgroundImage
            ? "linear-gradient(135deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.3) 100%)"
            : "transparent",
        },
      }}
    >
      <Container maxWidth="sm" sx={{ position: "relative", zIndex: 1 }}>
        {/* Header Section */}
        <Fade in timeout={800}>
          <Box sx={{ textAlign: "center", mb: 4, color: "white" }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                textShadow: "0 4px 12px rgba(0,0,0,0.4)",
                mb: 1.5,
                letterSpacing: "-0.5px",
                fontSize: { xs: "2.5rem", sm: "3.5rem" },
              }}
            >
              {customText.title}
            </Typography>
            {customText.slogan && (
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 400,
                  opacity: 0.95,
                  textShadow: "0 2px 8px rgba(0,0,0,0.3)",
                  maxWidth: 400,
                  mx: "auto",
                  lineHeight: 1.5,
                }}
              >
                {customText.slogan}
              </Typography>
            )}
          </Box>
        </Fade>

        {/* Login Card */}
        <Grow in timeout={600}>
          <Paper
            elevation={24}
            sx={{
              p: { xs: 4, sm: 6 },
              borderRadius: 4,
              bgcolor: "rgba(255, 255, 255, 0.98)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
            }}
          >
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <Box
                sx={{
                  display: "inline-flex",
                  p: 2,
                  borderRadius: 3,
                  bgcolor: "rgba(0, 0, 0, 0.03)",
                  mb: 2,
                }}
              >
                <AuthLogo organization={organization} size={72} />
              </Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  mt: 2,
                  mb: 0.5,
                  background: `linear-gradient(135deg, ${primaryColor} 0%, ${adjustColor(primaryColor, -30)} 100%)`,
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Sign In
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
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
