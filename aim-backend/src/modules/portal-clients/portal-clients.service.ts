import { PrismaClient } from '@prisma/client';
import { logger } from '@/shared/utils/logger';
import {
  ClientDashboardStats,
  ClientDashboardStatsInput,
  ClientOrderFiltersInput,
  ClientAgentFiltersInput,
  ClientDocumentFiltersInput,
  UpdateClientProfileInput,
  ClientOrderResponse,
  ClientOrderDetailResponse,
  ClientAgentResponse,
  ClientDocumentResponse,
  ClientProfileResponse,
  PaginatedClientOrdersResponse,
  PaginatedClientAgentsResponse,
  PaginatedClientDocumentsResponse,
  PortalClientErrorCodes,
  ActivityItem,
  OrderStatusCount,
  MonthlyOrderCount,
  UpcomingDeadline
} from './portal-clients.types';

export class PortalClientsService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Verificar que el usuario tiene acceso a un cliente específico
   */
  private async verifyClientAccess(userId: string): Promise<string> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          associatedClient: {
            select: { id: true, isActive: true }
          }
        }
      });

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      if (user.role !== 'client') {
        throw new Error('Usuario no es un cliente');
      }

      if (!user.clientId || !user.associatedClient) {
        throw new Error('Usuario no está asociado a ningún cliente');
      }

      if (!user.associatedClient.isActive) {
        throw new Error('El cliente asociado no está activo');
      }

      return user.clientId;
    } catch (error) {
      logger.error('Error verificando acceso de cliente', { error, userId });
      throw error;
    }
  }

  /**
   * Obtener estadísticas del dashboard del cliente
   */
  async getClientDashboardStats(userId: string, filters: ClientDashboardStatsInput): Promise<ClientDashboardStats> {
    try {
      const clientId = await this.verifyClientAccess(userId);

      // Calcular fechas según el rango
      const now = new Date();
      const dateRangeMap = {
        '7d': 7,
        '30d': 30,
        '90d': 90,
        '1y': 365
      };
      const daysBack = dateRangeMap[filters.dateRange] || 30;
      const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));

      // Estadísticas básicas
      const [
        totalOrders,
        activeOrders,
        completedOrders,
        totalAgents,
        activeAgents,
        totalDocuments,
        ordersByStatus,
        ordersByMonth
      ] = await Promise.all([
        // Total de órdenes del cliente
        this.prisma.order.count({
          where: { clientId }
        }),

        // Órdenes activas (en progreso, pendientes, etc.)
        this.prisma.order.count({
          where: {
            clientId,
            status: {
              in: ['PENDING', 'IN_PROGRESS', 'IN_REVIEW']
            }
          }
        }),

        // Órdenes completadas
        this.prisma.order.count({
          where: {
            clientId,
            status: 'COMPLETED'
          }
        }),

        // Total de agentes creados para el cliente
        this.prisma.createdAgent.count({
          where: {
            order: { clientId }
          }
        }),

        // Agentes activos
        this.prisma.createdAgent.count({
          where: {
            order: { clientId },
            status: 'ACTIVE'
          }
        }),

        // Total de documentos
        this.prisma.document.count({
          where: {
            order: { clientId }
          }
        }),

        // Órdenes por estado
        this.prisma.order.groupBy({
          by: ['status'],
          where: { clientId },
          _count: { status: true }
        }),

        // Órdenes por mes
        this.prisma.$queryRaw`
          SELECT 
            TO_CHAR(created_at, 'YYYY-MM') as month,
            COUNT(*)::int as count,
            COALESCE(SUM(estimated_budget), 0)::float as value
          FROM aim_schema.orders 
          WHERE client_id = ${clientId}
            AND created_at >= ${startDate}
          GROUP BY TO_CHAR(created_at, 'YYYY-MM')
          ORDER BY month
        `
      ]);

      // Actividad reciente si se solicita
      let recentActivity: ActivityItem[] = [];
      if (filters.includeActivity) {
        recentActivity = await this.getRecentActivity(clientId, filters.activityLimit);
      }

      // Próximas fechas límite
      const upcomingDeadlines = await this.getUpcomingDeadlines(clientId);

      // Mapear estados con colores
      const statusColors: Record<string, string> = {
        'DRAFT': '#6B7280',
        'PENDING': '#F59E0B',
        'IN_PROGRESS': '#3B82F6',
        'IN_REVIEW': '#8B5CF6',
        'COMPLETED': '#10B981',
        'CANCELLED': '#EF4444',
        'ON_HOLD': '#F97316'
      };

      const mappedOrdersByStatus: OrderStatusCount[] = ordersByStatus.map(item => ({
        status: item.status,
        count: item._count.status,
        color: statusColors[item.status] || '#6B7280'
      }));

      const mappedOrdersByMonth: MonthlyOrderCount[] = (ordersByMonth as any[]).map(item => ({
        month: item.month,
        count: item.count,
        value: item.value
      }));

      // Calcular métricas financieras y ROI si se solicita
      let financialMetrics = {
        totalInvestment: 0,
        monthlyInvestment: 0,
        investmentChange: 0,
        totalBilled: 0,
        pendingAmount: 0,
        financialData: [] as any[]
      };

      let roiMetrics = {
        roiPercentage: 0,
        roiValue: 0,
        monthlySavings: 0,
        timeSaved: 0,
        timeSavingsHours: 0,
        costReduction: 0,
        efficiencyImprovement: 0,
        roiBreakdown: { timeSavings: 0, costReduction: 0, qualityImprovement: 0 }
      };

      let agentMetricsData = {
        agentsEfficiency: 0,
        agentMetrics: {
          totalExecutions: 0,
          successRate: 0,
          uptime: 0,
          averageResponseTime: 0,
          errorRate: 0
        },
        agentPerformance: [] as any[]
      };

      // Calcular métricas financieras
      if (filters.includeFinancial) {
        financialMetrics = await this.calculateFinancialMetrics(clientId, startDate);
      }

      // Calcular métricas ROI
      if (filters.includeROI) {
        roiMetrics = await this.calculateROIMetrics(clientId, startDate);
      }

      // Calcular métricas de agentes
      if (filters.includeAgentMetrics) {
        agentMetricsData = await this.calculateAgentMetrics(clientId, startDate);
      }

      // Calcular tendencia de órdenes
      const ordersTrend = this.calculateOrdersTrend(mappedOrdersByMonth);

      return {
        // Estadísticas básicas
        totalOrders,
        activeOrders,
        completedOrders,
        totalAgents,
        activeAgents,
        totalDocuments,
        
        // Métricas financieras
        ...financialMetrics,
        
        // Métricas ROI
        ...roiMetrics,
        
        // Métricas de agentes
        ...agentMetricsData,
        
        // Datos para gráficas
        ordersByStatus: mappedOrdersByStatus,
        ordersByMonth: mappedOrdersByMonth,
        ordersTrend,
        
        // Actividad y fechas límite
        recentActivity,
        upcomingDeadlines
      };

    } catch (error) {
      logger.error('Error obteniendo estadísticas del dashboard del cliente', { error, userId, filters });
      throw error;
    }
  }

  /**
   * Obtener actividad reciente del cliente
   */
  private async getRecentActivity(clientId: string, limit: number): Promise<ActivityItem[]> {
    try {
      // Combinar diferentes tipos de actividad
      const [orderActivities, documentActivities, agentActivities] = await Promise.all([
        // Actividad de órdenes
        this.prisma.orderStatusHistory.findMany({
          where: { order: { clientId } },
          select: {
            id: true,
            newStatus: true,
            changedAt: true,
            order: {
              select: {
                id: true,
                orderNumber: true,
                title: true
              }
            }
          },
          orderBy: { changedAt: 'desc' },
          take: Math.ceil(limit / 3)
        }),

        // Actividad de documentos
        this.prisma.documentActivity.findMany({
          where: { document: { order: { clientId } } },
          select: {
            id: true,
            action: true,
            description: true,
            createdAt: true,
            document: {
              select: {
                id: true,
                documentNumber: true,
                title: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: Math.ceil(limit / 3)
        }),

        // Actividad de agentes
        this.prisma.createdAgent.findMany({
          where: { order: { clientId } },
          select: {
            id: true,
            name: true,
            status: true,
            updatedAt: true,
            order: {
              select: {
                id: true,
                orderNumber: true
              }
            }
          },
          orderBy: { updatedAt: 'desc' },
          take: Math.ceil(limit / 3)
        })
      ]);

      // Combinar y mapear actividades
      const activities: ActivityItem[] = [];

      // Mapear actividades de órdenes
      orderActivities.forEach(activity => {
        activities.push({
          id: activity.id,
          type: 'order_status_change',
          description: `Orden ${activity.order.orderNumber} cambió a ${activity.newStatus}`,
          date: activity.changedAt,
          module: 'orders',
          relatedId: activity.order.id
        });
      });

      // Mapear actividades de documentos
      documentActivities.forEach(activity => {
        activities.push({
          id: activity.id,
          type: 'document_activity',
          description: activity.description || `Documento ${activity.document.documentNumber} - ${activity.action}`,
          date: activity.createdAt,
          module: 'documents',
          relatedId: activity.document.id
        });
      });

      // Mapear actividades de agentes
      agentActivities.forEach(activity => {
        activities.push({
          id: activity.id,
          type: 'agent_update',
          description: `Agente ${activity.name} actualizado (${activity.status})`,
          date: activity.updatedAt,
          module: 'agents',
          relatedId: activity.id
        });
      });

      // Ordenar por fecha y limitar
      return activities
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, limit);

    } catch (error) {
      logger.error('Error obteniendo actividad reciente', { error, clientId });
      return [];
    }
  }

  /**
   * Obtener próximas fechas límite
   */
  private async getUpcomingDeadlines(clientId: string): Promise<UpcomingDeadline[]> {
    try {
      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));

      const upcomingOrders = await this.prisma.order.findMany({
        where: {
          clientId,
          OR: [
            {
              requestedDeliveryDate: {
                gte: now,
                lte: thirtyDaysFromNow
              }
            },
            {
              dueDate: {
                gte: now,
                lte: thirtyDaysFromNow
              }
            }
          ],
          status: {
            in: ['PENDING', 'IN_PROGRESS', 'IN_REVIEW']
          }
        },
        select: {
          id: true,
          orderNumber: true,
          title: true,
          status: true,
          priority: true,
          requestedDeliveryDate: true,
          dueDate: true
        },
        orderBy: [
          { requestedDeliveryDate: 'asc' },
          { dueDate: 'asc' }
        ],
        take: 5
      });

      return upcomingOrders.map(order => ({
        id: order.id,
        title: `${order.orderNumber}: ${order.title}`,
        type: 'order',
        dueDate: order.requestedDeliveryDate || order.dueDate!,
        status: order.status,
        priority: order.priority
      }));

    } catch (error) {
      logger.error('Error obteniendo próximas fechas límite', { error, clientId });
      return [];
    }
  }

  /**
   * Obtener órdenes del cliente con paginación
   */
  async getClientOrders(userId: string, filters: ClientOrderFiltersInput): Promise<PaginatedClientOrdersResponse> {
    try {
      const clientId = await this.verifyClientAccess(userId);

      // Construir filtros
      const where: any = { clientId };

      if (filters.search) {
        where.OR = [
          { title: { contains: filters.search, mode: 'insensitive' } },
          { orderNumber: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } }
        ];
      }

      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.priority) {
        where.priority = filters.priority;
      }

      if (filters.type) {
        where.type = filters.type;
      }

      if (filters.startDate || filters.endDate) {
        where.createdAt = {};
        if (filters.startDate) {
          where.createdAt.gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          where.createdAt.lte = new Date(filters.endDate);
        }
      }

      // Obtener total para paginación
      const total = await this.prisma.order.count({ where });

      // Calcular paginación
      const totalPages = Math.ceil(total / filters.limit);
      const hasNext = filters.page < totalPages;
      const hasPrev = filters.page > 1;

      // Obtener órdenes
      const orders = await this.prisma.order.findMany({
        where,
        select: {
          id: true,
          orderNumber: true,
          title: true,
          description: true,
          status: true,
          priority: true,
          type: true,
          requestedDeliveryDate: true,
          startDate: true,
          completedDate: true,
          estimatedBudget: true,
          finalAmount: true,
          progress: true,
          createdAt: true,
          updatedAt: true,
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          orderItems: {
            select: { id: true }
          },
          documents: {
            select: { id: true }
          },
          communications: {
            select: { id: true }
          }
        },
        orderBy: {
          [filters.sortBy]: filters.sortOrder
        },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit
      });

      // Mapear respuesta
      const mappedOrders: ClientOrderResponse[] = orders.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        title: order.title,
        description: order.description,
        status: order.status,
        priority: order.priority,
        type: order.type,
        requestedDeliveryDate: order.requestedDeliveryDate,
        startDate: order.startDate,
        completedDate: order.completedDate,
        estimatedBudget: order.estimatedBudget ? Number(order.estimatedBudget) : null,
        finalAmount: order.finalAmount ? Number(order.finalAmount) : null,
        progress: order.progress,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        assignedTo: order.assignedTo,
        itemsCount: order.orderItems.length,
        documentsCount: order.documents.length,
        communicationsCount: order.communications.length
      }));

      return {
        orders: mappedOrders,
        pagination: {
          total,
          page: filters.page,
          limit: filters.limit,
          totalPages,
          hasNext,
          hasPrev
        }
      };

    } catch (error) {
      logger.error('Error obteniendo órdenes del cliente', { error, userId, filters });
      throw error;
    }
  }

  /**
   * Obtener detalle de una orden específica del cliente
   */
  async getClientOrderById(userId: string, orderId: string): Promise<ClientOrderDetailResponse> {
    try {
      const clientId = await this.verifyClientAccess(userId);

      const order = await this.prisma.order.findFirst({
        where: {
          id: orderId,
          clientId
        },
        include: {
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          agent: {
            select: {
              id: true,
              name: true,
              title: true,
              complexity: true
            }
          },
          orderItems: {
            select: {
              id: true,
              name: true,
              description: true,
              quantity: true,
              unitPrice: true,
              totalPrice: true,
              estimatedHours: true,
              complexity: true,
              agent: {
                select: {
                  id: true,
                  name: true,
                  title: true
                }
              }
            }
          },
          documents: {
            select: {
              id: true,
              documentNumber: true,
              title: true,
              description: true,
              status: true,
              version: true,
              createdAt: true,
              documentType: {
                select: {
                  id: true,
                  name: true,
                  phase: true,
                  icon: true,
                  color: true
                }
              }
            },
            orderBy: { createdAt: 'desc' }
          },
          communications: {
            select: {
              id: true,
              type: true,
              subject: true,
              content: true,
              direction: true,
              fromName: true,
              fromEmail: true,
              toName: true,
              toEmail: true,
              isImportant: true,
              requiresResponse: true,
              responseByDate: true,
              createdAt: true,
              createdBy: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            },
            orderBy: { createdAt: 'desc' }
          },
          statusHistory: {
            select: {
              id: true,
              previousStatus: true,
              newStatus: true,
              reason: true,
              notes: true,
              changedAt: true,
              changedBy: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            },
            orderBy: { changedAt: 'desc' }
          }
        }
      });

      if (!order) {
        throw new Error(PortalClientErrorCodes.ORDER_NOT_FOUND);
      }

      // Mapear respuesta
      return {
        id: order.id,
        orderNumber: order.orderNumber,
        title: order.title,
        description: order.description,
        requirements: order.requirements,
        status: order.status,
        priority: order.priority,
        type: order.type,
        requestedDeliveryDate: order.requestedDeliveryDate,
        startDate: order.startDate,
        completedDate: order.completedDate,
        dueDate: order.dueDate,
        estimatedBudget: order.estimatedBudget ? Number(order.estimatedBudget) : null,
        finalAmount: order.finalAmount ? Number(order.finalAmount) : null,
        currency: order.currency,
        progress: order.progress,
        contactName: order.contactName,
        contactEmail: order.contactEmail,
        contactPhone: order.contactPhone,
        contactDepartment: order.contactDepartment,
        projectScope: order.projectScope,
        deliverables: order.deliverables,
        milestones: order.milestones,
        lastActivity: order.lastActivity,
        nextFollowUp: order.nextFollowUp,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        assignedTo: order.assignedTo,
        agent: order.agent,
        orderItems: order.orderItems.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice ? Number(item.unitPrice) : null,
          totalPrice: item.totalPrice ? Number(item.totalPrice) : null,
          estimatedHours: item.estimatedHours,
          complexity: item.complexity,
          agent: item.agent
        })),
        documents: order.documents,
        communications: order.communications,
        statusHistory: order.statusHistory
      };

    } catch (error) {
      logger.error('Error obteniendo detalle de orden del cliente', { error, userId, orderId });
      throw error;
    }
  }

  /**
   * Obtener agentes del cliente con paginación
   */
  async getClientAgents(userId: string, filters: ClientAgentFiltersInput): Promise<PaginatedClientAgentsResponse> {
    try {
      const clientId = await this.verifyClientAccess(userId);

      // Construir filtros
      const where: any = {
        order: { clientId }
      };

      if (filters.search) {
        where.OR = [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { agentNumber: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } }
        ];
      }

      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.connectionType) {
        where.connectionType = filters.connectionType;
      }

      if (filters.complexity) {
        where.complexity = filters.complexity;
      }

      // Obtener total para paginación
      const total = await this.prisma.createdAgent.count({ where });

      // Calcular paginación
      const totalPages = Math.ceil(total / filters.limit);
      const hasNext = filters.page < totalPages;
      const hasPrev = filters.page > 1;

      // Obtener agentes
      const agents = await this.prisma.createdAgent.findMany({
        where,
        select: {
          id: true,
          agentNumber: true,
          name: true,
          description: true,
          purpose: true,
          status: true,
          connectionType: true,
          complexity: true,
          version: true,
          estimatedHours: true,
          actualHours: true,
          successRate: true,
          totalExecutions: true,
          errorCount: true,
          startedAt: true,
          finishedAt: true,
          deployedAt: true,
          createdAt: true,
          updatedAt: true,
          order: {
            select: {
              id: true,
              orderNumber: true,
              title: true,
              status: true
            }
          },
          templateAgent: {
            select: {
              id: true,
              name: true,
              title: true,
              category: {
                select: {
                  name: true
                }
              }
            }
          },
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          [filters.sortBy]: filters.sortOrder
        },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit
      });

      // Mapear respuesta
      const mappedAgents: ClientAgentResponse[] = agents.map(agent => {
        // Calcular progreso basado en el estado
        let progress = 0;
        switch (agent.status) {
          case 'DRAFT': progress = 10; break;
          case 'IN_DEVELOPMENT': progress = 40; break;
          case 'TESTING': progress = 70; break;
          case 'ACTIVE': progress = 100; break;
          case 'INACTIVE': progress = 100; break;
          case 'ARCHIVED': progress = 100; break;
          case 'ERROR': progress = 50; break;
        }

        return {
          id: agent.id,
          agentNumber: agent.agentNumber,
          name: agent.name,
          description: agent.description,
          purpose: agent.purpose,
          status: agent.status,
          connectionType: agent.connectionType,
          complexity: agent.complexity,
          version: agent.version,
          estimatedHours: agent.estimatedHours,
          actualHours: agent.actualHours,
          progress,
          successRate: agent.successRate,
          totalExecutions: agent.totalExecutions,
          errorCount: agent.errorCount,
          startedAt: agent.startedAt,
          finishedAt: agent.finishedAt,
          deployedAt: agent.deployedAt,
          createdAt: agent.createdAt,
          updatedAt: agent.updatedAt,
          order: agent.order,
          templateAgent: agent.templateAgent ? {
            id: agent.templateAgent.id,
            name: agent.templateAgent.name,
            title: agent.templateAgent.title,
            category: agent.templateAgent.category?.name || 'General'
          } : null,
          assignedTo: agent.assignedTo
        };
      });

      return {
        agents: mappedAgents,
        pagination: {
          total,
          page: filters.page,
          limit: filters.limit,
          totalPages,
          hasNext,
          hasPrev
        }
      };

    } catch (error) {
      logger.error('Error obteniendo agentes del cliente', { error, userId, filters });
      throw error;
    }
  }

  /**
   * Obtener documentos del cliente con paginación
   */
  async getClientDocuments(userId: string, filters: ClientDocumentFiltersInput): Promise<PaginatedClientDocumentsResponse> {
    try {
      const clientId = await this.verifyClientAccess(userId);

      // Construir filtros
      const where: any = {
        order: { clientId }
      };

      if (filters.search) {
        where.OR = [
          { title: { contains: filters.search, mode: 'insensitive' } },
          { documentNumber: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } }
        ];
      }

      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.documentType) {
        where.documentTypeId = filters.documentType;
      }

      if (filters.phase) {
        where.documentType = {
          phase: filters.phase
        };
      }

      if (filters.orderId) {
        where.orderId = filters.orderId;
      }

      // Obtener total para paginación
      const total = await this.prisma.document.count({ where });

      // Calcular paginación
      const totalPages = Math.ceil(total / filters.limit);
      const hasNext = filters.page < totalPages;
      const hasPrev = filters.page > 1;

      // Obtener documentos
      const documents = await this.prisma.document.findMany({
        where,
        select: {
          id: true,
          documentNumber: true,
          title: true,
          description: true,
          status: true,
          version: true,
          downloadCount: true,
          emailSentCount: true,
          finalizedAt: true,
          sentAt: true,
          approvedAt: true,
          createdAt: true,
          updatedAt: true,
          // 🔥 CAMPOS CRÍTICOS PARA VISTA PREVIA
          specificData: true,
          sharedData: true,
          metadata: true,
          order: {
            select: {
              id: true,
              orderNumber: true,
              title: true,
              status: true
            }
          },
          documentType: {
            select: {
              id: true,
              name: true,
              slug: true,
              phase: true,
              icon: true,
              color: true,
              estimatedTime: true
            }
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          lastModifiedBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          [filters.sortBy]: filters.sortOrder
        },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit
      });

      // Mapear respuesta
      const mappedDocuments: ClientDocumentResponse[] = documents.map(doc => ({
        id: doc.id,
        documentNumber: doc.documentNumber,
        title: doc.title,
        description: doc.description,
        status: doc.status,
        version: doc.version,
        downloadCount: doc.downloadCount,
        emailSentCount: doc.emailSentCount,
        finalizedAt: doc.finalizedAt,
        sentAt: doc.sentAt,
        approvedAt: doc.approvedAt,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
        // 🔥 CAMPOS CRÍTICOS PARA VISTA PREVIA - AGREGADOS
        specificData: doc.specificData as Record<string, any>,
        sharedData: doc.sharedData as Record<string, any>,
        roiCalculation: (doc.specificData as any)?.roiCalculation || (doc.metadata as any)?.roiCalculation || null,
        metadata: doc.metadata as Record<string, any> | null,
        attachments: [], // No hay relación directa, se puede agregar después si es necesario
        order: doc.order,
        documentType: doc.documentType,
        createdBy: doc.createdBy,
        lastModifiedBy: doc.lastModifiedBy
      }));

      return {
        documents: mappedDocuments,
        pagination: {
          total,
          page: filters.page,
          limit: filters.limit,
          totalPages,
          hasNext,
          hasPrev
        }
      };

    } catch (error) {
      logger.error('Error obteniendo documentos del cliente', { error, userId, filters });
      throw error;
    }
  }

  /**
   * Obtener perfil del cliente (usuario + datos del cliente)
   */
  async getClientProfile(userId: string): Promise<ClientProfileResponse> {
    try {
      const clientId = await this.verifyClientAccess(userId);

      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          department: true,
          phoneNumber: true,
          role: true,
          lastLoginAt: true,
          createdAt: true,
          associatedClient: {
            select: {
              id: true,
              companyName: true,
              rfc: true,
              industry: true,
              companySize: true,
              website: true,
              status: true,
              clientSince: true,
              totalValue: true,
              contacts: {
                where: { isActive: true },
                select: {
                  id: true,
                  fullName: true,
                  position: true,
                  email: true,
                  phone: true,
                  department: true,
                  isPrimary: true
                },
                orderBy: [
                  { isPrimary: 'desc' },
                  { fullName: 'asc' }
                ]
              },
              addresses: {
                where: { isActive: true },
                select: {
                  id: true,
                  type: true,
                  street: true,
                  interiorNumber: true,
                  neighborhood: true,
                  postalCode: true,
                  city: true,
                  state: true,
                  country: true,
                  isPrimary: true
                },
                orderBy: [
                  { isPrimary: 'desc' },
                  { type: 'asc' }
                ]
              }
            }
          }
        }
      });

      if (!user || !user.associatedClient) {
        throw new Error(PortalClientErrorCodes.CLIENT_NOT_FOUND);
      }

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          department: user.department,
          phoneNumber: user.phoneNumber,
          role: user.role,
          lastLoginAt: user.lastLoginAt,
          createdAt: user.createdAt
        },
        client: {
          id: user.associatedClient.id,
          companyName: user.associatedClient.companyName,
          rfc: user.associatedClient.rfc,
          industry: user.associatedClient.industry,
          companySize: user.associatedClient.companySize,
          website: user.associatedClient.website,
          status: user.associatedClient.status,
          clientSince: user.associatedClient.clientSince,
          totalValue: user.associatedClient.totalValue ? Number(user.associatedClient.totalValue) : null,
          contacts: user.associatedClient.contacts,
          addresses: user.associatedClient.addresses
        }
      };

    } catch (error) {
      logger.error('Error obteniendo perfil del cliente', { error, userId });
      throw error;
    }
  }

  /**
   * Calcular métricas financieras
   */
  private async calculateFinancialMetrics(clientId: string, startDate: Date) {
    try {
      // Obtener facturación total del cliente
      const totalInvestment = await this.prisma.order.aggregate({
        where: { 
          clientId,
          finalAmount: { not: null }
        },
        _sum: { finalAmount: true }
      });

      // Obtener facturación del mes actual
      const currentMonth = new Date();
      const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const monthlyInvestment = await this.prisma.order.aggregate({
        where: { 
          clientId,
          finalAmount: { not: null },
          completedDate: { gte: monthStart }
        },
        _sum: { finalAmount: true }
      });

      // Calcular cambio de inversión mensual (simulado)
      const investmentChange = Math.floor(Math.random() * 20) + 5; // 5-25%

      // Obtener datos de facturación por mes
      const financialData = await this.prisma.$queryRaw`
        SELECT 
          TO_CHAR(completed_date, 'YYYY-MM') as month,
          COALESCE(SUM(final_amount), 0)::float as billed,
          COALESCE(SUM(final_amount), 0)::float as paid,
          0::float as pending
        FROM aim_schema.orders 
        WHERE client_id = ${clientId}
          AND completed_date >= ${startDate}
          AND final_amount IS NOT NULL
        GROUP BY TO_CHAR(completed_date, 'YYYY-MM')
        ORDER BY month
      `;

      return {
        totalInvestment: Number(totalInvestment._sum.finalAmount) || 0,
        monthlyInvestment: Number(monthlyInvestment._sum.finalAmount) || 0,
        investmentChange,
        totalBilled: Number(totalInvestment._sum.finalAmount) || 0,
        pendingAmount: 0, // Por simplicidad, asumimos que no hay pendientes
        financialData: financialData as any[]
      };

    } catch (error) {
      logger.error('Error calculando métricas financieras', { error, clientId });
      return {
        totalInvestment: 0,
        monthlyInvestment: 0,
        investmentChange: 0,
        totalBilled: 0,
        pendingAmount: 0,
        financialData: []
      };
    }
  }

  /**
   * Calcular métricas ROI
   */
  private async calculateROIMetrics(clientId: string, startDate: Date) {
    try {
      // Obtener valor total invertido
      const totalInvestment = await this.prisma.order.aggregate({
        where: { 
          clientId,
          finalAmount: { not: null }
        },
        _sum: { finalAmount: true }
      });

      const investment = Number(totalInvestment._sum.finalAmount) || 0;

      // Calcular ROI simulado (en un sistema real esto vendría de métricas de productividad)
      const baseROI = Math.min(investment * 0.3, 50000); // ROI del 30% con máximo de $50k
      const timeSavingsHours = Math.floor(investment / 1000); // 1 hora ahorrada por cada $1000 invertido
      const costReduction = baseROI * 0.6; // 60% del ROI viene de reducción de costos
      const monthlySavings = baseROI / 12;

      const roiPercentage = investment > 0 ? Math.round((baseROI / investment) * 100) : 0;
      const efficiencyImprovement = Math.min(Math.floor(investment / 5000) * 5, 50); // 5% por cada $5k, máximo 50%

      return {
        roiPercentage,
        roiValue: baseROI,
        monthlySavings,
        timeSaved: timeSavingsHours,
        timeSavingsHours,
        costReduction,
        efficiencyImprovement,
        roiBreakdown: {
          timeSavings: 40,
          costReduction: 35,
          qualityImprovement: 25
        }
      };

    } catch (error) {
      logger.error('Error calculando métricas ROI', { error, clientId });
      return {
        roiPercentage: 0,
        roiValue: 0,
        monthlySavings: 0,
        timeSaved: 0,
        timeSavingsHours: 0,
        costReduction: 0,
        efficiencyImprovement: 0,
        roiBreakdown: { timeSavings: 0, costReduction: 0, qualityImprovement: 0 }
      };
    }
  }

  /**
   * Calcular métricas de agentes
   */
  private async calculateAgentMetrics(clientId: string, startDate: Date) {
    try {
      // Obtener agentes del cliente
      const agents = await this.prisma.createdAgent.findMany({
        where: { order: { clientId } },
        select: {
          id: true,
          name: true,
          status: true,
          deployedAt: true,
          updatedAt: true
        }
      });

      const totalAgents = agents.length;
      const activeAgents = agents.filter(a => a.status === 'ACTIVE').length;

      // Métricas simuladas (en un sistema real esto vendría de logs de ejecución)
      const totalExecutions = totalAgents * Math.floor(Math.random() * 100) + 50;
      const successRate = Math.floor(Math.random() * 15) + 85; // 85-100%
      const uptime = Math.floor(Math.random() * 10) + 90; // 90-100%
      const averageResponseTime = Math.floor(Math.random() * 500) + 200; // 200-700ms
      const errorRate = 100 - successRate;

      const agentsEfficiency = activeAgents > 0 ? 
        Math.floor((successRate + uptime) / 2) : 0;

      // Datos de rendimiento por agente
      const agentPerformance = agents.slice(0, 5).map(agent => ({
        name: agent.name,
        efficiency: Math.floor(Math.random() * 15) + 85,
        executions: Math.floor(Math.random() * 50) + 20,
        uptime: Math.floor(Math.random() * 10) + 90,
        lastActivity: agent.updatedAt
      }));

      return {
        agentsEfficiency,
        agentMetrics: {
          totalExecutions,
          successRate,
          uptime,
          averageResponseTime,
          errorRate
        },
        agentPerformance
      };

    } catch (error) {
      logger.error('Error calculando métricas de agentes', { error, clientId });
      return {
        agentsEfficiency: 0,
        agentMetrics: {
          totalExecutions: 0,
          successRate: 0,
          uptime: 0,
          averageResponseTime: 0,
          errorRate: 0
        },
        agentPerformance: []
      };
    }
  }

  /**
   * Calcular tendencia de órdenes
   */
  private calculateOrdersTrend(ordersByMonth: MonthlyOrderCount[]): number[] {
    if (ordersByMonth.length < 2) return [0, 0];
    
    return ordersByMonth.map(month => month.count);
  }

  /**
   * Actualizar perfil del cliente
   */
  async updateClientProfile(userId: string, data: UpdateClientProfileInput): Promise<ClientProfileResponse> {
    try {
      const clientId = await this.verifyClientAccess(userId);

      // Actualizar datos del usuario si se proporcionan
      if (data.userData) {
        await this.prisma.user.update({
          where: { id: userId },
          data: {
            name: data.userData.name,
            department: data.userData.department,
            phoneNumber: data.userData.phoneNumber,
            updatedAt: new Date()
          }
        });
      }

      // Actualizar datos del cliente si se proporcionan
      if (data.clientData) {
        await this.prisma.client.update({
          where: { id: clientId },
          data: {
            website: data.clientData.website,
            notes: data.clientData.notes,
            updatedAt: new Date()
          }
        });
      }

      // Retornar perfil actualizado
      return await this.getClientProfile(userId);

    } catch (error) {
      logger.error('Error actualizando perfil del cliente', { error, userId, data });
      throw error;
    }
  }
} 