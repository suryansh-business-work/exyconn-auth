import React from "react";
import { Grid, Box, Skeleton, Card, Fade, Grow } from "@mui/material";
import { useOrganization } from "../../contexts/OrganizationContext";
import useCustomInjection from "../../hooks/useCustomInjection";

/**
 * AuthContainer - Common container for all authentication pages EXCEPT Login.
 *
 * This component provides a consistent, unified design for:
 * - Signup page
 * - Forgot Password page
 * - Reset Password page
 * - Verify OTP page
 *
 * NOTE: The Login page is the ONLY page with design variance (classic, minimal, split).
 * All other auth pages use this common container for consistency.
 */
interface AuthContainerProps {
  children: React.ReactNode;
  loading?: boolean;
  maxWidth?: number;
  useCard?: boolean;
}

const AuthContainer: React.FC<AuthContainerProps> = ({
  children,
  loading = false,
  maxWidth = 440,
  useCard = true,
}) => {
  const { orgDetails } = useOrganization();

  // Inject custom CSS, HTML, and JavaScript
  useCustomInjection({
    customCss: orgDetails?.customCss,
    customHtml: orgDetails?.customHtml,
    customJs: orgDetails?.customJs,
  });

  if (loading) {
    return (
      <Grid
        container
        sx={{ minHeight: "100vh", bgcolor: "background.default" }}
      >
        <Grid
          item
          xs={12}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: { xs: 2, sm: 3 },
          }}
        >
          <Box sx={{ width: "100%", maxWidth }}>
            <Skeleton
              variant="circular"
              width={80}
              height={80}
              sx={{ mx: "auto", mb: 2 }}
            />
            <Skeleton variant="text" width="50%" sx={{ mx: "auto", mb: 1 }} />
            <Skeleton variant="text" width="35%" sx={{ mx: "auto", mb: 2 }} />
            <Skeleton variant="rounded" height={48} sx={{ mb: 1.5 }} />
            <Skeleton variant="rounded" height={48} sx={{ mb: 1.5 }} />
            <Skeleton variant="rounded" height={40} />
          </Box>
        </Grid>
      </Grid>
    );
  }

  const content = <Box sx={{ width: "100%", maxWidth }}>{children}</Box>;

  return (
    <Grid
      container
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "40%",
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.02) 0%, transparent 100%)",
          pointerEvents: "none",
        },
      }}
    >
      <Grid
        item
        xs={12}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 2, sm: 3 },
          position: "relative",
          zIndex: 1,
        }}
      >
        <Fade in timeout={600}>
          <Box sx={{ width: "100%", maxWidth }}>
            {useCard ? (
              <Grow in timeout={400}>
                <Card
                  elevation={0}
                  sx={{
                    width: "100%",
                    maxWidth,
                    p: { xs: 4, sm: 5 },
                    borderRadius: 4,
                    border: "1px solid",
                    borderColor: "divider",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.06)",
                    transition: "box-shadow 0.3s ease",
                    "&:hover": {
                      boxShadow: "0 12px 48px rgba(0, 0, 0, 0.1)",
                    },
                  }}
                >
                  {children}
                </Card>
              </Grow>
            ) : (
              content
            )}
          </Box>
        </Fade>
      </Grid>
    </Grid>
  );
};

export default AuthContainer;
