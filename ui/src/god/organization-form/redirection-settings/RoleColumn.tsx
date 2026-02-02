import React from "react";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Chip,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { Role } from "../types";

interface RoleColumnProps {
  index: number;
  roleSlug: string;
  roles: Role[];
  touched: boolean;
  errors: {
    roleSlug?: string;
  };
  onChange: (field: string, value: string) => void;
  onBlur: (field: string) => void;
}

const RoleColumn: React.FC<RoleColumnProps> = ({
  index,
  roleSlug,
  roles,
  touched,
  errors,
  onChange,
  onBlur,
}) => {
  const selectedRole = roles.find((r) => r.slug === roleSlug);

  return (
    <Box>
      <Typography
        variant="subtitle2"
        fontWeight="bold"
        sx={{ mb: 2, color: "primary.main" }}
      >
        Role Configuration
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <FormControl fullWidth error={touched && !!errors.roleSlug}>
            <InputLabel id={`role-label-${index}`}>Role *</InputLabel>
            <Select
              labelId={`role-label-${index}`}
              label="Role *"
              value={roleSlug || "any"}
              onChange={(e) => onChange("roleSlug", e.target.value)}
              onBlur={() => onBlur("roleSlug")}
            >
              <MenuItem value="any">
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography>Any Role</Typography>
                  <Chip
                    label="Default"
                    size="small"
                    color="info"
                    variant="outlined"
                  />
                </Box>
              </MenuItem>
              {roles.map((role) => (
                <MenuItem key={role.slug} value={role.slug}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography>{role.name}</Typography>
                    {role.isDefault && (
                      <Chip
                        label="Default Role"
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    )}
                    {role.isSystem && (
                      <Chip label="System" size="small" variant="outlined" />
                    )}
                  </Box>
                </MenuItem>
              ))}
            </Select>
            {touched && errors.roleSlug && (
              <FormHelperText error>{errors.roleSlug}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        {/* Role Info */}
        <Grid item xs={12}>
          <Box
            sx={{
              p: 2,
              bgcolor: "action.hover",
              borderRadius: 1,
              border: "1px dashed",
              borderColor: "divider",
            }}
          >
            {roleSlug === "any" ? (
              <>
                <Typography variant="body2" fontWeight="medium">
                  Any Role Selected
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  This redirection applies to all roles. Specific role settings
                  take higher priority during redirection resolution.
                </Typography>
              </>
            ) : selectedRole ? (
              <>
                <Typography variant="body2" fontWeight="medium">
                  {selectedRole.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {selectedRole.description || "No description available"}
                </Typography>
              </>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Select a role to see details
              </Typography>
            )}
          </Box>
        </Grid>

        {/* Priority Info */}
        <Grid item xs={12}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: 1 }}
          >
            <strong>Priority:</strong> Specific Role &gt; Any Role. If a user
            has multiple roles, the specific role configuration takes
            precedence.
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RoleColumn;
