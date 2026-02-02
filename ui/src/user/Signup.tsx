import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useOrganization } from "../contexts/OrganizationContext";
import { useAuth } from "../contexts/AuthContext";
import { useSignupLogic } from "./signup/useSignupLogic";
import { AuthContainer, AuthLogo, AuthHeader } from "../common/components";
import SignupForm from "./signup/SignupForm";
import { usePageTitle } from "@exyconn/common/client/hooks";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
} from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";

const Signup: React.FC = () => {
  const { orgId, orgDetails, loading, isDevelopment } = useOrganization();
  const { isUserAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const {
    submitting,
    handleSubmit,
    handleGoogleSignup,
    buildLink,
    hasEnabledOAuth,
    signupRoles,
    selectedRole,
    handleRoleChange,
    alreadyExistsDialog,
    closeAlreadyExistsDialog,
  } = useSignupLogic(orgId, isDevelopment);

  usePageTitle(
    loading ? "Loading..." : `Sign Up - ${orgDetails?.orgName || "Auth"}`,
  );

  // Redirect if already authenticated
  useEffect(() => {
    if (isUserAuthenticated && user) {
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

      // Get the default or first URL from redirectionUrls array
      const redirectUrl =
        matchingRedirect?.redirectionUrls?.find((u) => u.isDefault)?.url ||
        matchingRedirect?.redirectionUrls?.[0]?.url;
      if (redirectUrl) {
        const token = localStorage.getItem("authToken");
        if (token) {
          const separator = redirectUrl.includes("?") ? "&" : "?";
          window.location.href = `${redirectUrl}${separator}token=${encodeURIComponent(token)}`;
        } else {
          window.location.href = redirectUrl;
        }
      } else {
        navigate("/profile");
      }
    }
  }, [isUserAuthenticated, user, orgDetails, navigate]);

  return (
    <>
      <AuthContainer loading={loading} maxWidth={440}>
        <AuthLogo organization={orgDetails} size={128} />
        <AuthHeader
          title="Create Account"
          subtitle={orgDetails?.orgName || "Sign up to get started"}
        />

        <SignupForm
          onSubmit={handleSubmit}
          onGoogleSignup={handleGoogleSignup}
          submitting={submitting}
          buildLink={buildLink}
          hasEnabledOAuth={hasEnabledOAuth}
          passwordPolicy={orgDetails?.passwordPolicy}
          signupRoles={signupRoles}
          selectedRole={selectedRole}
          onRoleChange={handleRoleChange}
        />
      </AuthContainer>

      {/* Already Exists Dialog */}
      <Dialog
        open={alreadyExistsDialog.open}
        onClose={closeAlreadyExistsDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <LoginIcon color="primary" />
            <Typography variant="h6">Account Already Exists</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" color="text.secondary">
            An account with email <strong>{alreadyExistsDialog.email}</strong>{" "}
            already exists.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Please login to access your account instead.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeAlreadyExistsDialog} color="inherit">
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              closeAlreadyExistsDialog();
              navigate("/");
            }}
            startIcon={<LoginIcon />}
          >
            Login
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Signup;
