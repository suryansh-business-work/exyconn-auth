import React, { useMemo, useEffect } from "react";
import {
  Grid,
  Box,
  Typography,
  Fade,
  Grow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useOrganization } from "../contexts/OrganizationContext";
import { useAuth } from "../contexts/AuthContext";
import { useLoginLogic } from "./login/useLoginLogic";
import LoginBrandingPanel from "./login/LoginBrandingPanel";
import LoginForm from "./login/LoginForm";
import OrganizationNotFound from "./login/OrganizationNotFound";
import { AuthLogo } from "../common/components";
import { usePageTitle } from "@exyconn/common/client/hooks";
import { ClassicLoginPage } from "./login/classic";
import { MinimalLoginPage } from "./login/minimal";
import LoginLoadingSkeleton from "./login/LoginLoadingSkeleton";
import ConfigWarningAlert from "./login/ConfigWarningAlert";
import LoginBottomActions from "./login/LoginBottomActions";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

const Login: React.FC = () => {
  const { orgDetails, loading, isDevelopment } = useOrganization();
  const { isUserAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const {
    submitting,
    handleSubmit,
    handleGoogleLogin,
    handleOAuthLogin,
    hasEnabledOAuth,
    enabledOAuthProviders,
    notRegisteredDialog,
    closeNotRegisteredDialog,
  } = useLoginLogic(orgDetails);

  usePageTitle(
    loading ? "Loading..." : `Login - ${orgDetails?.orgName || "Auth"}`,
  );

  // Redirect if already authenticated (user data in localStorage means logged in)
  useEffect(() => {
    if (isUserAuthenticated && user) {
      // Get the matching redirect URL based on current origin
      const currentOrigin = window.location.origin;
      const currentHost = window.location.host;

      const matchingRedirect = orgDetails?.orgRedirectionSettings?.find((r) => {
        const authPageUrl = r.authPageUrl?.toLowerCase() || "";
        return (
          authPageUrl === currentOrigin.toLowerCase() ||
          authPageUrl === currentHost.toLowerCase() ||
          authPageUrl.includes(currentHost.toLowerCase())
        );
      });

      // Get the first matching redirection URL from the array
      const redirectUrl = matchingRedirect?.redirectionUrls?.[0]?.url;
      if (redirectUrl) {
        const token = localStorage.getItem("authToken");
        if (token) {
          const separator = redirectUrl.includes("?") ? "&" : "?";
          window.location.href = `${redirectUrl}${separator}token=${encodeURIComponent(token)}`;
        } else {
          window.location.href = redirectUrl;
        }
      } else {
        // Fallback to profile if no matching redirect configured
        navigate("/profile");
      }
    }
  }, [isUserAuthenticated, user, orgDetails, navigate]);

  const customText = useMemo(
    () => ({
      title:
        orgDetails?.customTextSections?.find((s) => s.slug === "title")?.text ||
        "Welcome",
      slogan:
        orgDetails?.customTextSections?.find((s) => s.slug === "slogan")
          ?.text || "",
    }),
    [orgDetails],
  );

  // Use issues from API response (server-side computed)
  const configurationIssues = useMemo(() => {
    if (!orgDetails) return { critical: [], warning: [], info: [] };
    // Use server-provided issues or fallback to empty
    return (
      (orgDetails as any).issues || { critical: [], warning: [], info: [] }
    );
  }, [orgDetails]);

  // Check if there are any configuration issues
  const hasConfigIssues = useMemo(() => {
    return (
      configurationIssues.critical.length > 0 ||
      configurationIssues.warning.length > 0
    );
  }, [configurationIssues]);

  // Loading state with Skeleton
  if (loading) {
    return <LoginLoadingSkeleton />;
  }

  // No organization match (production only)
  if (!orgDetails && !isDevelopment) {
    return <OrganizationNotFound />;
  }

  // Get login page design from organization settings
  const loginPageDesign = orgDetails?.loginPageDesign || "split";

  // Render Classic design
  if (loginPageDesign === "classic") {
    return (
      <>
        <ConfigWarningAlert
          isDevelopment={isDevelopment}
          hasConfigIssues={hasConfigIssues}
          configurationIssues={configurationIssues}
        />
        <ClassicLoginPage
          organization={orgDetails}
          onSubmit={handleSubmit}
          onGoogleLogin={handleGoogleLogin}
          onOAuthLogin={handleOAuthLogin}
          submitting={submitting}
          hasEnabledOAuth={hasEnabledOAuth}
          enabledOAuthProviders={enabledOAuthProviders}
        />
        <LoginBottomActions isDevelopment={isDevelopment} />
      </>
    );
  }

  // Render Minimal design
  if (loginPageDesign === "minimal") {
    return (
      <>
        <ConfigWarningAlert
          isDevelopment={isDevelopment}
          hasConfigIssues={hasConfigIssues}
          configurationIssues={configurationIssues}
        />
        <MinimalLoginPage
          organization={orgDetails}
          onSubmit={handleSubmit}
          onGoogleLogin={handleGoogleLogin}
          onOAuthLogin={handleOAuthLogin}
          submitting={submitting}
          hasEnabledOAuth={hasEnabledOAuth}
          enabledOAuthProviders={enabledOAuthProviders}
        />
        <LoginBottomActions isDevelopment={isDevelopment} />
      </>
    );
  }

  // Default: Render Split design
  return (
    <>
      <ConfigWarningAlert
        isDevelopment={isDevelopment}
        hasConfigIssues={hasConfigIssues}
        configurationIssues={configurationIssues}
      />
      <Grid container sx={{ minHeight: "100vh" }}>
        <LoginBrandingPanel organization={orgDetails} customText={customText} />

        {/* Right Panel - Login Form */}
        <Grid
          item
          xs={12}
          md={4.8}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: { xs: 3, sm: 4, md: 5 },
            minHeight: { xs: "100vh", md: "auto" },
            bgcolor: "#fafbfc",
            position: "relative",
            // Subtle pattern background
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.03) 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        >
          <Fade in timeout={600}>
            <Box
              sx={{
                width: "100%",
                maxWidth: 420,
                px: { xs: 1, sm: 0 },
                pt: { xs: 10, md: 0 },
              }}
            >
              <Grow in timeout={400}>
                <Box
                  sx={{
                    bgcolor: "background.paper",
                    borderRadius: 3,
                    p: { xs: 3, sm: 4 },
                    boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Box sx={{ textAlign: "center", mb: 3.5 }}>
                    <Box
                      sx={{
                        display: "inline-flex",
                        p: 1.5,
                        borderRadius: 2.5,
                        bgcolor: "rgba(0, 0, 0, 0.02)",
                        mb: 2,
                      }}
                    >
                      <AuthLogo organization={orgDetails} size={100} />
                    </Box>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        mb: 0.5,
                        color: "text.primary",
                        letterSpacing: "-0.3px",
                      }}
                    >
                      Welcome Back
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {orgDetails?.orgName
                        ? `Sign in to ${orgDetails.orgName}`
                        : "Sign in to continue"}
                    </Typography>
                  </Box>

                  <LoginForm
                    organization={orgDetails}
                    onSubmit={handleSubmit}
                    onGoogleLogin={handleGoogleLogin}
                    onOAuthLogin={handleOAuthLogin}
                    submitting={submitting}
                    hasEnabledOAuth={hasEnabledOAuth}
                    enabledOAuthProviders={enabledOAuthProviders}
                  />
                </Box>
              </Grow>

              {/* Footer for desktop */}
              <Box
                sx={{
                  display: { xs: "none", md: "block" },
                  textAlign: "center",
                  mt: 3,
                }}
              >
                <Typography
                  variant="caption"
                  color="text.disabled"
                  sx={{ fontSize: "0.75rem" }}
                >
                  © {new Date().getFullYear()}{" "}
                  {orgDetails?.orgName || "Auth System"}
                </Typography>
              </Box>
            </Box>
          </Fade>

          <LoginBottomActions isDevelopment={isDevelopment} />
        </Grid>
      </Grid>

      {/* Not Registered Dialog */}
      <Dialog
        open={notRegisteredDialog.open}
        onClose={closeNotRegisteredDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <PersonAddIcon color="primary" />
            <Typography variant="h6">Account Not Found</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" color="text.secondary">
            No account found with email{" "}
            <strong>{notRegisteredDialog.email}</strong>.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Please sign up first to create your account.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeNotRegisteredDialog} color="inherit">
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              closeNotRegisteredDialog();
              navigate("/signup");
            }}
            startIcon={<PersonAddIcon />}
          >
            Sign Up
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Login;
