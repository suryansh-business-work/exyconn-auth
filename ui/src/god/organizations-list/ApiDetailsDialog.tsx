import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Chip,
  Tooltip,
  Alert,
  Divider,
  alpha,
} from "@mui/material";
import {
  ExpandMore,
  ContentCopy,
  Check,
  Api,
  Login,
  PersonAdd,
  LockReset,
  Email,
  Close,
  Person,
} from "@mui/icons-material";
import type { GodOrganization } from "../../types/god";

interface ApiDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  organization: GodOrganization | null;
}

interface ApiEndpoint {
  name: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  description: string;
  icon: React.ReactNode;
  requestBody?: object;
  headers?: object;
  queryParams?: object;
}

const ApiDetailsDialog: React.FC<ApiDetailsDialogProps> = ({
  open,
  onClose,
  organization,
}) => {
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const [expandedPanel, setExpandedPanel] = useState<string | false>(false);

  if (!organization) return null;

  // Determine if we're on localhost
  const isLocalhost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  // Use current origin for local development, otherwise use authServerUrl
  const baseUrl = isLocalhost
    ? `${window.location.protocol}//${window.location.hostname}:9000`
    : organization.authServerUrl || "https://auth.example.com";
  const orgId = organization._id;

  const apiEndpoints: ApiEndpoint[] = [
    {
      name: "Login",
      method: "POST",
      path: `${baseUrl}/auth/login`,
      description: "Authenticate a user with email and password",
      icon: <Login fontSize="small" />,
      requestBody: {
        email: "user@example.com",
        password: "password123",
        organizationId: orgId,
      },
    },
    {
      name: "Signup",
      method: "POST",
      path: `${baseUrl}/auth/signup`,
      description: "Register a new user account",
      icon: <PersonAdd fontSize="small" />,
      requestBody: {
        firstName: "John",
        lastName: "Doe",
        email: "user@example.com",
        password: "password123",
        organizationId: orgId,
      },
    },
    {
      name: "Verify Account",
      method: "POST",
      path: `${baseUrl}/auth/verify`,
      description: "Verify user account with OTP after signup",
      icon: <Check fontSize="small" />,
      requestBody: {
        email: "user@example.com",
        otp: "123456",
      },
    },
    {
      name: "Forgot Password",
      method: "POST",
      path: `${baseUrl}/auth/forgot-password`,
      description: "Send password reset OTP to user email",
      icon: <LockReset fontSize="small" />,
      requestBody: {
        email: "user@example.com",
        organizationId: orgId,
      },
    },
    {
      name: "Reset Password",
      method: "POST",
      path: `${baseUrl}/auth/reset-password`,
      description: "Reset password using OTP verification",
      icon: <LockReset fontSize="small" />,
      requestBody: {
        email: "user@example.com",
        otp: "123456",
        newPassword: "newPassword123",
        organizationId: orgId,
      },
    },
    {
      name: "Resend Verification OTP",
      method: "POST",
      path: `${baseUrl}/auth/resend-verification-otp`,
      description: "Resend OTP for email verification after signup",
      icon: <Email fontSize="small" />,
      requestBody: {
        email: "user@example.com",
        organizationId: orgId,
      },
    },
    {
      name: "User Details (ME)",
      method: "GET",
      path: `${baseUrl}/auth/profile`,
      description: "Get current authenticated user profile details",
      icon: <Person fontSize="small" />,
      headers: {
        Authorization: "Bearer <token>",
      },
    },
    {
      name: "Update Profile",
      method: "PUT",
      path: `${baseUrl}/auth/profile`,
      description: "Update user profile information",
      icon: <Person fontSize="small" />,
      headers: {
        Authorization: "Bearer <token>",
      },
      requestBody: {
        firstName: "John",
        lastName: "Doe",
      },
    },
    {
      name: "Change Password",
      method: "POST",
      path: `${baseUrl}/auth/password-change`,
      description: "Change password for authenticated user",
      icon: <LockReset fontSize="small" />,
      headers: {
        Authorization: "Bearer <token>",
      },
      requestBody: {
        currentPassword: "oldPassword123",
        newPassword: "newPassword123",
      },
    },
  ];

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET":
        return "success";
      case "POST":
        return "primary";
      case "PUT":
        return "warning";
      case "DELETE":
        return "error";
      default:
        return "default";
    }
  };

  const handleCopy = async (text: string, identifier: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedPath(identifier);
      setTimeout(() => setCopiedPath(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleAccordionChange =
    (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpandedPanel(isExpanded ? panel : false);
    };

  const generateCodeSnippet = (endpoint: ApiEndpoint) => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...((endpoint.headers as Record<string, string>) || {}),
    };

    const snippet = `// ${endpoint.name} API
fetch('${endpoint.path}', {
  method: '${endpoint.method}',
  headers: ${JSON.stringify(headers, null, 2)},${
    endpoint.requestBody
      ? `
  body: JSON.stringify(${JSON.stringify(endpoint.requestBody, null, 2)}),`
      : ""
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`;

    return snippet;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: "85vh",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 1,
        }}
      >
        <Box display="flex" alignItems="center" gap={1.5}>
          <Api color="primary" />
          <Box>
            <Typography variant="h6" fontWeight={600}>
              API Details
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {organization.orgName}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 2 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Base URL:</strong> {baseUrl}
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            <strong>Organization ID:</strong> {orgId}
          </Typography>
        </Alert>

        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
          Available Endpoints ({apiEndpoints.length})
        </Typography>

        {apiEndpoints.map((endpoint, index) => (
          <Accordion
            key={index}
            expanded={expandedPanel === `panel-${index}`}
            onChange={handleAccordionChange(`panel-${index}`)}
            sx={{
              mb: 1,
              "&:before": { display: "none" },
              border: "1px solid",
              borderColor: "divider",
              borderRadius: "8px !important",
              overflow: "hidden",
              "&:not(:last-child)": { mb: 1 },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMore />}
              sx={{
                "&:hover": { bgcolor: alpha("#1976d2", 0.04) },
              }}
            >
              <Box display="flex" alignItems="center" gap={1.5} flex={1} pr={2}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 32,
                    height: 32,
                    borderRadius: 1,
                    bgcolor: alpha("#1976d2", 0.1),
                    color: "primary.main",
                  }}
                >
                  {endpoint.icon}
                </Box>
                <Box flex={1}>
                  <Typography variant="body2" fontWeight={600}>
                    {endpoint.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block" }}
                  >
                    {endpoint.description}
                  </Typography>
                </Box>
                <Chip
                  label={endpoint.method}
                  size="small"
                  color={getMethodColor(endpoint.method) as any}
                  sx={{ fontWeight: 600, minWidth: 60 }}
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0, pb: 2 }}>
              {/* Endpoint Path */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 2,
                  p: 1.5,
                  bgcolor: "grey.50",
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    flex: 1,
                    fontFamily: "monospace",
                    fontSize: "0.85rem",
                    wordBreak: "break-all",
                  }}
                >
                  {endpoint.path}
                </Typography>
                <Tooltip
                  title={
                    copiedPath === `path-${index}` ? "Copied!" : "Copy URL"
                  }
                >
                  <IconButton
                    size="small"
                    onClick={() => handleCopy(endpoint.path, `path-${index}`)}
                  >
                    {copiedPath === `path-${index}` ? (
                      <Check fontSize="small" color="success" />
                    ) : (
                      <ContentCopy fontSize="small" />
                    )}
                  </IconButton>
                </Tooltip>
              </Box>

              {/* Request Body */}
              {endpoint.requestBody && (
                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="caption"
                    fontWeight={600}
                    color="text.secondary"
                    sx={{ display: "block", mb: 0.5 }}
                  >
                    Request Body
                  </Typography>
                  <Box
                    sx={{
                      p: 1.5,
                      bgcolor: "#1e1e1e",
                      borderRadius: 1,
                      overflow: "auto",
                      position: "relative",
                    }}
                  >
                    <pre
                      style={{
                        margin: 0,
                        color: "#d4d4d4",
                        fontSize: "0.8rem",
                        fontFamily: "Consolas, Monaco, monospace",
                      }}
                    >
                      {JSON.stringify(endpoint.requestBody, null, 2)}
                    </pre>
                    <Tooltip
                      title={
                        copiedPath === `body-${index}` ? "Copied!" : "Copy JSON"
                      }
                    >
                      <IconButton
                        size="small"
                        onClick={() =>
                          handleCopy(
                            JSON.stringify(endpoint.requestBody, null, 2),
                            `body-${index}`,
                          )
                        }
                        sx={{
                          position: "absolute",
                          top: 4,
                          right: 4,
                          color: "grey.400",
                          "&:hover": { color: "grey.200" },
                        }}
                      >
                        {copiedPath === `body-${index}` ? (
                          <Check fontSize="small" />
                        ) : (
                          <ContentCopy fontSize="small" />
                        )}
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              )}

              {/* Headers */}
              {endpoint.headers && (
                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="caption"
                    fontWeight={600}
                    color="text.secondary"
                    sx={{ display: "block", mb: 0.5 }}
                  >
                    Headers
                  </Typography>
                  <Box
                    sx={{
                      p: 1.5,
                      bgcolor: "grey.100",
                      borderRadius: 1,
                    }}
                  >
                    <pre
                      style={{
                        margin: 0,
                        fontSize: "0.8rem",
                        fontFamily: "Consolas, Monaco, monospace",
                      }}
                    >
                      {JSON.stringify(endpoint.headers, null, 2)}
                    </pre>
                  </Box>
                </Box>
              )}

              {/* Code Snippet */}
              <Box>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={0.5}
                >
                  <Typography
                    variant="caption"
                    fontWeight={600}
                    color="text.secondary"
                  >
                    JavaScript Code
                  </Typography>
                  <Tooltip
                    title={
                      copiedPath === `code-${index}` ? "Copied!" : "Copy Code"
                    }
                  >
                    <IconButton
                      size="small"
                      onClick={() =>
                        handleCopy(
                          generateCodeSnippet(endpoint),
                          `code-${index}`,
                        )
                      }
                    >
                      {copiedPath === `code-${index}` ? (
                        <Check fontSize="small" color="success" />
                      ) : (
                        <ContentCopy fontSize="small" />
                      )}
                    </IconButton>
                  </Tooltip>
                </Box>
                <Box
                  sx={{
                    p: 1.5,
                    bgcolor: "#1e1e1e",
                    borderRadius: 1,
                    overflow: "auto",
                    maxHeight: 300,
                  }}
                >
                  <pre
                    style={{
                      margin: 0,
                      color: "#d4d4d4",
                      fontSize: "0.75rem",
                      fontFamily: "Consolas, Monaco, monospace",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {generateCodeSnippet(endpoint)}
                  </pre>
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 1 }}>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ApiDetailsDialog;
