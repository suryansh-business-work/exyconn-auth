import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Alert,
  Paper,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Divider,
} from "@mui/material";
import { Warning, DeleteForever, Cancel } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "../../../contexts/SnackbarContext";
import { useAuth } from "../../../contexts/AuthContext";
import {
  postRequest,
  getRequest,
  isSuccess,
  extractMessage,
  parseError,
} from "../../../lib/api";
import { API_ENDPOINTS } from "../../../apis";

interface DeletionStatus {
  isDeleted: boolean;
  deletionRequestedAt?: string;
  deletionScheduledAt?: string;
  deletionReason?: string;
  gracePeriodDays: number;
}

export const DeleteAccountSection: React.FC = () => {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { logout } = useAuth();

  const [deletionStatus, setDeletionStatus] = useState<DeletionStatus | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [showOtpDialog, setShowOtpDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [otp, setOtp] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch deletion status on mount
  useEffect(() => {
    fetchDeletionStatus();
  }, []);

  const fetchDeletionStatus = async () => {
    try {
      const response = await getRequest(API_ENDPOINTS.AUTH.DELETION_STATUS);
      if (isSuccess(response)) {
        setDeletionStatus((response.data as any).data);
      }
    } catch (error) {
      console.error("Failed to fetch deletion status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestDeletion = async () => {
    setSubmitting(true);
    try {
      const response = await postRequest(API_ENDPOINTS.AUTH.REQUEST_DELETION, {
        reason,
      });
      if (isSuccess(response)) {
        showSnackbar(
          extractMessage(response) || "Verification code sent to your email",
          "success",
        );
        setShowConfirmDialog(false);
        setShowOtpDialog(true);
      } else {
        showSnackbar(
          extractMessage(response) || "Failed to request deletion",
          "error",
        );
      }
    } catch (error) {
      const parsed = parseError(error);
      showSnackbar(parsed.message || "Failed to request deletion", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDeletion = async () => {
    if (!otp || otp.length !== 6) {
      showSnackbar("Please enter a valid 6-digit code", "error");
      return;
    }

    setSubmitting(true);
    try {
      const response = await postRequest(API_ENDPOINTS.AUTH.CONFIRM_DELETION, {
        otp,
      });
      if (isSuccess(response)) {
        showSnackbar(
          extractMessage(response) || "Account deletion confirmed",
          "success",
        );
        setShowOtpDialog(false);
        logout();
        navigate("/");
      } else {
        showSnackbar(
          extractMessage(response) || "Failed to confirm deletion",
          "error",
        );
      }
    } catch (error) {
      const parsed = parseError(error);
      showSnackbar(parsed.message || "Failed to confirm deletion", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelDeletion = async () => {
    setSubmitting(true);
    try {
      const response = await postRequest(
        API_ENDPOINTS.AUTH.CANCEL_DELETION,
        {},
      );
      if (isSuccess(response)) {
        showSnackbar(
          extractMessage(response) || "Account deletion cancelled",
          "success",
        );
        fetchDeletionStatus();
      } else {
        showSnackbar(
          extractMessage(response) || "Failed to cancel deletion",
          "error",
        );
      }
    } catch (error) {
      const parsed = parseError(error);
      showSnackbar(parsed.message || "Failed to cancel deletion", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  // If account is already scheduled for deletion
  if (deletionStatus?.isDeleted) {
    const scheduledDate = deletionStatus.deletionScheduledAt
      ? new Date(deletionStatus.deletionScheduledAt).toLocaleDateString()
      : "Unknown";

    return (
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 0,
          border: "2px solid",
          borderColor: "warning.main",
        }}
      >
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Warning color="warning" sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h5" fontWeight={600} color="warning.main">
              Account Deletion Scheduled
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your account is scheduled for permanent deletion
            </Typography>
          </Box>
        </Box>

        <Alert severity="warning" sx={{ mb: 3, borderRadius: 0 }}>
          <Typography variant="body2">
            <strong>Scheduled deletion date:</strong> {scheduledDate}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            All your data will be permanently deleted on this date and cannot be
            recovered.
          </Typography>
        </Alert>

        <Button
          variant="contained"
          color="success"
          startIcon={<Cancel />}
          onClick={handleCancelDeletion}
          disabled={submitting}
          sx={{ borderRadius: 0 }}
        >
          {submitting ? "Cancelling..." : "Cancel Deletion & Restore Account"}
        </Button>
      </Paper>
    );
  }

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 0,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <DeleteForever color="error" sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h5" fontWeight={600}>
              Delete Your Account
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Permanently remove your account and all associated data
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Alert severity="error" sx={{ mb: 3, borderRadius: 0 }}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            ⚠️ Important: Please read before proceeding
          </Typography>
          <Box component="ul" sx={{ pl: 2, mb: 0 }}>
            <li>
              Your account will be permanently deleted after a 15-day grace
              period
            </li>
            <li>
              All your personal data, settings, and history will be removed
            </li>
            <li>
              You will receive an email confirmation with an OTP to verify your
              identity
            </li>
            <li>
              Once confirmed, you cannot undo or revoke the deletion request
            </li>
            <li>During the 15-day period, you can still cancel the deletion</li>
          </Box>
        </Alert>

        <Alert severity="info" sx={{ mb: 3, borderRadius: 0 }}>
          <Typography variant="body2">
            <strong>Grace Period:</strong> After confirmation, your account will
            remain accessible for 15 days. After this period, all data will be
            automatically and permanently deleted from our systems.
          </Typography>
        </Alert>

        <Button
          variant="contained"
          color="error"
          size="large"
          startIcon={<DeleteForever />}
          onClick={() => setShowConfirmDialog(true)}
          sx={{ mt: 2, borderRadius: 0 }}
        >
          Delete My Account
        </Button>
      </Paper>

      {/* Confirm Dialog - Ask for reason */}
      <Dialog
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 0 } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <Warning color="error" />
            <Typography variant="h6">Confirm Account Deletion</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            We're sorry to see you go. Before we proceed, would you like to tell
            us why you're leaving?
          </Typography>
          <TextField
            label="Reason for leaving (optional)"
            placeholder="Help us improve by sharing your feedback..."
            multiline
            rows={3}
            fullWidth
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            variant="outlined"
            InputProps={{ sx: { borderRadius: 0 } }}
          />
          <Alert severity="warning" sx={{ mt: 2 }}>
            A verification code will be sent to your email to confirm this
            action.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setShowConfirmDialog(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleRequestDeletion}
            disabled={submitting}
            startIcon={
              submitting ? <CircularProgress size={16} /> : <DeleteForever />
            }
          >
            {submitting ? "Sending Code..." : "Send Verification Code"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* OTP Verification Dialog */}
      <Dialog
        open={showOtpDialog}
        onClose={() => setShowOtpDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 0 } }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <Warning color="error" />
            <Typography variant="h6">Enter Verification Code</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            We've sent a 6-digit verification code to your email. Enter it below
            to confirm account deletion.
          </Typography>
          <TextField
            label="Verification Code"
            placeholder="Enter 6-digit code"
            fullWidth
            value={otp}
            onChange={(e) =>
              setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            inputProps={{ maxLength: 6 }}
            variant="outlined"
            InputProps={{ sx: { borderRadius: 0 } }}
            sx={{ mb: 2 }}
          />
          <Alert severity="error">
            <Typography variant="body2" fontWeight={600}>
              ⚠️ This action cannot be undone after confirmation!
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setShowOtpDialog(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDeletion}
            disabled={submitting || otp.length !== 6}
            startIcon={
              submitting ? <CircularProgress size={16} /> : <DeleteForever />
            }
          >
            {submitting ? "Deleting..." : "Confirm Deletion"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
