import React from "react";
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
import { ForgotPasswordSchema } from "./ForgotPasswordSchema";
import Policy from "../../components/Policy";
import { Organization } from "../../types/organization";

interface ForgotPasswordFormProps {
  organization: Organization | null;
  onSubmit: (values: { email: string }) => void;
  submitting: boolean;
  buildLink: (path: string) => string;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onSubmit,
  submitting,
  buildLink,
}) => {
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
        Forgot Password
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
        Enter your email to receive a reset OTP
      </Typography>

      <Formik
        initialValues={{ email: "" }}
        validationSchema={ForgotPasswordSchema}
        onSubmit={onSubmit}
      >
        {({ errors, touched }) => (
          <Form>
            <Field
              as={TextField}
              name="email"
              label="Email"
              type="email"
              fullWidth
              size="small"
              error={touched.email && !!errors.email}
              helperText={touched.email && errors.email}
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
                  Sending OTP...
                </>
              ) : (
                "Send Reset OTP"
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

export default ForgotPasswordForm;
