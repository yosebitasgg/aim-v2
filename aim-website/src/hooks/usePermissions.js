import { useState, useEffect, useCallback } from 'react';
import { permissionsApi } from '../lib/apiClient';

export function usePermissions() {
  const [permissions, setPermissions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  const loadPermissions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await permissionsApi.getMyPermissions();
      if (response.success) {
        setPermissions(response.data);
      } else {
        setError(response.message || 'Error al cargar permisos');
      }
    } catch (err) {
      console.error('Error loading permissions:', err);
      setError('Error al cargar permisos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

  const hasPermission = useCallback((module, action) => {
    if (!permissions) return false;
    return permissions[module]?.[action] || false;
  }, [permissions]);

  const hasAnyPermission = useCallback((checks) => {
    if (!permissions) return false;
    return checks.some(({ module, action }) => permissions[module]?.[action]);
  }, [permissions]);

  const hasAllPermissions = useCallback((checks) => {
    if (!permissions) return false;
    return checks.every(({ module, action }) => permissions[module]?.[action]);
  }, [permissions]);

  const checkPermission = useCallback(async (module, action, resourceId = null) => {
    try {
      const response = await permissionsApi.checkPermission(module, action, resourceId);
      return response.success ? response.data : false;
    } catch (err) {
      console.error('Error checking permission:', err);
      return false;
    }
  }, []);

  const isAdmin = useCallback(() => {
    return hasPermission('users', 'delete') || hasPermission('users', 'create');
  }, [hasPermission]);

  const isMaster = useCallback(() => {
    return hasAllPermissions([
      { module: 'users', action: 'delete' },
      { module: 'reports', action: 'delete' },
      { module: 'billing', action: 'delete' }
    ]);
  }, [hasAllPermissions]);

  const canAccess = useCallback((module, action = 'read') => {
    return hasPermission(module, action);
  }, [hasPermission]);

  const refreshPermissions = useCallback(() => {
    loadPermissions();
  }, [loadPermissions]);

  return {
    permissions,
    loading,
    error,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    checkPermission,
    isAdmin,
    isMaster,
    canAccess,
    refreshPermissions
  };
}

export default usePermissions; 