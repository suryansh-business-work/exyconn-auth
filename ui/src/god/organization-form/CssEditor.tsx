import React from "react";
import { Box, Typography } from "@mui/material";
import Editor from "@monaco-editor/react";

interface CssEditorProps {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  helperText?: string;
}

const CssEditor: React.FC<CssEditorProps> = ({
  value,
  onChange,
  error,
  helperText,
}) => {
  const handleEditorChange = (newValue: string | undefined) => {
    onChange(newValue || "");
  };

  return (
    <Box>
      <Typography variant="body2" fontWeight={500} mb={1}>
        Custom CSS
      </Typography>
      <Box
        sx={{
          height: 300,
          border: error ? "1px solid" : "1px solid",
          borderColor: error ? "error.main" : "divider",
          borderRadius: 1,
          overflow: "hidden",
          "&:hover": {
            borderColor: error ? "error.main" : "primary.main",
          },
        }}
      >
        <Editor
          height="100%"
          language="css"
          theme="vs-dark"
          value={value || ""}
          onChange={handleEditorChange}
          options={{
            automaticLayout: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 14,
            lineNumbers: "on",
            roundedSelection: true,
            padding: { top: 8, bottom: 8 },
            folding: true,
            renderLineHighlight: "all",
            tabSize: 2,
          }}
        />
      </Box>
      {helperText && (
        <Typography
          variant="caption"
          color={error ? "error" : "text.secondary"}
          display="block"
          mt={0.5}
        >
          {helperText}
        </Typography>
      )}
    </Box>
  );
};

export default CssEditor;
