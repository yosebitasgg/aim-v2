import { z } from 'zod';

// ===== TIPOS SIMPLES PARA EVITAR CONFLICTOS =====
export type OrderStatus = 'DRAFT' | 'PENDING' | 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETED' | 'CANCELLED' | 'ON_HOLD';
export type OrderPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type OrderType = 'AUTOMATION' | 'INTEGRATION' | 'CONSULTATION' | 'MAINTENANCE' | 'CUSTOM';

// Constantes para facilitar el uso
export const OrderStatus = {
  DRAFT: 'DRAFT' as const,
  PENDING: 'PENDING' as const,
  IN_PROGRESS: 'IN_PROGRESS' as const,
  IN_REVIEW: 'IN_REVIEW' as const,
  COMPLETED: 'COMPLETED' as const,
  CANCELLED: 'CANCELLED' as const,
  ON_HOLD: 'ON_HOLD' as const
};

export const OrderPriority = {
  LOW: 'LOW' as const,
  MEDIUM: 'MEDIUM' as const,
  HIGH: 'HIGH' as const,
  CRITICAL: 'CRITICAL' as const
};

export const OrderType = {
  AUTOMATION: 'AUTOMATION' as const,
  INTEGRATION: 'INTEGRATION' as const,
  CONSULTATION: 'CONSULTATION' as const,
  MAINTENANCE: 'MAINTENANCE' as const,
  CUSTOM: 'CUSTOM' as const
};

// ===== SCHEMAS DE VALIDACIÓN =====

// Schema para crear una nueva orden
export const CreateOrderSchema = z.object({
  // Cliente (puede ser existente o nuevo)
  clientId: z.string().optional(),
  
  // Información del cliente (para clientes nuevos o datos específicos)
  clientData: z.object({
    companyName: z.string().optional(),
    contactName: z.string().optional(),
    contactEmail: z.string().email('Email inválido').optional(),
    contactPhone: z.string().optional(),
    rfc: z.string().optional(),
    website: z.string().url().optional().or(z.literal('')),
    industry: z.string().optional(),
    companySize: z.string().optional(),
    
    // Dirección
    address: z.object({
      street: z.string().optional(),
      interiorNumber: z.string().optional(),
      neighborhood: z.string().optional(),
      postalCode: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      country: z.string().default('MX'),
      references: z.string().optional()
    }).optional()
  }).optional(),
  
  // Detalles de la orden
  agentId: z.string().min(1, 'Agente es requerido'),
  title: z.string().min(1, 'Título es requerido'),
  description: z.string().min(1, 'Descripción es requerida'),
  requirements: z.string().optional(),
  
  // Prioridad y fechas
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  requestedDeliveryDate: z.string().datetime().optional(),
  estimatedBudget: z.number().positive().optional(),
  
  // Información adicional
  isExistingClient: z.boolean().default(false),
  referenceSource: z.string().optional(),
  departmentRequesting: z.string().optional(),
  internalNotes: z.string().optional(),
  
  // Archivos adjuntos
  attachments: z.array(z.object({
    filename: z.string(),
    url: z.string(),
    size: z.number(),
    type: z.string()
  })).optional()
});

// Schema para actualizar una orden
export const UpdateOrderSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  requirements: z.string().optional(),
  status: z.enum(['DRAFT', 'PENDING', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED', 'CANCELLED', 'ON_HOLD']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  agentId: z.string().optional(),
  assignedToId: z.string().optional(),
  requestedDeliveryDate: z.string().datetime().optional(),
  startDate: z.string().datetime().optional(),
  dueDate: z.string().datetime().optional(),
  estimatedBudget: z.number().positive().optional(),
  finalAmount: z.number().positive().optional(),
  progress: z.number().min(0).max(100).optional(),
  internalNotes: z.string().optional(),
  
  // Información de contacto
  contactName: z.string().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  contactDepartment: z.string().optional(),
  
  // Información del proyecto
  projectScope: z.string().optional(),
  deliverables: z.array(z.string()).optional(),
  milestones: z.array(z.object({
    name: z.string(),
    dueDate: z.string().datetime(),
    completed: z.boolean().default(false)
  })).optional()
});

// Schema para filtros de búsqueda
export const OrderFiltersSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.enum(['createdAt', 'updatedAt', 'priority', 'status', 'requestedDeliveryDate']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  
  // Filtros específicos
  status: z.union([
    z.enum(['DRAFT', 'PENDING', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED', 'CANCELLED', 'ON_HOLD']),
    z.string().transform((val) => val.split(',').map(s => s.trim())),
    z.array(z.enum(['DRAFT', 'PENDING', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED', 'CANCELLED', 'ON_HOLD']))
  ]).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  clientId: z.string().optional(),
  agentId: z.string().optional(),
  assignedToId: z.string().optional(),
  createdById: z.string().optional(),
  
  // Filtros de fecha
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  
  // Búsqueda por texto
  search: z.string().optional(),
  
  // Filtros adicionales
  isOverdue: z.boolean().optional(),
  hasAttachments: z.boolean().optional()
});

// Schema para estadísticas
export const OrderStatsSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  groupBy: z.enum(['day', 'week', 'month', 'quarter']).default('month'),
  clientId: z.string().optional(),
  agentId: z.string().optional()
});

// Schema para cambio de estado
export const ChangeOrderStatusSchema = z.object({
  status: z.enum(['DRAFT', 'PENDING', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED', 'CANCELLED', 'ON_HOLD']),
  reason: z.string().optional(),
  notes: z.string().optional()
});

// Schema para comunicaciones
export const CreateOrderCommunicationSchema = z.object({
  type: z.enum(['email', 'call', 'meeting', 'note', 'comment']),
  subject: z.string().optional(),
  content: z.string().min(1, 'Contenido es requerido'),
  direction: z.enum(['inbound', 'outbound', 'internal']).default('internal'),
  isImportant: z.boolean().default(false),
  requiresResponse: z.boolean().default(false),
  responseByDate: z.string().datetime().optional(),
  attachments: z.array(z.object({
    filename: z.string(),
    url: z.string(),
    size: z.number(),
    type: z.string()
  })).optional()
});

// ===== TIPOS TYPESCRIPT =====
export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
export type UpdateOrderInput = z.infer<typeof UpdateOrderSchema>;
export type OrderFilters = z.infer<typeof OrderFiltersSchema>;
export type OrderStatsInput = z.infer<typeof OrderStatsSchema>;
export type ChangeOrderStatusInput = z.infer<typeof ChangeOrderStatusSchema>;
export type CreateOrderCommunicationInput = z.infer<typeof CreateOrderCommunicationSchema>;

// ===== INTERFACES DE RESPUESTA =====
export interface OrderResponse {
  id: string;
  orderNumber: string;
  title: string;
  description: string;
  requirements?: string;
  status: OrderStatus;
  priority: OrderPriority;
  type: OrderType;
  progress: number;
  
  // Fechas
  requestedDeliveryDate?: Date;
  startDate?: Date;
  completedDate?: Date;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Información financiera
  estimatedBudget?: number;
  finalAmount?: number;
  currency: string;
  
  // Relaciones
  client: {
    id: string;
    companyName: string;
    contactName?: string;
    contactEmail?: string;
    contactPhone?: string;
    industry?: string;
  };
  
  agent?: {
    id: string;
    name: string;
    title: string;
    category: string;
  };
  
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  
  assignedTo?: {
    id: string;
    name: string;
    email: string;
  };
  
  // Información del proyecto
  projectAddress?: {
    street?: string;
    city?: string;
    state?: string;
    country: string;
  };
  
  // Metadatos
  isExistingClient: boolean;
  referenceSource?: string;
  lastActivity?: Date;
  nextFollowUp?: Date;
  
  // Contadores
  itemsCount: number;
  communicationsCount: number;
  attachments: any[];
}

export interface OrderDetailResponse extends OrderResponse {
  internalNotes?: string;
  projectScope?: string;
  deliverables?: any[];
  milestones?: any[];
  
  // Items de la orden
  items: OrderItemResponse[];
  
  // Historial de estados
  statusHistory: OrderStatusHistoryResponse[];
  
  // Comunicaciones recientes
  recentCommunications: OrderCommunicationResponse[];
}

export interface OrderItemResponse {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice?: number;
  totalPrice?: number;
  estimatedHours?: number;
  complexity?: string;
  
  agent?: {
    id: string;
    name: string;
    title: string;
  };
}

export interface OrderStatusHistoryResponse {
  id: string;
  previousStatus?: OrderStatus;
  newStatus: OrderStatus;
  reason?: string;
  notes?: string;
  changedAt: Date;
  changedBy: {
    id: string;
    name: string;
  };
}

export interface OrderCommunicationResponse {
  id: string;
  type: string;
  subject?: string;
  content: string;
  direction: string;
  isImportant: boolean;
  requiresResponse: boolean;
  responseByDate?: Date;
  createdAt: Date;
  createdBy: {
    id: string;
    name: string;
  };
  attachments?: any[];
}

export interface PaginatedOrdersResponse {
  orders: OrderResponse[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  filters: OrderFilters;
}

export interface OrderStatsResponse {
  overview: {
    totalOrders: number;
    activeOrders: number;
    completedOrders: number;
    overdueOrders: number;
    totalValue: number;
    averageValue: number;
    averageCompletionTime: number; // en días
  };
  
  statusDistribution: Record<OrderStatus, number>;
  priorityDistribution: Record<OrderPriority, number>;
  
  ordersByAgent: Array<{
    agentId: string;
    agentName: string;
    count: number;
    totalValue: number;
  }>;
  
  ordersByClient: Array<{
    clientId: string;
    clientName: string;
    count: number;
    totalValue: number;
  }>;
  
  timeSeriesData: Array<{
    period: string;
    count: number;
    value: number;
    completed: number;
  }>;
  
  recentActivity: Array<{
    orderId: string;
    orderNumber: string;
    action: string;
    timestamp: Date;
    user: string;
  }>;
}

export interface OrderApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
}

// ===== ERRORES ESPECÍFICOS =====
export enum OrderErrorCodes {
  ORDER_NOT_FOUND = 'ORDER_NOT_FOUND',
  CLIENT_NOT_FOUND = 'CLIENT_NOT_FOUND',
  AGENT_NOT_FOUND = 'AGENT_NOT_FOUND',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  INVALID_STATUS_TRANSITION = 'INVALID_STATUS_TRANSITION',
  ORDER_ALREADY_COMPLETED = 'ORDER_ALREADY_COMPLETED',
  ORDER_ALREADY_CANCELLED = 'ORDER_ALREADY_CANCELLED',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  DUPLICATE_ORDER_NUMBER = 'DUPLICATE_ORDER_NUMBER',
  INVALID_DATE_RANGE = 'INVALID_DATE_RANGE'
} 