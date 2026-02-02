import React from "react";
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Divider,
  useMediaQuery,
  useTheme,
  Paper,
  alpha,
} from "@mui/material";
import {
  Person,
  Security,
  Badge,
  History,
  Logout,
  DeleteForever,
} from "@mui/icons-material";

export type ProfileSection =
  | "personal"
  | "security"
  | "role"
  | "logins"
  | "delete";

interface ProfileDrawerProps {
  activeSection: ProfileSection;
  onSectionChange: (section: ProfileSection) => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
  onLogout: () => void;
}

const menuItems: {
  id: ProfileSection;
  label: string;
  icon: React.ReactNode;
  danger?: boolean;
}[] = [
  { id: "personal", label: "Personal Information", icon: <Person /> },
  { id: "security", label: "Security & Privacy", icon: <Security /> },
  { id: "role", label: "Role & Permissions", icon: <Badge /> },
  { id: "logins", label: "Login History", icon: <History /> },
  {
    id: "delete",
    label: "Delete Account",
    icon: <DeleteForever />,
    danger: true,
  },
];

const drawerWidth = 280;

export const ProfileDrawer: React.FC<ProfileDrawerProps> = ({
  activeSection,
  onSectionChange,
  mobileOpen,
  onMobileClose,
  onLogout,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleItemClick = (section: ProfileSection) => {
    onSectionChange(section);
    if (isMobile) onMobileClose();
  };

  const drawerContent = (
    <Box
      sx={{ height: "100%", display: "flex", flexDirection: "column", py: 2 }}
    >
      <Box sx={{ px: 3, mb: 3 }}>
        <Typography
          variant="overline"
          color="text.secondary"
          sx={{ fontWeight: 600, letterSpacing: 1.5, fontSize: 11 }}
        >
          ACCOUNT SETTINGS
        </Typography>
      </Box>

      <List disablePadding sx={{ flexGrow: 1 }}>
        {menuItems.map((item) => {
          const isActive = activeSection === item.id;
          const isDanger = item.danger;
          return (
            <ListItemButton
              key={item.id}
              selected={isActive}
              onClick={() => handleItemClick(item.id)}
              sx={{
                mx: 0,
                borderRadius: 0,
                mb: 0,
                py: 2,
                px: 3,
                borderLeft: "3px solid",
                borderColor: isActive
                  ? isDanger
                    ? "error.main"
                    : "primary.main"
                  : "transparent",
                transition: "all 0.2s",
                ...(isDanger && {
                  color: "error.main",
                  "& .MuiListItemIcon-root": { color: "error.main" },
                }),
                "&.Mui-selected": {
                  bgcolor: isDanger
                    ? alpha(theme.palette.error.main, 0.08)
                    : alpha(theme.palette.primary.main, 0.08),
                  color: isDanger ? "error.main" : "primary.main",
                  "& .MuiListItemIcon-root": {
                    color: isDanger ? "error.main" : "primary.main",
                  },
                  "&:hover": {
                    bgcolor: isDanger
                      ? alpha(theme.palette.error.main, 0.12)
                      : alpha(theme.palette.primary.main, 0.12),
                  },
                },
                "&:hover": {
                  bgcolor: isDanger
                    ? alpha(theme.palette.error.main, 0.04)
                    : "action.hover",
                  borderColor: isActive
                    ? isDanger
                      ? "error.main"
                      : "primary.main"
                    : isDanger
                      ? alpha(theme.palette.error.main, 0.3)
                      : "divider",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color: isActive
                    ? isDanger
                      ? "error.main"
                      : "primary.main"
                    : isDanger
                      ? "error.main"
                      : "text.secondary",
                }}
              >
                {React.cloneElement(
                  item.icon as React.ReactElement<{ fontSize?: string }>,
                  {
                    fontSize: "small",
                  },
                )}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: 14,
                  fontWeight: isActive ? 700 : 500,
                  letterSpacing: 0.2,
                }}
              />
            </ListItemButton>
          );
        })}
      </List>

      <Box sx={{ px: 2, pt: 2 }}>
        <Divider sx={{ mb: 2, opacity: 0.6 }} />
        <ListItemButton
          onClick={onLogout}
          sx={{
            borderRadius: 0,
            color: "error.main",
            py: 2,
            px: 3,
            transition: "all 0.2s",
            borderLeft: "3px solid transparent",
            "&:hover": {
              bgcolor: alpha(theme.palette.error.main, 0.04),
              borderLeftColor: "error.main",
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40, color: "error.main" }}>
            <Logout fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary="Sign Out"
            primaryTypographyProps={{
              fontSize: 14,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        PaperProps={{
          sx: { width: drawerWidth, border: "none", borderRadius: 0 },
        }}
      >
        {drawerContent}
      </Drawer>
    );
  }

  return (
    <Box
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        height: "fit-content",
        position: "sticky",
        top: 24,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          borderRadius: 0,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          overflow: "hidden",
        }}
      >
        {drawerContent}
      </Paper>
    </Box>
  );
};

export { drawerWidth };
