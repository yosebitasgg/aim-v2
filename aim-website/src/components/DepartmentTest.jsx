import React, { useState, useEffect } from 'react';
import { useDepartments } from '../hooks/useDepartments.js';

export default function DepartmentTest() {
  const { departments, loading, error, getDepartmentLabel } = useDepartments();

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">Test de Departamentos</h2>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
        </div>
        <p className="text-gray-600 mt-2">Cargando departamentos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-red-600">Error en Departamentos</h2>
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <p className="text-red-800 font-medium">Error:</p>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Test de Departamentos</h2>
      
      {/* Información general */}
      <div className="mb-6">
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
          <h3 className="font-semibold text-teal-800 mb-2">Estado de Carga</h3>
          <p className="text-teal-700">
            ✅ Departamentos cargados: {departments.length}
          </p>
          <p className="text-teal-700">
            ✅ Estado: {loading ? 'Cargando...' : 'Completado'}
          </p>
          <p className="text-teal-700">
            ✅ Errores: {error ? 'Sí' : 'No'}
          </p>
        </div>
      </div>

      {/* Lista de departamentos */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Departamentos Disponibles</h3>
        {departments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map((dept) => (
              <div 
                key={dept.key} 
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{dept.label}</h4>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    dept.isDefault 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {dept.isDefault ? 'Por defecto' : 'Personalizado'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Código:</strong> {dept.key}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Valor:</strong> {dept.value}
                </p>
                {dept.description && (
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Descripción:</strong> {dept.description}
                  </p>
                )}
                {dept.color && (
                  <div className="flex items-center text-sm text-gray-600">
                    <strong>Color:</strong> 
                    <span 
                      className="ml-2 inline-block w-4 h-4 rounded-full border border-gray-300"
                      style={{ backgroundColor: dept.color }}
                    ></span>
                    <span className="ml-1">{dept.color}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No hay departamentos disponibles
          </div>
        )}
      </div>

      {/* Prueba de función getDepartmentLabel */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Prueba de Función getDepartmentLabel</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-2">
            <strong>direccion:</strong> {getDepartmentLabel('direccion')}
          </p>
          <p className="text-sm text-gray-600 mb-2">
            <strong>ventas:</strong> {getDepartmentLabel('ventas')}
          </p>
          <p className="text-sm text-gray-600 mb-2">
            <strong>gerencia:</strong> {getDepartmentLabel('gerencia')}
          </p>
          <p className="text-sm text-gray-600">
            <strong>inexistente:</strong> {getDepartmentLabel('inexistente')}
          </p>
        </div>
      </div>

      {/* Datos raw */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Datos Raw (JSON)</h3>
        <div className="bg-gray-100 rounded-lg p-4 overflow-auto">
          <pre className="text-sm text-gray-800">
            {JSON.stringify(departments, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
} 