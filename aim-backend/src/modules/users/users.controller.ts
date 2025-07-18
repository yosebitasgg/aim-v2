import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ApiResponseUtil } from '@/shared/utils/response';
import { logger } from '@/shared/utils/logger';
import { 
  UsersService
} from './users.service';
import {
  CreateUserSchema,
  UpdateUserSchema,
  UserFiltersSchema,
  CreateUserInput,
  UpdateUserInput,
  UserFilters
} from './users.types';

export class UsersController {
  private usersService: UsersService;

  constructor(prisma: PrismaClient) {
    this.usersService = new UsersService(prisma);
  }

  /**
   * GET /api/users
   * Obtener todos los usuarios con paginación y filtros
   */
  getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validar parámetros de consulta
      const validationResult = UserFiltersSchema.safeParse({
        ...req.query,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
      });

      if (!validationResult.success) {
        ApiResponseUtil.validationError(res, validationResult.error.issues);
        return;
      }

      const result = await this.usersService.getUsers(validationResult.data);

      ApiResponseUtil.success(res, result, 'Usuarios obtenidos exitosamente');
    } catch (error: any) {
      logger.error('Error en get users controller', { error, query: req.query });
      ApiResponseUtil.error(res, error.message, 500);
    }
  };

  /**
   * GET /api/users/:id
   * Obtener un usuario por ID
   */
  getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const user = await this.usersService.getUserById(id);

      ApiResponseUtil.success(res, user, 'Usuario obtenido exitosamente');
    } catch (error: any) {
      logger.error('Error en get user by id controller', { error, params: req.params });
      ApiResponseUtil.error(res, error.message, error.message === 'Usuario no encontrado' ? 404 : 500);
    }
  };

  /**
   * POST /api/users
   * Crear un nuevo usuario
   */
  createUser = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        ApiResponseUtil.unauthorized(res, 'Usuario no autenticado');
        return;
      }

      // Validar datos de entrada
      const validationResult = CreateUserSchema.safeParse(req.body);
      if (!validationResult.success) {
        ApiResponseUtil.validationError(res, validationResult.error.issues);
        return;
      }

      const user = await this.usersService.createUser(validationResult.data, req.user.id);

      ApiResponseUtil.success(res, user, 'Usuario creado exitosamente', 201);
    } catch (error: any) {
      logger.error('Error en create user controller', { error, body: req.body });
      ApiResponseUtil.error(res, error.message, 400);
    }
  };

  /**
   * PUT /api/users/:id
   * Actualizar un usuario existente
   */
  updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      // Validar datos de entrada
      const validationResult = UpdateUserSchema.safeParse(req.body);
      if (!validationResult.success) {
        ApiResponseUtil.validationError(res, validationResult.error.issues);
        return;
      }

      const user = await this.usersService.updateUser(id, validationResult.data);

      ApiResponseUtil.success(res, user, 'Usuario actualizado exitosamente');
    } catch (error: any) {
      logger.error('Error en update user controller', { error, params: req.params, body: req.body });
      ApiResponseUtil.error(res, error.message, error.message === 'Usuario no encontrado' ? 404 : 400);
    }
  };

  /**
   * DELETE /api/users/:id
   * Eliminar un usuario (soft delete)
   */
  deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await this.usersService.deleteUser(id);

      ApiResponseUtil.success(res, null, 'Usuario eliminado exitosamente');
    } catch (error: any) {
      logger.error('Error en delete user controller', { error, params: req.params });
      ApiResponseUtil.error(res, error.message, error.message === 'Usuario no encontrado' ? 404 : 400);
    }
  };

  /**
   * POST /api/users/:id/activate
   * Reactivar un usuario
   */
  activateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const user = await this.usersService.activateUser(id);

      ApiResponseUtil.success(res, user, 'Usuario activado exitosamente');
    } catch (error: any) {
      logger.error('Error en activate user controller', { error, params: req.params });
      ApiResponseUtil.error(res, error.message, error.message === 'Usuario no encontrado' ? 404 : 400);
    }
  };

  /**
   * PUT /api/users/:id/department
   * Asignar departamento a un usuario
   */
  assignDepartment = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { department } = req.body;

      if (!department || typeof department !== 'string') {
        ApiResponseUtil.validationError(res, [{ message: 'El departamento es requerido' }]);
        return;
      }

      const user = await this.usersService.assignDepartment(id, department);

      ApiResponseUtil.success(res, user, 'Departamento asignado exitosamente');
    } catch (error: any) {
      logger.error('Error en assign department controller', { error, params: req.params, body: req.body });
      ApiResponseUtil.error(res, error.message, error.message === 'Usuario no encontrado' ? 404 : 400);
    }
  };

  /**
   * GET /api/users/stats
   * Obtener estadísticas de usuarios
   */
  getUserStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.usersService.getUserStats();

      ApiResponseUtil.success(res, stats, 'Estadísticas de usuarios obtenidas exitosamente');
    } catch (error: any) {
      logger.error('Error en get user stats controller', { error });
      ApiResponseUtil.error(res, error.message, 500);
    }
  };
} 