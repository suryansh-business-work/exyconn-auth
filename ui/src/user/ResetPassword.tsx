import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useOrganization } from "../contexts/OrganizationContext";
import { useAuth } from "../contexts/AuthContext";
import { AuthContainer, AuthLogo } from "../common/components";
import ResetPasswordForm from "./reset-password/ResetPasswordForm";
import SuccessDialog from "./forgot-password/SuccessDialog";
import { useResetPasswordLogic } from "./reset-password/useResetPasswordLogic";
import { usePageTitle } from "../lib/hooks";

const ResetPassword: React.FC = () => {
  const { orgDetails, loading } = useOrganization();
  const { isUserAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const {
    submitting,
    resending,
    handleSubmit,
    handleResendOTP,
    buildLink,
    successDialogOpen,
    dialogTitle,
    dialogMessage,
    storedEmail,
    handleCloseSuccessDialog,
  } = useResetPasswordLogic();

  usePageTitle(
    loading
      ? "Loading..."
      : `Reset Password - ${orgDetails?.orgName || "Auth"}`,
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
      <AuthContainer loading={loading} maxWidth={420}>
        <AuthLogo organization={orgDetails} size={64} />
        <ResetPasswordForm
          onSubmit={handleSubmit}
          submitting={submitting}
          resending={resending}
          onResendOTP={handleResendOTP}
          buildLink={buildLink}
          storedEmail={storedEmail}
          passwordPolicy={orgDetails?.passwordPolicy}
        />
      </AuthContainer>

      <SuccessDialog
        open={successDialogOpen}
        title={dialogTitle}
        message={dialogMessage}
        onClose={handleCloseSuccessDialog}
      />
    </>
  );
};

export default ResetPassword;
