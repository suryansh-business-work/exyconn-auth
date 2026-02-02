import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Button,
  Typography,
} from "@mui/material";
import { CheckCircle as CheckCircleIcon } from "@mui/icons-material";

interface SuccessDialogProps {
  open: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

const SuccessDialog: React.FC<SuccessDialogProps> = ({
  open,
  title,
  message,
  onClose,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="success-dialog-title"
      aria-describedby="success-dialog-description"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle
        id="success-dialog-title"
        sx={{ textAlign: "center", pb: 1 }}
      >
        <CheckCircleIcon sx={{ fontSize: 48, color: "success.main", mb: 1 }} />
        <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <DialogContentText
          id="success-dialog-description"
          sx={{ textAlign: "center", color: "text.primary" }}
        >
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "center", pb: 3 }}>
        <Button onClick={onClose} variant="contained" sx={{ minWidth: 120 }}>
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SuccessDialog;
