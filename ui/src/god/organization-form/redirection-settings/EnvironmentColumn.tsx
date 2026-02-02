import React from "react";
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from "@mui/material";
import Grid from "@mui/material/Grid";

interface EnvironmentColumnProps {
  index: number;
  env: string;
  description: string;
  authPageUrl: string;
  touched: boolean;
  errors: {
    env?: string;
    description?: string;
    authPageUrl?: string;
  };
  onChange: (field: string, value: string) => void;
  onBlur: (field: string) => void;
}

const EnvironmentColumn: React.FC<EnvironmentColumnProps> = ({
  index,
  env,
  description,
  authPageUrl,
  touched,
  errors,
  onChange,
  onBlur,
}) => {
  return (
    <Box>
      <Typography
        variant="subtitle2"
        fontWeight="bold"
        sx={{ mb: 2, color: "primary.main" }}
      >
        Environment Configuration
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <FormControl fullWidth error={touched && !!errors.env}>
            <InputLabel id={`env-label-${index}`}>Environment *</InputLabel>
            <Select
              labelId={`env-label-${index}`}
              label="Environment *"
              value={env || ""}
              onChange={(e) => onChange("env", e.target.value)}
              onBlur={() => onBlur("env")}
            >
              <MenuItem value="development">Development</MenuItem>
              <MenuItem value="staging">Staging</MenuItem>
              <MenuItem value="production">Production</MenuItem>
            </Select>
            {touched && errors.env && (
              <FormHelperText error>{errors.env}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Description"
            value={description || ""}
            onChange={(e) => onChange("description", e.target.value)}
            onBlur={() => onBlur("description")}
            placeholder="e.g., Local development environment"
            helperText="Optional - Brief description of this environment"
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            required
            label="Auth Page URL"
            value={authPageUrl || ""}
            onChange={(e) => onChange("authPageUrl", e.target.value)}
            onBlur={() => onBlur("authPageUrl")}
            error={touched && !!errors.authPageUrl}
            helperText={
              touched && errors.authPageUrl
                ? errors.authPageUrl
                : "e.g., auth.example.com or localhost:3000"
            }
            placeholder="auth.example.com"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default EnvironmentColumn;
