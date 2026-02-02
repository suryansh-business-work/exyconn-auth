import mongoose, { Schema, Document } from "mongoose";

export interface ILoginHistoryEntry {
  loginAt: Date;
  ipAddress: string;
  userAgent: string;
  location?: {
    city?: string;
    country?: string;
  };
  details?: any;
}

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  companyId: string;
  role: "user" | "admin" | "god";
  isVerified: boolean;
  otp?: string;
  otpExpires?: Date;
  provider?: "email" | "google";
  profilePicture?: string;
  mfaEnabled?: boolean;
  mfaSecret?: string;
  lastLoginAt?: Date;
  lastLoginIp?: string;
  loginHistory?: ILoginHistoryEntry[];
  // Deletion fields
  isDeleted?: boolean;
  deletionRequestedAt?: Date;
  deletionScheduledAt?: Date;
  deletionOtp?: string;
  deletionOtpExpires?: Date;
  deletionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LoginHistorySchema = new Schema(
  {
    loginAt: { type: Date, required: true },
    ipAddress: { type: String, required: true },
    userAgent: { type: String, default: "Unknown" },
    location: {
      city: { type: String },
      country: { type: String },
    },
    details: { type: Object },
  },
  { _id: false },
);

const UserSchema: Schema = new Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: { type: String, required: false },
    companyId: { type: String, required: true, index: true },
    role: {
      type: String,
      required: true,
      default: "user",
    },
    isVerified: { type: Boolean, default: false, index: true },
    otp: { type: String },
    otpExpires: { type: Date },
    provider: { type: String, enum: ["email", "google"], default: "email" },
    profilePicture: { type: String },
    mfaEnabled: { type: Boolean, default: false },
    mfaSecret: { type: String },
    lastLoginAt: { type: Date },
    lastLoginIp: { type: String },
    loginHistory: { type: [LoginHistorySchema], default: [] },
    // Deletion fields
    isDeleted: { type: Boolean, default: false, index: true },
    deletionRequestedAt: { type: Date },
    deletionScheduledAt: { type: Date },
    deletionOtp: { type: String },
    deletionOtpExpires: { type: Date },
    deletionReason: { type: String },
  },
  { timestamps: true },
);

// Compound index for email + companyId (since all companies use same DB)
UserSchema.index({ email: 1, companyId: 1 }, { unique: true });

export default mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);
