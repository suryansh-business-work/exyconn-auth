import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsObject,
} from "class-validator";
import { Type } from "class-transformer";

export class FontFamilyDto {
  @IsString()
  family!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  variants?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  subsets?: string[];

  @IsOptional()
  @IsString()
  version?: string;

  @IsOptional()
  @IsString()
  lastModified?: string;

  @IsOptional()
  @IsObject()
  files?: Record<string, string>;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  kind?: string;

  @IsOptional()
  @IsString()
  menu?: string;
}

export class CustomColorDto {
  @IsString()
  slug!: string;

  @IsString()
  title!: string;

  @IsString()
  description!: string;

  @IsString()
  color!: string;
}

export class OrgThemeDto {
  @IsOptional()
  @IsString()
  primaryColor?: string;

  @IsOptional()
  @IsString()
  secondaryColor?: string;

  @IsOptional()
  @IsString()
  tertiaryColor?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CustomColorDto)
  customColors?: CustomColorDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => FontFamilyDto)
  fontFamily?: FontFamilyDto;

  @IsOptional()
  @IsString()
  logoUrl?: string;
}

export class ThemeFormDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => OrgThemeDto)
  orgTheme?: OrgThemeDto;
}
