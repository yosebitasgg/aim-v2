import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { DocumentsController } from './documents.controller';
import { AuthMiddleware } from '@/shared/middleware/auth';
import { PermissionsMiddleware } from '@/shared/middleware/permissions';

export function createDocumentsRoutes(prisma: PrismaClient): Router {
  const router = Router();
  const documentsController = new DocumentsController(prisma);

  // Aplicar autenticación a todas las rutas
  router.use(AuthMiddleware.authenticate);

  // ===== DOCUMENT TYPES ROUTES =====

  /**
   * @route POST /api/documents/types
   * @desc Crear un nuevo tipo de documento
   * @access Requiere permisos de creación de documentos
   */
  router.post(
    '/types',
    PermissionsMiddleware.requirePermission('documents', 'create'),
    documentsController.createDocumentType
  );

  /**
   * @route GET /api/documents/types
   * @desc Obtener lista de tipos de documentos
   * @access Requiere permisos de lectura de documentos
   */
  router.get(
    '/types',
    PermissionsMiddleware.requirePermission('documents', 'read'),
    documentsController.getDocumentTypes
  );

  /**
   * @route GET /api/documents/types/:id
   * @desc Obtener un tipo de documento por ID
   * @access Requiere permisos de lectura de documentos
   */
  router.get(
    '/types/:id',
    PermissionsMiddleware.requirePermission('documents', 'read'),
    documentsController.getDocumentTypeById
  );

  /**
   * @route GET /api/documents/types/:id/form-definition
   * @desc Obtener definición del formulario para un tipo de documento
   * @access Requiere permisos de lectura de documentos
   */
  router.get(
    '/types/:id/form-definition',
    PermissionsMiddleware.requirePermission('documents', 'read'),
    documentsController.getDocumentFormDefinition
  );

  // ===== DOCUMENTS ROUTES =====

  /**
   * @route GET /api/documents/stats
   * @desc Obtener estadísticas de documentos
   * @access Requiere permisos de lectura de reportes
   * @params query: startDate?, endDate?, groupBy?, orderId?, documentTypeId?
   */
  router.get(
    '/stats',
    PermissionsMiddleware.requirePermission('reports', 'read'),
    documentsController.getDocumentStats
  );

  /**
   * @route GET /api/documents/by-order/:orderId
   * @desc Obtener documentos de una orden específica
   * @access Requiere permisos de lectura de documentos
   */
  router.get(
    '/by-order/:orderId',
    PermissionsMiddleware.requirePermission('documents', 'read'),
    documentsController.getDocumentsByOrder
  );

  /**
   * @route GET /api/documents
   * @desc Obtener lista de documentos con filtros y paginación
   * @access Requiere permisos de lectura de documentos
   * @params query: page?, limit?, sortBy?, sortOrder?, search?, status?, documentTypeId?, orderId?, createdById?, startDate?, endDate?
   */
  router.get(
    '/',
    PermissionsMiddleware.requirePermission('documents', 'read'),
    documentsController.getDocuments
  );

  /**
   * @route POST /api/documents
   * @desc Crear un nuevo documento
   * @access Requiere permisos de creación de documentos
   * @body { orderId, documentTypeId, title, description?, sharedData, specificData, metadata? }
   */
  router.post(
    '/',
    PermissionsMiddleware.requirePermission('documents', 'create'),
    documentsController.createDocument
  );

  /**
   * @route GET /api/documents/:id
   * @desc Obtener un documento por ID con detalles completos
   * @access Requiere permisos de lectura de documentos
   */
  router.get(
    '/:id',
    PermissionsMiddleware.requirePermission('documents', 'read'),
    documentsController.getDocumentById
  );

  /**
   * @route PUT /api/documents/:id
   * @desc Actualizar un documento
   * @access Requiere permisos de actualización de documentos
   * @body { title?, description?, sharedData?, specificData?, metadata? }
   */
  router.put(
    '/:id',
    PermissionsMiddleware.requirePermission('documents', 'update'),
    documentsController.updateDocument
  );

  /**
   * @route PATCH /api/documents/:id/status
   * @desc Cambiar el estado de un documento
   * @access Requiere permisos de actualización de documentos
   * @body { status, notes?, approvalData? }
   */
  router.patch(
    '/:id/status',
    PermissionsMiddleware.requirePermission('documents', 'update'),
    documentsController.changeDocumentStatus
  );

  /**
   * @route POST /api/documents/:id/generate
   * @desc Generar archivo del documento (PDF, JPG, PNG)
   * @access Requiere permisos de lectura de documentos
   * @body { format, options? }
   */
  router.post(
    '/:id/generate',
    PermissionsMiddleware.requirePermission('documents', 'read'),
    documentsController.generateDocument
  );

  /**
   * @route GET /api/documents/:id/download/:format
   * @desc Descargar archivo generado del documento
   * @access Requiere permisos de lectura de documentos
   * @params format: pdf|jpg|png
   */
  router.get(
    '/:id/download/:format',
    PermissionsMiddleware.requirePermission('documents', 'read'),
    documentsController.downloadDocument
  );

  /**
   * @route POST /api/documents/:id/send-email
   * @desc Enviar documento por email
   * @access Requiere permisos de lectura de documentos
   * @body { recipients[], subject, body, format?, copyToSender? }
   */
  router.post(
    '/:id/send-email',
    PermissionsMiddleware.requirePermission('documents', 'read'),
    documentsController.sendDocumentByEmail
  );

  return router;
} 