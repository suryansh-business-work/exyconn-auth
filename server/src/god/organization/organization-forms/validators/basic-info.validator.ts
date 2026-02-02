import {
  IsString,
  IsEmail,
  IsOptional,
  IsBoolean,
  MinLength,
  MaxLength,
} from "class-validator";

export class BasicInfoDto {
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
}
