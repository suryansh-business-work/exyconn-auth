import { Schema } from "mongoose";

export const FontFamilySchema = new Schema(
  {
    family: { type: String },
    variants: [{ type: String }],
    subsets: [{ type: String }],
    version: { type: String },
    lastModified: { type: String },
    files: { type: Map, of: String },
    category: { type: String },
    kind: { type: String },
    menu: { type: String },
  },
  { _id: false },
);
