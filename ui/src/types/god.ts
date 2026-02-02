// God Panel Types
export interface GodOrganization {
  _id: string;
  orgName: string;
  orgEmail: string;
  orgSlug?: string;
  orgActiveStatus?: boolean;
  orgBusinessType?: string;
  numberOfEmployees?: number;
  authServerUrl?: string;
  apiKey?: string;
  apiKeyCreatedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface LoginHistoryItem {
  loginAt: string;
  ipAddress: string;
  userAgent: string;
  location?: {
    city?: string;
    country?: string;
  };
  details?: any;
}

export interface GodUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  companyId: string;
  role: string;
  isVerified: boolean;
  profilePicture?: string;
  provider?: string;
  mfaEnabled?: boolean;
  loginHistory?: LoginHistoryItem[];
  lastLoginAt?: string;
  lastLoginIp?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface OrganizationStatistics {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  verifiedUsers: number;
  unverifiedUsers: number;
  recentLogins: number;
  todayRegistrations: number;
  weekRegistrations: number;
  monthRegistrations: number;
}

export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
