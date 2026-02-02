import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsEnum,
} from "class-validator";
import { Type } from "class-transformer";

export class CustomTextSectionDto {
  @IsString()
  name!: string;

  @IsString()
  slug!: string;

  @IsString()
  text!: string;

  @IsEnum(["heading", "paragraph"])
  type!: "heading" | "paragraph";

  @IsOptional()
  @IsEnum(["h1", "h2", "h3", "h4", "h5", "h6", "body1", "body2"])
  variant?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "body1" | "body2";
}

export class CustomTextFormDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CustomTextSectionDto)
  customTextSections?: CustomTextSectionDto[];
}
