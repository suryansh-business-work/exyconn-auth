import React from "react";
import { Container, Typography, Paper, Box, Divider } from "@mui/material";
import { useSearchParams, Link } from "react-router-dom";
import { usePageTitle } from "@exyconn/common/client/hooks";

const TermsOfService: React.FC = () => {
  const [searchParams] = useSearchParams();
  usePageTitle("Terms of Service");
  const companyParam = searchParams.get("company");
  const buildLink = (path: string) =>
    companyParam ? `${path}?company=${companyParam}` : path;

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper elevation={2} sx={{ p: 4 }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
          Terms of Service
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
              1. Acceptance of Terms
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              By accessing and using this service, you accept and agree to be
              bound by the terms and provisions of this agreement. If you do not
              agree to these terms, please do not use our services.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              2. Use of Service
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              You agree to use the service only for lawful purposes and in
              accordance with these Terms. You agree not to:
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              component="ul"
              sx={{ pl: 2 }}
            >
              <li>
                Use the service in any way that violates applicable laws or
                regulations
              </li>
              <li>
                Attempt to gain unauthorized access to any part of the service
              </li>
              <li>Interfere with or disrupt the service or servers</li>
              <li>Transmit any viruses, malware, or harmful code</li>
              <li>Impersonate another user or provide false information</li>
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              3. User Accounts
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              When you create an account, you must provide accurate and complete
              information. You are responsible for:
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              component="ul"
              sx={{ pl: 2 }}
            >
              <li>Maintaining the security of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized use</li>
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              4. Intellectual Property
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              The service and its original content, features, and functionality
              are owned by us and are protected by international copyright,
              trademark, and other intellectual property laws.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              5. Termination
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              We may terminate or suspend your account and access to the service
              immediately, without prior notice, for any reason, including
              breach of these Terms.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              6. Limitation of Liability
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              In no event shall we be liable for any indirect, incidental,
              special, consequential, or punitive damages resulting from your
              use of or inability to use the service.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              7. Changes to Terms
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              We reserve the right to modify these terms at any time. We will
              notify users of any material changes via email or through the
              service.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              8. Contact Information
            </Typography>
            <Typography variant="body1" color="text.secondary">
              For questions about these Terms, please contact us at
              legal@example.com
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

export default TermsOfService;
