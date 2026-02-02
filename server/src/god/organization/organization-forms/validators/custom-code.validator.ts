import { IsString, IsOptional } from "class-validator";

export class CustomCodeFormDto {
  @IsOptional()
  @IsString()
  customCss?: string;

  @IsOptional()
  @IsString()
  customHtml?: string;

  @IsOptional()
  @IsString()
  customJs?: string;
}

export class CustomCssFormDto {
  @IsOptional()
  @IsString()
  customCss?: string;
}

export class CustomHtmlFormDto {
  @IsOptional()
  @IsString()
  customHtml?: string;
}

export class CustomJsFormDto {
  @IsOptional()
  @IsString()
  customJs?: string;
}
