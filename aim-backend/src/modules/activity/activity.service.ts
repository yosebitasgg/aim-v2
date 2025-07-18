import { PrismaClient, UserActivityLog, User } from '@prisma/client';
import { logger } from '@/shared/utils/logger';
import {
  ActivityType,
  ActivityModule,
  ActivitySeverity,
  CreateActivityInput,
  ActivityQueryParams,
  ActivityStatsParams,
  ActivityLog,
  ActivityListResponse,
  ActivityStats,
  AuditConfig
} from './activity.types';

export class ActivityService {
  private prisma: PrismaClient;
  private config: AuditConfig;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.config = {
      enableAutoLogging: true,
      logApiCalls: true,
      logPermissionChecks: true,
      logFailedAttempts: true,
      retentionDays: 90,
      excludedPaths: ['/health', '/api/activity/stats'],
      excludedActions: []
    };
  }

  /**
   * Registra una nueva actividad en el sistema
   */
  async logActivity(input: CreateActivityInput): Promise<UserActivityLog> {
    try {
      const activity = await this.prisma.userActivityLog.create({
                 data: {
           userId: input.userId,
           action: input.action,
           module: input.module,
           details: input.details || {},
           ipAddress: input.ipAddress,
           userAgent: input.userAgent,
           severity: input.severity || ActivitySeverity.LOW,
           affectedResourceId: input.affectedResourceId,
           affectedResourceType: input.affectedResourceType,
         } as any,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      logger.info('Actividad registrada', {
        activityId: activity.id,
        userId: input.userId,
        action: input.action,
        module: input.module,
        severity: input.severity
      });

      return activity;
    } catch (error) {
      logger.error('Error registrando actividad', {
        error,
        input
      });
      throw new Error('Error al registrar la actividad');
    }
  }

  /**
   * Registra múltiples actividades en lote
   */
  async logBatchActivities(activities: CreateActivityInput[]): Promise<{ count: number }> {
    try {
      const result = await this.prisma.userActivityLog.createMany({
        data: activities.map(activity => ({
          userId: activity.userId,
          action: activity.action,
          module: activity.module,
          details: activity.details || {},
          ipAddress: activity.ipAddress,
          userAgent: activity.userAgent,
          severity: activity.severity || ActivitySeverity.LOW,
          affectedResourceId: activity.affectedResourceId,
          affectedResourceType: activity.affectedResourceType,
        }))
      });

      logger.info('Actividades en lote registradas', {
        count: result.count,
        activities: activities.length
      });

      return result;
    } catch (error) {
      logger.error('Error registrando actividades en lote', {
        error,
        count: activities.length
      });
      throw new Error('Error al registrar las actividades en lote');
    }
  }

  /**
   * Obtiene actividades con filtros y paginación
   */
  async getActivities(params: ActivityQueryParams): Promise<ActivityListResponse> {
    try {
      const where: any = {};

      // Aplicar filtros
      if (params.userId) where.userId = params.userId;
      if (params.action) where.action = params.action;
      if (params.module) where.module = params.module;
      if (params.severity) where.severity = params.severity;
      if (params.ipAddress) where.ipAddress = params.ipAddress;

      // Filtros de fecha
      if (params.startDate || params.endDate) {
        where.createdAt = {};
        if (params.startDate) where.createdAt.gte = new Date(params.startDate);
        if (params.endDate) where.createdAt.lte = new Date(params.endDate);
      }

      // Obtener total para paginación
      const total = await this.prisma.userActivityLog.count({ where });

      // Obtener actividades con paginación
      const activities = await this.prisma.userActivityLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          [params.sortBy]: params.sortOrder
        },
        take: params.limit,
        skip: params.offset
      });

      const pages = Math.ceil(total / params.limit);
      const currentPage = Math.floor(params.offset / params.limit) + 1;

      return {
        activities: activities.map(this.mapActivityToLog),
        pagination: {
          total,
          limit: params.limit,
          offset: params.offset,
          pages,
          currentPage
        },
        filters: params
      };
    } catch (error) {
      logger.error('Error obteniendo actividades', {
        error,
        params
      });
      throw new Error('Error al obtener las actividades');
    }
  }

  /**
   * Obtiene actividades de un usuario específico
   */
  async getUserActivities(userId: string, params: Partial<ActivityQueryParams> = {}): Promise<ActivityListResponse> {
    return this.getActivities({
      ...params,
      userId,
      limit: params.limit || 20,
      offset: params.offset || 0,
      sortBy: params.sortBy || 'createdAt',
      sortOrder: params.sortOrder || 'desc'
    });
  }

  /**
   * Obtiene estadísticas de actividad
   */
  async getActivityStats(params: ActivityStatsParams): Promise<ActivityStats> {
    try {
      const where: any = {};

      // Aplicar filtros base
      if (params.userId) where.userId = params.userId;
      if (params.module) where.module = params.module;

      // Filtros de fecha
      if (params.startDate || params.endDate) {
        where.createdAt = {};
        if (params.startDate) where.createdAt.gte = new Date(params.startDate);
        if (params.endDate) where.createdAt.lte = new Date(params.endDate);
      }

      // Total de actividades
      const totalActivities = await this.prisma.userActivityLog.count({ where });

      // Actividades por módulo
      const activitiesByModule = await this.prisma.userActivityLog.groupBy({
        by: ['module'],
        where,
        _count: true
      });

      // Actividades por acción
      const activitiesByAction = await this.prisma.userActivityLog.groupBy({
        by: ['action'],
        where,
        _count: true
      });

             // Actividades por severidad
       const activitiesBySeverity = await this.prisma.userActivityLog.groupBy({
         by: ['action'], // Temporarily use action until Prisma client is regenerated
         where,
         _count: true
       });

      // Top usuarios (solo si no se está filtrando por usuario específico)
      let topUsers: Array<{ userId: string; userName: string; count: number }> = [];
      if (!params.userId) {
        const topUsersData = await this.prisma.userActivityLog.groupBy({
          by: ['userId'],
          where,
          _count: true,
          orderBy: {
            _count: {
              userId: 'desc'
            }
          },
          take: 10
        });

        // Obtener nombres de usuarios
        const userIds = topUsersData.map(u => u.userId);
        const users = await this.prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, name: true }
        });

        topUsers = topUsersData.map(userData => {
          const user = users.find(u => u.id === userData.userId);
          return {
            userId: userData.userId,
            userName: user?.name || 'Usuario desconocido',
            count: userData._count
          };
        });
      }

      // Actividades por tiempo (implementación simplificada)
      const activitiesOverTime = await this.getActivitiesOverTime(where, params.groupBy);

      return {
        totalActivities,
        activitiesByModule: this.mapGroupByToRecord(activitiesByModule, 'module'),
        activitiesByAction: this.mapGroupByToRecord(activitiesByAction, 'action'),
        activitiesBySeverity: this.mapGroupByToRecord(activitiesBySeverity, 'severity'),
        activitiesOverTime,
        topUsers
      };
    } catch (error) {
      logger.error('Error obteniendo estadísticas de actividad', {
        error,
        params
      });
      throw new Error('Error al obtener las estadísticas de actividad');
    }
  }

  /**
   * Limpia actividades antiguas basado en la configuración de retención
   */
  async cleanupOldActivities(): Promise<{ deletedCount: number }> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays);

      const result = await this.prisma.userActivityLog.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate
          }
        }
      });

      logger.info('Actividades antiguas eliminadas', {
        deletedCount: result.count,
        cutoffDate: cutoffDate.toISOString(),
        retentionDays: this.config.retentionDays
      });

      return { deletedCount: result.count };
    } catch (error) {
      logger.error('Error limpiando actividades antiguas', { error });
      throw new Error('Error al limpiar actividades antiguas');
    }
  }

  /**
   * Métodos de conveniencia para logging específico
   */
  async logLogin(userId: string, ipAddress?: string, userAgent?: string): Promise<UserActivityLog> {
    return this.logActivity({
      userId,
      action: ActivityType.LOGIN,
      module: ActivityModule.AUTH,
      severity: ActivitySeverity.LOW,
      ipAddress,
      userAgent,
      details: { timestamp: new Date().toISOString() }
    });
  }

  async logLogout(userId: string, ipAddress?: string): Promise<UserActivityLog> {
    return this.logActivity({
      userId,
      action: ActivityType.LOGOUT,
      module: ActivityModule.AUTH,
      severity: ActivitySeverity.LOW,
      ipAddress,
      details: { timestamp: new Date().toISOString() }
    });
  }

  async logPermissionDenied(userId: string, action: string, resource?: string, ipAddress?: string): Promise<UserActivityLog> {
    return this.logActivity({
      userId,
      action: ActivityType.PERMISSION_DENIED,
      module: ActivityModule.PERMISSIONS,
      severity: ActivitySeverity.MEDIUM,
      ipAddress,
      details: {
        deniedAction: action,
        resource,
        timestamp: new Date().toISOString()
      }
    });
  }

  async logSecurityAlert(userId: string, alertType: string, details: any, ipAddress?: string): Promise<UserActivityLog> {
    return this.logActivity({
      userId,
      action: ActivityType.SECURITY_ALERT,
      module: ActivityModule.SECURITY,
      severity: ActivitySeverity.HIGH,
      ipAddress,
      details: {
        alertType,
        ...details,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Métodos privados de utilidad
   */
     private mapActivityToLog(activity: UserActivityLog & { user?: any }): ActivityLog {
     return {
       id: activity.id,
       userId: activity.userId,
       action: activity.action as ActivityType,
       module: activity.module as ActivityModule,
       details: activity.details as Record<string, any>,
       ipAddress: activity.ipAddress || undefined,
       userAgent: activity.userAgent || undefined,
       severity: (activity as any).severity || ActivitySeverity.LOW,
       affectedResourceId: (activity as any).affectedResourceId || undefined,
       affectedResourceType: (activity as any).affectedResourceType || undefined,
       createdAt: activity.createdAt,
       user: activity.user ? {
         id: activity.user.id,
         name: activity.user.name,
         email: activity.user.email
       } : undefined
     };
   }

  private mapGroupByToRecord(groupData: any[], field: string): Record<string, number> {
    const result: Record<string, number> = {};
    groupData.forEach(item => {
      result[item[field]] = item._count;
    });
    return result;
  }

  private async getActivitiesOverTime(where: any, groupBy: string): Promise<Array<{ period: string; count: number }>> {
    // Implementación simplificada - en producción podrías usar queries más sofisticadas
    const activities = await this.prisma.userActivityLog.findMany({
      where,
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' }
    });

    const grouped: Record<string, number> = {};
    
    activities.forEach(activity => {
      let period: string;
      const date = activity.createdAt;
      
      switch (groupBy) {
        case 'hour':
          period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:00`;
          break;
        case 'day':
          period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          period = `${weekStart.getFullYear()}-W${Math.ceil(weekStart.getDate() / 7)}`;
          break;
        default:
          period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      }
      
      grouped[period] = (grouped[period] || 0) + 1;
    });

    return Object.entries(grouped).map(([period, count]) => ({ period, count }));
  }

  /**
   * Actualiza la configuración de auditoría
   */
  updateConfig(newConfig: Partial<AuditConfig>): void {
    this.config = { ...this.config, ...newConfig };
    logger.info('Configuración de auditoría actualizada', { config: this.config });
  }

  /**
   * Obtiene la configuración actual de auditoría
   */
  getConfig(): AuditConfig {
    return { ...this.config };
  }
} 