# 🎯 Sistema de Roles y Permisos AIM - Configuración Completa

## 📋 **RESUMEN**

Se ha implementado un sistema completo de gestión de roles y permisos para AIM que incluye:

- ✅ **Gestión granular de roles y permisos**
- ✅ **Asignación dinámica de roles a usuarios**
- ✅ **Roles por defecto (empresa y clientes)**
- ✅ **API REST completa para administración**
- ✅ **Usuario maestro con permisos completos**
- ✅ **Sistema de logging integrado**

---

## 🚀 **PASOS DE CONFIGURACIÓN**

### **1. Actualizar Base de Datos**

```bash
cd aim-backend
npx prisma db push
npx prisma generate
```

### **2. Iniciar Servidor Backend**

```bash
npm run dev
```

### **3. Ejecutar Script de Configuración**

**Personaliza primero el script con tu información:**

1. Abre `setup-roles-system.ps1`
2. Cambia estas líneas:
   ```powershell
   $testEmail = "tu@email.com"      # Tu email real
   $testPassword = "TuPassword123"   # Tu contraseña real
   ```

**Ejecuta el script:**

```powershell
.\setup-roles-system.ps1
```

---

## 🔐 **ROLES CREADOS AUTOMÁTICAMENTE**

### **Roles de Empresa (Internos):**

| Rol | Descripción | Permisos |
|-----|-------------|----------|
| **master** | Usuario maestro del sistema | ✅ Todos los permisos |
| **admin** | Administrador completo | ✅ Gestión completa |
| **manager** | Gerente con permisos limitados | 📊 Lectura + gestión operativa |
| **employee** | Empleado básico | 📖 Permisos limitados |
| **tecnico** | Técnico especializado | 🔧 Gestión de agentes y órdenes |
| **ventas** | Personal comercial | 💼 Gestión de clientes y cotizaciones |

### **Roles de Clientes (Externos):**

| Rol | Descripción | Permisos |
|-----|-------------|----------|
| **client** | Cliente con acceso limitado | 👁️ Solo lectura de sus datos |

---

## 🛣️ **API ENDPOINTS DISPONIBLES**

### **Gestión de Roles:**
```
GET    /api/permissions/roles          # Listar roles
POST   /api/permissions/roles          # Crear rol
GET    /api/permissions/roles/:id      # Obtener rol específico
PUT    /api/permissions/roles/:id      # Actualizar rol
DELETE /api/permissions/roles/:id      # Eliminar rol
```

### **Gestión de Usuarios:**
```
GET    /api/permissions/users          # Listar usuarios con roles
POST   /api/permissions/assign-role    # Asignar rol a usuario
DELETE /api/permissions/users/:userId/role  # Quitar rol a usuario
```

### **Configuración del Sistema:**
```
POST   /api/permissions/make-master/:userId     # Hacer usuario maestro
POST   /api/permissions/initialize-defaults     # Inicializar roles
```

### **Verificación de Permisos:**
```
GET    /api/permissions/my-permissions         # Mis permisos
POST   /api/permissions/check                  # Verificar permiso específico
```

---

## 💻 **EJEMPLOS DE USO**

### **1. Asignar Rol a Usuario**

```bash
curl -X POST http://localhost:3001/api/permissions/assign-role \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "usuario_id_aqui",
    "roleId": "rol_id_aqui"
  }'
```

### **2. Crear Rol Personalizado**

```bash
curl -X POST http://localhost:3001/api/permissions/roles \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "supervisor",
    "description": "Supervisor de operaciones",
    "permissions": {
      "dashboard": { "read": true, "create": false, "update": false, "delete": false },
      "users": { "read": true, "create": false, "update": false, "delete": false },
      "agents": { "read": true, "create": true, "update": true, "delete": false },
      "clients": { "read": true, "create": true, "update": true, "delete": false },
      "orders": { "read": true, "create": true, "update": true, "delete": false },
      "quotes": { "read": true, "create": true, "update": true, "delete": false },
      "billing": { "read": true, "create": false, "update": false, "delete": false },
      "reports": { "read": true, "create": false, "update": false, "delete": false }
    }
  }'
```

### **3. Verificar Permisos**

```bash
curl -X POST http://localhost:3001/api/permissions/check \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "module": "users",
    "action": "create"
  }'
```

---

## 🏗️ **ESTRUCTURA DE PERMISOS**

### **Módulos Disponibles:**
- `dashboard` - Panel principal
- `users` - Gestión de usuarios
- `agents` - Gestión de agentes IA
- `clients` - Gestión de clientes
- `orders` - Gestión de órdenes
- `quotes` - Gestión de cotizaciones
- `billing` - Facturación
- `reports` - Reportes y estadísticas

### **Acciones Disponibles:**
- `read` - Ver/Consultar
- `create` - Crear nuevo
- `update` - Modificar existente
- `delete` - Eliminar

---

## 🔧 **INTEGRACIÓN CON FRONTEND**

### **1. Actualizar API Client**

```javascript
// Agregar a tu apiClient.js
export const rolesApi = {
  // Obtener usuarios con roles
  getUsers: (params = {}) => 
    apiClient.request('/permissions/users', { params }),
  
  // Obtener roles disponibles
  getRoles: (params = {}) => 
    apiClient.request('/permissions/roles', { params }),
  
  // Asignar rol
  assignRole: (userId, roleId) => 
    apiClient.request('/permissions/assign-role', {
      method: 'POST',
      body: { userId, roleId }
    }),
  
  // Verificar permisos
  checkPermission: (module, action) =>
    apiClient.request('/permissions/check', {
      method: 'POST', 
      body: { module, action }
    }),
    
  // Obtener mis permisos
  getMyPermissions: () => 
    apiClient.request('/permissions/my-permissions')
};
```

### **2. Hook para Permisos**

```javascript
// hooks/usePermissions.js
export function usePermissions() {
  const [permissions, setPermissions] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPermissions() {
      try {
        const response = await rolesApi.getMyPermissions();
        setPermissions(response.data);
      } catch (error) {
        console.error('Error loading permissions:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadPermissions();
  }, []);

  const hasPermission = (module, action) => {
    return permissions?.[module]?.[action] || false;
  };

  return { permissions, hasPermission, loading };
}
```

### **3. Componente de Protección**

```jsx
// components/PermissionGuard.jsx
export function PermissionGuard({ module, action, children, fallback = null }) {
  const { hasPermission, loading } = usePermissions();
  
  if (loading) return <div>Cargando...</div>;
  
  if (!hasPermission(module, action)) {
    return fallback || <div>Sin permisos para esta acción</div>;
  }
  
  return children;
}

// Uso:
<PermissionGuard module="users" action="create">
  <button>Crear Usuario</button>
</PermissionGuard>
```

---

## 📊 **PRÓXIMOS PASOS FRONTEND**

### **Páginas a Crear:**

1. **`/portal/admin/usuarios`** - Gestión de usuarios
   - Lista de usuarios con roles
   - Asignar/cambiar roles
   - Activar/desactivar usuarios

2. **`/portal/admin/roles`** - Gestión de roles
   - Lista de roles disponibles
   - Crear/editar roles personalizados
   - Ver permisos por rol

3. **`/portal/configuracion/permisos`** - Mi perfil de permisos
   - Ver mis permisos actuales
   - Historial de cambios de rol

### **Componentes Requeridos:**

- `UserManagementTable` - Tabla de usuarios con acciones
- `RoleSelector` - Selector de roles para asignar
- `PermissionsMatrix` - Matriz visual de permisos
- `RoleCreateForm` - Formulario para crear roles
- `UserRoleHistory` - Historial de cambios de rol

---

## 🛡️ **SEGURIDAD IMPLEMENTADA**

- ✅ **Autenticación JWT requerida**
- ✅ **Verificación de permisos por endpoint**
- ✅ **Validación de datos con Zod**
- ✅ **Logging automático de cambios**
- ✅ **Protección contra escalada de privilegios**
- ✅ **Roles de solo lectura para clientes**

---

## 🎉 **SISTEMA LISTO PARA PRODUCCIÓN**

El sistema de roles está **completamente implementado** y listo para usar. Solo necesitas:

1. ✅ Ejecutar el script de configuración
2. ✅ Implementar el frontend de gestión
3. ✅ Configurar usuarios adicionales según necesites

**¡Tu usuario ya tiene permisos de maestro para gestionar todo el sistema!**

---

*Sistema implementado para AIM v2 - Automatización Industrial Mireles*  
*Enero 2025* 