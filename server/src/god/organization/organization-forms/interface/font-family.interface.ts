/**
 * Font Family Interface
 * Used for theme font configuration
 */
export interface IFontFamily {
  family: string;
  variants?: string[];
  subsets?: string[];
  version?: string;
  lastModified?: string;
  files?: Record<string, string>;
  category?: string;
  kind?: string;
  menu?: string;
}
