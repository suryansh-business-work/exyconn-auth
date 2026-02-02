import React from "react";
import { useFormikContext } from "formik";
import {
  Grid,
  Typography,
  Box,
  Fade,
  Card,
  CardContent,
  CardActionArea,
  alpha,
} from "@mui/material";
import { Brush, CheckCircle } from "@mui/icons-material";
import { OrganizationFormData, LoginPageDesign } from "./types";

const loginPageDesigns: LoginPageDesign[] = [
  {
    id: "split",
    name: "Split Screen",
    description: "Modern split layout with branding on left, form on right",
  },
  {
    id: "classic",
    name: "Classic",
    description: "Traditional centered form with background image",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Clean and simple design with focus on content",
  },
];

// Visual preview component for each design
const DesignPreview: React.FC<{ designId: string; isSelected: boolean }> = ({
  designId,
  isSelected,
}) => {
  const primaryColor = isSelected ? "#1976d2" : "#9e9e9e";
  const bgColor = isSelected ? alpha("#1976d2", 0.1) : "#f5f5f5";

  if (designId === "split") {
    return (
      <Box
        sx={{
          display: "flex",
          height: "100%",
          borderRadius: 0.5,
          overflow: "hidden",
          border: "1px solid",
          borderColor: "grey.300",
        }}
      >
        {/* Left branding panel */}
        <Box
          sx={{
            width: "55%",
            bgcolor: primaryColor,
            p: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              width: 16,
              height: 16,
              bgcolor: "rgba(255,255,255,0.8)",
              borderRadius: 0.5,
              mb: 1,
            }}
          />
          <Box
            sx={{
              width: "80%",
              height: 6,
              bgcolor: "rgba(255,255,255,0.6)",
              borderRadius: 0.5,
              mb: 0.5,
            }}
          />
          <Box
            sx={{
              width: "60%",
              height: 4,
              bgcolor: "rgba(255,255,255,0.4)",
              borderRadius: 0.5,
            }}
          />
        </Box>
        {/* Right form panel */}
        <Box
          sx={{
            width: "45%",
            bgcolor: bgColor,
            p: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              width: 12,
              height: 12,
              bgcolor: "grey.400",
              borderRadius: 0.5,
              mb: 1,
            }}
          />
          <Box
            sx={{
              width: "80%",
              height: 5,
              bgcolor: "grey.300",
              borderRadius: 0.5,
              mb: 0.5,
            }}
          />
          <Box
            sx={{
              width: "80%",
              height: 5,
              bgcolor: "grey.300",
              borderRadius: 0.5,
              mb: 0.5,
            }}
          />
          <Box
            sx={{
              width: "80%",
              height: 8,
              bgcolor: primaryColor,
              borderRadius: 0.5,
            }}
          />
        </Box>
      </Box>
    );
  }

  if (designId === "classic") {
    return (
      <Box
        sx={{
          height: "100%",
          bgcolor: primaryColor,
          borderRadius: 0.5,
          p: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid",
          borderColor: "grey.300",
        }}
      >
        {/* Centered form card */}
        <Box
          sx={{
            width: "60%",
            bgcolor: "white",
            borderRadius: 0.5,
            p: 1,
            boxShadow: 1,
          }}
        >
          <Box
            sx={{
              width: 14,
              height: 14,
              bgcolor: "grey.300",
              borderRadius: 0.5,
              mx: "auto",
              mb: 0.5,
            }}
          />
          <Box
            sx={{
              width: "90%",
              height: 4,
              bgcolor: "grey.200",
              borderRadius: 0.5,
              mx: "auto",
              mb: 0.3,
            }}
          />
          <Box
            sx={{
              width: "90%",
              height: 4,
              bgcolor: "grey.200",
              borderRadius: 0.5,
              mx: "auto",
              mb: 0.3,
            }}
          />
          <Box
            sx={{
              width: "90%",
              height: 6,
              bgcolor: primaryColor,
              borderRadius: 0.5,
              mx: "auto",
            }}
          />
        </Box>
      </Box>
    );
  }

  // Minimal
  return (
    <Box
      sx={{
        height: "100%",
        bgcolor: bgColor,
        borderRadius: 0.5,
        p: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "1px solid",
        borderColor: "grey.300",
      }}
    >
      {/* Simple centered form */}
      <Box sx={{ width: "70%", textAlign: "center" }}>
        <Box
          sx={{
            width: 16,
            height: 16,
            bgcolor: "grey.400",
            borderRadius: 0.5,
            mx: "auto",
            mb: 1,
          }}
        />
        <Box
          sx={{
            width: "100%",
            height: 5,
            bgcolor: "grey.300",
            borderRadius: 0.5,
            mb: 0.5,
          }}
        />
        <Box
          sx={{
            width: "100%",
            height: 5,
            bgcolor: "grey.300",
            borderRadius: 0.5,
            mb: 0.5,
          }}
        />
        <Box
          sx={{
            width: "100%",
            height: 8,
            bgcolor: primaryColor,
            borderRadius: 0.5,
          }}
        />
      </Box>
    </Box>
  );
};

const LoginDesignForm: React.FC = () => {
  const { values, setFieldValue } = useFormikContext<OrganizationFormData>();

  return (
    <Fade in timeout={300}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <Brush color="primary" />
            <Typography variant="h6">Login Page Design</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Select a login page design template. All designs are fully
            responsive.
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Available Designs
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Grid container spacing={2}>
            {loginPageDesigns.map((design) => {
              const isSelected = values.loginPageDesign === design.id;
              return (
                <Grid item xs={12} sm={6} md={4} key={design.id}>
                  <Card
                    sx={{
                      position: "relative",
                      height: "100%",
                      border: isSelected ? 2 : 1,
                      borderColor: isSelected ? "primary.main" : "divider",
                      backgroundColor: isSelected
                        ? alpha("#1976d2", 0.03)
                        : "background.paper",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        borderColor: "primary.main",
                        boxShadow: 2,
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    <CardActionArea
                      onClick={() =>
                        setFieldValue("loginPageDesign", design.id)
                      }
                      sx={{ height: "100%", p: 2 }}
                    >
                      {/* Design Preview */}
                      <Box
                        sx={{
                          height: 120,
                          mb: 2,
                          position: "relative",
                        }}
                      >
                        <DesignPreview
                          designId={design.id}
                          isSelected={isSelected}
                        />
                        {isSelected && (
                          <Box
                            sx={{
                              position: "absolute",
                              top: 6,
                              right: 6,
                              backgroundColor: "primary.main",
                              borderRadius: "50%",
                              p: 0.3,
                              display: "flex",
                              boxShadow: 1,
                            }}
                          >
                            <CheckCircle
                              sx={{ color: "white", fontSize: 16 }}
                            />
                          </Box>
                        )}
                      </Box>
                      <CardContent sx={{ p: 0 }}>
                        <Typography
                          variant="body2"
                          fontWeight="600"
                          gutterBottom
                        >
                          {design.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ lineHeight: 1.4 }}
                        >
                          {design.description}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <Box
            sx={{
              mt: 1,
              p: 2,
              bgcolor: "grey.50",
              border: "1px solid",
              borderColor: "grey.200",
              borderRadius: 1,
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              <strong>Split:</strong> Branding panel on left, login form on
              right - best for brand visibility
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              sx={{ mt: 0.5 }}
            >
              <strong>Classic:</strong> Centered form over background image -
              traditional approach
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              sx={{ mt: 0.5 }}
            >
              <strong>Minimal:</strong> Clean, simple design - best for quick,
              focused login
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Fade>
  );
};

export default LoginDesignForm;
