import { IsString, IsOptional, IsNumber, IsEnum } from "class-validator";

export class BusinessDetailsDto {
  @IsOptional()
  @IsEnum(["Product", "Service", "Both"])
  orgBusinessType?: "Product" | "Service" | "Both";

  @IsOptional()
  @IsEnum(["Private", "Government", "LLP", "Partnership", "Other"])
  ownershipType?: "Private" | "Government" | "LLP" | "Partnership" | "Other";

  @IsOptional()
  @IsEnum(["National", "Multinational"])
  orgScaleType?: "National" | "Multinational";

  @IsOptional()
  @IsNumber()
  numberOfEmployees?: number;
}
