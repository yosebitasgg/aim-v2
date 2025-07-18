# AIM Backend

Backend API para el sistema de Automatización Industrial Mireles.

## Configuración Inicial

### 1. Variables de Entorno

Crea un archivo `.env` en la carpeta `aim-backend` con el siguiente contenido:

```env
# Base de datos
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/aim_db"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="24h"
JWT_REFRESH_EXPIRES_IN="7d"

# Servidor
PORT=3001
NODE_ENV=development

# Bcrypt
BCRYPT_ROUNDS=12

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN="http://localhost:4321"

# Logging
LOG_LEVEL=info
```

### 2. Migración de Base de Datos

Ejecuta la migración para actualizar la base de datos:

```bash
npm run db:migrate
```

### 3. Instalación y Ejecución

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Construir para producción
npm run build

# Ejecutar en producción
npm start
```

## Estructura del Proyecto

```
aim-backend/
├── src/
│   ├── modules/
│   │   ├── users/          # Gestión de usuarios
│   │   ├── auth/           # Autenticación
│   │   └── roles/          # Roles y permisos
│   ├── shared/
│   │   ├── middleware/     # Middleware compartido
│   │   ├── utils/          # Utilidades
│   │   ├── types/          # Tipos TypeScript
│   │   └── constants/      # Constantes
│   ├── config/             # Configuración
│   └── database/           # Configuración de BD
├── prisma/
│   └── schema.prisma       # Esquema de base de datos
└── dist/                   # Archivos compilados
```

## API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/refresh` - Renovar token
- `POST /api/auth/logout` - Cerrar sesión

### Usuarios
- `GET /api/users` - Listar usuarios
- `GET /api/users/:id` - Obtener usuario
- `POST /api/users` - Crear usuario
- `PUT /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Eliminar usuario 