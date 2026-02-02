import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsBoolean,
  IsIn,
} from "class-validator";
import { Type } from "class-transformer";

/**
 * Redirection URL DTO
 */
export class RedirectionUrlDto {
  @IsOptional()
  @IsString({ message: "URL must be a string" })
  url?: string;

  @IsOptional()
  @IsBoolean({ message: "isDefault must be a boolean" })
  isDefault?: boolean;
}

/**
 * Organization Redirection Setting DTO
 * Supports environment-aware and role-aware redirection
 */
export class OrgRedirectionSettingDto {
  @IsOptional()
  @IsIn(["development", "staging", "production"], {
    message: "env must be development, staging, or production",
  })
  env?: "development" | "staging" | "production";

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString({ message: "authPageUrl must be a string" })
  authPageUrl?: string;

  @IsOptional()
  @IsString({ message: "roleSlug must be a string" })
  roleSlug?: string; // 'any' for all roles, otherwise specific role slug

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RedirectionUrlDto)
  redirectionUrls?: RedirectionUrlDto[];
}

export class RedirectionSettingsFormDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrgRedirectionSettingDto)
  orgRedirectionSettings?: OrgRedirectionSettingDto[];
}
