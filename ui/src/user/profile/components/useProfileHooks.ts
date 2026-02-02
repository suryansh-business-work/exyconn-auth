import { useState, useCallback } from "react";
import { ProfileFormValues, PasswordChangeValues } from "../useProfileLogic";
import { useSnackbar } from "../../../contexts/SnackbarContext";
import { API_BASE_URL } from "../../../apis";
import { postRequest, isSuccess, extractMessage } from "../../../lib/api";

interface UserWithProvider {
  provider?: string;
}

export interface UseMfaReturn {
  mfaDisableDialogOpen: boolean;
  mfaVerifyDialogOpen: boolean;
  mfaOtp: string;
  mfaLoading: boolean;
  disableMfaPassword: string;
  setMfaDisableDialogOpen: (open: boolean) => void;
  setMfaVerifyDialogOpen: (open: boolean) => void;
  setMfaOtp: (otp: string) => void;
  setDisableMfaPassword: (password: string) => void;
  handleEnableMfa: () => Promise<void>;
  handleVerifyMfa: () => Promise<void>;
  handleDisableMfa: () => Promise<void>;
}

export const useMfa = (
  fetchProfile: () => void,
  user: UserWithProvider | null | undefined,
): UseMfaReturn => {
  const { showSnackbar } = useSnackbar();
  const [mfaDisableDialogOpen, setMfaDisableDialogOpen] = useState(false);
  const [mfaVerifyDialogOpen, setMfaVerifyDialogOpen] = useState(false);
  const [mfaOtp, setMfaOtp] = useState("");
  const [mfaLoading, setMfaLoading] = useState(false);
  const [disableMfaPassword, setDisableMfaPassword] = useState("");

  const handleEnableMfa = useCallback(async () => {
    setMfaLoading(true);
    try {
      const response = await postRequest(`${API_BASE_URL}/auth/mfa/enable`, {});
      if (isSuccess(response)) {
        setMfaVerifyDialogOpen(true);
        showSnackbar("Verification code sent to your email", "success");
      } else {
        showSnackbar(
          extractMessage(response) || "Failed to send verification code",
          "error",
        );
      }
    } catch (error: any) {
      showSnackbar(error.message || "Failed to enable MFA", "error");
    } finally {
      setMfaLoading(false);
    }
  }, [showSnackbar]);

  const handleVerifyMfa = useCallback(async () => {
    if (!mfaOtp || mfaOtp.length !== 6) {
      showSnackbar("Please enter a valid 6-digit code", "error");
      return;
    }
    setMfaLoading(true);
    try {
      const response = await postRequest(`${API_BASE_URL}/auth/mfa/verify`, {
        otp: mfaOtp,
      });
      if (isSuccess(response)) {
        showSnackbar("MFA enabled successfully", "success");
        setMfaVerifyDialogOpen(false);
        setMfaOtp("");
        fetchProfile();
      } else {
        showSnackbar(
          extractMessage(response) || "Invalid verification code",
          "error",
        );
      }
    } catch (error: any) {
      showSnackbar(error.message || "Failed to verify MFA", "error");
    } finally {
      setMfaLoading(false);
    }
  }, [mfaOtp, fetchProfile, showSnackbar]);

  const handleDisableMfa = useCallback(async () => {
    setMfaLoading(true);
    try {
      const isOAuthUser = user?.provider === "google";
      const response = await postRequest(`${API_BASE_URL}/auth/mfa/disable`, {
        password: isOAuthUser ? undefined : disableMfaPassword,
      });
      if (isSuccess(response)) {
        showSnackbar("MFA disabled successfully", "success");
        setMfaDisableDialogOpen(false);
        setDisableMfaPassword("");
        fetchProfile();
      } else {
        showSnackbar(
          extractMessage(response) || "Failed to disable MFA",
          "error",
        );
      }
    } catch (error: any) {
      showSnackbar(error.message || "Failed to disable MFA", "error");
    } finally {
      setMfaLoading(false);
    }
  }, [user, disableMfaPassword, fetchProfile, showSnackbar]);

  return {
    mfaDisableDialogOpen,
    mfaVerifyDialogOpen,
    mfaOtp,
    mfaLoading,
    disableMfaPassword,
    setMfaDisableDialogOpen,
    setMfaVerifyDialogOpen,
    setMfaOtp,
    setDisableMfaPassword,
    handleEnableMfa,
    handleVerifyMfa,
    handleDisableMfa,
  };
};

export interface UsePasswordFormReturn {
  showPasswordChange: boolean;
  showCurrentPassword: boolean;
  showNewPassword: boolean;
  showConfirmPassword: boolean;
  passwordForm: PasswordChangeValues;
  setShowPasswordChange: (show: boolean) => void;
  setShowCurrentPassword: (show: boolean) => void;
  setShowNewPassword: (show: boolean) => void;
  setShowConfirmPassword: (show: boolean) => void;
  setPasswordForm: React.Dispatch<React.SetStateAction<PasswordChangeValues>>;
  toggleCurrentPassword: () => void;
  toggleNewPassword: () => void;
  toggleConfirmPassword: () => void;
  handlePasswordChange: (
    field: keyof PasswordChangeValues,
  ) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  cancelPasswordChange: () => void;
}

export const usePasswordForm = (): UsePasswordFormReturn => {
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState<PasswordChangeValues>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const toggleCurrentPassword = () =>
    setShowCurrentPassword(!showCurrentPassword);
  const toggleNewPassword = () => setShowNewPassword(!showNewPassword);
  const toggleConfirmPassword = () =>
    setShowConfirmPassword(!showConfirmPassword);

  const handlePasswordChange =
    (field: keyof PasswordChangeValues) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPasswordForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const cancelPasswordChange = () => {
    setShowPasswordChange(false);
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  return {
    showPasswordChange,
    showCurrentPassword,
    showNewPassword,
    showConfirmPassword,
    passwordForm,
    setShowPasswordChange,
    setShowCurrentPassword,
    setShowNewPassword,
    setShowConfirmPassword,
    setPasswordForm,
    toggleCurrentPassword,
    toggleNewPassword,
    toggleConfirmPassword,
    handlePasswordChange,
    cancelPasswordChange,
  };
};

export interface UseProfileFormReturn {
  isEditingProfile: boolean;
  profileForm: ProfileFormValues;
  setIsEditingProfile: (editing: boolean) => void;
  setProfileForm: React.Dispatch<React.SetStateAction<ProfileFormValues>>;
  handleProfileChange: (
    field: keyof ProfileFormValues,
  ) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  cancelProfileEdit: (
    user: { firstName?: string; lastName?: string } | null,
  ) => void;
}

export const useProfileForm = (): UseProfileFormReturn => {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState<ProfileFormValues>({
    firstName: "",
    lastName: "",
  });

  const handleProfileChange =
    (field: keyof ProfileFormValues) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setProfileForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const cancelProfileEdit = (
    user: { firstName?: string; lastName?: string } | null,
  ) => {
    setIsEditingProfile(false);
    if (user)
      setProfileForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
      });
  };

  return {
    isEditingProfile,
    profileForm,
    setIsEditingProfile,
    setProfileForm,
    handleProfileChange,
    cancelProfileEdit,
  };
};
