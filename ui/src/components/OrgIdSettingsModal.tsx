import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Settings as SettingsIcon } from "@mui/icons-material";
import OrganizationDropdown, {
  OrganizationDropdownRef,
} from "./OrganizationDropdown";
import { localStorageUtils, STORAGE_KEYS } from "../hooks/useLocalStorage";

const OrgIdSettingsModal: React.FC = () => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<OrganizationDropdownRef>(null);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSelectOrganization = async () => {
    if (dropdownRef.current) {
      const success = await dropdownRef.current.confirmSelection();
      if (success) {
        handleClose();
        // Add apiKey to URL before reloading (for dev mode persistence)
        const apiKey = localStorage.getItem("apiKey");
        if (apiKey) {
          const url = new URL(window.location.href);
          url.searchParams.set("apiKey", apiKey);
          window.location.href = url.toString();
        } else {
          window.location.reload();
        }
      }
    }
  };

  const isDevelopment =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";
  // Check for godUser in localStorage AND godToken
  const godUserData = localStorageUtils.get(STORAGE_KEYS.GOD_USER_DATA);
  const godToken = localStorage.getItem("godToken");

  // Only show if in development, has god user data, AND has god token
  if (!isDevelopment || !godUserData || !godToken) {
    return null;
  }

  return (
    <>
      <Tooltip title="Organization Settings (Dev Mode)">
        <IconButton
          onClick={handleOpen}
          size="small"
          sx={{ color: "primary.main" }}
        >
          <SettingsIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>
          Development Settings - Organization Selection
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="caption">
              This setting is only available in development mode. Select your
              organization to test the login flow.
            </Typography>
          </Alert>

          <OrganizationDropdown ref={dropdownRef} />
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={handleClose} variant="outlined">
            Close
          </Button>
          <Button
            onClick={handleSelectOrganization}
            variant="contained"
            color="primary"
          >
            Select Organization
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default OrgIdSettingsModal;
