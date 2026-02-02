import React from "react";
import { Link } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

const GodAccessLink: React.FC = () => {
  return (
    <Link
      component={RouterLink}
      to="/login/god"
      underline="none"
      sx={{
        color: "text.secondary",
        fontWeight: 500,
        fontSize: "0.85rem",
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
        "&:hover": {
          color: "primary.main",
          textDecoration: "underline",
          transform: "scale(1.02)",
        },
        transition: "all 0.2s ease-in-out",
      }}
    >
      God Access
    </Link>
  );
};

export default GodAccessLink;
