import React from "react";
import { Formik, Form, Field } from "formik";
import {
  Box,
  TextField,
  Button,
  CircularProgress,
  Divider,
  Typography,
  Link,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { SignupSchema, SignupFormValues } from "../../signup/SignupSchema";
import { PasswordField } from "../../../common/components";
import Policy from "../../../components/Policy";
import { Organization } from "../../../types/organization";

interface ClassicSignupFormProps {
  organization: Organization | null;
  onSubmit: (values: SignupFormValues) => void;
  onGoogleSignup: () => void;
  submitting: boolean;
  hasEnabledOAuth?: boolean;
  buildLink: (path: string) => string;
}

const ClassicSignupForm: React.FC<ClassicSignupFormProps> = ({
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
            <Box sx={{ display: "flex", gap: 2 }}>
              <Field
                as={TextField}
                name="firstName"
                label="First Name"
                fullWidth
                error={touched.firstName && !!errors.firstName}
                helperText={touched.firstName && errors.firstName}
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "rgba(255, 255, 255, 0.9)",
                  },
                }}
              />
              <Field
                as={TextField}
                name="lastName"
                label="Last Name"
                fullWidth
                error={touched.lastName && !!errors.lastName}
                helperText={touched.lastName && errors.lastName}
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "rgba(255, 255, 255, 0.9)",
                  },
                }}
              />
            </Box>

            <Field
              as={TextField}
              name="email"
              label="Email"
              type="email"
              fullWidth
              error={touched.email && !!errors.email}
              helperText={touched.email && errors.email}
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  bgcolor: "rgba(255, 255, 255, 0.9)",
                },
              }}
            />

            <Field
              as={PasswordField}
              name="password"
              label="Password"
              fullWidth
              error={touched.password && !!errors.password}
              helperText={touched.password && errors.password}
              sx={{ mb: 2 }}
            />

            <Field
              as={PasswordField}
              name="confirmPassword"
              label="Confirm Password"
              fullWidth
              error={touched.confirmPassword && !!errors.confirmPassword}
              helperText={touched.confirmPassword && errors.confirmPassword}
              sx={{ mb: 2 }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={submitting}
              sx={{
                py: 1.5,
                textTransform: "none",
                fontSize: "1rem",
                fontWeight: 600,
                borderRadius: 1,
                bgcolor: organization?.orgTheme?.primaryColor || "primary.main",
                "&:hover": {
                  bgcolor:
                    organization?.orgTheme?.primaryColor || "primary.dark",
                  filter: "brightness(0.9)",
                },
              }}
            >
              {submitting ? (
                <>
                  <CircularProgress
                    size={20}
                    sx={{ mr: 1, color: "inherit" }}
                  />
                  Creating Account...
                </>
              ) : (
                "Sign Up"
              )}
            </Button>
          </Form>
        )}
      </Formik>

      {/* OAuth Section - Only show if OAuth is enabled */}
      {hasEnabledOAuth && organization?.oauthSettings?.google?.enabled && (
        <>
          <Divider sx={{ my: 2 }}>
            <Typography variant="body2" color="text.secondary">
              OR
            </Typography>
          </Divider>

          <Button
            variant="outlined"
            fullWidth
            size="large"
            onClick={onGoogleSignup}
            sx={{
              py: 1.5,
              textTransform: "none",
              fontSize: "1rem",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              borderRadius: 1,
              bgcolor: "white",
              borderColor: "grey.300",
              color: "text.primary",
              "&:hover": {
                bgcolor: "grey.50",
                borderColor: "grey.400",
              },
            }}
          >
            <img
              src="/assets/logos/google.svg"
              alt="Google"
              style={{ width: 20, height: 20 }}
            />
            Continue with Google
          </Button>
        </>
      )}

      {/* Links */}
      <Box sx={{ mt: 3, textAlign: "center" }}>
        <Link
          component={RouterLink}
          to={buildLink("/")}
          underline="hover"
          sx={{
            color: "primary.main",
            fontWeight: 500,
            fontSize: "0.9rem",
          }}
        >
          Already have an account? Sign In
        </Link>
      </Box>

      <Box sx={{ mt: 3 }}>
        <Policy />
      </Box>
    </>
  );
};

export default ClassicSignupForm;
