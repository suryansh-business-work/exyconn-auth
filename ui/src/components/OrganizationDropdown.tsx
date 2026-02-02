import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import { localStorageUtils, STORAGE_KEYS } from "../hooks/useLocalStorage";
import { clientLogger } from "@exyconn/common/client/logger";
import { useOrganizations } from "../hooks/useOrganizations";

export interface OrganizationDropdownRef {
  confirmSelection: () => Promise<boolean>;
}

const OrganizationDropdown = forwardRef<OrganizationDropdownRef>((_, ref) => {
  const { organizations, loading, error: fetchError } = useOrganizations();
  const [selectedOrgId, setSelectedOrgId] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [autoSelected, setAutoSelected] = useState(false);

  useEffect(() => {
    // Load stored org ID
    const storedOrgId = localStorageUtils.getString(STORAGE_KEYS.ORG_ID);
    if (storedOrgId) {
      setSelectedOrgId(storedOrgId);
    }
  }, []);

  // Set error from fetch
  useEffect(() => {
    if (fetchError) {
      setError(fetchError);
    }
  }, [fetchError]);

  // Auto-select organization based on current URL
  useEffect(() => {
    if (organizations.length > 0 && !selectedOrgId && !autoSelected) {
      const currentUrl = window.location.origin; // e.g., https://auth.exyconn.com

      // Try to find organization with matching authServerUrl
      const matchingOrg = organizations.find((org) => {
        if (!org.authServerUrl) return false;

        try {
          // Normalize URLs for comparison
          const orgUrl = new URL(org.authServerUrl);
          const currentOrigin = new URL(currentUrl);

          // Compare hostname (domain)
          return orgUrl.hostname === currentOrigin.hostname;
        } catch {
          return false;
        }
      });

      if (matchingOrg) {
        setSelectedOrgId(matchingOrg._id);
        localStorageUtils.setString(STORAGE_KEYS.ORG_ID, matchingOrg._id);

        // Store API key in localStorage
        if (matchingOrg.apiKey) {
          localStorage.setItem("apiKey", matchingOrg.apiKey);
          clientLogger.info("Auto-selected API key stored in localStorage");
        }
        setAutoSelected(true);
        clientLogger.info("Auto-selected organization based on URL match:", {
          orgName: matchingOrg.orgName,
        });
      }
    }
  }, [organizations, selectedOrgId, autoSelected]);

  // Expose confirmSelection method via ref
  useImperativeHandle(ref, () => ({
    confirmSelection: async () => {
      if (!selectedOrgId) {
        setError("Please select an organization first");
        return false;
      }

      // Store org ID in localStorage
      localStorageUtils.setString(STORAGE_KEYS.ORG_ID, selectedOrgId);

      // Store API key in localStorage for the selected organization
      const selectedOrg = organizations.find(
        (org) => org._id === selectedOrgId,
      );
      if (selectedOrg?.apiKey) {
        localStorage.setItem("apiKey", selectedOrg.apiKey);
        clientLogger.info(
          "Organization selected and API key stored in localStorage:",
          {
            orgName: selectedOrg.orgName,
            orgId: selectedOrgId,
          },
        );
        return true;
      } else {
        setError("Selected organization has no API key");
        return false;
      }
    },
  }));

  const handleOrgChange = (orgId: string) => {
    setSelectedOrgId(orgId);
    // Don't auto-reload - wait for user to click "Select Organization" button
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
        }}
      >
        <CircularProgress size={24} />
        <Typography variant="body2" sx={{ ml: 1 }}>
          Loading organizations...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      {autoSelected && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Organization automatically selected based on current domain
        </Alert>
      )}
      <FormControl fullWidth variant="outlined">
        <InputLabel>Select Organization</InputLabel>
        <Select
          value={selectedOrgId}
          onChange={(e) => handleOrgChange(e.target.value)}
          label="Select Organization"
        >
          {organizations.map((org) => (
            <MenuItem key={org._id} value={org._id}>
              {org.orgName}
              {org.authServerUrl && (
                <Typography
                  variant="caption"
                  sx={{ ml: 1, color: "text.secondary" }}
                >
                  ({new URL(org.authServerUrl).hostname})
                </Typography>
              )}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {selectedOrgId && (
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="caption">
            Selected:{" "}
            <strong>
              {organizations.find((o) => o._id === selectedOrgId)?.orgName}
            </strong>
            <br />
            Click "Select Organization" to confirm and save API key.
          </Typography>
        </Alert>
      )}
    </Box>
  );
});

export default OrganizationDropdown;
