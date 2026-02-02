import React, { useState } from "react";
import { useFormikContext } from "formik";
import {
  Box,
  Typography,
  TextField,
  Grid,
  Button,
  CircularProgress,
  Tooltip,
  IconButton,
  Alert,
  Paper,
  InputAdornment,
} from "@mui/material";
import {
  ContentCopy,
  Refresh,
  Key,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { API_ENDPOINTS } from "../../apis";
import { useSnackbar } from "../../contexts/SnackbarContext";
import { postRequest, isSuccess, extractData } from "../../lib/api";

import { OrganizationFormData } from "./types";

interface ApiKeySettingsFormProps {
  orgId?: string;
}

const ApiKeySettingsForm: React.FC<ApiKeySettingsFormProps> = ({ orgId }) => {
  const { values, setFieldValue } = useFormikContext<OrganizationFormData>();
  const { showSnackbar } = useSnackbar();
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  const apiKey = values.apiKey || "";
  const apiKeyCreatedAt = values.apiKeyCreatedAt;

  const handleRegenerateApiKey = async () => {
    if (!orgId) {
      showSnackbar(
        "Organization ID is required to regenerate API key",
        "error",
      );
      return;
    }

    setIsRegenerating(true);
    try {
      const response = await postRequest(
        `${API_ENDPOINTS.GOD.ORGANIZATIONS}/${orgId}/regenerate-api-key`,
        {},
      );

      if (isSuccess(response)) {
        const data = extractData<{ apiKey: string; apiKeyCreatedAt: string }>(
          response,
        );
        if (data?.apiKey) {
          setFieldValue("apiKey", data.apiKey);
          setFieldValue("apiKeyCreatedAt", data.apiKeyCreatedAt);
          showSnackbar("API Key regenerated successfully", "success");
          setShowApiKey(true); // Show the new key
        }
      } else {
        const errorMessage =
          (response as any)?.message || "Failed to regenerate API key";
        showSnackbar(errorMessage, "error");
      }
    } catch (error: any) {
      showSnackbar(error?.message || "Error regenerating API key", "error");
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleCopyToClipboard = async () => {
    if (apiKey) {
      try {
        await navigator.clipboard.writeText(apiKey);
        showSnackbar("API Key copied to clipboard", "success");
      } catch (error) {
        showSnackbar("Failed to copy to clipboard", "error");
      }
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <Box>
      <Typography
        variant="h6"
        gutterBottom
        sx={{ display: "flex", alignItems: "center", gap: 1 }}
      >
        <Key color="primary" />
        API Key Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Manage API keys for programmatic access to the authentication API. API
        keys identify the organization and can be used instead of passing
        organizationId in requests.
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>How to use:</strong> Include the API key in request headers as{" "}
          <code
            style={{
              backgroundColor: "#f5f5f5",
              padding: "2px 4px",
              borderRadius: 4,
            }}
          >
            x-api-key: your-api-key
          </code>
        </Typography>
      </Alert>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              bgcolor: "grey.50",
              borderRadius: 2,
            }}
          >
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Current API Key
            </Typography>

            {apiKey ? (
              <>
                <TextField
                  fullWidth
                  value={showApiKey ? apiKey : "•".repeat(40)}
                  InputProps={{
                    readOnly: true,
                    sx: { fontFamily: "monospace", fontSize: "0.9rem" },
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip
                          title={showApiKey ? "Hide API Key" : "Show API Key"}
                        >
                          <IconButton
                            onClick={() => setShowApiKey(!showApiKey)}
                            edge="end"
                            size="small"
                          >
                            {showApiKey ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Copy to Clipboard">
                          <IconButton
                            onClick={handleCopyToClipboard}
                            edge="end"
                            size="small"
                          >
                            <ContentCopy />
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 1 }}
                />
                <Typography variant="caption" color="text.secondary">
                  Created: {formatDate(apiKeyCreatedAt)}
                </Typography>
              </>
            ) : (
              <Typography
                variant="body2"
                color="text.disabled"
                sx={{ fontStyle: "italic" }}
              >
                No API key generated. API key will be auto-generated when the
                organization is created.
              </Typography>
            )}
          </Paper>
        </Grid>

        {orgId && (
          <Grid item xs={12}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Button
                variant="outlined"
                color="warning"
                startIcon={
                  isRegenerating ? <CircularProgress size={16} /> : <Refresh />
                }
                onClick={handleRegenerateApiKey}
                disabled={isRegenerating}
              >
                {isRegenerating ? "Regenerating..." : "Regenerate API Key"}
              </Button>
              <Typography variant="caption" color="text.secondary">
                Warning: Regenerating will invalidate the current API key
              </Typography>
            </Box>
          </Grid>
        )}

        {!orgId && (
          <Grid item xs={12}>
            <Alert severity="warning">
              An API key will be automatically generated when you create this
              organization. You can regenerate it later if needed.
            </Alert>
          </Grid>
        )}
      </Grid>

      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          API Key Usage Examples
        </Typography>
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            bgcolor: "#1e1e1e",
            borderRadius: 2,
            overflow: "auto",
          }}
        >
          <Typography
            component="pre"
            sx={{
              fontFamily: "monospace",
              fontSize: "0.8rem",
              color: "#d4d4d4",
              m: 0,
              whiteSpace: "pre-wrap",
            }}
          >
            {`# Using curl
curl -X GET "https://api.example.com/v1/api/public/users" \\
  -H "x-api-key: ${apiKey || "your-api-key"}"

# Using JavaScript fetch
fetch('https://api.example.com/v1/api/public/users', {
  headers: {
    'x-api-key': '${apiKey || "your-api-key"}'
  }
})`}
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default ApiKeySettingsForm;
