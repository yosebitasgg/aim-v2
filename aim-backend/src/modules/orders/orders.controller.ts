import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '@/shared/utils/logger';
import { ApiResponseUtil } from '@/shared/utils/response';
import { OrdersService } from './orders.service';
import {
  CreateOrderSchema,
  UpdateOrderSchema,
  OrderFiltersSchema,
  OrderStatsSchema,
  ChangeOrderStatusSchema,
  CreateOrderCommunicationSchema,
  OrderApiResponse,
  OrderErrorCodes
} from './orders.types';

export class OrdersController {
  private ordersService: OrdersService;

  constructor(prisma: PrismaClient) {
    this.ordersService = new OrdersService(prisma);
  }

  /**
   * GET /api/orders
   * Obtener lista de órdenes con filtros y paginación
   */
  getOrders = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validar parámetros de consulta
      const validatedParams = OrderFiltersSchema.parse({
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
        sortBy: req.query.sortBy || 'createdAt',
        sortOrder: req.query.sortOrder || 'desc',
        status: req.query.status,
        priority: req.query.priority,
        clientId: req.query.clientId,
        agentId: req.query.agentId,
        assignedToId: req.query.assignedToId,
        createdById: req.query.createdById,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        search: req.query.search,
        isOverdue: req.query.isOverdue === 'true',
        hasAttachments: req.query.hasAttachments === 'true'
      });

      const result = await this.ordersService.getOrders(validatedParams);

      const response: OrderApiResponse = {
        success: true,
        message: 'Órdenes obtenidas exitosamente',
        data: result
      };

      logger.info('Órdenes consultadas', {
        userId: (req as any).user?.id,
        filters: validatedParams,
        resultsCount: result.orders.length,
        total: result.pagination.total
      });

      ApiResponseUtil.success(res, result, 'Órdenes obtenidas exitosamente');
    } catch (error) {
      logger.error('Error obteniendo órdenes', {
        error,
        userId: (req as any).user?.id,
        query: req.query
      });

      const response: OrderApiResponse = {
        success: false,
        message: 'Error al obtener las órdenes',
        errors: [error instanceof Error ? error.message : 'Error interno del servidor']
      };

      ApiResponseUtil.error(res, response.message!, 400);
    }
  };

  /**
   * GET /api/orders/:id
   * Obtener orden específica por ID
   */
  getOrderById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        const response: OrderApiResponse = {
          success: false,
          message: 'ID de la orden es requerido',
          errors: ['Parámetro ID faltante']
        };
        ApiResponseUtil.error(res, response.message!, 400);
        return;
      }

      const order = await this.ordersService.getOrderById(id);

      logger.info('Orden consultada por ID', {
        orderId: id,
        userId: (req as any).user?.id
      });

      ApiResponseUtil.success(res, order, 'Orden obtenida exitosamente');
    } catch (error) {
      logger.error('Error obteniendo orden por ID', {
        error,
        orderId: req.params.id,
        userId: (req as any).user?.id
      });

      if (error instanceof Error && error.message === OrderErrorCodes.ORDER_NOT_FOUND) {
        ApiResponseUtil.notFound(res, 'Orden no encontrada');
      } else {
        ApiResponseUtil.error(res, 'Error al obtener la orden', 500);
      }
    }
  };

  /**
   * POST /api/orders
   * Crear nueva orden
   */
  createOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      logger.info('Datos recibidos para crear orden:', {
        body: req.body,
        userId: (req as any).user?.id
      });

      // Validar datos de entrada
      const validationResult = CreateOrderSchema.safeParse(req.body);
      if (!validationResult.success) {
        logger.error('Errores de validación:', {
          errors: validationResult.error.issues,
          body: req.body
        });
        ApiResponseUtil.validationError(res, validationResult.error.issues);
        return;
      }

      const createdById = (req as any).user?.id;
      if (!createdById) {
        ApiResponseUtil.unauthorized(res, 'Usuario no autenticado');
        return;
      }

      const order = await this.ordersService.createOrder(validationResult.data, createdById);

      logger.info('Orden creada exitosamente', {
        orderId: order.id,
        orderNumber: order.orderNumber,
        createdBy: createdById,
        clientId: order.client.id
      });

      ApiResponseUtil.success(res, order, 'Orden creada exitosamente', 201);
    } catch (error) {
      logger.error('Error creando orden', {
        error,
        body: req.body,
        userId: (req as any).user?.id
      });

      if (error instanceof Error) {
        if (error.message.includes('Client')) {
          ApiResponseUtil.error(res, 'Error con datos del cliente', 400);
        } else if (error.message.includes('Agent')) {
          ApiResponseUtil.error(res, 'Agente no encontrado', 400);
        } else {
          ApiResponseUtil.error(res, error.message, 400);
        }
      } else {
        ApiResponseUtil.error(res, 'Error interno del servidor', 500);
      }
    }
  };

  /**
   * PUT /api/orders/:id
   * Actualizar orden existente
   */
  updateOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        ApiResponseUtil.error(res, 'ID de la orden es requerido', 400);
        return;
      }

      // Validar datos de entrada
      const validationResult = UpdateOrderSchema.safeParse(req.body);
      if (!validationResult.success) {
        ApiResponseUtil.validationError(res, validationResult.error.issues);
        return;
      }

      const order = await this.ordersService.updateOrder(id, validationResult.data);

      logger.info('Orden actualizada exitosamente', {
        orderId: id,
        userId: (req as any).user?.id,
        changes: Object.keys(validationResult.data)
      });

      ApiResponseUtil.success(res, order, 'Orden actualizada exitosamente');
    } catch (error) {
      logger.error('Error actualizando orden', {
        error,
        orderId: req.params.id,
        body: req.body,
        userId: (req as any).user?.id
      });

      if (error instanceof Error && error.message === OrderErrorCodes.ORDER_NOT_FOUND) {
        ApiResponseUtil.notFound(res, 'Orden no encontrada');
      } else {
        ApiResponseUtil.error(res, 'Error al actualizar la orden', 500);
      }
    }
  };

  /**
   * PUT /api/orders/:id/status
   * Cambiar estado de la orden
   */
  changeOrderStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        ApiResponseUtil.error(res, 'ID de la orden es requerido', 400);
        return;
      }

      // Validar datos de entrada
      const validationResult = ChangeOrderStatusSchema.safeParse(req.body);
      if (!validationResult.success) {
        ApiResponseUtil.validationError(res, validationResult.error.issues);
        return;
      }

      const changedById = (req as any).user?.id;
      if (!changedById) {
        ApiResponseUtil.unauthorized(res, 'Usuario no autenticado');
        return;
      }

      const order = await this.ordersService.changeOrderStatus(id, validationResult.data, changedById);

      logger.info('Estado de orden cambiado exitosamente', {
        orderId: id,
        newStatus: validationResult.data.status,
        changedBy: changedById
      });

      ApiResponseUtil.success(res, order, 'Estado de orden actualizado exitosamente');
    } catch (error) {
      logger.error('Error cambiando estado de orden', {
        error,
        orderId: req.params.id,
        body: req.body,
        userId: (req as any).user?.id
      });

      if (error instanceof Error) {
        if (error.message === OrderErrorCodes.ORDER_NOT_FOUND) {
          ApiResponseUtil.notFound(res, 'Orden no encontrada');
        } else if (error.message === OrderErrorCodes.INVALID_STATUS_TRANSITION) {
          ApiResponseUtil.error(res, 'Transición de estado inválida', 400);
        } else {
          ApiResponseUtil.error(res, error.message, 400);
        }
      } else {
        ApiResponseUtil.error(res, 'Error interno del servidor', 500);
      }
    }
  };

  /**
   * DELETE /api/orders/:id
   * Eliminar orden
   */
  deleteOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        ApiResponseUtil.error(res, 'ID de la orden es requerido', 400);
        return;
      }

      await this.ordersService.deleteOrder(id);

      logger.info('Orden eliminada exitosamente', {
        orderId: id,
        userId: (req as any).user?.id
      });

      ApiResponseUtil.success(res, null, 'Orden eliminada exitosamente');
    } catch (error) {
      logger.error('Error eliminando orden', {
        error,
        orderId: req.params.id,
        userId: (req as any).user?.id
      });

      if (error instanceof Error && error.message === OrderErrorCodes.ORDER_NOT_FOUND) {
        ApiResponseUtil.notFound(res, 'Orden no encontrada');
      } else {
        ApiResponseUtil.error(res, 'Error al eliminar la orden', 500);
      }
    }
  };

  /**
   * GET /api/orders/stats
   * Obtener estadísticas de órdenes
   */
  getOrderStats = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validar parámetros
      const validatedParams = OrderStatsSchema.parse({
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        groupBy: req.query.groupBy || 'month',
        clientId: req.query.clientId,
        agentId: req.query.agentId
      });

      const stats = await this.ordersService.getOrderStats(validatedParams);

      logger.info('Estadísticas de órdenes consultadas', {
        userId: (req as any).user?.id,
        params: validatedParams,
        totalOrders: stats.overview.totalOrders
      });

      ApiResponseUtil.success(res, stats, 'Estadísticas obtenidas exitosamente');
    } catch (error) {
      logger.error('Error obteniendo estadísticas de órdenes', {
        error,
        userId: (req as any).user?.id,
        query: req.query
      });

      ApiResponseUtil.error(res, 'Error al obtener las estadísticas', 500);
    }
  };

  /**
   * POST /api/orders/:id/communications
   * Crear comunicación para una orden
   */
  createOrderCommunication = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        ApiResponseUtil.error(res, 'ID de la orden es requerido', 400);
        return;
      }

      // Validar datos de entrada
      const validationResult = CreateOrderCommunicationSchema.safeParse(req.body);
      if (!validationResult.success) {
        ApiResponseUtil.validationError(res, validationResult.error.issues);
        return;
      }

      const createdById = (req as any).user?.id;
      if (!createdById) {
        ApiResponseUtil.unauthorized(res, 'Usuario no autenticado');
        return;
      }

      const communication = await this.ordersService.createOrderCommunication(
        id, 
        validationResult.data, 
        createdById
      );

      logger.info('Comunicación de orden creada exitosamente', {
        orderId: id,
        communicationType: validationResult.data.type,
        createdBy: createdById
      });

      ApiResponseUtil.success(res, communication, 'Comunicación creada exitosamente', 201);
    } catch (error) {
      logger.error('Error creando comunicación de orden', {
        error,
        orderId: req.params.id,
        body: req.body,
        userId: (req as any).user?.id
      });

      if (error instanceof Error && error.message === OrderErrorCodes.ORDER_NOT_FOUND) {
        ApiResponseUtil.notFound(res, 'Orden no encontrada');
      } else {
        ApiResponseUtil.error(res, 'Error al crear la comunicación', 500);
      }
    }
  };

  /**
   * GET /api/orders/:id/communications
   * Obtener comunicaciones de una orden
   */
  getOrderCommunications = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;

      if (!id) {
        ApiResponseUtil.error(res, 'ID de la orden es requerido', 400);
        return;
      }

      // Verificar que la orden existe
      await this.ordersService.getOrderById(id);

      // Obtener comunicaciones (esto podría ser un método separado en el service)
      // Por simplicidad, vamos a incluirlo en el detalle de la orden

      const order = await this.ordersService.getOrderById(id);

      logger.info('Comunicaciones de orden consultadas', {
        orderId: id,
        userId: (req as any).user?.id
      });

      ApiResponseUtil.success(res, order.recentCommunications, 'Comunicaciones obtenidas exitosamente');
    } catch (error) {
      logger.error('Error obteniendo comunicaciones de orden', {
        error,
        orderId: req.params.id,
        userId: (req as any).user?.id
      });

      if (error instanceof Error && error.message === OrderErrorCodes.ORDER_NOT_FOUND) {
        ApiResponseUtil.notFound(res, 'Orden no encontrada');
      } else {
        ApiResponseUtil.error(res, 'Error al obtener las comunicaciones', 500);
      }
    }
  };

  /**
   * GET /api/orders/:id/history
   * Obtener historial de estados de una orden
   */
  getOrderHistory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        ApiResponseUtil.error(res, 'ID de la orden es requerido', 400);
        return;
      }

      const order = await this.ordersService.getOrderById(id);

      logger.info('Historial de orden consultado', {
        orderId: id,
        userId: (req as any).user?.id
      });

      ApiResponseUtil.success(res, order.statusHistory, 'Historial obtenido exitosamente');
    } catch (error) {
      logger.error('Error obteniendo historial de orden', {
        error,
        orderId: req.params.id,
        userId: (req as any).user?.id
      });

      if (error instanceof Error && error.message === OrderErrorCodes.ORDER_NOT_FOUND) {
        ApiResponseUtil.notFound(res, 'Orden no encontrada');
      } else {
        ApiResponseUtil.error(res, 'Error al obtener el historial', 500);
      }
    }
  };

  /**
   * GET /api/orders/dashboard
   * Obtener datos del dashboard de órdenes
   */
  getDashboardData = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      const userRole = (req as any).user?.role;

      // Para empleados, mostrar solo sus órdenes asignadas
      const filters: any = {
        page: 1,
        limit: 10,
        sortBy: 'updatedAt',
        sortOrder: 'desc'
      };

      if (userRole === 'employee') {
        filters.assignedToId = userId;
      }

      // Obtener órdenes recientes
      const recentOrders = await this.ordersService.getOrders(filters);

      // Obtener estadísticas
      const statsParams: any = {};
      if (userRole === 'employee') {
        // Las estadísticas podrían ser limitadas para empleados
      }

      const stats = await this.ordersService.getOrderStats(statsParams);

      const dashboardData = {
        recentOrders: recentOrders.orders,
        stats: stats.overview,
        statusDistribution: stats.statusDistribution,
        priorityDistribution: stats.priorityDistribution,
        recentActivity: stats.recentActivity
      };

      logger.info('Datos del dashboard consultados', {
        userId,
        userRole
      });

      ApiResponseUtil.success(res, dashboardData, 'Datos del dashboard obtenidos exitosamente');
    } catch (error) {
      logger.error('Error obteniendo datos del dashboard', {
        error,
        userId: (req as any).user?.id
      });

      ApiResponseUtil.error(res, 'Error al obtener los datos del dashboard', 500);
    }
  };
} 