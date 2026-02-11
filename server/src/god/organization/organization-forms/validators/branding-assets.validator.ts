import { IsString, IsOptional, IsArray, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class OrgLogoDto {
  @IsString()
  size!: string;

  @IsString()
  url!: string;

  @IsOptional()
  @IsString()
  format?: "png" | "jpg" | "svg";
}

export class LoginBgImageDto {
  @IsString()
  url!: string;

  @IsOptional()
  @IsString()
  name?: string;
}

export class BrandingAssetsDto {
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
}
