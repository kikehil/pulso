#!/bin/bash

# 🖥️ Script de Configuración Inicial del VPS
# Ejecutar: ssh root@85.31.224.248 'bash -s' < setup-vps.sh

set -e

echo "═══════════════════════════════════════════════════════════"
echo "  🖥️  CONFIGURANDO VPS PARA PULSO CONTROL"
echo "═══════════════════════════════════════════════════════════"
echo ""

# 1. Actualizar sistema
echo "📦 Actualizando sistema..."
apt update && apt upgrade -y
echo "✅ Sistema actualizado"
echo ""

# 2. Instalar herramientas esenciales
echo "🔧 Instalando herramientas esenciales..."
apt install -y curl wget git build-essential ufw
echo "✅ Herramientas instaladas"
echo ""

# 3. Instalar Node.js 18.x
echo "📗 Instalando Node.js 18.x..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs
echo "✅ Node.js instalado: $(node -v)"
echo "✅ NPM instalado: $(npm -v)"
echo ""

# 4. Instalar PM2
echo "⚙️  Instalando PM2..."
npm install -g pm2
pm2 startup systemd -u root --hp /root
echo "✅ PM2 instalado"
echo ""

# 5. Configurar Firewall
echo "🔥 Configurando Firewall UFW..."
ufw allow 22/tcp      # SSH
ufw allow 3001/tcp    # Next.js App
ufw allow 80/tcp      # HTTP (opcional)
ufw allow 443/tcp     # HTTPS (opcional)
ufw --force enable
echo "✅ Firewall configurado"
ufw status
echo ""

# 6. Crear directorios
echo "📁 Creando estructura de directorios..."
mkdir -p /var/www/pulso-control
mkdir -p /var/backups/pulso-control
mkdir -p /var/log/pulso-control
echo "✅ Directorios creados"
echo ""

# 7. Configurar zona horaria
echo "🕐 Configurando zona horaria..."
timedatectl set-timezone America/Mexico_City
echo "✅ Zona horaria configurada"
echo ""

# 8. Optimizar configuración de Node.js
echo "⚡ Optimizando configuración..."
cat >> /etc/security/limits.conf << EOF
*         soft    nofile      65536
*         hard    nofile      65536
EOF
echo "✅ Límites optimizados"
echo ""

# 9. Instalar Nginx (opcional)
echo "🌐 ¿Deseas instalar Nginx? (recomendado)"
read -p "Instalar Nginx? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    apt install -y nginx
    systemctl enable nginx
    systemctl start nginx
    echo "✅ Nginx instalado y configurado"
else
    echo "⏭️  Nginx omitido"
fi
echo ""

echo "═══════════════════════════════════════════════════════════"
echo "  ✅ VPS CONFIGURADO EXITOSAMENTE"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "📋 Resumen de la configuración:"
echo "  • Sistema actualizado"
echo "  • Node.js $(node -v) instalado"
echo "  • PM2 instalado y configurado"
echo "  • Firewall UFW activo"
echo "  • Directorios creados en /var/www/pulso-control"
echo ""
echo "🚀 Siguiente paso:"
echo "  Ejecuta el script de despliegue desde tu máquina local:"
echo "  bash deploy.sh"
echo ""


