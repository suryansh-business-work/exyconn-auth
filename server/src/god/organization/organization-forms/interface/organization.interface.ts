/**
 * Main Organization Document Interface
 * Represents the complete organization entity in MongoDB
 */
import { Document } from "mongoose";
import { IOrgPhone } from "./org-phone.interface";
import { IOrgLogo } from "./org-logo.interface";
import { ILoginBgImage } from "./login-bg-image.interface";
import { ICustomTextSection } from "./custom-text-section.interface";
import { IOrgTheme } from "./org-theme.interface";
import { IOrgPolicy } from "./org-policy.interface";
import { IOrgRedirectionSetting } from "./org-redirection-setting.interface";
import { IOrgAddress } from "./org-address.interface";
import { IOrgRegion } from "./org-region.interface";
import { IOrgOptions } from "./org-options.interface";
import { IJwtSettings } from "./jwt-settings.interface";
import { IOAuthSettings } from "./oauth-settings.interface";
import { IMailSettings } from "./mail-settings.interface";
import { IRole } from "./role.interface";
import { ISmtpSettings } from "./smtp-settings.interface";
import { IFeatureFlags } from "./feature-flags.interface";

export interface IOrganization extends Document {
  // Mandatory Fields
  orgName: string;
  orgEmail: string;
  orgSlug: string;

  // Optional Fields
  orgPhone?: IOrgPhone;
  orgLogos?: IOrgLogo[];
  orgFavIcon?: string;
  loginBgImages?: ILoginBgImage[];
  loginPageDesign?: string;
  customTextSections?: ICustomTextSection[];
  orgTheme?: IOrgTheme;
  orgPoliciesLink?: IOrgPolicy[];
  orgRedirectionSettings?: IOrgRedirectionSetting[];
  orgTaxNumber?: string;
  orgRegistrationNumber?: string;
  orgAddress?: IOrgAddress;
  orgBusinessType?: "Product" | "Service" | "Both";
  orgTaxType?: "GST" | "CIN" | "PAN" | "VAT" | "Other";
  orgWorkDomain?: string;
  orgWebsite?: string;
  authServerUrl?: string; // Auth server URL for auto-selecting organization
  orgScaleType?: "National" | "Multinational";
  orgRegions?: IOrgRegion[];
  orgActiveStatus?: boolean;
  ownershipType?: "Private" | "Government" | "LLP" | "Partnership" | "Other";
  numberOfEmployees?: number;
  orgOptions?: IOrgOptions;
  orgRoleTypes?: string[];

  // Role Management
  roles?: IRole[];

  // JWT & Security
  tokenSignKey?: string;
  jwtSettings?: IJwtSettings;
  oauthSettings?: IOAuthSettings;
  customCss?: string;
  customHtml?: string;
  customJs?: string;

  // SMTP Settings
  smtpSettings?: ISmtpSettings;

  // Feature Flags
  featureFlags?: IFeatureFlags;

  // Mail Settings
  mailSettings?: IMailSettings;

  // Notification Settings
  notifyOnUserDeletion?: boolean; // Email god admin when user self-deletes

  // API Key
  apiKey?: string;
  apiKeyCreatedAt?: Date;

  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
}
