import React from "react";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard,
  People,
  Logout,
  Settings,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const DRAWER_WIDTH = 200;

interface AdminLayoutProps {
  children: React.ReactNode;
  orgName?: string;
  orgLogo?: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  orgName,
  orgLogo,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userLogout } = useAuth();

  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleProfileMenuClose();
    userLogout();
    navigate("/");
  };

  const handleNavigateToProfile = () => {
    handleProfileMenuClose();
    navigate("/profile");
  };

  const menuItems = [
    { text: "Dashboard", icon: <Dashboard />, path: "/admin" },
    { text: "Users", icon: <People />, path: "/admin/users" },
  ];

  const getUserInitials = () => {
    if (!user) return "A";
    const firstInitial = user.firstName?.charAt(0) || "";
    const lastInitial = user.lastName?.charAt(0) || "";
    return `${firstInitial}${lastInitial}`.toUpperCase() || "A";
  };

  const drawer = (
    <Box>
      <Divider />
      <List sx={{ py: 0.5 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                if (isMobile) setMobileOpen(false);
              }}
              sx={{ py: 0.75, px: 2 }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{ fontSize: "0.875rem" }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", overflow: "hidden" }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: "100%",
          bgcolor: "background.paper",
          color: "text.primary",
          borderBottom: 1,
          borderColor: "divider",
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar variant="dense" sx={{ minHeight: 42, py: 0, px: 1.5 }}>
          {/* Company Logo at extreme left */}
          {orgLogo ? (
            <Box
              component="img"
              src={orgLogo}
              alt={orgName}
              sx={{
                height: 28,
                maxWidth: 100,
                objectFit: "contain",
                mr: 2,
              }}
            />
          ) : (
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{
                fontSize: "0.95rem",
                fontWeight: 600,
                mr: 2,
              }}
            >
              {orgName || "Admin Panel"}
            </Typography>
          )}

          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            size="small"
            sx={{ mr: 1, display: { md: "none" } }}
          >
            <MenuIcon fontSize="small" />
          </IconButton>

          <Box sx={{ flexGrow: 1 }} />

          <IconButton onClick={handleProfileMenuOpen} size="small">
            <Avatar
              sx={{
                bgcolor: "primary.main",
                width: 26,
                height: 26,
                fontSize: "0.875rem",
              }}
            >
              {getUserInitials()}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            PaperProps={{
              sx: { width: 250, mt: 1 },
            }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="subtitle2" fontWeight="bold">
                {user?.firstName} {user?.lastName}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: "0.8rem" }}
              >
                {user?.email}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Role: {user?.role?.toUpperCase()}
              </Typography>
            </Box>
            <Divider />
            <MenuItem onClick={handleNavigateToProfile}>
              <ListItemIcon>
                <Settings fontSize="small" />
              </ListItemIcon>
              Profile Settings
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: DRAWER_WIDTH,
              top: 42,
              height: "calc(100% - 42px)",
            },
          }}
        >
          {drawer}
        </Drawer>
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: DRAWER_WIDTH,
              top: 42,
              height: "calc(100% - 42px)",
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: "42px",
          bgcolor: "grey.50",
          height: "calc(100vh - 92px)",
          maxHeight: "calc(100vh - 92px)",
          overflow: "auto",
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default AdminLayout;
