import React from "react";
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
  Grid,
  Typography,
  CircularProgress,
} from "@mui/material";
import {
  CreateUserData,
  UpdateUserData,
  AdminUser,
  OrganizationRole,
} from "../useAdminLogic";

interface CreateUserDialogProps {
  open: boolean;
  form: CreateUserData;
  submitting: boolean;
  roles: OrganizationRole[];
  onClose: () => void;
  onFormChange: (form: CreateUserData) => void;
  onSubmit: () => void;
}

export const CreateUserDialog: React.FC<CreateUserDialogProps> = ({
  open,
  form,
  submitting,
  roles,
  onClose,
  onFormChange,
  onSubmit,
}) => {
  const defaultRole =
    roles.find((r) => r.isDefault)?.slug || roles[0]?.slug || "user";
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New User</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="First Name"
              value={form.firstName}
              onChange={(e) =>
                onFormChange({ ...form, firstName: e.target.value })
              }
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Last Name"
              value={form.lastName}
              onChange={(e) =>
                onFormChange({ ...form, lastName: e.target.value })
              }
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => onFormChange({ ...form, email: e.target.value })}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) =>
                onFormChange({ ...form, password: e.target.value })
              }
              helperText="At least 6 characters"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={form.role || defaultRole}
                label="Role"
                onChange={(e) =>
                  onFormChange({ ...form, role: e.target.value })
                }
              >
                {roles.length > 0 ? (
                  roles.map((role) => (
                    <MenuItem key={role.slug} value={role.slug}>
                      {role.name}
                      {role.isDefault && " (Default)"}
                    </MenuItem>
                  ))
                ) : (
                  <>
                    <MenuItem value="user">User</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                  </>
                )}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={onSubmit}
          disabled={
            submitting ||
            !form.firstName ||
            !form.lastName ||
            !form.email ||
            !form.password
          }
        >
          {submitting ? <CircularProgress size={20} /> : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

interface EditUserDialogProps {
  open: boolean;
  form: UpdateUserData;
  selectedUser: AdminUser | null;
  currentUserId: string | undefined;
  submitting: boolean;
  roles: OrganizationRole[];
  onClose: () => void;
  onFormChange: (form: UpdateUserData) => void;
  onSubmit: () => void;
}

export const EditUserDialog: React.FC<EditUserDialogProps> = ({
  open,
  form,
  selectedUser,
  currentUserId,
  submitting,
  roles,
  onClose,
  onFormChange,
  onSubmit,
}) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle>Edit User</DialogTitle>
    <DialogContent>
      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid item xs={6}>
          <TextField
            fullWidth
            label="First Name"
            value={form.firstName || ""}
            onChange={(e) =>
              onFormChange({ ...form, firstName: e.target.value })
            }
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            fullWidth
            label="Last Name"
            value={form.lastName || ""}
            onChange={(e) =>
              onFormChange({ ...form, lastName: e.target.value })
            }
          />
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select
              value={form.role || "user"}
              label="Role"
              onChange={(e) => onFormChange({ ...form, role: e.target.value })}
              disabled={selectedUser?._id === currentUserId}
            >
              {roles.length > 0 ? (
                roles.map((role) => (
                  <MenuItem key={role.slug} value={role.slug}>
                    {role.name}
                    {role.isDefault && " (Default)"}
                  </MenuItem>
                ))
              ) : (
                <>
                  <MenuItem value="user">User</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </>
              )}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cancel</Button>
      <Button variant="contained" onClick={onSubmit} disabled={submitting}>
        {submitting ? <CircularProgress size={20} /> : "Save"}
      </Button>
    </DialogActions>
  </Dialog>
);

interface ResetPasswordDialogProps {
  open: boolean;
  selectedUser: AdminUser | null;
  newPassword: string;
  submitting: boolean;
  onClose: () => void;
  onPasswordChange: (password: string) => void;
  onSubmit: () => void;
}

export const ResetPasswordDialog: React.FC<ResetPasswordDialogProps> = ({
  open,
  selectedUser,
  newPassword,
  submitting,
  onClose,
  onPasswordChange,
  onSubmit,
}) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle>Reset Password</DialogTitle>
    <DialogContent>
      <Typography variant="body2" color="text.secondary" mb={2}>
        Reset password for {selectedUser?.firstName} {selectedUser?.lastName}
      </Typography>
      <TextField
        fullWidth
        label="New Password"
        type="password"
        value={newPassword}
        onChange={(e) => onPasswordChange(e.target.value)}
        helperText="At least 6 characters"
      />
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cancel</Button>
      <Button
        variant="contained"
        onClick={onSubmit}
        disabled={submitting || newPassword.length < 6}
      >
        {submitting ? <CircularProgress size={20} /> : "Reset"}
      </Button>
    </DialogActions>
  </Dialog>
);
