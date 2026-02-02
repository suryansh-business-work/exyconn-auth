import React from "react";
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem as MuiMenuItem,
  FormHelperText,
  Typography,
  Box,
  Paper,
  Button,
  Chip,
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  VpnKey,
  Security,
  Visibility,
  VisibilityOff,
  ContentCopy,
  Refresh,
} from "@mui/icons-material";
import {
  ApiTokenFormValues,
  AVAILABLE_SCOPES,
  EXPIRATION_OPTIONS,
} from "./constants";

interface RoleOption {
  slug: string;
  name: string;
}

interface TokenFormFieldsProps {
  token: ApiTokenFormValues;
  roles: RoleOption[];
  isVisible: boolean;
  onFieldChange: (field: string, value: any) => void;
  onToggleVisibility: () => void;
  onCopyToken: () => void;
  onRegenerateToken: () => void;
  onOpenScopeDialog: () => void;
  getFieldError: (field: string) => string | undefined;
}

export const TokenFormFields: React.FC<TokenFormFieldsProps> = ({
  token,
  roles,
  isVisible,
  onFieldChange,
  onToggleVisibility,
  onCopyToken,
  onRegenerateToken,
  onOpenScopeDialog,
  getFieldError,
}) => (
  <Grid container spacing={2}>
    <Grid item xs={12} md={6}>
      <TextField
        fullWidth
        required
        label="Token Name"
        value={token.name}
        onChange={(e) => onFieldChange("name", e.target.value)}
        error={Boolean(getFieldError("name"))}
        helperText={
          getFieldError("name") || "A descriptive name for this token"
        }
      />
    </Grid>

    <Grid item xs={12} md={6}>
      <TextField
        fullWidth
        label="Description"
        value={token.description || ""}
        onChange={(e) => onFieldChange("description", e.target.value)}
        helperText="Optional description of the token's purpose"
      />
    </Grid>

    <Grid item xs={12} md={6}>
      <FormControl fullWidth>
        <InputLabel>Role (Optional)</InputLabel>
        <Select
          value={token.roleId || ""}
          label="Role (Optional)"
          onChange={(e) => onFieldChange("roleId", e.target.value)}
        >
          <MuiMenuItem value="">
            <em>No specific role</em>
          </MuiMenuItem>
          {roles.map((role) => (
            <MuiMenuItem key={role.slug} value={role.slug}>
              {role.name}
            </MuiMenuItem>
          ))}
        </Select>
        <FormHelperText>
          Tokens inherit permissions from the selected role
        </FormHelperText>
      </FormControl>
    </Grid>

    <Grid item xs={12} md={6}>
      <FormControl fullWidth>
        <InputLabel>Expiration</InputLabel>
        <Select
          value={token.expiresIn}
          label="Expiration"
          onChange={(e) => onFieldChange("expiresIn", e.target.value)}
        >
          {EXPIRATION_OPTIONS.map((opt) => (
            <MuiMenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MuiMenuItem>
          ))}
        </Select>
        <FormHelperText>When this token will expire</FormHelperText>
      </FormControl>
    </Grid>

    <Grid item xs={12}>
      <Box display="flex" alignItems="center" gap={1} mb={1}>
        <Typography variant="subtitle2">
          Scopes ({token.scopes?.length || 0} selected)
        </Typography>
        <Button
          size="small"
          startIcon={<Security />}
          onClick={onOpenScopeDialog}
        >
          Configure Scopes
        </Button>
      </Box>
      {(token.scopes?.length || 0) > 0 ? (
        <Box display="flex" flexWrap="wrap" gap={0.5}>
          {token.scopes?.map((scope) => {
            const scopeInfo = AVAILABLE_SCOPES.find((s) => s.id === scope);
            return (
              <Chip
                key={scope}
                label={scopeInfo?.label || scope}
                size="small"
                variant="outlined"
                onDelete={() =>
                  onFieldChange(
                    "scopes",
                    token.scopes?.filter((s) => s !== scope) || [],
                  )
                }
              />
            );
          })}
        </Box>
      ) : (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontStyle: "italic" }}
        >
          No scopes configured. Click "Configure Scopes" to add API access
          permissions.
        </Typography>
      )}
    </Grid>

    <Grid item xs={12}>
      <Divider sx={{ my: 2 }} />
    </Grid>

    <Grid item xs={12}>
      <Typography
        variant="subtitle2"
        gutterBottom
        sx={{ display: "flex", alignItems: "center", gap: 1 }}
      >
        <VpnKey fontSize="small" />
        API Token
      </Typography>
      <Paper
        elevation={0}
        sx={{
          p: 2,
          bgcolor: "grey.100",
          borderRadius: 1,
          display: "flex",
          alignItems: "center",
          gap: 1,
          fontFamily: "monospace",
        }}
      >
        <Typography
          variant="body2"
          sx={{ flex: 1, fontFamily: "monospace", wordBreak: "break-all" }}
        >
          {isVisible ? token.token : "•".repeat(48)}
        </Typography>
        <Tooltip title={isVisible ? "Hide token" : "Show token"}>
          <IconButton size="small" onClick={onToggleVisibility}>
            {isVisible ? <VisibilityOff /> : <Visibility />}
          </IconButton>
        </Tooltip>
        <Tooltip title="Copy token">
          <IconButton size="small" onClick={onCopyToken}>
            <ContentCopy />
          </IconButton>
        </Tooltip>
        <Tooltip title="Regenerate token">
          <IconButton size="small" onClick={onRegenerateToken}>
            <Refresh />
          </IconButton>
        </Tooltip>
      </Paper>
      <Typography
        variant="caption"
        color="warning.main"
        sx={{ mt: 1, display: "block" }}
      >
        ⚠️ Store this token securely. It won't be fully visible again after you
        leave this page.
      </Typography>
    </Grid>
  </Grid>
);
