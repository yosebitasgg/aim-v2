import { z } from 'zod';

// ===== SCHEMAS DE VALIDACIÓN =====

export const CreateAgentCategorySchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100, 'El nombre no puede exceder 100 caracteres'),
  slug: z.string().min(1, 'El slug es requerido').max(100, 'El slug no puede exceder 100 caracteres'),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'El color debe ser un hex válido').optional(),
  sortOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true)
});

export const UpdateAgentCategorySchema = CreateAgentCategorySchema.partial();

export const CreateConnectionTypeSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100, 'El nombre no puede exceder 100 caracteres'),
  slug: z.string().min(1, 'El slug es requerido').max(100, 'El slug no puede exceder 100 caracteres'),
  title: z.string().min(1, 'El título es requerido').max(150, 'El título no puede exceder 150 caracteres'),
  description: z.string().min(1, 'La descripción es requerida'),
  icon: z.string().min(1, 'El icono es requerido'),
  advantages: z.array(z.string()).min(1, 'Debe tener al menos una ventaja'),
  useCases: z.array(z.string()).min(1, 'Debe tener al menos un caso de uso'),
  examples: z.array(z.string()).min(1, 'Debe tener al menos un ejemplo'),
  sortOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true)
});

export const UpdateConnectionTypeSchema = CreateConnectionTypeSchema.partial();

export const CreateConnectionTemplateSchema = z.object({
  connectionTypeId: z.string().min(1, 'El ID del tipo de conexión es requerido'),
  name: z.string().min(1, 'El nombre es requerido').max(200, 'El nombre no puede exceder 200 caracteres'),
  slug: z.string().min(1, 'El slug es requerido').max(150, 'El slug no puede exceder 150 caracteres'),
  description: z.string().min(1, 'La descripción es requerida'),
  n8nWorkflow: z.object({}).passthrough(), // JSON del workflow n8n
  workflowNodes: z.array(z.string()).min(1, 'Debe tener al menos un nodo'),
  nodeDescription: z.string().min(1, 'La descripción de nodos es requerida'),
  recommendation: z.string().optional(),
  version: z.string().default('1.0.0'),
  isActive: z.boolean().default(true)
});

export const UpdateConnectionTemplateSchema = CreateConnectionTemplateSchema.partial();

export const CreateAgentSchema = z.object({
  categoryId: z.string().min(1, 'El ID de la categoría es requerido'),
  name: z.string().min(1, 'El nombre es requerido').max(200, 'El nombre no puede exceder 200 caracteres'),
  slug: z.string().min(1, 'El slug es requerido').max(150, 'El slug no puede exceder 150 caracteres'),
  title: z.string().min(1, 'El título es requerido').max(250, 'El título no puede exceder 250 caracteres'),
  shortDescription: z.string().min(1, 'La descripción corta es requerida'),
  challenge: z.string().min(1, 'El desafío es requerido'),
  solution: z.string().min(1, 'La solución es requerida'),
  features: z.array(z.string()).min(1, 'Debe tener al menos una característica'),
  icon: z.string().optional(),
  n8nWorkflow: z.object({}).passthrough(), // JSON del workflow n8n
  version: z.string().default('1.0.0'),
  complexity: z.enum(['basic', 'medium', 'advanced']).default('medium'),
  estimatedTime: z.string().optional(),
  requirements: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false)
});

export const UpdateAgentSchema = CreateAgentSchema.partial();

export const GalleryFiltersSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  complexity: z.enum(['basic', 'medium', 'advanced']).optional(),
  connectionType: z.string().optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['name', 'createdAt', 'updatedAt', 'usageCount']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

export const GalleryStatsSchema = z.object({
  period: z.enum(['7d', '30d', '90d', '1y']).default('30d'),
  groupBy: z.enum(['day', 'week', 'month']).default('day')
});

// ===== TIPOS DERIVADOS =====

export type CreateAgentCategoryInput = z.infer<typeof CreateAgentCategorySchema>;
export type UpdateAgentCategoryInput = z.infer<typeof UpdateAgentCategorySchema>;
export type CreateConnectionTypeInput = z.infer<typeof CreateConnectionTypeSchema>;
export type UpdateConnectionTypeInput = z.infer<typeof UpdateConnectionTypeSchema>;
export type CreateConnectionTemplateInput = z.infer<typeof CreateConnectionTemplateSchema>;
export type UpdateConnectionTemplateInput = z.infer<typeof UpdateConnectionTemplateSchema>;
export type CreateAgentInput = z.infer<typeof CreateAgentSchema>;
export type UpdateAgentInput = z.infer<typeof UpdateAgentSchema>;
export type GalleryFilters = z.infer<typeof GalleryFiltersSchema>;
export type GalleryStatsParams = z.infer<typeof GalleryStatsSchema>;

// ===== INTERFACES DE RESPUESTA =====

export interface AgentCategoryResponse {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  sortOrder: number;
  isActive: boolean;
  agentsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConnectionTypeResponse {
  id: string;
  name: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  advantages: string[];
  useCases: string[];
  examples: string[];
  sortOrder: number;
  isActive: boolean;
  templatesCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConnectionTemplateResponse {
  id: string;
  connectionTypeId: string;
  connectionType: {
    id: string;
    name: string;
    slug: string;
    title: string;
    icon: string;
  };
  name: string;
  slug: string;
  description: string;
  n8nWorkflow: any;
  workflowNodes: string[];
  nodeDescription: string;
  recommendation?: string;
  version: string;
  isActive: boolean;
  downloadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentResponse {
  id: string;
  categoryId: string;
  category: {
    id: string;
    name: string;
    slug: string;
    icon?: string;
    color?: string;
  };
  name: string;
  slug: string;
  title: string;
  shortDescription: string;
  challenge: string;
  solution: string;
  features: string[];
  icon?: string;
  n8nWorkflow: any;
  version: string;
  complexity: 'basic' | 'medium' | 'advanced';
  estimatedTime?: string;
  requirements?: string[];
  tags?: string[];
  isActive: boolean;
  isFeatured: boolean;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentDetailResponse extends AgentResponse {
  // Información adicional para la vista de detalle
  relatedAgents?: AgentResponse[];
  downloadUrl?: string;
}

export interface PaginatedGalleryResponse<T> {
  items: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  filters: GalleryFilters;
}

export interface GalleryStatsResponse {
  overview: {
    totalAgents: number;
    totalTemplates: number;
    totalCategories: number;
    totalConnectionTypes: number;
    activeAgents: number;
    featuredAgents: number;
  };
  agentsByCategory: Record<string, number>;
  agentsByComplexity: Record<string, number>;
  templatesByConnectionType: Record<string, number>;
  usageStats: {
    totalDownloads: number;
    totalUsage: number;
    averageUsagePerAgent: number;
  };
  timeSeriesData: Array<{
    period: string;
    agents: number;
    templates: number;
    downloads: number;
  }>;
  topAgents: Array<{
    id: string;
    name: string;
    title: string;
    category: string;
    usageCount: number;
  }>;
  topTemplates: Array<{
    id: string;
    name: string;
    connectionType: string;
    downloadCount: number;
  }>;
}

export interface GalleryOverviewResponse {
  stats: {
    totalAgents: number;
    totalTemplates: number;
    totalCategories: number;
    averageDeploymentTime: string;
  };
  connectionTypes: ConnectionTypeResponse[];
  featuredAgents: AgentResponse[];
  recentAgents: AgentResponse[];
  categories: AgentCategoryResponse[];
}

export interface GalleryApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
}

// ===== ENUMS Y CONSTANTES =====

export enum GalleryErrorCodes {
  CATEGORY_NOT_FOUND = 'CATEGORY_NOT_FOUND',
  CONNECTION_TYPE_NOT_FOUND = 'CONNECTION_TYPE_NOT_FOUND',
  TEMPLATE_NOT_FOUND = 'TEMPLATE_NOT_FOUND',
  AGENT_NOT_FOUND = 'AGENT_NOT_FOUND',
  SLUG_ALREADY_EXISTS = 'SLUG_ALREADY_EXISTS',
  INVALID_N8N_WORKFLOW = 'INVALID_N8N_WORKFLOW',
  DUPLICATE_TEMPLATE = 'DUPLICATE_TEMPLATE',
  CATEGORY_HAS_AGENTS = 'CATEGORY_HAS_AGENTS',
  CONNECTION_TYPE_HAS_TEMPLATES = 'CONNECTION_TYPE_HAS_TEMPLATES'
}

export const DEFAULT_GALLERY_FILTERS: GalleryFilters = {
  page: 1,
  limit: 20,
  sortBy: 'createdAt',
  sortOrder: 'desc'
};

export const COMPLEXITY_LABELS = {
  basic: 'Básico',
  medium: 'Intermedio',
  advanced: 'Avanzado'
} as const;

export const DEPLOYMENT_TIME_RANGES = {
  basic: '1-2 días',
  medium: '2-3 días',
  advanced: '3-5 días'
} as const; 