import React from "react";
import { Grid, Box, Typography, Fade, keyframes } from "@mui/material";
import { Organization } from "../../types/organization";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Subtle floating animation
const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
`;

const float2 = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-15px) rotate(-3deg); }
`;

interface LoginBrandingPanelProps {
  organization: Organization | null;
  customText: {
    title: string;
    slogan: string;
  };
}

const LoginBrandingPanel: React.FC<LoginBrandingPanelProps> = ({
  organization,
  customText,
}) => {
  const primaryColor = organization?.orgTheme?.primaryColor || "#1976d2";
  const bgImages = organization?.loginBgImages || [];
  const hasMultipleImages = bgImages.length > 1;
  const hasBackgroundImage = bgImages.length > 0;

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    fade: true,
    arrows: false,
    appendDots: (dots: any) => (
      <Box
        sx={{
          bottom: "24px !important",
          display: "flex !important",
          justifyContent: "center",
          "& li": {
            margin: "0 4px",
            width: "auto",
            height: "auto",
          },
          "& li button": {
            width: "10px",
            height: "10px",
            padding: 0,
            borderRadius: "50%",
            bgcolor: "rgba(255,255,255,0.4)",
            transition: "all 0.3s ease",
            "&:before": { display: "none" },
          },
          "& li.slick-active button": {
            bgcolor: "white",
            transform: "scale(1.2)",
          },
        }}
      >
        <ul style={{ margin: 0, padding: 0, display: "flex" }}> {dots} </ul>
      </Box>
    ),
  };

  return (
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
        overflow: "hidden",
        bgcolor: "background.default",
      }}
    >
      {/* Background Layer */}
      <Box sx={{ position: "absolute", inset: 0, zIndex: 0 }}>
        {hasMultipleImages ? (
          <Slider {...sliderSettings}>
            {bgImages.map((img, index) => (
              <Box
                key={index}
                sx={{
                  height: "100vh",
                  width: "100%",
                  backgroundImage: `url(${img.url})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
            ))}
          </Slider>
        ) : (
          <Box
            sx={{
              height: "100%",
              width: "100%",
              backgroundImage: hasBackgroundImage
                ? `url(${bgImages[0]?.url})`
                : `linear-gradient(135deg, ${primaryColor} 0%, ${adjustColor(primaryColor, -30)} 50%, ${adjustColor(primaryColor, -50)} 100%)`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        )}

        {/* Overlay */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: hasBackgroundImage
              ? "linear-gradient(135deg, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0.3) 100%)"
              : "transparent",
            zIndex: 1,
            pointerEvents: "none",
          }}
        />
      </Box>

      {/* Decorative Shapes - Only when no background image */}
      {!hasBackgroundImage && (
        <>
          <Box
            sx={{
              position: "absolute",
              top: "15%",
              right: "10%",
              width: 120,
              height: 120,
              borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%",
              background: "rgba(255,255,255,0.08)",
              animation: `${float} 8s ease-in-out infinite`,
              zIndex: 1,
            }}
          />
          <Box
            sx={{
              position: "absolute",
              bottom: "20%",
              left: "15%",
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.06)",
              animation: `${float2} 6s ease-in-out infinite`,
              zIndex: 1,
            }}
          />
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "5%",
              width: 200,
              height: 200,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.03)",
              zIndex: 1,
            }}
          />
        </>
      )}

      {/* Content */}
      <Fade in timeout={800}>
        <Box
          sx={{
            position: "relative",
            zIndex: 2,
            color: "common.white",
            textAlign: "center",
            maxWidth: 550,
            px: 4,
          }}
        >
          {/* Logo if available */}
          {organization?.orgLogos && organization.orgLogos.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Box
                component="img"
                src={
                  (
                    organization.orgLogos.find((l: any) => l.isDefault) ||
                    organization.orgLogos[0]
                  ).url
                }
                alt={organization.orgName}
                sx={{
                  maxWidth: 180,
                  maxHeight: 80,
                  objectFit: "contain",
                  opacity: 0.95,
                }}
              />
            </Box>
          )}

          <Typography
            variant="h2"
            sx={{
              color: "white",
              fontWeight: 700,
              mb: 2,
              fontSize: { xs: "2rem", md: "2.75rem", lg: "3.25rem" },
              lineHeight: 1.2,
              letterSpacing: "-0.5px",
            }}
          >
            {customText.title}
          </Typography>

          {customText.slogan && (
            <Typography
              variant="h6"
              sx={{
                mt: 2,
                fontSize: { md: "1.1rem", lg: "1.25rem" },
                fontWeight: 400,
                opacity: 0.85,
                lineHeight: 1.6,
                maxWidth: 450,
                mx: "auto",
              }}
            >
              {customText.slogan}
            </Typography>
          )}

          {/* Feature highlights */}
          <Box
            sx={{
              mt: 5,
              display: "flex",
              justifyContent: "center",
              gap: 4,
              flexWrap: "wrap",
            }}
          >
            {[
              { icon: "🔒", label: "Secure" },
              { icon: "⚡", label: "Fast" },
              { icon: "🛡️", label: "Protected" },
            ].map((item) => (
              <Box
                key={item.label}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  opacity: 0.8,
                }}
              >
                <Typography sx={{ fontSize: "1.25rem" }}>
                  {item.icon}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {item.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Fade>
    </Grid>
  );
};

// Helper function to adjust color brightness
function adjustColor(color: string, amount: number): string {
  const hex = color.replace("#", "");
  const r = Math.max(0, Math.min(255, parseInt(hex.slice(0, 2), 16) + amount));
  const g = Math.max(0, Math.min(255, parseInt(hex.slice(2, 4), 16) + amount));
  const b = Math.max(0, Math.min(255, parseInt(hex.slice(4, 6), 16) + amount));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

export default LoginBrandingPanel;
