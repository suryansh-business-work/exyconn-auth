import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "../../contexts/SnackbarContext";
import { useAuth } from "../../contexts/AuthContext";
import { API_BASE_URL, API_ENDPOINTS } from "../../apis";
import {
  postRequest,
  extractData,
  extractMessage,
  isSuccess,
  parseError,
} from "../../lib/api";
import { clientLogger } from "@exyconn/common/client/logger";
import { Organization } from "../../types/organization";

export type OAuthProvider = "google" | "microsoft" | "apple" | "github";

interface LoginResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    organizationId: string;
    isVerified: boolean;
    mfaEnabled?: boolean;
    lastLoginAt?: string;
  };
  token?: string;
  orgRedirectionSettings?: any[];
  redirection?: {
    url: string;
    tokenAppendedUrl: string;
    matchType: string;
  };
  mfaRequired?: boolean;
  email?: string;
  organizationId?: string;
}

export const useLoginLogic = (orgDetails: Organization | null) => {
  const { showSnackbar } = useSnackbar();
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [notRegisteredDialog, setNotRegisteredDialog] = useState<{
    open: boolean;
    email: string;
  }>({
    open: false,
    email: "",
  });

  const handleSubmit = useCallback(
    async (values: { email: string; password: string }) => {
      setSubmitting(true);
      try {
        // Organization is identified via x-api-key header (set automatically by API client)
        // credentials: 'include' to receive HTTP-only cookie from server
        const response = await postRequest(API_ENDPOINTS.AUTH.LOGIN, values, {
          credentials: "include",
        });

        if (isSuccess(response)) {
          const data = extractData<LoginResponse>(response);

          // Check if MFA is required
          if (data?.mfaRequired) {
            // Navigate to MFA verification page (only email needed, org identified via API key)
            navigate("/mfa-verify", {
              state: {
                email: data.email,
              },
            });
            return;
          }

          if (data?.user && data?.token) {
            // Store auth token in localStorage
            localStorage.setItem("authToken", data.token);

            // Store user data in localStorage via setUser
            // Map organizationId to companyId for backward compatibility
            const userData = {
              ...data.user,
              companyId:
                (data.user as any).companyId || data.user.organizationId,
            };
            setUser(userData);

            // If opened as popup (from mobile app), send message to opener and close
            if (window.opener && !window.opener.closed) {
              try {
                window.opener.postMessage(
                  {
                    type: "AUTH_SUCCESS",
                    token: data.token,
                    user: userData,
                  },
                  "*",
                );
                window.close();
                return;
              } catch (e) {
                clientLogger.warn("Could not post to opener:", e);
              }
            }

            // Use the computed redirection from backend if available
            if (
              data.redirection?.tokenAppendedUrl &&
              data.redirection.matchType !== "fallback"
            ) {
              clientLogger.info(
                "🔄 Using backend computed redirection:",
                data.redirection,
              );
              window.location.href = data.redirection.tokenAppendedUrl;
            } else {
              // Fallback to profile
              showSnackbar("Login successful! Welcome back.", "success");
              navigate("/profile");
            }
          } else {
            showSnackbar("Login failed: No user data received", "error");
          }
        } else {
          const errorMessage = extractMessage(response) || "Login failed";
          showSnackbar(errorMessage, "error");
        }
      } catch (error: any) {
        const parsedError = parseError(error);
        let errorMessage = parsedError.message;

        // Check if user is not registered
        if (
          errorMessage?.toLowerCase().includes("email not found") ||
          errorMessage?.toLowerCase().includes("user not found") ||
          errorMessage?.toLowerCase().includes("no account")
        ) {
          setNotRegisteredDialog({ open: true, email: values.email });
          return;
        }

        if (parsedError.statusCode === 401) {
          errorMessage =
            parsedError.message ||
            "Invalid email or password. Please check your credentials.";
        }
        showSnackbar(errorMessage, "error");
      } finally {
        setSubmitting(false);
      }
    },
    [showSnackbar, setUser, navigate],
  );

  // Generic OAuth handler for all providers
  const handleOAuthLogin = useCallback(
    (provider: OAuthProvider) => {
      try {
        const organizationId = orgDetails?._id;
        if (!organizationId) {
          showSnackbar("Organization ID not found", "error");
          return;
        }

        const currentOrigin = window.location.origin;
        const backendOAuthUrl = `${API_BASE_URL}/auth/${provider}?organizationId=${encodeURIComponent(organizationId)}&origin=${encodeURIComponent(currentOrigin)}&provider=${provider}`;
        window.location.href = backendOAuthUrl;
      } catch (error) {
        clientLogger.error(`${provider} login error:`, error);
        showSnackbar(`Failed to initiate ${provider} login`, "error");
      }
    },
    [orgDetails, showSnackbar],
  );

  // Specific handlers for each provider (for backward compatibility)
  const handleGoogleLogin = useCallback(
    () => handleOAuthLogin("google"),
    [handleOAuthLogin],
  );
  const handleMicrosoftLogin = useCallback(
    () => handleOAuthLogin("microsoft"),
    [handleOAuthLogin],
  );
  const handleAppleLogin = useCallback(
    () => handleOAuthLogin("apple"),
    [handleOAuthLogin],
  );
  const handleGithubLogin = useCallback(
    () => handleOAuthLogin("github"),
    [handleOAuthLogin],
  );

  // Check which OAuth providers are enabled
  const enabledOAuthProviders = useMemo(
    () => ({
      google: orgDetails?.oauthSettings?.google?.enabled || false,
      microsoft: orgDetails?.oauthSettings?.microsoft?.enabled || false,
      apple: orgDetails?.oauthSettings?.apple?.enabled || false,
      github: orgDetails?.oauthSettings?.github?.enabled || false,
    }),
    [orgDetails],
  );

  const hasEnabledOAuth = useMemo(
    () =>
      enabledOAuthProviders.google ||
      enabledOAuthProviders.microsoft ||
      enabledOAuthProviders.apple ||
      enabledOAuthProviders.github,
    [enabledOAuthProviders],
  );

  const closeNotRegisteredDialog = useCallback(() => {
    setNotRegisteredDialog({ open: false, email: "" });
  }, []);

  return {
    submitting,
    handleSubmit,
    handleOAuthLogin,
    handleGoogleLogin,
    handleMicrosoftLogin,
    handleAppleLogin,
    handleGithubLogin,
    enabledOAuthProviders,
    hasEnabledOAuth,
    notRegisteredDialog,
    closeNotRegisteredDialog,
  };
};
