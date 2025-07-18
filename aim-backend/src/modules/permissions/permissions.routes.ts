import { Router } from 'express';
import { AuthMiddleware } from '@/shared/middleware/auth';
import { PermissionsMiddleware } from '@/shared/middleware/permissions';
import { PermissionsController } from './permissions.controller';
import { DepartmentsController } from './departments.controller';
import { prisma } from '@/database/client';

const router = Router();

// Inicializar controlador de departamentos
const departmentsController = new DepartmentsController(prisma);

// ===== RUTAS DE ROLES =====

/**
 * @route POST /api/permissions/roles
 * @desc Crear un nuevo rol personalizado
 * @access Admin
 */
router.post(
  '/roles',
  AuthMiddleware.authenticate,
  PermissionsMiddleware.requirePermission('users', 'create'),
  PermissionsController.createRole
);

/**
 * @route GET /api/permissions/roles
 * @desc Obtener todos los roles con paginación
 * @access Admin/Manager
 */
router.get(
  '/roles',
  AuthMiddleware.authenticate,
  PermissionsMiddleware.requirePermission('users', 'read'),
  PermissionsController.getRoles
);

/**
 * @route GET /api/permissions/roles/:id
 * @desc Obtener un rol por ID
 * @access Admin/Manager
 */
router.get(
  '/roles/:id',
  AuthMiddleware.authenticate,
  PermissionsMiddleware.requirePermission('users', 'read'),
  PermissionsController.getRoleById
);

/**
 * @route PUT /api/permissions/roles/:id
 * @desc Actualizar un rol existente
 * @access Admin
 */
router.put(
  '/roles/:id',
  AuthMiddleware.authenticate,
  PermissionsMiddleware.requirePermission('users', 'update'),
  PermissionsController.updateRole
);

/**
 * @route DELETE /api/permissions/roles/:id
 * @desc Eliminar un rol
 * @access Admin
 */
router.delete(
  '/roles/:id',
  AuthMiddleware.authenticate,
  PermissionsMiddleware.requirePermission('users', 'delete'),
  PermissionsController.deleteRole
);

// ===== RUTAS DE ASIGNACIÓN DE ROLES =====

/**
 * @route POST /api/permissions/assign-role
 * @desc Asignar rol a un usuario
 * @access Admin
 * @body { userId: string, roleId: string }
 */
router.post(
  '/assign-role',
  AuthMiddleware.authenticate,
  PermissionsMiddleware.requirePermission('users', 'update'),
  PermissionsController.assignRole
);

/**
 * @route DELETE /api/permissions/users/:userId/role
 * @desc Desasignar rol de un usuario (volver a rol por defecto)
 * @access Admin
 */
router.delete(
  '/users/:userId/role',
  AuthMiddleware.authenticate,
  PermissionsMiddleware.requirePermission('users', 'update'),
  PermissionsController.unassignRole
);

// ===== RUTAS DE GESTIÓN DE USUARIOS =====

/**
 * @route GET /api/permissions/users
 * @desc Obtener usuarios con sus roles
 * @access Admin/Manager
 */
router.get(
  '/users',
  AuthMiddleware.authenticate,
  PermissionsMiddleware.requirePermission('users', 'read'),
  PermissionsController.getUsersWithRoles
);

/**
 * @route POST /api/permissions/make-master/:userId
 * @desc Configurar usuario como maestro (solo para super admin)
 * @access Super Admin
 */
router.post(
  '/make-master/:userId',
  AuthMiddleware.authenticate,
  AuthMiddleware.requireRole(['admin', 'master']),
  PermissionsController.makeMasterUser
);

// ===== RUTAS DE VERIFICACIÓN DE PERMISOS =====

/**
 * @route POST /api/permissions/check
 * @desc Verificar permisos específicos
 * @access Authenticated
 * @body { module: string, action: string, resourceId?: string }
 */
router.post(
  '/check',
  AuthMiddleware.authenticate,
  PermissionsController.checkPermission
);

/**
 * @route GET /api/permissions/my-permissions
 * @desc Obtener permisos del usuario autenticado
 * @access Authenticated
 */
router.get(
  '/my-permissions',
  AuthMiddleware.authenticate,
  PermissionsController.getMyPermissions
);

// Legacy route - deprecated, use the new DepartmentsController instead
// router.get('/departments', AuthMiddleware.authenticate, PermissionsController.getDepartments);

// ===== RUTAS DE INICIALIZACIÓN =====

/**
 * @route POST /api/permissions/initialize-defaults
 * @desc Inicializar roles por defecto del sistema
 * @access Admin only
 */
router.post(
  '/initialize-defaults',
  AuthMiddleware.authenticate,
  PermissionsMiddleware.requirePermission('users', 'create'),
  PermissionsController.initializeDefaults
);

// ===== RUTAS DE DEPARTAMENTOS =====

/**
 * @route GET /api/permissions/departments
 * @desc Obtener todos los departamentos (constantes + dinámicos)
 * @access Authenticated
 */
router.get(
  '/departments',
  AuthMiddleware.authenticate,
  departmentsController.getDepartments
);

/**
 * @route POST /api/permissions/departments
 * @desc Crear un nuevo departamento
 * @access Admin
 */
router.post(
  '/departments',
  AuthMiddleware.authenticate,
  PermissionsMiddleware.requirePermission('users', 'create'),
  departmentsController.createDepartment
);

/**
 * @route GET /api/permissions/departments/stats
 * @desc Obtener estadísticas de departamentos
 * @access Admin/Manager
 */
router.get(
  '/departments/stats',
  AuthMiddleware.authenticate,
  PermissionsMiddleware.requirePermission('users', 'read'),
  departmentsController.getDepartmentStats
);

/**
 * @route GET /api/permissions/departments/:id
 * @desc Obtener un departamento específico por ID
 * @access Admin/Manager
 */
router.get(
  '/departments/:id',
  AuthMiddleware.authenticate,
  PermissionsMiddleware.requirePermission('users', 'read'),
  departmentsController.getDepartmentById
);

/**
 * @route PUT /api/permissions/departments/:id
 * @desc Actualizar un departamento existente
 * @access Admin
 */
router.put(
  '/departments/:id',
  AuthMiddleware.authenticate,
  PermissionsMiddleware.requirePermission('users', 'update'),
  departmentsController.updateDepartment
);

/**
 * @route DELETE /api/permissions/departments/:id
 * @desc Eliminar un departamento
 * @access Admin
 */
router.delete(
  '/departments/:id',
  AuthMiddleware.authenticate,
  PermissionsMiddleware.requirePermission('users', 'delete'),
  departmentsController.deleteDepartment
);

export { router as permissionsRoutes }; 