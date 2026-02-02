import React from "react";
import {
  Box,
  Typography,
  IconButton,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { Delete, ExpandMore, Error as ErrorIcon } from "@mui/icons-material";
import { OrgRedirectionSetting, Role } from "../types";
import EnvironmentColumn from "./EnvironmentColumn";
import RoleColumn from "./RoleColumn";
import RedirectionUrlsColumn from "./RedirectionUrlsColumn";

interface RedirectionSettingCardProps {
  index: number;
  setting: OrgRedirectionSetting;
  roles: Role[];
  touched: Record<string, boolean>;
  errors: Record<string, string>;
  onFieldChange: (index: number, field: string, value: string | object) => void;
  onFieldBlur: (index: number, field: string) => void;
  onDelete: (index: number) => void;
  canDelete: boolean;
}

const RedirectionSettingCard: React.FC<RedirectionSettingCardProps> = ({
  index,
  setting,
  roles,
  touched,
  errors,
  onFieldChange,
  onFieldBlur,
  onDelete,
  canDelete,
}) => {
  // Check if there are actual error messages (not just empty objects)
  const errorMessages = Object.entries(errors).filter(([_, value]) => {
    if (typeof value === "string" && value.length > 0) return true;
    if (Array.isArray(value) && value.some((v) => v)) return true;
    if (typeof value === "object" && value !== null)
      return Object.keys(value).length > 0;
    return false;
  });
  const hasErrors =
    errorMessages.length > 0 && Object.values(touched).some(Boolean);

  const getEnvLabel = (env: string) => {
    switch (env) {
      case "development":
        return "Dev";
      case "staging":
        return "Staging";
      case "production":
        return "Prod";
      default:
        return env;
    }
  };

  const getEnvColor = (env: string) => {
    switch (env) {
      case "development":
        return "info";
      case "staging":
        return "warning";
      case "production":
        return "success";
      default:
        return "default";
    }
  };

  return (
    <Accordion
      defaultExpanded={index === 0}
      sx={{
        mb: 2,
        "&:before": { display: "none" },
        border: hasErrors ? "2px solid" : "1px solid",
        borderColor: hasErrors ? "error.main" : "divider",
        borderRadius: "8px !important",
        overflow: "hidden",
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMore />}
        sx={{
          backgroundColor: hasErrors ? "error.lighter" : "background.paper",
          "&:hover": {
            backgroundColor: hasErrors ? "error.lighter" : "action.hover",
          },
        }}
      >
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1, mr: 2 }}
        >
          {hasErrors && (
            <ErrorIcon sx={{ color: "error.main", fontSize: "1.2rem" }} />
          )}

          <Typography variant="body2" fontWeight="medium">
            Setting #{index + 1}
          </Typography>

          {setting.env && (
            <Chip
              label={getEnvLabel(setting.env)}
              size="small"
              color={
                getEnvColor(setting.env) as
                  | "info"
                  | "warning"
                  | "success"
                  | "default"
              }
              variant="outlined"
            />
          )}

          {setting.roleSlug && (
            <Chip
              label={setting.roleSlug === "any" ? "Any Role" : setting.roleSlug}
              size="small"
              variant="outlined"
            />
          )}

          {setting.redirectionUrls?.length > 0 && (
            <Typography variant="caption" color="text.secondary">
              ({setting.redirectionUrls.length} URL
              {setting.redirectionUrls.length > 1 ? "s" : ""})
            </Typography>
          )}
        </Box>

        <IconButton
          size="small"
          color="error"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(index);
          }}
          disabled={!canDelete}
          title={
            !canDelete ? "At least one setting is required" : "Delete setting"
          }
          sx={{ mr: 1 }}
        >
          <Delete fontSize="small" />
        </IconButton>
      </AccordionSummary>

      <AccordionDetails sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Column 1: Environment Configuration */}
          <Grid item xs={12} md={4}>
            <EnvironmentColumn
              index={index}
              env={setting.env}
              description={setting.description || ""}
              authPageUrl={setting.authPageUrl}
              touched={touched.env || touched.authPageUrl || false}
              errors={{
                env: errors.env,
                description: errors.description,
                authPageUrl: errors.authPageUrl,
              }}
              onChange={(field, value) => onFieldChange(index, field, value)}
              onBlur={(field) => onFieldBlur(index, field)}
            />
          </Grid>

          {/* Divider */}
          <Grid
            item
            xs={12}
            md="auto"
            sx={{ display: { xs: "none", md: "block" } }}
          >
            <Divider orientation="vertical" sx={{ height: "100%", mx: 1 }} />
          </Grid>
          <Grid item xs={12} sx={{ display: { xs: "block", md: "none" } }}>
            <Divider />
          </Grid>

          {/* Column 2: Role Configuration */}
          <Grid item xs={12} md={3}>
            <RoleColumn
              index={index}
              roleSlug={setting.roleSlug}
              roles={roles}
              touched={touched.roleSlug || false}
              errors={{
                roleSlug: errors.roleSlug,
              }}
              onChange={(field, value) => onFieldChange(index, field, value)}
              onBlur={(field) => onFieldBlur(index, field)}
            />
          </Grid>

          {/* Divider */}
          <Grid
            item
            xs={12}
            md="auto"
            sx={{ display: { xs: "none", md: "block" } }}
          >
            <Divider orientation="vertical" sx={{ height: "100%", mx: 1 }} />
          </Grid>
          <Grid item xs={12} sx={{ display: { xs: "block", md: "none" } }}>
            <Divider />
          </Grid>

          {/* Column 3: Redirection URLs */}
          <Grid item xs={12} md={4}>
            <RedirectionUrlsColumn
              index={index}
              redirectionUrls={setting.redirectionUrls || []}
              touched={touched.redirectionUrls || false}
              errors={errors.redirectionUrls as any}
              onChange={(urls) => onFieldChange(index, "redirectionUrls", urls)}
              onBlur={() => onFieldBlur(index, "redirectionUrls")}
            />
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
};

export default RedirectionSettingCard;
