import { z } from 'zod';

// Enum para industrias
export const INDUSTRIES = {
  MANUFACTURA: 'manufactura',
  RETAIL: 'retail',
  SERVICIOS: 'servicios',
  TECNOLOGIA: 'tecnologia',
  SALUD: 'salud',
  EDUCACION: 'educacion',
  FINANZAS: 'finanzas',
  LOGISTICA: 'logistica',
  CONSTRUCCION: 'construccion',
  AGRICULTURA: 'agricultura',
  ENERGIA: 'energia',
  AUTOMOTRIZ: 'automotriz',
} as const;

// Enum para tamaños de empresa
export const COMPANY_SIZES = {
  MICRO: 'micro',
  PEQUENA: 'pequena',
  MEDIANA: 'mediana',
  GRANDE: 'grande',
  CORPORATIVO: 'corporativo',
} as const;

// Enum para estados de cliente
export const CLIENT_STATUS = {
  PROSPECTO: 'prospecto',
  ACTIVO: 'activo',
  INACTIVO: 'inactivo',
} as const;

// Enum para fuentes de referencia
export const REFERENCE_SOURCES = {
  WEB: 'web',
  REDES: 'redes',
  REFERIDO: 'referido',
  EVENTO: 'evento',
  PUBLICIDAD: 'publicidad',
  COLD_CALLING: 'cold-calling',
  PARTNERSHIP: 'partnership',
  OTRO: 'otro',
} as const;

// Enum para potencial de negocio
export const BUSINESS_POTENTIAL = {
  BAJO: 'bajo',
  MEDIO: 'medio',
  ALTO: 'alto',
  PREMIUM: 'premium',
} as const;

// Enum para tipos de dirección
export const ADDRESS_TYPES = {
  FISICA: 'fisica',
  FISCAL: 'fiscal',
  ENVIO: 'envio',
} as const;

// Schema para crear cliente
export const CreateClientSchema = z.object({
  companyName: z.string().min(2, 'El nombre de la empresa debe tener al menos 2 caracteres').max(255),
  rfc: z.string().regex(/^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/, 'RFC inválido').optional(),
  industry: z.nativeEnum(INDUSTRIES, { errorMap: () => ({ message: 'Industria inválida' }) }),
  companySize: z.nativeEnum(COMPANY_SIZES).optional(),
  website: z.string().url('URL inválida').optional().or(z.literal('')),
  status: z.nativeEnum(CLIENT_STATUS).default(CLIENT_STATUS.PROSPECTO),
  referenceSource: z.nativeEnum(REFERENCE_SOURCES).optional(),
  businessPotential: z.nativeEnum(BUSINESS_POTENTIAL).optional(),
  notes: z.string().optional(),
  clientSince: z.string().datetime().optional().or(z.date().optional()),
  
  // Contacto principal (requerido)
  contact: z.object({
    fullName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(255),
    position: z.string().optional(),
    email: z.string().email('Email inválido'),
    phone: z.string().min(10, 'Teléfono inválido').max(20),
    alternativePhone: z.string().max(20).optional(),
    department: z.string().optional(),
    isPrimary: z.boolean().default(true),
  }),
  
  // Dirección principal (requerida)
  address: z.object({
    type: z.nativeEnum(ADDRESS_TYPES).default(ADDRESS_TYPES.FISICA),
    street: z.string().min(5, 'La dirección debe tener al menos 5 caracteres').max(255),
    interiorNumber: z.string().max(20).optional(),
    neighborhood: z.string().min(2, 'La colonia es requerida').max(100),
    postalCode: z.string().regex(/^[0-9]{5}$/, 'Código postal inválido'),
    city: z.string().min(2, 'La ciudad es requerida').max(100),
    state: z.string().min(2, 'El estado es requerido').max(100),
    country: z.string().length(2, 'Código de país inválido').default('MX'),
    isPrimary: z.boolean().default(true),
  }),
});

// Schema para actualizar cliente
export const UpdateClientSchema = z.object({
  companyName: z.string().min(2).max(255).optional(),
  rfc: z.string().regex(/^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/, 'RFC inválido').optional(),
  industry: z.nativeEnum(INDUSTRIES).optional(),
  companySize: z.nativeEnum(COMPANY_SIZES).optional(),
  website: z.string().url('URL inválida').optional().or(z.literal('')),
  status: z.nativeEnum(CLIENT_STATUS).optional(),
  referenceSource: z.nativeEnum(REFERENCE_SOURCES).optional(),
  businessPotential: z.nativeEnum(BUSINESS_POTENTIAL).optional(),
  notes: z.string().optional(),
  clientSince: z.string().datetime().optional().or(z.date().optional()),
  isActive: z.boolean().optional(),
});

// Schema para filtros de clientes
export const ClientFiltersSchema = z.object({
  search: z.string().optional(),
  industry: z.nativeEnum(INDUSTRIES).optional(),
  status: z.nativeEnum(CLIENT_STATUS).optional(),
  companySize: z.nativeEnum(COMPANY_SIZES).optional(),
  businessPotential: z.nativeEnum(BUSINESS_POTENTIAL).optional(),
  referenceSource: z.nativeEnum(REFERENCE_SOURCES).optional(),
  createdBy: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.enum(['companyName', 'industry', 'status', 'clientSince', 'createdAt', 'totalValue']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Schema para crear contacto adicional
export const CreateContactSchema = z.object({
  clientId: z.string().min(1, 'ID del cliente requerido'),
  fullName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(255),
  position: z.string().optional(),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Teléfono inválido').max(20),
  alternativePhone: z.string().max(20).optional(),
  department: z.string().optional(),
  isPrimary: z.boolean().default(false),
});

// Schema para crear dirección adicional
export const CreateAddressSchema = z.object({
  clientId: z.string().min(1, 'ID del cliente requerido'),
  type: z.nativeEnum(ADDRESS_TYPES),
  street: z.string().min(5, 'La dirección debe tener al menos 5 caracteres').max(255),
  interiorNumber: z.string().max(20).optional(),
  neighborhood: z.string().min(2, 'La colonia es requerida').max(100),
  postalCode: z.string().regex(/^[0-9]{5}$/, 'Código postal inválido'),
  city: z.string().min(2, 'La ciudad es requerida').max(100),
  state: z.string().min(2, 'El estado es requerido').max(100),
  country: z.string().length(2, 'Código de país inválido').default('MX'),
  isPrimary: z.boolean().default(false),
});

// Schema para estadísticas de clientes
export const ClientStatsSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  groupBy: z.enum(['day', 'week', 'month', 'industry', 'status']).default('month'),
});

// Tipos TypeScript derivados
export type CreateClientInput = z.infer<typeof CreateClientSchema>;
export type UpdateClientInput = z.infer<typeof UpdateClientSchema>;
export type ClientFilters = z.infer<typeof ClientFiltersSchema>;
export type CreateContactInput = z.infer<typeof CreateContactSchema>;
export type CreateAddressInput = z.infer<typeof CreateAddressSchema>;
export type ClientStatsInput = z.infer<typeof ClientStatsSchema>;

// Interfaces para respuestas
export interface ClientResponse {
  id: string;
  companyName: string;
  rfc?: string;
  industry: string;
  companySize?: string;
  website?: string;
  status: string;
  referenceSource?: string;
  businessPotential?: string;
  notes?: string;
  totalValue?: number;
  clientSince?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  creator?: {
    id: string;
    name: string;
    email: string;
  };
  contacts: ContactResponse[];
  addresses: AddressResponse[];
  ordersCount?: number;
  primaryContact?: ContactResponse;
  primaryAddress?: AddressResponse;
}

export interface ContactResponse {
  id: string;
  clientId: string;
  fullName: string;
  position?: string;
  email: string;
  phone: string;
  alternativePhone?: string;
  department?: string;
  isPrimary: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AddressResponse {
  id: string;
  clientId: string;
  type: string;
  street: string;
  interiorNumber?: string;
  neighborhood: string;
  postalCode: string;
  city: string;
  state: string;
  country: string;
  isPrimary: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedClientsResponse {
  clients: ClientResponse[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  filters: ClientFilters;
}

export interface ClientStatsResponse {
  totalClients: number;
  activeClients: number;
  newThisMonth: number;
  averageValue: number;
  clientsByIndustry: Record<string, number>;
  clientsByStatus: Record<string, number>;
  clientsBySize: Record<string, number>;
  clientsOverTime: Array<{
    period: string;
    count: number;
    value: number;
  }>;
  topClients: Array<{
    id: string;
    companyName: string;
    totalValue: number;
    ordersCount: number;
  }>;
  growthMetrics: {
    clientGrowth: number;
    valueGrowth: number;
    monthlyNewClients: number;
    monthlyNewValue: number;
  };
}

// Interfaz para respuesta API estándar
export interface ClientApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
} 