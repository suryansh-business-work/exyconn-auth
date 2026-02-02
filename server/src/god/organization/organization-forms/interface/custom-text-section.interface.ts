/**
 * Custom Text Section Interface
 * Used for customizable text on login page
 */
export interface ICustomTextSection {
  name: string;
  slug: string;
  text: string;
  type: "heading" | "paragraph";
  variant?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "body1" | "body2";
}
