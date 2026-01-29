# 🚀 Instrucciones de Configuración

## ⚠️ ERROR ACTUAL
```
Can't reach database server at localhost:5432
```

**Causa**: PostgreSQL no está instalado o no está corriendo.

---

## ✅ SOLUCIÓN RÁPIDA (SQLite - Recomendado)

Ya cambié la configuración a SQLite. Solo sigue estos pasos:

### Paso 1: Detener el Servidor
En la terminal donde está corriendo `npm run dev`:
```
Presiona: Ctrl + C
```

### Paso 2: Ejecutar Setup Automático
```powershell
.\setup.ps1
```

O manualmente:
```bash
npx prisma generate
npx prisma db push
npm run dev
```

### Paso 3: Abrir en Navegador
```
http://localhost:3000
```

---

## 🎯 ¿Qué hace SQLite?

✅ **No requiere instalación** adicional  
✅ **Base de datos local** en archivo `prisma/dev.db`  
✅ **Perfecta para desarrollo** y pruebas  
✅ **Mismas funcionalidades** que PostgreSQL para este proyecto

---

## 📊 Alternativa: Usar PostgreSQL

Si prefieres PostgreSQL:

### 1. Instalar PostgreSQL
- **Windows**: https://www.postgresql.org/download/windows/
- Usa el instalador de EDB
- Puerto por defecto: 5432
- Usuario: postgres
- Contraseña: (la que configures)

### 2. Revertir a PostgreSQL
Edita `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 3. Actualizar .env
```env
DATABASE_URL="postgresql://postgres:TU_PASSWORD@localhost:5432/lms_multitenant"
```

### 4. Crear base de datos
```bash
createdb lms_multitenant
npx prisma generate
npx prisma db push
```

---

## 🔍 Verificar Estado

### Base de Datos SQLite Creada
```bash
ls prisma/dev.db
```

### Ver Datos con Prisma Studio
```bash
npx prisma studio
```
Abre: http://localhost:5555

---

## 📝 Resumen de Comandos

```bash
# Detener servidor
Ctrl + C

# Setup completo (automático)
.\setup.ps1

# O manual:
npx prisma generate          # Generar cliente
npx prisma db push           # Crear tablas
npm run prisma:seed          # Datos de prueba (opcional)
npm run dev                  # Iniciar servidor

# Abrir navegador
http://localhost:3000
```

---

## ✅ Checklist

- [ ] Detener servidor (Ctrl+C)
- [ ] Ejecutar `.\setup.ps1` o comandos manuales
- [ ] Iniciar servidor con `npm run dev`
- [ ] Abrir http://localhost:3000
- [ ] Ver el diseño PulseTec funcionando 🎨

---

## 🆘 Si Sigues Teniendo Problemas

### Error: "EPERM: operation not permitted"
**Solución**: Asegúrate de haber detenido el servidor (Ctrl+C)

### Error: "command not found: npx"
**Solución**: Reinstala dependencias
```bash
npm install
```

### La página sigue con error
**Solución**: Hard refresh en el navegador
```
Ctrl + Shift + R
```

---

## 🎉 ¡Listo!

Una vez completado el setup, verás el dashboard con:
- ✅ Diseño PulseTec Control
- ✅ Sidebar oscuro (#0F172A)
- ✅ Isotipo animado
- ✅ Cards con métricas
- ✅ Formularios de búsqueda

**Disfruta tu LMS multi-tenant!** 🚀


