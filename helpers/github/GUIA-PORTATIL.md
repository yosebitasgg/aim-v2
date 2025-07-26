# 🎒 GUÍA COMPLETA: EJECUTAR AIM EN TU PORTÁTIL

## 📋 **PASO 1: INSTALACIONES PREVIAS (Solo una vez)**

### **🐳 Instalar Docker Desktop**
1. Ve a https://www.docker.com/products/docker-desktop/
2. Descarga según tu sistema operativo:
   - **Windows**: Docker Desktop for Windows
   - **macOS**: Docker Desktop for Mac  
   - **Linux**: Docker Desktop for Linux
3. Ejecuta el instalador y sigue las instrucciones
4. **¡IMPORTANTE!** Reinicia tu portátil después de instalar
5. Abre Docker Desktop y acepta los términos de servicio

### **📝 Instalar Git**
1. Ve a https://git-scm.com/downloads
2. Descarga para tu sistema operativo
3. Instala con configuración por defecto
4. Abre terminal/PowerShell y configura:
```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu-email@ejemplo.com"
```

### **✅ Verificar Instalaciones**
Abre terminal/PowerShell y ejecuta:
```bash
docker --version
# Debe mostrar: Docker version X.X.X

docker-compose --version  
# Debe mostrar: docker-compose version X.X.X

git --version
# Debe mostrar: git version X.X.X
```

---

## 🚀 **PASO 2: DESCARGAR Y CONFIGURAR EL PROYECTO**

### **2.1 Clonar el Repositorio**
```bash
# Navega al directorio donde quieres el proyecto (ejemplo: Escritorio)
cd Desktop
# O en Windows: cd C:\Users\TuUsuario\Desktop

# Clona el repositorio
git clone https://github.com/yosebitasgg/aim-v2.git

# Entra al directorio del proyecto
cd aim-v2
```

### **2.2 Configurar Variables de Entorno (.env)**

#### **¿Qué es el archivo .env?**
El archivo `.env` contiene configuraciones secretas como contraseñas de base de datos, claves API, etc.

#### **Pasos EXACTOS:**

**Windows (PowerShell):**
```powershell
# Copiar archivo de ejemplo
copy env.example .env
```

**macOS/Linux (Terminal):**
```bash
# Copiar archivo de ejemplo  
cp env.example .env
```

#### **¿QUÉ CAMBIAR EN .env?**

**🎯 RESPUESTA CORTA: ¡NADA! Para desarrollo local está perfecto como está.**

**🔍 Explicación detallada:**

Abre el archivo `.env` con cualquier editor de texto (Notepad, VS Code, etc.) y verás algo así:

```env
# === CONFIGURACIÓN DE BASE DE DATOS ===
DATABASE_URL="postgresql://aimuser:aimpassword123@db:5432/aimdb"
POSTGRES_USER=aimuser
POSTGRES_PASSWORD=aimpassword123
POSTGRES_DB=aimdb

# === CONFIGURACIÓN DEL SERVIDOR ===
PORT=3001
NODE_ENV=development

# === CONFIGURACIÓN DE SEGURIDAD ===
JWT_SECRET=aim_super_secret_jwt_key_2024_desarrollo
BCRYPT_ROUNDS=10

# === CONFIGURACIÓN DE CORS ===
CORS_ORIGIN=http://localhost:4321
ALLOWED_ORIGINS=http://localhost:4321,http://localhost:3001

# === CONFIGURACIÓN DE RATE LIMITING ===
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# === CONFIGURACIÓN DE LOGS ===
LOG_LEVEL=info
LOG_FILE=logs/app.log

# === CONFIGURACIÓN FRONTEND ===
PUBLIC_API_URL=http://localhost:3001
ASTRO_TELEMETRY_DISABLED=1
```

#### **🚨 IMPORTANTE: No cambies nada a menos que:**

- **Puertos ocupados**: Si tienes algo ejecutándose en puerto 3001 o 4321, cambia:
  ```env
  PORT=3002  # Cambiar backend a otro puerto
  PUBLIC_API_URL=http://localhost:3002
  CORS_ORIGIN=http://localhost:4322  # Si frontend también cambia
  ```

- **Conflicto con PostgreSQL**: Si tienes PostgreSQL instalado localmente en puerto 5432, Docker puede tener conflictos. En ese caso:
  ```env
  # En docker-compose.yml cambiar puertos de PostgreSQL
  ```

#### **🎯 Para 99% de casos: ¡Deja todo como está!**

---

## 🏃‍♂️ **PASO 3: EJECUTAR LA APLICACIÓN**

### **3.1 Iniciar Docker Desktop**
- **Windows**: Busca "Docker Desktop" en el menú inicio y ábrelo
- **macOS**: Busca Docker en Spotlight y ábrelo  
- **Linux**: Ejecuta `sudo systemctl start docker`

Espera a que aparezca el ícono de Docker en la barra de tareas (ballena azul).

### **3.2 Ejecutar AIM (¡Un solo comando!)**
```bash
# Asegúrate de estar en el directorio aim-v2
cd aim-v2

# Ejecutar todo (descarga, construye e inicia)
docker-compose up -d
```

**¿Qué hace este comando?**
- Descarga PostgreSQL automáticamente
- Construye tu aplicación frontend y backend
- Crea la base de datos
- Inicia todos los servicios
- `-d` = ejecuta en segundo plano

**Tiempo esperado:** 3-5 minutos la primera vez (descarga imágenes).

### **3.3 Verificar que Funciona**
```bash
# Ver estado de contenedores
docker-compose ps

# Debes ver algo como:
# NAME           STATUS          PORTS
# aim-frontend   Up X seconds    0.0.0.0:4321->4321/tcp
# aim-backend    Up X seconds    0.0.0.0:3001->3001/tcp  
# aim-database   Up X seconds    0.0.0.0:5432->5432/tcp
```

### **3.4 ¡Acceder a tu aplicación!**
Abre tu navegador y ve a:
- **🌐 Aplicación principal**: http://localhost:4321
- **🔧 API (opcional)**: http://localhost:3001

---

## 📱 **COMANDOS DIARIOS**

### **Iniciar AIM:**
```bash
cd aim-v2
docker-compose up -d
```

### **Parar AIM:**
```bash
docker-compose down
```

### **Ver si está funcionando:**
```bash
docker-compose ps
```

### **Ver logs (si algo falla):**
```bash
# Todos los servicios
docker-compose logs -f

# Solo frontend
docker-compose logs frontend

# Solo backend
docker-compose logs backend
```

### **Reiniciar servicio específico:**
```bash
docker-compose restart frontend
docker-compose restart backend
```

---

## 🛠️ **SOLUCIÓN DE PROBLEMAS**

### **❌ "docker-compose no reconocido"**
```bash
# Usar docker compose (sin guión)
docker compose up -d
docker compose down
docker compose ps
```

### **❌ "Puerto ocupado"**
```bash
# Windows - ver qué usa el puerto
netstat -an | findstr :4321
netstat -an | findstr :3001

# macOS/Linux - ver qué usa el puerto  
lsof -i :4321
lsof -i :3001

# Solución: Cambiar puertos en .env
PORT=3002
PUBLIC_API_URL=http://localhost:3002
```

### **❌ "Error de permisos (Linux/macOS)"**
```bash
# Agregar usuario a grupo docker
sudo usermod -aG docker $USER
# Cerrar sesión y volver a iniciarla
```

### **❌ "Contenedores no inician"**
```bash
# Limpiar y reconstruir
docker-compose down
docker system prune -f
docker-compose build --no-cache
docker-compose up -d
```

### **❌ "Base de datos corrupta"**
```bash
# Eliminar volumen de base de datos (PIERDE DATOS)
docker-compose down
docker volume rm aim-postgres-data
docker-compose up -d
```

---

## 🔄 **ACTUALIZAR CÓDIGO**

Si hay cambios en el repositorio:
```bash
cd aim-v2
git pull origin master
docker-compose down
docker-compose build
docker-compose up -d
```

---

## 💾 **BACKUP DE DATOS**

### **Exportar base de datos:**
```bash
docker-compose exec db pg_dump -U aimuser aimdb > backup_$(date +%Y%m%d).sql
```

### **Importar base de datos:**
```bash
docker-compose exec -T db psql -U aimuser aimdb < backup_20241201.sql
```

---

## ✅ **CHECKLIST RÁPIDO**

### **Configuración inicial (una vez):**
- [ ] Docker Desktop instalado y funcionando
- [ ] Git instalado y configurado
- [ ] Repositorio clonado: `git clone https://github.com/yosebitasgg/aim-v2.git`
- [ ] Archivo `.env` creado: `cp env.example .env`

### **Uso diario:**
- [ ] Docker Desktop ejecutándose
- [ ] `cd aim-v2`
- [ ] `docker-compose up -d`
- [ ] Acceder a http://localhost:4321

### **Al terminar:**
- [ ] `docker-compose down`

---

## 🎯 **RESUMEN ULTRA-RÁPIDO**

```bash
# 1. Instalar Docker Desktop + Git (una vez)
# 2. Descargar proyecto
git clone https://github.com/yosebitasgg/aim-v2.git
cd aim-v2

# 3. Configurar (una vez)
cp env.example .env
# NO cambies nada en .env para desarrollo local

# 4. Ejecutar (cada vez que quieras usar AIM)
docker-compose up -d

# 5. Usar
# Ir a: http://localhost:4321

# 6. Parar (al terminar)
docker-compose down
```

**¡Eso es todo!** 🚀 Tu aplicación AIM funcionará igual en cualquier portátil con Docker. 