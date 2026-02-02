import React from "react";
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
} from "@mui/icons-material";
import { PasswordChangeValues } from "../useProfileLogic";

interface PasswordCheck {
  label: string;
  valid: boolean;
  required: boolean | undefined;
}

interface PasswordChangeSectionProps {
  isOAuthUser: boolean;
  showPasswordChange: boolean;
  passwordForm: PasswordChangeValues;
  showCurrentPassword: boolean;
  showNewPassword: boolean;
  showConfirmPassword: boolean;
  passwordChecks: PasswordCheck[];
  submitting: boolean;
  onStartPasswordChange: () => void;
  onCancelPasswordChange: () => void;
  onFormChange: (
    field: keyof PasswordChangeValues,
  ) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  onToggleCurrentPassword: () => void;
  onToggleNewPassword: () => void;
  onToggleConfirmPassword: () => void;
  onSubmit: () => void;
}

export const PasswordChangeSection: React.FC<PasswordChangeSectionProps> = ({
  isOAuthUser,
  showPasswordChange,
  passwordForm,
  showCurrentPassword,
  showNewPassword,
  showConfirmPassword,
  passwordChecks,
  submitting,
  onStartPasswordChange,
  onCancelPasswordChange,
  onFormChange,
  onToggleCurrentPassword,
  onToggleNewPassword,
  onToggleConfirmPassword,
  onSubmit,
}) => (
  <>
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      mb={2}
    >
      <Typography variant="h6" fontWeight={600}>
        <Lock sx={{ mr: 1, verticalAlign: "middle" }} />
        Security
      </Typography>
      {!showPasswordChange && !isOAuthUser && (
        <Button
          startIcon={<Edit />}
          onClick={onStartPasswordChange}
          size="small"
        >
          Change Password
        </Button>
      )}
    </Box>

    {isOAuthUser ? (
      <Alert severity="info" sx={{ mt: 1 }}>
        You signed in with Google. Password management is handled by your Google
        account.
      </Alert>
    ) : !showPasswordChange ? (
      <Typography variant="body2" color="text.secondary">
        Keep your account secure by using a strong password.
      </Typography>
    ) : (
      <>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Current Password"
              type={showCurrentPassword ? "text" : "password"}
              value={passwordForm.currentPassword}
              onChange={onFormChange("currentPassword")}
              fullWidth
              size="small"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={onToggleCurrentPassword}
                      edge="end"
                      size="small"
                    >
                      {showCurrentPassword ? (
                        <VisibilityOff fontSize="small" />
                      ) : (
                        <Visibility fontSize="small" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="New Password"
              type={showNewPassword ? "text" : "password"}
              value={passwordForm.newPassword}
              onChange={onFormChange("newPassword")}
              fullWidth
              size="small"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={onToggleNewPassword}
                      edge="end"
                      size="small"
                    >
                      {showNewPassword ? (
                        <VisibilityOff fontSize="small" />
                      ) : (
                        <Visibility fontSize="small" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Confirm New Password"
              type={showConfirmPassword ? "text" : "password"}
              value={passwordForm.confirmPassword}
              onChange={onFormChange("confirmPassword")}
              fullWidth
              size="small"
              error={
                passwordForm.confirmPassword !== "" &&
                passwordForm.newPassword !== passwordForm.confirmPassword
              }
              helperText={
                passwordForm.confirmPassword !== "" &&
                passwordForm.newPassword !== passwordForm.confirmPassword
                  ? "Passwords do not match"
                  : ""
              }
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={onToggleConfirmPassword}
                      edge="end"
                      size="small"
                    >
                      {showConfirmPassword ? (
                        <VisibilityOff fontSize="small" />
                      ) : (
                        <Visibility fontSize="small" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>

        {/* Password Policy Requirements */}
        {passwordChecks.length > 0 && passwordForm.newPassword && (
          <Box sx={{ mt: 2, p: 2, bgcolor: "action.hover", borderRadius: 1 }}>
            <Typography variant="body2" fontWeight={600} mb={1}>
              Password Requirements:
            </Typography>
            {passwordChecks.map((check, index) => (
              <Box
                key={index}
                display="flex"
                alignItems="center"
                gap={1}
                mb={0.5}
              >
                {check.valid ? (
                  <Check fontSize="small" color="success" />
                ) : (
                  <Close fontSize="small" color="error" />
                )}
                <Typography
                  variant="body2"
                  color={check.valid ? "success.main" : "error.main"}
                >
                  {check.label}
                </Typography>
              </Box>
            ))}
          </Box>
        )}

        <Box display="flex" gap={2} mt={2}>
          <Button
            variant="contained"
            startIcon={submitting ? <CircularProgress size={16} /> : <Save />}
            onClick={onSubmit}
            disabled={
              submitting ||
              (passwordChecks.length > 0 &&
                !passwordChecks.every((c) => c.valid))
            }
          >
            Update Password
          </Button>
          <Button
            variant="outlined"
            startIcon={<Cancel />}
            onClick={onCancelPasswordChange}
          >
            Cancel
          </Button>
        </Box>
      </>
    )}
  </>
);
