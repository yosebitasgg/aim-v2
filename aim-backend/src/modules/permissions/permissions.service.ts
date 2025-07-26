import { prisma } from '@/database/client';
import { logger } from '@/shared/utils/logger';
import { 
  CreateRoleRequest, 
  UpdateRoleRequest, 
  AssignRoleRequest,
  CheckPermissionRequest,
  RoleResponse,
  PermissionCheckResult,
  ModulePermissions
} from './permissions.types';
import { PaginationParams, PaginatedResponse } from '@/shared/types';
import { DEFAULT_PERMISSIONS, USER_ROLES } from '@/shared/constants';

export class PermissionsService {
  /**
   * Crear un nuevo rol personalizado
   */
  static async createRole(data: CreateRoleRequest): Promise<RoleResponse> {
    try {
      // Verificar que el nombre del rol no esté en uso
      const existingRole = await prisma.role.findFirst({
        where: { name: { equals: data.name, mode: 'insensitive' } },
      });

      if (existingRole) {
        throw new Error('Ya existe un rol con ese nombre');
      }

      // Crear el rol
      const role = await prisma.role.create({
        data: {
          name: data.name,
          description: data.description,
          permissions: data.permissions as any,
        },
      });

      logger.info('Rol creado exitosamente', { roleId: role.id, name: role.name });

      return {
        id: role.id,
        name: role.name,
        description: role.description ?? '',
        permissions: role.permissions as ModulePermissions,
        usersCount: 0,
        createdAt: role.createdAt,
      };
    } catch (error: any) {
      logger.error('Error creando rol', { error: error.message, data });
      throw error;
    }
  }

  /**
   * Obtener todos los roles con paginación
   */
  static async getRoles(params: PaginationParams): Promise<PaginatedResponse<RoleResponse>> {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        sortBy = 'name',
        sortOrder = 'asc',
      } = params;

      const skip = (page - 1) * limit;
      const where = search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' as const } },
              { description: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {};

      const [roles, total] = await Promise.all([
        prisma.role.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          include: {
            _count: {
              select: { users: true }
            }
          }
        }),
        prisma.role.count({ where }),
      ]);

      const items: RoleResponse[] = roles.map(role => ({
        id: role.id,
        name: role.name,
        description: role.description ?? '',
        permissions: role.permissions as ModulePermissions,
        usersCount: role._count.users,
        createdAt: role.createdAt,
      }));

      return {
        items,
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      };
    } catch (error: any) {
      logger.error('Error obteniendo roles', { error: error.message, params });
      throw new Error('Error al obtener los roles');
    }
  }

  /**
   * Obtener un rol por ID
   */
  static async getRoleById(roleId: string): Promise<RoleResponse> {
    try {
      const role = await prisma.role.findUnique({
        where: { id: roleId },
        include: {
          _count: {
            select: { users: true }
          }
        }
      });

      if (!role) {
        throw new Error('Rol no encontrado');
      }

      return {
        id: role.id,
        name: role.name,
        description: role.description ?? '',
        permissions: role.permissions as ModulePermissions,
        usersCount: role._count.users,
        createdAt: role.createdAt,
      };
    } catch (error: any) {
      logger.error('Error obteniendo rol', { error: error.message, roleId });
      throw error;
    }
  }

  /**
   * NUEVO: Asignar rol a un usuario
   */
  static async assignRole(data: AssignRoleRequest): Promise<void> {
    try {
      // Verificar que el usuario existe
      const user = await prisma.user.findUnique({
        where: { id: data.userId },
      });

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Verificar que el rol existe
      const role = await prisma.role.findUnique({
        where: { id: data.roleId },
      });

      if (!role) {
        throw new Error('Rol no encontrado');
      }

      // Actualizar el usuario con el nuevo rol
      await prisma.user.update({
        where: { id: data.userId },
        data: {
          roleId: data.roleId,
          role: role.name, // Mantener compatibilidad con el campo string
        },
      });

      logger.info('Rol asignado exitosamente', {
        userId: data.userId,
        roleId: data.roleId,
        roleName: role.name,
      });
    } catch (error: any) {
      logger.error('Error asignando rol', { error: error.message, data });
      throw error;
    }
  }

  /**
   * NUEVO: Desasignar rol de un usuario (volver a rol por defecto)
   */
  static async unassignRole(userId: string): Promise<void> {
    try {
      // Verificar que el usuario existe
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Volver al rol por defecto
      await prisma.user.update({
        where: { id: userId },
        data: {
          roleId: null,
          role: 'user', // Rol por defecto
        },
      });

      logger.info('Rol desasignado exitosamente', { userId });
    } catch (error: any) {
      logger.error('Error desasignando rol', { error: error.message, userId });
      throw error;
    }
  }

  /**
   * NUEVO: Actualizar rol existente
   */
  static async updateRole(roleId: string, data: UpdateRoleRequest): Promise<RoleResponse> {
    try {
      // Verificar que el rol existe
      const existingRole = await prisma.role.findUnique({
        where: { id: roleId },
      });

      if (!existingRole) {
        throw new Error('Rol no encontrado');
      }

      // Verificar nombre único si se está actualizando
      if (data.name && data.name !== existingRole.name) {
        const nameExists = await prisma.role.findFirst({
          where: {
            name: { equals: data.name, mode: 'insensitive' },
            id: { not: roleId }
          },
        });

        if (nameExists) {
          throw new Error('Ya existe un rol con ese nombre');
        }
      }

      // Actualizar el rol
      const updatedRole = await prisma.role.update({
        where: { id: roleId },
        data: {
          name: data.name,
          description: data.description,
          permissions: data.permissions as any,
        },
        include: {
          _count: {
            select: { users: true }
          }
        }
      });

      // Si se cambió el nombre, actualizar usuarios que tengan este rol
      if (data.name && data.name !== existingRole.name) {
        await prisma.user.updateMany({
          where: { roleId: roleId },
          data: { role: data.name }
        });
      }

      logger.info('Rol actualizado exitosamente', { roleId, name: updatedRole.name });

      return {
        id: updatedRole.id,
        name: updatedRole.name,
        description: updatedRole.description ?? '',
        permissions: updatedRole.permissions as ModulePermissions,
        usersCount: updatedRole._count.users,
        createdAt: updatedRole.createdAt,
      };
    } catch (error: any) {
      logger.error('Error actualizando rol', { error: error.message, roleId, data });
      throw error;
    }
  }

  /**
   * NUEVO: Eliminar rol
   */
  static async deleteRole(roleId: string): Promise<void> {
    try {
      // Verificar que el rol existe
      const role = await prisma.role.findUnique({
        where: { id: roleId },
        include: {
          _count: {
            select: { users: true }
          }
        }
      });

      if (!role) {
        throw new Error('Rol no encontrado');
      }

      // No permitir eliminar roles que tengan usuarios asignados
      if (role._count.users > 0) {
        throw new Error('No se puede eliminar un rol que tiene usuarios asignados');
      }

      // Eliminar el rol
      await prisma.role.delete({
        where: { id: roleId },
      });

      logger.info('Rol eliminado exitosamente', { roleId, name: role.name });
    } catch (error: any) {
      logger.error('Error eliminando rol', { error: error.message, roleId });
      throw error;
    }
  }

  /**
   * Verificar si un usuario tiene un permiso específico
   */
  static async checkUserPermission(
    userId: string,
    request: CheckPermissionRequest
  ): Promise<PermissionCheckResult> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          customRole: true
        }
      });

      if (!user) {
        return {
          hasPermission: false,
          module: request.module,
          action: request.action,
          resourceId: request.resourceId,
          reason: 'Usuario no encontrado',
        };
      }

      let permissions: ModulePermissions;

      // Si tiene un rol personalizado, usar esos permisos
      if (user.customRole) {
        permissions = user.customRole.permissions as ModulePermissions;
      } else {
        // Usar permisos por defecto basados en el rol string
        const roleKey = user.role as keyof typeof DEFAULT_PERMISSIONS;
        permissions = DEFAULT_PERMISSIONS[roleKey] || DEFAULT_PERMISSIONS[USER_ROLES.USER];
      }

      // Verificar el permiso específico
      const modulePermissions = permissions[request.module as keyof ModulePermissions];
      if (!modulePermissions) {
        return {
          hasPermission: false,
          module: request.module,
          action: request.action,
          resourceId: request.resourceId,
          reason: 'Módulo no encontrado en permisos',
        };
      }

      const hasPermission = modulePermissions[request.action as keyof typeof modulePermissions] || false;

      return {
        hasPermission,
        module: request.module,
        action: request.action,
        resourceId: request.resourceId,
        reason: hasPermission ? undefined : 'Permiso no otorgado',
      };
    } catch (error: any) {
      logger.error('Error verificando permisos', { error: error.message, userId, request });
      return {
        hasPermission: false,
        module: request.module,
        action: request.action,
        resourceId: request.resourceId,
        reason: 'Error interno verificando permisos',
      };
    }
  }

  /**
   * Obtener los permisos de un usuario
   */
  static async getUserPermissions(userId: string): Promise<ModulePermissions> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          customRole: true
        }
      });

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Si tiene un rol personalizado, usar esos permisos
      if (user.customRole) {
        return user.customRole.permissions as ModulePermissions;
      }

      // Usar permisos por defecto basados en el rol string
      const roleKey = user.role as keyof typeof DEFAULT_PERMISSIONS;
      return DEFAULT_PERMISSIONS[roleKey] || DEFAULT_PERMISSIONS[USER_ROLES.USER];
    } catch (error: any) {
      logger.error('Error obteniendo permisos de usuario', { error: error.message, userId });
      throw error;
    }
  }

  /**
   * NUEVO: Obtener usuarios con sus roles
   */
  static async getUsersWithRoles(params: PaginationParams): Promise<PaginatedResponse<any>> {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        sortBy = 'name',
        sortOrder = 'asc',
      } = params;

      const skip = (page - 1) * limit;
      const where = search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' as const } },
              { email: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {};

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
            department: true,
            createdAt: true,
            lastLoginAt: true,
            customRole: {
              select: {
                id: true,
                name: true,
                description: true,
              }
            }
          }
        }),
        prisma.user.count({ where }),
      ]);

      const items = users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        department: user.department,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
        customRole: user.customRole,
      }));

      return {
        items,
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      };
    } catch (error: any) {
      logger.error('Error obteniendo usuarios con roles', { error: error.message, params });
      throw new Error('Error al obtener usuarios con roles');
    }
  }

  /**
   * NUEVO: Configurar usuario maestro
   */
  static async makeMasterUser(userId: string): Promise<void> {
    try {
      // Verificar que el usuario existe
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Buscar o crear el rol de master
      let masterRole = await prisma.role.findFirst({
        where: { name: 'master' },
      });

      if (!masterRole) {
        masterRole = await prisma.role.create({
          data: {
            name: 'master',
            description: 'Usuario maestro con todos los permisos del sistema',
            permissions: {
              dashboard: { read: true, create: true, update: true, delete: true },
              users: { read: true, create: true, update: true, delete: true },
              agents: { read: true, create: true, update: true, delete: true },
              clients: { read: true, create: true, update: true, delete: true },
              orders: { read: true, create: true, update: true, delete: true },
              quotes: { read: true, create: true, update: true, delete: true },
              billing: { read: true, create: true, update: true, delete: true },
              reports: { read: true, create: true, update: true, delete: true },
            },
            isDefault: false,
          },
        });
      }

      // Asignar el rol master al usuario
      await prisma.user.update({
        where: { id: userId },
        data: {
          roleId: masterRole.id,
          role: 'master',
        },
      });

      logger.info('Usuario configurado como maestro', { userId, userEmail: user.email });
    } catch (error: any) {
      logger.error('Error configurando usuario maestro', { error: error.message, userId });
      throw error;
    }
  }

  /**
   * NUEVO: Inicializar roles por defecto del sistema
   */
  static async initializeDefaultRoles(): Promise<void> {
    try {
      const defaultRoles = [
        {
          name: 'admin',
          description: 'Administrador del sistema con permisos completos',
          permissions: {
            dashboard: { read: true, create: true, update: true, delete: true },
            users: { read: true, create: true, update: true, delete: true },
            agents: { read: true, create: true, update: true, delete: true },
            clients: { read: true, create: true, update: true, delete: true },
            orders: { read: true, create: true, update: true, delete: true },
            quotes: { read: true, create: true, update: true, delete: true },
            billing: { read: true, create: true, update: true, delete: true },
            reports: { read: true, create: true, update: true, delete: true },
            departments: { read: true, create: true, update: true, delete: true },
          },
          isDefault: true,
        },
        {
          name: 'manager',
          description: 'Gerente con permisos de lectura y gestión',
          permissions: {
            dashboard: { read: true, create: false, update: false, delete: false },
            users: { read: true, create: false, update: true, delete: false },
            agents: { read: true, create: true, update: true, delete: false },
            clients: { read: true, create: true, update: true, delete: false },
            orders: { read: true, create: true, update: true, delete: false },
            quotes: { read: true, create: true, update: true, delete: false },
            billing: { read: true, create: false, update: false, delete: false },
            reports: { read: true, create: false, update: false, delete: false },
            departments: { read: true, create: false, update: false, delete: false },
          },
          isDefault: true,
        },
        {
          name: 'employee',
          description: 'Empleado con permisos limitados',
          permissions: {
            dashboard: { read: true, create: false, update: false, delete: false },
            users: { read: false, create: false, update: false, delete: false },
            agents: { read: true, create: false, update: false, delete: false },
            clients: { read: true, create: false, update: false, delete: false },
            orders: { read: true, create: true, update: true, delete: false },
            quotes: { read: true, create: true, update: true, delete: false },
            billing: { read: false, create: false, update: false, delete: false },
            reports: { read: false, create: false, update: false, delete: false },
            departments: { read: false, create: false, update: false, delete: false },
          },
          isDefault: true,
        },
        {
          name: 'client',
          description: 'Cliente con acceso limitado a sus datos',
          permissions: {
            dashboard: { read: true, create: false, update: false, delete: false },
            users: { read: false, create: false, update: false, delete: false },
            agents: { read: true, create: false, update: false, delete: false },
            clients: { read: false, create: false, update: false, delete: false },
            orders: { read: true, create: false, update: false, delete: false },
            quotes: { read: true, create: false, update: false, delete: false },
            billing: { read: true, create: false, update: false, delete: false },
            reports: { read: false, create: false, update: false, delete: false },
            departments: { read: false, create: false, update: false, delete: false },
          },
          isDefault: true,
        },
      ];

      for (const roleData of defaultRoles) {
        // Verificar si ya existe
        const existingRole = await prisma.role.findFirst({
          where: { name: roleData.name },
        });

        if (!existingRole) {
          await prisma.role.create({
            data: roleData,
          });
          logger.info('Rol por defecto creado', { name: roleData.name });
        } else {
          logger.info('Rol por defecto ya existe', { name: roleData.name });
        }
      }

      logger.info('Inicialización de roles por defecto completada');
    } catch (error: any) {
      logger.error('Error inicializando roles por defecto', { error: error.message });
      throw error;
    }
  }
} 