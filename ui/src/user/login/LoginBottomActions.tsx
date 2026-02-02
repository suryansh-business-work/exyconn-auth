import React from "react";
import { Box, IconButton, Tooltip } from "@mui/material";
import { Description as ApiDocsIcon } from "@mui/icons-material";
import GodAccessLink from "../../components/GodAccessLink";
import OrgIdSettingsModal from "../../components/OrgIdSettingsModal";
import { ENV } from "../../config/env";

interface LoginBottomActionsProps {
  isDevelopment: boolean;
}

const LoginBottomActions: React.FC<LoginBottomActionsProps> = ({
  isDevelopment,
}) => {
  const handleOpenApiDocs = () => {
    // Open user API docs in new tab - remove /v1/api from base URL
    const baseUrl = ENV.API_BASE_URL.replace("/v1/api", "");
    window.open(`${baseUrl}/user/api-docs`, "_blank");
  };

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 16,
        right: 16,
        display: "flex",
        gap: 1,
        zIndex: 1000,
      }}
    >
      <Tooltip title="API Documentation">
        <IconButton
          onClick={handleOpenApiDocs}
          size="small"
          sx={{
            color: "primary.main",
            bgcolor: "background.paper",
            boxShadow: 1,
            "&:hover": {
              bgcolor: "background.paper",
            },
          }}
        >
          <ApiDocsIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <GodAccessLink />
      {isDevelopment && <OrgIdSettingsModal />}
    </Box>
  );
};

export default LoginBottomActions;
