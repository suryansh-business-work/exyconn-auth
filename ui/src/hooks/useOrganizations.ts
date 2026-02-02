import { useState, useEffect, useCallback } from "react";
import { API_ENDPOINTS, API_BASE_URL } from "../apis";
import { clientLogger } from "@exyconn/common/client/logger";
import { axios } from "../lib/api";

export interface Organization {
  _id: string;
  orgName: string;
  authServerUrl?: string;
  apiKey?: string;
}

export const useOrganizations = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const fetchOrganizations = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      // Use god endpoint to get organizations with API keys
      // godToken is automatically sent via Authorization header (interceptor in api.ts)
      const response = await axios.get(API_ENDPOINTS.GOD.ORGANIZATIONS, {
        baseURL: API_BASE_URL,
      });

      if (response.status >= 200 && response.status < 300 && response.data) {
        const result = response.data.data;

        if (result && Array.isArray(result)) {
          const transformedOrgs = result.map((org: any) => ({
            _id: org._id || org.id,
            orgName: org.orgName || org.name,
            authServerUrl: org.authServerUrl,
            apiKey: org.apiKey,
          }));
          setOrganizations(transformedOrgs);
        } else {
          clientLogger.warn("Organizations response data is not an array", {
            result,
          });
          setError("Failed to load organizations");
        }
      } else {
        setError("Failed to load organizations");
      }
    } catch (err: any) {
      clientLogger.error("Error fetching organizations:", { error: err });
      if (err.response?.status === 401) {
        setError("God authentication expired. Please login again.");
      } else {
        setError("Failed to fetch organizations");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  return {
    organizations,
    loading,
    error,
    refetch: fetchOrganizations,
  };
};
