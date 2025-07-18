import { Request, Response } from 'express';
import { ApiResponseUtil } from '@/shared/utils/response';
import { logger } from '@/shared/utils/logger';
import { PermissionsService } from './permissions.service';
import {
  CreateRoleSchema,
  UpdateRoleSchema,
  AssignRoleSchema,
  CheckPermissionSchema,
} from './permissions.types';

export class PermissionsController {
  /**
   * POST /api/permissions/roles
   * Crear un nuevo rol
   */
  static async createRole(req: Request, res: Response): Promise<void> {
    try {
      // Validar datos de entrada
      const validationResult = CreateRoleSchema.safeParse(req.body);
      if (!validationResult.success) {
        ApiResponseUtil.validationError(res, validationResult.error.issues);
        return;
      }

      const role = await PermissionsService.createRole(validationResult.data);

      ApiResponseUtil.success(res, role, 'Rol creado exitosamente', 201);
    } catch (error: any) {
      logger.error('Error en create role controller', { error, body: req.body });
      ApiResponseUtil.error(res, error.message, 400);
    }
  }

  /**
   * GET /api/permissions/roles
   * Obtener todos los roles con paginación
   */
  static async getRoles(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string || '';
      const sortBy = req.query.sortBy as string || 'name';
      const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'asc';

      const result = await PermissionsService.getRoles({
        page,
        limit,
        search,
        sortBy,
        sortOrder,
      });

      ApiResponseUtil.success(res, result, 'Roles obtenidos exitosamente');
    } catch (error: any) {
      logger.error('Error en get roles controller', { error, query: req.query });
      ApiResponseUtil.error(res, error.message, 500);
    }
  }

  /**
   * GET /api/permissions/roles/:id
   * Obtener un rol por ID
   */
  static async getRoleById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const role = await PermissionsService.getRoleById(id);

      ApiResponseUtil.success(res, role, 'Rol obtenido exitosamente');
    } catch (error: any) {
      logger.error('Error en get role by id controller', { error, params: req.params });
      ApiResponseUtil.error(res, error.message, error.message === 'Rol no encontrado' ? 404 : 500);
    }
  }

  /**
   * PUT /api/permissions/roles/:id
   * Actualizar un rol existente
   */
  static async updateRole(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // Validar datos de entrada
      const validationResult = UpdateRoleSchema.safeParse(req.body);
      if (!validationResult.success) {
        ApiResponseUtil.validationError(res, validationResult.error.issues);
        return;
      }

      const role = await PermissionsService.updateRole(id, validationResult.data);

      ApiResponseUtil.success(res, role, 'Rol actualizado exitosamente');
    } catch (error: any) {
      logger.error('Error en update role controller', { error, params: req.params, body: req.body });
      ApiResponseUtil.error(res, error.message, error.message === 'Rol no encontrado' ? 404 : 400);
    }
  }

  /**
   * DELETE /api/permissions/roles/:id
   * Eliminar un rol
   */
  static async deleteRole(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await PermissionsService.deleteRole(id);

      ApiResponseUtil.success(res, null, 'Rol eliminado exitosamente');
    } catch (error: any) {
      logger.error('Error en delete role controller', { error, params: req.params });
      ApiResponseUtil.error(res, error.message, error.message === 'Rol no encontrado' ? 404 : 400);
    }
  }

  /**
   * POST /api/permissions/assign-role
   * Asignar rol a un usuario
   */
  static async assignRole(req: Request, res: Response): Promise<void> {
    try {
      // Validar datos de entrada
      const validationResult = AssignRoleSchema.safeParse(req.body);
      if (!validationResult.success) {
        ApiResponseUtil.validationError(res, validationResult.error.issues);
        return;
      }

      await PermissionsService.assignRole(validationResult.data);

      ApiResponseUtil.success(res, null, 'Rol asignado exitosamente');
    } catch (error: any) {
      logger.error('Error en assign role controller', { error, body: req.body });
      ApiResponseUtil.error(res, error.message, 400);
    }
  }

  /**
   * DELETE /api/permissions/users/:userId/role
   * Desasignar rol de un usuario
   */
  static async unassignRole(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      await PermissionsService.unassignRole(userId);

      ApiResponseUtil.success(res, null, 'Rol desasignado exitosamente');
    } catch (error: any) {
      logger.error('Error en unassign role controller', { error, params: req.params });
      ApiResponseUtil.error(res, error.message, error.message === 'Usuario no encontrado' ? 404 : 400);
    }
  }

  /**
   * GET /api/permissions/users
   * Obtener usuarios con sus roles
   */
  static async getUsersWithRoles(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string || '';
      const sortBy = req.query.sortBy as string || 'name';
      const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'asc';

      const result = await PermissionsService.getUsersWithRoles({
        page,
        limit,
        search,
        sortBy,
        sortOrder,
      });

      ApiResponseUtil.success(res, result, 'Usuarios obtenidos exitosamente');
    } catch (error: any) {
      logger.error('Error en get users with roles controller', { error, query: req.query });
      ApiResponseUtil.error(res, error.message, 500);
    }
  }

  /**
   * POST /api/permissions/make-master/:userId
   * Configurar usuario como maestro
   */
  static async makeMasterUser(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      await PermissionsService.makeMasterUser(userId);

      ApiResponseUtil.success(res, null, 'Usuario configurado como maestro exitosamente');
    } catch (error: any) {
      logger.error('Error en make master user controller', { error, params: req.params });
      ApiResponseUtil.error(res, error.message, error.message === 'Usuario no encontrado' ? 404 : 400);
    }
  }

  /**
   * POST /api/permissions/check
   * Verificar permisos específicos
   */
  static async checkPermission(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        ApiResponseUtil.unauthorized(res, 'Usuario no autenticado');
        return;
      }

      // Validar datos de entrada
      const validationResult = CheckPermissionSchema.safeParse(req.body);
      if (!validationResult.success) {
        ApiResponseUtil.validationError(res, validationResult.error.issues);
        return;
      }

      const result = await PermissionsService.checkUserPermission(
        req.user.id,
        validationResult.data
      );

      ApiResponseUtil.success(res, result, 'Verificación de permisos completada');
    } catch (error: any) {
      logger.error('Error en check permission controller', { error, body: req.body });
      ApiResponseUtil.error(res, error.message, 500);
    }
  }

  /**
   * GET /api/permissions/my-permissions
   * Obtener permisos del usuario autenticado
   */
  static async getMyPermissions(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        ApiResponseUtil.unauthorized(res, 'Usuario no autenticado');
        return;
      }

      const permissions = await PermissionsService.getUserPermissions(req.user.id);

      ApiResponseUtil.success(res, permissions, 'Permisos obtenidos exitosamente');
    } catch (error: any) {
      logger.error('Error en get my permissions controller', { error });
      ApiResponseUtil.error(res, error.message, 500);
    }
  }

  /**
   * POST /api/permissions/initialize-defaults
   * Inicializar roles por defecto (solo para administradores)
   */
  static async initializeDefaults(req: Request, res: Response): Promise<void> {
    try {
      await PermissionsService.initializeDefaultRoles();

      ApiResponseUtil.success(res, null, 'Roles por defecto inicializados exitosamente');
    } catch (error: any) {
      logger.error('Error en initialize defaults controller', { error });
      ApiResponseUtil.error(res, error.message, 500);
    }
  }

  /**
   * GET /api/permissions/departments (Legacy)
   * Obtener departamentos disponibles - Mantenido para compatibilidad
   * @deprecated Use the new DepartmentsController instead
   */
  static async getDepartments(req: Request, res: Response): Promise<void> {
    try {
      const { DEPARTMENTS } = await import('@/shared/constants');
      
      const departments = Object.entries(DEPARTMENTS).map(([key, value]) => ({
        key,
        value,
        label: key.charAt(0).toUpperCase() + key.slice(1).toLowerCase()
      }));

      ApiResponseUtil.success(res, departments, 'Departamentos obtenidos exitosamente');
    } catch (error: any) {
      logger.error('Error en get departments controller', { error });
      ApiResponseUtil.error(res, error.message, 500);
    }
  }
} 