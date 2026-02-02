/**
 * Role Interface
 * Used for role management and RBAC
 */
import { IRolePermission } from "./role-permission.interface";

export interface IRole {
  name: string;
  slug: string;
  description?: string;
  permissions: IRolePermission[];
  isDefault?: boolean;
  isSystem?: boolean; // System roles cannot be deleted
  showOnSignup?: boolean; // Whether this role is visible on signup page for user selection
}
