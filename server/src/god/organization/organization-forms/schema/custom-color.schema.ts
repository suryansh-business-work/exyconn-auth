import { Schema } from "mongoose";

export const CustomColorSchema = new Schema(
  {
    slug: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    color: { type: String, required: true },
  },
  { _id: false },
);
