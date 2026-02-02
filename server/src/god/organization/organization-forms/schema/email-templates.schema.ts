import { Schema } from "mongoose";

// Email template schema - stores custom MJML templates by template ID
export const EmailTemplatesSchema = new Schema(
  {
    type: Map,
    of: String,
  },
  { _id: false },
);

// Default email templates (empty - will use file templates)
export const emailTemplatesDefault = {};
