import { Schema } from "mongoose";

/**
 * Redirection URL Schema
 * Contains URL and default flag
 */
export const RedirectionUrlSchema = new Schema(
  {
    url: { type: String },
    isDefault: { type: Boolean, default: false },
  },
  { _id: false },
);

/**
 * Organization Redirection Setting Schema
 * Supports environment-aware and role-aware redirection
 */
export const OrgRedirectionSettingSchema = new Schema(
  {
    // Environment Configuration
    env: {
      type: String,
      enum: ["development", "staging", "production"],
    },
    description: { type: String },
    authPageUrl: { type: String },

    // Role Configuration
    roleSlug: { type: String, default: "any" }, // 'any' for all roles

    // Redirection URLs
    redirectionUrls: {
      type: [RedirectionUrlSchema],
      default: [],
    },
  },
  { _id: false },
);
