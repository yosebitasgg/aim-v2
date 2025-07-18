// src/lib/session.js
// Actualizado para funcionar con JWT del backend
import { getCurrentUserFromJWT, isAuthenticated, getTokenInfo } from './auth.js';

const SESSION_COOKIE_NAME = 'aim_session'; // Mantenido para compatibilidad

// Obtener sesión desde JWT (reemplaza verificación de cookies)
export function getSessionId(request) {
    // En el nuevo sistema JWT, simulamos un ID de sesión
    if (typeof window !== 'undefined' && isAuthenticated()) {
        return `jwt_session_${Date.now()}`;
    }
    
    // Fallback para compatibilidad con cookies existentes
    const cookies = request.headers.get('cookie');
    if (!cookies) return null;
    
    const sessionCookie = cookies
        .split(';')
        .find(cookie => cookie.trim().startsWith(`${SESSION_COOKIE_NAME}=`));
    
    if (!sessionCookie) return null;
    
    return sessionCookie.split('=')[1];
}

// Crear cookie de sesión (mantenido para compatibilidad pero sin uso real)
export function createSessionCookie(sessionId) {
    return `${SESSION_COOKIE_NAME}=${sessionId}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}`;
}

// Eliminar cookie de sesión
export function deleteSessionCookie() {
    return `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`;
}

// Validar sesión actual usando JWT
export async function getCurrentUser(request) {
    try {
        // En el nuevo sistema, verificamos JWT directamente
        if (typeof window !== 'undefined') {
            return await getCurrentUserFromJWT();
        }
        
        // Para requests del servidor (SSR), intentamos validar con el token si está disponible
        // Por ahora, retornamos null en SSR hasta implementar cookies JWT
        return null;
    } catch (error) {
        console.error('Error validating JWT session:', error);
        return null;
    }
}

// Middleware para proteger rutas (actualizado para JWT)
export async function requireAuth(request) {
    try {
        // Verificar JWT token
        const tokenInfo = await getTokenInfo();
        
        if (!tokenInfo || !tokenInfo.user) {
            return new Response(null, {
                status: 302,
                headers: {
                    Location: '/login'
                }
            });
        }
        
        return tokenInfo.user;
    } catch (error) {
        console.error('Error in requireAuth:', error);
        return new Response(null, {
            status: 302,
            headers: {
                Location: '/login'
            }
        });
    }
}

// Nueva función helper para obtener usuario con JWT en componentes del cliente
export async function getCurrentUserClient() {
    try {
        if (typeof window === 'undefined') return null;
        
        const userInfo = await getCurrentUserFromJWT();
        return userInfo?.user || null;
    } catch (error) {
        console.error('Error getting current user on client:', error);
        return null;
    }
}

// Verificar si el usuario está autenticado (helper para componentes)
export function isUserAuthenticated() {
    if (typeof window === 'undefined') return false;
    return isAuthenticated();
}

// Función para limpiar sesión (logout)
export function clearSession() {
    // El logout real se maneja en auth.js, esto es solo para compatibilidad
    if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    }
}

// Funciones de compatibilidad mantenidas
export {
    SESSION_COOKIE_NAME
}; 