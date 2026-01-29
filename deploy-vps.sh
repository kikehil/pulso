#!/bin/bash

# Script de Deployment Automático para PulseTec LMS
# Uso: bash deploy-vps.sh

set -e  # Detener en caso de error

echo ""
echo "================================================================"
echo "  DEPLOYMENT AUTOMATICO - PULSETEC LMS"
echo "================================================================"
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # Sin color

# Variables
PROJECT_NAME="pulsetec-lms"
PROJECT_DIR="/var/www/$PROJECT_NAME"
DOMAIN=""
DB_NAME="pulsetec_lms"
DB_USER="pulsetec_user"
DB_PASS=""

# Función para imprimir mensajes
print_message() {
    echo -e "${CYAN}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[OK]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[AVISO]${NC} $1"
}

# Verificar si es root o tiene sudo
if [ "$EUID" -ne 0 ]; then 
    print_error "Por favor ejecuta este script con sudo"
    exit 1
fi

echo ""
print_message "Configuración inicial..."
echo ""

# Solicitar información
read -p "Ingresa el dominio (ej: lms.miescuela.com): " DOMAIN
read -p "Ingresa contraseña para PostgreSQL [generada]: " DB_PASS_INPUT
DB_PASS=${DB_PASS_INPUT:-$(openssl rand -base64 16)}

echo ""
print_success "Dominio: $DOMAIN"
print_success "Base de datos: $DB_NAME"
print_success "Usuario BD: $DB_USER"
print_success "Contraseña BD: $DB_PASS"
echo ""

read -p "Presiona Enter para continuar o Ctrl+C para cancelar..."

# 1. Actualizar sistema
echo ""
print_message "Paso 1/10: Actualizando sistema..."
apt update && apt upgrade -y
print_success "Sistema actualizado"

# 2. Instalar Node.js
echo ""
print_message "Paso 2/10: Instalando Node.js 20 LTS..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
    print_success "Node.js instalado: $(node --version)"
else
    print_success "Node.js ya instalado: $(node --version)"
fi

# 3. Instalar PM2
echo ""
print_message "Paso 3/10: Instalando PM2..."
npm install -g pm2
print_success "PM2 instalado"

# 4. Instalar Nginx
echo ""
print_message "Paso 4/10: Instalando Nginx..."
if ! command -v nginx &> /dev/null; then
    apt install -y nginx
    systemctl enable nginx
    systemctl start nginx
    print_success "Nginx instalado"
else
    print_success "Nginx ya instalado"
fi

# 5. Instalar PostgreSQL
echo ""
print_message "Paso 5/10: Instalando PostgreSQL..."
if ! command -v psql &> /dev/null; then
    apt install -y postgresql postgresql-contrib
    systemctl enable postgresql
    systemctl start postgresql
    print_success "PostgreSQL instalado"
else
    print_success "PostgreSQL ya instalado"
fi

# 6. Crear base de datos
echo ""
print_message "Paso 6/10: Configurando base de datos..."
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || print_warning "Base de datos ya existe"
sudo -u postgres psql -c "CREATE USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASS';" 2>/dev/null || print_warning "Usuario ya existe"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
print_success "Base de datos configurada"

# 7. Crear directorio del proyecto
echo ""
print_message "Paso 7/10: Creando directorio del proyecto..."
mkdir -p $PROJECT_DIR
cd $PROJECT_DIR
print_success "Directorio creado: $PROJECT_DIR"

print_warning "Ahora debes subir los archivos del proyecto a $PROJECT_DIR"
print_warning "Puedes usar SCP, Git, o FTP"
echo ""
print_message "Ejemplo con SCP desde tu PC:"
echo "  scp -r './MVP-LMS/*' usuario@servidor:$PROJECT_DIR/"
echo ""
read -p "Presiona Enter cuando hayas subido los archivos..."

# 8. Instalar dependencias
echo ""
print_message "Paso 8/10: Instalando dependencias..."
if [ -f "package.json" ]; then
    npm install
    print_success "Dependencias instaladas"
else
    print_error "No se encontró package.json. Asegúrate de subir los archivos."
    exit 1
fi

# 9. Configurar variables de entorno
echo ""
print_message "Paso 9/10: Configurando variables de entorno..."

NEXTAUTH_SECRET=$(openssl rand -base64 32)
DATABASE_URL="postgresql://$DB_USER:$DB_PASS@localhost:5432/$DB_NAME"

cat > .env.production << EOF
# Base de Datos
DATABASE_URL="$DATABASE_URL"

# NextAuth
NEXTAUTH_URL="https://$DOMAIN"
NEXTAUTH_SECRET="$NEXTAUTH_SECRET"

# Universidad
DEFAULT_UNIVERSITY_ID="universidad-demo"

# Entorno
NODE_ENV="production"
EOF

print_success "Archivo .env.production creado"

# 10. Generar Prisma y Build
echo ""
print_message "Paso 10/10: Compilando aplicación..."

# Actualizar schema.prisma a PostgreSQL
sed -i 's/provider = "sqlite"/provider = "postgresql"/' prisma/schema.prisma
sed -i 's|url.*=.*"file:.*"|url = env("DATABASE_URL")|' prisma/schema.prisma

npx prisma generate
npx prisma db push

# Ejecutar seed si existe
if grep -q "seed" package.json; then
    npm run seed || print_warning "Seed no disponible"
fi

npm run build
print_success "Aplicación compilada"

# Configurar PM2
echo ""
print_message "Configurando PM2..."
pm2 start npm --name "$PROJECT_NAME" -- start
pm2 startup
pm2 save
print_success "PM2 configurado"

# Configurar Nginx
echo ""
print_message "Configurando Nginx..."
cat > /etc/nginx/sites-available/$PROJECT_NAME << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

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

ln -sf /etc/nginx/sites-available/$PROJECT_NAME /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
print_success "Nginx configurado"

# Configurar Firewall
echo ""
print_message "Configurando firewall..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
print_success "Firewall configurado"

# Instalar SSL
echo ""
print_message "Instalando SSL con Certbot..."
apt install -y certbot python3-certbot-nginx
certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN || print_warning "SSL no configurado automáticamente"

# Resumen
echo ""
echo "================================================================"
echo "  DEPLOYMENT COMPLETADO"
echo "================================================================"
echo ""
print_success "Aplicación corriendo en: https://$DOMAIN"
print_success "Base de datos: PostgreSQL"
print_success "Proceso: PM2 ($PROJECT_NAME)"
echo ""
echo "Credenciales de Base de Datos:"
echo "  Host: localhost"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo "  Password: $DB_PASS"
echo ""
echo "NEXTAUTH_SECRET: $NEXTAUTH_SECRET"
echo ""
print_warning "GUARDA ESTAS CREDENCIALES EN UN LUGAR SEGURO"
echo ""
echo "Comandos útiles:"
echo "  Ver logs:      pm2 logs $PROJECT_NAME"
echo "  Reiniciar:     pm2 restart $PROJECT_NAME"
echo "  Ver estado:    pm2 status"
echo ""
echo "================================================================"

