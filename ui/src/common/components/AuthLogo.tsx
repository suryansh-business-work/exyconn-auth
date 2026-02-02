import React from "react";
import { Box } from "@mui/material";
import { Organization } from "../../types/organization";

interface AuthLogoProps {
  organization: Organization | null;
  size?: number;
}

const AuthLogo: React.FC<AuthLogoProps> = ({ organization, size }) => {
  if (!organization?.orgLogos || organization.orgLogos.length === 0) {
    return null;
  }

  // Find the default logo, fallback to first logo
  const defaultLogo =
    organization.orgLogos.find((logo: any) => logo.isDefault) ||
    organization.orgLogos[0];

  if (!defaultLogo) {
    return null;
  }

  // Parse actual size from logo.size (e.g., "128x128" -> 128) or use provided size
  let displaySize = size || 80;
  if (!size && defaultLogo.size) {
    const parsedSize = parseInt(defaultLogo.size.split("x")[0], 10);
    if (!isNaN(parsedSize) && parsedSize > 0) {
      displaySize = Math.min(parsedSize, 256); // Cap at 256 for display
    }
  }

  return (
    <Box
      sx={{
        mx: "auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        maxWidth: 128,
        maxHeight: 128,
        mb: 3,
      }}
    >
      <img
        src={defaultLogo.url}
        alt={organization.orgName || "logo"}
        style={{
          maxWidth: displaySize,
          objectFit: "contain",
        }}
      />
    </Box>
  );
};

export default AuthLogo;
