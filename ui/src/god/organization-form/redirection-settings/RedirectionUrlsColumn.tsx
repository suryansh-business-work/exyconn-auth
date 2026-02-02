import React from "react";
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Button,
  Tooltip,
  Chip,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { Add, Delete, Star, StarBorder } from "@mui/icons-material";
import { RedirectionUrl } from "../types";

interface RedirectionUrlsColumnProps {
  index: number;
  redirectionUrls: RedirectionUrl[];
  touched: boolean;
  errors: Array<{ url?: string; isDefault?: string }> | string;
  onChange: (urls: RedirectionUrl[]) => void;
  onBlur: () => void;
}

const RedirectionUrlsColumn: React.FC<RedirectionUrlsColumnProps> = ({
  redirectionUrls,
  touched,
  errors,
  onChange,
  onBlur,
}) => {
  const handleAddUrl = () => {
    onChange([
      ...redirectionUrls,
      { url: "", isDefault: redirectionUrls.length === 0 },
    ]);
  };

  const handleRemoveUrl = (urlIndex: number) => {
    const newUrls = redirectionUrls.filter((_, i) => i !== urlIndex);
    // If we removed the default, make the first one default
    if (newUrls.length > 0 && !newUrls.some((u) => u.isDefault)) {
      newUrls[0].isDefault = true;
    }
    onChange(newUrls);
  };

  const handleUrlChange = (urlIndex: number, value: string) => {
    const newUrls = [...redirectionUrls];
    newUrls[urlIndex] = { ...newUrls[urlIndex], url: value };
    onChange(newUrls);
  };

  const handleSetDefault = (urlIndex: number) => {
    const newUrls = redirectionUrls.map((url, i) => ({
      ...url,
      isDefault: i === urlIndex,
    }));
    onChange(newUrls);
  };

  const getUrlError = (urlIndex: number): string | undefined => {
    if (typeof errors === "string") return undefined;
    if (Array.isArray(errors) && errors[urlIndex]) {
      return errors[urlIndex].url;
    }
    return undefined;
  };

  return (
    <Box>
      <Typography
        variant="subtitle2"
        fontWeight="bold"
        sx={{ mb: 2, color: "primary.main" }}
      >
        Redirection URLs
      </Typography>

      {redirectionUrls.length === 0 ? (
        <Box
          sx={{
            p: 3,
            textAlign: "center",
            border: "2px dashed",
            borderColor: "divider",
            borderRadius: 1,
            bgcolor: "action.hover",
            mb: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary" gutterBottom>
            No redirection URLs configured
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Add />}
            onClick={handleAddUrl}
          >
            Add URL
          </Button>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {redirectionUrls.map((urlItem, urlIndex) => (
            <Box
              key={urlIndex}
              sx={{
                p: 2,
                border: "1px solid",
                borderColor: urlItem.isDefault ? "primary.main" : "divider",
                borderRadius: 1,
                bgcolor: urlItem.isDefault
                  ? "primary.lighter"
                  : "background.paper",
                position: "relative",
              }}
            >
              {urlItem.isDefault && (
                <Chip
                  label="Default"
                  size="small"
                  color="primary"
                  sx={{
                    position: "absolute",
                    top: -10,
                    right: 10,
                  }}
                />
              )}

              <Grid container spacing={1} alignItems="center">
                <Grid item xs={10}>
                  <TextField
                    fullWidth
                    size="small"
                    label={`URL ${urlIndex + 1}`}
                    value={urlItem.url}
                    onChange={(e) => handleUrlChange(urlIndex, e.target.value)}
                    onBlur={onBlur}
                    error={touched && !!getUrlError(urlIndex)}
                    helperText={touched && getUrlError(urlIndex)}
                    placeholder="https://app.example.com"
                  />
                </Grid>
                <Grid item xs={2}>
                  <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                    <Tooltip
                      title={
                        urlItem.isDefault ? "Default URL" : "Set as Default"
                      }
                    >
                      <IconButton
                        size="small"
                        color={urlItem.isDefault ? "primary" : "default"}
                        onClick={() => handleSetDefault(urlIndex)}
                      >
                        {urlItem.isDefault ? <Star /> : <StarBorder />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Remove URL">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleRemoveUrl(urlIndex)}
                        disabled={redirectionUrls.length === 1}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          ))}
        </Box>
      )}

      {redirectionUrls.length > 0 && (
        <Button
          variant="text"
          size="small"
          startIcon={<Add />}
          onClick={handleAddUrl}
          sx={{ mt: 1 }}
        >
          Add Another URL
        </Button>
      )}

      {/* Info Message */}
      <Box
        sx={{
          mt: 2,
          p: 1.5,
          bgcolor: "info.lighter",
          borderRadius: 1,
          border: "1px solid",
          borderColor: "info.light",
        }}
      >
        <Typography variant="caption" color="info.dark">
          <strong>Note:</strong> After successful login, the authentication
          token will be securely appended to the redirection URL (e.g.,
          ?token=xxx).
        </Typography>
      </Box>
    </Box>
  );
};

export default RedirectionUrlsColumn;
