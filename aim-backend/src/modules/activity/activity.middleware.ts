import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '@/shared/utils/logger';
import { ActivityService } from './activity.service';
import {
  ActivityType,
  ActivityModule,
  ActivitySeverity,
  ActivityContext,
  AuditConfig
} from './activity.types';

// Extender la interfaz de Request para incluir datos de actividad
interface ExtendedRequest extends Request {
  activityContext?: ActivityContext;
}

export class ActivityMiddleware {
  private activityService: ActivityService;
  private config: AuditConfig;

  constructor(prisma: PrismaClient) {
    this.activityService = new ActivityService(prisma);
    this.config = this.activityService.getConfig();
  }

  /**
   * Middleware principal para logging automático de actividades
   */
  autoLogger = () => {
    return async (req: Request, res: Response, next: NextFunction) => {
      // Verificar si el auto logging está habilitado
      if (!this.config.enableAutoLogging) {
        return next();
      }

      // Verificar si la ruta está en la lista de exclusiones
      if (this.isExcludedPath(req.path)) {
        return next();
      }

      // Solo loggear si hay un usuario autenticado
      if (!req.user?.id) {
        return next();
      }

      const startTime = Date.now();
      
      // Capturar datos de la request
      const requestData = {
        method: req.method,
        path: req.path,
        query: req.query,
        headers: this.sanitizeHeaders(req.headers),
        userAgent: req.get('user-agent'),
        ipAddress: this.getClientIP(req)
      };

      // Interceptar la response
      const originalSend = res.send;
      let responseData: any;
      let statusCode: number;

      res.send = function(data: any) {
        responseData = data;
        statusCode = res.statusCode;
        return originalSend.call(this, data);
      };

      // Continuar con el siguiente middleware
      res.on('finish', async () => {
        try {
          const duration = Date.now() - startTime;
          
          // Determinar tipo de actividad y módulo basado en la ruta
          const activityInfo = this.determineActivityInfo(req);
          
          if (activityInfo.action) {
            await this.activityService.logActivity({
              userId: req.user!.id,
              action: activityInfo.action,
              module: activityInfo.module,
              severity: this.determineSeverity(req.method, statusCode),
              ipAddress: requestData.ipAddress,
              userAgent: requestData.userAgent,
              details: {
                method: req.method,
                path: req.path,
                statusCode,
                duration,
                query: req.query,
                success: statusCode < 400,
                timestamp: new Date().toISOString(),
                ...activityInfo.details
              }
            });
          }
        } catch (error) {
          logger.error('Error en activity middleware', {
            error,
            userId: req.user?.id,
            path: req.path,
            method: req.method
          });
        }
      });

      next();
    };
  };

  /**
   * Middleware específico para operaciones de autenticación
   */
     authLogger = () => {
     return async (req: Request, res: Response, next: NextFunction) => {
       const activityService = this.activityService;
       const originalSend = res.send;
       
       res.send = function(data: any) {
         const statusCode = res.statusCode;
         
         // Loggear después de la respuesta
         setImmediate(async () => {
           try {
             const ipAddress = req.ip || req.connection.remoteAddress;
             const userAgent = req.get('user-agent');
             
             if (req.path.includes('/login')) {
               if (statusCode === 200) {
                 // Login exitoso
                 const responseBody = typeof data === 'string' ? JSON.parse(data) : data;
                 if (responseBody.user?.id) {
                   await activityService.logLogin(
                     responseBody.user.id,
                     ipAddress,
                     userAgent
                   );
                 }
               } else {
                 // Login fallido - crear actividad para el email si está disponible
                 const email = req.body?.email;
                 if (email) {
                   // Crear un log de actividad fallida sin userId específico
                   logger.warn('Intento de login fallido', {
                     email,
                     statusCode,
                     ipAddress,
                     userAgent
                   });
                 }
               }
             } else if (req.path.includes('/logout') && (req as any).user?.id) {
               await activityService.logLogout(
                 (req as any).user.id,
                 ipAddress
               );
             } else if (req.path.includes('/register') && statusCode === 201) {
               const responseBody = typeof data === 'string' ? JSON.parse(data) : data;
               if (responseBody.user?.id) {
                 await activityService.logActivity({
                   userId: responseBody.user.id,
                   action: ActivityType.REGISTER,
                   module: ActivityModule.AUTH,
                   severity: ActivitySeverity.LOW,
                   ipAddress,
                   userAgent,
                   details: {
                     email: responseBody.user.email,
                     timestamp: new Date().toISOString()
                   }
                 });
               }
             }
           } catch (error) {
             logger.error('Error en auth activity logging', { error });
           }
         });

         return originalSend.call(this, data);
       };

       next();
     };
   };

  /**
   * Middleware para loggear verificaciones de permisos
   */
     permissionLogger = () => {
     return async (req: Request, res: Response, next: NextFunction) => {
       const activityService = this.activityService;
       
       // Agregar contexto de actividad al request
       (req as any).activityContext = {
         action: ActivityType.PERMISSION_CHECK,
         module: ActivityModule.PERMISSIONS,
         severity: ActivitySeverity.LOW,
         details: {
           requestedResource: req.path,
           method: req.method
         }
       };

       const originalSend = res.send;
       
       res.send = function(data: any) {
         const statusCode = res.statusCode;
         
         // Si es un 403, loggear permiso denegado
         if (statusCode === 403 && (req as any).user?.id) {
           setImmediate(async () => {
             try {
               await activityService.logPermissionDenied(
                 (req as any).user.id,
                 `${req.method} ${req.path}`,
                 req.path,
                 req.ip
               );
             } catch (error) {
               logger.error('Error loggeando permiso denegado', { error });
             }
           });
         }

         return originalSend.call(this, data);
       };

       next();
     };
   };

   /**
    * Middleware para operaciones específicas del sistema
    */
   systemLogger = (action: ActivityType, module: ActivityModule, severity: ActivitySeverity = ActivitySeverity.LOW) => {
     return async (req: Request, res: Response, next: NextFunction) => {
       const activityService = this.activityService;
       
       (req as any).activityContext = {
         action,
         module,
         severity,
         details: {
           endpoint: req.path,
           method: req.method,
           body: req.method !== 'GET' ? req.body : undefined
         }
       };

       const originalSend = res.send;
       
       res.send = function(data: any) {
         const statusCode = res.statusCode;
         
         if ((req as any).user?.id && statusCode < 400) {
           setImmediate(async () => {
             try {
               await activityService.logActivity({
                 userId: (req as any).user.id,
                 action,
                 module,
                 severity,
                 ipAddress: req.ip,
                 userAgent: req.get('user-agent'),
                 details: {
                   ...(req as any).activityContext?.details,
                   statusCode,
                   success: true,
                   timestamp: new Date().toISOString()
                 }
               });
             } catch (error) {
               logger.error('Error en system activity logging', { error });
             }
           });
         }

         return originalSend.call(this, data);
       };

       next();
     };
   };

  /**
   * Determina el tipo de actividad y módulo basado en la ruta
   */
  private determineActivityInfo(req: Request): { action?: ActivityType; module?: ActivityModule; details?: any } {
    const path = req.path.toLowerCase();
    const method = req.method.toUpperCase();

    // API general
    if (path.includes('/api/')) {
      return {
        action: ActivityType.API_ACCESS,
        module: ActivityModule.API,
        details: {
          endpoint: req.path,
          method: req.method
        }
      };
    }

    // Usuarios
    if (path.includes('/users')) {
      if (method === 'POST') return { action: ActivityType.USER_CREATE, module: ActivityModule.USERS };
      if (method === 'PUT' || method === 'PATCH') return { action: ActivityType.USER_UPDATE, module: ActivityModule.USERS };
      if (method === 'DELETE') return { action: ActivityType.USER_DELETE, module: ActivityModule.USERS };
    }

    // Roles
    if (path.includes('/roles')) {
      if (method === 'POST') return { action: ActivityType.ROLE_CREATE, module: ActivityModule.ROLES };
      if (method === 'PUT' || method === 'PATCH') return { action: ActivityType.ROLE_UPDATE, module: ActivityModule.ROLES };
      if (method === 'DELETE') return { action: ActivityType.ROLE_DELETE, module: ActivityModule.ROLES };
    }

    // Permisos
    if (path.includes('/permissions')) {
      return { action: ActivityType.PERMISSION_CHECK, module: ActivityModule.PERMISSIONS };
    }

    // Agentes
    if (path.includes('/agents')) {
      if (method === 'POST') return { action: ActivityType.AGENT_CREATE, module: ActivityModule.AGENTS };
      if (method === 'PUT' || method === 'PATCH') return { action: ActivityType.AGENT_UPDATE, module: ActivityModule.AGENTS };
      if (method === 'DELETE') return { action: ActivityType.AGENT_DELETE, module: ActivityModule.AGENTS };
    }

    // Clientes
    if (path.includes('/clients')) {
      if (method === 'POST') return { action: ActivityType.CLIENT_CREATE, module: ActivityModule.CLIENTS };
      if (method === 'PUT' || method === 'PATCH') return { action: ActivityType.CLIENT_UPDATE, module: ActivityModule.CLIENTS };
      if (method === 'DELETE') return { action: ActivityType.CLIENT_DELETE, module: ActivityModule.CLIENTS };
      if (method === 'GET') return { action: ActivityType.CLIENT_VIEW, module: ActivityModule.CLIENTS };
    }

    return { action: undefined, module: undefined };
  }

  /**
   * Determina la severidad basada en el método y código de respuesta
   */
  private determineSeverity(method: string, statusCode: number): ActivitySeverity {
    // Errores de servidor son críticos
    if (statusCode >= 500) return ActivitySeverity.CRITICAL;
    
    // Errores de cliente son medios
    if (statusCode >= 400) return ActivitySeverity.MEDIUM;
    
    // Operaciones de escritura son medias
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) return ActivitySeverity.MEDIUM;
    
    // Todo lo demás es bajo
    return ActivitySeverity.LOW;
  }

  /**
   * Verifica si una ruta está excluida del logging
   */
  private isExcludedPath(path: string): boolean {
    return this.config.excludedPaths.some(excludedPath => 
      path.startsWith(excludedPath) || path.includes(excludedPath)
    );
  }

  /**
   * Sanitiza headers removiendo información sensible
   */
  private sanitizeHeaders(headers: any): any {
    const sanitized = { ...headers };
    delete sanitized.authorization;
    delete sanitized.cookie;
    delete sanitized['x-api-key'];
    return sanitized;
  }

  /**
   * Obtiene la IP del cliente considerando proxies
   */
  private getClientIP(req: Request): string {
    return (
      req.headers['x-forwarded-for'] as string ||
      req.headers['x-real-ip'] as string ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.ip ||
      'unknown'
    );
  }

  /**
   * Actualiza la configuración del middleware
   */
  updateConfig(newConfig: Partial<AuditConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.activityService.updateConfig(this.config);
  }

  /**
   * Obtiene la configuración actual
   */
  getConfig(): AuditConfig {
    return { ...this.config };
  }
} 