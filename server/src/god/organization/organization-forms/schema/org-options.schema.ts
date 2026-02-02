import { Schema } from "mongoose";

export const PasswordPolicySchema = new Schema(
  {
    minLength: { type: Number, default: 8 },
    requireUppercase: { type: Boolean, default: true },
    requireLowercase: { type: Boolean, default: true },
    requireNumbers: { type: Boolean, default: true },
    requireSpecialChars: { type: Boolean, default: false },
    expiryDays: { type: Number, default: 90 },
  },
  { _id: false },
);

export const OrgOptionsSchema = new Schema(
  {
    mfaEnabled: { type: Boolean, default: false },
    lastLoginDetails: { type: Boolean, default: true },
    showRoleInProfile: { type: Boolean, default: true },
    passwordPolicy: PasswordPolicySchema,
    sessionTimeout: { type: Number, default: 3600 },
    allowedDomains: [{ type: String }],
  },
  { _id: false },
);
