// src/components/PortalAuthGuard.jsx
// Componente para proteger rutas del portal con JWT
import { useState, useEffect } from 'react';
import { createAuthChecker } from '../lib/auth.js';

export default function PortalAuthGuard({ children, fallback = null }) {
    const [authState, setAuthState] = useState({
        isAuthenticated: false,
        user: null,
        loading: true,
        error: null
    });

    useEffect(() => {
        const authChecker = createAuthChecker();
        
        async function checkAuth() {
            try {
                console.log('🔍 Verificando autenticación JWT...');
                
                // Verificar si tiene token
                if (!authChecker.isAuthenticated()) {
                    console.log('❌ No hay token, redirigiendo a login...');
                    window.location.href = '/login';
                    return;
                }

                // Obtener información del usuario
                const user = await authChecker.getCurrentUser();
                
                if (!user) {
                    console.log('❌ Token inválido, redirigiendo a login...');
                    window.location.href = '/login';
                    return;
                }

                console.log('✅ Usuario autenticado:', { 
                    id: user.id, 
                    email: user.email, 
                    name: user.name 
                });

                setAuthState({
                    isAuthenticated: true,
                    user: user,
                    loading: false,
                    error: null
                });

            } catch (error) {
                console.error('💥 Error verificando autenticación:', error);
                
                setAuthState({
                    isAuthenticated: false,
                    user: null,
                    loading: false,
                    error: error.message
                });

                // Redirigir a login en caso de error
                setTimeout(() => {
                    window.location.href = '/login';
                }, 1000);
            }
        }

        checkAuth();

        // Verificar periódicamente si el token sigue siendo válido
        const intervalId = setInterval(async () => {
            const authChecker = createAuthChecker();
            if (!authChecker.isAuthenticated()) {
                console.log('🔄 Token expirado, redirigiendo...');
                window.location.href = '/login';
            }
        }, 30000); // Verificar cada 30 segundos

        return () => clearInterval(intervalId);
    }, []);

    // Estado de carga
    if (authState.loading) {
        return fallback || (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Verificando autenticación...</p>
                </div>
            </div>
        );
    }

    // Estado de error
    if (authState.error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-600 text-6xl mb-4">⚠️</div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Error de Autenticación</h2>
                    <p className="text-gray-600 mb-4">{authState.error}</p>
                    <p className="text-sm text-gray-500">Redirigiendo al login...</p>
                </div>
            </div>
        );
    }

    // Usuario autenticado - renderizar contenido
    if (authState.isAuthenticated && authState.user) {
        // Inyectar datos del usuario a los children si es una función
        if (typeof children === 'function') {
            return children(authState.user);
        }

        // O renderizar children normalmente
        return children;
    }

    // Fallback final
    return null;
}

// Hook personalizado para obtener el usuario en cualquier componente hijo
export function useAuthUser() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        async function getCurrentUser() {
            try {
                const authChecker = createAuthChecker();
                const userData = await authChecker.getCurrentUser();
                setUser(userData);
            } catch (error) {
                console.error('Error obteniendo usuario:', error);
                setUser(null);
            }
        }

        getCurrentUser();
    }, []);

    return user;
} 