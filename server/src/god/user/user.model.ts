import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IGodUser extends Document {
  email: string;
  password: string;
  role: "god";
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  passwordChangedAt?: Date;
  lastLoginAt?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const GodUserSchema = new Schema<IGodUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["god"],
      default: "god",
      immutable: true,
    },
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    passwordChangedAt: Date,
    lastLoginAt: Date,
  },
  {
    timestamps: true,
  },
);

// Hash password before saving
GodUserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password as string, salt);
    this.passwordChangedAt = new Date();
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare passwords
GodUserSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const GodUser =
  mongoose.models.GodUser || mongoose.model<IGodUser>("GodUser", GodUserSchema);

export default GodUser;
