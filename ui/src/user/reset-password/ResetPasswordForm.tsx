import React, { useState, useEffect, useMemo } from "react";
import { Formik, Form, Field } from "formik";
import {
  TextField,
  Button,
  Box,
  CircularProgress,
  Link,
  Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { createResetPasswordSchema } from "./ResetPasswordSchema";
import { PasswordField } from "../../common/components";
import Policy from "../../components/Policy";
import { PasswordPolicy } from "../signup/SignupSchema";

interface ResetPasswordFormProps {
  onSubmit: (values: {
    email: string;
    otp: string;
    newPassword: string;
  }) => void;
  submitting: boolean;
  resending: boolean;
  buildLink: (path: string) => string;
  storedEmail: string;
  onResendOTP: (email: string) => void;
  passwordPolicy?: PasswordPolicy;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  onSubmit,
  submitting,
  resending,
  buildLink,
  storedEmail,
  onResendOTP,
  passwordPolicy,
}) => {
  const [countdown, setCountdown] = useState(0);

  // Create dynamic schema based on org's password policy
  const validationSchema = useMemo(
    () => createResetPasswordSchema(passwordPolicy),
    [passwordPolicy],
  );

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResendClick = (email: string) => {
    if (countdown === 0 && email) {
      onResendOTP(email);
      setCountdown(60); // 60 seconds cooldown
    }
  };

  return (
    <Box>
      <Typography
        variant="h5"
        sx={{
          textAlign: "center",
          fontWeight: 700,
          mb: 0.5,
          fontSize: "1.5rem",
        }}
      >
        Reset Password
      </Typography>

      <Typography
        variant="body2"
        sx={{
          textAlign: "center",
          color: "text.secondary",
          mb: 3,
          fontSize: "0.875rem",
        }}
      >
        {storedEmail
          ? `Enter the OTP sent to ${storedEmail}`
          : "Enter the OTP sent to your email"}
      </Typography>

      <Formik
        initialValues={{
          email: storedEmail || "",
          otp: "",
          newPassword: "",
          hasStoredEmail: !!storedEmail,
        }}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        {({ errors, touched, values }) => (
          <Form>
            {storedEmail ? (
              <Box sx={{ mb: 1.5 }}>
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary", mb: 0.5, display: "block" }}
                >
                  Email Address
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 500,
                    color: "text.primary",
                    py: 1,
                    px: 1.5,
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 1,
                    bgcolor: "action.hover",
                    fontSize: "0.875rem",
                  }}
                >
                  {storedEmail}
                </Typography>
              </Box>
            ) : (
              <Field
                as={TextField}
                name="email"
                label="Email"
                type="email"
                fullWidth
                size="small"
                disabled
                error={touched.email && !!errors.email}
                helperText={touched.email && errors.email}
                sx={{ mb: 1.5 }}
              />
            )}
            <Field
              as={TextField}
              name="otp"
              label="OTP"
              fullWidth
              size="small"
              error={touched.otp && !!errors.otp}
              helperText={touched.otp && errors.otp}
              sx={{ mb: 1.5 }}
            />
            <Field
              as={PasswordField}
              name="newPassword"
              label="New Password"
              fullWidth
              size="small"
              error={touched.newPassword && !!errors.newPassword}
              helperText={touched.newPassword && errors.newPassword}
              sx={{ mb: 1.5 }}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={submitting}
              sx={{
                mt: 0.5,
                py: 1.25,
                textTransform: "none",
                fontSize: "0.9375rem",
                fontWeight: 600,
                borderRadius: 1.5,
                boxShadow: "none",
                "&:hover": {
                  boxShadow: "none",
                },
              }}
            >
              {submitting ? (
                <>
                  <CircularProgress
                    size={18}
                    sx={{ mr: 1, color: "inherit" }}
                  />
                  Resetting...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>

            <Button
              type="button"
              variant="text"
              fullWidth
              disabled={countdown > 0 || resending || !values.email}
              onClick={() => handleResendClick(values.email)}
              sx={{
                mt: 1.5,
                py: 1,
                textTransform: "none",
                fontSize: "0.875rem",
                fontWeight: 500,
              }}
            >
              {resending ? (
                <>
                  <CircularProgress
                    size={16}
                    sx={{ mr: 1, color: "inherit" }}
                  />
                  Sending...
                </>
              ) : countdown > 0 ? (
                `Resend OTP (${countdown}s)`
              ) : (
                "Resend OTP"
              )}
            </Button>
          </Form>
        )}
      </Formik>

      <Box sx={{ mt: 2.5, textAlign: "center" }}>
        <Link
          component={RouterLink}
          to={buildLink("/")}
          underline="none"
          sx={{
            color: "primary.main",
            fontWeight: 500,
            fontSize: "0.875rem",
            "&:hover": { color: "primary.dark" },
          }}
        >
          Back to Login
        </Link>
      </Box>

      <Box sx={{ mt: 2.5 }}>
        <Policy />
      </Box>
    </Box>
  );
};

export default ResetPasswordForm;
