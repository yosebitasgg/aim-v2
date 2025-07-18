import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { GalleryService } from './gallery.service';
import { 
  CreateAgentCategorySchema,
  UpdateAgentCategorySchema,
  CreateConnectionTypeSchema,
  UpdateConnectionTypeSchema,
  CreateConnectionTemplateSchema,
  UpdateConnectionTemplateSchema,
  CreateAgentSchema,
  UpdateAgentSchema,
  GalleryFiltersSchema,
  GalleryStatsSchema,
  GalleryErrorCodes
} from './gallery.types';
import { ApiResponseUtil } from '../../shared/utils/response';
import { Logger } from '../../shared/utils/logger';

export class GalleryController {
  private galleryService: GalleryService;
  private logger: Logger;

  constructor(prisma: PrismaClient) {
    this.galleryService = new GalleryService(prisma);
    this.logger = Logger.getInstance();
  }

  // ===== OVERVIEW Y ESTADÍSTICAS =====

  getGalleryOverview = async (req: Request, res: Response): Promise<void> => {
    try {
      const overview = await this.galleryService.getGalleryOverview();
      ApiResponseUtil.success(res, overview, 'Resumen de galería obtenido exitosamente');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error('Error getting gallery overview', { error: errorMessage });
      ApiResponseUtil.error(res, errorMessage, 500);
    }
  };

  getGalleryStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const validationResult = GalleryStatsSchema.safeParse(req.query);
      
      if (!validationResult.success) {
        ApiResponseUtil.validationError(res, validationResult.error.errors);
        return;
      }

      const stats = await this.galleryService.getGalleryStats(validationResult.data);
      ApiResponseUtil.success(res, stats, 'Estadísticas de galería obtenidas exitosamente');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error('Error getting gallery stats', { error: errorMessage });
      ApiResponseUtil.error(res, errorMessage, 500);
    }
  };

  // ===== CATEGORÍAS DE AGENTES =====

  createAgentCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const validationResult = CreateAgentCategorySchema.safeParse(req.body);
      
      if (!validationResult.success) {
        ApiResponseUtil.validationError(res, validationResult.error.errors);
        return;
      }

      const category = await this.galleryService.createAgentCategory(validationResult.data);
      
      ApiResponseUtil.success(res, category, 'Categoría de agente creada exitosamente', 201);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error('Error creating agent category', { error: errorMessage, body: req.body });
      
      if (errorMessage === GalleryErrorCodes.SLUG_ALREADY_EXISTS) {
        ApiResponseUtil.error(res, 'El slug ya existe', 409);
        return;
      }
      
      ApiResponseUtil.error(res, errorMessage, 500);
    }
  };

  getAgentCategories = async (req: Request, res: Response): Promise<void> => {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const categories = await this.galleryService.getAgentCategories(includeInactive);
      
      ApiResponseUtil.success(res, categories, 'Categorías de agentes obtenidas exitosamente');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error('Error getting agent categories', { error: errorMessage });
      ApiResponseUtil.error(res, errorMessage, 500);
    }
  };

  getAgentCategoryById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const category = await this.galleryService.getAgentCategoryById(id);
      
      ApiResponseUtil.success(res, category, 'Categoría de agente obtenida exitosamente');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error('Error getting agent category by ID', { error: errorMessage, categoryId: req.params.id });
      
      if (errorMessage === GalleryErrorCodes.CATEGORY_NOT_FOUND) {
        ApiResponseUtil.error(res, 'Categoría de agente no encontrada', 404);
        return;
      }
      
      ApiResponseUtil.error(res, errorMessage, 500);
    }
  };

  updateAgentCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const validationResult = UpdateAgentCategorySchema.safeParse(req.body);
      
      if (!validationResult.success) {
        ApiResponseUtil.validationError(res, validationResult.error.errors);
        return;
      }

      const category = await this.galleryService.updateAgentCategory(id, validationResult.data);
      
      ApiResponseUtil.success(res, category, 'Categoría de agente actualizada exitosamente');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error('Error updating agent category', { error: errorMessage, categoryId: req.params.id });
      
      if (errorMessage === GalleryErrorCodes.CATEGORY_NOT_FOUND) {
        ApiResponseUtil.error(res, 'Categoría de agente no encontrada', 404);
        return;
      }
      if (errorMessage === GalleryErrorCodes.SLUG_ALREADY_EXISTS) {
        ApiResponseUtil.error(res, 'El slug ya existe', 409);
        return;
      }
      
      ApiResponseUtil.error(res, errorMessage, 500);
    }
  };

  deleteAgentCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await this.galleryService.deleteAgentCategory(id);
      
      ApiResponseUtil.success(res, null, 'Categoría de agente eliminada exitosamente');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error('Error deleting agent category', { error: errorMessage, categoryId: req.params.id });
      
      if (errorMessage === GalleryErrorCodes.CATEGORY_NOT_FOUND) {
        ApiResponseUtil.error(res, 'Categoría de agente no encontrada', 404);
        return;
      }
      if (errorMessage === GalleryErrorCodes.CATEGORY_HAS_AGENTS) {
        ApiResponseUtil.error(res, 'No se puede eliminar la categoría porque tiene agentes asociados', 400);
        return;
      }
      
      ApiResponseUtil.error(res, errorMessage, 500);
    }
  };

  // ===== TIPOS DE CONEXIÓN =====

  createConnectionType = async (req: Request, res: Response): Promise<void> => {
    try {
      const validationResult = CreateConnectionTypeSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        ApiResponseUtil.validationError(res, validationResult.error.errors);
        return;
      }

      const connectionType = await this.galleryService.createConnectionType(validationResult.data);
      
      ApiResponseUtil.success(res, connectionType, 'Tipo de conexión creado exitosamente', 201);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error('Error creating connection type', { error: errorMessage, body: req.body });
      
      if (errorMessage === GalleryErrorCodes.SLUG_ALREADY_EXISTS) {
        ApiResponseUtil.error(res, 'El slug ya existe', 409);
        return;
      }
      
      ApiResponseUtil.error(res, errorMessage, 500);
    }
  };

  getConnectionTypes = async (req: Request, res: Response): Promise<void> => {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const connectionTypes = await this.galleryService.getConnectionTypes(includeInactive);
      
      ApiResponseUtil.success(res, connectionTypes, 'Tipos de conexión obtenidos exitosamente');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error('Error getting connection types', { error: errorMessage });
      ApiResponseUtil.error(res, errorMessage, 500);
    }
  };

  getConnectionTypeById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const connectionType = await this.galleryService.getConnectionTypeById(id);
      
      ApiResponseUtil.success(res, connectionType, 'Tipo de conexión obtenido exitosamente');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error('Error getting connection type by ID', { error: errorMessage, connectionTypeId: req.params.id });
      
      if (errorMessage === GalleryErrorCodes.CONNECTION_TYPE_NOT_FOUND) {
        ApiResponseUtil.error(res, 'Tipo de conexión no encontrado', 404);
        return;
      }
      
      ApiResponseUtil.error(res, errorMessage, 500);
    }
  };

  updateConnectionType = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const validationResult = UpdateConnectionTypeSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        ApiResponseUtil.validationError(res, validationResult.error.errors);
        return;
      }

      const connectionType = await this.galleryService.updateConnectionType(id, validationResult.data);
      
      ApiResponseUtil.success(res, connectionType, 'Tipo de conexión actualizado exitosamente');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error('Error updating connection type', { error: errorMessage, connectionTypeId: req.params.id });
      
      if (errorMessage === GalleryErrorCodes.CONNECTION_TYPE_NOT_FOUND) {
        ApiResponseUtil.error(res, 'Tipo de conexión no encontrado', 404);
        return;
      }
      if (errorMessage === GalleryErrorCodes.SLUG_ALREADY_EXISTS) {
        ApiResponseUtil.error(res, 'El slug ya existe', 409);
        return;
      }
      
      ApiResponseUtil.error(res, errorMessage, 500);
    }
  };

  deleteConnectionType = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await this.galleryService.deleteConnectionType(id);
      
      ApiResponseUtil.success(res, null, 'Tipo de conexión eliminado exitosamente');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error('Error deleting connection type', { error: errorMessage, connectionTypeId: req.params.id });
      
      if (errorMessage === GalleryErrorCodes.CONNECTION_TYPE_NOT_FOUND) {
        ApiResponseUtil.error(res, 'Tipo de conexión no encontrado', 404);
        return;
      }
      if (errorMessage === GalleryErrorCodes.CONNECTION_TYPE_HAS_TEMPLATES) {
        ApiResponseUtil.error(res, 'No se puede eliminar el tipo de conexión porque tiene plantillas asociadas', 400);
        return;
      }
      
      ApiResponseUtil.error(res, errorMessage, 500);
    }
  };

  // ===== PLANTILLAS DE CONEXIÓN =====

  createConnectionTemplate = async (req: Request, res: Response): Promise<void> => {
    try {
      const validationResult = CreateConnectionTemplateSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        ApiResponseUtil.validationError(res, validationResult.error.errors);
        return;
      }

      const template = await this.galleryService.createConnectionTemplate(validationResult.data);
      
      ApiResponseUtil.success(res, template, 'Plantilla de conexión creada exitosamente', 201);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error('Error creating connection template', { error: errorMessage, body: req.body });
      
      if (errorMessage === GalleryErrorCodes.SLUG_ALREADY_EXISTS) {
        ApiResponseUtil.error(res, 'El slug ya existe', 409);
        return;
      }
      
      ApiResponseUtil.error(res, errorMessage, 500);
    }
  };

  getConnectionTemplates = async (req: Request, res: Response): Promise<void> => {
    try {
      const connectionTypeId = req.query.connectionTypeId as string;
      const templates = await this.galleryService.getConnectionTemplates(connectionTypeId);
      
      ApiResponseUtil.success(res, templates, 'Plantillas de conexión obtenidas exitosamente');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error('Error getting connection templates', { error: errorMessage });
      ApiResponseUtil.error(res, errorMessage, 500);
    }
  };

  getConnectionTemplateById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const template = await this.galleryService.getConnectionTemplateById(id);
      
      ApiResponseUtil.success(res, template, 'Plantilla de conexión obtenida exitosamente');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error('Error getting connection template by ID', { error: errorMessage, templateId: req.params.id });
      
      if (errorMessage === GalleryErrorCodes.TEMPLATE_NOT_FOUND) {
        ApiResponseUtil.error(res, 'Plantilla de conexión no encontrada', 404);
        return;
      }
      
      ApiResponseUtil.error(res, errorMessage, 500);
    }
  };

  downloadConnectionTemplate = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const workflowData = await this.galleryService.downloadConnectionTemplate(id);
      
      // Configurar headers para descarga
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="connection-template-${id}.json"`);
      
      res.status(200).send(workflowData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error('Error downloading connection template', { error: errorMessage, templateId: req.params.id });
      
      if (errorMessage === GalleryErrorCodes.TEMPLATE_NOT_FOUND) {
        ApiResponseUtil.error(res, 'Plantilla de conexión no encontrada', 404);
        return;
      }
      
      ApiResponseUtil.error(res, errorMessage, 500);
    }
  };

  // ===== AGENTES =====

  createAgent = async (req: Request, res: Response): Promise<void> => {
    try {
      const validationResult = CreateAgentSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        ApiResponseUtil.validationError(res, validationResult.error.errors);
        return;
      }

      const agent = await this.galleryService.createAgent(validationResult.data);
      
      ApiResponseUtil.success(res, agent, 'Agente creado exitosamente', 201);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error('Error creating agent', { error: errorMessage, body: req.body });
      
      if (errorMessage === GalleryErrorCodes.SLUG_ALREADY_EXISTS) {
        ApiResponseUtil.error(res, 'El slug ya existe', 409);
        return;
      }
      
      ApiResponseUtil.error(res, errorMessage, 500);
    }
  };

  getAgents = async (req: Request, res: Response): Promise<void> => {
    try {
      const validationResult = GalleryFiltersSchema.safeParse({
        ...req.query,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
        isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
        isFeatured: req.query.isFeatured === 'true' ? true : req.query.isFeatured === 'false' ? false : undefined
      });
      
      if (!validationResult.success) {
        ApiResponseUtil.validationError(res, validationResult.error.errors);
        return;
      }
      
      const agents = await this.galleryService.getAgents(validationResult.data);
      
      ApiResponseUtil.success(res, agents, 'Agentes obtenidos exitosamente');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error('Error getting agents', { error: errorMessage });
      ApiResponseUtil.error(res, errorMessage, 500);
    }
  };

  getAgentById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const agent = await this.galleryService.getAgentById(id);
      
      ApiResponseUtil.success(res, agent, 'Agente obtenido exitosamente');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error('Error getting agent by ID', { error: errorMessage, agentId: req.params.id });
      
      if (errorMessage === GalleryErrorCodes.AGENT_NOT_FOUND) {
        ApiResponseUtil.error(res, 'Agente no encontrado', 404);
        return;
      }
      
      ApiResponseUtil.error(res, errorMessage, 500);
    }
  };

  getAgentBySlug = async (req: Request, res: Response): Promise<void> => {
    try {
      const { slug } = req.params;
      const agent = await this.galleryService.getAgentBySlug(slug);
      
      ApiResponseUtil.success(res, agent, 'Agente obtenido exitosamente');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error('Error getting agent by slug', { error: errorMessage, slug: req.params.slug });
      
      if (errorMessage === GalleryErrorCodes.AGENT_NOT_FOUND) {
        ApiResponseUtil.error(res, 'Agente no encontrado', 404);
        return;
      }
      
      ApiResponseUtil.error(res, errorMessage, 500);
    }
  };

  downloadAgentTemplate = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const workflowData = await this.galleryService.downloadAgentTemplate(id);
      
      // Configurar headers para descarga
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="agent-template-${id}.json"`);
      
      res.status(200).send(workflowData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error('Error downloading agent template', { error: errorMessage, agentId: req.params.id });
      
      if (errorMessage === GalleryErrorCodes.AGENT_NOT_FOUND) {
        ApiResponseUtil.error(res, 'Agente no encontrado', 404);
        return;
      }
      
      ApiResponseUtil.error(res, errorMessage, 500);
    }
  };

  updateAgent = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const validationResult = UpdateAgentSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        ApiResponseUtil.validationError(res, validationResult.error.errors);
        return;
      }

      const agent = await this.galleryService.updateAgent(id, validationResult.data);
      
      ApiResponseUtil.success(res, agent, 'Agente actualizado exitosamente');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error('Error updating agent', { error: errorMessage, agentId: req.params.id });
      
      if (errorMessage === GalleryErrorCodes.AGENT_NOT_FOUND) {
        ApiResponseUtil.error(res, 'Agente no encontrado', 404);
        return;
      }
      if (errorMessage === GalleryErrorCodes.SLUG_ALREADY_EXISTS) {
        ApiResponseUtil.error(res, 'El slug ya existe', 409);
        return;
      }
      
      ApiResponseUtil.error(res, errorMessage, 500);
    }
  };

  deleteAgent = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await this.galleryService.deleteAgent(id);
      
      ApiResponseUtil.success(res, null, 'Agente eliminado exitosamente');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error('Error deleting agent', { error: errorMessage, agentId: req.params.id });
      
      if (errorMessage === GalleryErrorCodes.AGENT_NOT_FOUND) {
        ApiResponseUtil.error(res, 'Agente no encontrado', 404);
        return;
      }
      
      ApiResponseUtil.error(res, errorMessage, 500);
    }
  };
} 