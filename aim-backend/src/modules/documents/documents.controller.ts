import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { Logger } from '@/shared/utils/logger';
import { ApiResponseUtil } from '@/shared/utils/response';
import { DocumentsService } from './documents.service';
import {
  CreateDocumentTypeSchema,
  UpdateDocumentTypeSchema,
  CreateDocumentSchema,
  UpdateDocumentSchema,
  ChangeDocumentStatusSchema,
  DocumentFiltersSchema,
  DocumentStatsSchema,
  GenerateDocumentSchema,
  SendDocumentSchema,
  CreateDocumentVersionSchema,
  DocumentApiResponse,
  DocumentErrorCodes
} from './documents.types';

export class DocumentsController {
  private documentsService: DocumentsService;
  private logger: Logger;

  constructor(prisma: PrismaClient) {
    this.documentsService = new DocumentsService(prisma);
    this.logger = Logger.getInstance();
  }

  // ===== DOCUMENT TYPES =====

  /**
   * POST /api/documents/types
   * Crear un nuevo tipo de documento
   */
  createDocumentType = async (req: Request, res: Response): Promise<void> => {
    try {
      const validatedData = CreateDocumentTypeSchema.parse(req.body);
      const result = await this.documentsService.createDocumentType(validatedData);

      this.logger.info('Document type created successfully', {
        id: result.id,
        name: result.name,
        userId: (req as any).user?.id
      });

      ApiResponseUtil.success(res, result, 'Tipo de documento creado exitosamente', 201);
    } catch (error: any) {
      this.logger.error('Error creating document type', { error: error.message, body: req.body });
      
      if (error.name === 'ZodError') {
        ApiResponseUtil.validationError(res, error.errors);
        return;
      }
      
      ApiResponseUtil.error(res, error.message, 500);
    }
  };

  /**
   * GET /api/documents/types
   * Obtener lista de tipos de documentos
   */
  getDocumentTypes = async (req: Request, res: Response): Promise<void> => {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const result = await this.documentsService.getDocumentTypes(includeInactive);

      ApiResponseUtil.success(res, result, 'Tipos de documentos obtenidos exitosamente');
    } catch (error: any) {
      this.logger.error('Error getting document types', { error: error.message });
      ApiResponseUtil.error(res, error.message, 500);
    }
  };

  /**
   * GET /api/documents/types/:id
   * Obtener un tipo de documento por ID
   */
  getDocumentTypeById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.documentsService.getDocumentTypeById(id);

      ApiResponseUtil.success(res, result, 'Tipo de documento obtenido exitosamente');
    } catch (error: any) {
      this.logger.error('Error getting document type by id', { error: error.message, id: req.params.id });
      
      if (error.message === DocumentErrorCodes.DOCUMENT_TYPE_NOT_FOUND) {
        ApiResponseUtil.notFound(res, 'Tipo de documento no encontrado');
        return;
      }
      
      ApiResponseUtil.error(res, error.message, 500);
    }
  };

  /**
   * GET /api/documents/types/:id/form-definition
   * Obtener definición del formulario para un tipo de documento
   */
  getDocumentFormDefinition = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { orderId } = req.query;
      
      const result = await this.documentsService.getDocumentFormDefinition(id, orderId as string);

      ApiResponseUtil.success(res, result, 'Definición de formulario obtenida exitosamente');
    } catch (error: any) {
      this.logger.error('Error getting document form definition', { 
        error: error.message, 
        id: req.params.id,
        orderId: req.query.orderId 
      });
      
      if (error.message === DocumentErrorCodes.DOCUMENT_TYPE_NOT_FOUND) {
        ApiResponseUtil.notFound(res, 'Tipo de documento no encontrado');
        return;
      }
      
      ApiResponseUtil.error(res, error.message, 500);
    }
  };

  // ===== DOCUMENTS =====

  /**
   * GET /api/documents
   * Obtener lista de documentos con filtros y paginación
   */
  getDocuments = async (req: Request, res: Response): Promise<void> => {
    try {
      const validatedParams = DocumentFiltersSchema.parse({
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
        sortBy: req.query.sortBy || 'createdAt',
        sortOrder: req.query.sortOrder || 'desc',
        search: req.query.search,
        status: req.query.status,
        documentTypeId: req.query.documentTypeId,
        orderId: req.query.orderId,
        createdById: req.query.createdById,
        startDate: req.query.startDate,
        endDate: req.query.endDate
      });

      const result = await this.documentsService.getDocuments(validatedParams);

      this.logger.info('Documents retrieved successfully', {
        count: result.documents.length,
        total: result.pagination.total,
        filters: validatedParams
      });

      ApiResponseUtil.success(res, result, 'Documentos obtenidos exitosamente');
    } catch (error: any) {
      this.logger.error('Error getting documents', { error: error.message, query: req.query });
      
      if (error.name === 'ZodError') {
        ApiResponseUtil.validationError(res, error.errors);
        return;
      }
      
      ApiResponseUtil.error(res, error.message, 500);
    }
  };

  /**
   * GET /api/documents/:id
   * Obtener un documento por ID con detalles completos
   */
  getDocumentById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.documentsService.getDocumentById(id);

      this.logger.info('Document retrieved successfully', {
        id,
        documentNumber: result.documentNumber,
        title: result.title
      });

      ApiResponseUtil.success(res, result, 'Documento obtenido exitosamente');
    } catch (error: any) {
      this.logger.error('Error getting document by id', { error: error.message, id: req.params.id });
      
      if (error.message === DocumentErrorCodes.DOCUMENT_NOT_FOUND) {
        ApiResponseUtil.notFound(res, 'Documento no encontrado');
        return;
      }
      
      ApiResponseUtil.error(res, error.message, 500);
    }
  };

  /**
   * POST /api/documents
   * Crear un nuevo documento
   */
  createDocument = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        ApiResponseUtil.unauthorized(res, 'Usuario no autenticado');
        return;
      }

      const validatedData = CreateDocumentSchema.parse(req.body);
      const result = await this.documentsService.createDocument(validatedData, userId);

      this.logger.info('Document created successfully', {
        id: result.id,
        documentNumber: result.documentNumber,
        title: result.title,
        userId
      });

      ApiResponseUtil.success(res, result, 'Documento creado exitosamente', 201);
    } catch (error: any) {
      this.logger.error('Error creating document', { error: error.message, body: req.body });
      
      if (error.name === 'ZodError') {
        ApiResponseUtil.validationError(res, error.errors);
        return;
      }
      
      if (error.message === DocumentErrorCodes.ORDER_NOT_FOUND) {
        ApiResponseUtil.notFound(res, 'Orden no encontrada');
        return;
      }
      
      if (error.message === DocumentErrorCodes.DOCUMENT_TYPE_NOT_FOUND) {
        ApiResponseUtil.notFound(res, 'Tipo de documento no encontrado');
        return;
      }
      
      ApiResponseUtil.error(res, error.message, 500);
    }
  };

  /**
   * PUT /api/documents/:id
   * Actualizar un documento
   */
  updateDocument = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;
      
      if (!userId) {
        ApiResponseUtil.unauthorized(res, 'Usuario no autenticado');
        return;
      }

      const validatedData = UpdateDocumentSchema.parse(req.body);
      const result = await this.documentsService.updateDocument(id, validatedData, userId);

      this.logger.info('Document updated successfully', {
        id,
        documentNumber: result.documentNumber,
        userId
      });

      ApiResponseUtil.success(res, result, 'Documento actualizado exitosamente');
    } catch (error: any) {
      this.logger.error('Error updating document', { error: error.message, id: req.params.id, body: req.body });
      
      if (error.name === 'ZodError') {
        ApiResponseUtil.validationError(res, error.errors);
        return;
      }
      
      if (error.message === DocumentErrorCodes.DOCUMENT_NOT_FOUND) {
        ApiResponseUtil.notFound(res, 'Documento no encontrado');
        return;
      }
      
      if (error.message === DocumentErrorCodes.DOCUMENT_ALREADY_FINALIZED) {
        ApiResponseUtil.error(res, 'No se puede modificar un documento finalizado', 400);
        return;
      }
      
      ApiResponseUtil.error(res, error.message, 500);
    }
  };

  /**
   * PATCH /api/documents/:id/status
   * Cambiar el estado de un documento
   */
  changeDocumentStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;
      
      if (!userId) {
        ApiResponseUtil.unauthorized(res, 'Usuario no autenticado');
        return;
      }

      const validatedData = ChangeDocumentStatusSchema.parse(req.body);
      const result = await this.documentsService.changeDocumentStatus(id, validatedData, userId);

      this.logger.info('Document status changed successfully', {
        id,
        documentNumber: result.documentNumber,
        newStatus: validatedData.status,
        userId
      });

      ApiResponseUtil.success(res, result, `Estado del documento cambiado a ${validatedData.status}`);
    } catch (error: any) {
      this.logger.error('Error changing document status', { 
        error: error.message, 
        id: req.params.id, 
        body: req.body 
      });
      
      if (error.name === 'ZodError') {
        ApiResponseUtil.validationError(res, error.errors);
        return;
      }
      
      if (error.message === DocumentErrorCodes.DOCUMENT_NOT_FOUND) {
        ApiResponseUtil.notFound(res, 'Documento no encontrado');
        return;
      }
      
      if (error.message === DocumentErrorCodes.INVALID_STATUS_TRANSITION) {
        ApiResponseUtil.error(res, 'Transición de estado no válida', 400);
        return;
      }
      
      ApiResponseUtil.error(res, error.message, 500);
    }
  };

  /**
   * POST /api/documents/:id/generate
   * Generar archivo del documento (PDF, JPG, PNG)
   */
  generateDocument = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;
      
      if (!userId) {
        ApiResponseUtil.unauthorized(res, 'Usuario no autenticado');
        return;
      }

      const validatedData = GenerateDocumentSchema.parse(req.body);
      const result = await this.documentsService.generateDocument(id, validatedData, userId);

      this.logger.info('Document generated successfully', {
        id,
        format: validatedData.format,
        filename: result.filename,
        userId
      });

      ApiResponseUtil.success(res, result, 'Documento generado exitosamente');
    } catch (error: any) {
      this.logger.error('Error generating document', { 
        error: error.message, 
        id: req.params.id, 
        body: req.body 
      });
      
      if (error.name === 'ZodError') {
        ApiResponseUtil.validationError(res, error.errors);
        return;
      }
      
      if (error.message === DocumentErrorCodes.DOCUMENT_NOT_FOUND) {
        ApiResponseUtil.notFound(res, 'Documento no encontrado');
        return;
      }
      
      if (error.message === DocumentErrorCodes.GENERATION_FAILED) {
        ApiResponseUtil.error(res, 'Error al generar el documento', 500);
        return;
      }
      
      ApiResponseUtil.error(res, error.message, 500);
    }
  };

  /**
   * POST /api/documents/:id/send-email
   * Enviar documento por email
   */
  sendDocumentByEmail = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;
      
      if (!userId) {
        ApiResponseUtil.unauthorized(res, 'Usuario no autenticado');
        return;
      }

      const validatedData = SendDocumentSchema.parse(req.body);
      await this.documentsService.sendDocumentByEmail(id, validatedData, userId);

      this.logger.info('Document sent by email successfully', {
        id,
        recipients: validatedData.recipients,
        subject: validatedData.subject,
        userId
      });

      ApiResponseUtil.success(res, null, 'Documento enviado por email exitosamente');
    } catch (error: any) {
      this.logger.error('Error sending document by email', { 
        error: error.message, 
        id: req.params.id, 
        body: req.body 
      });
      
      if (error.name === 'ZodError') {
        ApiResponseUtil.validationError(res, error.errors);
        return;
      }
      
      if (error.message === DocumentErrorCodes.DOCUMENT_NOT_FOUND) {
        ApiResponseUtil.notFound(res, 'Documento no encontrado');
        return;
      }
      
      if (error.message === DocumentErrorCodes.EMAIL_SEND_FAILED) {
        ApiResponseUtil.error(res, 'Error al enviar el email', 500);
        return;
      }
      
      ApiResponseUtil.error(res, error.message, 500);
    }
  };

  /**
   * GET /api/documents/stats
   * Obtener estadísticas de documentos
   */
  getDocumentStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const validatedParams = DocumentStatsSchema.parse({
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        groupBy: req.query.groupBy || 'day',
        orderId: req.query.orderId,
        documentTypeId: req.query.documentTypeId
      });

      const result = await this.documentsService.getDocumentStats(validatedParams);

      this.logger.info('Document stats retrieved successfully', {
        totalDocuments: result.overview.totalDocuments,
        params: validatedParams
      });

      ApiResponseUtil.success(res, result, 'Estadísticas de documentos obtenidas exitosamente');
    } catch (error: any) {
      this.logger.error('Error getting document stats', { error: error.message, query: req.query });
      
      if (error.name === 'ZodError') {
        ApiResponseUtil.validationError(res, error.errors);
        return;
      }
      
      ApiResponseUtil.error(res, error.message, 500);
    }
  };

  /**
   * GET /api/documents/:id/download/:format
   * Descargar archivo generado del documento
   */
  downloadDocument = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id, format } = req.params;
      const userId = (req as any).user?.id;
      
      if (!userId) {
        ApiResponseUtil.unauthorized(res, 'Usuario no autenticado');
        return;
      }

      // Validar formato
      if (!['pdf', 'jpg', 'png'].includes(format)) {
        ApiResponseUtil.error(res, 'Formato no válido', 400);
        return;
      }

      const result = await this.documentsService.generateDocument(id, { format } as any, userId);

      this.logger.info('Document download initiated', {
        id,
        format,
        filename: result.filename,
        userId
      });

      // En un caso real, aquí se serviría el archivo
      // Por ahora, devolvemos la URL
      ApiResponseUtil.success(res, result, 'Descarga iniciada exitosamente');
    } catch (error: any) {
      this.logger.error('Error downloading document', { 
        error: error.message, 
        id: req.params.id, 
        format: req.params.format 
      });
      
      if (error.message === DocumentErrorCodes.DOCUMENT_NOT_FOUND) {
        ApiResponseUtil.notFound(res, 'Documento no encontrado');
        return;
      }
      
      ApiResponseUtil.error(res, error.message, 500);
    }
  };

  /**
   * GET /api/documents/by-order/:orderId
   * Obtener documentos de una orden específica
   */
  getDocumentsByOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      const { orderId } = req.params;
      
      const validatedParams = DocumentFiltersSchema.parse({
        orderId,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
        sortBy: req.query.sortBy || 'createdAt',
        sortOrder: req.query.sortOrder || 'desc'
      });

      const result = await this.documentsService.getDocuments(validatedParams);

      this.logger.info('Documents by order retrieved successfully', {
        orderId,
        count: result.documents.length
      });

      ApiResponseUtil.success(res, result, 'Documentos de la orden obtenidos exitosamente');
    } catch (error: any) {
      this.logger.error('Error getting documents by order', { 
        error: error.message, 
        orderId: req.params.orderId 
      });
      
      if (error.name === 'ZodError') {
        ApiResponseUtil.validationError(res, error.errors);
        return;
      }
      
      ApiResponseUtil.error(res, error.message, 500);
    }
  };
} 