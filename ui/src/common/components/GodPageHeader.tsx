import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  SxProps,
  Theme,
} from "@mui/material";

interface IconProps {
  sx?: SxProps<Theme>;
}

interface GodPageHeaderProps {
  icon: React.ReactElement<IconProps>;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

const GodPageHeader: React.FC<GodPageHeaderProps> = ({
  icon,
  title,
  subtitle,
  actions,
}) => {
  return (
    <Card
      elevation={0}
      sx={{
        mb: 4,
        background: (theme) =>
          `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        color: "white",
      }}
    >
      <CardContent sx={{ py: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={2}>
            {React.cloneElement(icon, { sx: { fontSize: 40 } })}
            <Box>
              <Typography variant="h4" component="h1" fontWeight="bold">
                {title}
              </Typography>
              {subtitle && (
                <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                  {subtitle}
                </Typography>
              )}
            </Box>
          </Box>
          {actions && (
            <Box display="flex" gap={2}>
              {actions}
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default GodPageHeader;
