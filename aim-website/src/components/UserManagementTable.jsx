import React, { useState, useEffect } from 'react';
import { useUsers } from '../hooks/useUsers.js';
import { useRoles } from '../hooks/useRoles.js';
import { usePermissions } from '../hooks/usePermissions.js';
import { useDepartments } from '../hooks/useDepartments.js';
import { PermissionGuard } from './PermissionGuard.jsx';

export default function UserManagementTable() {
  // Hooks separados para evitar conflictos
  const {
    users,
    loading: usersLoading,
    error: usersError,
    stats,
    pagination,
    filters,
    loadUsers,
    updateFilters,
    assignRole,
    unassignRole,
    makeMasterUser,
    assignDepartment,
    deleteUser,
    setPage,
    setPageSize
  } = useUsers();

  const {
    roles,
    loading: rolesLoading,
    loadRoles
  } = useRoles();

  const { hasPermission } = usePermissions();

  // Usar exactamente la misma lógica que funciona en DepartmentTest
  const { departments, loading: departmentsLoading, error: departmentsError, getDepartmentLabel } = useDepartments();

  const [selectedUsers, setSelectedUsers] = useState([]);
  const [roleModal, setRoleModal] = useState({ open: false, user: null });
  const [departmentModal, setDepartmentModal] = useState({ open: false, user: null });
  const [notifications, setNotifications] = useState([]);

  // Cargar datos iniciales
  useEffect(() => {
    console.log('UserManagementTable: Cargando datos iniciales');
    loadUsers();
    loadRoles();
  }, []);

  // Log para debugging departamentos (igual que en DepartmentTest)
  useEffect(() => {
    console.log('UserManagementTable - Departments state:', { 
      departments, 
      loading: departmentsLoading, 
      error: departmentsError,
      count: departments.length 
    });
  }, [departments, departmentsLoading, departmentsError]);

  const showNotification = (message, type = 'success') => {
    const notification = {
      id: Date.now(),
      message,
      type
    };
    setNotifications(prev => [...prev, notification]);
    
    if (window.showNotification) {
      window.showNotification(message, type);
    }
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  const handleAssignRole = async (userId, roleId) => {
    try {
      await assignRole(userId, roleId);
      showNotification('Rol asignado exitosamente');
      setRoleModal({ open: false, user: null });
    } catch (error) {
      showNotification('Error al asignar rol: ' + error.message, 'error');
    }
  };

  const handleUnassignRole = async (userId) => {
    try {
      await unassignRole(userId);
      showNotification('Rol removido exitosamente');
      setRoleModal({ open: false, user: null });
    } catch (error) {
      showNotification('Error al remover rol: ' + error.message, 'error');
    }
  };

  const handleMakeMaster = async (userId) => {
    if (!confirm('¿Estás seguro de que deseas hacer a este usuario MAESTRO? Esta acción otorga permisos completos.')) {
      return;
    }
    
    try {
      await makeMasterUser(userId);
      showNotification('Usuario configurado como maestro exitosamente');
    } catch (error) {
      showNotification('Error al configurar usuario maestro: ' + error.message, 'error');
    }
  };

  const handleAssignDepartment = async (userId, department) => {
    try {
      console.log('Asignando departamento:', { userId, department });
      await assignDepartment(userId, department);
      showNotification('Departamento asignado exitosamente');
      setDepartmentModal({ open: false, user: null });
    } catch (error) {
      console.error('Error al asignar departamento:', error);
      showNotification('Error al asignar departamento: ' + error.message, 'error');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Nunca';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const classes = {
      active: 'px-2 py-1 text-xs rounded-full bg-green-100 text-green-800',
      inactive: 'px-2 py-1 text-xs rounded-full bg-red-100 text-red-800',
      pending: 'px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800'
    };
    return classes[status] || 'px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800';
  };

  const getRoleBadge = (user) => {
    const role = user.customRole?.name || user.role;
    const classes = {
      master: 'px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800',
      admin: 'px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800',
      manager: 'px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-800',
      user: 'px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800'
    };
    return classes[role] || 'px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800';
  };

  // Función para renderizar departamento (igual que en DepartmentTest)
  const renderDepartment = (user) => {
    const departmentValue = user.department;
    const departmentLabel = getDepartmentLabel(departmentValue);
    
    return (
      <div className="flex items-center space-x-2">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          departmentValue ? 'bg-teal-100 text-teal-800' : 'bg-gray-100 text-gray-600'
        }`}>
          {departmentLabel || 'Sin departamento'}
        </span>
        <PermissionGuard module="users" action="update">
          <button
            onClick={() => setDepartmentModal({ open: true, user })}
            className="text-teal-600 hover:text-teal-900 p-1 rounded transition-colors duration-200"
            title="Asignar Departamento"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </button>
        </PermissionGuard>
      </div>
    );
  };

  // Mostrar loading si cualquier cosa está cargando
  if (usersLoading || departmentsLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            Cargando {usersLoading ? 'usuarios' : 'departamentos'}...
          </p>
        </div>
      </div>
    );
  }

  // Mostrar error si hay algún error
  if (usersError || departmentsError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="text-red-800 font-medium">Error al cargar datos</h3>
            <p className="text-red-700">
              {usersError && <span>Usuarios: {usersError}</span>}
              {usersError && departmentsError && <br />}
              {departmentsError && <span>Departamentos: {departmentsError}</span>}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Información de debugging */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-blue-800 font-semibold mb-2">Estado de Carga</h3>
        <div className="text-blue-700 text-sm space-y-1">
          <p>✅ Usuarios: {users.length} cargados</p>
          <p>✅ Departamentos: {departments.length} cargados</p>
          <p>✅ Roles: {roles.length} cargados</p>
          <p>✅ Errores: {(usersError || departmentsError) ? 'Sí' : 'No'}</p>
        </div>
      </div>

      {/* Header con estadísticas */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">Administración de Usuarios</h1>
              <p className="text-teal-100">Gestiona accesos, permisos y roles del portal</p>
            </div>
            <div className="text-right">
              <div className="text-teal-100 text-sm">Usuarios totales</div>
              <div className="text-3xl font-bold">{users.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros simplificados */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Buscar Usuario</label>
            <input 
              type="text" 
              placeholder="Nombre o email..." 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              value={filters.search || ''}
              onChange={(e) => updateFilters({ search: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Departamento</label>
            <select 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              value={filters.department || ''}
              onChange={(e) => updateFilters({ department: e.target.value })}
            >
              <option value="">Todos los departamentos</option>
              {departments.map((dept) => (
                <option key={dept.key} value={dept.key}>
                  {dept.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rol</label>
            <select 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              value={filters.role || ''}
              onChange={(e) => updateFilters({ role: e.target.value })}
            >
              <option value="">Todos los roles</option>
              <option value="master">Maestro</option>
              <option value="admin">Administrador</option>
              <option value="manager">Gerente</option>
              <option value="user">Usuario</option>
            </select>
          </div>

          <div className="flex items-end">
            <button 
              onClick={() => loadUsers()}
              className="w-full bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>Buscar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de usuarios */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Lista de Usuarios</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Departamento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Último Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-white font-semibold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {renderDepartment(user)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getRoleBadge(user)}>
                      {user.customRole?.name || user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getStatusBadge(user.status)}>
                      {user.status === 'active' ? 'Activo' : 
                       user.status === 'inactive' ? 'Inactivo' : 'Pendiente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(user.lastLoginAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <PermissionGuard module="users" action="update">
                        <button
                          onClick={() => setRoleModal({ open: true, user })}
                          className="text-teal-600 hover:text-teal-900 p-1 rounded transition-colors duration-200"
                          title="Asignar Rol"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </button>
                      </PermissionGuard>
                      <PermissionGuard module="users" action="update">
                        <button
                          onClick={() => handleMakeMaster(user.id)}
                          className="text-purple-600 hover:text-purple-900 p-1 rounded transition-colors duration-200"
                          title="Hacer Maestro"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </button>
                      </PermissionGuard>
                      <PermissionGuard module="users" action="delete">
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded transition-colors duration-200"
                          title="Eliminar Usuario"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </PermissionGuard>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modales */}
      {roleModal.open && (
        <RoleAssignmentModal
          user={roleModal.user}
          roles={roles}
          onAssign={handleAssignRole}
          onUnassign={handleUnassignRole}
          onClose={() => setRoleModal({ open: false, user: null })}
          loading={rolesLoading}
        />
      )}

      {departmentModal.open && (
        <DepartmentAssignmentModal
          user={departmentModal.user}
          departments={departments}
          onAssign={handleAssignDepartment}
          onClose={() => setDepartmentModal({ open: false, user: null })}
          loading={departmentsLoading}
        />
      )}

      {/* Notificaciones */}
      <div className="fixed top-4 right-4 space-y-2 z-50">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 rounded-lg shadow-lg ${
              notification.type === 'error' 
                ? 'bg-red-500 text-white' 
                : 'bg-green-500 text-white'
            }`}
          >
            {notification.message}
          </div>
        ))}
      </div>
    </div>
  );
}

// Modal para asignar roles
function RoleAssignmentModal({ user, roles, onAssign, onUnassign, onClose, loading }) {
  const [selectedRoleId, setSelectedRoleId] = useState('');

  const handleAssign = () => {
    if (selectedRoleId && user) {
      onAssign(user.id, selectedRoleId);
    }
  };

  const handleUnassign = () => {
    if (user) {
      onUnassign(user.id);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {user ? `Gestionar Rol - ${user.name}` : 'Gestionar Permisos'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="mb-4">
          {user && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Rol actual: <span className="font-medium">{user.customRole?.name || user.role}</span>
              </p>
            </div>
          )}
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Seleccionar Rol</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              value={selectedRoleId}
              onChange={(e) => setSelectedRoleId(e.target.value)}
              disabled={loading}
            >
              <option value="">Seleccionar rol...</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name} - {role.description}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-200"
          >
            Cancelar
          </button>
          {user && user.customRole && (
            <button
              onClick={handleUnassign}
              className="px-4 py-2 text-white bg-yellow-600 rounded-md hover:bg-yellow-700 transition-colors duration-200"
              disabled={loading}
            >
              Remover Rol
            </button>
          )}
          <button
            onClick={handleAssign}
            className="px-4 py-2 text-white bg-teal-600 rounded-md hover:bg-teal-700 transition-colors duration-200"
            disabled={!selectedRoleId || loading}
          >
            {loading ? 'Procesando...' : 'Asignar Rol'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Modal para asignar departamento
function DepartmentAssignmentModal({ user, departments, onAssign, onClose, loading }) {
  const [selectedDepartment, setSelectedDepartment] = useState(user?.department || '');

  const handleAssign = () => {
    if (user) {
      console.log('Modal: Asignando departamento:', { userId: user.id, department: selectedDepartment });
      onAssign(user.id, selectedDepartment);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {user ? `Asignar Departamento - ${user.name}` : 'Gestionar Departamento'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="mb-4">
          {user && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Departamento actual: <span className="font-medium">{user.department || 'Sin asignar'}</span>
              </p>
            </div>
          )}
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Seleccionar Departamento</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              disabled={loading}
            >
              <option value="">Sin departamento</option>
              {departments.map((dept) => (
                <option key={dept.key} value={dept.key}>
                  {dept.label} {dept.description && `- ${dept.description}`}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-200"
          >
            Cancelar
          </button>
          <button
            onClick={handleAssign}
            className="px-4 py-2 text-white bg-teal-600 rounded-md hover:bg-teal-700 transition-colors duration-200"
            disabled={loading || selectedDepartment === user?.department}
          >
            {loading ? 'Procesando...' : 'Asignar Departamento'}
          </button>
        </div>
      </div>
    </div>
  );
} 