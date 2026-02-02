import { IsString, IsOptional, IsEnum } from "class-validator";

export class LoginDesignDto {
  @IsOptional()
  @IsString()
  @IsEnum(["classic", "split", "minimal"])
  loginPageDesign?: string;
}
