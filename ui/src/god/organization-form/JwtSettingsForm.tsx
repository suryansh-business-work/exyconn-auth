import React, { useState } from "react";
import { useFormikContext } from "formik";
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  FormHelperText,
  Grid,
  Button,
  CircularProgress,
  Tooltip,
  IconButton,
} from "@mui/material";
import { ContentCopy, Refresh } from "@mui/icons-material";
import { API_ENDPOINTS } from "../../apis";
import { useSnackbar } from "../../contexts/SnackbarContext";

import { OrganizationFormData } from "./types";

const AVAILABLE_PAYLOAD_FIELDS = [
  "userId",
  "userName",
  "email",
  "profilePicture",
  "role",
  "orgId",
  "orgName",
  "permissions",
  "phone",
  "firstName",
  "lastName",
];

const JwtSettingsForm: React.FC<{ orgId?: string }> = ({ orgId }) => {
  const { values, handleChange, handleBlur, setFieldValue } =
    useFormikContext<OrganizationFormData>();
  const { showSnackbar } = useSnackbar();
  const [isRegenerating, setIsRegenerating] = useState(false);

  const jwtSettings = values.jwtSettings || {};

  const handleRegenerateSecret = async () => {
    if (!orgId) {
      showSnackbar("Organization ID is required to regenerate secret", "error");
      return;
    }

    setIsRegenerating(true);
    try {
      const response = await fetch(
        `${API_ENDPOINTS.GOD.ORGANIZATIONS}/${orgId}/regenerate-jwt-secret`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        },
      );

      if (response.ok) {
        const data = await response.json();
        if (data?.data?.jwtSettings?.tokenSignKey) {
          setFieldValue(
            "jwtSettings.tokenSignKey",
            data.data.jwtSettings.tokenSignKey,
          );
          showSnackbar("JWT Secret regenerated successfully", "success");
        }
      } else {
        showSnackbar("Failed to regenerate JWT secret", "error");
      }
    } catch (error: any) {
      showSnackbar(error?.message || "Error regenerating JWT secret", "error");
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleCopyToClipboard = async () => {
    if (jwtSettings.tokenSignKey) {
      try {
        await navigator.clipboard.writeText(jwtSettings.tokenSignKey);
        showSnackbar("JWT Secret copied to clipboard", "success");
      } catch (error) {
        showSnackbar("Failed to copy to clipboard", "error");
      }
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        JWT Token Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Configure JWT token generation settings including algorithm and payload
        fields.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel id="jwt-algorithm-label">JWT Algorithm</InputLabel>
            <Select
              labelId="jwt-algorithm-label"
              label="JWT Algorithm"
              name="jwtSettings.algorithm"
              value={jwtSettings.algorithm || "HS256"}
              onChange={handleChange}
              onBlur={handleBlur}
            >
              <MenuItem value="HS256">HS256 (HMAC SHA-256)</MenuItem>
              <MenuItem value="HS384">HS384 (HMAC SHA-384)</MenuItem>
              <MenuItem value="HS512">HS512 (HMAC SHA-512)</MenuItem>
              <MenuItem value="RS256">RS256 (RSA SHA-256)</MenuItem>
              <MenuItem value="RS384">RS384 (RSA SHA-384)</MenuItem>
              <MenuItem value="RS512">RS512 (RSA SHA-512)</MenuItem>
            </Select>
            <FormHelperText>
              Select the cryptographic algorithm for JWT signing
            </FormHelperText>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel id="jwt-payload-fields-label">
              Payload Fields
            </InputLabel>
            <Select
              labelId="jwt-payload-fields-label"
              label="Payload Fields"
              multiple
              value={jwtSettings.payloadFields || []}
              onChange={(e) => {
                const value = e.target.value;
                setFieldValue(
                  "jwtSettings.payloadFields",
                  typeof value === "string" ? value.split(",") : value,
                );
              }}
              input={<OutlinedInput label="Payload Fields" />}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {(selected as string[]).map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
            >
              {AVAILABLE_PAYLOAD_FIELDS.map((field) => (
                <MenuItem key={field} value={field}>
                  {field}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              Select which fields to include in the JWT payload
            </FormHelperText>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
            <TextField
              fullWidth
              label="Token Sign Key (UUID)"
              name="jwtSettings.tokenSignKey"
              value={jwtSettings.tokenSignKey || ""}
              onChange={handleChange}
              onBlur={handleBlur}
              type="password"
              placeholder="Enter a secure secret key"
              helperText="Secret key for signing JWT tokens (keep this secure)"
              disabled
              sx={{ flex: 1 }}
            />
            <Box sx={{ display: "flex", gap: 0.5, mt: 1 }}>
              <Tooltip title="Copy to clipboard">
                <IconButton
                  size="small"
                  onClick={handleCopyToClipboard}
                  disabled={!jwtSettings.tokenSignKey}
                  sx={{ mt: 0.5 }}
                >
                  <ContentCopy fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Generate new secret">
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleRegenerateSecret}
                  disabled={isRegenerating}
                  startIcon={
                    isRegenerating ? (
                      <CircularProgress size={16} />
                    ) : (
                      <Refresh fontSize="small" />
                    )
                  }
                  sx={{ whiteSpace: "nowrap", mt: 0.5 }}
                >
                  {isRegenerating ? "Regenerating..." : "Regenerate"}
                </Button>
              </Tooltip>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default JwtSettingsForm;
