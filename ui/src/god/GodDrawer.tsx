import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  Chip,
} from "@mui/material";
import {
  Dashboard,
  Business,
  Add,
  Description,
  OpenInNew,
} from "@mui/icons-material";
import { ENV } from "../config/env";

const drawerWidth = 240;

interface GodDrawerProps {
  mobileOpen: boolean;
  handleDrawerToggle: () => void;
}

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path?: string;
  external?: boolean;
  badge?: string;
}

interface MenuCategory {
  category: string;
  items: MenuItem[];
}

const GodDrawer: React.FC<GodDrawerProps> = ({
  mobileOpen,
  handleDrawerToggle,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const apiDocsBaseUrl = ENV.API_BASE_URL.replace("/v1/api", "");

  const menuCategories: MenuCategory[] = [
    {
      category: "Overview",
      items: [
        {
          text: "Dashboard",
          icon: <Dashboard />,
          path: "/god/dashboard",
        },
      ],
    },
    {
      category: "Organization Management",
      items: [
        {
          text: "All Organizations",
          icon: <Business />,
          path: "/god/organizations",
        },
        {
          text: "Create New",
          icon: <Add />,
          path: "/god/organization/create",
          badge: "New",
        },
      ],
    },
    {
      category: "Documentation",
      items: [
        {
          text: "God API Docs",
          icon: <Description />,
          path: `${apiDocsBaseUrl}/god/api-docs`,
          external: true,
        },
        {
          text: "Admin API Docs",
          icon: <Description />,
          path: `${apiDocsBaseUrl}/admin/api-docs`,
          external: true,
        },
        {
          text: "User API Docs",
          icon: <Description />,
          path: `${apiDocsBaseUrl}/user/api-docs`,
          external: true,
        },
      ],
    },
  ];

  const handleNavigate = (item: MenuItem) => {
    if (item.external && item.path) {
      window.open(item.path, "_blank", "noopener,noreferrer");
    } else if (item.path) {
      navigate(item.path);
      if (mobileOpen) {
        handleDrawerToggle();
      }
    }
  };

  const isActive = (path: string | undefined, external?: boolean) => {
    if (external || !path) return false;
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  const drawer = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {menuCategories.map((category, catIndex) => (
        <Box key={category.category}>
          {catIndex > 0 && <Divider sx={{ my: 1 }} />}
          <Typography
            variant="overline"
            sx={{
              px: 2,
              py: 0.75,
              display: "block",
              color: "text.secondary",
              fontWeight: 600,
              fontSize: "0.6rem",
              letterSpacing: "0.08em",
            }}
          >
            {category.category}
          </Typography>
          <List disablePadding>
            {category.items.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  selected={isActive(item.path, item.external)}
                  onClick={() => handleNavigate(item)}
                  sx={{
                    py: 0.75,
                    px: 2,
                    "&.Mui-selected": {
                      bgcolor: "primary.main",
                      color: "white",
                      "& .MuiListItemIcon-root": {
                        color: "white",
                      },
                      "&:hover": {
                        bgcolor: "primary.dark",
                      },
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 32, color: "inherit" }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Typography
                          variant="body2"
                          sx={{ fontSize: "0.8125rem" }}
                        >
                          {item.text}
                        </Typography>
                        {item.badge && (
                          <Chip
                            label={item.badge}
                            size="small"
                            color="primary"
                            sx={{ height: 18, fontSize: "0.6rem" }}
                          />
                        )}
                      </Box>
                    }
                  />
                  {item.external && (
                    <OpenInNew sx={{ fontSize: 14, opacity: 0.5 }} />
                  )}
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      ))}

      {/* Spacer */}
      <Box sx={{ flex: 1 }} />

      {/* Footer */}
      <Box sx={{ p: 1.5, borderTop: 1, borderColor: "divider" }}>
        <Typography
          variant="caption"
          color="text.disabled"
          display="block"
          textAlign="center"
          sx={{ fontSize: "0.65rem" }}
        >
          Auth System Admin Panel
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
    >
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: drawerWidth,
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
          display: { xs: "none", sm: "block" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: drawerWidth,
            top: 42,
            height: "calc(100% - 42px)",
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default GodDrawer;
