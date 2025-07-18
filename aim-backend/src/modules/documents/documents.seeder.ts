import { PrismaClient } from '@prisma/client';
import { Logger } from '@/shared/utils/logger';

const logger = Logger.getInstance();

export async function seedDocumentTypes(prisma: PrismaClient) {
  logger.info('Starting document types seeding...');

  try {
    // Definir los tipos de documentos basados en el análisis del frontend
    const documentTypes = [
      {
        name: 'Reporte de Diagnóstico',
        slug: 'diagnostico',
        description: 'Análisis inicial de procesos y oportunidades de automatización',
        phase: 'Fase 1',
        icon: 'tabler:search',
        color: '#14b8a6', // teal-500
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
            },
            {
              id: 'diagnosticAttachments',
              name: 'diagnosticAttachments',
              type: 'attachment',
              label: 'Anexos de Diagnóstico',
              description: 'Adjuntar evidencias del análisis actual',
              required: false,
              section: 'anexos',
              order: 6,
              attachmentConfig: {
                allowedTypes: ['pdf', 'image', 'document'],
                maxSize: 10485760, // 10MB
                maxCount: 5,
                categories: [
                  'Mapas de Procesos Actuales',
                  'Screenshots de Sistemas',
                  'Documentación Existente',
                  'Evidencias de Problemas',
                  'Otros'
                ]
              }
            }
          ]
        },
        templateConfig: {
          layout: 'A4',
          sections: ['header', 'summary', 'analysis', 'opportunities', 'recommendations', 'attachments']
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
        color: '#10b981', // emerald-500
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
            },
            {
              id: 'roiCalculator',
              name: 'roiCalculator',
              type: 'roi_calculator',
              label: 'Calculadora ROI Avanzada',
              description: 'Herramienta completa para calcular ROI con empleados y agentes',
              required: false,
              section: 'roi_advanced',
              order: 6
            },
            {
              id: 'roiAttachments',
              name: 'roiAttachments',
              type: 'attachment',
              label: 'Anexos Financieros',
              description: 'Documentos de soporte financiero',
              required: false,
              section: 'anexos',
              order: 7,
              attachmentConfig: {
                allowedTypes: ['pdf', 'document', 'image'],
                maxSize: 10485760, // 10MB
                maxCount: 5,
                categories: [
                  'Estados Financieros',
                  'Presupuestos',
                  'Análisis de Costos',
                  'Proyecciones',
                  'Otros'
                ]
              }
            }
          ]
        },
        templateConfig: {
          layout: 'A4',
          sections: ['header', 'executive_summary', 'financial_analysis', 'roi_calculator', 'charts', 'conclusions', 'attachments']
        },
        exportConfig: {
          formats: ['pdf', 'jpg'],
          defaultFormat: 'pdf'
        }
      },
      {
        name: 'Cotización de Servicios',
        slug: 'cotizacion',
        description: 'Cotización detallada de servicios de automatización con calculadora integrada',
        phase: 'Fase 2',
        icon: 'tabler:calculator',
        color: '#06b6d4', // cyan-500
        estimatedTime: '1-2 días',
        sortOrder: 2.5,
        formSchema: {
          fields: [
            {
              id: 'quotationDate',
              name: 'quotationDate',
              type: 'date',
              label: 'Fecha de Cotización',
              required: true,
              section: 'general',
              order: 1
            },
            {
              id: 'validityPeriod',
              name: 'validityPeriod',
              type: 'number',
              label: 'Vigencia (días)',
              description: 'Días de validez de la cotización',
              required: true,
              defaultValue: 30,
              section: 'general',
              order: 2
            },
            {
              id: 'quoteCalculatorData',
              name: 'quoteCalculatorData',
              type: 'calculator',
              label: 'Configuración de Cotización',
              description: 'Datos del calculador AIM integrado',
              required: true,
              section: 'calculator',
              order: 3
            },
            {
              id: 'specialRequirements',
              name: 'specialRequirements',
              type: 'textarea',
              label: 'Requerimientos Especiales',
              description: 'Condiciones o requerimientos específicos del cliente',
              required: false,
              section: 'requirements',
              order: 4
            },
            {
              id: 'deliveryNotes',
              name: 'deliveryNotes',
              type: 'textarea',
              label: 'Notas de Entrega',
              description: 'Información sobre tiempos y condiciones de entrega',
              required: false,
              section: 'delivery',
              order: 5
            },
            {
              id: 'paymentTerms',
              name: 'paymentTerms',
              type: 'select',
              label: 'Términos de Pago',
              required: true,
              options: [
                { value: '50-50', label: '50% Anticipo - 50% Contra Entrega' },
                { value: '30-70', label: '30% Anticipo - 70% Contra Entrega' },
                { value: '100-inicio', label: '100% Al Inicio (5% descuento)' },
                { value: 'mensual', label: 'Pagos Mensuales (+10% recargo)' }
              ],
              section: 'financial',
              order: 6
            },
            {
              id: 'warranty',
              name: 'warranty',
              type: 'select',
              label: 'Garantía',
              required: true,
              options: [
                { value: '3-meses', label: '3 Meses Estándar' },
                { value: '6-meses', label: '6 Meses Extendida (+5%)' },
                { value: '12-meses', label: '12 Meses Premium (+10%)' }
              ],
              section: 'financial',
              order: 7
            },
            {
              id: 'quotationAttachments',
              name: 'quotationAttachments',
              type: 'attachment',
              label: 'Anexos de Cotización',
              description: 'Documentos complementarios a la cotización',
              required: false,
              section: 'anexos',
              order: 8,
              attachmentConfig: {
                allowedTypes: ['pdf', 'document', 'image'],
                maxSize: 15728640, // 15MB
                maxCount: 5,
                categories: [
                  'Casos de Éxito',
                  'Especificaciones Técnicas',
                  'Términos y Condiciones',
                  'Referencias',
                  'Otros'
                ]
              }
            }
          ]
        },
        templateConfig: {
          layout: 'A4',
          sections: ['header', 'client_info', 'quote_summary', 'agents_breakdown', 'pricing_detail', 'payment_terms', 'warranty_info', 'validity', 'next_steps', 'attachments'],
          includeCalculator: true,
          calculatorData: {
            showAgents: true,
            showPlans: true,
            showServices: true,
            showSummary: true,
            allowExport: true
          }
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
        color: '#14b8a6', // teal-500
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
              id: 'deliverables',
              name: 'deliverables',
              type: 'table',
              label: 'Entregables',
              description: 'Lista de entregables con fechas',
              required: true,
              section: 'deliverables',
              order: 3
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
            },
            {
              id: 'proposalAttachments',
              name: 'proposalAttachments',
              type: 'attachment',
              label: 'Anexos de Propuesta',
              description: 'Documentos complementarios a la propuesta',
              required: false,
              section: 'anexos',
              order: 7,
              attachmentConfig: {
                allowedTypes: ['pdf', 'document', 'image'],
                maxSize: 20971520, // 20MB
                maxCount: 8,
                categories: [
                  'Términos y Condiciones',
                  'Casos de Estudio',
                  'Referencias Técnicas',
                  'Certificaciones',
                  'Documentos Legales',
                  'Otros'
                ]
              }
            }
          ]
        },
        templateConfig: {
          layout: 'A4',
          sections: ['header', 'introduction', 'scope', 'solution', 'deliverables', 'timeline', 'pricing', 'terms', 'attachments']
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
        color: '#10b981', // emerald-500
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
              section: 'architecture',
              order: 1
            },
            {
              id: 'technologies',
              name: 'technologies',
              type: 'textarea',
              label: 'Tecnologías Utilizadas',
              description: 'Stack tecnológico y herramientas',
              required: true,
              section: 'technical',
              order: 2
            },
            {
              id: 'integrations',
              name: 'integrations',
              type: 'textarea',
              label: 'Integraciones',
              description: 'Sistemas y APIs a integrar',
              required: true,
              section: 'integrations',
              order: 3
            },
            {
              id: 'securityRequirements',
              name: 'securityRequirements',
              type: 'textarea',
              label: 'Requerimientos de Seguridad',
              description: 'Especificaciones de seguridad',
              section: 'security',
              order: 4
            },
            {
              id: 'technicalAttachments',
              name: 'technicalAttachments',
              type: 'attachment',
              label: 'Anexos Técnicos',
              description: 'Documentos técnicos complementarios',
              required: false,
              section: 'anexos',
              order: 5,
              attachmentConfig: {
                allowedTypes: ['pdf', 'document', 'image'],
                maxSize: 20971520, // 20MB
                maxCount: 10,
                categories: [
                  'Diagramas de Arquitectura',
                  'Especificaciones API',
                  'Documentación de Base de Datos',
                  'Manuales de Configuración',
                  'Códigos de Ejemplo',
                  'Otros'
                ]
              }
            }
          ]
        },
        templateConfig: {
          layout: 'A4',
          sections: ['header', 'overview', 'architecture', 'technical_specs', 'integrations', 'security', 'attachments']
        },
        exportConfig: {
          formats: ['pdf', 'jpg'],
          defaultFormat: 'pdf'
        }
      },
      {
        name: 'Reportes de Testing',
        slug: 'testing',
        description: 'Resultados de pruebas QA y validación UAT',
        phase: 'Fase 5',
        icon: 'tabler:bug',
        color: '#14b8a6', // teal-500
        estimatedTime: '1-2 días',
        sortOrder: 5,
        formSchema: {
          fields: [
            {
              id: 'testingScope',
              name: 'testingScope',
              type: 'textarea',
              label: 'Alcance de Pruebas',
              description: 'Qué se probó y con qué criterios',
              required: true,
              section: 'scope',
              order: 1
            },
            {
              id: 'testingMethodology',
              name: 'testingMethodology',
              type: 'select',
              label: 'Metodología de Testing',
              description: 'Metodología utilizada para las pruebas',
              required: true,
              section: 'scope',
              order: 2,
              options: [
                { value: 'manual', label: 'Testing Manual' },
                { value: 'automated', label: 'Testing Automatizado' },
                { value: 'hybrid', label: 'Testing Híbrido' },
                { value: 'uat', label: 'User Acceptance Testing (UAT)' },
                { value: 'integration', label: 'Testing de Integración' }
              ]
            },
            {
              id: 'testEnvironment',
              name: 'testEnvironment',
              type: 'text',
              label: 'Ambiente de Pruebas',
              description: 'Descripción del ambiente donde se realizaron las pruebas',
              required: true,
              section: 'environment',
              order: 3
            },
            {
              id: 'testPeriod',
              name: 'testPeriod',
              type: 'text',
              label: 'Período de Pruebas',
              description: 'Fechas de inicio y fin de las pruebas',
              required: true,
              section: 'environment',
              order: 4
            },
            {
              id: 'testResults',
              name: 'testResults',
              type: 'textarea',
              label: 'Resultados de Pruebas',
              description: 'Descripción detallada de los resultados obtenidos',
              required: true,
              section: 'results',
              order: 5
            },
            {
              id: 'testCasesTotal',
              name: 'testCasesTotal',
              type: 'number',
              label: 'Total de Casos de Prueba',
              required: true,
              section: 'metrics',
              order: 6
            },
            {
              id: 'testCasesPassed',
              name: 'testCasesPassed',
              type: 'number',
              label: 'Casos de Prueba Exitosos',
              required: true,
              section: 'metrics',
              order: 7
            },
            {
              id: 'testCasesFailed',
              name: 'testCasesFailed',
              type: 'number',
              label: 'Casos de Prueba Fallidos',
              required: true,
              section: 'metrics',
              order: 8
            },
            {
              id: 'bugsFound',
              name: 'bugsFound',
              type: 'number',
              label: 'Bugs Encontrados',
              required: true,
              section: 'metrics',
              order: 9
            },
            {
              id: 'bugsFixed',
              name: 'bugsFixed',
              type: 'number',
              label: 'Bugs Corregidos',
              required: true,
              section: 'metrics',
              order: 10
            },
            {
              id: 'criticalIssues',
              name: 'criticalIssues',
              type: 'textarea',
              label: 'Issues Críticos Encontrados',
              description: 'Descripción de problemas críticos y su resolución',
              section: 'issues',
              order: 11
            },
            {
              id: 'performanceMetrics',
              name: 'performanceMetrics',
              type: 'textarea',
              label: 'Métricas de Rendimiento',
              description: 'Resultados de pruebas de performance',
              section: 'performance',
              order: 12
            },
            {
              id: 'loadTestResults',
              name: 'loadTestResults',
              type: 'textarea',
              label: 'Resultados de Pruebas de Carga',
              description: 'Resultados de stress testing y load testing',
              section: 'performance',
              order: 13
            },
            {
              id: 'securityTestResults',
              name: 'securityTestResults',
              type: 'textarea',
              label: 'Resultados de Pruebas de Seguridad',
              description: 'Evaluación de vulnerabilidades y seguridad',
              section: 'security',
              order: 14
            },
            {
              id: 'recommendations',
              name: 'recommendations',
              type: 'textarea',
              label: 'Recomendaciones',
              description: 'Recomendaciones para mejoras futuras',
              required: true,
              section: 'recommendations',
              order: 15
            },
            {
              id: 'approvalStatus',
              name: 'approvalStatus',
              type: 'select',
              label: 'Estado de Aprobación',
              required: true,
              section: 'approval',
              order: 16,
              options: [
                { value: 'approved', label: 'Aprobado' },
                { value: 'approved_with_conditions', label: 'Aprobado con Condiciones' },
                { value: 'rejected', label: 'Rechazado' },
                { value: 'pending', label: 'Pendiente de Revisión' }
              ]
            },
            {
              id: 'qaAttachments',
              name: 'qaAttachments',
              type: 'attachment',
              label: 'Anexos - Pruebas QA',
              description: 'Evidencias de pruebas de Quality Assurance',
              required: false,
              section: 'anexos',
              order: 17,
              attachmentConfig: {
                allowedTypes: ['pdf', 'image', 'document', 'video'],
                maxSize: 52428800, // 50MB
                maxCount: 15,
                categories: [
                  'Casos de Prueba',
                  'Screenshots de Errores',
                  'Reportes de Bugs',
                  'Métricas de Performance',
                  'Videos de Pruebas',
                  'Logs de Sistema',
                  'Otros'
                ]
              }
            },
            {
              id: 'uatAttachments',
              name: 'uatAttachments',
              type: 'attachment',
              label: 'Anexos - Validación UAT',
              description: 'Evidencias de User Acceptance Testing',
              required: false,
              section: 'anexos',
              order: 18,
              attachmentConfig: {
                allowedTypes: ['pdf', 'image', 'document', 'video'],
                maxSize: 52428800, // 50MB
                maxCount: 15,
                categories: [
                  'Formularios de Aceptación',
                  'Feedback de Usuarios',
                  'Casos de Uso Validados',
                  'Screenshots de Funcionalidad',
                  'Videos de Demostración',
                  'Reportes de Usabilidad',
                  'Otros'
                ]
              }
            }
          ]
        },
        templateConfig: {
          layout: 'A4',
          sections: ['header', 'scope', 'environment', 'results', 'metrics', 'issues', 'performance', 'security', 'recommendations', 'approval', 'qa_attachments', 'uat_attachments']
        },
        exportConfig: {
          formats: ['pdf', 'jpg'],
          defaultFormat: 'pdf'
        }
      },
      {
        name: 'Manual de Usuario',
        slug: 'manual-usuario',
        description: 'Guía paso a paso para operadores finales',
        phase: 'Fase 7',
        icon: 'tabler:book',
        color: '#10b981', // emerald-500
        estimatedTime: '1-2 días',
        sortOrder: 6,
        formSchema: {
          fields: [
            {
              id: 'targetAudience',
              name: 'targetAudience',
              type: 'text',
              label: 'Audiencia Objetivo',
              description: 'A quién está dirigido el manual',
              required: true,
              section: 'overview',
              order: 1
            },
            {
              id: 'systemOverview',
              name: 'systemOverview',
              type: 'textarea',
              label: 'Resumen del Sistema',
              description: 'Introducción al sistema para usuarios',
              required: true,
              section: 'introduction',
              order: 2
            },
            {
              id: 'systemPurpose',
              name: 'systemPurpose',
              type: 'textarea',
              label: 'Propósito del Sistema',
              description: 'Para qué sirve el sistema y sus beneficios',
              required: true,
              section: 'introduction',
              order: 3
            },
            {
              id: 'minimumRequirements',
              name: 'minimumRequirements',
              type: 'textarea',
              label: 'Requerimientos Mínimos',
              description: 'Hardware/software mínimo para usar el sistema',
              required: true,
              section: 'requirements',
              order: 4
            },
            {
              id: 'loginProcedure',
              name: 'loginProcedure',
              type: 'textarea',
              label: 'Procedimiento de Acceso',
              description: 'Cómo acceder al sistema paso a paso',
              required: true,
              section: 'access',
              order: 5
            },
            {
              id: 'interfaceOverview',
              name: 'interfaceOverview',
              type: 'textarea',
              label: 'Descripción de la Interfaz',
              description: 'Explicación de los elementos principales de la interfaz',
              required: true,
              section: 'interface',
              order: 6
            },
            {
              id: 'navigationGuide',
              name: 'navigationGuide',
              type: 'textarea',
              label: 'Guía de Navegación',
              description: 'Cómo navegar por el sistema',
              required: true,
              section: 'navigation',
              order: 7
            },
            {
              id: 'mainFunctions',
              name: 'mainFunctions',
              type: 'textarea',
              label: 'Funciones Principales',
              description: 'Descripción detallada de las funciones más utilizadas',
              required: true,
              section: 'functions',
              order: 8
            },
            {
              id: 'stepByStepProcedures',
              name: 'stepByStepProcedures',
              type: 'textarea',
              label: 'Procedimientos Paso a Paso',
              description: 'Procedimientos detallados para tareas comunes',
              required: true,
              section: 'procedures',
              order: 9
            },
            {
              id: 'shortcuts',
              name: 'shortcuts',
              type: 'textarea',
              label: 'Atajos y Tips',
              description: 'Atajos de teclado y consejos útiles',
              section: 'tips',
              order: 10
            },
            {
              id: 'commonIssues',
              name: 'commonIssues',
              type: 'textarea',
              label: 'Problemas Comunes',
              description: 'Soluciones a problemas frecuentes',
              section: 'troubleshooting',
              order: 11
            },
            {
              id: 'faqSection',
              name: 'faqSection',
              type: 'textarea',
              label: 'Preguntas Frecuentes',
              description: 'FAQ con respuestas detalladas',
              section: 'faq',
              order: 12
            },
            {
              id: 'supportContacts',
              name: 'supportContacts',
              type: 'textarea',
              label: 'Contactos de Soporte',
              description: 'Información de contacto para soporte técnico',
              section: 'support',
              order: 13
            },
            {
              id: 'safetyInstructions',
              name: 'safetyInstructions',
              type: 'textarea',
              label: 'Instrucciones de Seguridad',
              description: 'Medidas de seguridad importantes',
              section: 'safety',
              order: 14
            },
            {
              id: 'userManualAttachments',
              name: 'userManualAttachments',
              type: 'attachment',
              label: 'Anexos del Manual de Usuario',
              description: 'Recursos adicionales para usuarios',
              required: false,
              section: 'anexos',
              order: 15,
              attachmentConfig: {
                allowedTypes: ['pdf', 'image', 'video', 'document'],
                maxSize: 104857600, // 100MB
                maxCount: 20,
                categories: [
                  'Guías Visuales',
                  'Videos Tutoriales',
                  'Screenshots de Funciones',
                  'Plantillas de Uso',
                  'Casos de Uso Ejemplos',
                  'Formularios de Referencia',
                  'Otros'
                ]
              }
            }
          ]
        },
        templateConfig: {
          layout: 'A4',
          sections: ['header', 'introduction', 'requirements', 'access', 'interface', 'navigation', 'functions', 'procedures', 'tips', 'troubleshooting', 'faq', 'support', 'safety', 'attachments']
        },
        exportConfig: {
          formats: ['pdf', 'jpg'],
          defaultFormat: 'pdf'
        }
      },
      {
        name: 'Manual Técnico',
        slug: 'manual-tecnico',
        description: 'Documentación técnica para administradores TI',
        phase: 'Fase 7',
        icon: 'tabler:tool',
        color: '#14b8a6', // teal-500
        estimatedTime: '1-2 días',
        sortOrder: 7,
        formSchema: {
          fields: [
            {
              id: 'systemRequirements',
              name: 'systemRequirements',
              type: 'textarea',
              label: 'Requerimientos del Sistema',
              description: 'Hardware y software necesarios',
              required: true,
              section: 'requirements',
              order: 1
            },
            {
              id: 'softwareDependencies',
              name: 'softwareDependencies',
              type: 'textarea',
              label: 'Dependencias de Software',
              description: 'Librerías, frameworks y servicios requeridos',
              required: true,
              section: 'requirements',
              order: 2
            },
            {
              id: 'networkRequirements',
              name: 'networkRequirements',
              type: 'textarea',
              label: 'Requerimientos de Red',
              description: 'Puertos, protocolos y configuraciones de red',
              required: true,
              section: 'requirements',
              order: 3
            },
            {
              id: 'installationSteps',
              name: 'installationSteps',
              type: 'textarea',
              label: 'Pasos de Instalación',
              description: 'Procedimiento detallado de instalación',
              required: true,
              section: 'installation',
              order: 4
            },
            {
              id: 'preInstallationChecks',
              name: 'preInstallationChecks',
              type: 'textarea',
              label: 'Verificaciones Pre-Instalación',
              description: 'Checks que deben realizarse antes de instalar',
              required: true,
              section: 'installation',
              order: 5
            },
            {
              id: 'postInstallationChecks',
              name: 'postInstallationChecks',
              type: 'textarea',
              label: 'Verificaciones Post-Instalación',
              description: 'Validaciones después de la instalación',
              required: true,
              section: 'installation',
              order: 6
            },
            {
              id: 'configurationGuide',
              name: 'configurationGuide',
              type: 'textarea',
              label: 'Guía de Configuración',
              description: 'Configuraciones iniciales y avanzadas',
              required: true,
              section: 'configuration',
              order: 7
            },
            {
              id: 'databaseConfiguration',
              name: 'databaseConfiguration',
              type: 'textarea',
              label: 'Configuración de Base de Datos',
              description: 'Setup y configuración de la base de datos',
              required: true,
              section: 'configuration',
              order: 8
            },
            {
              id: 'securityConfiguration',
              name: 'securityConfiguration',
              type: 'textarea',
              label: 'Configuración de Seguridad',
              description: 'Configuraciones de seguridad y permisos',
              required: true,
              section: 'security',
              order: 9
            },
            {
              id: 'maintenanceProcedures',
              name: 'maintenanceProcedures',
              type: 'textarea',
              label: 'Procedimientos de Mantenimiento',
              description: 'Tareas de mantenimiento regulares',
              required: true,
              section: 'maintenance',
              order: 10
            },
            {
              id: 'monitoringSetup',
              name: 'monitoringSetup',
              type: 'textarea',
              label: 'Configuración de Monitoreo',
              description: 'Setup de logs, métricas y alertas',
              section: 'monitoring',
              order: 11
            },
            {
              id: 'backupProcedures',
              name: 'backupProcedures',
              type: 'textarea',
              label: 'Procedimientos de Respaldo',
              description: 'Cómo realizar y restaurar respaldos',
              section: 'backup',
              order: 12
            },
            {
              id: 'disasterRecovery',
              name: 'disasterRecovery',
              type: 'textarea',
              label: 'Plan de Recuperación ante Desastres',
              description: 'Procedimientos para recuperación del sistema',
              section: 'backup',
              order: 13
            },
            {
              id: 'performanceTuning',
              name: 'performanceTuning',
              type: 'textarea',
              label: 'Optimización de Rendimiento',
              description: 'Configuraciones para optimizar performance',
              section: 'performance',
              order: 14
            },
            {
              id: 'apiDocumentation',
              name: 'apiDocumentation',
              type: 'textarea',
              label: 'Documentación de APIs',
              description: 'Endpoints, parámetros y ejemplos de uso',
              section: 'api',
              order: 15
            },
            {
              id: 'integrationGuide',
              name: 'integrationGuide',
              type: 'textarea',
              label: 'Guía de Integración',
              description: 'Cómo integrar con otros sistemas',
              section: 'integration',
              order: 16
            },
            {
              id: 'technicalManualAttachments',
              name: 'technicalManualAttachments',
              type: 'attachment',
              label: 'Anexos del Manual Técnico',
              description: 'Recursos técnicos adicionales',
              required: false,
              section: 'anexos',
              order: 17,
              attachmentConfig: {
                allowedTypes: ['pdf', 'document', 'image'],
                maxSize: 104857600, // 100MB
                maxCount: 25,
                categories: [
                  'Scripts de Instalación',
                  'Archivos de Configuración',
                  'Documentación API',
                  'Esquemas de Base de Datos',
                  'Diagramas de Red',
                  'Códigos de Ejemplo',
                  'Logs de Sistema',
                  'Otros'
                ]
              }
            }
          ]
        },
        templateConfig: {
          layout: 'A4',
          sections: ['header', 'requirements', 'installation', 'configuration', 'security', 'maintenance', 'monitoring', 'backup', 'performance', 'api', 'integration', 'attachments']
        },
        exportConfig: {
          formats: ['pdf', 'jpg'],
          defaultFormat: 'pdf'
        }
      },
      {
        name: 'Guía de Troubleshooting',
        slug: 'troubleshooting',
        description: 'Solución de problemas comunes y escalamiento',
        phase: 'Fase 7',
        icon: 'tabler:alert-circle',
        color: '#10b981', // emerald-500
        estimatedTime: '1 día',
        sortOrder: 8,
        formSchema: {
          fields: [
            {
              id: 'scopeOfTroubleshooting',
              name: 'scopeOfTroubleshooting',
              type: 'textarea',
              label: 'Alcance de la Guía',
              description: 'Qué problemas cubre esta guía de troubleshooting',
              required: true,
              section: 'scope',
              order: 1
            },
            {
              id: 'commonProblems',
              name: 'commonProblems',
              type: 'textarea',
              label: 'Problemas Comunes',
              description: 'Lista de problemas frecuentes y sus soluciones',
              required: true,
              section: 'problems',
              order: 2
            },
            {
              id: 'errorCodes',
              name: 'errorCodes',
              type: 'textarea',
              label: 'Códigos de Error',
              description: 'Catálogo de códigos de error y su significado',
              required: true,
              section: 'errors',
              order: 3
            },
            {
              id: 'diagnosticSteps',
              name: 'diagnosticSteps',
              type: 'textarea',
              label: 'Pasos de Diagnóstico',
              description: 'Metodología sistemática para diagnosticar problemas',
              required: true,
              section: 'diagnostic',
              order: 4
            },
            {
              id: 'diagnosticTools',
              name: 'diagnosticTools',
              type: 'textarea',
              label: 'Herramientas de Diagnóstico',
              description: 'Herramientas y comandos útiles para troubleshooting',
              required: true,
              section: 'diagnostic',
              order: 5
            },
            {
              id: 'systemHealth',
              name: 'systemHealth',
              type: 'textarea',
              label: 'Verificación de Salud del Sistema',
              description: 'Cómo verificar que el sistema está funcionando correctamente',
              required: true,
              section: 'health',
              order: 6
            },
            {
              id: 'performanceIssues',
              name: 'performanceIssues',
              type: 'textarea',
              label: 'Problemas de Rendimiento',
              description: 'Identificación y solución de problemas de performance',
              section: 'performance',
              order: 7
            },
            {
              id: 'connectivityIssues',
              name: 'connectivityIssues',
              type: 'textarea',
              label: 'Problemas de Conectividad',
              description: 'Troubleshooting de problemas de red y conectividad',
              section: 'connectivity',
              order: 8
            },
            {
              id: 'escalationProcedure',
              name: 'escalationProcedure',
              type: 'textarea',
              label: 'Procedimiento de Escalamiento',
              description: 'Cuándo y cómo escalar problemas',
              required: true,
              section: 'escalation',
              order: 9
            },
            {
              id: 'escalationCriteria',
              name: 'escalationCriteria',
              type: 'textarea',
              label: 'Criterios de Escalamiento',
              description: 'Qué problemas requieren escalamiento inmediato',
              required: true,
              section: 'escalation',
              order: 10
            },
            {
              id: 'contactInformation',
              name: 'contactInformation',
              type: 'textarea',
              label: 'Información de Contacto',
              description: 'Contactos de soporte técnico por nivel',
              required: true,
              section: 'contacts',
              order: 11
            },
            {
              id: 'supportHours',
              name: 'supportHours',
              type: 'text',
              label: 'Horarios de Soporte',
              description: 'Horarios de disponibilidad del soporte técnico',
              required: true,
              section: 'contacts',
              order: 12
            },
            {
              id: 'logLocations',
              name: 'logLocations',
              type: 'textarea',
              label: 'Ubicación de Logs',
              description: 'Dónde encontrar archivos de log del sistema',
              section: 'logging',
              order: 13
            },
            {
              id: 'logAnalysis',
              name: 'logAnalysis',
              type: 'textarea',
              label: 'Análisis de Logs',
              description: 'Cómo interpretar y analizar los logs del sistema',
              section: 'logging',
              order: 14
            },
            {
              id: 'emergencyProcedures',
              name: 'emergencyProcedures',
              type: 'textarea',
              label: 'Procedimientos de Emergencia',
              description: 'Qué hacer en caso de emergencias críticas',
              required: true,
              section: 'emergency',
              order: 15
            },
            {
              id: 'knownLimitations',
              name: 'knownLimitations',
              type: 'textarea',
              label: 'Limitaciones Conocidas',
              description: 'Limitaciones del sistema y workarounds',
              section: 'limitations',
              order: 16
            },
            {
              id: 'troubleshootingAttachments',
              name: 'troubleshootingAttachments',
              type: 'attachment',
              label: 'Anexos de Troubleshooting',
              description: 'Recursos adicionales para resolución de problemas',
              required: false,
              section: 'anexos',
              order: 17,
              attachmentConfig: {
                allowedTypes: ['pdf', 'image', 'document'],
                maxSize: 52428800, // 50MB
                maxCount: 15,
                categories: [
                  'Scripts de Diagnóstico',
                  'Screenshots de Errores',
                  'Logs de Sistema',
                  'Herramientas de Troubleshooting',
                  'Procedimientos de Escalamiento',
                  'Contactos de Emergencia',
                  'Otros'
                ]
              }
            }
          ]
        },
        templateConfig: {
          layout: 'A4',
          sections: ['header', 'scope', 'problems', 'errors', 'diagnostic', 'health', 'performance', 'connectivity', 'escalation', 'contacts', 'logging', 'emergency', 'limitations', 'attachments']
        },
        exportConfig: {
          formats: ['pdf', 'jpg'],
          defaultFormat: 'pdf'
        }
      }
    ];

    // Crear o actualizar tipos de documentos
    for (const docType of documentTypes) {
      await prisma.documentType.upsert({
        where: { slug: docType.slug },
        update: {
          ...docType,
          updatedAt: new Date()
        },
        create: docType
      });

      logger.info(`Document type "${docType.name}" seeded successfully`);
    }

    logger.info(`Successfully seeded ${documentTypes.length} document types`);
  } catch (error) {
    logger.error('Error seeding document types:', { error });
    throw error;
  }
}

// Si el archivo es ejecutado directamente
if (require.main === module) {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();

  seedDocumentTypes(prisma)
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
} 