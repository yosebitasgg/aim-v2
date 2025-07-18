// documentsApiClient.js - Cliente API para el módulo de documentos
(function(window) {
  'use strict';
  
  const API_BASE_URL = 'http://localhost:3001/api';

  class DocumentsApiClient {
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

    // ===== TIPOS DE DOCUMENTOS =====

    /**
     * Obtener todos los tipos de documentos
     * @param {boolean} includeInactive - Incluir tipos inactivos
     * @returns {Promise<Array>} Lista de tipos de documentos
     */
    async getDocumentTypes(includeInactive = false) {
      try {
        const url = `${this.baseUrl}/documents/types${includeInactive ? '?includeInactive=true' : ''}`;
        const response = await fetch(url, {
          method: 'GET',
          headers: this.getHeaders(),
          credentials: 'include', // Incluir cookies
        });

        return await this.handleResponse(response);
      } catch (error) {
        console.error('Error obteniendo tipos de documentos:', error);
        // Devolver datos simulados en caso de error
        return this.getMockDocumentTypes();
      }
    }

    /**
     * Obtener tipo de documento por ID
     * @param {string} typeId - ID del tipo de documento
     * @returns {Promise<Object>} Detalle del tipo de documento
     */
    async getDocumentTypeById(typeId) {
      try {
        const url = `${this.baseUrl}/documents/types/${typeId}`;
        const response = await fetch(url, {
          method: 'GET',
          headers: this.getHeaders(),
          credentials: 'include',
        });

        return await this.handleResponse(response);
      } catch (error) {
        console.error('Error obteniendo tipo de documento:', error);
        throw error;
      }
    }

    /**
     * Obtener definición de formulario para un tipo de documento
     * @param {string} documentTypeId - ID del tipo de documento
     * @param {string|null} orderId - ID de la orden (opcional)
     * @returns {Promise<Object>} Definición del formulario
     */
    async getDocumentFormDefinition(documentTypeId, orderId = null) {
      try {
        const queryParams = new URLSearchParams();
        if (orderId) {
          queryParams.append('orderId', orderId);
        }

        const url = `${this.baseUrl}/documents/types/${documentTypeId}/form-definition?${queryParams}`;
        const response = await fetch(url, {
          method: 'GET',
          headers: this.getHeaders(),
          credentials: 'include',
        });

        return await this.handleResponse(response);
      } catch (error) {
        console.error('Error obteniendo definición de formulario:', error);
        throw error;
      }
    }

    // ===== DOCUMENTOS =====

    /**
     * Obtener lista de documentos con filtros
     * @param {Object} filters - Filtros de búsqueda
     * @returns {Promise<Object>} Lista paginada de documentos
     */
    async getDocuments(filters = {}) {
      try {
        const queryParams = new URLSearchParams();
        
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, value);
          }
        });

        const url = `${this.baseUrl}/documents?${queryParams}`;
        const response = await fetch(url, {
          method: 'GET',
          headers: this.getHeaders(),
          credentials: 'include',
        });

        const data = await this.handleResponse(response);
        
        // Asegurar que devolvemos la estructura esperada
        return {
          documents: data.documents || [],
          pagination: data.pagination || {
            total: 0,
            page: 1,
            limit: 20,
            pages: 0
          },
          filters: data.filters || filters
        };
      } catch (error) {
        console.error('Error obteniendo documentos:', error);
        // Devolver datos simulados en caso de error
        return {
          documents: [],
          pagination: {
            total: 0,
            page: 1,
            limit: 20,
            pages: 0
          },
          filters: filters
        };
      }
    }

    /**
     * Obtener documento por ID
     * @param {string} documentId - ID del documento
     * @returns {Promise<Object>} Detalle del documento
     */
    async getDocumentById(documentId) {
      try {
        const url = `${this.baseUrl}/documents/${documentId}`;
        const response = await fetch(url, {
          method: 'GET',
          headers: this.getHeaders(),
          credentials: 'include',
        });

        return await this.handleResponse(response);
      } catch (error) {
        console.error('Error obteniendo documento:', error);
        throw error;
      }
    }

    /**
     * Crear un nuevo documento
     * @param {Object} documentData - Datos del documento
     * @returns {Promise<Object>} Documento creado
     */
    async createDocument(documentData) {
      try {
        console.log('📝 Creando documento:', documentData);
        
        const url = `${this.baseUrl}/documents`;
        const response = await fetch(url, {
          method: 'POST',
          headers: this.getHeaders(),
          credentials: 'include',
          body: JSON.stringify(documentData),
        });

        const result = await this.handleResponse(response);
        console.log('✅ Documento creado exitosamente:', result);
        return result;
      } catch (error) {
        console.error('❌ Error creando documento:', error);
        throw error;
      }
    }

    /**
     * Actualizar documento existente
     * @param {string} documentId - ID del documento
     * @param {Object} updateData - Datos a actualizar
     * @returns {Promise<Object>} Documento actualizado
     */
    async updateDocument(documentId, updateData) {
      try {
        const response = await fetch(`${this.baseUrl}/documents/${documentId}`, {
          method: 'PUT',
          headers: this.getHeaders(),
          body: JSON.stringify(updateData),
        });

        return await this.handleResponse(response);
      } catch (error) {
        console.error('Error actualizando documento:', error);
        throw error;
      }
    }

    /**
     * Cambiar estado de documento
     * @param {string} documentId - ID del documento
     * @param {string} newStatus - Nuevo estado
     * @param {string} notes - Notas del cambio (opcional)
     * @returns {Promise<Object>} Documento actualizado
     */
    async changeDocumentStatus(documentId, newStatus, notes = '') {
      try {
        const response = await fetch(`${this.baseUrl}/documents/${documentId}/status`, {
          method: 'PATCH',
          headers: this.getHeaders(),
          body: JSON.stringify({
            status: newStatus,
            notes: notes
          }),
        });

        return await this.handleResponse(response);
      } catch (error) {
        console.error('Error cambiando estado del documento:', error);
        throw error;
      }
    }

    /**
     * Generar documento (PDF/JPG)
     * @param {string} documentId - ID del documento
     * @param {Object} options - Opciones de generación
     * @returns {Promise<Object>} URL y información del archivo generado
     */
    async generateDocument(documentId, options = {}) {
      try {
        const response = await fetch(`${this.baseUrl}/documents/${documentId}/generate`, {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(options),
        });

        return await this.handleResponse(response);
      } catch (error) {
        console.error('Error generando documento:', error);
        throw error;
      }
    }

    /**
     * Descargar documento
     * @param {string} documentId - ID del documento
     * @param {string} format - Formato (pdf, jpg)
     * @returns {Promise<Blob>} Archivo del documento
     */
    async downloadDocument(documentId, format = 'pdf') {
      try {
        const response = await fetch(`${this.baseUrl}/documents/${documentId}/download?format=${format}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.getAuthToken()}`
          },
        });

        if (!response.ok) {
          throw new Error('Error descargando documento');
        }

        return await response.blob();
      } catch (error) {
        console.error('Error descargando documento:', error);
        throw error;
      }
    }

    /**
     * Enviar documento por email
     * @param {string} documentId - ID del documento
     * @param {Object} emailData - Datos del email
     * @returns {Promise<Object>} Confirmación del envío
     */
    async sendDocumentByEmail(documentId, emailData) {
      try {
        const response = await fetch(`${this.baseUrl}/documents/${documentId}/send-email`, {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(emailData),
        });

        return await this.handleResponse(response);
      } catch (error) {
        console.error('Error enviando documento por email:', error);
        throw error;
      }
    }

    /**
     * Obtener documentos por orden
     * @param {string} orderId - ID de la orden
     * @returns {Promise<Object>} Respuesta con lista de documentos de la orden
     */
    async getDocumentsByOrder(orderId) {
      try {
        console.log(`📋 Obteniendo documentos para orden: ${orderId}`);
        
        const response = await fetch(`${this.baseUrl}/documents/by-order/${orderId}`, {
          method: 'GET',
          headers: this.getHeaders(),
          credentials: 'include',
        });

        const result = await this.handleResponse(response);
        console.log(`✅ Documentos obtenidos para orden ${orderId}:`, result);
        
        // El handleResponse ya extrae el data, así que result ES el data
        // Necesitamos verificar si result tiene la estructura esperada
        if (result && result.documents) {
          console.log(`📊 Total documentos encontrados: ${result.documents.length}`);
          return result; // { documents: [...], pagination: {...} }
        } else if (Array.isArray(result)) {
          // Si result es directamente un array
          console.log(`📊 Documentos como array: ${result.length}`);
          return { documents: result, pagination: { total: result.length } };
        } else {
          // Si no tiene la estructura esperada
          console.warn('⚠️ Estructura de respuesta inesperada:', result);
          return { documents: [] };
        }
      } catch (error) {
        console.error('❌ Error obteniendo documentos por orden:', error);
        // En caso de error, devolver estructura vacía pero válida
        return { documents: [] };
      }
    }

    // ===== ESTADÍSTICAS =====

    /**
     * Obtener estadísticas de documentos
     * @param {Object} params - Parámetros de filtro
     * @returns {Promise<Object>} Estadísticas
     */
    async getDocumentStats(params = {}) {
      try {
        const queryParams = new URLSearchParams();
        
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, value);
          }
        });

        const url = `${this.baseUrl}/documents/stats?${queryParams}`;
        const response = await fetch(url, {
          method: 'GET',
          headers: this.getHeaders(),
          credentials: 'include',
        });

        return await this.handleResponse(response);
      } catch (error) {
        console.error('Error obteniendo estadísticas de documentos:', error);
        // Devolver estadísticas simuladas en caso de error
        return this.getMockDocumentStats();
      }
    }

    // ===== UTILIDADES =====

    /**
     * Obtener opciones de filtro para la UI
     * @returns {Object} Opciones de filtro
     */
    getFilterOptions() {
      return {
        status: [
          { value: '', label: 'Todos los estados' },
          { value: 'DRAFT', label: 'Borrador' },
          { value: 'FINALIZED', label: 'Finalizado' },
          { value: 'SENT', label: 'Enviado' },
          { value: 'REVIEWED', label: 'Revisado' },
          { value: 'APPROVED', label: 'Aprobado' },
          { value: 'REJECTED', label: 'Rechazado' },
          { value: 'ARCHIVED', label: 'Archivado' }
        ],
        phases: [
          { value: '', label: 'Todas las fases' },
          { value: 'Fase 1', label: 'Fase 1 - Diagnóstico' },
          { value: 'Fase 2', label: 'Fase 2 - Arquitectura' },
          { value: 'Fase 3', label: 'Fase 3 - Propuesta' },
          { value: 'Fase 5', label: 'Fase 5 - Testing' },
          { value: 'Fase 7', label: 'Fase 7 - Documentación' }
        ],
        sortOptions: [
          { value: 'createdAt', label: 'Fecha de creación' },
          { value: 'updatedAt', label: 'Última actualización' },
          { value: 'documentNumber', label: 'Número de documento' },
          { value: 'title', label: 'Título' }
        ]
      };
    }

    /**
     * Formatear fecha para mostrar
     * @param {string} dateString - Fecha en formato ISO
     * @returns {string} Fecha formateada
     */
    formatDate(dateString) {
      if (!dateString) return '-';
      
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      } catch {
        return dateString;
      }
    }

    /**
     * Formatear fecha y hora para mostrar
     * @param {string} dateString - Fecha en formato ISO
     * @returns {string} Fecha y hora formateadas
     */
    formatDateTime(dateString) {
      if (!dateString) return '-';
      
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch {
        return dateString;
      }
    }

    /**
     * Obtener color según el estado del documento
     * @param {string} status - Estado del documento
     * @returns {string} Clase CSS de color
     */
    getStatusColor(status) {
      const statusColors = {
        'DRAFT': 'gray',
        'FINALIZED': 'blue',
        'SENT': 'yellow',
        'REVIEWED': 'purple',
        'APPROVED': 'green',
        'REJECTED': 'red',
        'ARCHIVED': 'gray'
      };
      
      return statusColors[status] || 'gray';
    }

    /**
     * Obtener etiqueta legible del estado
     * @param {string} status - Estado del documento
     * @returns {string} Etiqueta del estado
     */
    getStatusLabel(status) {
      const statusLabels = {
        'DRAFT': 'Borrador',
        'FINALIZED': 'Finalizado',
        'SENT': 'Enviado',
        'REVIEWED': 'Revisado',
        'APPROVED': 'Aprobado',
        'REJECTED': 'Rechazado',
        'ARCHIVED': 'Archivado'
      };
      
      return statusLabels[status] || status;
    }

    /**
     * Obtener icono según el tipo de documento
     * @param {string} slug - Slug del tipo de documento
     * @returns {string} Nombre del icono
     */
    getDocumentTypeIcon(slug) {
      const typeIcons = {
        'diagnostico': 'tabler:search',
        'roi': 'tabler:calculator',
        'propuesta': 'tabler:file-text',
        'arquitectura': 'tabler:code',
        'testing': 'tabler:bug',
        'manual-usuario': 'tabler:book',
        'manual-tecnico': 'tabler:tool',
        'troubleshooting': 'tabler:alert-circle'
      };
      
      return typeIcons[slug] || 'tabler:file';
    }

    /**
     * Descargar archivo desde blob
     * @param {Blob} blob - Archivo blob
     * @param {string} filename - Nombre del archivo
     */
    downloadBlob(blob, filename) {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }

    /**
     * Mostrar notificación de éxito
     * @param {string} message - Mensaje a mostrar
     */
    showSuccess(message) {
      this.showNotification(message, 'success');
    }

    /**
     * Mostrar notificación de error
     * @param {string} message - Mensaje a mostrar
     */
    showError(message) {
      this.showNotification(message, 'error');
    }

    /**
     * Mostrar notificación genérica
     * @param {string} message - Mensaje a mostrar
     * @param {string} type - Tipo de notificación
     */
    showNotification(message, type = 'info') {
      // Crear elemento de notificación
      const notification = document.createElement('div');
      notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-md ${
        type === 'success' ? 'bg-green-500 text-white' :
        type === 'error' ? 'bg-red-500 text-white' :
        'bg-blue-500 text-white'
      }`;
      notification.textContent = message;
      
      document.body.appendChild(notification);
      
      // Auto-eliminar después de 5 segundos
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 5000);
    }

    // ===== DATOS SIMULADOS =====

    /**
     * Devuelve tipos de documentos simulados en caso de error
     */
    getMockDocumentTypes() {
      return [
        {
          id: 'dt-1',
          name: 'Propuesta Técnica',
          slug: 'propuesta-tecnica',
          description: 'Documento con la propuesta técnica detallada del proyecto',
          phase: 'Planificación',
          icon: 'file-text',
          color: 'blue',
          estimatedTime: '2-3 días',
          isActive: true,
          sortOrder: 1
        },
        {
          id: 'dt-2',
          name: 'Análisis de Requerimientos',
          slug: 'analisis-requerimientos',
          description: 'Documento con el análisis detallado de requerimientos',
          phase: 'Análisis',
          icon: 'search',
          color: 'green',
          estimatedTime: '1-2 días',
          isActive: true,
          sortOrder: 2
        },
        {
          id: 'dt-3',
          name: 'Plan de Implementación',
          slug: 'plan-implementacion',
          description: 'Plan detallado de implementación del agente',
          phase: 'Desarrollo',
          icon: 'calendar',
          color: 'purple',
          estimatedTime: '1 día',
          isActive: true,
          sortOrder: 3
        },
        {
          id: 'dt-4',
          name: 'Informe de Entrega',
          slug: 'informe-entrega',
          description: 'Informe final de entrega del proyecto',
          phase: 'Entrega',
          icon: 'check-circle',
          color: 'emerald',
          estimatedTime: '1 día',
          isActive: true,
          sortOrder: 4
        }
      ];
    }

    /**
     * Devuelve estadísticas simuladas en caso de error
     */
    getMockDocumentStats() {
      return {
        overview: {
          totalDocuments: 0,
          documentsByStatus: {
            DRAFT: 0,
            FINALIZED: 0,
            SENT: 0,
            APPROVED: 0
          },
          documentsByType: {},
          documentsThisMonth: 0,
          averageTimeToFinalize: 0
        },
        documentsByOrder: [],
        documentsByPhase: {},
        timeSeriesData: [],
        recentActivity: []
      };
    }
  }

  // Exponer la clase globalmente
  window.DocumentsApiClient = DocumentsApiClient;

  // Crear instancia global
  window.documentsApi = new DocumentsApiClient();

})(window); 