import React from "react";
import { useOrganization } from "../contexts/OrganizationContext";
import { AuthContainer, AuthLogo } from "../common/components";
import VerifyOTPForm from "./verify-otp/VerifyOTPForm";
import SuccessDialog from "./forgot-password/SuccessDialog";
import { useVerifyOTPLogic } from "./verify-otp/useVerifyOTPLogic";
import { usePageTitle } from "../lib/hooks";

const VerifyOTP: React.FC = () => {
  const { orgDetails, loading } = useOrganization();
  const {
    submitting,
    resending,
    handleSubmit,
    handleResendOTP,
    getStoredEmail,
    buildLink,
    successDialogOpen,
    dialogTitle,
    dialogMessage,
    handleCloseSuccessDialog,
  } = useVerifyOTPLogic();

  usePageTitle(
    loading
      ? "Loading..."
      : `Verify Account - ${orgDetails?.orgName || "Auth"}`,
  );

  return (
    <>
      <AuthContainer loading={loading} maxWidth={420}>
        <AuthLogo organization={orgDetails} size={64} />
        <VerifyOTPForm
          organization={orgDetails}
          onSubmit={handleSubmit}
          submitting={submitting}
          resending={resending}
          storedEmail={getStoredEmail()}
          onResendOTP={handleResendOTP}
          buildLink={buildLink}
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

export default VerifyOTP;
