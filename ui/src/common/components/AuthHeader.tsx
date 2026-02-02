import React from "react";
import { Box, Typography } from "@mui/material";

interface AuthHeaderProps {
  orgName?: string;
  title?: string;
  subtitle?: string;
}

const AuthHeader: React.FC<AuthHeaderProps> = ({
  orgName,
  title,
  subtitle,
}) => {
  return (
    <Box sx={{ textAlign: "center", mb: 4 }}>
      {title && (
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            mb: 1,
            color: "text.primary",
            fontSize: "1.75rem",
          }}
        >
          {title}
        </Typography>
      )}
      {subtitle && (
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            mb: 0.5,
            fontSize: "0.9375rem",
          }}
        >
          {subtitle}
        </Typography>
      )}
      {orgName && !title && (
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: "text.primary",
            fontSize: "1.75rem",
          }}
        >
          {orgName}
        </Typography>
      )}
    </Box>
  );
};

export default AuthHeader;
