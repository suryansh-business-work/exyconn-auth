/**
 * Generates a camelCase slug from a given text for use in object properties
 * @param text - The text to convert to camelCase slug
 * @returns The generated camelCase slug
 */
export const generateSlug = (text: string): string => {
  if (!text) return "";

  return text
    .trim()
    .replace(/[^\w\s]/g, "") // Remove special characters except alphanumeric and spaces
    .replace(/\s+(.)/g, (_, char) => char.toUpperCase()) // Convert to camelCase
    .replace(/\s+/g, "") // Remove remaining spaces
    .replace(/^(.)/, (_, char) => char.toLowerCase()); // Ensure first char is lowercase
};
