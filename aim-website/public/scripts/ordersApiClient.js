// ordersApiClient.js - Cliente API para el módulo de órdenes
(function(window) {
  'use strict';
  
  const API_BASE_URL = 'http://localhost:3001/api';

  class OrdersApiClient {
    constructor() {
      this.baseUrl = API_BASE_URL;
    }

    // Obtener token de autenticación desde cookies
    getAuthToken() {
      // Intentar desde localStorage primero (para compatibilidad)
      let token = localStorage.getItem('access_token');
      
      // Si no hay token en localStorage, intentar desde cookies
      if (!token && document.cookie) {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
          const [name, value] = cookie.trim().split('=');
          if (name === 'access_token') {
            token = value;
            break;
          }
        }
      }
      
      return token;
    }

    // Configurar headers de autenticación
    getHeaders() {
      const token = this.getAuthToken();
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      return headers;
    }

    // Manejar errores de API
    async handleResponse(response) {
      if (!response.ok) {
        // Manejar errores de autenticación
        if (response.status === 401) {
          console.warn('Token expirado o inválido, redirigiendo al login');
          window.location.href = '/login';
          return;
        }
        
        if (response.status === 403) {
          throw new Error('No tienes permisos para acceder a esta funcionalidad');
        }
        
        const error = await response.json().catch(() => ({
          message: 'Error en la respuesta del servidor',
          success: false
        }));
        throw new Error(error.message || `Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // El backend devuelve los datos directamente o con una estructura success/data
      if (data.success !== undefined) {
        if (!data.success) {
          throw new Error(data.message || 'Error en la respuesta');
        }
        return data.data || data;
      }
      
      return data;
    }

    // ===== OPERACIONES CRUD =====

    /**
     * Obtener lista de órdenes con filtros
     * @param {Object} filters - Filtros de búsqueda
     * @returns {Promise<Object>} Lista paginada de órdenes
     */
    async getOrders(filters = {}) {
      try {
        const queryParams = new URLSearchParams();
        
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, value);
          }
        });

        const url = `${this.baseUrl}/orders?${queryParams}`;
        const response = await fetch(url, {
          method: 'GET',
          headers: this.getHeaders(),
        });

        const data = await this.handleResponse(response);
        
        // Asegurar que devolvemos la estructura esperada
        return {
          orders: data.orders || [],
          pagination: data.pagination || {
            total: 0,
            page: 1,
            limit: 20,
            pages: 0,
            currentPage: 1
          },
          filters: data.filters || filters
        };
      } catch (error) {
        console.error('Error obteniendo órdenes:', error);
        throw error;
      }
    }

    /**
     * Obtener orden específica por ID
     * @param {string} orderId - ID de la orden
     * @returns {Promise<Object>} Detalle de la orden
     */
    async getOrderById(orderId) {
      try {
        const response = await fetch(`${this.baseUrl}/orders/${orderId}`, {
          method: 'GET',
          headers: this.getHeaders(),
        });

        return await this.handleResponse(response);
      } catch (error) {
        console.error('Error obteniendo orden:', error);
        throw error;
      }
    }

    /**
     * Crear nueva orden
     * @param {Object} orderData - Datos de la orden
     * @returns {Promise<Object>} Orden creada
     */
    async createOrder(orderData) {
      try {
        const response = await fetch(`${this.baseUrl}/orders`, {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(orderData),
        });

        return await this.handleResponse(response);
      } catch (error) {
        console.error('Error creando orden:', error);
        throw error;
      }
    }

    /**
     * Actualizar orden existente
     * @param {string} orderId - ID de la orden
     * @param {Object} updateData - Datos a actualizar
     * @returns {Promise<Object>} Orden actualizada
     */
    async updateOrder(orderId, updateData) {
      try {
        const response = await fetch(`${this.baseUrl}/orders/${orderId}`, {
          method: 'PUT',
          headers: this.getHeaders(),
          body: JSON.stringify(updateData),
        });

        return await this.handleResponse(response);
      } catch (error) {
        console.error('Error actualizando orden:', error);
        throw error;
      }
    }

    /**
     * Cambiar estado de la orden
     * @param {string} orderId - ID de la orden
     * @param {string} newStatus - Nuevo estado
     * @param {string} notes - Notas del cambio
     * @returns {Promise<Object>} Orden actualizada
     */
    async changeOrderStatus(orderId, newStatus, notes = '') {
      try {
        const response = await fetch(`${this.baseUrl}/orders/${orderId}/status`, {
          method: 'PUT',
          headers: this.getHeaders(),
          body: JSON.stringify({ status: newStatus, notes }),
        });

        return await this.handleResponse(response);
      } catch (error) {
        console.error('Error cambiando estado de orden:', error);
        throw error;
      }
    }

    /**
     * Eliminar orden
     * @param {string} orderId - ID de la orden
     * @returns {Promise<Object>} Confirmación de eliminación
     */
    async deleteOrder(orderId) {
      try {
        const response = await fetch(`${this.baseUrl}/orders/${orderId}`, {
          method: 'DELETE',
          headers: this.getHeaders(),
        });

        return await this.handleResponse(response);
      } catch (error) {
        console.error('Error eliminando orden:', error);
        throw error;
      }
    }

    // ===== ESTADÍSTICAS Y DASHBOARD =====

    /**
     * Obtener estadísticas de órdenes
     * @param {Object} params - Parámetros de filtrado
     * @returns {Promise<Object>} Estadísticas
     */
    async getOrderStats(params = {}) {
      try {
        const queryParams = new URLSearchParams();
        
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, value);
          }
        });

        const url = `${this.baseUrl}/orders/stats?${queryParams}`;
        const response = await fetch(url, {
          method: 'GET',
          headers: this.getHeaders(),
        });

        const data = await this.handleResponse(response);
        
        // Asegurar estructura de estadísticas
        return {
          overview: data.overview || {
            totalOrders: 0,
            activeOrders: 0,
            completedOrders: 0,
            overdueOrders: 0,
            totalValue: 0,
            averageValue: 0,
            averageCompletionTime: 0
          },
          statusDistribution: data.statusDistribution || {},
          priorityDistribution: data.priorityDistribution || {},
          ordersByAgent: data.ordersByAgent || [],
          ordersByClient: data.ordersByClient || [],
          timeSeriesData: data.timeSeriesData || [],
          recentActivity: data.recentActivity || []
        };
      } catch (error) {
        console.error('Error obteniendo estadísticas:', error);
        throw error;
      }
    }

    /**
     * Obtener datos del dashboard
     * @returns {Promise<Object>} Datos del dashboard
     */
    async getDashboardData() {
      try {
        const response = await fetch(`${this.baseUrl}/orders/dashboard`, {
          method: 'GET',
          headers: this.getHeaders(),
        });

        return await this.handleResponse(response);
      } catch (error) {
        console.error('Error obteniendo datos del dashboard:', error);
        throw error;
      }
    }

    // ===== COMUNICACIONES =====

    /**
     * Crear comunicación para una orden
     * @param {string} orderId - ID de la orden
     * @param {Object} communicationData - Datos de la comunicación
     * @returns {Promise<Object>} Comunicación creada
     */
    async createOrderCommunication(orderId, communicationData) {
      try {
        const response = await fetch(`${this.baseUrl}/orders/${orderId}/communications`, {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(communicationData),
        });

        return await this.handleResponse(response);
      } catch (error) {
        console.error('Error creando comunicación:', error);
        throw error;
      }
    }

    /**
     * Obtener comunicaciones de una orden
     * @param {string} orderId - ID de la orden
     * @param {number} limit - Límite de resultados
     * @param {number} offset - Offset para paginación
     * @returns {Promise<Object>} Lista de comunicaciones
     */
    async getOrderCommunications(orderId, limit = 20, offset = 0) {
      try {
        const url = `${this.baseUrl}/orders/${orderId}/communications?limit=${limit}&offset=${offset}`;
        const response = await fetch(url, {
          method: 'GET',
          headers: this.getHeaders(),
        });

        return await this.handleResponse(response);
      } catch (error) {
        console.error('Error obteniendo comunicaciones:', error);
        throw error;
      }
    }

    /**
     * Obtener historial de estados de una orden
     * @param {string} orderId - ID de la orden
     * @returns {Promise<Object>} Historial de estados
     */
    async getOrderHistory(orderId) {
      try {
        const response = await fetch(`${this.baseUrl}/orders/${orderId}/history`, {
          method: 'GET',
          headers: this.getHeaders(),
        });

        return await this.handleResponse(response);
      } catch (error) {
        console.error('Error obteniendo historial:', error);
        throw error;
      }
    }

    // ===== MÉTODOS AUXILIARES PARA OBTENER DATOS RELACIONADOS =====

    /**
     * Obtener clientes para filtros
     * @returns {Promise<Array>} Lista de clientes
     */
    async getClients() {
      try {
        const response = await fetch(`${this.baseUrl}/clients`, {
          method: 'GET',
          headers: this.getHeaders(),
        });

        const data = await this.handleResponse(response);
        return data.clients || [];
      } catch (error) {
        console.error('Error obteniendo clientes:', error);
        return [];
      }
    }

    /**
     * Obtener usuarios para filtros
     * @returns {Promise<Array>} Lista de usuarios
     */
    async getUsers() {
      try {
        const response = await fetch(`${this.baseUrl}/users`, {
          method: 'GET',
          headers: this.getHeaders(),
        });

        const data = await this.handleResponse(response);
        return data.users || [];
      } catch (error) {
        console.error('Error obteniendo usuarios:', error);
        return [];
      }
    }

    /**
     * Obtener agentes para filtros
     * @returns {Promise<Array>} Lista de agentes
     */
    async getAgents() {
      try {
        const response = await fetch(`${this.baseUrl}/gallery/agents`, {
          method: 'GET',
          headers: this.getHeaders(),
        });

        const data = await this.handleResponse(response);
        return data.items || [];
      } catch (error) {
        console.error('Error obteniendo agentes:', error);
        return [];
      }
    }

    /**
     * Crear cliente si no existe
     * @param {Object} clientData - Datos del cliente
     * @returns {Promise<Object>} Cliente creado
     */
    async createClient(clientData) {
      try {
        const response = await fetch(`${this.baseUrl}/clients`, {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(clientData),
        });

        return await this.handleResponse(response);
      } catch (error) {
        console.error('Error creando cliente:', error);
        throw error;
      }
    }

    // ===== HELPERS PARA EL FRONTEND =====

    /**
     * Obtener opciones para filtros
     * @returns {Object} Opciones para selectores
     */
    getFilterOptions() {
      return {
        status: [
          { value: 'DRAFT', label: 'Borrador', color: 'gray' },
          { value: 'PENDING', label: 'Pendiente', color: 'yellow' },
          { value: 'IN_PROGRESS', label: 'En Progreso', color: 'blue' },
          { value: 'IN_REVIEW', label: 'En Revisión', color: 'purple' },
          { value: 'COMPLETED', label: 'Completado', color: 'green' },
          { value: 'CANCELLED', label: 'Cancelado', color: 'red' },
          { value: 'ON_HOLD', label: 'En Espera', color: 'orange' }
        ],
        priority: [
          { value: 'LOW', label: 'Baja', color: 'green', emoji: '🟢' },
          { value: 'MEDIUM', label: 'Media', color: 'yellow', emoji: '🟡' },
          { value: 'HIGH', label: 'Alta', color: 'orange', emoji: '🟠' },
          { value: 'CRITICAL', label: 'Crítica', color: 'red', emoji: '🔴' }
        ],
        type: [
          { value: 'AUTOMATION', label: 'Automatización' },
          { value: 'INTEGRATION', label: 'Integración' },
          { value: 'CONSULTATION', label: 'Consultoría' },
          { value: 'MAINTENANCE', label: 'Mantenimiento' },
          { value: 'CUSTOM', label: 'Personalizado' }
        ]
      };
    }

    /**
     * Formatear valor monetario
     * @param {number} amount - Cantidad
     * @returns {string} Valor formateado
     */
    formatCurrency(amount) {
      if (!amount || isNaN(amount)) return '$0.00';
      return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
      }).format(amount);
    }

    /**
     * Formatear fecha
     * @param {string} dateString - Fecha en string
     * @returns {string} Fecha formateada
     */
    formatDate(dateString) {
      if (!dateString) return '-';
      return new Date(dateString).toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }

    /**
     * Formatear fecha con hora
     * @param {string} dateString - Fecha en string
     * @returns {string} Fecha y hora formateada
     */
    formatDateTime(dateString) {
      if (!dateString) return '-';
      return new Date(dateString).toLocaleString('es-MX', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }

    /**
     * Obtener etiqueta para estado
     * @param {string} status - Estado
     * @returns {string} Etiqueta en español
     */
    getStatusLabel(status) {
      const labels = {
        'DRAFT': 'Borrador',
        'PENDING': 'Pendiente',
        'IN_PROGRESS': 'En Progreso',
        'IN_REVIEW': 'En Revisión',
        'COMPLETED': 'Completado',
        'CANCELLED': 'Cancelado',
        'ON_HOLD': 'En Espera'
      };
      return labels[status] || status;
    }

    /**
     * Obtener color para estado
     * @param {string} status - Estado
     * @returns {string} Color CSS
     */
    getStatusColor(status) {
      const colors = {
        'DRAFT': 'bg-gray-100 text-gray-800',
        'PENDING': 'bg-yellow-100 text-yellow-800',
        'IN_PROGRESS': 'bg-blue-100 text-blue-800',
        'IN_REVIEW': 'bg-purple-100 text-purple-800',
        'COMPLETED': 'bg-green-100 text-green-800',
        'CANCELLED': 'bg-red-100 text-red-800',
        'ON_HOLD': 'bg-orange-100 text-orange-800'
      };
      return colors[status] || 'bg-gray-100 text-gray-800';
    }

    /**
     * Obtener etiqueta para prioridad
     * @param {string} priority - Prioridad
     * @returns {string} Etiqueta en español
     */
    getPriorityLabel(priority) {
      const labels = {
        'LOW': 'Baja',
        'MEDIUM': 'Media',
        'HIGH': 'Alta',
        'CRITICAL': 'Crítica'
      };
      return labels[priority] || priority;
    }

    /**
     * Obtener color para prioridad
     * @param {string} priority - Prioridad
     * @returns {string} Color CSS
     */
    getPriorityColor(priority) {
      const colors = {
        'LOW': 'bg-green-100 text-green-800',
        'MEDIUM': 'bg-yellow-100 text-yellow-800',
        'HIGH': 'bg-orange-100 text-orange-800',
        'CRITICAL': 'bg-red-100 text-red-800'
      };
      return colors[priority] || 'bg-gray-100 text-gray-800';
    }

    /**
     * Validar si una orden está vencida
     * @param {string} deliveryDate - Fecha de entrega
     * @param {string} status - Estado actual
     * @returns {boolean} True si está vencida
     */
    isOrderOverdue(deliveryDate, status) {
      if (!deliveryDate || status === 'COMPLETED' || status === 'CANCELLED') {
        return false;
      }
      return new Date(deliveryDate) < new Date();
    }

    /**
     * Mostrar notificación al usuario
     * @param {string} message - Mensaje
     * @param {string} type - Tipo: success, error, warning, info
     */
    showNotification(message, type = 'info') {
      // Crear elemento de notificación
      const notification = document.createElement('div');
      notification.className = `
        fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 transform transition-all duration-300 ease-in-out
        ${type === 'success' ? 'bg-green-500 text-white' :
          type === 'error' ? 'bg-red-500 text-white' :
          type === 'warning' ? 'bg-yellow-500 text-white' :
          'bg-blue-500 text-white'}
      `;
      
      notification.innerHTML = `
        <div class="flex items-center space-x-2">
          <span>${message}</span>
          <button onclick="this.parentElement.parentElement.remove()" class="ml-2 text-white hover:text-gray-200">
            ×
          </button>
        </div>
      `;
      
      // Agregar al DOM
      document.body.appendChild(notification);
      
      // Auto-remover después de 5 segundos
      setTimeout(() => {
        if (notification.parentNode) {
          notification.style.transform = 'translateX(100%)';
          setTimeout(() => {
            notification.remove();
          }, 300);
        }
      }, 5000);
    }
  }

  // Exponer la clase globalmente
  window.OrdersApiClient = OrdersApiClient;

  // Crear instancia global
  window.ordersApi = new OrdersApiClient();
  
  // Mantener compatibilidad con el nombre anterior
  window.ordersApiClient = window.ordersApi;
  
})(window); 