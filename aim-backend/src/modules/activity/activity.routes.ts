import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { ActivityController } from './activity.controller';
import { AuthMiddleware } from '@/shared/middleware/auth';
import { PermissionsMiddleware } from '@/shared/middleware/permissions';

export function createActivityRoutes(prisma: PrismaClient): Router {
  const router = Router();
  const activityController = new ActivityController(prisma);

  // Aplicar autenticación a todas las rutas
  router.use(AuthMiddleware.authenticate);

  /**
   * @route GET /api/activity/logs
   * @desc Obtiene actividades con filtros y paginación
   * @access Requiere permisos de lectura de reportes
   * @params query: userId?, action?, module?, severity?, startDate?, endDate?, ipAddress?, limit?, offset?, sortBy?, sortOrder?
   */
  router.get(
    '/logs',
    PermissionsMiddleware.requirePermission('reports', 'read'),
    activityController.getActivities
  );

  /**
   * @route GET /api/activity/user/:userId
   * @desc Obtiene actividades de un usuario específico
   * @access Requiere ser el mismo usuario o admin
   * @params userId (path parameter)
   * @params query: limit?, offset?, sortBy?, sortOrder?, startDate?, endDate?, action?, module?
   */
  router.get(
    '/user/:userId',
    activityController.getUserActivities
  );

  /**
   * @route GET /api/activity/my-activities
   * @desc Obtiene las actividades del usuario actual
   * @access Usuario autenticado
   * @params query: limit?, offset?, sortBy?, sortOrder?, startDate?, endDate?, action?, module?
   */
  router.get(
    '/my-activities',
    activityController.getMyActivities
  );

  /**
   * @route GET /api/activity/stats
   * @desc Obtiene estadísticas de actividad
   * @access Requiere permisos de lectura de reportes
   * @params query: userId?, module?, startDate?, endDate?, groupBy?
   */
  router.get(
    '/stats',
    PermissionsMiddleware.requirePermission('reports', 'read'),
    activityController.getActivityStats
  );

  /**
   * @route POST /api/activity/log
   * @desc Registra una actividad manualmente
   * @access Requiere permisos de escritura de reportes
   * @body CreateActivityInput
   */
  router.post(
    '/log',
    PermissionsMiddleware.requirePermission('reports', 'create'),
    activityController.logActivity
  );

  /**
   * @route DELETE /api/activity/cleanup
   * @desc Limpia actividades antiguas
   * @access Solo administradores
   */
  router.delete(
    '/cleanup',
    PermissionsMiddleware.requirePermission('reports', 'delete'),
    activityController.cleanupOldActivities
  );

  /**
   * @route GET /api/activity/config
   * @desc Obtiene la configuración de auditoría
   * @access Solo administradores
   */
  router.get(
    '/config',
    PermissionsMiddleware.requirePermission('reports', 'read'),
    activityController.getAuditConfig
  );

  /**
   * @route PUT /api/activity/config
   * @desc Actualiza la configuración de auditoría
   * @access Solo administradores
   * @body Partial<AuditConfig>
   */
  router.put(
    '/config',
    PermissionsMiddleware.requirePermission('reports', 'update'),
    activityController.updateAuditConfig
  );

  /**
   * @route GET /api/activity/types
   * @desc Obtiene los tipos de actividad disponibles
   * @access Usuario autenticado
   */
  router.get(
    '/types',
    activityController.getActivityTypes
  );

  return router;
} 