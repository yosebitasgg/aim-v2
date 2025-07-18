import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { OrdersController } from './orders.controller';
import { AuthMiddleware } from '@/shared/middleware/auth';
import { PermissionsMiddleware } from '@/shared/middleware/permissions';

export function createOrdersRoutes(prisma: PrismaClient): Router {
  const router = Router();
  const ordersController = new OrdersController(prisma);

  // Aplicar autenticación a todas las rutas
  router.use(AuthMiddleware.authenticate);

  /**
   * @route GET /api/orders
   * @desc Obtener lista de órdenes con filtros y paginación
   * @access Requiere permisos de lectura de órdenes
   * @params query: page?, limit?, sortBy?, sortOrder?, status?, priority?, clientId?, agentId?, assignedToId?, createdById?, startDate?, endDate?, search?, isOverdue?, hasAttachments?
   */
  router.get(
    '/',
    PermissionsMiddleware.requirePermission('orders', 'read'),
    ordersController.getOrders
  );

  /**
   * @route GET /api/orders/stats
   * @desc Obtener estadísticas de órdenes
   * @access Requiere permisos de lectura de reportes
   * @params query: startDate?, endDate?, groupBy?, clientId?, agentId?
   */
  router.get(
    '/stats',
    PermissionsMiddleware.requirePermission('reports', 'read'),
    ordersController.getOrderStats
  );

  /**
   * @route GET /api/orders/dashboard
   * @desc Obtener datos del dashboard de órdenes
   * @access Requiere permisos de lectura de órdenes
   */
  router.get(
    '/dashboard',
    PermissionsMiddleware.requirePermission('orders', 'read'),
    ordersController.getDashboardData
  );

  /**
   * @route POST /api/orders
   * @desc Crear nueva orden
   * @access Requiere permisos de creación de órdenes
   * @body CreateOrderInput
   */
  router.post(
    '/',
    PermissionsMiddleware.requirePermission('orders', 'create'),
    ordersController.createOrder
  );

  /**
   * @route GET /api/orders/:id
   * @desc Obtener orden específica por ID
   * @access Requiere permisos de lectura de órdenes o ser el creador/asignado
   * @params id (path parameter)
   */
  router.get(
    '/:id',
    PermissionsMiddleware.requireOwnershipOrPermission(
      'orders',
      'read',
      async (req) => {
        // Permitir acceso si es el creador o asignado de la orden
        const orderId = req.params.id;
        const userId = req.user?.id;
        
        if (!orderId || !userId) return false;

        try {
          const { PrismaClient } = require('@prisma/client');
          const prisma = new PrismaClient();
          
          const order = await prisma.order.findUnique({
            where: { id: orderId },
            select: { createdById: true, assignedToId: true }
          });

          return order?.createdById === userId || order?.assignedToId === userId;
        } catch {
          return false;
        }
      }
    ),
    ordersController.getOrderById
  );

  /**
   * @route PUT /api/orders/:id
   * @desc Actualizar orden existente
   * @access Requiere permisos de actualización de órdenes o ser el creador/asignado
   * @params id (path parameter)
   * @body UpdateOrderInput
   */
  router.put(
    '/:id',
    PermissionsMiddleware.requireOwnershipOrPermission(
      'orders',
      'update',
      async (req) => {
        const orderId = req.params.id;
        const userId = req.user?.id;
        
        if (!orderId || !userId) return false;

        try {
          const { PrismaClient } = require('@prisma/client');
          const prisma = new PrismaClient();
          
          const order = await prisma.order.findUnique({
            where: { id: orderId },
            select: { createdById: true, assignedToId: true }
          });

          return order?.createdById === userId || order?.assignedToId === userId;
        } catch {
          return false;
        }
      }
    ),
    ordersController.updateOrder
  );

  /**
   * @route PUT /api/orders/:id/status
   * @desc Cambiar estado de la orden
   * @access Requiere permisos de actualización de órdenes o ser el asignado
   * @params id (path parameter)
   * @body ChangeOrderStatusInput
   */
  router.put(
    '/:id/status',
    PermissionsMiddleware.requireOwnershipOrPermission(
      'orders',
      'update',
      async (req) => {
        const orderId = req.params.id;
        const userId = req.user?.id;
        
        if (!orderId || !userId) return false;

        try {
          const { PrismaClient } = require('@prisma/client');
          const prisma = new PrismaClient();
          
          const order = await prisma.order.findUnique({
            where: { id: orderId },
            select: { assignedToId: true, createdById: true }
          });

          // Para cambio de estado, permitir al asignado y al creador
          return order?.assignedToId === userId || order?.createdById === userId;
        } catch {
          return false;
        }
      }
    ),
    ordersController.changeOrderStatus
  );

  /**
   * @route DELETE /api/orders/:id
   * @desc Eliminar orden
   * @access Requiere permisos de eliminación de órdenes
   * @params id (path parameter)
   */
  router.delete(
    '/:id',
    PermissionsMiddleware.requirePermission('orders', 'delete'),
    ordersController.deleteOrder
  );

  /**
   * @route POST /api/orders/:id/communications
   * @desc Crear comunicación para una orden
   * @access Requiere permisos de creación de órdenes o estar relacionado con la orden
   * @params id (path parameter)
   * @body CreateOrderCommunicationInput
   */
  router.post(
    '/:id/communications',
    PermissionsMiddleware.requireOwnershipOrPermission(
      'orders',
      'create',
      async (req) => {
        const orderId = req.params.id;
        const userId = req.user?.id;
        
        if (!orderId || !userId) return false;

        try {
          const { PrismaClient } = require('@prisma/client');
          const prisma = new PrismaClient();
          
          const order = await prisma.order.findUnique({
            where: { id: orderId },
            select: { 
              createdById: true, 
              assignedToId: true,
              client: {
                select: { createdBy: true }
              }
            }
          });

          // Permitir al creador, asignado, o creador del cliente
          return order?.createdById === userId || 
                 order?.assignedToId === userId || 
                 order?.client?.createdBy === userId;
        } catch {
          return false;
        }
      }
    ),
    ordersController.createOrderCommunication
  );

  /**
   * @route GET /api/orders/:id/communications
   * @desc Obtener comunicaciones de una orden
   * @access Requiere permisos de lectura de órdenes o estar relacionado con la orden
   * @params id (path parameter)
   * @params query: limit?, offset?
   */
  router.get(
    '/:id/communications',
    PermissionsMiddleware.requireOwnershipOrPermission(
      'orders',
      'read',
      async (req) => {
        const orderId = req.params.id;
        const userId = req.user?.id;
        
        if (!orderId || !userId) return false;

        try {
          const { PrismaClient } = require('@prisma/client');
          const prisma = new PrismaClient();
          
          const order = await prisma.order.findUnique({
            where: { id: orderId },
            select: { 
              createdById: true, 
              assignedToId: true,
              client: {
                select: { createdBy: true }
              }
            }
          });

          return order?.createdById === userId || 
                 order?.assignedToId === userId || 
                 order?.client?.createdBy === userId;
        } catch {
          return false;
        }
      }
    ),
    ordersController.getOrderCommunications
  );

  /**
   * @route GET /api/orders/:id/history
   * @desc Obtener historial de estados de una orden
   * @access Requiere permisos de lectura de órdenes o estar relacionado con la orden
   * @params id (path parameter)
   */
  router.get(
    '/:id/history',
    PermissionsMiddleware.requireOwnershipOrPermission(
      'orders',
      'read',
      async (req) => {
        const orderId = req.params.id;
        const userId = req.user?.id;
        
        if (!orderId || !userId) return false;

        try {
          const { PrismaClient } = require('@prisma/client');
          const prisma = new PrismaClient();
          
          const order = await prisma.order.findUnique({
            where: { id: orderId },
            select: { 
              createdById: true, 
              assignedToId: true,
              client: {
                select: { createdBy: true }
              }
            }
          });

          return order?.createdById === userId || 
                 order?.assignedToId === userId || 
                 order?.client?.createdBy === userId;
        } catch {
          return false;
        }
      }
    ),
    ordersController.getOrderHistory
  );

  return router;
} 