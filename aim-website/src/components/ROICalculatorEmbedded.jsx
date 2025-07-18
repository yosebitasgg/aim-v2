import React, { useState, useEffect } from 'react';

const ROICalculatorEmbedded = ({ 
  onCalculationChange = () => {}, 
  initialData = null,
  isEmbedded = true 
}) => {
  const [investment, setInvestment] = useState(initialData?.investment || 0);
  const [monthlySavings, setMonthlySavings] = useState(initialData?.monthlySavings || 0);
  const [employees, setEmployees] = useState(initialData?.employees || []);
  const [roiData, setRoiData] = useState(null);
  const [isCalculated, setIsCalculated] = useState(false);

  // Empleado por defecto
  const defaultEmployee = {
    id: 1,
    name: 'Empleado 1',
    position: 'Operador',
    monthlySalary: 15000,
    hoursPerMonth: 160,
    affectedPercentage: 50
  };

  // Agregar empleado inicial si no hay empleados
  useEffect(() => {
    if (employees.length === 0) {
      setEmployees([defaultEmployee]);
    }
  }, []);

  // Cargar datos iniciales si existen
  useEffect(() => {
    if (initialData?.roiData) {
      setRoiData(initialData.roiData);
      setIsCalculated(true);
    }
  }, [initialData]);

  const calculateROI = () => {
    const totalMonthlyCost = employees.reduce((sum, emp) => {
      return sum + (emp.monthlySalary * emp.affectedPercentage / 100);
    }, 0);

    const annualSavings = monthlySavings * 12;
    const roi = investment > 0 ? ((annualSavings - investment) / investment * 100) : 0;
    const paybackMonths = monthlySavings > 0 ? Math.ceil(investment / monthlySavings) : 0;
    const netPresentValue = annualSavings * 3 - investment;

    const calculationResult = {
      investment,
      monthlySavings,
      annualSavings,
      roi,
      paybackMonths,
      netPresentValue,
      totalMonthlyCost,
      employees,
      calculatedAt: new Date().toISOString()
    };

    setRoiData(calculationResult);
    setIsCalculated(true);
    
    // Solo llamar onCalculationChange cuando el usuario ejecute explícitamente el cálculo
    onCalculationChange(calculationResult);
  };

  const resetCalculation = () => {
    setRoiData(null);
    setIsCalculated(false);
  };

  const addEmployee = () => {
    const newEmployee = {
      id: employees.length + 1,
      name: `Empleado ${employees.length + 1}`,
      position: 'Operador',
      monthlySalary: 15000,
      hoursPerMonth: 160,
      affectedPercentage: 50
    };
    setEmployees([...employees, newEmployee]);
    
    // Resetear cálculo cuando se modifiquen empleados
    if (isCalculated) {
      setIsCalculated(false);
    }
  };

  const updateEmployee = (id, field, value) => {
    setEmployees(employees.map(emp => 
      emp.id === id ? { ...emp, [field]: value } : emp
    ));
    
    // Resetear cálculo cuando se modifiquen empleados
    if (isCalculated) {
      setIsCalculated(false);
    }
  };

  const removeEmployee = (id) => {
    if (employees.length > 1) {
      setEmployees(employees.filter(emp => emp.id !== id));
      
      // Resetear cálculo cuando se modifiquen empleados
      if (isCalculated) {
        setIsCalculated(false);
      }
    }
  };

  const handleInvestmentChange = (value) => {
    setInvestment(value);
    if (isCalculated) {
      setIsCalculated(false);
    }
  };

  const handleMonthlySavingsChange = (value) => {
    setMonthlySavings(value);
    if (isCalculated) {
      setIsCalculated(false);
    }
  };

  const getRoiColor = (roi) => {
    if (roi > 50) return 'text-green-600';
    if (roi > 20) return 'text-teal-600';
    if (roi > 0) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRoiStatus = (roi) => {
    if (roi > 50) return '🎉 Excelente ROI';
    if (roi > 20) return '✅ Buen ROI';
    if (roi > 0) return '⚠️ ROI Moderado';
    return '❌ ROI Negativo';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
      <div className="border-b pb-4">
        <h3 className="text-lg font-semibold text-gray-900">Calculadora ROI Avanzada</h3>
        <p className="text-sm text-gray-600 mt-1">
          Calcula el retorno de inversión considerando empleados y ahorros operacionales
        </p>
      </div>

      {/* Indicador de estado de cálculo */}
      {!isCalculated && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-sm text-yellow-800">Valores modificados. Presiona "Calcular ROI" para actualizar los resultados.</span>
          </div>
        </div>
      )}

      {/* Sección de Empleados */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900">Empleados Afectados</h4>
          <button
            type="button"
            onClick={addEmployee}
            className="text-sm bg-teal-100 text-teal-700 px-3 py-1 rounded-lg hover:bg-teal-200 transition-colors"
          >
            + Agregar Empleado
          </button>
        </div>

        <div className="space-y-3">
          {employees.map((employee) => (
            <div key={employee.id} className="border border-gray-200 rounded-lg p-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Nombre</label>
                  <input
                    type="text"
                    value={employee.name}
                    onChange={(e) => updateEmployee(employee.id, 'name', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Posición</label>
                  <input
                    type="text"
                    value={employee.position}
                    onChange={(e) => updateEmployee(employee.id, 'position', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Salario Mensual</label>
                  <input
                    type="number"
                    value={employee.monthlySalary}
                    onChange={(e) => updateEmployee(employee.id, 'monthlySalary', parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Horas/Mes</label>
                  <input
                    type="number"
                    value={employee.hoursPerMonth}
                    onChange={(e) => updateEmployee(employee.id, 'hoursPerMonth', parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">% Afectado</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={employee.affectedPercentage}
                    onChange={(e) => updateEmployee(employee.id, 'affectedPercentage', parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => removeEmployee(employee.id)}
                    disabled={employees.length <= 1}
                    className="w-full px-2 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Parámetros de Inversión */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Inversión Inicial (MXN)</label>
          <input
            type="number"
            value={investment}
            onChange={(e) => handleInvestmentChange(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            placeholder="100000"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Ahorros Mensuales Estimados (MXN)</label>
          <input
            type="number"
            value={monthlySavings}
            onChange={(e) => handleMonthlySavingsChange(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            placeholder="15000"
          />
        </div>
      </div>

      {/* Botón de cálculo */}
      <div className="text-center">
        <button
          type="button"
          onClick={calculateROI}
          className="bg-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-teal-700 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors"
        >
          {isCalculated ? 'Recalcular ROI' : 'Calcular ROI'}
        </button>
        {isCalculated && (
          <button
            type="button"
            onClick={resetCalculation}
            className="ml-3 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Resultados */}
      {roiData && isCalculated && (
        <div className="bg-teal-50 rounded-lg p-4">
          <h4 className="font-medium text-teal-900 mb-3">Resultados del Cálculo</h4>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <div className="text-xs text-gray-600">ROI Anual</div>
              <div className={`text-lg font-bold ${getRoiColor(roiData.roi)}`}>
                {roiData.roi.toFixed(1)}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-600">Recuperación</div>
              <div className="text-lg font-bold text-teal-600">
                {roiData.paybackMonths} meses
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-600">Ahorro Anual</div>
              <div className="text-sm font-medium text-emerald-600">
                ${roiData.annualSavings.toLocaleString()}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-600">VPN (3 años)</div>
              <div className={`text-sm font-medium ${roiData.netPresentValue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${roiData.netPresentValue.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="text-center pt-3 border-t border-teal-200">
            <div className="text-sm text-teal-800">
              {getRoiStatus(roiData.roi)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ROICalculatorEmbedded; 