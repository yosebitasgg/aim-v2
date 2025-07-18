# 🐳 Guía de Containerización - AIM (Asociación de Ingeniería Mireles)

## 📋 Descripción

Esta guía explica cómo usar la configuración completa de Docker para el proyecto AIM. El proyecto está completamente containerizado y es 100% portátil - funciona en cualquier máquina con Docker instalado.

## 🏗️ Arquitectura del Proyecto

```
AIM Project
├── Frontend (Astro.js + React)     - Puerto 4321
├── Backend (Node.js + TypeScript)  - Puerto 3001
└── Database (PostgreSQL)           - Puerto 5432
```

## 🚀 Inicio Rápido

### Requisitos Previos
- [Docker](https://www.docker.com/get-started) instalado
- [Docker Compose](https://docs.docker.com/compose/install/) instalado

### 1. Preparar la Configuración

```bash
# 1. Clonar el proyecto (si no lo tienes)
git clone <tu-repositorio-url>
cd "AIM v2 - copia"

# 2. Crear archivo de configuración
cp env.example .env

# 3. (Opcional) Editar configuración
nano .env  # o usar tu editor preferido
```

### 2. Ejecutar la Aplicación

```bash
# Ejecutar en modo desarrollo (con hot-reloading)
docker-compose up

# O ejecutar en segundo plano
docker-compose up -d
```

### 3. Acceder a la Aplicación

- **Frontend**: http://localhost:4321
- **Backend API**: http://localhost:3001
- **Base de Datos**: localhost:5432

## 🔧 Comandos Principales

### Desarrollo
```bash
# Iniciar servicios en desarrollo
docker-compose up

# Iniciar en segundo plano
docker-compose up -d

# Ver logs en tiempo real
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db

# Detener servicios
docker-compose down

# Detener y eliminar volúmenes
docker-compose down -v
```

### Producción
```bash
# Ejecutar en modo producción
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Construir imágenes de producción
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build

# Ver estado de servicios
docker-compose ps
```

### Mantenimiento
```bash
# Reconstruir imágenes (cuando cambies Dockerfile)
docker-compose build

# Reconstruir sin cache
docker-compose build --no-cache

# Limpiar contenedores, redes e imágenes no usadas
docker system prune

# Ver uso de espacio
docker system df
```

## 🔄 Hot-Reloading en Desarrollo

### ✅ Lo que funciona automáticamente:
- **Backend**: Cambios en archivos `.ts` se reflejan inmediatamente
- **Frontend**: Cambios en archivos `.astro`, `.jsx`, `.tsx` se reflejan inmediatamente
- **Base de Datos**: Los datos persisten entre reinicios

### 📝 Archivos monitoreados:
- Backend: `./aim-backend/src/**/*`
- Frontend: `./aim-website/src/**/*`

## 🗄️ Base de Datos

### Persistencia
Los datos de PostgreSQL se guardan en un volumen Docker llamado `aim-postgres-data`. Los datos persisten entre reinicios del contenedor.

### Conexión Externa
Puedes conectarte a la base de datos desde herramientas externas usando:
- **Host**: localhost
- **Puerto**: 5432
- **Usuario**: `aim_user` (configurable en .env)
- **Contraseña**: `aim_secure_password_2024` (configurable en .env)
- **Base de Datos**: `aim_database` (configurable en .env)

### Backup y Restore
```bash
# Crear backup
docker exec aim-database pg_dump -U aim_user aim_database > backup.sql

# Restaurar backup
docker exec -i aim-database psql -U aim_user aim_database < backup.sql
```

## 🌍 Variables de Entorno

### Archivo de Configuración
Todas las configuraciones están centralizadas en el archivo `.env`. Ver `env.example` para todas las opciones disponibles.

### Variables Principales
```bash
# Entorno
NODE_ENV=development

# Base de Datos
POSTGRES_USER=aim_user
POSTGRES_PASSWORD=aim_secure_password_2024
POSTGRES_DB=aim_database

# Seguridad
JWT_SECRET=tu_super_secreto_jwt_muy_seguro_cambialo_en_produccion

# Puertos
BACKEND_PORT=3001
FRONTEND_PORT=4321
```

## 🔍 Troubleshooting

### Problemas Comunes

#### 1. Puerto ya en uso
```bash
# Error: Port already in use
# Solución: Cambiar puertos en .env o detener servicios que usen esos puertos
lsof -i :4321  # Ver qué usa el puerto
kill -9 <PID>  # Terminar proceso
```

#### 2. Base de datos no conecta
```bash
# Ver logs de la base de datos
docker-compose logs db

# Verificar health check
docker-compose ps

# Reiniciar solo la base de datos
docker-compose restart db
```

#### 3. Cambios no se reflejan
```bash
# Verificar que los volúmenes estén montados
docker-compose ps

# Reconstruir contenedores
docker-compose build
docker-compose up
```

#### 4. Permisos en archivos (Linux/macOS)
```bash
# Verificar permisos
ls -la

# Cambiar propiedad
sudo chown -R $USER:$USER .

# Dar permisos de ejecución
chmod +x aim-backend/scripts/*
```

### Comandos de Diagnóstico
```bash
# Ver estado de todos los servicios
docker-compose ps

# Ver logs de todos los servicios
docker-compose logs

# Inspeccionar un contenedor
docker inspect aim-backend

# Entrar a un contenedor
docker exec -it aim-backend sh
docker exec -it aim-database psql -U aim_user aim_database

# Ver recursos utilizados
docker stats
```

## 🏭 Configuración de Producción

### Diferencias Principales
- **Sin bind mounts**: El código se copia dentro de las imágenes
- **NGINX**: El frontend se sirve con NGINX en lugar del dev server
- **Recursos limitados**: Configuración de CPU y memoria
- **Health checks**: Monitoreo más estricto

### Configuración de SSL/HTTPS
Para habilitar HTTPS en producción:

1. Obtener certificados SSL
2. Modificar `docker-compose.prod.yml`:
```yaml
frontend:
  ports:
    - "443:443"
  volumes:
    - ./ssl:/etc/nginx/ssl:ro
```

### Variables de Producción
```bash
# env para producción
NODE_ENV=production
POSTGRES_PASSWORD=TuPasswordSuperSegura123!
JWT_SECRET=TuSecretoJWTSuperSeguroDeAlMenos32Caracteres!
CORS_ORIGIN=https://tu-dominio.com
LOG_LEVEL=warn
```

## 📁 Estructura de Archivos Docker

```
├── docker-compose.yml           # Configuración principal
├── docker-compose.override.yml  # Configuración de desarrollo (automática)
├── docker-compose.prod.yml      # Configuración de producción
├── env.example                  # Plantilla de variables de entorno
├── aim-backend/
│   ├── Dockerfile              # Imagen del backend
│   └── .dockerignore           # Archivos ignorados en build
├── aim-website/
│   ├── Dockerfile              # Imagen del frontend
│   └── .dockerignore           # Archivos ignorados en build
└── README-Docker.md            # Esta guía
```

## 🆘 Soporte

Si encuentras problemas:

1. **Revisar logs**: `docker-compose logs`
2. **Verificar variables**: Revisar archivo `.env`
3. **Limpiar y reconstruir**: `docker-compose down -v && docker-compose build --no-cache`
4. **Revisar esta documentación**: Buscar en la sección de troubleshooting

---

**¡Listo! Tu aplicación AIM ahora es completamente portátil y funciona con un solo comando.** 🎉 