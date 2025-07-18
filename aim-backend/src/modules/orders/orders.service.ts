import { PrismaClient } from '@prisma/client';
import { logger } from '@/shared/utils/logger';
import {
  CreateOrderInput,
  UpdateOrderInput,
  OrderFilters,
  OrderStatsInput,
  ChangeOrderStatusInput,
  CreateOrderCommunicationInput,
  OrderResponse,
  OrderDetailResponse,
  PaginatedOrdersResponse,
  OrderStatsResponse,
  OrderErrorCodes,
  OrderStatus,
  OrderPriority,
  OrderType
} from './orders.types';

export class OrdersService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Crear una nueva orden
   */
  async createOrder(data: CreateOrderInput, createdById: string): Promise<OrderDetailResponse> {
    try {
      let clientId = data.clientId;

      // Si no hay clientId, crear el cliente primero
      if (!clientId) {
        // Si no hay clientData pero se requiere un cliente nuevo
        if (!data.clientData) {
          throw new Error('Se requiere información del cliente para crear una orden');
        }
        
        // Validar que tenemos al menos la información básica del cliente
        if (!data.clientData.companyName || !data.clientData.contactName || !data.clientData.contactEmail) {
          throw new Error('Para crear un nuevo cliente se requiere: nombre de empresa, nombre de contacto y email');
        }

        const newClient = await this.prisma.client.create({
          data: {
            companyName: data.clientData.companyName,
            rfc: data.clientData.rfc || '',
            industry: data.clientData.industry || 'General',
            companySize: data.clientData.companySize || '',
            website: data.clientData.website || '',
            status: 'prospecto',
            referenceSource: data.referenceSource || '',
            isActive: true,
            createdBy: createdById,
            contacts: {
              create: [{
                fullName: data.clientData.contactName,
                email: data.clientData.contactEmail,
                phone: data.clientData.contactPhone || '',
                isPrimary: true,
                isActive: true
              }]
            },
            addresses: data.clientData.address && (data.clientData.address.street || data.clientData.address.city) ? {
              create: [{
                type: 'fisica',
                street: data.clientData.address.street || '',
                interiorNumber: data.clientData.address.interiorNumber || '',
                neighborhood: data.clientData.address.neighborhood || '',
                postalCode: data.clientData.address.postalCode || '',
                city: data.clientData.address.city || '',
                state: data.clientData.address.state || '',
                country: data.clientData.address.country || 'MX',
                isPrimary: true,
                isActive: true
              }]
            } : undefined
          }
        });
        clientId = newClient.id;
      }

      if (!clientId) {
        throw new Error('Cliente es requerido para crear una orden');
      }

      // Generar número de orden único
      const orderNumber = await this.generateOrderNumber();

      // Crear la orden
      const order = await this.prisma.order.create({
        data: {
          orderNumber,
          clientId,
          agentId: data.agentId,
          createdById,
          title: data.title,
          description: data.description,
          requirements: data.requirements,
          priority: data.priority || 'MEDIUM',
          requestedDeliveryDate: data.requestedDeliveryDate ? new Date(data.requestedDeliveryDate) : undefined,
          estimatedBudget: data.estimatedBudget,
          contactName: data.clientData?.contactName || '',
          contactEmail: data.clientData?.contactEmail || '',
          contactPhone: data.clientData?.contactPhone || '',
          departmentRequesting: data.departmentRequesting || '',
          isExistingClient: data.isExistingClient || false,
          referenceSource: data.referenceSource || '',
          internalNotes: data.internalNotes || '',
          attachments: data.attachments || [],
          
          // Información del cliente en la orden
          clientCompanyName: data.clientData?.companyName || '',
          clientRfc: data.clientData?.rfc || '',
          clientIndustry: data.clientData?.industry || '',
          clientSize: data.clientData?.companySize || '',
          clientWebsite: data.clientData?.website || '',
          
          // Dirección del proyecto
          projectStreet: data.clientData?.address?.street || '',
          projectInteriorNumber: data.clientData?.address?.interiorNumber || '',
          projectNeighborhood: data.clientData?.address?.neighborhood || '',
          projectPostalCode: data.clientData?.address?.postalCode || '',
          projectCity: data.clientData?.address?.city || '',
          projectState: data.clientData?.address?.state || '',
          projectCountry: data.clientData?.address?.country || 'MX',
          projectReferences: data.clientData?.address?.references || ''
        },
        include: this.getOrderIncludes()
      });

              // Crear entrada en el historial de estado
        await this.prisma.orderStatusHistory.create({
          data: {
            orderId: order.id,
            newStatus: 'PENDING',
            reason: 'Orden creada',
            changedById: createdById
          }
        });

      logger.info('Orden creada exitosamente', {
        orderId: order.id,
        orderNumber: order.orderNumber,
        clientId,
        createdBy: createdById
      });

      return this.mapOrderToDetailResponse(order);
    } catch (error) {
      logger.error('Error creando orden', { error, data });
      throw new Error(`Error al crear la orden: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Obtener órdenes con filtros y paginación
   */
  async getOrders(filters: OrderFilters): Promise<PaginatedOrdersResponse> {
    try {
      const where: any = {};

      // Aplicar filtros
      if (filters.status) {
        if (Array.isArray(filters.status)) {
          where.status = { in: filters.status };
        } else {
          where.status = filters.status;
        }
      }
      if (filters.priority) where.priority = filters.priority;
      if (filters.clientId) where.clientId = filters.clientId;
      if (filters.agentId) where.agentId = filters.agentId;
      if (filters.assignedToId) where.assignedToId = filters.assignedToId;
      if (filters.createdById) where.createdById = filters.createdById;

      // Filtros de fecha
      if (filters.startDate || filters.endDate) {
        where.createdAt = {};
        if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
        if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
      }

      // Búsqueda por texto
      if (filters.search) {
        where.OR = [
          { orderNumber: { contains: filters.search, mode: 'insensitive' } },
          { title: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
          { client: { companyName: { contains: filters.search, mode: 'insensitive' } } }
        ];
      }

      // Filtros adicionales
      if (filters.isOverdue) {
        where.requestedDeliveryDate = { lt: new Date() };
        where.status = { notIn: [OrderStatus.COMPLETED, OrderStatus.CANCELLED] };
      }

      if (filters.hasAttachments) {
        where.attachments = { not: [] };
      }

      // Obtener total para paginación
      const total = await this.prisma.order.count({ where });

      // Obtener órdenes
      const orders = await this.prisma.order.findMany({
        where,
        include: {
          client: {
            select: {
              id: true,
              companyName: true,
              industry: true,
              contacts: {
                where: { isPrimary: true },
                select: {
                  fullName: true,
                  email: true,
                  phone: true
                }
              }
            }
          },
          agent: {
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
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          orderItems: true,
          communications: {
            take: 3,
            orderBy: { createdAt: 'desc' }
          }
        },
        orderBy: {
          [filters.sortBy]: filters.sortOrder
        },
        take: filters.limit,
        skip: (filters.page - 1) * filters.limit
      });

      const pages = Math.ceil(total / filters.limit);

      return {
        orders: orders.map(this.mapOrderToResponse),
        pagination: {
          total,
          page: filters.page,
          limit: filters.limit,
          pages
        },
        filters
      };
    } catch (error) {
      logger.error('Error obteniendo órdenes', { error, filters });
      throw new Error('Error al obtener las órdenes');
    }
  }

  /**
   * Obtener orden por ID
   */
  async getOrderById(id: string): Promise<OrderDetailResponse> {
    try {
      const order = await this.prisma.order.findUnique({
        where: { id },
        include: this.getOrderIncludes()
      });

      if (!order) {
        throw new Error(OrderErrorCodes.ORDER_NOT_FOUND);
      }

      return this.mapOrderToDetailResponse(order);
    } catch (error) {
      logger.error('Error obteniendo orden por ID', { error, orderId: id });
      throw error;
    }
  }

  /**
   * Actualizar orden
   */
  async updateOrder(id: string, data: UpdateOrderInput): Promise<OrderDetailResponse> {
    try {
      const existingOrder = await this.prisma.order.findUnique({
        where: { id }
      });

      if (!existingOrder) {
        throw new Error(OrderErrorCodes.ORDER_NOT_FOUND);
      }

      const updateData: any = { ...data };

      // Convertir fechas si están presentes
      if (data.requestedDeliveryDate) {
        updateData.requestedDeliveryDate = new Date(data.requestedDeliveryDate);
      }
      if (data.startDate) {
        updateData.startDate = new Date(data.startDate);
      }
      if (data.dueDate) {
        updateData.dueDate = new Date(data.dueDate);
      }

      const updatedOrder = await this.prisma.order.update({
        where: { id },
        data: updateData,
        include: this.getOrderIncludes()
      });

      logger.info('Orden actualizada', {
        orderId: id,
        changes: Object.keys(data)
      });

      return this.mapOrderToDetailResponse(updatedOrder);
    } catch (error) {
      logger.error('Error actualizando orden', { error, orderId: id, data });
      throw error;
    }
  }

  /**
   * Cambiar estado de orden
   */
  async changeOrderStatus(id: string, data: ChangeOrderStatusInput, changedById: string): Promise<OrderDetailResponse> {
    try {
      const existingOrder = await this.prisma.order.findUnique({
        where: { id }
      });

      if (!existingOrder) {
        throw new Error(OrderErrorCodes.ORDER_NOT_FOUND);
      }

      // Validar transición de estado
      this.validateStatusTransition(existingOrder.status as OrderStatus, data.status);

      // Actualizar orden
      const updateData: any = { status: data.status };

      if (data.status === OrderStatus.COMPLETED) {
        updateData.completedDate = new Date();
        updateData.progress = 100;
      }

      const updatedOrder = await this.prisma.order.update({
        where: { id },
        data: updateData,
        include: this.getOrderIncludes()
      });

      // Crear entrada en historial
      await this.prisma.orderStatusHistory.create({
        data: {
          orderId: id,
          previousStatus: existingOrder.status,
          newStatus: data.status,
          reason: data.reason,
          notes: data.notes,
          changedById
        }
      });

      logger.info('Estado de orden cambiado', {
        orderId: id,
        previousStatus: existingOrder.status,
        newStatus: data.status,
        changedBy: changedById
      });

      return this.mapOrderToDetailResponse(updatedOrder);
    } catch (error) {
      logger.error('Error cambiando estado de orden', { error, orderId: id, data });
      throw error;
    }
  }

  /**
   * Eliminar orden
   */
  async deleteOrder(id: string): Promise<void> {
    try {
      const existingOrder = await this.prisma.order.findUnique({
        where: { id }
      });

      if (!existingOrder) {
        throw new Error(OrderErrorCodes.ORDER_NOT_FOUND);
      }

      await this.prisma.order.delete({
        where: { id }
      });

      logger.info('Orden eliminada', { orderId: id });
    } catch (error) {
      logger.error('Error eliminando orden', { error, orderId: id });
      throw error;
    }
  }

  /**
   * Obtener estadísticas de órdenes
   */
  async getOrderStats(params: OrderStatsInput): Promise<OrderStatsResponse> {
    try {
      const where: any = {};

      // Aplicar filtros
      if (params.startDate || params.endDate) {
        where.createdAt = {};
        if (params.startDate) where.createdAt.gte = new Date(params.startDate);
        if (params.endDate) where.createdAt.lte = new Date(params.endDate);
      }

      if (params.clientId) where.clientId = params.clientId;
      if (params.agentId) where.agentId = params.agentId;

      // Estadísticas generales
      const totalOrders = await this.prisma.order.count({ where });
      const activeOrders = await this.prisma.order.count({
        where: { ...where, status: { in: [OrderStatus.PENDING, OrderStatus.IN_PROGRESS, OrderStatus.IN_REVIEW] } }
      });
      const completedOrders = await this.prisma.order.count({
        where: { ...where, status: OrderStatus.COMPLETED }
      });
      const overdueOrders = await this.prisma.order.count({
        where: {
          ...where,
          requestedDeliveryDate: { lt: new Date() },
          status: { notIn: [OrderStatus.COMPLETED, OrderStatus.CANCELLED] }
        }
      });

      // Valor total y promedio
      const orderValues = await this.prisma.order.aggregate({
        where,
        _sum: { estimatedBudget: true, finalAmount: true },
        _avg: { estimatedBudget: true }
      });

      const totalValue = Number(orderValues._sum.finalAmount || 0) + Number(orderValues._sum.estimatedBudget || 0);
      const averageValue = Number(orderValues._avg.estimatedBudget || 0);

      // Tiempo promedio de completado
      const completedOrdersWithDates = await this.prisma.order.findMany({
        where: {
          ...where,
          status: OrderStatus.COMPLETED,
          completedDate: { not: null }
        },
        select: {
          createdAt: true,
          completedDate: true
        }
      });

      const averageCompletionTime = this.calculateAverageCompletionTime(completedOrdersWithDates);

      // Distribuciones
      const statusDistribution = await this.getDistribution('status', where);
      const priorityDistribution = await this.getDistribution('priority', where);

      // Órdenes por agente
      const ordersByAgent = await this.getOrdersByAgent(where);

      // Órdenes por cliente
      const ordersByClient = await this.getOrdersByClient(where);

      // Datos de serie temporal
      const timeSeriesData = await this.getTimeSeriesData(where, params.groupBy);

      // Actividad reciente
      const recentActivity = await this.getRecentActivity();

      return {
        overview: {
          totalOrders,
          activeOrders,
          completedOrders,
          overdueOrders,
          totalValue,
          averageValue,
          averageCompletionTime
        },
        statusDistribution,
        priorityDistribution,
        ordersByAgent,
        ordersByClient,
        timeSeriesData,
        recentActivity
      };
    } catch (error) {
      logger.error('Error obteniendo estadísticas de órdenes', { error, params });
      throw new Error('Error al obtener las estadísticas de órdenes');
    }
  }

  /**
   * Crear comunicación para una orden
   */
  async createOrderCommunication(orderId: string, data: CreateOrderCommunicationInput, createdById: string) {
    try {
      const order = await this.prisma.order.findUnique({
        where: { id: orderId }
      });

      if (!order) {
        throw new Error(OrderErrorCodes.ORDER_NOT_FOUND);
      }

      const communication = await this.prisma.orderCommunication.create({
        data: {
          orderId,
          type: data.type,
          subject: data.subject,
          content: data.content,
          direction: data.direction,
          isImportant: data.isImportant,
          requiresResponse: data.requiresResponse,
          responseByDate: data.responseByDate ? new Date(data.responseByDate) : undefined,
          attachments: data.attachments || [],
          createdById
        },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      // Actualizar lastActivity de la orden
      await this.prisma.order.update({
        where: { id: orderId },
        data: { lastActivity: new Date() }
      });

      return communication;
    } catch (error) {
      logger.error('Error creando comunicación de orden', { error, orderId, data });
      throw error;
    }
  }

  // Métodos privados de utilidad
  private async generateOrderNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.order.count({
      where: {
        orderNumber: {
          startsWith: `ORD-${year}-`
        }
      }
    });
    return `ORD-${year}-${String(count + 1).padStart(3, '0')}`;
  }

  private validateStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): void {
    // Transiciones más flexibles para el flujo de trabajo
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.DRAFT]: [OrderStatus.PENDING, OrderStatus.IN_PROGRESS, OrderStatus.CANCELLED],
      [OrderStatus.PENDING]: [OrderStatus.DRAFT, OrderStatus.IN_PROGRESS, OrderStatus.IN_REVIEW, OrderStatus.CANCELLED, OrderStatus.ON_HOLD],
      [OrderStatus.IN_PROGRESS]: [OrderStatus.PENDING, OrderStatus.IN_REVIEW, OrderStatus.COMPLETED, OrderStatus.ON_HOLD, OrderStatus.CANCELLED],
      [OrderStatus.IN_REVIEW]: [OrderStatus.IN_PROGRESS, OrderStatus.COMPLETED, OrderStatus.CANCELLED, OrderStatus.ON_HOLD],
      [OrderStatus.COMPLETED]: [OrderStatus.IN_REVIEW], // Permitir reabrir si es necesario
      [OrderStatus.CANCELLED]: [OrderStatus.PENDING, OrderStatus.IN_PROGRESS], // Permitir reactivar
      [OrderStatus.ON_HOLD]: [OrderStatus.PENDING, OrderStatus.IN_PROGRESS, OrderStatus.CANCELLED]
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new Error(OrderErrorCodes.INVALID_STATUS_TRANSITION);
    }
  }

  private getOrderIncludes() {
    return {
      client: {
        include: {
          contacts: { where: { isPrimary: true } },
          addresses: { where: { isPrimary: true } }
        }
      },
      agent: {
        include: {
          category: true
        }
      },
      createdBy: {
        select: { id: true, name: true, email: true }
      },
      assignedTo: {
        select: { id: true, name: true, email: true }
      },
      orderItems: {
        include: {
          agent: {
            select: { id: true, name: true, title: true }
          }
        }
      },
      statusHistory: {
        include: {
          changedBy: {
            select: { id: true, name: true }
          }
        },
        orderBy: { changedAt: 'desc' as const }
      },
      communications: {
        include: {
          createdBy: {
            select: { id: true, name: true }
          }
        },
        orderBy: { createdAt: 'desc' as const },
        take: 10
      }
    };
  }

  private mapOrderToResponse = (order: any): OrderResponse => {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      title: order.title,
      description: order.description,
      requirements: order.requirements,
      status: order.status,
      priority: order.priority,
      type: order.type,
      progress: order.progress,
      requestedDeliveryDate: order.requestedDeliveryDate,
      startDate: order.startDate,
      completedDate: order.completedDate,
      dueDate: order.dueDate,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      estimatedBudget: order.estimatedBudget ? Number(order.estimatedBudget) : undefined,
      finalAmount: order.finalAmount ? Number(order.finalAmount) : undefined,
      currency: order.currency,
      client: {
        id: order.client.id,
        companyName: order.client.companyName,
        contactName: order.client.contacts[0]?.fullName,
        contactEmail: order.client.contacts[0]?.email,
        contactPhone: order.client.contacts[0]?.phone,
        industry: order.client.industry
      },
      agent: order.agent ? {
        id: order.agent.id,
        name: order.agent.name,
        title: order.agent.title,
        category: order.agent.category?.name || ''
      } : undefined,
      createdBy: order.createdBy,
      assignedTo: order.assignedTo,
      projectAddress: {
        street: order.projectStreet,
        city: order.projectCity,
        state: order.projectState,
        country: order.projectCountry
      },
      isExistingClient: order.isExistingClient,
      referenceSource: order.referenceSource,
      lastActivity: order.lastActivity,
      nextFollowUp: order.nextFollowUp,
      itemsCount: order.orderItems?.length || 0,
      communicationsCount: order.communications?.length || 0,
      attachments: order.attachments || []
    };
  };

  private mapOrderToDetailResponse = (order: any): OrderDetailResponse => {
    const baseResponse = this.mapOrderToResponse(order);
    
    return {
      ...baseResponse,
      internalNotes: order.internalNotes,
      projectScope: order.projectScope,
      deliverables: order.deliverables,
      milestones: order.milestones,
      items: order.orderItems?.map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice ? Number(item.unitPrice) : undefined,
        totalPrice: item.totalPrice ? Number(item.totalPrice) : undefined,
        estimatedHours: item.estimatedHours,
        complexity: item.complexity,
        agent: item.agent
      })) || [],
      statusHistory: order.statusHistory?.map((history: any) => ({
        id: history.id,
        previousStatus: history.previousStatus,
        newStatus: history.newStatus,
        reason: history.reason,
        notes: history.notes,
        changedAt: history.changedAt,
        changedBy: history.changedBy
      })) || [],
      recentCommunications: order.communications?.map((comm: any) => ({
        id: comm.id,
        type: comm.type,
        subject: comm.subject,
        content: comm.content,
        direction: comm.direction,
        isImportant: comm.isImportant,
        requiresResponse: comm.requiresResponse,
        responseByDate: comm.responseByDate,
        createdAt: comm.createdAt,
        createdBy: comm.createdBy,
        attachments: comm.attachments
      })) || []
    };
  };

  private async getDistribution(field: string, where: any): Promise<Record<string, number>> {
    const results = await this.prisma.order.groupBy({
      by: [field as any],
      where,
      _count: true
    });

    const distribution: Record<string, number> = {};
    results.forEach((result: any) => {
      distribution[result[field]] = result._count;
    });

    return distribution;
  }

  private async getOrdersByAgent(where: any) {
    const results = await this.prisma.order.groupBy({
      by: ['agentId'],
      where: { ...where, agentId: { not: null } },
      _count: true,
      _sum: { estimatedBudget: true, finalAmount: true }
    });

    const agentIds = results.map(r => r.agentId).filter(Boolean) as string[];
    const agents = await this.prisma.agent.findMany({
      where: { id: { in: agentIds } },
      select: { id: true, name: true }
    });

    return results.map(result => {
      const agent = agents.find(a => a.id === result.agentId);
      return {
        agentId: result.agentId!,
        agentName: agent?.name || 'Agente desconocido',
        count: result._count,
        totalValue: Number(result._sum.estimatedBudget || 0) + Number(result._sum.finalAmount || 0)
      };
    });
  }

  private async getOrdersByClient(where: any) {
    const results = await this.prisma.order.groupBy({
      by: ['clientId'],
      where,
      _count: true,
      _sum: { estimatedBudget: true, finalAmount: true }
    });

    const clientIds = results.map(r => r.clientId);
    const clients = await this.prisma.client.findMany({
      where: { id: { in: clientIds } },
      select: { id: true, companyName: true }
    });

    return results.map(result => {
      const client = clients.find(c => c.id === result.clientId);
      return {
        clientId: result.clientId,
        clientName: client?.companyName || 'Cliente desconocido',
        count: result._count,
        totalValue: Number(result._sum.estimatedBudget || 0) + Number(result._sum.finalAmount || 0)
      };
    });
  }

  private async getTimeSeriesData(where: any, groupBy: string) {
    const orders = await this.prisma.order.findMany({
      where,
      select: {
        createdAt: true,
        estimatedBudget: true,
        finalAmount: true,
        status: true
      },
      orderBy: { createdAt: 'asc' }
    });

    const grouped: Record<string, { count: number; value: number; completed: number }> = {};

    orders.forEach(order => {
      let period: string;
      const date = order.createdAt;

      switch (groupBy) {
        case 'week':
          const week = Math.ceil(date.getDate() / 7);
          period = `${date.getFullYear()}-W${week}`;
          break;
        case 'month':
          period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        case 'quarter':
          const quarter = Math.ceil((date.getMonth() + 1) / 3);
          period = `${date.getFullYear()}-Q${quarter}`;
          break;
        default:
          period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      }

      if (!grouped[period]) {
        grouped[period] = { count: 0, value: 0, completed: 0 };
      }

      grouped[period].count++;
      grouped[period].value += Number(order.estimatedBudget || order.finalAmount || 0);
      if (order.status === 'COMPLETED') {
        grouped[period].completed++;
      }
    });

    return Object.entries(grouped).map(([period, data]) => ({
      period,
      count: data.count,
      value: data.value,
      completed: data.completed
    }));
  }

  private async getRecentActivity() {
    const recentOrders = await this.prisma.order.findMany({
      take: 5,
      orderBy: { updatedAt: 'desc' },
      include: {
        createdBy: { select: { name: true } }
      }
    });

    const recentCommunications = await this.prisma.orderCommunication.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        order: { select: { orderNumber: true } },
        createdBy: { select: { name: true } }
      }
    });

    const activity = [
      ...recentOrders.map(order => ({
        orderId: order.id,
        orderNumber: order.orderNumber,
        action: 'Orden actualizada',
        timestamp: order.updatedAt,
        user: order.createdBy.name
      })),
      ...recentCommunications.map(comm => ({
        orderId: comm.orderId,
        orderNumber: comm.order.orderNumber,
        action: `Comunicación: ${comm.type}`,
        timestamp: comm.createdAt,
        user: comm.createdBy.name
      }))
    ];

    return activity
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);
  }

  private calculateAverageCompletionTime(orders: { createdAt: Date; completedDate: Date | null }[]): number {
    if (orders.length === 0) return 0;

    const completionTimes = orders
      .filter(order => order.completedDate)
      .map(order => {
        const diffTime = Math.abs(order.completedDate!.getTime() - order.createdAt.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // días
      });

    return completionTimes.length > 0
      ? completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length
      : 0;
  }
} 