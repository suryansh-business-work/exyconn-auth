import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { API_ENDPOINTS } from "../apis";
import { localStorageUtils, STORAGE_KEYS } from "../hooks/useLocalStorage";
import { clientLogger } from "../lib/client-logger";
import { axios } from "../lib/api";
import { RedirectionSetting } from "../types/organization";

// Helper function to update favicon
const updateFavicon = (faviconUrl: string | undefined) => {
  if (!faviconUrl) return;

  let link = document.querySelector(
    "link[rel*='icon']",
  ) as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.getElementsByTagName("head")[0].appendChild(link);
  }
  link.type = "image/x-icon";
  link.href = faviconUrl;
};

interface PasswordPolicy {
  minLength?: number;
  requireUppercase?: boolean;
  requireLowercase?: boolean;
  requireNumbers?: boolean;
  requireSpecialChars?: boolean;
  expiryDays?: number;
}

interface ConfigurationIssue {
  id: string;
  name: string;
  description: string;
}

interface ConfigurationIssues {
  critical: ConfigurationIssue[];
  warning: ConfigurationIssue[];
  info: ConfigurationIssue[];
}

interface OrganizationDetails {
  _id: string;
  orgId: string;
  orgName: string;
  orgEmail: string;
  orgWebsite?: string;
  orgSlug: string;
  orgLogos?: Array<{ url: string; size: string }>;
  orgFavIcon?: string;
  loginBgImages?: Array<{ url: string; name?: string }>;
  loginPageDesign?: string;
  customTextSections?: Array<{
    slug: string;
    text: string;
    type: string;
    variant?: string;
  }>;
  orgTheme?: {
    primaryColor?: string;
    secondaryColor?: string;
    fontFamily?: any;
  };
  oauthSettings?: {
    google?: { enabled?: boolean; clientId?: string; clientSecret?: string };
    microsoft?: { enabled?: boolean };
    apple?: { enabled?: boolean };
    github?: { enabled?: boolean };
  };
  featureFlags?: any;
  mailSettings?: any;
  orgRedirectionSettings?: RedirectionSetting[];
  orgPoliciesLink?: Array<{ policyName: string; policyLink: string }>;
  authServerUrl?: string;
  passwordPolicy?: PasswordPolicy;
  customCss?: string;
  customHtml?: string;
  customJs?: string;
  issues?: ConfigurationIssues;
  apiKey?: string;
}

interface OrganizationContextType {
  orgId: string;
  orgDetails: OrganizationDetails | null;
  loading: boolean;
  apiKey: string | null;
  setOrgId: (id: string) => void;
  setApiKey: (key: string) => void;
  refreshOrganization: (id?: string) => Promise<void>;
  isDevelopment: boolean;
  getAuthHeaders: () => Record<string, string>;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(
  undefined,
);

export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error("useOrganization must be used within OrganizationProvider");
  }
  return context;
};

interface OrganizationProviderProps {
  children: ReactNode;
}

export const OrganizationProvider: React.FC<OrganizationProviderProps> = ({
  children,
}) => {
  const [orgId, setOrgIdState] = useState<string>("");
  const [orgDetails, setOrgDetails] = useState<OrganizationDetails | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  // Initialize apiKey from URL (dev mode) or localStorage
  const [apiKey, setApiKeyState] = useState<string | null>(() => {
    // In development, check URL for apiKey param first
    if (
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
    ) {
      const urlParams = new URLSearchParams(window.location.search);
      const urlApiKey = urlParams.get("apiKey");
      if (urlApiKey) {
        // Store in localStorage for consistency
        localStorage.setItem("apiKey", urlApiKey);
        return urlApiKey;
      }
    }
    return localStorage.getItem("apiKey");
  });

  const isDevelopment =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  // Get auth headers with API key
  const getAuthHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (apiKey) {
      headers["x-api-key"] = apiKey;
    }
    return headers;
  };

  // Fetch organization details using API key from header
  const fetchOrganizationDetails = async (key?: string) => {
    const apiKeyToUse = key || apiKey;

    if (!apiKeyToUse || apiKeyToUse.trim() === "") {
      clientLogger.warn("No API key available for fetching organization");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Send API key via header (from localStorage)
      const response = await fetch(API_ENDPOINTS.AUTH.APIKEY_TO_ORGANIZATION, {
        headers: {
          "x-api-key": apiKeyToUse,
        },
      });
      const result = await response.json();

      if (result.status === "success" && result.data) {
        setOrgDetails(result.data);
        const resolvedOrgId = result.data._id || result.data.orgId;
        setOrgIdState(resolvedOrgId);
        localStorageUtils.setString(STORAGE_KEYS.ORG_ID, resolvedOrgId);

        // Update axios headers
        axios.defaults.headers.common["x-api-key"] = apiKeyToUse;

        // Store API key if returned in response
        if (result.data.apiKey) {
          localStorage.setItem("apiKey", result.data.apiKey);
          setApiKeyState(result.data.apiKey);
          axios.defaults.headers.common["x-api-key"] = result.data.apiKey;
        }
      } else {
        clientLogger.error("Failed to load organization:", {
          message: result.message,
        });
        setOrgDetails(null);
      }
    } catch (error) {
      clientLogger.error("Failed to load organization details:", { error });
      setOrgDetails(null);
    } finally {
      setLoading(false);
    }
  };

  // Resolve API key by domain (Production only)
  const fetchApiKeyByDomain = async (domain: string) => {
    try {
      setLoading(true);
      clientLogger.info("🌐 Resolving API key for domain:", domain);

      const response = await fetch(
        `${API_ENDPOINTS.AUTH.API_KEY_BY_DOMAIN}?domain=${domain}`,
      );
      const result = await response.json();

      if (result.status === "success" && result.data?.matched) {
        const newApiKey = result.data.apiKey;
        clientLogger.info("✅ API key resolved from domain");

        // Store API key in localStorage
        localStorage.setItem("apiKey", newApiKey);
        setApiKeyState(newApiKey);
        axios.defaults.headers.common["x-api-key"] = newApiKey;

        // Fetch full organization details
        await fetchOrganizationDetails(newApiKey);
      } else {
        clientLogger.warn("❌ No organization found for this domain");
        setLoading(false);
      }
    } catch (error) {
      clientLogger.error("Failed to resolve API key by domain:", { error });
      setLoading(false);
    }
  };

  // Initialize organization resolution on mount
  useEffect(() => {
    const init = async () => {
      // Check localStorage for existing API key
      const storedApiKey = localStorage.getItem("apiKey");

      if (storedApiKey) {
        clientLogger.info("✅ API key found in localStorage");
        setApiKeyState(storedApiKey);
        axios.defaults.headers.common["x-api-key"] = storedApiKey;
        await fetchOrganizationDetails(storedApiKey);
        return;
      }

      // No stored API key - resolve by domain (production) or wait for manual selection (dev)
      if (!isDevelopment) {
        clientLogger.info("🌐 Production mode: Resolving API key by domain");
        await fetchApiKeyByDomain(window.location.hostname);
      } else {
        clientLogger.info(
          "💻 Development mode: No stored API key. Please select an organization in settings.",
        );
        setLoading(false);
      }
    };

    init();
  }, []);

  // Update favicon when org details change
  useEffect(() => {
    if (orgDetails?.orgFavIcon) {
      updateFavicon(orgDetails.orgFavIcon);
    }
  }, [orgDetails?.orgFavIcon]);

  // Manual org selection (Development Settings)
  const setOrgId = (id: string) => {
    setOrgIdState(id);
    if (id) {
      localStorageUtils.setString(STORAGE_KEYS.ORG_ID, id);
    } else {
      localStorageUtils.remove(STORAGE_KEYS.ORG_ID);
    }
  };

  // Setting API key manually (Development Settings / Organization Selection)
  // Stores in localStorage and URL (dev mode only)
  const setApiKey = (key: string) => {
    setApiKeyState(key);
    if (key) {
      // Store in localStorage
      localStorage.setItem("apiKey", key);
      axios.defaults.headers.common["x-api-key"] = key;

      // In development mode, also add to URL for persistence
      if (isDevelopment) {
        const url = new URL(window.location.href);
        url.searchParams.set("apiKey", key);
        window.history.replaceState({}, "", url.toString());
      }

      fetchOrganizationDetails(key);
    } else {
      // Clear everything
      setOrgDetails(null);
      setOrgIdState("");
      localStorage.removeItem("apiKey");
      localStorageUtils.remove(STORAGE_KEYS.ORG_ID);
      delete axios.defaults.headers.common["x-api-key"];

      // Remove from URL in dev mode
      if (isDevelopment) {
        const url = new URL(window.location.href);
        url.searchParams.delete("apiKey");
        window.history.replaceState({}, "", url.toString());
      }
    }
  };

  // Refresh organization details
  const refreshOrganization = async () => {
    if (apiKey) {
      await fetchOrganizationDetails(apiKey);
    }
  };

  const value: OrganizationContextType = {
    orgId,
    orgDetails,
    loading,
    apiKey,
    setOrgId,
    setApiKey,
    refreshOrganization,
    isDevelopment,
    getAuthHeaders,
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
};
