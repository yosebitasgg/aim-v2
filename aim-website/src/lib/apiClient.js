// src/lib/apiClient.js
// Cliente para comunicación con aim-backend API (puerto 3001)

const API_BASE_URL = 'http://localhost:3001/api';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Obtener token desde localStorage/cookies
  getToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token');
    }
    return null;
  }

  // Guardar tokens
  setTokens(accessToken, refreshToken) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
    }
  }

  // Limpiar tokens
  clearTokens() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  }

  // Realizar petición HTTP con manejo de errores
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Agregar token si existe
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      
      // Si el token expiró, intentar renovar
      if (response.status === 401 && token) {
        const refreshed = await this.refreshToken();
        if (refreshed) {
          // Reintentar la petición original con el nuevo token
          config.headers.Authorization = `Bearer ${this.getToken()}`;
          const retryResponse = await fetch(url, config);
          return await this.handleResponse(retryResponse);
        } else {
          // Refresh falló, redirigir a login
          this.clearTokens();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          throw new Error('Sesión expirada');
        }
      }

      return await this.handleResponse(response);
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // Manejar respuesta de la API
  async handleResponse(response) {
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP Error: ${response.status}`);
    }

    return data;
  }

  // Renovar token de acceso
  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) return false;

      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        this.setTokens(data.accessToken, data.refreshToken);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  // --- MÉTODOS DE AUTENTICACIÓN ---

  // Login
  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.accessToken) {
      this.setTokens(response.accessToken, response.refreshToken);
    }

    return response;
  }

  // Registro
  async register(userData) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.accessToken) {
      this.setTokens(response.accessToken, response.refreshToken);
    }

    return response;
  }

  // Logout
  async logout() {
    try {
      await this.request('/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearTokens();
    }
  }

  // Obtener información del usuario actual
  async getMe() {
    return await this.request('/auth/me');
  }

  // --- MÉTODOS DE USUARIOS ---

  // Obtener lista de usuarios (con filtros y paginación)
  async getUsers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.request(`/users${queryString ? `?${queryString}` : ''}`);
  }

  // Obtener usuario por ID
  async getUserById(userId) {
    return await this.request(`/users/${userId}`);
  }

  // Crear nuevo usuario
  async createUser(userData) {
    return await this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Actualizar usuario
  async updateUser(userId, userData) {
    return await this.request(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Eliminar usuario
  async deleteUser(userId) {
    return await this.request(`/users/${userId}`, {
      method: 'DELETE',
    });
  }

  // Activar usuario
  async activateUser(userId) {
    return await this.request(`/users/${userId}/activate`, {
      method: 'POST',
    });
  }

  // Asignar departamento a usuario
  async assignDepartment(userId, department) {
    return await this.request(`/users/${userId}/department`, {
      method: 'PUT',
      body: JSON.stringify({ department }),
    });
  }

  // Obtener estadísticas de usuarios
  async getUserStats() {
    return await this.request('/users/stats');
  }

  // --- MÉTODOS DE ACTIVIDADES ---

  // Obtener mis actividades
  async getMyActivities(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.request(`/activity/my-activities${queryString ? `?${queryString}` : ''}`);
  }

  // Obtener actividades de un usuario específico
  async getUserActivities(userId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.request(`/activity/user/${userId}${queryString ? `?${queryString}` : ''}`);
  }

  // Obtener todas las actividades (admin)
  async getAllActivities(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.request(`/activity/logs${queryString ? `?${queryString}` : ''}`);
  }

  // Obtener estadísticas de actividades
  async getActivityStats(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.request(`/activity/stats${queryString ? `?${queryString}` : ''}`);
  }

  // Obtener tipos de actividades disponibles
  async getActivityTypes() {
    return await this.request('/activity/types');
  }

  // Log manual de actividad
  async logActivity(activityData) {
    return await this.request('/activity/log', {
      method: 'POST',
      body: JSON.stringify(activityData),
    });
  }

  // --- MÉTODOS DE PERMISOS ---

  // Obtener departamentos disponibles
  async getDepartments() {
    console.log('ApiClient: Iniciando petición de departamentos');
    try {
      const response = await this.request('/permissions/departments');
      console.log('ApiClient: Respuesta de departamentos:', response);
      
      if (response && response.data) {
        console.log('ApiClient: Datos de departamentos extraídos:', response.data);
        return response.data;
      } else {
        console.error('ApiClient: Respuesta inválida para departamentos:', response);
        throw new Error('Respuesta inválida del servidor para departamentos');
      }
    } catch (error) {
      console.error('ApiClient: Error en getDepartments:', error);
      throw error;
    }
  }

  // Crear nuevo departamento
  async createDepartment(departmentData) {
    return await this.request('/permissions/departments', {
      method: 'POST',
      body: JSON.stringify(departmentData),
    });
  }

  // Obtener departamento por ID
  async getDepartmentById(departmentId) {
    return await this.request(`/permissions/departments/${departmentId}`);
  }

  // Actualizar departamento
  async updateDepartment(departmentId, departmentData) {
    return await this.request(`/permissions/departments/${departmentId}`, {
      method: 'PUT',
      body: JSON.stringify(departmentData),
    });
  }

  // Eliminar departamento
  async deleteDepartment(departmentId) {
    return await this.request(`/permissions/departments/${departmentId}`, {
      method: 'DELETE',
    });
  }

  // Obtener estadísticas de departamentos
  async getDepartmentStats() {
    const response = await this.request('/permissions/departments/stats');
    return response.data;
  }

  // Verificar permisos específicos
  async checkPermission(module, action, resourceId = null) {
    return await this.request('/permissions/check', {
      method: 'POST',
      body: JSON.stringify({ module, action, resourceId }),
    });
  }

  // Obtener mis permisos
  async getMyPermissions() {
    return await this.request('/permissions/my-permissions');
  }

  // Obtener roles disponibles
  async getRoles(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.request(`/permissions/roles${queryString ? `?${queryString}` : ''}`);
  }

  // --- MÉTODOS DE GESTIÓN DE ROLES ---

  // Crear nuevo rol
  async createRole(roleData) {
    return await this.request('/permissions/roles', {
      method: 'POST',
      body: JSON.stringify(roleData),
    });
  }

  // Obtener rol por ID
  async getRoleById(roleId) {
    return await this.request(`/permissions/roles/${roleId}`);
  }

  // Actualizar rol
  async updateRole(roleId, roleData) {
    return await this.request(`/permissions/roles/${roleId}`, {
      method: 'PUT',
      body: JSON.stringify(roleData),
    });
  }

  // Eliminar rol
  async deleteRole(roleId) {
    return await this.request(`/permissions/roles/${roleId}`, {
      method: 'DELETE',
    });
  }

  // Asignar rol a usuario
  async assignRole(userId, roleId) {
    return await this.request('/permissions/assign-role', {
      method: 'POST',
      body: JSON.stringify({ userId, roleId }),
    });
  }

  // Desasignar rol de usuario
  async unassignRole(userId) {
    return await this.request(`/permissions/users/${userId}/role`, {
      method: 'DELETE',
    });
  }

  // Obtener usuarios con roles
  async getUsersWithRoles(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.request(`/permissions/users${queryString ? `?${queryString}` : ''}`);
  }

  // Hacer usuario maestro
  async makeMasterUser(userId) {
    return await this.request(`/permissions/make-master/${userId}`, {
      method: 'POST',
    });
  }

  // Inicializar roles por defecto
  async initializeDefaultRoles() {
    return await this.request('/permissions/initialize-defaults', {
      method: 'POST',
    });
  }

  // --- MÉTODOS DE CONFIGURACIÓN DE AUDITORÍA ---

  // Obtener configuración de auditoría
  async getAuditConfig() {
    return await this.request('/activity/config');
  }

  // Actualizar configuración de auditoría
  async updateAuditConfig(config) {
    return await this.request('/activity/config', {
      method: 'PUT',
      body: JSON.stringify(config),
    });
  }

  // Limpiar actividades antiguas
  async cleanupOldActivities() {
    return await this.request('/activity/cleanup', {
      method: 'DELETE',
    });
  }

  // --- MÉTODOS DE CLIENTES ---

  // Obtener lista de clientes (con filtros y paginación)
  async getClients(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.request(`/clients${queryString ? `?${queryString}` : ''}`);
  }

  // Obtener cliente por ID
  async getClientById(clientId) {
    return await this.request(`/clients/${clientId}`);
  }

  // Crear nuevo cliente
  async createClient(clientData) {
    return await this.request('/clients', {
      method: 'POST',
      body: JSON.stringify(clientData),
    });
  }

  // Actualizar cliente
  async updateClient(clientId, clientData) {
    return await this.request(`/clients/${clientId}`, {
      method: 'PUT',
      body: JSON.stringify(clientData),
    });
  }

  // Eliminar cliente
  async deleteClient(clientId) {
    return await this.request(`/clients/${clientId}`, {
      method: 'DELETE',
    });
  }

  // Agregar contacto a cliente
  async addContactToClient(clientId, contactData) {
    return await this.request(`/clients/${clientId}/contacts`, {
      method: 'POST',
      body: JSON.stringify(contactData),
    });
  }

  // Agregar dirección a cliente
  async addAddressToClient(clientId, addressData) {
    return await this.request(`/clients/${clientId}/addresses`, {
      method: 'POST',
      body: JSON.stringify(addressData),
    });
  }

  // Obtener estadísticas de clientes
  async getClientStats(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.request(`/clients/stats${queryString ? `?${queryString}` : ''}`);
  }
}

// Instancia singleton del cliente API
export const apiClient = new ApiClient();

// Métodos de conveniencia para importar individualmente
export const authApi = {
  login: (email, password) => apiClient.login(email, password),
  register: (userData) => apiClient.register(userData),
  logout: () => apiClient.logout(),
  getMe: () => apiClient.getMe(),
};

export const usersApi = {
  getUsers: (params) => apiClient.getUsers(params),
  getUserById: (id) => apiClient.getUserById(id),
  createUser: (userData) => apiClient.createUser(userData),
  updateUser: (id, userData) => apiClient.updateUser(id, userData),
  deleteUser: (id) => apiClient.deleteUser(id),
  activateUser: (id) => apiClient.activateUser(id),
  assignDepartment: (id, department) => apiClient.assignDepartment(id, department),
  getUserStats: () => apiClient.getUserStats(),
};

export const activityApi = {
  getMyActivities: (params) => apiClient.getMyActivities(params),
  getUserActivities: (userId, params) => apiClient.getUserActivities(userId, params),
  getAllActivities: (params) => apiClient.getAllActivities(params),
  getActivityStats: (params) => apiClient.getActivityStats(params),
  getActivityTypes: () => apiClient.getActivityTypes(),
  logActivity: (data) => apiClient.logActivity(data),
};

export const permissionsApi = {
  checkPermission: (module, action, resourceId) => apiClient.checkPermission(module, action, resourceId),
  getMyPermissions: () => apiClient.getMyPermissions(),
  getRoles: (params) => apiClient.getRoles(params),
  createRole: (roleData) => apiClient.createRole(roleData),
  getRoleById: (roleId) => apiClient.getRoleById(roleId),
  updateRole: (roleId, roleData) => apiClient.updateRole(roleId, roleData),
  deleteRole: (roleId) => apiClient.deleteRole(roleId),
  assignRole: (userId, roleId) => apiClient.assignRole(userId, roleId),
  unassignRole: (userId) => apiClient.unassignRole(userId),
  getUsersWithRoles: (params) => apiClient.getUsersWithRoles(params),
  makeMasterUser: (userId) => apiClient.makeMasterUser(userId),
  initializeDefaultRoles: () => apiClient.initializeDefaultRoles(),
  getDepartments: () => apiClient.getDepartments(),
  createDepartment: (departmentData) => apiClient.createDepartment(departmentData),
  getDepartmentById: (departmentId) => apiClient.getDepartmentById(departmentId),
  updateDepartment: (departmentId, departmentData) => apiClient.updateDepartment(departmentId, departmentData),
  deleteDepartment: (departmentId) => apiClient.deleteDepartment(departmentId),
  getDepartmentStats: () => apiClient.getDepartmentStats(),
};

export const adminApi = {
  getAuditConfig: () => apiClient.getAuditConfig(),
  updateAuditConfig: (config) => apiClient.updateAuditConfig(config),
  cleanupOldActivities: () => apiClient.cleanupOldActivities(),
};

export const clientsApi = {
  getClients: (params) => apiClient.getClients(params),
  getClientById: (id) => apiClient.getClientById(id),
  createClient: (clientData) => apiClient.createClient(clientData),
  updateClient: (id, clientData) => apiClient.updateClient(id, clientData),
  deleteClient: (id) => apiClient.deleteClient(id),
  addContactToClient: (id, contactData) => apiClient.addContactToClient(id, contactData),
  addAddressToClient: (id, addressData) => apiClient.addAddressToClient(id, addressData),
  getClientStats: (params) => apiClient.getClientStats(params),
};

export default apiClient; 