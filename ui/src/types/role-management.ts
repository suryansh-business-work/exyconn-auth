// Advanced Role Management Types
// Following the structure: User → Role → Permissions → Access Group

/**
 * Permission actions available for any resource
 */
export type PermissionAction =
  | "create"
  | "read"
  | "update"
  | "delete"
  | "manage"
  | "export"
  | "import";

/**
 * Individual permission for a specific resource action
 */
export interface Permission {
  id: string;
  resource: string; // e.g., 'users', 'orders', 'reports', 'dashboard'
  action: PermissionAction;
  allowed: boolean;
  description?: string;
}

/**
 * Access Group / Module - represents a functional area of the application
 */
export interface AccessGroup {
  id: string;
  name: string; // e.g., 'User Management', 'Order Management'
  slug: string; // e.g., 'userManagement', 'orderManagement'
  description?: string;
  icon?: string; // Icon name for UI display
  permissions: Permission[];
}

/**
 * Role - represents a user type with associated permissions
 */
export interface Role {
  id: string;
  name: string; // e.g., 'Admin', 'Manager', 'User'
  slug: string; // e.g., 'admin', 'manager', 'user'
  description?: string;
  color?: string; // UI color for the role badge
  isDefault?: boolean; // Assigned to new users
  isSystem?: boolean; // Cannot be deleted
  accessGroups: RoleAccessGroup[];
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Role's access to a specific group with permissions
 */
export interface RoleAccessGroup {
  groupId: string;
  groupSlug: string;
  permissions: string[]; // Array of permission IDs that are allowed
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
    permissions: [
      {
        id: "p_dashboard_read",
        resource: "dashboard",
        action: "read",
        allowed: true,
        description: "View dashboard",
      },
      {
        id: "p_dashboard_export",
        resource: "dashboard",
        action: "export",
        allowed: true,
        description: "Export dashboard data",
      },
    ],
  },
  {
    id: "ag_users",
    name: "User Management",
    slug: "users",
    description: "Manage users and their accounts",
    icon: "People",
    permissions: [
      {
        id: "p_users_read",
        resource: "users",
        action: "read",
        allowed: true,
        description: "View users",
      },
      {
        id: "p_users_create",
        resource: "users",
        action: "create",
        allowed: true,
        description: "Create users",
      },
      {
        id: "p_users_update",
        resource: "users",
        action: "update",
        allowed: true,
        description: "Update users",
      },
      {
        id: "p_users_delete",
        resource: "users",
        action: "delete",
        allowed: true,
        description: "Delete users",
      },
      {
        id: "p_users_manage",
        resource: "users",
        action: "manage",
        allowed: true,
        description: "Manage user roles",
      },
    ],
  },
  {
    id: "ag_roles",
    name: "Role Management",
    slug: "roles",
    description: "Manage roles and permissions",
    icon: "AdminPanelSettings",
    permissions: [
      {
        id: "p_roles_read",
        resource: "roles",
        action: "read",
        allowed: true,
        description: "View roles",
      },
      {
        id: "p_roles_create",
        resource: "roles",
        action: "create",
        allowed: true,
        description: "Create roles",
      },
      {
        id: "p_roles_update",
        resource: "roles",
        action: "update",
        allowed: true,
        description: "Update roles",
      },
      {
        id: "p_roles_delete",
        resource: "roles",
        action: "delete",
        allowed: true,
        description: "Delete roles",
      },
    ],
  },
  {
    id: "ag_api",
    name: "API Management",
    slug: "api",
    description: "Manage API keys and access",
    icon: "Api",
    permissions: [
      {
        id: "p_api_read",
        resource: "api",
        action: "read",
        allowed: true,
        description: "View API keys",
      },
      {
        id: "p_api_create",
        resource: "api",
        action: "create",
        allowed: true,
        description: "Create API keys",
      },
      {
        id: "p_api_delete",
        resource: "api",
        action: "delete",
        allowed: true,
        description: "Revoke API keys",
      },
    ],
  },
  {
    id: "ag_settings",
    name: "Settings",
    slug: "settings",
    description: "Organization settings",
    icon: "Settings",
    permissions: [
      {
        id: "p_settings_read",
        resource: "settings",
        action: "read",
        allowed: true,
        description: "View settings",
      },
      {
        id: "p_settings_update",
        resource: "settings",
        action: "update",
        allowed: true,
        description: "Update settings",
      },
    ],
  },
  {
    id: "ag_reports",
    name: "Reports",
    slug: "reports",
    description: "Access to reports and analytics",
    icon: "Assessment",
    permissions: [
      {
        id: "p_reports_read",
        resource: "reports",
        action: "read",
        allowed: true,
        description: "View reports",
      },
      {
        id: "p_reports_export",
        resource: "reports",
        action: "export",
        allowed: true,
        description: "Export reports",
      },
    ],
  },
  {
    id: "ag_audit",
    name: "Audit Logs",
    slug: "audit",
    description: "View system audit logs",
    icon: "History",
    permissions: [
      {
        id: "p_audit_read",
        resource: "audit",
        action: "read",
        allowed: true,
        description: "View audit logs",
      },
      {
        id: "p_audit_export",
        resource: "audit",
        action: "export",
        allowed: true,
        description: "Export audit logs",
      },
    ],
  },
];

/**
 * Default roles with their permissions
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
      permissions: group.permissions.map((p) => p.id), // All permissions
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
        permissions: ["p_dashboard_read"],
      },
      {
        groupId: "ag_users",
        groupSlug: "users",
        permissions: ["p_users_read", "p_users_update"],
      },
      {
        groupId: "ag_reports",
        groupSlug: "reports",
        permissions: ["p_reports_read"],
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
        permissions: ["p_dashboard_read"],
      },
    ],
  },
];

/**
 * Helper function to check if a role has a specific permission
 */
export const hasPermission = (
  role: Role,
  resource: string,
  action: PermissionAction,
): boolean => {
  const accessGroup = role.accessGroups.find((ag) => ag.groupSlug === resource);
  if (!accessGroup) return false;

  const permissionId = `p_${resource}_${action}`;
  return accessGroup.permissions.includes(permissionId);
};

/**
 * Helper function to get all permissions for a role
 */
export const getAllPermissions = (role: Role): Permission[] => {
  const permissions: Permission[] = [];

  role.accessGroups.forEach((ag) => {
    const accessGroup = DEFAULT_ACCESS_GROUPS.find((g) => g.id === ag.groupId);
    if (accessGroup) {
      accessGroup.permissions.forEach((p) => {
        if (ag.permissions.includes(p.id)) {
          permissions.push(p);
        }
      });
    }
  });

  return permissions;
};

/**
 * Generate a permission matrix for display
 */
export interface PermissionMatrix {
  accessGroup: AccessGroup;
  permissions: {
    permission: Permission;
    allowed: boolean;
  }[];
}

export const generatePermissionMatrix = (role: Role): PermissionMatrix[] => {
  return DEFAULT_ACCESS_GROUPS.map((accessGroup) => {
    const roleAccessGroup = role.accessGroups.find(
      (ag) => ag.groupId === accessGroup.id,
    );

    return {
      accessGroup,
      permissions: accessGroup.permissions.map((permission) => ({
        permission,
        allowed: roleAccessGroup?.permissions.includes(permission.id) ?? false,
      })),
    };
  });
};
