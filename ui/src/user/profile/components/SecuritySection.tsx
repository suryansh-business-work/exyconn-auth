import React, { useMemo } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  IconButton,
  InputAdornment,
  Alert,
  CircularProgress,
  Paper,
  Switch,
  FormControlLabel,
  Chip,
  alpha,
  useTheme,
  Divider,
} from "@mui/material";
import {
  Lock,
  Edit,
  Save,
  Cancel,
  Visibility,
  VisibilityOff,
  Check,
  Close,
  Security,
  Shield,
  GppGood,
  GppMaybe,
} from "@mui/icons-material";
import { PasswordChangeValues } from "../useProfileLogic";
import { UserData } from "../../../contexts/AuthContext";

interface PasswordPolicy {
  minLength?: number;
  requireUppercase?: boolean;
  requireLowercase?: boolean;
  requireNumbers?: boolean;
  requireSpecialChars?: boolean;
}

interface SecuritySectionProps {
  user: UserData | null;
  passwordPolicy: PasswordPolicy;
  showPasswordChange: boolean;
  passwordForm: PasswordChangeValues;
  showCurrentPassword: boolean;
  showNewPassword: boolean;
  showConfirmPassword: boolean;
  passwordSubmitting: boolean;
  mfaLoading: boolean;
  onStartPasswordChange: () => void;
  onCancelPasswordChange: () => void;
  onFormChange: (
    field: keyof PasswordChangeValues,
  ) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  onToggleCurrentPassword: () => void;
  onToggleNewPassword: () => void;
  onToggleConfirmPassword: () => void;
  onPasswordSubmit: () => void;
  onEnableMfa: () => void;
  onOpenDisableDialog: () => void;
  lastLoginAt?: string;
  lastLoginIp?: string;
}

export const SecuritySection: React.FC<SecuritySectionProps> = ({
  user,
  passwordPolicy,
  showPasswordChange,
  passwordForm,
  showCurrentPassword,
  showNewPassword,
  showConfirmPassword,
  passwordSubmitting,
  mfaLoading,
  onStartPasswordChange,
  onCancelPasswordChange,
  onFormChange,
  onToggleCurrentPassword,
  onToggleNewPassword,
  onToggleConfirmPassword,
  onPasswordSubmit,
  onEnableMfa,
  onOpenDisableDialog,
}) => {
  const theme = useTheme();
  const isOAuthUser = user?.provider === "google";

  const passwordChecks = useMemo(
    () =>
      [
        {
          label: `Min ${passwordPolicy.minLength || 6} chars`,
          valid:
            passwordForm.newPassword.length >= (passwordPolicy.minLength || 6),
          required: true,
        },
        {
          label: "One uppercase",
          valid: /[A-Z]/.test(passwordForm.newPassword),
          required: passwordPolicy.requireUppercase,
        },
        {
          label: "One lowercase",
          valid: /[a-z]/.test(passwordForm.newPassword),
          required: passwordPolicy.requireLowercase,
        },
        {
          label: "One number",
          valid: /\d/.test(passwordForm.newPassword),
          required: passwordPolicy.requireNumbers,
        },
        {
          label: "Special char",
          valid: /[!@#$%^&*(),.?":{}|<>]/.test(passwordForm.newPassword),
          required: passwordPolicy.requireSpecialChars,
        },
      ].filter((c) => c.required),
    [passwordPolicy, passwordForm.newPassword],
  );

  const handleMfaToggle = () =>
    user?.mfaEnabled ? onOpenDisableDialog() : onEnableMfa();

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      {/* Protection Status Card */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 0,
          border: "1px solid",
          borderColor: user?.mfaEnabled ? "success.main" : "warning.main",
          bgcolor: alpha(
            user?.mfaEnabled
              ? theme.palette.success.main
              : theme.palette.warning.main,
            0.02,
          ),
          display: "flex",
          alignItems: "center",
          gap: 3,
        }}
      >
        <Box
          sx={{
            p: 2,
            bgcolor: user?.mfaEnabled ? "success.main" : "warning.main",
            borderRadius: 0,
            color: "white",
          }}
        >
          {user?.mfaEnabled ? (
            <GppGood sx={{ fontSize: 32 }} />
          ) : (
            <GppMaybe sx={{ fontSize: 32 }} />
          )}
        </Box>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" fontWeight={700}>
            Account Protection: {user?.mfaEnabled ? "Enhanced" : "Standard"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.mfaEnabled
              ? "Your account is protected by Two-Factor Authentication."
              : "Add an extra layer of security to your account by enabling Two-Factor Authentication."}
          </Typography>
        </Box>
        <Chip
          label={user?.mfaEnabled ? "PROTECTED" : "AT RISK"}
          color={user?.mfaEnabled ? "success" : "warning"}
          variant="filled"
          sx={{ fontWeight: 800, borderRadius: 0 }}
        />
      </Paper>

      <Grid container spacing={3}>
        {/* Password Card */}
        <Grid item xs={12} md={7}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 0,
              border: "1px solid",
              borderColor: "divider",
              height: "100%",
            }}
          >
            <Box display="flex" alignItems="center" gap={1.5} mb={3}>
              <Box
                sx={{
                  p: 1,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  borderRadius: 0,
                  color: "primary.main",
                }}
              >
                <Lock fontSize="small" />
              </Box>
              <Typography variant="h6" fontWeight={700}>
                Password Settings
              </Typography>
            </Box>

            <Typography variant="body2" color="text.secondary" mb={4}>
              {user?.hasPassword
                ? "Regularly updating your password helps keep your account and personal data safe."
                : "Create a password to enable logging in with email and password, in addition to Google."}
            </Typography>

            {!showPasswordChange ? (
              <Button
                variant="outlined"
                startIcon={<Edit />}
                onClick={onStartPasswordChange}
                sx={{ borderRadius: 0, px: 3 }}
              >
                {user?.hasPassword
                  ? "Change Account Password"
                  : "Set Account Password"}
              </Button>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                {user?.hasPassword && (
                  <TextField
                    label="Current Password"
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={onFormChange("currentPassword")}
                    fullWidth
                    variant="outlined"
                    InputProps={{
                      sx: { borderRadius: 0 },
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={onToggleCurrentPassword}
                            edge="end"
                            size="small"
                          >
                            {showCurrentPassword ? (
                              <VisibilityOff />
                            ) : (
                              <Visibility />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}

                <Divider sx={{ my: 1, opacity: 0.5 }}>New Credentials</Divider>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="New Password"
                      type={showNewPassword ? "text" : "password"}
                      value={passwordForm.newPassword}
                      onChange={onFormChange("newPassword")}
                      fullWidth
                      variant="outlined"
                      InputProps={{
                        sx: { borderRadius: 0 },
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={onToggleNewPassword}
                              edge="end"
                              size="small"
                            >
                              {showNewPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Confirm Password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordForm.confirmPassword}
                      onChange={onFormChange("confirmPassword")}
                      fullWidth
                      variant="outlined"
                      error={
                        !!passwordForm.confirmPassword &&
                        passwordForm.newPassword !==
                          passwordForm.confirmPassword
                      }
                      helperText={
                        passwordForm.confirmPassword &&
                        passwordForm.newPassword !==
                          passwordForm.confirmPassword
                          ? "Passwords do not match"
                          : ""
                      }
                      InputProps={{
                        sx: { borderRadius: 0 },
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={onToggleConfirmPassword}
                              edge="end"
                              size="small"
                            >
                              {showConfirmPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>

                {passwordChecks.length > 0 && passwordForm.newPassword && (
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: "action.hover",
                      borderRadius: 0,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Typography
                      variant="caption"
                      fontWeight={700}
                      color="text.secondary"
                      display="block"
                      mb={1}
                    >
                      SECURITY REQUIREMENTS:
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={1}>
                      {passwordChecks.map((c, i) => (
                        <Chip
                          key={i}
                          size="small"
                          label={c.label}
                          icon={
                            c.valid ? (
                              <Check sx={{ fontSize: "12px !important" }} />
                            ) : (
                              <Close sx={{ fontSize: "12px !important" }} />
                            )
                          }
                          color={c.valid ? "success" : "default"}
                          variant={c.valid ? "filled" : "outlined"}
                          sx={{ fontWeight: 600, borderRadius: 0 }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                <Box display="flex" gap={2} mt={1}>
                  <Button
                    variant="contained"
                    startIcon={
                      passwordSubmitting ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : (
                        <Save />
                      )
                    }
                    onClick={onPasswordSubmit}
                    disabled={
                      passwordSubmitting ||
                      !passwordChecks.every((c) => c.valid) ||
                      passwordForm.newPassword !== passwordForm.confirmPassword
                    }
                    sx={{ borderRadius: 0, px: 4 }}
                  >
                    Update Password
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Cancel />}
                    onClick={onCancelPasswordChange}
                    sx={{ borderRadius: 0, px: 3 }}
                  >
                    Cancel
                  </Button>
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* MFA Card */}
        <Grid item xs={12} md={5}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 0,
              border: "1px solid",
              borderColor: "divider",
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box display="flex" alignItems="center" gap={1.5} mb={3}>
              <Box
                sx={{
                  p: 1,
                  bgcolor: alpha(theme.palette.secondary.main, 0.1),
                  borderRadius: 0,
                  color: "secondary.main",
                }}
              >
                <Shield fontSize="small" />
              </Box>
              <Typography variant="h6" fontWeight={700}>
                Two-Factor Auth
              </Typography>
            </Box>

            <Typography variant="body2" color="text.secondary" mb={4}>
              MFA adds an extra layer of protection by requiring a verification
              code from your email to sign in.
            </Typography>

            {isOAuthUser && (
              <Alert severity="info" sx={{ mb: 3, borderRadius: 0 }}>
                Note: Two-Factor Authentication will not be requested when
                logging in via Google.
              </Alert>
            )}

            <Box
              sx={{
                p: 3,
                bgcolor: alpha(theme.palette.background.default, 0.5),
                borderRadius: 0,
                border: "1px solid",
                borderColor: "divider",
                flexGrow: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
                gap: 2,
              }}
            >
              <Security
                color={user?.mfaEnabled ? "success" : "action"}
                sx={{ fontSize: 48, opacity: 0.8 }}
              />
              <Box>
                <Typography variant="subtitle1" fontWeight={700}>
                  Status: {user?.mfaEnabled ? "Enabled" : "Disabled"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Last updated: Just now
                </Typography>
              </Box>

              <FormControlLabel
                control={
                  <Switch
                    checked={user?.mfaEnabled || false}
                    onChange={handleMfaToggle}
                    disabled={mfaLoading}
                    color="primary"
                    sx={{ ml: 1 }}
                  />
                }
                label={
                  mfaLoading ? (
                    <CircularProgress size={20} />
                  ) : user?.mfaEnabled ? (
                    "Action required to disable"
                  ) : (
                    "Turn on for better security"
                  )
                }
                labelPlacement="bottom"
                sx={{
                  m: 0,
                  "& .MuiTypography-root": {
                    fontSize: 12,
                    mt: 1,
                    fontWeight: 600,
                    color: "text.secondary",
                  },
                }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
