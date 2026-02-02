import { Box, Button, Container, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Home, ArrowBack } from "@mui/icons-material";
import { usePageTitle } from "@exyconn/common/client/hooks";

const NotFound = () => {
  const navigate = useNavigate();
  usePageTitle("Page Not Found");

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          textAlign: "center",
          gap: 3,
        }}
      >
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: "6rem", md: "10rem" },
            fontWeight: "bold",
            background: "linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          404
        </Typography>

        <Typography variant="h4" gutterBottom>
          Oops! Page Not Found
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 4, maxWidth: 500 }}
        >
          The page you're looking for doesn't exist or has been moved. Let's get
          you back on track.
        </Typography>

        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate(-1)}
            size="large"
          >
            Go Back
          </Button>
          <Button
            variant="contained"
            startIcon={<Home />}
            onClick={() => navigate("/")}
            size="large"
          >
            Go Home
          </Button>
        </Box>

        <Box
          sx={{
            mt: 6,
            opacity: 0.3,
            fontSize: "8rem",
            userSelect: "none",
          }}
        >
          🔍
        </Box>
      </Box>
    </Container>
  );
};

export default NotFound;
