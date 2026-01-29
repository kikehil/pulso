# 🚀 Guía Completa: Desplegar MVP-LMS en VPS

## 📋 Requisitos Previos

### En tu VPS necesitas:
- ✅ Ubuntu 20.04+ o similar
- ✅ Acceso SSH (root o sudo)
- ✅ Dominio apuntando al VPS (opcional pero recomendado)
- ✅ Al menos 2GB RAM y 20GB disco

---

## 🎯 OPCIÓN 1: Deployment Rápido (Recomendado)

### Paso 1: Conectar al VPS

```bash
ssh usuario@tu-vps-ip
```

### Paso 2: Instalar Node.js y PM2

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar instalación
node --version
npm --version

# Instalar PM2 (gestor de procesos)
sudo npm install -g pm2
```

### Paso 3: Instalar Nginx (Servidor Web)

```bash
sudo apt install -y nginx

# Iniciar y habilitar Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Paso 4: Clonar el Proyecto

```bash
# Crear directorio
cd /var/www
sudo mkdir -p pulsetec-lms
sudo chown -R $USER:$USER pulsetec-lms
cd pulsetec-lms

# Clonar tu repositorio (o subir archivos)
# Opción A: Con Git
git clone https://tu-repositorio.git .

# Opción B: Subir archivos con SCP (desde tu PC local)
# scp -r "D:\WEB\dentali - V3 - copia\MVP-LMS"/* usuario@vps-ip:/var/www/pulsetec-lms/
```

### Paso 5: Configurar Variables de Entorno

```bash
cd /var/www/pulsetec-lms

# Crear archivo .env.production
nano .env.production
```

Contenido del archivo `.env.production`:

```env
# Base de Datos (usar PostgreSQL o MySQL en producción)
DATABASE_URL="postgresql://usuario:password@localhost:5432/pulsetec_lms"
# O para MySQL:
# DATABASE_URL="mysql://usuario:password@localhost:3306/pulsetec_lms"

# NextAuth
NEXTAUTH_URL="https://tu-dominio.com"
NEXTAUTH_SECRET="GENERA_UN_SECRET_SUPER_LARGO_Y_ALEATORIO_AQUI_32_CARACTERES_MINIMO"

# Universidad por defecto
DEFAULT_UNIVERSITY_ID="universidad-demo"

# Node
NODE_ENV="production"
```

**IMPORTANTE:** Genera un NEXTAUTH_SECRET seguro:
```bash
openssl rand -base64 32
```

### Paso 6: Instalar PostgreSQL (Base de Datos)

```bash
# Instalar PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Iniciar servicio
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Crear base de datos
sudo -u postgres psql

# En la consola de PostgreSQL:
CREATE DATABASE pulsetec_lms;
CREATE USER pulsetec_user WITH ENCRYPTED PASSWORD 'tu_password_seguro';
GRANT ALL PRIVILEGES ON DATABASE pulsetec_lms TO pulsetec_user;
\q
```

### Paso 7: Actualizar Prisma Schema para Producción

```bash
cd /var/www/pulsetec-lms

# Editar schema.prisma
nano prisma/schema.prisma
```

Cambiar la configuración de datasource:

```prisma
datasource db {
  provider = "postgresql"  // Cambiar de sqlite a postgresql
  url      = env("DATABASE_URL")
}
```

### Paso 8: Instalar Dependencias y Build

```bash
cd /var/www/pulsetec-lms

# Instalar dependencias
npm install

# Generar Prisma Client
npx prisma generate

# Migrar base de datos
npx prisma db push

# Ejecutar seed (datos iniciales)
npm run seed

# Compilar aplicación
npm run build
```

### Paso 9: Configurar PM2

```bash
cd /var/www/pulsetec-lms

# Iniciar aplicación con PM2
pm2 start npm --name "pulsetec-lms" -- start

# Configurar inicio automático
pm2 startup
pm2 save

# Ver logs
pm2 logs pulsetec-lms

# Ver estado
pm2 status
```

### Paso 10: Configurar Nginx como Proxy

```bash
# Crear configuración
sudo nano /etc/nginx/sites-available/pulsetec-lms
```

Contenido:

```nginx
server {
    listen 80;
    server_name tu-dominio.com www.tu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Activar configuración:

```bash
# Crear enlace simbólico
sudo ln -s /etc/nginx/sites-available/pulsetec-lms /etc/nginx/sites-enabled/

# Probar configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

### Paso 11: Instalar SSL (HTTPS)

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtener certificado SSL (cambia tu-dominio.com)
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com

# Renovación automática
sudo certbot renew --dry-run
```

---

## 🎯 OPCIÓN 2: Script Automático

He creado un script que hace todo automáticamente:

```bash
# Descargar y ejecutar
curl -o- https://raw.githubusercontent.com/tu-repo/deploy.sh | bash
```

O usa el archivo `deploy-vps.sh` que crearé a continuación.

---

## 🔧 Comandos Útiles

### Gestión de PM2

```bash
# Ver logs en tiempo real
pm2 logs pulsetec-lms

# Reiniciar aplicación
pm2 restart pulsetec-lms

# Detener aplicación
pm2 stop pulsetec-lms

# Ver uso de recursos
pm2 monit

# Lista de procesos
pm2 list
```

### Actualizar Aplicación

```bash
cd /var/www/pulsetec-lms

# Detener app
pm2 stop pulsetec-lms

# Actualizar código (git o subir archivos)
git pull origin main

# Reinstalar dependencias si cambió package.json
npm install

# Regenerar Prisma si cambió schema
npx prisma generate
npx prisma db push

# Recompilar
npm run build

# Reiniciar
pm2 restart pulsetec-lms
```

### Ver Logs

```bash
# Logs de la aplicación
pm2 logs pulsetec-lms

# Logs de Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Logs del sistema
sudo journalctl -u nginx -f
```

---

## 🔒 Seguridad

### Firewall

```bash
# Habilitar UFW
sudo ufw enable

# Permitir SSH
sudo ufw allow 22/tcp

# Permitir HTTP y HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Ver estado
sudo ufw status
```

### PostgreSQL

```bash
# Editar configuración
sudo nano /etc/postgresql/14/main/postgresql.conf

# Cambiar:
# listen_addresses = 'localhost'

# Reiniciar
sudo systemctl restart postgresql
```

### Cambiar Contraseñas por Defecto

Asegúrate de cambiar:
- ✅ Contraseña de admin del sistema
- ✅ Contraseña de PostgreSQL
- ✅ NEXTAUTH_SECRET
- ✅ Contraseñas de usuarios seed

---

## 📊 Monitoreo

### Instalar Herramientas

```bash
# htop (monitor de procesos)
sudo apt install -y htop

# ncdu (uso de disco)
sudo apt install -y ncdu

# Verificar memoria
free -h

# Verificar disco
df -h

# Verificar CPU
htop
```

---

## 🐛 Troubleshooting

### La aplicación no arranca

```bash
# Ver logs completos
pm2 logs pulsetec-lms --lines 100

# Ver errores de Node
cd /var/www/pulsetec-lms
npm start
```

### Error de base de datos

```bash
# Verificar que PostgreSQL esté corriendo
sudo systemctl status postgresql

# Probar conexión
psql -h localhost -U pulsetec_user -d pulsetec_lms
```

### Nginx no funciona

```bash
# Ver errores
sudo nginx -t
sudo systemctl status nginx

# Reiniciar
sudo systemctl restart nginx
```

### Sin memoria

```bash
# Crear swap file
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Permanente
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

---

## 🚀 Servicios Alternativos (Más Fáciles)

Si el VPS es muy complejo, considera:

1. **Vercel** (Recomendado para Next.js)
   - Deployment automático
   - SSL gratis
   - CDN global
   - Comando: `npx vercel`

2. **Railway**
   - Base de datos incluida
   - Deployment con Git
   - Plan gratuito disponible

3. **DigitalOcean App Platform**
   - Configuración simple
   - Escalable
   - Base de datos managed

4. **Render**
   - Free tier
   - PostgreSQL incluido
   - Auto-deploy desde Git

---

## 📚 Recursos Adicionales

- [Documentación Next.js Deployment](https://nextjs.org/docs/deployment)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Nginx Configuration](https://nginx.org/en/docs/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

---

## ✅ Checklist Final

Antes de ir a producción:

- [ ] Variables de entorno configuradas
- [ ] NEXTAUTH_SECRET generado
- [ ] Base de datos PostgreSQL/MySQL
- [ ] SSL/HTTPS configurado
- [ ] Firewall activo
- [ ] PM2 configurado con startup
- [ ] Backups automáticos de BD
- [ ] Cambiar contraseñas por defecto
- [ ] Probar todas las funcionalidades
- [ ] Configurar dominio DNS

---

¿Necesitas ayuda con algún paso específico? 🚀
