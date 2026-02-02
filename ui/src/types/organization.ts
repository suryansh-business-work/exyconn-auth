export interface OrgLogo {
  size: string;
  url: string;
}

export interface LoginBgImage {
  url: string;
  name?: string;
}

export interface CustomTextSection {
  name?: string;
  slug: string;
  text: string;
  type: string;
  variant?: string;
}

export interface OrgTheme {
  primaryColor?: string;
  secondaryColor?: string;
  tertiaryColor?: string;
  fontFamily?: any;
  customColors?: Array<{ name: string; value: string }>;
}

export interface OAuthProvider {
  enabled?: boolean;
  clientId?: string;
  clientSecret?: string;
}

export interface OAuthSettings {
  google?: OAuthProvider;
  microsoft?: OAuthProvider;
  apple?: OAuthProvider;
  github?: OAuthProvider;
}

export interface FeatureFlags {
  googleLogin: boolean;
  emailVerification: boolean;
  passwordReset: boolean;
  mfaRequired: boolean;
}

export interface MailSettings {
  emailVerification: boolean;
  otpMail: boolean;
  passwordReset: boolean;
  loginAlert: boolean;
  twoFactorAuth: boolean;
  emailChangeConfirmation: boolean;
  accountRecovery: boolean;
}

/**
 * Redirection URL with default flag
 */
export interface RedirectionUrl {
  url: string;
  isDefault: boolean;
}

/**
 * Environment types for redirection settings
 */
export type EnvironmentType = "development" | "staging" | "production";

/**
 * Organization Redirection Setting
 * Supports environment-aware and role-aware redirection
 */
export interface RedirectionSetting {
  // Environment Configuration (Column 1)
  env: EnvironmentType;
  description?: string;
  authPageUrl: string;

  // Role Configuration (Column 2)
  roleSlug: string; // 'any' for all roles, otherwise specific role slug

  // Redirection URLs (Column 3)
  redirectionUrls: RedirectionUrl[];
}

export interface OrgPolicy {
  policyName: string;
  policyLink: string;
}

export interface ConfigurationIssue {
  id: string;
  name: string;
  description: string;
}

export interface ConfigurationIssues {
  critical: ConfigurationIssue[];
  warning: ConfigurationIssue[];
  info: ConfigurationIssue[];
}

export interface Organization {
  _id: string;
  orgId?: string;
  orgName: string;
  orgEmail: string;
  orgWebsite?: string;
  orgSlug: string;
  orgLogos?: OrgLogo[];
  orgFavIcon?: string;
  loginBgImages?: LoginBgImage[];
  loginPageDesign?: string;
  customTextSections?: CustomTextSection[];
  orgTheme?: OrgTheme;
  oauthSettings?: OAuthSettings;
  featureFlags?: FeatureFlags;
  mailSettings?: MailSettings;
  orgRedirectionSettings?: RedirectionSetting[];
  orgPoliciesLink?: OrgPolicy[];
  orgActiveStatus?: boolean;
  orgBusinessType?: string;
  numberOfEmployees?: number;
  createdAt?: string;
  updatedAt?: string;
  authServerUrl?: string;
  issues?: ConfigurationIssues;
}
