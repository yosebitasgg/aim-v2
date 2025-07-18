const { PrismaClient } = require('@prisma/client');

async function seedDocumentTypes(prisma) {
  console.log('🌱 Iniciando seeder de tipos de documentos...');

  try {
    // Definir los tipos de documentos basados en el análisis del frontend
    const documentTypes = [
      {
        name: 'Reporte de Diagnóstico',
        slug: 'diagnostico',
        description: 'Análisis inicial de procesos y oportunidades de automatización',
        phase: 'Fase 1',
        icon: 'tabler:search',
        color: 'teal',
        estimatedTime: '1-2 días',
        sortOrder: 1,
        formSchema: {
          fields: [
            {
              id: 'analysisDate',
              name: 'analysisDate',
              type: 'date',
              label: 'Fecha de Análisis',
              required: true,
              section: 'general',
              order: 1
            },
            {
              id: 'currentProcesses',
              name: 'currentProcesses',
              type: 'textarea',
              label: 'Procesos Actuales',
              description: 'Descripción detallada de los procesos existentes',
              required: true,
              section: 'analysis',
              order: 2
            },
            {
              id: 'identifiedProblems',
              name: 'identifiedProblems',
              type: 'textarea',
              label: 'Problemas Identificados',
              description: 'Listado de problemas y ineficiencias detectadas',
              required: true,
              section: 'analysis',
              order: 3
            },
            {
              id: 'automationOpportunities',
              name: 'automationOpportunities',
              type: 'textarea',
              label: 'Oportunidades de Automatización',
              description: 'Áreas donde se puede implementar automatización',
              required: true,
              section: 'opportunities',
              order: 4
            },
            {
              id: 'priorityLevel',
              name: 'priorityLevel',
              type: 'select',
              label: 'Nivel de Prioridad',
              required: true,
              options: [
                { value: 'high', label: 'Alta' },
                { value: 'medium', label: 'Media' },
                { value: 'low', label: 'Baja' }
              ],
              section: 'assessment',
              order: 5
            }
          ]
        },
        templateConfig: {
          layout: 'A4',
          sections: ['header', 'summary', 'analysis', 'opportunities', 'recommendations']
        },
        exportConfig: {
          formats: ['pdf', 'jpg'],
          defaultFormat: 'pdf'
        }
      },
      {
        name: 'Estimación de ROI',
        slug: 'roi',
        description: 'Cálculo de retorno de inversión y beneficios esperados',
        phase: 'Fase 1',
        icon: 'tabler:calculator',
        color: 'emerald',
        estimatedTime: '1 día',
        sortOrder: 2,
        formSchema: {
          fields: [
            {
              id: 'investmentAmount',
              name: 'investmentAmount',
              type: 'number',
              label: 'Monto de Inversión (MXN)',
              required: true,
              section: 'financial',
              order: 1
            },
            {
              id: 'currentCosts',
              name: 'currentCosts',
              type: 'number',
              label: 'Costos Actuales Mensuales (MXN)',
              required: true,
              section: 'financial',
              order: 2
            },
            {
              id: 'expectedSavings',
              name: 'expectedSavings',
              type: 'number',
              label: 'Ahorros Esperados Mensuales (MXN)',
              required: true,
              section: 'financial',
              order: 3
            },
            {
              id: 'timeframeMonths',
              name: 'timeframeMonths',
              type: 'number',
              label: 'Plazo de Análisis (meses)',
              required: true,
              defaultValue: 24,
              section: 'financial',
              order: 4
            },
            {
              id: 'riskFactors',
              name: 'riskFactors',
              type: 'textarea',
              label: 'Factores de Riesgo',
              description: 'Riesgos que podrían afectar el ROI',
              section: 'assessment',
              order: 5
            }
          ]
        },
        templateConfig: {
          layout: 'A4',
          sections: ['header', 'executive_summary', 'financial_analysis', 'charts', 'conclusions']
        },
        exportConfig: {
          formats: ['pdf', 'jpg'],
          defaultFormat: 'pdf'
        }
      },
      {
        name: 'Propuesta Comercial',
        slug: 'propuesta',
        description: 'Documento formal con alcance, solución y cotización',
        phase: 'Fase 3',
        icon: 'tabler:file-text',
        color: 'teal',
        estimatedTime: '2-3 días',
        sortOrder: 3,
        formSchema: {
          fields: [
            {
              id: 'projectScope',
              name: 'projectScope',
              type: 'textarea',
              label: 'Alcance del Proyecto',
              description: 'Descripción detallada del alcance y objetivos',
              required: true,
              section: 'project',
              order: 1
            },
            {
              id: 'proposedSolution',
              name: 'proposedSolution',
              type: 'textarea',
              label: 'Solución Propuesta',
              description: 'Descripción técnica de la solución',
              required: true,
              section: 'solution',
              order: 2
            },
            {
              id: 'timeline',
              name: 'timeline',
              type: 'number',
              label: 'Duración del Proyecto (semanas)',
              required: true,
              section: 'timeline',
              order: 4
            },
            {
              id: 'totalCost',
              name: 'totalCost',
              type: 'number',
              label: 'Costo Total (MXN)',
              required: true,
              section: 'financial',
              order: 5
            },
            {
              id: 'paymentTerms',
              name: 'paymentTerms',
              type: 'textarea',
              label: 'Términos de Pago',
              required: true,
              section: 'financial',
              order: 6
            }
          ]
        },
        templateConfig: {
          layout: 'A4',
          sections: ['header', 'introduction', 'scope', 'solution', 'deliverables', 'timeline', 'pricing', 'terms']
        },
        exportConfig: {
          formats: ['pdf', 'jpg'],
          defaultFormat: 'pdf'
        }
      },
      {
        name: 'Documentación Técnica',
        slug: 'arquitectura',
        description: 'Especificaciones técnicas y diseño de arquitectura',
        phase: 'Fase 2',
        icon: 'tabler:code',
        color: 'emerald',
        estimatedTime: '3-5 días',
        sortOrder: 4,
        formSchema: {
          fields: [
            {
              id: 'systemArchitecture',
              name: 'systemArchitecture',
              type: 'textarea',
              label: 'Arquitectura del Sistema',
              description: 'Descripción de la arquitectura técnica',
              required: true,
              section: 'technical',
              order: 1
            },
            {
              id: 'technicalSpecs',
              name: 'technicalSpecs',
              type: 'textarea',
              label: 'Especificaciones Técnicas',
              description: 'Detalles técnicos específicos',
              required: true,
              section: 'technical',
              order: 2
            },
            {
              id: 'securityRequirements',
              name: 'securityRequirements',
              type: 'textarea',
              label: 'Requisitos de Seguridad',
              description: 'Medidas de seguridad a implementar',
              section: 'security',
              order: 3
            },
            {
              id: 'integrationPoints',
              name: 'integrationPoints',
              type: 'textarea',
              label: 'Puntos de Integración',
              description: 'Sistemas y servicios que se integrarán',
              section: 'integration',
              order: 4
            }
          ]
        },
        templateConfig: {
          layout: 'A4',
          sections: ['header', 'overview', 'architecture', 'specifications', 'security', 'integration']
        },
        exportConfig: {
          formats: ['pdf', 'jpg'],
          defaultFormat: 'pdf'
        }
      },
      {
        name: 'Documentación de Usuario',
        slug: 'usuario',
        description: 'Manual de usuario y guías de operación',
        phase: 'Fase 4',
        icon: 'tabler:user-circle',
        color: 'blue',
        estimatedTime: '2-3 días',
        sortOrder: 5,
        formSchema: {
          fields: [
            {
              id: 'userGuide',
              name: 'userGuide',
              type: 'textarea',
              label: 'Guía de Usuario',
              description: 'Instrucciones paso a paso para el usuario',
              required: true,
              section: 'guide',
              order: 1
            },
            {
              id: 'operationProcedures',
              name: 'operationProcedures',
              type: 'textarea',
              label: 'Procedimientos de Operación',
              description: 'Procedimientos operativos estándar',
              required: true,
              section: 'operations',
              order: 2
            },
            {
              id: 'troubleshooting',
              name: 'troubleshooting',
              type: 'textarea',
              label: 'Solución de Problemas',
              description: 'Guía para resolver problemas comunes',
              section: 'troubleshooting',
              order: 3
            }
          ]
        },
        templateConfig: {
          layout: 'A4',
          sections: ['header', 'introduction', 'user_guide', 'operations', 'troubleshooting', 'support']
        },
        exportConfig: {
          formats: ['pdf', 'jpg'],
          defaultFormat: 'pdf'
        }
      },
      {
        name: 'Reporte de Entrega',
        slug: 'entrega',
        description: 'Reporte final de entrega del proyecto',
        phase: 'Fase 5',
        icon: 'tabler:check-circle',
        color: 'green',
        estimatedTime: '1-2 días',
        sortOrder: 6,
        formSchema: {
          fields: [
            {
              id: 'deliveryDate',
              name: 'deliveryDate',
              type: 'date',
              label: 'Fecha de Entrega',
              required: true,
              section: 'delivery',
              order: 1
            },
            {
              id: 'deliverables',
              name: 'deliverables',
              type: 'textarea',
              label: 'Entregables',
              description: 'Lista de elementos entregados',
              required: true,
              section: 'delivery',
              order: 2
            },
            {
              id: 'testResults',
              name: 'testResults',
              type: 'textarea',
              label: 'Resultados de Pruebas',
              description: 'Resultados de las pruebas realizadas',
              required: true,
              section: 'testing',
              order: 3
            },
            {
              id: 'recommendations',
              name: 'recommendations',
              type: 'textarea',
              label: 'Recomendaciones',
              description: 'Recomendaciones para mantenimiento y mejoras',
              section: 'recommendations',
              order: 4
            }
          ]
        },
        templateConfig: {
          layout: 'A4',
          sections: ['header', 'summary', 'deliverables', 'testing', 'recommendations', 'support']
        },
        exportConfig: {
          formats: ['pdf', 'jpg'],
          defaultFormat: 'pdf'
        }
      }
    ];

    // Crear tipos de documentos
    for (const docType of documentTypes) {
      try {
        await prisma.documentType.upsert({
          where: { slug: docType.slug },
          update: docType,
          create: docType
        });
        console.log(`✅ Tipo de documento "${docType.name}" creado/actualizado`);
      } catch (error) {
        console.error(`❌ Error creando tipo de documento "${docType.name}":`, error);
      }
    }

    console.log(`🎉 Seeder completado. ${documentTypes.length} tipos de documentos procesados.`);
  } catch (error) {
    console.error('❌ Error ejecutando seeder:', error);
    throw error;
  }
}

async function runSeeder() {
  const prisma = new PrismaClient();
  
  try {
    await seedDocumentTypes(prisma);
    console.log('✅ Seeder ejecutado exitosamente');
  } catch (error) {
    console.error('❌ Error en seeder:', error);
  } finally {
    await prisma.$disconnect();
  }
}

runSeeder(); 