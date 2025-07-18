import React from 'react';
import usePermissions from '../hooks/usePermissions';

// Componente principal para proteger contenido basado en permisos
export function PermissionGuard({ 
  module, 
  action = 'read', 
  children, 
  fallback = null,
  requireAll = false,
  permissions = null // Para múltiples permisos
}) {
  const { hasPermission, hasAllPermissions, hasAnyPermission, loading } = usePermissions();
  
  // Mostrar loading mientras se cargan permisos
  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-4 rounded"></div>;
  }
  
  // Verificación de múltiples permisos
  if (permissions && Array.isArray(permissions)) {
    const hasAccess = requireAll 
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
    
    return hasAccess ? children : fallback;
  }
  
  // Verificación de permiso único
  if (module && action) {
    const hasAccess = hasPermission(module, action);
    return hasAccess ? children : fallback;
  }
  
  // Si no se especifican permisos, mostrar contenido (fallback)
  return children;
}

// Componente para proteger solo para administradores
export function AdminOnly({ children, fallback = null }) {
  return (
    <PermissionGuard 
      permissions={[
        { module: 'users', action: 'create' },
        { module: 'users', action: 'delete' }
      ]}
      requireAll={false}
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  );
}

// Componente para proteger solo para usuarios maestros
export function MasterOnly({ children, fallback = null }) {
  return (
    <PermissionGuard 
      permissions={[
        { module: 'users', action: 'delete' },
        { module: 'reports', action: 'delete' },
        { module: 'billing', action: 'delete' }
      ]}
      requireAll={true}
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  );
}

// Componente para proteger funcionalidades de gestión de usuarios
export function UserManagementGuard({ children, fallback = null }) {
  return (
    <PermissionGuard 
      module="users" 
      action="update"
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  );
}

// Componente para proteger funcionalidades de reportes
export function ReportsGuard({ children, fallback = null }) {
  return (
    <PermissionGuard 
      module="reports" 
      action="read"
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  );
}

// Componente para proteger funcionalidades de facturación
export function BillingGuard({ children, fallback = null }) {
  return (
    <PermissionGuard 
      module="billing" 
      action="read"
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  );
}

// Hook para usar permisos directamente en componentes
export function usePermissionGuard() {
  const { hasPermission, hasAllPermissions, hasAnyPermission, isAdmin, isMaster } = usePermissions();
  
  const canAccess = (module, action = 'read') => {
    return hasPermission(module, action);
  };
  
  const canManageUsers = () => {
    return hasPermission('users', 'update');
  };
  
  const canDeleteUsers = () => {
    return hasPermission('users', 'delete');
  };
  
  const canViewReports = () => {
    return hasPermission('reports', 'read');
  };
  
  const canManageRoles = () => {
    return hasPermission('users', 'create');
  };
  
  const canViewBilling = () => {
    return hasPermission('billing', 'read');
  };
  
  const canManageSystem = () => {
    return hasAllPermissions([
      { module: 'users', action: 'delete' },
      { module: 'reports', action: 'update' }
    ]);
  };
  
  return {
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    isAdmin,
    isMaster,
    canAccess,
    canManageUsers,
    canDeleteUsers,
    canViewReports,
    canManageRoles,
    canViewBilling,
    canManageSystem
  };
}

// Componente para mostrar mensajes de acceso denegado
export function AccessDenied({ 
  message = "No tienes permisos para acceder a esta funcionalidad",
  showContact = true 
}) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <div className="flex justify-center mb-4">
        <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-red-800 mb-2">
        Acceso Denegado
      </h3>
      <p className="text-red-600 mb-4">
        {message}
      </p>
      {showContact && (
        <p className="text-sm text-red-500">
          Si crees que esto es un error, contacta al administrador del sistema.
        </p>
      )}
    </div>
  );
}

// Componente para mostrar elementos deshabilitados
export function DisabledElement({ 
  children, 
  reason = "Sin permisos suficientes",
  showTooltip = true 
}) {
  return (
    <div className="relative">
      <div className="opacity-50 pointer-events-none">
        {children}
      </div>
      {showTooltip && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 text-white text-xs rounded opacity-0 hover:opacity-100 transition-opacity">
          {reason}
        </div>
      )}
    </div>
  );
}

// Componente condicional para mostrar contenido basado en permisos
export function ConditionalRender({ 
  condition, 
  children, 
  fallback = null,
  disabled = false,
  disabledReason = "Sin permisos"
}) {
  if (!condition) {
    return fallback;
  }
  
  if (disabled) {
    return (
      <DisabledElement reason={disabledReason}>
        {children}
      </DisabledElement>
    );
  }
  
  return children;
}

export default PermissionGuard; 