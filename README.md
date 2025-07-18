# 🏭 AIM - Asociación de Ingeniería Mireles

[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Astro](https://img.shields.io/badge/Astro-5.11-FF5A03?style=flat-square&logo=astro&logoColor=white)](https://astro.build/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

> **Sistema completo de automatización industrial** - Plataforma full-stack para la gestión de agentes de automatización, clientes, órdenes y documentos técnicos.

## 🚀 Inicio Rápido

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/aim-v2.git
cd aim-v2

# 2. Configurar variables de entorno
cp env.example .env

# 3. Ejecutar con Docker (recomendado)
docker-compose up

# 4. Acceder a la aplicación
# Frontend: http://localhost:4321
# Backend API: http://localhost:3001
```

## 📋 Descripción

AIM es una plataforma integral para empresas de automatización industrial que permite:

- **🤖 Gestión de Agentes**: Biblioteca de agentes de automatización con configuración personalizable
- **👥 Gestión de Clientes**: Sistema completo de CRM para clientes industriales
- **📄 Sistema de Órdenes**: Workflow completo desde cotización hasta entrega
- **📋 Generación de Documentos**: Documentos técnicos automáticos (diagramas, especificaciones, manuales)
- **🔐 Control de Acceso**: Sistema de roles y permisos granular
- **📊 Portal de Administración**: Dashboard completo para gestión y análisis

## 🏗️ Arquitectura del Sistema

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│   Frontend      │    │    Backend      │    │   Database      │
│   (Astro.js)    │◄──►│  (Node.js +     │◄──►│  (PostgreSQL)   │
│   + React       │    │   TypeScript)   │    │                 │
│   Port: 4321    │    │   Port: 3001    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Stack Tecnológico

**Frontend:**
- **Astro.js 5.11** - Framework web moderno con SSR
- **React 19** - Componentes interactivos
- **Tailwind CSS** - Diseño responsivo y moderno
- **TypeScript** - Tipado estático

**Backend:**
- **Node.js + Express** - Servidor API REST
- **TypeScript** - Desarrollo type-safe
- **Prisma ORM** - Gestión de base de datos
- **JWT** - Autenticación segura
- **bcrypt** - Encriptación de contraseñas

**Base de Datos:**
- **PostgreSQL 15** - Base de datos principal
- **Esquema avanzado** - Soporte para multi-tenant

**DevOps:**
- **Docker & Docker Compose** - Containerización completa
- **Multi-stage builds** - Optimización de imágenes
- **Hot-reloading** - Desarrollo eficiente
- **GitHub Actions** - CI/CD automatizado

## 📦 Instalación

### Opción 1: Docker (Recomendado)

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/aim-v2.git
cd aim-v2

# Configurar variables de entorno
cp env.example .env

# Ejecutar en desarrollo
docker-compose up

# O ejecutar en segundo plano
docker-compose up -d
```

### Opción 2: Instalación Local

**Requisitos:**
- Node.js 18+
- PostgreSQL 15+
- npm o yarn

```bash
# Backend
cd aim-backend
npm install
npm run db:generate
npm run dev

# Frontend (en otra terminal)
cd aim-website
npm install
npm run dev
```

## 🔧 Configuración

### Variables de Entorno

Copia `env.example` a `.env` y configura:

```bash
# Base de datos
POSTGRES_USER=aim_user
POSTGRES_PASSWORD=tu_password_seguro
POSTGRES_DB=aim_database

# Seguridad
JWT_SECRET=tu_secret_jwt_muy_seguro

# Puertos
BACKEND_PORT=3001
FRONTEND_PORT=4321
```

Ver [`env.example`](./env.example) para todas las opciones disponibles.

## 📖 Documentación

- **[🐳 Guía de Docker](./README-Docker.md)** - Containerización completa
- **[🔧 Backend API](./aim-backend/README.md)** - Documentación de la API
- **[🎨 Frontend](./aim-website/README.md)** - Guía del frontend
- **[📋 Base de Datos](./md-info/)** - Esquemas y migraciones

## 🛠️ Desarrollo

### Comandos Principales

```bash
# Desarrollo con Docker
docker-compose up                    # Iniciar servicios
docker-compose logs -f backend       # Ver logs del backend
docker-compose logs -f frontend      # Ver logs del frontend
docker-compose down                  # Detener servicios

# Desarrollo local
cd aim-backend && npm run dev        # Servidor backend
cd aim-website && npm run dev        # Servidor frontend

# Base de datos
cd aim-backend && npm run db:studio  # Prisma Studio
cd aim-backend && npm run db:migrate # Ejecutar migraciones
```

### Hot-Reloading

✅ **Funciona automáticamente con Docker:**
- Cambios en backend (`aim-backend/src/`) se reflejan inmediatamente
- Cambios en frontend (`aim-website/src/`) se reflejan inmediatamente
- Base de datos persiste entre reinicios

## 🧪 Testing

```bash
# Backend tests
cd aim-backend
npm test

# E2E tests
npm run test:e2e

# Linting
npm run lint
```

## 🚀 Deployment

### Desarrollo
```bash
docker-compose up
```

### Producción
```bash
# Usar configuración de producción
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Con HTTPS
docker-compose -f docker-compose.yml -f docker-compose.prod.yml -f docker-compose.ssl.yml up -d
```

## 📁 Estructura del Proyecto

```
AIM v2/
├── aim-backend/                 # Servidor Node.js + TypeScript
│   ├── src/
│   │   ├── modules/            # Módulos de la aplicación
│   │   ├── shared/             # Utilidades compartidas
│   │   └── database/           # Cliente de base de datos
│   ├── prisma/                 # Esquema de base de datos
│   └── Dockerfile
├── aim-website/                # Frontend Astro.js + React
│   ├── src/
│   │   ├── components/         # Componentes React/Astro
│   │   ├── pages/              # Páginas de la aplicación
│   │   └── layouts/            # Layouts base
│   └── Dockerfile
├── docker-compose.yml          # Configuración Docker principal
├── docker-compose.prod.yml     # Configuración de producción
└── env.example                 # Plantilla de variables de entorno
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🏢 Sobre AIM

**Asociación de Ingeniería Mireles** es una empresa especializada en automatización industrial, integrando soluciones tecnológicas avanzadas para optimizar procesos industriales.

### Contacto

- **Website**: [tu-website.com](https://tu-website.com)
- **Email**: contacto@aim.com
- **LinkedIn**: [AIM Ingeniería](https://linkedin.com/company/aim)

---

**⭐ Si este proyecto te resulta útil, ¡dale una estrella en GitHub!** 