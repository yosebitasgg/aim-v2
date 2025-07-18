// src/lib/portalAuthScript.js
// Script reutilizable para autenticación JWT en páginas del portal

import { createAuthChecker } from './auth.js';

// Variables globales
let currentUser = null;
let authChecker = null;

// Función principal de inicialización
export async function initializePortalAuth(onAuthSuccess = null, onAuthError = null) {
    console.log('🔄 Inicializando autenticación del portal...');
    
    authChecker = createAuthChecker();
    
    try {
        // Verificar si tiene token
        if (!authChecker.isAuthenticated()) {
            console.log('❌ No hay token, redirigiendo a login...');
            window.location.href = '/login';
            return;
        }

        // Obtener información del usuario
        currentUser = await authChecker.getCurrentUser();
        
        if (!currentUser) {
            console.log('❌ Token inválido, redirigiendo a login...');
            window.location.href = '/login';
            return;
        }

        console.log('✅ Usuario autenticado:', {
            id: currentUser.id,
            email: currentUser.email,
            name: currentUser.name,
            role: currentUser.role
        });

        // Mostrar contenido principal y ocultar loading
        showMainContent();

        // Callback de éxito opcional
        if (onAuthSuccess && typeof onAuthSuccess === 'function') {
            await onAuthSuccess(currentUser);
        }

        // Configurar verificación periódica de token
        setupTokenVerification();

        return currentUser;

    } catch (error) {
        console.error('💥 Error en autenticación:', error);
        showAuthError(error.message);
        
        // Callback de error opcional
        if (onAuthError && typeof onAuthError === 'function') {
            onAuthError(error);
        }
        
        return null;
    }
}

// Mostrar contenido principal
function showMainContent() {
    const loadingElement = document.getElementById('auth-loading');
    const mainContent = document.getElementById('main-content');
    
    if (loadingElement) {
        loadingElement.classList.add('hidden');
    }
    
    if (mainContent) {
        mainContent.classList.remove('hidden');
    }
}

// Mostrar error de autenticación
function showAuthError(message) {
    const loadingElement = document.getElementById('auth-loading');
    
    if (loadingElement) {
        loadingElement.innerHTML = `
            <div class="text-center">
                <div class="text-red-600 text-6xl mb-4">⚠️</div>
                <h2 class="text-xl font-semibold text-gray-900 mb-2">Error de Autenticación</h2>
                <p class="text-gray-600 mb-4">${message}</p>
                <p class="text-sm text-gray-500">Redirigiendo al login...</p>
            </div>
        `;
    }
    
    setTimeout(() => {
        window.location.href = '/login';
    }, 2000);
}

// Configurar verificación periódica del token
function setupTokenVerification() {
    // Verificar cada 5 minutos si el token sigue siendo válido (aumentado de 30 segundos)
    const intervalId = setInterval(async () => {
        try {
            if (!authChecker.isAuthenticated()) {
                console.log('🔄 Token no encontrado, redirigiendo...');
                clearInterval(intervalId);
                window.location.href = '/login';
                return;
            }

            // Solo verificar con el servidor cada 5 minutos
            const user = await authChecker.getCurrentUser();
            if (!user) {
                console.log('🔄 Token inválido, redirigiendo...');
                clearInterval(intervalId);
                window.location.href = '/login';
            }
        } catch (error) {
            console.error('Error verificando token:', error);
            clearInterval(intervalId);
            window.location.href = '/login';
        }
    }, 300000); // 5 minutos en lugar de 30 segundos

    // Limpiar interval al cerrar la página
    window.addEventListener('beforeunload', () => {
        clearInterval(intervalId);
    });
}

// Obtener usuario actual (función helper)
export function getCurrentUser() {
    return currentUser;
}

// Verificar si está autenticado (función helper)
export function isAuthenticated() {
    return authChecker ? authChecker.isAuthenticated() : false;
}

// Crear HTML de loading estándar para portal
export function createPortalLoadingHTML() {
    return `
        <div id="auth-loading" class="min-h-screen bg-gray-50 flex items-center justify-center">
            <div class="text-center">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
                <p class="text-gray-600">Verificando autenticación...</p>
            </div>
        </div>
    `;
}

// Función para manejar errores de carga de datos
export function showDataError(containerId, message, retryFunction = null) {
    const container = document.getElementById(containerId);
    
    if (container) {
        const retryButton = retryFunction ? 
            `<button onclick="${retryFunction}()" class="mt-3 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">Reintentar</button>` : '';
        
        container.innerHTML = `
            <div class="text-center py-8">
                <div class="text-red-600 text-4xl mb-2">⚠️</div>
                <p class="text-gray-600">${message}</p>
                ${retryButton}
            </div>
        `;
    }
}

// Función para mostrar estado de carga
export function showLoading(containerId, message = 'Cargando...') {
    const container = document.getElementById(containerId);
    
    if (container) {
        container.innerHTML = `
            <div class="flex items-center justify-center py-8">
                <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600 mr-3"></div>
                <span class="text-gray-500">${message}</span>
            </div>
        `;
    }
} 