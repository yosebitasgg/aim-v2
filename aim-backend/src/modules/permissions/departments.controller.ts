import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ApiResponseUtil } from '@/shared/utils/response';
import { logger } from '@/shared/utils/logger';
import { 
  DepartmentsService, 
  CreateDepartmentSchema, 
  UpdateDepartmentSchema,
  CreateDepartmentInput,
  UpdateDepartmentInput
} from './departments.service';

export class DepartmentsController {
  private departmentsService: DepartmentsService;

  constructor(prisma: PrismaClient) {
    this.departmentsService = new DepartmentsService(prisma);
  }

  /**
   * GET /api/permissions/departments
   * Obtener todos los departamentos (constantes + dinámicos)
   */
  getDepartments = async (req: Request, res: Response): Promise<void> => {
    try {
      const departments = await this.departmentsService.getAllDepartments();
      ApiResponseUtil.success(res, departments, 'Departamentos obtenidos exitosamente');
    } catch (error: any) {
      logger.error('Error en get departments controller', { error });
      ApiResponseUtil.error(res, error.message, 500);
    }
  };

  /**
   * POST /api/permissions/departments
   * Crear un nuevo departamento
   */
  createDepartment = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        ApiResponseUtil.unauthorized(res, 'Usuario no autenticado');
        return;
      }

      // Validar datos de entrada
      const validationResult = CreateDepartmentSchema.safeParse(req.body);
      if (!validationResult.success) {
        ApiResponseUtil.validationError(res, validationResult.error.issues);
        return;
      }

      const department = await this.departmentsService.createDepartment(
        validationResult.data,
        req.user.id
      );

      ApiResponseUtil.success(res, department, 'Departamento creado exitosamente', 201);
    } catch (error: any) {
      logger.error('Error en create department controller', { error, body: req.body });
      ApiResponseUtil.error(res, error.message, 400);
    }
  };

  /**
   * GET /api/permissions/departments/:id
   * Obtener un departamento específico por ID
   */
  getDepartmentById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const department = await this.departmentsService.getDepartmentById(id);
      ApiResponseUtil.success(res, department, 'Departamento obtenido exitosamente');
    } catch (error: any) {
      logger.error('Error en get department by id controller', { error, params: req.params });
      ApiResponseUtil.error(res, error.message, error.message === 'Departamento no encontrado' ? 404 : 500);
    }
  };

  /**
   * PUT /api/permissions/departments/:id
   * Actualizar un departamento existente
   */
  updateDepartment = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      // Validar datos de entrada
      const validationResult = UpdateDepartmentSchema.safeParse(req.body);
      if (!validationResult.success) {
        ApiResponseUtil.validationError(res, validationResult.error.issues);
        return;
      }

      const department = await this.departmentsService.updateDepartment(id, validationResult.data);
      ApiResponseUtil.success(res, department, 'Departamento actualizado exitosamente');
    } catch (error: any) {
      logger.error('Error en update department controller', { error, params: req.params, body: req.body });
      ApiResponseUtil.error(res, error.message, error.message === 'Departamento no encontrado' ? 404 : 400);
    }
  };

  /**
   * DELETE /api/permissions/departments/:id
   * Eliminar un departamento
   */
  deleteDepartment = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await this.departmentsService.deleteDepartment(id);
      ApiResponseUtil.success(res, null, 'Departamento eliminado exitosamente');
    } catch (error: any) {
      logger.error('Error en delete department controller', { error, params: req.params });
      ApiResponseUtil.error(res, error.message, error.message === 'Departamento no encontrado' ? 404 : 400);
    }
  };

  /**
   * GET /api/permissions/departments/stats
   * Obtener estadísticas de departamentos
   */
  getDepartmentStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.departmentsService.getDepartmentStats();
      ApiResponseUtil.success(res, stats, 'Estadísticas de departamentos obtenidas exitosamente');
    } catch (error: any) {
      logger.error('Error en get department stats controller', { error });
      ApiResponseUtil.error(res, error.message, 500);
    }
  };
} 