import React, { useState, useCallback, useEffect } from "react";
import { useFormikContext } from "formik";
import {
  Box,
  Tab,
  Tabs,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Code, Preview } from "@mui/icons-material";
import { OrganizationFormData } from "./types";
import { API_BASE_URL } from "../../apis";
import {
  TemplateList,
  VariablesPanel,
  Toolbar,
  EditorPanel,
  EMAIL_TEMPLATES,
  DEFAULT_MJML_TEMPLATE,
  EmailTemplate,
} from "./email-templates";

const EmailTemplatesForm: React.FC = () => {
  const { values, setFieldValue } = useFormikContext<OrganizationFormData>();
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate>(
    EMAIL_TEMPLATES[0],
  );
  const [mjmlContent, setMjmlContent] = useState<string>(DEFAULT_MJML_TEMPLATE);
  const [htmlPreview, setHtmlPreview] = useState<string>("");
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [compiling, setCompiling] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  // Get current variable values for preview
  const variableValues = {
    companyName: values.orgName || "Company Name",
    firstName: "John",
    otp: "123456",
    logoUrl: values.orgLogos?.[0]?.url || "",
    logoWidth: "120px",
    primaryColor: values.orgTheme?.primaryColor || "#2563eb",
    backgroundColor: "#f4f4f4",
    year: new Date().getFullYear().toString(),
    supportEmail: values.orgEmail || "support@example.com",
    expiryMinutes: "15",
    loginUrl: values.orgWebsite || "https://example.com/login",
    resetLink: "https://example.com/reset?token=xxx",
    verificationLink: "https://example.com/verify?token=xxx",
    reason: "Multiple failed login attempts",
    deviceInfo: "Chrome on Windows",
    location: "New York, USA",
    time: new Date().toLocaleString(),
    email: "user@example.com",
    password: "TempPassword123",
    supportUrl: values.orgWebsite || "https://example.com/support",
  };

  // Load template content and compile when selection changes
  useEffect(() => {
    loadTemplateContent(selectedTemplate.fileName);
  }, [selectedTemplate]);

  // Auto-compile when content changes (with debounce)
  useEffect(() => {
    if (mjmlContent && !loading) {
      const timer = setTimeout(() => {
        compilePreview();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [mjmlContent]);

  const loadTemplateContent = async (fileName: string) => {
    setLoading(true);
    setHtmlPreview("");
    try {
      const customTemplates = values.emailTemplates || {};
      if (customTemplates[selectedTemplate.id]) {
        setMjmlContent(customTemplates[selectedTemplate.id]);
      } else {
        const godToken = localStorage.getItem("godToken");
        if (!godToken) {
          setMjmlContent(DEFAULT_MJML_TEMPLATE);
          return;
        }
        const response = await fetch(
          `${API_BASE_URL}/god/templates/${fileName}`,
          {
            headers: {
              Authorization: `Bearer ${godToken}`,
            },
          },
        );
        if (!response.ok) {
          setMjmlContent(DEFAULT_MJML_TEMPLATE);
          return;
        }
        const data = await response.json();
        setMjmlContent(data?.data?.content || DEFAULT_MJML_TEMPLATE);
      }
    } catch (error) {
      setMjmlContent(DEFAULT_MJML_TEMPLATE);
    } finally {
      setLoading(false);
    }
  };

  const compilePreview = async () => {
    if (!mjmlContent) return;
    const godToken = localStorage.getItem("godToken");
    if (!godToken) return;

    setCompiling(true);
    try {
      const response = await fetch(`${API_BASE_URL}/god/templates/compile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${godToken}`,
        },
        body: JSON.stringify({
          mjml: mjmlContent,
          variables: variableValues,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data?.data?.html) {
          setHtmlPreview(data.data.html);
        }
      }
    } catch (error) {
      // Silent fail for auto-compile
    } finally {
      setCompiling(false);
    }
  };

  const formatMjml = useCallback(() => {
    try {
      let formatted = mjmlContent.replace(/>\s*</g, ">\n<");
      const indent = "  ";
      let depth = 0;
      formatted = formatted
        .split("\n")
        .map((line) => {
          const trimmed = line.trim();
          if (trimmed.match(/^<\/\w/)) depth--;
          const indented = indent.repeat(Math.max(0, depth)) + trimmed;
          if (trimmed.match(/^<\w[^>]*[^/]>.*$/)) depth++;
          return indented;
        })
        .join("\n");
      setMjmlContent(formatted);
      showSnackbar("MJML formatted", "success");
    } catch {
      showSnackbar("Failed to format MJML", "error");
    }
  }, [mjmlContent]);

  const saveTemplate = useCallback(() => {
    const currentTemplates = values.emailTemplates || {};
    setFieldValue("emailTemplates", {
      ...currentTemplates,
      [selectedTemplate.id]: mjmlContent,
    });
    showSnackbar("Template saved to form", "success");
  }, [mjmlContent, selectedTemplate, values.emailTemplates, setFieldValue]);

  const copyToClipboard = useCallback(async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      showSnackbar("Copied to clipboard", "success");
    } catch {
      showSnackbar("Failed to copy", "error");
    }
  }, []);

  const downloadTemplate = useCallback(() => {
    const blob = new Blob([mjmlContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedTemplate.fileName}.mjml`;
    a.click();
    URL.revokeObjectURL(url);
  }, [mjmlContent, selectedTemplate]);

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  return (
    <Box
      sx={{
        display: "flex",
        height: "calc(100vh - 220px)",
        minHeight: "500px",
      }}
    >
      <TemplateList
        templates={EMAIL_TEMPLATES}
        selectedTemplate={selectedTemplate}
        onSelectTemplate={setSelectedTemplate}
      />

      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Toolbar
          selectedTemplate={selectedTemplate}
          compiling={compiling}
          onFormat={formatMjml}
          onCopy={() => copyToClipboard(mjmlContent)}
          onDownload={downloadTemplate}
          onReset={() => loadTemplateContent(selectedTemplate.fileName)}
          onSave={saveTemplate}
        />

        <Box
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            sx={{ minHeight: 36, flex: 1 }}
          >
            <Tab
              label="Editor"
              icon={<Code fontSize="small" />}
              iconPosition="start"
              sx={{ minHeight: 36, py: 0 }}
            />
            <Tab
              label="Preview"
              icon={<Preview fontSize="small" />}
              iconPosition="start"
              sx={{ minHeight: 36, py: 0 }}
            />
          </Tabs>
          {compiling && <CircularProgress size={16} sx={{ mr: 2 }} />}
        </Box>

        <Box sx={{ flex: 1, overflow: "hidden" }}>
          <EditorPanel
            activeTab={activeTab}
            loading={loading}
            compiling={compiling}
            mjmlContent={mjmlContent}
            htmlPreview={htmlPreview}
            onMjmlChange={setMjmlContent}
            onCopyHtml={() => copyToClipboard(htmlPreview)}
          />
        </Box>
      </Box>

      <VariablesPanel
        selectedTemplate={selectedTemplate}
        onCopyVariable={copyToClipboard}
        variableValues={variableValues}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EmailTemplatesForm;
