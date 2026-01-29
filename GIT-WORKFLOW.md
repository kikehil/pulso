# 🔄 Flujo de Trabajo Git: PC → GitHub → VPS

## 📋 Resumen del Proceso

```
PC Local → Git Commit → Git Push → GitHub → Git Pull (VPS) → Deploy
```

---

## 🖥️ PASO 1: Subir Cambios desde tu PC a GitHub

### 1. Verificar cambios pendientes

```bash
# En tu PC local
cd "D:\WEB\dentali - V3 - copia\MVP-LMS"

# Ver qué archivos cambiaron
git status
```

### 2. Agregar archivos al staging

```bash
# Agregar todos los archivos modificados
git add .

# O agregar archivos específicos
git add app/student/dashboard/actions.ts
git add lib/types.ts
git add types/next-auth.d.ts
```

### 3. Hacer commit

```bash
# Commit con mensaje descriptivo
git commit -m "Fix: Corregir errores de build - AttendanceSession y tipos NextAuth"
```

### 4. Subir a GitHub

```bash
# Verificar que estás en la rama correcta
git branch

# Si no estás en main, cambiar:
git checkout main

# Subir cambios
git push origin main
```

**Si es la primera vez**, puede pedirte autenticación. Usa un Personal Access Token de GitHub.

---

## 🖥️ PASO 2: Actualizar el VPS desde GitHub

### 1. Conectar al VPS

```bash
ssh root@srv1271912
# O el usuario que uses
```

### 2. Ir al directorio del proyecto

```bash
cd /var/www/html/pulso
```

### 3. Verificar que estás en la rama correcta

```bash
git branch
# Debe mostrar: * main
```

### 4. Obtener cambios de GitHub

```bash
# Obtener cambios sin aplicar
git fetch origin

# Ver qué cambios hay
git log HEAD..origin/main

# Aplicar cambios
git pull origin main
```

### 5. Reinstalar dependencias (si cambió package.json)

```bash
npm install
```

### 6. Regenerar Prisma (si cambió schema.prisma)

```bash
npx prisma generate
npx prisma db push
```

### 7. Recompilar

```bash
npm run build
```

### 8. Reiniciar la aplicación

```bash
# Si usas PM2
pm2 restart pulsetec-lms

# O si usas npm start directamente
# Detener con Ctrl+C y reiniciar
npm start
```

---

## 🔄 Flujo Completo (Resumen)

### En tu PC:

```bash
cd "D:\WEB\dentali - V3 - copia\MVP-LMS"

# 1. Ver cambios
git status

# 2. Agregar cambios
git add .

# 3. Commit
git commit -m "Descripción de los cambios"

# 4. Push a GitHub
git push origin main
```

### En el VPS:

```bash
cd /var/www/html/pulso

# 1. Obtener cambios
git pull origin main

# 2. Instalar/actualizar dependencias (si es necesario)
npm install

# 3. Regenerar Prisma (si cambió schema)
npx prisma generate
npx prisma db push

# 4. Recompilar
npm run build

# 5. Reiniciar
pm2 restart pulsetec-lms
```

---

## 🚨 Solución de Problemas

### Error: "Permission denied" al hacer push

```bash
# Verificar configuración de Git
git config --global user.name "Tu Nombre"
git config --global user.email "tu-email@ejemplo.com"

# Si usas HTTPS, GitHub requiere Personal Access Token
# Crear uno en: GitHub → Settings → Developer settings → Personal access tokens
```

### Error: "Your branch is behind"

```bash
# En el VPS, si hay conflictos:
git fetch origin
git reset --hard origin/main  # ⚠️ CUIDADO: Esto sobrescribe cambios locales
```

### Error: "Merge conflict"

```bash
# Ver archivos en conflicto
git status

# Resolver manualmente o aceptar una versión:
git checkout --theirs archivo.conflicto.ts  # Usar versión de GitHub
git checkout --ours archivo.conflicto.ts    # Usar versión local

# Luego:
git add .
git commit -m "Resolver conflictos"
git push origin main
```

---

## 📝 Comandos Útiles

### Ver historial de commits

```bash
git log --oneline -10
```

### Ver diferencias antes de commit

```bash
git diff
```

### Deshacer cambios no commiteados

```bash
git checkout -- archivo.ts
```

### Ver qué archivos están en staging

```bash
git status
```

### Verificar remoto configurado

```bash
git remote -v
# Debe mostrar:
# origin  https://github.com/kikehil/pulso.git (fetch)
# origin  https://github.com/kikehil/pulso.git (push)
```

---

## 🔐 Configurar Git en el VPS (Primera vez)

Si es la primera vez que usas Git en el VPS:

```bash
# Configurar usuario
git config --global user.name "Tu Nombre"
git config --global user.email "tu-email@ejemplo.com"

# Clonar repositorio (si no lo tienes)
cd /var/www/html
git clone https://github.com/kikehil/pulso.git pulso
cd pulso

# O si ya lo tienes, verificar remoto
cd /var/www/html/pulso
git remote -v

# Si no está configurado:
git remote add origin https://github.com/kikehil/pulso.git
```

---

## ✅ Checklist de Deployment

Antes de hacer push:

- [ ] Todos los errores de build resueltos localmente
- [ ] `npm run build` pasa sin errores
- [ ] Cambios probados localmente
- [ ] Mensaje de commit descriptivo

Después de hacer pull en VPS:

- [ ] `git pull` exitoso
- [ ] `npm install` si cambió package.json
- [ ] `npx prisma generate` si cambió schema
- [ ] `npm run build` exitoso
- [ ] Aplicación reiniciada
- [ ] Verificar que funciona en producción

---

## 🎯 Comandos Rápidos

### Actualización completa en VPS (un solo comando)

```bash
cd /var/www/html/pulso && git pull origin main && npm install && npx prisma generate && npm run build && pm2 restart pulsetec-lms
```

### Ver estado actual

```bash
# En PC
git status

# En VPS
cd /var/www/html/pulso
git status
git log -1
```

---

¿Necesitas ayuda con algún paso específico? 🚀

