import { useState, useEffect, useCallback } from 'react';
import { permissionsApi } from '../lib/apiClient';

export function useRoles() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    sortBy: 'name',
    sortOrder: 'asc'
  });

  const loadRoles = useCallback(async (newFilters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        ...filters,
        ...newFilters,
        page: pagination.page,
        limit: pagination.limit
      };

      const response = await permissionsApi.getRoles(params);
      
      if (response.success) {
        setRoles(response.data.items || []);
        setPagination(prev => ({
          ...prev,
          total: response.data.total,
          pages: response.data.pages
        }));
      } else {
        setError(response.message || 'Error al cargar roles');
      }
    } catch (err) {
      console.error('Error loading roles:', err);
      setError('Error al cargar roles');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  const createRole = useCallback(async (roleData) => {
    try {
      const response = await permissionsApi.createRole(roleData);
      if (response.success) {
        // Recargar roles para reflejar cambios
        loadRoles();
        return { success: true, data: response.data };
      } else {
        return { success: false, message: response.message || 'Error al crear rol' };
      }
    } catch (err) {
      console.error('Error creating role:', err);
      return { success: false, message: 'Error al crear rol' };
    }
  }, [loadRoles]);

  const updateRole = useCallback(async (roleId, roleData) => {
    try {
      const response = await permissionsApi.updateRole(roleId, roleData);
      if (response.success) {
        // Recargar roles para reflejar cambios
        loadRoles();
        return { success: true, data: response.data };
      } else {
        return { success: false, message: response.message || 'Error al actualizar rol' };
      }
    } catch (err) {
      console.error('Error updating role:', err);
      return { success: false, message: 'Error al actualizar rol' };
    }
  }, [loadRoles]);

  const deleteRole = useCallback(async (roleId) => {
    try {
      const response = await permissionsApi.deleteRole(roleId);
      if (response.success) {
        // Recargar roles para reflejar cambios
        loadRoles();
        return { success: true };
      } else {
        return { success: false, message: response.message || 'Error al eliminar rol' };
      }
    } catch (err) {
      console.error('Error deleting role:', err);
      return { success: false, message: 'Error al eliminar rol' };
    }
  }, [loadRoles]);

  const getRoleById = useCallback(async (roleId) => {
    try {
      const response = await permissionsApi.getRoleById(roleId);
      if (response.success) {
        return { success: true, data: response.data };
      } else {
        return { success: false, message: response.message || 'Error al obtener rol' };
      }
    } catch (err) {
      console.error('Error getting role:', err);
      return { success: false, message: 'Error al obtener rol' };
    }
  }, []);

  const initializeDefaultRoles = useCallback(async () => {
    try {
      const response = await permissionsApi.initializeDefaultRoles();
      if (response.success) {
        // Recargar roles para reflejar cambios
        loadRoles();
        return { success: true };
      } else {
        return { success: false, message: response.message || 'Error al inicializar roles' };
      }
    } catch (err) {
      console.error('Error initializing default roles:', err);
      return { success: false, message: 'Error al inicializar roles' };
    }
  }, [loadRoles]);

  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  }, []);

  const updatePagination = useCallback((newPagination) => {
    setPagination(prev => ({ ...prev, ...newPagination }));
  }, []);

  const goToPage = useCallback((page) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  const changePageSize = useCallback((limit) => {
    setPagination(prev => ({ ...prev, limit, page: 1 }));
  }, []);

  const search = useCallback((searchTerm) => {
    updateFilters({ search: searchTerm });
  }, [updateFilters]);

  const sortBy = useCallback((field, order = 'asc') => {
    updateFilters({ sortBy: field, sortOrder: order });
  }, [updateFilters]);

  const refreshRoles = useCallback(() => {
    loadRoles();
  }, [loadRoles]);

  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      sortBy: 'name',
      sortOrder: 'asc'
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const findRoleByName = useCallback((name) => {
    return roles.find(role => role.name === name);
  }, [roles]);

  const getRoleStats = useCallback(() => {
    const stats = {
      total: roles.length,
      withUsers: roles.filter(r => r.usersCount > 0).length,
      withoutUsers: roles.filter(r => r.usersCount === 0).length,
      totalUsers: roles.reduce((sum, r) => sum + r.usersCount, 0)
    };

    return stats;
  }, [roles]);

  // Utilidades para permisos
  const getDefaultPermissions = useCallback(() => {
    return {
      dashboard: { read: false, create: false, update: false, delete: false },
      users: { read: false, create: false, update: false, delete: false },
      agents: { read: false, create: false, update: false, delete: false },
      clients: { read: false, create: false, update: false, delete: false },
      orders: { read: false, create: false, update: false, delete: false },
      quotes: { read: false, create: false, update: false, delete: false },
      billing: { read: false, create: false, update: false, delete: false },
      reports: { read: false, create: false, update: false, delete: false }
    };
  }, []);

  const getReadOnlyPermissions = useCallback(() => {
    return {
      dashboard: { read: true, create: false, update: false, delete: false },
      users: { read: false, create: false, update: false, delete: false },
      agents: { read: true, create: false, update: false, delete: false },
      clients: { read: true, create: false, update: false, delete: false },
      orders: { read: true, create: false, update: false, delete: false },
      quotes: { read: true, create: false, update: false, delete: false },
      billing: { read: true, create: false, update: false, delete: false },
      reports: { read: false, create: false, update: false, delete: false }
    };
  }, []);

  const getFullPermissions = useCallback(() => {
    return {
      dashboard: { read: true, create: true, update: true, delete: true },
      users: { read: true, create: true, update: true, delete: true },
      agents: { read: true, create: true, update: true, delete: true },
      clients: { read: true, create: true, update: true, delete: true },
      orders: { read: true, create: true, update: true, delete: true },
      quotes: { read: true, create: true, update: true, delete: true },
      billing: { read: true, create: true, update: true, delete: true },
      reports: { read: true, create: true, update: true, delete: true }
    };
  }, []);

  return {
    roles,
    loading,
    error,
    pagination,
    filters,
    loadRoles,
    createRole,
    updateRole,
    deleteRole,
    getRoleById,
    initializeDefaultRoles,
    updateFilters,
    updatePagination,
    goToPage,
    changePageSize,
    search,
    sortBy,
    refreshRoles,
    clearFilters,
    findRoleByName,
    getRoleStats,
    getDefaultPermissions,
    getReadOnlyPermissions,
    getFullPermissions
  };
}

export default useRoles; 