import { IsString, IsOptional } from "class-validator";

export class OrgPhoneDto {
  @IsString()
  countryCode!: string;

  @IsString()
  phoneNumber!: string;
}

export class ContactInfoDto {
  @IsOptional()
  orgPhone?: OrgPhoneDto;
}
