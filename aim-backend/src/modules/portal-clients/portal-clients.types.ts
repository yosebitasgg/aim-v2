import { z } from 'zod';

// ===== ENUMS =====
export const PORTAL_CLIENT_MODULES = {
  DASHBOARD: 'dashboard',
  ORDERS: 'orders',
  AGENTS: 'agents',
  DOCUMENTS: 'documents',
  BILLING: 'billing',
  PROFILE: 'profile'
} as const;

// ===== INTERFACES =====

// Dashboard Stats Interface
export interface ClientDashboardStats {
  // Basic stats
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
  totalAgents: number;
  activeAgents: number;
  totalDocuments: number;
  
  // Financial metrics
  totalInvestment: number;
  monthlyInvestment: number;
  investmentChange: number;
  totalBilled: number;
  pendingAmount: number;
  
  // ROI and value metrics
  roiPercentage: number;
  roiValue: number;
  monthlySavings: number;
  timeSaved: number;
  timeSavingsHours: number;
  costReduction: number;
  efficiencyImprovement: number;
  
  // Agent performance
  agentsEfficiency: number;
  agentMetrics: AgentMetrics;
  agentPerformance: AgentPerformanceData[];
  
  // Chart data
  ordersByStatus: OrderStatusCount[];
  ordersByMonth: MonthlyOrderCount[];
  financialData: FinancialData[];
  roiBreakdown: ROIBreakdown;
  ordersTrend: number[];
  
  // Activity and deadlines
  recentActivity: ActivityItem[];
  upcomingDeadlines: UpcomingDeadline[];
}

export interface AgentMetrics {
  totalExecutions: number;
  successRate: number;
  uptime: number;
  averageResponseTime: number;
  errorRate: number;
}

export interface AgentPerformanceData {
  name: string;
  efficiency: number;
  executions: number;
  uptime: number;
  lastActivity: Date;
}

export interface FinancialData {
  month: string;
  billed: number;
  paid: number;
  pending: number;
}

export interface ROIBreakdown {
  timeSavings: number;
  costReduction: number;
  qualityImprovement: number;
}

export interface ActivityItem {
  id: string;
  type: string;
  description: string;
  date: Date;
  module: string;
  relatedId?: string;
}

export interface OrderStatusCount {
  status: string;
  count: number;
  color: string;
}

export interface MonthlyOrderCount {
  month: string;
  count: number;
  value: number;
}

export interface UpcomingDeadline {
  id: string;
  title: string;
  type: string;
  dueDate: Date;
  status: string;
  priority: string;
}

// Client Orders Interface
export interface ClientOrderResponse {
  id: string;
  orderNumber: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  type: string;
  requestedDeliveryDate: Date | null;
  startDate: Date | null;
  completedDate: Date | null;
  estimatedBudget: number | null;
  finalAmount: number | null;
  progress: number;
  createdAt: Date;
  updatedAt: Date;
  assignedTo: {
    id: string;
    name: string;
    email: string;
  } | null;
  itemsCount: number;
  documentsCount: number;
  communicationsCount: number;
}

export interface ClientOrderDetailResponse {
  id: string;
  orderNumber: string;
  title: string;
  description: string;
  requirements: string | null;
  status: string;
  priority: string;
  type: string;
  requestedDeliveryDate: Date | null;
  startDate: Date | null;
  completedDate: Date | null;
  dueDate: Date | null;
  estimatedBudget: number | null;
  finalAmount: number | null;
  currency: string;
  progress: number;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  contactDepartment: string | null;
  projectScope: string | null;
  deliverables: any;
  milestones: any;
  lastActivity: Date | null;
  nextFollowUp: Date | null;
  createdAt: Date;
  updatedAt: Date;
  assignedTo: {
    id: string;
    name: string;
    email: string;
  } | null;
  agent: {
    id: string;
    name: string;
    title: string;
    complexity: string;
  } | null;
  orderItems: ClientOrderItem[];
  documents: ClientOrderDocument[];
  communications: ClientOrderCommunication[];
  statusHistory: ClientOrderStatusHistory[];
}

export interface ClientOrderItem {
  id: string;
  name: string;
  description: string | null;
  quantity: number;
  unitPrice: number | null;
  totalPrice: number | null;
  estimatedHours: number | null;
  complexity: string | null;
  agent: {
    id: string;
    name: string;
    title: string;
  } | null;
}

export interface ClientOrderDocument {
  id: string;
  documentNumber: string;
  title: string;
  description: string | null;
  status: string;
  version: string;
  createdAt: Date;
  documentType: {
    id: string;
    name: string;
    phase: string;
    icon: string;
    color: string;
  };
}

export interface ClientOrderCommunication {
  id: string;
  type: string;
  subject: string | null;
  content: string;
  direction: string;
  fromName: string | null;
  fromEmail: string | null;
  toName: string | null;
  toEmail: string | null;
  isImportant: boolean;
  requiresResponse: boolean;
  responseByDate: Date | null;
  createdAt: Date;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
}

export interface ClientOrderStatusHistory {
  id: string;
  previousStatus: string | null;
  newStatus: string;
  reason: string | null;
  notes: string | null;
  changedAt: Date;
  changedBy: {
    id: string;
    name: string;
    email: string;
  };
}

// Client Agents Interface
export interface ClientAgentResponse {
  id: string;
  agentNumber: string;
  name: string;
  description: string;
  purpose: string;
  status: string;
  connectionType: string;
  complexity: string;
  version: string;
  estimatedHours: number | null;
  actualHours: number | null;
  progress: number;
  successRate: number | null;
  totalExecutions: number;
  errorCount: number;
  startedAt: Date | null;
  finishedAt: Date | null;
  deployedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  order: {
    id: string;
    orderNumber: string;
    title: string;
    status: string;
  };
  templateAgent: {
    id: string;
    name: string;
    title: string;
    category: string;
  } | null;
  assignedTo: {
    id: string;
    name: string;
    email: string;
  } | null;
}

// Client Documents Interface
export interface ClientDocumentResponse {
  id: string;
  documentNumber: string;
  title: string;
  description: string | null;
  status: string;
  version: string;
  downloadCount: number;
  emailSentCount: number;
  finalizedAt: Date | null;
  sentAt: Date | null;
  approvedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  // 🔥 CAMPOS CRÍTICOS PARA VISTA PREVIA
  specificData: Record<string, any>;
  sharedData: Record<string, any>;
  roiCalculation: Record<string, any> | null;
  metadata: Record<string, any> | null;
  attachments: Array<{
    id: string;
    fileName: string;
    originalName: string;
    fileSize: number;
    mimeType: string;
    category: string;
    uploadedAt: Date;
  }>;
  order: {
    id: string;
    orderNumber: string;
    title: string;
    status: string;
  };
  documentType: {
    id: string;
    name: string;
    slug: string;
    phase: string;
    icon: string;
    color: string;
    estimatedTime: string;
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

// Client Profile Interface
export interface ClientProfileResponse {
  user: {
    id: string;
    name: string;
    email: string;
    department: string | null;
    phoneNumber: string | null;
    role: string;
    lastLoginAt: Date | null;
    createdAt: Date;
  };
  client: {
    id: string;
    companyName: string;
    rfc: string | null;
    industry: string;
    companySize: string | null;
    website: string | null;
    status: string;
    clientSince: Date | null;
    totalValue: number | null;
    contacts: ClientContact[];
    addresses: ClientAddress[];
  };
}

export interface ClientContact {
  id: string;
  fullName: string;
  position: string | null;
  email: string;
  phone: string;
  department: string | null;
  isPrimary: boolean;
}

export interface ClientAddress {
  id: string;
  type: string;
  street: string;
  interiorNumber: string | null;
  neighborhood: string;
  postalCode: string;
  city: string;
  state: string;
  country: string;
  isPrimary: boolean;
}

// ===== VALIDATION SCHEMAS =====

// Dashboard Stats Schema
export const ClientDashboardStatsSchema = z.object({
  dateRange: z.enum(['7d', '30d', '90d', '1y']).optional().default('30d'),
  includeActivity: z.boolean().optional().default(true),
  activityLimit: z.number().min(1).max(50).optional().default(10),
  includeROI: z.boolean().optional().default(false),
  includeFinancial: z.boolean().optional().default(false),
  includeAgentMetrics: z.boolean().optional().default(false)
});

// Orders Filters Schema
export const ClientOrderFiltersSchema = z.object({
  page: z.number().min(1).optional().default(1),
  limit: z.number().min(1).max(100).optional().default(10),
  search: z.string().optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  type: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  sortBy: z.enum(['title', 'status', 'priority', 'createdAt', 'requestedDeliveryDate']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
});

// Agents Filters Schema
export const ClientAgentFiltersSchema = z.object({
  page: z.number().min(1).optional().default(1),
  limit: z.number().min(1).max(100).optional().default(10),
  search: z.string().optional(),
  status: z.string().optional(),
  connectionType: z.string().optional(),
  complexity: z.string().optional(),
  sortBy: z.enum(['name', 'status', 'createdAt', 'deployedAt']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
});

// Documents Filters Schema
export const ClientDocumentFiltersSchema = z.object({
  page: z.number().min(1).optional().default(1),
  limit: z.number().min(1).max(100).optional().default(10),
  search: z.string().optional(),
  status: z.string().optional(),
  documentType: z.string().optional(),
  phase: z.string().optional(),
  orderId: z.string().optional(),
  sortBy: z.enum(['title', 'status', 'createdAt', 'finalizedAt']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
});

// Update Profile Schema
export const UpdateClientProfileSchema = z.object({
  userData: z.object({
    name: z.string().min(2).optional(),
    department: z.string().optional(),
    phoneNumber: z.string().optional()
  }).optional(),
  clientData: z.object({
    website: z.string().url().optional().or(z.literal('')),
    notes: z.string().optional()
  }).optional()
});

// ===== TYPE EXPORTS =====

export type ClientDashboardStatsInput = z.infer<typeof ClientDashboardStatsSchema>;
export type ClientOrderFiltersInput = z.infer<typeof ClientOrderFiltersSchema>;
export type ClientAgentFiltersInput = z.infer<typeof ClientAgentFiltersSchema>;
export type ClientDocumentFiltersInput = z.infer<typeof ClientDocumentFiltersSchema>;
export type UpdateClientProfileInput = z.infer<typeof UpdateClientProfileSchema>;

// Paginated Responses
export interface PaginatedClientOrdersResponse {
  orders: ClientOrderResponse[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface PaginatedClientAgentsResponse {
  agents: ClientAgentResponse[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface PaginatedClientDocumentsResponse {
  documents: ClientDocumentResponse[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Error Codes
export const PortalClientErrorCodes = {
  CLIENT_NOT_FOUND: 'CLIENT_NOT_FOUND',
  USER_NOT_ASSOCIATED: 'USER_NOT_ASSOCIATED',
  ACCESS_DENIED: 'ACCESS_DENIED',
  ORDER_NOT_FOUND: 'ORDER_NOT_FOUND',
  AGENT_NOT_FOUND: 'AGENT_NOT_FOUND',
  DOCUMENT_NOT_FOUND: 'DOCUMENT_NOT_FOUND',
  INVALID_FILTERS: 'INVALID_FILTERS',
  PERMISSION_DENIED: 'PERMISSION_DENIED'
} as const;

export type PortalClientErrorCode = typeof PortalClientErrorCodes[keyof typeof PortalClientErrorCodes]; 