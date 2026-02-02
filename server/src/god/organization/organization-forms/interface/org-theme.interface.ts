/**
 * Organization Theme Interface
 * Used for theme customization
 */
import { ICustomColor } from "./custom-color.interface";
import { IFontFamily } from "./font-family.interface";

export interface IOrgTheme {
  primaryColor?: string;
  secondaryColor?: string;
  tertiaryColor?: string;
  customColors?: ICustomColor[];
  fontFamily?: IFontFamily;
  logoUrl?: string;
}
