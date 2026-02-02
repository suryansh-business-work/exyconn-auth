import React from "react";
import { useFormikContext } from "formik";
import { Grid, Typography, Box, Fade, Alert } from "@mui/material";
import { Html } from "@mui/icons-material";
import { OrganizationFormData } from "./types";
import Editor from "@monaco-editor/react";

const InjectHtmlForm: React.FC = () => {
  const { values, setFieldValue, errors, touched, setFieldTouched } =
    useFormikContext<OrganizationFormData>();

  const handleEditorChange = (value: string | undefined) => {
    setFieldValue("customHtml", value || "");
    // Mark as touched when user starts editing
    if (value && value.length > 0) {
      setFieldTouched("customHtml", true);
    }
  };

  return (
    <Fade in timeout={300}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <Html color="primary" />
            <Typography variant="h6">Inject HTML</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Inject custom HTML code into your authentication pages. Use this for
            adding tracking pixels, custom elements, or third-party widgets.
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Alert severity="info" sx={{ mb: 2 }}>
            HTML code will be injected into the authentication pages. Ensure
            your code is properly formatted and tested before deployment.
          </Alert>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            HTML Code Editor
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
              defaultLanguage="html"
              value={values.customHtml || "<!-- Add your custom HTML here -->"}
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

        {touched.customHtml && errors.customHtml && (
          <Grid item xs={12}>
            <Typography variant="caption" color="error">
              {errors.customHtml}
            </Typography>
          </Grid>
        )}

        <Grid item xs={12}>
          <Alert severity="warning">
            ⚠️ Make sure your HTML code is safe and doesn't contain any
            malicious scripts. Test thoroughly before enabling in production.
          </Alert>
        </Grid>
      </Grid>
    </Fade>
  );
};

export default InjectHtmlForm;
