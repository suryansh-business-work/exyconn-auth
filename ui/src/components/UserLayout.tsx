import React from "react";
import UserHeader from "./UserHeader";
import { Box } from "@mui/material";
import { useOrganization } from "../contexts/OrganizationContext";
import useCustomInjection from "../hooks/useCustomInjection";

interface UserLayoutProps {
  children: React.ReactNode;
}

const UserLayout: React.FC<UserLayoutProps> = ({ children }) => {
  const { orgDetails } = useOrganization();

  // Inject custom CSS, HTML, and JavaScript
  useCustomInjection({
    customCss: orgDetails?.customCss,
    customHtml: orgDetails?.customHtml,
    customJs: orgDetails?.customJs,
  });

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <UserHeader />
      <Box>{children}</Box>
    </Box>
  );
};

export default UserLayout;
