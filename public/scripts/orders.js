// orders.js - Script principal para la página de órdenes (versión sin módulos ES6)

// API Client simplificado integrado
class OrdersApiClient {
  constructor() {
    this.baseUrl = 'http://localhost:3001';
  }

  getAuthToken() {
    return localStorage.getItem('authToken') || '';
  }

  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.getAuthToken()}`
    };
  }

  async handleResponse(response) {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error de conexión' }));
      throw new Error(error.message || `Error HTTP: ${response.status}`);
    }
    return response.json();
  }

  async getOrders(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    
    const response = await fetch(`${this.baseUrl}/api/orders?${params}`, {
      headers: this.getHeaders()
    });
    return this.handleResponse(response);
  }

  async getOrderById(id) {
    const response = await fetch(`${this.baseUrl}/api/orders/${id}`, {
      headers: this.getHeaders()
    });
    return this.handleResponse(response);
  }

  async createOrder(orderData) {
    const response = await fetch(`${this.baseUrl}/api/orders`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(orderData)
    });
    return this.handleResponse(response);
  }

  async updateOrder(id, updateData) {
    const response = await fetch(`${this.baseUrl}/api/orders/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(updateData)
    });
    return this.handleResponse(response);
  }

  async deleteOrder(id) {
    const response = await fetch(`${this.baseUrl}/api/orders/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    return this.handleResponse(response);
  }

  async getOrderStats(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    
    const response = await fetch(`${this.baseUrl}/api/orders/stats?${params}`, {
      headers: this.getHeaders()
    });
    return this.handleResponse(response);
  }

  async getClients() {
    const response = await fetch(`${this.baseUrl}/api/clients`, {
      headers: this.getHeaders()
    });
    const data = await this.handleResponse(response);
    return data.data?.clients || [];
  }

  async createClient(clientData) {
    const response = await fetch(`${this.baseUrl}/api/clients`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(clientData)
    });
    const data = await this.handleResponse(response);
    return data.data;
  }

  async getUsers() {
    const response = await fetch(`${this.baseUrl}/api/users`, {
      headers: this.getHeaders()
    });
    const data = await this.handleResponse(response);
    return data.data?.users || [];
  }

  async getAgents() {
    const response = await fetch(`${this.baseUrl}/api/gallery/agents`, {
      headers: this.getHeaders()
    });
    const data = await this.handleResponse(response);
    return data.data?.items || [];
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount || 0);
  }

  formatDate(dateString) {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

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

  getPriorityColor(priority) {
    const colors = {
      'LOW': 'bg-green-100 text-green-800',
      'MEDIUM': 'bg-yellow-100 text-yellow-800',
      'HIGH': 'bg-orange-100 text-orange-800',
      'CRITICAL': 'bg-red-100 text-red-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  }
}

// Manager principal
class OrdersManager {
  constructor() {
    this.currentPage = 1;
    this.currentLimit = 20;
    this.currentFilters = {};
    this.orders = [];
    this.stats = {};
    this.clients = [];
    this.agents = [];
    this.users = [];
    this.currentUser = null;
    this.selectedOrder = null;
    this.isLoading = false;
    this.apiClient = new OrdersApiClient();
  }

  async init() {
    console.log('🚀 Inicializando OrdersManager...');
    
    try {
      // Cargar usuario actual
      await this.loadCurrentUser();
      
      // Cargar datos iniciales
      await this.loadInitialData();
      
      // Configurar eventos
      this.setupEventListeners();
      
      // Cargar órdenes y stats
      await Promise.all([
        this.loadOrders(),
        this.loadStats()
      ]);
      
      console.log('✅ OrdersManager inicializado correctamente');
    } catch (error) {
      console.error('❌ Error inicializando OrdersManager:', error);
      this.showError('Error al inicializar el sistema de órdenes');
    }
  }

  async loadCurrentUser() {
    try {
      console.log('👤 Cargando usuario actual...');
      
      // Obtener token
      const token = this.apiClient.getAuthToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      // Decodificar token para obtener información básica
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.currentUser = {
          id: payload.userId,
          name: payload.name || 'Usuario',
          email: payload.email || 'usuario@email.com'
        };
        console.log('✅ Usuario cargado desde token:', this.currentUser);
      } catch (e) {
        console.warn('⚠️ Error decodificando token, usando fallback');
        this.currentUser = {
          id: 'user-1',
          name: 'Usuario',
          email: 'usuario@email.com'
        };
      }
    } catch (error) {
      console.error('❌ Error cargando usuario:', error);
      // Fallback usuario
      this.currentUser = {
        id: 'user-1',
        name: 'Usuario',
        email: 'usuario@email.com'
      };
    }
  }

  async loadInitialData() {
    console.log('📊 Cargando datos iniciales...');
    
    try {
      const [clients, agents, users] = await Promise.all([
        this.apiClient.getClients().catch(() => []),
        this.apiClient.getAgents().catch(() => []),
        this.apiClient.getUsers().catch(() => [])
      ]);

      this.clients = clients;
      this.agents = agents;
      this.users = users;

      console.log('✅ Datos iniciales cargados:', {
        clients: this.clients.length,
        agents: this.agents.length,
        users: this.users.length
      });

      this.populateFilters();
    } catch (error) {
      console.error('❌ Error cargando datos iniciales:', error);
    }
  }

  setupEventListeners() {
    console.log('⚙️ Configurando event listeners...');
    
    // Botón Nueva Orden
    const newOrderBtn = document.getElementById('newOrderBtn');
    if (newOrderBtn) {
      newOrderBtn.addEventListener('click', () => this.showCreateOrderModal());
    }

    // Formulario de crear orden
    const createOrderForm = document.getElementById('createOrderForm');
    if (createOrderForm) {
      createOrderForm.addEventListener('submit', (e) => this.handleCreateOrder(e));
    }

    // Filtros
    const filterBtn = document.getElementById('filterBtn');
    if (filterBtn) {
      filterBtn.addEventListener('click', () => this.applyFilters());
    }

    // Paginación
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    
    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.changePage(this.currentPage - 1));
    }
    
    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.changePage(this.currentPage + 1));
    }

    console.log('✅ Event listeners configurados');
  }

  populateFilters() {
    // Poblar filtro de clientes
    const clientFilter = document.getElementById('clientFilter');
    if (clientFilter && this.clients.length > 0) {
      clientFilter.innerHTML = '<option value="">Todos los clientes</option>';
      this.clients.forEach(client => {
        const option = document.createElement('option');
        option.value = client.id;
        option.textContent = client.companyName;
        clientFilter.appendChild(option);
      });
    }

    // Poblar filtros de estado y prioridad
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
      const statuses = [
        { value: 'DRAFT', label: 'Borrador' },
        { value: 'PENDING', label: 'Pendiente' },
        { value: 'IN_PROGRESS', label: 'En Progreso' },
        { value: 'COMPLETED', label: 'Completado' },
        { value: 'CANCELLED', label: 'Cancelado' }
      ];
      
      statusFilter.innerHTML = '<option value="">Todos los estados</option>';
      statuses.forEach(status => {
        const option = document.createElement('option');
        option.value = status.value;
        option.textContent = status.label;
        statusFilter.appendChild(option);
      });
    }

    const priorityFilter = document.getElementById('priorityFilter');
    if (priorityFilter) {
      const priorities = [
        { value: 'LOW', label: '🟢 Baja' },
        { value: 'MEDIUM', label: '🟡 Media' },
        { value: 'HIGH', label: '🟠 Alta' },
        { value: 'CRITICAL', label: '🔴 Crítica' }
      ];
      
      priorityFilter.innerHTML = '<option value="">Todas las prioridades</option>';
      priorities.forEach(priority => {
        const option = document.createElement('option');
        option.value = priority.value;
        option.textContent = priority.label;
        priorityFilter.appendChild(option);
      });
    }
  }

  async applyFilters() {
    if (this.isLoading) return;

    try {
      this.currentFilters = {
        clientId: document.getElementById('clientFilter')?.value || '',
        status: document.getElementById('statusFilter')?.value || '',
        priority: document.getElementById('priorityFilter')?.value || '',
        search: document.getElementById('searchInput')?.value || ''
      };

      this.currentPage = 1;
      
      await Promise.all([
        this.loadOrders(),
        this.loadStats()
      ]);
      
    } catch (error) {
      console.error('❌ Error aplicando filtros:', error);
      this.showError('Error aplicando filtros');
    }
  }

  async loadOrders() {
    if (this.isLoading) return;

    try {
      this.isLoading = true;
      this.showLoading();

      const filters = {
        ...this.currentFilters,
        page: this.currentPage,
        limit: this.currentLimit
      };

      console.log('📋 Cargando órdenes...');

      const response = await this.apiClient.getOrders(filters);
      this.orders = response.data?.orders || [];
      
      console.log('✅ Órdenes cargadas:', this.orders.length);
      
      this.renderOrders();
      if (response.data?.pagination) {
        this.updatePagination(response.data.pagination);
      }
      
    } catch (error) {
      console.error('❌ Error cargando órdenes:', error);
      this.showError('Error cargando órdenes: ' + error.message);
      this.orders = [];
      this.renderOrders();
    } finally {
      this.isLoading = false;
      this.hideLoading();
    }
  }

  async loadStats() {
    try {
      console.log('📊 Cargando estadísticas...');
      
      const response = await this.apiClient.getOrderStats(this.currentFilters);
      this.stats = response.data || {};
      
      console.log('✅ Estadísticas cargadas');
      
      this.updateStatsDisplay();
    } catch (error) {
      console.error('❌ Error cargando estadísticas:', error);
    }
  }

  renderOrders() {
    const tableBody = document.getElementById('ordersTableBody');
    if (!tableBody) return;

    if (this.orders.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" class="px-6 py-8 text-center text-gray-500">
            <div class="flex flex-col items-center">
              <svg class="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <p class="text-lg font-medium">No se encontraron órdenes</p>
              <p class="text-sm text-gray-400">Prueba ajustando los filtros o crea una nueva orden</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = this.orders.map(order => this.renderOrderRow(order)).join('');
  }

  renderOrderRow(order) {
    const statusColor = this.apiClient.getStatusColor(order.status);
    const priorityColor = this.apiClient.getPriorityColor(order.priority);
    
    return `
      <tr class="hover:bg-gray-50">
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="text-sm font-medium text-gray-900">#${order.orderNumber || order.id}</div>
          <div class="text-sm text-gray-500">${order.client?.companyName || 'Cliente no especificado'}</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="text-sm text-gray-900">${order.agent?.name || 'Sin asignar'}</div>
          <div class="text-sm text-gray-500">${order.agent?.title || ''}</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="text-sm text-gray-900">${this.apiClient.formatDate(order.createdAt)}</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColor}">
            ${this.getPriorityEmoji(order.priority)} ${this.getPriorityLabel(order.priority)}
          </span>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}">
            ${this.getStatusLabel(order.status)}
          </span>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="text-sm text-gray-900">${this.apiClient.formatCurrency(order.estimatedBudget || 0)}</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <div class="flex space-x-2">
            <button onclick="window.ordersManager.viewOrder('${order.id}')" 
                    class="text-teal-600 hover:text-teal-900 p-1 rounded hover:bg-teal-50 transition-colors"
                    title="Ver orden">
              👁️
            </button>
            <button onclick="window.ordersManager.editOrder('${order.id}')" 
                    class="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                    title="Editar orden">
              ✏️
            </button>
            <button onclick="window.ordersManager.deleteOrder('${order.id}')" 
                    class="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                    title="Eliminar orden">
              🗑️
            </button>
          </div>
        </td>
      </tr>
    `;
  }

  updateStatsDisplay() {
    if (!this.stats.overview) return;

    const { overview } = this.stats;
    
    this.updateElement('totalOrders', overview.totalOrders || 0);
    this.updateElement('activeOrders', overview.activeOrders || 0);
    this.updateElement('inProcessOrders', overview.activeOrders || 0);
    this.updateElement('completedOrders', overview.completedOrders || 0);
    this.updateElement('totalValue', this.apiClient.formatCurrency(overview.totalValue || 0));
  }

  updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value;
    }
  }

  updatePagination(pagination) {
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    const pageInfo = document.getElementById('pageInfo');

    if (prevBtn) {
      prevBtn.disabled = pagination.page <= 1;
    }

    if (nextBtn) {
      nextBtn.disabled = pagination.page >= pagination.pages;
    }

    if (pageInfo) {
      const start = Math.min(((pagination.page - 1) * pagination.limit) + 1, pagination.total);
      const end = Math.min(pagination.page * pagination.limit, pagination.total);
      pageInfo.textContent = `Mostrando ${start}-${end} de ${pagination.total} órdenes`;
    }
  }

  async changePage(newPage) {
    if (newPage < 1 || this.isLoading) return;
    
    this.currentPage = newPage;
    await this.loadOrders();
  }

  showCreateOrderModal() {
    const modal = document.getElementById('createOrderModal');
    if (modal) {
      modal.classList.remove('hidden');
      document.body.classList.add('overflow-hidden');
      
      this.populateOrderForm();
    }
  }

  hideCreateOrderModal() {
    const modal = document.getElementById('createOrderModal');
    if (modal) {
      modal.classList.add('hidden');
      document.body.classList.remove('overflow-hidden');
      
      const form = document.getElementById('createOrderForm');
      if (form) {
        form.reset();
      }
    }
  }

  populateOrderForm() {
    console.log('🔧 Poblando formulario de orden...');
    
    // Poblar selector de clientes existentes
    const clientSelect = document.querySelector('#createOrderForm select[name="existingClientId"]');
    if (clientSelect && this.clients.length > 0) {
      clientSelect.innerHTML = '<option value="">Nuevo cliente</option>';
      this.clients.forEach(client => {
        const option = document.createElement('option');
        option.value = client.id;
        option.textContent = client.companyName;
        clientSelect.appendChild(option);
      });
      
      // Agregar event listener
      clientSelect.addEventListener('change', (e) => {
        if (e.target.value) {
          this.fillExistingClientData(e.target.value);
        } else {
          this.clearClientData();
        }
      });
    }

    // Poblar selector de agentes
    const agentSelect = document.querySelector('#createOrderForm select[name="agentId"]');
    if (agentSelect && this.agents.length > 0) {
      agentSelect.innerHTML = '<option value="">Seleccionar agente</option>';
      this.agents.forEach(agent => {
        const option = document.createElement('option');
        option.value = agent.id;
        option.textContent = `${agent.name} - ${agent.title || 'Agente'}`;
        agentSelect.appendChild(option);
      });
    }

    // Poblar selector de usuarios
    const assignedToSelect = document.querySelector('#createOrderForm select[name="assignedToId"]');
    if (assignedToSelect && this.users.length > 0) {
      assignedToSelect.innerHTML = '<option value="">Sin asignar</option>';
      this.users.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = `${user.name} (${user.email})`;
        assignedToSelect.appendChild(option);
      });
    }

    // Poblar selector de prioridad
    const prioritySelect = document.querySelector('#createOrderForm select[name="priority"]');
    if (prioritySelect) {
      prioritySelect.innerHTML = '<option value="">Seleccionar urgencia</option>';
      const priorities = [
        { value: 'LOW', label: '🟢 Baja - 30-45 días' },
        { value: 'MEDIUM', label: '🟡 Media - 15-30 días' },
        { value: 'HIGH', label: '🟠 Alta - 7-15 días' },
        { value: 'CRITICAL', label: '🔴 Crítica - 1-7 días' }
      ];
      
      priorities.forEach(priority => {
        const option = document.createElement('option');
        option.value = priority.value;
        option.textContent = priority.label;
        prioritySelect.appendChild(option);
      });
    }

    // Poblar selector de tipo
    const typeSelect = document.querySelector('#createOrderForm select[name="type"]');
    if (typeSelect) {
      typeSelect.innerHTML = '<option value="">Seleccionar tipo</option>';
      const types = [
        { value: 'AUTOMATION', label: 'Automatización' },
        { value: 'INTEGRATION', label: 'Integración' },
        { value: 'CONSULTATION', label: 'Consultoría' },
        { value: 'MAINTENANCE', label: 'Mantenimiento' },
        { value: 'CUSTOM', label: 'Personalizado' }
      ];
      
      types.forEach(type => {
        const option = document.createElement('option');
        option.value = type.value;
        option.textContent = type.label;
        typeSelect.appendChild(option);
      });
    }

    console.log('✅ Formulario poblado');
  }

  fillExistingClientData(clientId) {
    const client = this.clients.find(c => c.id === clientId);
    if (!client) return;

    console.log('📝 Llenando datos del cliente:', client.companyName);

    const form = document.getElementById('createOrderForm');
    if (!form) return;

    // Llenar campos básicos
    this.setFormValue(form, 'clientCompany', client.companyName);
    this.setFormValue(form, 'clientRfc', client.rfc);
    this.setFormValue(form, 'clientWebsite', client.website);
    this.setFormValue(form, 'clientIndustry', client.industry);
    this.setFormValue(form, 'clientSize', client.companySize);

    // Llenar datos del contacto principal
    if (client.contacts && client.contacts.length > 0) {
      const contact = client.contacts.find(c => c.isPrimary) || client.contacts[0];
      this.setFormValue(form, 'clientName', contact.fullName);
      this.setFormValue(form, 'clientEmail', contact.email);
      this.setFormValue(form, 'clientPhone', contact.phone);
    }

    // Llenar dirección principal
    if (client.addresses && client.addresses.length > 0) {
      const address = client.addresses.find(a => a.isPrimary) || client.addresses[0];
      this.setFormValue(form, 'projectStreet', address.street);
      this.setFormValue(form, 'projectCity', address.city);
      this.setFormValue(form, 'projectState', address.state);
      this.setFormValue(form, 'projectCountry', address.country);
    }

    this.toggleClientFields(false);
  }

  clearClientData() {
    const form = document.getElementById('createOrderForm');
    if (!form) return;

    const clientFields = [
      'clientName', 'clientCompany', 'clientEmail', 'clientPhone', 'clientRfc',
      'clientWebsite', 'clientIndustry', 'clientSize', 'projectStreet',
      'projectCity', 'projectState', 'projectCountry'
    ];
    
    clientFields.forEach(field => {
      this.setFormValue(form, field, '');
    });

    this.toggleClientFields(true);
  }

  setFormValue(form, name, value) {
    const field = form.querySelector(`[name="${name}"]`);
    if (field) {
      field.value = value || '';
    }
  }

  toggleClientFields(enabled) {
    const form = document.getElementById('createOrderForm');
    if (!form) return;

    const clientFields = [
      'clientName', 'clientCompany', 'clientEmail', 'clientPhone', 'clientRfc',
      'clientWebsite', 'clientIndustry', 'clientSize'
    ];
    
    clientFields.forEach(fieldName => {
      const field = form.querySelector(`[name="${fieldName}"]`);
      if (field) {
        field.disabled = !enabled;
        if (enabled) {
          field.classList.remove('bg-gray-100');
        } else {
          field.classList.add('bg-gray-100');
        }
      }
    });
  }

  async handleCreateOrder(event) {
    event.preventDefault();
    
    try {
      console.log('🚀 Creando orden...');
      
      const formData = new FormData(event.target);
      const existingClientId = formData.get('existingClientId');
      
      // Validaciones básicas
      if (!formData.get('clientName')) {
        throw new Error('El nombre del contacto es requerido');
      }
      if (!formData.get('clientCompany')) {
        throw new Error('La razón social es requerida');
      }
      if (!formData.get('clientEmail')) {
        throw new Error('El email del contacto es requerido');
      }
      if (!formData.get('description')) {
        throw new Error('La descripción del proyecto es requerida');
      }

      let clientId = existingClientId;
      
      // Crear cliente si no existe
      if (!existingClientId) {
        console.log('📝 Creando nuevo cliente...');
        
        const clientData = {
          companyName: formData.get('clientCompany'),
          rfc: formData.get('clientRfc'),
          industry: formData.get('clientIndustry') || 'Otro',
          companySize: formData.get('clientSize'),
          website: formData.get('clientWebsite'),
          status: 'prospecto',
          contacts: [{
            fullName: formData.get('clientName'),
            email: formData.get('clientEmail'),
            phone: formData.get('clientPhone'),
            isPrimary: true
          }],
          addresses: [{
            type: 'fisica',
            street: formData.get('projectStreet'),
            city: formData.get('projectCity'),
            state: formData.get('projectState'),
            country: formData.get('projectCountry') || 'MX',
            isPrimary: true
          }]
        };

        const newClient = await this.apiClient.createClient(clientData);
        clientId = newClient.id;
        
        // Actualizar lista de clientes
        this.clients.push(newClient);
      }
      
      // Crear orden
      const orderData = {
        clientId,
        title: formData.get('orderTitle') || `Orden para ${formData.get('clientCompany')}`,
        description: formData.get('description'),
        requirements: formData.get('requirements'),
        agentId: formData.get('agentId'),
        assignedToId: formData.get('assignedToId'),
        status: 'PENDING',
        priority: formData.get('priority') || 'MEDIUM',
        type: formData.get('type') || 'AUTOMATION',
        requestedDeliveryDate: formData.get('deliveryDate'),
        estimatedBudget: parseFloat(formData.get('budget')) || 0,
        currency: 'MXN'
      };

      console.log('🚀 Enviando orden:', orderData);

      await this.apiClient.createOrder(orderData);
      
      this.showSuccess('Orden creada exitosamente');
      this.hideCreateOrderModal();
      
      // Recargar datos
      await Promise.all([
        this.loadOrders(),
        this.loadStats()
      ]);
      
    } catch (error) {
      console.error('❌ Error creando orden:', error);
      this.showError('Error al crear la orden: ' + error.message);
    }
  }

  async viewOrder(orderId) {
    console.log('👁️ Ver orden:', orderId);
    this.showSuccess('Funcionalidad de ver orden próximamente');
  }

  async editOrder(orderId) {
    console.log('✏️ Editar orden:', orderId);
    this.showSuccess('Funcionalidad de editar orden próximamente');
  }

  async deleteOrder(orderId) {
    if (!confirm('¿Estás seguro de que quieres eliminar esta orden?')) {
      return;
    }

    try {
      await this.apiClient.deleteOrder(orderId);
      this.showSuccess('Orden eliminada exitosamente');
      
      await Promise.all([
        this.loadOrders(),
        this.loadStats()
      ]);
    } catch (error) {
      console.error('❌ Error eliminando orden:', error);
      this.showError('Error al eliminar la orden');
    }
  }

  // Métodos de utilidad
  getPriorityLabel(priority) {
    const labels = {
      'LOW': 'Baja',
      'MEDIUM': 'Media', 
      'HIGH': 'Alta',
      'CRITICAL': 'Crítica'
    };
    return labels[priority] || priority;
  }

  getPriorityEmoji(priority) {
    const emojis = {
      'LOW': '🟢',
      'MEDIUM': '🟡',
      'HIGH': '🟠',
      'CRITICAL': '🔴'
    };
    return emojis[priority] || '';
  }

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

  showLoading() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
      spinner.classList.remove('hidden');
    }
  }

  hideLoading() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
      spinner.classList.add('hidden');
    }
  }

  showSuccess(message) {
    this.showNotification(message, 'success');
  }

  showError(message) {
    this.showNotification(message, 'error');
  }

  showNotification(message, type = 'info') {
    console.log(`${type.toUpperCase()}: ${message}`);
    
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-md ${
      type === 'success' ? 'bg-green-500 text-white' : 
      type === 'error' ? 'bg-red-500 text-white' : 
      'bg-blue-500 text-white'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 5000);
  }
}

// Hacer disponible globalmente
window.OrdersManager = OrdersManager; 