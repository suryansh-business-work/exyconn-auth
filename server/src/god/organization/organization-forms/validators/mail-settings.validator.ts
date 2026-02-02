import { IsBoolean, IsOptional, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class MailSettingsDto {
  @IsOptional()
  @IsBoolean()
  emailVerification?: boolean;

  @IsOptional()
  @IsBoolean()
  otpMail?: boolean;

  @IsOptional()
  @IsBoolean()
  passwordReset?: boolean;

  @IsOptional()
  @IsBoolean()
  loginAlert?: boolean;

  @IsOptional()
  @IsBoolean()
  twoFactorAuth?: boolean;

  @IsOptional()
  @IsBoolean()
  emailChangeConfirmation?: boolean;

  @IsOptional()
  @IsBoolean()
  accountRecovery?: boolean;
}

export class MailSettingsFormDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => MailSettingsDto)
  mailSettings?: MailSettingsDto;
}
