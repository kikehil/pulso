# 🚀 Deployment Rápido - Proyecto Ya en VPS

## ✅ Ya tienes el proyecto en el VPS - Ahora vamos a configurarlo

---

## 📍 PASO 1: Verificar que tienes todo

```bash
# Conéctate a tu VPS
ssh usuario@tu-vps-ip

# Ve al directorio del proyecto
cd /var/www/html/pulsetec-lms

# Verifica que los archivos estén ahí
ls -la

# Deberías ver: package.json, prisma/, app/, etc.
```

---

## 🔧 PASO 2: Instalar Node.js y dependencias

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar instalación
node --version  # Debe mostrar v20.x.x
npm --version   # Debe mostrar 10.x.x

# Instalar PM2 (gestor de procesos)
sudo npm install -g pm2
```

---

## 🗄️ PASO 3: Instalar y configurar PostgreSQL

```bash
# Instalar PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Iniciar servicio
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Crear base de datos y usuario
sudo -u postgres psql
```

Dentro de la consola de PostgreSQL:

```sql
CREATE DATABASE pulsetec_lms;
CREATE USER pulsetec_user WITH ENCRYPTED PASSWORD 'TU_PASSWORD_AQUI';
GRANT ALL PRIVILEGES ON DATABASE pulsetec_lms TO pulsetec_user;
\q
```

**💾 GUARDA LA CONTRASEÑA:** `pulsetec_user` / `TU_PASSWORD_AQUI`

---

## ⚙️ PASO 4: Configurar el proyecto

```bash
# Ir al proyecto
cd /var/www/html/pulsetec-lms

# Instalar dependencias
npm install
```

### Crear archivo de entorno (.env.production)

```bash
nano .env.production
```

Pega esto (cambia los valores):

```env
# Base de Datos
DATABASE_URL="postgresql://pulsetec_user:TU_PASSWORD_AQUI@localhost:5432/pulsetec_lms"

# NextAuth
NEXTAUTH_URL="http://TU_IP_O_DOMINIO"
NEXTAUTH_SECRET="GENERA_UNO_CON_EL_COMANDO_DE_ABAJO"

# Universidad
DEFAULT_UNIVERSITY_ID="universidad-demo"

# Entorno
NODE_ENV="production"
```

**Generar NEXTAUTH_SECRET:**

```bash
openssl rand -base64 32
# Copia el resultado y pégalo en NEXTAUTH_SECRET
```

Guardar: `Ctrl + O`, Enter, `Ctrl + X`

---

## 🔄 PASO 5: Actualizar Prisma para PostgreSQL

```bash
# Editar schema
nano prisma/schema.prisma
```

Busca estas líneas y cámbiala:

```prisma
datasource db {
  provider = "postgresql"  # <-- Cambiar de "sqlite" a "postgresql"
  url      = env("DATABASE_URL")
}
```

Guardar: `Ctrl + O`, Enter, `Ctrl + X`

---

## 🏗️ PASO 6: Generar base de datos y compilar

```bash
cd /var/www/html/pulsetec-lms

# Generar Prisma Client
npx prisma generate

# Crear tablas en la base de datos
npx prisma db push

# Cargar datos iniciales (usuarios, universidad demo)
npm run seed

# Compilar aplicación para producción
npm run build
```

**⏱️ Esto puede tardar 2-5 minutos**

---

## 🚀 PASO 7: Iniciar la aplicación con PM2

```bash
cd /var/www/html/pulsetec-lms

# Iniciar con PM2
pm2 start npm --name "pulsetec-lms" -- start

# Configurar inicio automático al reiniciar servidor
pm2 startup
# Copia y ejecuta el comando que te muestra

pm2 save

# Ver estado
pm2 status

# Ver logs en tiempo real
pm2 logs pulsetec-lms
```

---

## 🌐 PASO 8: Instalar y configurar Nginx

```bash
# Instalar Nginx
sudo apt install -y nginx

# Crear configuración
sudo nano /etc/nginx/sites-available/pulsetec-lms
```

Pega esto (cambia `TU_DOMINIO_O_IP`):

```nginx
server {
    listen 80;
    server_name TU_DOMINIO_O_IP;

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

Guardar: `Ctrl + O`, Enter, `Ctrl + X`

```bash
# Activar configuración
sudo ln -s /etc/nginx/sites-available/pulsetec-lms /etc/nginx/sites-enabled/

# Probar configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

---

## 🔒 PASO 9: Configurar Firewall

```bash
# Permitir SSH (IMPORTANTE - no te bloquees)
sudo ufw allow 22/tcp

# Permitir HTTP y HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Activar firewall
sudo ufw enable

# Ver estado
sudo ufw status
```

---

## 🎉 PASO 10: ¡PROBAR!

### Abrir en el navegador:

```
http://TU_IP_O_DOMINIO
```

### Credenciales por defecto:

**Admin:**
- Email: `admin@universidad.edu`
- Password: `Admin123!`

**Docente:**
- Email: `luzangela.hdzr@gmail.com`
- Password: `Docente123!`

---

## ✅ VERIFICACIÓN RÁPIDA

```bash
# ¿Está corriendo la app?
pm2 status

# Ver logs
pm2 logs pulsetec-lms

# ¿PostgreSQL funcionando?
sudo systemctl status postgresql

# ¿Nginx funcionando?
sudo systemctl status nginx

# ¿Firewall activo?
sudo ufw status
```

---

## 🔧 Comandos Útiles

### Ver logs de la aplicación:
```bash
pm2 logs pulsetec-lms
```

### Reiniciar aplicación:
```bash
pm2 restart pulsetec-lms
```

### Ver errores de Nginx:
```bash
sudo tail -f /var/log/nginx/error.log
```

### Si necesitas actualizar el código:
```bash
cd /var/www/html/pulsetec-lms
git pull  # Si usas Git
npm install  # Si cambió package.json
npx prisma generate  # Si cambió schema.prisma
npx prisma db push  # Si cambió schema.prisma
npm run build
pm2 restart pulsetec-lms
```

---

## 🆘 PROBLEMAS COMUNES

### Error: "Cannot find module"
```bash
cd /var/www/html/pulsetec-lms
npm install
pm2 restart pulsetec-lms
```

### Error: "Port 3000 already in use"
```bash
pm2 delete pulsetec-lms
pm2 start npm --name "pulsetec-lms" -- start
```

### Error de conexión a base de datos
```bash
# Verificar PostgreSQL
sudo systemctl status postgresql

# Probar conexión
psql -h localhost -U pulsetec_user -d pulsetec_lms
# Usa la contraseña que configuraste
```

### No puedo acceder desde el navegador
```bash
# Verificar que la app esté corriendo
pm2 status

# Verificar Nginx
sudo systemctl status nginx
sudo nginx -t

# Verificar firewall
sudo ufw status
```

---

## 🔐 OPCIONAL: Instalar SSL (HTTPS)

Si tienes un dominio:

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtener certificado
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com

# Seguir las instrucciones
# Certbot configurará HTTPS automáticamente
```

---

## 📊 Monitoreo

```bash
# Ver uso de recursos
pm2 monit

# Ver memoria y CPU
htop

# Ver espacio en disco
df -h

# Ver logs del sistema
sudo journalctl -u nginx -f
```

---

## 🎯 RESUMEN DE LO QUE HICIMOS

✅ Instalamos Node.js 20 y PM2
✅ Instalamos PostgreSQL
✅ Configuramos base de datos
✅ Configuramos variables de entorno
✅ Actualizamos Prisma a PostgreSQL
✅ Generamos la base de datos
✅ Compilamos la aplicación
✅ Iniciamos con PM2
✅ Configuramos Nginx como proxy
✅ Configuramos firewall

---

## 📝 DATOS IMPORTANTES - GUÁRDALOS

```
URL: http://TU_IP_O_DOMINIO
Admin: admin@universidad.edu / Admin123!
Docente: luzangela.hdzr@gmail.com / Docente123!

Base de Datos:
- Host: localhost
- Puerto: 5432
- Database: pulsetec_lms
- Usuario: pulsetec_user
- Password: [LA QUE CONFIGURASTE]

Directorio: /var/www/html/pulsetec-lms
```

---

¿En qué paso estás o necesitas ayuda? 🚀

