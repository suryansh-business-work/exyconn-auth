import {
  IsString,
  IsEmail,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsArray,
  ValidateNested,
  IsEnum,
  MinLength,
  MaxLength,
} from "class-validator";
import { Type } from "class-transformer";

import { OrgPhoneDto } from "./contact-info.validator";
import { OrgAddressDto, OrgRegionDto } from "./address.validator";
import { OrgLogoDto, LoginBgImageDto } from "./branding-assets.validator";
import { CustomTextSectionDto } from "./custom-text.validator";
import { OrgThemeDto } from "./theme.validator";
import { OrgOptionsDto } from "./security.validator";
import { JwtSettingsDto } from "./jwt-settings.validator";
import { OAuthSettingsDto } from "./oauth-settings.validator";
import { SmtpSettingsDto } from "./smtp-settings.validator";
import { OrgRedirectionSettingDto } from "./redirection-settings.validator";
import { MailSettingsDto } from "./mail-settings.validator";
import { RoleDto } from "./role-management.validator";
import { FeatureFlagsDto } from "./feature-flags.validator";
// Combines all forms for creating a new organization
// All fields are optional except mandatory ones (orgName, orgEmail)

export class CreateOrganizationDto {
  // ============================================================================
  // BASIC INFORMATION FORM
  // ============================================================================
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  orgName!: string;

  @IsEmail()
  orgEmail!: string;

  @IsOptional()
  @IsString()
  orgSlug?: string;

  @IsOptional()
  @IsString()
  orgWebsite?: string;

  @IsOptional()
  @IsBoolean()
  orgActiveStatus?: boolean;

  // ============================================================================
  // CONTACT FORM
  // ============================================================================
  @IsOptional()
  @ValidateNested()
  @Type(() => OrgPhoneDto)
  orgPhone?: OrgPhoneDto;

  // ============================================================================
  // BUSINESS DETAILS FORM
  // ============================================================================
  @IsOptional()
  @IsEnum(["Product", "Service", "Both"])
  orgBusinessType?: "Product" | "Service" | "Both";

  @IsOptional()
  @IsEnum(["Private", "Government", "LLP", "Partnership", "Other"])
  ownershipType?: "Private" | "Government" | "LLP" | "Partnership" | "Other";

  @IsOptional()
  @IsEnum(["National", "Multinational"])
  orgScaleType?: "National" | "Multinational";

  @IsOptional()
  @IsNumber()
  numberOfEmployees?: number;

  // ============================================================================
  // ADDRESS FORM
  // ============================================================================
  @IsOptional()
  @ValidateNested()
  @Type(() => OrgAddressDto)
  orgAddress?: OrgAddressDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrgRegionDto)
  orgRegions?: OrgRegionDto[];

  // ============================================================================
  // COMPANY REGISTRATION FORM
  // ============================================================================
  @IsOptional()
  @IsString()
  orgRegistrationNumber?: string;

  @IsOptional()
  @IsEnum(["GST", "CIN", "PAN", "VAT", "Other"])
  orgTaxType?: "GST" | "CIN" | "PAN" | "VAT" | "Other";

  @IsOptional()
  @IsString()
  orgTaxNumber?: string;

  @IsOptional()
  @IsString()
  orgWorkDomain?: string;

  // ============================================================================
  // BRANDING & ASSETS FORM
  // ============================================================================
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrgLogoDto)
  orgLogos?: OrgLogoDto[];

  @IsOptional()
  @IsString()
  orgFavIcon?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LoginBgImageDto)
  loginBgImages?: LoginBgImageDto[];

  // ============================================================================
  // LOGIN DESIGN FORM
  // ============================================================================
  @IsOptional()
  @IsString()
  @IsEnum(["classic", "split", "minimal"])
  loginPageDesign?: string;

  // ============================================================================
  // CUSTOM TEXT FORM
  // ============================================================================
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CustomTextSectionDto)
  customTextSections?: CustomTextSectionDto[];

  // ============================================================================
  // THEME FORM
  // ============================================================================
  @IsOptional()
  @ValidateNested()
  @Type(() => OrgThemeDto)
  orgTheme?: OrgThemeDto;

  // ============================================================================
  // SECURITY FORM
  // ============================================================================
  @IsOptional()
  @ValidateNested()
  @Type(() => OrgOptionsDto)
  orgOptions?: OrgOptionsDto;

  // ============================================================================
  // JWT SETTINGS FORM
  // ============================================================================
  @IsOptional()
  @ValidateNested()
  @Type(() => JwtSettingsDto)
  jwtSettings?: JwtSettingsDto;

  @IsOptional()
  @IsString()
  tokenSignKey?: string;

  // ============================================================================
  // OAUTH SETTINGS FORM
  // ============================================================================
  @IsOptional()
  @ValidateNested()
  @Type(() => OAuthSettingsDto)
  oauthSettings?: OAuthSettingsDto;

  // ============================================================================
  // SMTP SETTINGS FORM
  // ============================================================================
  @IsOptional()
  @ValidateNested()
  @Type(() => SmtpSettingsDto)
  smtpSettings?: SmtpSettingsDto;

  // ============================================================================
  // REDIRECTION SETTINGS FORM
  // ============================================================================
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrgRedirectionSettingDto)
  orgRedirectionSettings?: OrgRedirectionSettingDto[];

  // ============================================================================
  // MAIL SETTINGS FORM
  // ============================================================================
  @IsOptional()
  @ValidateNested()
  @Type(() => MailSettingsDto)
  mailSettings?: MailSettingsDto;

  // ============================================================================
  // CUSTOM CODE FORM
  // ============================================================================
  @IsOptional()
  @IsString()
  customCss?: string;

  @IsOptional()
  @IsString()
  customHtml?: string;

  @IsOptional()
  @IsString()
  customJs?: string;

  // ============================================================================
  // ROLE MANAGEMENT FORM
  // ============================================================================
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RoleDto)
  roles?: RoleDto[];

  // ============================================================================
  // FEATURE FLAGS FORM
  // ============================================================================
  @IsOptional()
  @ValidateNested()
  @Type(() => FeatureFlagsDto)
  featureFlags?: FeatureFlagsDto;

  // ============================================================================
  // OTHER FIELDS
  // ============================================================================
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  orgRoleTypes?: string[];
}

// ============================================================================
// UPDATE ORGANIZATION DTO
// ============================================================================
// All fields are optional for partial updates
// Same structure as CreateOrganizationDto but with all fields optional

export class UpdateOrganizationDto {
  // ============================================================================
  // BASIC INFORMATION FORM
  // ============================================================================
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  orgName?: string;

  @IsOptional()
  @IsEmail()
  orgEmail?: string;

  @IsOptional()
  @IsString()
  orgSlug?: string;

  @IsOptional()
  @IsString()
  orgWebsite?: string;

  @IsOptional()
  @IsBoolean()
  orgActiveStatus?: boolean;

  // ============================================================================
  // CONTACT FORM
  // ============================================================================
  @IsOptional()
  @ValidateNested()
  @Type(() => OrgPhoneDto)
  orgPhone?: OrgPhoneDto;

  // ============================================================================
  // BUSINESS DETAILS FORM
  // ============================================================================
  @IsOptional()
  @IsEnum(["Product", "Service", "Both"])
  orgBusinessType?: "Product" | "Service" | "Both";

  @IsOptional()
  @IsEnum(["Private", "Government", "LLP", "Partnership", "Other"])
  ownershipType?: "Private" | "Government" | "LLP" | "Partnership" | "Other";

  @IsOptional()
  @IsEnum(["National", "Multinational"])
  orgScaleType?: "National" | "Multinational";

  @IsOptional()
  @IsNumber()
  numberOfEmployees?: number;

  // ============================================================================
  // ADDRESS FORM
  // ============================================================================
  @IsOptional()
  @ValidateNested()
  @Type(() => OrgAddressDto)
  orgAddress?: OrgAddressDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrgRegionDto)
  orgRegions?: OrgRegionDto[];

  // ============================================================================
  // COMPANY REGISTRATION FORM
  // ============================================================================
  @IsOptional()
  @IsString()
  orgRegistrationNumber?: string;

  @IsOptional()
  @IsEnum(["GST", "CIN", "PAN", "VAT", "Other"])
  orgTaxType?: "GST" | "CIN" | "PAN" | "VAT" | "Other";

  @IsOptional()
  @IsString()
  orgTaxNumber?: string;

  @IsOptional()
  @IsString()
  orgWorkDomain?: string;

  // ============================================================================
  // BRANDING & ASSETS FORM
  // ============================================================================
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrgLogoDto)
  orgLogos?: OrgLogoDto[];

  @IsOptional()
  @IsString()
  orgFavIcon?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LoginBgImageDto)
  loginBgImages?: LoginBgImageDto[];

  // ============================================================================
  // LOGIN DESIGN FORM
  // ============================================================================
  @IsOptional()
  @IsString()
  @IsEnum(["classic", "split", "minimal"])
  loginPageDesign?: string;

  // ============================================================================
  // CUSTOM TEXT FORM
  // ============================================================================
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CustomTextSectionDto)
  customTextSections?: CustomTextSectionDto[];

  // ============================================================================
  // THEME FORM
  // ============================================================================
  @IsOptional()
  @ValidateNested()
  @Type(() => OrgThemeDto)
  orgTheme?: OrgThemeDto;

  // ============================================================================
  // SECURITY FORM
  // ============================================================================
  @IsOptional()
  @ValidateNested()
  @Type(() => OrgOptionsDto)
  orgOptions?: OrgOptionsDto;

  // ============================================================================
  // JWT SETTINGS FORM
  // ============================================================================
  @IsOptional()
  @ValidateNested()
  @Type(() => JwtSettingsDto)
  jwtSettings?: JwtSettingsDto;

  @IsOptional()
  @IsString()
  tokenSignKey?: string;

  // ============================================================================
  // OAUTH SETTINGS FORM
  // ============================================================================
  @IsOptional()
  @ValidateNested()
  @Type(() => OAuthSettingsDto)
  oauthSettings?: OAuthSettingsDto;

  // ============================================================================
  // SMTP SETTINGS FORM
  // ============================================================================
  @IsOptional()
  @ValidateNested()
  @Type(() => SmtpSettingsDto)
  smtpSettings?: SmtpSettingsDto;

  // ============================================================================
  // REDIRECTION SETTINGS FORM
  // ============================================================================
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrgRedirectionSettingDto)
  orgRedirectionSettings?: OrgRedirectionSettingDto[];

  // ============================================================================
  // MAIL SETTINGS FORM
  // ============================================================================
  @IsOptional()
  @ValidateNested()
  @Type(() => MailSettingsDto)
  mailSettings?: MailSettingsDto;

  // ============================================================================
  // CUSTOM CODE FORM
  // ============================================================================
  @IsOptional()
  @IsString()
  customCss?: string;

  @IsOptional()
  @IsString()
  customHtml?: string;

  @IsOptional()
  @IsString()
  customJs?: string;

  // ============================================================================
  // ROLE MANAGEMENT FORM
  // ============================================================================
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RoleDto)
  roles?: RoleDto[];

  // ============================================================================
  // FEATURE FLAGS FORM
  // ============================================================================
  @IsOptional()
  @ValidateNested()
  @Type(() => FeatureFlagsDto)
  featureFlags?: FeatureFlagsDto;

  // ============================================================================
  // OTHER FIELDS
  // ============================================================================
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  orgRoleTypes?: string[];
}
