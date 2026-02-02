import { Schema } from "mongoose";

export const OrgPhoneSchema = new Schema(
  {
    countryCode: { type: String },
    phoneNumber: { type: String },
  },
  { _id: false },
);
