#!/usr/bin/env pwsh

# Script para probar los documentos mejorados de AIM
Write-Host "🚀 Iniciando prueba de documentos mejorados de AIM" -ForegroundColor Cyan
Write-Host ""

# Verificar si el backend está ejecutándose
Write-Host "Verificando backend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ Backend está ejecutándose correctamente" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend no está ejecutándose. Iniciando..." -ForegroundColor Red
    
    # Cambiar al directorio del backend
    Set-Location -Path "aim-backend"
    
    # Iniciar el backend en segundo plano
    Start-Process powershell -ArgumentList "-Command", "npm run dev" -WindowStyle Minimized
    
    Write-Host "⏳ Esperando que el backend se inicie..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
    
    # Verificar nuevamente
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -TimeoutSec 5 -ErrorAction Stop
        Write-Host "✅ Backend iniciado correctamente" -ForegroundColor Green
    } catch {
        Write-Host "❌ No se pudo iniciar el backend. Verifica manualmente." -ForegroundColor Red
        exit 1
    }
    
    # Regresar al directorio raíz
    Set-Location -Path ".."
}

Write-Host ""
Write-Host "📋 Instrucciones de prueba:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Abre tu navegador y ve a:" -ForegroundColor White
Write-Host "   http://localhost:3321/portal/documentos" -ForegroundColor Blue
Write-Host ""
Write-Host "2. Haz login como usuario master" -ForegroundColor White
Write-Host ""
Write-Host "3. Verifica las mejoras implementadas:" -ForegroundColor White
Write-Host "   ✅ Diseño profesional con logo AIM" -ForegroundColor Green
Write-Host "   ✅ Datos de empresa incluidos" -ForegroundColor Green
Write-Host "   ✅ 4 tipos de documentos expandidos:" -ForegroundColor Green
Write-Host "      • Reportes de Testing (Fase 5)" -ForegroundColor Gray
Write-Host "      • Manual de Usuario (Fase 7)" -ForegroundColor Gray
Write-Host "      • Manual Técnico (Fase 7)" -ForegroundColor Gray
Write-Host "      • Guía de Troubleshooting (Fase 7)" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Prueba crear un documento:" -ForegroundColor White
Write-Host "   • Haz clic en 'Crear Documento'" -ForegroundColor Gray
Write-Host "   • Selecciona una orden" -ForegroundColor Gray
Write-Host "   • Elige uno de los tipos mejorados" -ForegroundColor Gray
Write-Host "   • Llena los campos (muchos más que antes)" -ForegroundColor Gray
Write-Host "   • Ve la vista previa profesional" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Finaliza y descarga:" -ForegroundColor White
Write-Host "   • Haz clic en 'Finalizar Documento'" -ForegroundColor Gray
Write-Host "   • Verifica que los contadores se actualicen" -ForegroundColor Gray
Write-Host "   • Descarga PDF/imagen funcionales" -ForegroundColor Gray
Write-Host ""
Write-Host "🎯 Esperamos que veas:" -ForegroundColor Cyan
Write-Host "   ✅ Contadores actualizados (no más 0s)" -ForegroundColor Green
Write-Host "   ✅ Progreso correcto en la tabla" -ForegroundColor Green
Write-Host "   ✅ PDFs con contenido real" -ForegroundColor Green
Write-Host "   ✅ Imágenes SVG profesionales" -ForegroundColor Green
Write-Host "   ✅ Diseño formal y elegante" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Datos de empresa incluidos:" -ForegroundColor Cyan
Write-Host "   • Automatización Industrial Mireles" -ForegroundColor Gray
Write-Host "   • RFC: AIM2312054A9" -ForegroundColor Gray
Write-Host "   • Monterrey, N.L." -ForegroundColor Gray
Write-Host "   • +52 (81) 8123-4567" -ForegroundColor Gray
Write-Host ""

# Abrir el navegador automáticamente
Write-Host "🌐 Abriendo navegador..." -ForegroundColor Yellow
Start-Process "http://localhost:3321/portal/documentos"

Write-Host ""
Write-Host "✨ ¡Disfruta probando los documentos mejorados!" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Tip: Abre la consola del navegador (F12) para ver logs detallados" -ForegroundColor Yellow
Write-Host ""
Write-Host "❓ Si encuentras problemas:" -ForegroundColor Magenta
Write-Host "   1. Verifica que el backend esté en puerto 3000" -ForegroundColor Gray
Write-Host "   2. Verifica que el frontend esté en puerto 3321" -ForegroundColor Gray
Write-Host "   3. Revisa la consola del navegador" -ForegroundColor Gray
Write-Host "   4. Recarga la página si es necesario" -ForegroundColor Gray
Write-Host ""
Write-Host "Presiona Enter para finalizar..."
$null = Read-Host 