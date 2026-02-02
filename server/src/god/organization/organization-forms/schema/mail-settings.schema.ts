import { Schema } from "mongoose";

export const MailSettingsSchema = new Schema(
  {
    emailVerification: { type: Boolean, default: true },
    otpMail: { type: Boolean, default: true },
    passwordReset: { type: Boolean, default: false },
    loginAlert: { type: Boolean, default: true },
    twoFactorAuth: { type: Boolean, default: true },
    emailChangeConfirmation: { type: Boolean, default: true },
    accountRecovery: { type: Boolean, default: true },
  },
  { _id: false },
);
