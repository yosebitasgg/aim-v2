// Store centralizado para el usuario
import { authApi, activityApi } from './apiClient.js';

class UserStore {
  constructor() {
    this.user = null;
    this.activities = [];
    this.isLoading = false;
    this.error = null;
    this.initialized = false;
    this.listeners = new Set();
    this.loadUserPromise = null; // Para evitar múltiples peticiones simultáneas
    this.lastLoadTime = 0; // Para implementar caché temporal
    this.CACHE_DURATION = 60000; // 1 minuto de caché
  }

  // Suscribirse a cambios en el store
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Notificar a todos los listeners
  notify() {
    this.listeners.forEach(callback => callback(this.getState()));
  }

  // Obtener estado completo
  getState() {
    return {
      user: this.user,
      activities: this.activities,
      isLoading: this.isLoading,
      error: this.error,
      initialized: this.initialized
    };
  }

  // Cargar datos del usuario (solo la primera vez)
  async loadUser() {
    // Si ya tenemos datos válidos y el caché no ha expirado, usar caché
    const now = Date.now();
    if (this.initialized && this.user && !this.error && (now - this.lastLoadTime < this.CACHE_DURATION)) {
      console.log('👤 Usuario en caché válido, retornando datos existentes');
      return this.user;
    }

    // Si ya hay una petición en progreso, esperar a que termine
    if (this.loadUserPromise) {
      console.log('⏳ Petición ya en progreso, esperando resultado...');
      return await this.loadUserPromise;
    }

    // Crear nueva petición
    this.loadUserPromise = this._loadUserFromServer();
    
    try {
      const result = await this.loadUserPromise;
      this.lastLoadTime = Date.now();
      return result;
    } finally {
      this.loadUserPromise = null;
    }
  }

  // Método interno para cargar desde servidor
  async _loadUserFromServer() {
    this.isLoading = true;
    this.error = null;
    this.notify();

    try {
      console.log('🔐 Cargando datos del usuario desde backend...');
      const response = await authApi.getMe();

      if (!response?.data) {
        throw new Error('No se pudieron obtener los datos del usuario');
      }

      this.user = response.data;
      this.initialized = true;
      this.isLoading = false;
      
      console.log('✅ Usuario cargado en store:', this.user);
      console.log('📋 Campos disponibles:');
      console.log('  - ID:', this.user.id);
      console.log('  - Nombre:', this.user.name);
      console.log('  - Email:', this.user.email);
      console.log('  - Rol:', this.user.role);
      console.log('  - Departamento:', this.user.department);
      console.log('  - Fecha creación:', this.user.createdAt);
      
      // Verificar que los campos críticos existen
      if (!this.user.name) {
        console.warn('⚠️ Campo "name" no encontrado en respuesta del backend');
      }
      if (!this.user.email) {
        console.warn('⚠️ Campo "email" no encontrado en respuesta del backend');
      }

      this.notify();
      return this.user;

    } catch (error) {
      console.error('❌ Error cargando usuario:', error);
      this.error = error.message;
      this.isLoading = false;
      this.user = null;
      this.initialized = true; // Marcar como inicializado aunque haya fallado
      this.notify();
      throw error;
    }
  }

  // Obtener usuario desde caché si existe, sino cargar
  async getUser() {
    if (this.user && this.initialized) {
      return this.user;
    }
    
    return await this.loadUser();
  }

  // Verificar si el usuario está autenticado sin hacer peticiones
  isAuthenticated() {
    return this.user !== null && this.initialized;
  }

  // Cargar actividades del usuario
  async loadActivities(options = {}) {
    try {
      console.log('📊 Cargando actividades del usuario...');
      const response = await activityApi.getMyActivities({
        limit: options.limit || 100,
        sort: 'createdAt:desc',
        ...options
      });

      this.activities = response?.data?.activities || [];
      console.log(`✅ ${this.activities.length} actividades cargadas`);
      
      this.notify();
      return this.activities;

    } catch (error) {
      console.error('❌ Error cargando actividades:', error);
      return [];
    }
  }

  // Obtener estadísticas calculadas
  getStats() {
    if (!this.activities.length) return null;

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisWeek = this.activities.filter(a => a.createdAt && new Date(a.createdAt) >= weekAgo).length;

    const typeCount = {};
    this.activities.forEach(a => {
      const type = a.activityType || 'Desconocido';
      typeCount[type] = (typeCount[type] || 0) + 1;
    });

    const mostCommon = Object.keys(typeCount).length > 0 
      ? Object.keys(typeCount).reduce((a, b) => typeCount[a] > typeCount[b] ? a : b)
      : 'Ninguno';

    return {
      total: this.activities.length,
      thisWeek,
      mostCommon,
      lastActivity: this.activities.length > 0 ? this.activities[0].createdAt : null
    };
  }

  // Logout y limpiar store
  async logout() {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('❌ Error en logout:', error);
    } finally {
      this.clear();
    }
  }

  // Limpiar todos los datos
  clear() {
    this.user = null;
    this.activities = [];
    this.isLoading = false;
    this.error = null;
    this.initialized = false;
    this.notify();
  }

  // Refrescar datos del usuario
  async refresh() {
    this.initialized = false;
    return await this.loadUser();
  }
}

// Exportar instancia única (singleton)
export const userStore = new UserStore();

// Hacer disponible globalmente para debugging
if (typeof window !== 'undefined') {
  window.userStore = userStore;
} 