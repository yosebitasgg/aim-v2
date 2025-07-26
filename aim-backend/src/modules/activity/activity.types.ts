import { z } from 'zod';

// Enum para los tipos de actividades del sistema
export enum ActivityType {
  // Autenticación
  LOGIN = 'login',
  LOGOUT = 'logout',
  REGISTER = 'register',
  PASSWORD_RESET = 'password_reset',
  PASSWORD_CHANGE = 'password_change',
  
  // Usuarios
  USER_CREATE = 'user_create',
  USER_UPDATE = 'user_update',
  USER_DELETE = 'user_delete',
  USER_SUSPEND = 'user_suspend',
  USER_ACTIVATE = 'user_activate',
  
  // Roles y Permisos
  ROLE_CREATE = 'role_create',
  ROLE_UPDATE = 'role_update',
  ROLE_DELETE = 'role_delete',
  ROLE_ASSIGN = 'role_assign',
  PERMISSION_CHECK = 'permission_check',
  PERMISSION_DENIED = 'permission_denied',
  
  // Agentes IA
  AGENT_CREATE = 'agent_create',
  AGENT_UPDATE = 'agent_update',
  AGENT_DELETE = 'agent_delete',
  AGENT_DEPLOY = 'agent_deploy',
  AGENT_EXECUTE = 'agent_execute',
  
  // Clientes
  CLIENT_CREATE = 'client_create',
  CLIENT_UPDATE = 'client_update',
  CLIENT_DELETE = 'client_delete',
  CLIENT_VIEW = 'client_view',
  
  // Órdenes
  ORDER_CREATE = 'order_create',
  ORDER_UPDATE = 'order_update',
  ORDER_DELETE = 'order_delete',
  ORDER_COMPLETE = 'order_complete',
  
  // Cotizaciones
  QUOTE_CREATE = 'quote_create',
  QUOTE_UPDATE = 'quote_update',
  QUOTE_DELETE = 'quote_delete',
  QUOTE_APPROVE = 'quote_approve',
  
  // Facturación
  INVOICE_CREATE = 'invoice_create',
  INVOICE_UPDATE = 'invoice_update',
  INVOICE_SEND = 'invoice_send',
  INVOICE_PAY = 'invoice_pay',
  
  // Sistema
  SETTINGS_UPDATE = 'settings_update',
  BACKUP_CREATE = 'backup_create',
  IMPORT_DATA = 'import_data',
  EXPORT_DATA = 'export_data',
  
  // API y Security
  API_ACCESS = 'api_access',
  SECURITY_ALERT = 'security_alert',
  RATE_LIMIT_HIT = 'rate_limit_hit'
}

// Enum para los módulos del sistema
export enum ActivityModule {
  AUTH = 'auth',
  USERS = 'users',
  ROLES = 'roles',
  PERMISSIONS = 'permissions',
  AGENTS = 'agents',
  CLIENTS = 'clients',
  ORDERS = 'orders',
  QUOTES = 'quotes',
  BILLING = 'billing',
  REPORTS = 'reports',
  DEPARTMENTS = 'departments',
  SETTINGS = 'settings',
  API = 'api',
  SECURITY = 'security'
}

// Enum para los niveles de severidad
export enum ActivitySeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Schema de validación para crear una actividad
export const CreateActivitySchema = z.object({
  userId: z.string().min(1, 'El ID del usuario es requerido'),
  action: z.nativeEnum(ActivityType, {
    errorMap: () => ({ message: 'Tipo de actividad inválido' })
  }),
  module: z.nativeEnum(ActivityModule).optional(),
  details: z.record(z.any()).optional(),
  ipAddress: z.string().ip().optional(),
  userAgent: z.string().optional(),
  severity: z.nativeEnum(ActivitySeverity).default(ActivitySeverity.LOW),
  affectedResourceId: z.string().optional(),
  affectedResourceType: z.string().optional()
});

// Schema para consultar actividades con filtros
export const ActivityQuerySchema = z.object({
  userId: z.string().optional(),
  action: z.nativeEnum(ActivityType).optional(),
  module: z.nativeEnum(ActivityModule).optional(),
  severity: z.nativeEnum(ActivitySeverity).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  ipAddress: z.string().ip().optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
  sortBy: z.enum(['createdAt', 'action', 'module', 'severity']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// Schema para estadísticas de actividad
export const ActivityStatsSchema = z.object({
  userId: z.string().optional(),
  module: z.nativeEnum(ActivityModule).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  groupBy: z.enum(['action', 'module', 'hour', 'day', 'week']).default('day')
});

// Tipos TypeScript derivados de los schemas
export type CreateActivityInput = z.infer<typeof CreateActivitySchema>;
export type ActivityQueryParams = z.infer<typeof ActivityQuerySchema>;
export type ActivityStatsParams = z.infer<typeof ActivityStatsSchema>;

// Interfaz para una actividad completa (incluye campos de DB)
export interface ActivityLog {
  id: number;
  userId: string;
  action: ActivityType;
  module?: ActivityModule;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  severity: ActivitySeverity;
  affectedResourceId?: string;
  affectedResourceType?: string;
  createdAt: Date;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

// Interfaz para respuesta de actividades paginadas
export interface ActivityListResponse {
  activities: ActivityLog[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    pages: number;
    currentPage: number;
  };
  filters: ActivityQueryParams;
}

// Interfaz para estadísticas de actividad
export interface ActivityStats {
  totalActivities: number;
  activitiesByModule: Record<ActivityModule, number>;
  activitiesByAction: Record<ActivityType, number>;
  activitiesBySeverity: Record<ActivitySeverity, number>;
  activitiesOverTime: Array<{
    period: string;
    count: number;
  }>;
  topUsers: Array<{
    userId: string;
    userName: string;
    count: number;
  }>;
}

// Interfaz para configuración de auditoría
export interface AuditConfig {
  enableAutoLogging: boolean;
  logApiCalls: boolean;
  logPermissionChecks: boolean;
  logFailedAttempts: boolean;
  retentionDays: number;
  excludedPaths: string[];
  excludedActions: ActivityType[];
}

// Tipos para middleware de actividad
export interface ActivityContext {
  userId?: string;
  action: ActivityType;
  module?: ActivityModule;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  severity?: ActivitySeverity;
  affectedResourceId?: string;
  affectedResourceType?: string;
}

// Schema de respuesta de API estándar
export const ActivityResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.any().optional(),
  errors: z.array(z.string()).optional()
});

export type ActivityResponse<T = any> = {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
}; 