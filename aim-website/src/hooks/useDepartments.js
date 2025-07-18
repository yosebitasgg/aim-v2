import { useState, useEffect } from 'react';
import { apiClient } from '../lib/apiClient';

export function useDepartments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      console.log('useDepartments: Iniciando carga de departamentos');
      setLoading(true);
      setError(null);
      
      const departmentData = await apiClient.getDepartments();
      console.log('useDepartments: Datos recibidos:', departmentData);
      
      // Verificar que la respuesta sea válida
      if (departmentData && Array.isArray(departmentData)) {
        setDepartments(departmentData);
        console.log('useDepartments: Departamentos cargados exitosamente:', departmentData.length);
      } else if (departmentData && departmentData.data && Array.isArray(departmentData.data)) {
        // En caso de que la respuesta venga con estructura { data: [...] }
        setDepartments(departmentData.data);
        console.log('useDepartments: Departamentos cargados exitosamente (estructura data):', departmentData.data.length);
      } else {
        console.error('useDepartments: Los datos no son un array:', departmentData);
        setError('Los datos de departamentos no tienen el formato esperado');
        setDepartments([]);
      }
    } catch (err) {
      console.error('useDepartments: Error loading departments:', err);
      
      // Manejar diferentes tipos de errores
      let errorMessage = 'Error al cargar departamentos';
      
      if (err.message) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      setError(errorMessage);
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  const getDepartmentLabel = (departmentValue) => {
    const department = departments.find(dept => dept.value === departmentValue);
    return department ? department.label : departmentValue;
  };

  const getDepartmentOptions = () => {
    return departments.map(dept => ({
      value: dept.value,
      label: dept.label
    }));
  };

  return {
    departments,
    loading,
    error,
    getDepartmentLabel,
    getDepartmentOptions,
    reload: loadDepartments
  };
} 