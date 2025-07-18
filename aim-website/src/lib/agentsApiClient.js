// Cliente API para el módulo de agentes creados
class AgentsApiClient {
  constructor() {
    this.baseUrl = 'http://localhost:3001/api/agents';
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
      console.error('Agents API request failed:', error);
      throw error;
    }
  }

  // ===== MÉTODOS DE ESTADÍSTICAS =====

  async getAgentsStats(params = {}) {
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

  // ===== MÉTODOS DE AGENTES CREADOS =====

  async getCreatedAgents(filters = {}) {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        // Convertir números adecuadamente
        if (typeof value === 'number' || (typeof value === 'string' && !isNaN(Number(value)) && ['page', 'limit'].includes(key))) {
          queryParams.append(key, value.toString());
        } else {
          queryParams.append(key, value.toString());
        }
      }
    });
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/?${queryString}` : '/';
    
    console.log(`🔍 Agents API call: ${this.baseUrl}${endpoint}`);
    return this.request(endpoint);
  }

  async getCreatedAgentById(id) {
    return this.request(`/${id}`);
  }

  async createCreatedAgent(data) {
    return this.request('/', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateCreatedAgent(id, data) {
    return this.request(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteCreatedAgent(id) {
    return this.request(`/${id}`, {
      method: 'DELETE'
    });
  }

  // ===== MÉTODOS DE CONFIGURACIONES =====

  async createAgentConfiguration(data) {
    return this.request('/configurations', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateAgentConfiguration(id, data) {
    return this.request(`/configurations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // ===== MÉTODOS DE WORKFLOWS =====

  async createAgentWorkflow(data) {
    return this.request('/workflows', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateAgentWorkflow(id, data) {
    return this.request(`/workflows/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async getAgentWorkflow(agentId, workflowId) {
    return this.request(`/${agentId}/workflows/${workflowId}`);
  }

  async downloadAgentWorkflow(agentId, workflowId) {
    try {
      const response = await fetch(`${this.baseUrl}/${agentId}/workflows/${workflowId}/download`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Error al descargar el workflow del agente');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error downloading agent workflow:', error);
      throw error;
    }
  }

  // ===== MÉTODOS ESPECÍFICOS PARA LAS PÁGINAS =====

  async getOrdersForAgentCreation(filters = {}) {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/orders/for-creation?${queryString}` : '/orders/for-creation';
    
    console.log(`🔍 Orders for creation API call: ${this.baseUrl}${endpoint}`);
    return this.request(endpoint);
  }

  async getAgentCreationSuggestions(orderId) {
    return this.request(`/suggestions/${orderId}`);
  }

  // ===== MÉTODOS AUXILIARES =====

  async copyToClipboard(workflow) {
    try {
      const workflowText = JSON.stringify(workflow, null, 2);
      await navigator.clipboard.writeText(workflowText);
      return true;
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      return false;
    }
  }

  async downloadAsFile(workflow, filename) {
    try {
      const workflowText = JSON.stringify(workflow, null, 2);
      const blob = new Blob([workflowText], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error('Error downloading file:', error);
      return false;
    }
  }

  // ===== MÉTODOS DE FORMATEO Y UTILIDADES =====

  getStatusColor(status) {
    const statusColors = {
      'DRAFT': 'bg-gray-100 text-gray-800',
      'IN_DEVELOPMENT': 'bg-yellow-100 text-yellow-800',
      'TESTING': 'bg-blue-100 text-blue-800',
      'ACTIVE': 'bg-green-100 text-green-800',
      'INACTIVE': 'bg-red-100 text-red-800',
      'ARCHIVED': 'bg-gray-100 text-gray-800',
      'ERROR': 'bg-red-100 text-red-800'
    };
    
    return statusColors[status] || statusColors['DRAFT'];
  }

  getStatusLabel(status) {
    const statusLabels = {
      'DRAFT': 'Borrador',
      'IN_DEVELOPMENT': 'En Desarrollo',
      'TESTING': 'Pruebas',
      'ACTIVE': 'Activo',
      'INACTIVE': 'Inactivo',
      'ARCHIVED': 'Archivado',
      'ERROR': 'Error'
    };
    
    return statusLabels[status] || status;
  }

  getConnectionTypeLabel(connectionType) {
    const connectionTypeLabels = {
      'API': 'API',
      'RPA': 'RPA',
      'WEBSCRAPING': 'Web Scraping',
      'FILE': 'Archivos',
      'DATABASE': 'Base de Datos',
      'IOT_SENSORS': 'Sensores IoT'
    };
    
    return connectionTypeLabels[connectionType] || connectionType;
  }

  getComplexityLabel(complexity) {
    const complexityLabels = {
      'basic': 'Básica',
      'medium': 'Media',
      'advanced': 'Avanzada'
    };
    
    return complexityLabels[complexity] || complexity;
  }

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
      return 'N/A';
    }
  }

  formatCurrency(amount) {
    if (!amount || isNaN(amount)) return 'N/A';
    
    try {
      return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
      }).format(amount);
    } catch (error) {
      return `$${amount}`;
    }
  }

  // Mostrar notificaciones
  showNotification(message, type = 'info') {
    // Crear notificación temporal
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
      type === 'success' ? 'bg-green-500 text-white' : 
      type === 'error' ? 'bg-red-500 text-white' :
      type === 'warning' ? 'bg-yellow-500 text-white' :
      'bg-blue-500 text-white'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
      notification.classList.add('transform', 'translate-x-0');
    }, 100);
    
    // Remover después de 3 segundos
    setTimeout(() => {
      notification.classList.add('transform', 'translate-x-full');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }

  // ===== CONSTANTES Y HELPERS =====

  getStatusLabel(status) {
    const statusLabels = {
      'DRAFT': 'Borrador',
      'IN_DEVELOPMENT': 'En Desarrollo',
      'TESTING': 'Testing',
      'ACTIVE': 'Activo',
      'INACTIVE': 'Inactivo',
      'ARCHIVED': 'Archivado',
      'ERROR': 'Error',
      // Compatibilidad con versiones anteriores (minúsculas)
      'draft': 'Borrador',
      'in_development': 'En Desarrollo',
      'testing': 'Testing',
      'active': 'Activo',
      'inactive': 'Inactivo',
      'archived': 'Archivado',
      'error': 'Error'
    };
    return statusLabels[status] || status;
  }

  getConnectionTypeLabel(connectionType) {
    const connectionTypeLabels = {
      'API': 'Integración API',
      'RPA': 'Automatización RPA',
      'WEBSCRAPING': 'Extracción Web',
      'FILE': 'Procesamiento de Archivos',
      'DATABASE': 'Integración BD',
      'IOT_SENSORS': 'Conectividad IoT',
      // Compatibilidad con versiones anteriores (minúsculas)
      'api': 'Integración API',
      'rpa': 'Automatización RPA',
      'webscraping': 'Extracción Web',
      'file': 'Procesamiento de Archivos',
      'database': 'Integración BD',
      'iot_sensors': 'Conectividad IoT'
    };
    return connectionTypeLabels[connectionType] || connectionType;
  }

  getComplexityLabel(complexity) {
    const complexityLabels = {
      'basic': 'Básico',
      'medium': 'Intermedio',
      'advanced': 'Avanzado'
    };
    return complexityLabels[complexity] || complexity;
  }

  getStatusColor(status) {
    const statusColors = {
      'DRAFT': 'bg-gray-100 text-gray-800',
      'IN_DEVELOPMENT': 'bg-blue-100 text-blue-800',
      'TESTING': 'bg-yellow-100 text-yellow-800',
      'ACTIVE': 'bg-green-100 text-green-800',
      'INACTIVE': 'bg-orange-100 text-orange-800',
      'ARCHIVED': 'bg-purple-100 text-purple-800',
      'ERROR': 'bg-red-100 text-red-800',
      // Compatibilidad con versiones anteriores (minúsculas)
      'draft': 'bg-gray-100 text-gray-800',
      'in_development': 'bg-blue-100 text-blue-800',
      'testing': 'bg-yellow-100 text-yellow-800',
      'active': 'bg-green-100 text-green-800',
      'inactive': 'bg-orange-100 text-orange-800',
      'archived': 'bg-purple-100 text-purple-800',
      'error': 'bg-red-100 text-red-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  }

  getPriorityColor(priority) {
    const priorityColors = {
      'LOW': 'bg-gray-100 text-gray-800',
      'MEDIUM': 'bg-yellow-100 text-yellow-800',
      'HIGH': 'bg-orange-100 text-orange-800',
      'CRITICAL': 'bg-red-100 text-red-800'
    };
    return priorityColors[priority] || 'bg-gray-100 text-gray-800';
  }

  formatDate(dateString) {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
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
      return new Date(dateString).toLocaleString('es-ES', {
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
}

// Crear instancia global
const agentsApiClient = new AgentsApiClient();

export default agentsApiClient; 