import React from "react";
import { Box, Typography, useTheme } from "@mui/material";

const GodLoginVideoPanel: React.FC = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        flex: "0 0 60vw",
        position: "relative",
        backgroundColor: theme.palette.mode === "dark" ? "#000" : "#f6f7fb",
      }}
    >
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          position: "absolute",
          top: 0,
          left: 0,
        }}
      >
        <source src="/assets/video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <Box
        sx={{
          right: 100,
          bottom: 20,
          maxWidth: 520,
          borderRadius: 2,
          p: { xs: 2, md: 3 },
          pointerEvents: "none",
          overflow: "hidden",
          backdropFilter: "blur(13px)",
          WebkitBackdropFilter: "blur(13px)",
          backgroundColor:
            theme.palette.mode === "dark"
              ? "rgba(255,255,255,0.04)"
              : "rgba(255,255,255,0.28)",
          border:
            theme.palette.mode === "dark"
              ? "1px solid rgba(255,255,255,0.06)"
              : "1px solid rgba(255,255,255,0.3)",
          boxShadow:
            theme.palette.mode === "dark"
              ? "0 8px 30px rgba(0,0,0,0.6)"
              : "0 8px 30px rgba(16,24,40,0.08)",
          position: "absolute",
        }}
      >
        <Typography
          variant="subtitle1"
          fontWeight={600}
          gutterBottom
          sx={{
            mb: 0.5,
            fontSize: "1rem",
            color: theme.palette.mode === "dark" ? "#fff" : "rgba(0,0,0,0.85)",
          }}
        >
          Supreme Control Panel
        </Typography>
        <Typography
          variant="body2"
          sx={{
            maxWidth: 520,
            textAlign: "left",
            fontSize: "0.85rem",
            opacity: 0.95,
            color:
              theme.palette.mode === "dark"
                ? "rgba(255,255,255,0.9)"
                : "rgba(0,0,0,0.85)",
          }}
        >
          Complete oversight of all organizations, users, and system
          configurations
        </Typography>
      </Box>
    </Box>
  );
};

export default GodLoginVideoPanel;
