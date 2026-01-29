# 🛠️ Referencia Rápida de Comandos

## 📦 Gestión de Dependencias

```bash
# Instalar todas las dependencias
npm install

# Instalar una dependencia
npm install nombre-paquete

# Instalar dependencia de desarrollo
npm install -D nombre-paquete

# Actualizar dependencias
npm update

# Limpiar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install
```

---

## 🚀 Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev

# Iniciar en puerto específico
PORT=3001 npm run dev

# Construir para producción
npm run build

# Iniciar servidor de producción
npm run start

# Linter
npm run lint
```

---

## 🗄️ Prisma - Base de Datos

### Configuración Inicial

```bash
# 1. Generar cliente de Prisma
npm run prisma:generate

# 2. Crear y aplicar migraciones
npm run prisma:migrate

# 3. Poblar con datos de prueba
npm run prisma:seed
```

### Comandos de Desarrollo

```bash
# Abrir Prisma Studio (GUI para ver/editar datos)
npm run prisma:studio

# Crear una nueva migración
npx prisma migrate dev --name nombre-migracion

# Formatear schema.prisma
npx prisma format

# Ver estado de migraciones
npx prisma migrate status

# Resetear base de datos (⚠️ Borra todos los datos)
npx prisma migrate reset

# Pushear schema sin migración (desarrollo rápido)
npx prisma db push
```

### Comandos de Producción

```bash
# Aplicar migraciones en producción
npx prisma migrate deploy

# Generar cliente (producción)
npx prisma generate
```

---

## 🔧 PostgreSQL

### Conexión a PostgreSQL (psql)

```bash
# Conectar a PostgreSQL
psql -U usuario -d nombre_db

# Crear base de datos
createdb lms_multitenant

# Eliminar base de datos
dropdb lms_multitenant

# Listar bases de datos
psql -U usuario -l
```

### Comandos dentro de psql

```sql
-- Conectar a una base de datos
\c lms_multitenant

-- Listar tablas
\dt

-- Describir una tabla
\d nombre_tabla

-- Ejecutar query
SELECT * FROM universities;

-- Salir
\q
```

---

## 📊 Consultas Útiles de Base de Datos

### Verificar Datos por Universidad

```sql
-- Contar estudiantes por universidad
SELECT u.name, COUNT(s.id) as total_students
FROM universities u
LEFT JOIN students s ON s."universityId" = u.id
GROUP BY u.name;

-- Ver todas las universidades
SELECT * FROM universities;

-- Ver estudiantes de una universidad
SELECT * FROM students 
WHERE "universityId" = 'universidad-demo';

-- Ver grupos activos
SELECT g.name, c.name as course_name, COUNT(e.id) as students_count
FROM groups g
JOIN courses c ON c.id = g."courseId"
LEFT JOIN enrollments e ON e."groupId" = g.id
WHERE g."universityId" = 'universidad-demo'
GROUP BY g.id, c.name;
```

---

## 🐛 Debugging

### Next.js

```bash
# Modo debug con inspector
NODE_OPTIONS='--inspect' npm run dev

# Limpiar cache de Next.js
rm -rf .next

# Ver bundle analyzer (requiere instalación)
npm install @next/bundle-analyzer
ANALYZE=true npm run build
```

### Prisma

```bash
# Ver queries SQL generadas
DATABASE_URL="..." npx prisma studio --preview-feature

# Debug mode
DEBUG=* npm run dev
```

---

## 🧪 Testing (Futuro)

```bash
# Ejecutar tests
npm test

# Tests con coverage
npm test -- --coverage

# Tests en modo watch
npm test -- --watch

# Tests e2e
npm run test:e2e
```

---

## 🔄 Git

### Workflow Básico

```bash
# Ver estado
git status

# Agregar archivos
git add .

# Commit
git commit -m "feat: descripción del cambio"

# Push
git push origin main

# Pull (actualizar)
git pull origin main

# Ver historial
git log --oneline
```

### Branches

```bash
# Crear y cambiar a nueva rama
git checkout -b feature/nueva-funcionalidad

# Listar branches
git branch

# Cambiar de branch
git checkout main

# Mergear branch
git merge feature/nueva-funcionalidad

# Eliminar branch
git branch -d feature/nueva-funcionalidad
```

---

## 🚀 Deployment

### Vercel (Recomendado)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy a preview
vercel

# Deploy a producción
vercel --prod

# Ver logs
vercel logs
```

### Docker

```bash
# Build imagen
docker build -t lms-multitenant .

# Run container
docker run -p 3000:3000 lms-multitenant

# Docker Compose
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener
docker-compose down
```

---

## 🔐 Variables de Entorno

### Desarrollo

```bash
# Editar .env
nano .env

# Ver variables cargadas (Node.js)
node -e "console.log(process.env)"
```

### Producción (Vercel)

```bash
# Agregar variable
vercel env add NOMBRE_VARIABLE

# Listar variables
vercel env ls

# Pull variables localmente
vercel env pull
```

---

## 📝 Mantenimiento

### Limpiar Proyecto

```bash
# Limpiar builds y caché
rm -rf .next node_modules

# Reinstalar dependencias
npm install

# Regenerar Prisma
npm run prisma:generate
```

### Actualizar Next.js

```bash
# Actualizar Next.js a última versión
npm install next@latest react@latest react-dom@latest

# Actualizar todas las dependencias
npx npm-check-updates -u
npm install
```

---

## 🎨 Tailwind CSS

```bash
# Inicializar Tailwind (ya configurado)
npx tailwindcss init -p

# Observar cambios (desarrollo automático con Next.js)
# No requiere comando adicional con Next.js
```

---

## 📈 Performance

### Analizar Bundle

```bash
# Instalar analizador
npm install -D @next/bundle-analyzer

# Agregar en next.config.js:
# const withBundleAnalyzer = require('@next/bundle-analyzer')({
#   enabled: process.env.ANALYZE === 'true',
# })
# module.exports = withBundleAnalyzer(nextConfig)

# Ejecutar análisis
ANALYZE=true npm run build
```

### Lighthouse (Auditoría)

```bash
# Instalar Lighthouse
npm install -g lighthouse

# Ejecutar auditoría
lighthouse http://localhost:3000 --view

# Con Chrome DevTools:
# F12 → Lighthouse → Generate Report
```

---

## 🔗 Links Útiles

- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Lucide Icons**: https://lucide.dev
- **PostgreSQL Docs**: https://www.postgresql.org/docs

---

## 💡 Tips

### Alias útiles para .bashrc o .zshrc

```bash
# Agregar a ~/.bashrc o ~/.zshrc

alias nd="npm run dev"
alias nb="npm run build"
alias ni="npm install"
alias ps="npm run prisma:studio"
alias pm="npm run prisma:migrate"
alias pg="npm run prisma:generate"

# Recargar shell
source ~/.bashrc  # o source ~/.zshrc
```

---

**Última actualización: Enero 2026**


