# 🔄 GUÍA DE MIGRACIÓN - Sistema de Actividades

## 📋 **CAMBIOS EN BASE DE DATOS**

### **Campos Agregados a `user_activity_log`:**
```sql
-- Nuevos campos agregados
ALTER TABLE aim_schema.user_activity_log 
ADD COLUMN severity VARCHAR(20) DEFAULT 'low',
ADD COLUMN affected_resource_id VARCHAR(50),
ADD COLUMN affected_resource_type VARCHAR(50);
```

### **Verificar Schema Actual:**
```sql
-- Verificar estructura de tabla
\d aim_schema.user_activity_log;

-- Verificar datos existentes
SELECT COUNT(*) FROM aim_schema.user_activity_log;
SELECT action, module, severity FROM aim_schema.user_activity_log LIMIT 5;
```

---

## 🚀 **PASOS DE MIGRACIÓN**

### **1. Backup de Base de Datos**
```bash
# Crear backup antes de migrar
pg_dump -h localhost -U your_user -d aim_db > backup_before_activity_migration.sql
```

### **2. Aplicar Cambios de Schema**
```bash
# Desde directorio aim-backend
npx prisma db push

# O manualmente:
npx prisma migrate dev --name "add-activity-fields"
```

### **3. Regenerar Cliente Prisma**
```bash
npx prisma generate
```

### **4. Verificar Migración**
```sql
-- Verificar que los campos existen
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'user_activity_log' 
AND table_schema = 'aim_schema';
```

---

## 🔧 **COMANDOS COMPLETOS**

### **Migración Automática (Recomendado):**
```powershell
# Desde aim-backend/
npx prisma db push
npx prisma generate
npm run dev  # Verificar que arranca sin errores
```

### **Migración Manual (Si hay problemas):**
```sql
-- Conectar a PostgreSQL
psql -h localhost -U your_user -d aim_db

-- Agregar campos faltantes
ALTER TABLE aim_schema.user_activity_log 
ADD COLUMN IF NOT EXISTS severity VARCHAR(20) DEFAULT 'low';

ALTER TABLE aim_schema.user_activity_log 
ADD COLUMN IF NOT EXISTS affected_resource_id VARCHAR(50);

ALTER TABLE aim_schema.user_activity_log 
ADD COLUMN IF NOT EXISTS affected_resource_type VARCHAR(50);

-- Verificar cambios
\d aim_schema.user_activity_log;
```

---

## 📊 **DATOS DE PRUEBA (OPCIONAL)**

### **Insertar Actividades de Ejemplo:**
```sql
-- Insertar algunas actividades de prueba
INSERT INTO aim_schema.user_activity_log 
(user_id, action, module, severity, details, ip_address, user_agent, created_at)
VALUES 
('0432b9eb3d8f', 'login', 'auth', 'low', '{"source": "migration_test"}', '127.0.0.1', 'Migration Script', NOW()),
('0432b9eb3d8f', 'user_create', 'users', 'medium', '{"target": "test_user"}', '127.0.0.1', 'Migration Script', NOW()),
('0432b9eb3d8f', 'security_alert', 'security', 'high', '{"alert": "test_alert"}', '127.0.0.1', 'Migration Script', NOW());
```

### **Verificar Datos:**
```sql
-- Ver actividades recientes
SELECT 
    id, user_id, action, module, severity, 
    created_at::date as fecha,
    details
FROM aim_schema.user_activity_log 
ORDER BY created_at DESC 
LIMIT 10;
```

---

## ✅ **VERIFICACIÓN POST-MIGRACIÓN**

### **1. Verificar Estructura:**
```sql
-- Debe retornar los nuevos campos
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'user_activity_log' 
AND column_name IN ('severity', 'affected_resource_id', 'affected_resource_type');
```

### **2. Probar API:**
```powershell
# Ejecutar test de endpoints
.\test-activity-endpoints.ps1
```

### **3. Verificar Logs del Servidor:**
```bash
# El servidor debe arrancar sin errores
npm run dev

# Buscar en logs:
# ✅ "Conexión a base de datos establecida"
# ✅ "Servidor iniciado en puerto 3001"
```

---

## 🚨 **SOLUCIÓN DE PROBLEMAS**

### **Error: "table does not exist"**
```bash
# Recrear base de datos desde cero
npx prisma db push --force-reset
npx prisma generate
```

### **Error: "column does not exist"**
```sql
-- Verificar que el schema es correcto
\c aim_db;
\dn;  -- Listar schemas
\dt aim_schema.*;  -- Listar tablas
```

### **Error: Prisma Client out of sync**
```bash
# Regenerar cliente Prisma
rm -rf node_modules/.prisma
npx prisma generate
npm run dev
```

### **Error: Permission denied**
```bash
# En Windows, cerrar todos los procesos de Node
taskkill /f /im node.exe
npm run dev
```

---

## 📝 **ROLLBACK (Si es necesario)**

### **Revertir Cambios de Schema:**
```sql
-- Eliminar campos agregados (⚠️ CUIDADO: Perderás datos)
ALTER TABLE aim_schema.user_activity_log 
DROP COLUMN IF EXISTS severity,
DROP COLUMN IF EXISTS affected_resource_id,
DROP COLUMN IF EXISTS affected_resource_type;
```

### **Restaurar desde Backup:**
```bash
# Restaurar base de datos completa
psql -h localhost -U your_user -d aim_db < backup_before_activity_migration.sql
```

---

## 🎯 **ESTADO FINAL ESPERADO**

### **Tabla `user_activity_log` debe tener:**
- ✅ `id` (int, primary key)
- ✅ `user_id` (varchar)
- ✅ `action` (varchar)
- ✅ `module` (varchar, nullable)
- ✅ `details` (jsonb, nullable)
- ✅ `ip_address` (inet, nullable)
- ✅ `user_agent` (text, nullable)
- ✅ `severity` (varchar, default 'low') **← NUEVO**
- ✅ `affected_resource_id` (varchar, nullable) **← NUEVO**
- ✅ `affected_resource_type` (varchar, nullable) **← NUEVO**
- ✅ `created_at` (timestamptz)

### **API debe responder:**
- ✅ `GET /api/activity/types` → 44 tipos de actividad
- ✅ `GET /api/activity/my-activities` → Actividades del usuario
- ✅ `POST /api/activity/log` → Crear nueva actividad (admin)

---

**🎉 MIGRACIÓN COMPLETADA EXITOSAMENTE! 🎉** 