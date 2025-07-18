// src/lib/db.js
import pg from "pg";
import 'dotenv/config';

// Creamos un pool de conexiones a PostgreSQL que puede ser reutilizado.
// Esto es mucho más eficiente que crear una nueva conexión cada vez.
export const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
});

// Función helper para probar la conexión
export async function testConnection() {
    try {
        const client = await pool.connect();
        console.log('✅ Conexión a PostgreSQL exitosa');
        client.release();
        return true;
    } catch (error) {
        console.error('❌ Error conectando a PostgreSQL:', error.message);
        return false;
    }
} 