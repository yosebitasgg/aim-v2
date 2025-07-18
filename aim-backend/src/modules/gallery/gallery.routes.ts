import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { GalleryController } from './gallery.controller';
import { AuthMiddleware } from '../../shared/middleware/auth';
import { PermissionsMiddleware } from '../../shared/middleware/permissions';

export function createGalleryRoutes(prisma: PrismaClient): Router {
  const router = Router();
  const galleryController = new GalleryController(prisma);

  // ===== RUTAS PÚBLICAS (Solo lectura) =====
  
  // Overview general de la galería
  router.get('/overview', galleryController.getGalleryOverview);
  
  // Obtener tipos de conexión
  router.get('/connection-types', galleryController.getConnectionTypes);
  router.get('/connection-types/:id', galleryController.getConnectionTypeById);
  
  // Obtener plantillas de conexión
  router.get('/connection-templates', galleryController.getConnectionTemplates);
  router.get('/connection-templates/:id', galleryController.getConnectionTemplateById);
  
  // Descargar plantilla de conexión (requiere autenticación)
  router.get('/connection-templates/:id/download', 
    AuthMiddleware.authenticate,
    galleryController.downloadConnectionTemplate
  );
  
  // Obtener categorías de agentes
  router.get('/categories', galleryController.getAgentCategories);
  router.get('/categories/:id', galleryController.getAgentCategoryById);
  
  // Obtener agentes
  router.get('/agents', galleryController.getAgents);
  router.get('/agents/:id', galleryController.getAgentById);
  router.get('/agents/slug/:slug', galleryController.getAgentBySlug);
  
  // Descargar plantilla de agente (requiere autenticación)
  router.get('/agents/:id/download', 
    AuthMiddleware.authenticate,
    galleryController.downloadAgentTemplate
  );

  // ===== RUTAS ADMINISTRATIVAS (Requieren autenticación y permisos) =====
  
  // Aplicar middleware de autenticación a todas las rutas administrativas
  router.use(AuthMiddleware.authenticate);
  
  // Estadísticas (requiere permisos de lectura)
  router.get('/stats', 
    PermissionsMiddleware.requirePermission('gallery', 'read'),
    galleryController.getGalleryStats
  );
  
  // ===== GESTIÓN DE CATEGORÍAS =====
  
  router.post('/categories', 
    PermissionsMiddleware.requirePermission('gallery', 'create'),
    galleryController.createAgentCategory
  );
  
  router.put('/categories/:id', 
    PermissionsMiddleware.requirePermission('gallery', 'update'),
    galleryController.updateAgentCategory
  );
  
  router.delete('/categories/:id', 
    PermissionsMiddleware.requirePermission('gallery', 'delete'),
    galleryController.deleteAgentCategory
  );
  
  // ===== GESTIÓN DE TIPOS DE CONEXIÓN =====
  
  router.post('/connection-types', 
    PermissionsMiddleware.requirePermission('gallery', 'create'),
    galleryController.createConnectionType
  );
  
  router.put('/connection-types/:id', 
    PermissionsMiddleware.requirePermission('gallery', 'update'),
    galleryController.updateConnectionType
  );
  
  router.delete('/connection-types/:id', 
    PermissionsMiddleware.requirePermission('gallery', 'delete'),
    galleryController.deleteConnectionType
  );
  
  // ===== GESTIÓN DE PLANTILLAS DE CONEXIÓN =====
  
  router.post('/connection-templates', 
    PermissionsMiddleware.requirePermission('gallery', 'create'),
    galleryController.createConnectionTemplate
  );
  
  // TODO: Implementar updateConnectionTemplate y deleteConnectionTemplate
  // router.put('/connection-templates/:id', 
  //   PermissionsMiddleware.requirePermission('gallery', 'update'),
  //   galleryController.updateConnectionTemplate
  // );
  
  // router.delete('/connection-templates/:id', 
  //   PermissionsMiddleware.requirePermission('gallery', 'delete'),
  //   galleryController.deleteConnectionTemplate
  // );
  
  // ===== GESTIÓN DE AGENTES =====
  
  router.post('/agents', 
    PermissionsMiddleware.requirePermission('gallery', 'create'),
    galleryController.createAgent
  );
  
  router.put('/agents/:id', 
    PermissionsMiddleware.requirePermission('gallery', 'update'),
    galleryController.updateAgent
  );
  
  router.delete('/agents/:id', 
    PermissionsMiddleware.requirePermission('gallery', 'delete'),
    galleryController.deleteAgent
  );

  return router;
} 