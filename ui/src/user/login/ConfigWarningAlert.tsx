import React from "react";
import { Box, Alert, Typography } from "@mui/material";
import { Warning as WarningIcon } from "@mui/icons-material";

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

interface ConfigWarningAlertProps {
  isDevelopment: boolean;
  hasConfigIssues: boolean;
  configurationIssues: ConfigurationIssues;
}

const ConfigWarningAlert: React.FC<ConfigWarningAlertProps> = ({
  isDevelopment,
  hasConfigIssues,
  configurationIssues,
}) => {
  if (!isDevelopment || !hasConfigIssues) {
    return null;
  }

  return (
    <Box
      sx={{
        position: "fixed",
        top: 16,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1100,
        maxWidth: 700,
        width: "95%",
      }}
    >
      <Alert
        severity={configurationIssues.critical.length > 0 ? "error" : "warning"}
        icon={<WarningIcon />}
        sx={{
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          borderRadius: 2,
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          {configurationIssues.critical.length > 0
            ? "⚠️ Critical Configuration Issues"
            : "🔧 Configuration Warnings"}
        </Typography>

        {/* Critical Issues */}
        {configurationIssues.critical.length > 0 && (
          <Box sx={{ mb: 1 }}>
            <Typography variant="caption" color="error.dark" fontWeight="bold">
              Critical ({configurationIssues.critical.length}):
            </Typography>
            <Box component="ul" sx={{ m: 0, pl: 2, mt: 0.5 }}>
              {configurationIssues.critical.map((issue) => (
                <Typography component="li" variant="body2" key={issue.id}>
                  <strong>{issue.name}:</strong> {issue.description}
                </Typography>
              ))}
            </Box>
          </Box>
        )}

        {/* Warning Issues */}
        {configurationIssues.warning.length > 0 && (
          <Box>
            <Typography
              variant="caption"
              color="warning.dark"
              fontWeight="bold"
            >
              Warnings ({configurationIssues.warning.length}):
            </Typography>
            <Box component="ul" sx={{ m: 0, pl: 2, mt: 0.5 }}>
              {configurationIssues.warning.map((issue) => (
                <Typography component="li" variant="body2" key={issue.id}>
                  <strong>{issue.name}:</strong> {issue.description}
                </Typography>
              ))}
            </Box>
          </Box>
        )}
      </Alert>
    </Box>
  );
};

export default ConfigWarningAlert;
