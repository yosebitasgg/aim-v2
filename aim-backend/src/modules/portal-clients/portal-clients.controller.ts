import { Request, Response } from 'express';
import { PortalClientsService } from './portal-clients.service';
import { ApiResponseUtil } from '@/shared/utils/response';
import { logger } from '@/shared/utils/logger';
import {
  ClientDashboardStatsSchema,
  ClientOrderFiltersSchema,
  ClientAgentFiltersSchema,
  ClientDocumentFiltersSchema,
  UpdateClientProfileSchema,
  PortalClientErrorCodes
} from './portal-clients.types';

export class PortalClientsController {
  private portalClientsService: PortalClientsService;

  constructor(portalClientsService: PortalClientsService) {
    this.portalClientsService = portalClientsService;
  }

  /**
   * GET /api/portal-clients/dashboard/stats
   * Obtener estadísticas del dashboard del cliente (versión legacy)
   */
  getDashboardStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        ApiResponseUtil.error(res, 'Usuario no autenticado', 401);
        return;
      }

      // Validar parámetros de consulta
      const validationResult = ClientDashboardStatsSchema.safeParse({
        dateRange: req.query.dateRange,
        includeActivity: req.query.includeActivity === 'true',
        activityLimit: req.query.activityLimit ? parseInt(req.query.activityLimit as string) : undefined
      });

      if (!validationResult.success) {
        ApiResponseUtil.validationError(res, validationResult.error);
        return;
      }

      const stats = await this.portalClientsService.getClientDashboardStats(userId, validationResult.data);

      ApiResponseUtil.success(res, stats, 'Estadísticas del dashboard obtenidas exitosamente');
    } catch (error: any) {
      logger.error('Error en get dashboard stats controller', { error, userId: req.user?.id, query: req.query });
      
      if (error.message.includes('no es un cliente') || error.message.includes('no está asociado')) {
        ApiResponseUtil.error(res, 'No tienes permisos para acceder al portal de clientes', 403);
      } else {
        ApiResponseUtil.error(res, error.message, 500);
      }
    }
  };

  /**
   * POST /api/portal-clients/dashboard/stats
   * Obtener estadísticas avanzadas del dashboard del cliente
   */
  getEnhancedDashboardStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        ApiResponseUtil.error(res, 'Usuario no autenticado', 401);
        return;
      }

      // Validar parámetros del body
      const validationResult = ClientDashboardStatsSchema.safeParse(req.body);

      if (!validationResult.success) {
        ApiResponseUtil.validationError(res, validationResult.error);
        return;
      }

      const stats = await this.portalClientsService.getClientDashboardStats(userId, validationResult.data);

      ApiResponseUtil.success(res, stats, 'Estadísticas avanzadas del dashboard obtenidas exitosamente');
    } catch (error: any) {
      logger.error('Error en get enhanced dashboard stats controller', { error, userId: req.user?.id, body: req.body });
      
      if (error.message.includes('no es un cliente') || error.message.includes('no está asociado')) {
        ApiResponseUtil.error(res, 'No tienes permisos para acceder al portal de clientes', 403);
      } else {
        ApiResponseUtil.error(res, error.message, 500);
      }
    }
  };

  /**
   * GET /api/portal-clients/orders
   * Obtener órdenes del cliente con paginación y filtros
   */
  getOrders = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        ApiResponseUtil.error(res, 'Usuario no autenticado', 401);
        return;
      }

      // Validar parámetros de consulta
      const validationResult = ClientOrderFiltersSchema.safeParse({
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        search: req.query.search,
        status: req.query.status,
        priority: req.query.priority,
        type: req.query.type,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder
      });

      if (!validationResult.success) {
        ApiResponseUtil.validationError(res, validationResult.error);
        return;
      }

      const orders = await this.portalClientsService.getClientOrders(userId, validationResult.data);

      ApiResponseUtil.success(res, orders, 'Órdenes obtenidas exitosamente');
    } catch (error: any) {
      logger.error('Error en get orders controller', { error, userId: req.user?.id, query: req.query });
      
      if (error.message.includes('no es un cliente') || error.message.includes('no está asociado')) {
        ApiResponseUtil.error(res, 'No tienes permisos para acceder al portal de clientes', 403);
      } else {
        ApiResponseUtil.error(res, error.message, 500);
      }
    }
  };

  /**
   * GET /api/portal-clients/orders/:id
   * Obtener detalle de una orden específica del cliente
   */
  getOrderById = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      const orderId = req.params.id;

      if (!userId) {
        ApiResponseUtil.error(res, 'Usuario no autenticado', 401);
        return;
      }

      if (!orderId) {
        ApiResponseUtil.error(res, 'ID de orden requerido', 400);
        return;
      }

      const order = await this.portalClientsService.getClientOrderById(userId, orderId);

      ApiResponseUtil.success(res, order, 'Detalle de orden obtenido exitosamente');
    } catch (error: any) {
      logger.error('Error en get order by id controller', { error, userId: req.user?.id, orderId: req.params.id });
      
      if (error.message === PortalClientErrorCodes.ORDER_NOT_FOUND) {
        ApiResponseUtil.error(res, 'Orden no encontrada o no pertenece a tu cliente', 404);
      } else if (error.message.includes('no es un cliente') || error.message.includes('no está asociado')) {
        ApiResponseUtil.error(res, 'No tienes permisos para acceder al portal de clientes', 403);
      } else {
        ApiResponseUtil.error(res, error.message, 500);
      }
    }
  };

  /**
   * GET /api/portal-clients/agents
   * Obtener agentes del cliente con paginación y filtros
   */
  getAgents = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        ApiResponseUtil.error(res, 'Usuario no autenticado', 401);
        return;
      }

      // Validar parámetros de consulta
      const validationResult = ClientAgentFiltersSchema.safeParse({
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        search: req.query.search,
        status: req.query.status,
        connectionType: req.query.connectionType,
        complexity: req.query.complexity,
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder
      });

      if (!validationResult.success) {
        ApiResponseUtil.validationError(res, validationResult.error);
        return;
      }

      const agents = await this.portalClientsService.getClientAgents(userId, validationResult.data);

      ApiResponseUtil.success(res, agents, 'Agentes obtenidos exitosamente');
    } catch (error: any) {
      logger.error('Error en get agents controller', { error, userId: req.user?.id, query: req.query });
      
      if (error.message.includes('no es un cliente') || error.message.includes('no está asociado')) {
        ApiResponseUtil.error(res, 'No tienes permisos para acceder al portal de clientes', 403);
      } else {
        ApiResponseUtil.error(res, error.message, 500);
      }
    }
  };

  /**
   * GET /api/portal-clients/documents
   * Obtener documentos del cliente con paginación y filtros
   */
  getDocuments = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        ApiResponseUtil.error(res, 'Usuario no autenticado', 401);
        return;
      }

      // Validar parámetros de consulta
      const validationResult = ClientDocumentFiltersSchema.safeParse({
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        search: req.query.search,
        status: req.query.status,
        documentType: req.query.documentType,
        phase: req.query.phase,
        orderId: req.query.orderId,
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder
      });

      if (!validationResult.success) {
        ApiResponseUtil.validationError(res, validationResult.error);
        return;
      }

      const documents = await this.portalClientsService.getClientDocuments(userId, validationResult.data);

      ApiResponseUtil.success(res, documents, 'Documentos obtenidos exitosamente');
    } catch (error: any) {
      logger.error('Error en get documents controller', { error, userId: req.user?.id, query: req.query });
      
      if (error.message.includes('no es un cliente') || error.message.includes('no está asociado')) {
        ApiResponseUtil.error(res, 'No tienes permisos para acceder al portal de clientes', 403);
      } else {
        ApiResponseUtil.error(res, error.message, 500);
      }
    }
  };

  /**
   * GET /api/portal-clients/profile
   * Obtener perfil del cliente (usuario + datos del cliente)
   */
  getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        ApiResponseUtil.error(res, 'Usuario no autenticado', 401);
        return;
      }

      const profile = await this.portalClientsService.getClientProfile(userId);

      ApiResponseUtil.success(res, profile, 'Perfil obtenido exitosamente');
    } catch (error: any) {
      logger.error('Error en get profile controller', { error, userId: req.user?.id });
      
      if (error.message === PortalClientErrorCodes.CLIENT_NOT_FOUND) {
        ApiResponseUtil.error(res, 'Cliente no encontrado', 404);
      } else if (error.message.includes('no es un cliente') || error.message.includes('no está asociado')) {
        ApiResponseUtil.error(res, 'No tienes permisos para acceder al portal de clientes', 403);
      } else {
        ApiResponseUtil.error(res, error.message, 500);
      }
    }
  };

  /**
   * PUT /api/portal-clients/profile
   * Actualizar perfil del cliente
   */
  updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        ApiResponseUtil.error(res, 'Usuario no autenticado', 401);
        return;
      }

      // Validar datos del cuerpo de la petición
      const validationResult = UpdateClientProfileSchema.safeParse(req.body);

      if (!validationResult.success) {
        ApiResponseUtil.validationError(res, validationResult.error);
        return;
      }

      const updatedProfile = await this.portalClientsService.updateClientProfile(userId, validationResult.data);

      ApiResponseUtil.success(res, updatedProfile, 'Perfil actualizado exitosamente');
    } catch (error: any) {
      logger.error('Error en update profile controller', { error, userId: req.user?.id, body: req.body });
      
      if (error.message.includes('no es un cliente') || error.message.includes('no está asociado')) {
        ApiResponseUtil.error(res, 'No tienes permisos para acceder al portal de clientes', 403);
      } else {
        ApiResponseUtil.error(res, error.message, 500);
      }
    }
  };

  /**
   * GET /api/portal-clients/orders/:id/download-document/:documentId
   * Descargar documento de una orden del cliente
   */
  downloadOrderDocument = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      const orderId = req.params.id;
      const documentId = req.params.documentId;

      if (!userId) {
        ApiResponseUtil.error(res, 'Usuario no autenticado', 401);
        return;
      }

      if (!orderId || !documentId) {
        ApiResponseUtil.error(res, 'ID de orden y documento requeridos', 400);
        return;
      }

      // Verificar que el usuario tiene acceso a la orden
      await this.portalClientsService.getClientOrderById(userId, orderId);

      // TODO: Implementar descarga de documento
      // Esta funcionalidad podría reutilizar el servicio de documentos existente
      // con verificaciones adicionales de que el documento pertenece al cliente
      
      ApiResponseUtil.error(res, 'Funcionalidad de descarga en desarrollo', 501);
    } catch (error: any) {
      logger.error('Error en download document controller', { 
        error, 
        userId: req.user?.id, 
        orderId: req.params.id,
        documentId: req.params.documentId 
      });
      
      if (error.message === PortalClientErrorCodes.ORDER_NOT_FOUND) {
        ApiResponseUtil.error(res, 'Orden no encontrada o no pertenece a tu cliente', 404);
      } else if (error.message.includes('no es un cliente') || error.message.includes('no está asociado')) {
        ApiResponseUtil.error(res, 'No tienes permisos para acceder al portal de clientes', 403);
      } else {
        ApiResponseUtil.error(res, error.message, 500);
      }
    }
  };

  /**
   * GET /api/portal-clients/health
   * Verificar salud del servicio del portal de clientes
   */
  healthCheck = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        ApiResponseUtil.error(res, 'Usuario no autenticado', 401);
        return;
      }

      // Verificar que el usuario tiene acceso de cliente
      await this.portalClientsService.getClientProfile(userId);

      ApiResponseUtil.success(res, {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        userId,
        service: 'portal-clients'
      }, 'Servicio funcionando correctamente');
    } catch (error: any) {
      logger.error('Error en health check controller', { error, userId: req.user?.id });
      
      if (error.message.includes('no es un cliente') || error.message.includes('no está asociado')) {
        ApiResponseUtil.error(res, 'No tienes permisos para acceder al portal de clientes', 403);
      } else {
        ApiResponseUtil.error(res, 'Servicio no disponible', 503);
      }
    }
  };
} 