import { IsString, IsOptional, IsEnum } from "class-validator";

export class CompanyRegistrationDto {
  @IsOptional()
  @IsString()
  orgRegistrationNumber?: string;

  @IsOptional()
  @IsEnum(["GST", "CIN", "PAN", "VAT", "Other"])
  orgTaxType?: "GST" | "CIN" | "PAN" | "VAT" | "Other";

  @IsOptional()
  @IsString()
  orgTaxNumber?: string;

  @IsOptional()
  @IsString()
  orgWorkDomain?: string;
}
