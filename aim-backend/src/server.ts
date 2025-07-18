import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import { config } from './config';
import { logger } from './shared/utils/logger';
import { db } from './database/client';
import { ApiResponseUtil } from './shared/utils/response';

// Importar rutas
import authRoutes from '@/modules/auth/auth.routes';
import { permissionsRoutes } from '@/modules/permissions/permissions.routes';
import { createActivityRoutes } from '@/modules/activity/activity.routes';
import { createUsersRoutes } from '@/modules/users/users.routes';
import { createClientsRoutes } from '@/modules/clients/clients.routes';
import { createOrdersRoutes } from '@/modules/orders/orders.routes';
import { createGalleryRoutes } from '@/modules/gallery/gallery.routes';
import { createAgentsRoutes } from '@/modules/agents/agents.routes';
import { createDocumentsRoutes } from '@/modules/documents/documents.routes';

class Server {
  private app: express.Application;
  private port: number;

  constructor() {
    this.app = express();
    this.port = config.port;
    
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  /**
   * Configurar middleware
   */
  private setupMiddleware(): void {
    // Middleware de seguridad
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }));

    // CORS
    this.app.use(cors({
      origin: config.cors.origin,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: config.rateLimit.windowMs,
      max: config.rateLimit.maxRequests,
      message: {
        success: false,
        error: 'Too many requests',
        message: 'Demasiadas solicitudes desde esta IP',
      },
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use('/api/', limiter);

    // Compression
    this.app.use(compression());

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Cookie parsing
    this.app.use(cookieParser());

    // Request logging
    this.app.use(morgan('combined', {
      stream: {
        write: (message: string) => {
          logger.info(message.trim());
        },
      },
    }));

    // Request ID middleware
    this.app.use((req, res, next) => {
      req.headers['x-request-id'] = req.headers['x-request-id'] || 
        Math.random().toString(36).substring(2, 15);
      next();
    });
  }

  /**
   * Configurar rutas
   */
  private setupRoutes(): void {
    // Health check
    this.app.get('/health', async (req, res) => {
      try {
        const dbHealthy = await db.healthCheck();
        
        const health = {
          status: 'ok',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          database: dbHealthy ? 'connected' : 'disconnected',
          memory: process.memoryUsage(),
          version: process.version,
        };

        if (!dbHealthy) {
          return res.status(503).json({
            ...health,
            status: 'error',
          });
        }

        return res.json(health);
      } catch (error) {
        return res.status(503).json({
          status: 'error',
          message: 'Service unavailable',
          timestamp: new Date().toISOString(),
        });
      }
    });

    // API routes
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/permissions', permissionsRoutes);
    this.app.use('/api/activity', createActivityRoutes(db.client));
    this.app.use('/api/users', createUsersRoutes(db.client));
    this.app.use('/api/clients', createClientsRoutes(db.client));
    this.app.use('/api/orders', createOrdersRoutes(db.client));
    this.app.use('/api/gallery', createGalleryRoutes(db.client));
    this.app.use('/api/agents', createAgentsRoutes(db.client));
    this.app.use('/api/documents', createDocumentsRoutes(db.client));

    // 404 handler
    this.app.use('*', (req, res) => {
      ApiResponseUtil.notFound(res, `Ruta ${req.originalUrl} no encontrada`);
    });
  }

  /**
   * Configurar manejo de errores
   */
  private setupErrorHandling(): void {
    // Error handler global
    this.app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      logger.error('Error no manejado', {
        error: error.message,
        stack: error.stack,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      });

      // No enviar stack trace en producción
      const isDevelopment = config.nodeEnv === 'development';
      
      ApiResponseUtil.error(
        res,
        isDevelopment ? error.stack : 'Error interno del servidor',
        500,
        error.message
      );
    });

    // Manejar promesas rechazadas sin catch
    process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
      logger.error('Promesa rechazada sin manejar', { reason, promise });
    });

    // Manejar excepciones no capturadas
    process.on('uncaughtException', (error: Error) => {
      logger.error('Excepción no capturada', { error: error.message, stack: error.stack });
      process.exit(1);
    });
  }

  /**
   * Iniciar servidor
   */
  public async start(): Promise<void> {
    try {
      // Conectar a la base de datos
      await db.connect();

      // Iniciar servidor HTTP
      this.app.listen(this.port, () => {
        logger.info(`🚀 Servidor iniciado en puerto ${this.port}`);
        logger.info(`📍 Entorno: ${config.nodeEnv}`);
        logger.info(`🔗 Health check: http://localhost:${this.port}/health`);
        logger.info(`🔑 API endpoints: http://localhost:${this.port}/api`);
      });
    } catch (error) {
      logger.error('❌ Error iniciando servidor', { error });
      process.exit(1);
    }
  }

  /**
   * Parar servidor gracefully
   */
  public async stop(): Promise<void> {
    try {
      await db.disconnect();
      logger.info('🛑 Servidor detenido');
    } catch (error) {
      logger.error('❌ Error deteniendo servidor', { error });
    }
  }
}

// Crear y iniciar servidor
const server = new Server();

// Manejar señales de terminación
process.on('SIGTERM', async () => {
  logger.info('🔄 SIGTERM recibido, cerrando servidor...');
  await server.stop();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('🔄 SIGINT recibido, cerrando servidor...');
  await server.stop();
  process.exit(0);
});

// Iniciar servidor
server.start().catch((error) => {
  logger.error('❌ Error fatal iniciando servidor', { error });
  process.exit(1);
});

export default server; 