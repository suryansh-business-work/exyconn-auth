import React from "react";
import { Box, Alert, AlertTitle, Typography, useTheme } from "@mui/material";
import { Warning } from "@mui/icons-material";

const GodLoginWarningAlert: React.FC = () => {
  const theme = useTheme();

  return (
    <Box sx={{ width: "100%", maxWidth: 450, mb: 4 }}>
      <Alert
        severity="warning"
        icon={<Warning />}
        variant="outlined"
        sx={{
          borderRadius: 2,
          backdropFilter: "blur(10px)",
          backgroundColor:
            theme.palette.mode === "dark"
              ? "rgba(255, 152, 0, 0.05)"
              : "rgba(255, 152, 0, 0.08)",
        }}
      >
        <AlertTitle sx={{ fontWeight: 600, fontSize: "0.9rem" }}>
          ⚠️ Restricted Access
        </AlertTitle>
        <Typography variant="body2" sx={{ fontSize: "0.85rem" }}>
          This page is exclusively for authorized God Users. Unauthorized access
          attempts will be logged.
        </Typography>
      </Alert>
    </Box>
  );
};

export default GodLoginWarningAlert;
