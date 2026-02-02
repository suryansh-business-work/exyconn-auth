import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
  Paper,
} from "@mui/material";
import { CheckCircle, ContentCopy } from "@mui/icons-material";

interface TokenGeneratedDialogProps {
  open: boolean;
  token: string;
  name: string;
  onClose: () => void;
  onCopy: (token: string) => void;
}

export const TokenGeneratedDialog: React.FC<TokenGeneratedDialogProps> = ({
  open,
  token,
  name,
  onClose,
  onCopy,
}) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <CheckCircle color="success" />
      Token Generated
    </DialogTitle>
    <DialogContent>
      <Alert severity="warning" sx={{ mb: 2 }}>
        Make sure to copy your token now. You won't be able to see it again!
      </Alert>
      <Typography variant="body2" gutterBottom>
        Token for <strong>{name}</strong>:
      </Typography>
      <Paper
        sx={{
          p: 2,
          bgcolor: "grey.100",
          fontFamily: "monospace",
          fontSize: "0.85rem",
          wordBreak: "break-all",
        }}
      >
        {token}
      </Paper>
    </DialogContent>
    <DialogActions>
      <Button onClick={() => onCopy(token)} startIcon={<ContentCopy />}>
        Copy Token
      </Button>
      <Button onClick={onClose} variant="contained">
        Done
      </Button>
    </DialogActions>
  </Dialog>
);
