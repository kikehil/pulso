# Script de configuración para LMS Multi-Tenant con SQLite
# Ejecuta este script después de detener el servidor (Ctrl+C)

Write-Host "`n🚀 Configurando LMS Multi-Tenant con SQLite..." -ForegroundColor Cyan

# 1. Generar cliente de Prisma
Write-Host "`n📦 1. Generando cliente de Prisma..." -ForegroundColor Yellow
npx prisma generate

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Cliente generado exitosamente" -ForegroundColor Green
} else {
    Write-Host "❌ Error al generar cliente" -ForegroundColor Red
    exit 1
}

# 2. Crear base de datos SQLite
Write-Host "`n📊 2. Creando base de datos SQLite..." -ForegroundColor Yellow
npx prisma db push

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Base de datos creada exitosamente" -ForegroundColor Green
} else {
    Write-Host "❌ Error al crear base de datos" -ForegroundColor Red
    exit 1
}

# 3. Poblar con datos de prueba (opcional)
Write-Host "`n🌱 3. ¿Deseas poblar con datos de prueba? (S/N)" -ForegroundColor Yellow
$respuesta = Read-Host
if ($respuesta -eq "S" -or $respuesta -eq "s") {
    Write-Host "Poblando base de datos..." -ForegroundColor Cyan
    npm run prisma:seed
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Datos de prueba agregados" -ForegroundColor Green
    } else {
        Write-Host "⚠️  No se pudieron agregar datos de prueba (continuando...)" -ForegroundColor Yellow
    }
}

Write-Host "`n✨ ¡Configuración completada!" -ForegroundColor Green
Write-Host "`n📝 Ahora ejecuta: npm run dev" -ForegroundColor Cyan
Write-Host "🌐 Y abre: http://localhost:3000`n" -ForegroundColor Cyan


