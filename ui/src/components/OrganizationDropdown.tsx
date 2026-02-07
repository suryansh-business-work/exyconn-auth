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
  const [selectedOrgId, setSelectedOrgId] = useState<string>(() => {
    return localStorageUtils.getString(STORAGE_KEYS.ORG_ID) || "";
  });
  const [error, setError] = useState<string>("");
  const [autoSelected, setAutoSelected] = useState(false);

  // Derive display error from local error state and fetch error
  const displayError = error || fetchError || "";

  // Auto-select organization based on current URL (render-time state adjustment)
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
      setAutoSelected(true);
    }
  }

  // Side effects for auto-selection (localStorage, logging)
  useEffect(() => {
    if (autoSelected && selectedOrgId) {
      const selectedOrg = organizations.find((o) => o._id === selectedOrgId);
      if (selectedOrg) {
        localStorageUtils.setString(STORAGE_KEYS.ORG_ID, selectedOrg._id);
        if (selectedOrg.apiKey) {
          localStorage.setItem("apiKey", selectedOrg.apiKey);
          clientLogger.info("Auto-selected API key stored in localStorage");
        }
        clientLogger.info("Auto-selected organization based on URL match:", {
          orgName: selectedOrg.orgName,
        });
      }
    }
  }, [autoSelected, selectedOrgId, organizations]);

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

  if (displayError) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" color="error">
          {displayError}
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
