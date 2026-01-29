# 🔄 Script de Migración - Módulo de Docentes
# Este script aplica las migraciones necesarias para el módulo de docentes

Write-Host "`n╔══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║       MIGRACIÓN DE BASE DE DATOS - MÓDULO DOCENTES      ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Verificar si el servidor está corriendo
$nodeProcesses = Get-Process node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "⚠️  ADVERTENCIA: Hay procesos de Node.js en ejecución" -ForegroundColor Yellow
    Write-Host "   Deteniendo servidor para aplicar la migración...`n" -ForegroundColor Yellow
    
    $response = Read-Host "¿Deseas detener el servidor y continuar? (S/N)"
    if ($response -ne "S" -and $response -ne "s") {
        Write-Host "`n❌ Migración cancelada" -ForegroundColor Red
        exit
    }
    
    Write-Host "`n🛑 Deteniendo procesos de Node.js..." -ForegroundColor Yellow
    Stop-Process -Name node -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

Write-Host "📋 Pasos a realizar:" -ForegroundColor White
Write-Host "   1. Generar cliente de Prisma" -ForegroundColor Gray
Write-Host "   2. Aplicar migración a la base de datos" -ForegroundColor Gray
Write-Host "   3. Poblar con datos de ejemplo (opcional)" -ForegroundColor Gray
Write-Host "   4. Reiniciar servidor`n" -ForegroundColor Gray

# Paso 1: Generar cliente de Prisma
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "PASO 1: Generando cliente de Prisma..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor DarkGray

npx prisma generate

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ Error al generar el cliente de Prisma" -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ Cliente de Prisma generado correctamente`n" -ForegroundColor Green

# Paso 2: Aplicar migración
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "PASO 2: Aplicando migración a la base de datos..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor DarkGray

Write-Host "📊 Cambios que se aplicarán:" -ForegroundColor Yellow
Write-Host "   • Tabla nueva: subjects (materias)" -ForegroundColor White
Write-Host "   • Tabla nueva: teacher_careers (docente-carrera)" -ForegroundColor White
Write-Host "   • Tabla nueva: teacher_subjects (docente-materia)" -ForegroundColor White
Write-Host "   • Campo nuevo: teachers.phone`n" -ForegroundColor White

npx prisma db push

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ Error al aplicar la migración" -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ Migración aplicada correctamente`n" -ForegroundColor Green

# Paso 3: Poblar base de datos (opcional)
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "PASO 3: Poblar base de datos con datos de ejemplo" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor DarkGray

$seedResponse = Read-Host "¿Deseas poblar la base de datos con datos de ejemplo? (S/N)"

if ($seedResponse -eq "S" -or $seedResponse -eq "s") {
    Write-Host "`n🌱 Ejecutando seed..." -ForegroundColor Yellow
    
    npm run prisma:seed
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "`n⚠️  Error al ejecutar el seed" -ForegroundColor Yellow
        Write-Host "   Puedes ejecutarlo manualmente con: npm run prisma:seed`n" -ForegroundColor Gray
    } else {
        Write-Host "`n✅ Base de datos poblada con datos de ejemplo`n" -ForegroundColor Green
    }
} else {
    Write-Host "`n⏭️  Seed omitido`n" -ForegroundColor Gray
}

# Paso 4: Verificar migración
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "VERIFICACIÓN" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor DarkGray

Write-Host "📁 Archivo de base de datos:" -ForegroundColor White
Write-Host "   prisma\dev.db`n" -ForegroundColor Gray

if (Test-Path "prisma\dev.db") {
    $dbSize = (Get-Item "prisma\dev.db").Length / 1KB
    Write-Host "✅ Base de datos existe ($($dbSize.ToString('F2')) KB)`n" -ForegroundColor Green
} else {
    Write-Host "⚠️  No se encontró el archivo de base de datos`n" -ForegroundColor Yellow
}

# Paso 5: Instrucciones finales
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "¡MIGRACIÓN COMPLETADA!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor DarkGray

Write-Host "🎯 Próximos pasos:`n" -ForegroundColor Cyan

Write-Host "1. Iniciar el servidor:" -ForegroundColor White
Write-Host "   npm run dev`n" -ForegroundColor Yellow

Write-Host "2. Acceder al módulo de docentes:" -ForegroundColor White
Write-Host "   http://localhost:3000/dashboard/docentes`n" -ForegroundColor Yellow

Write-Host "3. Ver la base de datos (opcional):" -ForegroundColor White
Write-Host "   npx prisma studio`n" -ForegroundColor Yellow

$startServer = Read-Host "¿Deseas iniciar el servidor ahora? (S/N)"

if ($startServer -eq "S" -or $startServer -eq "s") {
    Write-Host "`n🚀 Iniciando servidor...`n" -ForegroundColor Green
    npm run dev
} else {
    Write-Host "`n✅ Listo! Ejecuta 'npm run dev' cuando estés listo`n" -ForegroundColor Green
}


