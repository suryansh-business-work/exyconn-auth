import React from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Chip,
  IconButton,
  Badge,
} from "@mui/material";
import {
  ExpandMore,
  Delete,
  VpnKey,
  Warning,
  Error as ErrorIcon,
} from "@mui/icons-material";
import { ApiTokenFormValues, getDaysUntilExpiry } from "./constants";
import { TokenFormFields } from "./TokenFormFields";

interface RoleOption {
  slug: string;
  name: string;
}

interface TokenAccordionProps {
  token: ApiTokenFormValues;
  index: number;
  roles: RoleOption[];
  hasError: boolean;
  isVisible: boolean;
  onDelete: () => void;
  onFieldChange: (field: string, value: any) => void;
  onToggleVisibility: () => void;
  onCopyToken: () => void;
  onRegenerateToken: () => void;
  onOpenScopeDialog: () => void;
  getFieldError: (field: string) => string | undefined;
}

export const TokenAccordion: React.FC<TokenAccordionProps> = ({
  token,
  roles,
  hasError,
  isVisible,
  onDelete,
  onFieldChange,
  onToggleVisibility,
  onCopyToken,
  onRegenerateToken,
  onOpenScopeDialog,
  getFieldError,
}) => {
  const expiryDays = getDaysUntilExpiry(token.expiresIn);
  const isExpiringSoon = expiryDays <= 7 && expiryDays !== Infinity;

  return (
    <Accordion
      sx={{
        mb: 2,
        "&:before": { display: "none" },
        border: hasError
          ? "2px solid #d32f2f"
          : "1px solid rgba(0, 0, 0, 0.12)",
        backgroundColor: hasError ? "#ffebee" : "background.paper",
      }}
    >
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Box display="flex" alignItems="center" gap={1} flex={1}>
          {hasError && <ErrorIcon sx={{ color: "#d32f2f" }} />}
          <VpnKey color={token.isActive ? "primary" : "disabled"} />
          <Typography variant="body1" fontWeight="medium">
            {token.name || "Untitled Token"}
          </Typography>
          {!token.isActive && (
            <Chip label="Inactive" size="small" color="default" />
          )}
          {isExpiringSoon && (
            <Chip
              icon={<Warning sx={{ fontSize: "14px !important" }} />}
              label={`Expires in ${expiryDays}d`}
              size="small"
              color="warning"
            />
          )}
          <Badge
            badgeContent={token.scopes?.length || 0}
            color="secondary"
            sx={{ ml: 1 }}
          >
            <Chip label="Scopes" size="small" variant="outlined" />
          </Badge>
        </Box>
        <IconButton
          size="small"
          color="error"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          sx={{ mr: 1 }}
        >
          <Delete fontSize="small" />
        </IconButton>
      </AccordionSummary>
      <AccordionDetails>
        <TokenFormFields
          token={token}
          roles={roles}
          isVisible={isVisible}
          onFieldChange={onFieldChange}
          onToggleVisibility={onToggleVisibility}
          onCopyToken={onCopyToken}
          onRegenerateToken={onRegenerateToken}
          onOpenScopeDialog={onOpenScopeDialog}
          getFieldError={getFieldError}
        />
      </AccordionDetails>
    </Accordion>
  );
};
