import { Schema } from "mongoose";

export const SmtpSettingsSchema = new Schema(
  {
    host: { type: String },
    port: { type: Number },
    secure: { type: Boolean, default: false },
    user: { type: String },
    pass: { type: String },
  },
  { _id: false },
);
