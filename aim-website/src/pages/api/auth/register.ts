// src/pages/api/auth/register.ts
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
    console.log('🔄 Procesando registro con nuevo backend JWT...');
    
    try {
        // Obtener datos del formulario
        const formData = await request.formData();
        const name = formData.get('name')?.toString().trim();
        const email = formData.get('email')?.toString().trim();
        const password = formData.get('password')?.toString();
        const confirmPassword = formData.get('confirmPassword')?.toString();
        const terms = formData.get('terms');

        console.log('📋 Datos recibidos:', { name, email, hasPassword: !!password, terms });

        // Validar datos de entrada
        if (!name || !email || !password || !confirmPassword) {
            console.log('❌ Error: Campos faltantes');
            return new Response(null, {
                status: 302,
                headers: {
                    Location: '/register?error=' + encodeURIComponent('Todos los campos son requeridos')
                }
            });
        }

        if (password !== confirmPassword) {
            console.log('❌ Error: Contraseñas no coinciden');
            return new Response(null, {
                status: 302,
                headers: {
                    Location: '/register?error=' + encodeURIComponent('Las contraseñas no coinciden')
                }
            });
        }

        if (password.length < 8) {
            console.log('❌ Error: Contraseña muy corta');
            return new Response(null, {
                status: 302,
                headers: {
                    Location: '/register?error=' + encodeURIComponent('La contraseña debe tener al menos 8 caracteres')
                }
            });
        }

        if (!terms) {
            console.log('❌ Error: Términos no aceptados');
            return new Response(null, {
                status: 302,
                headers: {
                    Location: '/register?error=' + encodeURIComponent('Debes aceptar los términos y condiciones')
                }
            });
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            console.log('❌ Error: Email inválido');
            return new Response(null, {
                status: 302,
                headers: {
                    Location: '/register?error=' + encodeURIComponent('El formato del email no es válido')
                }
            });
        }

        console.log('✅ Validaciones pasadas, registrando usuario en backend...');

        // Hacer petición al backend JWT
        const backendResponse = await fetch('http://localhost:3001/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name,
                email,
                password,
                confirmPassword
            })
        });

        const responseData = await backendResponse.json();
        console.log('📦 Respuesta del backend:', responseData);

        if (!backendResponse.ok) {
            console.log('❌ Error de backend:', responseData.message || 'Error al crear usuario');
            return new Response(null, {
                status: 302,
                headers: {
                    Location: '/register?error=' + encodeURIComponent(responseData.message || 'Error al crear usuario')
                }
            });
        }

        // Validar estructura de respuesta
        if (!responseData.data || !responseData.data.user || !responseData.data.accessToken) {
            console.log('❌ Error: Respuesta del backend inválida:', responseData);
            return new Response(null, {
                status: 302,
                headers: {
                    Location: '/register?error=' + encodeURIComponent('Error en la respuesta del servidor')
                }
            });
        }

        const userData = responseData.data.user;
        const accessToken = responseData.data.accessToken;
        const refreshToken = responseData.data.refreshToken;

        console.log('👤 Usuario creado:', { 
            id: userData.id, 
            email: userData.email, 
            name: userData.name 
        });

        // Crear respuesta con script para guardar tokens en localStorage
        const registerScript = `
            <script>
                localStorage.setItem('access_token', '${accessToken}');
                localStorage.setItem('refresh_token', '${refreshToken}');
                window.location.href = '/portal';
            </script>
        `;

        return new Response(registerScript, {
            status: 200,
            headers: {
                'Content-Type': 'text/html'
            }
        });

    } catch (error: any) {
        console.error('💥 Error en registro:', error);
        return new Response(null, {
            status: 302,
            headers: {
                Location: '/register?error=' + encodeURIComponent('Error interno del servidor')
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