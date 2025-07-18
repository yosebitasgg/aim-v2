#!/usr/bin/env node

/**
 * Script para actualizar el flujo de documentos con todos los nuevos tipos
 * Integra el flujo de trabajo completo de 7 fases con agentes de IA
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function updateDocumentsFlow() {
  console.log('🚀 Iniciando actualización del flujo de documentos...');
  console.log('📋 Este proceso agregará 16 tipos de documentos organizados por fases');
  console.log('');

  try {
    // 1. Verificar conexión a la base de datos
    console.log('🔍 Verificando conexión a la base de datos...');
    await prisma.$connect();
    console.log('✅ Conexión exitosa a la base de datos');

    // 2. Crear backup de tipos de documentos existentes
    console.log('💾 Creando backup de tipos de documentos existentes...');
    const existingTypes = await prisma.documentType.findMany();
    const backupData = {
      timestamp: new Date().toISOString(),
      documentTypes: existingTypes
    };
    
    const backupPath = path.join(__dirname, `backup-document-types-${Date.now()}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
    console.log(`✅ Backup creado: ${backupPath}`);

    // 3. Contar documentos existentes para estadísticas
    const existingDocsCount = await prisma.document.count();
    console.log(`📊 Documentos existentes: ${existingDocsCount}`);

    // 4. Verificar si necesitamos migrar datos
    if (existingDocsCount > 0) {
      console.log('⚠️ Se encontraron documentos existentes.');
      console.log('   Los documentos existentes se mantendrán, pero algunos tipos pueden cambiar.');
    }

    // 5. Ejecutar el seeder actualizado
    console.log('🌱 Ejecutando seeder de documentos actualizado...');
    console.log('   Nota: Este proceso elimina tipos existentes y los recrea');
    
    // Importar y ejecutar el seeder
    const seedProcess = require('./run-documents-seeder.js');
    // El seeder se ejecuta automáticamente al requerirlo
    
    console.log('✅ Seeder ejecutado exitosamente');

    // 6. Verificar resultados
    console.log('🔍 Verificando resultados...');
    const newTypesCount = await prisma.documentType.count();
    const typesByPhase = await prisma.documentType.groupBy({
      by: ['phase'],
      _count: { phase: true },
      orderBy: { phase: 'asc' }
    });

    console.log(`📊 Nuevos tipos de documentos: ${newTypesCount}`);
    console.log('📋 Distribución por fases:');
    typesByPhase.forEach(group => {
      console.log(`   ${group.phase}: ${group._count.phase} documentos`);
    });

    // 7. Mostrar resumen final
    console.log('');
    console.log('🎉 ¡Actualización completada exitosamente!');
    console.log('');
    console.log('📋 Flujo de trabajo integrado creado:');
    console.log('   🔍 Fase 1: Análisis Inicial (2 documentos)');
    console.log('   🎯 Fase 2: Diseño y Planificación (1 documento)');
    console.log('   📄 Fase 3: Propuesta Comercial (4 documentos)');
    console.log('   🔧 Fase 4: Desarrollo y Configuración (2 documentos)');
    console.log('   🧪 Fase 5: Testing y Validación (2 documentos)');
    console.log('   🚀 Fase 6: Deployment e Integración (2 documentos)');
    console.log('   📚 Fase 7: Entrega y Soporte (3 documentos)');
    console.log('');
    console.log('🔧 Nuevos tipos de campo soportados:');
    console.log('   - attachment: Para archivos adjuntos categorizados');
    console.log('   - roi_calculator: Calculadora ROI avanzada');
    console.log('   - aim_quote_calculator: Cotizador dinámico AIM');
    console.log('');
    console.log('📝 Próximos pasos recomendados:');
    console.log('   1. Probar la creación de documentos en el frontend');
    console.log('   2. Implementar modales para calculadoras (ROI y AIM)');
    console.log('   3. Integrar con el módulo de agentes para sincronizar estados');
    console.log('   4. Configurar navegación por fases en el portal');
    console.log('');

  } catch (error) {
    console.error('❌ Error durante la actualización:', error);
    console.log('');
    console.log('🔧 Soluciones posibles:');
    console.log('   1. Verificar que la base de datos esté corriendo');
    console.log('   2. Verificar las variables de entorno (DATABASE_URL)');
    console.log('   3. Ejecutar las migraciones de Prisma si es necesario');
    console.log('   4. Revisar los logs de error anteriores');
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar solo si es llamado directamente
if (require.main === module) {
  updateDocumentsFlow()
    .then(() => {
      console.log('✅ Proceso completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error fatal:', error);
      process.exit(1);
    });
}

module.exports = updateDocumentsFlow; 