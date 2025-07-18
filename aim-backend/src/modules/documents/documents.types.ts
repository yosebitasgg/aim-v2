import { z } from 'zod';

// ===== ENUMS =====

export type DocumentStatus = 'DRAFT' | 'FINALIZED' | 'SENT' | 'REVIEWED' | 'APPROVED' | 'REJECTED' | 'ARCHIVED';

export enum DocumentAction {
  CREATED = 'created',
  UPDATED = 'updated',
  FINALIZED = 'finalized',
  SENT = 'sent',
  DOWNLOADED = 'downloaded',
  EMAIL_SENT = 'email_sent',
  REVIEWED = 'reviewed',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ARCHIVED = 'archived',
  VERSION_CREATED = 'version_created',
  ATTACHMENT_ADDED = 'attachment_added',
  ATTACHMENT_REMOVED = 'attachment_removed'
}

// ===== ATTACHMENT TYPES =====

export type AttachmentType = 'pdf' | 'image' | 'document' | 'video' | 'audio' | 'other';

export interface DocumentAttachment {
  id: string;
  filename: string;
  originalName: string;
  type: AttachmentType;
  mimeType: string;
  size: number;
  url: string;
  category: string; // Para categorizar según el tipo de documento
  description?: string;
  uploadedAt: Date;
  uploadedBy: {
    id: string;
    name: string;
    email: string;
  };
}

// ===== ROI CALCULATION TYPES =====

export interface ROIEmployee {
  id: string;
  name: string;
  position: string;
  monthlySalary: number;
  hoursPerMonth: number;
  hourlyRate: number;
  affectedPercentage: number; // Porcentaje del tiempo que le afecta la automatización
}

export interface ROIAgentConfig {
  id: string;
  name: string;
  type: 'data_processing' | 'customer_service' | 'inventory' | 'reporting' | 'communication' | 'workflow';
  timeSavingPercentage: number;
  errorReductionPercentage: number;
  costPerMonth: number;
  implementationCost: number;
  maintenanceCostPerMonth: number;
  productivityIncrease: number;
}

export interface ROICalculation {
  employees: ROIEmployee[];
  selectedAgents: ROIAgentConfig[];
  currentMonthlyCosts: number;
  projectedMonthlySavings: number;
  totalImplementationCost: number;
  monthlyMaintenanceCost: number;
  roiPercentage: number;
  paybackMonths: number;
  netPresentValue: number;
  internalRateOfReturn: number;
  fiveYearSavings: number;
  calculations: {
    currentAnnualCost: number;
    projectedAnnualSavings: number;
    totalAnnualSavings: number;
    breakEvenPoint: number;
    efficiencyGain: number;
    errorReductionValue: number;
    productivityValue: number;
  };
  charts: {
    savingsOverTime: Array<{
      month: number;
      cumulativeSavings: number;
      monthlySavings: number;
      roi: number;
    }>;
    costBreakdown: {
      implementation: number;
      maintenance: number;
      currentOperational: number;
      projectedOperational: number;
    };
    benefitsBreakdown: {
      timeSavings: number;
      errorReduction: number;
      productivityIncrease: number;
      otherBenefits: number;
    };
  };
}

// ===== VALIDATION SCHEMAS =====

export const DocumentAttachmentSchema = z.object({
  filename: z.string().min(1),
  originalName: z.string().min(1),
  type: z.enum(['pdf', 'image', 'document', 'video', 'audio', 'other']),
  mimeType: z.string().min(1),
  size: z.number().positive(),
  url: z.string().url(),
  category: z.string().min(1),
  description: z.string().optional()
});

export const ROIEmployeeSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  position: z.string().min(1),
  monthlySalary: z.number().positive(),
  hoursPerMonth: z.number().positive(),
  hourlyRate: z.number().positive(),
  affectedPercentage: z.number().min(0).max(100)
});

export const ROIAgentConfigSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: z.enum(['data_processing', 'customer_service', 'inventory', 'reporting', 'communication', 'workflow']),
  timeSavingPercentage: z.number().min(0).max(100),
  errorReductionPercentage: z.number().min(0).max(100),
  costPerMonth: z.number().min(0),
  implementationCost: z.number().min(0),
  maintenanceCostPerMonth: z.number().min(0),
  productivityIncrease: z.number().min(0).max(100)
});

export const ROICalculationSchema = z.object({
  employees: z.array(ROIEmployeeSchema),
  selectedAgents: z.array(ROIAgentConfigSchema),
  currentMonthlyCosts: z.number().min(0),
  projectedMonthlySavings: z.number().min(0),
  totalImplementationCost: z.number().min(0),
  monthlyMaintenanceCost: z.number().min(0),
  roiPercentage: z.number(),
  paybackMonths: z.number().positive(),
  netPresentValue: z.number(),
  internalRateOfReturn: z.number(),
  fiveYearSavings: z.number(),
  calculations: z.object({
    currentAnnualCost: z.number(),
    projectedAnnualSavings: z.number(),
    totalAnnualSavings: z.number(),
    breakEvenPoint: z.number(),
    efficiencyGain: z.number(),
    errorReductionValue: z.number(),
    productivityValue: z.number()
  }),
  charts: z.object({
    savingsOverTime: z.array(z.object({
      month: z.number(),
      cumulativeSavings: z.number(),
      monthlySavings: z.number(),
      roi: z.number()
    })),
    costBreakdown: z.object({
      implementation: z.number(),
      maintenance: z.number(),
      currentOperational: z.number(),
      projectedOperational: z.number()
    }),
    benefitsBreakdown: z.object({
      timeSavings: z.number(),
      errorReduction: z.number(),
      productivityIncrease: z.number(),
      otherBenefits: z.number()
    })
  })
});

export const CreateDocumentTypeSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100),
  description: z.string().min(1),
  phase: z.string().min(1).max(20),
  icon: z.string().min(1).max(50),
  color: z.string().min(4).max(7),
  estimatedTime: z.string().max(50),
  formSchema: z.record(z.any()),
  templateConfig: z.record(z.any()),
  exportConfig: z.record(z.any()),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional()
});

export const UpdateDocumentTypeSchema = CreateDocumentTypeSchema.partial();

export const CreateDocumentSchema = z.object({
  orderId: z.string().min(1),
  documentTypeId: z.string().min(1),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  sharedData: z.record(z.any()),
  specificData: z.record(z.any()),
  metadata: z.record(z.any()).optional(),
  attachments: z.array(DocumentAttachmentSchema).optional(),
  roiCalculation: ROICalculationSchema.optional()
});

export const UpdateDocumentSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  sharedData: z.record(z.any()).optional(),
  specificData: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
  attachments: z.array(DocumentAttachmentSchema).optional(),
  roiCalculation: ROICalculationSchema.optional()
});

export const ChangeDocumentStatusSchema = z.object({
  status: z.enum(['DRAFT', 'FINALIZED', 'SENT', 'REVIEWED', 'APPROVED', 'REJECTED', 'ARCHIVED']),
  notes: z.string().optional(),
  approvalData: z.record(z.any()).optional()
});

export const DocumentFiltersSchema = z.object({
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(100).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  search: z.string().optional(),
  status: z.enum(['DRAFT', 'FINALIZED', 'SENT', 'REVIEWED', 'APPROVED', 'REJECTED', 'ARCHIVED']).optional(),
  documentTypeId: z.string().optional(),
  orderId: z.string().optional(),
  createdById: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional()
});

export const DocumentStatsSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  groupBy: z.enum(['day', 'week', 'month']).optional(),
  orderId: z.string().optional(),
  documentTypeId: z.string().optional()
});

export const GenerateDocumentSchema = z.object({
  format: z.enum(['pdf', 'jpg', 'png', 'html']),
  options: z.record(z.any()).optional()
});

export const SendDocumentSchema = z.object({
  recipients: z.array(z.string().email()).min(1),
  subject: z.string().min(1).max(255),
  body: z.string().min(1),
  format: z.enum(['pdf', 'jpg', 'png']).optional(),
  copyToSender: z.boolean().optional()
});

export const CreateDocumentVersionSchema = z.object({
  version: z.string().min(1).max(10),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  sharedData: z.record(z.any()),
  specificData: z.record(z.any()),
  changeLog: z.string().optional(),
  metadata: z.record(z.any()).optional()
});

export const DocumentActivitySchema = z.object({
  action: z.string().min(1).max(50),
  description: z.string().optional(),
  activityData: z.record(z.any()).optional()
});

// ===== TYPE DEFINITIONS =====

export type CreateDocumentTypeInput = z.infer<typeof CreateDocumentTypeSchema>;
export type UpdateDocumentTypeInput = z.infer<typeof UpdateDocumentTypeSchema>;
export type CreateDocumentInput = z.infer<typeof CreateDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof UpdateDocumentSchema>;
export type ChangeDocumentStatusInput = z.infer<typeof ChangeDocumentStatusSchema>;
export type DocumentFilters = z.infer<typeof DocumentFiltersSchema>;
export type DocumentStatsInput = z.infer<typeof DocumentStatsSchema>;
export type GenerateDocumentInput = z.infer<typeof GenerateDocumentSchema>;
export type SendDocumentInput = z.infer<typeof SendDocumentSchema>;
export type CreateDocumentVersionInput = z.infer<typeof CreateDocumentVersionSchema>;
export type DocumentActivityInput = z.infer<typeof DocumentActivitySchema>;

// ===== RESPONSE INTERFACES =====

export interface DocumentTypeResponse {
  id: string;
  name: string;
  slug: string;
  description: string;
  phase: string;
  icon: string;
  color: string;
  estimatedTime: string;
  formSchema: Record<string, any>;
  templateConfig: Record<string, any>;
  exportConfig: Record<string, any>;
  isActive: boolean;
  sortOrder: number;
  documentsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentResponse {
  id: string;
  documentNumber: string;
  title: string;
  description?: string;
  status: DocumentStatus;
  version: string;
  isCurrentVersion: boolean;
  orderId: string; // Campo que faltaba
  documentTypeId: string; // Campo que faltaba
  sharedData: Record<string, any>;
  specificData: Record<string, any>;
  generatedFiles?: Record<string, any>;
  metadata?: Record<string, any>;
  approvalData?: Record<string, any>;
  attachments?: DocumentAttachment[];
  roiCalculation?: ROICalculation;
  downloadCount: number;
  emailSentCount: number;
  finalizedAt?: Date;
  sentAt?: Date;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Relaciones
  order: {
    id: string;
    orderNumber: string;
    title: string;
    client: {
      id: string;
      companyName: string;
    };
  };
  
  documentType: {
    id: string;
    name: string;
    slug: string;
    phase: string;
    icon: string;
    color: string;
  };
  
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  
  lastModifiedBy: {
    id: string;
    name: string;
    email: string;
  };
}

export interface DocumentDetailResponse extends DocumentResponse {
  versions: DocumentVersionResponse[];
  recentActivities: DocumentActivityResponse[];
}

export interface DocumentVersionResponse {
  id: string;
  version: string;
  title: string;
  description?: string;
  sharedData: Record<string, any>;
  specificData: Record<string, any>;
  generatedFiles?: Record<string, any>;
  changeLog?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
}

export interface DocumentActivityResponse {
  id: string;
  action: string;
  description?: string;
  activityData?: Record<string, any>;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface PaginatedDocumentsResponse {
  documents: DocumentResponse[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  filters: DocumentFilters;
}

export interface DocumentStatsResponse {
  overview: {
    totalDocuments: number;
    documentsByStatus: Record<DocumentStatus, number>;
    documentsByType: Record<string, number>;
    documentsThisMonth: number;
    averageTimeToFinalize: number; // en horas
  };
  
  documentsByOrder: Array<{
    orderId: string;
    orderNumber: string;
    client: string;
    documentCount: number;
    completedDocuments: number;
    pendingDocuments: number;
  }>;
  
  documentsByPhase: Record<string, number>;
  
  timeSeriesData: Array<{
    period: string;
    count: number;
    finalized: number;
    sent: number;
  }>;
  
  recentActivity: Array<{
    documentId: string;
    documentTitle: string;
    action: string;
    timestamp: Date;
    user: string;
  }>;
}

export interface DocumentFormDefinition {
  documentType: DocumentTypeResponse;
  formFields: FormFieldDefinition[];
  sharedFields: FormFieldDefinition[];
  validationRules: Record<string, any>;
  defaultValues: Record<string, any>;
}

export interface FormFieldDefinition {
  id: string;
  name: string;
  type: 'text' | 'number' | 'email' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'file' | 'table' | 'section' | 'attachment' | 'roi_calculator' | 'aim_quote_calculator';
  label: string;
  placeholder?: string;
  description?: string;
  required: boolean;
  options?: Array<{ value: string; label: string; }>;
  validation?: Record<string, any>;
  defaultValue?: any;
  section?: string;
  order: number;
  conditional?: {
    field: string;
    value: any;
    operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  };
  attachmentConfig?: {
    allowedTypes: AttachmentType[];
    maxSize: number;
    maxCount: number;
    categories: string[];
  };
  quoteConfig?: Record<string, any>; // Configuración específica para aim_quote_calculator
}

export interface GeneratedFile {
  id: string;
  format: 'pdf' | 'jpg' | 'png';
  url: string;
  filename: string;
  size: number;
  generatedAt: Date;
  downloadCount: number;
}

export interface DocumentApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
}

// ===== ERROR CODES =====

export enum DocumentErrorCodes {
  DOCUMENT_NOT_FOUND = 'DOCUMENT_NOT_FOUND',
  DOCUMENT_TYPE_NOT_FOUND = 'DOCUMENT_TYPE_NOT_FOUND',
  ORDER_NOT_FOUND = 'ORDER_NOT_FOUND',
  INVALID_STATUS_TRANSITION = 'INVALID_STATUS_TRANSITION',
  DOCUMENT_ALREADY_FINALIZED = 'DOCUMENT_ALREADY_FINALIZED',
  GENERATION_FAILED = 'GENERATION_FAILED',
  EMAIL_SEND_FAILED = 'EMAIL_SEND_FAILED',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  DUPLICATE_DOCUMENT_NUMBER = 'DUPLICATE_DOCUMENT_NUMBER',
  INVALID_DOCUMENT_DATA = 'INVALID_DOCUMENT_DATA',
  VERSION_ALREADY_EXISTS = 'VERSION_ALREADY_EXISTS',
  TEMPLATE_NOT_FOUND = 'TEMPLATE_NOT_FOUND',
  INVALID_EXPORT_FORMAT = 'INVALID_EXPORT_FORMAT'
}

// ===== TEMPLATE DEFINITIONS =====

export interface DocumentTemplate {
  id: string;
  name: string;
  layout: TemplateLayout;
  sections: TemplateSection[];
  styles: TemplateStyles;
  variables: TemplateVariable[];
}

export interface TemplateLayout {
  pageSize: 'A4' | 'Letter' | 'Legal';
  orientation: 'portrait' | 'landscape';
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  header: TemplateHeader;
  footer: TemplateFooter;
}

export interface TemplateHeader {
  enabled: boolean;
  height: number;
  content: string;
  logo?: {
    url: string;
    width: number;
    height: number;
    position: 'left' | 'center' | 'right';
  };
}

export interface TemplateFooter {
  enabled: boolean;
  height: number;
  content: string;
  pageNumbers: boolean;
  position: 'left' | 'center' | 'right';
}

export interface TemplateSection {
  id: string;
  name: string;
  type: 'text' | 'table' | 'chart' | 'image' | 'signature' | 'page_break';
  content: string;
  data?: Record<string, any>;
  styles?: Record<string, any>;
  conditional?: {
    field: string;
    value: any;
    operator: string;
  };
  order: number;
}

export interface TemplateStyles {
  fonts: {
    primary: string;
    secondary: string;
    monospace: string;
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    background: string;
  };
  spacing: {
    small: number;
    medium: number;
    large: number;
  };
}

export interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'array' | 'object';
  description: string;
  defaultValue?: any;
  required: boolean;
  source: 'shared' | 'specific' | 'computed';
  computation?: string;
} 