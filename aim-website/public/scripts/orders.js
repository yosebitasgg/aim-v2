// orders.js - Script principal para la página de órdenes
// Nota: ordersApiClient está disponible globalmente desde ordersApiClient.js

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
    // No auto-inicializar, se inicializará manualmente después de la autenticación
  }

  async init() {
    try {
      console.log('🚀 Inicializando OrdersManager...');
      
      // Verificar que ordersApiClient esté disponible
      if (!window.ordersApiClient) {
        throw new Error('ordersApiClient no está disponible. Asegúrate de cargar ordersApiClient.js primero.');
      }
      
      // Obtener usuario actual primero
      await this.loadCurrentUser();
      
      // Cargar datos iniciales
      await this.loadInitialData();
      
      // Configurar event listeners
      this.setupEventListeners();
      
      // Cargar órdenes
      await this.loadOrders();
      
      // Cargar estadísticas
      await this.loadStats();
      
      console.log('✅ OrdersManager inicializado exitosamente');
    } catch (error) {
      console.error('❌ Error inicializando OrdersManager:', error);
      this.showError('Error inicializando el sistema de órdenes: ' + error.message);
    }
  }

  async loadCurrentUser() {
    try {
      console.log('👤 Obteniendo usuario actual...');
      
      // Usar el userStore que ya está disponible globalmente
      if (typeof window !== 'undefined' && window.userStore) {
        const user = await window.userStore.getUser();
        if (user) {
          this.currentUser = user;
          console.log('✅ Usuario actual cargado desde userStore:', user.name);
          return;
        }
      }
      
      // Fallback: intentar desde la API del backend
      const userResponse = await fetch('http://localhost:3001/api/auth/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      
      if (userResponse.ok) {
        const userData = await userResponse.json();
        this.currentUser = userData.user || userData;
        console.log('✅ Usuario actual cargado desde API:', this.currentUser.name);
      } else {
        console.warn('⚠️ No se pudo obtener el usuario actual');
      }
    } catch (error) {
      console.error('❌ Error obteniendo usuario actual:', error);
      // No es crítico para el funcionamiento, continuar
    }
  }

  async loadInitialData() {
    try {
      console.log('📦 Cargando datos iniciales...');
      
      // Cargar datos en paralelo
      const [clientsResponse, agentsResponse, usersResponse] = await Promise.allSettled([
        window.ordersApiClient.getClients(),
        window.ordersApiClient.getAgents(),
        window.ordersApiClient.getUsers()
      ]);
      
      // Procesar respuestas
      if (clientsResponse.status === 'fulfilled') {
        this.clients = clientsResponse.value || [];
      }
      
      if (agentsResponse.status === 'fulfilled') {
        this.agents = agentsResponse.value || [];
      }
      
      if (usersResponse.status === 'fulfilled') {
        this.users = usersResponse.value || [];
      }
      
      // Poblar filtros
      this.populateFilters();
      
      console.log('✅ Datos iniciales cargados');
    } catch (error) {
      console.error('❌ Error cargando datos iniciales:', error);
      this.showError('Error cargando datos iniciales');
    }
  }

  setupEventListeners() {
    try {
      console.log('🔧 Configurando event listeners...');
      
      // Botón nueva orden
      const newOrderBtn = document.getElementById('newOrderBtn');
      if (newOrderBtn) {
        newOrderBtn.addEventListener('click', () => this.showCreateOrderModal());
      }
      
      // Botón filtrar
      const filterBtn = document.getElementById('filterBtn');
      if (filterBtn) {
        filterBtn.addEventListener('click', () => this.applyFilters());
      }
      
      // Inputs de filtro con debounce
      const filterInputs = document.querySelectorAll('.filter-input');
      filterInputs.forEach(input => {
        input.addEventListener('input', this.debounce(() => {
          this.applyFilters();
        }, 500));
      });
      
      // Paginación
      const prevPageBtn = document.getElementById('prevPage');
      const nextPageBtn = document.getElementById('nextPage');
      
      if (prevPageBtn) {
        prevPageBtn.addEventListener('click', () => {
          if (this.currentPage > 1) {
            this.changePage(this.currentPage - 1);
          }
        });
      }
      
      if (nextPageBtn) {
        nextPageBtn.addEventListener('click', () => {
          this.changePage(this.currentPage + 1);
        });
      }
      
      // Form de crear orden
      const createOrderForm = document.getElementById('createOrderForm');
      if (createOrderForm) {
        createOrderForm.addEventListener('submit', (e) => this.handleCreateOrder(e));
      }
      
      // Selector de cliente existente
      const existingClientSelect = document.querySelector('select[name="existingClientId"]');
      if (existingClientSelect) {
        existingClientSelect.addEventListener('change', (e) => {
          if (e.target.value) {
            this.fillExistingClientData(e.target.value);
          } else {
            this.clearClientData();
          }
        });
      }
      
      console.log('✅ Event listeners configurados');
    } catch (error) {
      console.error('❌ Error configurando event listeners:', error);
    }
  }

  // Utility function para debounce
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  populateFilters() {
    try {
      console.log('🔍 Poblando filtros...');
      
      // Filtro de clientes
      const clientFilter = document.getElementById('clientFilter');
      if (clientFilter && this.clients.length > 0) {
        clientFilter.innerHTML = '<option value="">Todos los clientes</option>';
        this.clients.forEach(client => {
          const option = document.createElement('option');
          option.value = client.id;
          option.textContent = `${client.companyName} - ${client.contactName || 'Sin contacto'}`;
          clientFilter.appendChild(option);
        });
      }
      
      // Filtro de usuarios
      const assignedFilter = document.querySelector('select[name="assignedToId"]');
      if (assignedFilter && this.users.length > 0) {
        assignedFilter.innerHTML = '<option value="">Sin asignar</option>';
        this.users.forEach(user => {
          const option = document.createElement('option');
          option.value = user.id;
          option.textContent = `${user.name} - ${user.email}`;
          assignedFilter.appendChild(option);
        });
      }
      
      // Filtro de agentes
      const agentFilter = document.querySelector('select[name="agentId"]');
      if (agentFilter && this.agents.length > 0) {
        agentFilter.innerHTML = '<option value="">Seleccionar agente</option>';
        this.agents.forEach(agent => {
          const option = document.createElement('option');
          option.value = agent.id;
          option.textContent = `${agent.name} - ${agent.title}`;
          agentFilter.appendChild(option);
        });
      }
      
      // Selector de cliente existente en el modal
      const existingClientSelect = document.querySelector('select[name="existingClientId"]');
      if (existingClientSelect && this.clients.length > 0) {
        existingClientSelect.innerHTML = '<option value="">Nuevo cliente</option>';
        this.clients.forEach(client => {
          const option = document.createElement('option');
          option.value = client.id;
          
          // Obtener nombre del contacto de manera simple
          let contactName = client.contactName || 'Sin contacto';
          if (client.contacts && client.contacts.length > 0) {
            const contact = client.contacts[0];
            contactName = contact.fullName || contact.name || contactName;
          } else if (client.primaryContact) {
            contactName = client.primaryContact.fullName || contactName;
          }
          
          option.textContent = `${client.companyName} - ${contactName}`;
          existingClientSelect.appendChild(option);
        });
      }
      
      // Filtros con opciones estáticas
      const filterOptions = window.ordersApiClient.getFilterOptions();
      
      // Poblar filtro de estado
      const statusFilter = document.getElementById('statusFilter');
      if (statusFilter) {
        statusFilter.innerHTML = '<option value="">Todos</option>';
        filterOptions.status.forEach(status => {
          const option = document.createElement('option');
          option.value = status.value;
          option.textContent = status.label;
          statusFilter.appendChild(option);
        });
      }
      
      // Poblar filtro de prioridad
      const priorityFilter = document.getElementById('priorityFilter');
      if (priorityFilter) {
        priorityFilter.innerHTML = '<option value="">Todas</option>';
        filterOptions.priority.forEach(priority => {
          const option = document.createElement('option');
          option.value = priority.value;
          option.textContent = `${priority.emoji} ${priority.label}`;
          priorityFilter.appendChild(option);
        });
      }
      
      // Poblar selector de prioridad en el modal
      const prioritySelect = document.querySelector('select[name="priority"]');
      if (prioritySelect) {
        prioritySelect.innerHTML = '<option value="">Seleccionar urgencia</option>';
        filterOptions.priority.forEach(priority => {
          const option = document.createElement('option');
          option.value = priority.value;
          option.textContent = `${priority.emoji} ${priority.label}`;
          prioritySelect.appendChild(option);
        });
      }
      
      // Poblar selector de tipo en el modal
      const typeSelect = document.querySelector('select[name="type"]');
      if (typeSelect) {
        typeSelect.innerHTML = '<option value="">Seleccionar tipo</option>';
        filterOptions.type.forEach(type => {
          const option = document.createElement('option');
          option.value = type.value;
          option.textContent = type.label;
          typeSelect.appendChild(option);
        });
      }
      
      console.log('✅ Filtros poblados');
    } catch (error) {
      console.error('❌ Error poblando filtros:', error);
    }
  }

  async applyFilters() {
    try {
      console.log('🔍 Aplicando filtros...');
      
      // Obtener valores de filtros
      const clientId = document.getElementById('clientFilter')?.value || '';
      const status = document.getElementById('statusFilter')?.value || '';
      const priority = document.getElementById('priorityFilter')?.value || '';
      const search = document.getElementById('searchInput')?.value || '';
      const periodFilter = document.getElementById('periodFilter')?.value || '';
      
      // Construir filtros
      this.currentFilters = {
        clientId: clientId,
        status: status,
        priority: priority,
        search: search,
        period: periodFilter,
        page: 1, // Resetear a la primera página
        limit: this.currentLimit
      };
      
      // Resetear página actual
      this.currentPage = 1;
      
      // Cargar órdenes con filtros
      await this.loadOrders();
      
      console.log('✅ Filtros aplicados:', this.currentFilters);
    } catch (error) {
      console.error('❌ Error aplicando filtros:', error);
      this.showError('Error aplicando filtros');
    }
  }

  async loadOrders() {
    try {
      console.log('📋 Cargando órdenes...');
      this.showLoading();
      
      // Preparar filtros con paginación
      const filters = {
        ...this.currentFilters,
        page: this.currentPage,
        limit: this.currentLimit
      };
      
      // Obtener órdenes
      const response = await window.ordersApiClient.getOrders(filters);
      
      // Actualizar datos
      this.orders = response.orders || [];
      
      // Renderizar órdenes
      this.renderOrders();
      
      // Actualizar paginación
      this.updatePagination(response.pagination);
      
      console.log(`✅ ${this.orders.length} órdenes cargadas`);
    } catch (error) {
      console.error('❌ Error cargando órdenes:', error);
      this.showError('Error cargando órdenes');
    } finally {
      this.hideLoading();
    }
  }

  async loadStats() {
    try {
      console.log('📊 Cargando estadísticas...');
      
      // Obtener estadísticas
      const statsResponse = await window.ordersApiClient.getOrderStats();
      this.stats = statsResponse;
      
      // Actualizar display de estadísticas
      this.updateStatsDisplay();
      
      console.log('✅ Estadísticas cargadas');
    } catch (error) {
      console.error('❌ Error cargando estadísticas:', error);
      // No es crítico, continuar
    }
  }

  renderOrders() {
    try {
      console.log('🎨 Renderizando órdenes...');
      
      const tableBody = document.getElementById('ordersTableBody');
      if (!tableBody) return;
      
      // Limpiar tabla
      tableBody.innerHTML = '';
      
      if (this.orders.length === 0) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="7" class="px-6 py-8 text-center text-gray-500">
              <div class="flex flex-col items-center">
                <svg class="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <p class="text-lg font-medium">No se encontraron órdenes</p>
                <p class="text-sm text-gray-400">Intenta ajustar los filtros de búsqueda</p>
              </div>
            </td>
          </tr>
        `;
        return;
      }
      
      // Renderizar cada orden
      this.orders.forEach(order => {
        const row = this.createOrderRow(order);
        tableBody.appendChild(row);
      });
      
      console.log('✅ Órdenes renderizadas');
    } catch (error) {
      console.error('❌ Error renderizando órdenes:', error);
    }
  }

  createOrderRow(order) {
    const row = document.createElement('tr');
    row.className = 'hover:bg-gray-50';
    
    const statusColor = window.ordersApiClient.getStatusColor(order.status);
    const priorityColor = window.ordersApiClient.getPriorityColor(order.priority);
    const isOverdue = window.ordersApiClient.isOrderOverdue(order.requestedDeliveryDate, order.status);
    
    row.innerHTML = `
      <td class="px-6 py-4">
        <div class="flex flex-col">
          <div class="text-sm font-medium text-gray-900">${order.orderNumber}</div>
          <div class="text-sm text-gray-500">${order.client.companyName}</div>
          ${order.client.contactName ? `<div class="text-xs text-gray-400">${order.client.contactName}</div>` : ''}
        </div>
      </td>
      <td class="px-6 py-4">
        <div class="text-sm text-gray-900">${order.agent?.name || 'Sin asignar'}</div>
        ${order.agent?.title ? `<div class="text-xs text-gray-500">${order.agent.title}</div>` : ''}
      </td>
      <td class="px-6 py-4">
        <div class="text-sm text-gray-900">${window.ordersApiClient.formatDate(order.createdAt)}</div>
        ${order.requestedDeliveryDate ? `<div class="text-xs ${isOverdue ? 'text-red-600' : 'text-gray-500'}">
          Entrega: ${window.ordersApiClient.formatDate(order.requestedDeliveryDate)}
        </div>` : ''}
      </td>
      <td class="px-6 py-4">
        <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full ${priorityColor}">
          ${this.getPriorityEmoji(order.priority)} ${this.getPriorityLabel(order.priority)}
        </span>
      </td>
      <td class="px-6 py-4">
        <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColor}">
          ${this.getStatusLabel(order.status)}
        </span>
      </td>
      <td class="px-6 py-4">
        <div class="text-sm font-medium text-gray-900">
          ${order.estimatedBudget ? window.ordersApiClient.formatCurrency(order.estimatedBudget) : 'No estimado'}
        </div>
        ${order.finalAmount ? `<div class="text-xs text-gray-500">Final: ${window.ordersApiClient.formatCurrency(order.finalAmount)}</div>` : ''}
      </td>
      <td class="px-6 py-4">
        <div class="flex items-center space-x-1">
          <button onclick="window.ordersManager.viewOrder('${order.id}')" 
                  class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-colors duration-200" 
                  title="Ver detalles">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
            </svg>
          </button>
          <button onclick="window.ordersManager.editOrder('${order.id}')" 
                  class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 transition-colors duration-200" 
                  title="Editar orden">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
          </button>
          <button onclick="window.ordersManager.downloadOrder('${order.id}')" 
                  class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-700 transition-colors duration-200" 
                  title="Descargar orden">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </button>
          <button onclick="window.ordersManager.deleteOrder('${order.id}')" 
                  class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 transition-colors duration-200" 
                  title="Eliminar orden">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
          </button>
        </div>
      </td>
    `;
    
    return row;
  }

  updateStatsDisplay() {
    try {
      if (!this.stats || !this.stats.overview) return;
      
      const overview = this.stats.overview;
      
      // Actualizar contadores principales
      const elements = {
        'activeOrders': overview.activeOrders || 0,
        'totalOrders': overview.totalOrders || 0,
        'inProcessOrders': overview.activeOrders || 0,
        'completedOrders': overview.completedOrders || 0,
        'totalValue': window.ordersApiClient.formatCurrency(overview.totalValue || 0)
      };
      
      Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
          element.textContent = value;
        }
      });
      
      // Actualizar información adicional
      const totalOrdersGrowth = document.getElementById('totalOrdersGrowth');
      if (totalOrdersGrowth) {
        totalOrdersGrowth.textContent = `${overview.totalOrders || 0} este mes`;
      }
      
      const inProcessInfo = document.getElementById('inProcessInfo');
      if (inProcessInfo) {
        inProcessInfo.textContent = `${overview.activeOrders || 0} activas`;
      }
      
      const completedInfo = document.getElementById('completedInfo');
      if (completedInfo) {
        completedInfo.textContent = `${overview.completedOrders || 0} completadas`;
      }
      
      const totalValueGrowth = document.getElementById('totalValueGrowth');
      if (totalValueGrowth) {
        totalValueGrowth.textContent = `${window.ordersApiClient.formatCurrency(overview.averageValue || 0)} promedio`;
      }
      
      console.log('✅ Estadísticas actualizadas');
    } catch (error) {
      console.error('❌ Error actualizando estadísticas:', error);
    }
  }

  updatePagination(pagination) {
    try {
      if (!pagination) return;
      
      // Actualizar información de página
      const pageInfo = document.getElementById('pageInfo');
      if (pageInfo) {
        const start = ((pagination.page - 1) * pagination.limit) + 1;
        const end = Math.min(pagination.page * pagination.limit, pagination.total);
        pageInfo.textContent = `Mostrando ${start} - ${end} de ${pagination.total} órdenes`;
      }
      
      // Actualizar botones de paginación
      const prevBtn = document.getElementById('prevPage');
      const nextBtn = document.getElementById('nextPage');
      
      if (prevBtn) {
        prevBtn.disabled = pagination.page <= 1;
      }
      
      if (nextBtn) {
        nextBtn.disabled = pagination.page >= pagination.pages;
      }
      
      // Actualizar página actual
      this.currentPage = pagination.page;
      
    } catch (error) {
      console.error('❌ Error actualizando paginación:', error);
    }
  }

  async changePage(newPage) {
    if (newPage === this.currentPage) return;
    
    this.currentPage = newPage;
    await this.loadOrders();
  }

  showCreateOrderModal() {
    const modal = document.getElementById('createOrderModal');
    if (modal) {
      modal.classList.remove('hidden');
      document.body.classList.add('overflow-hidden');
      
      // Poblar el formulario
      this.populateOrderForm();
    }
  }

  hideCreateOrderModal() {
    const modal = document.getElementById('createOrderModal');
    if (modal) {
      modal.classList.add('hidden');
      document.body.classList.remove('overflow-hidden');
      
      // Limpiar formulario
      const form = document.getElementById('createOrderForm');
      if (form) {
        form.reset();
      }
    }
  }

  populateOrderForm() {
    try {
      // Ya se pobló en populateFilters(), pero asegurar que esté actualizado
      this.populateFilters();
      
      // Configurar fecha mínima para entrega
      const deliveryDateInput = document.querySelector('input[name="deliveryDate"]');
      if (deliveryDateInput) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        deliveryDateInput.min = tomorrow.toISOString().split('T')[0];
      }
      
      // Configurar fecha por defecto
      const today = new Date();
      const defaultDeliveryDate = new Date(today);
      defaultDeliveryDate.setDate(today.getDate() + 30); // 30 días por defecto
      
      if (deliveryDateInput) {
        deliveryDateInput.value = defaultDeliveryDate.toISOString().split('T')[0];
      }
      
      // Configurar país por defecto
      const countrySelect = document.querySelector('select[name="projectCountry"]');
      if (countrySelect) {
        countrySelect.value = 'MX';
      }
      
    } catch (error) {
      console.error('❌ Error poblando formulario:', error);
    }
  }

  fillExistingClientData(clientId) {
    try {
      const client = this.clients.find(c => c.id === clientId);
      if (!client) return;
      
      // Obtener contacto principal de manera simple
      let contactName = client.contactName || '';
      let contactEmail = client.contactEmail || '';
      let contactPhone = client.contactPhone || '';
      
      // Si hay contactos en array, usar el primero o el principal
      if (client.contacts && client.contacts.length > 0) {
        const contact = client.contacts.find(c => c.isPrimary) || client.contacts[0];
        contactName = contact.fullName || contact.name || contactName;
        contactEmail = contact.email || contactEmail;
        contactPhone = contact.phone || contactPhone;
      }
      
      // Si hay contacto principal como objeto
      if (client.primaryContact) {
        contactName = client.primaryContact.fullName || contactName;
        contactEmail = client.primaryContact.email || contactEmail;
        contactPhone = client.primaryContact.phone || contactPhone;
      }
      
      // Llenar campos básicos del cliente
      this.setFieldValue('clientName', contactName);
      this.setFieldValue('clientCompany', client.companyName || '');
      this.setFieldValue('clientEmail', contactEmail);
      this.setFieldValue('clientPhone', contactPhone);
      this.setFieldValue('clientRfc', client.rfc || '');
      this.setFieldValue('clientWebsite', client.website || '');
      this.setFieldValue('clientIndustry', client.industry || '');
      this.setFieldValue('clientSize', client.companySize || '');
      
      // Llenar dirección si existe
      let address = null;
      if (client.addresses && client.addresses.length > 0) {
        address = client.addresses.find(a => a.isPrimary) || client.addresses[0];
      } else if (client.primaryAddress) {
        address = client.primaryAddress;
      }
      
      if (address) {
        this.setFieldValue('projectStreet', address.street || '');
        this.setFieldValue('projectInterior', address.interiorNumber || '');
        this.setFieldValue('projectNeighborhood', address.neighborhood || '');
        this.setFieldValue('projectPostalCode', address.postalCode || '');
        this.setFieldValue('projectCity', address.city || '');
        this.setFieldValue('projectState', address.state || '');
        this.setFieldValue('projectCountry', address.country || 'MX');
      }
      
      // Deshabilitar campos de cliente existente
      this.toggleClientFields(false);
      
    } catch (error) {
      console.error('❌ Error llenando datos de cliente:', error);
    }
  }

  clearClientData() {
    try {
      // Campos de cliente a limpiar
      const clientFields = [
        'clientName', 'clientCompany', 'clientEmail', 'clientPhone', 
        'clientRfc', 'clientWebsite', 'clientIndustry', 'clientSize',
        'projectStreet', 'projectInterior', 'projectNeighborhood', 
        'projectPostalCode', 'projectCity', 'projectState', 'projectCountry'
      ];
      
      // Limpiar cada campo de manera segura
      clientFields.forEach(fieldName => {
        this.setFieldValue(fieldName, '');
      });
      
      // Habilitar campos
      this.toggleClientFields(true);
      
    } catch (error) {
      console.error('❌ Error limpiando datos de cliente:', error);
    }
  }

  toggleClientFields(enabled) {
    try {
      const clientFields = [
        'clientName', 'clientCompany', 'clientEmail', 'clientPhone', 
        'clientRfc', 'clientWebsite', 'clientIndustry', 'clientSize'
      ];
      
      clientFields.forEach(fieldName => {
        try {
          const input = document.querySelector(`input[name="${fieldName}"], select[name="${fieldName}"]`);
          if (input) {
            input.disabled = !enabled;
            if (enabled) {
              input.classList.remove('bg-gray-100');
            } else {
              input.classList.add('bg-gray-100');
            }
          }
        } catch (fieldError) {
          // Ignorar errores de campos individuales
        }
      });
    } catch (error) {
      console.error('❌ Error toggleando campos de cliente:', error);
    }
  }

  async handleCreateOrder(event) {
    event.preventDefault();
    
    try {
      console.log('📝 Creando nueva orden...');
      this.showLoading();
      
      const formData = new FormData(event.target);
      const formDataObj = {};
      
      // Convertir FormData a objeto
      for (let [key, value] of formData.entries()) {
        formDataObj[key] = value;
      }
      
      // Estructurar datos para el backend
      const isExistingClient = !!formDataObj.existingClientId;
      
      const orderData = {
        // Campos principales de la orden
        title: formDataObj.orderTitle || '',
        description: formDataObj.description || '',
        requirements: formDataObj.requirements || '',
        agentId: formDataObj.agentId || '',
        priority: formDataObj.priority || 'MEDIUM',
        type: formDataObj.type || 'AUTOMATION',
        
        // Fechas y presupuesto
        requestedDeliveryDate: formDataObj.deliveryDate ? new Date(formDataObj.deliveryDate).toISOString() : undefined,
        estimatedBudget: formDataObj.budget ? parseFloat(formDataObj.budget) : undefined,
        
        // Información adicional
        departmentRequesting: formDataObj.departmentRequesting || '',
        referenceSource: formDataObj.referenceSource || '',
        internalNotes: formDataObj.internalNotes || '',
        
        // Cliente
        isExistingClient: isExistingClient,
        clientId: formDataObj.existingClientId || undefined
      };
      
      // Solo incluir clientData si es un cliente nuevo
      if (!isExistingClient) {
        orderData.clientData = {
          companyName: formDataObj.clientCompany || '',
          contactName: formDataObj.clientName || '',
          contactEmail: formDataObj.clientEmail || '',
          contactPhone: formDataObj.clientPhone || '',
          rfc: formDataObj.clientRfc || '',
          website: formDataObj.clientWebsite || '',
          industry: formDataObj.clientIndustry || '',
          companySize: formDataObj.clientSize || '',
          
          // Dirección del proyecto
          address: {
            street: formDataObj.projectStreet || '',
            interiorNumber: formDataObj.projectInterior || '',
            neighborhood: formDataObj.projectNeighborhood || '',
            postalCode: formDataObj.projectPostalCode || '',
            city: formDataObj.projectCity || '',
            state: formDataObj.projectState || '',
            country: formDataObj.projectCountry || 'MX',
            references: formDataObj.projectReferences || ''
          }
        };
      }
      
      // Validar campos requeridos
      const requiredFields = ['title', 'description', 'agentId'];
      const missingFields = requiredFields.filter(field => !orderData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Campos requeridos faltantes: ${missingFields.join(', ')}`);
      }
      
      // Validar datos del cliente si es nuevo
      if (!isExistingClient) {
        if (!orderData.clientData) {
          throw new Error('Datos del cliente son requeridos para cliente nuevo');
        }
        
        const requiredClientFields = ['companyName', 'contactName', 'contactEmail'];
        const missingClientFields = requiredClientFields.filter(field => !orderData.clientData[field]);
        
        if (missingClientFields.length > 0) {
          throw new Error(`Datos del cliente requeridos: ${missingClientFields.join(', ')}`);
        }
      } else {
        // Para cliente existente, validar que tenemos clientId
        if (!orderData.clientId) {
          throw new Error('Cliente existente requerido');
        }
      }
      
      console.log('📋 Datos estructurados para enviar:', orderData);
      
      // Crear orden
      const newOrder = await window.ordersApiClient.createOrder(orderData);
      
      // Actualizar lista
      await this.loadOrders();
      await this.loadStats();
      
      // Cerrar modal
      this.hideCreateOrderModal();
      
      // Mostrar éxito
      this.showSuccess('Orden creada exitosamente');
      
      console.log('✅ Orden creada:', newOrder.orderNumber);
      
    } catch (error) {
      console.error('❌ Error creando orden:', error);
      this.showError('Error creando orden: ' + error.message);
    } finally {
      this.hideLoading();
    }
  }

  async viewOrder(orderId) {
    try {
      console.log('👁️ Viendo orden:', orderId);
      this.showLoading();
      
      // Obtener detalles de la orden
      const order = await window.ordersApiClient.getOrderById(orderId);
      console.log('📋 Datos de la orden obtenidos:', order);
      
      // Mostrar modal con detalles
      this.showOrderDetails(order);
      
    } catch (error) {
      console.error('❌ Error viendo orden:', error);
      this.showError('Error obteniendo detalles de la orden: ' + error.message);
    } finally {
      this.hideLoading();
    }
  }

  async editOrder(orderId) {
    try {
      console.log('✏️ Editando orden:', orderId);
      this.showLoading();
      
      // Obtener detalles de la orden
      const order = await window.ordersApiClient.getOrderById(orderId);
      console.log('📋 Datos de la orden para editar:', order);
      
      // Mostrar modal de edición
      this.showEditOrderModal(order);
      
    } catch (error) {
      console.error('❌ Error editando orden:', error);
      this.showError('Error obteniendo orden para edición: ' + error.message);
    } finally {
      this.hideLoading();
    }
  }

  async downloadOrder(orderId) {
    try {
      console.log('💾 Descargando orden:', orderId);
      
      // Obtener detalles de la orden
      const order = await window.ordersApiClient.getOrderById(orderId);
      
      // Generar documento
      const document = this.generateOrderDocument(order);
      
      // Descargar
      this.downloadAsFile(document, `orden_${order.orderNumber}.html`);
      
    } catch (error) {
      console.error('❌ Error descargando orden:', error);
      this.showError('Error descargando orden');
    }
  }

  async deleteOrder(orderId) {
    try {
      const order = this.orders.find(o => o.id === orderId);
      if (!order) return;
      
      if (!confirm(`¿Estás seguro de que quieres eliminar la orden ${order.orderNumber}? Esta acción no se puede deshacer.`)) {
        return;
      }
      
      console.log('🗑️ Eliminando orden:', orderId);
      
      // Eliminar orden
      await window.ordersApiClient.deleteOrder(orderId);
      
      // Actualizar lista
      await this.loadOrders();
      await this.loadStats();
      
      // Mostrar éxito
      this.showSuccess('Orden eliminada exitosamente');
      
    } catch (error) {
      console.error('❌ Error eliminando orden:', error);
      this.showError('Error eliminando orden');
    }
  }

  async changeOrderStatus(orderId, newStatus, notes = '') {
    try {
      console.log('🔄 Cambiando estado de orden:', orderId, 'a', newStatus);
      
      // Cambiar estado
      await window.ordersApiClient.changeOrderStatus(orderId, newStatus, notes);
      
      // Actualizar lista
      await this.loadOrders();
      await this.loadStats();
      
      // Mostrar éxito
      this.showSuccess('Estado de orden actualizado exitosamente');
      
    } catch (error) {
      console.error('❌ Error cambiando estado:', error);
      this.showError('Error cambiando estado de orden');
    }
  }

  showOrderDetails(order) {
    // Crear modal de detalles
    const modalHTML = this.createOrderDetailsModal(order);
    
    // Remover modal anterior si existe
    const existingModal = document.getElementById('orderDetailsModal');
    if (existingModal) {
      existingModal.remove();
    }
    
    // Agregar modal al DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Mostrar modal
    const modal = document.getElementById('orderDetailsModal');
    modal.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
    
    // Configurar eventos
    this.setupOrderDetailsModalEvents();
  }

  createOrderDetailsModal(order) {
    const statusColor = window.ordersApiClient.getStatusColor(order.status);
    const priorityColor = window.ordersApiClient.getPriorityColor(order.priority);
    const isOverdue = window.ordersApiClient.isOrderOverdue(order.requestedDeliveryDate, order.status);
    
    return `
      <div id="orderDetailsModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 hidden">
        <div class="flex items-center justify-center min-h-screen p-4">
          <div class="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <!-- Header -->
            <div class="bg-gradient-to-r from-teal-600 to-emerald-600 text-white p-6 rounded-t-xl">
              <div class="flex justify-between items-center">
                <div>
                  <h3 class="text-2xl font-bold">Orden ${order.orderNumber}</h3>
                  <p class="text-teal-100 text-sm mt-1">Detalles completos de la orden</p>
                </div>
                <button onclick="window.ordersManager.closeOrderDetailsModal()" class="text-white hover:text-gray-200 transition-colors">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>
            
            <!-- Content -->
            <div class="p-6">
              <!-- Status Cards -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div class="bg-blue-50 rounded-lg p-4">
                  <div class="flex items-center">
                    <div class="p-2 bg-blue-100 rounded-lg">
                      <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <div class="ml-3">
                      <p class="text-sm font-medium text-blue-900">Estado</p>
                      <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColor}">
                        ${this.getStatusLabel(order.status)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div class="bg-orange-50 rounded-lg p-4">
                  <div class="flex items-center">
                    <div class="p-2 bg-orange-100 rounded-lg">
                      <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <div class="ml-3">
                      <p class="text-sm font-medium text-orange-900">Prioridad</p>
                      <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full ${priorityColor}">
                        ${this.getPriorityEmoji(order.priority)} ${this.getPriorityLabel(order.priority)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div class="bg-green-50 rounded-lg p-4">
                  <div class="flex items-center">
                    <div class="p-2 bg-green-100 rounded-lg">
                      <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                      </svg>
                    </div>
                    <div class="ml-3">
                      <p class="text-sm font-medium text-green-900">Valor</p>
                      <p class="text-lg font-bold text-green-800">
                        ${order.finalAmount ? window.ordersApiClient.formatCurrency(order.finalAmount) : 
                          order.estimatedBudget ? window.ordersApiClient.formatCurrency(order.estimatedBudget) : 'No especificado'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Main Content Grid -->
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <!-- Left Column -->
                <div class="space-y-6">
                  <!-- Cliente -->
                  <div class="bg-gray-50 rounded-lg p-6">
                    <h4 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <svg class="w-5 h-5 mr-2 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                      </svg>
                      Información del Cliente
                    </h4>
                    <div class="space-y-3">
                      <div class="flex items-center">
                        <span class="text-sm font-medium text-gray-700 w-24">Empresa:</span>
                        <span class="text-sm text-gray-900">${order.client.companyName}</span>
                      </div>
                      <div class="flex items-center">
                        <span class="text-sm font-medium text-gray-700 w-24">Contacto:</span>
                        <span class="text-sm text-gray-900">${order.client.contactName || 'No especificado'}</span>
                      </div>
                      <div class="flex items-center">
                        <span class="text-sm font-medium text-gray-700 w-24">Email:</span>
                        <span class="text-sm text-gray-900">${order.client.contactEmail || 'No especificado'}</span>
                      </div>
                      <div class="flex items-center">
                        <span class="text-sm font-medium text-gray-700 w-24">Teléfono:</span>
                        <span class="text-sm text-gray-900">${order.client.contactPhone || 'No especificado'}</span>
                      </div>
                      ${order.client.industry ? `
                        <div class="flex items-center">
                          <span class="text-sm font-medium text-gray-700 w-24">Industria:</span>
                          <span class="text-sm text-gray-900">${order.client.industry}</span>
                        </div>
                      ` : ''}
                    </div>
                  </div>
                  
                  <!-- Agente -->
                  <div class="bg-gray-50 rounded-lg p-6">
                    <h4 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <svg class="w-5 h-5 mr-2 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                      </svg>
                      Agente Asignado
                    </h4>
                    ${order.agent ? `
                      <div class="space-y-3">
                        <div class="flex items-center">
                          <span class="text-sm font-medium text-gray-700 w-24">Nombre:</span>
                          <span class="text-sm text-gray-900">${order.agent.name}</span>
                        </div>
                        <div class="flex items-center">
                          <span class="text-sm font-medium text-gray-700 w-24">Tipo:</span>
                          <span class="text-sm text-gray-900">${order.agent.title}</span>
                        </div>
                        <div class="flex items-center">
                          <span class="text-sm font-medium text-gray-700 w-24">Categoría:</span>
                          <span class="text-sm text-gray-900">${order.agent.category || 'No especificado'}</span>
                        </div>
                      </div>
                    ` : `
                      <div class="flex items-center justify-center py-4">
                        <div class="text-center">
                          <svg class="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                          </svg>
                          <p class="text-sm text-gray-500">Sin agente asignado</p>
                        </div>
                      </div>
                    `}
                  </div>
                </div>
                
                <!-- Right Column -->
                <div class="space-y-6">
                  <!-- Descripción -->
                  <div class="bg-gray-50 rounded-lg p-6">
                    <h4 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <svg class="w-5 h-5 mr-2 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                      Descripción del Proyecto
                    </h4>
                    <p class="text-sm text-gray-700 leading-relaxed">${order.description || 'Sin descripción'}</p>
                  </div>
                  
                  ${order.requirements ? `
                    <div class="bg-gray-50 rounded-lg p-6">
                      <h4 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <svg class="w-5 h-5 mr-2 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                        </svg>
                        Requerimientos
                      </h4>
                      <p class="text-sm text-gray-700 leading-relaxed">${order.requirements}</p>
                    </div>
                  ` : ''}
                  
                  <!-- Fechas y Financiero -->
                  <div class="bg-gray-50 rounded-lg p-6">
                    <h4 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <svg class="w-5 h-5 mr-2 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                      Información Financiera y Fechas
                    </h4>
                    <div class="grid grid-cols-2 gap-4">
                      <div class="space-y-3">
                        <div>
                          <span class="text-sm font-medium text-gray-700">Presupuesto estimado:</span>
                          <p class="text-sm text-gray-900">${order.estimatedBudget ? window.ordersApiClient.formatCurrency(order.estimatedBudget) : 'No especificado'}</p>
                        </div>
                        ${order.finalAmount ? `
                          <div>
                            <span class="text-sm font-medium text-gray-700">Monto final:</span>
                            <p class="text-sm text-gray-900">${window.ordersApiClient.formatCurrency(order.finalAmount)}</p>
                          </div>
                        ` : ''}
                      </div>
                      <div class="space-y-3">
                        <div>
                          <span class="text-sm font-medium text-gray-700">Fecha de creación:</span>
                          <p class="text-sm text-gray-900">${window.ordersApiClient.formatDate(order.createdAt)}</p>
                        </div>
                        <div>
                          <span class="text-sm font-medium text-gray-700">Entrega solicitada:</span>
                          <p class="text-sm text-gray-900 ${isOverdue ? 'text-red-600' : ''}">
                            ${order.requestedDeliveryDate ? window.ordersApiClient.formatDate(order.requestedDeliveryDate) : 'No especificada'}
                          </p>
                        </div>
                        ${order.completedDate ? `
                          <div>
                            <span class="text-sm font-medium text-gray-700">Fecha de completado:</span>
                            <p class="text-sm text-gray-900">${window.ordersApiClient.formatDate(order.completedDate)}</p>
                          </div>
                        ` : ''}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Dirección del proyecto -->
              ${order.projectAddress ? `
                <div class="mt-8 bg-gray-50 rounded-lg p-6">
                  <h4 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg class="w-5 h-5 mr-2 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    Dirección del Proyecto
                  </h4>
                  <div class="text-sm text-gray-700">
                    <p>${order.projectAddress.street || ''}</p>
                    <p>${order.projectAddress.city || ''}, ${order.projectAddress.state || ''} ${order.projectAddress.country || ''}</p>
                    <p>${order.projectAddress.postalCode || ''}</p>
                  </div>
                </div>
              ` : ''}
              
              <!-- Notas internas -->
              ${order.internalNotes ? `
                <div class="mt-8 bg-amber-50 rounded-lg p-6">
                  <h4 class="text-lg font-semibold text-amber-900 mb-4 flex items-center">
                    <svg class="w-5 h-5 mr-2 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                    </svg>
                    Notas Internas
                  </h4>
                  <p class="text-sm text-amber-800">${order.internalNotes}</p>
                </div>
              ` : ''}
            </div>
            
            <!-- Footer -->
            <div class="bg-gray-50 px-6 py-4 rounded-b-xl border-t border-gray-200">
              <div class="flex justify-between items-center">
                <div class="text-sm text-gray-500">
                  Creado por: ${order.createdBy ? order.createdBy.name : 'Sistema'} • ${window.ordersApiClient.formatDateTime(order.createdAt)}
                </div>
                <div class="flex space-x-3">
                  <button onclick="window.ordersManager.editOrder('${order.id}'); window.ordersManager.closeOrderDetailsModal();" 
                          class="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors duration-200 flex items-center space-x-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                    <span>Editar</span>
                  </button>
                  <button onclick="window.ordersManager.downloadOrder('${order.id}')" 
                          class="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200 flex items-center space-x-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    <span>Descargar</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  closeOrderDetailsModal() {
    const modal = document.getElementById('orderDetailsModal');
    if (modal) {
      modal.classList.add('hidden');
      document.body.classList.remove('overflow-hidden');
      
      // Después de un pequeño delay, remover el modal del DOM
      setTimeout(() => {
        modal.remove();
      }, 300);
    }
  }

  setupOrderDetailsModalEvents() {
    const modal = document.getElementById('orderDetailsModal');
    if (modal) {
      // Cerrar modal al hacer clic fuera
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeOrderDetailsModal();
        }
      });

      // Cerrar modal con tecla Escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
          this.closeOrderDetailsModal();
        }
      });
    }
  }

  showEditOrderModal(order) {
    try {
      console.log('🔧 Mostrando modal de edición para orden:', order.orderNumber);
      
      // Remover modal anterior si existe
      const existingModal = document.getElementById('orderEditModal');
      if (existingModal) {
        existingModal.remove();
      }
      
      // Crear modal de edición
      const modalHTML = this.createOrderEditModal(order);
      
      // Agregar modal al DOM
      document.body.insertAdjacentHTML('beforeend', modalHTML);
      
      // Configurar eventos PRIMERO (antes de poblar datos)
      this.setupOrderEditModalEvents(order);
      
      // Poblar selectores
      this.populateEditFormSelectors();
      
      // Poblar campos con datos actuales (con delay para asegurar que los selectores estén listos)
      setTimeout(() => {
        this.populateEditForm(order);
        
        // Verificación adicional después de poblar
        setTimeout(() => {
          this.verifyEditFormPopulation(order);
        }, 300);
      }, 250);
      
      // Mostrar modal
      const modal = document.getElementById('orderEditModal');
      modal.classList.remove('hidden');
      document.body.classList.add('overflow-hidden');
      
      console.log('✅ Modal de edición configurado correctamente');
      
    } catch (error) {
      console.error('❌ Error mostrando modal de edición:', error);
      this.showError('Error configurando formulario de edición: ' + error.message);
    }
  }

  createOrderEditModal(order) {
    return `
      <div id="orderEditModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 hidden">
        <div class="flex items-center justify-center min-h-screen p-4">
          <div class="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <!-- Header -->
            <div class="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6 rounded-t-xl">
              <div class="flex justify-between items-center">
                <div>
                  <h3 class="text-2xl font-bold">Editar Orden ${order.orderNumber}</h3>
                  <p class="text-emerald-100 text-sm mt-1">Modificar los detalles de la orden</p>
                </div>
                <button onclick="window.ordersManager.closeOrderEditModal()" class="text-white hover:text-gray-200 transition-colors">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>
            
            <!-- Form -->
            <form id="editOrderForm" class="p-6 space-y-8">
              <!-- Información General -->
              <div class="border-b border-gray-200 pb-8">
                <h4 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <svg class="w-5 h-5 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  Información General
                </h4>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Título de la Orden *</label>
                    <input type="text" name="editOrderTitle" id="editOrderTitle" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent" 
                           placeholder="Título descriptivo de la orden" required>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                    <select name="editOrderStatus" id="editOrderStatus" 
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                      <option value="DRAFT">Borrador</option>
                      <option value="PENDING">Pendiente</option>
                      <option value="IN_PROGRESS">En Progreso</option>
                      <option value="IN_REVIEW">En Revisión</option>
                      <option value="COMPLETED">Completado</option>
                      <option value="CANCELLED">Cancelado</option>
                      <option value="ON_HOLD">En Espera</option>
                    </select>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Prioridad</label>
                    <select name="editOrderPriority" id="editOrderPriority" 
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                      <option value="LOW">🟢 Baja</option>
                      <option value="MEDIUM">🟡 Media</option>
                      <option value="HIGH">🟠 Alta</option>
                      <option value="CRITICAL">🔴 Crítica</option>
                    </select>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Tipo de Orden</label>
                    <select name="editOrderType" id="editOrderType" 
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                      <option value="AUTOMATION">Automatización</option>
                      <option value="INTEGRATION">Integración</option>
                      <option value="CONSULTATION">Consultoría</option>
                      <option value="MAINTENANCE">Mantenimiento</option>
                      <option value="CUSTOM">Personalizado</option>
                    </select>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Agente Asignado</label>
                    <select name="editAgentId" id="editAgentId" 
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                      <option value="">Seleccionar agente</option>
                      <!-- Se poblarán con JavaScript -->
                    </select>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Asignado a Usuario</label>
                    <select name="editAssignedToId" id="editAssignedToId" 
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                      <option value="">Sin asignar</option>
                      <!-- Se poblarán con JavaScript -->
                    </select>
                  </div>
                </div>
              </div>
              
              <!-- Detalles del Proyecto -->
              <div class="border-b border-gray-200 pb-8">
                <h4 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <svg class="w-5 h-5 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                  </svg>
                  Detalles del Proyecto
                </h4>
                
                <div class="space-y-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Descripción del Proyecto *</label>
                    <textarea name="editDescription" id="editDescription" 
                              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent" 
                              rows="4" placeholder="Describe detalladamente los requerimientos, objetivos y alcance del proyecto de automatización..." required></textarea>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Requerimientos Especiales</label>
                    <textarea name="editRequirements" id="editRequirements" 
                              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent" 
                              rows="3" placeholder="Menciona cualquier requerimiento especial, integraciones necesarias, restricciones técnicas, etc."></textarea>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Notas Internas</label>
                    <textarea name="editInternalNotes" id="editInternalNotes" 
                              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent" 
                              rows="2" placeholder="Notas internas para el equipo (no visibles para el cliente)"></textarea>
                  </div>
                </div>
              </div>
              
              <!-- Fechas y Presupuesto -->
              <div class="border-b border-gray-200 pb-8">
                <h4 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <svg class="w-5 h-5 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  Fechas y Presupuesto
                </h4>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Fecha de Entrega Solicitada</label>
                    <input type="date" name="editDeliveryDate" id="editDeliveryDate" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Fecha de Inicio</label>
                    <input type="date" name="editStartDate" id="editStartDate" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Presupuesto Estimado</label>
                    <div class="relative">
                      <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <input type="number" name="editEstimatedBudget" id="editEstimatedBudget" 
                             class="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent" 
                             placeholder="0.00" step="0.01">
                    </div>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Monto Final</label>
                    <div class="relative">
                      <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <input type="number" name="editFinalAmount" id="editFinalAmount" 
                             class="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent" 
                             placeholder="0.00" step="0.01">
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Información del Cliente (solo lectura) -->
              <div>
                <h4 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <svg class="w-5 h-5 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                  Información del Cliente
                </h4>
                
                <div class="bg-gray-50 rounded-lg p-6">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span class="text-sm font-medium text-gray-700">Empresa:</span>
                      <p class="text-sm text-gray-900">${order.client.companyName}</p>
                    </div>
                    <div>
                      <span class="text-sm font-medium text-gray-700">Contacto:</span>
                      <p class="text-sm text-gray-900">${order.client.contactName || 'No especificado'}</p>
                    </div>
                    <div>
                      <span class="text-sm font-medium text-gray-700">Email:</span>
                      <p class="text-sm text-gray-900">${order.client.contactEmail || 'No especificado'}</p>
                    </div>
                    <div>
                      <span class="text-sm font-medium text-gray-700">Teléfono:</span>
                      <p class="text-sm text-gray-900">${order.client.contactPhone || 'No especificado'}</p>
                    </div>
                  </div>
                  <div class="mt-4 text-sm text-gray-600">
                    <p><strong>Nota:</strong> Para modificar la información del cliente, utiliza el módulo de Clientes.</p>
                  </div>
                </div>
              </div>
              
              <!-- Botones de acción -->
              <div class="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button type="button" onclick="window.ordersManager.closeOrderEditModal()" 
                        class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  Cancelar
                </button>
                <button type="submit" 
                        class="px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-colors duration-200">
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;
  }

  closeOrderEditModal() {
    const modal = document.getElementById('orderEditModal');
    if (modal) {
      modal.classList.add('hidden');
      document.body.classList.remove('overflow-hidden');
      
      // Después de un pequeño delay, remover el modal del DOM
      setTimeout(() => {
        modal.remove();
      }, 300);
    }
  }

  async handleEditOrder(event, orderId) {
    event.preventDefault();
    
    try {
      console.log('💾 Guardando cambios en orden:', orderId);
      this.showLoading();
      
      // Obtener datos del formulario
      const formData = new FormData(event.target);
      const formDataObj = {};
      
      // Convertir FormData a objeto
      for (let [key, value] of formData.entries()) {
        formDataObj[key] = value;
      }
      
      // Estructurar datos para el backend
      const updateData = {
        title: formDataObj.editOrderTitle || undefined,
        description: formDataObj.editDescription || undefined,
        requirements: formDataObj.editRequirements || undefined,
        status: formDataObj.editOrderStatus || undefined,
        priority: formDataObj.editOrderPriority || undefined,
        type: formDataObj.editOrderType || undefined,
        agentId: formDataObj.editAgentId || undefined,
        assignedToId: formDataObj.editAssignedToId || undefined,
        requestedDeliveryDate: formDataObj.editDeliveryDate ? new Date(formDataObj.editDeliveryDate).toISOString() : undefined,
        startDate: formDataObj.editStartDate ? new Date(formDataObj.editStartDate).toISOString() : undefined,
        estimatedBudget: formDataObj.editEstimatedBudget ? parseFloat(formDataObj.editEstimatedBudget) : undefined,
        finalAmount: formDataObj.editFinalAmount ? parseFloat(formDataObj.editFinalAmount) : undefined,
        internalNotes: formDataObj.editInternalNotes || undefined
      };
      
      // Remover propiedades undefined
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined || updateData[key] === '') {
          delete updateData[key];
        }
      });
      
      console.log('📋 Datos para actualizar:', updateData);
      
      // Actualizar orden
      await window.ordersApiClient.updateOrder(orderId, updateData);
      
      // Cerrar modal
      this.closeOrderEditModal();
      
      // Actualizar lista
      await this.loadOrders();
      await this.loadStats();
      
      this.showSuccess('Orden actualizada exitosamente');
      
    } catch (error) {
      console.error('❌ Error actualizando orden:', error);
      this.showError('Error actualizando orden: ' + error.message);
    } finally {
      this.hideLoading();
    }
  }

  setupOrderEditModalEvents(order) {
    try {
      console.log('🔧 Configurando eventos del modal de edición...');
      
      const modal = document.getElementById('orderEditModal');
      if (!modal) {
        console.error('❌ Modal de edición no encontrado');
        return;
      }

      // Cerrar modal al hacer clic fuera
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeOrderEditModal();
        }
      });

      // Cerrar modal con tecla Escape
      const escapeHandler = (e) => {
        if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
          this.closeOrderEditModal();
          document.removeEventListener('keydown', escapeHandler);
        }
      };
      document.addEventListener('keydown', escapeHandler);

      // Configurar formulario SIN reemplazarlo
      const form = document.getElementById('editOrderForm');
      if (form) {
        // Simplemente agregar el event listener
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          this.handleEditOrder(e, order.id);
        });
        
        console.log('✅ Formulario configurado con evento de submit');
      } else {
        console.error('❌ Formulario de edición no encontrado');
      }
      
      console.log('✅ Eventos del modal configurados correctamente');
      
    } catch (error) {
      console.error('❌ Error configurando eventos del modal:', error);
    }
  }

  populateEditForm(order) {
    try {
      console.log('📝 Poblando formulario de edición con datos:', order);
      
      // Verificar que el modal y formulario existan
      const modal = document.getElementById('orderEditModal');
      const form = document.getElementById('editOrderForm');
      
      if (!modal || !form) {
        console.error('❌ Modal o formulario no encontrado para poblar datos');
        return;
      }
      
      // Poblar campos básicos de texto
      this.setEditFieldValue('editOrderTitle', order.title || '');
      this.setEditFieldValue('editDescription', order.description || '');
      this.setEditFieldValue('editRequirements', order.requirements || '');
      this.setEditFieldValue('editInternalNotes', order.internalNotes || '');
      
      // Poblar selectores de estado, prioridad y tipo
      this.setEditFieldValue('editOrderStatus', order.status || 'PENDING');
      this.setEditFieldValue('editOrderPriority', order.priority || 'MEDIUM');
      this.setEditFieldValue('editOrderType', order.type || 'AUTOMATION');
      
      // Poblar fechas con mejor manejo de errores
      if (order.requestedDeliveryDate) {
        try {
          const deliveryDate = new Date(order.requestedDeliveryDate);
          if (!isNaN(deliveryDate.getTime())) {
            const formattedDate = deliveryDate.toISOString().split('T')[0];
            this.setEditFieldValue('editDeliveryDate', formattedDate);
            console.log('📅 Fecha de entrega poblada:', formattedDate);
          }
        } catch (dateError) {
          console.warn('⚠️ Error procesando fecha de entrega:', dateError);
        }
      }
      
      if (order.startDate) {
        try {
          const startDate = new Date(order.startDate);
          if (!isNaN(startDate.getTime())) {
            const formattedDate = startDate.toISOString().split('T')[0];
            this.setEditFieldValue('editStartDate', formattedDate);
            console.log('📅 Fecha de inicio poblada:', formattedDate);
          }
        } catch (dateError) {
          console.warn('⚠️ Error procesando fecha de inicio:', dateError);
        }
      }
      
      // Poblar presupuesto (asegurar que sean números válidos)
      if (order.estimatedBudget && !isNaN(order.estimatedBudget)) {
        this.setEditFieldValue('editEstimatedBudget', order.estimatedBudget.toString());
      }
      
      if (order.finalAmount && !isNaN(order.finalAmount)) {
        this.setEditFieldValue('editFinalAmount', order.finalAmount.toString());
      }
      
      // Poblar agente con verificación - usar setTimeout para asegurar que los selectores estén poblados
      setTimeout(() => {
        const agentId = order.agent?.id || order.agentId || '';
        if (agentId) {
          this.setEditFieldValue('editAgentId', agentId);
          console.log('🤖 Agente ID poblado:', agentId);
          
          // Verificar que la opción exista en el selector
          const agentSelect = document.getElementById('editAgentId');
          if (agentSelect) {
            const optionExists = Array.from(agentSelect.options).some(option => option.value === agentId);
            if (!optionExists) {
              console.warn('⚠️ Agente ID no encontrado en las opciones:', agentId);
            } else {
              console.log('✅ Agente seleccionado correctamente');
            }
          }
        }
        
        // Poblar usuario asignado
        const assignedToId = order.assignedTo?.id || order.assignedToId || '';
        if (assignedToId) {
          this.setEditFieldValue('editAssignedToId', assignedToId);
          console.log('👤 Usuario asignado ID poblado:', assignedToId);
          
          // Verificar que la opción exista en el selector
          const userSelect = document.getElementById('editAssignedToId');
          if (userSelect) {
            const optionExists = Array.from(userSelect.options).some(option => option.value === assignedToId);
            if (!optionExists) {
              console.warn('⚠️ Usuario ID no encontrado en las opciones:', assignedToId);
            } else {
              console.log('✅ Usuario asignado seleccionado correctamente');
            }
          }
        }
        
        console.log('✅ Formulario de edición poblado completamente');
      }, 100);
      
    } catch (error) {
      console.error('❌ Error poblando formulario de edición:', error);
      this.showError('Error poblando formulario de edición: ' + error.message);
    }
  }

  populateEditFormSelectors() {
    try {
      console.log('🔧 Poblando selectores del formulario de edición...');
      console.log('📊 Datos disponibles - Agentes:', this.agents.length, 'Usuarios:', this.users.length);
      
      // Si no hay datos, intentar cargarlos
      if (this.agents.length === 0 || this.users.length === 0) {
        console.log('📦 Datos faltantes, recargando datos iniciales...');
        this.loadInitialData().then(() => {
          // Recurrir después de cargar datos
          this.populateEditFormSelectors();
        });
        return;
      }
      
      // Poblar agentes
      const agentSelect = document.getElementById('editAgentId');
      if (agentSelect) {
        agentSelect.innerHTML = '<option value="">Seleccionar agente</option>';
        
        this.agents.forEach(agent => {
          const option = document.createElement('option');
          option.value = agent.id;
          option.textContent = `${agent.name} - ${agent.title}`;
          agentSelect.appendChild(option);
        });
        console.log(`✅ ${this.agents.length} agentes agregados al selector`);
      } else {
        console.error('❌ Selector de agentes (editAgentId) no encontrado');
      }
      
      // Poblar usuarios
      const userSelect = document.getElementById('editAssignedToId');
      if (userSelect) {
        userSelect.innerHTML = '<option value="">Sin asignar</option>';
        
        this.users.forEach(user => {
          const option = document.createElement('option');
          option.value = user.id;
          option.textContent = `${user.name} - ${user.email}`;
          userSelect.appendChild(option);
        });
        console.log(`✅ ${this.users.length} usuarios agregados al selector`);
      } else {
        console.error('❌ Selector de usuarios (editAssignedToId) no encontrado');
      }
      
      console.log('✅ Selectores poblados correctamente');
      
    } catch (error) {
      console.error('❌ Error poblando selectores:', error);
    }
  }

  // Función para verificar que todos los datos se poblaron correctamente
  verifyEditFormPopulation(order) {
    try {
      console.log('🔍 Verificando que el formulario se haya poblado correctamente...');
      
      const fieldsToCheck = [
        { id: 'editOrderTitle', expected: order.title, description: 'Título' },
        { id: 'editDescription', expected: order.description, description: 'Descripción' },
        { id: 'editOrderStatus', expected: order.status, description: 'Estado' },
        { id: 'editOrderPriority', expected: order.priority, description: 'Prioridad' },
        { id: 'editOrderType', expected: order.type, description: 'Tipo' },
        { id: 'editAgentId', expected: order.agent?.id || order.agentId, description: 'Agente' },
        { id: 'editAssignedToId', expected: order.assignedTo?.id || order.assignedToId, description: 'Usuario asignado' }
      ];
      
      let allFieldsOk = true;
      
      fieldsToCheck.forEach(field => {
        const element = document.getElementById(field.id);
        if (element && field.expected) {
          const currentValue = element.value;
          const expectedValue = String(field.expected);
          
          if (currentValue !== expectedValue) {
            console.warn(`⚠️ ${field.description} no coincide. Esperado: "${expectedValue}", Actual: "${currentValue}"`);
            allFieldsOk = false;
            
            // Intentar corregir
            element.value = expectedValue;
            element.dispatchEvent(new Event('change', { bubbles: true }));
            console.log(`🔧 Corrigiendo ${field.description} a: "${expectedValue}"`);
          }
        }
      });
      
      if (allFieldsOk) {
        console.log('✅ Todos los campos del formulario están poblados correctamente');
      } else {
        console.log('🔧 Se realizaron correcciones en el formulario');
      }
      
    } catch (error) {
      console.error('❌ Error verificando formulario:', error);
    }
  }

  // Helper para llenar campos de formulario de edición
  setEditFieldValue(fieldId, value) {
    try {
      const element = document.getElementById(fieldId);
      if (element) {
        // Convertir valor a string si es necesario
        const stringValue = value !== undefined && value !== null ? String(value) : '';
        
        // Establecer el valor
        element.value = stringValue;
        
        // Triggerar eventos de cambio para asegurar que se actualice
        element.dispatchEvent(new Event('change', { bubbles: true }));
        
        if (stringValue !== '') {
          console.log(`✅ Campo ${fieldId} poblado con valor: "${stringValue}"`);
        } else {
          console.log(`📝 Campo ${fieldId} vaciado`);
        }
        
        // Verificación adicional para selectores
        if (element.tagName === 'SELECT' && stringValue !== '') {
          const selectedOption = element.querySelector(`option[value="${stringValue}"]`);
          if (!selectedOption) {
            console.warn(`⚠️ Opción "${stringValue}" no encontrada en selector ${fieldId}`);
            return false;
          } else {
            console.log(`✅ Opción seleccionada en ${fieldId}: ${selectedOption.textContent}`);
          }
        }
        
        return true;
      } else {
        console.warn(`⚠️ Campo ${fieldId} no encontrado en el DOM`);
        return false;
      }
    } catch (error) {
      console.error(`❌ Error poblando campo ${fieldId}:`, error);
      return false;
    }
  }

  generateOrderDocument(order) {
    const statusColor = this.getStatusColor(order.status);
    const priorityColor = this.getPriorityColor(order.priority);
    
    return `
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Orden ${order.orderNumber} - AIM</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              background: #f8f9fa;
              padding: 20px;
            }
            
            .container {
              max-width: 800px;
              margin: 0 auto;
              background: white;
              border-radius: 12px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              overflow: hidden;
            }
            
            .header {
              background: linear-gradient(135deg, #0d9488, #10b981);
              color: white;
              padding: 40px 30px;
              text-align: center;
            }
            
            .header h1 {
              font-size: 2.5em;
              margin-bottom: 10px;
              font-weight: 700;
            }
            
            .header p {
              font-size: 1.1em;
              opacity: 0.9;
            }
            
            .content {
              padding: 30px;
            }
            
            .status-badges {
              display: flex;
              gap: 15px;
              margin-bottom: 30px;
              flex-wrap: wrap;
              justify-content: center;
            }
            
            .badge {
              padding: 8px 16px;
              border-radius: 20px;
              font-size: 0.9em;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            .badge.status {
              background: #dbeafe;
              color: #1e40af;
            }
            
            .badge.priority {
              background: #fed7aa;
              color: #c2410c;
            }
            
            .badge.type {
              background: #e0e7ff;
              color: #3730a3;
            }
            
            .section {
              margin-bottom: 30px;
              padding: 20px;
              background: #f8f9fa;
              border-radius: 8px;
              border-left: 4px solid #0d9488;
            }
            
            .section h2 {
              color: #0d9488;
              margin-bottom: 15px;
              font-size: 1.4em;
              display: flex;
              align-items: center;
              gap: 10px;
            }
            
            .section h2::before {
              content: '';
              width: 6px;
              height: 6px;
              background: #10b981;
              border-radius: 50%;
            }
            
            .grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
              gap: 20px;
              margin-bottom: 20px;
            }
            
            .field {
              margin-bottom: 12px;
            }
            
            .field-label {
              font-weight: 600;
              color: #374151;
              margin-bottom: 4px;
              display: block;
            }
            
            .field-value {
              color: #6b7280;
              padding: 8px 12px;
              background: white;
              border-radius: 6px;
              border: 1px solid #e5e7eb;
            }
            
            .description {
              background: white;
              padding: 20px;
              border-radius: 8px;
              border: 1px solid #e5e7eb;
              font-size: 0.95em;
              line-height: 1.7;
            }
            
            .client-info {
              background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
              padding: 20px;
              border-radius: 8px;
              border: 1px solid #d1d5db;
            }
            
            .agent-info {
              background: linear-gradient(135deg, #ecfdf5, #d1fae5);
              padding: 20px;
              border-radius: 8px;
              border: 1px solid #a7f3d0;
            }
            
            .financial-info {
              background: linear-gradient(135deg, #fef3c7, #fde68a);
              padding: 20px;
              border-radius: 8px;
              border: 1px solid #f59e0b;
            }
            
            .dates-info {
              background: linear-gradient(135deg, #dbeafe, #bfdbfe);
              padding: 20px;
              border-radius: 8px;
              border: 1px solid #3b82f6;
            }
            
            .footer {
              text-align: center;
              padding: 20px;
              background: #f8f9fa;
              border-top: 1px solid #e5e7eb;
              color: #6b7280;
              font-size: 0.9em;
            }
            
            .logo {
              font-size: 1.5em;
              font-weight: 700;
              color: #0d9488;
              margin-bottom: 5px;
            }
            
            .company-info {
              font-size: 0.9em;
              opacity: 0.8;
            }
            
            .overdue {
              color: #dc2626 !important;
              font-weight: 600;
            }
            
            .empty-state {
              text-align: center;
              padding: 20px;
              color: #6b7280;
              font-style: italic;
            }
            
            @media print {
              body {
                background: white;
                padding: 0;
              }
              
              .container {
                box-shadow: none;
                border-radius: 0;
              }
              
              .header {
                background: #0d9488 !important;
                -webkit-print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <!-- Header -->
            <div class="header">
              <div class="logo">AIM</div>
              <div class="company-info">Asociación de Ingeniería Mireles</div>
              <h1>Orden ${order.orderNumber}</h1>
              <p>Generado el ${window.ordersApiClient.formatDateTime(new Date().toISOString())}</p>
            </div>
            
            <!-- Content -->
            <div class="content">
              <!-- Status Badges -->
              <div class="status-badges">
                <div class="badge status">${this.getStatusLabel(order.status)}</div>
                <div class="badge priority">${this.getPriorityEmoji(order.priority)} ${this.getPriorityLabel(order.priority)}</div>
                <div class="badge type">${order.type || 'No especificado'}</div>
              </div>
              
              <!-- Client Information -->
              <div class="section">
                <h2>Información del Cliente</h2>
                <div class="client-info">
                  <div class="grid">
                    <div class="field">
                      <span class="field-label">Empresa:</span>
                      <div class="field-value">${order.client.companyName}</div>
                    </div>
                    <div class="field">
                      <span class="field-label">Contacto:</span>
                      <div class="field-value">${order.client.contactName || 'No especificado'}</div>
                    </div>
                    <div class="field">
                      <span class="field-label">Email:</span>
                      <div class="field-value">${order.client.contactEmail || 'No especificado'}</div>
                    </div>
                    <div class="field">
                      <span class="field-label">Teléfono:</span>
                      <div class="field-value">${order.client.contactPhone || 'No especificado'}</div>
                    </div>
                    ${order.client.industry ? `
                      <div class="field">
                        <span class="field-label">Industria:</span>
                        <div class="field-value">${order.client.industry}</div>
                      </div>
                    ` : ''}
                  </div>
                </div>
              </div>
              
              <!-- Project Description -->
              <div class="section">
                <h2>Descripción del Proyecto</h2>
                <div class="description">
                  ${order.description ? order.description.replace(/\n/g, '<br>') : '<div class="empty-state">Sin descripción</div>'}
                </div>
              </div>
              
              <!-- Requirements -->
              ${order.requirements ? `
                <div class="section">
                  <h2>Requerimientos Especiales</h2>
                  <div class="description">
                    ${order.requirements.replace(/\n/g, '<br>')}
                  </div>
                </div>
              ` : ''}
              
              <!-- Agent Information -->
              <div class="section">
                <h2>Agente Asignado</h2>
                <div class="agent-info">
                  ${order.agent ? `
                    <div class="grid">
                      <div class="field">
                        <span class="field-label">Nombre:</span>
                        <div class="field-value">${order.agent.name}</div>
                      </div>
                      <div class="field">
                        <span class="field-label">Tipo:</span>
                        <div class="field-value">${order.agent.title}</div>
                      </div>
                      <div class="field">
                        <span class="field-label">Categoría:</span>
                        <div class="field-value">${order.agent.category || 'No especificado'}</div>
                      </div>
                    </div>
                  ` : '<div class="empty-state">Sin agente asignado</div>'}
                </div>
              </div>
              
              <!-- Financial and Dates Information -->
              <div class="grid">
                <div class="section">
                  <h2>Información Financiera</h2>
                  <div class="financial-info">
                    <div class="field">
                      <span class="field-label">Presupuesto Estimado:</span>
                      <div class="field-value">${order.estimatedBudget ? window.ordersApiClient.formatCurrency(order.estimatedBudget) : 'No especificado'}</div>
                    </div>
                    ${order.finalAmount ? `
                      <div class="field">
                        <span class="field-label">Monto Final:</span>
                        <div class="field-value">${window.ordersApiClient.formatCurrency(order.finalAmount)}</div>
                      </div>
                    ` : ''}
                  </div>
                </div>
                
                <div class="section">
                  <h2>Fechas Importantes</h2>
                  <div class="dates-info">
                    <div class="field">
                      <span class="field-label">Fecha de Creación:</span>
                      <div class="field-value">${window.ordersApiClient.formatDate(order.createdAt)}</div>
                    </div>
                    <div class="field">
                      <span class="field-label">Entrega Solicitada:</span>
                      <div class="field-value ${window.ordersApiClient.isOrderOverdue(order.requestedDeliveryDate, order.status) ? 'overdue' : ''}">
                        ${order.requestedDeliveryDate ? window.ordersApiClient.formatDate(order.requestedDeliveryDate) : 'No especificada'}
                      </div>
                    </div>
                    ${order.startDate ? `
                      <div class="field">
                        <span class="field-label">Fecha de Inicio:</span>
                        <div class="field-value">${window.ordersApiClient.formatDate(order.startDate)}</div>
                      </div>
                    ` : ''}
                    ${order.completedDate ? `
                      <div class="field">
                        <span class="field-label">Fecha de Completado:</span>
                        <div class="field-value">${window.ordersApiClient.formatDate(order.completedDate)}</div>
                      </div>
                    ` : ''}
                  </div>
                </div>
              </div>
              
              <!-- Project Address -->
              ${order.projectAddress ? `
                <div class="section">
                  <h2>Dirección del Proyecto</h2>
                  <div class="description">
                    <strong>Dirección:</strong><br>
                    ${order.projectAddress.street || ''}<br>
                    ${order.projectAddress.city || ''}, ${order.projectAddress.state || ''} ${order.projectAddress.country || ''}<br>
                    ${order.projectAddress.postalCode || ''}
                  </div>
                </div>
              ` : ''}
              
              <!-- Internal Notes -->
              ${order.internalNotes ? `
                <div class="section">
                  <h2>Notas Internas</h2>
                  <div class="description" style="background: #fef3c7; border: 1px solid #f59e0b;">
                    ${order.internalNotes.replace(/\n/g, '<br>')}
                  </div>
                </div>
              ` : ''}
              
              <!-- User Information -->
              <div class="section">
                <h2>Información del Sistema</h2>
                <div class="grid">
                  <div class="field">
                    <span class="field-label">Creado por:</span>
                    <div class="field-value">${order.createdBy ? order.createdBy.name : 'Sistema'}</div>
                  </div>
                  <div class="field">
                    <span class="field-label">Asignado a:</span>
                    <div class="field-value">${order.assignedTo ? order.assignedTo.name : 'Sin asignar'}</div>
                  </div>
                  <div class="field">
                    <span class="field-label">Fecha de Creación:</span>
                    <div class="field-value">${window.ordersApiClient.formatDateTime(order.createdAt)}</div>
                  </div>
                  <div class="field">
                    <span class="field-label">Última Actualización:</span>
                    <div class="field-value">${window.ordersApiClient.formatDateTime(order.updatedAt || order.createdAt)}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Footer -->
            <div class="footer">
              <div class="logo">AIM - Asociación de Ingeniería Mireles</div>
              <p>Soluciones de Automatización Industrial • Consultoría en Ingeniería</p>
              <p>Este documento fue generado automáticamente desde el sistema de gestión de órdenes</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
  
  // Helper functions para obtener colores de estado y prioridad
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

  downloadAsFile(content, filename) {
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Métodos de notificación
  showSuccess(message) {
    this.showNotification(message, 'success');
  }

  showError(message) {
    this.showNotification(message, 'error');
  }

  showNotification(message, type = 'info') {
    // Crear notificación
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-md ${
      type === 'success' ? 'bg-green-500 text-white' :
      type === 'error' ? 'bg-red-500 text-white' :
      'bg-blue-500 text-white'
    }`;
    
    notification.innerHTML = `
      <div class="flex items-center">
        <span class="mr-2">
          ${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}
        </span>
        <span>${message}</span>
        <button onclick="this.parentElement.parentElement.remove()" class="ml-auto text-white hover:text-gray-200">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 5000);
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

  // Helper para llenar campos de formulario de manera segura
  setFieldValue(fieldName, value) {
    try {
      const input = document.querySelector(`input[name="${fieldName}"], select[name="${fieldName}"], textarea[name="${fieldName}"]`);
      if (input && value !== undefined && value !== null) {
        input.value = value;
      }
    } catch (error) {
      // Silenciosamente ignorar errores de campos no encontrados
    }
  }

  // Métodos de utilidad
  getPriorityLabel(priority) {
    const options = window.ordersApiClient.getFilterOptions();
    const priorityOption = options.priority.find(p => p.value === priority);
    return priorityOption ? priorityOption.label : priority;
  }

  getPriorityEmoji(priority) {
    const options = window.ordersApiClient.getFilterOptions();
    const priorityOption = options.priority.find(p => p.value === priority);
    return priorityOption ? priorityOption.emoji : '';
  }

  getStatusLabel(status) {
    const options = window.ordersApiClient.getFilterOptions();
    const statusOption = options.status.find(s => s.value === status);
    return statusOption ? statusOption.label : status;
  }
}

// Hacer la clase disponible globalmente
window.OrdersManager = OrdersManager; 