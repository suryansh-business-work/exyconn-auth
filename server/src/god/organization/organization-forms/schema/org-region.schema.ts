import { Schema } from "mongoose";
import { OrgAddressSchema } from "./org-address.schema";

export const OrgRegionSchema = new Schema(
  {
    country: { type: String },
    timezone: { type: String },
    currency: { type: String },
    address: OrgAddressSchema,
  },
  { _id: false },
);
