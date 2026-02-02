import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

export class SmtpSettingsDto {
  @IsOptional()
  @IsString()
  host?: string;

  @IsOptional()
  @IsNumber()
  port?: number;

  @IsOptional()
  @IsBoolean()
  secure?: boolean;

  @IsOptional()
  @IsString()
  user?: string;

  @IsOptional()
  @IsString()
  pass?: string;
}

export class SmtpFormDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => SmtpSettingsDto)
  smtpSettings?: SmtpSettingsDto;
}
