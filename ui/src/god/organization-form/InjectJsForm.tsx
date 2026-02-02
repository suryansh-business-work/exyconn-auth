import React from "react";
import { useFormikContext } from "formik";
import { Grid, Typography, Box, Fade, Alert } from "@mui/material";
import { Javascript } from "@mui/icons-material";
import { OrganizationFormData } from "./types";
import Editor from "@monaco-editor/react";

const InjectJsForm: React.FC = () => {
  const { values, setFieldValue, errors, touched, setFieldTouched } =
    useFormikContext<OrganizationFormData>();

  const handleEditorChange = (value: string | undefined) => {
    setFieldValue("customJs", value || "");
    // Mark as touched when user starts editing
    if (value && value.length > 0) {
      setFieldTouched("customJs", true);
    }
  };

  return (
    <Fade in timeout={300}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <Javascript color="primary" />
            <Typography variant="h6">Inject JavaScript</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Add custom JavaScript code to your authentication pages for
            analytics, tracking, or custom behaviors. Enhance your pages with
            dynamic functionality.
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Alert severity="info" sx={{ mb: 2 }}>
            JavaScript code will be executed on the authentication pages. Ensure
            your code is properly tested and doesn't conflict with existing
            functionality.
          </Alert>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            JavaScript Code Editor
          </Typography>
          <Box
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              overflow: "hidden",
            }}
          >
            <Editor
              height="500px"
              defaultLanguage="javascript"
              value={
                values.customJs ||
                '// Add your custom JavaScript here\nconsole.log("Custom JS loaded");'
              }
              onChange={handleEditorChange}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
              }}
            />
          </Box>
        </Grid>

        {touched.customJs && errors.customJs && (
          <Grid item xs={12}>
            <Typography variant="caption" color="error">
              {errors.customJs}
            </Typography>
          </Grid>
        )}

        <Grid item xs={12}>
          <Alert severity="warning">
            ⚠️ Make sure your JavaScript code is safe and tested. Avoid blocking
            operations and ensure compatibility with modern browsers.
          </Alert>
        </Grid>
      </Grid>
    </Fade>
  );
};

export default InjectJsForm;
