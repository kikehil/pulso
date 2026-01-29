#!/bin/bash

# 🚀 Script de Despliegue Automatizado - Pulso Control
# Uso: bash deploy.sh

set -e  # Salir si hay algún error

echo "═══════════════════════════════════════════════════════════"
echo "  🚀 DESPLEGANDO PULSO CONTROL ACADÉMICO"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Variables
VPS_IP="85.31.224.248"
VPS_USER="root"
VPS_PATH="/var/www/pulso-control"
APP_NAME="pulso-control"
BACKUP_DIR="/var/backups/pulso-control"

echo "📦 Paso 1: Empaquetando proyecto..."
tar -czf pulso-control.tar.gz \
  --exclude=node_modules \
  --exclude=.next \
  --exclude=.git \
  --exclude=prisma/dev.db \
  --exclude=prisma/dev.db-journal \
  --exclude=prisma/production.db \
  --exclude=*.log \
  .

echo "✅ Proyecto empaquetado"
echo ""

echo "📤 Paso 2: Subiendo al VPS..."
scp pulso-control.tar.gz ${VPS_USER}@${VPS_IP}:/tmp/
echo "✅ Archivo subido"
echo ""

echo "🔧 Paso 3: Desplegando en el VPS..."
ssh ${VPS_USER}@${VPS_IP} << 'ENDSSH'

set -e

echo "🛑 Deteniendo aplicación..."
pm2 stop pulso-control || echo "Aplicación no estaba corriendo"

echo "💾 Creando backup de la base de datos..."
cd /var/www/pulso-control
if [ -f "prisma/production.db" ]; then
  mkdir -p /var/backups/pulso-control
  cp prisma/production.db /var/backups/pulso-control/production.db.$(date +%Y%m%d_%H%M%S).backup
  echo "✅ Backup creado"
fi

echo "📂 Extrayendo archivos..."
tar -xzf /tmp/pulso-control.tar.gz
rm /tmp/pulso-control.tar.gz

echo "📦 Instalando dependencias..."
npm install --production

echo "🗄️  Configurando base de datos..."
npx prisma generate
npx prisma db push --skip-generate

echo "🏗️  Compilando aplicación..."
npm run build

echo "🚀 Iniciando aplicación..."
pm2 restart pulso-control || pm2 start npm --name "pulso-control" -- start
pm2 save

echo "✅ Despliegue completado en el VPS"

ENDSSH

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  ✅ DESPLIEGUE COMPLETADO EXITOSAMENTE"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "🌐 Accede a tu aplicación en:"
echo "   http://85.31.224.248:3001"
echo ""
echo "📊 Ver logs:"
echo "   ssh root@85.31.224.248"
echo "   pm2 logs pulso-control"
echo ""

# Limpiar archivo local
rm pulso-control.tar.gz
echo "🧹 Archivos temporales eliminados"


