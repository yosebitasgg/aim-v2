import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '@/shared/utils/logger';
import { ActivityService } from './activity.service';
import {
  ActivityQuerySchema,
  ActivityStatsSchema,
  CreateActivitySchema,
  ActivityResponseSchema,
  ActivityResponse,
  ActivityType,
  ActivityModule,
  ActivitySeverity
} from './activity.types';

export class ActivityController {
  private activityService: ActivityService;

  constructor(prisma: PrismaClient) {
    this.activityService = new ActivityService(prisma);
  }

  /**
   * Obtiene actividades con filtros y paginación
   * GET /api/activity/logs
   */
  getActivities = async (req: Request, res: Response): Promise<Response> => {
    try {
      // Validar parámetros de consulta
      const validatedParams = ActivityQuerySchema.parse({
        userId: req.query.userId,
        action: req.query.action,
        module: req.query.module,
        severity: req.query.severity,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        ipAddress: req.query.ipAddress,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
        offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
        sortBy: req.query.sortBy || 'createdAt',
        sortOrder: req.query.sortOrder || 'desc'
      });

      const result = await this.activityService.getActivities(validatedParams);

      const response: ActivityResponse = {
        success: true,
        message: 'Actividades obtenidas exitosamente',
        data: result
      };

      logger.info('Actividades consultadas', {
        userId: (req as any).user?.id,
        filters: validatedParams,
        resultsCount: result.activities.length,
        total: result.pagination.total
      });

      return res.status(200).json(response);
    } catch (error) {
      logger.error('Error obteniendo actividades', {
        error,
        userId: (req as any).user?.id,
        query: req.query
      });

      const response: ActivityResponse = {
        success: false,
        message: 'Error al obtener las actividades',
        errors: [error instanceof Error ? error.message : 'Error interno del servidor']
      };

      return res.status(400).json(response);
    }
  };

  /**
   * Obtiene actividades de un usuario específico
   * GET /api/activity/user/:userId
   */
  getUserActivities = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { userId } = req.params;
      
      // Verificar que el usuario puede acceder a estas actividades
      const requestingUserId = (req as any).user?.id;
      const userRole = (req as any).user?.role;
      
      if (requestingUserId !== userId && userRole !== 'admin') {
        const response: ActivityResponse = {
          success: false,
          message: 'No tienes permisos para acceder a las actividades de este usuario',
          errors: ['Acceso denegado']
        };
        return res.status(403).json(response);
      }

      const queryParams = {
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
        offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
        sortBy: req.query.sortBy as any || 'createdAt',
        sortOrder: req.query.sortOrder as any || 'desc',
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        action: req.query.action as any,
        module: req.query.module as any
      };

      const result = await this.activityService.getUserActivities(userId, queryParams);

      const response: ActivityResponse = {
        success: true,
        message: 'Actividades del usuario obtenidas exitosamente',
        data: result
      };

      return res.status(200).json(response);
    } catch (error) {
      logger.error('Error obteniendo actividades del usuario', {
        error,
        userId: req.params.userId,
        requestingUserId: (req as any).user?.id
      });

      const response: ActivityResponse = {
        success: false,
        message: 'Error al obtener las actividades del usuario',
        errors: [error instanceof Error ? error.message : 'Error interno del servidor']
      };

      return res.status(400).json(response);
    }
  };

  /**
   * Obtiene mis actividades (usuario actual)
   * GET /api/activity/my-activities
   */
  getMyActivities = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        const response: ActivityResponse = {
          success: false,
          message: 'Usuario no autenticado',
          errors: ['Token de autenticación requerido']
        };
        return res.status(401).json(response);
      }

      const queryParams = {
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
        offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
        sortBy: req.query.sortBy as any || 'createdAt',
        sortOrder: req.query.sortOrder as any || 'desc',
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        action: req.query.action as any,
        module: req.query.module as any
      };

      const result = await this.activityService.getUserActivities(userId, queryParams);

      const response: ActivityResponse = {
        success: true,
        message: 'Mis actividades obtenidas exitosamente',
        data: result
      };

      return res.status(200).json(response);
    } catch (error) {
      logger.error('Error obteniendo mis actividades', {
        error,
        userId: (req as any).user?.id
      });

      const response: ActivityResponse = {
        success: false,
        message: 'Error al obtener mis actividades',
        errors: [error instanceof Error ? error.message : 'Error interno del servidor']
      };

      return res.status(400).json(response);
    }
  };

  /**
   * Obtiene estadísticas de actividad
   * GET /api/activity/stats
   */
  getActivityStats = async (req: Request, res: Response): Promise<Response> => {
    try {
      // Validar parámetros
      const validatedParams = ActivityStatsSchema.parse({
        userId: req.query.userId,
        module: req.query.module,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        groupBy: req.query.groupBy || 'day'
      });

      const stats = await this.activityService.getActivityStats(validatedParams);

      const response: ActivityResponse = {
        success: true,
        message: 'Estadísticas de actividad obtenidas exitosamente',
        data: stats
      };

      logger.info('Estadísticas de actividad consultadas', {
        userId: (req as any).user?.id,
        params: validatedParams,
        totalActivities: stats.totalActivities
      });

      return res.status(200).json(response);
    } catch (error) {
      logger.error('Error obteniendo estadísticas de actividad', {
        error,
        userId: (req as any).user?.id,
        query: req.query
      });

      const response: ActivityResponse = {
        success: false,
        message: 'Error al obtener las estadísticas de actividad',
        errors: [error instanceof Error ? error.message : 'Error interno del servidor']
      };

      return res.status(400).json(response);
    }
  };

  /**
   * Registra una actividad manualmente
   * POST /api/activity/log
   */
  logActivity = async (req: Request, res: Response): Promise<Response> => {
    try {
      // Validar datos de entrada
      const validatedData = CreateActivitySchema.parse({
        ...req.body,
        userId: req.body.userId || (req as any).user?.id,
        ipAddress: req.body.ipAddress || req.ip,
        userAgent: req.body.userAgent || req.get('user-agent')
      });

      const activity = await this.activityService.logActivity(validatedData);

      const response: ActivityResponse = {
        success: true,
        message: 'Actividad registrada exitosamente',
        data: {
          id: activity.id,
          action: activity.action,
          module: activity.module,
          createdAt: activity.createdAt
        }
      };

      return res.status(201).json(response);
    } catch (error) {
      logger.error('Error registrando actividad manual', {
        error,
        userId: (req as any).user?.id,
        body: req.body
      });

      const response: ActivityResponse = {
        success: false,
        message: 'Error al registrar la actividad',
        errors: [error instanceof Error ? error.message : 'Error interno del servidor']
      };

      return res.status(400).json(response);
    }
  };

  /**
   * Limpia actividades antiguas
   * DELETE /api/activity/cleanup
   */
  cleanupOldActivities = async (req: Request, res: Response): Promise<Response> => {
    try {
      // Solo administradores pueden ejecutar limpieza
      const userRole = (req as any).user?.role;
      if (userRole !== 'admin') {
        const response: ActivityResponse = {
          success: false,
          message: 'Solo los administradores pueden ejecutar la limpieza de actividades',
          errors: ['Permisos insuficientes']
        };
        return res.status(403).json(response);
      }

      const result = await this.activityService.cleanupOldActivities();

      const response: ActivityResponse = {
        success: true,
        message: `Se eliminaron ${result.deletedCount} actividades antiguas`,
        data: result
      };

      logger.info('Limpieza de actividades ejecutada', {
        userId: (req as any).user?.id,
        deletedCount: result.deletedCount
      });

      return res.status(200).json(response);
    } catch (error) {
      logger.error('Error en limpieza de actividades', {
        error,
        userId: (req as any).user?.id
      });

      const response: ActivityResponse = {
        success: false,
        message: 'Error al ejecutar la limpieza de actividades',
        errors: [error instanceof Error ? error.message : 'Error interno del servidor']
      };

      return res.status(500).json(response);
    }
  };

  /**
   * Obtiene la configuración de auditoría
   * GET /api/activity/config
   */
  getAuditConfig = async (req: Request, res: Response): Promise<Response> => {
    try {
      // Solo administradores pueden ver la configuración
      const userRole = (req as any).user?.role;
      if (userRole !== 'admin') {
        const response: ActivityResponse = {
          success: false,
          message: 'Solo los administradores pueden ver la configuración de auditoría',
          errors: ['Permisos insuficientes']
        };
        return res.status(403).json(response);
      }

      const config = this.activityService.getConfig();

      const response: ActivityResponse = {
        success: true,
        message: 'Configuración de auditoría obtenida exitosamente',
        data: config
      };

      return res.status(200).json(response);
    } catch (error) {
      logger.error('Error obteniendo configuración de auditoría', {
        error,
        userId: (req as any).user?.id
      });

      const response: ActivityResponse = {
        success: false,
        message: 'Error al obtener la configuración de auditoría',
        errors: [error instanceof Error ? error.message : 'Error interno del servidor']
      };

      return res.status(500).json(response);
    }
  };

  /**
   * Actualiza la configuración de auditoría
   * PUT /api/activity/config
   */
  updateAuditConfig = async (req: Request, res: Response): Promise<Response> => {
    try {
      // Solo administradores pueden actualizar la configuración
      const userRole = (req as any).user?.role;
      if (userRole !== 'admin') {
        const response: ActivityResponse = {
          success: false,
          message: 'Solo los administradores pueden actualizar la configuración de auditoría',
          errors: ['Permisos insuficientes']
        };
        return res.status(403).json(response);
      }

      this.activityService.updateConfig(req.body);
      const updatedConfig = this.activityService.getConfig();

      const response: ActivityResponse = {
        success: true,
        message: 'Configuración de auditoría actualizada exitosamente',
        data: updatedConfig
      };

      logger.info('Configuración de auditoría actualizada', {
        userId: (req as any).user?.id,
        newConfig: req.body
      });

      return res.status(200).json(response);
    } catch (error) {
      logger.error('Error actualizando configuración de auditoría', {
        error,
        userId: (req as any).user?.id,
        body: req.body
      });

      const response: ActivityResponse = {
        success: false,
        message: 'Error al actualizar la configuración de auditoría',
        errors: [error instanceof Error ? error.message : 'Error interno del servidor']
      };

      return res.status(400).json(response);
    }
  };

  /**
   * Obtiene los tipos de actividad disponibles
   * GET /api/activity/types
   */
  getActivityTypes = async (req: Request, res: Response): Promise<Response> => {
    try {
      const types = {
        activities: Object.values(ActivityType),
        modules: Object.values(ActivityModule),
        severities: Object.values(ActivitySeverity)
      };

      const response: ActivityResponse = {
        success: true,
        message: 'Tipos de actividad obtenidos exitosamente',
        data: types
      };

      return res.status(200).json(response);
    } catch (error) {
      logger.error('Error obteniendo tipos de actividad', {
        error,
        userId: (req as any).user?.id
      });

      const response: ActivityResponse = {
        success: false,
        message: 'Error al obtener los tipos de actividad',
        errors: [error instanceof Error ? error.message : 'Error interno del servidor']
      };

      return res.status(500).json(response);
    }
  };
} 