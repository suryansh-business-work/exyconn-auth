export interface ApiTokenFormValues {
  id?: string;
  name: string;
  description: string;
  roleId: string;
  expiresIn: string;
  token?: string;
  isActive: boolean;
  createdAt?: string;
  lastUsedAt?: string;
  scopes: string[];
}

export const AVAILABLE_SCOPES = [
  {
    id: "users:read",
    label: "Read Users",
    description: "View user information",
    category: "Users",
  },
  {
    id: "users:write",
    label: "Write Users",
    description: "Create/update users",
    category: "Users",
  },
  {
    id: "users:delete",
    label: "Delete Users",
    description: "Remove users",
    category: "Users",
  },
  {
    id: "roles:read",
    label: "Read Roles",
    description: "View roles",
    category: "Roles",
  },
  {
    id: "roles:write",
    label: "Write Roles",
    description: "Create/update roles",
    category: "Roles",
  },
  {
    id: "settings:read",
    label: "Read Settings",
    description: "View organization settings",
    category: "Settings",
  },
  {
    id: "settings:write",
    label: "Write Settings",
    description: "Update organization settings",
    category: "Settings",
  },
  {
    id: "audit:read",
    label: "Read Audit",
    description: "View audit logs",
    category: "Audit",
  },
  {
    id: "api:manage",
    label: "Manage API",
    description: "Full API management",
    category: "API",
  },
];

export const EXPIRATION_OPTIONS = [
  { value: "7d", label: "7 Days" },
  { value: "30d", label: "30 Days" },
  { value: "90d", label: "90 Days" },
  { value: "180d", label: "180 Days" },
  { value: "365d", label: "1 Year" },
  { value: "never", label: "Never Expires" },
];

export const generateMockToken = (prefix: string = "exy"): string => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = `${prefix}_`;
  for (let i = 0; i < 40; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
};

export const createDefaultToken = (): ApiTokenFormValues => ({
  name: "",
  description: "",
  roleId: "",
  expiresIn: "30d",
  token: generateMockToken(),
  isActive: true,
  scopes: [],
});

export const getDaysUntilExpiry = (expiresIn: string): number => {
  const match = expiresIn.match(/^(\d+)d$/);
  if (match) return parseInt(match[1]);
  if (expiresIn === "never") return Infinity;
  return 0;
};
