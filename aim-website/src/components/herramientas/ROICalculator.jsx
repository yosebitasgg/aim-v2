// src/components/herramientas/ROICalculator.jsx
import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title } from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';

// Registrar los componentes de Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title);

const ROICalculator = ({ isEmbedded = false, onCalculationChange = null }) => {
  // Estados para empleados
  const [employees, setEmployees] = useState([]);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    position: '',
    monthlySalary: '',
    hoursPerMonth: 160,
    affectedPercentage: 50
  });

  // Estados para agentes
  const [availableAgents, setAvailableAgents] = useState([]);
  const [selectedAgents, setSelectedAgents] = useState([]);

  // Estados para cálculos
  const [roiData, setRoiData] = useState(null);
  const [showResults, setShowResults] = useState(false);

  // Estados para UI
  const [activeTab, setActiveTab] = useState('employees');
  const [currentStep, setCurrentStep] = useState(1);

  // Actualizar currentStep basado en activeTab para versión no embebida
  useEffect(() => {
    if (!isEmbedded) {
      switch (activeTab) {
        case 'employees':
          setCurrentStep(1);
          break;
        case 'agents':
          setCurrentStep(2);
          break;
        case 'results':
          setCurrentStep(3);
          break;
        default:
          setCurrentStep(1);
      }
    }
  }, [activeTab, isEmbedded]);

  // Configuración de agentes disponibles
  useEffect(() => {
    const agents = [
      {
        id: 'data_processing',
        name: 'Agente de Procesamiento de Datos',
        type: 'data_processing',
        description: 'Automatiza el procesamiento y análisis de grandes volúmenes de datos',
        timeSavingPercentage: 85,
        errorReductionPercentage: 95,
        costPerMonth: 2500,
        implementationCost: 15000,
        maintenanceCostPerMonth: 500,
        productivityIncrease: 75,
        icon: '📊',
        benefits: [
          'Procesamiento 24/7 sin interrupciones',
          'Reducción de errores humanos',
          'Análisis en tiempo real',
          'Escalabilidad automática'
        ]
      },
      {
        id: 'customer_service',
        name: 'Agente de Atención al Cliente',
        type: 'customer_service',
        description: 'Maneja consultas y soporte al cliente de forma inteligente',
        timeSavingPercentage: 70,
        errorReductionPercentage: 80,
        costPerMonth: 1800,
        implementationCost: 12000,
        maintenanceCostPerMonth: 300,
        productivityIncrease: 60,
        icon: '👥',
        benefits: [
          'Respuesta instantánea 24/7',
          'Manejo de múltiples consultas simultáneas',
          'Escalamiento inteligente',
          'Historial completo de interacciones'
        ]
      },
      {
        id: 'inventory',
        name: 'Agente de Gestión de Inventario',
        type: 'inventory',
        description: 'Optimiza el control y gestión de inventarios',
        timeSavingPercentage: 90,
        errorReductionPercentage: 98,
        costPerMonth: 2200,
        implementationCost: 18000,
        maintenanceCostPerMonth: 400,
        productivityIncrease: 85,
        icon: '📦',
        benefits: [
          'Monitoreo en tiempo real',
          'Predicción de demanda',
          'Reabastecimiento automático',
          'Optimización de almacenamiento'
        ]
      },
      {
        id: 'reporting',
        name: 'Agente de Reportes Automáticos',
        type: 'reporting',
        description: 'Genera reportes y análisis automatizados',
        timeSavingPercentage: 95,
        errorReductionPercentage: 90,
        costPerMonth: 1500,
        implementationCost: 8000,
        maintenanceCostPerMonth: 200,
        productivityIncrease: 80,
        icon: '📈',
        benefits: [
          'Reportes automáticos programados',
          'Visualizaciones dinámicas',
          'Alertas personalizadas',
          'Distribución automática'
        ]
      },
      {
        id: 'communication',
        name: 'Agente de Comunicación',
        type: 'communication',
        description: 'Automatiza comunicaciones internas y externas',
        timeSavingPercentage: 75,
        errorReductionPercentage: 85,
        costPerMonth: 1200,
        implementationCost: 6000,
        maintenanceCostPerMonth: 150,
        productivityIncrease: 65,
        icon: '📧',
        benefits: [
          'Envío masivo personalizado',
          'Seguimiento de comunicaciones',
          'Respuestas automáticas',
          'Integración multi-canal'
        ]
      },
      {
        id: 'workflow',
        name: 'Agente de Flujo de Trabajo',
        type: 'workflow',
        description: 'Optimiza y automatiza procesos de negocio',
        timeSavingPercentage: 80,
        errorReductionPercentage: 92,
        costPerMonth: 3000,
        implementationCost: 25000,
        maintenanceCostPerMonth: 600,
        productivityIncrease: 90,
        icon: '🔄',
        benefits: [
          'Automatización end-to-end',
          'Reglas de negocio inteligentes',
          'Monitoreo de procesos',
          'Optimización continua'
        ]
      }
    ];

    setAvailableAgents(agents);
  }, []);

  // Funciones para manejo de empleados
  const addEmployee = () => {
    if (newEmployee.name && newEmployee.position && newEmployee.monthlySalary) {
      const hourlyRate = parseFloat(newEmployee.monthlySalary) / parseFloat(newEmployee.hoursPerMonth);
      const employee = {
        id: Date.now().toString(),
        ...newEmployee,
        monthlySalary: parseFloat(newEmployee.monthlySalary),
        hoursPerMonth: parseFloat(newEmployee.hoursPerMonth),
        affectedPercentage: parseFloat(newEmployee.affectedPercentage),
        hourlyRate: hourlyRate
      };
      
      setEmployees([...employees, employee]);
      setNewEmployee({
        name: '',
        position: '',
        monthlySalary: '',
        hoursPerMonth: 160,
        affectedPercentage: 50
      });
    }
  };

  const removeEmployee = (id) => {
    setEmployees(employees.filter(emp => emp.id !== id));
  };

  const toggleAgent = (agent) => {
    const isSelected = selectedAgents.find(a => a.id === agent.id);
    if (isSelected) {
      setSelectedAgents(selectedAgents.filter(a => a.id !== agent.id));
    } else {
      setSelectedAgents([...selectedAgents, agent]);
    }
  };

  // Funciones de navegación
  const goToNextStep = () => {
    if (currentStep === 1 && employees.length > 0) {
      setCurrentStep(2);
    } else if (currentStep === 2 && selectedAgents.length > 0) {
      setCurrentStep(3);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canContinue = () => {
    if (currentStep === 1) return employees.length > 0;
    if (currentStep === 2) return selectedAgents.length > 0;
    return false;
  };

  // Función principal de cálculo ROI
  const calculateROI = () => {
    if (employees.length === 0 || selectedAgents.length === 0) {
      alert('Por favor agrega al menos un empleado y selecciona al menos un agente');
      return;
    }

    // Calcular costos actuales
    const currentMonthlyCosts = employees.reduce((total, emp) => {
      return total + (emp.monthlySalary * (emp.affectedPercentage / 100));
    }, 0);

    const currentAnnualCost = currentMonthlyCosts * 12;

    // Calcular ahorros con agentes
    const agentCosts = selectedAgents.reduce((total, agent) => {
      return total + agent.costPerMonth;
    }, 0);

    const agentMaintenanceCosts = selectedAgents.reduce((total, agent) => {
      return total + agent.maintenanceCostPerMonth;
    }, 0);

    const totalImplementationCost = selectedAgents.reduce((total, agent) => {
      return total + agent.implementationCost;
    }, 0);

    // Calcular ahorros por tiempo
    const avgTimeSaving = selectedAgents.reduce((total, agent) => {
      return total + agent.timeSavingPercentage;
    }, 0) / selectedAgents.length;

    const timeSavings = currentMonthlyCosts * (avgTimeSaving / 100);

    // Calcular ahorros por reducción de errores
    const avgErrorReduction = selectedAgents.reduce((total, agent) => {
      return total + agent.errorReductionPercentage;
    }, 0) / selectedAgents.length;

    const errorReductionValue = currentMonthlyCosts * 0.15 * (avgErrorReduction / 100); // 15% de costos se atribuyen a errores

    // Calcular ahorros por productividad
    const avgProductivityIncrease = selectedAgents.reduce((total, agent) => {
      return total + agent.productivityIncrease;
    }, 0) / selectedAgents.length;

    const productivityValue = currentMonthlyCosts * (avgProductivityIncrease / 100) * 0.3; // 30% de productividad se traduce en ahorros

    const totalMonthlySavings = timeSavings + errorReductionValue + productivityValue;
    const netMonthlySavings = totalMonthlySavings - agentCosts - agentMaintenanceCosts;
    const projectedAnnualSavings = netMonthlySavings * 12;

    // Calcular métricas financieras
    const paybackMonths = totalImplementationCost / netMonthlySavings;
    const fiveYearSavings = (projectedAnnualSavings * 5) - totalImplementationCost;
    const roiPercentage = (fiveYearSavings / totalImplementationCost) * 100;

    // Calcular NPV (asumiendo 10% tasa de descuento)
    const discountRate = 0.10;
    let netPresentValue = -totalImplementationCost;
    for (let year = 1; year <= 5; year++) {
      netPresentValue += projectedAnnualSavings / Math.pow(1 + discountRate, year);
    }

    // Calcular IRR (aproximación)
    const internalRateOfReturn = ((projectedAnnualSavings / totalImplementationCost) * 100) - discountRate * 100;

    // Datos para gráficas
    const savingsOverTime = [];
    let cumulativeSavings = -totalImplementationCost;
    for (let month = 1; month <= 60; month++) {
      cumulativeSavings += netMonthlySavings;
      savingsOverTime.push({
        month,
        cumulativeSavings: cumulativeSavings,
        monthlySavings: netMonthlySavings,
        roi: totalImplementationCost !== 0 ? (cumulativeSavings / totalImplementationCost) * 100 : 0
      });
    }

    const calculationResult = {
      employees,
      selectedAgents,
      currentMonthlyCosts,
      projectedMonthlySavings: netMonthlySavings,
      totalImplementationCost,
      monthlyMaintenanceCost: agentMaintenanceCosts,
      roiPercentage,
      paybackMonths,
      netPresentValue,
      internalRateOfReturn,
      fiveYearSavings,
      calculations: {
        currentAnnualCost,
        projectedAnnualSavings,
        totalAnnualSavings: projectedAnnualSavings,
        breakEvenPoint: paybackMonths,
        efficiencyGain: avgTimeSaving,
        errorReductionValue,
        productivityValue
      },
      charts: {
        savingsOverTime,
        costBreakdown: {
          implementation: totalImplementationCost,
          maintenance: agentMaintenanceCosts * 12,
          currentOperational: currentAnnualCost,
          projectedOperational: agentCosts * 12
        },
        benefitsBreakdown: {
          timeSavings: timeSavings * 12,
          errorReduction: errorReductionValue * 12,
          productivityIncrease: productivityValue * 12,
          otherBenefits: 0
        }
      }
    };

    setRoiData(calculationResult);
    setShowResults(true);

    // Si hay callback, enviar los datos
    if (onCalculationChange) {
      onCalculationChange(calculationResult);
    }
  };

  // Preparar datos para las gráficas
  const getPieChartData = (data, labels, colors) => ({
    labels,
    datasets: [{
      data,
      backgroundColor: colors,
      borderColor: colors.map(color => color.replace('0.8', '1')),
      borderWidth: 2
    }]
  });

  const getLineChartData = () => {
    if (!roiData) return null;

    return {
      labels: roiData.charts.savingsOverTime.filter((_, index) => index % 6 === 0).map(item => `Mes ${item.month}`),
      datasets: [
        {
          label: 'Ahorros Acumulados',
          data: roiData.charts.savingsOverTime.filter((_, index) => index % 6 === 0).map(item => item.cumulativeSavings),
          borderColor: 'rgb(20, 184, 166)',
          backgroundColor: 'rgba(20, 184, 166, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'ROI %',
          data: roiData.charts.savingsOverTime.filter((_, index) => index % 6 === 0).map(item => item.roi),
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          yAxisID: 'y1',
          tension: 0.4
        }
      ]
    };
  };

  const getBarChartData = () => {
    if (!roiData) return null;

    return {
      labels: ['Costos Actuales', 'Costos con Automatización', 'Ahorros Netos'],
      datasets: [
        {
          label: 'Montos Anuales (MXN)',
          data: [
            roiData.calculations.currentAnnualCost,
            roiData.charts.costBreakdown.projectedOperational + roiData.charts.costBreakdown.maintenance,
            roiData.calculations.projectedAnnualSavings
          ],
          backgroundColor: [
            'rgba(239, 68, 68, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(16, 185, 129, 0.8)'
          ],
          borderColor: [
            'rgb(239, 68, 68)',
            'rgb(245, 158, 11)',
            'rgb(16, 185, 129)'
          ],
          borderWidth: 1
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Análisis Financiero ROI'
      }
    }
  };

  if (isEmbedded) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-gray-900 mb-6"></h2>
        
        {/* Indicador de progreso */}
        <div className="mb-8">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between">
              <div className={`flex flex-col items-center ${currentStep >= 1 ? 'text-teal-600' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${currentStep >= 1 ? 'bg-teal-600 text-white shadow-lg' : 'bg-gray-300 text-gray-600'}`}>
                  {currentStep > 1 ? '✓' : '1'}
                </div>
                <span className="mt-2 text-sm font-medium">Empleados</span>
              </div>
              
              <div className="flex-1 mx-6">
                <div className={`h-1.5 rounded-full transition-all duration-500 ${currentStep >= 2 ? 'bg-teal-600' : 'bg-gray-300'}`}></div>
              </div>
              
              <div className={`flex flex-col items-center ${currentStep >= 2 ? 'text-teal-600' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${currentStep >= 2 ? 'bg-teal-600 text-white shadow-lg' : 'bg-gray-300 text-gray-600'}`}>
                  {currentStep > 2 ? '✓' : '2'}
                </div>
                <span className="mt-2 text-sm font-medium">Agentes</span>
              </div>
              
              <div className="flex-1 mx-6">
                <div className={`h-1.5 rounded-full transition-all duration-500 ${currentStep >= 3 ? 'bg-teal-600' : 'bg-gray-300'}`}></div>
              </div>
              
              <div className={`flex flex-col items-center ${currentStep >= 3 ? 'text-teal-600' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${currentStep >= 3 ? 'bg-teal-600 text-white shadow-lg' : 'bg-gray-300 text-gray-600'}`}>
                  3
                </div>
                <span className="mt-2 text-sm font-medium">Resultados</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido de pasos */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-teal-50 to-emerald-50 p-6 rounded-xl border border-teal-200">
              <h3 className="text-xl font-semibold text-teal-900 mb-2">Paso 1: Información de Empleados</h3>
              <p className="text-teal-700 mb-4">Agrega información sobre los empleados cuyos procesos se automatizarán</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input
                    type="text"
                    value={newEmployee.name}
                    onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Nombre del empleado"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Posición</label>
                  <input
                    type="text"
                    value={newEmployee.position}
                    onChange={(e) => setNewEmployee({...newEmployee, position: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Puesto de trabajo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Salario Mensual (MXN)</label>
                  <input
                    type="number"
                    value={newEmployee.monthlySalary}
                    onChange={(e) => setNewEmployee({...newEmployee, monthlySalary: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                    placeholder="15000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Horas por Mes</label>
                  <input
                    type="number"
                    value={newEmployee.hoursPerMonth}
                    onChange={(e) => setNewEmployee({...newEmployee, hoursPerMonth: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                    placeholder="160"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">% Afectado por Automatización</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newEmployee.affectedPercentage}
                    onChange={(e) => setNewEmployee({...newEmployee, affectedPercentage: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                    placeholder="50"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={addEmployee}
                    className="w-full bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                  >
                    Agregar Empleado
                  </button>
                </div>
              </div>
            </div>

            {/* Lista de empleados */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Empleados Agregados ({employees.length})</h3>
              {employees.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No hay empleados agregados</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {employees.map((employee) => (
                    <div key={employee.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">{employee.name}</h4>
                          <p className="text-sm text-gray-600">{employee.position}</p>
                        </div>
                        <button
                          onClick={() => removeEmployee(employee.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Salario:</span>
                          <span className="ml-1 font-medium">${employee.monthlySalary.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Horas:</span>
                          <span className="ml-1 font-medium">{employee.hoursPerMonth}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">% Afectado:</span>
                          <span className="ml-1 font-medium">{employee.affectedPercentage}%</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Tarifa/hora:</span>
                          <span className="ml-1 font-medium">${employee.hourlyRate.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Botones de navegación para paso 1 */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
              <div></div>
              <button
                onClick={goToNextStep}
                disabled={!canContinue()}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  canContinue()
                    ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-md hover:shadow-lg'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Continuar a Agentes →
              </button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-teal-50 to-emerald-50 p-6 rounded-xl border border-teal-200">
              <h3 className="text-xl font-semibold text-teal-900 mb-2">Paso 2: Seleccionar Agentes de Automatización</h3>
              <p className="text-teal-700 mb-4">
                Selecciona los agentes que implementarás para automatizar los procesos de tu negocio.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableAgents.map((agent) => {
                const isSelected = selectedAgents.find(a => a.id === agent.id);
                return (
                  <div
                    key={agent.id}
                    className={`bg-white border-2 rounded-lg p-6 cursor-pointer transition-all duration-200 ${
                      isSelected 
                        ? 'border-teal-500 bg-teal-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => toggleAgent(agent)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-3xl">{agent.icon}</div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'bg-teal-500 border-teal-500' : 'border-gray-300'
                      }`}>
                        {isSelected && <span className="text-white text-sm">✓</span>}
                      </div>
                    </div>
                    
                    <h4 className="font-semibold text-gray-900 mb-2">{agent.name}</h4>
                    <p className="text-sm text-gray-600 mb-4">{agent.description}</p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Ahorro de tiempo:</span>
                        <span className="font-medium text-teal-600">{agent.timeSavingPercentage}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Reducción errores:</span>
                        <span className="font-medium text-teal-600">{agent.errorReductionPercentage}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Costo mensual:</span>
                        <span className="font-medium">${agent.costPerMonth.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Implementación:</span>
                        <span className="font-medium">${agent.implementationCost.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h5 className="font-medium text-gray-900 mb-2">Beneficios:</h5>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {agent.benefits.map((benefit, index) => (
                          <li key={index} className="flex items-center">
                            <span className="mr-2">•</span>
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedAgents.length > 0 && (
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                <h4 className="font-medium text-teal-900 mb-2">Agentes Seleccionados ({selectedAgents.length})</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedAgents.map((agent) => (
                    <span
                      key={agent.id}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-teal-100 text-teal-800"
                    >
                      {agent.icon} {agent.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Botones de navegación para paso 2 */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
              <button
                onClick={goToPreviousStep}
                className="px-6 py-3 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
              >
                ← Volver a Empleados
              </button>
              <button
                onClick={goToNextStep}
                disabled={!canContinue()}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  canContinue()
                    ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-md hover:shadow-lg'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Ver Resultados →
              </button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-teal-50 to-emerald-50 p-6 rounded-xl border border-teal-200">
              <h3 className="text-xl font-semibold text-teal-900 mb-2">Paso 3: Análisis de Resultados</h3>
              <p className="text-teal-700 mb-4">Revisa el análisis detallado del ROI de tu inversión en automatización</p>
            </div>

            {!showResults ? (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Calcula tu ROI</h3>
                <p className="text-gray-600 mb-6">
                  Agrega empleados y selecciona agentes para ver los resultados
                </p>
                <button
                  onClick={calculateROI}
                  className="bg-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-teal-700 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                >
                  Calcular ROI
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Resumen ejecutivo */}
                <div className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white p-6 rounded-lg">
                  <h3 className="text-xl font-bold mb-4">Resumen Ejecutivo</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold">{roiData.roiPercentage.toFixed(1)}%</div>
                      <div className="text-sm opacity-90">ROI a 5 años</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold">${roiData.fiveYearSavings.toLocaleString()}</div>
                      <div className="text-sm opacity-90">Ahorros netos (5 años)</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold">{roiData.paybackMonths.toFixed(1)}</div>
                      <div className="text-sm opacity-90">Meses para recuperar inversión</div>
                    </div>
                  </div>
                </div>

                                     {/* Métricas detalladas */}
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                       <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                         <div className="text-center">
                           <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Costos Actuales</p>
                           <p className="text-3xl font-bold text-red-600 mt-2">
                             ${roiData.currentMonthlyCosts.toLocaleString()}
                           </p>
                           <p className="text-sm text-gray-500 mt-1">por mes</p>
                         </div>
                       </div>

                       <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                         <div className="text-center">
                           <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Ahorros Proyectados</p>
                           <p className="text-3xl font-bold text-teal-600 mt-2">
                             ${roiData.projectedMonthlySavings.toLocaleString()}
                           </p>
                           <p className="text-sm text-gray-500 mt-1">por mes</p>
                         </div>
                       </div>

                       <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                         <div className="text-center">
                           <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Inversión Inicial</p>
                           <p className="text-3xl font-bold text-blue-600 mt-2">
                             ${roiData.totalImplementationCost.toLocaleString()}
                           </p>
                           <p className="text-sm text-gray-500 mt-1">una vez</p>
                         </div>
                       </div>

                       <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                         <div className="text-center">
                           <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Mantenimiento</p>
                           <p className="text-3xl font-bold text-orange-600 mt-2">
                             ${roiData.monthlyMaintenanceCost.toLocaleString()}
                           </p>
                           <p className="text-sm text-gray-500 mt-1">por mes</p>
                         </div>
                       </div>
                     </div>

                {/* Gráficas */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-4">Proyección de Ahorros</h4>
                    <div className="h-64">
                      <Line data={getLineChartData()} options={{
                        ...chartOptions,
                        scales: {
                          y: {
                            type: 'linear',
                            display: true,
                            position: 'left',
                            title: {
                              display: true,
                              text: 'Ahorros Acumulados (MXN)'
                            }
                          },
                          y1: {
                            type: 'linear',
                            display: true,
                            position: 'right',
                            title: {
                              display: true,
                              text: 'ROI (%)'
                            },
                            grid: {
                              drawOnChartArea: false,
                            },
                          }
                        }
                      }} />
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-4">Comparación de Costos</h4>
                    <div className="h-64">
                      <Bar data={getBarChartData()} options={chartOptions} />
                    </div>
                  </div>
                </div>

                {/* Desglose de beneficios */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-4">Desglose de Costos</h4>
                    <div className="h-64">
                      <Pie data={getPieChartData(
                        [
                          roiData.charts.costBreakdown.implementation,
                          roiData.charts.costBreakdown.maintenance,
                          roiData.charts.costBreakdown.projectedOperational
                        ],
                        ['Implementación', 'Mantenimiento (anual)', 'Operación (anual)'],
                        [
                          'rgba(239, 68, 68, 0.8)',
                          'rgba(245, 158, 11, 0.8)',
                          'rgba(59, 130, 246, 0.8)'
                        ]
                      )} options={chartOptions} />
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-4">Desglose de Beneficios</h4>
                    <div className="h-64">
                      <Pie data={getPieChartData(
                        [
                          roiData.charts.benefitsBreakdown.timeSavings,
                          roiData.charts.benefitsBreakdown.errorReduction,
                          roiData.charts.benefitsBreakdown.productivityIncrease
                        ],
                        ['Ahorro de Tiempo', 'Reducción de Errores', 'Aumento de Productividad'],
                        [
                          'rgba(16, 185, 129, 0.8)',
                          'rgba(20, 184, 166, 0.8)',
                          'rgba(6, 182, 212, 0.8)'
                        ]
                      )} options={chartOptions} />
                    </div>
                  </div>
                </div>

                                    {/* Botones de acción */}
                    <div className="flex justify-center space-x-4">
                      <button
                        onClick={calculateROI}
                        className="bg-teal-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-teal-700 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 shadow-lg hover:shadow-xl transition-all"
                      >
                        Recalcular ROI
                      </button>
                    </div>

                    {/* Botones de navegación para paso 3 */}
                    <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                      <button
                        onClick={goToPreviousStep}
                        className="px-6 py-3 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
                      >
                        ← Modificar Agentes
                      </button>
                      <div className="text-sm text-gray-500">
                        Análisis completado
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
      </div>
    );
  }

  // Versión no embebida (página completa)
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Calculadora ROI Avanzada
          </h1>
          <p className="text-xl text-gray-600">
            Calcula el retorno de inversión de automatizar tu negocio con agentes de IA
          </p>
        </div>

        {/* Indicador de pasos */}
        <div className="mb-12">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between">
              <div className={`flex flex-col items-center ${currentStep >= 1 ? 'text-teal-600' : 'text-gray-400'}`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg transition-all duration-300 ${currentStep >= 1 ? 'bg-teal-600 text-white shadow-lg' : 'bg-gray-300 text-gray-600'}`}>
                  {currentStep > 1 ? '✓' : '1'}
                </div>
                <span className="mt-3 font-medium">Empleados</span>
                <span className="text-xs text-center mt-1 max-w-20">Información del personal</span>
              </div>
              
              <div className="flex-1 mx-8">
                <div className={`h-2 rounded-full transition-all duration-500 ${currentStep >= 2 ? 'bg-teal-600' : 'bg-gray-300'}`}></div>
              </div>
              
              <div className={`flex flex-col items-center ${currentStep >= 2 ? 'text-teal-600' : 'text-gray-400'}`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg transition-all duration-300 ${currentStep >= 2 ? 'bg-teal-600 text-white shadow-lg' : 'bg-gray-300 text-gray-600'}`}>
                  {currentStep > 2 ? '✓' : '2'}
                </div>
                <span className="mt-3 font-medium">Agentes</span>
                <span className="text-xs text-center mt-1 max-w-20">Selección de IA</span>
              </div>
              
              <div className="flex-1 mx-8">
                <div className={`h-2 rounded-full transition-all duration-500 ${currentStep >= 3 ? 'bg-teal-600' : 'bg-gray-300'}`}></div>
              </div>
              
              <div className={`flex flex-col items-center ${currentStep >= 3 ? 'text-teal-600' : 'text-gray-400'}`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg transition-all duration-300 ${currentStep >= 3 ? 'bg-teal-600 text-white shadow-lg' : 'bg-gray-300 text-gray-600'}`}>
                  3
                </div>
                <span className="mt-3 font-medium">Resultados</span>
                <span className="text-xs text-center mt-1 max-w-20">Análisis ROI</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="w-full max-w-6xl mx-auto">
            {/* Tabs */}
            <div className="mb-6">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab('employees')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'employees'
                        ? 'border-teal-500 text-teal-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    👥 Empleados
                  </button>
                  <button
                    onClick={() => setActiveTab('agents')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'agents'
                        ? 'border-teal-500 text-teal-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    🤖 Agentes
                  </button>
                  <button
                    onClick={() => setActiveTab('results')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'results'
                        ? 'border-teal-500 text-teal-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    📊 Resultados
                  </button>
                </nav>
              </div>
            </div>

            {/* Contenido de tabs */}
            {activeTab === 'employees' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-teal-50 to-emerald-50 p-6 rounded-xl border border-teal-200">
                  <h3 className="text-xl font-semibold text-teal-900 mb-2">Paso 1: Información de Empleados</h3>
                  <p className="text-teal-700 mb-4">Agrega información sobre los empleados cuyos procesos se automatizarán</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                      <input
                        type="text"
                        value={newEmployee.name}
                        onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                        placeholder="Nombre del empleado"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Posición</label>
                      <input
                        type="text"
                        value={newEmployee.position}
                        onChange={(e) => setNewEmployee({...newEmployee, position: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                        placeholder="Puesto de trabajo"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Salario Mensual (MXN)</label>
                      <input
                        type="number"
                        value={newEmployee.monthlySalary}
                        onChange={(e) => setNewEmployee({...newEmployee, monthlySalary: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                        placeholder="15000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Horas por Mes</label>
                      <input
                        type="number"
                        value={newEmployee.hoursPerMonth}
                        onChange={(e) => setNewEmployee({...newEmployee, hoursPerMonth: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                        placeholder="160"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">% Afectado por Automatización</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={newEmployee.affectedPercentage}
                        onChange={(e) => setNewEmployee({...newEmployee, affectedPercentage: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                        placeholder="50"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={addEmployee}
                        className="w-full bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                      >
                        Agregar Empleado
                      </button>
                    </div>
                  </div>
                </div>

                {/* Lista de empleados */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Empleados Agregados ({employees.length})</h3>
                  {employees.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No hay empleados agregados</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {employees.map((employee) => (
                        <div key={employee.id} className="bg-white border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-medium text-gray-900">{employee.name}</h4>
                              <p className="text-sm text-gray-600">{employee.position}</p>
                            </div>
                            <button
                              onClick={() => removeEmployee(employee.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              ✕
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-gray-500">Salario:</span>
                              <span className="ml-1 font-medium">${employee.monthlySalary.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Horas:</span>
                              <span className="ml-1 font-medium">{employee.hoursPerMonth}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">% Afectado:</span>
                              <span className="ml-1 font-medium">{employee.affectedPercentage}%</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Tarifa/hora:</span>
                              <span className="ml-1 font-medium">${employee.hourlyRate.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Botones de navegación */}
                {isEmbedded && (
                  <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                    <div></div>
                    <button
                      onClick={goToNextStep}
                      disabled={!canContinue()}
                      className={`px-6 py-3 rounded-lg font-medium transition-all ${
                        canContinue()
                          ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-md hover:shadow-lg'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      Continuar a Agentes →
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'agents' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-teal-50 to-emerald-50 p-6 rounded-xl border border-teal-200">
                  <h3 className="text-xl font-semibold text-teal-900 mb-2">Paso 2: Seleccionar Agentes de Automatización</h3>
                  <p className="text-teal-700 mb-4">
                    Selecciona los agentes que implementarás para automatizar los procesos de tu negocio.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availableAgents.map((agent) => {
                    const isSelected = selectedAgents.find(a => a.id === agent.id);
                    return (
                      <div
                        key={agent.id}
                        className={`bg-white border-2 rounded-lg p-6 cursor-pointer transition-all duration-200 ${
                          isSelected 
                            ? 'border-teal-500 bg-teal-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => toggleAgent(agent)}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="text-3xl">{agent.icon}</div>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            isSelected ? 'bg-teal-500 border-teal-500' : 'border-gray-300'
                          }`}>
                            {isSelected && <span className="text-white text-sm">✓</span>}
                          </div>
                        </div>
                        
                        <h4 className="font-semibold text-gray-900 mb-2">{agent.name}</h4>
                        <p className="text-sm text-gray-600 mb-4">{agent.description}</p>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Ahorro de tiempo:</span>
                            <span className="font-medium text-teal-600">{agent.timeSavingPercentage}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Reducción errores:</span>
                            <span className="font-medium text-teal-600">{agent.errorReductionPercentage}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Costo mensual:</span>
                            <span className="font-medium">${agent.costPerMonth.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Implementación:</span>
                            <span className="font-medium">${agent.implementationCost.toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <h5 className="font-medium text-gray-900 mb-2">Beneficios:</h5>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {agent.benefits.map((benefit, index) => (
                              <li key={index} className="flex items-center">
                                <span className="mr-2">•</span>
                                <span>{benefit}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {selectedAgents.length > 0 && (
                  <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                    <h4 className="font-medium text-teal-900 mb-2">Agentes Seleccionados ({selectedAgents.length})</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedAgents.map((agent) => (
                        <span
                          key={agent.id}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-teal-100 text-teal-800"
                        >
                          {agent.icon} {agent.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Botones de navegación */}
                {isEmbedded && (
                  <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                    <button
                      onClick={goToPreviousStep}
                      className="px-6 py-3 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
                    >
                      ← Volver a Empleados
                    </button>
                    <button
                      onClick={goToNextStep}
                      disabled={!canContinue()}
                      className={`px-6 py-3 rounded-lg font-medium transition-all ${
                        canContinue()
                          ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-md hover:shadow-lg'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      Ver Resultados →
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'results' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-teal-50 to-emerald-50 p-6 rounded-xl border border-teal-200">
                  <h3 className="text-xl font-semibold text-teal-900 mb-2">Paso 3: Análisis de Resultados</h3>
                  <p className="text-teal-700 mb-4">Revisa el análisis detallado del ROI de tu inversión en automatización</p>
                </div>

                {!showResults ? (
                  <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                    <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-10 h-10 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Listo para Calcular ROI</h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                      Has configurado empleados y agentes. Ahora calcula el retorno de inversión de tu proyecto de automatización.
                    </p>
                    <button
                      onClick={calculateROI}
                      className="bg-teal-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-teal-700 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 shadow-lg hover:shadow-xl transition-all"
                    >
                      Calcular ROI
                    </button>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {/* Resumen ejecutivo */}
                    <div className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white p-6 rounded-lg">
                      <h3 className="text-xl font-bold mb-4">Resumen Ejecutivo</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-3xl font-bold">{roiData.roiPercentage.toFixed(1)}%</div>
                          <div className="text-sm opacity-90">ROI a 5 años</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold">${roiData.fiveYearSavings.toLocaleString()}</div>
                          <div className="text-sm opacity-90">Ahorros netos (5 años)</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold">{roiData.paybackMonths.toFixed(1)}</div>
                          <div className="text-sm opacity-90">Meses para recuperar inversión</div>
                        </div>
                      </div>
                    </div>

                    {/* Métricas detalladas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Costos Actuales</p>
                          <p className="text-3xl font-bold text-red-600 mt-2">
                            ${roiData.currentMonthlyCosts.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">por mes</p>
                        </div>
                      </div>

                      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Ahorros Proyectados</p>
                          <p className="text-3xl font-bold text-teal-600 mt-2">
                            ${roiData.projectedMonthlySavings.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">por mes</p>
                        </div>
                      </div>

                      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Inversión Inicial</p>
                          <p className="text-3xl font-bold text-blue-600 mt-2">
                            ${roiData.totalImplementationCost.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">una vez</p>
                        </div>
                      </div>

                      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Mantenimiento</p>
                          <p className="text-3xl font-bold text-orange-600 mt-2">
                            ${roiData.monthlyMaintenanceCost.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">por mes</p>
                        </div>
                      </div>
                    </div>

                    {/* Gráficas */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="bg-white p-6 rounded-lg border border-gray-200">
                        <h4 className="font-medium text-gray-900 mb-4">Proyección de Ahorros</h4>
                        <div className="h-64">
                          <Line data={getLineChartData()} options={{
                            ...chartOptions,
                            scales: {
                              y: {
                                type: 'linear',
                                display: true,
                                position: 'left',
                                title: {
                                  display: true,
                                  text: 'Ahorros Acumulados (MXN)'
                                }
                              },
                              y1: {
                                type: 'linear',
                                display: true,
                                position: 'right',
                                title: {
                                  display: true,
                                  text: 'ROI (%)'
                                },
                                grid: {
                                  drawOnChartArea: false,
                                },
                              }
                            }
                          }} />
                        </div>
                      </div>

                      <div className="bg-white p-6 rounded-lg border border-gray-200">
                        <h4 className="font-medium text-gray-900 mb-4">Comparación de Costos</h4>
                        <div className="h-64">
                          <Bar data={getBarChartData()} options={chartOptions} />
                        </div>
                      </div>
                    </div>

                    {/* Desglose de beneficios */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="bg-white p-6 rounded-lg border border-gray-200">
                        <h4 className="font-medium text-gray-900 mb-4">Desglose de Costos</h4>
                        <div className="h-64">
                          <Pie data={getPieChartData(
                            [
                              roiData.charts.costBreakdown.implementation,
                              roiData.charts.costBreakdown.maintenance,
                              roiData.charts.costBreakdown.projectedOperational
                            ],
                            ['Implementación', 'Mantenimiento (anual)', 'Operación (anual)'],
                            [
                              'rgba(239, 68, 68, 0.8)',
                              'rgba(245, 158, 11, 0.8)',
                              'rgba(59, 130, 246, 0.8)'
                            ]
                          )} options={chartOptions} />
                        </div>
                      </div>

                      <div className="bg-white p-6 rounded-lg border border-gray-200">
                        <h4 className="font-medium text-gray-900 mb-4">Desglose de Beneficios</h4>
                        <div className="h-64">
                          <Pie data={getPieChartData(
                            [
                              roiData.charts.benefitsBreakdown.timeSavings,
                              roiData.charts.benefitsBreakdown.errorReduction,
                              roiData.charts.benefitsBreakdown.productivityIncrease
                            ],
                            ['Ahorro de Tiempo', 'Reducción de Errores', 'Aumento de Productividad'],
                            [
                              'rgba(16, 185, 129, 0.8)',
                              'rgba(20, 184, 166, 0.8)',
                              'rgba(6, 182, 212, 0.8)'
                            ]
                          )} options={chartOptions} />
                        </div>
                      </div>
                    </div>

                    {/* Botón para recalcular */}
                    <div className="text-center">
                      <button
                        onClick={calculateROI}
                        className="bg-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-teal-700 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                      >
                        Recalcular ROI
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ROICalculator;
