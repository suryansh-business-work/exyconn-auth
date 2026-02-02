import { Schema } from "mongoose";

export const OrgPolicySchema = new Schema(
  {
    policyName: { type: String },
    policyLink: { type: String },
  },
  { _id: false },
);
