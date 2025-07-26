export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user',
  VIEWER: 'viewer',
  CLIENT: 'client',
} as const;

export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  BLOCKED: 'blocked',
  PENDING: 'pending',
} as const;

export const DEPARTMENTS = {
  DIRECCION: 'direccion',
  VENTAS: 'ventas',
  OPERACIONES: 'operaciones',
  SOPORTE: 'soporte',
  FINANZAS: 'finanzas',
  RRHH: 'rrhh',
  MARKETING: 'marketing',
} as const;

export const MODULES = {
  DASHBOARD: 'dashboard',
  USERS: 'users',
  AGENTS: 'agents',
  CLIENTS: 'clients',
  ORDERS: 'orders',
  DOCUMENTS: 'documents',
  QUOTES: 'quotes',
  BILLING: 'billing',
  REPORTS: 'reports',
  DEPARTMENTS: 'departments',
} as const;

export const ACTIONS = {
  READ: 'read',
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  EXPORT: 'export',
} as const;

export const ACTIVITY_ACTIONS = {
  LOGIN: 'login',
  LOGOUT: 'logout',
  CREATE_USER: 'create_user',
  UPDATE_USER: 'update_user',
  DELETE_USER: 'delete_user',
  CHANGE_PASSWORD: 'change_password',
  RESET_PASSWORD: 'reset_password',
  UPDATE_PERMISSIONS: 'update_permissions',
  EXPORT_DATA: 'export_data',
} as const;

export const DEFAULT_PERMISSIONS = {
  [USER_ROLES.ADMIN]: {
    [MODULES.DASHBOARD]: { read: true, create: true, update: true, delete: true },
    [MODULES.USERS]: { read: true, create: true, update: true, delete: true },
    [MODULES.AGENTS]: { read: true, create: true, update: true, delete: true },
    [MODULES.CLIENTS]: { read: true, create: true, update: true, delete: true },
    [MODULES.ORDERS]: { read: true, create: true, update: true, delete: true },
    [MODULES.DOCUMENTS]: { read: true, create: true, update: true, delete: true },
    [MODULES.QUOTES]: { read: true, create: true, update: true, delete: true },
    [MODULES.BILLING]: { read: true, create: true, update: true, delete: true },
    [MODULES.REPORTS]: { read: true, create: true, update: true, delete: true },
    [MODULES.DEPARTMENTS]: { read: true, create: true, update: true, delete: true },
  },
  [USER_ROLES.MANAGER]: {
    [MODULES.DASHBOARD]: { read: true, create: false, update: false, delete: false },
    [MODULES.USERS]: { read: true, create: false, update: false, delete: false },
    [MODULES.AGENTS]: { read: true, create: true, update: true, delete: false },
    [MODULES.CLIENTS]: { read: true, create: true, update: true, delete: false },
    [MODULES.ORDERS]: { read: true, create: true, update: true, delete: false },
    [MODULES.DOCUMENTS]: { read: true, create: true, update: true, delete: false },
    [MODULES.QUOTES]: { read: true, create: true, update: true, delete: false },
    [MODULES.BILLING]: { read: true, create: false, update: false, delete: false },
    [MODULES.REPORTS]: { read: true, create: false, update: false, delete: false },
    [MODULES.DEPARTMENTS]: { read: true, create: false, update: false, delete: false },
  },
  [USER_ROLES.USER]: {
    [MODULES.DASHBOARD]: { read: true, create: false, update: false, delete: false },
    [MODULES.USERS]: { read: false, create: false, update: false, delete: false },
    [MODULES.AGENTS]: { read: true, create: true, update: true, delete: false },
    [MODULES.CLIENTS]: { read: true, create: false, update: false, delete: false },
    [MODULES.ORDERS]: { read: true, create: true, update: true, delete: false },
    [MODULES.DOCUMENTS]: { read: true, create: true, update: true, delete: false },
    [MODULES.QUOTES]: { read: true, create: false, update: false, delete: false },
    [MODULES.BILLING]: { read: false, create: false, update: false, delete: false },
    [MODULES.REPORTS]: { read: false, create: false, update: false, delete: false },
    [MODULES.DEPARTMENTS]: { read: false, create: false, update: false, delete: false },
  },
  [USER_ROLES.VIEWER]: {
    [MODULES.DASHBOARD]: { read: true, create: false, update: false, delete: false },
    [MODULES.USERS]: { read: false, create: false, update: false, delete: false },
    [MODULES.AGENTS]: { read: true, create: false, update: false, delete: false },
    [MODULES.CLIENTS]: { read: true, create: false, update: false, delete: false },
    [MODULES.ORDERS]: { read: true, create: false, update: false, delete: false },
    [MODULES.DOCUMENTS]: { read: false, create: false, update: false, delete: false },
    [MODULES.QUOTES]: { read: true, create: false, update: false, delete: false },
    [MODULES.BILLING]: { read: false, create: false, update: false, delete: false },
    [MODULES.REPORTS]: { read: false, create: false, update: false, delete: false },
    [MODULES.DEPARTMENTS]: { read: false, create: false, update: false, delete: false },
  },
  [USER_ROLES.CLIENT]: {
    [MODULES.DASHBOARD]: { read: true, create: false, update: false, delete: false },
    [MODULES.USERS]: { read: false, create: false, update: false, delete: false },
    [MODULES.AGENTS]: { read: true, create: false, update: false, delete: false },
    [MODULES.CLIENTS]: { read: false, create: false, update: false, delete: false },
    [MODULES.ORDERS]: { read: true, create: false, update: false, delete: false },
    [MODULES.DOCUMENTS]: { read: true, create: false, update: false, delete: false },
    [MODULES.QUOTES]: { read: true, create: false, update: false, delete: false },
    [MODULES.BILLING]: { read: true, create: false, update: false, delete: false },
    [MODULES.REPORTS]: { read: false, create: false, update: false, delete: false },
    [MODULES.DEPARTMENTS]: { read: false, create: false, update: false, delete: false },
  },
} as const;

export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

export const PASSWORD_REQUIREMENTS = {
  MIN_LENGTH: 8,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBERS: true,
  REQUIRE_SPECIAL: false,
} as const;

export const JWT_COOKIE_NAME = 'aim_session';
export const JWT_REFRESH_COOKIE_NAME = 'aim_refresh_token'; 