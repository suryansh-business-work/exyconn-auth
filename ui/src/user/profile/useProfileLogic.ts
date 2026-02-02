import { useState, useCallback } from "react";
import { API_ENDPOINTS } from "../../apis";
import { useSnackbar } from "../../contexts/SnackbarContext";
import { useAuth, UserData } from "../../contexts/AuthContext";
import {
  getRequest,
  putRequest,
  postRequest,
  extractData,
  extractMessage,
  isSuccess,
  parseError,
} from "../../lib/api";

export interface ProfileFormValues {
  firstName: string;
  lastName: string;
}

export interface PasswordChangeValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const useProfileLogic = () => {
  const { showSnackbar } = useSnackbar();
  const { user, setUser, userLogout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [roleLoading, setRoleLoading] = useState(false);
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);

  const fetchProfile = useCallback(async () => {
    // if (!userToken) return; // Removed token check - relying on cookie

    setLoading(true);
    try {
      // Use /me API for comprehensive user data including role and login history
      const response = await getRequest(API_ENDPOINTS.AUTH.ME);
      console.log("📱 Profile API response:", response);

      if (isSuccess(response)) {
        const fullData = extractData<any>(response);

        // Handle nested response from /me
        const baseUser = fullData.user || {};
        const userData: UserData = {
          ...baseUser,
          id: baseUser.id || baseUser._id || fullData.id || fullData._id,
          role: baseUser.role || user?.role,
          roleDetails: user?.roleDetails,
          orgOptions: fullData.organization?.orgOptions || baseUser.orgOptions,
        } as UserData;

        if (userData.id || userData.email) {
          setUser(userData);
        }
      } else {
        const message = extractMessage(response);
        showSnackbar(message || "Failed to fetch profile", "error");
      }
    } catch (error: any) {
      const parsedError = parseError(error);
      if (parsedError.statusCode === 401) {
        showSnackbar("Session expired. Please login again.", "error");
        userLogout();
      } else {
        showSnackbar(parsedError.message || "Failed to fetch profile", "error");
      }
    } finally {
      setLoading(false);
    }
  }, [setUser, showSnackbar, userLogout]);

  const fetchRole = useCallback(async () => {
    // if (!userToken) return;

    setRoleLoading(true);
    try {
      const response = await getRequest(API_ENDPOINTS.AUTH.ROLE);
      if (isSuccess(response)) {
        const roleData = extractData<any>(response);
        // Use callback form to avoid depending on user state
        setUser((prevUser) => {
          if (prevUser) {
            return {
              ...prevUser,
              role: roleData.role,
              roleDetails: roleData.roleDetails,
            };
          }
          return prevUser;
        });
      }
    } catch (error: any) {
      console.error("Failed to fetch role info:", error);
    } finally {
      setRoleLoading(false);
    }
  }, [setUser]);

  const updateProfile = useCallback(
    async (values: ProfileFormValues) => {
      // if (!userToken) return false;

      setProfileSubmitting(true);
      try {
        const response = await putRequest(API_ENDPOINTS.AUTH.PROFILE, values);

        if (isSuccess(response)) {
          const fullData = extractData<any>(response);

          // Handle potentially nested response or flat response
          const baseUser = fullData.user || fullData;
          const userData: UserData = {
            ...baseUser,
            id: baseUser.id || baseUser._id,
            role: fullData.role?.name || baseUser.role,
            roleDetails:
              fullData.role?.details ||
              fullData.roleDetails ||
              baseUser.roleDetails,
          } as UserData;

          if (userData) setUser(userData);
          showSnackbar("Profile updated successfully", "success");
          return true;
        } else {
          const message = extractMessage(response);
          showSnackbar(message || "Failed to update profile", "error");
          return false;
        }
      } catch (error: any) {
        const parsedError = parseError(error);
        showSnackbar(
          parsedError.message || "Failed to update profile",
          "error",
        );
        return false;
      } finally {
        setProfileSubmitting(false);
      }
    },
    [setUser, showSnackbar],
  );

  const updateProfilePicture = useCallback(
    async (pictureUrl: string) => {
      // if (!userToken) {
      //   setUploadingPicture(false);
      //   return false;
      // }

      try {
        const response = await putRequest(
          `${API_ENDPOINTS.AUTH.PROFILE}/picture`,
          { profilePicture: pictureUrl },
        );

        if (isSuccess(response)) {
          const userData = extractData<UserData>(response);
          if (userData) setUser(userData);
          showSnackbar("Profile picture updated successfully", "success");
          return true;
        } else {
          const message = extractMessage(response);
          showSnackbar(message || "Failed to update profile picture", "error");
          return false;
        }
      } catch (error: any) {
        const parsedError = parseError(error);
        showSnackbar(
          parsedError.message || "Failed to update profile picture",
          "error",
        );
        return false;
      } finally {
        setUploadingPicture(false);
      }
    },
    [setUser, showSnackbar],
  );

  const changePassword = useCallback(
    async (values: PasswordChangeValues) => {
      // if (!userToken) return false;

      if (values.newPassword !== values.confirmPassword) {
        showSnackbar("New passwords do not match", "error");
        return false;
      }

      if (values.newPassword.length < 6) {
        showSnackbar("Password must be at least 6 characters", "error");
        return false;
      }

      setPasswordSubmitting(true);
      try {
        const response = await postRequest(API_ENDPOINTS.AUTH.PASSWORD_CHANGE, {
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        });

        if (isSuccess(response)) {
          showSnackbar("Password changed successfully", "success");
          return true;
        } else {
          const message = extractMessage(response);
          showSnackbar(message || "Failed to change password", "error");
          return false;
        }
      } catch (error: any) {
        const parsedError = parseError(error);
        showSnackbar(
          parsedError.message || "Failed to change password",
          "error",
        );
        return false;
      } finally {
        setPasswordSubmitting(false);
      }
    },
    [showSnackbar],
  );

  const handlePhotoUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        showSnackbar("Please select an image file", "error");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showSnackbar("Image size should be less than 5MB", "error");
        return;
      }

      setUploadingPicture(true);
      try {
        // Get auth token from localStorage
        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
          showSnackbar("Please login again to upload image", "error");
          setUploadingPicture(false);
          return;
        }

        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(API_ENDPOINTS.IMAGEKIT.UPLOAD, {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        if (!response.ok) throw new Error("Upload failed");
        const result = await response.json();
        const imageUrl = result.data?.[0]?.filePath?.fileUrl;
        if (imageUrl) {
          await updateProfilePicture(imageUrl);
        } else {
          showSnackbar("Failed to get image URL", "error");
          setUploadingPicture(false);
        }
      } catch (error: any) {
        showSnackbar(error.message || "Failed to upload image", "error");
        setUploadingPicture(false);
      }
    },
    [updateProfilePicture, showSnackbar],
  );

  return {
    user,
    loading,
    roleLoading,
    profileSubmitting,
    passwordSubmitting,
    uploadingPicture,
    setUploadingPicture,
    fetchProfile,
    fetchRole,
    updateProfile,
    updateProfilePicture,
    changePassword,
    handlePhotoUpload,
    userLogout,
  };
};
