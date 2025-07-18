import React, { useState, useEffect } from 'react';
import AIMQuoteCalculator from '../AIMQuoteCalculator.jsx';

const AIMQuoteCalculatorEmbedded = ({ 
  fieldName,
  value = null,
  onChange = () => {},
  required = false 
}) => {
  const [calculatorData, setCalculatorData] = useState(value || null);

  // Manejar cambios en la calculadora
  const handleCalculationChange = (newData) => {
    setCalculatorData(newData);
    
    // Enviar los datos al formulario padre
    if (onChange) {
      onChange({
        target: {
          name: fieldName,
          value: JSON.stringify(newData)
        }
      });
    }
  };

  // Inicializar con datos existentes si los hay
  useEffect(() => {
    if (value && typeof value === 'string') {
      try {
        const parsedValue = JSON.parse(value);
        setCalculatorData(parsedValue);
      } catch (e) {
        console.warn('Error parsing existing quote data:', e);
      }
    }
  }, [value]);

  return (
    <div className="aim-quote-calculator-embedded">
      <AIMQuoteCalculator
        onCalculationChange={handleCalculationChange}
        initialData={calculatorData}
        isEmbedded={true}
      />
      
      {/* Campo oculto para almacenar los datos del formulario */}
      <input
        type="hidden"
        name={fieldName}
        value={calculatorData ? JSON.stringify(calculatorData) : ''}
        required={required}
      />
      
      {/* Indicador de estado mejorado */}
      {calculatorData && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center text-green-800">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">
              ✅ Cotización configurada: {calculatorData.selectedAgents?.length || 0} agentes, 
              {calculatorData.selectedPlan?.name || 'Sin plan'}, 
              {calculatorData.selectedServices?.length || 0} servicios
            </span>
          </div>
          {calculatorData.calculations && (
            <div className="mt-2 text-sm text-green-700">
              <strong>Total: {new Intl.NumberFormat('es-MX', {
                style: 'currency',
                currency: calculatorData.calculations.currency || 'MXN'
              }).format(calculatorData.calculations.grandTotal || 0)}</strong>
              {' '}+ {new Intl.NumberFormat('es-MX', {
                style: 'currency',
                currency: calculatorData.calculations.currency || 'MXN'
              }).format(calculatorData.calculations.monthlyTotal || 0)}/mes
            </div>
          )}
          
          {/* Progreso de configuración */}
          <div className="mt-3">
            <div className="flex justify-between text-xs text-green-600 mb-1">
              <span>Progreso de configuración</span>
              <span>{Math.round(((calculatorData.selectedAgents?.length || 0) + (calculatorData.selectedPlan ? 1 : 0)) / 2 * 100)}%</span>
            </div>
            <div className="w-full bg-green-200 rounded-full h-1.5">
              <div 
                className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${Math.round(((calculatorData.selectedAgents?.length || 0) + (calculatorData.selectedPlan ? 1 : 0)) / 2 * 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIMQuoteCalculatorEmbedded; 