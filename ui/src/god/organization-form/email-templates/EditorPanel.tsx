import React from "react";
import {
  Box,
  CircularProgress,
  Typography,
  Paper,
  Button,
} from "@mui/material";
import { ContentCopy, Email } from "@mui/icons-material";
import Editor from "@monaco-editor/react";

interface EditorPanelProps {
  activeTab: number;
  loading: boolean;
  compiling?: boolean;
  mjmlContent: string;
  htmlPreview: string;
  onMjmlChange: (value: string) => void;
  onCopyHtml: () => void;
}

const EditorPanel: React.FC<EditorPanelProps> = ({
  activeTab,
  loading,
  compiling,
  mjmlContent,
  htmlPreview,
  onMjmlChange,
  onCopyHtml,
}) => {
  if (activeTab === 0) {
    // MJML Editor
    if (loading) {
      return (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            gap: 1,
          }}
        >
          <CircularProgress />
          <Typography variant="caption" color="text.secondary">
            Loading template...
          </Typography>
        </Box>
      );
    }

    return (
      <Editor
        height="100%"
        language="xml"
        theme="vs-dark"
        value={mjmlContent}
        onChange={(value) => onMjmlChange(value || "")}
        options={{
          minimap: { enabled: false },
          fontSize: 13,
          lineNumbers: "on",
          wordWrap: "on",
          automaticLayout: true,
          tabSize: 2,
          scrollBeyondLastLine: false,
        }}
      />
    );
  }

  // HTML Preview Tab
  if (loading || (compiling && !htmlPreview)) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          gap: 1,
        }}
      >
        <CircularProgress />
        <Typography variant="caption" color="text.secondary">
          Compiling preview...
        </Typography>
      </Box>
    );
  }

  if (htmlPreview) {
    return (
      <Box
        sx={{ height: "100%", overflow: "auto", backgroundColor: "#f5f5f5" }}
      >
        <Box
          sx={{
            p: 0.5,
            display: "flex",
            gap: 1,
            borderBottom: 1,
            borderColor: "divider",
            backgroundColor: "white",
          }}
        >
          <Button
            size="small"
            startIcon={<ContentCopy fontSize="small" />}
            onClick={onCopyHtml}
          >
            Copy HTML
          </Button>
        </Box>
        <Box sx={{ p: 1, display: "flex", justifyContent: "center" }}>
          <Paper
            elevation={2}
            sx={{ maxWidth: 600, width: "100%", overflow: "hidden" }}
          >
            <iframe
              srcDoc={htmlPreview}
              style={{ width: "100%", height: "450px", border: "none" }}
              title="Email Preview"
            />
          </Paper>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        color: "text.secondary",
      }}
    >
      <Email sx={{ fontSize: 40, mb: 1, opacity: 0.5 }} />
      <Typography variant="body2">
        Preview will appear here automatically
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
        Make changes in the Editor tab to see live preview
      </Typography>
    </Box>
  );
};

export default EditorPanel;
