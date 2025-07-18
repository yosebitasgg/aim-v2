import { PrismaClient } from '@prisma/client';
import { 
  CreateCreatedAgentInput,
  UpdateCreatedAgentInput,
  CreateAgentConfigurationInput,
  UpdateAgentConfigurationInput,
  CreateAgentWorkflowInput,
  UpdateAgentWorkflowInput,
  AgentsFilters,
  AgentsStatsParams,
  CreatedAgentResponse,
  AgentConfigurationResponse,
  AgentWorkflowResponse,
  CreatedAgentDetailResponse,
  PaginatedAgentsResponse,
  AgentsStatsResponse,
  AgentsErrorCodes,
  CreatedAgentStatus,
  AgentConnectionType,
  DEFAULT_AGENTS_FILTERS,
  VALID_STATUS_TRANSITIONS
} from './agents.types';
import { Logger } from '../../shared/utils/logger';

export class AgentsService {
  private prisma: any;
  private logger: Logger;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma as any;
    this.logger = Logger.getInstance();
  }

  private handleError(operation: string, error: any, context?: any): never {
    this.logger.error(`Error ${operation}:`, { error, context });
    throw error;
  }

  // Función para generar número de agente único
  private async generateAgentNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `AGT-${year}-`;
    
    const lastAgent = await this.prisma.createdAgent.findFirst({
      where: {
        agentNumber: {
          startsWith: prefix
        }
      },
      orderBy: {
        agentNumber: 'desc'
      }
    });

    let nextNumber = 1;
    if (lastAgent) {
      const lastNumber = parseInt(lastAgent.agentNumber.split('-')[2]);
      nextNumber = lastNumber + 1;
    }

    return `${prefix}${nextNumber.toString().padStart(3, '0')}`;
  }

  // ===== CRUD OPERACIONES PARA AGENTES CREADOS =====

  async createCreatedAgent(data: CreateCreatedAgentInput, createdById: string): Promise<CreatedAgentResponse> {
    try {
      // Verificar que la orden existe
      const order = await this.prisma.order.findUnique({
        where: { id: data.orderId },
        include: {
          client: true
        }
      });

      if (!order) {
        throw new Error(AgentsErrorCodes.ORDER_NOT_FOUND);
      }

      // Verificar que el agente template existe (si se proporciona)
      if (data.templateAgentId) {
        const templateAgent = await this.prisma.agent.findUnique({
          where: { id: data.templateAgentId }
        });

        if (!templateAgent) {
          throw new Error(AgentsErrorCodes.TEMPLATE_AGENT_NOT_FOUND);
        }
      }

      // Verificar que el usuario asignado existe (si se proporciona)
      if (data.assignedToId) {
        const assignedUser = await this.prisma.user.findUnique({
          where: { id: data.assignedToId }
        });

        if (!assignedUser) {
          throw new Error(AgentsErrorCodes.USER_NOT_FOUND);
        }
      }

      // Generar número único de agente
      const agentNumber = await this.generateAgentNumber();

      const createdAgent = await this.prisma.createdAgent.create({
        data: {
          ...data,
          agentNumber,
          createdById,
          status: CreatedAgentStatus.DRAFT
        }
      });

      return this.mapCreatedAgentToResponse(createdAgent);
    } catch (error: any) {
      this.handleError('creating created agent', error, { data, createdById });
    }
  }

  async getCreatedAgents(filters: AgentsFilters): Promise<PaginatedAgentsResponse<CreatedAgentResponse>> {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        status,
        connectionType,
        complexity,
        orderId,
        assignedToId,
        createdById,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = { ...DEFAULT_AGENTS_FILTERS, ...filters };

      // Construir condiciones de filtro
      const where: any = {};

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { purpose: { contains: search, mode: 'insensitive' } },
          { agentNumber: { contains: search, mode: 'insensitive' } }
        ];
      }

      if (status) where.status = status;
      if (connectionType) where.connectionType = connectionType;
      if (complexity) where.complexity = complexity;
      if (orderId) where.orderId = orderId;
      if (assignedToId) where.assignedToId = assignedToId;
      if (createdById) where.createdById = createdById;

      const [total, agents] = await Promise.all([
        this.prisma.createdAgent.count({ where }),
        this.prisma.createdAgent.findMany({
          where,
          include: {
            order: {
              include: {
                client: true
              }
            },
            templateAgent: {
              include: {
                category: true
              }
            },
            createdBy: true,
            assignedTo: true,
            configurations: true,
            workflows: {
              where: { isCurrentVersion: true }
            }
          },
          orderBy: { [sortBy]: sortOrder },
          skip: (page - 1) * limit,
          take: limit
        })
      ]);

      return {
        items: agents.map((agent: any) => this.mapCreatedAgentToResponse(agent)),
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        },
        filters
      };
    } catch (error: any) {
      this.handleError('fetching created agents', error, { filters });
    }
  }

  async getCreatedAgentById(id: string): Promise<CreatedAgentDetailResponse> {
    try {
      const agent = await this.prisma.createdAgent.findUnique({
        where: { id },
        include: {
          order: {
            include: {
              client: true
            }
          },
          templateAgent: {
            include: {
              category: true
            }
          },
          createdBy: true,
          assignedTo: true,
          configurations: {
            where: { isActive: true },
            orderBy: { createdAt: 'desc' }
          },
          workflows: {
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      if (!agent) {
        throw new Error(AgentsErrorCodes.CREATED_AGENT_NOT_FOUND);
      }

      return {
        ...this.mapCreatedAgentToResponse(agent),
        configurations: agent.configurations.map((config: any) => this.mapConfigurationToResponse(config)),
        workflows: agent.workflows.map((workflow: any) => this.mapWorkflowToResponse(workflow))
      };
    } catch (error: any) {
      this.handleError('fetching created agent details', error, { id });
    }
  }

  async updateCreatedAgent(id: string, data: UpdateCreatedAgentInput): Promise<CreatedAgentResponse> {
    try {
      const existingAgent = await this.prisma.createdAgent.findUnique({
        where: { id }
      });

      if (!existingAgent) {
        throw new Error(AgentsErrorCodes.CREATED_AGENT_NOT_FOUND);
      }

      // Validar transición de estado si se está cambiando el status
      if (data.status && data.status !== existingAgent.status) {
        const currentStatus = existingAgent.status as string;
        const validTransitions = VALID_STATUS_TRANSITIONS[currentStatus as keyof typeof VALID_STATUS_TRANSITIONS] || [];
        if (!validTransitions.some((transition: any) => transition === data.status)) {
          throw new Error(AgentsErrorCodes.INVALID_STATUS_TRANSITION);
        }
      }

      // Validar usuario asignado si se está cambiando
      if (data.assignedToId) {
        const assignedUser = await this.prisma.user.findUnique({
          where: { id: data.assignedToId }
        });

        if (!assignedUser) {
          throw new Error(AgentsErrorCodes.USER_NOT_FOUND);
        }
      }

      // Convertir fechas string a Date objects
      const updateData: any = { ...data };
      if (data.startedAt) updateData.startedAt = new Date(data.startedAt);
      if (data.finishedAt) updateData.finishedAt = new Date(data.finishedAt);
      if (data.lastTestDate) updateData.lastTestDate = new Date(data.lastTestDate);
      if (data.deployedAt) updateData.deployedAt = new Date(data.deployedAt);

      const updatedAgent = await this.prisma.createdAgent.update({
        where: { id },
        data: updateData
      });

      return this.mapCreatedAgentToResponse(updatedAgent);
    } catch (error: any) {
      this.handleError('updating agent', error, { id, data });
    }
  }

  async deleteCreatedAgent(id: string): Promise<void> {
    try {
      const agent = await this.prisma.createdAgent.findUnique({
        where: { id },
        include: {
          workflows: {
            where: { isActive: true }
          }
        }
      });

      if (!agent) {
        throw new Error(AgentsErrorCodes.CREATED_AGENT_NOT_FOUND);
      }

      if (agent.workflows.length > 0) {
        throw new Error(AgentsErrorCodes.AGENT_HAS_ACTIVE_WORKFLOWS);
      }

      await this.prisma.createdAgent.delete({
        where: { id }
      });
    } catch (error: any) {
      this.handleError('deleting agent', error, { id });
    }
  }

  // ===== CONFIGURACIONES =====

  async createAgentConfiguration(data: CreateAgentConfigurationInput): Promise<AgentConfigurationResponse> {
    try {
      // Verificar que el agente existe
      const agent = await this.prisma.createdAgent.findUnique({
        where: { id: data.createdAgentId }
      });

      if (!agent) {
        throw new Error(AgentsErrorCodes.CREATED_AGENT_NOT_FOUND);
      }

      // Verificar que no existe una configuración del mismo tipo activa
      const existingConfig = await this.prisma.agentConfiguration.findFirst({
        where: {
          createdAgentId: data.createdAgentId,
          configType: data.configType,
          isActive: true
        }
      });

      if (existingConfig) {
        throw new Error(AgentsErrorCodes.CONFIGURATION_TYPE_EXISTS);
      }

      const configuration = await this.prisma.agentConfiguration.create({
        data
      });

      return this.mapConfigurationToResponse(configuration);
    } catch (error: any) {
      this.handleError('creating configuration', error, { data });
    }
  }

  async updateAgentConfiguration(id: string, data: UpdateAgentConfigurationInput): Promise<AgentConfigurationResponse> {
    try {
      const existingConfig = await this.prisma.agentConfiguration.findUnique({
        where: { id }
      });

      if (!existingConfig) {
        throw new Error(AgentsErrorCodes.CONFIGURATION_NOT_FOUND);
      }

      const updatedConfig = await this.prisma.agentConfiguration.update({
        where: { id },
        data
      });

      return this.mapConfigurationToResponse(updatedConfig);
    } catch (error: any) {
      this.handleError('updating configuration', error, { id, data });
    }
  }

  // ===== WORKFLOWS =====

  async createAgentWorkflow(data: CreateAgentWorkflowInput): Promise<AgentWorkflowResponse> {
    try {
      // Verificar que el agente existe
      const agent = await this.prisma.createdAgent.findUnique({
        where: { id: data.createdAgentId }
      });

      if (!agent) {
        throw new Error(AgentsErrorCodes.CREATED_AGENT_NOT_FOUND);
      }

      // Si es la versión actual, desactivar otras versiones actuales
      if (data.isCurrentVersion) {
        await this.prisma.agentWorkflow.updateMany({
          where: {
            createdAgentId: data.createdAgentId,
            isCurrentVersion: true
          },
          data: {
            isCurrentVersion: false
          }
        });
      }

      // Validar workflow padre si se proporciona
      if (data.parentWorkflowId) {
        const parentWorkflow = await this.prisma.agentWorkflow.findUnique({
          where: { id: data.parentWorkflowId }
        });

        if (!parentWorkflow) {
          throw new Error(AgentsErrorCodes.WORKFLOW_NOT_FOUND);
        }
      }

      const workflow = await this.prisma.agentWorkflow.create({
        data
      });

      return this.mapWorkflowToResponse(workflow);
    } catch (error: any) {
      this.handleError('creating workflow', error, { data });
    }
  }

  async updateAgentWorkflow(id: string, data: UpdateAgentWorkflowInput): Promise<AgentWorkflowResponse> {
    try {
      const existingWorkflow = await this.prisma.agentWorkflow.findUnique({
        where: { id }
      });

      if (!existingWorkflow) {
        throw new Error(AgentsErrorCodes.WORKFLOW_NOT_FOUND);
      }

      // Si se está estableciendo como versión actual, desactivar otras
      if (data.isCurrentVersion) {
        await this.prisma.agentWorkflow.updateMany({
          where: {
            createdAgentId: existingWorkflow.createdAgentId,
            isCurrentVersion: true,
            id: { not: id }
          },
          data: {
            isCurrentVersion: false
          }
        });
      }

      // Convertir fecha string a Date object
      const updateData: any = { ...data };
      if (data.lastTestDate) updateData.lastTestDate = new Date(data.lastTestDate);

      const updatedWorkflow = await this.prisma.agentWorkflow.update({
        where: { id },
        data: updateData
      });

      return this.mapWorkflowToResponse(updatedWorkflow);
    } catch (error: any) {
      this.handleError('updating workflow', error, { id, data });
    }
  }

  // ===== ESTADÍSTICAS =====

  async getAgentsStats(params: AgentsStatsParams = { period: '30d', groupBy: 'day' }): Promise<AgentsStatsResponse> {
    try {
      const { period, groupBy, status, connectionType } = params;
      
      // Calcular fecha de inicio basada en el período
      const now = new Date();
      const startDate = new Date();
      
      switch (period) {
        case '7d':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(now.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(now.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      const where: any = {
        createdAt: {
          gte: startDate
        }
      };

      if (status) where.status = status;
      if (connectionType) where.connectionType = connectionType;

      // Consultas para estadísticas generales
      const [
        totalAgents,
        activeAgents,
        draftAgents,
        finishedAgents,
        agentsByStatus,
        agentsByConnectionType,
        agentsByComplexity
      ] = await Promise.all([
        this.prisma.createdAgent.count({ where }),
        this.prisma.createdAgent.count({ where: { ...where, status: CreatedAgentStatus.ACTIVE } }),
        this.prisma.createdAgent.count({ where: { ...where, status: CreatedAgentStatus.DRAFT } }),
        this.prisma.createdAgent.count({ where: { ...where, status: { in: [CreatedAgentStatus.ACTIVE, CreatedAgentStatus.INACTIVE] } } }),
        this.prisma.createdAgent.groupBy({
          by: ['status'],
          where,
          _count: true
        }),
        this.prisma.createdAgent.groupBy({
          by: ['connectionType'],
          where,
          _count: true
        }),
        this.prisma.createdAgent.groupBy({
          by: ['complexity'],
          where,
          _count: true
        })
      ]);

      // Métricas de rendimiento
      const performanceData = await this.prisma.createdAgent.aggregate({
        where: {
          ...where,
          successRate: { not: null },
          averageExecutionTime: { not: null }
        },
        _avg: {
          successRate: true,
          averageExecutionTime: true,
          actualHours: true
        },
        _sum: {
          totalExecutions: true,
          errorCount: true
        }
      });

      // Top agentes por rendimiento
      const topPerformingAgents = await this.prisma.createdAgent.findMany({
        where: {
          ...where,
          successRate: { not: null },
          totalExecutions: { gt: 0 }
        },
        select: {
          id: true,
          name: true,
          successRate: true,
          totalExecutions: true
        },
        orderBy: [
          { successRate: 'desc' },
          { totalExecutions: 'desc' }
        ],
        take: 10
      });

      // Progreso por órdenes
      const orderProgress = await this.prisma.order.findMany({
        where: {
          createdAgents: {
            some: {}
          }
        },
        select: {
          id: true,
          orderNumber: true,
          title: true,
          client: {
            select: {
              id: true,
              companyName: true
            }
          },
          _count: {
            select: {
              createdAgents: true
            }
          },
          createdAgents: {
            where: {
              status: { in: [CreatedAgentStatus.ACTIVE, CreatedAgentStatus.INACTIVE] }
            },
            select: {
              id: true,
              status: true
            }
          }
        }
      });

      return {
        overview: {
          totalAgents,
          activeAgents,
          draftAgents,
          finishedAgents,
          averageHours: performanceData._avg.actualHours || 0,
          successRate: performanceData._avg.successRate || 0
        },
        agentsByStatus: agentsByStatus.reduce((acc: any, item: any) => {
          acc[item.status] = item._count;
          return acc;
        }, {} as Record<string, number>),
        agentsByConnectionType: agentsByConnectionType.reduce((acc: any, item: any) => {
          acc[item.connectionType] = item._count;
          return acc;
        }, {} as Record<string, number>),
        agentsByComplexity: agentsByComplexity.reduce((acc: any, item: any) => {
          acc[item.complexity] = item._count;
          return acc;
        }, {} as Record<string, number>),
        performanceMetrics: {
          averageExecutionTime: performanceData._avg.averageExecutionTime || 0,
          totalExecutions: performanceData._sum.totalExecutions || 0,
          totalErrors: performanceData._sum.errorCount || 0,
          errorRate: performanceData._sum.totalExecutions ? 
            ((performanceData._sum.errorCount || 0) / performanceData._sum.totalExecutions) * 100 : 0
        },
        timeSeriesData: [], // TODO: Implementar datos de series temporales
        topPerformingAgents: topPerformingAgents.map((agent: any) => ({
          id: agent.id,
          name: agent.name,
          successRate: agent.successRate || 0,
          totalExecutions: agent.totalExecutions
        })),
        orderProgress: orderProgress.map((order: any) => ({
          orderId: order.id,
          orderNumber: order.orderNumber,
          clientName: order.client.companyName,
          agentsCount: order._count.createdAgents,
          completedAgents: order.createdAgents.length,
          progressPercentage: order._count.createdAgents > 0 ? 
            (order.createdAgents.length / order._count.createdAgents) * 100 : 0
        }))
      };
    } catch (error: any) {
      this.handleError('fetching agents stats', error, { params });
    }
  }

  // ===== FUNCIONES AUXILIARES DE MAPEO =====

  private mapCreatedAgentToResponse(agent: any): CreatedAgentResponse {
    return {
      id: agent.id,
      agentNumber: agent.agentNumber,
      orderId: agent.orderId,
      order: agent.order ? {
        id: agent.order.id,
        orderNumber: agent.order.orderNumber,
        title: agent.order.title,
        client: {
          id: agent.order.client.id,
          companyName: agent.order.client.companyName
        }
      } : undefined,
      templateAgentId: agent.templateAgentId,
      templateAgent: agent.templateAgent ? {
        id: agent.templateAgent.id,
        name: agent.templateAgent.name,
        title: agent.templateAgent.title,
        category: {
          name: agent.templateAgent.category.name
        }
      } : undefined,
      createdById: agent.createdById,
      createdBy: agent.createdBy ? {
        id: agent.createdBy.id,
        name: agent.createdBy.name,
        email: agent.createdBy.email
      } : undefined,
      assignedToId: agent.assignedToId,
      assignedTo: agent.assignedTo ? {
        id: agent.assignedTo.id,
        name: agent.assignedTo.name,
        email: agent.assignedTo.email
      } : undefined,
      name: agent.name,
      description: agent.description,
      purpose: agent.purpose,
      status: agent.status,
      connectionType: agent.connectionType,
      estimatedHours: agent.estimatedHours,
      actualHours: agent.actualHours,
      complexity: agent.complexity,
      version: agent.version,
      developmentNotes: agent.developmentNotes,
      testingNotes: agent.testingNotes,
      deploymentNotes: agent.deploymentNotes,
      startedAt: agent.startedAt,
      finishedAt: agent.finishedAt,
      lastTestDate: agent.lastTestDate,
      deployedAt: agent.deployedAt,
      successRate: agent.successRate,
      averageExecutionTime: agent.averageExecutionTime,
      totalExecutions: agent.totalExecutions,
      errorCount: agent.errorCount,
      createdAt: agent.createdAt,
      updatedAt: agent.updatedAt,
      configurationsCount: agent._count?.configurations || 0,
      workflowsCount: agent._count?.workflows || 0
    };
  }

  private mapConfigurationToResponse(config: any): AgentConfigurationResponse {
    // Filtrar datos sensibles de autenticación en respuestas
    const safeConfig = { ...config };
    if (safeConfig.authenticationData) {
      safeConfig.authenticationData = { hasData: true }; // Solo indicar que tiene datos
    }

    return {
      id: safeConfig.id,
      createdAgentId: safeConfig.createdAgentId,
      configName: safeConfig.configName,
      configType: safeConfig.configType,
      configData: safeConfig.configData,
      connectionSettings: safeConfig.connectionSettings,
      authenticationData: safeConfig.authenticationData,
      schedulingConfig: safeConfig.schedulingConfig,
      errorHandling: safeConfig.errorHandling,
      notificationSettings: safeConfig.notificationSettings,
      selectedNodes: safeConfig.selectedNodes,
      customNodes: safeConfig.customNodes,
      isActive: safeConfig.isActive,
      version: safeConfig.version,
      createdAt: safeConfig.createdAt,
      updatedAt: safeConfig.updatedAt
    };
  }

  private mapWorkflowToResponse(workflow: any): AgentWorkflowResponse {
    return {
      id: workflow.id,
      createdAgentId: workflow.createdAgentId,
      workflowName: workflow.workflowName,
      workflowType: workflow.workflowType,
      description: workflow.description,
      n8nWorkflow: workflow.n8nWorkflow,
      workflowNodes: workflow.workflowNodes,
      nodeCount: workflow.nodeCount,
      connectionCount: workflow.connectionCount,
      complexity: workflow.complexity,
      version: workflow.version,
      isCurrentVersion: workflow.isCurrentVersion,
      parentWorkflowId: workflow.parentWorkflowId,
      changeLog: workflow.changeLog,
      developmentNotes: workflow.developmentNotes,
      isActive: workflow.isActive,
      isTested: workflow.isTested,
      isDeployed: workflow.isDeployed,
      lastTestDate: workflow.lastTestDate,
      testResults: workflow.testResults,
      createdAt: workflow.createdAt,
      updatedAt: workflow.updatedAt
    };
  }
} 