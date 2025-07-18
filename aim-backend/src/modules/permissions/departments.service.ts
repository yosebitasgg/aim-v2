import { PrismaClient } from '@prisma/client';
import { logger } from '@/shared/utils/logger';
import { DEPARTMENTS } from '@/shared/constants';
import { z } from 'zod';

// Tipo temporal para Department
interface Department {
  id: string;
  name: string;
  code: string;
  description: string | null;
  color: string | null;
  isActive: boolean;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
}

// Esquemas de validación
export const CreateDepartmentSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100, 'El nombre no puede exceder 100 caracteres'),
  code: z.string().min(2, 'El código debe tener al menos 2 caracteres').max(50, 'El código no puede exceder 50 caracteres').regex(/^[a-z0-9_-]+$/, 'El código solo puede contener letras minúsculas, números, guiones y guiones bajos'),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'El color debe ser un código hexadecimal válido (#RRGGBB)').optional(),
  isActive: z.boolean().default(true),
});

export const UpdateDepartmentSchema = CreateDepartmentSchema.partial().omit({ code: true });

export type CreateDepartmentInput = z.infer<typeof CreateDepartmentSchema>;
export type UpdateDepartmentInput = z.infer<typeof UpdateDepartmentSchema>;

export interface DepartmentResponse {
  id: string;
  name: string;
  code: string;
  description?: string;
  color?: string;
  isActive: boolean;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  creator?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface DepartmentListItem {
  key: string;
  value: string;
  label: string;
  description?: string;
  color?: string;
  isActive: boolean;
  isDefault: boolean;
}

export class DepartmentsService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Obtener todos los departamentos (constantes + dinámicos)
   */
  async getAllDepartments(): Promise<DepartmentListItem[]> {
    try {
      // Obtener los VALUES (códigos) de departamentos por defecto en minúsculas
      const defaultCodes = Object.values(DEPARTMENTS); // ['direccion', 'ventas', etc.]

      // Obtener departamentos dinámicos de la base de datos (excluyendo los por defecto)
      const dbDepartments = await this.prisma.department.findMany({
        where: { 
          isActive: true,
          code: {
            notIn: defaultCodes
          }
        },
        orderBy: { name: 'asc' },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Convertir departamentos de constantes a formato estándar
      const defaultDepartments: DepartmentListItem[] = Object.entries(DEPARTMENTS).map(([key, value]) => ({
        key,
        value,
        label: this.formatDepartmentName(key),
        isActive: true,
        isDefault: true,
      }));

      // Convertir departamentos dinámicos a formato estándar
      const dynamicDepartments: DepartmentListItem[] = dbDepartments.map((dept: any) => ({
        key: dept.code,
        value: dept.code,
        label: dept.name,
        description: dept.description || undefined,
        color: dept.color || undefined,
        isActive: dept.isActive,
        isDefault: false, // Los de la base de datos siempre son dinámicos
      }));

      // Combinar ambos tipos de departamentos
      const allDepartments = [...defaultDepartments, ...dynamicDepartments];

      logger.info('Departamentos obtenidos exitosamente', {
        total: allDepartments.length,
        defaults: defaultDepartments.length,
        dynamic: dynamicDepartments.length,
      });

      return allDepartments;
    } catch (error) {
      logger.error('Error obteniendo departamentos', { error });
      throw new Error('Error al obtener los departamentos');
    }
  }

  /**
   * Crear un nuevo departamento
   */
  async createDepartment(data: CreateDepartmentInput, createdBy: string): Promise<DepartmentResponse> {
    try {
      logger.info('Iniciando creación de departamento', { data, createdBy });

      // Paso 1: Validar datos con Zod
      logger.info('Validando datos con Zod...');
      let validatedData;
      try {
        validatedData = CreateDepartmentSchema.parse(data);
        logger.info('Validación Zod exitosa', { validatedData });
      } catch (zodError: any) {
        logger.error('Error en validación Zod', { zodError, data });
        const errorMessage = zodError.errors?.map((e: any) => e.message).join(', ') || zodError.message || 'Error de validación';
        throw new Error(`Error de validación: ${errorMessage}`);
      }

      // Paso 2: Verificar que el código no exista en constantes
      logger.info('Verificando conflictos con departamentos por defecto...');
      try {
        const existingConstant = Object.values(DEPARTMENTS).includes(validatedData.code as any);
        if (existingConstant) {
          logger.warn('Código ya existe en departamentos por defecto', { 
            code: validatedData.code, 
            constants: Object.values(DEPARTMENTS) 
          });
          throw new Error('El código del departamento ya existe en los departamentos por defecto');
        }
        logger.info('No hay conflictos con departamentos por defecto');
      } catch (constError: any) {
        logger.error('Error verificando departamentos por defecto', { constError });
        throw constError;
      }

      // Paso 3: Verificar que el código no exista en la base de datos
      logger.info('Verificando duplicados en base de datos...');
      let existingDepartment;
      try {
        existingDepartment = await this.prisma.department.findFirst({
          where: {
            OR: [
              { code: validatedData.code },
              { name: validatedData.name },
            ],
          },
        });
        logger.info('Consulta de duplicados completada', { 
          found: !!existingDepartment,
          existing: existingDepartment ? { id: existingDepartment.id, name: existingDepartment.name, code: existingDepartment.code } : null
        });
      } catch (dbError: any) {
        logger.error('Error consultando duplicados en base de datos', { dbError });
        throw new Error(`Error de base de datos: ${dbError.message || 'Error desconocido'}`);
      }

      if (existingDepartment) {
        if (existingDepartment.code === validatedData.code) {
          logger.warn('Código ya existe en base de datos', { existingCode: existingDepartment.code });
          throw new Error('Ya existe un departamento con este código');
        }
        if (existingDepartment.name === validatedData.name) {
          logger.warn('Nombre ya existe en base de datos', { existingName: existingDepartment.name });
          throw new Error('Ya existe un departamento con este nombre');
        }
      }

      // Paso 4: Crear el departamento
      logger.info('Creando departamento en base de datos...', { validatedData, createdBy });
      let department;
      try {
        department = await this.prisma.department.create({
          data: {
            ...validatedData,
            createdBy,
          },
          include: {
            creator: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        });
        logger.info('Departamento creado exitosamente en BD', {
          departmentId: department.id,
          name: department.name,
          code: department.code,
        });
      } catch (createError: any) {
        logger.error('Error creando departamento en base de datos', { 
          createError, 
          errorCode: createError.code,
          errorMessage: createError.message,
          validatedData, 
          createdBy 
        });
        
        // Manejar errores específicos de Prisma
        if (createError.code === 'P2002') {
          throw new Error('El departamento ya existe (constraint de unicidad violado)');
        } else if (createError.code === 'P2003') {
          throw new Error('Error de referencia: el usuario creador no existe');
        } else {
          throw new Error(`Error de base de datos: ${createError.message || 'Error desconocido'}`);
        }
      }

      // Paso 5: Mapear respuesta
      logger.info('Mapeando respuesta...');
      try {
        const mappedResponse = this.mapDepartmentToResponse(department);
        logger.info('Departamento creado exitosamente - proceso completo', {
          departmentId: department.id,
          name: department.name,
          code: department.code,
          createdBy,
        });
        return mappedResponse;
      } catch (mapError: any) {
        logger.error('Error mapeando respuesta', { mapError, department });
        throw new Error(`Error procesando respuesta: ${mapError.message || 'Error desconocido'}`);
      }

    } catch (error: any) {
      logger.error('Error general creando departamento', { 
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name,
          ...error
        }, 
        data, 
        createdBy 
      });
      throw error;
    }
  }

  /**
   * Obtener un departamento por ID
   */
  async getDepartmentById(id: string): Promise<DepartmentResponse> {
    try {
      const department = await this.prisma.department.findUnique({
        where: { id },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!department) {
        throw new Error('Departamento no encontrado');
      }

      return this.mapDepartmentToResponse(department);
    } catch (error) {
      logger.error('Error obteniendo departamento por ID', { error, id });
      throw error;
    }
  }

  /**
   * Actualizar un departamento
   */
  async updateDepartment(id: string, data: UpdateDepartmentInput): Promise<DepartmentResponse> {
    try {
      // Validar datos
      const validatedData = UpdateDepartmentSchema.parse(data);

      // Verificar que el departamento existe
      const existingDepartment = await this.prisma.department.findUnique({
        where: { id },
      });

      if (!existingDepartment) {
        throw new Error('Departamento no encontrado');
      }

      // Verificar que el nombre no esté duplicado (si se está actualizando)
      if (validatedData.name && validatedData.name !== existingDepartment.name) {
        const duplicateName = await this.prisma.department.findFirst({
          where: {
            name: validatedData.name,
            id: { not: id },
          },
        });

        if (duplicateName) {
          throw new Error('Ya existe un departamento con este nombre');
        }
      }

      // Actualizar el departamento
      const updatedDepartment = await this.prisma.department.update({
        where: { id },
        data: validatedData,
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      logger.info('Departamento actualizado exitosamente', {
        departmentId: id,
        changes: validatedData,
      });

      return this.mapDepartmentToResponse(updatedDepartment);
    } catch (error) {
      logger.error('Error actualizando departamento', { error, id, data });
      throw error;
    }
  }

  /**
   * Eliminar un departamento
   */
  async deleteDepartment(id: string): Promise<void> {
    try {
      // Verificar que el departamento existe
      const existingDepartment = await this.prisma.department.findUnique({
        where: { id },
      });

      if (!existingDepartment) {
        throw new Error('Departamento no encontrado');
      }

      // Verificar que no hay usuarios asignados a este departamento
      const usersWithDepartment = await this.prisma.user.count({
        where: { department: existingDepartment.code },
      });

      if (usersWithDepartment > 0) {
        throw new Error(`No se puede eliminar el departamento porque tiene ${usersWithDepartment} usuario(s) asignado(s)`);
      }

      // Eliminar el departamento
      await this.prisma.department.delete({
        where: { id },
      });

      logger.info('Departamento eliminado exitosamente', {
        departmentId: id,
        name: existingDepartment.name,
      });
    } catch (error) {
      logger.error('Error eliminando departamento', { error, id });
      throw error;
    }
  }

  /**
   * Obtener estadísticas de departamentos
   */
  async getDepartmentStats(): Promise<{
    total: number;
    defaults: number;
    dynamic: number;
    active: number;
    usersPerDepartment: { code: string; name: string; userCount: number }[];
  }> {
    try {
      // Obtener departamentos dinámicos de la base de datos
      const dbDepartments = await this.prisma.department.findMany({
        orderBy: { name: 'asc' },
      });

      const defaultDepartmentsCount = Object.keys(DEPARTMENTS).length;
      const dynamicDepartmentsCount = dbDepartments.length;
      const activeDepartmentsCount = dbDepartments.filter(d => d.isActive).length;

      // Obtener conteos de usuarios por departamento
      const allDepartmentCodes = [
        ...Object.values(DEPARTMENTS),
        ...dbDepartments.map(d => d.code),
      ];

      const usersPerDepartment = await Promise.all(
        allDepartmentCodes.map(async (code) => {
          const userCount = await this.prisma.user.count({
            where: { department: code },
          });

          // Obtener nombre del departamento
          const departmentInfo = dbDepartments.find(d => d.code === code);
          const name = departmentInfo?.name || 
            Object.keys(DEPARTMENTS).find(key => DEPARTMENTS[key as keyof typeof DEPARTMENTS] === code) || code;

          return {
            code,
            name: this.formatDepartmentName(name),
            userCount,
          };
        })
      );

      return {
        total: defaultDepartmentsCount + dynamicDepartmentsCount,
        defaults: defaultDepartmentsCount,
        dynamic: dynamicDepartmentsCount,
        active: defaultDepartmentsCount + activeDepartmentsCount, // Los por defecto siempre están activos
        usersPerDepartment: usersPerDepartment.filter(d => d.userCount > 0),
      };
    } catch (error) {
      logger.error('Error obteniendo estadísticas de departamentos', { error });
      throw new Error('Error al obtener las estadísticas de departamentos');
    }
  }

  /**
   * Mapear departamento de BD a respuesta
   */
  private mapDepartmentToResponse(department: Department & { creator?: any }): DepartmentResponse {
    return {
      id: department.id,
      name: department.name,
      code: department.code,
      description: department.description || undefined,
      color: department.color || undefined,
      isActive: department.isActive,
      isDefault: department.isDefault,
      createdAt: department.createdAt,
      updatedAt: department.updatedAt,
      createdBy: department.createdBy || undefined,
      creator: department.creator || undefined,
    };
  }

  /**
   * Formatear nombre de departamento
   */
  private formatDepartmentName(key: string): string {
    const nameMap: { [key: string]: string } = {
      'DIRECCION': 'Dirección General',
      'VENTAS': 'Ventas',
      'OPERACIONES': 'Operaciones',
      'SOPORTE': 'Soporte',
      'FINANZAS': 'Finanzas',
      'RRHH': 'Recursos Humanos',
      'MARKETING': 'Marketing',
    };

    return nameMap[key] || key.charAt(0).toUpperCase() + key.slice(1).toLowerCase();
  }
} 