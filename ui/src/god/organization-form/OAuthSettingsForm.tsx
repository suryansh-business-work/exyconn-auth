import React, { useState } from "react";
import { useFormikContext } from "formik";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  FormControlLabel,
  Switch,
  Grid,
  Button,
  Alert,
  Link,
  Paper,
  Card,
  CardContent,
  Chip,
  Divider,
} from "@mui/material";
import {
  Info as InfoIcon,
  OpenInNew as OpenInNewIcon,
  PlayArrow as PlayArrowIcon,
  ContentCopy as CopyIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { OrganizationFormData } from "./types";
import { API_BASE_URL } from "../../apis";

type OAuthProviderKey = "google" | "microsoft" | "apple" | "github";

// Production backend URL for OAuth callbacks - this is where providers redirect after auth
const OAUTH_BACKEND_URL = "https://exyconn-auth-server.exyconn.com";

interface ProviderConfig {
  key: OAuthProviderKey;
  label: string;
  color: string;
  consoleUrl: string;
  consoleName: string;
  callbackPath: string;
  scopes: string;
  logo: string;
}

const PROVIDERS: ProviderConfig[] = [
  {
    key: "google",
    label: "Google",
    color: "#4285F4",
    consoleUrl: "https://console.cloud.google.com/apis/credentials",
    consoleName: "Google Cloud Console",
    callbackPath: "/v1/api/auth/google/callback",
    scopes: "email, profile",
    logo: "/assets/logos/google.svg",
  },
  {
    key: "microsoft",
    label: "Microsoft",
    color: "#00A4EF",
    consoleUrl:
      "https://entra.microsoft.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade",
    consoleName: "Microsoft Entra Admin Center",
    callbackPath: "/v1/api/auth/microsoft/callback",
    scopes: "openid, email, profile",
    logo: "/assets/logos/microsoft.svg",
  },
  {
    key: "apple",
    label: "Apple",
    color: "#000000",
    consoleUrl:
      "https://developer.apple.com/account/resources/identifiers/list/serviceId",
    consoleName: "Apple Developer Console",
    callbackPath: "/v1/api/auth/apple/callback",
    scopes: "email, name",
    logo: "/assets/logos/apple.svg",
  },
  {
    key: "github",
    label: "GitHub",
    color: "#333333",
    consoleUrl: "https://github.com/settings/developers",
    consoleName: "GitHub Developer Settings",
    callbackPath: "/v1/api/auth/github/callback",
    scopes: "user:email, read:user",
    logo: "/assets/logos/github.png",
  },
];

const OAuthSettingsForm: React.FC = () => {
  const { values, handleChange, handleBlur, setFieldValue, errors, touched } =
    useFormikContext<OrganizationFormData>();
  const { orgId } = useParams<{ orgId: string }>();
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const oauthSettings = values.oauthSettings || {};

  // Get the callback URL for a provider
  // IMPORTANT: This MUST be the backend API URL, not the frontend auth URL
  // OAuth providers redirect to the backend, which then redirects to frontend
  const getCallbackUrl = (provider: ProviderConfig): string => {
    // Use production backend URL or localhost for dev
    const isLocalDev =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";
    const baseUrl = isLocalDev ? "http://localhost:4002" : OAUTH_BACKEND_URL;
    return `${baseUrl}${provider.callbackPath}`;
  };

  // Copy URL to clipboard
  const handleCopyUrl = async (url: string, providerKey: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(providerKey);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopiedUrl(providerKey);
      setTimeout(() => setCopiedUrl(null), 2000);
    }
  };

  // Test OAuth functionality
  const handleTestOAuth = (providerKey: OAuthProviderKey) => {
    if (!orgId) {
      alert("Organization ID is required. Please save the organization first.");
      return;
    }

    const currentOrigin = window.location.origin;
    const oauthUrl = `${API_BASE_URL}/auth/${providerKey}?organizationId=${encodeURIComponent(orgId)}&origin=${encodeURIComponent(currentOrigin)}&testMode=true`;

    const width = 500;
    const height = 700;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    window.open(
      oauthUrl,
      "oauth_test",
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`,
    );
  };

  // Check if provider is fully configured
  const isProviderConfigured = (providerKey: OAuthProviderKey): boolean => {
    const provider = oauthSettings[providerKey];
    return !!(
      provider?.enabled &&
      provider?.clientId &&
      provider?.clientSecret
    );
  };

  // Get error for a field
  const getError = (path: string): string | undefined => {
    const parts = path.split(".");
    let error: any = errors;
    let touch: any = touched;
    for (const part of parts) {
      error = error?.[part];
      touch = touch?.[part];
    }
    return touch && error ? error : undefined;
  };

  const renderProviderCard = (provider: ProviderConfig) => {
    const providerSettings = oauthSettings[provider.key];
    const isEnabled = providerSettings?.enabled || false;
    const isConfigured = isProviderConfigured(provider.key);
    const callbackUrl = getCallbackUrl(provider);

    const clientIdError = getError(`oauthSettings.${provider.key}.clientId`);
    const clientSecretError = getError(
      `oauthSettings.${provider.key}.clientSecret`,
    );

    return (
      <Card
        key={provider.key}
        sx={{
          mb: 2,
          border: "1px solid",
          borderColor: isEnabled ? provider.color : "divider",
          borderLeftWidth: 4,
          transition: "all 0.2s ease",
        }}
      >
        <CardContent>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                component="img"
                src={provider.logo}
                alt={provider.label}
                sx={{ width: 28, height: 28 }}
                onError={(e: any) => {
                  e.target.style.display = "none";
                }}
              />
              <Typography variant="h6" fontWeight={600}>
                {provider.label}
              </Typography>
              {isConfigured && (
                <Chip
                  icon={<CheckCircleIcon />}
                  label="Configured"
                  size="small"
                  color="success"
                  variant="outlined"
                />
              )}
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {isConfigured && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<PlayArrowIcon />}
                  onClick={() => handleTestOAuth(provider.key)}
                >
                  Test
                </Button>
              )}
              <FormControlLabel
                control={
                  <Switch
                    checked={isEnabled}
                    onChange={(e) =>
                      setFieldValue(
                        `oauthSettings.${provider.key}.enabled`,
                        e.target.checked,
                      )
                    }
                    color="primary"
                  />
                }
                label={isEnabled ? "Enabled" : "Disabled"}
                sx={{ m: 0 }}
              />
            </Box>
          </Box>

          {isEnabled && (
            <>
              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Client ID"
                    name={`oauthSettings.${provider.key}.clientId`}
                    value={providerSettings?.clientId || ""}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder={`Enter ${provider.label} Client ID`}
                    error={!!clientIdError}
                    helperText={clientIdError || `From ${provider.consoleName}`}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Client Secret"
                    name={`oauthSettings.${provider.key}.clientSecret`}
                    value={providerSettings?.clientSecret || ""}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    type="password"
                    placeholder={`Enter ${provider.label} Client Secret`}
                    error={!!clientSecretError}
                    helperText={clientSecretError || "Keep this secure"}
                    size="small"
                  />
                </Grid>
              </Grid>

              {/* Callback URL Info */}
              <Paper
                elevation={0}
                sx={{
                  mt: 2,
                  p: 2,
                  bgcolor: "grey.50",
                  border: "1px solid",
                  borderColor: "grey.200",
                  borderRadius: 1,
                }}
              >
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Redirect URI (add this to {provider.consoleName})
                </Typography>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}
                >
                  <TextField
                    fullWidth
                    value={callbackUrl}
                    size="small"
                    InputProps={{
                      readOnly: true,
                      sx: {
                        fontFamily: "monospace",
                        fontSize: "0.85rem",
                        bgcolor: "white",
                      },
                    }}
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={
                      copiedUrl === provider.key ? (
                        <CheckCircleIcon />
                      ) : (
                        <CopyIcon />
                      )
                    }
                    onClick={() => handleCopyUrl(callbackUrl, provider.key)}
                    color={copiedUrl === provider.key ? "success" : "primary"}
                    sx={{ minWidth: 100 }}
                  >
                    {copiedUrl === provider.key ? "Copied!" : "Copy"}
                  </Button>
                </Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 1, display: "block" }}
                >
                  Scopes required: {provider.scopes}
                </Typography>
              </Paper>

              {/* Console Link */}
              <Box sx={{ mt: 2, textAlign: "right" }}>
                <Link
                  href={provider.consoleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 0.5,
                    fontSize: "0.875rem",
                  }}
                >
                  Open {provider.consoleName} <OpenInNewIcon fontSize="small" />
                </Link>
              </Box>
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        OAuth Provider Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Configure OAuth authentication providers for single sign-on (SSO).
        Enable a provider, add your credentials, and copy the redirect URI to
        your OAuth app settings.
      </Typography>

      {/* General Info Alert */}
      <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Setup Steps:</strong> 1) Enable a provider below → 2) Enter
          Client ID and Secret from the provider's developer console → 3) Copy
          the Redirect URI and add it to your OAuth app settings in the
          provider's console.
        </Typography>
      </Alert>

      {/* Provider Cards */}
      {PROVIDERS.map((provider) => renderProviderCard(provider))}
    </Box>
  );
};

export default OAuthSettingsForm;
