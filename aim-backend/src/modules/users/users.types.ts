import { z } from 'zod';

// Schema para actualizar usuario
export const UpdateUserSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').optional(),
  email: z.string().email('Email inválido').optional(),
  department: z.string().optional(),
  phoneNumber: z.string().optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
  role: z.string().optional(),
  roleId: z.string().optional(),
  clientId: z.string().optional(),
});

// Schema para crear usuario
export const CreateUserSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  department: z.string().optional(),
  phoneNumber: z.string().optional(),
  role: z.string().default('user'),
  roleId: z.string().optional(),
  clientId: z.string().optional(),
});

// Schema para filtros de usuarios
export const UserFiltersSchema = z.object({
  search: z.string().optional(),
  department: z.string().optional(),
  role: z.string().optional(),
  status: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.enum(['name', 'email', 'createdAt', 'department', 'role']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// Tipos TypeScript derivados
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UserFilters = z.infer<typeof UserFiltersSchema>;

// Interfaz para respuesta de usuario
export interface UserResponse {
  id: string;
  name: string;
  email: string;
  department?: string;
  phoneNumber?: string;
  status: string;
  role: string;
  roleId?: string;
  clientId?: string;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  customRole?: {
    id: string;
    name: string;
    description?: string;
  };
  associatedClient?: {
    id: string;
    companyName: string;
    industry: string;
    status: string;
  };
}

// Interfaz para respuesta paginada de usuarios
export interface PaginatedUsersResponse {
  users: UserResponse[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  filters: UserFilters;
} 