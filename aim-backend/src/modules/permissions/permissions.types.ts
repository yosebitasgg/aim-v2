import { z } from 'zod';

// Esquemas de validación para permisos
export const CreateRoleSchema = z.object({
  name: z.string().min(2, 'El nombre del rol debe tener al menos 2 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  permissions: z.object({
    dashboard: z.object({
      read: z.boolean().optional().default(false),
      create: z.boolean().optional().default(false),
      update: z.boolean().optional().default(false),
      delete: z.boolean().optional().default(false),
    }).optional().default({}),
    users: z.object({
      read: z.boolean().optional().default(false),
      create: z.boolean().optional().default(false),
      update: z.boolean().optional().default(false),
      delete: z.boolean().optional().default(false),
    }).optional().default({}),
    agents: z.object({
      read: z.boolean().optional().default(false),
      create: z.boolean().optional().default(false),
      update: z.boolean().optional().default(false),
      delete: z.boolean().optional().default(false),
    }).optional().default({}),
    clients: z.object({
      read: z.boolean().optional().default(false),
      create: z.boolean().optional().default(false),
      update: z.boolean().optional().default(false),
      delete: z.boolean().optional().default(false),
    }).optional().default({}),
    orders: z.object({
      read: z.boolean().optional().default(false),
      create: z.boolean().optional().default(false),
      update: z.boolean().optional().default(false),
      delete: z.boolean().optional().default(false),
    }).optional().default({}),
    quotes: z.object({
      read: z.boolean().optional().default(false),
      create: z.boolean().optional().default(false),
      update: z.boolean().optional().default(false),
      delete: z.boolean().optional().default(false),
    }).optional().default({}),
    billing: z.object({
      read: z.boolean().optional().default(false),
      create: z.boolean().optional().default(false),
      update: z.boolean().optional().default(false),
      delete: z.boolean().optional().default(false),
    }).optional().default({}),
    reports: z.object({
      read: z.boolean().optional().default(false),
      create: z.boolean().optional().default(false),
      update: z.boolean().optional().default(false),
      delete: z.boolean().optional().default(false),
    }).optional().default({}),
  }),
});

export const UpdateRoleSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().min(10).optional(),
  permissions: z.object({
    dashboard: z.object({
      read: z.boolean().optional(),
      create: z.boolean().optional(),
      update: z.boolean().optional(),
      delete: z.boolean().optional(),
    }).optional(),
    users: z.object({
      read: z.boolean().optional(),
      create: z.boolean().optional(),
      update: z.boolean().optional(),
      delete: z.boolean().optional(),
    }).optional(),
    agents: z.object({
      read: z.boolean().optional(),
      create: z.boolean().optional(),
      update: z.boolean().optional(),
      delete: z.boolean().optional(),
    }).optional(),
    clients: z.object({
      read: z.boolean().optional(),
      create: z.boolean().optional(),
      update: z.boolean().optional(),
      delete: z.boolean().optional(),
    }).optional(),
    orders: z.object({
      read: z.boolean().optional(),
      create: z.boolean().optional(),
      update: z.boolean().optional(),
      delete: z.boolean().optional(),
    }).optional(),
    quotes: z.object({
      read: z.boolean().optional(),
      create: z.boolean().optional(),
      update: z.boolean().optional(),
      delete: z.boolean().optional(),
    }).optional(),
    billing: z.object({
      read: z.boolean().optional(),
      create: z.boolean().optional(),
      update: z.boolean().optional(),
      delete: z.boolean().optional(),
    }).optional(),
    reports: z.object({
      read: z.boolean().optional(),
      create: z.boolean().optional(),
      update: z.boolean().optional(),
      delete: z.boolean().optional(),
    }).optional(),
  }).optional(),
});

export const AssignRoleSchema = z.object({
  userId: z.string().min(1, 'ID de usuario requerido'),
  roleId: z.string().min(1, 'ID de rol requerido'),
});

export const CheckPermissionSchema = z.object({
  module: z.string().min(1, 'Módulo requerido'),
  action: z.enum(['read', 'create', 'update', 'delete', 'export'], {
    errorMap: () => ({ message: 'Acción debe ser: read, create, update, delete, export' }),
  }),
  resourceId: z.string().optional(),
});

// Tipos inferidos
export type CreateRoleRequest = z.infer<typeof CreateRoleSchema>;
export type UpdateRoleRequest = z.infer<typeof UpdateRoleSchema>;
export type AssignRoleRequest = z.infer<typeof AssignRoleSchema>;
export type CheckPermissionRequest = z.infer<typeof CheckPermissionSchema>;

// Interfaces para respuestas - ajustadas para el esquema actual
export interface RoleResponse {
  id: string;
  name: string;
  description: string;
  permissions: ModulePermissions;
  usersCount: number;
  createdAt: Date;
}

export interface ModulePermissions {
  dashboard?: ActionPermissions;
  users?: ActionPermissions;
  agents?: ActionPermissions;
  clients?: ActionPermissions;
  orders?: ActionPermissions;
  documents?: ActionPermissions;
  quotes?: ActionPermissions;
  billing?: ActionPermissions;
  reports?: ActionPermissions;
}

export interface ActionPermissions {
  read?: boolean;
  create?: boolean;
  update?: boolean;
  delete?: boolean;
}

export interface PermissionCheckResult {
  hasPermission: boolean;
  module: string;
  action: string;
  resourceId?: string;
  reason?: string;
} 