import React from "react";
import {
  Menu,
  MenuItem,
  Box,
  Typography,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
} from "@mui/material";
import { ExitToApp, Star } from "@mui/icons-material";
import {
  RedirectionTarget,
  getEnvLabel,
  getEnvColor,
} from "./useRedirectionTargets";

interface RedirectionMenuProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  targets: RedirectionTarget[];
  onRedirect: (url: string) => void;
}

const RedirectionMenu: React.FC<RedirectionMenuProps> = ({
  anchorEl,
  open,
  onClose,
  targets,
  onRedirect,
}) => {
  if (targets.length === 0) {
    return null;
  }

  // Group targets by environment
  const groupedTargets = targets.reduce(
    (acc, target) => {
      const env = target.env || "other";
      if (!acc[env]) {
        acc[env] = [];
      }
      acc[env].push(target);
      return acc;
    },
    {} as Record<string, RedirectionTarget[]>,
  );

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
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
      transformOrigin={{ horizontal: "right", vertical: "top" }}
      anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
    >
      <Box px={2} py={1.5}>
        <Typography variant="subtitle2" fontWeight="bold">
          Redirect to Application
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Your token will be securely appended
        </Typography>
      </Box>
      <Divider />

      {Object.entries(groupedTargets).map(([env, envTargets]) => (
        <Box key={env}>
          <Box px={2} py={0.75} bgcolor="action.hover">
            <Chip
              label={getEnvLabel(env)}
              size="small"
              color={getEnvColor(env)}
              variant="outlined"
              sx={{ fontSize: "0.7rem", height: 20 }}
            />
          </Box>
          {envTargets.map((target, index) => (
            <MenuItem
              key={`${env}-${index}`}
              onClick={() => onRedirect(target.tokenAppendedUrl)}
              sx={{ py: 1.25 }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <ExitToApp
                  fontSize="small"
                  color={target.isDefault ? "primary" : "inherit"}
                />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Typography
                      variant="body2"
                      fontWeight={target.isDefault ? 600 : 400}
                      noWrap
                    >
                      {
                        new URL(
                          target.url.startsWith("http")
                            ? target.url
                            : `https://${target.url}`,
                        ).hostname
                      }
                    </Typography>
                    {target.isDefault && (
                      <Star sx={{ fontSize: 14, color: "primary.main" }} />
                    )}
                  </Box>
                }
                secondary={
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      display: "block",
                      maxWidth: 220,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={target.url}
                  >
                    {target.url}
                  </Typography>
                }
              />
            </MenuItem>
          ))}
        </Box>
      ))}
    </Menu>
  );
};

export default RedirectionMenu;
