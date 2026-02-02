import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Divider,
  CircularProgress,
} from "@mui/material";
import { Delete } from "@mui/icons-material";

interface DeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  itemName: string;
  submitting?: boolean;
  warning?: string;
}

const DeleteDialog: React.FC<DeleteDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  itemName,
  submitting = false,
  warning = "This action cannot be undone and will permanently remove all data associated with this item.",
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" fontWeight="bold">
          {title}
        </Typography>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 3 }}>
        <Typography variant="body1" gutterBottom>
          Are you sure you want to delete <strong>"{itemName}"</strong>?
        </Typography>
        <Typography variant="body2" color="error" sx={{ mt: 2 }}>
          ⚠️ {warning}
        </Typography>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" disabled={submitting}>
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          disabled={submitting}
          color="error"
          variant="contained"
          startIcon={submitting ? <CircularProgress size={16} /> : <Delete />}
        >
          {submitting
            ? "Deleting..."
            : `Delete ${title.split(" ")[1] || "Item"}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteDialog;
