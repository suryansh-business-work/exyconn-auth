import React from "react";
import { Box, Card, CardContent, Skeleton } from "@mui/material";

interface GodPageContainerProps {
  children: React.ReactNode;
  loading?: boolean;
  maxWidth?: string | number;
}

const GodPageContainer: React.FC<GodPageContainerProps> = ({
  children,
  loading = false,
  maxWidth = "xl",
}) => {
  if (loading) {
    return (
      <Box sx={{ maxWidth, mx: "auto", p: 3 }}>
        <Skeleton
          variant="rectangular"
          height={120}
          sx={{ mb: 3, borderRadius: 1 }}
        />
        <Card>
          <CardContent>
            <Skeleton variant="rectangular" height={400} />
          </CardContent>
        </Card>
      </Box>
    );
  }

  return <Box sx={{ maxWidth, mx: "auto", p: 3 }}>{children}</Box>;
};

export default GodPageContainer;
