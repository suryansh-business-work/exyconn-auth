import React from "react";
import { Menu, MenuItem, ListItemIcon, CircularProgress } from "@mui/material";
import {
  Edit,
  Delete,
  LockReset,
  VerifiedUser,
  PersonOff,
} from "@mui/icons-material";
import { AdminUser } from "../useAdminLogic";

interface UserActionsMenuProps {
  anchorEl: HTMLElement | null;
  selectedUser: AdminUser | null;
  currentUserId: string | undefined;
  togglingVerification: boolean;
  onClose: () => void;
  onEdit: () => void;
  onResetPassword: () => void;
  onToggleVerification: () => void;
  onDelete: () => void;
}

const UserActionsMenu: React.FC<UserActionsMenuProps> = ({
  anchorEl,
  selectedUser,
  currentUserId,
  togglingVerification,
  onClose,
  onEdit,
  onResetPassword,
  onToggleVerification,
  onDelete,
}) => {
  return (
    <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={onClose}>
      <MenuItem onClick={onEdit}>
        <ListItemIcon>
          <Edit fontSize="small" />
        </ListItemIcon>
        Edit User
      </MenuItem>
      {selectedUser?.provider !== "google" && (
        <MenuItem onClick={onResetPassword}>
          <ListItemIcon>
            <LockReset fontSize="small" />
          </ListItemIcon>
          Reset Password
        </MenuItem>
      )}
      <MenuItem onClick={onToggleVerification} disabled={togglingVerification}>
        <ListItemIcon>
          {togglingVerification ? (
            <CircularProgress size={20} />
          ) : selectedUser?.isVerified ? (
            <PersonOff fontSize="small" />
          ) : (
            <VerifiedUser fontSize="small" />
          )}
        </ListItemIcon>
        {selectedUser?.isVerified ? "Unverify" : "Verify"}
      </MenuItem>
      {selectedUser?._id !== currentUserId && (
        <MenuItem onClick={onDelete} sx={{ color: "error.main" }}>
          <ListItemIcon>
            <Delete fontSize="small" color="error" />
          </ListItemIcon>
          Delete User
        </MenuItem>
      )}
    </Menu>
  );
};

export default UserActionsMenu;
