import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useSnackbar } from "../../contexts/SnackbarContext";
import { useOrganization } from "../../contexts/OrganizationContext";
import { API_ENDPOINTS } from "../../apis";
import {
  postRequest,
  extractMessage,
  isSuccess,
  parseError,
} from "../../lib/api";
import { localStorageUtils } from "../../hooks/useLocalStorage";

export const useForgotPasswordLogic = () => {
  const { showSnackbar } = useSnackbar();
  const { orgId: _orgId, isDevelopment: _isDevelopment } = useOrganization();
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [searchParams] = useSearchParams();
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogMessage, setDialogMessage] = useState("");
  const navigate = useNavigate();

  const companyParam = searchParams.get("company");
  const buildLink = (path: string) =>
    companyParam ? `${path}?company=${companyParam}` : path;

  const handleSubmit = async (values: { email: string }) => {
    setSubmitting(true);
    try {
      // Organization is identified via x-api-key header (set automatically by API client)
      const response = await postRequest(
        API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
        values,
      );

      if (isSuccess(response)) {
        const message = extractMessage(response);
        setDialogTitle("OTP Sent Successfully");
        setDialogMessage(
          message ||
            "A password reset OTP has been sent to your email address. Please check your inbox and follow the instructions.",
        );

        // Store the email for reset password page
        localStorageUtils.setString("resetPasswordEmail", values.email);

        setSuccessDialogOpen(true);
        setTimeout(() => {
          setSuccessDialogOpen(false);
          navigate(buildLink("/reset-password"));
        }, 3000);
      } else {
        const message = extractMessage(response);
        showSnackbar(message || "Failed to send OTP", "error");
      }
    } catch (error) {
      const parsedError = parseError(error);
      showSnackbar(
        parsedError.message ||
          "Connection error. Please check if the server is running.",
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
    navigate(buildLink("/reset-password"));
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
    handleCloseSuccessDialog,
  };
};
