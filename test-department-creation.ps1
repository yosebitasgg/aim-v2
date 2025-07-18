# Script para probar la creación de departamentos
$baseUrl = "http://localhost:3001"
$email = "gerencia@electricamireles.mx"
$password = "YOse10@@"

Write-Host "=== PRUEBA CREACION DEPARTAMENTO ===" -ForegroundColor Green

# 1. Login para obtener token
Write-Host "1. Haciendo login..." -ForegroundColor Yellow
try {
    $loginData = @{
        email = $email
        password = $password
    } | ConvertTo-Json

    $loginResponse = Invoke-WebRequest -Uri "$baseUrl/api/auth/login" -Method POST -Body $loginData -ContentType "application/json" -UseBasicParsing
    $loginResult = $loginResponse.Content | ConvertFrom-Json
    
    if ($loginResult.success) {
        $token = $loginResult.data.accessToken
        Write-Host "✅ Login exitoso" -ForegroundColor Green
        Write-Host "Usuario: $($loginResult.data.user.name)" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Error en login: $($loginResult.message)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Error conectando al servidor: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Asegúrate de que el backend esté corriendo en puerto 3001" -ForegroundColor Yellow
    exit 1
}

# 2. Verificar permisos
Write-Host "`n2. Verificando permisos..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

try {
    $permissionsResponse = Invoke-WebRequest -Uri "$baseUrl/api/permissions/my-permissions" -Headers $headers -UseBasicParsing
    $permissionsResult = $permissionsResponse.Content | ConvertFrom-Json
    
    if ($permissionsResult.success) {
        Write-Host "✅ Permisos obtenidos" -ForegroundColor Green
        $perms = $permissionsResult.data
        if ($perms.users) {
            Write-Host "Permisos usuarios: Create=$($perms.users.create)" -ForegroundColor Cyan
        }
    }
} catch {
    Write-Host "⚠️ Error verificando permisos: $($_.Exception.Message)" -ForegroundColor Yellow
}

# 3. Intentar crear departamento con datos detallados
Write-Host "`n3. Creando departamento..." -ForegroundColor Yellow

$departmentData = @{
    name = "Test Departamento $(Get-Date -Format 'HHmmss')"
    code = "test-$(Get-Date -Format 'HHmmss')"
    description = "Departamento de prueba creado automáticamente"
    color = "#059669"
    isActive = $true
} | ConvertTo-Json

Write-Host "Datos a enviar:" -ForegroundColor Gray
Write-Host $departmentData -ForegroundColor Gray

try {
    $deptResponse = Invoke-WebRequest -Uri "$baseUrl/api/permissions/departments" -Method POST -Body $departmentData -Headers $headers -UseBasicParsing
    $deptResult = $deptResponse.Content | ConvertFrom-Json
    
    if ($deptResult.success) {
        Write-Host "✅ Departamento creado exitosamente!" -ForegroundColor Green
        Write-Host "ID: $($deptResult.data.id)" -ForegroundColor Cyan
        Write-Host "Nombre: $($deptResult.data.name)" -ForegroundColor Cyan
        Write-Host "Código: $($deptResult.data.code)" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Error en la respuesta del servidor" -ForegroundColor Red
        Write-Host "Mensaje: $($deptResult.message)" -ForegroundColor Red
        if ($deptResult.errors) {
            Write-Host "Errores específicos:" -ForegroundColor Red
            foreach ($error in $deptResult.errors) {
                Write-Host "  - $error" -ForegroundColor Red
            }
        }
    }
    
} catch {
    Write-Host "❌ Error HTTP: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    Write-Host "Descripción: $($_.Exception.Message)" -ForegroundColor Red
    
    # Intentar obtener detalles del error del servidor
    try {
        $errorStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorStream)
        $errorText = $reader.ReadToEnd()
        $reader.Close()
        
        Write-Host "`nRespuesta del servidor:" -ForegroundColor Yellow
        Write-Host $errorText -ForegroundColor Red
        
        # Intentar parsear como JSON
        try {
            $errorJson = $errorText | ConvertFrom-Json
            if ($errorJson.message) {
                Write-Host "`nMensaje de error: $($errorJson.message)" -ForegroundColor Red
            }
            if ($errorJson.errors) {
                Write-Host "Errores específicos:" -ForegroundColor Red
                foreach ($error in $errorJson.errors) {
                    Write-Host "  - $error" -ForegroundColor Red
                }
            }
        } catch {
            Write-Host "No se pudo parsear el error como JSON" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "No se pudo obtener detalles del error" -ForegroundColor Yellow
    }
}

# 4. Verificar logs del servidor
Write-Host "`n4. Revisando si hay logs del servidor..." -ForegroundColor Yellow
Write-Host "Revisa la consola del servidor backend para ver los logs detallados" -ForegroundColor Cyan
Write-Host "Busca mensajes que contengan:" -ForegroundColor Cyan
Write-Host "  - 'Iniciando creación de departamento'" -ForegroundColor Gray
Write-Host "  - 'Error creando departamento'" -ForegroundColor Gray
Write-Host "  - Cualquier error de validación o base de datos" -ForegroundColor Gray

Write-Host "`n=== PRUEBA COMPLETADA ===" -ForegroundColor Green 