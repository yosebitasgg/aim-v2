// src/pages/api/auth/logout.ts
import type { APIRoute } from 'astro';

// Configurar como server-side rendered
export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
    console.log('🔄 Procesando logout con backend JWT...');
    
    try {
        // Obtener el token desde el header Authorization o form data
        let accessToken = null;
        
        // Intentar obtener token del header
        const authHeader = request.headers.get('authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
            accessToken = authHeader.substring(7);
        }
        
        // Si no hay token en header, intentar desde form data
        if (!accessToken) {
            try {
                const formData = await request.formData();
                accessToken = formData.get('access_token')?.toString();
            } catch (e) {
                // No es form data, continuar sin token
            }
        }

        // Crear respuesta con script para logout
        const logoutScript = `
            <script>
                console.log('🔐 Ejecutando logout...');
                
                // Obtener token desde localStorage si no se proporcionó
                const token = '${accessToken}' || localStorage.getItem('access_token');
                
                // Función para limpiar tokens locales
                function clearLocalTokens() {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    console.log('🧹 Tokens locales limpiados');
                }
                
                // Función para logout en backend
                async function logoutFromBackend(authToken) {
                    if (!authToken) {
                        console.log('⚠️ No hay token para logout en backend');
                        return;
                    }
                    
                    try {
                        const response = await fetch('http://localhost:3001/api/auth/logout', {
                            method: 'POST',
                            headers: {
                                'Authorization': 'Bearer ' + authToken,
                                'Content-Type': 'application/json'
                            }
                        });
                        
                        if (response.ok) {
                            console.log('✅ Logout exitoso en backend');
                        } else {
                            console.log('⚠️ Error en logout backend:', response.status);
                        }
                    } catch (error) {
                        console.log('⚠️ Error conectando con backend para logout:', error.message);
                    }
                }
                
                // Ejecutar logout
                async function performLogout() {
                    // Hacer logout en backend si hay token
                    if (token) {
                        await logoutFromBackend(token);
                    }
                    
                    // Limpiar tokens locales
                    clearLocalTokens();
                    
                    // Redirigir al inicio
                    console.log('🏠 Redirigiendo al inicio...');
                    window.location.href = '/';
                }
                
                // Ejecutar logout
                performLogout();
            </script>
        `;

        console.log('🍪 Procesando logout y redirigiendo...');

        return new Response(logoutScript, {
            status: 200,
            headers: {
                'Content-Type': 'text/html',
                'Cache-Control': 'no-cache, no-store, must-revalidate'
            }
        });

    } catch (error: any) {
        console.error('💥 Error en logout:', error);
        
        // Crear fallback script que al menos limpie tokens locales
        const fallbackScript = `
            <script>
                console.error('Error en logout:', '${error.message}');
                
                // Limpiar tokens incluso con error
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                
                // Redirigir
                window.location.href = '/';
            </script>
        `;
        
        return new Response(fallbackScript, {
            status: 200,
            headers: {
                'Content-Type': 'text/html',
                'Cache-Control': 'no-cache, no-store, must-revalidate'
            }
        });
    }
};

// Solo permitir POST
export const GET: APIRoute = async () => {
    return new Response(null, {
        status: 405,
        headers: {
            Allow: 'POST'
        }
    });
}; 