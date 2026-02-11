import { logger } from "../../common";
import {
  resolveRedirectionUrl,
  appendTokenToUrl,
  RedirectionResult,
} from "../../common/redirection.service";
import { IOrgRedirectionSetting } from "../../god/organization/organization-forms/merged-interface-index";

// Helper to extract organization email config
export const getOrgEmailConfig = (company: any) => ({
  smtpSettings: company.smtpSettings,
  orgTheme: company.orgTheme,
  orgLogos: company.orgLogos,
  orgName: company.orgName,
  orgEmail: company.orgEmail,
  emailTemplates: company.emailTemplates,
});

/**
 * Compute redirection URL based on user role and current auth page
 */
export interface ComputedRedirection {
  redirectionUrl: string;
  tokenAppendedUrl: string;
  matchType: RedirectionResult["matchType"];
}

export const computeRedirectionUrl = (
  settings: IOrgRedirectionSetting[] | undefined,
  userRole: string,
  authPageUrl: string,
  token: string,
  tokenExpiry?: number,
): ComputedRedirection => {
  const result = resolveRedirectionUrl(
    settings,
    userRole,
    authPageUrl,
    "/profile",
  );
  const tokenAppendedUrl = appendTokenToUrl(result.url, token, tokenExpiry);

  return {
    redirectionUrl: result.url,
    tokenAppendedUrl,
    matchType: result.matchType,
  };
};
