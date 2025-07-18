import { useDepartments } from '../hooks/useDepartments';

export default function DepartmentSelector({
  value,
  onChange,
  placeholder = "Selecciona un departamento",
  required = false,
  disabled = false,
  showAll = false,
  className = ""
}) {
  const { departments, loading, error, getDepartmentOptions } = useDepartments();

  if (loading) {
    return (
      <select disabled className={`w-full px-3 py-2 border border-gray-300 rounded-md ${className}`}>
        <option>Cargando departamentos...</option>
      </select>
    );
  }

  if (error) {
    return (
      <select disabled className={`w-full px-3 py-2 border border-red-300 rounded-md ${className}`}>
        <option>Error al cargar departamentos</option>
      </select>
    );
  }

  const options = getDepartmentOptions();

  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      disabled={disabled}
      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${className}`}
    >
      <option value="">{placeholder}</option>
      {showAll && <option value="all">Todos los departamentos</option>}
      {options.map((dept) => (
        <option key={dept.value} value={dept.value}>
          {dept.label}
        </option>
      ))}
    </select>
  );
}

// Componente más simple para filtros
export function DepartmentFilter({ value, onChange, showAll = true, className = "" }) {
  return (
    <DepartmentSelector
      value={value}
      onChange={onChange}
      placeholder="Filtrar por departamento"
      showAll={showAll}
      className={className}
    />
  );
}

// Badge para mostrar departamento
export function DepartmentBadge({ department, className = "" }) {
  const { getDepartmentLabel } = useDepartments();
  
  const departmentColors = {
    'direccion': 'bg-purple-100 text-purple-800',
    'ventas': 'bg-green-100 text-green-800',
    'operaciones': 'bg-blue-100 text-blue-800',
    'soporte': 'bg-yellow-100 text-yellow-800',
    'finanzas': 'bg-red-100 text-red-800',
    'rrhh': 'bg-pink-100 text-pink-800',
    'marketing': 'bg-orange-100 text-orange-800',
  };

  const colorClass = departmentColors[department] || 'bg-gray-100 text-gray-800';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass} ${className}`}>
      {getDepartmentLabel(department)}
    </span>
  );
} 