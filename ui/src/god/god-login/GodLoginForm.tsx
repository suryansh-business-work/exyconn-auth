import React, { useState } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import {
  Box,
  Button,
  TextField,
  IconButton,
  InputAdornment,
  CircularProgress,
  Divider,
  Typography,
  useTheme,
} from "@mui/material";
import { Visibility, VisibilityOff, MailOutline } from "@mui/icons-material";

const GodLoginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().required("Password is required"),
});

interface GodLoginFormProps {
  onSubmit: (values: { email: string; password: string }) => Promise<void>;
  onSendCredentials: () => Promise<void>;
  onNavigateToRegularLogin: () => void;
  submitting: boolean;
  sendingCredentials: boolean;
}

const GodLoginForm: React.FC<GodLoginFormProps> = ({
  onSubmit,
  onSendCredentials,
  onNavigateToRegularLogin,
  submitting,
  sendingCredentials,
}) => {
  const theme = useTheme();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      <Formik
        initialValues={{ email: "", password: "" }}
        validationSchema={GodLoginSchema}
        onSubmit={onSubmit}
      >
        {({ errors, touched, values, handleChange, handleBlur }) => (
          <Form>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2.5,
              }}
            >
              {/* Email Field */}
              <Field name="email">
                {() => (
                  <TextField
                    fullWidth
                    label="Email Address"
                    name="email"
                    type="email"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
                    disabled={submitting}
                    autoComplete="email"
                    autoFocus
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 1.5,
                        transition: "all 0.2s ease-in-out",
                        "&:hover": {
                          backgroundColor:
                            theme.palette.mode === "dark"
                              ? "rgba(255, 255, 255, 0.02)"
                              : "rgba(0, 0, 0, 0.02)",
                        },
                        "&.Mui-focused": {
                          backgroundColor: "transparent",
                        },
                      },
                    }}
                  />
                )}
              </Field>

              {/* Password Field */}
              <Field name="password">
                {() => (
                  <TextField
                    fullWidth
                    label="Password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.password && Boolean(errors.password)}
                    helperText={touched.password && errors.password}
                    disabled={submitting}
                    autoComplete="current-password"
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 1.5,
                        transition: "all 0.2s ease-in-out",
                        "&:hover": {
                          backgroundColor:
                            theme.palette.mode === "dark"
                              ? "rgba(255, 255, 255, 0.02)"
                              : "rgba(0, 0, 0, 0.02)",
                        },
                        "&.Mui-focused": {
                          backgroundColor: "transparent",
                        },
                      },
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            disabled={submitting}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              </Field>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={submitting}
                sx={{
                  mt: 1,
                  py: 1.4,
                  borderRadius: 1,
                  fontSize: "1rem",
                  fontWeight: 600,
                  textTransform: "none",
                  backgroundColor: "#1976d2",
                  color: "#fff",
                  transition: "transform 0.15s ease, box-shadow 0.15s ease",
                  boxShadow:
                    theme.palette.mode === "dark"
                      ? "0 6px 20px rgba(0,0,0,0.6)"
                      : "0 6px 20px rgba(25,118,210,0.12)",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow:
                      theme.palette.mode === "dark"
                        ? "0 8px 28px rgba(0,0,0,0.7)"
                        : "0 10px 30px rgba(25,118,210,0.14)",
                  },
                }}
              >
                {submitting ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  "Login"
                )}
              </Button>
            </Box>
          </Form>
        )}
      </Formik>

      <Divider sx={{ my: 2 }}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontSize: "0.85rem" }}
        >
          OR
        </Typography>
      </Divider>

      {/* Send Credentials Button */}
      <Button
        variant="text"
        fullWidth
        startIcon={<MailOutline />}
        onClick={onSendCredentials}
        disabled={sendingCredentials || submitting}
        sx={{
          py: 1.25,
          borderRadius: 1,
          textTransform: "none",
          fontSize: "0.95rem",
          fontWeight: 500,
          color: "text.secondary",
          justifyContent: "flex-start",
        }}
      >
        {sendingCredentials ? (
          <CircularProgress size={18} />
        ) : (
          "Send Credentials to God Email"
        )}
      </Button>

      {/* Back to Normal Login */}
      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ display: "inline" }}
        >
          Not a God user?{" "}
        </Typography>
        <Button
          variant="text"
          onClick={onNavigateToRegularLogin}
          sx={{
            textTransform: "none",
            p: 0,
            minWidth: 0,
            fontWeight: 600,
            fontSize: "0.875rem",
            "&:hover": {
              backgroundColor: "transparent",
              textDecoration: "underline",
            },
          }}
        >
          Regular Login
        </Button>
      </Box>
    </>
  );
};

export default GodLoginForm;
