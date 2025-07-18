import { PrismaClient } from '@prisma/client';
import { 
  CreateAgentCategoryInput, 
  UpdateAgentCategoryInput,
  CreateConnectionTypeInput,
  UpdateConnectionTypeInput,
  CreateConnectionTemplateInput,
  UpdateConnectionTemplateInput,
  CreateAgentInput,
  UpdateAgentInput,
  GalleryFilters,
  GalleryStatsParams,
  AgentCategoryResponse,
  ConnectionTypeResponse,
  ConnectionTemplateResponse,
  AgentResponse,
  AgentDetailResponse,
  PaginatedGalleryResponse,
  GalleryStatsResponse,
  GalleryOverviewResponse,
  GalleryErrorCodes,
  DEFAULT_GALLERY_FILTERS,
  DEPLOYMENT_TIME_RANGES
} from './gallery.types';
import { Logger } from '../../shared/utils/logger';

export class GalleryService {
  private prisma: PrismaClient;
  private logger: Logger;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.logger = Logger.getInstance();
  }

  // Función auxiliar para manejo de errores
  private handleError(operation: string, error: unknown, context?: Record<string, any>): never {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    this.logger.error(`Error ${operation}`, { 
      error: errorMessage,
      ...context 
    });
    throw error;
  }

  // ===== CATEGORÍAS DE AGENTES =====

  async createAgentCategory(data: CreateAgentCategoryInput): Promise<AgentCategoryResponse> {
    try {
      const existingCategory = await this.prisma.agentCategory.findUnique({
        where: { slug: data.slug }
      });

      if (existingCategory) {
        throw new Error(GalleryErrorCodes.SLUG_ALREADY_EXISTS);
      }

      const category = await this.prisma.agentCategory.create({
        data: {
          ...data,
          // Asegurar que el slug sea único
          slug: data.slug.toLowerCase().replace(/\s+/g, '-')
        }
      });

      return this.mapCategoryToResponse(category);
    } catch (error) {
      const errorMessage = error instanceof Error ? (error instanceof Error ? error.message : 'Error desconocido') : 'Error desconocido';
      this.logger.error('Error creating agent category', { error: errorMessage, data });
      throw error;
    }
  }

  async getAgentCategories(includeInactive: boolean = false): Promise<AgentCategoryResponse[]> {
    try {
      const categories = await this.prisma.agentCategory.findMany({
        where: includeInactive ? {} : { isActive: true },
        include: {
          _count: {
            select: { agents: true }
          }
        },
        orderBy: [
          { sortOrder: 'asc' },
          { name: 'asc' }
        ]
      });

      return categories.map(cat => this.mapCategoryToResponse(cat));
    } catch (error) {
      const errorMessage = error instanceof Error ? (error instanceof Error ? error.message : 'Error desconocido') : 'Error desconocido';
      this.logger.error('Error fetching agent categories', { error: errorMessage });
      throw error;
    }
  }

  async getAgentCategoryById(id: string): Promise<AgentCategoryResponse> {
    try {
      const category = await this.prisma.agentCategory.findUnique({
        where: { id },
        include: {
          _count: {
            select: { agents: true }
          }
        }
      });

      if (!category) {
        throw new Error(GalleryErrorCodes.CATEGORY_NOT_FOUND);
      }

      return this.mapCategoryToResponse(category);
    } catch (error) {
      const errorMessage = error instanceof Error ? (error instanceof Error ? error.message : 'Error desconocido') : 'Error desconocido';
      this.logger.error('Error fetching agent category', { error: errorMessage, id });
      throw error;
    }
  }

  async updateAgentCategory(id: string, data: UpdateAgentCategoryInput): Promise<AgentCategoryResponse> {
    try {
      const category = await this.prisma.agentCategory.findUnique({
        where: { id }
      });

      if (!category) {
        throw new Error(GalleryErrorCodes.CATEGORY_NOT_FOUND);
      }

      if (data.slug && data.slug !== category.slug) {
        const existingCategory = await this.prisma.agentCategory.findUnique({
          where: { slug: data.slug }
        });

        if (existingCategory) {
          throw new Error(GalleryErrorCodes.SLUG_ALREADY_EXISTS);
        }
      }

      const updatedCategory = await this.prisma.agentCategory.update({
        where: { id },
        data: {
          ...data,
          slug: data.slug ? data.slug.toLowerCase().replace(/\s+/g, '-') : undefined
        },
        include: {
          _count: {
            select: { agents: true }
          }
        }
      });

      return this.mapCategoryToResponse(updatedCategory);
    } catch (error) {
      this.logger.error('Error updating agent category', { error: (error instanceof Error ? error.message : 'Error desconocido'), id, data });
      throw error;
    }
  }

  async deleteAgentCategory(id: string): Promise<void> {
    try {
      const category = await this.prisma.agentCategory.findUnique({
        where: { id },
        include: {
          _count: {
            select: { agents: true }
          }
        }
      });

      if (!category) {
        throw new Error(GalleryErrorCodes.CATEGORY_NOT_FOUND);
      }

      if (category._count.agents > 0) {
        throw new Error(GalleryErrorCodes.CATEGORY_HAS_AGENTS);
      }

      await this.prisma.agentCategory.delete({
        where: { id }
      });
    } catch (error) {
      this.logger.error('Error deleting agent category', { error: (error instanceof Error ? error.message : 'Error desconocido'), id });
      throw error;
    }
  }

  // ===== TIPOS DE CONEXIÓN =====

  async createConnectionType(data: CreateConnectionTypeInput): Promise<ConnectionTypeResponse> {
    try {
      const existingType = await this.prisma.connectionType.findUnique({
        where: { slug: data.slug }
      });

      if (existingType) {
        throw new Error(GalleryErrorCodes.SLUG_ALREADY_EXISTS);
      }

      const connectionType = await this.prisma.connectionType.create({
        data: {
          ...data,
          slug: data.slug.toLowerCase().replace(/\s+/g, '-')
        }
      });

      return this.mapConnectionTypeToResponse(connectionType);
    } catch (error) {
      this.logger.error('Error creating connection type', { error: (error instanceof Error ? error.message : 'Error desconocido'), data });
      throw error;
    }
  }

  async getConnectionTypes(includeInactive: boolean = false): Promise<ConnectionTypeResponse[]> {
    try {
      const types = await this.prisma.connectionType.findMany({
        where: includeInactive ? {} : { isActive: true },
        include: {
          _count: {
            select: { templates: true }
          }
        },
        orderBy: [
          { sortOrder: 'asc' },
          { name: 'asc' }
        ]
      });

      return types.map(type => this.mapConnectionTypeToResponse(type));
    } catch (error) {
      this.logger.error('Error fetching connection types', { error: (error instanceof Error ? error.message : 'Error desconocido') });
      throw error;
    }
  }

  async getConnectionTypeById(id: string): Promise<ConnectionTypeResponse> {
    try {
      const type = await this.prisma.connectionType.findUnique({
        where: { id },
        include: {
          _count: {
            select: { templates: true }
          }
        }
      });

      if (!type) {
        throw new Error(GalleryErrorCodes.CONNECTION_TYPE_NOT_FOUND);
      }

      return this.mapConnectionTypeToResponse(type);
    } catch (error) {
      this.logger.error('Error fetching connection type', { error: (error instanceof Error ? error.message : 'Error desconocido'), id });
      throw error;
    }
  }

  async updateConnectionType(id: string, data: UpdateConnectionTypeInput): Promise<ConnectionTypeResponse> {
    try {
      const type = await this.prisma.connectionType.findUnique({
        where: { id }
      });

      if (!type) {
        throw new Error(GalleryErrorCodes.CONNECTION_TYPE_NOT_FOUND);
      }

      if (data.slug && data.slug !== type.slug) {
        const existingType = await this.prisma.connectionType.findUnique({
          where: { slug: data.slug }
        });

        if (existingType) {
          throw new Error(GalleryErrorCodes.SLUG_ALREADY_EXISTS);
        }
      }

      const updatedType = await this.prisma.connectionType.update({
        where: { id },
        data: {
          ...data,
          slug: data.slug ? data.slug.toLowerCase().replace(/\s+/g, '-') : undefined
        },
        include: {
          _count: {
            select: { templates: true }
          }
        }
      });

      return this.mapConnectionTypeToResponse(updatedType);
    } catch (error) {
      this.logger.error('Error updating connection type', { error: (error instanceof Error ? error.message : 'Error desconocido'), id, data });
      throw error;
    }
  }

  async deleteConnectionType(id: string): Promise<void> {
    try {
      const type = await this.prisma.connectionType.findUnique({
        where: { id },
        include: {
          _count: {
            select: { templates: true }
          }
        }
      });

      if (!type) {
        throw new Error(GalleryErrorCodes.CONNECTION_TYPE_NOT_FOUND);
      }

      if (type._count.templates > 0) {
        throw new Error(GalleryErrorCodes.CONNECTION_TYPE_HAS_TEMPLATES);
      }

      await this.prisma.connectionType.delete({
        where: { id }
      });
    } catch (error) {
      this.logger.error('Error deleting connection type', { error: (error instanceof Error ? error.message : 'Error desconocido'), id });
      throw error;
    }
  }

  // ===== PLANTILLAS DE CONEXIÓN =====

  async createConnectionTemplate(data: CreateConnectionTemplateInput): Promise<ConnectionTemplateResponse> {
    try {
      const existingTemplate = await this.prisma.connectionTemplate.findUnique({
        where: { slug: data.slug }
      });

      if (existingTemplate) {
        throw new Error(GalleryErrorCodes.SLUG_ALREADY_EXISTS);
      }

      const template = await this.prisma.connectionTemplate.create({
        data: {
          ...data,
          slug: data.slug.toLowerCase().replace(/\s+/g, '-')
        },
        include: {
          connectionType: true
        }
      });

      return this.mapConnectionTemplateToResponse(template);
    } catch (error) {
      this.logger.error('Error creating connection template', { error: (error instanceof Error ? error.message : 'Error desconocido'), data });
      throw error;
    }
  }

  async getConnectionTemplates(connectionTypeId?: string): Promise<ConnectionTemplateResponse[]> {
    try {
      const templates = await this.prisma.connectionTemplate.findMany({
        where: {
          isActive: true,
          ...(connectionTypeId && { connectionTypeId })
        },
        include: {
          connectionType: true
        },
        orderBy: [
          { createdAt: 'desc' }
        ]
      });

      return templates.map(template => this.mapConnectionTemplateToResponse(template));
    } catch (error) {
      this.logger.error('Error fetching connection templates', { error: (error instanceof Error ? error.message : 'Error desconocido'), connectionTypeId });
      throw error;
    }
  }

  async getConnectionTemplateById(id: string): Promise<ConnectionTemplateResponse> {
    try {
      const template = await this.prisma.connectionTemplate.findUnique({
        where: { id },
        include: {
          connectionType: true
        }
      });

      if (!template) {
        throw new Error(GalleryErrorCodes.TEMPLATE_NOT_FOUND);
      }

      return this.mapConnectionTemplateToResponse(template);
    } catch (error) {
      this.logger.error('Error fetching connection template', { error: (error instanceof Error ? error.message : 'Error desconocido'), id });
      throw error;
    }
  }

  async downloadConnectionTemplate(id: string): Promise<any> {
    try {
      const template = await this.prisma.connectionTemplate.findUnique({
        where: { id, isActive: true }
      });

      if (!template) {
        throw new Error(GalleryErrorCodes.TEMPLATE_NOT_FOUND);
      }

      // Incrementar contador de descargas
      await this.prisma.connectionTemplate.update({
        where: { id },
        data: {
          downloadCount: {
            increment: 1
          }
        }
      });

      return template.n8nWorkflow;
    } catch (error) {
      this.logger.error('Error downloading connection template', { error: (error instanceof Error ? error.message : 'Error desconocido'), id });
      throw error;
    }
  }

  // ===== AGENTES =====

  async createAgent(data: CreateAgentInput): Promise<AgentResponse> {
    try {
      const existingAgent = await this.prisma.agent.findUnique({
        where: { slug: data.slug }
      });

      if (existingAgent) {
        throw new Error(GalleryErrorCodes.SLUG_ALREADY_EXISTS);
      }

      const agent = await this.prisma.agent.create({
        data: {
          ...data,
          slug: data.slug.toLowerCase().replace(/\s+/g, '-'),
          estimatedTime: data.estimatedTime || DEPLOYMENT_TIME_RANGES[data.complexity || 'medium']
        },
        include: {
          category: true
        }
      });

      return this.mapAgentToResponse(agent);
    } catch (error) {
      this.logger.error('Error creating agent', { error: (error instanceof Error ? error.message : 'Error desconocido'), data });
      throw error;
    }
  }

  async getAgents(filters: GalleryFilters = DEFAULT_GALLERY_FILTERS): Promise<PaginatedGalleryResponse<AgentResponse>> {
    try {
      const where: any = {
        isActive: filters.isActive ?? true
      };

      // Aplicar filtros
      if (filters.search) {
        where.OR = [
          { title: { contains: filters.search, mode: 'insensitive' } },
          { name: { contains: filters.search, mode: 'insensitive' } },
          { shortDescription: { contains: filters.search, mode: 'insensitive' } },
          { challenge: { contains: filters.search, mode: 'insensitive' } }
        ];
      }

      if (filters.category) {
        where.category = {
          slug: filters.category
        };
      }

      if (filters.complexity) {
        where.complexity = filters.complexity;
      }

      if (filters.isFeatured !== undefined) {
        where.isFeatured = filters.isFeatured;
      }

      const skip = (filters.page - 1) * filters.limit;
      const orderBy: any = {};
      orderBy[filters.sortBy] = filters.sortOrder;

      const [agents, total] = await Promise.all([
        this.prisma.agent.findMany({
          where,
          include: {
            category: true
          },
          skip,
          take: filters.limit,
          orderBy
        }),
        this.prisma.agent.count({ where })
      ]);

      return {
        items: agents.map(agent => this.mapAgentToResponse(agent)),
        pagination: {
          total,
          page: filters.page,
          limit: filters.limit,
          pages: Math.ceil(total / filters.limit)
        },
        filters
      };
    } catch (error) {
      this.logger.error('Error fetching agents', { error: (error instanceof Error ? error.message : 'Error desconocido'), filters });
      throw error;
    }
  }

  async getAgentById(id: string): Promise<AgentResponse> {
    try {
      const agent = await this.prisma.agent.findUnique({
        where: { id },
        include: {
          category: true
        }
      });

      if (!agent) {
        throw new Error(GalleryErrorCodes.AGENT_NOT_FOUND);
      }

      return this.mapAgentToResponse(agent);
    } catch (error) {
      this.logger.error('Error fetching agent', { error: (error instanceof Error ? error.message : 'Error desconocido'), id });
      throw error;
    }
  }

  async getAgentBySlug(slug: string): Promise<AgentDetailResponse> {
    try {
      const agent = await this.prisma.agent.findUnique({
        where: { slug, isActive: true },
        include: {
          category: true
        }
      });

      if (!agent) {
        throw new Error(GalleryErrorCodes.AGENT_NOT_FOUND);
      }

      // Obtener agentes relacionados de la misma categoría
      const relatedAgents = await this.prisma.agent.findMany({
        where: {
          categoryId: agent.categoryId,
          id: { not: agent.id },
          isActive: true
        },
        include: {
          category: true
        },
        take: 3,
        orderBy: {
          usageCount: 'desc'
        }
      });

      return {
        ...this.mapAgentToResponse(agent),
        relatedAgents: relatedAgents.map(a => this.mapAgentToResponse(a))
      };
    } catch (error) {
      this.logger.error('Error fetching agent by slug', { error: (error instanceof Error ? error.message : 'Error desconocido'), slug });
      throw error;
    }
  }

  async downloadAgentTemplate(id: string): Promise<any> {
    try {
      const agent = await this.prisma.agent.findUnique({
        where: { id, isActive: true }
      });

      if (!agent) {
        throw new Error(GalleryErrorCodes.AGENT_NOT_FOUND);
      }

      // Incrementar contador de uso
      await this.prisma.agent.update({
        where: { id },
        data: {
          usageCount: {
            increment: 1
          }
        }
      });

      return agent.n8nWorkflow;
    } catch (error) {
      this.logger.error('Error downloading agent template', { error: (error instanceof Error ? error.message : 'Error desconocido'), id });
      throw error;
    }
  }

  async updateAgent(id: string, data: UpdateAgentInput): Promise<AgentResponse> {
    try {
      const agent = await this.prisma.agent.findUnique({
        where: { id }
      });

      if (!agent) {
        throw new Error(GalleryErrorCodes.AGENT_NOT_FOUND);
      }

      if (data.slug && data.slug !== agent.slug) {
        const existingAgent = await this.prisma.agent.findUnique({
          where: { slug: data.slug }
        });

        if (existingAgent) {
          throw new Error(GalleryErrorCodes.SLUG_ALREADY_EXISTS);
        }
      }

      const updatedAgent = await this.prisma.agent.update({
        where: { id },
        data: {
          ...data,
          slug: data.slug ? data.slug.toLowerCase().replace(/\s+/g, '-') : undefined
        },
        include: {
          category: true
        }
      });

      return this.mapAgentToResponse(updatedAgent);
    } catch (error) {
      this.logger.error('Error updating agent', { error: (error instanceof Error ? error.message : 'Error desconocido'), id, data });
      throw error;
    }
  }

  async deleteAgent(id: string): Promise<void> {
    try {
      const agent = await this.prisma.agent.findUnique({
        where: { id }
      });

      if (!agent) {
        throw new Error(GalleryErrorCodes.AGENT_NOT_FOUND);
      }

      await this.prisma.agent.delete({
        where: { id }
      });
    } catch (error) {
      this.logger.error('Error deleting agent', { error: (error instanceof Error ? error.message : 'Error desconocido'), id });
      throw error;
    }
  }

  // ===== ESTADÍSTICAS Y OVERVIEW =====

  async getGalleryOverview(): Promise<GalleryOverviewResponse> {
    try {
      const [
        totalAgents,
        totalTemplates,
        totalCategories,
        connectionTypes,
        featuredAgents,
        recentAgents,
        categories
      ] = await Promise.all([
        this.prisma.agent.count({ where: { isActive: true } }),
        this.prisma.connectionTemplate.count({ where: { isActive: true } }),
        this.prisma.agentCategory.count({ where: { isActive: true } }),
        this.getConnectionTypes(),
        this.prisma.agent.findMany({
          where: { isActive: true, isFeatured: true },
          include: { category: true },
          take: 6,
          orderBy: { usageCount: 'desc' }
        }),
        this.prisma.agent.findMany({
          where: { isActive: true },
          include: { category: true },
          take: 6,
          orderBy: { createdAt: 'desc' }
        }),
        this.getAgentCategories()
      ]);

      return {
        stats: {
          totalAgents,
          totalTemplates,
          totalCategories,
          averageDeploymentTime: '1-3'
        },
        connectionTypes,
        featuredAgents: featuredAgents.map(agent => this.mapAgentToResponse(agent)),
        recentAgents: recentAgents.map(agent => this.mapAgentToResponse(agent)),
        categories
      };
    } catch (error) {
      this.logger.error('Error fetching gallery overview', { error: (error instanceof Error ? error.message : 'Error desconocido') });
      throw error;
    }
  }

  async getGalleryStats(params: GalleryStatsParams): Promise<GalleryStatsResponse> {
    try {
      const [
        totalAgents,
        totalTemplates,
        totalCategories,
        totalConnectionTypes,
        activeAgents,
        featuredAgents,
        agentsByCategory,
        agentsByComplexity,
        templatesByConnectionType,
        totalDownloads,
        totalUsage,
        topAgents,
        topTemplates
      ] = await Promise.all([
        this.prisma.agent.count(),
        this.prisma.connectionTemplate.count(),
        this.prisma.agentCategory.count(),
        this.prisma.connectionType.count(),
        this.prisma.agent.count({ where: { isActive: true } }),
        this.prisma.agent.count({ where: { isActive: true, isFeatured: true } }),
        this.getAgentsByCategory(),
        this.getAgentsByComplexity(),
        this.getTemplatesByConnectionType(),
        this.getTotalDownloads(),
        this.getTotalUsage(),
        this.getTopAgents(),
        this.getTopTemplates()
      ]);

      return {
        overview: {
          totalAgents,
          totalTemplates,
          totalCategories,
          totalConnectionTypes,
          activeAgents,
          featuredAgents
        },
        agentsByCategory,
        agentsByComplexity,
        templatesByConnectionType,
        usageStats: {
          totalDownloads,
          totalUsage,
          averageUsagePerAgent: totalAgents > 0 ? Math.round(totalUsage / totalAgents) : 0
        },
        timeSeriesData: [], // Implementar según necesidades
        topAgents,
        topTemplates
      };
    } catch (error) {
      this.logger.error('Error fetching gallery stats', { error: (error instanceof Error ? error.message : 'Error desconocido'), params });
      throw error;
    }
  }

  // ===== MÉTODOS PRIVADOS =====

  private mapCategoryToResponse(category: any): AgentCategoryResponse {
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      icon: category.icon,
      color: category.color,
      sortOrder: category.sortOrder,
      isActive: category.isActive,
      agentsCount: category._count?.agents || 0,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt
    };
  }

  private mapConnectionTypeToResponse(type: any): ConnectionTypeResponse {
    return {
      id: type.id,
      name: type.name,
      slug: type.slug,
      title: type.title,
      description: type.description,
      icon: type.icon,
      advantages: type.advantages,
      useCases: type.useCases,
      examples: type.examples,
      sortOrder: type.sortOrder,
      isActive: type.isActive,
      templatesCount: type._count?.templates || 0,
      createdAt: type.createdAt,
      updatedAt: type.updatedAt
    };
  }

  private mapConnectionTemplateToResponse(template: any): ConnectionTemplateResponse {
    return {
      id: template.id,
      connectionTypeId: template.connectionTypeId,
      connectionType: {
        id: template.connectionType.id,
        name: template.connectionType.name,
        slug: template.connectionType.slug,
        title: template.connectionType.title,
        icon: template.connectionType.icon
      },
      name: template.name,
      slug: template.slug,
      description: template.description,
      n8nWorkflow: template.n8nWorkflow,
      workflowNodes: template.workflowNodes,
      nodeDescription: template.nodeDescription,
      recommendation: template.recommendation,
      version: template.version,
      isActive: template.isActive,
      downloadCount: template.downloadCount,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt
    };
  }

  private mapAgentToResponse(agent: any): AgentResponse {
    return {
      id: agent.id,
      categoryId: agent.categoryId,
      category: {
        id: agent.category.id,
        name: agent.category.name,
        slug: agent.category.slug,
        icon: agent.category.icon,
        color: agent.category.color
      },
      name: agent.name,
      slug: agent.slug,
      title: agent.title,
      shortDescription: agent.shortDescription,
      challenge: agent.challenge,
      solution: agent.solution,
      features: agent.features,
      icon: agent.icon,
      n8nWorkflow: agent.n8nWorkflow,
      version: agent.version,
      complexity: agent.complexity,
      estimatedTime: agent.estimatedTime,
      requirements: agent.requirements,
      tags: agent.tags,
      isActive: agent.isActive,
      isFeatured: agent.isFeatured,
      usageCount: agent.usageCount,
      createdAt: agent.createdAt,
      updatedAt: agent.updatedAt
    };
  }

  private async getAgentsByCategory(): Promise<Record<string, number>> {
    const result = await this.prisma.agent.groupBy({
      by: ['categoryId'],
      where: { isActive: true },
      _count: { id: true }
    });

    const categories = await this.prisma.agentCategory.findMany({
      where: { id: { in: result.map(r => r.categoryId) } }
    });

    const categoryMap = categories.reduce((acc, cat) => {
      acc[cat.id] = cat.name;
      return acc;
    }, {} as Record<string, string>);

    return result.reduce((acc, item) => {
      acc[categoryMap[item.categoryId]] = item._count.id;
      return acc;
    }, {} as Record<string, number>);
  }

  private async getAgentsByComplexity(): Promise<Record<string, number>> {
    const result = await this.prisma.agent.groupBy({
      by: ['complexity'],
      where: { isActive: true },
      _count: { id: true }
    });

    return result.reduce((acc, item) => {
      acc[item.complexity] = item._count.id;
      return acc;
    }, {} as Record<string, number>);
  }

  private async getTemplatesByConnectionType(): Promise<Record<string, number>> {
    const result = await this.prisma.connectionTemplate.groupBy({
      by: ['connectionTypeId'],
      where: { isActive: true },
      _count: { id: true }
    });

    const types = await this.prisma.connectionType.findMany({
      where: { id: { in: result.map(r => r.connectionTypeId) } }
    });

    const typeMap = types.reduce((acc, type) => {
      acc[type.id] = type.name;
      return acc;
    }, {} as Record<string, string>);

    return result.reduce((acc, item) => {
      acc[typeMap[item.connectionTypeId]] = item._count.id;
      return acc;
    }, {} as Record<string, number>);
  }

  private async getTotalDownloads(): Promise<number> {
    const result = await this.prisma.connectionTemplate.aggregate({
      _sum: { downloadCount: true }
    });
    return result._sum.downloadCount || 0;
  }

  private async getTotalUsage(): Promise<number> {
    const result = await this.prisma.agent.aggregate({
      _sum: { usageCount: true }
    });
    return result._sum.usageCount || 0;
  }

  private async getTopAgents(): Promise<Array<{ id: string; name: string; title: string; category: string; usageCount: number }>> {
    const agents = await this.prisma.agent.findMany({
      where: { isActive: true },
      include: { category: true },
      orderBy: { usageCount: 'desc' },
      take: 10
    });

    return agents.map(agent => ({
      id: agent.id,
      name: agent.name,
      title: agent.title,
      category: agent.category.name,
      usageCount: agent.usageCount
    }));
  }

  private async getTopTemplates(): Promise<Array<{ id: string; name: string; connectionType: string; downloadCount: number }>> {
    const templates = await this.prisma.connectionTemplate.findMany({
      where: { isActive: true },
      include: { connectionType: true },
      orderBy: { downloadCount: 'desc' },
      take: 10
    });

    return templates.map(template => ({
      id: template.id,
      name: template.name,
      connectionType: template.connectionType.name,
      downloadCount: template.downloadCount
    }));
  }
} 
