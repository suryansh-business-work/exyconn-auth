// Organization Form Types
export interface OrgPhone {
  countryCode: string;
  phoneNumber: string;
}

export interface OrgLogo {
  size: "64x64" | "128x128" | "256x256" | "512x512";
  url: string;
  format?: "png" | "jpg" | "svg";
  isDefault?: boolean;
}

export interface LoginBgImage {
  url: string;
  name?: string;
}

export interface CustomTextSection {
  name: string;
  slug: string;
  text: string;
  type: "heading" | "paragraph";
  variant?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "body1" | "body2";
}

export interface LoginPageDesign {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
}

export interface OrgAddress {
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
}

export interface PasswordPolicy {
  minLength?: number;
  requireUppercase?: boolean;
  requireLowercase?: boolean;
  requireNumbers?: boolean;
  requireSpecialChars?: boolean;
  expiryDays?: number;
}

export interface OrgOptions {
  mfaEnabled?: boolean;
  lastLoginDetails?: boolean;
  passwordPolicy?: PasswordPolicy;
  sessionTimeout?: number;
  allowedDomains?: string[];
}

export interface CustomColor {
  slug: string;
  title: string;
  description: string;
  color: string;
}

export interface FontFamily {
  family: string;
  variants?: string[];
  subsets?: string[];
  version?: string;
  lastModified?: string;
  files?: Record<string, string>;
  category?: string;
  kind?: string;
  menu?: string;
}

export interface OrgTheme {
  primaryColor?: string;
  secondaryColor?: string;
  tertiaryColor?: string;
  customColors?: CustomColor[];
  fontFamily?: FontFamily;
  logoUrl?: string;
}

export interface SmtpSettings {
  host?: string;
  port?: number;
  secure?: boolean;
  user?: string;
  pass?: string;
}

export interface FeatureFlags {
  googleLogin?: boolean;
  emailVerification?: boolean;
  passwordReset?: boolean;
  mfaRequired?: boolean;
}

export interface MailSettings {
  emailVerification?: boolean;
  otpMail?: boolean;
  passwordReset?: boolean;
  loginAlert?: boolean;
  twoFactorAuth?: boolean;
  emailChangeConfirmation?: boolean;
  accountRecovery?: boolean;
}

// Email Templates - MJML content stored by template ID
export interface EmailTemplates {
  [templateId: string]: string;
}

// Role Permission Interface
export interface RolePermission {
  resource: string;
  action: string;
  allowed: boolean;
}

// Role Interface
export interface Role {
  name: string;
  slug: string;
  description?: string;
  permissions: RolePermission[];
  isDefault?: boolean;
  isSystem?: boolean;
  showOnSignup?: boolean;
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
export interface OrgRedirectionSetting {
  // Environment Configuration (Column 1)
  env: EnvironmentType | string;
  description?: string;
  authPageUrl: string;

  // Role Configuration (Column 2)
  roleSlug: string; // 'any' for all roles, otherwise specific role slug

  // Redirection URLs (Column 3)
  redirectionUrls: RedirectionUrl[];

  // Legacy properties (for backward compatibility with form)
  authPagePath?: string;
  redirectionUrl?: string;
}

export interface JwtSettings {
  algorithm?: "HS256" | "HS384" | "HS512" | "RS256" | "RS384" | "RS512";
  payloadFields?: string[];
  tokenSignKey?: string;
}

// Simplified OAuth Provider - no environments
export interface OAuthProvider {
  enabled?: boolean;
  clientId?: string;
  clientSecret?: string;
}

export interface OrgPolicy {
  policyName: string;
  policyLink: string;
}

export interface OAuthSettings {
  google?: OAuthProvider;
  microsoft?: OAuthProvider;
  apple?: OAuthProvider;
  github?: OAuthProvider;
}

// API Token Interface
export interface ApiToken {
  id?: string;
  name: string;
  description?: string;
  roleId?: string;
  expiresIn: string;
  token?: string;
  isActive: boolean;
  createdAt?: string;
  lastUsedAt?: string;
  scopes: string[];
}

export interface OrganizationFormData {
  orgName: string;
  orgEmail: string;
  orgSlug?: string;
  orgWebsite?: string;
  authServerUrl?: string;
  orgActiveStatus?: boolean;
  orgPhone?: OrgPhone;
  orgBusinessType?: "Product" | "Service" | "Both";
  ownershipType?: "Private" | "Government" | "LLP" | "Partnership" | "Other";
  orgScaleType?: "National" | "Multinational";
  numberOfEmployees?: number;
  orgAddress?: OrgAddress;
  orgRegistrationNumber?: string;
  orgTaxType?: "GST" | "CIN" | "PAN" | "VAT" | "Other";
  orgTaxNumber?: string;
  orgLogos?: OrgLogo[];
  orgFavIcon?: string;
  loginBgImages?: LoginBgImage[];
  loginPageDesign?: string;
  customTextSections?: CustomTextSection[];
  orgTheme?: OrgTheme;
  orgOptions?: OrgOptions;
  smtpSettings?: SmtpSettings;
  featureFlags?: FeatureFlags;
  mailSettings?: MailSettings;
  orgRedirectionSettings?: OrgRedirectionSetting[];
  orgPoliciesLink?: OrgPolicy[];
  jwtSettings?: JwtSettings;
  oauthSettings?: OAuthSettings;
  customCss?: string;
  customHtml?: string;
  customJs?: string;
  roles?: Role[];
  apiTokens?: ApiToken[];
  emailTemplates?: EmailTemplates;
  apiKey?: string;
  apiKeyCreatedAt?: string;
}

export interface Country {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
}
