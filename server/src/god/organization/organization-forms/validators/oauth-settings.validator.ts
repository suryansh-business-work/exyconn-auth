import {
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

/**
 * Simplified OAuth Provider DTO - only credentials
 */
export class OAuthProviderDto {
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsString({ message: "Client ID must be a string" })
  clientId?: string;

  @IsOptional()
  @IsString({ message: "Client Secret must be a string" })
  clientSecret?: string;
}

export class OAuthSettingsDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => OAuthProviderDto)
  google?: OAuthProviderDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => OAuthProviderDto)
  microsoft?: OAuthProviderDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => OAuthProviderDto)
  apple?: OAuthProviderDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => OAuthProviderDto)
  github?: OAuthProviderDto;
}

export class OAuthFormDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => OAuthSettingsDto)
  oauthSettings?: OAuthSettingsDto;
}
