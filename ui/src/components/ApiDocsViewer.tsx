import React from "react";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import { Box, Typography, Paper, IconButton, Tooltip } from "@mui/material";
import { ArrowBack, ContentCopy, OpenInNew } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

// Type definition for OpenAPI Spec
export interface OpenAPISpec {
  openapi: string;
  info: {
    title: string;
    version: string;
    description?: string;
    contact?: {
      name?: string;
      email?: string;
    };
  };
  servers?: Array<{
    url: string;
    description?: string;
  }>;
  tags?: Array<{
    name: string;
    description?: string;
  }>;
  paths: Record<string, unknown>;
  components?: {
    securitySchemes?: Record<string, unknown>;
    schemas?: Record<string, unknown>;
  };
}

interface ApiDocsViewerProps {
  spec: OpenAPISpec;
  title?: string;
  showBackButton?: boolean;
  backPath?: string;
}

/**
 * ApiDocsViewer Component
 *
 * A reusable component that renders Swagger/OpenAPI documentation
 * using swagger-ui-react.
 *
 * Usage:
 * ```tsx
 * import { ApiDocsViewer } from './components/ApiDocsViewer';
 * import { myApiSpec } from './specs/myApiSpec';
 *
 * <ApiDocsViewer
 *   spec={myApiSpec}
 *   title="My API Documentation"
 *   showBackButton={true}
 *   backPath="/dashboard"
 * />
 * ```
 */
const ApiDocsViewer: React.FC<ApiDocsViewerProps> = ({
  spec,
  title,
  showBackButton = true,
  backPath = "/",
}) => {
  const navigate = useNavigate();

  const copyBaseUrl = () => {
    const baseUrl = spec.servers?.[0]?.url || "";
    navigator.clipboard.writeText(baseUrl);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#fafafa",
      }}
    >
      {/* Header */}
      <Paper
        elevation={1}
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 1000,
          backgroundColor: "#fff",
          borderRadius: 0,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {showBackButton && (
            <Tooltip title="Go Back">
              <IconButton onClick={() => navigate(backPath)}>
                <ArrowBack />
              </IconButton>
            </Tooltip>
          )}
          <Box>
            <Typography variant="h5" fontWeight="600">
              {title || spec.info.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Version: {spec.info.version} |{" "}
              {spec.servers?.[0]?.description || "API Server"}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Tooltip title="Copy Base URL">
            <IconButton onClick={copyBaseUrl} size="small">
              <ContentCopy fontSize="small" />
            </IconButton>
          </Tooltip>
          {spec.servers?.[0]?.url && (
            <Tooltip title="Open in New Tab">
              <IconButton
                size="small"
                onClick={() => window.open(spec.servers?.[0]?.url, "_blank")}
              >
                <OpenInNew fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Paper>

      {/* API Info Banner */}
      <Box
        sx={{
          px: 3,
          py: 2,
          backgroundColor: "#1976d2",
          color: "#fff",
        }}
      >
        <Typography variant="body1">
          {spec.info.description || "API Documentation"}
        </Typography>
        {spec.info.contact && (
          <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.9 }}>
            Contact: {spec.info.contact.name} ({spec.info.contact.email})
          </Typography>
        )}
      </Box>

      {/* Swagger UI */}
      <Box
        sx={{
          "& .swagger-ui": {
            fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
          },
          "& .swagger-ui .topbar": {
            display: "none",
          },
          "& .swagger-ui .info": {
            display: "none", // Hide default info since we have custom header
          },
          "& .swagger-ui .scheme-container": {
            backgroundColor: "#f5f5f5",
            padding: "16px",
            boxShadow: "none",
          },
          "& .swagger-ui .opblock-tag": {
            borderBottom: "1px solid #e0e0e0",
          },
          "& .swagger-ui .opblock.opblock-post": {
            borderColor: "#49cc90",
            backgroundColor: "rgba(73, 204, 144, 0.1)",
          },
          "& .swagger-ui .opblock.opblock-get": {
            borderColor: "#61affe",
            backgroundColor: "rgba(97, 175, 254, 0.1)",
          },
          "& .swagger-ui .opblock.opblock-put": {
            borderColor: "#fca130",
            backgroundColor: "rgba(252, 161, 48, 0.1)",
          },
          "& .swagger-ui .opblock.opblock-delete": {
            borderColor: "#f93e3e",
            backgroundColor: "rgba(249, 62, 62, 0.1)",
          },
          "& .swagger-ui .btn.execute": {
            backgroundColor: "#1976d2",
            borderColor: "#1976d2",
          },
          "& .swagger-ui .btn.execute:hover": {
            backgroundColor: "#1565c0",
          },
          "& .swagger-ui .responses-inner h4, & .swagger-ui .responses-inner h5":
            {
              fontSize: "14px",
            },
          "& .swagger-ui table tbody tr td": {
            padding: "10px",
          },
          "& .swagger-ui .model-box": {
            backgroundColor: "#f9f9f9",
          },
        }}
      >
        <SwaggerUI spec={spec} />
      </Box>
    </Box>
  );
};

export default ApiDocsViewer;
