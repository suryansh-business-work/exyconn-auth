import { IsString, IsOptional, IsArray, IsEnum } from "class-validator";

export class JwtSettingsDto {
  @IsOptional()
  @IsEnum(["HS256", "HS384", "HS512", "RS256", "RS384", "RS512"])
  algorithm?: "HS256" | "HS384" | "HS512" | "RS256" | "RS384" | "RS512";

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  payloadFields?: string[];

  @IsOptional()
  @IsString()
  tokenSignKey?: string;
}

export class JwtFormDto {
  @IsOptional()
  jwtSettings?: JwtSettingsDto;
}
