import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "../../apis";
import {
  postRequest,
  extractMessage,
  isSuccess,
  parseError,
} from "../../lib/api";
import { localStorageUtils } from "../../hooks/useLocalStorage";
import { useSnackbar } from "../../contexts/SnackbarContext";
import { useOrganization } from "../../contexts/OrganizationContext";

export const useResetPasswordLogic = () => {
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [searchParams] = useSearchParams();
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogMessage, setDialogMessage] = useState("");
  const [storedEmail, setStoredEmail] = useState<string>("");
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { orgId: _orgId, isDevelopment: _isDevelopment } = useOrganization();

  // Check for stored email from forgot password
  useEffect(() => {
    const email = localStorageUtils.getString("resetPasswordEmail");
    if (email) {
      setStoredEmail(email);
      // Don't clear the email yet - keep it for resend OTP
    }
  }, []);

  const companyParam = searchParams.get("company");
  const buildLink = (path: string) =>
    companyParam ? `${path}?company=${companyParam}` : path;

  const handleSubmit = async (values: {
    email: string;
    otp: string;
    newPassword: string;
  }) => {
    setSubmitting(true);
    try {
      // Use stored email if available, otherwise use the form value
      const emailToUse = storedEmail || values.email;
      // Organization is identified via x-api-key header (set automatically by API client)
      const requestData = {
        email: emailToUse,
        otp: values.otp,
        newPassword: values.newPassword,
      };

      const response = await postRequest(
        API_ENDPOINTS.AUTH.RESET_PASSWORD,
        requestData,
      );

      if (isSuccess(response)) {
        const message = extractMessage(response);
        setDialogTitle("Password Reset Successful");
        setDialogMessage(
          message ||
            "Your password has been successfully reset. You can now log in with your new password.",
        );
        setSuccessDialogOpen(true);
        // Clear the stored email after successful password reset
        localStorageUtils.remove("resetPasswordEmail");
        setTimeout(() => {
          setSuccessDialogOpen(false);
          navigate(buildLink("/"));
        }, 3000);
      } else {
        const message = extractMessage(response);
        showSnackbar(message || "Password reset failed", "error");
      }
    } catch (error) {
      const parsedError = parseError(error);
      showSnackbar(
        parsedError.message || "An error occurred. Please try again.",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendOTP = async (email: string) => {
    if (!email) {
      showSnackbar("Email is required", "error");
      return;
    }

    setResending(true);
    try {
      // Organization is identified via x-api-key header (set automatically by API client)
      const response = await postRequest(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
        email,
      });

      if (isSuccess(response)) {
        const message = extractMessage(response);
        showSnackbar(message || "OTP has been resent to your email", "success");
      } else {
        const message = extractMessage(response);
        showSnackbar(
          message || "Failed to resend OTP. Please try again.",
          "error",
        );
      }
    } catch (error) {
      const parsedError = parseError(error);
      showSnackbar(
        parsedError.message || "Failed to resend OTP. Please try again.",
        "error",
      );
    } finally {
      setResending(false);
    }
  };

  const handleCloseSuccessDialog = () => {
    setSuccessDialogOpen(false);
    navigate(buildLink("/"));
  };

  return {
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
  };
};
