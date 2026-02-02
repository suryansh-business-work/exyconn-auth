import React from "react";
import { useFormikContext } from "formik";
import { Box, Typography, Paper } from "@mui/material";
import Editor from "@monaco-editor/react";
import { OrganizationFormData } from "./types";

const CustomCssForm: React.FC = () => {
  const { values, setFieldValue, errors, touched, setFieldTouched } =
    useFormikContext<OrganizationFormData>();

  const handleEditorChange = (value: string | undefined) => {
    setFieldValue("customCss", value || "");
    // Mark as touched when user starts editing
    if (value && value.length > 0) {
      setFieldTouched("customCss", true);
    }
  };

  const hasError = touched.customCss && Boolean(errors.customCss);
  const errorMessage = touched.customCss ? errors.customCss : undefined;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Custom CSS
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Add custom CSS styles to customize the appearance of your application.
        This CSS will be applied globally across all pages.
      </Typography>

      <Paper
        elevation={2}
        sx={{
          overflow: "hidden",
          border: 1,
          borderColor: "divider",
          borderRadius: 1,
        }}
      >
        <Editor
          height="500px"
          defaultLanguage="css"
          value={values.customCss || ""}
          onChange={handleEditorChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: true },
            fontSize: 14,
            lineNumbers: "on",
            roundedSelection: true,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: "on",
          }}
        />
      </Paper>
      {hasError && (
        <Typography
          variant="caption"
          color="error"
          sx={{ mt: 1, display: "block" }}
        >
          {errorMessage}
        </Typography>
      )}
    </Box>
  );
};

export default CustomCssForm;
