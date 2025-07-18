import { Request, Response, NextFunction } from 'express';
import { JwtUtil } from '@/shared/utils/jwt';
import { ApiResponseUtil } from '@/shared/utils/response';
import { logger } from '@/shared/utils/logger';
import { JwtPayload, UserSession } from '@/shared/types';
import { prisma } from '@/database/client';

// Extender el tipo Request para incluir el usuario
declare global {
  namespace Express {
    interface Request {
      user?: UserSession;
    }
  }
}

export class AuthMiddleware {
  /**
   * Middleware para verificar autenticación JWT
   */
  static async authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      logger.info('Middleware autenticación iniciado', { 
        path: req.path, 
        headers: { authorization: req.headers.authorization ? 'Present' : 'Missing' }
      });

      const token = AuthMiddleware.extractToken(req);
      
      if (!token) {
        logger.warn('Token no encontrado en request');
        ApiResponseUtil.unauthorized(res, 'Token de acceso requerido');
        return;
      }

      logger.info('Token extraído, verificando...', { tokenLength: token.length });
      const payload: JwtPayload = JwtUtil.verifyToken(token);
      logger.info('Token verificado exitosamente', { userId: payload.userId, email: payload.email });
      
      // Verificar que el usuario existe y está activo
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          department: true,
          status: true,
          createdAt: true,
        },
      });

      if (!user) {
        ApiResponseUtil.unauthorized(res, 'Usuario no encontrado');
        return;
      }

      if (user.status !== 'active') {
        ApiResponseUtil.unauthorized(res, 'Usuario inactivo');
        return;
      }

      // Agregar información del usuario a la request
      req.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department || undefined,
        createdAt: user.createdAt,
      };

      logger.info('Usuario agregado a request, continuando...', { userId: req.user?.id });
      next();
    } catch (error) {
      logger.error('Error en middleware de autenticación', { 
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        tokenProvided: !!AuthMiddleware.extractToken(req)
      });
      ApiResponseUtil.unauthorized(res, 'Token inválido');
    }
  }

  /**
   * Middleware para verificar roles específicos
   */
  static requireRole(roles: string | string[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.user) {
        ApiResponseUtil.unauthorized(res, 'Autenticación requerida');
        return;
      }

      const allowedRoles = Array.isArray(roles) ? roles : [roles];
      
      if (!allowedRoles.includes(req.user.role)) {
        ApiResponseUtil.forbidden(res, 'Permisos insuficientes');
        return;
      }

      next();
    };
  }

  /**
   * Middleware para verificar permisos específicos
   */
  static requirePermission(module: string, action: string) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      if (!req.user) {
        ApiResponseUtil.unauthorized(res, 'Autenticación requerida');
        return;
      }

      try {
        const hasPermission = await AuthMiddleware.checkUserPermission(req.user.id, module, action);
        
        if (!hasPermission) {
          ApiResponseUtil.forbidden(res, 'No tienes permisos para esta acción');
          return;
        }

        next();
      } catch (error) {
        logger.error('Error verificando permisos', { error });
        ApiResponseUtil.error(res, 'Error verificando permisos');
      }
    };
  }

  /**
   * Middleware opcional de autenticación (no falla si no hay token)
   */
  static async optionalAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = AuthMiddleware.extractToken(req);
      
      if (token) {
        const payload: JwtPayload = JwtUtil.verifyToken(token);
        
        const user = await prisma.user.findUnique({
          where: { id: payload.userId },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            department: true,
            status: true,
            createdAt: true,
          },
        });

        if (user && user.status === 'active') {
          req.user = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            department: user.department || undefined,
            createdAt: user.createdAt,
          };
        }
      }

      next();
    } catch (error) {
      // En modo opcional, continuamos sin autenticación
      next();
    }
  }

  /**
   * Extrae el token del header Authorization
   */
  private static extractToken(req: Request): string | null {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return null;
    }

    const parts = authHeader.split(' ');
    
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }

    return parts[1];
  }

  /**
   * Verifica si un usuario tiene un permiso específico
   */
  private static async checkUserPermission(userId: string, module: string, action: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });

      if (!user) return false;

      // Implementar lógica de permisos basada en roles
      // Por ahora, usar permisos por defecto
      const { DEFAULT_PERMISSIONS } = await import('@/shared/constants');
      const rolePermissions = DEFAULT_PERMISSIONS[user.role as keyof typeof DEFAULT_PERMISSIONS];
      
      if (!rolePermissions || !(module in rolePermissions)) return false;
      
      const modulePermissions = rolePermissions[module as keyof typeof rolePermissions] as any;
      return modulePermissions && modulePermissions[action];
    } catch (error) {
      logger.error('Error verificando permisos de usuario', { error });
      return false;
    }
  }
} 