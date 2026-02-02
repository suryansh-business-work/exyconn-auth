import React, { useMemo } from "react";
import { Box, Typography, Container, Fade } from "@mui/material";
import { AuthLogo } from "../../../common/components";
import MinimalLoginForm from "./MinimalLoginForm";
import { Organization } from "../../../types/organization";
import { OAuthProvider } from "../../login/useLoginLogic";

interface EnabledOAuthProviders {
  google: boolean;
  microsoft: boolean;
  apple: boolean;
  github: boolean;
}

interface MinimalLoginPageProps {
  organization: Organization | null;
  onSubmit: (values: { email: string; password: string }) => void;
  onGoogleLogin: () => void;
  onOAuthLogin?: (provider: OAuthProvider) => void;
  submitting: boolean;
  hasEnabledOAuth?: boolean;
  enabledOAuthProviders?: EnabledOAuthProviders;
}

const MinimalLoginPage: React.FC<MinimalLoginPageProps> = ({
  organization,
  onSubmit,
  onGoogleLogin,
  onOAuthLogin,
  submitting,
  hasEnabledOAuth,
  enabledOAuthProviders,
}) => {
  const customText = useMemo(
    () => ({
      title:
        organization?.customTextSections?.find((s) => s.slug === "title")
          ?.text || "Welcome",
      slogan:
        organization?.customTextSections?.find((s) => s.slug === "slogan")
          ?.text || "",
    }),
    [organization],
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#fafafa",
        py: 4,
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "40%",
          background: `linear-gradient(180deg, rgba(0,0,0,0.02) 0%, transparent 100%)`,
          pointerEvents: "none",
        },
      }}
    >
      <Container maxWidth="xs">
        <Fade in timeout={600}>
          <Box sx={{ textAlign: "center", mb: 5 }}>
            <Box
              sx={{
                display: "inline-flex",
                p: 2.5,
                borderRadius: "50%",
                bgcolor: "white",
                boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                mb: 3,
                border: "1px solid rgba(0,0,0,0.04)",
              }}
            >
              <AuthLogo organization={organization} size={64} />
            </Box>
          </Box>
        </Fade>

        <Fade in timeout={800}>
          <Box sx={{ mb: 5, textAlign: "center" }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 300,
                letterSpacing: "-1px",
                color: "text.primary",
                mb: 1.5,
                fontSize: { xs: "2rem", sm: "2.5rem" },
              }}
            >
              {customText.title}
            </Typography>
            {customText.slogan && (
              <Typography
                variant="body1"
                sx={{
                  color: "text.secondary",
                  fontWeight: 300,
                  letterSpacing: "0.5px",
                  maxWidth: 280,
                  mx: "auto",
                  lineHeight: 1.6,
                }}
              >
                {customText.slogan}
              </Typography>
            )}
          </Box>
        </Fade>

        <Fade in timeout={1000}>
          <Box
            sx={{
              bgcolor: "white",
              borderRadius: 3,
              p: { xs: 3, sm: 4 },
              boxShadow: "0 2px 24px rgba(0,0,0,0.06)",
              border: "1px solid rgba(0,0,0,0.04)",
            }}
          >
            <MinimalLoginForm
              organization={organization}
              onSubmit={onSubmit}
              onGoogleLogin={onGoogleLogin}
              onOAuthLogin={onOAuthLogin}
              submitting={submitting}
              hasEnabledOAuth={hasEnabledOAuth}
              enabledOAuthProviders={enabledOAuthProviders}
            />
          </Box>
        </Fade>

        {/* Footer */}
        <Fade in timeout={1200}>
          <Box sx={{ textAlign: "center", mt: 6 }}>
            <Typography
              variant="caption"
              sx={{
                color: "text.disabled",
                letterSpacing: "1px",
                textTransform: "uppercase",
                fontSize: "0.7rem",
              }}
            >
              © {new Date().getFullYear()} {organization?.orgName}
            </Typography>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};

export default MinimalLoginPage;
