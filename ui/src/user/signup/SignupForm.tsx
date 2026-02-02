import React, { useMemo } from "react";
import { Formik, Form, Field } from "formik";
import {
  Box,
  TextField,
  Button,
  Divider,
  Typography,
  Link,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import {
  createSignupSchema,
  SignupFormValues,
  PasswordPolicy,
} from "./SignupSchema";
import { PasswordField } from "../../common/components";
import Policy from "../../components/Policy";
import { SignupRole } from "./useSignupLogic";

interface SignupFormProps {
  onSubmit: (values: SignupFormValues) => void;
  onGoogleSignup: () => void;
  submitting: boolean;
  buildLink: (path: string) => string;
  hasEnabledOAuth?: boolean;
  passwordPolicy?: PasswordPolicy;
  signupRoles?: SignupRole[];
  selectedRole: string;
  onRoleChange: (role: string) => void;
}

const SignupForm: React.FC<SignupFormProps> = ({
  onSubmit,
  onGoogleSignup,
  submitting,
  buildLink,
  hasEnabledOAuth = false,
  passwordPolicy,
  signupRoles = [],
  selectedRole,
  onRoleChange,
}) => {
  // Create dynamic schema based on org's password policy
  const validationSchema = useMemo(
    () => createSignupSchema(passwordPolicy),
    [passwordPolicy],
  );

  // Determine if role selector should be shown (2+ roles)
  const showRoleSelector = signupRoles.length >= 2;

  return (
    <>
      <Formik
        initialValues={{
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          confirmPassword: "",
          role: selectedRole || (signupRoles[0]?.slug ?? "user"),
        }}
        enableReinitialize
        validationSchema={validationSchema}
        onSubmit={(values) => {
          onSubmit({ ...values, role: selectedRole || values.role });
        }}
      >
        {({ errors, touched, setFieldValue }) => (
          <Form>
            {/* Role Selector - Only show when 2+ roles available */}
            {showRoleSelector && (
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  I want to sign up as:
                </Typography>
                <ToggleButtonGroup
                  value={selectedRole}
                  exclusive
                  onChange={(_, newRole) => {
                    if (newRole) {
                      onRoleChange(newRole);
                      setFieldValue("role", newRole);
                    }
                  }}
                  fullWidth
                  size="small"
                  sx={{
                    "& .MuiToggleButton-root": {
                      textTransform: "none",
                      fontWeight: 500,
                      py: 1,
                      "&.Mui-selected": {
                        bgcolor: "primary.main",
                        color: "white",
                        "&:hover": {
                          bgcolor: "primary.dark",
                        },
                      },
                    },
                  }}
                >
                  {signupRoles.map((role) => (
                    <ToggleButton key={role.slug} value={role.slug}>
                      {role.name}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Box>
            )}

            <Box sx={{ display: "flex", gap: 1.5 }}>
              <Field
                as={TextField}
                name="firstName"
                label="First Name"
                fullWidth
                size="small"
                error={touched.firstName && !!errors.firstName}
                helperText={touched.firstName && errors.firstName}
                sx={{ mb: 1.5 }}
              />
              <Field
                as={TextField}
                name="lastName"
                label="Last Name"
                fullWidth
                size="small"
                error={touched.lastName && !!errors.lastName}
                helperText={touched.lastName && errors.lastName}
                sx={{ mb: 1.5 }}
              />
            </Box>

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

            <Field
              as={PasswordField}
              name="password"
              label="Password"
              fullWidth
              size="small"
              error={touched.password && !!errors.password}
              helperText={touched.password && errors.password}
              sx={{ mb: 1.5 }}
            />

            <Field
              as={PasswordField}
              name="confirmPassword"
              label="Confirm Password"
              fullWidth
              size="small"
              error={touched.confirmPassword && !!errors.confirmPassword}
              helperText={touched.confirmPassword && errors.confirmPassword}
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
                  Creating Account...
                </>
              ) : (
                "Sign Up"
              )}
            </Button>
          </Form>
        )}
      </Formik>

      {/* OAuth Section - Only show when OAuth is enabled */}
      {hasEnabledOAuth && (
        <>
          <Divider sx={{ my: 2 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ px: 1.5 }}
            >
              OR
            </Typography>
          </Divider>

          <Button
            variant="outlined"
            fullWidth
            onClick={onGoogleSignup}
            sx={{
              py: 1,
              textTransform: "none",
              fontSize: "0.9375rem",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              borderRadius: 1.5,
              borderColor: "divider",
              color: "text.primary",
              "&:hover": {
                borderColor: "text.secondary",
                bgcolor: "action.hover",
              },
            }}
          >
            <img
              src="/assets/logos/google.svg"
              alt="Google"
              style={{ width: 18, height: 18 }}
            />
            Continue with Google
          </Button>
        </>
      )}

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
          Already have an account? Login
        </Link>
      </Box>

      <Box sx={{ mt: 2.5 }}>
        <Policy />
      </Box>
    </>
  );
};

export default SignupForm;
