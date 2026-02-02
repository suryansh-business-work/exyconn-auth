/**
 * RBAC (Role-Based Access Control) Types
 * Using React Flow for visual workflow representation
 *
 * Structure:
 * Role → Access Groups → Permissions → Access Type
 */

/**
 * Access Type - level of control for each permission
 */
export type AccessType = "ALLOW" | "DENY" | "READ_ONLY" | "FULL";

/**
 * Permission actions available for any resource
 */
export type PermissionAction = "view" | "create" | "update" | "delete";

/**
 * Individual permission for a specific action
 */
export interface Permission {
  id: string;
  action: PermissionAction;
  accessType: AccessType;
  description?: string;
}

/**
 * Access Group - represents a module or feature of the application
 */
export interface AccessGroup {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  permissions: Permission[];
  order: number;
}

/**
 * Role - defines a user type with associated access groups
 */
export interface Role {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  isDefault?: boolean;
  isSystem?: boolean;
  accessGroups: RoleAccessGroup[];
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Role's association with an access group
 */
export interface RoleAccessGroup {
  groupId: string;
  groupSlug: string;
  enabled: boolean;
  permissions: RolePermission[];
}

/**
 * Permission assignment within a role's access group
 */
export interface RolePermission {
  permissionId: string;
  action: PermissionAction;
  accessType: AccessType;
}

/**
 * Predefined access groups for the system
 */
export const DEFAULT_ACCESS_GROUPS: AccessGroup[] = [
  {
    id: "ag_dashboard",
    name: "Dashboard",
    slug: "dashboard",
    description: "Access to dashboard and analytics",
    icon: "Dashboard",
    color: "#2196f3",
    order: 1,
    permissions: [
      {
        id: "p_dashboard_view",
        action: "view",
        accessType: "ALLOW",
        description: "View dashboard",
      },
    ],
  },
  {
    id: "ag_users",
    name: "Users",
    slug: "users",
    description: "User management",
    icon: "People",
    color: "#4caf50",
    order: 2,
    permissions: [
      {
        id: "p_users_view",
        action: "view",
        accessType: "ALLOW",
        description: "View users",
      },
      {
        id: "p_users_create",
        action: "create",
        accessType: "ALLOW",
        description: "Create users",
      },
      {
        id: "p_users_update",
        action: "update",
        accessType: "ALLOW",
        description: "Update users",
      },
      {
        id: "p_users_delete",
        action: "delete",
        accessType: "ALLOW",
        description: "Delete users",
      },
    ],
  },
  {
    id: "ag_orders",
    name: "Orders",
    slug: "orders",
    description: "Order management",
    icon: "ShoppingCart",
    color: "#ff9800",
    order: 3,
    permissions: [
      {
        id: "p_orders_view",
        action: "view",
        accessType: "ALLOW",
        description: "View orders",
      },
      {
        id: "p_orders_create",
        action: "create",
        accessType: "ALLOW",
        description: "Create orders",
      },
      {
        id: "p_orders_update",
        action: "update",
        accessType: "ALLOW",
        description: "Update orders",
      },
      {
        id: "p_orders_delete",
        action: "delete",
        accessType: "ALLOW",
        description: "Delete orders",
      },
    ],
  },
  {
    id: "ag_reports",
    name: "Reports",
    slug: "reports",
    description: "Reporting and analytics",
    icon: "Assessment",
    color: "#9c27b0",
    order: 4,
    permissions: [
      {
        id: "p_reports_view",
        action: "view",
        accessType: "ALLOW",
        description: "View reports",
      },
      {
        id: "p_reports_create",
        action: "create",
        accessType: "ALLOW",
        description: "Create reports",
      },
    ],
  },
  {
    id: "ag_settings",
    name: "Settings",
    slug: "settings",
    description: "System settings",
    icon: "Settings",
    color: "#607d8b",
    order: 5,
    permissions: [
      {
        id: "p_settings_view",
        action: "view",
        accessType: "ALLOW",
        description: "View settings",
      },
      {
        id: "p_settings_update",
        action: "update",
        accessType: "ALLOW",
        description: "Update settings",
      },
    ],
  },
];

/**
 * Default roles with their configurations
 */
export const DEFAULT_ROLES: Role[] = [
  {
    id: "role_admin",
    name: "Admin",
    slug: "admin",
    description: "Full access to all features",
    color: "#d32f2f",
    isDefault: false,
    isSystem: true,
    accessGroups: DEFAULT_ACCESS_GROUPS.map((group) => ({
      groupId: group.id,
      groupSlug: group.slug,
      enabled: true,
      permissions: group.permissions.map((p) => ({
        permissionId: p.id,
        action: p.action,
        accessType: "FULL" as AccessType,
      })),
    })),
  },
  {
    id: "role_manager",
    name: "Manager",
    slug: "manager",
    description: "Can manage users and view reports",
    color: "#1976d2",
    isDefault: false,
    isSystem: false,
    accessGroups: [
      {
        groupId: "ag_dashboard",
        groupSlug: "dashboard",
        enabled: true,
        permissions: [
          {
            permissionId: "p_dashboard_view",
            action: "view",
            accessType: "ALLOW",
          },
        ],
      },
      {
        groupId: "ag_users",
        groupSlug: "users",
        enabled: true,
        permissions: [
          { permissionId: "p_users_view", action: "view", accessType: "ALLOW" },
          {
            permissionId: "p_users_update",
            action: "update",
            accessType: "ALLOW",
          },
        ],
      },
      {
        groupId: "ag_reports",
        groupSlug: "reports",
        enabled: true,
        permissions: [
          {
            permissionId: "p_reports_view",
            action: "view",
            accessType: "READ_ONLY",
          },
        ],
      },
    ],
  },
  {
    id: "role_user",
    name: "User",
    slug: "user",
    description: "Basic user with limited access",
    color: "#4caf50",
    isDefault: true,
    isSystem: true,
    accessGroups: [
      {
        groupId: "ag_dashboard",
        groupSlug: "dashboard",
        enabled: true,
        permissions: [
          {
            permissionId: "p_dashboard_view",
            action: "view",
            accessType: "READ_ONLY",
          },
        ],
      },
    ],
  },
];

/**
 * Access type configuration for display
 */
export const ACCESS_TYPE_CONFIG: Record<
  AccessType,
  { label: string; color: string; description: string }
> = {
  ALLOW: {
    label: "Allow",
    color: "#4caf50",
    description: "Permission is granted",
  },
  DENY: {
    label: "Deny",
    color: "#f44336",
    description: "Permission is explicitly denied",
  },
  READ_ONLY: {
    label: "Read Only",
    color: "#ff9800",
    description: "Can view but not modify",
  },
  FULL: {
    label: "Full Access",
    color: "#2196f3",
    description: "Complete control including all operations",
  },
};

/**
 * Permission action configuration for display
 */
export const PERMISSION_ACTION_CONFIG: Record<
  PermissionAction,
  { label: string; icon: string }
> = {
  view: { label: "View", icon: "Visibility" },
  create: { label: "Create", icon: "Add" },
  update: { label: "Update", icon: "Edit" },
  delete: { label: "Delete", icon: "Delete" },
};

/**
 * Helper to check if a role has a specific permission
 */
export const hasPermission = (
  role: Role,
  groupSlug: string,
  action: PermissionAction,
): boolean => {
  const accessGroup = role.accessGroups.find(
    (ag) => ag.groupSlug === groupSlug && ag.enabled,
  );
  if (!accessGroup) return false;

  const permission = accessGroup.permissions.find((p) => p.action === action);
  if (!permission) return false;

  return permission.accessType !== "DENY";
};

/**
 * Helper to get the access type for a specific permission
 */
export const getAccessType = (
  role: Role,
  groupSlug: string,
  action: PermissionAction,
): AccessType | null => {
  const accessGroup = role.accessGroups.find(
    (ag) => ag.groupSlug === groupSlug && ag.enabled,
  );
  if (!accessGroup) return null;

  const permission = accessGroup.permissions.find((p) => p.action === action);
  return permission?.accessType ?? null;
};

/**
 * Helper to create a new role with default structure
 */
export const createNewRole = (): Role => ({
  id: `role_${Date.now()}`,
  name: "",
  slug: "",
  description: "",
  color: "#1976d2",
  isDefault: false,
  isSystem: false,
  accessGroups: [],
});

/**
 * Helper to create an access group assignment for a role
 */
export const createRoleAccessGroup = (
  accessGroup: AccessGroup,
): RoleAccessGroup => ({
  groupId: accessGroup.id,
  groupSlug: accessGroup.slug,
  enabled: false,
  permissions: accessGroup.permissions.map((p) => ({
    permissionId: p.id,
    action: p.action,
    accessType: "DENY" as AccessType,
  })),
});
