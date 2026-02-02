import React from "react";
import { Formik, Form, Field } from "formik";
import {
  Box,
  TextField,
  Button,
  CircularProgress,
  Typography,
  Link,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { SignupSchema, SignupFormValues } from "../../signup/SignupSchema";
import { PasswordField } from "../../../common/components";
import Policy from "../../../components/Policy";
import { Organization } from "../../../types/organization";

interface MinimalSignupFormProps {
  organization: Organization | null;
  onSubmit: (values: SignupFormValues) => void;
  onGoogleSignup: () => void;
  submitting: boolean;
  hasEnabledOAuth?: boolean;
  buildLink: (path: string) => string;
}

const MinimalSignupForm: React.FC<MinimalSignupFormProps> = ({
  organization,
  onSubmit,
  onGoogleSignup,
  submitting,
  hasEnabledOAuth,
  buildLink,
}) => {
  return (
    <>
      <Formik
        initialValues={{
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          confirmPassword: "",
          role: "user",
        }}
        validationSchema={SignupSchema}
        onSubmit={onSubmit}
      >
        {({ errors, touched }) => (
          <Form>
            <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
              <Field
                as={TextField}
                name="firstName"
                label="First Name"
                fullWidth
                variant="standard"
                error={touched.firstName && !!errors.firstName}
                helperText={touched.firstName && errors.firstName}
              />
              <Field
                as={TextField}
                name="lastName"
                label="Last Name"
                fullWidth
                variant="standard"
                error={touched.lastName && !!errors.lastName}
                helperText={touched.lastName && errors.lastName}
              />
            </Box>

            <Field
              as={TextField}
              name="email"
              label="Email"
              type="email"
              fullWidth
              variant="standard"
              error={touched.email && !!errors.email}
              helperText={touched.email && errors.email}
              sx={{ mb: 3 }}
            />

            <Field
              as={PasswordField}
              name="password"
              label="Password"
              fullWidth
              variant="standard"
              error={touched.password && !!errors.password}
              helperText={touched.password && errors.password}
              sx={{ mb: 3 }}
            />

            <Field
              as={PasswordField}
              name="confirmPassword"
              label="Confirm Password"
              fullWidth
              variant="standard"
              error={touched.confirmPassword && !!errors.confirmPassword}
              helperText={touched.confirmPassword && errors.confirmPassword}
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              variant="text"
              fullWidth
              disabled={submitting}
              sx={{
                mt: 2,
                mb: 2,
                py: 1.5,
                textTransform: "none",
                fontSize: "1rem",
                fontWeight: 600,
                color: organization?.orgTheme?.primaryColor || "primary.main",
                border: "2px solid",
                borderColor:
                  organization?.orgTheme?.primaryColor || "primary.main",
                borderRadius: 0,
                "&:hover": {
                  bgcolor:
                    organization?.orgTheme?.primaryColor || "primary.main",
                  color: "white",
                },
              }}
            >
              {submitting ? (
                <>
                  <CircularProgress
                    size={18}
                    sx={{ mr: 1, color: "inherit" }}
                  />
                  Creating...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </Form>
        )}
      </Formik>

      {/* OAuth Section - Only show if OAuth is enabled */}
      {hasEnabledOAuth && organization?.oauthSettings?.google?.enabled && (
        <>
          <Box sx={{ my: 3, textAlign: "center" }}>
            <Typography variant="caption" color="text.secondary">
              or continue with
            </Typography>
          </Box>

          <Button
            variant="text"
            fullWidth
            onClick={onGoogleSignup}
            sx={{
              py: 1.5,
              textTransform: "none",
              fontSize: "0.9rem",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              color: "text.secondary",
              border: "1px solid",
              borderColor: "grey.300",
              borderRadius: 0,
              "&:hover": {
                borderColor: "grey.500",
                bgcolor: "transparent",
              },
            }}
          >
            <img
              src="/assets/logos/google.svg"
              alt="Google"
              style={{ width: 18, height: 18 }}
            />
            Google
          </Button>
        </>
      )}

      {/* Links */}
      <Box sx={{ mt: 4, textAlign: "center" }}>
        <Link
          component={RouterLink}
          to={buildLink("/")}
          underline="none"
          sx={{
            color: "text.primary",
            fontWeight: 400,
            fontSize: "0.875rem",
            letterSpacing: "0.5px",
            "&:hover": {
              color: organization?.orgTheme?.primaryColor || "primary.main",
            },
          }}
        >
          ← Back to Sign In
        </Link>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Policy />
      </Box>
    </>
  );
};

export default MinimalSignupForm;
