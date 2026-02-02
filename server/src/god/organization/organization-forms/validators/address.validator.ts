import { IsString, IsOptional, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class OrgAddressDto {
  @IsOptional()
  @IsString()
  addressLine1?: string;

  @IsOptional()
  @IsString()
  addressLine2?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  zipCode?: string;
}

export class OrgRegionDto {
  @IsString()
  country!: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => OrgAddressDto)
  address?: OrgAddressDto;
}

export class AddressFormDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => OrgAddressDto)
  orgAddress?: OrgAddressDto;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => OrgRegionDto)
  orgRegions?: OrgRegionDto[];
}
