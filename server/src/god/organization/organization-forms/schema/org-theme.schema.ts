import { Schema } from "mongoose";
import { CustomColorSchema } from "./custom-color.schema";
import { FontFamilySchema } from "./font-family.schema";

export const OrgThemeSchema = new Schema(
  {
    primaryColor: { type: String },
    secondaryColor: { type: String },
    tertiaryColor: { type: String },
    customColors: [CustomColorSchema],
    fontFamily: {
      type: FontFamilySchema,
    },
    logoUrl: { type: String },
  },
  { _id: false },
);
