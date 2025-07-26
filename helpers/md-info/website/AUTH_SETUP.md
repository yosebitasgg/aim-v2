# 🔐 Configuración de Autenticación para AIM

## 📋 Resumen de la Implementación

Hemos creado un sistema de autenticación personalizado que reemplaza la dependencia deprecada de `lucia-auth` con una implementación moderna usando:

- **PostgreSQL 17** con esquema dedicado
- **bcrypt** para hashing seguro de contraseñas
- **Sesiones basadas en cookies** HttpOnly
- **Pool de conexiones** optimizado

## 🗄️ Configuración de Base de Datos

### 1. Ejecutar el Script SQL

Ejecuta el archivo `database-setup.sql` en tu cliente PostgreSQL:

```sql
-- En pgAdmin o psql, ejecuta:
\i database-setup.sql
```

O copia y pega el contenido del archivo directamente.

### 2. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto `aim-website/`:

```env
DATABASE_URL="postgresql://postgres:TU_CONTRASEÑA@localhost:5432/aim_db"
NODE_ENV="development"
```

**⚠️ Importante**: Reemplaza `TU_CONTRASEÑA` con tu contraseña real de PostgreSQL.

## 🧪 Probar la Conexión

```bash
cd aim-website
node test-db.js
```

Deberías ver: `✅ ¡Conexión exitosa a aim_db!`

## 📁 Archivos Creados

### Estructura de Autenticación

```
aim-website/
├── src/lib/
│   ├── db.js          # Pool de conexiones PostgreSQL
│   ├── auth.js        # Funciones de autenticación
│   └── session.js     # Manejo de sesiones y cookies
├── database-setup.sql # Script de configuración de DB
├── test-db.js        # Script de prueba de conexión
└── .env              # Variables de entorno (crear)
```

## 🔧 Funciones Disponibles

### `auth.js`
- `createUser({ email, password, name })` - Registrar usuario
- `verifyUser(email, password)` - Verificar credenciales
- `createSession(userId)` - Crear sesión
- `validateSession(sessionId)` - Validar sesión
- `invalidateSession(sessionId)` - Cerrar sesión
- `getUserById(userId)` - Obtener usuario por ID

### `session.js`
- `getCurrentUser(request)` - Obtener usuario actual
- `requireAuth(request)` - Middleware de protección
- `createSessionCookie(sessionId)` - Crear cookie
- `deleteSessionCookie()` - Eliminar cookie

### `db.js`
- `pool` - Pool de conexiones PostgreSQL
- `testConnection()` - Probar conexión

## 🗃️ Esquema de Base de Datos

### Tablas Creadas

- **`aim_schema.user`** - Información de usuarios
- **`aim_schema.key`** - Credenciales hashadas
- **`aim_schema.session`** - Sesiones activas

### Índices de Optimización

- Índice en email de usuarios
- Índices en foreign keys
- Índice en expiración de sesiones

## 🔄 Próximos Pasos

1. **Configurar la base de datos** ejecutando `database-setup.sql`
2. **Crear archivo `.env`** con las credenciales
3. **Probar conexión** con `node test-db.js`
4. **Implementar páginas** de login y registro
5. **Crear middleware** de autenticación en Astro

## 🔒 Seguridad Implementada

- ✅ **Passwords hasheados** con bcrypt (12 rounds)
- ✅ **Cookies HttpOnly** para prevenir XSS
- ✅ **Sesiones con expiración** (7 días)
- ✅ **Transacciones SQL** para integridad
- ✅ **Validación de entrada** en todas las funciones
- ✅ **Pool de conexiones** para prevenir leaks

## 🐛 Solución de Problemas

### Error de Conexión
```bash
❌ Error conectando a PostgreSQL: database "aim_db" does not exist
```
**Solución**: Ejecutar primero `CREATE DATABASE aim_db;`

### Error de Permisos
```bash
❌ Error: permission denied for schema aim_schema
```
**Solución**: Asegúrate de tener permisos de superusuario o conectarte como postgres.

### Error de Variables de Entorno
```bash
❌ Error: missing "DATABASE_URL"
```
**Solución**: Crear archivo `.env` con la URL de conexión correcta. 