import { PrismaClient } from '@prisma/client';
import { Logger } from '../../shared/utils/logger';

const logger = Logger.getInstance();

// Datos de tipos de conexión basados en el frontend
const connectionTypesData = [
  {
    name: 'API',
    slug: 'api',
    title: 'Integración vía API',
    description: 'Conexión directa con sistemas mediante endpoints REST/SOAP',
    icon: 'tabler:code',
    advantages: [
      'Más estable',
      'Mejor rendimiento',
      'Menos mantenimiento',
      'Datos estructurados'
    ],
    useCases: [
      'Sincronización de facturas',
      'Actualización de inventario',
      'Integración CRM-ERP'
    ],
    examples: [
      'ERP SAP',
      'CRM Salesforce',
      'Sistemas bancarios',
      'APIs de e-commerce'
    ],
    sortOrder: 1
  },
  {
    name: 'RPA',
    slug: 'rpa',
    title: 'Automatización RPA',
    description: 'Emulación de interacciones humanas en interfaces gráficas',
    icon: 'tabler:robot',
    advantages: [
      'No requiere API',
      'Imita proceso humano',
      'Flexible',
      'Rápida implementación'
    ],
    useCases: [
      'Descarga de reportes',
      'Captura de datos web',
      'Procesos administrativos'
    ],
    examples: [
      'Aplicaciones legacy',
      'Sistemas sin API',
      'Procesos manuales complejos',
      'Múltiples sistemas'
    ],
    sortOrder: 2
  },
  {
    name: 'Webscraping',
    slug: 'webscraping',
    title: 'Extracción Web',
    description: 'Extracción automatizada de datos de sitios web',
    icon: 'tabler:world',
    advantages: [
      'Acceso a datos públicos',
      'Monitoreo continuo',
      'Bajo costo',
      'Escalable'
    ],
    useCases: [
      'Monitoreo de precios',
      'Status de envíos',
      'Noticias del sector'
    ],
    examples: [
      'Portales de proveedores',
      'Sitios de tracking',
      'Marketplaces',
      'Fuentes de precios'
    ],
    sortOrder: 3
  },
  {
    name: 'Archivo',
    slug: 'archivo',
    title: 'Procesamiento de Archivos',
    description: 'Automatización basada en documentos y archivos',
    icon: 'tabler:file-text',
    advantages: [
      'Procesa documentos',
      'OCR integrado',
      'Validación automática',
      'Histórico completo'
    ],
    useCases: [
      'Facturas de proveedores',
      'Órdenes de compra',
      'Reportes de ventas'
    ],
    examples: [
      'PDFs de facturas',
      'Excel de inventario',
      'CSVs de ventas',
      'Emails con adjuntos'
    ],
    sortOrder: 4
  },
  {
    name: 'Base de Datos',
    slug: 'base-de-datos',
    title: 'Integración BD',
    description: 'Conexión directa con bases de datos y sistemas internos',
    icon: 'tabler:database',
    advantages: [
      'Acceso directo',
      'Consultas complejas',
      'Mejor rendimiento',
      'Control total'
    ],
    useCases: [
      'Reportes automáticos',
      'Sincronización de datos',
      'ETL personalizado'
    ],
    examples: [
      'SQL Server',
      'Oracle',
      'MySQL',
      'PostgreSQL',
      'MongoDB'
    ],
    sortOrder: 5
  },
  {
    name: 'IoT/Sensores',
    slug: 'iot-sensores',
    title: 'Conectividad IoT',
    description: 'Integración con dispositivos IoT y sensores industriales',
    icon: 'tabler:chart-line',
    advantages: [
      'Tiempo real',
      'Protocolos industriales',
      'Análisis predictivo',
      'Alertas inteligentes'
    ],
    useCases: [
      'Monitoreo OEE',
      'Mantenimiento predictivo',
      'Control de calidad'
    ],
    examples: [
      'SCADA',
      'PLCs',
      'Sensores de temperatura',
      'Contadores inteligentes'
    ],
    sortOrder: 6
  }
];

// Datos de categorías de agentes
const agentCategoriesData = [
  {
    name: 'Finanzas',
    slug: 'finanzas',
    description: 'Agentes para automatización de procesos financieros',
    icon: 'tabler:coins',
    color: '#10b981',
    sortOrder: 1
  },
  {
    name: 'Cadena de Suministro',
    slug: 'cadena-de-suministro',
    description: 'Agentes para gestión de logística y suministros',
    icon: 'tabler:truck',
    color: '#3b82f6',
    sortOrder: 2
  },
  {
    name: 'Producción',
    slug: 'produccion',
    description: 'Agentes para automatización de procesos productivos',
    icon: 'tabler:settings',
    color: '#f59e0b',
    sortOrder: 3
  },
  {
    name: 'Soporte',
    slug: 'soporte',
    description: 'Agentes para atención al cliente y soporte técnico',
    icon: 'tabler:headphones',
    color: '#8b5cf6',
    sortOrder: 4
  }
];

// Datos de agentes basados en el frontend
const agentsData = [
  {
    name: 'Agente de Cuentas por Pagar',
    slug: 'agente-cuentas-por-pagar',
    title: 'Agente de Cuentas por Pagar (AP-301)',
    category: 'Finanzas',
    icon: 'tabler:file-invoice',
    shortDescription: 'Automatiza la recepción, validación e ingreso de facturas de proveedores en tu ERP.',
    challenge: 'El equipo de Cuentas por Pagar recibe cientos de facturas en múltiples formatos (PDF, email). Compararlas manualmente con las órdenes de compra e ingresarlas en el ERP es un proceso lento, repetitivo y propenso a errores que pueden costar dinero y dañar la relación con proveedores.',
    solution: 'El Agente AP-301 monitorea una bandeja de entrada designada. Al recibir una factura, usa OCR e IA para extraer los datos, los cruza contra la OC en el ERP, y si todo coincide, la ingresa para pago. Si hay discrepancias, notifica al humano responsable con un resumen claro del problema.',
    features: [
      'Extracción de datos de PDF/XML',
      'Validación contra Órdenes de Compra',
      'Integración con SAP, Oracle, etc.',
      'Generación de reportes de excepción'
    ],
    complexity: 'medium',
    estimatedTime: '2-3 días',
    tags: ['finanzas', 'erp', 'facturas', 'ocr'],
    isFeatured: true,
    n8nWorkflow: {
      nodes: [
        {
          id: 'email-trigger',
          type: 'n8n-nodes-base.emailReadImap',
          name: 'Monitor Email',
          parameters: {
            host: 'imap.gmail.com',
            port: 993,
            secure: true,
            mailbox: 'INBOX',
            markAsRead: true
          }
        },
        {
          id: 'pdf-extract',
          type: 'n8n-nodes-base.httpRequest',
          name: 'Extract PDF Data',
          parameters: {
            url: 'https://api.ocr.space/parse/image',
            method: 'POST',
            headers: {
              'apikey': '{{ $env.OCR_API_KEY }}'
            }
          }
        },
        {
          id: 'erp-validation',
          type: 'n8n-nodes-base.httpRequest',
          name: 'Validate Against ERP',
          parameters: {
            url: '{{ $env.ERP_API_URL }}/purchase-orders',
            method: 'GET',
            authentication: 'headerAuth'
          }
        },
        {
          id: 'process-invoice',
          type: 'n8n-nodes-base.function',
          name: 'Process Invoice',
          parameters: {
            functionCode: `
              const invoiceData = items[0].json;
              const purchaseOrder = items[1].json;
              
              // Validar datos
              if (invoiceData.amount === purchaseOrder.amount) {
                return { approved: true, action: 'process' };
              } else {
                return { approved: false, action: 'review', reason: 'Amount mismatch' };
              }
            `
          }
        }
      ]
    }
  },
  {
    name: 'Agente de Logística y Envíos',
    slug: 'agente-logistica-y-envios',
    title: 'Agente de Logística y Envíos (TRK-100)',
    category: 'Cadena de Suministro',
    icon: 'tabler:truck-delivery',
    shortDescription: 'Monitorea portales de transportistas y actualiza el estado del envío en tiempo real en tu sistema.',
    challenge: 'Mantener a los clientes informados sobre el estado de sus envíos requiere que el personal entre constantemente a múltiples portales de transportistas, copie los datos y los pegue en el sistema interno, lo cual es ineficiente y no es en tiempo real.',
    solution: 'El Agente TRK-100 inicia sesión automáticamente en los portales de DHL, FedEx, etc., busca los números de seguimiento y actualiza el estado del envío (ej. "En Tránsito", "Entregado") directamente en tu CRM o ERP, permitiendo notificaciones proactivas a los clientes.',
    features: [
      'Monitoreo 24/7 de portales web',
      'Actualización de estado en ERP/CRM',
      'Notificaciones automáticas de retraso',
      'Reportes de tiempos de entrega'
    ],
    complexity: 'medium',
    estimatedTime: '2-3 días',
    tags: ['logística', 'envíos', 'tracking', 'crm'],
    isFeatured: true,
    n8nWorkflow: {
      nodes: [
        {
          id: 'schedule-trigger',
          type: 'n8n-nodes-base.cron',
          name: 'Schedule Check',
          parameters: {
            cron: '0 */2 * * *'
          }
        },
        {
          id: 'get-tracking-numbers',
          type: 'n8n-nodes-base.httpRequest',
          name: 'Get Tracking Numbers',
          parameters: {
            url: '{{ $env.CRM_API_URL }}/shipments/pending',
            method: 'GET'
          }
        },
        {
          id: 'check-dhl-status',
          type: 'n8n-nodes-base.httpRequest',
          name: 'Check DHL Status',
          parameters: {
            url: 'https://api.dhl.com/track/shipments',
            method: 'GET',
            headers: {
              'DHL-API-Key': '{{ $env.DHL_API_KEY }}'
            }
          }
        },
        {
          id: 'update-crm',
          type: 'n8n-nodes-base.httpRequest',
          name: 'Update CRM',
          parameters: {
            url: '{{ $env.CRM_API_URL }}/shipments/update',
            method: 'PUT'
          }
        }
      ]
    }
  },
  {
    name: 'Agente de Reportes OEE',
    slug: 'agente-reportes-oee',
    title: 'Agente de Reportes OEE',
    category: 'Producción',
    icon: 'tabler:chart-bar',
    shortDescription: 'Genera dashboards de OEE automáticamente.',
    challenge: 'Los operadores y supervisores invierten horas recopilando datos de producción de múltiples máquinas y generando reportes de OEE manualmente, lo que resulta en análisis tardíos y decisiones reactivas.',
    solution: 'El Agente OEE se conecta directamente a tus máquinas y sistemas SCADA, recopila datos en tiempo real, y genera automáticamente dashboards y reportes de OEE, permitiendo identificar y resolver cuellos de botella proactivamente.',
    features: [
      'Conexión con sistemas SCADA',
      'Dashboards en tiempo real',
      'Alertas automáticas',
      'Análisis predictivo'
    ],
    complexity: 'advanced',
    estimatedTime: '3-5 días',
    tags: ['producción', 'oee', 'scada', 'reportes'],
    isFeatured: true,
    n8nWorkflow: {
      nodes: [
        {
          id: 'scada-connector',
          type: 'n8n-nodes-base.mqtt',
          name: 'SCADA Data',
          parameters: {
            protocol: 'mqtt',
            host: '{{ $env.SCADA_HOST }}',
            port: 1883,
            topic: 'production/+/data'
          }
        },
        {
          id: 'calculate-oee',
          type: 'n8n-nodes-base.function',
          name: 'Calculate OEE',
          parameters: {
            functionCode: `
              const data = items[0].json;
              const availability = data.runtime / data.plannedTime;
              const performance = data.actualOutput / data.expectedOutput;
              const quality = data.goodParts / data.totalParts;
              
              return {
                oee: availability * performance * quality,
                availability,
                performance,
                quality,
                timestamp: new Date().toISOString()
              };
            `
          }
        },
        {
          id: 'save-to-database',
          type: 'n8n-nodes-base.postgres',
          name: 'Save to Database',
          parameters: {
            host: '{{ $env.DB_HOST }}',
            database: '{{ $env.DB_NAME }}',
            user: '{{ $env.DB_USER }}',
            password: '{{ $env.DB_PASSWORD }}'
          }
        }
      ]
    }
  },
  {
    name: 'Asistente de Soporte al Cliente',
    slug: 'asistente-soporte-cliente',
    title: 'Asistente de Soporte al Cliente',
    category: 'Soporte',
    icon: 'tabler:message-chatbot',
    shortDescription: 'Responde preguntas frecuentes y escala leads.',
    challenge: 'El equipo de soporte dedica gran parte de su tiempo respondiendo preguntas básicas y repetitivas, lo que retrasa la atención de casos más complejos y reduce la satisfacción del cliente.',
    solution: 'Nuestro Asistente Virtual utiliza procesamiento de lenguaje natural para entender y responder preguntas frecuentes, gestionar solicitudes básicas y escalar casos complejos al equipo humano adecuado.',
    features: [
      'Respuestas 24/7',
      'Integración con WhatsApp/Chat',
      'Escalamiento inteligente',
      'Base de conocimiento adaptativa'
    ],
    complexity: 'medium',
    estimatedTime: '2-3 días',
    tags: ['soporte', 'chatbot', 'nlp', 'whatsapp'],
    isFeatured: false,
    n8nWorkflow: {
      nodes: [
        {
          id: 'webhook-trigger',
          type: 'n8n-nodes-base.webhook',
          name: 'Webhook',
          parameters: {
            httpMethod: 'POST',
            path: 'whatsapp-webhook'
          }
        },
        {
          id: 'nlp-processing',
          type: 'n8n-nodes-base.httpRequest',
          name: 'NLP Processing',
          parameters: {
            url: 'https://api.openai.com/v1/chat/completions',
            method: 'POST',
            headers: {
              'Authorization': 'Bearer {{ $env.OPENAI_API_KEY }}',
              'Content-Type': 'application/json'
            }
          }
        },
        {
          id: 'send-response',
          type: 'n8n-nodes-base.httpRequest',
          name: 'Send WhatsApp Response',
          parameters: {
            url: 'https://api.whatsapp.com/send',
            method: 'POST'
          }
        }
      ]
    }
  },
  {
    name: 'Agente de Conciliación Bancaria',
    slug: 'agente-conciliacion-bancaria',
    title: 'Agente de Conciliación Bancaria',
    category: 'Finanzas',
    icon: 'tabler:building-bank',
    shortDescription: 'Cruza estados de cuenta con tus registros.',
    challenge: 'La conciliación bancaria manual es un proceso tedioso que consume horas valiosas del equipo contable y está sujeto a errores humanos que pueden resultar en discrepancias costosas.',
    solution: 'El Agente de Conciliación descarga automáticamente los estados de cuenta, los compara con los registros contables, identifica y categoriza discrepancias, y genera reportes detallados para revisión.',
    features: [
      'Descarga automática de estados de cuenta',
      'Comparación con registros contables',
      'Identificación de discrepancias',
      'Reportes detallados'
    ],
    complexity: 'medium',
    estimatedTime: '2-3 días',
    tags: ['finanzas', 'conciliación', 'bancos', 'contabilidad'],
    isFeatured: false,
    n8nWorkflow: {
      nodes: [
        {
          id: 'schedule-trigger',
          type: 'n8n-nodes-base.cron',
          name: 'Daily Schedule',
          parameters: {
            cron: '0 8 * * *'
          }
        },
        {
          id: 'download-statements',
          type: 'n8n-nodes-base.httpRequest',
          name: 'Download Bank Statements',
          parameters: {
            url: '{{ $env.BANK_API_URL }}/statements',
            method: 'GET'
          }
        },
        {
          id: 'get-accounting-records',
          type: 'n8n-nodes-base.postgres',
          name: 'Get Accounting Records',
          parameters: {
            operation: 'executeQuery',
            query: 'SELECT * FROM transactions WHERE date >= CURRENT_DATE - INTERVAL 1 DAY'
          }
        },
        {
          id: 'reconcile-data',
          type: 'n8n-nodes-base.function',
          name: 'Reconcile Data',
          parameters: {
            functionCode: `
              const statements = items[0].json;
              const records = items[1].json;
              
              // Lógica de conciliación
              const discrepancies = [];
              
              statements.forEach(statement => {
                const matching = records.find(r => r.amount === statement.amount && r.date === statement.date);
                if (!matching) {
                  discrepancies.push({
                    type: 'missing_record',
                    statement,
                    severity: 'medium'
                  });
                }
              });
              
              return { discrepancies, total: discrepancies.length };
            `
          }
        }
      ]
    }
  }
];

export async function seedGalleryData(prisma: PrismaClient) {
  try {
    logger.info('🌱 Iniciando seed de datos de la galería...');

    // 1. Crear tipos de conexión
    logger.info('📡 Creando tipos de conexión...');
    for (const connectionType of connectionTypesData) {
      await prisma.connectionType.upsert({
        where: { slug: connectionType.slug },
        update: connectionType,
        create: connectionType
      });
    }

    // 2. Crear categorías de agentes
    logger.info('📂 Creando categorías de agentes...');
    for (const category of agentCategoriesData) {
      await prisma.agentCategory.upsert({
        where: { slug: category.slug },
        update: category,
        create: category
      });
    }

    // 3. Crear plantillas de conexión para cada tipo
    logger.info('📄 Creando plantillas de conexión...');
    for (const connectionType of connectionTypesData) {
      const dbConnectionType = await prisma.connectionType.findUnique({
        where: { slug: connectionType.slug }
      });

      if (dbConnectionType) {
        await prisma.connectionTemplate.upsert({
          where: { slug: `${connectionType.slug}-template-basic` },
          update: {
            name: `Plantilla ${connectionType.title} Básica`,
            description: `Plantilla básica para ${connectionType.description.toLowerCase()}`,
            workflowNodes: getWorkflowNodes(connectionType.slug),
            nodeDescription: getNodeDescription(connectionType.slug),
            recommendation: getRecommendation(connectionType.slug),
            n8nWorkflow: generateBasicWorkflow(connectionType.slug)
          },
          create: {
            connectionTypeId: dbConnectionType.id,
            name: `Plantilla ${connectionType.title} Básica`,
            slug: `${connectionType.slug}-template-basic`,
            description: `Plantilla básica para ${connectionType.description.toLowerCase()}`,
            workflowNodes: getWorkflowNodes(connectionType.slug),
            nodeDescription: getNodeDescription(connectionType.slug),
            recommendation: getRecommendation(connectionType.slug),
            n8nWorkflow: generateBasicWorkflow(connectionType.slug)
          }
        });
      }
    }

    // 4. Crear agentes
    logger.info('🤖 Creando agentes...');
    for (const agent of agentsData) {
      const category = await prisma.agentCategory.findUnique({
        where: { slug: agent.category.toLowerCase().replace(/\s+/g, '-') }
      });

      if (category) {
        await prisma.agent.upsert({
          where: { slug: agent.slug },
          update: {
            name: agent.name,
            title: agent.title,
            shortDescription: agent.shortDescription,
            challenge: agent.challenge,
            solution: agent.solution,
            features: agent.features,
            icon: agent.icon,
            complexity: agent.complexity as any,
            estimatedTime: agent.estimatedTime,
            tags: agent.tags,
            isFeatured: agent.isFeatured,
            n8nWorkflow: agent.n8nWorkflow
          },
          create: {
            categoryId: category.id,
            name: agent.name,
            slug: agent.slug,
            title: agent.title,
            shortDescription: agent.shortDescription,
            challenge: agent.challenge,
            solution: agent.solution,
            features: agent.features,
            icon: agent.icon,
            complexity: agent.complexity as any,
            estimatedTime: agent.estimatedTime,
            tags: agent.tags,
            isFeatured: agent.isFeatured,
            n8nWorkflow: agent.n8nWorkflow
          }
        });
      }
    }

    logger.info('✅ Seed de datos de la galería completado exitosamente');
  } catch (error) {
    logger.error('❌ Error en seed de datos de la galería:', { 
      error: error instanceof Error ? error.message : String(error) 
    });
    throw error;
  }
}

// Funciones auxiliares para generar plantillas
function getWorkflowNodes(connectionType: string): string[] {
  const nodeMap: Record<string, string[]> = {
    'api': ['HTTP Request', 'Function', 'Set', 'IF', 'Database'],
    'rpa': ['Screenshot', 'Mouse Click', 'Keyboard', 'Image Recognition', 'Loop'],
    'webscraping': ['HTTP Request', 'HTML Extract', 'Loop Over Items', 'Wait', 'Database'],
    'archivo': ['Watch Folder', 'PDF Extract', 'OCR', 'Excel Parser', 'Email'],
    'base-de-datos': ['Database Query', 'Transform', 'Aggregate', 'Schedule', 'Notification'],
    'iot-sensores': ['MQTT', 'ModBus', 'OPC-UA', 'Time Series', 'Alert']
  };
  
  return nodeMap[connectionType] || ['Start', 'Process', 'End'];
}

function getNodeDescription(connectionType: string): string {
  const descMap: Record<string, string> = {
    'api': 'Flujo optimizado para autenticación OAuth/JWT, manejo de rate limits y transformación de datos',
    'rpa': 'Flujo robusto con reconocimiento de pantalla, manejo de errores y recuperación automática',
    'webscraping': 'Flujo inteligente con manejo de JavaScript, captchas y detección de cambios',
    'archivo': 'Flujo avanzado con OCR, procesamiento NLP y validación inteligente de datos',
    'base-de-datos': 'Flujo optimizado para consultas complejas, transformaciones ETL y sincronización',
    'iot-sensores': 'Flujo especializado para protocolos industriales y análisis en tiempo real'
  };
  
  return descMap[connectionType] || 'Flujo básico de procesamiento';
}

function getRecommendation(connectionType: string): string {
  const recMap: Record<string, string> = {
    'api': 'Prioriza esta opción cuando esté disponible. Mejor estabilidad y rendimiento.',
    'rpa': 'Ideal para sistemas legacy sin APIs. Requiere más mantenimiento pero es muy flexible.',
    'webscraping': 'Perfecto para datos públicos y monitoreo. Considera términos de uso del sitio.',
    'archivo': 'Excelente para documentos estructurados. OCR permite procesar PDFs escaneados.',
    'base-de-datos': 'Máximo rendimiento para datos internos. Requiere acceso directo a BD.',
    'iot-sensores': 'Especializado para industria 4.0. Protocolos MQTT, ModBus y OPC-UA.'
  };
  
  return recMap[connectionType] || 'Recomendación personalizada según el caso de uso.';
}

function generateBasicWorkflow(connectionType: string): any {
  const workflowMap: Record<string, any> = {
    'api': {
      nodes: [
        {
          id: 'start',
          type: 'n8n-nodes-base.start',
          name: 'Start'
        },
        {
          id: 'http-request',
          type: 'n8n-nodes-base.httpRequest',
          name: 'API Request',
          parameters: {
            url: 'https://api.example.com/data',
            method: 'GET'
          }
        },
        {
          id: 'function',
          type: 'n8n-nodes-base.function',
          name: 'Process Data',
          parameters: {
            functionCode: 'return items.map(item => ({ ...item.json, processed: true }));'
          }
        }
      ]
    },
    'rpa': {
      nodes: [
        {
          id: 'start',
          type: 'n8n-nodes-base.start',
          name: 'Start'
        },
        {
          id: 'screenshot',
          type: 'n8n-nodes-base.screenshot',
          name: 'Take Screenshot'
        },
        {
          id: 'mouse-click',
          type: 'n8n-nodes-base.mouseClick',
          name: 'Click Element'
        }
      ]
    }
  };
  
  return workflowMap[connectionType] || { nodes: [{ id: 'start', type: 'n8n-nodes-base.start', name: 'Start' }] };
} 