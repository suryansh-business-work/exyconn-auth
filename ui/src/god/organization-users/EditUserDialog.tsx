import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Box,
  Alert,
  CircularProgress,
} from "@mui/material";
import type { GodUser } from "../../types/god";

interface OrganizationRole {
  name: string;
  displayName?: string;
  description?: string;
  permissions?: string[];
}

interface EditUserDialogProps {
  open: boolean;
  user: GodUser | null;
  roles?: OrganizationRole[];
  onClose: () => void;
  onSave: (userId: string, updates: Partial<GodUser>) => Promise<void>;
}

const EditUserDialog: React.FC<EditUserDialogProps> = ({
  open,
  user,
  roles = [],
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "user",
    isVerified: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Default roles if none provided from organization
  const availableRoles =
    roles.length > 0
      ? roles
      : [
          { name: "user", displayName: "User" },
          { name: "admin", displayName: "Admin" },
        ];

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        role: user.role || "user",
        isVerified: user.isVerified || false,
      });
    }
  }, [user]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      await onSave(user._id, formData);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600, pb: 1 }}>Edit User</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
          <TextField
            label="First Name"
            value={formData.firstName}
            onChange={(e) => handleChange("firstName", e.target.value)}
            fullWidth
            size="small"
          />
          <TextField
            label="Last Name"
            value={formData.lastName}
            onChange={(e) => handleChange("lastName", e.target.value)}
            fullWidth
            size="small"
          />
          <TextField
            label="Email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            fullWidth
            size="small"
            type="email"
            disabled
            helperText="Email cannot be changed"
          />
          <FormControl fullWidth size="small">
            <InputLabel>Role</InputLabel>
            <Select
              value={formData.role}
              label="Role"
              onChange={(e) => handleChange("role", e.target.value)}
            >
              {availableRoles.map((role) => (
                <MenuItem key={role.name} value={role.name}>
                  {role.displayName || role.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControlLabel
            control={
              <Switch
                checked={formData.isVerified}
                onChange={(e) => handleChange("isVerified", e.target.checked)}
              />
            }
            label="Verified"
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading && <CircularProgress size={16} />}
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditUserDialog;
