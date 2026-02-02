import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "../../apis";
import {
  postRequest,
  extractMessage,
  isSuccess,
  parseError,
} from "../../lib/api";
import { useSnackbar } from "../../contexts/SnackbarContext";

export const useVerifyOTPLogic = () => {
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [searchParams] = useSearchParams();
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogMessage, setDialogMessage] = useState("");
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();

  const companyParam = searchParams.get("company");
  const buildLink = (path: string) =>
    companyParam ? `${path}?company=${companyParam}` : path;

  // Get email from localStorage
  const getStoredEmail = () => localStorage.getItem("verifyEmail") || "";

  const handleSubmit = async (values: { email: string; otp: string }) => {
    setSubmitting(true);
    try {
      const response = await postRequest(API_ENDPOINTS.AUTH.VERIFY, values);

      if (isSuccess(response)) {
        const message = extractMessage(response);
        setDialogTitle("Account Verified Successfully");
        setDialogMessage(
          message ||
            "Your account has been successfully verified. You can now log in to your account.",
        );
        setSuccessDialogOpen(true);
        // Clear stored email after successful verification
        localStorage.removeItem("verifyEmail");
        setTimeout(() => {
          setSuccessDialogOpen(false);
          navigate(buildLink("/"));
        }, 3000);
      } else {
        const message = extractMessage(response);
        showSnackbar(message || "Verification failed", "error");
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
      const response = await postRequest(
        API_ENDPOINTS.AUTH.RESEND_VERIFICATION_OTP,
        {
          email,
        },
      );

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
    getStoredEmail,
    buildLink,
    successDialogOpen,
    dialogTitle,
    dialogMessage,
    handleCloseSuccessDialog,
  };
};
