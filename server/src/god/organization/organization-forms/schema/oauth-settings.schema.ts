import { Schema } from "mongoose";

// Simplified OAuth Provider Schema - no environments, just credentials
export const OAuthProviderSchema = new Schema(
  {
    enabled: { type: Boolean, default: false },
    clientId: { type: String },
    clientSecret: { type: String },
    // Callback URL is generated automatically by the backend
  },
  { _id: false },
);

export const OAuthSettingsSchema = new Schema(
  {
    google: OAuthProviderSchema,
    microsoft: OAuthProviderSchema,
    apple: OAuthProviderSchema,
    github: OAuthProviderSchema,
  },
  { _id: false },
);
