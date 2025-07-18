export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
  path?: string;
}

export interface PaginatedResponse<T = any> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: string;
  department?: string;
  createdAt?: Date;
  permissions?: string[];
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  userId: string;
  tokenId: string;
  iat?: number;
  exp?: number;
}

export interface ActivityLogData {
  action: string;
  module?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export interface PermissionCheck {
  module: string;
  action: 'read' | 'create' | 'update' | 'delete';
  resourceId?: string;
}

export interface RolePermissions {
  [module: string]: {
    read: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
  };
}

export interface UserFilters {
  search?: string;
  role?: string;
  status?: string;
  department?: string;
}

export interface UserPreferences {
  theme?: 'light' | 'dark';
  language?: string;
  timezone?: string;
  notifications?: {
    email: boolean;
    push: boolean;
  };
}

export interface UserRestrictions {
  allowedHours?: {
    start: string;
    end: string;
  };
  allowedIPs?: string[];
  maxSessions?: number;
} 