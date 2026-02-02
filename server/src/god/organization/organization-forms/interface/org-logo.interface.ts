/**
 * Organization Logo Interface
 * Used for storing different logo sizes
 */
export interface IOrgLogo {
  size: string; // e.g., "64x64", "128x128", "256x256", "512x512"
  url: string;
  format?: "png" | "jpg" | "svg";
  isDefault?: boolean; // Whether this logo is the default one to use
}
