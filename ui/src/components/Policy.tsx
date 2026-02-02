import React from "react";
import { Link as RouterLink, useSearchParams } from "react-router-dom";
import { Link, Typography, Box, Tooltip } from "@mui/material";
import { OpenInNew as ExternalIcon } from "@mui/icons-material";
import { useOrganization } from "../contexts/OrganizationContext";

interface OrgPolicy {
  policyName: string;
  policyLink: string;
}

interface PolicyLinkProps {
  label: string;
  externalUrl: string | undefined;
  internalPath: string;
  buildLink: (path: string) => string;
  showSeparator?: boolean;
}

// Individual Policy Link Component
const PolicyLink: React.FC<PolicyLinkProps> = ({
  label,
  externalUrl,
  internalPath,
  buildLink,
  showSeparator = true,
}) => {
  const isExternal = Boolean(externalUrl);

  // Check if URL is truly external (not same domain)
  const isExternalDomain =
    isExternal &&
    (() => {
      try {
        const url = new URL(externalUrl!);
        return url.hostname !== window.location.hostname;
      } catch {
        return false;
      }
    })();

  const linkContent = (
    <Box
      component="span"
      sx={{ display: "inline-flex", alignItems: "center", gap: 0.3 }}
    >
      {label}
      {isExternalDomain && (
        <Tooltip title="Opens in new tab">
          <ExternalIcon sx={{ fontSize: 12, opacity: 0.7 }} />
        </Tooltip>
      )}
    </Box>
  );

  if (isExternal) {
    return (
      <>
        <Link
          href={externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            color: "text.secondary",
            textDecoration: "none",
            "&:hover": {
              color: "primary.main",
              textDecoration: "underline",
            },
          }}
        >
          {linkContent}
        </Link>
        {showSeparator && " | "}
      </>
    );
  }

  return (
    <>
      <Link
        component={RouterLink}
        to={buildLink(internalPath)}
        sx={{
          color: "text.secondary",
          textDecoration: "none",
          "&:hover": {
            color: "primary.main",
            textDecoration: "underline",
          },
        }}
      >
        {linkContent}
      </Link>
      {showSeparator && " | "}
    </>
  );
};

const Policy: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { orgDetails } = useOrganization();
  const companyParam = searchParams.get("company");

  const buildLink = (path: string) =>
    companyParam ? `${path}?company=${companyParam}` : path;

  // Get configured policy links
  const policies = (orgDetails as any)?.orgPoliciesLink as
    | OrgPolicy[]
    | undefined;

  // Map policy names to their configured URLs
  const policyMap = {
    termsAndConditions: policies?.find(
      (p) => p.policyName === "termsAndConditions",
    )?.policyLink,
    privacyPolicy: policies?.find((p) => p.policyName === "privacyPolicy")
      ?.policyLink,
    dataPolicy: policies?.find((p) => p.policyName === "dataPolicy")
      ?.policyLink,
    cookiePolicy: policies?.find((p) => p.policyName === "cookiePolicy")
      ?.policyLink,
    refundPolicy: policies?.find((p) => p.policyName === "refundPolicy")
      ?.policyLink,
  };

  // Build dynamic policy links array (only show configured ones + defaults)
  const policyLinks = [
    {
      label: "Privacy Policy",
      url: policyMap.privacyPolicy,
      internalPath: "/privacy",
      show: true,
    },
    {
      label: "Terms of Service",
      url: policyMap.termsAndConditions,
      internalPath: "/terms",
      show: true,
    },
    {
      label: "Data Policy",
      url: policyMap.dataPolicy,
      internalPath: "/data-policy",
      show: Boolean(policyMap.dataPolicy),
    },
    {
      label: "Cookie Policy",
      url: policyMap.cookiePolicy,
      internalPath: "/cookies",
      show: Boolean(policyMap.cookiePolicy),
    },
    {
      label: "Refund Policy",
      url: policyMap.refundPolicy,
      internalPath: "/refund",
      show: Boolean(policyMap.refundPolicy),
    },
  ].filter((p) => p.show);

  return (
    <Box sx={{ mt: 2, textAlign: "center" }}>
      <Typography variant="body2" color="text.secondary">
        {policyLinks.map((policy, index) => (
          <PolicyLink
            key={policy.label}
            label={policy.label}
            externalUrl={policy.url}
            internalPath={policy.internalPath}
            buildLink={buildLink}
            showSeparator={index < policyLinks.length - 1}
          />
        ))}
      </Typography>
    </Box>
  );
};

export default Policy;
