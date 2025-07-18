# Debugging del Sistema de Documentos

## Problema Reportado
El modal de "Ver documentos" de una orden muestra que hay documentos pero no los muestra correctamente. El problema parece estar relacionado con cómo se está guardando y rastreando la información de los documentos.

## Cambios Realizados

### 1. Corrección del API Client (`documentsApiClient.js`)
- ✅ **Problema identificado**: La función `getDocumentsByOrder` intentaba acceder a `result.data` cuando `result` ya era el `data` extraído por `handleResponse`
- ✅ **Corrección**: Restructuración del manejo de respuestas en `getDocumentsByOrder`
- ✅ **Mejora**: Agregado logging detallado para debugging

### 2. Mejoras en el Frontend (`documentos.astro`)
- ✅ **Logging mejorado**: Agregado debugging extensivo en todas las funciones críticas
- ✅ **Manejo de errores**: Mejor manejo de errores con fallbacks
- ✅ **Actualización de datos**: Forzar actualización de la tabla después de crear documentos

### 3. Funciones de Debugging Agregadas

#### Para usar en la consola del navegador:

```javascript
// 1. Diagnóstico completo del sistema
await debugDocumentSystem();

// 2. Debugging específico de IDs y relaciones orden-documento
await debugOrderDocumentIds();

// 3. Prueba completa: crear documento y luego consultarlo
await testCreateAndQuery();

// 4. Probar conectividad con el backend
await testBackendConnection();

// 5. Crear un documento de prueba
await testCreateDocument();

// 6. Refrescar datos manualmente
await refreshData();
```

## Pasos para Debugging

### 1. Verificar Backend
Asegúrate de que el backend esté corriendo:
```bash
cd aim-backend
npm run dev
```
El backend debe estar en `http://localhost:3001`

### 2. Verificar Frontend
Asegúrate de que el frontend esté corriendo:
```bash
cd aim-website  
npm run dev
```
El frontend debe estar en `http://localhost:4321`

### 3. Debugging en el Navegador

1. **Abre la consola del navegador** (F12)
2. **Ve a la página de documentos**: `/portal/documentos`
3. **Ejecuta el diagnóstico completo**:
   ```javascript
   await debugDocumentSystem();
   ```

### 4. Verificar Flujo de Creación

1. **Intentar crear un documento** usando la interfaz normal
2. **Verificar logs en la consola** - debe mostrar:
   - 🚀 Iniciando creación de documento...
   - 📝 Datos del documento a crear: {...}
   - ✅ Documento creado, respuesta del servidor: {...}
   - 🔄 Refrescando datos...

3. **Si hay errores**, ejecutar:
   ```javascript
   await testCreateDocument();
   ```

4. **Para debugging completo del flujo**, ejecutar:
   ```javascript
   await testCreateAndQuery();
   ```

### 4.1. Verificar Logs del Backend

Con el logging agregado, también verás logs detallados en la **consola del backend**:

**Al crear un documento:**
```
🔍 DEBUG createDocument - orderId recibido: order_xxxxx
🔍 DEBUG createDocument - documentTypeId recibido: doctype_xxxxx
✅ DEBUG createDocument - Orden encontrada: {...}
✅ DEBUG createDocument - Tipo de documento encontrado: {...}
📄 DEBUG createDocument - Número generado: DOC-ORD-001-XXX-001
✅ DEBUG createDocument - Documento creado exitosamente: {...}
```

**Al consultar documentos por orden:**
```
🔍 DEBUG getDocuments - Consultando documentos para orderId: order_xxxxx
🔍 DEBUG getDocuments - Filtro WHERE aplicado: {...}
📊 DEBUG getDocuments - Resultados para orderId: order_xxxxx
📊 DEBUG getDocuments - Total encontrados: 1
📄 DEBUG Documento 1: {...}
```

### 5. Verificar Visualización de Documentos

1. **Hacer clic en "Ver" de cualquier orden**
2. **Verificar logs**:
   - 🔍 Mostrando documentos para orden: {orderId}
   - 🌐 Consultando documentos desde el backend...
   - 📊 Documentos obtenidos del backend: {count}

## Posibles Problemas y Soluciones

### Problema 1: Backend no responde
**Síntomas**: Error de conexión, 404, timeout
**Solución**: 
1. Verificar que el backend esté corriendo en puerto 3001
2. Verificar que no hay errores en el backend
3. Verificar conectividad: `await testBackendConnection()`

### Problema 2: Autenticación fallida
**Síntomas**: Error 401, "Token expirado"
**Solución**:
1. Re-hacer login en `/login`
2. Verificar token: `window.documentsApi.getAuthToken()`

### Problema 3: Documentos no se crean
**Síntomas**: Error al crear, no aparecen en la lista
**Solución**:
1. Verificar datos de entrada: `await testCreateDocument()`
2. Verificar logs del backend
3. Verificar permisos de usuario

### Problema 4: Documentos no se muestran en el modal
**Síntomas**: Modal muestra "No hay documentos" pero debería haber
**Solución**:
1. Ejecutar debugging específico: `await debugOrderDocumentIds()`
2. Verificar logs del backend (buscar mensajes `DEBUG getDocuments`)
3. Comparar IDs exactos: `await testCreateAndQuery()`
4. Verificar que `orderId` coincida exactamente

### Problema 5: IDs no coinciden entre creación y consulta
**Síntomas**: Se crea documento pero no aparece al consultarlo
**Solución**:
1. Ejecutar: `await debugOrderDocumentIds()` - mostrará todos los IDs
2. Verificar logs del backend durante creación y consulta
3. Comprobar que el `orderId` usado para crear sea exactamente el mismo que para consultar
4. Verificar que no haya caracteres extra, espacios, o diferencias de tipo

## Estructura de Datos Esperada

### Respuesta de `createDocument`:
```json
{
  "success": true,
  "data": {
    "id": "doc_xxxxx",
    "documentNumber": "DOC-ORD-001-XXX-001",
    "title": "Título del documento",
    "orderId": "order_xxxxx",
    "documentTypeId": "doctype_xxxxx",
    "status": "DRAFT",
    // ... más campos
  }
}
```

### Respuesta de `getDocumentsByOrder`:
```json
{
  "success": true,
  "data": {
    "documents": [
      {
        "id": "doc_xxxxx",
        "title": "Documento 1",
        // ... más campos
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 50,
      "pages": 1
    }
  }
}
```

## Logs de Debugging

Con los cambios realizados, deberías ver logs como estos en la consola:

```
🚀 Inicializando página de documentos...
🔌 Probando conectividad con el backend...
✅ Backend conectado correctamente
📄 Cargando documentos desde el backend...
✅ Documentos cargados: 0
📋 Órdenes cargadas: 3
✅ Página de documentos inicializada correctamente
```

Al crear un documento:
```
🚀 Iniciando creación de documento...
📝 Creando documento: {...}
✅ Documento creado exitosamente: {...}
🔄 Refrescando datos...
📊 Lista de documentos actualizada, total: 1
```

Al ver documentos de una orden:
```
🔍 Mostrando documentos para orden: order_xxxxx
🌐 Consultando documentos desde el backend...
📄 Respuesta del backend: {...}
📊 Documentos obtenidos del backend: 1
```

## Instrucciones Paso a Paso para Resolver el Problema Actual

### Paso 1: Ejecutar Debugging Inicial
Abre la consola del navegador en `/portal/documentos` y ejecuta:
```javascript
await debugOrderDocumentIds();
```
Esto te mostrará todos los IDs de órdenes y documentos, y probará las consultas directas.

### Paso 2: Probar el Flujo Completo
Ejecuta la prueba completa que crea un documento y luego lo consulta:
```javascript
await testCreateAndQuery();
```
Esta función te dirá exactamente si el problema está en la creación, en la consulta, o en la coincidencia de IDs.

### Paso 3: Revisar Logs del Backend
En la consola del backend (donde está corriendo `npm run dev`), busca los mensajes que empiezan con:
- `🔍 DEBUG createDocument` - para ver qué se está guardando
- `🔍 DEBUG getDocuments` - para ver qué se está consultando

### Paso 4: Interpretar Resultados
- **Si `testCreateAndQuery()` funciona correctamente**: El problema está en el frontend (interfaz de usuario)
- **Si los IDs no coinciden**: Hay un problema en cómo se están generando o pasando los IDs
- **Si los logs del backend muestran datos diferentes**: Hay un problema en la comunicación frontend-backend

### Paso 5: Reportar Hallazgos
Comparte los logs de las funciones de debugging para continuar con la solución específica.

---

## ⚠️ ACTUALIZACIÓN - PROBLEMA IDENTIFICADO Y SOLUCIONADO

### PROBLEMA ORIGINAL: orderId y documentTypeId Faltaban en DocumentResponse ✅ SOLUCIONADO

El problema principal era que los campos `orderId` y `documentTypeId` no se estaban incluyendo en la respuesta de los documentos. 

**Cambios realizados:**
1. ✅ **Agregado `orderId` al interface `DocumentResponse`** en `documents.types.ts`
2. ✅ **Agregado `orderId: document.orderId`** en la función `mapDocumentToResponse` en `documents.service.ts`
3. ✅ **Agregado `documentTypeId` al interface `DocumentResponse`** en `documents.types.ts`
4. ✅ **Agregado `documentTypeId: document.documentTypeId`** en la función `mapDocumentToResponse` en `documents.service.ts`

### PROBLEMA SECUNDARIO: Agrupación por Fase no Funciona ✅ SOLUCIONADO

Los documentos SÍ se crean y consultan correctamente, pero la interfaz no los muestra correctamente organizados por fase porque faltaba el campo `documentTypeId`.

### ⚡ VERIFICACIÓN FINAL

**Ejecuta esta prueba para verificar que todo funciona:**

```javascript
await testCreateAndQuery();
```

**Ahora deberías ver logs como:**
- ✅ MATCH encontrado: Documento "..." coincide con tipo "..." 
- 📊 Documentos encontrados en Fase X: 1 (o más)
- 📈 Progreso de Fase X: {completed: 1, total: 2, percentage: 50}

**En lugar de:**
- ❌ NO MATCH: Documento "..." (undefined) no coincide con ningún tipo

**Si aún ves logs de "NO MATCH", entonces hay un problema diferente.**

### Debugging Paso a Paso (ACTUALIZADO):

#### Paso 1: Verificar Creación y Consulta (Debería funcionar ahora)
```javascript
await testCreateAndQuery();
```

#### Paso 2: Probar Modal de Ver Documentos
1. Crear un documento usando la interfaz
2. Hacer clic en "Ver Documentos" de la orden
3. Verificar los logs en la consola que muestran:
   - `🔍 === DEBUG MODAL VER DOCUMENTOS ===`
   - Los documentos encontrados vs tipos por fase
   - Los matches entre documentos y tipos

#### Paso 3: Probar Modal de Crear Documentos
1. Hacer clic en "Crear Documento"
2. Verificar los logs en la consola que muestran:
   - `🔍 === DEBUG MODAL CREAR DOCUMENTOS ===`
   - Los documentos completados vs tipos por fase
   - El progreso calculado

#### Paso 4: Verificar Progreso en Tabla Principal
1. Verificar los logs que muestran:
   - `🔍 === DEBUG TABLA ÓRDENES ===`
   - El progreso calculado por fase
   - Los documentos completados vs creados

### Qué Buscar en los Logs:

1. **✅ MATCH encontrado**: Los documentos SÍ deben coincidir con tipos de documentos
2. **❌ NO MATCH**: Si aparece esto, el problema está en los `documentTypeId`
3. **📊 Documentos encontrados**: Debe ser > 0 para las fases que tienen documentos
4. **📈 Progreso**: Debe ser > 0% si hay documentos completados

### Si el problema persiste:
Ejecuta este comando para ver todos los IDs en detalle:
```javascript
await debugOrderDocumentIds();
```

Y luego envía los logs completos de los pasos 2, 3 y 4 para análisis adicional. 