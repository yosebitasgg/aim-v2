import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { AgentsController } from './agents.controller';
import { AuthMiddleware } from '../../shared/middleware/auth';
import { Logger } from '../../shared/utils/logger';

export function createAgentsRoutes(prisma: PrismaClient): Router {
  const router = Router();
  const agentsController = new AgentsController(prisma);
  const logger = Logger.getInstance();

  // Middleware de autenticación para todas las rutas
  router.use(AuthMiddleware.authenticate);

  // Middleware de logging
  router.use((req, res, next) => {
    logger.info(`Agents API: ${req.method} ${req.path}`, {
      userId: req.user?.id,
      query: req.query,
      body: req.method !== 'GET' ? req.body : undefined
    });
    next();
  });

  // ===== RUTAS DE ESTADÍSTICAS =====
  
  /**
   * @route GET /api/agents/stats
   * @desc Obtener estadísticas de agentes creados
   * @access Private
   */
  router.get('/stats', agentsController.getAgentsStats);

  // ===== RUTAS DE AGENTES CREADOS =====
  
  /**
   * @route GET /api/agents
   * @desc Obtener lista paginada de agentes creados
   * @access Private
   */
  router.get('/', agentsController.getCreatedAgents);

  /**
   * @route POST /api/agents
   * @desc Crear un nuevo agente
   * @access Private
   */
  router.post('/', agentsController.createCreatedAgent);

  /**
   * @route GET /api/agents/:id
   * @desc Obtener un agente por ID con detalles completos
   * @access Private
   */
  router.get('/:id', agentsController.getCreatedAgentById);

  /**
   * @route PUT /api/agents/:id
   * @desc Actualizar un agente existente
   * @access Private
   */
  router.put('/:id', agentsController.updateCreatedAgent);

  /**
   * @route DELETE /api/agents/:id
   * @desc Eliminar un agente
   * @access Private
   */
  router.delete('/:id', agentsController.deleteCreatedAgent);

  // ===== RUTAS DE CONFIGURACIONES =====
  
  /**
   * @route POST /api/agents/configurations
   * @desc Crear una nueva configuración para un agente
   * @access Private
   */
  router.post('/configurations', agentsController.createAgentConfiguration);

  /**
   * @route PUT /api/agents/configurations/:id
   * @desc Actualizar una configuración existente
   * @access Private
   */
  router.put('/configurations/:id', agentsController.updateAgentConfiguration);

  // ===== RUTAS DE WORKFLOWS =====
  
  /**
   * @route POST /api/agents/workflows
   * @desc Crear un nuevo workflow para un agente
   * @access Private
   */
  router.post('/workflows', agentsController.createAgentWorkflow);

  /**
   * @route PUT /api/agents/workflows/:id
   * @desc Actualizar un workflow existente
   * @access Private
   */
  router.put('/workflows/:id', agentsController.updateAgentWorkflow);

  /**
   * @route GET /api/agents/:agentId/workflows/:workflowId
   * @desc Obtener un workflow específico de un agente
   * @access Private
   */
  router.get('/:agentId/workflows/:workflowId', agentsController.getAgentWorkflowById);

  /**
   * @route GET /api/agents/:agentId/workflows/:workflowId/download
   * @desc Descargar un workflow en formato JSON
   * @access Private
   */
  router.get('/:agentId/workflows/:workflowId/download', agentsController.downloadAgentWorkflow);

  // ===== RUTAS ESPECÍFICAS PARA LAS PÁGINAS =====

  /**
   * @route GET /api/agents/orders/for-creation
   * @desc Obtener órdenes disponibles para creación de agentes
   * @access Private
   * @description Esta ruta se usa en la página "crear-agente" para obtener
   *              las órdenes que pueden tener agentes asignados
   */
  router.get('/orders/for-creation', agentsController.getOrdersForAgentCreation);

  /**
   * @route GET /api/agents/suggestions/:orderId
   * @desc Obtener sugerencias de agentes basadas en una orden
   * @access Private
   * @description Esta ruta se usa para sugerir plantillas de la galería
   *              basadas en los requerimientos de la orden
   */
  router.get('/suggestions/:orderId', agentsController.getAgentCreationSuggestions);

  // ===== MANEJO DE ERRORES =====
  
  router.use((error: any, req: any, res: any, next: any) => {
    logger.error('Error in agents routes', {
      error: error.message,
      stack: error.stack,
      path: req.path,
      method: req.method,
      userId: req.user?.id
    });

    // Si es un error de validación de Zod
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: error.errors
      });
    }

    // Error genérico
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      errors: [error.message]
    });
  });

  return router;
} 