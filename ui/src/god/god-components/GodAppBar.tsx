import React, { useState } from "react";
import {
  AppBar as MuiAppBar,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Tooltip,
  Divider,
  ListItemIcon,
  ListItemText,
  Button,
  CircularProgress,
} from "@mui/material";
import {
  Logout,
  Person,
  Email,
  Shield,
  Description,
  AdminPanelSettings,
  PersonOutline,
  SupervisorAccount,
  KeyboardArrowDown,
} from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";
import { ENV } from "../../config/env";
import { useNavigate } from "react-router-dom";
import { useOrganizations } from "../../hooks/useOrganizations";

const GodAppBar: React.FC = () => {
  const { godUser, logout } = useAuth();
  const navigate = useNavigate();
  const { organizations, loading: orgsLoading } = useOrganizations();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [docsAnchorEl, setDocsAnchorEl] = useState<null | HTMLElement>(null);
  const [userLoginAnchor, setUserLoginAnchor] = useState<null | HTMLElement>(
    null,
  );

  const apiBaseUrl = ENV.API_BASE_URL.replace("/v1/api", "");

  const handleDocsMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setDocsAnchorEl(event.currentTarget);
  };

  const handleDocsMenuClose = () => {
    setDocsAnchorEl(null);
  };

  const openApiDocs = (path: string) => {
    window.open(`${apiBaseUrl}${path}`, "_blank", "noopener,noreferrer");
    handleDocsMenuClose();
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate("/");
  };

  const handleProfileClick = () => {
    navigate("/profile");
    handleMenuClose();
  };

  const handleVerifyEmail = () => {
    navigate("/verify");
    handleMenuClose();
  };

  return (
    <MuiAppBar
      position="sticky"
      elevation={0}
      sx={{
        borderBottom: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Toolbar variant="dense" sx={{ minHeight: 42, py: 0 }}>
        {/* Company Logo with Shield Icon */}
        <Box
          sx={{ display: "flex", alignItems: "center", flexGrow: 1, gap: 1 }}
        >
          <Shield sx={{ color: "primary.main", fontSize: 20 }} />
          <Typography
            variant="h6"
            component="div"
            sx={{ fontSize: "0.95rem", fontWeight: 600, color: "text.primary" }}
          >
            Auth System
          </Typography>
        </Box>

        {/* User Login Link with environment options */}
        <Button
          onClick={(e) => setUserLoginAnchor(e.currentTarget)}
          size="small"
          startIcon={<PersonOutline sx={{ fontSize: 18 }} />}
          endIcon={<KeyboardArrowDown />}
          sx={{
            mr: 2,
            textTransform: "none",
            color: "text.secondary",
            "&:hover": { bgcolor: "action.hover" },
          }}
        >
          User Login
        </Button>
        <Menu
          anchorEl={userLoginAnchor}
          open={Boolean(userLoginAnchor)}
          onClose={() => setUserLoginAnchor(null)}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          PaperProps={{
            sx: { width: 300, mt: 1, maxHeight: 400 },
          }}
        >
          <Box sx={{ px: 2, py: 1, borderBottom: 1, borderColor: "divider" }}>
            <Typography variant="subtitle2" fontWeight="bold">
              User Login
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Select organization
            </Typography>
          </Box>

          {/* Local Dev option - only show on localhost */}
          {(window.location.hostname === "localhost" ||
            window.location.hostname === "127.0.0.1") && (
            <MenuItem
              onClick={() => {
                window.open(
                  `http://${window.location.hostname}:${window.location.port}`,
                  "_blank",
                  "noopener,noreferrer",
                );
                setUserLoginAnchor(null);
              }}
            >
              <ListItemIcon>
                <PersonOutline fontSize="small" sx={{ color: "#43e97b" }} />
              </ListItemIcon>
              <Box>
                <Typography variant="body2" fontWeight={500}>
                  Local Dev
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {window.location.host}
                </Typography>
              </Box>
            </MenuItem>
          )}

          <Divider sx={{ my: 0.5 }} />

          {/* Organization list */}
          {orgsLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
              <CircularProgress size={20} />
            </Box>
          ) : organizations.length === 0 ? (
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="body2" color="text.secondary">
                No organizations found
              </Typography>
            </Box>
          ) : (
            organizations
              .filter((org) => org.authServerUrl)
              .map((org) => (
                <MenuItem
                  key={org._id}
                  onClick={() => {
                    window.open(
                      org.authServerUrl,
                      "_blank",
                      "noopener,noreferrer",
                    );
                    setUserLoginAnchor(null);
                  }}
                >
                  <ListItemIcon>
                    <PersonOutline fontSize="small" sx={{ color: "#4facfe" }} />
                  </ListItemIcon>
                  <Box sx={{ overflow: "hidden" }}>
                    <Typography variant="body2" fontWeight={500} noWrap>
                      {org.orgName}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      noWrap
                      sx={{ display: "block" }}
                    >
                      {org.authServerUrl
                        ? new URL(org.authServerUrl).hostname
                        : "No URL"}
                    </Typography>
                  </Box>
                </MenuItem>
              ))
          )}
        </Menu>

        {/* Documentation Menu */}
        <Button
          onClick={handleDocsMenuOpen}
          size="small"
          endIcon={<KeyboardArrowDown />}
          startIcon={<Description sx={{ fontSize: 18 }} />}
          sx={{
            mr: 2,
            textTransform: "none",
            color: "text.secondary",
            "&:hover": { bgcolor: "action.hover" },
          }}
        >
          Documentation
        </Button>

        <Menu
          anchorEl={docsAnchorEl}
          open={Boolean(docsAnchorEl)}
          onClose={handleDocsMenuClose}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          PaperProps={{
            sx: { width: 280, mt: 1 },
          }}
        >
          <Box sx={{ px: 2, py: 1, borderBottom: 1, borderColor: "divider" }}>
            <Typography variant="subtitle2" fontWeight="bold">
              API Documentation
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Explore our comprehensive API docs
            </Typography>
          </Box>

          <MenuItem onClick={() => openApiDocs("/god/api-docs")}>
            <ListItemIcon>
              <SupervisorAccount fontSize="small" sx={{ color: "#f5576c" }} />
            </ListItemIcon>
            <Box>
              <Typography variant="body2" fontWeight={500}>
                God API
              </Typography>
              <Typography variant="caption" color="text.secondary">
                System administration endpoints
              </Typography>
            </Box>
          </MenuItem>

          <MenuItem onClick={() => openApiDocs("/admin/api-docs")}>
            <ListItemIcon>
              <AdminPanelSettings fontSize="small" sx={{ color: "#4facfe" }} />
            </ListItemIcon>
            <Box>
              <Typography variant="body2" fontWeight={500}>
                Admin API
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Organization management endpoints
              </Typography>
            </Box>
          </MenuItem>

          <MenuItem onClick={() => openApiDocs("/user/api-docs")}>
            <ListItemIcon>
              <PersonOutline fontSize="small" sx={{ color: "#43e97b" }} />
            </ListItemIcon>
            <Box>
              <Typography variant="body2" fontWeight={500}>
                User API
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Authentication & public endpoints
              </Typography>
            </Box>
          </MenuItem>
        </Menu>

        {/* Profile Menu */}
        {godUser && (
          <>
            <Tooltip title="Account">
              <IconButton
                onClick={handleProfileMenuOpen}
                size="small"
                sx={{ ml: 1 }}
              >
                <Avatar
                  src={godUser.profilePicture}
                  alt={`${godUser.firstName} ${godUser.lastName}`}
                  sx={{ width: 26, height: 26 }}
                >
                  {godUser.firstName[0]}
                </Avatar>
              </IconButton>
            </Tooltip>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              PaperProps={{
                sx: { width: 250, mt: 1 },
              }}
            >
              {/* godUser Info */}
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="subtitle2" fontWeight="bold">
                  {godUser.firstName} {godUser.lastName}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: "0.8rem" }}
                >
                  {godUser.email}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Role: {godUser.role.toUpperCase()}
                </Typography>
              </Box>

              <Divider />

              {/* Profile - Only show for non-God users */}
              {godUser.role !== "god" && (
                <MenuItem onClick={handleProfileClick}>
                  <ListItemIcon>
                    <Person fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Profile</ListItemText>
                </MenuItem>
              )}

              {/* Verify Email */}
              {!godUser.isVerified && (
                <MenuItem onClick={handleVerifyEmail}>
                  <ListItemIcon>
                    <Email fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Verify Email</ListItemText>
                </MenuItem>
              )}
              <Divider />

              {/* Logout */}
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <Logout fontSize="small" />
                </ListItemIcon>
                <ListItemText>Logout</ListItemText>
              </MenuItem>
            </Menu>
          </>
        )}
      </Toolbar>
    </MuiAppBar>
  );
};

export default GodAppBar;
