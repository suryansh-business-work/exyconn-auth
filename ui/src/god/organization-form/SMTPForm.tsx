import React, { useState } from "react";
import { useFormikContext, Field, FieldProps } from "formik";
import {
  Grid,
  TextField,
  FormControlLabel,
  Switch,
  Typography,
  Box,
  Fade,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import {
  Email,
  Send as SendIcon,
  NetworkCheck as TestIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { OrganizationFormData } from "./types";
import { API_BASE_URL } from "../../apis";
import {
  postRequest,
  isSuccess,
  extractMessage,
  parseError,
} from "../../lib/api";

interface TestResult {
  success: boolean;
  message: string;
  details?: string;
}

const SMTPForm: React.FC = () => {
  const { values, setFieldValue } = useFormikContext<OrganizationFormData>();
  const [testingConnection, setTestingConnection] = useState(false);
  const [sendingTestMail, setSendingTestMail] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [testEmailDialog, setTestEmailDialog] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState("");
  const [testEmailResult, setTestEmailResult] = useState<TestResult | null>(
    null,
  );

  // Check if SMTP settings are filled
  const isSmtpConfigured = Boolean(
    values.smtpSettings?.host &&
    values.smtpSettings?.port &&
    values.smtpSettings?.user &&
    values.smtpSettings?.pass,
  );

  // Test SMTP Connection
  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);

    try {
      const response = await postRequest(
        `${API_BASE_URL}/god/smtp/test-connection`,
        {
          host: values.smtpSettings?.host,
          port: values.smtpSettings?.port,
          secure: values.smtpSettings?.secure,
          user: values.smtpSettings?.user,
          pass: values.smtpSettings?.pass,
        },
      );

      if (isSuccess(response)) {
        setTestResult({
          success: true,
          message: "Connection successful!",
          details: "SMTP server is reachable and credentials are valid.",
        });
      } else {
        setTestResult({
          success: false,
          message: "Connection failed",
          details:
            extractMessage(response) ||
            "Could not connect to SMTP server. Please check your settings.",
        });
      }
    } catch (error: any) {
      const parsedError = parseError(error);
      setTestResult({
        success: false,
        message: "Connection error",
        details:
          parsedError.message ||
          "An unexpected error occurred while testing the connection.",
      });
    } finally {
      setTestingConnection(false);
    }
  };

  // Send Test Email
  const handleSendTestEmail = async () => {
    if (!testEmailAddress) return;

    setSendingTestMail(true);
    setTestEmailResult(null);

    try {
      const response = await postRequest(
        `${API_BASE_URL}/god/smtp/send-test-email`,
        {
          host: values.smtpSettings?.host,
          port: values.smtpSettings?.port,
          secure: values.smtpSettings?.secure,
          user: values.smtpSettings?.user,
          pass: values.smtpSettings?.pass,
          toEmail: testEmailAddress,
        },
      );

      if (isSuccess(response)) {
        setTestEmailResult({
          success: true,
          message: "Test email sent!",
          details: `A test email has been sent to ${testEmailAddress}. Please check your inbox.`,
        });
      } else {
        setTestEmailResult({
          success: false,
          message: "Failed to send email",
          details:
            extractMessage(response) ||
            "Could not send test email. Please check your SMTP settings.",
        });
      }
    } catch (error: any) {
      const parsedError = parseError(error);
      setTestEmailResult({
        success: false,
        message: "Send error",
        details:
          parsedError.message ||
          "An unexpected error occurred while sending the test email.",
      });
    } finally {
      setSendingTestMail(false);
    }
  };

  return (
    <Fade in timeout={300}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <Email color="primary" />
            <Typography variant="h6">SMTP Configuration</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Configure email server settings for sending transactional emails
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <Field name="smtpSettings.host">
            {({ field, meta }: FieldProps<string>) => (
              <TextField
                {...field}
                fullWidth
                label="SMTP Host"
                placeholder="smtp.gmail.com"
                error={meta.touched && Boolean(meta.error)}
                helperText={
                  meta.touched && meta.error
                    ? meta.error
                    : "SMTP server hostname (e.g., smtp.gmail.com, smtp-mail.outlook.com)"
                }
              />
            )}
          </Field>
        </Grid>

        <Grid item xs={12} md={6}>
          <Field name="smtpSettings.port">
            {({ field, meta }: FieldProps<number>) => (
              <TextField
                {...field}
                fullWidth
                label="SMTP Port"
                type="number"
                placeholder="587"
                error={meta.touched && Boolean(meta.error)}
                helperText={
                  meta.touched && meta.error
                    ? meta.error
                    : "SMTP port (587 for TLS, 465 for SSL, 25 for unencrypted)"
                }
              />
            )}
          </Field>
        </Grid>

        <Grid item xs={12} md={6}>
          <Field name="smtpSettings.user">
            {({ field, meta }: FieldProps<string>) => (
              <TextField
                {...field}
                fullWidth
                label="SMTP Username"
                error={meta.touched && Boolean(meta.error)}
                helperText={
                  meta.touched && meta.error
                    ? meta.error
                    : "Username for SMTP authentication"
                }
              />
            )}
          </Field>
        </Grid>

        <Grid item xs={12} md={6}>
          <Field name="smtpSettings.pass">
            {({ field, meta }: FieldProps<string>) => (
              <TextField
                {...field}
                fullWidth
                label="SMTP Password"
                type="password"
                error={meta.touched && Boolean(meta.error)}
                helperText={
                  meta.touched && meta.error
                    ? meta.error
                    : "Password or app-specific password for SMTP authentication"
                }
              />
            )}
          </Field>
        </Grid>

        <Grid item xs={12}>
          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={values.smtpSettings?.secure ?? false}
                  onChange={(e) =>
                    setFieldValue("smtpSettings.secure", e.target.checked)
                  }
                />
              }
              label="Use SSL/TLS"
            />
            <Typography
              variant="caption"
              display="block"
              color="text.secondary"
            >
              Enable secure connection (recommended for ports 465 and 587)
            </Typography>
          </Box>
        </Grid>

        {/* Test Connection Section */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography
            variant="subtitle1"
            gutterBottom
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <TestIcon color="primary" />
            Test SMTP Configuration
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Verify your SMTP settings are working correctly before saving.
          </Typography>

          <Paper
            elevation={0}
            sx={{
              p: 2,
              bgcolor: "background.default",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
            }}
          >
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Button
                variant="outlined"
                color="primary"
                startIcon={
                  testingConnection ? (
                    <CircularProgress size={20} />
                  ) : (
                    <TestIcon />
                  )
                }
                onClick={handleTestConnection}
                disabled={!isSmtpConfigured || testingConnection}
              >
                {testingConnection ? "Testing..." : "Test Connection"}
              </Button>

              <Button
                variant="contained"
                color="secondary"
                startIcon={<SendIcon />}
                onClick={() => setTestEmailDialog(true)}
                disabled={!isSmtpConfigured}
              >
                Send Test Email
              </Button>
            </Box>

            {!isSmtpConfigured && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                Please fill in all SMTP settings before testing.
              </Alert>
            )}

            {testResult && (
              <Alert
                severity={testResult.success ? "success" : "error"}
                sx={{ mt: 2 }}
                icon={testResult.success ? <SuccessIcon /> : <ErrorIcon />}
              >
                <Typography variant="subtitle2" fontWeight="bold">
                  {testResult.message}
                </Typography>
                {testResult.details && (
                  <Typography variant="body2">{testResult.details}</Typography>
                )}
              </Alert>
            )}
          </Paper>
        </Grid>

        {/* Test Email Dialog */}
        <Dialog
          open={testEmailDialog}
          onClose={() => setTestEmailDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <SendIcon color="primary" />
              Send Test Email
            </Box>
            <IconButton onClick={() => setTestEmailDialog(false)} size="small">
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" paragraph>
              Enter an email address to receive a test email. This will verify
              that your SMTP configuration is working correctly and emails can
              be delivered.
            </Typography>

            <TextField
              fullWidth
              label="Recipient Email Address"
              type="email"
              value={testEmailAddress}
              onChange={(e) => setTestEmailAddress(e.target.value)}
              placeholder="test@example.com"
              sx={{ mb: 2 }}
            />

            {testEmailResult && (
              <Alert
                severity={testEmailResult.success ? "success" : "error"}
                icon={testEmailResult.success ? <SuccessIcon /> : <ErrorIcon />}
              >
                <Typography variant="subtitle2" fontWeight="bold">
                  {testEmailResult.message}
                </Typography>
                {testEmailResult.details && (
                  <Typography variant="body2">
                    {testEmailResult.details}
                  </Typography>
                )}
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setTestEmailDialog(false)}>Cancel</Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSendTestEmail}
              disabled={!testEmailAddress || sendingTestMail}
              startIcon={
                sendingTestMail ? <CircularProgress size={20} /> : <SendIcon />
              }
            >
              {sendingTestMail ? "Sending..." : "Send Test Email"}
            </Button>
          </DialogActions>
        </Dialog>
      </Grid>
    </Fade>
  );
};

export default SMTPForm;
