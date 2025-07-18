import { PrismaClient } from '@prisma/client';
import { logger } from '@/shared/utils/logger';

class DatabaseClient {
  private static instance: DatabaseClient;
  private prisma: PrismaClient;

  private constructor() {
    this.prisma = new PrismaClient();
  }

  static getInstance(): DatabaseClient {
    if (!DatabaseClient.instance) {
      DatabaseClient.instance = new DatabaseClient();
    }
    return DatabaseClient.instance;
  }

  get client(): PrismaClient {
    return this.prisma;
  }

  async connect(): Promise<void> {
    try {
      await this.prisma.$connect();
      logger.info('✅ Conexión a base de datos establecida');
    } catch (error) {
      logger.error('❌ Error conectando a base de datos', { error });
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.prisma.$disconnect();
      logger.info('🔌 Conexión a base de datos cerrada');
    } catch (error) {
      logger.error('❌ Error desconectando de base de datos', { error });
      throw error;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      logger.error('❌ Health check falló', { error });
      return false;
    }
  }
}

export const db = DatabaseClient.getInstance();
export const prisma = db.client; 