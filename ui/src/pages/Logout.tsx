import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useOrganization } from "../contexts/OrganizationContext";

/**
 * Logout page - clears all auth data from localStorage and redirects
 * Checks orgRedirectionSettings for external redirect or falls back to login page
 */
const Logout = () => {
  const navigate = useNavigate();
  const { userLogout } = useAuth();
  const { orgDetails } = useOrganization();

  useEffect(() => {
    const performLogout = async () => {
      // Clear all auth-related data from localStorage
      localStorage.removeItem("authToken");
      localStorage.removeItem("userData");

      // Use auth context logout which clears user state
      userLogout();

      // Check if we should redirect to an external URL based on orgRedirectionSettings
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

      // If there's a matching redirect setting, go to that URL's login page
      if (matchingRedirect?.authPageUrl) {
        // Redirect to the auth page URL (login page of the auth server)
        window.location.href = matchingRedirect.authPageUrl;
      } else {
        // Fallback to home page (login)
        navigate("/", { replace: true });
      }
    };

    performLogout();
  }, [navigate, userLogout, orgDetails]);

  return null;
};

export default Logout;
