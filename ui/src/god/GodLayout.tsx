import React from "react";
import { Box } from "@mui/material";

interface GodLayoutProps {
  children: React.ReactNode;
}

const GodLayout: React.FC<GodLayoutProps> = ({ children }) => {
  return <Box sx={{ width: "100%" }}>{children}</Box>;
};

export default GodLayout;
