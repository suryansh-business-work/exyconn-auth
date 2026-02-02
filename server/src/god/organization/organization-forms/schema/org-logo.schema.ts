import { Schema } from "mongoose";

export const OrgLogoSchema = new Schema(
  {
    size: { type: String },
    url: { type: String },
    format: {
      type: String,
      enum: ["png", "jpg", "svg"],
    },
    isDefault: { type: Boolean, default: false },
  },
  { _id: false },
);
