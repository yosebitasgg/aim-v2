import { z } from 'zod';

// ===== ENUMS (coinciden con Prisma schema) =====

export enum CreatedAgentStatus {
  DRAFT = 'DRAFT',
  IN_DEVELOPMENT = 'IN_DEVELOPMENT',
  TESTING = 'TESTING',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED',
  ERROR = 'ERROR'
}

export enum AgentConnectionType {
  API = 'API',
  RPA = 'RPA',
  WEBSCRAPING = 'WEBSCRAPING',
  FILE = 'FILE',
  DATABASE = 'DATABASE',
  IOT_SENSORS = 'IOT_SENSORS'
}

// ===== SCHEMAS DE VALIDACIÓN =====

export const CreateCreatedAgentSchema = z.object({
  orderId: z.string().min(1, 'El ID de la orden es requerido'),
  templateAgentId: z.string().optional(),
  assignedToId: z.string().optional(),
  name: z.string().min(1, 'El nombre es requerido').max(255, 'El nombre no puede exceder 255 caracteres'),
  description: z.string().min(1, 'La descripción es requerida'),
  purpose: z.string().min(1, 'El propósito es requerido'),
  connectionType: z.nativeEnum(AgentConnectionType, { required_error: 'El tipo de conexión es requerido' }),
  estimatedHours: z.number().int().min(1).optional(),
  complexity: z.enum(['basic', 'medium', 'advanced']).default('medium'),
  version: z.string().default('1.0.0'),
  developmentNotes: z.string().optional()
});

export const UpdateCreatedAgentSchema = CreateCreatedAgentSchema.partial().extend({
  status: z.nativeEnum(CreatedAgentStatus).optional(),
  actualHours: z.number().int().min(0).optional(),
  testingNotes: z.string().optional(),
  deploymentNotes: z.string().optional(),
  startedAt: z.string().datetime().optional(),
  finishedAt: z.string().datetime().optional(),
  lastTestDate: z.string().datetime().optional(),
  deployedAt: z.string().datetime().optional(),
  successRate: z.number().min(0).max(100).optional(),
  averageExecutionTime: z.number().int().min(0).optional(),
  totalExecutions: z.number().int().min(0).optional(),
  errorCount: z.number().int().min(0).optional()
});

export const CreateAgentConfigurationSchema = z.object({
  createdAgentId: z.string().min(1, 'El ID del agente creado es requerido'),
  configName: z.string().min(1, 'El nombre de la configuración es requerido').max(100),
  configType: z.string().min(1, 'El tipo de configuración es requerido').max(50),
  configData: z.object({}).passthrough(),
  connectionSettings: z.object({}).passthrough().optional(),
  authenticationData: z.object({}).passthrough().optional(),
  schedulingConfig: z.object({}).passthrough().optional(),
  errorHandling: z.object({}).passthrough().optional(),
  notificationSettings: z.object({}).passthrough().optional(),
  selectedNodes: z.array(z.string()).optional(),
  customNodes: z.array(z.object({}).passthrough()).optional(),
  version: z.string().default('1.0.0'),
  isActive: z.boolean().default(true)
});

export const UpdateAgentConfigurationSchema = CreateAgentConfigurationSchema.partial();

export const CreateAgentWorkflowSchema = z.object({
  createdAgentId: z.string().min(1, 'El ID del agente creado es requerido'),
  workflowName: z.string().min(1, 'El nombre del workflow es requerido').max(255),
  workflowType: z.enum(['original', 'modified', 'final'], { required_error: 'El tipo de workflow es requerido' }),
  description: z.string().optional(),
  n8nWorkflow: z.object({}).passthrough(),
  workflowNodes: z.array(z.string()).min(1, 'Debe tener al menos un nodo'),
  nodeCount: z.number().int().min(0).optional(),
  connectionCount: z.number().int().min(0).optional(),
  complexity: z.enum(['basic', 'medium', 'advanced']).optional(),
  version: z.string().default('1.0.0'),
  isCurrentVersion: z.boolean().default(true),
  parentWorkflowId: z.string().optional(),
  changeLog: z.string().optional(),
  developmentNotes: z.string().optional(),
  isActive: z.boolean().default(true),
  isTested: z.boolean().default(false),
  isDeployed: z.boolean().default(false)
});

export const UpdateAgentWorkflowSchema = CreateAgentWorkflowSchema.partial().extend({
  lastTestDate: z.string().datetime().optional(),
  testResults: z.object({}).passthrough().optional()
});

export const AgentsFiltersSchema = z.object({
  search: z.string().optional(),
  status: z.nativeEnum(CreatedAgentStatus).optional(),
  connectionType: z.nativeEnum(AgentConnectionType).optional(),
  complexity: z.enum(['basic', 'medium', 'advanced']).optional(),
  orderId: z.string().optional(),
  templateAgentId: z.string().optional(),
  createdById: z.string().optional(),
  assignedToId: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['name', 'createdAt', 'updatedAt', 'status', 'agentNumber']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

export const AgentsStatsSchema = z.object({
  period: z.enum(['7d', '30d', '90d', '1y']).default('30d'),
  groupBy: z.enum(['day', 'week', 'month']).default('day'),
  status: z.nativeEnum(CreatedAgentStatus).optional(),
  connectionType: z.nativeEnum(AgentConnectionType).optional()
});

// ===== TIPOS DERIVADOS =====

export type CreateCreatedAgentInput = z.infer<typeof CreateCreatedAgentSchema>;
export type UpdateCreatedAgentInput = z.infer<typeof UpdateCreatedAgentSchema>;
export type CreateAgentConfigurationInput = z.infer<typeof CreateAgentConfigurationSchema>;
export type UpdateAgentConfigurationInput = z.infer<typeof UpdateAgentConfigurationSchema>;
export type CreateAgentWorkflowInput = z.infer<typeof CreateAgentWorkflowSchema>;
export type UpdateAgentWorkflowInput = z.infer<typeof UpdateAgentWorkflowSchema>;
export type AgentsFilters = z.infer<typeof AgentsFiltersSchema>;
export type AgentsStatsParams = z.infer<typeof AgentsStatsSchema>;

// ===== INTERFACES DE RESPUESTA =====

export interface CreatedAgentResponse {
  id: string;
  agentNumber: string;
  orderId: string;
  order?: {
    id: string;
    orderNumber: string;
    title: string;
    client: {
      id: string;
      companyName: string;
    };
  };
  templateAgentId?: string;
  templateAgent?: {
    id: string;
    name: string;
    title: string;
    category: {
      name: string;
    };
  };
  createdById: string;
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
  assignedToId?: string;
  assignedTo?: {
    id: string;
    name: string;
    email: string;
  };
  name: string;
  description: string;
  purpose: string;
  status: CreatedAgentStatus;
  connectionType: AgentConnectionType;
  estimatedHours?: number;
  actualHours?: number;
  complexity: string;
  version: string;
  developmentNotes?: string;
  testingNotes?: string;
  deploymentNotes?: string;
  startedAt?: Date;
  finishedAt?: Date;
  lastTestDate?: Date;
  deployedAt?: Date;
  successRate?: number;
  averageExecutionTime?: number;
  totalExecutions: number;
  errorCount: number;
  createdAt: Date;
  updatedAt: Date;
  configurationsCount: number;
  workflowsCount: number;
}

export interface AgentConfigurationResponse {
  id: string;
  createdAgentId: string;
  configName: string;
  configType: string;
  configData: any;
  connectionSettings?: any;
  authenticationData?: any; // Esta se debe filtrar en respuestas públicas
  schedulingConfig?: any;
  errorHandling?: any;
  notificationSettings?: any;
  selectedNodes?: string[];
  customNodes?: any[];
  isActive: boolean;
  version: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentWorkflowResponse {
  id: string;
  createdAgentId: string;
  workflowName: string;
  workflowType: string;
  description?: string;
  n8nWorkflow: any;
  workflowNodes: string[];
  nodeCount?: number;
  connectionCount?: number;
  complexity?: string;
  version: string;
  isCurrentVersion: boolean;
  parentWorkflowId?: string;
  changeLog?: string;
  developmentNotes?: string;
  isActive: boolean;
  isTested: boolean;
  isDeployed: boolean;
  lastTestDate?: Date;
  testResults?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatedAgentDetailResponse extends CreatedAgentResponse {
  configurations: AgentConfigurationResponse[];
  workflows: AgentWorkflowResponse[];
  currentWorkflow?: AgentWorkflowResponse;
}

export interface PaginatedAgentsResponse<T> {
  items: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  filters: AgentsFilters;
}

export interface AgentsStatsResponse {
  overview: {
    totalAgents: number;
    activeAgents: number;
    draftAgents: number;
    finishedAgents: number;
    averageHours: number;
    successRate: number;
  };
  agentsByStatus: Record<string, number>;
  agentsByConnectionType: Record<string, number>;
  agentsByComplexity: Record<string, number>;
  performanceMetrics: {
    averageExecutionTime: number;
    totalExecutions: number;
    totalErrors: number;
    errorRate: number;
  };
  timeSeriesData: Array<{
    period: string;
    created: number;
    finished: number;
    active: number;
  }>;
  topPerformingAgents: Array<{
    id: string;
    name: string;
    successRate: number;
    totalExecutions: number;
  }>;
  orderProgress: Array<{
    orderId: string;
    orderNumber: string;
    clientName: string;
    agentsCount: number;
    completedAgents: number;
    progressPercentage: number;
  }>;
}

export interface AgentsApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
}

// ===== ENUMS Y CONSTANTES =====

export enum AgentsErrorCodes {
  CREATED_AGENT_NOT_FOUND = 'CREATED_AGENT_NOT_FOUND',
  CONFIGURATION_NOT_FOUND = 'CONFIGURATION_NOT_FOUND',
  WORKFLOW_NOT_FOUND = 'WORKFLOW_NOT_FOUND',
  ORDER_NOT_FOUND = 'ORDER_NOT_FOUND',
  TEMPLATE_AGENT_NOT_FOUND = 'TEMPLATE_AGENT_NOT_FOUND',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  AGENT_NUMBER_ALREADY_EXISTS = 'AGENT_NUMBER_ALREADY_EXISTS',
  INVALID_STATUS_TRANSITION = 'INVALID_STATUS_TRANSITION',
  WORKFLOW_VERSION_CONFLICT = 'WORKFLOW_VERSION_CONFLICT',
  CONFIGURATION_TYPE_EXISTS = 'CONFIGURATION_TYPE_EXISTS',
  AGENT_HAS_ACTIVE_WORKFLOWS = 'AGENT_HAS_ACTIVE_WORKFLOWS',
  INVALID_N8N_WORKFLOW = 'INVALID_N8N_WORKFLOW'
}

export const DEFAULT_AGENTS_FILTERS: AgentsFilters = {
  page: 1,
  limit: 20,
  sortBy: 'createdAt',
  sortOrder: 'desc'
};

export const STATUS_LABELS = {
  [CreatedAgentStatus.DRAFT]: 'Borrador',
  [CreatedAgentStatus.IN_DEVELOPMENT]: 'En Desarrollo',
  [CreatedAgentStatus.TESTING]: 'Testing',
  [CreatedAgentStatus.ACTIVE]: 'Activo',
  [CreatedAgentStatus.INACTIVE]: 'Inactivo',
  [CreatedAgentStatus.ARCHIVED]: 'Archivado',
  [CreatedAgentStatus.ERROR]: 'Error'
} as const;

export const CONNECTION_TYPE_LABELS = {
  [AgentConnectionType.API]: 'Integración API',
  [AgentConnectionType.RPA]: 'Automatización RPA',
  [AgentConnectionType.WEBSCRAPING]: 'Extracción Web',
  [AgentConnectionType.FILE]: 'Procesamiento de Archivos',
  [AgentConnectionType.DATABASE]: 'Integración BD',
  [AgentConnectionType.IOT_SENSORS]: 'Conectividad IoT'
} as const;

export const COMPLEXITY_LABELS = {
  basic: 'Básico',
  medium: 'Intermedio',
  advanced: 'Avanzado'
} as const;

export const VALID_STATUS_TRANSITIONS = {
  [CreatedAgentStatus.DRAFT]: [CreatedAgentStatus.IN_DEVELOPMENT, CreatedAgentStatus.ARCHIVED],
  [CreatedAgentStatus.IN_DEVELOPMENT]: [CreatedAgentStatus.TESTING, CreatedAgentStatus.DRAFT, CreatedAgentStatus.ARCHIVED],
  [CreatedAgentStatus.TESTING]: [CreatedAgentStatus.ACTIVE, CreatedAgentStatus.IN_DEVELOPMENT, CreatedAgentStatus.ERROR],
  [CreatedAgentStatus.ACTIVE]: [CreatedAgentStatus.INACTIVE, CreatedAgentStatus.TESTING, CreatedAgentStatus.ERROR],
  [CreatedAgentStatus.INACTIVE]: [CreatedAgentStatus.ACTIVE, CreatedAgentStatus.ARCHIVED],
  [CreatedAgentStatus.ARCHIVED]: [], // No se puede cambiar desde archivado
  [CreatedAgentStatus.ERROR]: [CreatedAgentStatus.IN_DEVELOPMENT, CreatedAgentStatus.TESTING, CreatedAgentStatus.ARCHIVED]
} as const; 