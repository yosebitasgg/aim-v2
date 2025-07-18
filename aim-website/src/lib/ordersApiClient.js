// Cliente API para el módulo de órdenes
class OrdersApiClient {
  constructor() {
    this.baseUrl = 'http://localhost:3001/api/orders';
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    // Agregar token de autenticación si está disponible
    const token = localStorage.getItem('access_token');
    if (token) {
      defaultOptions.headers.Authorization = `Bearer ${token}`;
    }

    const config = {
      ...defaultOptions,
      ...options
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Orders API request failed:', error);
      throw error;
    }
  }

  // ===== MÉTODOS DE ESTADÍSTICAS =====

  async getOrderStats(params = {}) {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/stats?${queryString}` : '/stats';
    
    return this.request(endpoint);
  }

  async getDashboardData() {
    return this.request('/dashboard');
  }

  // ===== MÉTODOS DE ÓRDENES =====

  async getOrders(filters = {}) {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/?${queryString}` : '/';
    
    console.log(`🔍 Orders API call: ${this.baseUrl}${endpoint}`);
    return this.request(endpoint);
  }

  async getOrderById(id) {
    return this.request(`/${id}`);
  }

  async createOrder(data) {
    return this.request('/', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateOrder(id, data) {
    return this.request(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteOrder(id) {
    return this.request(`/${id}`, {
      method: 'DELETE'
    });
  }

  async changeOrderStatus(orderId, newStatus, notes = '') {
    return this.request(`/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: newStatus, notes })
    });
  }

  // ===== MÉTODOS DE UTILIDADES =====

  formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  }

  formatDateTime(dateString) {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  }

  formatCurrency(amount) {
    if (amount === null || amount === undefined) return 'N/A';
    
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  }

  getStatusColor(status) {
    const statusColors = {
      DRAFT: 'bg-gray-100 text-gray-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
      ON_HOLD: 'bg-orange-100 text-orange-800'
    };
    
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  }

  getStatusLabel(status) {
    const statusLabels = {
      DRAFT: 'Borrador',
      PENDING: 'Pendiente',
      IN_PROGRESS: 'En Progreso',
      COMPLETED: 'Completada',
      CANCELLED: 'Cancelada',
      ON_HOLD: 'En Espera'
    };
    
    return statusLabels[status] || status;
  }

  getPriorityColor(priority) {
    const priorityColors = {
      LOW: 'bg-green-100 text-green-800',
      MEDIUM: 'bg-yellow-100 text-yellow-800',
      HIGH: 'bg-orange-100 text-orange-800',
      URGENT: 'bg-red-100 text-red-800'
    };
    
    return priorityColors[priority] || 'bg-gray-100 text-gray-800';
  }

  getPriorityLabel(priority) {
    const priorityLabels = {
      LOW: 'Baja',
      MEDIUM: 'Media',
      HIGH: 'Alta',
      URGENT: 'Urgente'
    };
    
    return priorityLabels[priority] || priority;
  }

  // Mostrar notificaciones
  showNotification(message, type = 'info') {
    // Implementación básica de notificaciones
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
      type === 'success' ? 'bg-green-500 text-white' :
      type === 'error' ? 'bg-red-500 text-white' :
      type === 'warning' ? 'bg-yellow-500 text-white' :
      'bg-blue-500 text-white'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 5000);
  }
}

// Crear instancia global
const ordersApiClient = new OrdersApiClient();

// Exportar para uso en módulos ES6
export default ordersApiClient;

// También disponible globalmente
if (typeof window !== 'undefined') {
  window.ordersApiClient = ordersApiClient;
} 