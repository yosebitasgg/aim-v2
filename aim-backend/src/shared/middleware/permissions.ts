import { Request, Response, NextFunction } from 'express';
import { logger } from '@/shared/utils/logger';
import { ApiResponseUtil } from '@/shared/utils/response';
import { PermissionsService } from '@/modules/permissions/permissions.service';

export interface PermissionRequirement {
  module: string;
  action: 'read' | 'create' | 'update' | 'delete' | 'export';
  resourceId?: string;
}

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export class PermissionsMiddleware {
  /**
   * Verificar si el usuario tiene un permiso específico
   */
  static requirePermission(
    module: string,
    action: 'read' | 'create' | 'update' | 'delete' | 'export',
    resourceId?: string
  ) {
    return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.user) {
          logger.warn('Intento de verificar permisos sin usuario autenticado');
          ApiResponseUtil.unauthorized(res, 'Usuario no autenticado');
          return;
        }

        logger.info('Verificando permisos granulares', {
          userId: req.user.id,
          module,
          action,
          resourceId,
          path: req.path,
        });

        // Verificar el permiso específico
        const permissionCheck = await PermissionsService.checkUserPermission(
          req.user.id,
          { module, action, resourceId }
        );

        if (!permissionCheck.hasPermission) {
          logger.warn('Acceso denegado por permisos insuficientes', {
            userId: req.user.id,
            module,
            action,
            resourceId,
            reason: permissionCheck.reason,
          });

          ApiResponseUtil.forbidden(res, `Acceso denegado: no tienes permisos para ${action} en ${module}`);
          return;
        }

        logger.info('Permisos verificados exitosamente', {
          userId: req.user.id,
          module,
          action,
          resourceId,
        });

        next();
      } catch (error: any) {
        logger.error('Error verificando permisos', {
          error: error.message,
          userId: req.user?.id,
          module,
          action,
          resourceId,
        });

        ApiResponseUtil.error(res, 'Error interno verificando permisos', 500);
      }
    };
  }

  /**
   * Verificar múltiples permisos (usuario debe tener AL MENOS UNO)
   */
  static requireAnyPermission(requirements: PermissionRequirement[]) {
    return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.user) {
          ApiResponseUtil.unauthorized(res, 'Usuario no autenticado');
          return;
        }

        logger.info('Verificando múltiples permisos (ANY)', {
          userId: req.user.id,
          requirements,
          path: req.path,
        });

        // Verificar cada permiso
        const checks = await Promise.all(
          requirements.map(requirement => 
            PermissionsService.checkUserPermission(req.user!.id, requirement)
          )
        );

        // Si al menos uno es verdadero, permitir acceso
        const hasAnyPermission = checks.some(check => check.hasPermission);

        if (!hasAnyPermission) {
          logger.warn('Acceso denegado - no cumple ningún requisito de permisos', {
            userId: req.user.id,
            requirements,
            results: checks,
          });

          ApiResponseUtil.forbidden(res, 'Acceso denegado: permisos insuficientes');
          return;
        }

        logger.info('Permisos múltiples verificados exitosamente', {
          userId: req.user.id,
          approvedChecks: checks.filter(c => c.hasPermission),
        });

        next();
      } catch (error: any) {
        logger.error('Error verificando múltiples permisos', {
          error: error.message,
          userId: req.user?.id,
          requirements,
        });

        ApiResponseUtil.error(res, 'Error interno verificando permisos', 500);
      }
    };
  }

  /**
   * Verificar múltiples permisos (usuario debe tener TODOS)
   */
  static requireAllPermissions(requirements: PermissionRequirement[]) {
    return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.user) {
          ApiResponseUtil.unauthorized(res, 'Usuario no autenticado');
          return;
        }

        logger.info('Verificando múltiples permisos (ALL)', {
          userId: req.user.id,
          requirements,
          path: req.path,
        });

        // Verificar cada permiso
        const checks = await Promise.all(
          requirements.map(requirement => 
            PermissionsService.checkUserPermission(req.user!.id, requirement)
          )
        );

        // Todos deben ser verdaderos
        const hasAllPermissions = checks.every(check => check.hasPermission);

        if (!hasAllPermissions) {
          const failedChecks = checks.filter(check => !check.hasPermission);
          
          logger.warn('Acceso denegado - no cumple todos los requisitos de permisos', {
            userId: req.user.id,
            requirements,
            failedChecks,
          });

          ApiResponseUtil.forbidden(res, 'Acceso denegado: permisos insuficientes');
          return;
        }

        logger.info('Todos los permisos verificados exitosamente', {
          userId: req.user.id,
          requirements,
        });

        next();
      } catch (error: any) {
        logger.error('Error verificando todos los permisos', {
          error: error.message,
          userId: req.user?.id,
          requirements,
        });

        ApiResponseUtil.error(res, 'Error interno verificando permisos', 500);
      }
    };
  }

  /**
   * Verificar si es propietario del recurso O tiene permisos administrativos
   */
  static requireOwnershipOrPermission(
    module: string,
    action: 'read' | 'create' | 'update' | 'delete' | 'export',
    ownershipCheck: (req: AuthenticatedRequest) => Promise<boolean>
  ) {
    return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.user) {
          ApiResponseUtil.unauthorized(res, 'Usuario no autenticado');
          return;
        }

        logger.info('Verificando propiedad del recurso o permisos administrativos', {
          userId: req.user.id,
          module,
          action,
          path: req.path,
        });

        // Primero verificar si es propietario del recurso
        const isOwner = await ownershipCheck(req);
        
        if (isOwner) {
          logger.info('Acceso permitido por propiedad del recurso', {
            userId: req.user.id,
            module,
            action,
          });
          next();
          return;
        }

        // Si no es propietario, verificar permisos administrativos
        const permissionCheck = await PermissionsService.checkUserPermission(
          req.user.id,
          { module, action }
        );

        if (!permissionCheck.hasPermission) {
          logger.warn('Acceso denegado - no es propietario ni tiene permisos administrativos', {
            userId: req.user.id,
            module,
            action,
          });

          ApiResponseUtil.forbidden(res, 'Acceso denegado: no tienes permisos para este recurso');
          return;
        }

        logger.info('Acceso permitido por permisos administrativos', {
          userId: req.user.id,
          module,
          action,
        });

        next();
      } catch (error: any) {
        logger.error('Error verificando propiedad o permisos', {
          error: error.message,
          userId: req.user?.id,
          module,
          action,
        });

        ApiResponseUtil.error(res, 'Error interno verificando permisos', 500);
      }
    };
  }
} 