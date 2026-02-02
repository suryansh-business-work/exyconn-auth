import { Schema } from "mongoose";
import { randomUUID } from "crypto";

export const JwtSettingsSchema = new Schema(
  {
    algorithm: {
      type: String,
      enum: ["HS256", "HS384", "HS512", "RS256", "RS384", "RS512"],
      default: "HS256",
    },
    payloadFields: {
      type: [{ type: String }],
      default: ["userId", "userName", "email"],
    },
    tokenSignKey: { type: String },
  },
  { _id: false },
);

export const jwtSettingsDefault = () => ({
  algorithm: "HS256",
  payloadFields: ["userId", "userName", "email"],
  tokenSignKey: randomUUID(),
});
