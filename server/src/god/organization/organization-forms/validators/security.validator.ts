import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsArray,
  IsString,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

export class PasswordPolicyDto {
  @IsOptional()
  @IsNumber()
  minLength?: number;

  @IsOptional()
  @IsBoolean()
  requireUppercase?: boolean;

  @IsOptional()
  @IsBoolean()
  requireLowercase?: boolean;

  @IsOptional()
  @IsBoolean()
  requireNumbers?: boolean;

  @IsOptional()
  @IsBoolean()
  requireSpecialChars?: boolean;

  @IsOptional()
  @IsNumber()
  expiryDays?: number;
}

export class OrgOptionsDto {
  @IsOptional()
  @IsBoolean()
  mfaEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  lastLoginDetails?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => PasswordPolicyDto)
  passwordPolicy?: PasswordPolicyDto;

  @IsOptional()
  @IsNumber()
  sessionTimeout?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedDomains?: string[];
}

export class SecurityFormDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => OrgOptionsDto)
  orgOptions?: OrgOptionsDto;
}
