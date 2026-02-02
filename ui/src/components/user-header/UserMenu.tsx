import React from "react";
import {
  Menu,
  MenuItem,
  Box,
  Typography,
  ListItemIcon,
  Divider,
  Chip,
} from "@mui/material";
import {
  AccountCircle,
  Logout,
  AdminPanelSettings,
  CheckCircle,
} from "@mui/icons-material";
import { UserData } from "../../contexts/AuthContext";

interface UserMenuProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  user: UserData | null;
  onProfile: () => void;
  onAdmin: () => void;
  onLogout: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({
  anchorEl,
  open,
  onClose,
  user,
  onProfile,
  onAdmin,
  onLogout,
}) => {
  const getUserDisplayName = (): string => {
    if (!user) return "User";
    return (
      `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email
    );
  };

  const getRoleLabel = (role: string): string => {
    switch (role) {
      case "admin":
        return "Administrator";
      case "user":
        return "User";
      case "god":
        return "Super Admin";
      default:
        return role.charAt(0).toUpperCase() + role.slice(1);
    }
  };

  return (
    <Menu
      id="user-menu"
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={open}
      onClose={onClose}
      PaperProps={{
        elevation: 3,
        sx: { minWidth: 220, mt: 1, borderRadius: 2 },
      }}
    >
      <Box sx={{ px: 2, py: 1.5 }}>
        <Typography variant="subtitle2" fontWeight={600}>
          {getUserDisplayName()}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block" }}
        >
          {user?.email}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
          <Chip
            label={getRoleLabel(user?.role || "user")}
            size="small"
            color={user?.role === "admin" ? "primary" : "default"}
            variant="outlined"
            sx={{ fontSize: "0.7rem", height: 20 }}
          />
          {user?.isVerified && (
            <CheckCircle sx={{ fontSize: 14, color: "success.main" }} />
          )}
        </Box>
      </Box>

      <Divider />

      <MenuItem onClick={onProfile}>
        <ListItemIcon>
          <AccountCircle fontSize="small" />
        </ListItemIcon>
        Profile
      </MenuItem>

      {user?.role === "admin" && (
        <MenuItem onClick={onAdmin}>
          <ListItemIcon>
            <AdminPanelSettings fontSize="small" />
          </ListItemIcon>
          Admin Dashboard
        </MenuItem>
      )}

      <Divider />

      <MenuItem onClick={onLogout} sx={{ color: "error.main" }}>
        <ListItemIcon>
          <Logout fontSize="small" color="error" />
        </ListItemIcon>
        Logout
      </MenuItem>
    </Menu>
  );
};

export default UserMenu;
