import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthMiddleware } from '@/shared/middleware/auth';
import { PermissionsMiddleware } from '@/shared/middleware/permissions';
import { UsersController } from './users.controller';

export function createUsersRoutes(prisma: PrismaClient): Router {
  const router = Router();
  const usersController = new UsersController(prisma);

  // Aplicar autenticación a todas las rutas
  router.use(AuthMiddleware.authenticate);

  /**
   * @route GET /api/users
   * @desc Obtener todos los usuarios con paginación y filtros
   * @access Requiere permisos de lectura de usuarios
   * @query page?, limit?, search?, department?, role?, status?, sortBy?, sortOrder?
   */
  router.get(
    '/',
    PermissionsMiddleware.requirePermission('users', 'read'),
    usersController.getUsers
  );

  /**
   * @route GET /api/users/stats
   * @desc Obtener estadísticas de usuarios
   * @access Requiere permisos de lectura de usuarios
   */
  router.get(
    '/stats',
    PermissionsMiddleware.requirePermission('users', 'read'),
    usersController.getUserStats
  );

  /**
   * @route GET /api/users/:id
   * @desc Obtener un usuario por ID
   * @access Requiere permisos de lectura de usuarios
   * @params id (user ID)
   */
  router.get(
    '/:id',
    PermissionsMiddleware.requirePermission('users', 'read'),
    usersController.getUserById
  );

  /**
   * @route POST /api/users
   * @desc Crear un nuevo usuario
   * @access Requiere permisos de creación de usuarios
   * @body CreateUserInput
   */
  router.post(
    '/',
    PermissionsMiddleware.requirePermission('users', 'create'),
    usersController.createUser
  );

  /**
   * @route PUT /api/users/:id
   * @desc Actualizar un usuario existente
   * @access Requiere permisos de actualización de usuarios
   * @params id (user ID)
   * @body UpdateUserInput
   */
  router.put(
    '/:id',
    PermissionsMiddleware.requirePermission('users', 'update'),
    usersController.updateUser
  );

  /**
   * @route DELETE /api/users/:id
   * @desc Eliminar un usuario (soft delete)
   * @access Requiere permisos de eliminación de usuarios
   * @params id (user ID)
   */
  router.delete(
    '/:id',
    PermissionsMiddleware.requirePermission('users', 'delete'),
    usersController.deleteUser
  );

  /**
   * @route POST /api/users/:id/activate
   * @desc Reactivar un usuario
   * @access Requiere permisos de actualización de usuarios
   * @params id (user ID)
   */
  router.post(
    '/:id/activate',
    PermissionsMiddleware.requirePermission('users', 'update'),
    usersController.activateUser
  );

  /**
   * @route PUT /api/users/:id/department
   * @desc Asignar departamento a un usuario
   * @access Requiere permisos de actualización de usuarios
   * @params id (user ID)
   * @body { department: string }
   */
  router.put(
    '/:id/department',
    PermissionsMiddleware.requirePermission('users', 'update'),
    usersController.assignDepartment
  );

  return router;
} 