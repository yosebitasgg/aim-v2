import { Router } from 'express';
import { PortalClientsController } from './portal-clients.controller';
import { PortalClientsService } from './portal-clients.service';
import { prisma } from '@/database/client';
import { AuthMiddleware } from '@/shared/middleware/auth';

const router = Router();

// Instanciar servicio y controlador
const portalClientsService = new PortalClientsService(prisma);
const portalClientsController = new PortalClientsController(portalClientsService);

/**
 * Middleware de autenticación requerido para todas las rutas
 * Solo usuarios con rol 'client' pueden acceder a estas rutas
 */
router.use(AuthMiddleware.authenticate);

// Middleware adicional para verificar rol de cliente
router.use((req, res, next) => {
  const user = req.user;
  
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Usuario no autenticado'
    });
  }

  if (user.role !== 'client') {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. Solo clientes pueden usar este portal.'
    });
  }

  return next();
});

/**
 * @route GET /api/portal-clients/health
 * @desc Verificar salud del servicio del portal de clientes
 * @access Privado - Solo clientes
 */
router.get('/health', portalClientsController.healthCheck);

/**
 * @route GET /api/portal-clients/dashboard/stats
 * @desc Obtener estadísticas del dashboard del cliente (versión legacy)
 * @access Privado - Solo el cliente asociado
 * @query dateRange?, includeActivity?, activityLimit?
 */
router.get('/dashboard/stats', portalClientsController.getDashboardStats);

/**
 * @route POST /api/portal-clients/dashboard/stats
 * @desc Obtener estadísticas avanzadas del dashboard del cliente
 * @access Privado - Solo el cliente asociado
 * @body dateRange?, includeActivity?, activityLimit?, includeROI?, includeFinancial?, includeAgentMetrics?
 */
router.post('/dashboard/stats', portalClientsController.getEnhancedDashboardStats);

/**
 * @route GET /api/portal-clients/orders
 * @desc Obtener órdenes del cliente con paginación y filtros
 * @access Privado - Solo órdenes del cliente asociado
 * @query page?, limit?, search?, status?, priority?, type?, startDate?, endDate?, sortBy?, sortOrder?
 */
router.get('/orders', portalClientsController.getOrders);

/**
 * @route GET /api/portal-clients/orders/:id
 * @desc Obtener detalle de una orden específica del cliente
 * @access Privado - Solo si la orden pertenece al cliente asociado
 * @params id (order ID)
 */
router.get('/orders/:id', portalClientsController.getOrderById);

/**
 * @route GET /api/portal-clients/orders/:id/download-document/:documentId
 * @desc Descargar documento de una orden del cliente
 * @access Privado - Solo si la orden y documento pertenecen al cliente asociado
 * @params id (order ID), documentId (document ID)
 */
router.get('/orders/:id/download-document/:documentId', portalClientsController.downloadOrderDocument);

/**
 * @route GET /api/portal-clients/agents
 * @desc Obtener agentes del cliente con paginación y filtros
 * @access Privado - Solo agentes de órdenes del cliente asociado
 * @query page?, limit?, search?, status?, connectionType?, complexity?, sortBy?, sortOrder?
 */
router.get('/agents', portalClientsController.getAgents);

/**
 * @route GET /api/portal-clients/documents
 * @desc Obtener documentos del cliente con paginación y filtros
 * @access Privado - Solo documentos de órdenes del cliente asociado
 * @query page?, limit?, search?, status?, documentType?, phase?, orderId?, sortBy?, sortOrder?
 */
router.get('/documents', portalClientsController.getDocuments);

/**
 * @route GET /api/portal-clients/profile
 * @desc Obtener perfil del cliente (usuario + datos del cliente)
 * @access Privado - Solo el propio perfil del cliente
 */
router.get('/profile', portalClientsController.getProfile);

/**
 * @route PUT /api/portal-clients/profile
 * @desc Actualizar perfil del cliente
 * @access Privado - Solo el propio perfil del cliente
 * @body userData?, clientData?
 */
router.put('/profile', portalClientsController.updateProfile);

export default router; 