import { useState, useCallback, useMemo, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useSnackbar } from "../../contexts/SnackbarContext";
import { API_BASE_URL, API_ENDPOINTS } from "../../apis";
import {
  postRequest,
  extractMessage,
  isSuccess,
  parseError,
  getRequest,
} from "../../lib/api";
import { SignupFormValues } from "./SignupSchema";
import { useOrganization } from "../../contexts/OrganizationContext";

// Simple role interface for signup
export interface SignupRole {
  name: string;
  slug: string;
  description?: string;
}

export const useSignupLogic = (
  orgId: string | null,
  isDevelopment: boolean,
) => {
  const { showSnackbar } = useSnackbar();
  const { orgDetails } = useOrganization();
  const [submitting, setSubmitting] = useState(false);
  const [signupRoles, setSignupRoles] = useState<SignupRole[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [alreadyExistsDialog, setAlreadyExistsDialog] = useState<{
    open: boolean;
    email: string;
  }>({
    open: false,
    email: "",
  });

  const companyParam = searchParams.get("company");
  const urlRole = searchParams.get("role");
  const buildLink = (path: string) =>
    companyParam ? `${path}?company=${companyParam}` : path;

  // Fetch signup roles from API
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await getRequest(`${API_BASE_URL}/public/roles`);

        // Axios response structure: response.data = { data: [...], status: 'success', message: '...' }
        // The actual roles array is at response.data.data
        const apiResponse = response.data as {
          data?: SignupRole[];
          status?: string;
        };

        if (
          apiResponse &&
          apiResponse.status === "success" &&
          Array.isArray(apiResponse.data)
        ) {
          const roles = apiResponse.data;
          console.log("Roles loaded:", roles.length, "roles");

          setSignupRoles(roles);
          // Check if URL has role param, otherwise auto-select first role
          if (urlRole && roles.some((r) => r.slug === urlRole)) {
            setSelectedRole(urlRole);
          } else if (roles.length > 0 && !selectedRole) {
            setSelectedRole(roles[0].slug);
          }
        }
      } catch (error) {
        console.error("Failed to fetch signup roles:", error);
      }
    };

    fetchRoles();
  }, [urlRole]);

  // Check if any OAuth provider is enabled
  const hasEnabledOAuth = useMemo(
    () =>
      orgDetails?.oauthSettings?.google?.enabled ||
      orgDetails?.oauthSettings?.microsoft?.enabled ||
      orgDetails?.oauthSettings?.apple?.enabled ||
      orgDetails?.oauthSettings?.github?.enabled,
    [orgDetails],
  );

  const handleSubmit = useCallback(
    async (values: SignupFormValues) => {
      setSubmitting(true);
      try {
        // Organization is identified via x-api-key header (set automatically by API client)
        const response = await postRequest(API_ENDPOINTS.AUTH.SIGNUP, {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          password: values.password,
          role: values.role || selectedRole || "user",
        });

        if (isSuccess(response)) {
          const message = extractMessage(response);
          showSnackbar(message || "Signup successful", "success");
          // Store email in localStorage for verify page
          localStorage.setItem("verifyEmail", values.email);
          navigate(buildLink("/verify"));
        } else {
          const message = extractMessage(response);

          // Check if user already exists
          if (
            message?.toLowerCase().includes("already exists") ||
            message?.toLowerCase().includes("already registered")
          ) {
            setAlreadyExistsDialog({ open: true, email: values.email });
            return;
          }

          showSnackbar(message || "Signup failed", "error");
        }
      } catch (error) {
        const parsedError = parseError(error);
        const errorMessage = parsedError.message;

        // Check if user already exists
        if (
          errorMessage?.toLowerCase().includes("already exists") ||
          errorMessage?.toLowerCase().includes("already registered")
        ) {
          setAlreadyExistsDialog({ open: true, email: values.email });
          return;
        }

        showSnackbar(
          errorMessage ||
            "Connection error. Please check if the server is running.",
          "error",
        );
      } finally {
        setSubmitting(false);
      }
    },
    [showSnackbar, navigate, buildLink, selectedRole],
  );

  const handleGoogleSignup = useCallback(() => {
    if (isDevelopment && !orgId) {
      showSnackbar(
        "Please enter Organization ID for development mode",
        "warning",
      );
      return;
    }
    // Include origin for orgRedirectionSettings matching on server callback
    const currentOrigin = window.location.origin;
    const roleParam = selectedRole || "user";
    window.location.href = `${API_BASE_URL}/auth/google?organizationId=${orgId}&role=${roleParam}&origin=${encodeURIComponent(currentOrigin)}`;
  }, [orgId, isDevelopment, showSnackbar, selectedRole]);

  const closeAlreadyExistsDialog = useCallback(() => {
    setAlreadyExistsDialog({ open: false, email: "" });
  }, []);

  // Handle role change and update URL
  const handleRoleChange = useCallback(
    (newRole: string) => {
      setSelectedRole(newRole);
      // Update URL with role parameter
      const newParams = new URLSearchParams(searchParams);
      newParams.set("role", newRole);
      setSearchParams(newParams, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  return {
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
  };
};
