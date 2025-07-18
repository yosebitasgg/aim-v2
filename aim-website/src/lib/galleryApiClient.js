// Cliente API para la galería de agentes
class GalleryApiClient {
  constructor() {
    this.baseUrl = 'http://localhost:3001/api/gallery';
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
      console.error('API request failed:', error);
      throw error;
    }
  }

  // ===== MÉTODOS PÚBLICOS =====

  async getGalleryOverview() {
    return this.request('/overview');
  }

  async getConnectionTypes() {
    return this.request('/connection-types');
  }

  async getConnectionTypeById(id) {
    return this.request(`/connection-types/${id}`);
  }

  async getConnectionTemplates(connectionTypeId = null) {
    const queryParams = connectionTypeId ? `?connectionTypeId=${connectionTypeId}` : '';
    return this.request(`/connection-templates${queryParams}`);
  }

  async getConnectionTemplateById(id) {
    return this.request(`/connection-templates/${id}`);
  }

  async downloadConnectionTemplate(id) {
    try {
      const response = await fetch(`${this.baseUrl}/connection-templates/${id}/download`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Error al descargar la plantilla');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error downloading connection template:', error);
      throw error;
    }
  }

  async getAgentCategories() {
    return this.request('/categories');
  }

  async getAgentCategoryById(id) {
    return this.request(`/categories/${id}`);
  }

  async getAgents(filters = {}) {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/agents?${queryString}` : '/agents';
    
    return this.request(endpoint);
  }

  async getAgentById(id) {
    return this.request(`/agents/${id}`);
  }

  async getAgentBySlug(slug) {
    return this.request(`/agents/slug/${slug}`);
  }

  async downloadAgentTemplate(id) {
    try {
      const response = await fetch(`${this.baseUrl}/agents/${id}/download`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Error al descargar la plantilla del agente');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error downloading agent template:', error);
      throw error;
    }
  }

  async getGalleryStats(params = {}) {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/stats?${queryString}` : '/stats';
    
    return this.request(endpoint);
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

  showNotification(message, type = 'success') {
    // Crear notificación temporal
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
      type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
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
}

// Crear instancia global
const galleryApiClient = new GalleryApiClient();

export default galleryApiClient; 