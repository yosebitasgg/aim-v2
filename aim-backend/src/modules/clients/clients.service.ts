import { PrismaClient, Client, ClientContact, ClientAddress } from '@prisma/client';
import { logger } from '@/shared/utils/logger';
import {
  CreateClientInput,
  UpdateClientInput,
  ClientFilters,
  CreateContactInput,
  CreateAddressInput,
  ClientStatsInput,
  ClientResponse,
  ContactResponse,
  AddressResponse,
  PaginatedClientsResponse,
  ClientStatsResponse,
  CLIENT_STATUS,
  INDUSTRIES,
} from './clients.types';

export class ClientsService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Crear un nuevo cliente con contacto y dirección principal
   */
  async createClient(data: CreateClientInput, createdBy?: string): Promise<ClientResponse> {
    try {
      // Validar que no exista un cliente con el mismo RFC (si se proporciona)
      if (data.rfc) {
        const existingClient = await this.prisma.client.findUnique({
          where: { rfc: data.rfc },
        });

        if (existingClient) {
          throw new Error('Ya existe un cliente con este RFC');
        }
      }

      // Crear cliente con contacto y dirección en transacción
      const client = await this.prisma.$transaction(async (tx) => {
        // Crear cliente principal
        const newClient = await tx.client.create({
          data: {
            companyName: data.companyName,
            rfc: data.rfc || null,
            industry: data.industry,
            companySize: data.companySize || null,
            website: data.website || null,
            status: data.status || CLIENT_STATUS.PROSPECTO,
            referenceSource: data.referenceSource || null,
            businessPotential: data.businessPotential || null,
            notes: data.notes || null,
            clientSince: data.clientSince ? new Date(data.clientSince) : new Date(),
            createdBy: createdBy || null,
          },
        });

        // Crear contacto principal
        await tx.clientContact.create({
          data: {
            clientId: newClient.id,
            fullName: data.contact.fullName,
            position: data.contact.position || null,
            email: data.contact.email,
            phone: data.contact.phone,
            alternativePhone: data.contact.alternativePhone || null,
            department: data.contact.department || null,
            isPrimary: true,
          },
        });

        // Crear dirección principal
        await tx.clientAddress.create({
          data: {
            clientId: newClient.id,
            type: data.address.type,
            street: data.address.street,
            interiorNumber: data.address.interiorNumber || null,
            neighborhood: data.address.neighborhood,
            postalCode: data.address.postalCode,
            city: data.address.city,
            state: data.address.state,
            country: data.address.country,
            isPrimary: true,
          },
        });

        return newClient;
      });

      logger.info('Cliente creado exitosamente', {
        clientId: client.id,
        companyName: client.companyName,
        createdBy,
      });

      // Obtener cliente completo con relaciones
      return await this.getClientById(client.id);
    } catch (error) {
      logger.error('Error creando cliente', { error, data, createdBy });
      throw error;
    }
  }

  /**
   * Obtener todos los clientes con filtros y paginación
   */
  async getClients(filters: ClientFilters): Promise<PaginatedClientsResponse> {
    try {
      logger.info('Obteniendo clientes con filtros', { filters });
      
      const where: any = {
        isActive: true,
      };

      // Aplicar filtros
      if (filters.search) {
        where.OR = [
          { companyName: { contains: filters.search, mode: 'insensitive' } },
          { rfc: { contains: filters.search, mode: 'insensitive' } },
          { contacts: { some: { fullName: { contains: filters.search, mode: 'insensitive' } } } },
          { contacts: { some: { email: { contains: filters.search, mode: 'insensitive' } } } },
        ];
      }

      if (filters.industry) where.industry = filters.industry;
      if (filters.status) where.status = filters.status;
      if (filters.companySize) where.companySize = filters.companySize;
      if (filters.businessPotential) where.businessPotential = filters.businessPotential;
      if (filters.referenceSource) where.referenceSource = filters.referenceSource;
      if (filters.createdBy) where.createdBy = filters.createdBy;

      // Filtros de fecha
      if (filters.startDate || filters.endDate) {
        where.createdAt = {};
        if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
        if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
      }

      logger.info('Query where construida', { where });

      // Obtener total para paginación
      const total = await this.prisma.client.count({ where });
      logger.info('Total de clientes encontrados', { total });

      // Obtener clientes con paginación
      const clients = await this.prisma.client.findMany({
        where,
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          contacts: {
            where: { isActive: true },
            orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
          },
          addresses: {
            where: { isActive: true },
            orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
          },
        },
        orderBy: {
          [filters.sortBy]: filters.sortOrder,
        },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      });

      logger.info('Clientes obtenidos de base de datos', { 
        count: clients.length,
        page: filters.page,
        limit: filters.limit 
      });

      const pages = Math.ceil(total / filters.limit);

      const result = {
        clients: clients.map(client => this.mapClientToResponse(client)),
        pagination: {
          total,
          page: filters.page,
          limit: filters.limit,
          pages,
        },
        filters,
      };

      logger.info('Respuesta preparada exitosamente', { 
        clientsCount: result.clients.length,
        pagination: result.pagination 
      });

      return result;
    } catch (error) {
      logger.error('Error obteniendo clientes', { 
        error: {
          message: error instanceof Error ? error.message : 'Error desconocido',
          stack: error instanceof Error ? error.stack : undefined,
          name: error instanceof Error ? error.name : undefined,
          type: typeof error,
          toString: error?.toString?.() || 'No toString available'
        }, 
        filters 
      });
      throw new Error(`Error al obtener los clientes: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Obtener un cliente por ID
   */
  async getClientById(id: string): Promise<ClientResponse> {
    try {
      const client = await this.prisma.client.findUnique({
        where: { id, isActive: true },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          contacts: {
            where: { isActive: true },
            orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
          },
          addresses: {
            where: { isActive: true },
            orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
          },
        },
      });

      if (!client) {
        throw new Error('Cliente no encontrado');
      }

      return this.mapClientToResponse(client);
    } catch (error) {
      logger.error('Error obteniendo cliente por ID', { error, id });
      throw error;
    }
  }

  /**
   * Actualizar un cliente
   */
  async updateClient(id: string, data: UpdateClientInput): Promise<ClientResponse> {
    try {
      // Verificar que el cliente existe
      const existingClient = await this.prisma.client.findUnique({
        where: { id, isActive: true },
      });

      if (!existingClient) {
        throw new Error('Cliente no encontrado');
      }

      // Verificar RFC único si se está actualizando
      if (data.rfc && data.rfc !== existingClient.rfc) {
        const rfcExists = await this.prisma.client.findFirst({
          where: {
            rfc: data.rfc,
            id: { not: id },
            isActive: true,
          },
        });

        if (rfcExists) {
          throw new Error('Ya existe un cliente con este RFC');
        }
      }

      // Actualizar cliente
      const updatedClient = await this.prisma.client.update({
        where: { id },
        data: {
          companyName: data.companyName,
          rfc: data.rfc,
          industry: data.industry,
          companySize: data.companySize,
          website: data.website,
          status: data.status,
          referenceSource: data.referenceSource,
          businessPotential: data.businessPotential,
          notes: data.notes,
          clientSince: data.clientSince ? new Date(data.clientSince) : undefined,
          isActive: data.isActive,
        },
      });

      logger.info('Cliente actualizado exitosamente', {
        clientId: id,
        companyName: updatedClient.companyName,
      });

      return await this.getClientById(id);
    } catch (error) {
      logger.error('Error actualizando cliente', { error, id, data });
      throw error;
    }
  }

  /**
   * Eliminar un cliente (soft delete)
   */
  async deleteClient(id: string): Promise<void> {
    try {
      const client = await this.prisma.client.findUnique({
        where: { id, isActive: true },
      });

      if (!client) {
        throw new Error('Cliente no encontrado');
      }

      // Soft delete del cliente y sus relaciones
      await this.prisma.$transaction(async (tx) => {
        // Desactivar cliente
        await tx.client.update({
          where: { id },
          data: { isActive: false },
        });

        // Desactivar contactos
        await tx.clientContact.updateMany({
          where: { clientId: id },
          data: { isActive: false },
        });

        // Desactivar direcciones
        await tx.clientAddress.updateMany({
          where: { clientId: id },
          data: { isActive: false },
        });
      });

      logger.info('Cliente eliminado exitosamente', {
        clientId: id,
        companyName: client.companyName,
      });
    } catch (error) {
      logger.error('Error eliminando cliente', { error, id });
      throw error;
    }
  }

  /**
   * Agregar contacto adicional a un cliente
   */
  async addContact(data: CreateContactInput): Promise<ContactResponse> {
    try {
      // Verificar que el cliente existe
      const client = await this.prisma.client.findUnique({
        where: { id: data.clientId, isActive: true },
      });

      if (!client) {
        throw new Error('Cliente no encontrado');
      }

      // Si es contacto principal, desactivar otros principales
      if (data.isPrimary) {
        await this.prisma.clientContact.updateMany({
          where: { clientId: data.clientId, isPrimary: true },
          data: { isPrimary: false },
        });
      }

      const contact = await this.prisma.clientContact.create({
        data: {
          clientId: data.clientId,
          fullName: data.fullName,
          position: data.position || null,
          email: data.email,
          phone: data.phone,
          alternativePhone: data.alternativePhone || null,
          department: data.department || null,
          isPrimary: data.isPrimary,
        },
      });

      logger.info('Contacto agregado exitosamente', {
        contactId: contact.id,
        clientId: data.clientId,
        fullName: contact.fullName,
      });

      return this.mapContactToResponse(contact);
    } catch (error) {
      logger.error('Error agregando contacto', { error, data });
      throw error;
    }
  }

  /**
   * Agregar dirección adicional a un cliente
   */
  async addAddress(data: CreateAddressInput): Promise<AddressResponse> {
    try {
      // Verificar que el cliente existe
      const client = await this.prisma.client.findUnique({
        where: { id: data.clientId, isActive: true },
      });

      if (!client) {
        throw new Error('Cliente no encontrado');
      }

      // Si es dirección principal, desactivar otras principales del mismo tipo
      if (data.isPrimary) {
        await this.prisma.clientAddress.updateMany({
          where: { 
            clientId: data.clientId, 
            type: data.type, 
            isPrimary: true 
          },
          data: { isPrimary: false },
        });
      }

      const address = await this.prisma.clientAddress.create({
        data: {
          clientId: data.clientId,
          type: data.type,
          street: data.street,
          interiorNumber: data.interiorNumber || null,
          neighborhood: data.neighborhood,
          postalCode: data.postalCode,
          city: data.city,
          state: data.state,
          country: data.country,
          isPrimary: data.isPrimary,
        },
      });

      logger.info('Dirección agregada exitosamente', {
        addressId: address.id,
        clientId: data.clientId,
        type: address.type,
      });

      return this.mapAddressToResponse(address);
    } catch (error) {
      logger.error('Error agregando dirección', { error, data });
      throw error;
    }
  }

  /**
   * Obtener estadísticas de clientes
   */
  async getClientStats(params: ClientStatsInput): Promise<ClientStatsResponse> {
    try {
      const where: any = { isActive: true };

      // Filtros de fecha
      if (params.startDate || params.endDate) {
        where.createdAt = {};
        if (params.startDate) where.createdAt.gte = new Date(params.startDate);
        if (params.endDate) where.createdAt.lte = new Date(params.endDate);
      }

      // Estadísticas básicas
      const totalClients = await this.prisma.client.count({ where });
      const activeClients = await this.prisma.client.count({
        where: { ...where, status: CLIENT_STATUS.ACTIVO },
      });

      // Nuevos clientes este mes
      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);
      
      const newThisMonth = await this.prisma.client.count({
        where: {
          ...where,
          createdAt: { gte: thisMonth },
        },
      });

      // Valor promedio (simulado por ahora, se calculará con órdenes reales)
      const clientsWithValue = await this.prisma.client.findMany({
        where: { ...where, totalValue: { not: null } },
        select: { totalValue: true },
      });

      const averageValue = clientsWithValue.length > 0
        ? clientsWithValue.reduce((sum, client) => sum + Number(client.totalValue || 0), 0) / clientsWithValue.length
        : 0;

      // Clientes por industria
      const clientsByIndustry = await this.prisma.client.groupBy({
        by: ['industry'],
        where,
        _count: true,
      });

      // Clientes por estado
      const clientsByStatus = await this.prisma.client.groupBy({
        by: ['status'],
        where,
        _count: true,
      });

      // Clientes por tamaño
      const clientsBySize = await this.prisma.client.groupBy({
        by: ['companySize'],
        where: { ...where, companySize: { not: null } },
        _count: true,
      });

      // Top clientes (simulado por ahora)
      const topClients = await this.prisma.client.findMany({
        where: { ...where, totalValue: { not: null } },
        orderBy: { totalValue: 'desc' },
        take: 10,
        select: {
          id: true,
          companyName: true,
          totalValue: true,
        },
      });

      // Crecimiento (mes anterior vs este mes)
      const lastMonth = new Date(thisMonth);
      lastMonth.setMonth(lastMonth.getMonth() - 1);

      const newLastMonth = await this.prisma.client.count({
        where: {
          ...where,
          createdAt: { gte: lastMonth, lt: thisMonth },
        },
      });

      const clientGrowth = newLastMonth > 0 ? ((newThisMonth - newLastMonth) / newLastMonth) * 100 : 0;

      return {
        totalClients,
        activeClients,
        newThisMonth,
        averageValue,
        clientsByIndustry: this.mapGroupByToRecord(clientsByIndustry, 'industry'),
        clientsByStatus: this.mapGroupByToRecord(clientsByStatus, 'status'),
        clientsBySize: this.mapGroupByToRecord(clientsBySize, 'companySize'),
        clientsOverTime: await this.getClientsOverTime(where, params.groupBy),
        topClients: topClients.map(client => ({
          id: client.id,
          companyName: client.companyName,
          totalValue: Number(client.totalValue || 0),
          ordersCount: 0, // Se calculará con órdenes reales
        })),
        growthMetrics: {
          clientGrowth,
          valueGrowth: 0, // Se calculará con datos históricos
          monthlyNewClients: newThisMonth,
          monthlyNewValue: 0, // Se calculará con órdenes
        },
      };
    } catch (error) {
      logger.error('Error obteniendo estadísticas de clientes', { error, params });
      throw new Error('Error al obtener las estadísticas de clientes');
    }
  }

  /**
   * Mapear cliente de Prisma a respuesta
   */
  private mapClientToResponse(client: Client & { 
    creator?: any; 
    contacts: ClientContact[]; 
    addresses: ClientAddress[] 
  }): ClientResponse {
    const primaryContact = client.contacts.find(c => c.isPrimary) || client.contacts[0];
    const primaryAddress = client.addresses.find(a => a.isPrimary) || client.addresses[0];

    return {
      id: client.id,
      companyName: client.companyName,
      rfc: client.rfc || undefined,
      industry: client.industry,
      companySize: client.companySize || undefined,
      website: client.website || undefined,
      status: client.status,
      referenceSource: client.referenceSource || undefined,
      businessPotential: client.businessPotential || undefined,
      notes: client.notes || undefined,
      totalValue: client.totalValue ? Number(client.totalValue) : undefined,
      clientSince: client.clientSince || undefined,
      isActive: client.isActive,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
      createdBy: client.createdBy || undefined,
      creator: client.creator || undefined,
      contacts: client.contacts.map(contact => this.mapContactToResponse(contact)),
      addresses: client.addresses.map(address => this.mapAddressToResponse(address)),
      primaryContact: primaryContact ? this.mapContactToResponse(primaryContact) : undefined,
      primaryAddress: primaryAddress ? this.mapAddressToResponse(primaryAddress) : undefined,
      ordersCount: 0, // Se calculará con órdenes reales
    };
  }

  /**
   * Mapear contacto de Prisma a respuesta
   */
  private mapContactToResponse(contact: ClientContact): ContactResponse {
    return {
      id: contact.id,
      clientId: contact.clientId,
      fullName: contact.fullName,
      position: contact.position || undefined,
      email: contact.email,
      phone: contact.phone,
      alternativePhone: contact.alternativePhone || undefined,
      department: contact.department || undefined,
      isPrimary: contact.isPrimary,
      isActive: contact.isActive,
      createdAt: contact.createdAt,
      updatedAt: contact.updatedAt,
    };
  }

  /**
   * Mapear dirección de Prisma a respuesta
   */
  private mapAddressToResponse(address: ClientAddress): AddressResponse {
    return {
      id: address.id,
      clientId: address.clientId,
      type: address.type,
      street: address.street,
      interiorNumber: address.interiorNumber || undefined,
      neighborhood: address.neighborhood,
      postalCode: address.postalCode,
      city: address.city,
      state: address.state,
      country: address.country,
      isPrimary: address.isPrimary,
      isActive: address.isActive,
      createdAt: address.createdAt,
      updatedAt: address.updatedAt,
    };
  }

  /**
   * Mapear resultados de groupBy a record
   */
  private mapGroupByToRecord(groupData: any[], field: string): Record<string, number> {
    const result: Record<string, number> = {};
    groupData.forEach(item => {
      const key = item[field] || 'sin_especificar';
      result[key] = item._count;
    });
    return result;
  }

  /**
   * Obtener clientes a lo largo del tiempo
   */
  private async getClientsOverTime(where: any, groupBy: string): Promise<Array<{ period: string; count: number; value: number }>> {
    // Implementación simplificada - en producción se puede usar queries más sofisticadas
    const clients = await this.prisma.client.findMany({
      where,
      select: { 
        createdAt: true, 
        totalValue: true 
      },
      orderBy: { createdAt: 'asc' }
    });

    const grouped: Record<string, { count: number; value: number }> = {};
    
    clients.forEach(client => {
      let period: string;
      const date = client.createdAt;
      
      switch (groupBy) {
        case 'day':
          period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          period = `${weekStart.getFullYear()}-W${Math.ceil(weekStart.getDate() / 7)}`;
          break;
        case 'month':
        default:
          period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }
      
      if (!grouped[period]) {
        grouped[period] = { count: 0, value: 0 };
      }
      
      grouped[period].count += 1;
      grouped[period].value += Number(client.totalValue || 0);
    });

    return Object.entries(grouped).map(([period, data]) => ({
      period,
      count: data.count,
      value: data.value,
    }));
  }
} 