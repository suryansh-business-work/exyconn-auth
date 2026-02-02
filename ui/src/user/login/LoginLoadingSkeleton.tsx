import React from "react";
import { Grid, Box, Skeleton } from "@mui/material";

const LoginLoadingSkeleton: React.FC = () => {
  return (
    <Grid container sx={{ minHeight: "100vh" }}>
      {/* Left Panel Skeleton - Desktop only */}
      <Grid
        item
        xs={12}
        md={7.2}
        sx={{
          display: { xs: "none", md: "flex" },
          position: "relative",
          alignItems: "center",
          justifyContent: "center",
          p: 6,
        }}
      >
        <Skeleton
          variant="rectangular"
          sx={{
            position: "absolute",
            inset: 0,
            borderRadius: 0,
          }}
        />
        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            textAlign: "center",
            maxWidth: 600,
          }}
        >
          <Skeleton
            variant="text"
            width="80%"
            height={60}
            sx={{ mx: "auto", mb: 2 }}
          />
          <Skeleton
            variant="text"
            width="60%"
            height={30}
            sx={{ mx: "auto" }}
          />
        </Box>
      </Grid>

      {/* Right Panel Skeleton */}
      <Grid
        item
        xs={12}
        md={4.8}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 3, sm: 4, md: 5 },
          minHeight: { xs: "100vh", md: "auto" },
          bgcolor: "background.default",
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 440, px: { xs: 1, sm: 0 } }}>
          <Box
            sx={{
              bgcolor: "background.paper",
              borderRadius: 4,
              p: { xs: 4, sm: 5 },
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <Skeleton
                variant="circular"
                width={72}
                height={72}
                sx={{ mx: "auto", mb: 2 }}
              />
              <Skeleton
                variant="text"
                width="60%"
                height={40}
                sx={{ mx: "auto", mb: 1 }}
              />
              <Skeleton
                variant="text"
                width="40%"
                height={24}
                sx={{ mx: "auto" }}
              />
            </Box>
            <Skeleton variant="rounded" height={56} sx={{ mb: 2.5 }} />
            <Skeleton variant="rounded" height={56} sx={{ mb: 2 }} />
            <Skeleton variant="rounded" height={48} sx={{ mb: 2 }} />
            <Skeleton variant="text" width="100%" height={24} sx={{ mb: 1 }} />
            <Skeleton variant="rounded" height={48} />
            <Box sx={{ mt: 4, textAlign: "center" }}>
              <Skeleton
                variant="text"
                width="50%"
                height={20}
                sx={{ mx: "auto", mb: 1 }}
              />
              <Skeleton
                variant="text"
                width="40%"
                height={20}
                sx={{ mx: "auto" }}
              />
            </Box>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
};

export default LoginLoadingSkeleton;
