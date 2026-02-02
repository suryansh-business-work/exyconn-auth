import { Schema } from "mongoose";

export const LoginBgImageSchema = new Schema(
  {
    url: { type: String, required: true },
    name: { type: String },
  },
  { _id: false },
);
