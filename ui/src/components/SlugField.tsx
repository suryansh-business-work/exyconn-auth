import React from "react";
import { TextField, InputAdornment, IconButton, Tooltip } from "@mui/material";
import { ContentCopy } from "@mui/icons-material";
import { useSnackbar } from "../contexts/SnackbarContext";
import { copyToClipboard } from "@exyconn/common/client/utils";

interface SlugFieldProps {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  helperText?: string;
  error?: boolean;
  fullWidth?: boolean;
  required?: boolean;
}

const SlugField: React.FC<SlugFieldProps> = ({
  label,
  value,
  onChange,
  disabled = false,
  helperText,
  error = false,
  fullWidth = true,
  required = false,
}) => {
  const { showSnackbar } = useSnackbar();

  const handleCopy = async () => {
    if (!value) {
      showSnackbar("No slug to copy", "warning");
      return;
    }

    const success = await copyToClipboard(value);
    if (success) {
      showSnackbar("Slug copied to clipboard!", "success");
    } else {
      showSnackbar("Failed to copy slug", "error");
    }
  };

  return (
    <TextField
      label={label}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      disabled={disabled}
      helperText={helperText}
      error={error}
      required={required}
      fullWidth={fullWidth}
      InputProps={{
        endAdornment: value && (
          <InputAdornment position="end">
            <Tooltip title="Copy slug">
              <span>
                <IconButton
                  onClick={handleCopy}
                  edge="end"
                  size="small"
                  disabled={disabled}
                >
                  <ContentCopy fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </InputAdornment>
        ),
      }}
    />
  );
};

export default SlugField;
