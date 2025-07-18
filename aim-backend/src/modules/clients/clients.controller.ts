import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ApiResponseUtil } from '@/shared/utils/response';
import { logger } from '@/shared/utils/logger';
import { 
  ClientsService
} from './clients.service';
import {
  CreateClientSchema,
  UpdateClientSchema,
  ClientFiltersSchema,
  CreateContactSchema,
  CreateAddressSchema,
  ClientStatsSchema,
  CreateClientInput,
  UpdateClientInput,
  ClientFilters,
  CreateContactInput,
  CreateAddressInput,
  ClientStatsInput
} from './clients.types';

export class ClientsController {
  private clientsService: ClientsService;

  constructor(prisma: PrismaClient) {
    this.clientsService = new ClientsService(prisma);
  }

  /**
   * GET /api/clients
   * Obtener todos los clientes con paginación y filtros
   */
  getClients = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validar parámetros de consulta
      const validationResult = ClientFiltersSchema.safeParse({
        ...req.query,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
      });

      if (!validationResult.success) {
        ApiResponseUtil.validationError(res, validationResult.error.issues);
        return;
      }

      const result = await this.clientsService.getClients(validationResult.data);

      ApiResponseUtil.success(res, result, 'Clientes obtenidos exitosamente');
    } catch (error: any) {
      logger.error('Error en get clients controller', { error, query: req.query });
      ApiResponseUtil.error(res, error.message, 500);
    }
  };

  /**
   * GET /api/clients/:id
   * Obtener un cliente por ID
   */
  getClientById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const client = await this.clientsService.getClientById(id);

      ApiResponseUtil.success(res, client, 'Cliente obtenido exitosamente');
    } catch (error: any) {
      logger.error('Error en get client by id controller', { error, id: req.params.id });
      ApiResponseUtil.error(res, error.message, error.message === 'Cliente no encontrado' ? 404 : 500);
    }
  };

  /**
   * POST /api/clients
   * Crear un nuevo cliente
   */
  createClient = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validar datos de entrada
      const validationResult = CreateClientSchema.safeParse(req.body);

      if (!validationResult.success) {
        ApiResponseUtil.validationError(res, validationResult.error.issues);
        return;
      }

      const userId = req.user?.id;
      const client = await this.clientsService.createClient(validationResult.data, userId);

      ApiResponseUtil.success(res, client, 'Cliente creado exitosamente', 201);
    } catch (error: any) {
      logger.error('Error en create client controller', { error, body: req.body });
      ApiResponseUtil.error(res, error.message, 500);
    }
  };

  /**
   * PUT /api/clients/:id
   * Actualizar un cliente existente
   */
  updateClient = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      // Validar datos de entrada
      const validationResult = UpdateClientSchema.safeParse(req.body);

      if (!validationResult.success) {
        ApiResponseUtil.validationError(res, validationResult.error.issues);
        return;
      }

      const client = await this.clientsService.updateClient(id, validationResult.data);

      ApiResponseUtil.success(res, client, 'Cliente actualizado exitosamente');
    } catch (error: any) {
      logger.error('Error en update client controller', { error, id: req.params.id, body: req.body });
      ApiResponseUtil.error(res, error.message, error.message === 'Cliente no encontrado' ? 404 : 500);
    }
  };

  /**
   * DELETE /api/clients/:id
   * Eliminar un cliente (soft delete)
   */
  deleteClient = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      await this.clientsService.deleteClient(id);

      ApiResponseUtil.success(res, null, 'Cliente eliminado exitosamente');
    } catch (error: any) {
      logger.error('Error en delete client controller', { error, id: req.params.id });
      ApiResponseUtil.error(res, error.message, error.message === 'Cliente no encontrado' ? 404 : 500);
    }
  };

  /**
   * POST /api/clients/:id/contacts
   * Agregar contacto a un cliente
   */
  addContact = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      // Validar datos de entrada
      const validationResult = CreateContactSchema.safeParse({
        ...req.body,
        clientId: id,
      });

      if (!validationResult.success) {
        ApiResponseUtil.validationError(res, validationResult.error.issues);
        return;
      }

      const contact = await this.clientsService.addContact(validationResult.data);

      ApiResponseUtil.success(res, contact, 'Contacto agregado exitosamente', 201);
    } catch (error: any) {
      logger.error('Error en add contact controller', { error, id: req.params.id, body: req.body });
      ApiResponseUtil.error(res, error.message, error.message === 'Cliente no encontrado' ? 404 : 500);
    }
  };

  /**
   * POST /api/clients/:id/addresses
   * Agregar dirección a un cliente
   */
  addAddress = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      // Validar datos de entrada
      const validationResult = CreateAddressSchema.safeParse({
        ...req.body,
        clientId: id,
      });

      if (!validationResult.success) {
        ApiResponseUtil.validationError(res, validationResult.error.issues);
        return;
      }

      const address = await this.clientsService.addAddress(validationResult.data);

      ApiResponseUtil.success(res, address, 'Dirección agregada exitosamente', 201);
    } catch (error: any) {
      logger.error('Error en add address controller', { error, id: req.params.id, body: req.body });
      ApiResponseUtil.error(res, error.message, error.message === 'Cliente no encontrado' ? 404 : 500);
    }
  };

  /**
   * GET /api/clients/stats
   * Obtener estadísticas de clientes
   */
  getClientStats = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validar parámetros de consulta
      const validationResult = ClientStatsSchema.safeParse(req.query);

      if (!validationResult.success) {
        ApiResponseUtil.validationError(res, validationResult.error.issues);
        return;
      }

      const stats = await this.clientsService.getClientStats(validationResult.data);

      ApiResponseUtil.success(res, stats, 'Estadísticas obtenidas exitosamente');
    } catch (error: any) {
      logger.error('Error en get client stats controller', { error, query: req.query });
      ApiResponseUtil.error(res, error.message, 500);
    }
  };
} 