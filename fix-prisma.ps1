# Script para regenerar Prisma Client
# Ejecutar este script cuando cambies el schema.prisma

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  REGENERANDO PRISMA CLIENT..." -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan

# Paso 1: Sincronizar base de datos
Write-Host ""
Write-Host "1. Sincronizando base de datos..." -ForegroundColor Yellow
npx prisma db push

if ($LASTEXITCODE -eq 0) {
    Write-Host "   OK Base de datos sincronizada" -ForegroundColor Green
} else {
    Write-Host "   ERROR al sincronizar base de datos" -ForegroundColor Red
    exit 1
}

# Paso 2: Regenerar cliente (intentar varias veces si falla)
Write-Host ""
Write-Host "2. Regenerando Prisma Client..." -ForegroundColor Yellow
$attempts = 0
$maxAttempts = 3
$success = $false

while ($attempts -lt $maxAttempts -and -not $success) {
    $attempts++
    Write-Host "   Intento $attempts de $maxAttempts..." -ForegroundColor Gray
    
    npx prisma generate
    
    if ($LASTEXITCODE -eq 0) {
        $success = $true
        Write-Host "   OK Cliente generado exitosamente" -ForegroundColor Green
    } else {
        Write-Host "   Intento fallido" -ForegroundColor Yellow
        if ($attempts -lt $maxAttempts) {
            Write-Host "   Esperando 2 segundos..." -ForegroundColor Gray
            Start-Sleep -Seconds 2
        }
    }
}

if (-not $success) {
    Write-Host ""
    Write-Host "ERROR: No se pudo generar el cliente de Prisma" -ForegroundColor Red
    Write-Host "Asegurate de detener el servidor (npm run dev) primero" -ForegroundColor Yellow
    Write-Host "Y vuelve a ejecutar este script" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Host "================================================================" -ForegroundColor Green
Write-Host "  PRISMA ACTUALIZADO CORRECTAMENTE" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Ahora puedes iniciar el servidor con: npm run dev" -ForegroundColor Cyan
Write-Host ""
