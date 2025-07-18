// src/pages/api/auth/login.ts
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
    console.log('🔄 Procesando login con nuevo backend JWT...');
    
    try {
        // Obtener datos del formulario
        const formData = await request.formData();
        const email = formData.get('email')?.toString().trim();
        const password = formData.get('password')?.toString();

        console.log('📋 Datos recibidos:', { email, hasPassword: !!password });

        // Validar datos de entrada
        if (!email || !password) {
            console.log('❌ Error: Campos faltantes');
            return new Response(null, {
                status: 302,
                headers: {
                    Location: '/login?error=' + encodeURIComponent('Email y contraseña son requeridos')
                }
            });
        }

        console.log('🔍 Verificando credenciales con backend...');

        // Hacer petición al backend JWT
        const backendResponse = await fetch('http://localhost:3001/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                password
            })
        });

        const responseData = await backendResponse.json();
        console.log('📦 Respuesta del backend:', responseData);

        if (!backendResponse.ok) {
            console.log('❌ Error de backend:', responseData.message || 'Credenciales incorrectas');
            return new Response(null, {
                status: 302,
                headers: {
                    Location: '/login?error=' + encodeURIComponent(responseData.message || 'Credenciales incorrectas')
                }
            });
        }

        // Validar estructura de respuesta
        if (!responseData.data || !responseData.data.user || !responseData.data.accessToken) {
            console.log('❌ Error: Respuesta del backend inválida:', responseData);
            return new Response(null, {
                status: 302,
                headers: {
                    Location: '/login?error=' + encodeURIComponent('Error en la respuesta del servidor')
                }
            });
        }

        const userData = responseData.data.user;
        const accessToken = responseData.data.accessToken;
        const refreshToken = responseData.data.refreshToken;

        console.log('✅ Usuario autenticado:', { 
            id: userData.id, 
            email: userData.email, 
            name: userData.name 
        });

        // Crear respuesta con script para guardar tokens en localStorage
        const loginScript = `
            <script>
                localStorage.setItem('access_token', '${accessToken}');
                localStorage.setItem('refresh_token', '${refreshToken}');
                window.location.href = '/portal';
            </script>
        `;

        return new Response(loginScript, {
            status: 200,
            headers: {
                'Content-Type': 'text/html'
            }
        });

    } catch (error: any) {
        console.error('💥 Error en login:', error);
        return new Response(null, {
            status: 302,
            headers: {
                Location: '/login?error=' + encodeURIComponent('Error interno del servidor')
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