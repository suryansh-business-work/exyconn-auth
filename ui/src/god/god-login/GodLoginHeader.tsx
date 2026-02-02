import React from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { LockOutlined } from "@mui/icons-material";

const GodLoginHeader: React.FC = () => {
  const theme = useTheme();

  return (
    <Box sx={{ textAlign: "center", mb: 5 }}>
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 72,
          height: 72,
          borderRadius: "12px",
          backgroundColor: "#1976d2",
          mb: 3,
          position: "relative",
          boxShadow:
            theme.palette.mode === "dark"
              ? "0 6px 18px rgba(0,0,0,0.6)"
              : "0 6px 18px rgba(0,0,0,0.08)",
        }}
      >
        <LockOutlined sx={{ fontSize: 34, color: "white" }} />
      </Box>
      <Typography
        variant="h5"
        fontWeight={700}
        gutterBottom
        sx={{
          color: "#1976d2",
          mb: 1,
        }}
      >
        God Access Portal
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          fontSize: "0.95rem",
          letterSpacing: "0.5px",
        }}
      >
        Supreme Administrative Control
      </Typography>
    </Box>
  );
};

export default GodLoginHeader;
