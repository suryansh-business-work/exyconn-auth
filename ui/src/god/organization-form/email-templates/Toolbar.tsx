import React from "react";
import {
  Box,
  Typography,
  IconButton,
  Button,
  Divider,
  Tooltip,
} from "@mui/material";
import {
  Save,
  FormatAlignLeft,
  Refresh,
  ContentCopy,
  Download,
} from "@mui/icons-material";
import { EmailTemplate } from "./constants";

interface ToolbarProps {
  selectedTemplate: EmailTemplate;
  compiling: boolean;
  onFormat: () => void;
  onCopy: () => void;
  onDownload: () => void;
  onReset: () => void;
  onSave: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  selectedTemplate,
  onFormat,
  onCopy,
  onDownload,
  onReset,
  onSave,
}) => {
  return (
    <Box
      sx={{
        p: 0.75,
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        borderBottom: 1,
        borderColor: "divider",
        backgroundColor: "background.paper",
      }}
    >
      <Typography variant="body2" fontWeight="medium" sx={{ flex: 1 }} noWrap>
        {selectedTemplate.name}
      </Typography>

      <Tooltip title="Format MJML">
        <IconButton size="small" onClick={onFormat}>
          <FormatAlignLeft fontSize="small" />
        </IconButton>
      </Tooltip>

      <Tooltip title="Copy MJML">
        <IconButton size="small" onClick={onCopy}>
          <ContentCopy fontSize="small" />
        </IconButton>
      </Tooltip>

      <Tooltip title="Download MJML">
        <IconButton size="small" onClick={onDownload}>
          <Download fontSize="small" />
        </IconButton>
      </Tooltip>

      <Tooltip title="Reset to Default">
        <IconButton size="small" onClick={onReset}>
          <Refresh fontSize="small" />
        </IconButton>
      </Tooltip>

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

      <Button
        variant="contained"
        size="small"
        startIcon={<Save fontSize="small" />}
        onClick={onSave}
        sx={{ minWidth: 70 }}
      >
        Save
      </Button>
    </Box>
  );
};

export default Toolbar;
