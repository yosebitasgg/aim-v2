import { PrismaClient } from '@prisma/client';
import { Logger } from '@/shared/utils/logger';
import * as fs from 'fs';
import * as path from 'path';
import {
  CreateDocumentTypeInput,
  UpdateDocumentTypeInput,
  CreateDocumentInput,
  UpdateDocumentInput,
  ChangeDocumentStatusInput,
  DocumentFilters,
  DocumentStatsInput,
  GenerateDocumentInput,
  SendDocumentInput,
  CreateDocumentVersionInput,
  DocumentActivityInput,
  DocumentTypeResponse,
  DocumentResponse,
  DocumentDetailResponse,
  PaginatedDocumentsResponse,
  DocumentStatsResponse,
  DocumentFormDefinition,
  FormFieldDefinition,
  DocumentStatus,
  DocumentAction,
  DocumentErrorCodes
} from './documents.types';

export class DocumentsService {
  private prisma: PrismaClient;
  private logger: Logger;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.logger = Logger.getInstance();
  }

  // ===== DOCUMENT TYPES =====

  async createDocumentType(data: CreateDocumentTypeInput): Promise<DocumentTypeResponse> {
    try {
      this.logger.info('Creating document type', { data });

      const documentType = await this.prisma.documentType.create({
        data: {
          ...data,
          sortOrder: data.sortOrder ?? 0
        }
      });

      return this.mapDocumentTypeToResponse(documentType);
    } catch (error) {
      this.logger.error('Error creating document type', { error, data });
      throw error;
    }
  }

  async getDocumentTypes(includeInactive: boolean = false): Promise<DocumentTypeResponse[]> {
    try {
      const documentTypes = await this.prisma.documentType.findMany({
        where: includeInactive ? {} : { isActive: true },
        include: {
          _count: {
            select: { documents: true }
          }
        },
        orderBy: [
          { sortOrder: 'asc' },
          { name: 'asc' }
        ]
      });

      return documentTypes.map(type => this.mapDocumentTypeToResponse(type));
    } catch (error) {
      this.logger.error('Error getting document types', { error });
      throw error;
    }
  }

  async getDocumentTypeById(id: string): Promise<DocumentTypeResponse> {
    try {
      const documentType = await this.prisma.documentType.findUnique({
        where: { id },
        include: {
          _count: {
            select: { documents: true }
          }
        }
      });

      if (!documentType) {
        throw new Error(DocumentErrorCodes.DOCUMENT_TYPE_NOT_FOUND);
      }

      return this.mapDocumentTypeToResponse(documentType);
    } catch (error) {
      this.logger.error('Error getting document type by id', { error, id });
      throw error;
    }
  }

  async getDocumentFormDefinition(documentTypeId: string, orderId?: string): Promise<DocumentFormDefinition> {
    try {
      const documentType = await this.getDocumentTypeById(documentTypeId);
      
      // Obtener datos de la orden si se proporciona para valores por defecto
      let orderData = null;
      if (orderId) {
        orderData = await this.prisma.order.findUnique({
          where: { id: orderId },
          include: {
            client: {
              include: {
                contacts: { where: { isPrimary: true } },
                addresses: { where: { isPrimary: true } }
              }
            },
            agent: true,
            createdBy: true
          }
        });
      }

      // Generar campos compartidos estándar
      const sharedFields: FormFieldDefinition[] = [
        {
          id: 'title',
          name: 'title',
          type: 'text',
          label: 'Título del Documento',
          placeholder: 'Ingresa el título del documento',
          required: true,
          defaultValue: orderData ? `${documentType.name} - ${orderData.orderNumber}` : '',
          section: 'general',
          order: 1
        },
        {
          id: 'description',
          name: 'description',
          type: 'textarea',
          label: 'Descripción',
          placeholder: 'Descripción opcional del documento',
          required: false,
          section: 'general',
          order: 2
        }
      ];

      // Procesar campos específicos del tipo de documento
      const formFields: FormFieldDefinition[] = this.processFormSchema(documentType.formSchema);

      // Generar valores por defecto basados en la orden
      const defaultValues = this.generateDefaultValues(documentType, orderData);

      return {
        documentType,
        formFields,
        sharedFields,
        validationRules: documentType.formSchema.validationRules || {},
        defaultValues
      };
    } catch (error) {
      this.logger.error('Error getting document form definition', { error, documentTypeId, orderId });
      throw error;
    }
  }

  // ===== DOCUMENTS =====

  async createDocument(data: CreateDocumentInput, createdById: string): Promise<DocumentResponse> {
    try {
      this.logger.info('Creating document', { data, createdById });
      
      // Log específico para debugging
      console.log('🔍 DEBUG createDocument - orderId recibido:', data.orderId);
      console.log('🔍 DEBUG createDocument - documentTypeId recibido:', data.documentTypeId);

      // Verificar que la orden existe
      const order = await this.prisma.order.findUnique({
        where: { id: data.orderId },
        include: { client: true }
      });

      if (!order) {
        console.log('❌ DEBUG createDocument - Orden no encontrada:', data.orderId);
        throw new Error(DocumentErrorCodes.ORDER_NOT_FOUND);
      }
      
      console.log('✅ DEBUG createDocument - Orden encontrada:', {
        id: order.id,
        orderNumber: order.orderNumber,
        title: order.title
      });

      // Verificar que el tipo de documento existe
      const documentType = await this.prisma.documentType.findUnique({
        where: { id: data.documentTypeId }
      });

      if (!documentType) {
        console.log('❌ DEBUG createDocument - Tipo de documento no encontrado:', data.documentTypeId);
        throw new Error(DocumentErrorCodes.DOCUMENT_TYPE_NOT_FOUND);
      }
      
      console.log('✅ DEBUG createDocument - Tipo de documento encontrado:', {
        id: documentType.id,
        name: documentType.name,
        slug: documentType.slug
      });

      // Generar número de documento único
      const documentNumber = await this.generateDocumentNumber(order.orderNumber, documentType.slug);
      console.log('📄 DEBUG createDocument - Número generado:', documentNumber);

      // Crear el documento
      const document = await this.prisma.document.create({
        data: {
          documentNumber,
          orderId: data.orderId,  // Guardar exactamente el orderId recibido
          documentTypeId: data.documentTypeId,
          createdById,
          lastModifiedById: createdById,
          title: data.title,
          description: data.description,
          sharedData: data.sharedData,
          specificData: data.specificData,
          metadata: data.metadata || {}
        },
        include: this.getDocumentIncludes()
      });
      
      console.log('✅ DEBUG createDocument - Documento creado exitosamente:', {
        id: document.id,
        documentNumber: document.documentNumber,
        orderId: document.orderId,
        title: document.title,
        orderInfo: {
          id: document.order?.id,
          orderNumber: document.order?.orderNumber
        }
      });

      // Registrar actividad
      await this.logDocumentActivity(document.id, DocumentAction.CREATED, createdById, {
        documentNumber,
        title: data.title
      });

      return this.mapDocumentToResponse(document);
    } catch (error) {
      this.logger.error('Error creating document', { error, data });
      console.log('❌ DEBUG createDocument - Error:', error);
      throw error;
    }
  }

  async getDocuments(filters: DocumentFilters): Promise<PaginatedDocumentsResponse> {
    try {
      const page = filters.page || 1;
      const limit = Math.min(filters.limit || 20, 100);
      const skip = (page - 1) * limit;

      // Log específico para debugging cuando se filtra por orderId
      if (filters.orderId) {
        console.log('🔍 DEBUG getDocuments - Consultando documentos para orderId:', filters.orderId);
      }

      // Construir filtros where
      const where: any = {};

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

      if (filters.documentTypeId) {
        where.documentTypeId = filters.documentTypeId;
      }

      if (filters.orderId) {
        where.orderId = filters.orderId;
        console.log('🔍 DEBUG getDocuments - Filtro WHERE aplicado:', { orderId: where.orderId });
      }

      if (filters.createdById) {
        where.createdById = filters.createdById;
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

      // Configurar ordenamiento
      const orderBy: any = {};
      if (filters.sortBy) {
        orderBy[filters.sortBy] = filters.sortOrder || 'desc';
      } else {
        orderBy.createdAt = 'desc';
      }

      // Log completo de la consulta cuando se filtra por orderId
      if (filters.orderId) {
        console.log('🔍 DEBUG getDocuments - Consulta completa:', {
          where,
          orderBy,
          skip,
          take: limit
        });
      }

      // Ejecutar consultas
      const [documents, total] = await Promise.all([
        this.prisma.document.findMany({
          where,
          skip,
          take: limit,
          orderBy,
          include: this.getDocumentIncludes()
        }),
        this.prisma.document.count({ where })
      ]);

      // Log de resultados cuando se filtra por orderId
      if (filters.orderId) {
        console.log('📊 DEBUG getDocuments - Resultados para orderId:', filters.orderId);
        console.log('📊 DEBUG getDocuments - Total encontrados:', total);
        console.log('📊 DEBUG getDocuments - Documentos en página:', documents.length);
        
        documents.forEach((doc, index) => {
          console.log(`📄 DEBUG Documento ${index + 1}:`, {
            id: doc.id,
            documentNumber: doc.documentNumber,
            title: doc.title,
            orderId: doc.orderId,
            documentType: doc.documentType?.name,
            status: doc.status,
            createdAt: doc.createdAt
          });
        });
      }

      const pages = Math.ceil(total / limit);

      return {
        documents: documents.map(doc => this.mapDocumentToResponse(doc)),
        pagination: {
          total,
          page,
          limit,
          pages
        },
        filters
      };
    } catch (error) {
      this.logger.error('Error getting documents', { error, filters });
      if (filters.orderId) {
        console.log('❌ DEBUG getDocuments - Error consultando orderId:', filters.orderId, error);
      }
      throw error;
    }
  }

  async getDocumentById(id: string): Promise<DocumentDetailResponse> {
    try {
      const document = await this.prisma.document.findUnique({
        where: { id },
        include: {
          ...this.getDocumentIncludes(),
          versions: {
            orderBy: { createdAt: 'desc' },
            take: 10,
            include: {
              createdBy: { select: { id: true, name: true, email: true } }
            }
          },
          activities: {
            orderBy: { createdAt: 'desc' },
            take: 20,
            include: {
              user: { select: { id: true, name: true, email: true } }
            }
          }
        }
      });

      if (!document) {
        throw new Error(DocumentErrorCodes.DOCUMENT_NOT_FOUND);
      }

      return this.mapDocumentToDetailResponse(document);
    } catch (error) {
      this.logger.error('Error getting document by id', { error, id });
      throw error;
    }
  }

  async updateDocument(id: string, data: UpdateDocumentInput, userId: string): Promise<DocumentResponse> {
    try {
      this.logger.info('Updating document', { id, data, userId });

      const existingDocument = await this.prisma.document.findUnique({
        where: { id }
      });

      if (!existingDocument) {
        throw new Error(DocumentErrorCodes.DOCUMENT_NOT_FOUND);
      }

      if (existingDocument.status === 'FINALIZED') {
        throw new Error(DocumentErrorCodes.DOCUMENT_ALREADY_FINALIZED);
      }

      const document = await this.prisma.document.update({
        where: { id },
        data: {
          ...data,
          lastModifiedById: userId,
          updatedAt: new Date()
        },
        include: this.getDocumentIncludes()
      });

      // Registrar actividad
      await this.logDocumentActivity(id, DocumentAction.UPDATED, userId, {
        changes: data
      });

      return this.mapDocumentToResponse(document);
    } catch (error) {
      this.logger.error('Error updating document', { error, id, data });
      throw error;
    }
  }

  async changeDocumentStatus(id: string, data: ChangeDocumentStatusInput, userId: string): Promise<DocumentResponse> {
    try {
      this.logger.info('Changing document status', { id, data, userId });

      const existingDocument = await this.prisma.document.findUnique({
        where: { id }
      });

      if (!existingDocument) {
        throw new Error(DocumentErrorCodes.DOCUMENT_NOT_FOUND);
      }

      // Validar transición de estado
      this.validateStatusTransition(existingDocument.status as DocumentStatus, data.status);

      const updateData: any = {
        status: data.status,
        lastModifiedById: userId
      };

      // Actualizar fechas según el estado
      if (data.status === 'FINALIZED') {
        updateData.finalizedAt = new Date();
      } else if (data.status === 'SENT') {
        updateData.sentAt = new Date();
      } else if (data.status === 'APPROVED') {
        updateData.approvedAt = new Date();
        updateData.approvalData = data.approvalData;
      }

      const document = await this.prisma.document.update({
        where: { id },
        data: updateData,
        include: this.getDocumentIncludes()
      });

      // Registrar actividad
      const action = data.status.toLowerCase() as DocumentAction;
      await this.logDocumentActivity(id, action, userId, {
        previousStatus: existingDocument.status,
        newStatus: data.status,
        notes: data.notes
      });

      return this.mapDocumentToResponse(document);
    } catch (error) {
      this.logger.error('Error changing document status', { error, id, data });
      throw error;
    }
  }

  async generateDocument(id: string, options: GenerateDocumentInput, userId: string): Promise<{ url: string; filename: string; content?: string }> {
    try {
      this.logger.info('Generating document', { id, options, userId });

      const document = await this.prisma.document.findUnique({
        where: { id },
        include: this.getDocumentIncludes()
      });
      
      if (!document) {
        throw new Error(DocumentErrorCodes.DOCUMENT_NOT_FOUND);
      }

      const format = options.format || 'pdf';
      const content = this.generateDocumentContent(document);
      
      // Para formato HTML, retornar el contenido directamente
      if (format === 'html') {
        return {
          content: content,
          url: `data:text/html;charset=utf-8,${encodeURIComponent(content)}`,
          filename: `${document.documentNumber}-${new Date().toISOString().replace(/[:.]/g, '-')}.html`
        };
      }
      
      const fileContent = await this.createDocumentFile(content, format);
      
      // Crear nombre de archivo único
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${document.documentNumber}-${timestamp}.${format}`;
      
      // En un entorno real, aquí guardarías el archivo en un servicio de almacenamiento
      // Por ahora, simulamos la URL del archivo
      const url = `data:${this.getMimeType(format)};base64,${fileContent}`;

      // Actualizar estadísticas de descarga
      await this.prisma.document.update({
        where: { id },
        data: {
          downloadCount: { increment: 1 },
          generatedFiles: {
            ...document.generatedFiles as any,
            [format]: {
              url,
              filename,
              generatedAt: new Date(),
              size: Math.round(fileContent.length * 0.75) // Aproximación del tamaño en bytes
            }
          }
        }
      });

      // Registrar actividad
      await this.logDocumentActivity(id, DocumentAction.DOWNLOADED, userId, {
        format,
        filename,
        generatedAt: new Date()
      });

      return { url, filename };
    } catch (error) {
      this.logger.error('Error generating document', { error, id, options });
      throw error;
    }
  }

  async sendDocumentByEmail(id: string, data: SendDocumentInput, userId: string): Promise<void> {
    try {
      this.logger.info('Sending document by email', { id, data, userId });

      const document = await this.getDocumentById(id);
      
      if (!document) {
        throw new Error(DocumentErrorCodes.DOCUMENT_NOT_FOUND);
      }

      // Aquí iría la lógica de envío de email
      // Por ahora, simularemos el envío

      // Actualizar contador de emails enviados
      await this.prisma.document.update({
        where: { id },
        data: {
          emailSentCount: { increment: 1 }
        }
      });

      // Registrar actividad
      await this.logDocumentActivity(id, DocumentAction.EMAIL_SENT, userId, {
        recipients: data.recipients,
        subject: data.subject,
        format: data.format || 'pdf'
      });

      this.logger.info('Document sent by email successfully', { id, recipients: data.recipients });
    } catch (error) {
      this.logger.error('Error sending document by email', { error, id, data });
      throw error;
    }
  }

  async getDocumentStats(params: DocumentStatsInput): Promise<DocumentStatsResponse> {
    try {
      const where: any = {};

      if (params.startDate || params.endDate) {
        where.createdAt = {};
        if (params.startDate) {
          where.createdAt.gte = new Date(params.startDate);
        }
        if (params.endDate) {
          where.createdAt.lte = new Date(params.endDate);
        }
      }

      if (params.orderId) {
        where.orderId = params.orderId;
      }

      if (params.documentTypeId) {
        where.documentTypeId = params.documentTypeId;
      }

      const [
        totalDocuments,
        documentsByStatus,
        documentsByType,
        documentsByPhase,
        documentsThisMonth,
        avgTimeToFinalize,
        documentsByOrder,
        timeSeriesData,
        recentActivity
      ] = await Promise.all([
        this.prisma.document.count({ where }),
        this.getDocumentsByStatus(where),
        this.getDocumentsByType(where),
        this.getDocumentsByPhase(where),
        this.getDocumentsThisMonth(),
        this.getAverageTimeToFinalize(where),
        this.getDocumentsByOrder(where),
        this.getTimeSeriesData(where, params.groupBy || 'day'),
        this.getRecentActivity(where)
      ]);

      return {
        overview: {
          totalDocuments,
          documentsByStatus,
          documentsByType,
          documentsThisMonth,
          averageTimeToFinalize: avgTimeToFinalize
        },
        documentsByOrder,
        documentsByPhase,
        timeSeriesData,
        recentActivity
      };
    } catch (error) {
      this.logger.error('Error getting document stats', { error, params });
      throw error;
    }
  }

  // ===== PRIVATE HELPER METHODS =====

  private async generateDocumentNumber(orderNumber: string, documentTypeSlug: string): Promise<string> {
    const prefix = `DOC-${orderNumber}-${documentTypeSlug.toUpperCase()}`;
    
    // Buscar el último número para este prefijo
    const lastDocument = await this.prisma.document.findFirst({
      where: {
        documentNumber: {
          startsWith: prefix
        }
      },
      orderBy: {
        documentNumber: 'desc'
      }
    });

    let sequence = 1;
    if (lastDocument) {
      const match = lastDocument.documentNumber.match(/-(\d+)$/);
      if (match) {
        sequence = parseInt(match[1]) + 1;
      }
    }

    return `${prefix}-${sequence.toString().padStart(3, '0')}`;
  }

  private validateStatusTransition(currentStatus: DocumentStatus, newStatus: DocumentStatus): void {
    const validTransitions: Record<DocumentStatus, DocumentStatus[]> = {
      'DRAFT': ['FINALIZED', 'ARCHIVED'],
      'FINALIZED': ['SENT', 'REVIEWED', 'ARCHIVED'],
      'SENT': ['REVIEWED', 'APPROVED', 'REJECTED'],
      'REVIEWED': ['APPROVED', 'REJECTED', 'DRAFT'],
      'APPROVED': ['ARCHIVED'],
      'REJECTED': ['DRAFT', 'ARCHIVED'],
      'ARCHIVED': []
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new Error(DocumentErrorCodes.INVALID_STATUS_TRANSITION);
    }
  }

  private processFormSchema(formSchema: Record<string, any>): FormFieldDefinition[] {
    // Manejar diferentes estructuras de formSchema
    let fields: any[] = [];
    
    if (formSchema.fields && Array.isArray(formSchema.fields)) {
      // Estructura directa con fields array
      fields = formSchema.fields;
    } else if (formSchema.sections && Array.isArray(formSchema.sections)) {
      // Estructura con secciones, extraer fields de cada sección
      fields = formSchema.sections.reduce((allFields: any[], section: any) => {
        if (section.fields && Array.isArray(section.fields)) {
          return allFields.concat(section.fields);
        }
        return allFields;
      }, []);
    } else {
      // Estructura plana, buscar propiedades que parezcan campos
      Object.keys(formSchema).forEach(key => {
        if (formSchema[key] && typeof formSchema[key] === 'object' && formSchema[key].type) {
          fields.push({ name: key, ...formSchema[key] });
        }
      });
    }

    this.logger.info('Processing form schema', { 
      originalSchema: formSchema, 
      extractedFields: fields.length,
      fieldNames: fields.map(f => f.name || f.id)
    });

    return fields.map((field: any, index: number) => ({
      id: field.id || field.name,
      name: field.name,
      type: field.type || 'text',
      label: field.label,
      placeholder: field.placeholder,
      description: field.description,
      required: field.required || false,
      options: field.options,
      validation: field.validation,
      defaultValue: field.defaultValue,
      section: field.section || 'specific',
      order: field.order || index + 10,
      conditional: field.conditional,
      attachmentConfig: field.attachmentConfig // Preservar configuración de attachment
    }));
  }

  private generateDefaultValues(documentType: DocumentTypeResponse, orderData: any): Record<string, any> {
    const defaults: Record<string, any> = {};

    if (orderData) {
      // Valores compartidos estándar
      defaults.orderNumber = orderData.orderNumber;
      defaults.clientName = orderData.client?.companyName;
      defaults.projectTitle = orderData.title;
      defaults.createdDate = new Date().toISOString();
      defaults.createdBy = orderData.createdBy?.name;

      // Valores específicos según el tipo de documento
      if (documentType.slug === 'diagnostico') {
        defaults.analysisDate = new Date().toISOString();
        defaults.currentProcesses = orderData.description || '';
      } else if (documentType.slug === 'propuesta') {
        defaults.budget = orderData.estimatedBudget;
        defaults.deliveryDate = orderData.requestedDeliveryDate;
      }
    }

    return defaults;
  }

  private async logDocumentActivity(documentId: string, action: DocumentAction, userId: string, data?: Record<string, any>): Promise<void> {
    await this.prisma.documentActivity.create({
      data: {
        documentId,
        action,
        description: `Document ${action}`,
        activityData: data,
        userId
      }
    });
  }

  private getDocumentIncludes() {
    return {
      order: {
        select: {
          id: true,
          orderNumber: true,
          title: true,
          client: {
            select: {
              id: true,
              companyName: true
            }
          }
        }
      },
      documentType: {
        select: {
          id: true,
          name: true,
          slug: true,
          phase: true,
          icon: true,
          color: true
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
    };
  }

  private mapDocumentTypeToResponse(documentType: any): DocumentTypeResponse {
    return {
      id: documentType.id,
      name: documentType.name,
      slug: documentType.slug,
      description: documentType.description,
      phase: documentType.phase,
      icon: documentType.icon,
      color: documentType.color,
      estimatedTime: documentType.estimatedTime,
      formSchema: documentType.formSchema,
      templateConfig: documentType.templateConfig,
      exportConfig: documentType.exportConfig,
      isActive: documentType.isActive,
      sortOrder: documentType.sortOrder,
      documentsCount: documentType._count?.documents || 0,
      createdAt: documentType.createdAt,
      updatedAt: documentType.updatedAt
    };
  }

  private mapDocumentToResponse(document: any): DocumentResponse {
    return {
      id: document.id,
      documentNumber: document.documentNumber,
      title: document.title,
      description: document.description,
      status: document.status,
      version: document.version,
      isCurrentVersion: document.isCurrentVersion,
      orderId: document.orderId, // ¡Campo que faltaba!
      documentTypeId: document.documentTypeId, // ¡Campo que faltaba!
      sharedData: document.sharedData,
      specificData: document.specificData,
      generatedFiles: document.generatedFiles,
      metadata: document.metadata,
      approvalData: document.approvalData,
      downloadCount: document.downloadCount,
      emailSentCount: document.emailSentCount,
      finalizedAt: document.finalizedAt,
      sentAt: document.sentAt,
      approvedAt: document.approvedAt,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
      order: document.order,
      documentType: document.documentType,
      createdBy: document.createdBy,
      lastModifiedBy: document.lastModifiedBy
    };
  }

  private mapDocumentToDetailResponse(document: any): DocumentDetailResponse {
    return {
      ...this.mapDocumentToResponse(document),
      versions: document.versions?.map((version: any) => ({
        id: version.id,
        version: version.version,
        title: version.title,
        description: version.description,
        sharedData: version.sharedData,
        specificData: version.specificData,
        generatedFiles: version.generatedFiles,
        changeLog: version.changeLog,
        metadata: version.metadata,
        createdAt: version.createdAt,
        createdBy: version.createdBy
      })) || [],
      recentActivities: document.activities?.map((activity: any) => ({
        id: activity.id,
        action: activity.action,
        description: activity.description,
        activityData: activity.activityData,
        createdAt: activity.createdAt,
        user: activity.user
      })) || []
    };
  }

  // Métodos de estadísticas (implementaciones simplificadas)
  private async getDocumentsByStatus(where: any): Promise<Record<DocumentStatus, number>> {
    const result = await this.prisma.document.groupBy({
      by: ['status'],
      where,
      _count: true
    });

    const statusCounts: Record<DocumentStatus, number> = {
      'DRAFT': 0,
      'FINALIZED': 0,
      'SENT': 0,
      'REVIEWED': 0,
      'APPROVED': 0,
      'REJECTED': 0,
      'ARCHIVED': 0
    };

    result.forEach(item => {
      statusCounts[item.status as DocumentStatus] = item._count;
    });

    return statusCounts;
  }

  private async getDocumentsByType(where: any): Promise<Record<string, number>> {
    const result = await this.prisma.document.groupBy({
      by: ['documentTypeId'],
      where,
      _count: true
    });

    const typeCounts: Record<string, number> = {};
    for (const item of result) {
      const documentType = await this.prisma.documentType.findUnique({
        where: { id: item.documentTypeId },
        select: { name: true }
      });
      typeCounts[documentType?.name || 'Unknown'] = item._count;
    }

    return typeCounts;
  }

  private async getDocumentsByPhase(where: any): Promise<Record<string, number>> {
    const result = await this.prisma.document.findMany({
      where,
      include: {
        documentType: {
          select: { phase: true }
        }
      }
    });

    const phaseCounts: Record<string, number> = {};
    result.forEach(doc => {
      const phase = doc.documentType.phase;
      phaseCounts[phase] = (phaseCounts[phase] || 0) + 1;
    });

    return phaseCounts;
  }

  private async getDocumentsThisMonth(): Promise<number> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    return this.prisma.document.count({
      where: {
        createdAt: {
          gte: startOfMonth
        }
      }
    });
  }

  private async getAverageTimeToFinalize(where: any): Promise<number> {
    const documents = await this.prisma.document.findMany({
      where: {
        ...where,
        finalizedAt: { not: null }
      },
      select: {
        createdAt: true,
        finalizedAt: true
      }
    });

    if (documents.length === 0) return 0;

    const totalHours = documents.reduce((sum, doc) => {
      const diffMs = doc.finalizedAt!.getTime() - doc.createdAt.getTime();
      return sum + (diffMs / (1000 * 60 * 60)); // Convert to hours
    }, 0);

    return totalHours / documents.length;
  }

  private async getDocumentsByOrder(where: any): Promise<any[]> {
    const result = await this.prisma.document.groupBy({
      by: ['orderId'],
      where,
      _count: true
    });

    const orderStats = [];
    for (const item of result) {
      const order = await this.prisma.order.findUnique({
        where: { id: item.orderId },
        include: { client: true }
      });

      if (order) {
        const completedCount = await this.prisma.document.count({
          where: {
            orderId: item.orderId,
            status: { in: ['FINALIZED', 'APPROVED'] }
          }
        });

        orderStats.push({
          orderId: order.id,
          orderNumber: order.orderNumber,
          client: order.client.companyName,
          documentCount: item._count,
          completedDocuments: completedCount,
          pendingDocuments: item._count - completedCount
        });
      }
    }

    return orderStats;
  }

  private async getTimeSeriesData(where: any, groupBy: string): Promise<any[]> {
    // Implementación simplificada - en producción usaríamos consultas SQL más complejas
    const documents = await this.prisma.document.findMany({
      where,
      select: {
        createdAt: true,
        finalizedAt: true,
        sentAt: true
      },
      orderBy: { createdAt: 'asc' }
    });

    // Agrupar por período
    const groupedData: Record<string, { count: number; finalized: number; sent: number }> = {};

    documents.forEach(doc => {
      const period = this.formatPeriod(doc.createdAt, groupBy);
      if (!groupedData[period]) {
        groupedData[period] = { count: 0, finalized: 0, sent: 0 };
      }
      groupedData[period].count++;
      if (doc.finalizedAt) groupedData[period].finalized++;
      if (doc.sentAt) groupedData[period].sent++;
    });

    return Object.entries(groupedData).map(([period, data]) => ({
      period,
      ...data
    }));
  }

  private async getRecentActivity(where: any): Promise<any[]> {
    const activities = await this.prisma.documentActivity.findMany({
      where: {
        document: where
      },
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        document: {
          select: {
            id: true,
            title: true
          }
        },
        user: {
          select: {
            name: true
          }
        }
      }
    });

    return activities.map(activity => ({
      documentId: activity.document.id,
      documentTitle: activity.document.title,
      action: activity.action,
      timestamp: activity.createdAt,
      user: activity.user.name
    }));
  }

  private formatPeriod(date: Date, groupBy: string): string {
    const d = new Date(date);
    
    switch (groupBy) {
      case 'day':
        return d.toISOString().split('T')[0];
      case 'week':
        const week = Math.ceil(d.getDate() / 7);
        return `${d.getFullYear()}-${d.getMonth() + 1}-W${week}`;
      case 'month':
        return `${d.getFullYear()}-${d.getMonth() + 1}`;
      default:
        return d.toISOString().split('T')[0];
    }
  }

  private getLogoAsBase64(): string {
    try {
      // Intentar múltiples rutas donde podría estar el logo
      const possiblePaths = [
        path.join(__dirname, '../../img/AIMblanco.png'),
        path.join(__dirname, '../../../src/img/AIMblanco.png'),
        path.join(__dirname, '../../../../aim-website/public/img/AIMblanco.png'),
        path.join(process.cwd(), 'src/img/AIMblanco.png'),
        path.join(process.cwd(), '../aim-website/public/img/AIMblanco.png'),
        path.join(process.cwd(), '../../aim-website/public/img/AIMblanco.png'),
        'C:\\Users\\user\\Documents\\AIM BackUps\\AIM v2 - copia\\aim-website\\public\\img\\AIMblanco.png',
        path.resolve(process.cwd(), '../aim-website/public/img/AIMblanco.png'),
        path.resolve(process.cwd(), './src/img/AIMblanco.png')
      ];

      this.logger.info('Intentando cargar logo desde múltiples rutas', { paths: possiblePaths });

      for (const logoPath of possiblePaths) {
        try {
          this.logger.debug('Verificando ruta de logo', { path: logoPath, exists: fs.existsSync(logoPath) });
          if (fs.existsSync(logoPath)) {
            const imageBuffer = fs.readFileSync(logoPath);
            const base64Image = imageBuffer.toString('base64');
            this.logger.info('Logo cargado exitosamente', { path: logoPath, size: imageBuffer.length });
            return `data:image/png;base64,${base64Image}`;
          }
        } catch (error) {
          this.logger.warn('Error al cargar logo desde ruta', { path: logoPath, error: error instanceof Error ? error.message : String(error) });
          continue; // Intentar la siguiente ruta
        }
      }

      // Si no encuentra la imagen, devolver un logo SVG por defecto
      this.logger.warn('Logo AIMblanco.png no encontrado, usando logo por defecto');
      return this.getDefaultLogoSVG();
    } catch (error) {
      this.logger.error('Error loading logo', { error });
      return this.getDefaultLogoSVG();
    }
  }

  private getLogoLargoAsBase64(): string {
    try {
      // Intentar múltiples rutas donde podría estar el logo largo
      const possiblePaths = [
        path.join(__dirname, '../../img/AIMlargo.png'),
        path.join(__dirname, '../../../src/img/AIMlargo.png'),
        path.join(__dirname, '../../../../aim-website/public/img/AIMlargo.png'),
        path.join(process.cwd(), 'src/img/AIMlargo.png'),
        path.join(process.cwd(), '../aim-website/public/img/AIMlargo.png'),
        path.join(process.cwd(), '../../aim-website/public/img/AIMlargo.png'),
        'C:\\Users\\user\\Documents\\AIM BackUps\\AIM v2 - copia\\aim-backend\\src\\img\\AIMlargo.png',
        path.resolve(process.cwd(), '../aim-website/public/img/AIMlargo.png'),
        path.resolve(process.cwd(), './src/img/AIMlargo.png')
      ];

      this.logger.info('Intentando cargar logo largo desde múltiples rutas', { paths: possiblePaths });

      for (const logoPath of possiblePaths) {
        try {
          this.logger.debug('Verificando ruta de logo largo', { path: logoPath, exists: fs.existsSync(logoPath) });
          if (fs.existsSync(logoPath)) {
            const imageBuffer = fs.readFileSync(logoPath);
            const base64Image = imageBuffer.toString('base64');
            this.logger.info('Logo largo cargado exitosamente', { path: logoPath, size: imageBuffer.length });
            return `data:image/png;base64,${base64Image}`;
          }
        } catch (error) {
          this.logger.warn('Error al cargar logo largo desde ruta', { path: logoPath, error: error instanceof Error ? error.message : String(error) });
          continue; // Intentar la siguiente ruta
        }
      }

      // Si no encuentra la imagen, devolver un logo SVG por defecto horizontal
      this.logger.warn('Logo AIMlargo.png no encontrado, usando logo por defecto horizontal');
      return this.getDefaultLogoLargoSVG();
    } catch (error) {
      this.logger.error('Error loading logo largo', { error });
      return this.getDefaultLogoLargoSVG();
    }
  }

  private getDefaultLogoSVG(): string {
    // Logo SVG por defecto si no se encuentra la imagen
    const svgLogo = `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#14b8a6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#10b981;stop-opacity:1" />
        </linearGradient>
      </defs>
      <text x="50" y="60" text-anchor="middle" fill="url(#gradient)" font-size="32" font-weight="bold" font-family="Arial">AIM</text>
    </svg>`;
    
    return `data:image/svg+xml;base64,${Buffer.from(svgLogo).toString('base64')}`;
  }

  private getDefaultLogoLargoSVG(): string {
    // Logo SVG horizontal por defecto si no se encuentra la imagen
    const svgLogo = `<svg width="200" height="50" viewBox="0 0 200 50" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gradientLargo" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#14b8a6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#10b981;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect x="5" y="5" width="190" height="40" rx="8" fill="url(#gradientLargo)" opacity="0.1"/>
      <text x="100" y="30" text-anchor="middle" fill="url(#gradientLargo)" font-size="16" font-weight="bold" font-family="Arial">AIM - Automatización Industrial Mireles</text>
    </svg>`;
    
    return `data:image/svg+xml;base64,${Buffer.from(svgLogo).toString('base64')}`;
  }

  private generateDocumentContent(document: any): string {
    // Obtener los logos como base64
    const logoDataUrl = this.getLogoAsBase64();
    const logoLargoDataUrl = this.getLogoLargoAsBase64();
    
    // Generar contenido HTML del documento con diseño optimizado para carta
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${document.title}</title>
        <style>
          @page {
            size: Letter;
            margin: 15mm;
          }
          
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.4; 
            color: #333; 
            background: #fff;
            font-size: 14px;
          }
          
          .document-container {
            max-width: 100%;
            width: 100%;
            margin: 0 auto;
            padding: 10mm;
            background: white;
            min-height: 100vh;
            position: relative;
          }
          
          .header {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid #14b8a6;
          }
          
          .logo-section {
            flex: 0 0 80px;
            margin-right: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .logo-img {
            width: 70px;
            height: 70px;
            object-fit: contain;
            border-radius: 8px;
            background: transparent;
          }
          
          .company-info {
            flex: 1;
            background: #f8fafc;
            padding: 15px;
            border-radius: 6px;
            border-left: 3px solid #14b8a6;
          }
          
          .company-name {
            font-size: 16px;
            font-weight: bold;
            color: #1e293b;
            margin-bottom: 6px;
          }
          
          .company-details {
            font-size: 11px;
            color: #64748b;
            line-height: 1.4;
          }
          
          .document-header {
            background: linear-gradient(135deg, #14b8a6, #10b981);
            color: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 2px 8px rgba(20, 184, 166, 0.15);
          }
          
          .document-title {
            font-size: 22px;
            font-weight: bold;
            margin-bottom: 6px;
          }
          
          .document-subtitle {
            font-size: 14px;
            opacity: 0.9;
            margin-bottom: 3px;
          }
          
          .document-number {
            font-size: 12px;
            opacity: 0.8;
            background: rgba(255, 255, 255, 0.2);
            padding: 3px 10px;
            border-radius: 15px;
            display: inline-block;
            margin-top: 8px;
          }
          
          .section {
            margin-bottom: 25px;
            background: white;
            border-radius: 6px;
            overflow: hidden;
            box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
          }
          
          .section-header {
            background: linear-gradient(90deg, #f1f5f9, #e2e8f0);
            padding: 12px 15px;
            border-left: 3px solid #14b8a6;
          }
          
          .section-title {
            font-size: 16px;
            font-weight: 600;
            color: #1e293b;
            display: flex;
            align-items: center;
          }
          
          .section-title::before {
            content: '';
            display: inline-block;
            width: 6px;
            height: 6px;
            background: #14b8a6;
            border-radius: 50%;
            margin-right: 8px;
          }
          
          .section-content {
            padding: 15px;
          }
          
          .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
            margin-bottom: 15px;
          }
          
          .info-item {
            padding: 10px;
            background: #f8fafc;
            border-radius: 4px;
            border-left: 2px solid #14b8a6;
          }
          
          .info-label {
            font-weight: 600;
            color: #475569;
            font-size: 12px;
            margin-bottom: 3px;
          }
          
          .info-value {
            color: #1e293b;
            font-size: 13px;
          }
          
          .content-block {
            background: #f8fafc;
            padding: 15px;
            border-radius: 6px;
            border: 1px solid #e2e8f0;
            line-height: 1.6;
          }
          
          .specific-data {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            overflow: hidden;
          }
          
          .data-item {
            display: flex;
            padding: 10px 15px;
            border-bottom: 1px solid #f1f5f9;
          }
          
          .data-item:last-child {
            border-bottom: none;
          }
          
          .data-item:nth-child(even) {
            background: #f8fafc;
          }
          
          .data-label {
            flex: 0 0 180px;
            font-weight: 600;
            color: #475569;
            font-size: 12px;
          }
          
          .data-value {
            flex: 1;
            color: #1e293b;
            font-size: 12px;
          }
          
          /* Estilos para anexos/attachments */
          .attachments-section {
            margin-bottom: 25px;
            background: white;
            border-radius: 6px;
            overflow: hidden;
            box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
          }
          
          .attachments-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 15px;
            padding: 15px;
          }
          
          .attachment-item {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            overflow: hidden;
            transition: all 0.3s ease;
          }
          
          .attachment-item:hover {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            transform: translateY(-2px);
          }
          
          .attachment-header {
            background: linear-gradient(90deg, #14b8a6, #10b981);
            color: white;
            padding: 10px 15px;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          
          .attachment-icon {
            font-size: 18px;
            margin-right: 8px;
          }
          
          .attachment-title {
            font-weight: 600;
            font-size: 14px;
            flex: 1;
          }
          
          .attachment-size {
            font-size: 11px;
            opacity: 0.9;
            background: rgba(255, 255, 255, 0.2);
            padding: 2px 8px;
            border-radius: 10px;
          }
          
          .attachment-preview {
            padding: 15px;
            text-align: center;
          }
          
          .attachment-image {
            max-width: 100%;
            max-height: 200px;
            width: auto;
            height: auto;
            border-radius: 6px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            margin-bottom: 10px;
          }
          
          .attachment-placeholder {
            width: 100%;
            height: 120px;
            background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 10px;
            border: 2px dashed #cbd5e1;
          }
          
          .attachment-placeholder-icon {
            font-size: 48px;
            color: #94a3b8;
            margin-bottom: 8px;
          }
          
          .attachment-info {
            background: white;
            padding: 10px;
            border-radius: 6px;
            border: 1px solid #e2e8f0;
          }
          
          .attachment-meta {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            font-size: 11px;
            color: #64748b;
            margin-bottom: 8px;
          }
          
          .attachment-meta-item {
            display: flex;
            justify-content: space-between;
          }
          
          .attachment-description {
            font-size: 12px;
            color: #475569;
            font-style: italic;
            margin-top: 8px;
            padding-top: 8px;
            border-top: 1px solid #f1f5f9;
          }
          
          .no-attachments {
            text-align: center;
            padding: 30px;
            color: #64748b;
            font-style: italic;
          }
          
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            color: #64748b;
            font-size: 11px;
            line-height: 1.5;
          }
          
          .footer-logo-container {
            display: flex;
            justify-content: center;
            align-items: center;
            margin-bottom: 15px;
          }
          
          .footer-logo-img {
            max-width: 300px;
            height: auto;
            object-fit: contain;
            opacity: 0.8;
          }
          
          .footer-info {
            margin-bottom: 8px;
          }
          
          .footer-credits {
            font-size: 10px;
            opacity: 0.7;
            margin-top: 8px;
          }
          
          .page-break {
            page-break-before: always;
          }
          
          @media print {
            .document-container {
              margin: 0;
              padding: 10mm;
              box-shadow: none;
            }
            
            .section {
              box-shadow: none;
              border: 1px solid #e2e8f0;
            }
            
            .attachment-item {
              break-inside: avoid;
            }
            
            .footer {
              position: fixed;
              bottom: 0;
              left: 0;
              right: 0;
              background: white;
              padding: 10px;
              border-top: 1px solid #e2e8f0;
            }
          }
        </style>
      </head>
      <body>
        <div class="document-container">
          <!-- Header con logo y datos de la empresa -->
          <div class="header">
            <div class="logo-section">
              <img src="${logoDataUrl}" alt="AIM Logo" class="logo-img" />
            </div>
            <div class="company-info">
              <div class="company-name">Automatización Industrial Mireles</div>
              <div class="company-details">
                <strong>RFC:</strong> MIAY050829BP7<br>
                <strong>Dirección:</strong> Benigno Arriaga 260, 21 de Marzo, 78437, Soledad de Graciano Sánchez, S.L.P.<br>
                <strong>Teléfono:</strong> +52 (444) 207 8642<br>
                <strong>Email:</strong> contacto@aimireles.mx<br>
                <strong>Web:</strong> www.aimireles.mx
              </div>
            </div>
          </div>

          <!-- Título del documento -->
          <div class="document-header">
            <div class="document-title">${document.title}</div>
            <div class="document-subtitle">${document.documentType?.name || 'Documento'}</div>
            <div class="document-number">Documento No. ${document.documentNumber}</div>
          </div>

          <!-- Información de la orden -->
          <div class="section">
            <div class="section-header">
              <div class="section-title">Información de la Orden</div>
            </div>
            <div class="section-content">
              <div class="info-grid">
                <div class="info-item">
                  <div class="info-label">Número de Orden</div>
                  <div class="info-value">${document.order?.orderNumber || 'N/A'}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Cliente</div>
                  <div class="info-value">${document.order?.client?.companyName || 'N/A'}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Proyecto</div>
                  <div class="info-value">${document.order?.title || 'N/A'}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Fecha de Creación</div>
                  <div class="info-value">${new Date(document.createdAt).toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Estado</div>
                  <div class="info-value">${this.getStatusLabel(document.status)}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Versión</div>
                  <div class="info-value">${document.version}</div>
                </div>
              </div>
            </div>
          </div>

          ${document.description ? `
          <div class="section">
            <div class="section-header">
              <div class="section-title">Descripción del Documento</div>
            </div>
            <div class="section-content">
              <div class="content-block">${document.description}</div>
            </div>
          </div>
          ` : ''}

          <!-- Detalles específicos del documento -->
          <div class="section">
            <div class="section-header">
              <div class="section-title">Detalles del Documento</div>
            </div>
            <div class="section-content">
              ${this.renderSpecificDataForDocument(document.specificData)}
            </div>
          </div>

          <!-- Sección de Anexos/Attachments -->
          <!-- ${this.renderAttachmentsSection(document.attachments)} -->

          <!-- Footer -->
          <div class="footer">
            <div class="footer-logo-container">
              <img src="${logoLargoDataUrl}" alt="AIM Logo Largo" class="footer-logo-img" />
            </div>
            <div class="footer-info">Creado por: ${document.createdBy?.name || 'Sistema'} | Versión: ${document.version}</div>
            <div class="footer-info">Generado el: ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}</div>
            <div class="footer-credits">
              Este documento es confidencial y propiedad de ${document.order?.client?.companyName || 'el cliente'}. 
              Queda prohibida su reproducción total o parcial sin autorización expresa.
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    return html;
  }

  private getStatusLabel(status: string): string {
    const statusLabels: Record<string, string> = {
      'DRAFT': 'Borrador',
      'FINALIZED': 'Finalizado',
      'SENT': 'Enviado',
      'REVIEWED': 'Revisado',
      'APPROVED': 'Aprobado',
      'REJECTED': 'Rechazado',
      'ARCHIVED': 'Archivado'
    };
    return statusLabels[status] || status;
  }

  private renderSpecificDataForDocument(specificData: any): string {
    if (!specificData || typeof specificData !== 'object' || Object.keys(specificData).length === 0) {
      return '<div class="content-block">No hay datos específicos disponibles para este documento.</div>';
    }

    // Campos a ocultar/excluir del renderizado
    const fieldsToHide = [
      'quote_validity',
      'Quote Validity', 
      'cotizador_dinamico',
      'Cotizador Dinamico',
      'cotizadorDinamico',
      'quoteValidity',
      'currency',
      'Currency'
    ];

    const dataItems = Object.entries(specificData)
      .filter(([key, value]) => {
        // Excluir campos que queremos ocultar
        const shouldHide = fieldsToHide.some(fieldToHide => 
          key.toLowerCase() === fieldToHide.toLowerCase() ||
          key === fieldToHide
        );
        return !shouldHide;
      })
      .map(([key, value]) => {
        const label = this.formatFieldName(key);
        const formattedValue = this.formatFieldValue(key, value);
        
        return `
          <div class="data-item">
            <div class="data-label">${label}:</div>
            <div class="data-value">${formattedValue}</div>
          </div>
        `;
      }).join('');

    return `<div class="specific-data">${dataItems}</div>`;
  }

  /**
   * Renderizar sección de anexos/attachments
   */
  private renderAttachmentsSection(attachments?: any[]): string {
    if (!attachments || attachments.length === 0) {
      return '';
    }

    // Agrupar attachments por categoría
    const attachmentsByCategory = this.groupAttachmentsByCategory(attachments);
    
    let sectionsHtml = '';

    Object.entries(attachmentsByCategory).forEach(([category, categoryAttachments]) => {
      const categoryTitle = this.formatCategoryName(category);
      
      sectionsHtml += `
        <div class="attachments-section">
          <div class="section-header">
            <div class="section-title">📎 ${categoryTitle}</div>
          </div>
          <div class="attachments-grid">
            ${categoryAttachments.map(attachment => this.renderAttachmentItem(attachment)).join('')}
          </div>
        </div>
      `;
    });

    return sectionsHtml;
  }

  /**
   * Renderizar un item individual de attachment
   */
  private renderAttachmentItem(attachment: any): string {
    const fileIcon = this.getFileIcon(attachment.type || attachment.mimeType);
    const fileSize = this.formatFileSize(attachment.size || 0);
    const uploadDate = attachment.uploadedAt ? new Date(attachment.uploadedAt).toLocaleDateString('es-ES') : 'N/A';
    const uploader = attachment.uploadedBy?.name || 'Usuario';

    return `
      <div class="attachment-item">
        <div class="attachment-header">
          <div style="display: flex; align-items: center; flex: 1;">
            <span class="attachment-icon">${fileIcon}</span>
            <span class="attachment-title">${attachment.originalName || attachment.filename}</span>
          </div>
          <span class="attachment-size">${fileSize}</span>
        </div>
        
        <div class="attachment-preview">
          ${this.renderAttachmentPreview(attachment)}
          
          <div class="attachment-info">
            <div class="attachment-meta">
              <div class="attachment-meta-item">
                <span>Tipo:</span>
                <span>${this.getFileTypeName(attachment.type || attachment.mimeType)}</span>
              </div>
              <div class="attachment-meta-item">
                <span>Subido:</span>
                <span>${uploadDate}</span>
              </div>
              <div class="attachment-meta-item">
                <span>Por:</span>
                <span>${uploader}</span>
              </div>
              <div class="attachment-meta-item">
                <span>Categoría:</span>
                <span>${attachment.category || 'General'}</span>
              </div>
            </div>
            
            ${attachment.description ? `
              <div class="attachment-description">
                "${attachment.description}"
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Renderizar vista previa según el tipo de archivo
   */
  private renderAttachmentPreview(attachment: any): string {
    const mimeType = attachment.mimeType || '';
    const type = attachment.type || this.getFileTypeFromMime(mimeType);
    
    // Vista previa para imágenes
    if (type === 'image' || mimeType.startsWith('image/')) {
      return `
        <div>
          <img src="${attachment.url}" alt="${attachment.originalName}" class="attachment-image" 
               onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
          <div class="attachment-placeholder" style="display: none;">
            <div style="text-align: center;">
              <div class="attachment-placeholder-icon">🖼️</div>
              <div style="font-size: 12px; color: #64748b;">Vista previa no disponible</div>
            </div>
          </div>
        </div>
      `;
    }
    
    // Vista previa para PDFs
    if (type === 'pdf' || mimeType === 'application/pdf') {
      return `
        <div class="attachment-placeholder">
          <div style="text-align: center;">
            <div class="attachment-placeholder-icon">📄</div>
            <div style="font-size: 12px; color: #64748b; font-weight: 600;">Documento PDF</div>
            <div style="font-size: 10px; color: #94a3b8; margin-top: 4px;">
              Haga clic para abrir en el navegador
            </div>
          </div>
        </div>
      `;
    }
    
    // Vista previa para documentos de oficina
    if (type === 'document' || this.isOfficeDocument(mimeType)) {
      const docIcon = this.getDocumentIcon(mimeType);
      return `
        <div class="attachment-placeholder">
          <div style="text-align: center;">
            <div class="attachment-placeholder-icon">${docIcon}</div>
            <div style="font-size: 12px; color: #64748b; font-weight: 600;">
              ${this.getDocumentTypeName(mimeType)}
            </div>
            <div style="font-size: 10px; color: #94a3b8; margin-top: 4px;">
              Archivo de documento
            </div>
          </div>
        </div>
      `;
    }
    
    // Vista previa para videos
    if (type === 'video' || mimeType.startsWith('video/')) {
      return `
        <div class="attachment-placeholder">
          <div style="text-align: center;">
            <div class="attachment-placeholder-icon">🎥</div>
            <div style="font-size: 12px; color: #64748b; font-weight: 600;">Archivo de Video</div>
            <div style="font-size: 10px; color: #94a3b8; margin-top: 4px;">
              ${this.getVideoTypeName(mimeType)}
            </div>
          </div>
        </div>
      `;
    }
    
    // Vista previa para audio
    if (type === 'audio' || mimeType.startsWith('audio/')) {
      return `
        <div class="attachment-placeholder">
          <div style="text-align: center;">
            <div class="attachment-placeholder-icon">🎵</div>
            <div style="font-size: 12px; color: #64748b; font-weight: 600;">Archivo de Audio</div>
            <div style="font-size: 10px; color: #94a3b8; margin-top: 4px;">
              ${this.getAudioTypeName(mimeType)}
            </div>
          </div>
        </div>
      `;
    }
    
    // Vista previa genérica para otros tipos
    return `
      <div class="attachment-placeholder">
        <div style="text-align: center;">
          <div class="attachment-placeholder-icon">📎</div>
          <div style="font-size: 12px; color: #64748b; font-weight: 600;">Archivo Adjunto</div>
          <div style="font-size: 10px; color: #94a3b8; margin-top: 4px;">
            ${mimeType || 'Tipo desconocido'}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Agrupar attachments por categoría
   */
  private groupAttachmentsByCategory(attachments: any[]): Record<string, any[]> {
    const grouped: Record<string, any[]> = {};
    
    attachments.forEach(attachment => {
      const category = attachment.category || 'Anexos Generales';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(attachment);
    });
    
    return grouped;
  }

  /**
   * Formatear nombre de categoría
   */
  private formatCategoryName(category: string): string {
    const categoryTranslations: Record<string, string> = {
      'general': 'Anexos Generales',
      'technical': 'Documentación Técnica',
      'financial': 'Documentos Financieros',
      'legal': 'Documentos Legales',
      'images': 'Imágenes y Gráficos',
      'reports': 'Reportes y Análisis',
      'contracts': 'Contratos y Acuerdos',
      'specifications': 'Especificaciones',
      'manuals': 'Manuales y Guías',
      'certificates': 'Certificados',
      'presentations': 'Presentaciones',
      'other': 'Otros Documentos'
    };
    
    return categoryTranslations[category.toLowerCase()] || category;
  }

  /**
   * Obtener icono según tipo de archivo
   */
  private getFileIcon(type: string): string {
    const iconMap: Record<string, string> = {
      'pdf': '📄',
      'image': '🖼️',
      'document': '📝',
      'video': '🎥',
      'audio': '🎵',
      'spreadsheet': '📊',
      'presentation': '📊',
      'archive': '📦',
      'text': '📃',
      'other': '📎'
    };
    
    return iconMap[type] || iconMap['other'];
  }

  /**
   * Obtener nombre del tipo de archivo
   */
  private getFileTypeName(type: string): string {
    const typeNames: Record<string, string> = {
      'pdf': 'PDF',
      'image': 'Imagen',
      'document': 'Documento',
      'video': 'Video',
      'audio': 'Audio',
      'spreadsheet': 'Hoja de Cálculo',
      'presentation': 'Presentación',
      'archive': 'Archivo Comprimido',
      'text': 'Texto',
      'other': 'Archivo'
    };
    
    return typeNames[type] || 'Archivo';
  }

  /**
   * Obtener tipo de archivo desde MIME type
   */
  private getFileTypeFromMime(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType === 'application/pdf') return 'pdf';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (this.isOfficeDocument(mimeType)) return 'document';
    if (this.isSpreadsheet(mimeType)) return 'spreadsheet';
    if (this.isPresentation(mimeType)) return 'presentation';
    if (this.isArchive(mimeType)) return 'archive';
    if (mimeType.startsWith('text/')) return 'text';
    
    return 'other';
  }

  /**
   * Verificar si es documento de oficina
   */
  private isOfficeDocument(mimeType: string): boolean {
    const officeTypes = [
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/rtf',
      'text/plain'
    ];
    
    return officeTypes.includes(mimeType);
  }

  /**
   * Verificar si es hoja de cálculo
   */
  private isSpreadsheet(mimeType: string): boolean {
    const spreadsheetTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ];
    
    return spreadsheetTypes.includes(mimeType);
  }

  /**
   * Verificar si es presentación
   */
  private isPresentation(mimeType: string): boolean {
    const presentationTypes = [
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];
    
    return presentationTypes.includes(mimeType);
  }

  /**
   * Verificar si es archivo comprimido
   */
  private isArchive(mimeType: string): boolean {
    const archiveTypes = [
      'application/zip',
      'application/x-rar-compressed',
      'application/x-7z-compressed',
      'application/gzip'
    ];
    
    return archiveTypes.includes(mimeType);
  }

  /**
   * Obtener icono específico para documentos
   */
  private getDocumentIcon(mimeType: string): string {
    if (mimeType.includes('word')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📊';
    if (mimeType === 'text/plain') return '📃';
    if (mimeType === 'application/rtf') return '📄';
    
    return '📝';
  }

  /**
   * Obtener nombre del tipo de documento
   */
  private getDocumentTypeName(mimeType: string): string {
    if (mimeType.includes('word')) return 'Documento Word';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'Hoja Excel';
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'Presentación PowerPoint';
    if (mimeType === 'text/plain') return 'Archivo de Texto';
    if (mimeType === 'application/rtf') return 'Documento RTF';
    
    return 'Documento';
  }

  /**
   * Obtener nombre del tipo de video
   */
  private getVideoTypeName(mimeType: string): string {
    if (mimeType.includes('mp4')) return 'Video MP4';
    if (mimeType.includes('avi')) return 'Video AVI';
    if (mimeType.includes('mov')) return 'Video MOV';
    if (mimeType.includes('wmv')) return 'Video WMV';
    if (mimeType.includes('webm')) return 'Video WebM';
    
    return 'Archivo de Video';
  }

  /**
   * Obtener nombre del tipo de audio
   */
  private getAudioTypeName(mimeType: string): string {
    if (mimeType.includes('mp3')) return 'Audio MP3';
    if (mimeType.includes('wav')) return 'Audio WAV';
    if (mimeType.includes('ogg')) return 'Audio OGG';
    if (mimeType.includes('flac')) return 'Audio FLAC';
    if (mimeType.includes('aac')) return 'Audio AAC';
    
    return 'Archivo de Audio';
  }

  /**
   * Formatear tamaño de archivo
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // ... existing code ...

  private formatFieldName(fieldName: string): string {
    const fieldTranslations: Record<string, string> = {
      // Campos financieros y ROI
      'five_year_roi': 'ROI estimado en 5 años',
      'roi_calculation': 'Cálculo de ROI',
      'investment_cost': 'Costo de inversión',
      'annual_savings': 'Ahorros anuales',
      'payback_period': 'Período de recuperación',
      'net_present_value': 'Valor presente neto',
      'internal_rate_return': 'Tasa interna de retorno',
      'total_cost_ownership': 'Costo total de propiedad',
      'operational_savings': 'Ahorros operacionales',
      'maintenance_cost': 'Costo de mantenimiento',
      'energy_savings': 'Ahorros energéticos',
      'labor_cost_reduction': 'Reducción de costos laborales',
      'productivity_increase': 'Incremento de productividad',
      'quality_improvement': 'Mejora de calidad',
      'error_reduction': 'Reducción de errores',
      'downtime_reduction': 'Reducción de tiempo de inactividad',
      'efficiency_gain': 'Ganancia de eficiencia',
      
      // Campos técnicos
      'components': 'Componentes',
      'integrations': 'Integraciones',
      'infrastructure': 'Infraestructura',
      'system_overview': 'Resumen del sistema',
      'security_measures': 'Medidas de seguridad',
      'technical_requirements': 'Requisitos técnicos',
      'technical_specs': 'Especificaciones técnicas',
      'implementation_time': 'Tiempo de implementación',
      'training_requirements': 'Requisitos de capacitación',
      'hardware_requirements': 'Requisitos de hardware',
      'software_requirements': 'Requisitos de software',
      'system_integration': 'Integración del sistema',
      'security_requirements': 'Requisitos de seguridad',
      'backup_strategy': 'Estrategia de respaldo',
      'disaster_recovery': 'Recuperación ante desastres',
      'scalability_options': 'Opciones de escalabilidad',
      'performance_metrics': 'Métricas de rendimiento',
      'monitoring_tools': 'Herramientas de monitoreo',
      'automation_level': 'Nivel de automatización',
      'integration_complexity': 'Complejidad de integración',
      'data_migration': 'Migración de datos',
      'user_training': 'Capacitación de usuarios',
      'support_level': 'Nivel de soporte',
      'warranty_period': 'Período de garantía',
      'upgrade_path': 'Ruta de actualización',
      'customization_options': 'Opciones de personalización',
      
      // Campos de proyecto
      'project_scope': 'Alcance del proyecto',
      'project_timeline': 'Cronograma del proyecto',
      'project_budget': 'Presupuesto del proyecto',
      'project_risks': 'Riesgos del proyecto',
      'project_deliverables': 'Entregables del proyecto',
      'project_milestones': 'Hitos del proyecto',
      'project_resources': 'Recursos del proyecto',
      'project_stakeholders': 'Interesados del proyecto',
      'project_constraints': 'Restricciones del proyecto',
      'project_assumptions': 'Supuestos del proyecto',
      'success_criteria': 'Criterios de éxito',
      'acceptance_criteria': 'Criterios de aceptación',
      'quality_standards': 'Estándares de calidad',
      'compliance_requirements': 'Requisitos de cumplimiento',
      
      // Campos de cliente
      'client_name': 'Nombre del cliente',
      'client_contact': 'Contacto del cliente',
      'client_industry': 'Industria del cliente',
      'client_size': 'Tamaño del cliente',
      'client_requirements': 'Requisitos del cliente',
      'client_expectations': 'Expectativas del cliente',
      'client_budget': 'Presupuesto del cliente',
      'client_timeline': 'Cronograma del cliente',
      'client_approval': 'Aprobación del cliente',
      'client_feedback': 'Retroalimentación del cliente'
    };
    
    // Si hay una traducción específica, úsala
    if (fieldTranslations[fieldName]) {
      return fieldTranslations[fieldName];
    }
    
    // Si no hay traducción específica, formatear automáticamente
    return fieldName
      .replace(/_/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private formatFieldValue(fieldName: string, value: any): string {
    if (value === null || value === undefined || value === '') {
      return 'No especificado';
    }

    // Formatear valores numéricos con decimales
    if (typeof value === 'number') {
      // Si es un porcentaje o ROI
      if (fieldName.includes('roi') || fieldName.includes('percentage') || fieldName.includes('rate')) {
        return `${value.toFixed(2)}%`;
      }
      // Si es un costo o valor monetario
      if (fieldName.includes('cost') || fieldName.includes('value') || fieldName.includes('price') || fieldName.includes('budget') || fieldName.includes('savings')) {
        return `$${value.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }
      // Si es tiempo en horas
      if (fieldName.includes('hours') || fieldName.includes('time')) {
        return `${value} horas`;
      }
      // Si es tiempo en días
      if (fieldName.includes('days') || fieldName.includes('period')) {
        return `${value} días`;
      }
      // Número general
      return value.toLocaleString('es-MX');
    }

    // Formatear fechas
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
      try {
        const date = new Date(value);
        return date.toLocaleDateString('es-ES', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      } catch (e) {
        return value;
      }
    }

    // Formatear arrays
    if (Array.isArray(value)) {
      return value.length > 0 ? value.join(', ') : 'Ninguno';
    }

    // Formatear objetos
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value, null, 2);
    }

    // Formatear booleanos
    if (typeof value === 'boolean') {
      return value ? 'Sí' : 'No';
    }

    // Valor string general
    return value.toString();
  }

  private getMimeType(format: string): string {
    const mimeTypes: Record<string, string> = {
      'pdf': 'application/pdf',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'html': 'text/html'
    };
    return mimeTypes[format.toLowerCase()] || 'application/octet-stream';
  }

  private async createDocumentFile(content: string, format: string): Promise<string> {
    try {
      if (format === 'pdf') {
        // Generar un PDF HTML mejorado usando jsPDF o similar
        // Por ahora, creamos un PDF simple con el contenido HTML
        return this.generatePDFContent(content);
      } else if (format === 'jpg' || format === 'png') {
        // Generar una imagen SVG que represente el documento
        return this.generateImageContent(content, format);
      } else if (format === 'html') {
        // Retornar el contenido HTML directamente
        return Buffer.from(content).toString('base64');
      }

      throw new Error(`Formato no soportado: ${format}`);
    } catch (error) {
      this.logger.error('Error creating document file', { error, format });
      throw new Error(`Error generando archivo ${format}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  private generatePDFContent(htmlContent: string): string {
    // Simular la generación de un PDF HTML simplificado
    // En un entorno real, usarías una librería como Puppeteer o jsPDF
    
    // Extraer información básica del HTML
    const titleMatch = htmlContent.match(/<div class="document-title">([^<]+)<\/div>/);
    const title = titleMatch ? titleMatch[1] : 'Documento AIM';
    
    const companyMatch = htmlContent.match(/<div class="company-name">([^<]+)<\/div>/);
    const company = companyMatch ? companyMatch[1] : 'Automatización Industrial Mireles';
    
    // Crear un PDF básico funcional
    const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
  /Font <<
    /F1 5 0 R
    /F2 6 0 R
  >>
>>
>>
endobj

4 0 obj
<<
/Length 750
>>
stream
BT
/F1 16 Tf
50 740 Td
(${company}) Tj
0 -20 Td
/F2 12 Tf
(Sistema de Gestión de Automatización Industrial) Tj
0 -40 Td
/F1 14 Tf
(${title}) Tj
0 -30 Td
/F2 10 Tf
(Documento generado el: ${new Date().toLocaleDateString('es-ES')}) Tj
0 -20 Td
(Hora: ${new Date().toLocaleTimeString('es-ES')}) Tj
0 -40 Td
(Este documento ha sido generado automáticamente) Tj
0 -15 Td
(por el sistema AIM de gestión de automatización industrial.) Tj
0 -30 Td
(Para visualizar el contenido completo, por favor) Tj
0 -15 Td
(acceda al sistema web donde podrá ver todos los detalles,) Tj
0 -15 Td
(datos específicos y generar versiones más completas.) Tj
0 -40 Td
/F1 12 Tf
(AIM - Automatización Industrial Mireles) Tj
0 -20 Td
/F2 10 Tf
(RFC: AIM2312054A9) Tj
0 -15 Td
(Av. Tecnológico 1500, Col. Industrial, 64700 Monterrey, N.L.) Tj
0 -15 Td
(Tel: +52 (81) 8123-4567) Tj
0 -15 Td
(Email: contacto@aim-automatizacion.com) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica-Bold
>>
endobj

6 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 7
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000299 00000 n 
0000001101 00000 n 
0000001166 00000 n 
trailer
<<
/Size 7
/Root 1 0 R
>>
startxref
1225
%%EOF`;
      
    return Buffer.from(pdfContent).toString('base64');
  }

  private generateImageContent(htmlContent: string, format: string): string {
    // Extraer información del HTML para crear una imagen representativa
    const titleMatch = htmlContent.match(/<div class="document-title">([^<]+)<\/div>/);
    const title = titleMatch ? titleMatch[1] : 'Documento AIM';
    
    const subtitleMatch = htmlContent.match(/<div class="document-subtitle">([^<]+)<\/div>/);
    const subtitle = subtitleMatch ? subtitleMatch[1] : 'Documento';
    
    const numberMatch = htmlContent.match(/Documento No\. ([^<]+)/);
    const docNumber = numberMatch ? numberMatch[1] : 'DOC-001';
    
    // Crear SVG representativo del documento
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000">
      <!-- Fondo del documento -->
      <rect width="800" height="1000" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>
      
      <!-- Header con gradiente -->
      <defs>
        <linearGradient id="headerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#14b8a6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#10b981;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#14b8a6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#10b981;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Logo de la empresa -->
      <rect x="40" y="40" width="80" height="80" rx="8" fill="url(#logoGradient)"/>
      <text x="80" y="90" text-anchor="middle" fill="white" font-size="24" font-weight="bold" font-family="Arial">AIM</text>
      
      <!-- Información de la empresa -->
      <rect x="140" y="40" width="620" height="80" rx="8" fill="#f8fafc" stroke="#14b8a6" stroke-width="2"/>
      <text x="160" y="65" fill="#1e293b" font-size="16" font-weight="bold" font-family="Arial">Automatización Industrial Mireles</text>
      <text x="160" y="85" fill="#64748b" font-size="10" font-family="Arial">RFC: AIM2312054A9</text>
      <text x="160" y="100" fill="#64748b" font-size="10" font-family="Arial">Av. Tecnológico 1500, Col. Industrial, 64700 Monterrey, N.L.</text>
      <text x="160" y="115" fill="#64748b" font-size="10" font-family="Arial">contacto@aim-automatizacion.com</text>
      
      <!-- Header del documento -->
      <rect x="40" y="160" width="720" height="100" rx="12" fill="url(#headerGradient)"/>
      <text x="60" y="190" fill="white" font-size="20" font-weight="bold" font-family="Arial">${title}</text>
      <text x="60" y="215" fill="white" font-size="14" font-family="Arial" opacity="0.9">${subtitle}</text>
      <rect x="60" y="225" width="200" height="25" rx="12" fill="rgba(255,255,255,0.2)"/>
      <text x="70" y="242" fill="white" font-size="12" font-family="Arial">${docNumber}</text>
      
      <!-- Sección de contenido -->
      <rect x="40" y="300" width="720" height="60" rx="8" fill="#f1f5f9" stroke="#e2e8f0"/>
      <circle cx="60" cy="320" r="4" fill="#14b8a6"/>
      <text x="75" y="325" fill="#1e293b" font-size="14" font-weight="600" font-family="Arial">Información de la Orden</text>
      
      <!-- Datos de ejemplo -->
      <rect x="60" y="340" width="330" height="40" rx="6" fill="#f8fafc" stroke="#14b8a6" stroke-width="1" stroke-dasharray="0,0,3,0"/>
      <text x="70" y="355" fill="#475569" font-size="11" font-weight="600" font-family="Arial">Cliente:</text>
      <text x="70" y="370" fill="#1e293b" font-size="11" font-family="Arial">Información del cliente</text>
      
      <rect x="410" y="340" width="330" height="40" rx="6" fill="#f8fafc" stroke="#14b8a6" stroke-width="1" stroke-dasharray="0,0,3,0"/>
      <text x="420" y="355" fill="#475569" font-size="11" font-weight="600" font-family="Arial">Proyecto:</text>
      <text x="420" y="370" fill="#1e293b" font-size="11" font-family="Arial">Detalles del proyecto</text>
      
      <!-- Más secciones -->
      <rect x="40" y="420" width="720" height="60" rx="8" fill="#f1f5f9" stroke="#e2e8f0"/>
      <circle cx="60" cy="440" r="4" fill="#14b8a6"/>
      <text x="75" y="445" fill="#1e293b" font-size="14" font-weight="600" font-family="Arial">Detalles del Documento</text>
      
      <rect x="60" y="460" width="680" height="80" rx="6" fill="#ffffff" stroke="#e2e8f0"/>
      <text x="80" y="480" fill="#475569" font-size="12" font-family="Arial">Este documento contiene información detallada sobre el proyecto</text>
      <text x="80" y="500" fill="#475569" font-size="12" font-family="Arial">de automatización industrial. Para ver el contenido completo,</text>
      <text x="80" y="520" fill="#475569" font-size="12" font-family="Arial">acceda al sistema web de AIM.</text>
      
      <!-- Footer -->
      <line x1="40" y1="880" x2="760" y2="880" stroke="#e2e8f0" stroke-width="2"/>
      <text x="400" y="910" text-anchor="middle" fill="#14b8a6" font-size="12" font-weight="bold" font-family="Arial">AIM - Automatización Industrial Mireles</text>
      <text x="400" y="930" text-anchor="middle" fill="#64748b" font-size="10" font-family="Arial">Sistema de Gestión de Automatización Industrial</text>
      <text x="400" y="950" text-anchor="middle" fill="#64748b" font-size="10" font-family="Arial">Generado el ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}</text>
      <text x="400" y="970" text-anchor="middle" fill="#64748b" font-size="8" font-family="Arial" opacity="0.7">Este documento es confidencial y propiedad del cliente. Prohibida su reproducción sin autorización.</text>
      </svg>`;
      
    return Buffer.from(svgContent).toString('base64');
  }

  // Método de prueba para verificar el logo
  async testLogo(): Promise<{ success: boolean; logoFound: boolean; path?: string; message: string }> {
    try {
      const logoDataUrl = this.getLogoAsBase64();
      const isDefault = logoDataUrl.startsWith('data:image/svg+xml');
      
      return {
        success: true,
        logoFound: !isDefault,
        path: isDefault ? 'SVG por defecto' : 'Imagen PNG encontrada',
        message: isDefault ? 'Usando logo SVG por defecto' : 'Logo PNG cargado correctamente'
      };
    } catch (error) {
      return {
        success: false,
        logoFound: false,
        message: `Error al cargar logo: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
} 