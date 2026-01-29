#!/bin/bash

# Script de Configuración Rápida
# Para cuando YA TIENES el proyecto en el VPS
# Uso: bash comandos-rapidos.sh

echo ""
echo "================================================================"
echo "  CONFIGURACION RAPIDA - PULSETEC LMS"
echo "================================================================"
echo ""

# Variables (CONFIGURA ESTAS)
DB_NAME="pulsetec_lms"
DB_USER="pulsetec_user"
DB_PASS="cambiar_password_aqui"
PROJECT_DIR="/var/www/html/pulsetec-lms"

echo "Directorio del proyecto: $PROJECT_DIR"
echo "Base de datos: $DB_NAME"
echo ""
read -p "Presiona Enter para continuar o Ctrl+C para cancelar..."

# 1. Instalar Node.js
echo ""
echo "[1/8] Instalando Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
    echo "✓ Node.js instalado"
else
    echo "✓ Node.js ya instalado"
fi

# 2. Instalar PM2
echo ""
echo "[2/8] Instalando PM2..."
sudo npm install -g pm2
echo "✓ PM2 instalado"

# 3. Instalar PostgreSQL
echo ""
echo "[3/8] Instalando PostgreSQL..."
if ! command -v psql &> /dev/null; then
    sudo apt install -y postgresql postgresql-contrib
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
    echo "✓ PostgreSQL instalado"
else
    echo "✓ PostgreSQL ya instalado"
fi

# 4. Crear base de datos
echo ""
echo "[4/8] Creando base de datos..."
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || echo "✓ Base de datos ya existe"
sudo -u postgres psql -c "CREATE USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASS';" 2>/dev/null || echo "✓ Usuario ya existe"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
echo "✓ Base de datos configurada"

# 5. Instalar dependencias
echo ""
echo "[5/8] Instalando dependencias del proyecto..."
cd $PROJECT_DIR
npm install
echo "✓ Dependencias instaladas"

# 6. Generar NEXTAUTH_SECRET
echo ""
echo "[6/8] Generando configuración..."
NEXTAUTH_SECRET=$(openssl rand -base64 32)
DATABASE_URL="postgresql://$DB_USER:$DB_PASS@localhost:5432/$DB_NAME"

# Crear .env.production
cat > .env.production << EOF
DATABASE_URL="$DATABASE_URL"
NEXTAUTH_URL="http://$(curl -s ifconfig.me)"
NEXTAUTH_SECRET="$NEXTAUTH_SECRET"
DEFAULT_UNIVERSITY_ID="universidad-demo"
NODE_ENV="production"
EOF

echo "✓ Archivo .env.production creado"
echo ""
echo "NEXTAUTH_SECRET: $NEXTAUTH_SECRET"
echo "DATABASE_URL: $DATABASE_URL"
echo ""

# 7. Actualizar schema.prisma
echo ""
echo "[7/8] Actualizando Prisma..."
sed -i 's/provider = "sqlite"/provider = "postgresql"/' prisma/schema.prisma
sed -i 's|url.*=.*"file:.*"|url = env("DATABASE_URL")|' prisma/schema.prisma

npx prisma generate
npx prisma db push
npm run seed || echo "⚠ Seed no disponible"
npm run build
echo "✓ Prisma y build completados"

# 8. Iniciar con PM2
echo ""
echo "[8/8] Iniciando aplicación..."
pm2 delete pulsetec-lms 2>/dev/null || true
pm2 start npm --name "pulsetec-lms" -- start
pm2 save
echo "✓ Aplicación iniciada con PM2"

# Instalar Nginx
echo ""
echo "Instalando Nginx..."
if ! command -v nginx &> /dev/null; then
    sudo apt install -y nginx
    echo "✓ Nginx instalado"
fi

# Configurar Nginx
SERVER_IP=$(curl -s ifconfig.me)
sudo tee /etc/nginx/sites-available/pulsetec-lms > /dev/null << EOF
server {
    listen 80;
    server_name $SERVER_IP;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/pulsetec-lms /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
echo "✓ Nginx configurado"

# Configurar firewall
echo ""
echo "Configurando firewall..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
echo "✓ Firewall configurado"

# Resumen
echo ""
echo "================================================================"
echo "  CONFIGURACION COMPLETADA"
echo "================================================================"
echo ""
echo "URL: http://$SERVER_IP"
echo ""
echo "Credenciales por defecto:"
echo "  Admin: admin@universidad.edu / Admin123!"
echo "  Docente: luzangela.hdzr@gmail.com / Docente123!"
echo ""
echo "Base de Datos:"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo "  Password: $DB_PASS"
echo ""
echo "Comandos útiles:"
echo "  pm2 logs pulsetec-lms     - Ver logs"
echo "  pm2 restart pulsetec-lms  - Reiniciar"
echo "  pm2 status                - Ver estado"
echo ""
echo "================================================================"

