import React, { useState, useEffect } from 'react';
import ROICalculator from './herramientas/ROICalculator.jsx';

const InteractiveWorkflow = () => {
  const [isClient, setIsClient] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [phaseData, setPhaseData] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);

  // Verificar hidratación
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Datos de las órdenes disponibles (en un caso real vendrían de la API)
  const availableOrders = [
    {
      id: 'ORD-2024-001',
      client: 'Empresa Ejemplo S.A.',
      agent: 'Agente Contable',
      value: 45000,
      status: 'En Proceso',
      urgency: 'Alta'
    },
    {
      id: 'ORD-2024-002', 
      client: 'Industrias Modernas',
      agent: 'Agente Inventario',
      value: 32500,
      status: 'Completada',
      urgency: 'Media'
    },
    {
      id: 'ORD-2024-003',
      client: 'Tecnología Avanzada',
      agent: 'Agente CRM',
      value: 78900,
      status: 'En Revisión',
      urgency: 'Crítica'
    }
  ];

  // Fases del flujo de trabajo
  const workflowPhases = [
    {
      id: 1,
      title: "Prospección y Diagnóstico Inicial",
      description: "Identificación de oportunidades y análisis preliminar",
      duration: "1-2 días",
      deliverables: [
        {
          name: "Reporte de diagnóstico",
          description: "Resumen de procesos identificados y oportunidades",
          template: "diagnostic-report"
        },
        {
          name: "Estimación de ROI",
          description: "Cálculo preliminar de ahorros y beneficios", 
          template: "roi-estimation"
        }
      ]
    },
    {
      id: 2,
      title: "Análisis y Mapeo de Procesos",
      description: "Documentación detallada de flujos actuales",
      duration: "3-5 días",
      deliverables: [
        {
          name: "Mapeo de procesos",
          description: "Diagramas detallados de flujos actuales",
          template: "process-mapping"
        },
        {
          name: "Análisis de viabilidad técnica",
          description: "Evaluación técnica detallada",
          template: "technical-analysis"
        }
      ]
    },
    {
      id: 3,
      title: "Propuesta de Automatización",
      description: "Diseño de la solución personalizada",
      duration: "2-3 días",
      deliverables: [
        {
          name: "Propuesta técnica",
          description: "Especificaciones de la solución",
          template: "technical-proposal"
        },
        {
          name: "Cotización detallada",
          description: "Presupuesto completo del proyecto",
          template: "detailed-quote"
        }
      ]
    },
    {
      id: 4,
      title: "Negociación y Cierre",
      description: "Ajustes finales y firma del contrato",
      duration: "1-2 días",
      deliverables: [
        {
          name: "Contrato firmado",
          description: "Acuerdo legal y términos finales",
          template: "contract"
        }
      ]
    },
    {
      id: 5,
      title: "Desarrollo e Implementación",
      description: "Creación y configuración de agentes",
      duration: "2-4 semanas",
      deliverables: [
        {
          name: "Agentes desarrollados",
          description: "Sistemas automatizados funcionales",
          template: "development-report"
        }
      ]
    },
    {
      id: 6,
      title: "Pruebas y Validación",
      description: "Testing y ajustes de rendimiento",
      duration: "1-2 semanas",
      deliverables: [
        {
          name: "Reporte de pruebas",
          description: "Resultados de testing y validación",
          template: "testing-report"
        }
      ]
    },
    {
      id: 7,
      title: "Capacitación y Despliegue",
      description: "Entrenamiento del equipo y go-live",
      duration: "1 semana",
      deliverables: [
        {
          name: "Documentación de capacitación",
          description: "Manuales y guías de usuario",
          template: "training-docs"
        }
      ]
    },
    {
      id: 8,
      title: "Monitoreo y Optimización",
      description: "Seguimiento continuo y mejoras",
      duration: "Continuo",
      deliverables: [
        {
          name: "Reporte de rendimiento",
          description: "Métricas y KPIs de automatización",
          template: "performance-report"
        }
      ]
    }
  ];

  const openModal = (deliverable, phase) => {
    setModalContent({ deliverable, phase });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalContent(null);
  };

  const generateDocument = (template, orderData, phaseInfo) => {
    // En un caso real, esto generaría documentos usando templates
    console.log(`Generando documento: ${template}`, { orderData, phaseInfo });
    
    // Simular generación de documento
    const documents = {
      'diagnostic-report': `
REPORTE DE DIAGNÓSTICO INICIAL
Cliente: ${orderData.client}
Orden: ${orderData.id}
Agente Asignado: ${orderData.agent}

1. RESUMEN EJECUTIVO
   - Análisis preliminar completado
   - Procesos automatizables identificados
   - Oportunidades de mejora detectadas

2. PROCESOS ANALIZADOS
   - Proceso A: Manual, alta repetitividad
   - Proceso B: Parcialmente automatizado
   - Proceso C: Crítico para automatizar

3. RECOMENDACIONES
   - Implementar ${orderData.agent}
   - Automatizar procesos críticos
   - ROI estimado: ${((orderData.value * 0.3) / 1000).toFixed(0)}K MXN anuales
      `,
      'roi-estimation': 'ROI_CALCULATOR',
      'process-mapping': `
MAPEO DE PROCESOS
Cliente: ${orderData.client}

PROCESO ACTUAL:
1. Inicio manual
2. Validación humana
3. Procesamiento
4. Verificación
5. Resultado final

PROCESO AUTOMATIZADO:
1. Trigger automático
2. Validación por IA
3. Procesamiento ${orderData.agent}
4. Auto-verificación
5. Resultado optimizado
      `,
      'technical-analysis': `
ANÁLISIS DE VIABILIDAD TÉCNICA
Orden: ${orderData.id}

TECNOLOGÍAS REQUERIDAS:
- ${orderData.agent}
- Integración API
- Base de datos
- Monitoreo

COMPLEJIDAD: Media
TIEMPO ESTIMADO: 2-4 semanas
RECURSOS: 2 desarrolladores + 1 QA
      `,
      'technical-proposal': `
PROPUESTA TÉCNICA
Cliente: ${orderData.client}
Proyecto: Automatización con ${orderData.agent}

ALCANCE:
- Desarrollo de ${orderData.agent}
- Integración con sistemas existentes
- Capacitación del equipo
- Soporte por 6 meses

ARQUITECTURA:
- Cloud hosting (AWS/Azure)
- APIs RESTful
- Dashboard web responsive
- Notificaciones automáticas

CRONOGRAMA:
Semana 1-2: Desarrollo core
Semana 3: Integraciones
Semana 4: Testing y UAT
      `,
      'detailed-quote': `
COTIZACIÓN DETALLADA
Cliente: ${orderData.client}
Valor Total: $${orderData.value.toLocaleString()} MXN

DESGLOSE:
1. Desarrollo: $${(orderData.value * 0.6).toLocaleString()} MXN
2. Integraciones: $${(orderData.value * 0.2).toLocaleString()} MXN
3. Capacitación: $${(orderData.value * 0.1).toLocaleString()} MXN
4. Soporte: $${(orderData.value * 0.1).toLocaleString()} MXN

FORMA DE PAGO:
- 50% al iniciar
- 30% en entrega beta
- 20% en go-live
      `,
      'contract': `
CONTRATO DE SERVICIOS
AIM - Automatización Industrial Mireles

Cliente: ${orderData.client}
Monto: $${orderData.value.toLocaleString()} MXN

TÉRMINOS:
- Desarrollo de ${orderData.agent}
- Garantía de 12 meses
- SLA 99.5% uptime
- Soporte 24/7 nivel enterprise
      `,
      'development-report': `
REPORTE DE DESARROLLO
Proyecto: ${orderData.client} - ${orderData.agent}

FUNCIONALIDADES IMPLEMENTADAS:
✅ Core engine ${orderData.agent}
✅ Dashboard administrativo
✅ APIs de integración
✅ Sistema de notificaciones
✅ Logs y auditoría

MÉTRICAS:
- Pruebas unitarias: 95% coverage
- Performance: <2s response time
- Seguridad: Certificado ISO 27001
      `,
      'testing-report': `
REPORTE DE PRUEBAS
Cliente: ${orderData.client}

TIPOS DE PRUEBAS:
✅ Funcionales: 100% aprobadas
✅ Performance: Sub 2 segundos
✅ Seguridad: Sin vulnerabilidades
✅ Integración: Todos los endpoints OK
✅ Usuario: UAT completado

MÉTRICAS DE CALIDAD:
- Disponibilidad: 99.8%
- Precisión: 99.5%
- Velocidad: 3x más rápido que manual
      `,
      'training-docs': `
DOCUMENTACIÓN DE CAPACITACIÓN
${orderData.agent} - Manual de Usuario

MÓDULOS:
1. Introducción al sistema
2. Operación básica
3. Configuración avanzada
4. Resolución de problemas
5. Mejores prácticas

RECURSOS:
- Videos tutoriales (2 horas)
- Manual PDF (50 páginas)
- Sesión presencial (4 horas)
- Soporte post-capacitación
      `,
      'performance-report': `
REPORTE DE RENDIMIENTO
Cliente: ${orderData.client}
Período: Último mes

KPIs:
- Procesos automatizados: 1,247
- Tiempo ahorrado: 312 horas
- Errores reducidos: 89%
- ROI actual: ${((orderData.value * 0.3) / 1000).toFixed(0)}% anualizado

RECOMENDACIONES:
- Ampliar a más departamentos
- Optimizar algoritmos de IA
- Integrar nuevos sistemas
      `
    };

    return documents[template] || `Documento ${template} generado para ${orderData.client}`;
  };

  const advancePhase = () => {
    if (currentPhase < workflowPhases.length - 1) {
      setCurrentPhase(currentPhase + 1);
    }
  };

  const resetWorkflow = () => {
    setCurrentPhase(0);
    setSelectedOrder(null);
    setPhaseData({});
  };

  if (!isClient) {
    return <div>Cargando flujo interactivo...</div>;
  }

  // Selector de orden
  if (!selectedOrder) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Seleccionar Orden para Flujo</h3>
        <p className="text-gray-600 mb-6">Elige la orden que deseas procesar paso a paso:</p>
        
        <div className="space-y-4">
          {availableOrders.map(order => (
            <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:border-teal-500 cursor-pointer transition-colors"
                 onClick={() => setSelectedOrder(order)}>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-gray-900">{order.id}</h4>
                  <p className="text-sm text-gray-500">{order.client}</p>
                  <p className="text-sm text-gray-600">{order.agent}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">${order.value.toLocaleString()}</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    order.urgency === 'Alta' ? 'bg-red-100 text-red-800' :
                    order.urgency === 'Media' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-emerald-100 text-emerald-800'
                  }`}>
                    {order.urgency}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const currentWorkflowPhase = workflowPhases[currentPhase];

  return (
    <div className="space-y-6">
      {/* Header del flujo activo */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-xl p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-semibold mb-2">Flujo Interactivo Activo</h3>
            <p className="text-teal-100">Orden: {selectedOrder.id} - {selectedOrder.client}</p>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={() => window.showStaticWorkflow?.()}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg text-sm transition-colors"
            >
              Ver Flujo Completo
            </button>
            <button 
              onClick={resetWorkflow}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg text-sm transition-colors"
            >
              Cambiar Orden
            </button>
          </div>
        </div>
        
        {/* Progreso */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-teal-100 mb-2">
            <span>Progreso del flujo</span>
            <span>{currentPhase + 1} de {workflowPhases.length}</span>
          </div>
          <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-500"
              style={{ width: `${((currentPhase + 1) / workflowPhases.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Fase actual */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-teal-500 to-emerald-500 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold">{currentWorkflowPhase.id}</span>
                </div>
                <h3 className="text-xl font-semibold">{currentWorkflowPhase.title}</h3>
              </div>
              <p className="text-teal-100 mt-2">{currentWorkflowPhase.description}</p>
            </div>
            <div className="text-right">
              <div className="text-teal-100 text-sm">Duración</div>
              <div className="text-lg font-semibold">{currentWorkflowPhase.duration}</div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Entregables de esta fase:</h4>
          
          <div className="space-y-4">
            {currentWorkflowPhase.deliverables.map((deliverable, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-medium text-gray-900">{deliverable.name}</h5>
                    <p className="text-sm text-gray-600 mt-1">{deliverable.description}</p>
                  </div>
                  <button
                    onClick={() => openModal(deliverable, currentWorkflowPhase)}
                    className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    Crear
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Botón para avanzar */}
                      <div className="mt-8">
              {/* Vista previa de siguiente fase */}
              {currentPhase < workflowPhases.length - 1 && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                  <h5 className="font-medium text-gray-900 mb-2">
                    Siguiente: {workflowPhases[currentPhase + 1].title}
                  </h5>
                  <p className="text-sm text-gray-600">
                    {workflowPhases[currentPhase + 1].description}
                  </p>
                </div>
              )}

              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  {currentPhase > 0 && (
                    <button 
                      onClick={() => setCurrentPhase(currentPhase - 1)}
                      className="text-teal-600 hover:text-teal-700 flex items-center space-x-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      <span>Fase anterior</span>
                    </button>
                  )}
                </div>
                
                <div className="space-x-4">
                  {currentPhase < workflowPhases.length - 1 ? (
                    <button
                      onClick={advancePhase}
                      className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-all flex items-center space-x-2"
                    >
                      <span>¿Listo? Avanzar a siguiente fase</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        alert('¡Flujo completado exitosamente! 🎉\n\nTodos los entregables han sido generados.\nEl proyecto está listo para implementación.');
                        // Opcional: volver al inicio o generar reporte final
                      }}
                      className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-3 rounded-lg font-medium transition-all flex items-center space-x-2"
                    >
                      <span>¡Completar Flujo!</span>
                      <span>🎉</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
        </div>
      </div>

      {/* Modal para entregables */}
      {showModal && modalContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">
                {modalContent.deliverable.name}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              {modalContent.deliverable.template === 'roi-estimation' ? (
                <div>
                  <h4 className="text-lg font-medium mb-4">Calculadora ROI Integrada</h4>
                  <ROICalculator />
                </div>
              ) : (
                <div>
                  <h4 className="text-lg font-medium mb-4">Documento Generado</h4>
                  <div className="bg-gray-50 rounded-lg p-4 border">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700">
                      {generateDocument(modalContent.deliverable.template, selectedOrder, modalContent.phase)}
                    </pre>
                  </div>
                  
                  <div className="mt-6 flex space-x-4">
                    <button className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors">
                      Descargar PDF
                    </button>
                    <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors">
                      Enviar por Email
                    </button>
                    <button className="border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg transition-colors">
                      Editar Documento
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveWorkflow; 