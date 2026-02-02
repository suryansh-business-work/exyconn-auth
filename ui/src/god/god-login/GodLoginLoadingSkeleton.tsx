import React from "react";
import { Box, Skeleton } from "@mui/material";

const GodLoginLoadingSkeleton: React.FC = () => {
  return (
    <Box sx={{ width: "100%", maxWidth: 450 }}>
      <Skeleton
        variant="rectangular"
        width={80}
        height={80}
        sx={{ borderRadius: "16px", mb: 3, mx: "auto" }}
      />
      <Skeleton
        variant="text"
        sx={{ fontSize: "2.5rem", mb: 1, mx: "auto", width: "60%" }}
      />
      <Skeleton
        variant="text"
        sx={{ fontSize: "1rem", mb: 4, mx: "auto", width: "40%" }}
      />
      <Skeleton
        variant="rectangular"
        height={56}
        sx={{ borderRadius: 2, mb: 2 }}
      />
      <Skeleton
        variant="rectangular"
        height={150}
        sx={{ borderRadius: 2, mb: 3 }}
      />
      <Skeleton
        variant="rectangular"
        height={56}
        sx={{ borderRadius: 2, mb: 2 }}
      />
      <Skeleton variant="rectangular" height={48} sx={{ borderRadius: 2 }} />
    </Box>
  );
};

export default GodLoginLoadingSkeleton;
