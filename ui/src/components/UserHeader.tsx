import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  ListItemIcon,
  Divider,
  Button,
  ListItemText,
} from "@mui/material";
import {
  AccountCircle,
  Logout,
  AdminPanelSettings,
  SwapHoriz,
  ExitToApp,
  Launch,
  ExpandMore,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useOrganization } from "../contexts/OrganizationContext";

const UserHeader: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [redirectMenuAnchor, setRedirectMenuAnchor] =
    useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const { user, userLogout } = useAuth();
  const { orgDetails } = useOrganization();

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleOpenRedirectMenu = (event: React.MouseEvent<HTMLElement>) => {
    setRedirectMenuAnchor(event.currentTarget);
  };

  const handleCloseRedirectMenu = () => {
    setRedirectMenuAnchor(null);
  };

  const handleRedirect = (url: string) => {
    const token = localStorage.getItem("authToken");
    const hasQuery = url.includes("?");
    const separator = hasQuery ? "&" : "?";

    // Construct final URL with token if available
    const finalUrl = token
      ? `${url}${separator}token=${encodeURIComponent(token)}`
      : url;

    window.open(finalUrl, "_blank", "noopener,noreferrer");
    handleCloseRedirectMenu();
  };

  const handleProfile = () => {
    handleClose();
    navigate("/profile");
  };

  const handleAdmin = () => {
    handleClose();
    navigate("/admin");
  };

  const handleLogout = () => {
    handleClose();
    userLogout();
    navigate("/");
  };

  const getUserInitials = () => {
    if (!user) return "?";
    const firstInitial = user.firstName?.charAt(0) || "";
    const lastInitial = user.lastName?.charAt(0) || "";
    return `${firstInitial}${lastInitial}`.toUpperCase() || "U";
  };

  const getUserDisplayName = () => {
    if (!user) return "User";
    return (
      `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email
    );
  };

  const isRedirectMenuOpen = Boolean(redirectMenuAnchor);

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        bgcolor: "background.paper",
        color: "text.primary",
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      <Toolbar variant="dense" sx={{ minHeight: 42, py: 0, px: 1.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
          {orgDetails?.orgLogos && orgDetails.orgLogos.length > 0 ? (
            <Box
              component="img"
              src={
                (
                  orgDetails.orgLogos.find((logo: any) => logo.isDefault) ||
                  orgDetails.orgLogos[0]
                ).url
              }
              alt={orgDetails.orgName}
              sx={{ height: 28, maxWidth: 100, objectFit: "contain", mr: 1.5 }}
            />
          ) : (
            <Typography
              variant="h6"
              component="div"
              sx={{ fontWeight: 600, fontSize: "0.95rem" }}
            >
              {orgDetails?.orgName || "Portal"}
            </Typography>
          )}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* Redirection Options Menu */}
          {orgDetails?.orgRedirectionSettings &&
            orgDetails.orgRedirectionSettings.length > 0 && (
              <Box sx={{ mr: 1 }}>
                {(() => {
                  // Check if running locally
                  const isLocal =
                    window.location.hostname === "localhost" ||
                    window.location.hostname === "127.0.0.1";

                  // Filter settings based on environment
                  const visibleSettings =
                    orgDetails.orgRedirectionSettings.filter((setting) => {
                      // Skip development environment if not running locally
                      if (setting.env === "development" && !isLocal)
                        return false;
                      // Include settings that have redirectionUrls
                      return (
                        setting.redirectionUrls &&
                        setting.redirectionUrls.length > 0
                      );
                    });

                  if (visibleSettings.length === 0) return null;

                  // Get environment display name
                  const getEnvDisplayName = (env: string): string => {
                    switch (env) {
                      case "development":
                        return "Development";
                      case "staging":
                        return "Staging";
                      case "production":
                        return "Production";
                      default:
                        return env;
                    }
                  };

                  // Get total count of all redirect URLs
                  const totalUrls = visibleSettings.reduce(
                    (count, setting) =>
                      count + (setting.redirectionUrls?.length || 0),
                    0,
                  );

                  return (
                    <>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<SwapHoriz fontSize="small" />}
                        onClick={handleOpenRedirectMenu}
                        endIcon={
                          totalUrls > 1 ? (
                            <ExpandMore fontSize="small" />
                          ) : (
                            <Launch fontSize="small" />
                          )
                        }
                        sx={{
                          textTransform: "none",
                          borderColor: "divider",
                          color: "text.primary",
                          fontWeight: 500,
                          fontSize: "0.8125rem",
                          py: 0.25,
                          "&:hover": {
                            borderColor: "primary.main",
                            bgcolor: "action.hover",
                          },
                        }}
                      >
                        Switch to App
                      </Button>
                      <Menu
                        anchorEl={redirectMenuAnchor}
                        open={isRedirectMenuOpen}
                        onClose={handleCloseRedirectMenu}
                        PaperProps={{
                          elevation: 3,
                          sx: {
                            mt: 1,
                            minWidth: 280,
                            maxWidth: 360,
                            borderRadius: 2,
                            border: "1px solid",
                            borderColor: "divider",
                          },
                        }}
                        transformOrigin={{
                          horizontal: "right",
                          vertical: "top",
                        }}
                        anchorOrigin={{
                          horizontal: "right",
                          vertical: "bottom",
                        }}
                      >
                        <Box px={2} py={1}>
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                          >
                            Redirect to App
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.disabled"
                            sx={{ display: "block", mt: 0.5 }}
                          >
                            Token will be appended to the URL automatically
                          </Typography>
                        </Box>
                        <Divider sx={{ my: 0.5 }} />
                        {visibleSettings.map((setting, settingIndex) => (
                          <Box key={settingIndex}>
                            {/* Environment Header */}
                            <Box
                              sx={{ px: 2, py: 0.75, bgcolor: "action.hover" }}
                            >
                              <Typography
                                variant="caption"
                                sx={{
                                  fontWeight: 600,
                                  textTransform: "uppercase",
                                  letterSpacing: 0.5,
                                  color: "text.secondary",
                                  fontSize: "0.6875rem",
                                }}
                              >
                                {getEnvDisplayName(setting.env)}
                                {setting.roleSlug &&
                                  setting.roleSlug !== "any" && (
                                    <Typography
                                      component="span"
                                      variant="caption"
                                      sx={{
                                        ml: 1,
                                        color: "primary.main",
                                        fontWeight: 500,
                                      }}
                                    >
                                      • {setting.roleSlug}
                                    </Typography>
                                  )}
                              </Typography>
                            </Box>
                            {/* Redirection URLs for this environment */}
                            {setting.redirectionUrls?.map(
                              (redirectUrl, urlIndex) => {
                                const displayUrl = redirectUrl.url
                                  .replace(/^https?:\/\//, "")
                                  .split("/")[0];
                                return (
                                  <MenuItem
                                    key={`${settingIndex}-${urlIndex}`}
                                    onClick={() =>
                                      handleRedirect(redirectUrl.url)
                                    }
                                    sx={{
                                      py: 1.25,
                                      px: 2,
                                      "&:hover": { bgcolor: "action.selected" },
                                    }}
                                  >
                                    <ListItemIcon sx={{ minWidth: 28 }}>
                                      <ExitToApp
                                        fontSize="small"
                                        color={
                                          redirectUrl.isDefault
                                            ? "primary"
                                            : "action"
                                        }
                                      />
                                    </ListItemIcon>
                                    <ListItemText
                                      primary={
                                        <Box
                                          sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1,
                                          }}
                                        >
                                          <Typography
                                            variant="body2"
                                            sx={{
                                              fontWeight: redirectUrl.isDefault
                                                ? 600
                                                : 400,
                                            }}
                                          >
                                            {displayUrl}
                                          </Typography>
                                          {redirectUrl.isDefault && (
                                            <Typography
                                              variant="caption"
                                              sx={{
                                                bgcolor: "primary.main",
                                                color: "white",
                                                px: 0.75,
                                                py: 0.1,
                                                borderRadius: 1,
                                                fontSize: "0.625rem",
                                                fontWeight: 600,
                                              }}
                                            >
                                              DEFAULT
                                            </Typography>
                                          )}
                                        </Box>
                                      }
                                      secondary={
                                        <Typography
                                          variant="caption"
                                          color="text.disabled"
                                          sx={{
                                            display: "block",
                                            maxWidth: 220,
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                          }}
                                          title={redirectUrl.url}
                                        >
                                          {redirectUrl.url}
                                        </Typography>
                                      }
                                    />
                                    <Launch
                                      fontSize="small"
                                      sx={{
                                        ml: 1,
                                        color: "action.disabled",
                                        fontSize: 16,
                                      }}
                                    />
                                  </MenuItem>
                                );
                              },
                            )}
                            {settingIndex < visibleSettings.length - 1 && (
                              <Divider />
                            )}
                          </Box>
                        ))}
                      </Menu>
                    </>
                  );
                })()}
              </Box>
            )}

          <Typography
            variant="body2"
            sx={{
              display: { xs: "none", sm: "block" },
              mr: 0.5,
              fontSize: "0.875rem",
            }}
          >
            {getUserDisplayName()}
          </Typography>

          <IconButton
            size="small"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenu}
            color="inherit"
          >
            {user?.profilePicture ? (
              <Avatar
                src={user.profilePicture}
                alt={getUserDisplayName()}
                sx={{ width: 26, height: 26 }}
              />
            ) : (
              <Avatar
                sx={{
                  width: 26,
                  height: 26,
                  fontSize: "0.75rem",
                  bgcolor: "primary.main",
                }}
              >
                {getUserInitials()}
              </Avatar>
            )}
          </IconButton>

          <Menu
            id="menu-appbar"
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
            open={Boolean(anchorEl)}
            onClose={handleClose}
            PaperProps={{
              elevation: 3,
              sx: { minWidth: 200, mt: 1 },
            }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="subtitle2" fontWeight={600}>
                {getUserDisplayName()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.email}
              </Typography>
            </Box>

            <Divider />

            <MenuItem onClick={handleProfile}>
              <ListItemIcon>
                <AccountCircle fontSize="small" />
              </ListItemIcon>
              Profile
            </MenuItem>

            {user?.role === "admin" && (
              <MenuItem onClick={handleAdmin}>
                <ListItemIcon>
                  <AdminPanelSettings fontSize="small" />
                </ListItemIcon>
                Admin Dashboard
              </MenuItem>
            )}

            <Divider />

            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default UserHeader;
