import { useState, useEffect, useCallback } from 'react';
import { apiClient, usersApi } from '../lib/apiClient';

export function useUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    adminUsers: 0,
    totalRoles: 0
  });
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    pages: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: '',
    department: '',
    sortBy: 'name',
    sortOrder: 'asc'
  });

  const loadUsers = useCallback(async (newFilters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        ...filters,
        ...newFilters,
        page: pagination.page,
        limit: pagination.pageSize
      };

      console.log('🔄 Cargando usuarios con parámetros:', params);

      // Usar el endpoint correcto de usuarios
      const response = await usersApi.getUsers(params);
      
      if (response.success) {
        const data = response.data;
        setUsers(data.users || []);
        setPagination(prev => ({
          ...prev,
          total: data.pagination.total || 0,
          pages: data.pagination.pages || 1
        }));

        // Calcular estadísticas
        const usersList = data.users || [];
        const calculatedStats = {
          totalUsers: usersList.length,
          activeUsers: usersList.filter(u => u.status === 'active').length,
          adminUsers: usersList.filter(u => u.role === 'admin' || u.role === 'master' || u.customRole?.name === 'admin').length,
          totalRoles: new Set(usersList.map(u => u.customRole?.name || u.role)).size
        };
        setStats(calculatedStats);
        
        console.log('✅ Usuarios cargados:', usersList.length, 'usuarios');
        console.log('📊 Usuarios con departamento:', usersList.filter(u => u.department).length);
      } else {
        setError(response.message || 'Error al cargar usuarios');
        console.error('❌ Error en respuesta:', response.message);
      }
    } catch (err) {
      console.error('❌ Error loading users:', err);
      setError('Error al cargar usuarios: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.pageSize]);

  const loadUserStats = useCallback(async () => {
    try {
      const response = await usersApi.getUserStats();
      if (response.success) {
        const statsData = response.data;
        setStats({
          totalUsers: statsData.total || 0,
          activeUsers: statsData.active || 0,
          adminUsers: (statsData.byRole?.admin || 0) + (statsData.byRole?.master || 0),
          totalRoles: Object.keys(statsData.byRole || {}).length
        });
        console.log('✅ Estadísticas de usuarios cargadas:', statsData);
      }
    } catch (err) {
      console.error('❌ Error loading user stats:', err);
    }
  }, []);

  useEffect(() => {
    loadUsers();
    loadUserStats();
  }, [pagination.page, pagination.pageSize]);

  const assignRole = useCallback(async (userId, roleId) => {
    try {
      console.log('🔄 Asignando rol:', roleId, 'a usuario:', userId);
      const response = await apiClient.assignRole(userId, roleId);
      if (response.success) {
        console.log('✅ Rol asignado exitosamente');
        await loadUsers(); // Recargar usuarios
        return { success: true };
      } else {
        console.error('❌ Error asignando rol:', response.message);
        throw new Error(response.message || 'Error al asignar rol');
      }
    } catch (err) {
      console.error('❌ Error assigning role:', err);
      throw err;
    }
  }, [loadUsers]);

  const unassignRole = useCallback(async (userId) => {
    try {
      console.log('🔄 Desasignando rol de usuario:', userId);
      const response = await apiClient.unassignRole(userId);
      if (response.success) {
        console.log('✅ Rol desasignado exitosamente');
        await loadUsers(); // Recargar usuarios
        return { success: true };
      } else {
        console.error('❌ Error desasignando rol:', response.message);
        throw new Error(response.message || 'Error al desasignar rol');
      }
    } catch (err) {
      console.error('❌ Error unassigning role:', err);
      throw err;
    }
  }, [loadUsers]);

  const makeMasterUser = useCallback(async (userId) => {
    try {
      console.log('🔄 Configurando usuario maestro:', userId);
      const response = await apiClient.makeMasterUser(userId);
      if (response.success) {
        console.log('✅ Usuario maestro configurado exitosamente');
        await loadUsers(); // Recargar usuarios
        return { success: true };
      } else {
        console.error('❌ Error configurando usuario maestro:', response.message);
        throw new Error(response.message || 'Error al hacer usuario maestro');
      }
    } catch (err) {
      console.error('❌ Error making master user:', err);
      throw err;
    }
  }, [loadUsers]);

  const assignDepartment = useCallback(async (userId, department) => {
    try {
      console.log('🔄 Asignando departamento:', department, 'a usuario:', userId);
      const response = await apiClient.assignDepartment(userId, department);
      if (response.success) {
        console.log('✅ Departamento asignado exitosamente');
        await loadUsers(); // Recargar usuarios
        return { success: true };
      } else {
        console.error('❌ Error asignando departamento:', response.message);
        throw new Error(response.message || 'Error al asignar departamento');
      }
    } catch (err) {
      console.error('❌ Error assigning department:', err);
      throw err;
    }
  }, [loadUsers]);

  const deleteUser = useCallback(async (userId) => {
    try {
      console.log('🔄 Eliminando usuario:', userId);
      const response = await apiClient.deleteUser(userId);
      if (response.success) {
        console.log('✅ Usuario eliminado exitosamente');
        await loadUsers(); // Recargar usuarios
        return { success: true };
      } else {
        console.error('❌ Error eliminando usuario:', response.message);
        throw new Error(response.message || 'Error al eliminar usuario');
      }
    } catch (err) {
      console.error('❌ Error deleting user:', err);
      throw err;
    }
  }, [loadUsers]);

  const updateUser = useCallback(async (userId, userData) => {
    try {
      console.log('🔄 Actualizando usuario:', userId, 'con datos:', userData);
      const response = await apiClient.updateUser(userId, userData);
      if (response.success) {
        console.log('✅ Usuario actualizado exitosamente');
        await loadUsers(); // Recargar usuarios
        return { success: true };
      } else {
        console.error('❌ Error actualizando usuario:', response.message);
        throw new Error(response.message || 'Error al actualizar usuario');
      }
    } catch (err) {
      console.error('❌ Error updating user:', err);
      throw err;
    }
  }, [loadUsers]);

  const updateFilters = useCallback((newFilters) => {
    console.log('🔄 Actualizando filtros:', newFilters);
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  }, []);

  const setPage = useCallback((page) => {
    console.log('🔄 Cambiando a página:', page);
    setPagination(prev => ({ ...prev, page }));
  }, []);

  const setPageSize = useCallback((pageSize) => {
    console.log('🔄 Cambiando tamaño de página:', pageSize);
    setPagination(prev => ({ ...prev, pageSize, page: 1 }));
  }, []);

  const search = useCallback((searchTerm) => {
    updateFilters({ search: searchTerm });
  }, [updateFilters]);

  const filterByRole = useCallback((role) => {
    updateFilters({ role });
  }, [updateFilters]);

  const filterByStatus = useCallback((status) => {
    updateFilters({ status });
  }, [updateFilters]);

  const filterByDepartment = useCallback((department) => {
    updateFilters({ department });
  }, [updateFilters]);

  const sortBy = useCallback((field, order = 'asc') => {
    updateFilters({ sortBy: field, sortOrder: order });
  }, [updateFilters]);

  const refreshUsers = useCallback(() => {
    console.log('🔄 Refrescando usuarios...');
    loadUsers();
    loadUserStats();
  }, [loadUsers, loadUserStats]);

  const clearFilters = useCallback(() => {
    console.log('🔄 Limpiando filtros...');
    setFilters({
      search: '',
      role: '',
      status: '',
      department: '',
      sortBy: 'name',
      sortOrder: 'asc'
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const getUserById = useCallback((userId) => {
    return users.find(user => user.id === userId);
  }, [users]);

  return {
    users,
    loading,
    error,
    stats,
    pagination,
    filters,
    loadUsers,
    assignRole,
    unassignRole,
    makeMasterUser,
    assignDepartment,
    deleteUser,
    updateUser,
    updateFilters,
    setPage,
    setPageSize,
    search,
    filterByRole,
    filterByStatus,
    filterByDepartment,
    sortBy,
    refreshUsers,
    clearFilters,
    getUserById
  };
}

export default useUsers; 