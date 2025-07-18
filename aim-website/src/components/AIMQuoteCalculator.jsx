import React, { useState, useEffect } from 'react';

const AIMQuoteCalculator = ({ 
  onCalculationChange = () => {}, 
  initialData = null,
  orderData = null,
  isEmbedded = true 
}) => {
  // Estados principales
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAgents, setSelectedAgents] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [quoteConfig, setQuoteConfig] = useState({
    currency: 'MXN',
    validityDays: 30,
    paymentTerms: '50-50',
    warrantyOption: '3-meses'
  });

  // Definición de pasos
  const steps = [
    { id: 0, title: 'Agentes 🤖', name: 'agentes' },
    { id: 1, title: 'Planes 💼', name: 'planes' },
    { id: 2, title: 'Servicios ⚙️', name: 'servicios' },
    { id: 3, title: 'Configuración 🔧', name: 'configuracion' },
    { id: 4, title: 'Resumen 📊', name: 'resumen' }
  ];

  // Navegación simple
  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      console.log(`🔄 Avanzando al paso ${nextStep}: ${steps[nextStep].name}`);
      setCurrentStep(nextStep);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      console.log(`🔄 Retrocediendo al paso ${prevStep}: ${steps[prevStep].name}`);
      setCurrentStep(prevStep);
    }
  };

  const goToStep = (stepIndex) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      console.log(`🎯 Saltando al paso ${stepIndex}: ${steps[stepIndex].name}`);
      setCurrentStep(stepIndex);
    }
  };

  // Log inicial
  useEffect(() => {
    console.log('🚀 AIMQuoteCalculator inicializado');
    console.log('📊 Estado inicial:', { currentStep, selectedAgents, selectedPlan, selectedServices });
  }, []);
  
  // Datos de configuración
  const agents = [
    {
      id: 'agente-inspeccion-visual-ia',
      name: 'Agente de Inspección Visual con Inteligencia Artificial',
      category: 'Automatización Industrial',
      icon: '👁️',
      description: 'Utiliza visión por computadora y deep learning para detectar defectos, mediciones y clasificar productos automáticamente',
      challenge: 'Las inspecciones visuales manuales son lentas, subjetivas y propensas a errores, especialmente en producciones de alto volumen.',
      solution: 'Sistema de visión artificial con IA que detecta defectos, mide dimensiones y clasifica productos en tiempo real con precisión superior al ojo humano.',
      basePrice: 74831,
      monthlyPrice: 14953,
      setupPrice: 18000,
      complexity: 'Advanced',
      estimatedHours: 50,
      estimatedDays: '7-10 días',
      features: [
        'Visión por computadora avanzada',
        'Deep learning para detección de defectos',
        'Clasificación automática de productos',
        'Mediciones precisas',
        'Integración con líneas de producción',
        'Reportes en tiempo real'
      ],
      benefits: [
        '99.5% precisión en detección',
        '80% reducción en productos defectuosos',
        'Inspección 10x más rápida',
        'Eliminación de subjetividad humana'
      ],
      requirements: [
        'Cámaras industriales de alta resolución',
        'Iluminación controlada',
        'GPU para procesamiento IA',
        'Integración con sistema MES'
      ]
    },
    {
      id: 'agente-prediccion-demanda-ml',
      name: 'Agente de Predicción de Demanda con Machine Learning',
      category: 'Automatización Industrial',
      icon: '📈',
      description: 'Predice demanda futura usando algoritmos de ML, considerando estacionalidad, tendencias y factores externos',
      challenge: 'La planificación de demanda manual es imprecisa y no considera múltiples variables que afectan las ventas.',
      solution: 'Algoritmos de machine learning que analizan históricos, tendencias y factores externos para predecir demanda con alta precisión.',
      basePrice: 75597,
      monthlyPrice: 14765,
      setupPrice: 19000,
      complexity: 'Advanced',
      estimatedHours: 48,
      estimatedDays: '6-8 días',
      features: [
        'Algoritmos de machine learning',
        'Análisis de estacionalidad',
        'Factores externos (clima, eventos)',
        'Predicciones multivariables',
        'Alertas de cambios de tendencia',
        'Integración con ERP/CRM'
      ],
      benefits: [
        '95% precisión en predicciones',
        '30% reducción en inventario excesivo',
        '25% mejora en nivel de servicio',
        'Optimización de capital de trabajo'
      ],
      requirements: [
        'Histórico de ventas mínimo 2 años',
        'Datos de factores externos',
        'Integración con sistemas de ventas',
        'Infraestructura de datos'
      ]
    },
    {
      id: 'agente-sincronizacion-erp',
      name: 'Agente de Sincronización Bidireccional ERP',
      category: 'Automatización Industrial',
      icon: '🔄',
      description: 'Sincroniza automáticamente datos entre múltiples sistemas ERP y aplicaciones, manteniendo consistencia en tiempo real',
      challenge: 'Mantener datos consistentes entre múltiples sistemas ERP causa errores y requiere trabajo manual intensivo.',
      solution: 'Sincronización automática bidireccional que mantiene consistencia de datos entre todos los sistemas en tiempo real.',
      basePrice: 74784,
      monthlyPrice: 13317,
      setupPrice: 17500,
      complexity: 'Advanced',
      estimatedHours: 45,
      estimatedDays: '6-8 días',
      features: [
        'Sincronización bidireccional',
        'Mapeo inteligente de campos',
        'Detección de conflictos',
        'Transformación de datos',
        'Monitoreo en tiempo real',
        'Logs de auditoría completos'
      ],
      benefits: [
        '99.9% consistencia de datos',
        '85% reducción en errores manuales',
        'Sincronización en tiempo real',
        'Ahorro de 40+ horas semanales'
      ],
      requirements: [
        'APIs de sistemas ERP',
        'Mapeo de estructura de datos',
        'Políticas de resolución de conflictos',
        'Infraestructura de integración'
      ]
    },
    {
      id: 'agente-reabastecimiento-inteligente',
      name: 'Agente de Reabastecimiento Inteligente',
      category: 'Gestión de Inventarios',
      icon: '🚛',
      description: 'Automatiza órdenes de compra basado en niveles de inventario, lead times y predicciones de demanda',
      challenge: 'La gestión manual de reabastecimiento causa stockouts y exceso de inventario por falta de optimización.',
      solution: 'Sistema inteligente que optimiza puntos de reorden considerando demanda, lead times y costos de inventario.',
      basePrice: 43150,
      monthlyPrice: 7731,
      setupPrice: 12000,
      complexity: 'Medium',
      estimatedHours: 35,
      estimatedDays: '4-6 días',
      features: [
        'Cálculo automático de puntos de reorden',
        'Optimización de cantidades',
        'Consideración de lead times variables',
        'Integración con proveedores',
        'Alertas proactivas',
        'Análisis de costos de inventario'
      ],
      benefits: [
        '95% reducción en stockouts',
        '30% optimización de inventario',
        '60% ahorro en tiempo de compras',
        'Mejora en rotación de inventario'
      ],
      requirements: [
        'Sistema de gestión de inventarios',
        'Datos de proveedores y lead times',
        'Integración con sistema de compras',
        'Configuración de políticas de inventario'
      ]
    },
    {
      id: 'agente-monitoreo-oee',
      name: 'Agente de Monitoreo OEE (Overall Equipment Effectiveness)',
      category: 'Mantenimiento Predictivo',
      icon: '⚙️',
      description: 'Supervisa y calcula automáticamente el OEE de líneas de producción, identificando pérdidas y oportunidades de mejora',
      challenge: 'El cálculo manual de OEE es tardío y no permite identificar oportunidades de mejora en tiempo real.',
      solution: 'Monitoreo continuo y cálculo automático de OEE con análisis de causas raíz y recomendaciones de mejora.',
      basePrice: 73879,
      monthlyPrice: 14118,
      setupPrice: 18500,
      complexity: 'Advanced',
      estimatedHours: 48,
      estimatedDays: '7-10 días',
      features: [
        'Cálculo automático de OEE',
        'Análisis de disponibilidad',
        'Medición de rendimiento',
        'Control de calidad integrado',
        'Identificación de pérdidas',
        'Dashboards en tiempo real'
      ],
      benefits: [
        '15-20% mejora en OEE',
        'Identificación inmediata de problemas',
        'Reducción de 50% en tiempo de análisis',
        'Optimización continua de producción'
      ],
      requirements: [
        'Sensores en equipos de producción',
        'Conexión con sistemas SCADA/MES',
        'Definición de parámetros de producción',
        'Integración con sistema de calidad'
      ]
    },
    {
      id: 'agente-trazabilidad-productos',
      name: 'Agente de Trazabilidad y Genealogía de Productos',
      category: 'Control de Calidad',
      icon: '🔍',
      description: 'Rastrea automáticamente cada producto desde materias primas hasta entrega final, manteniendo genealogía completa',
      challenge: 'La trazabilidad manual es incompleta y no permite respuesta rápida ante problemas de calidad o recalls.',
      solution: 'Sistema automático de trazabilidad que mantiene registro completo del historial de cada producto desde origen hasta cliente.',
      basePrice: 45313,
      monthlyPrice: 8631,
      setupPrice: 13500,
      complexity: 'Medium',
      estimatedHours: 38,
      estimatedDays: '5-7 días',
      features: [
        'Trazabilidad end-to-end',
        'Genealogía completa de productos',
        'Códigos únicos de identificación',
        'Seguimiento de materias primas',
        'Historial de procesos',
        'Capacidad de recall rápido'
      ],
      benefits: [
        'Trazabilidad 100% completa',
        '90% reducción en tiempo de recalls',
        'Cumplimiento regulatorio automático',
        'Mejora en control de calidad'
      ],
      requirements: [
        'Sistema de códigos únicos (RFID/QR)',
        'Lectores en puntos críticos',
        'Integración con MES/ERP',
        'Base de datos de trazabilidad'
      ]
    },
    {
      id: 'agente-optimizacion-energetico',
      name: 'Agente de Optimización de Consumo Energético',
      category: 'Gestión Energética',
      icon: '⚡',
      description: 'Optimiza automáticamente el consumo energético de la planta considerando tarifas, demanda y eficiencia de equipos',
      challenge: 'El consumo energético no optimizado representa costos elevados y desperdicio de recursos.',
      solution: 'Optimización automática del consumo energético considerando tarifas eléctricas, demanda de producción y eficiencia de equipos.',
      basePrice: 70268,
      monthlyPrice: 13455,
      setupPrice: 16800,
      complexity: 'Advanced',
      estimatedHours: 45,
      estimatedDays: '6-8 días',
      features: [
        'Monitoreo de consumo en tiempo real',
        'Optimización según tarifas eléctricas',
        'Control automático de equipos',
        'Análisis de eficiencia energética',
        'Programación inteligente de producción',
        'Reportes de ahorro energético'
      ],
      benefits: [
        '20-30% reducción en costos energéticos',
        'Optimización automática continua',
        'Mejora en huella de carbono',
        'ROI típico menor a 18 meses'
      ],
      requirements: [
        'Medidores inteligentes de energía',
        'Control automático de equipos',
        'Integración con sistema de producción',
        'Datos de tarifas eléctricas'
      ]
    },
    {
      id: 'agente-deteccion-vibraciones',
      name: 'Agente de Detección de Anomalías en Vibraciones',
      category: 'Mantenimiento Predictivo',
      icon: '📊',
      description: 'Analiza patrones de vibración de equipos rotativos para predecir fallas y programar mantenimiento preventivo',
      challenge: 'Las fallas inesperadas de equipos causan paros costosos y el mantenimiento reactivo es ineficiente.',
      solution: 'Análisis continuo de vibraciones con IA para detectar anomalías tempranas y predecir fallas antes de que ocurran.',
      basePrice: 71270,
      monthlyPrice: 13811,
      setupPrice: 17200,
      complexity: 'Advanced',
      estimatedHours: 46,
      estimatedDays: '6-9 días',
      features: [
        'Monitoreo continuo de vibraciones',
        'Análisis espectral automatizado',
        'Detección de anomalías con IA',
        'Predicción de fallas',
        'Alertas tempranas',
        'Programación automática de mantenimiento'
      ],
      benefits: [
        '85% reducción en paros no programados',
        '40% optimización de costos de mantenimiento',
        'Predicción de fallas 2-6 semanas antes',
        'Aumento de vida útil de equipos'
      ],
      requirements: [
        'Sensores de vibración en equipos críticos',
        'Conectividad IoT industrial',
        'Baseline de equipos en buen estado',
        'Integración con sistema CMMS'
      ]
    },
    {
      id: 'agente-optimizacion-lineas',
      name: 'Agente de Optimización de Líneas de Ensamble',
      category: 'Optimización de Producción',
      icon: '🏭',
      description: 'Optimiza automáticamente la secuencia y timing de líneas de ensamble para maximizar throughput y minimizar desperdicios',
      challenge: 'El balanceo manual de líneas es subóptimo y no se adapta a cambios en demanda o variaciones de proceso.',
      solution: 'Optimización continua y automática de líneas de ensamble considerando throughput, eficiencia y minimización de desperdicios.',
      basePrice: 72682,
      monthlyPrice: 14585,
      setupPrice: 17800,
      complexity: 'Advanced',
      estimatedHours: 50,
      estimatedDays: '7-10 días',
      features: [
        'Optimización automática de secuencias',
        'Balanceo dinámico de líneas',
        'Análisis de cuellos de botella',
        'Maximización de throughput',
        'Minimización de desperdicios',
        'Adaptación en tiempo real'
      ],
      benefits: [
        '15-25% aumento en throughput',
        '30% reducción en desperdicios',
        'Optimización continua automática',
        'Mejor utilización de recursos'
      ],
      requirements: [
        'Sensores de flujo en línea',
        'Sistema MES integrado',
        'Datos de tiempos de proceso',
        'Control automático de estaciones'
      ]
    }
  ];

  const subscriptionPlans = [
    {
      id: 'aim-gestionado',
      name: 'AIM-Gestionado',
      subtitle: 'Solución "llave en mano"',
      description: 'Nosotros alojamos, gestionamos y mantenemos toda la automatización.',
      monthlyPrice: 8500,
      setupFee: 15000,
      agentPriceMultiplier: 1.0,
      recommended: true,
      color: 'teal',
      icon: '☁️',
      included: [
        'Alojamiento en nuestra nube segura',
        'Soporte Proactivo 24/7 Incluido',
        'Mantenimiento y Actualizaciones automáticas',
        'Monitoreo continuo del sistema',
        'Backup automático diario',
        'Soporte técnico especializado',
        'SLA de 99.9% de disponibilidad',
        'Escalamiento automático de recursos'
      ],
      features: [
        'Ideal para delegar complejidad técnica',
        'Sin inversión en infraestructura',
        'Escalamiento automático según demanda',
        'Actualizaciones sin interrupciones',
        'Acceso desde cualquier lugar',
        'Seguridad empresarial incluida'
      ],
      benefits: [
        'Cero preocupaciones técnicas',
        'Costos operativos predecibles',
        'Acceso inmediato a nuevas funciones',
        'Soporte experto incluido'
      ]
    },
    {
      id: 'aim-local',
      name: 'AIM-Local',
      subtitle: 'Máximo control',
      description: 'Instalamos la automatización en su propia infraestructura (On-Premise).',
      monthlyPrice: 3500,
      setupFee: 8000,
      agentPriceMultiplier: 1.2,
      recommended: false,
      color: 'blue',
      icon: '🖥️',
      included: [
        'Instalación completa en sus servidores',
        'Documentación técnica completa',
        'Capacitación del equipo técnico',
        'Soporte durante implementación',
        'Configuración de seguridad',
        'Manual de administración'
      ],
      features: [
        'Control total de datos y sistemas',
        'Cumplimiento con políticas internas',
        'Personalización sin restricciones',
        'Integración profunda con sistemas',
        'Sin dependencia de terceros',
        'Rendimiento optimizado local'
      ],
      benefits: [
        'Máxima seguridad y privacidad',
        'Control total del sistema',
        'Cumplimiento regulatorio garantizado',
        'Personalización sin límites'
      ],
      additionalServices: [
        {
          name: 'Soporte 24/7 Opcional',
          monthlyPrice: 2500,
          description: 'Soporte técnico especializado las 24 horas'
        },
        {
          name: 'Mantenimiento Remoto',
          monthlyPrice: 1800,
          description: 'Mantenimiento y actualizaciones remotas'
        }
      ]
    },
    {
      id: 'aim-hibrido',
      name: 'AIM-Híbrido',
      subtitle: 'Flexibilidad total',
      description: 'Configuramos en plataforma externa (ej. n8n) con control total de tu cuenta.',
      monthlyPrice: 5500,
      setupFee: 12000,
      agentPriceMultiplier: 0.9,
      recommended: false,
      color: 'purple',
      icon: '🔄',
      included: [
        'Configuración en plataforma de terceros',
        'Acceso completo y control de tu cuenta',
        'Documentación y capacitación completa',
        'Soporte de configuración inicial',
        'Migración de datos si es necesario',
        'Optimización de workflows'
      ],
      features: [
        'Balance perfecto entre control y gestión',
        'Aprovecha plataformas especializadas',
        'Flexibilidad para cambios futuros',
        'Costos operativos reducidos',
        'Ecosistema de integraciones amplio',
        'Escalabilidad según crecimiento'
      ],
      benefits: [
        'Mejor relación costo-beneficio',
        'Flexibilidad para evolucionar',
        'Acceso a ecosistema de integraciones',
        'Control sin complejidad técnica'
      ],
      additionalServices: [
        {
          name: 'Soporte 24/7 Opcional',
          monthlyPrice: 2000,
          description: 'Soporte para plataforma híbrida'
        },
        {
          name: 'Consultoría Mensual',
          monthlyPrice: 3000,
          description: 'Sesión mensual de optimización'
        }
      ]
    }
  ];

  const additionalServices = [
    {
      category: 'Capacitación y Consultoría',
      icon: '🎓',
      services: [
        {
          id: 'training-basic',
          name: 'Capacitación Básica de Usuarios',
          description: 'Capacitación presencial o virtual para 5 usuarios finales (4 horas)',
          price: 8500,
          unit: 'sesión',
          duration: '4 horas',
          participants: '5 personas',
          includes: ['Material de capacitación', 'Certificados', 'Grabación de sesión', 'Soporte post-capacitación']
        },
        {
          id: 'training-advanced',
          name: 'Capacitación Técnica Avanzada',
          description: 'Capacitación técnica para administradores y personal TI (8 horas)',
          price: 15000,
          unit: 'sesión',
          duration: '8 horas',
          participants: '3 personas',
          includes: ['Documentación técnica', 'Hands-on labs', 'Configuración práctica', 'Soporte extendido']
        },
        {
          id: 'consulting-hours',
          name: 'Horas de Consultoría Especializada',
          description: 'Consultoría post-implementación con expertos en automatización',
          price: 1200,
          unit: 'hora',
          duration: 'Flexible',
          includes: ['Análisis de optimización', 'Recomendaciones', 'Implementación de mejoras']
        },
        {
          id: 'workshop-optimization',
          name: 'Workshop de Optimización',
          description: 'Taller intensivo para identificar nuevas oportunidades de automatización',
          price: 25000,
          unit: 'workshop',
          duration: '2 días',
          participants: '10 personas',
          includes: ['Análisis completo', 'Roadmap de automatización', 'ROI potencial', 'Plan de acción']
        }
      ]
    },
    {
      category: 'Desarrollo y Personalización',
      icon: '⚙️',
      services: [
        {
          id: 'custom-dashboard',
          name: 'Dashboard Personalizado',
          description: 'Dashboard ejecutivo a medida con KPIs específicos de su negocio',
          price: 25000,
          unit: 'dashboard',
          duration: '2-3 semanas',
          includes: ['Diseño UX/UI', 'Conectores de datos', 'Visualizaciones interactivas', 'Mobile responsive']
        },
        {
          id: 'custom-integration',
          name: 'Integración Personalizada',
          description: 'Desarrollo de integración específica con sistemas no estándar',
          price: 18000,
          unit: 'integración',
          duration: '1-2 semanas',
          includes: ['Análisis de APIs', 'Desarrollo custom', 'Pruebas de integración', 'Documentación']
        },
        {
          id: 'custom-report',
          name: 'Reportes Personalizados',
          description: 'Desarrollo de reportes específicos con automatización de envío',
          price: 12000,
          unit: 'reporte',
          duration: '1 semana',
          includes: ['Diseño de reporte', 'Automatización de envío', 'Múltiples formatos', 'Programación flexible']
        },
        {
          id: 'mobile-app',
          name: 'App Móvil Personalizada',
          description: 'Aplicación móvil para monitoreo y control de automatizaciones',
          price: 45000,
          unit: 'app',
          duration: '4-6 semanas',
          includes: ['iOS y Android', 'Push notifications', 'Offline capability', 'Biometric auth']
        }
      ]
    },
    {
      category: 'Soporte y Mantenimiento',
      icon: '🔧',
      services: [
        {
          id: 'extended-warranty',
          name: 'Garantía Extendida',
          description: 'Extensión de garantía por 12 meses adicionales con soporte premium',
          price: 15000,
          unit: 'año',
          includes: ['Soporte técnico', 'Actualizaciones menores', 'Resolución de bugs', 'Consultoría telefónica']
        },
        {
          id: 'priority-support',
          name: 'Soporte Prioritario',
          description: 'Respuesta garantizada en 2 horas con técnico dedicado',
          price: 3500,
          unit: 'mes',
          includes: ['SLA de 2 horas', 'Técnico dedicado', 'Acceso directo', 'Resolución acelerada']
        },
        {
          id: 'health-check',
          name: 'Health Check Mensual',
          description: 'Revisión proactiva del sistema con reporte detallado',
          price: 4500,
          unit: 'mes',
          includes: ['Análisis de rendimiento', 'Reporte mensual', 'Recomendaciones', 'Optimizaciones menores']
        },
        {
          id: 'backup-service',
          name: 'Servicio de Backup Avanzado',
          description: 'Backup automático con retención extendida y recuperación rápida',
          price: 2500,
          unit: 'mes',
          includes: ['Backup diario', 'Retención 90 días', 'Recuperación en < 1 hora', 'Pruebas de integridad']
        }
      ]
    }
  ];

  const paymentTerms = [
    { value: '50-50', label: '50% Anticipo - 50% Contra Entrega', description: 'Pago dividido en dos partes iguales', discountMultiplier: 1.0 },
    { value: '30-70', label: '30% Anticipo - 70% Contra Entrega', description: 'Menor anticipo, mayor pago final', discountMultiplier: 1.0 },
    { value: '100-inicio', label: '100% Al Inicio del Proyecto', description: 'Pago completo al comenzar (5% descuento)', discountMultiplier: 0.95 },
    { value: 'mensual', label: 'Pagos Mensuales', description: 'Solo para proyectos > 3 meses (10% recargo)', discountMultiplier: 1.10 }
  ];

  const warrantyOptions = [
    { value: '3-meses', label: '3 Meses Estándar', description: 'Garantía estándar incluida', multiplier: 0 },
    { value: '6-meses', label: '6 Meses Extendida', description: '+5% del valor del proyecto', multiplier: 0.05 },
    { value: '12-meses', label: '12 Meses Premium', description: '+10% del valor del proyecto', multiplier: 0.10 }
  ];

  // Inicializar con agente de la orden si existe
  useEffect(() => {
    if (orderData?.agent && !selectedAgents.length) {
      const orderAgent = agents.find(agent => 
        agent.id === orderData.agent.id || 
        agent.name.toLowerCase().includes(orderData.agent.name.toLowerCase())
      );
      
      if (orderAgent) {
        setSelectedAgents([orderAgent]);
        console.log('🎯 Agente de la orden cargado:', orderAgent.name);
      }
    }
  }, [orderData]);

  // Estado para controlar si la cotización está actualizada
  const [isQuoteCalculated, setIsQuoteCalculated] = useState(false);
  const [quoteResults, setQuoteResults] = useState(null);

  // Función para calcular totales (solo cuando el usuario lo solicite)
  const calculateQuoteTotals = (shouldNotify = true) => {
    let baseTotal = 0;
    let monthlyTotal = 0;
    let setupTotal = 0;

    // Calcular costos de agentes
    selectedAgents.forEach(agent => {
      const multiplier = selectedPlan?.agentPriceMultiplier || 1.0;
      baseTotal += agent.basePrice * multiplier;
      monthlyTotal += agent.monthlyPrice;
      setupTotal += agent.setupPrice || 0;
    });

    // Agregar costo del plan
    if (selectedPlan) {
      monthlyTotal += selectedPlan.monthlyPrice;
      setupTotal += selectedPlan.setupFee || 0;
    }

    // Agregar servicios adicionales
    selectedServices.forEach(service => {
      if (service.unit === 'mes') {
        monthlyTotal += service.price;
      } else {
        baseTotal += service.price;
      }
    });

    // Aplicar descuentos/recargos por términos de pago
    const paymentTerm = paymentTerms.find(pt => pt.value === quoteConfig.paymentTerms);
    const paymentMultiplier = paymentTerm?.discountMultiplier || 1.0;
    baseTotal *= paymentMultiplier;

    // Aplicar costo de garantía
    const warranty = warrantyOptions.find(wo => wo.value === quoteConfig.warrantyOption);
    const warrantyMultiplier = warranty?.multiplier || 0;
    const warrantyTotal = baseTotal * warrantyMultiplier;

    const grandTotal = baseTotal + setupTotal + warrantyTotal;
    const firstYearTotal = grandTotal + (monthlyTotal * 12);

    const results = {
      selectedAgents,
      selectedPlan,
      selectedServices,
      quoteConfig,
      calculations: {
        baseTotal,
        monthlyTotal,
        setupTotal,
        warrantyTotal,
        grandTotal,
        firstYearTotal,
        paymentMultiplier,
        warrantyMultiplier,
        currency: quoteConfig.currency
      },
      summary: {
        agentCount: selectedAgents.length,
        planName: selectedPlan?.name || 'Sin plan seleccionado',
        servicesCount: selectedServices.length,
        validityDays: quoteConfig.validityDays,
        paymentTerms: paymentTerm?.label || 'No especificado',
        warranty: warranty?.label || 'No especificado'
      },
      timestamp: new Date().toISOString()
    };

    setQuoteResults(results);
    setIsQuoteCalculated(true);

    // Solo notificar cuando se solicite explícitamente
    if (shouldNotify) {
      onCalculationChange(results);
    }
    
    return results;
  };

  // Función para actualizar la cotización
  const updateQuote = () => {
    calculateQuoteTotals(true);
  };

  // Función para resetear la cotización
  const resetQuote = () => {
    setIsQuoteCalculated(false);
    setQuoteResults(null);
  };

  // Marcar cotización como desactualizada cuando cambien valores importantes
  const markQuoteAsOutdated = () => {
    if (isQuoteCalculated) {
      setIsQuoteCalculated(false);
    }
  };

  const toggleAgent = (agent) => {
    const isSelected = selectedAgents.find(a => a.id === agent.id);
    if (isSelected) {
      setSelectedAgents(selectedAgents.filter(a => a.id !== agent.id));
    } else {
      setSelectedAgents([...selectedAgents, agent]);
    }
    markQuoteAsOutdated();
  };

  const toggleService = (service) => {
    const isSelected = selectedServices.find(s => s.id === service.id);
    if (isSelected) {
      setSelectedServices(selectedServices.filter(s => s.id !== service.id));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
    markQuoteAsOutdated();
  };

  const getComplexityColor = (complexity) => {
    switch (complexity?.toLowerCase()) {
      case 'basic': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderAgentsTab = () => {
    console.log('🤖 Renderizando pestaña de Agentes');
    return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Selecciona los Agentes de Automatización</h3>
        <p className="text-gray-600">Elige los agentes que mejor se adapten a las necesidades del proyecto</p>
      </div>

      {/* Agente preseleccionado de la orden */}
      {orderData?.agent && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">ℹ️</div>
            <div>
              <h4 className="font-medium text-blue-900">Agente solicitado en la orden</h4>
              <p className="text-blue-700 text-sm">
                <strong>{orderData.agent.name}</strong> - {orderData.agent.title}
              </p>
              <p className="text-blue-600 text-xs mt-1">Categoría: {orderData.agent.category}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {agents.map(agent => {
          const isSelected = selectedAgents.find(a => a.id === agent.id);
          const multiplier = selectedPlan?.agentPriceMultiplier || 1.0;
          const adjustedPrice = agent.basePrice * multiplier;

          return (
            <div 
              key={agent.id}
              className={`border-2 rounded-lg p-6 cursor-pointer transition-all duration-200 ${
                isSelected 
                  ? 'border-teal-500 bg-teal-50 shadow-lg' 
                  : 'border-gray-200 hover:border-teal-300 hover:shadow-md'
              }`}
              onClick={() => toggleAgent(agent)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="text-3xl">{agent.icon}</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getComplexityColor(agent.complexity)}`}>
                      {agent.complexity}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-teal-600">
                    ${adjustedPrice.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">
                    + ${agent.monthlyPrice.toLocaleString()}/mes
                  </div>
                </div>
              </div>

              <p className="text-gray-700 text-sm mb-4">{agent.description}</p>

              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-900 text-sm mb-2">Características principales:</h4>
                  <ul className="space-y-1">
                    {agent.features.slice(0, 3).map((feature, idx) => (
                      <li key={idx} className="text-xs text-gray-600 flex items-center">
                        <span className="w-1.5 h-1.5 bg-teal-500 rounded-full mr-2"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 border-t border-gray-200">
                  <div className="flex justify-between items-center text-xs text-gray-600">
                    <span>Tiempo estimado: {agent.estimatedDays}</span>
                    <span>{agent.category}</span>
                  </div>
                </div>
              </div>

              {isSelected && (
                <div className="mt-4 pt-4 border-t border-teal-200">
                  <div className="flex items-center text-teal-700 text-sm">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Agente seleccionado
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">Resumen de Agentes Seleccionados</h4>
        {selectedAgents.length > 0 ? (
          <div className="space-y-2">
            {selectedAgents.map(agent => (
              <div key={agent.id} className="flex justify-between items-center text-sm">
                <span>{agent.name}</span>
                <span className="font-medium">${((agent.basePrice * (selectedPlan?.agentPriceMultiplier || 1.0)) + agent.monthlyPrice).toLocaleString()}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-sm">No has seleccionado ningún agente</p>
        )}
      </div>

      {/* Botón de avance */}
      <div className="flex justify-center mt-6">
        <button 
          onClick={goToNextStep}
          disabled={selectedAgents.length === 0}
          className={`px-8 py-3 rounded-lg font-medium transition-colors ${
            selectedAgents.length > 0
              ? 'bg-teal-600 text-white hover:bg-teal-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {selectedAgents.length > 0 
            ? `Continuar a Planes →` 
            : 'Selecciona al menos un agente'
          }
        </button>
      </div>
    </div>
    );
  };

  const renderPlansTab = () => {
    console.log('💼 Renderizando pestaña de Planes');
    return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Planes de Suscripción AIM</h3>
        <p className="text-gray-600">Elige el modelo de implementación que mejor se adapte a tu estrategia técnica</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {subscriptionPlans.map(plan => {
          const isSelected = selectedPlan?.id === plan.id;
          const colorClasses = {
            teal: isSelected ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:border-teal-300',
            blue: isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300',
            purple: isSelected ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'
          };

          return (
            <div 
              key={plan.id}
              className={`border-2 rounded-lg p-6 cursor-pointer transition-all duration-200 ${colorClasses[plan.color]} ${
                plan.recommended ? 'ring-2 ring-teal-200' : ''
              }`}
              onClick={() => {
                setSelectedPlan(plan);
                markQuoteAsOutdated();
              }}
            >
              {plan.recommended && (
                <div className="text-center mb-4">
                  <span className="bg-teal-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                    Recomendado
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <div className="text-3xl mb-2">{plan.icon}</div>
                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                <p className="text-sm text-gray-600 font-medium">{plan.subtitle}</p>
                <p className="text-xs text-gray-500 mt-2">{plan.description}</p>
              </div>

              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-gray-900">
                  ${plan.monthlyPrice.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">por mes</div>
                {plan.setupFee > 0 && (
                  <div className="text-xs text-gray-500 mt-1">
                    + ${plan.setupFee.toLocaleString()} configuración inicial
                  </div>
                )}
                <div className="text-xs text-orange-600 mt-1">
                  Multiplicador agentes: {plan.agentPriceMultiplier}x
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 text-sm mb-2">Incluye:</h4>
                  <ul className="space-y-1">
                    {plan.included.slice(0, 4).map((item, idx) => (
                      <li key={idx} className="text-xs text-gray-600 flex items-start">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 mt-1.5 flex-shrink-0"></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 text-sm mb-2">Beneficios:</h4>
                  <ul className="space-y-1">
                    {plan.benefits.slice(0, 2).map((benefit, idx) => (
                      <li key={idx} className="text-xs text-gray-600 flex items-start">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 mt-1.5 flex-shrink-0"></span>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {isSelected && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center text-green-700 text-sm">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Plan seleccionado
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedPlan && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Plan Seleccionado: {selectedPlan.name}</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Costo mensual:</span>
              <span className="ml-2 font-medium">${selectedPlan.monthlyPrice.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-gray-600">Configuración inicial:</span>
              <span className="ml-2 font-medium">${selectedPlan.setupFee.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Botón de avance */}
      <div className="flex justify-center mt-6">
        <button 
          onClick={goToNextStep}
          disabled={!selectedPlan}
          className={`px-8 py-3 rounded-lg font-medium transition-colors ${
            selectedPlan
              ? 'bg-teal-600 text-white hover:bg-teal-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {selectedPlan 
            ? `Continuar a Servicios →` 
            : 'Selecciona un plan de suscripción'
          }
        </button>
      </div>
    </div>
    );
  };

  const renderServicesTab = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Servicios Adicionales</h3>
        <p className="text-gray-600">Complementa tu proyecto con servicios especializados</p>
      </div>

      {additionalServices.map(category => (
        <div key={category.category} className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">{category.icon}</div>
            <h3 className="text-lg font-semibold text-gray-900">{category.category}</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {category.services.map(service => {
              const isSelected = selectedServices.find(s => s.id === service.id);

              return (
                <div 
                  key={service.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                    isSelected 
                      ? 'border-teal-500 bg-teal-50' 
                      : 'border-gray-200 hover:border-teal-300'
                  }`}
                  onClick={() => toggleService(service)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{service.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                    </div>
                    <div className="text-right ml-4">
                      <div className="font-bold text-teal-600">
                        ${service.price.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        por {service.unit}
                      </div>
                    </div>
                  </div>

                  {service.duration && (
                    <div className="text-xs text-gray-600 mb-2">
                      Duración: {service.duration}
                      {service.participants && ` | ${service.participants}`}
                    </div>
                  )}

                  {service.includes && (
                    <div className="mt-3">
                      <h5 className="text-xs font-medium text-gray-700 mb-1">Incluye:</h5>
                      <div className="flex flex-wrap gap-1">
                        {service.includes.slice(0, 2).map((item, idx) => (
                          <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {item}
                          </span>
                        ))}
                        {service.includes.length > 2 && (
                          <span className="text-xs text-gray-500">
                            +{service.includes.length - 2} más
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {isSelected && (
                    <div className="mt-3 pt-3 border-t border-teal-200">
                      <div className="flex items-center text-teal-700 text-sm">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Servicio seleccionado
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {selectedServices.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Servicios Seleccionados ({selectedServices.length})</h4>
          <div className="space-y-2">
            {selectedServices.map(service => (
              <div key={service.id} className="flex justify-between items-center text-sm">
                <span>{service.name}</span>
                <span className="font-medium">${service.price.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Botón de avance */}
      <div className="flex justify-center mt-6">
        <button 
          onClick={goToNextStep}
          className="px-8 py-3 rounded-lg font-medium bg-teal-600 text-white hover:bg-teal-700 transition-colors"
        >
          Continuar a Configuración →
        </button>
      </div>
    </div>
  );

  const renderConfigTab = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Configuración de la Cotización</h3>
        <p className="text-gray-600">Ajusta los parámetros generales de la propuesta</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Moneda
            </label>
            <select 
              value={quoteConfig.currency}
              onChange={(e) => {
                setQuoteConfig({...quoteConfig, currency: e.target.value});
                markQuoteAsOutdated();
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              <option value="MXN">Peso Mexicano (MXN)</option>
              <option value="USD">Dólar Americano (USD)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vigencia de la cotización (días)
            </label>
            <input 
              type="number"
              value={quoteConfig.validityDays}
              onChange={(e) => {
                setQuoteConfig({...quoteConfig, validityDays: parseInt(e.target.value)});
                markQuoteAsOutdated();
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              min="7"
              max="90"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Términos de Pago
            </label>
            <select 
              value={quoteConfig.paymentTerms}
              onChange={(e) => {
                setQuoteConfig({...quoteConfig, paymentTerms: e.target.value});
                markQuoteAsOutdated();
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              {paymentTerms.map(term => (
                <option key={term.value} value={term.value}>
                  {term.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {paymentTerms.find(t => t.value === quoteConfig.paymentTerms)?.description}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Opción de Garantía
            </label>
            <select 
              value={quoteConfig.warrantyOption}
              onChange={(e) => {
                setQuoteConfig({...quoteConfig, warrantyOption: e.target.value});
                markQuoteAsOutdated();
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              {warrantyOptions.map(warranty => (
                <option key={warranty.value} value={warranty.value}>
                  {warranty.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {warrantyOptions.find(w => w.value === quoteConfig.warrantyOption)?.description}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Configuración Actual</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-blue-700">Moneda:</span>
            <span className="ml-2 font-medium">{quoteConfig.currency}</span>
          </div>
          <div>
            <span className="text-blue-700">Vigencia:</span>
            <span className="ml-2 font-medium">{quoteConfig.validityDays} días</span>
          </div>
          <div className="col-span-2">
            <span className="text-blue-700">Términos de pago:</span>
            <span className="ml-2 font-medium">
              {paymentTerms.find(t => t.value === quoteConfig.paymentTerms)?.label}
            </span>
          </div>
          <div className="col-span-2">
            <span className="text-blue-700">Garantía:</span>
            <span className="ml-2 font-medium">
              {warrantyOptions.find(w => w.value === quoteConfig.warrantyOption)?.label}
            </span>
          </div>
        </div>
      </div>

      {/* Botón de avance */}
      <div className="flex justify-center mt-6">
        <button 
          onClick={goToNextStep}
          className="px-8 py-3 rounded-lg font-medium bg-teal-600 text-white hover:bg-teal-700 transition-colors"
        >
          Ver Resumen Final →
        </button>
      </div>
    </div>
  );

  const renderResultsTab = () => {
    // Usar datos del estado si están disponibles, sino calcular sin notificar
    const results = isQuoteCalculated && quoteResults ? quoteResults : calculateQuoteTotals(false);
    
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Resumen de la Cotización</h3>
          <p className="text-gray-600">Desglose completo de costos y configuración</p>
        </div>

        {/* Indicador de estado de cotización */}
        {!isQuoteCalculated && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span className="text-sm text-yellow-800">Cotización desactualizada. Los valores mostrados son preliminares.</span>
              </div>
              <button
                onClick={updateQuote}
                className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-700 transition-colors"
              >
                Actualizar Cotización
              </button>
            </div>
          </div>
        )}

        {/* Resumen de selecciones */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
            <h4 className="font-medium text-teal-900 mb-2">🤖 Agentes Seleccionados</h4>
            {selectedAgents.length > 0 ? (
              <ul className="space-y-1">
                {selectedAgents.map(agent => (
                  <li key={agent.id} className="text-sm text-teal-700">
                    • {agent.name}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-teal-600">Ningún agente seleccionado</p>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">💼 Plan de Suscripción</h4>
            {selectedPlan ? (
              <div className="text-sm text-blue-700">
                <p className="font-medium">{selectedPlan.name}</p>
                <p>{selectedPlan.subtitle}</p>
              </div>
            ) : (
              <p className="text-sm text-blue-600">Ningún plan seleccionado</p>
            )}
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-medium text-purple-900 mb-2">⚙️ Servicios Adicionales</h4>
            {selectedServices.length > 0 ? (
              <ul className="space-y-1">
                {selectedServices.slice(0, 3).map(service => (
                  <li key={service.id} className="text-sm text-purple-700">
                    • {service.name}
                  </li>
                ))}
                {selectedServices.length > 3 && (
                  <li className="text-sm text-purple-600">
                    +{selectedServices.length - 3} servicios más
                  </li>
                )}
              </ul>
            ) : (
              <p className="text-sm text-purple-600">Ningún servicio adicional</p>
            )}
          </div>
        </div>

        {/* Desglose de costos */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-6 py-4">
            <h4 className="font-semibold text-gray-900">💰 Desglose de Costos</h4>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-700">Agentes (implementación)</span>
              <span className="font-medium">${results.calculations.baseTotal.toLocaleString()} {results.calculations.currency}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-700">Configuración inicial</span>
              <span className="font-medium">${results.calculations.setupTotal.toLocaleString()} {results.calculations.currency}</span>
            </div>

            {results.calculations.warrantyTotal > 0 && (
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-700">Garantía extendida</span>
                <span className="font-medium">${results.calculations.warrantyTotal.toLocaleString()} {results.calculations.currency}</span>
              </div>
            )}

            <div className="flex justify-between items-center py-2 border-b-2 border-gray-300">
              <span className="text-gray-700">Costo mensual recurrente</span>
              <span className="font-medium">${results.calculations.monthlyTotal.toLocaleString()} {results.calculations.currency}/mes</span>
            </div>

            <div className="flex justify-between items-center py-3 bg-teal-50 rounded-lg px-4">
              <span className="text-lg font-semibold text-teal-900">Total Inicial</span>
              <span className="text-xl font-bold text-teal-600">
                ${results.calculations.grandTotal.toLocaleString()} {results.calculations.currency}
              </span>
            </div>

            <div className="flex justify-between items-center py-3 bg-blue-50 rounded-lg px-4">
              <span className="text-lg font-semibold text-blue-900">Total Primer Año</span>
              <span className="text-xl font-bold text-blue-600">
                ${results.calculations.firstYearTotal.toLocaleString()} {results.calculations.currency}
              </span>
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">📋 Detalles de la Cotización</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Vigencia:</span>
                <span className="font-medium">{quoteConfig.validityDays} días</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Moneda:</span>
                <span className="font-medium">{quoteConfig.currency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Términos de pago:</span>
                <span className="font-medium">
                  {paymentTerms.find(t => t.value === quoteConfig.paymentTerms)?.label}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Garantía:</span>
                <span className="font-medium">
                  {warrantyOptions.find(w => w.value === quoteConfig.warrantyOption)?.label}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-3">⏱️ Cronograma Estimado</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-green-700">Agentes a implementar:</span>
                <span className="font-medium">{selectedAgents.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">Tiempo total estimado:</span>
                <span className="font-medium">
                  {selectedAgents.reduce((total, agent) => {
                    const days = parseInt(agent.estimatedDays?.split('-')[1] || agent.estimatedDays?.split(' ')[0] || '0');
                    return total + days;
                  }, 0)} días
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">Complejidad promedio:</span>
                <span className="font-medium">
                  {selectedAgents.length > 0 ? 
                    selectedAgents.map(a => a.complexity).join(', ') : 
                    'N/A'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Botón para exportar/finalizar */}
        <div className="text-center pt-6 border-t border-gray-200">
          <button 
            onClick={() => {
              // Asegurar que la cotización esté actualizada antes de guardar
              const finalResults = isQuoteCalculated ? results : calculateQuoteTotals(true);
              console.log('📊 Cotización finalizada:', finalResults);
              alert('Cotización guardada en el documento');
            }}
            className="bg-teal-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors"
          >
            {isQuoteCalculated ? 'Guardar Cotización en Documento' : 'Calcular y Guardar Cotización'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white p-6">
        <h3 className="text-xl font-bold mb-2">Cotizador AIM Dinámico</h3>
        <p className="text-teal-100">Configura agentes, planes y servicios para generar una cotización completa</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-0">
          {steps.map((step, index) => {
            // Indicadores de progreso
            let indicator = '';
            if (index === 0 && selectedAgents.length > 0) indicator = '✓';
            if (index === 1 && selectedPlan) indicator = '✓';
            if (index === 2 && selectedServices.length > 0) indicator = '✓';
            if (index === 3) indicator = '⚙️';
            if (index === 4) indicator = '📊';

            return (
              <button
                key={step.id}
                onClick={() => {
                  console.log('🖱️ Click en tab:', step.id, step.name);
                  setCurrentStep(step.id);
                }}
                className={`relative flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-all duration-200 ${
                  currentStep === step.id
                    ? 'border-teal-500 text-teal-600 bg-teal-50 shadow-sm'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }`}
                style={{ userSelect: 'none' }}
              >
                <span className="flex items-center justify-center gap-2">
                  {step.title}
                  {indicator && (
                    <span className="text-xs opacity-75">{indicator}</span>
                  )}
                </span>
                {currentStep === step.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-500 rounded-t"></div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6 min-h-[600px]">
        {/* Progress info */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-blue-700 font-medium">
              Paso {currentStep + 1} de {steps.length}: {steps[currentStep].title}
            </span>
            <span className="text-blue-600 text-xs">
              {selectedAgents.length} agente(s) | {selectedPlan ? '1 plan' : '0 planes'} | {selectedServices.length} servicio(s)
            </span>
          </div>
          <div className="mt-2 w-full bg-blue-200 rounded-full h-1.5">
            <div 
              className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Quick navigation for testing */}
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-700 text-sm mb-2">🧪 Navegación rápida para testing:</p>
          <div className="flex gap-2">
            {steps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => goToStep(index)}
                className={`px-3 py-1 text-xs rounded ${
                  currentStep === index 
                    ? 'bg-yellow-500 text-white' 
                    : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                }`}
              >
                {step.name}
              </button>
            ))}
          </div>
        </div>
        
        {/* Tab content with error boundaries */}
        {(() => {
          try {
            console.log('🎨 Renderizando tab:', currentStep);
            switch (currentStep) {
              case 0:
                return renderAgentsTab();
              case 1:
                return renderPlansTab();
              case 2:
                return renderServicesTab();
              case 3:
                return renderConfigTab();
              case 4:
                return renderResultsTab();
              default:
                return <div className="text-center text-gray-500">Tab no encontrado</div>;
            }
          } catch (error) {
            console.error('❌ Error renderizando tab:', currentStep, error);
            return (
              <div className="text-center text-red-500 p-8">
                <h3 className="text-lg font-semibold mb-2">Error de renderizado</h3>
                <p>Hubo un problema al cargar este tab.</p>
                <button 
                  onClick={() => setCurrentStep(0)}
                  className="mt-4 px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600"
                >
                  Volver a Agentes
                </button>
              </div>
            );
          }
        })()}

        {/* Navigation buttons */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={goToPreviousStep}
            disabled={currentStep === 0}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              currentStep === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            ← Anterior
          </button>

          <div className="flex space-x-2">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  currentStep === index ? 'bg-teal-500' : 'bg-gray-300 hover:bg-gray-400'
                }`}
                title={`Ir a ${steps[index].title}`}
              />
            ))}
          </div>

          <button
            onClick={goToNextStep}
            disabled={currentStep === steps.length - 1}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              currentStep === steps.length - 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-teal-500 text-white hover:bg-teal-600'
            }`}
          >
            Siguiente →
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIMQuoteCalculator; 