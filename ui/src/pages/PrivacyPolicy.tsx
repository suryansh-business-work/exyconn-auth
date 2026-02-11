import React from "react";
import { Container, Typography, Paper, Box, Divider } from "@mui/material";
import { useSearchParams, Link } from "react-router-dom";
import { usePageTitle } from "../lib/hooks";

const PrivacyPolicy: React.FC = () => {
  const [searchParams] = useSearchParams();
  usePageTitle("Privacy Policy");
  const companyParam = searchParams.get("company");
  const buildLink = (path: string) =>
    companyParam ? `${path}?company=${companyParam}` : path;

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper elevation={2} sx={{ p: 4 }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
          Privacy Policy
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mb: 4, display: "block" }}
        >
          Last updated: December 22, 2025
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ "& > *": { mb: 3 } }}>
          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              1. Information We Collect
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              We collect information that you provide directly to us, including:
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              component="ul"
              sx={{ pl: 2 }}
            >
              <li>Name, email address, and contact information</li>
              <li>Account credentials and authentication data</li>
              <li>Profile information and preferences</li>
              <li>Communication data when you contact us</li>
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              2. How We Use Your Information
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              We use the information we collect to:
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              component="ul"
              sx={{ pl: 2 }}
            >
              <li>Provide, maintain, and improve our services</li>
              <li>Process your authentication and account management</li>
              <li>Send you technical notices and security alerts</li>
              <li>Respond to your requests and provide customer support</li>
              <li>Protect against fraudulent or illegal activity</li>
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              3. Information Sharing
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              We do not sell your personal information. We may share your
              information only in the following circumstances:
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              component="ul"
              sx={{ pl: 2 }}
            >
              <li>With your consent or at your direction</li>
              <li>With service providers who assist in our operations</li>
              <li>To comply with legal obligations</li>
              <li>To protect our rights and prevent fraud</li>
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              4. Data Security
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              We implement appropriate technical and organizational measures to
              protect your personal information against unauthorized access,
              alteration, disclosure, or destruction.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              5. Your Rights
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              You have the right to:
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              component="ul"
              sx={{ pl: 2 }}
            >
              <li>Access and update your personal information</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of marketing communications</li>
              <li>Export your data</li>
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              6. Contact Us
            </Typography>
            <Typography variant="body1" color="text.secondary">
              If you have questions about this Privacy Policy, please contact us
              at privacy@example.com
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ textAlign: "center" }}>
          <Link
            to={buildLink("/")}
            style={{ color: "inherit", textDecoration: "none" }}
          >
            <Typography
              variant="body2"
              color="primary"
              sx={{ "&:hover": { textDecoration: "underline" } }}
            >
              Back to Login
            </Typography>
          </Link>
        </Box>
      </Paper>
    </Container>
  );
};

export default PrivacyPolicy;
