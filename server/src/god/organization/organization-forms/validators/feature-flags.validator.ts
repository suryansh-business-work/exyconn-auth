import { IsBoolean, IsOptional, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class FeatureFlagsDto {
  @IsOptional()
  @IsBoolean()
  googleLogin?: boolean;

  @IsOptional()
  @IsBoolean()
  emailVerification?: boolean;

  @IsOptional()
  @IsBoolean()
  passwordReset?: boolean;

  @IsOptional()
  @IsBoolean()
  mfaRequired?: boolean;
}

export class FeatureFlagsFormDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => FeatureFlagsDto)
  featureFlags?: FeatureFlagsDto;
}
