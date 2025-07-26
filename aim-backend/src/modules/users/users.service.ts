import { PrismaClient, User } from '@prisma/client';
import { logger } from '@/shared/utils/logger';
import { PasswordUtil } from '@/shared/utils/password';
import {
  CreateUserInput,
  UpdateUserInput,
  UserFilters,
  UserResponse,
  PaginatedUsersResponse
} from './users.types';

export class UsersService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Obtiene todos los usuarios con paginación y filtros
   */
  async getUsers(filters: UserFilters): Promise<PaginatedUsersResponse> {
    try {
      const where: any = {};

      // Aplicar filtros
      if (filters.search) {
        where.OR = [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { email: { contains: filters.search, mode: 'insensitive' } },
        ];
      }

      if (filters.department) {
        where.department = filters.department;
      }

      if (filters.role) {
        where.role = filters.role;
      }

      if (filters.status) {
        where.status = filters.status;
      }

      // Obtener total para paginación
      const total = await this.prisma.user.count({ where });

      // Obtener usuarios con paginación
      const users = await this.prisma.user.findMany({
        where,
        include: {
          customRole: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
          associatedClient: {
            select: {
              id: true,
              companyName: true,
              industry: true,
              status: true,
            },
          },
        },
        orderBy: {
          [filters.sortBy]: filters.sortOrder,
        },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      });

      const pages = Math.ceil(total / filters.limit);

      return {
        users: users.map(this.mapUserToResponse),
        pagination: {
          total,
          page: filters.page,
          limit: filters.limit,
          pages,
        },
        filters,
      };
    } catch (error) {
      logger.error('Error obteniendo usuarios', { error, filters });
      throw new Error('Error al obtener los usuarios');
    }
  }

  /**
   * Obtiene un usuario por ID
   */
  async getUserById(id: string): Promise<UserResponse> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        include: {
          customRole: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
          associatedClient: {
            select: {
              id: true,
              companyName: true,
              industry: true,
              status: true,
            },
          },
        },
      });

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      return this.mapUserToResponse(user);
    } catch (error) {
      logger.error('Error obteniendo usuario por ID', { error, id });
      throw error;
    }
  }

  /**
   * Crea un nuevo usuario
   */
  async createUser(data: CreateUserInput, createdBy?: string): Promise<UserResponse> {
    try {
      // Verificar si el usuario ya existe
      const existingUser = await this.prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        throw new Error('El usuario ya existe');
      }

      // Validar contraseña
      const passwordValidation = PasswordUtil.validatePassword(data.password);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.errors.join(', '));
      }

      // Crear usuario y clave en transacción
      const hashedPassword = await PasswordUtil.hashPassword(data.password);
      const userId = PasswordUtil.generateUserId();

      const user = await this.prisma.$transaction(async (tx) => {
        // Crear usuario
        const newUser = await tx.user.create({
          data: {
            id: userId,
            email: data.email,
            name: data.name,
            department: data.department,
            phoneNumber: data.phoneNumber,
            role: data.role,
            roleId: data.roleId,
            clientId: data.clientId,
            status: 'active',
            emailVerified: false,
            isFirstLogin: true,
            createdBy,
          },
          include: {
            customRole: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
            associatedClient: {
              select: {
                id: true,
                companyName: true,
                industry: true,
                status: true,
              },
            },
          },
        });

        // Crear clave
        await tx.key.create({
          data: {
            id: `email:${data.email}`,
            userId: newUser.id,
            hashedPassword,
          },
        });

        // Crear perfil de usuario
        await tx.userProfile.create({
          data: {
            userId: newUser.id,
            locale: 'es',
            preferences: {},
            restrictions: {},
          },
        });

        return newUser;
      });

      logger.info('Usuario creado exitosamente', {
        userId: user.id,
        email: user.email,
        createdBy,
      });

      return this.mapUserToResponse(user);
    } catch (error: any) {
      logger.error('Error creando usuario', { 
        error: {
          message: error?.message || 'Error desconocido',
          stack: error?.stack,
          name: error?.name,
          code: error?.code,
          type: typeof error,
          rawError: error
        }, 
        data: {
          email: data.email,
          name: data.name,
          department: data.department,
          phoneNumber: data.phoneNumber,
          role: data.role,
          roleId: data.roleId,
        }
      });
      throw error;
    }
  }

  /**
   * Actualiza un usuario existente
   */
  async updateUser(id: string, data: UpdateUserInput): Promise<UserResponse> {
    try {
      // Verificar que el usuario existe
      const existingUser = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!existingUser) {
        throw new Error('Usuario no encontrado');
      }

      // Si se está actualizando el email, verificar que no esté en uso
      if (data.email && data.email !== existingUser.email) {
        const emailInUse = await this.prisma.user.findUnique({
          where: { email: data.email },
        });

        if (emailInUse) {
          throw new Error('El email ya está en uso');
        }
      }

      // Actualizar usuario
      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: {
          name: data.name,
          email: data.email,
          department: data.department,
          phoneNumber: data.phoneNumber,
          status: data.status,
          role: data.role,
          roleId: data.roleId,
          updatedAt: new Date(),
        },
        include: {
          customRole: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
        },
      });

      logger.info('Usuario actualizado exitosamente', {
        userId: id,
        updatedFields: Object.keys(data),
      });

      return this.mapUserToResponse(updatedUser);
    } catch (error) {
      logger.error('Error actualizando usuario', { error, id, data });
      throw error;
    }
  }

  /**
   * Elimina un usuario (soft delete)
   */
  async deleteUser(id: string): Promise<void> {
    try {
      // Verificar que el usuario existe
      const existingUser = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!existingUser) {
        throw new Error('Usuario no encontrado');
      }

      // Soft delete - marcar como inactivo
      await this.prisma.user.update({
        where: { id },
        data: {
          status: 'inactive',
          updatedAt: new Date(),
        },
      });

      logger.info('Usuario eliminado exitosamente', { userId: id });
    } catch (error) {
      logger.error('Error eliminando usuario', { error, id });
      throw error;
    }
  }

  /**
   * Reactiva un usuario
   */
  async activateUser(id: string): Promise<UserResponse> {
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: {
          status: 'active',
          updatedAt: new Date(),
        },
        include: {
          customRole: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
        },
      });

      logger.info('Usuario activado exitosamente', { userId: id });
      return this.mapUserToResponse(user);
    } catch (error) {
      logger.error('Error activando usuario', { error, id });
      throw new Error('Error al activar el usuario');
    }
  }

  /**
   * Asigna un departamento a un usuario
   */
  async assignDepartment(userId: string, department: string): Promise<UserResponse> {
    try {
      const user = await this.prisma.user.update({
        where: { id: userId },
        data: {
          department,
          updatedAt: new Date(),
        },
        include: {
          customRole: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
        },
      });

      logger.info('Departamento asignado exitosamente', { userId, department });
      return this.mapUserToResponse(user);
    } catch (error) {
      logger.error('Error asignando departamento', { error, userId, department });
      throw new Error('Error al asignar departamento');
    }
  }

  /**
   * Obtiene estadísticas de usuarios
   */
  async getUserStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byRole: Record<string, number>;
    byDepartment: Record<string, number>;
  }> {
    try {
      const total = await this.prisma.user.count();
      const active = await this.prisma.user.count({ where: { status: 'active' } });
      const inactive = await this.prisma.user.count({ where: { status: 'inactive' } });

      const byRole = await this.prisma.user.groupBy({
        by: ['role'],
        _count: true,
      });

      const byDepartment = await this.prisma.user.groupBy({
        by: ['department'],
        _count: true,
        where: { department: { not: null } },
      });

      return {
        total,
        active,
        inactive,
        byRole: byRole.reduce((acc, item) => {
          acc[item.role] = item._count;
          return acc;
        }, {} as Record<string, number>),
        byDepartment: byDepartment.reduce((acc, item) => {
          if (item.department) {
            acc[item.department] = item._count;
          }
          return acc;
        }, {} as Record<string, number>),
      };
    } catch (error) {
      logger.error('Error obteniendo estadísticas de usuarios', { error });
      throw new Error('Error al obtener estadísticas de usuarios');
    }
  }

  /**
   * Mapea un usuario de Prisma a la respuesta
   */
  private mapUserToResponse(user: User & { customRole?: any; associatedClient?: any }): UserResponse {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      department: user.department || undefined,
      phoneNumber: user.phoneNumber || undefined,
      status: user.status,
      role: user.role,
      roleId: user.roleId || undefined,
      clientId: user.clientId || undefined,
      lastLoginAt: user.lastLoginAt || undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      customRole: user.customRole ? {
        id: user.customRole.id,
        name: user.customRole.name,
        description: user.customRole.description,
      } : undefined,
      associatedClient: user.associatedClient ? {
        id: user.associatedClient.id,
        companyName: user.associatedClient.companyName,
        industry: user.associatedClient.industry,
        status: user.associatedClient.status,
      } : undefined,
    };
  }
} 