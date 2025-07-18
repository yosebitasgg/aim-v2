// src/lib/auth.js
// Nueva implementación usando JWT del backend (aim-backend)
import { apiClient, authApi } from './apiClient.js';
import { userStore } from './userStore.js'; // Added import for userStore

// Verificar usuario con credenciales JWT (reemplaza verificación directa de DB)
export async function verifyUser(email, password) {
    try {
        console.log('🔍 Verificando credenciales con backend JWT...');
        
        const response = await authApi.login(email, password);
        
        if (response.user) {
            console.log('✅ Usuario autenticado:', { 
                id: response.user.id, 
                email: response.user.email, 
                name: response.user.name 
            });
            return response.user;
        }
        
        return null;
    } catch (error) {
        console.error('❌ Error en verificación JWT:', error);
        return null;
    }
}

// Crear usuario con nuevo backend
export async function createUser(userData) {
    try {
        console.log('👤 Creando usuario con backend JWT...');
        
        const response = await authApi.register({
            name: userData.name,
            email: userData.email,
            password: userData.password,
            confirmPassword: userData.password // El backend requiere confirmación
        });
        
        if (response.user) {
            console.log('✅ Usuario creado:', {
                id: response.user.id,
                email: response.user.email,
                name: response.user.name
            });
            return response.user;
        }
        
        throw new Error('Error al crear usuario');
    } catch (error) {
        console.error('❌ Error creando usuario:', error);
        throw error;
    }
}

// Crear sesión (ahora maneja tokens JWT automáticamente)
export async function createSession(userId) {
    // En el nuevo sistema, el token JWT ya está guardado por apiClient
    // Solo retornamos una estructura compatible
    try {
        const user = await authApi.getMe();
        if (user) {
            return {
                id: `jwt_session_${Date.now()}`, // ID de sesión simulado
                userId: user.id,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas
            };
        }
        throw new Error('No se pudo crear sesión');
    } catch (error) {
        console.error('Error creando sesión JWT:', error);
        throw error;
    }
}

// Invalidar sesión (logout)
export async function invalidateSession(sessionId) {
    try {
        console.log('🔐 Cerrando sesión JWT...');
        await authApi.logout();
        console.log('✅ Sesión cerrada exitosamente');
    } catch (error) {
        console.error('Error cerrando sesión:', error);
        throw error;
    }
}

// Obtener usuario por ID
export async function getUserById(userId) {
    try {
        const response = await apiClient.getUserById(userId);
        return response.user || response;
    } catch (error) {
        console.error('Error obteniendo usuario por ID:', error);
        throw error;
    }
}

// Verificar autenticación desde JWT (reemplaza verificación de cookies)
export async function verifyAuth(cookies) {
    try {
        // En el nuevo sistema JWT, verificamos el token desde localStorage
        // Usar userStore para evitar peticiones múltiples
        const user = await userStore.getUser();
        
        if (user) {
            return {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                emailVerified: user.emailVerified || false
            };
        }
        
        return null;
    } catch (error) {
        console.error('Error verificando auth JWT:', error);
        return null;
    }
}

// Funciones de compatibilidad para el frontend existente

// Generar ID único para usuarios (mantenido para compatibilidad)
function generateUserId() {
    return Math.random().toString(36).substr(2, 12);
}

// Generar ID de sesión (mantenido para compatibilidad)  
function generateSessionId() {
    return Math.random().toString(36).substr(2, 16) + Date.now().toString(36);
}

// Obtener usuario actual desde JWT (función helper)
export async function getCurrentUserFromJWT() {
    try {
        // Usar userStore para evitar peticiones múltiples
        const user = await userStore.getUser();
        if (user) {
            return {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    emailVerified: user.emailVerified || false
                }
            };
        }
        return null;
    } catch (error) {
        return null;
    }
}

// Verificar si el usuario está autenticado (nueva función helper)
export function isAuthenticated() {
    return apiClient.getToken() !== null;
}

// Obtener información del token (nueva función helper)
export async function getTokenInfo() {
    try {
        if (!isAuthenticated()) return null;
        
        // Usar userStore para evitar peticiones múltiples
        const user = await userStore.getUser();
        return {
            user,
            token: apiClient.getToken(),
            isValid: true
        };
    } catch (error) {
        return null;
    }
}

// Funciones de migración y compatibilidad
export {
    generateUserId,
    generateSessionId
}; 

// Nueva función para portales - Compatible con SSR
export async function verifyAuthPortal(request = null) {
    try {
        // En SSR, no podemos verificar localStorage
        // Retornamos null y manejamos la auth del lado del cliente
        if (typeof window === 'undefined') {
            console.log('🔄 SSR Context: Deferring auth check to client-side');
            return null;
        }
        
        // Del lado del cliente, verificamos JWT
        const user = await authApi.getMe();
        
        if (user) {
            return {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                emailVerified: user.emailVerified || false
            };
        }
        
        return null;
    } catch (error) {
        console.error('Error verificando auth en portal:', error);
        return null;
    }
}

// Helper para verificar autenticación en tiempo real (cliente)
export function createAuthChecker() {
    return {
        // Verificar si está autenticado
        isAuthenticated: () => {
            if (typeof window === 'undefined') return false;
            return apiClient.getToken() !== null;
        },
        
        // Obtener usuario actual
        getCurrentUser: async () => {
            try {
                if (typeof window === 'undefined') return null;
                const user = await authApi.getMe();
                return user ? {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    emailVerified: user.emailVerified || false
                } : null;
            } catch (error) {
                return null;
            }
        },
        
        // Redirigir a login si no está autenticado
        requireAuth: async () => {
            if (typeof window === 'undefined') return false;
            
            if (!apiClient.getToken()) {
                window.location.href = '/login';
                return false;
            }
            
            try {
                const user = await authApi.getMe();
                return !!user;
            } catch (error) {
                window.location.href = '/login';
                return false;
            }
        }
    };
}

// Validar sesión JWT
export async function validateSession(sessionId) {
    try {
        // Usar userStore para evitar peticiones múltiples
        const user = await userStore.getUser();
        
        if (user) {
            return {
                session: {
                    id: sessionId,
                    userId: user.id,
                    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
                },
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    emailVerified: user.emailVerified || false
                }
            };
        }
        
        return null;
    } catch (error) {
        console.error('Error validando sesión JWT:', error);
        return null;
    }
}