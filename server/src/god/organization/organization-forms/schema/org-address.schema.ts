import { Schema } from "mongoose";

export const OrgAddressSchema = new Schema(
  {
    addressLine1: { type: String },
    addressLine2: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    zipCode: { type: String },
  },
  { _id: false },
);
