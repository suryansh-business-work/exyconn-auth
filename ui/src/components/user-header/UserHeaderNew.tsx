import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Box,
  Button,
} from "@mui/material";
import { SwapHoriz, Launch, ExpandMore } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useOrganization } from "../../contexts/OrganizationContext";
import { useRedirectionTargets } from "./useRedirectionTargets";
import RedirectionMenu from "./RedirectionMenu";
import UserMenu from "./UserMenu";

const UserHeaderNew: React.FC = () => {
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(
    null,
  );
  const [redirectMenuAnchor, setRedirectMenuAnchor] =
    useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const { user, userLogout } = useAuth();
  const { orgDetails } = useOrganization();

  // Get available redirection targets for the user's role
  const redirectionTargets = useRedirectionTargets(
    orgDetails?.orgRedirectionSettings,
    user?.role || "user",
  );

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setUserMenuAnchor(null);
  };

  const handleOpenRedirectMenu = (event: React.MouseEvent<HTMLElement>) => {
    setRedirectMenuAnchor(event.currentTarget);
  };

  const handleCloseRedirectMenu = () => {
    setRedirectMenuAnchor(null);
  };

  const handleRedirect = (url: string) => {
    window.location.href = url;
    handleCloseRedirectMenu();
  };

  const handleProfile = () => {
    handleCloseUserMenu();
    navigate("/profile");
  };

  const handleAdmin = () => {
    handleCloseUserMenu();
    navigate("/admin");
  };

  const handleLogout = () => {
    handleCloseUserMenu();
    userLogout();
    navigate("/");
  };

  const getUserInitials = (): string => {
    if (!user) return "?";
    const firstInitial = user.firstName?.charAt(0) || "";
    const lastInitial = user.lastName?.charAt(0) || "";
    return `${firstInitial}${lastInitial}`.toUpperCase() || "U";
  };

  const getUserDisplayName = (): string => {
    if (!user) return "User";
    return (
      `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email
    );
  };

  // Filter targets for local dev if not running locally
  const isLocal =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";
  const visibleTargets = redirectionTargets.filter((target) => {
    if (target.env === "development" && !isLocal) return false;
    return true;
  });

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
        {/* Logo / Brand */}
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
          {/* Redirection Button */}
          {visibleTargets.length > 0 && (
            <Box sx={{ mr: 1 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<SwapHoriz fontSize="small" />}
                onClick={handleOpenRedirectMenu}
                endIcon={
                  visibleTargets.length > 1 ? (
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
                Go to App
              </Button>
              <RedirectionMenu
                anchorEl={redirectMenuAnchor}
                open={Boolean(redirectMenuAnchor)}
                onClose={handleCloseRedirectMenu}
                targets={visibleTargets}
                onRedirect={handleRedirect}
              />
            </Box>
          )}

          {/* User Display Name */}
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

          {/* User Avatar */}
          <IconButton
            size="small"
            aria-label="account menu"
            aria-controls="user-menu"
            aria-haspopup="true"
            onClick={handleOpenUserMenu}
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

          {/* User Menu */}
          <UserMenu
            anchorEl={userMenuAnchor}
            open={Boolean(userMenuAnchor)}
            onClose={handleCloseUserMenu}
            user={user}
            onProfile={handleProfile}
            onAdmin={handleAdmin}
            onLogout={handleLogout}
          />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default UserHeaderNew;
