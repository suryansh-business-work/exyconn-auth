/**
 * Role Permission Interface
 * Used for role-based access control
 */
export interface IRolePermission {
  resource: string; // e.g., 'user', 'order', 'product'
  action: string; // e.g., 'create', 'read', 'update', 'delete'
  allowed: boolean;
}
