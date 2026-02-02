import { Schema } from "mongoose";

export const RolePermissionSchema = new Schema(
  {
    resource: { type: String, required: true },
    action: { type: String, required: true },
    allowed: { type: Boolean, default: true },
  },
  { _id: false },
);

export const RoleSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true },
    description: { type: String },
    permissions: [RolePermissionSchema],
    isDefault: { type: Boolean, default: false },
    isSystem: { type: Boolean, default: false },
    showOnSignup: { type: Boolean, default: true },
  },
  { _id: false },
);

export const rolesDefault = [
  {
    name: "Admin",
    slug: "admin",
    description: "Full access to all resources",
    permissions: [
      { resource: "user", action: "create", allowed: true },
      { resource: "user", action: "read", allowed: true },
      { resource: "user", action: "update", allowed: true },
      { resource: "user", action: "delete", allowed: true },
    ],
    isDefault: false,
    isSystem: true,
    showOnSignup: true,
  },
  {
    name: "User",
    slug: "user",
    description: "Standard user access",
    permissions: [
      { resource: "user", action: "read", allowed: true },
      { resource: "user", action: "update", allowed: true },
    ],
    isDefault: true,
    isSystem: true,
    showOnSignup: true,
  },
];
