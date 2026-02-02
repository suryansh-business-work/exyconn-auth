import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";

interface MfaDisableDialogProps {
  open: boolean;
  password: string;
  loading: boolean;
  isOAuthUser?: boolean;
  onClose: () => void;
  onPasswordChange: (password: string) => void;
  onConfirm: () => void;
}

export const MfaDisableDialog: React.FC<MfaDisableDialogProps> = ({
  open,
  password,
  loading,
  isOAuthUser = false,
  onClose,
  onPasswordChange,
  onConfirm,
}) => (
  <Dialog
    open={open}
    onClose={onClose}
    PaperProps={{ sx: { borderRadius: 0 } }}
  >
    <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
    <DialogContent>
      {isOAuthUser ? (
        <Typography variant="body2" color="text.secondary" mb={2}>
          Are you sure you want to disable two-factor authentication?
        </Typography>
      ) : (
        <>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Enter your password to disable two-factor authentication.
          </Typography>
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            autoFocus
            variant="outlined"
            InputProps={{ sx: { borderRadius: 0 } }}
          />
        </>
      )}
    </DialogContent>
    <DialogActions>
      <Button
        onClick={() => {
          onClose();
          onPasswordChange("");
        }}
      >
        Cancel
      </Button>
      <Button
        variant="contained"
        color="error"
        onClick={onConfirm}
        disabled={(!isOAuthUser && !password) || loading}
        sx={{ borderRadius: 0 }}
      >
        {loading ? <CircularProgress size={16} /> : "Disable MFA"}
      </Button>
    </DialogActions>
  </Dialog>
);

interface MfaVerifyDialogProps {
  open: boolean;
  otp: string;
  loading: boolean;
  onClose: () => void;
  onOtpChange: (otp: string) => void;
  onVerify: () => void;
}

export const MfaVerifyDialog: React.FC<MfaVerifyDialogProps> = ({
  open,
  otp,
  loading,
  onClose,
  onOtpChange,
  onVerify,
}) => (
  <Dialog
    open={open}
    onClose={onClose}
    maxWidth="xs"
    fullWidth
    PaperProps={{ sx: { borderRadius: 0 } }}
  >
    <DialogTitle>Verify Two-Factor Authentication</DialogTitle>
    <DialogContent>
      <Typography variant="body2" color="text.secondary" mb={2}>
        Enter the 6-digit verification code sent to your email.
      </Typography>
      <TextField
        label="Verification Code"
        value={otp}
        onChange={(e) =>
          onOtpChange(e.target.value.replace(/\D/g, "").slice(0, 6))
        }
        fullWidth
        placeholder="000000"
        inputProps={{ maxLength: 6 }}
        variant="outlined"
        InputProps={{ sx: { borderRadius: 0 } }}
      />
    </DialogContent>
    <DialogActions>
      <Button
        onClick={() => {
          onClose();
          onOtpChange("");
        }}
      >
        Cancel
      </Button>
      <Button
        variant="contained"
        onClick={onVerify}
        disabled={loading || otp.length !== 6}
        sx={{ borderRadius: 0 }}
      >
        {loading ? <CircularProgress size={20} /> : "Verify"}
      </Button>
    </DialogActions>
  </Dialog>
);
