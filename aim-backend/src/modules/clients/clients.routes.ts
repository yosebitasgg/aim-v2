import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthMiddleware } from '@/shared/middleware/auth';
import { PermissionsMiddleware } from '@/shared/middleware/permissions';
import { ClientsController } from './clients.controller';

export function createClientsRoutes(prisma: PrismaClient): Router {
  const router = Router();
  const clientsController = new ClientsController(prisma);

  // Aplicar autenticación a todas las rutas
  router.use(AuthMiddleware.authenticate);

  /**
   * @route GET /api/clients/stats
   * @desc Obtener estadísticas de clientes
   * @access Requiere permisos de lectura de clientes
   * @query startDate?, endDate?, groupBy?
   */
  router.get(
    '/stats',
    PermissionsMiddleware.requirePermission('clients', 'read'),
    clientsController.getClientStats
  );

  /**
   * @route GET /api/clients
   * @desc Obtener todos los clientes con paginación y filtros
   * @access Requiere permisos de lectura de clientes
   * @query page?, limit?, search?, industry?, status?, companySize?, businessPotential?, referenceSource?, createdBy?, startDate?, endDate?, sortBy?, sortOrder?
   */
  router.get(
    '/',
    PermissionsMiddleware.requirePermission('clients', 'read'),
    clientsController.getClients
  );

  /**
   * @route GET /api/clients/:id
   * @desc Obtener un cliente por ID
   * @access Requiere permisos de lectura de clientes
   * @params id (client ID)
   */
  router.get(
    '/:id',
    PermissionsMiddleware.requirePermission('clients', 'read'),
    clientsController.getClientById
  );

  /**
   * @route POST /api/clients
   * @desc Crear un nuevo cliente
   * @access Requiere permisos de creación de clientes
   * @body CreateClientInput
   */
  router.post(
    '/',
    PermissionsMiddleware.requirePermission('clients', 'create'),
    clientsController.createClient
  );

  /**
   * @route PUT /api/clients/:id
   * @desc Actualizar un cliente existente
   * @access Requiere permisos de actualización de clientes
   * @params id (client ID)
   * @body UpdateClientInput
   */
  router.put(
    '/:id',
    PermissionsMiddleware.requirePermission('clients', 'update'),
    clientsController.updateClient
  );

  /**
   * @route DELETE /api/clients/:id
   * @desc Eliminar un cliente (soft delete)
   * @access Requiere permisos de eliminación de clientes
   * @params id (client ID)
   */
  router.delete(
    '/:id',
    PermissionsMiddleware.requirePermission('clients', 'delete'),
    clientsController.deleteClient
  );

  /**
   * @route POST /api/clients/:id/contacts
   * @desc Agregar contacto a un cliente
   * @access Requiere permisos de actualización de clientes
   * @params id (client ID)
   * @body CreateContactInput
   */
  router.post(
    '/:id/contacts',
    PermissionsMiddleware.requirePermission('clients', 'update'),
    clientsController.addContact
  );

  /**
   * @route POST /api/clients/:id/addresses
   * @desc Agregar dirección a un cliente
   * @access Requiere permisos de actualización de clientes
   * @params id (client ID)
   * @body CreateAddressInput
   */
  router.post(
    '/:id/addresses',
    PermissionsMiddleware.requirePermission('clients', 'update'),
    clientsController.addAddress
  );

  return router;
} 