import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AgentsService } from './agents.service';
import { 
  CreateCreatedAgentSchema,
  UpdateCreatedAgentSchema,
  CreateAgentConfigurationSchema,
  UpdateAgentConfigurationSchema,
  CreateAgentWorkflowSchema,
  UpdateAgentWorkflowSchema,
  AgentsFiltersSchema,
  AgentsStatsSchema,
  AgentsErrorCodes
} from './agents.types';
import { ApiResponseUtil } from '../../shared/utils/response';
import { Logger } from '../../shared/utils/logger';

export class AgentsController {
  private agentsService: AgentsService;
  private logger: Logger;

  constructor(prisma: PrismaClient) {
    this.agentsService = new AgentsService(prisma);
    this.logger = Logger.getInstance();
  }

  // ===== ESTADÍSTICAS Y OVERVIEW =====

  getAgentsStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const validationResult = AgentsStatsSchema.safeParse(req.query);
      
      if (!validationResult.success) {
        ApiResponseUtil.validationError(res, validationResult.error.errors);
        return;
      }

      const stats = await this.agentsService.getAgentsStats(validationResult.data);
      ApiResponseUtil.success(res, stats, 'Estadísticas de agentes obtenidas exitosamente');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error('Error getting agents stats', { error: errorMessage });
      ApiResponseUtil.error(res, errorMessage, 500);
    }
  };

  // ===== AGENTES CREADOS =====

  createCreatedAgent = async (req: Request, res: Response): Promise<void> => {
    try {
      const validationResult = CreateCreatedAgentSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        ApiResponseUtil.validationError(res, validationResult.error.errors);
        return;
      }

      // Obtener el ID del usuario autenticado
      const createdById = req.user?.id;
      if (!createdById) {
        ApiResponseUtil.error(res, 'Usuario no autenticado', 401);
        return;
      }

      const agent = await this.agentsService.createCreatedAgent(validationResult.data, createdById);
      
      ApiResponseUtil.success(res, agent, 'Agente creado exitosamente', 201);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error('Error creating agent', { error: errorMessage, body: req.body });
      
      if (errorMessage === AgentsErrorCodes.ORDER_NOT_FOUND) {
        ApiResponseUtil.error(res, 'La orden especificada no existe', 404);
        return;
      }
      
      if (errorMessage === AgentsErrorCodes.TEMPLATE_AGENT_NOT_FOUND) {
        ApiResponseUtil.error(res, 'La plantilla de agente especificada no existe', 404);
        return;
      }

      if (errorMessage === AgentsErrorCodes.USER_NOT_FOUND) {
        ApiResponseUtil.error(res, 'El usuario asignado no existe', 404);
        return;
      }
      
      ApiResponseUtil.error(res, errorMessage, 500);
    }
  };

  getCreatedAgents = async (req: Request, res: Response): Promise<void> => {
    try {
      const validationResult = AgentsFiltersSchema.safeParse(req.query);
      
      if (!validationResult.success) {
        ApiResponseUtil.validationError(res, validationResult.error.errors);
        return;
      }

      const agents = await this.agentsService.getCreatedAgents(validationResult.data);
      
      ApiResponseUtil.success(res, agents, 'Agentes obtenidos exitosamente');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error('Error getting agents', { error: errorMessage });
      ApiResponseUtil.error(res, errorMessage, 500);
    }
  };

  getCreatedAgentById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        ApiResponseUtil.error(res, 'ID del agente es requerido', 400);
        return;
      }

      const agent = await this.agentsService.getCreatedAgentById(id);
      
      ApiResponseUtil.success(res, agent, 'Agente obtenido exitosamente');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error('Error getting agent by id', { error: errorMessage, params: req.params });
      
      if (errorMessage === AgentsErrorCodes.CREATED_AGENT_NOT_FOUND) {
        ApiResponseUtil.error(res, 'El agente especificado no existe', 404);
        return;
      }
      
      ApiResponseUtil.error(res, errorMessage, 500);
    }
  };

  updateCreatedAgent = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const validationResult = UpdateCreatedAgentSchema.safeParse(req.body);
      
      if (!id) {
        ApiResponseUtil.error(res, 'ID del agente es requerido', 400);
        return;
      }

      if (!validationResult.success) {
        ApiResponseUtil.validationError(res, validationResult.error.errors);
        return;
      }

      const agent = await this.agentsService.updateCreatedAgent(id, validationResult.data);
      
      ApiResponseUtil.success(res, agent, 'Agente actualizado exitosamente');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error('Error updating agent', { error: errorMessage, params: req.params, body: req.body });
      
      if (errorMessage === AgentsErrorCodes.CREATED_AGENT_NOT_FOUND) {
        ApiResponseUtil.error(res, 'El agente especificado no existe', 404);
        return;
      }

      if (errorMessage === AgentsErrorCodes.INVALID_STATUS_TRANSITION) {
        ApiResponseUtil.error(res, 'Transición de estado no válida', 400);
        return;
      }

      if (errorMessage === AgentsErrorCodes.USER_NOT_FOUND) {
        ApiResponseUtil.error(res, 'El usuario asignado no existe', 404);
        return;
      }
      
      ApiResponseUtil.error(res, errorMessage, 500);
    }
  };

  deleteCreatedAgent = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        ApiResponseUtil.error(res, 'ID del agente es requerido', 400);
        return;
      }

      await this.agentsService.deleteCreatedAgent(id);
      
      ApiResponseUtil.success(res, null, 'Agente eliminado exitosamente');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error('Error deleting agent', { error: errorMessage, params: req.params });
      
      if (errorMessage === AgentsErrorCodes.CREATED_AGENT_NOT_FOUND) {
        ApiResponseUtil.error(res, 'El agente especificado no existe', 404);
        return;
      }

      if (errorMessage === AgentsErrorCodes.AGENT_HAS_ACTIVE_WORKFLOWS) {
        ApiResponseUtil.error(res, 'No se puede eliminar un agente con workflows activos', 400);
        return;
      }
      
      ApiResponseUtil.error(res, errorMessage, 500);
    }
  };

  // ===== CONFIGURACIONES =====

  createAgentConfiguration = async (req: Request, res: Response): Promise<void> => {
    try {
      const validationResult = CreateAgentConfigurationSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        ApiResponseUtil.validationError(res, validationResult.error.errors);
        return;
      }

      const configuration = await this.agentsService.createAgentConfiguration(validationResult.data);
      
      ApiResponseUtil.success(res, configuration, 'Configuración creada exitosamente', 201);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error('Error creating configuration', { error: errorMessage, body: req.body });
      
      if (errorMessage === AgentsErrorCodes.CREATED_AGENT_NOT_FOUND) {
        ApiResponseUtil.error(res, 'El agente especificado no existe', 404);
        return;
      }

      if (errorMessage === AgentsErrorCodes.CONFIGURATION_TYPE_EXISTS) {
        ApiResponseUtil.error(res, 'Ya existe una configuración activa de este tipo', 409);
        return;
      }
      
      ApiResponseUtil.error(res, errorMessage, 500);
    }
  };

  updateAgentConfiguration = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const validationResult = UpdateAgentConfigurationSchema.safeParse(req.body);
      
      if (!id) {
        ApiResponseUtil.error(res, 'ID de la configuración es requerido', 400);
        return;
      }

      if (!validationResult.success) {
        ApiResponseUtil.validationError(res, validationResult.error.errors);
        return;
      }

      const configuration = await this.agentsService.updateAgentConfiguration(id, validationResult.data);
      
      ApiResponseUtil.success(res, configuration, 'Configuración actualizada exitosamente');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error('Error updating configuration', { error: errorMessage, params: req.params, body: req.body });
      
      if (errorMessage === AgentsErrorCodes.CONFIGURATION_NOT_FOUND) {
        ApiResponseUtil.error(res, 'La configuración especificada no existe', 404);
        return;
      }
      
      ApiResponseUtil.error(res, errorMessage, 500);
    }
  };

  // ===== WORKFLOWS =====

  createAgentWorkflow = async (req: Request, res: Response): Promise<void> => {
    try {
      const validationResult = CreateAgentWorkflowSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        ApiResponseUtil.validationError(res, validationResult.error.errors);
        return;
      }

      const workflow = await this.agentsService.createAgentWorkflow(validationResult.data);
      
      ApiResponseUtil.success(res, workflow, 'Workflow creado exitosamente', 201);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error('Error creating workflow', { error: errorMessage, body: req.body });
      
      if (errorMessage === AgentsErrorCodes.CREATED_AGENT_NOT_FOUND) {
        ApiResponseUtil.error(res, 'El agente especificado no existe', 404);
        return;
      }

      if (errorMessage === AgentsErrorCodes.WORKFLOW_NOT_FOUND) {
        ApiResponseUtil.error(res, 'El workflow padre especificado no existe', 404);
        return;
      }

      if (errorMessage === AgentsErrorCodes.INVALID_N8N_WORKFLOW) {
        ApiResponseUtil.error(res, 'El workflow de n8n no es válido', 400);
        return;
      }
      
      ApiResponseUtil.error(res, errorMessage, 500);
    }
  };

  updateAgentWorkflow = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const validationResult = UpdateAgentWorkflowSchema.safeParse(req.body);
      
      if (!id) {
        ApiResponseUtil.error(res, 'ID del workflow es requerido', 400);
        return;
      }

      if (!validationResult.success) {
        ApiResponseUtil.validationError(res, validationResult.error.errors);
        return;
      }

      const workflow = await this.agentsService.updateAgentWorkflow(id, validationResult.data);
      
      ApiResponseUtil.success(res, workflow, 'Workflow actualizado exitosamente');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error('Error updating workflow', { error: errorMessage, params: req.params, body: req.body });
      
      if (errorMessage === AgentsErrorCodes.WORKFLOW_NOT_FOUND) {
        ApiResponseUtil.error(res, 'El workflow especificado no existe', 404);
        return;
      }

      if (errorMessage === AgentsErrorCodes.WORKFLOW_VERSION_CONFLICT) {
        ApiResponseUtil.error(res, 'Conflicto de versión del workflow', 409);
        return;
      }

      if (errorMessage === AgentsErrorCodes.INVALID_N8N_WORKFLOW) {
        ApiResponseUtil.error(res, 'El workflow de n8n no es válido', 400);
        return;
      }
      
      ApiResponseUtil.error(res, errorMessage, 500);
    }
  };

  // ===== MÉTODOS AUXILIARES =====

  getAgentWorkflowById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { agentId, workflowId } = req.params;

      if (!agentId || !workflowId) {
        ApiResponseUtil.error(res, 'ID del agente y workflow son requeridos', 400);
        return;
      }

      // Aquí iría la implementación para obtener un workflow específico
      // Por ahora solo retornamos un mensaje de no implementado
      ApiResponseUtil.error(res, 'Método no implementado', 501);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error('Error getting workflow by id', { error: errorMessage, params: req.params });
      ApiResponseUtil.error(res, errorMessage, 500);
    }
  };

  downloadAgentWorkflow = async (req: Request, res: Response): Promise<void> => {
    try {
      const { agentId, workflowId } = req.params;

      if (!agentId || !workflowId) {
        ApiResponseUtil.error(res, 'ID del agente y workflow son requeridos', 400);
        return;
      }

      // Aquí iría la implementación para descargar un workflow
      // Similar a como funciona en gallery
      ApiResponseUtil.error(res, 'Método no implementado', 501);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error('Error downloading workflow', { error: errorMessage, params: req.params });
      ApiResponseUtil.error(res, errorMessage, 500);
    }
  };

  // ===== MÉTODOS ESPECÍFICOS PARA LAS PÁGINAS =====

  getOrdersForAgentCreation = async (req: Request, res: Response): Promise<void> => {
    try {
      // Este método se usará en la página "crear-agente" para obtener las órdenes
      // Filtros específicos para órdenes que pueden tener agentes
      const filters = {
        includeAgentInfo: true,
        status: ['PENDING', 'IN_PROGRESS'], // Solo órdenes activas
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20
      };

      // Aquí iría la lógica para obtener órdenes con información de agentes
      // Por ahora solo retornamos un mensaje de no implementado
      ApiResponseUtil.error(res, 'Método no implementado', 501);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error('Error getting orders for agent creation', { error: errorMessage });
      ApiResponseUtil.error(res, errorMessage, 500);
    }
  };

  getAgentCreationSuggestions = async (req: Request, res: Response): Promise<void> => {
    try {
      const { orderId } = req.params;

      if (!orderId) {
        ApiResponseUtil.error(res, 'ID de la orden es requerido', 400);
        return;
      }

      // Este método se usará para sugerir plantillas de agentes basadas en la orden
      // Aquí iría la lógica para analizar la orden y sugerir agentes de la galería
      ApiResponseUtil.error(res, 'Método no implementado', 501);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error('Error getting agent suggestions', { error: errorMessage, params: req.params });
      ApiResponseUtil.error(res, errorMessage, 500);
    }
  };
} 