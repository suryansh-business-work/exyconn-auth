import { Schema } from "mongoose";

export const FeatureFlagsSchema = new Schema(
  {
    googleLogin: { type: Boolean, default: false },
    emailVerification: { type: Boolean, default: true },
    passwordReset: { type: Boolean, default: true },
    mfaRequired: { type: Boolean, default: false },
  },
  { _id: false },
);
