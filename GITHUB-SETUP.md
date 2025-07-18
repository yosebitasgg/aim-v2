# 📋 Guía Completa: Subir Proyecto AIM a GitHub

Esta guía te llevará paso a paso para subir tu proyecto AIM a GitHub de manera profesional, incluyendo configuración de CI/CD, secretos y mejores prácticas.

## 🎯 Prerrequisitos

- ✅ Cuenta de GitHub creada
- ✅ Git instalado localmente
- ✅ Proyecto AIM completo con Docker configurado
- ✅ (Opcional) Cuenta de Docker Hub para publicar imágenes

## 📦 Paso 1: Preparar el Repositorio Local

### 1.1 Inicializar Git (si no está inicializado)
```bash
# Navegar a la raíz del proyecto
cd "AIM v2 - copia"

# Verificar si ya existe un repositorio Git
ls -la .git

# Si NO existe, inicializar
git init

# Configurar tu información (usar tu email y nombre de GitHub)
git config user.name "Tu Nombre"
git config user.email "tu-email@github.com"
```

### 1.2 Verificar archivos importantes
```bash
# Verificar que existen los archivos clave
ls -la | grep -E "(.gitignore|README.md|docker-compose.yml|env.example)"

# Debe mostrar:
# .gitignore
# README.md  
# docker-compose.yml
# env.example
```

### 1.3 Revisar y limpiar archivos sensibles
```bash
# Asegurarse de que no hay archivos .env reales
find . -name ".env" -not -name "*.example" -type f

# Si aparecen archivos .env, eliminarlos o moverlos
rm .env  # O mv .env .env.backup

# Verificar que no hay node_modules versionados
du -sh */node_modules 2>/dev/null || echo "✅ No hay node_modules versionados"
```

## 🌐 Paso 2: Crear Repositorio en GitHub

### 2.1 Crear repositorio desde GitHub.com
1. **Ir a GitHub.com** → Hacer clic en "+" → "New repository"
2. **Configurar el repositorio:**
   - **Repository name**: `aim-v2` (o el nombre que prefieras)
   - **Description**: `Sistema completo de automatización industrial - AIM`
   - **Visibility**: `Private` (recomendado inicialmente)
   - **❌ NO** marcar "Add a README file"
   - **❌ NO** marcar "Add .gitignore"
   - **❌ NO** marcar "Choose a license"
3. **Hacer clic en "Create repository"**

### 2.2 Copiar la URL del repositorio
```bash
# GitHub te dará una URL como:
# https://github.com/tu-usuario/aim-v2.git
# 
# O si prefieres SSH:
# git@github.com:tu-usuario/aim-v2.git
```

## 📤 Paso 3: Subir Código a GitHub

### 3.1 Agregar archivos al repositorio
```bash
# Desde la raíz del proyecto
cd "AIM v2 - copia"

# Agregar el remote de GitHub (reemplaza con tu URL)
git remote add origin https://github.com/tu-usuario/aim-v2.git

# Verificar el remote
git remote -v

# Agregar todos los archivos
git add .

# Verificar qué se va a subir (revisar que no haya archivos sensibles)
git status

# Hacer el primer commit
git commit -m "🚀 Initial commit: AIM v2 - Sistema completo de automatización industrial

- ✅ Backend Node.js + TypeScript + Prisma
- ✅ Frontend Astro.js + React + Tailwind
- ✅ Base de datos PostgreSQL
- ✅ Containerización completa con Docker
- ✅ Hot-reloading para desarrollo
- ✅ Configuración de producción optimizada
- ✅ CI/CD con GitHub Actions
- ✅ Documentación completa"

# Subir a GitHub
git push -u origin main
```

### 3.2 Verificar la subida
```bash
# Revisar el estado
git status

# Ver el log de commits
git log --oneline -5

# Verificar branches
git branch -a
```

## ⚙️ Paso 4: Configurar Secretos de GitHub

### 4.1 Acceder a la configuración de secretos
1. **Ir a tu repositorio en GitHub.com**
2. **Settings** → **Secrets and variables** → **Actions**
3. **Click en "New repository secret"**

### 4.2 Agregar secretos necesarios
Crear estos secretos uno por uno:

#### Secretos para Docker Hub (opcional)
```bash
# DOCKER_USERNAME
# Valor: tu-usuario-docker-hub

# DOCKER_PASSWORD  
# Valor: tu-token-docker-hub (no tu contraseña)
```

#### Secretos para deployment (futuro)
```bash
# POSTGRES_PASSWORD_PROD
# Valor: password-super-seguro-para-produccion-123!

# JWT_SECRET_PROD
# Valor: jwt-secret-super-seguro-de-al-menos-32-caracteres!
```

### 4.3 Crear token de Docker Hub (si planeas publicar imágenes)
1. **Ir a Docker Hub** → **Account Settings** → **Security**
2. **"New Access Token"** → Name: `github-actions-aim`
3. **Copiar el token** y usarlo como `DOCKER_PASSWORD` en GitHub

## 🚦 Paso 5: Configurar Protección de Ramas

### 5.1 Configurar reglas para main
1. **GitHub repo** → **Settings** → **Branches**
2. **"Add rule"** para `main`:
   - ✅ Require pull request reviews before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Restrict pushes that create files larger than 100MB

### 5.2 Crear rama de desarrollo
```bash
# Crear y cambiar a rama develop
git checkout -b develop

# Subir rama develop
git push -u origin develop

# Volver a main
git checkout main
```

## 🔧 Paso 6: Configurar GitHub Actions

### 6.1 Verificar que funciona el CI/CD
```bash
# Hacer un pequeño cambio para probar
echo "# Test CI/CD" >> test-ci.md
git add test-ci.md
git commit -m "test: Verificar funcionamiento de CI/CD"
git push

# Ir a GitHub → Actions para ver el progreso
```

### 6.2 Revisar workflows
1. **Ir a tu repo** → **Actions**
2. **Verificar que ejecute el workflow "CI/CD Pipeline"**
3. **Revisar logs en caso de errores**

## 📋 Paso 7: Personalizar README y Documentación

### 7.1 Actualizar URLs en README.md
```bash
# Editar README.md y cambiar:
# https://github.com/tu-usuario/aim-v2.git
# Por tu URL real

# Editar la sección de contacto con información real
```

### 7.2 Crear un Release inicial
1. **GitHub repo** → **Releases** → **"Create a new release"**
2. **Tag**: `v1.0.0`
3. **Release title**: `🚀 AIM v1.0.0 - Versión Inicial`
4. **Description**: 
```markdown
## 🎉 Primera versión estable de AIM

### ✨ Características principales:
- 🤖 Sistema completo de gestión de agentes de automatización
- 👥 CRM integrado para clientes industriales  
- 📄 Workflow completo de órdenes y documentos
- 🐳 Containerización completa con Docker
- 🔄 Hot-reloading para desarrollo eficiente
- 🚀 CI/CD automatizado con GitHub Actions

### 🚀 Inicio rápido:
\`\`\`bash
git clone https://github.com/tu-usuario/aim-v2.git
cd aim-v2
cp env.example .env
docker-compose up
\`\`\`

### 📋 URLs:
- Frontend: http://localhost:4321
- Backend: http://localhost:3001
- Documentación: [README-Docker.md](./README-Docker.md)
```

## 🎯 Paso 8: Verificación Final

### 8.1 Checklist de verificación
```bash
# ✅ 1. Repositorio creado y código subido
git remote -v

# ✅ 2. CI/CD funcionando
# Revisar en GitHub Actions

# ✅ 3. README.md atractivo
# Revisar en GitHub que se vea bien

# ✅ 4. .gitignore correcto
git status  # Debe estar limpio

# ✅ 5. Archivos sensibles protegidos
# No debe haber .env ni node_modules

# ✅ 6. Docker compose funciona
docker-compose up -d
curl http://localhost:4321
curl http://localhost:3001/health
docker-compose down
```

### 8.2 Test final del flujo completo
```bash
# 1. Clonar en directorio temporal para simular nuevo desarrollador
cd /tmp
git clone https://github.com/tu-usuario/aim-v2.git test-clone
cd test-clone

# 2. Configurar y ejecutar
cp env.example .env
docker-compose up -d

# 3. Verificar que funciona
sleep 30
curl http://localhost:4321 && echo "✅ Frontend OK"
curl http://localhost:3001/health && echo "✅ Backend OK"

# 4. Limpiar
docker-compose down
cd /tmp && rm -rf test-clone
```

## 🎊 ¡Felicitaciones!

Tu proyecto AIM ahora está:
- ✅ **Completamente versionado** en GitHub
- ✅ **Con CI/CD automático** que verifica cada cambio
- ✅ **100% portátil** - cualquiera puede clonarlo y ejecutarlo
- ✅ **Profesionalmente documentado**
- ✅ **Listo para producción**

## 📚 Siguientes Pasos Recomendados

1. **Invitar colaboradores** si trabajas en equipo
2. **Configurar GitHub Pages** para documentación (opcional)
3. **Agregar tests unitarios** y aumentar cobertura
4. **Configurar deployment automático** a un servidor de producción
5. **Configurar monitoring** y alertas
6. **Implementar backup automático** de la base de datos

## 🆘 Troubleshooting

### Problema: "Permission denied (publickey)"
```bash
# Generar clave SSH si no tienes
ssh-keygen -t ed25519 -C "tu-email@github.com"

# Agregar a ssh-agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# Copiar clave pública
cat ~/.ssh/id_ed25519.pub

# Agregar en GitHub: Settings → SSH and GPG keys → New SSH key
```

### Problema: "Large files detected"
```bash
# Usar Git LFS para archivos grandes
git lfs track "*.png"
git lfs track "*.jpg"
git add .gitattributes
git commit -m "Configure Git LFS"
```

### Problema: CI/CD falla
1. **Revisar logs** en GitHub Actions
2. **Verificar secretos** están configurados correctamente
3. **Comprobar** que Docker builds localmente:
```bash
docker build -t test-backend ./aim-backend
docker build -t test-frontend ./aim-website
```

---

**🎉 ¡Tu proyecto AIM ahora es un repositorio GitHub profesional y listo para el mundo!** 