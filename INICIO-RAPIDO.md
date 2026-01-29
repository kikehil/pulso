# 🚀 Inicio Rápido - LMS Multi-Tenant

Guía rápida para poner en marcha tu sistema LMS en 5 minutos.

## ⚡ Pasos Rápidos

### 1️⃣ Instalar Dependencias

```bash
npm install
```

### 2️⃣ Configurar Base de Datos

Crea un archivo `.env` en la raíz:

```env
DATABASE_URL="postgresql://usuario:password@localhost:5432/lms_multitenant?schema=public"
DEFAULT_UNIVERSITY_ID="universidad-demo"
```

> 💡 **Tip**: Si usas PostgreSQL local, ajusta usuario y password según tu configuración.

### 3️⃣ Preparar Prisma

```bash
# Generar cliente de Prisma
npm run prisma:generate

# Crear tablas en la base de datos
npm run prisma:migrate
```

### 4️⃣ Poblar con Datos de Prueba

```bash
npm run prisma:seed
```

Esto creará:
- ✅ 2 universidades
- ✅ 8 docentes
- ✅ 50 estudiantes
- ✅ 8 cursos
- ✅ 16 grupos
- ✅ ~150 inscripciones
- ✅ 24 tareas
- ✅ Múltiples entregas

### 5️⃣ Iniciar Servidor

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) 🎉

---

## 🎯 Lo Que Verás

### Dashboard Principal
Al abrir el sistema verás:

1. **4 Tarjetas de Métricas**
   - 👥 Alumnos Totales: 50
   - 👨‍🏫 Docentes: 8
   - 📁 Grupos Activos: 16
   - ✅ Tareas Entregadas Hoy: varía

2. **Estudiantes Recientes**
   - Lista de los últimos 5 estudiantes registrados

3. **Grupos Populares**
   - Grupos con más estudiantes inscritos

4. **Tareas Próximas**
   - Tareas ordenadas por fecha de vencimiento

---

## 📱 Funcionalidades Mobile

- **Sidebar Colapsable**: En desktop, haz clic en "Colapsar"
- **Menú Mobile**: En mobile, toca el ícono de menú (☰)
- **Responsive**: Todas las vistas se adaptan automáticamente

---

## 🔧 Comandos Útiles

```bash
# Desarrollo
npm run dev                 # Servidor de desarrollo

# Prisma
npm run prisma:studio       # Abrir GUI para ver/editar datos
npm run prisma:migrate      # Crear nueva migración
npm run prisma:generate     # Regenerar cliente Prisma
npm run prisma:seed         # Volver a poblar datos

# Producción
npm run build               # Compilar para producción
npm run start               # Servidor de producción
```

---

## 🎨 Personalización Rápida

### Cambiar Nombre de Universidad

Edita el archivo `.env`:

```env
DEFAULT_UNIVERSITY_ID="tu-universidad-id"
```

Luego actualiza la base de datos con tu universidad.

### Colores Personalizados

Edita `tailwind.config.ts`:

```typescript
colors: {
  primary: {
    // Tus colores aquí
    600: '#TU_COLOR',
  },
}
```

### Agregar Nuevas Rutas

1. Crea carpeta en `app/dashboard/tu-ruta/`
2. Agrega `page.tsx`
3. Agrega la ruta en `components/sidebar.tsx`

---

## 🐛 Solución de Problemas

### Error: "Cannot connect to database"
- ✅ Verifica que PostgreSQL esté corriendo
- ✅ Revisa las credenciales en `.env`
- ✅ Crea la base de datos manualmente: `createdb lms_multitenant`

### Error: "Prisma Client not generated"
```bash
npm run prisma:generate
```

### No se ven datos en el Dashboard
```bash
npm run prisma:seed
```

### Puerto 3000 en uso
```bash
# Usa otro puerto
PORT=3001 npm run dev
```

---

## 📊 Ver Datos en Prisma Studio

Para explorar la base de datos visualmente:

```bash
npm run prisma:studio
```

Abre [http://localhost:5555](http://localhost:5555)

---

## 🎓 Próximos Pasos

1. **Autenticación**: Implementar login con NextAuth
2. **CRUD Completo**: Agregar formularios para crear/editar
3. **Filtros**: Búsqueda y filtrado avanzado
4. **Reportes**: Gráficos con Chart.js
5. **Notificaciones**: Sistema de notificaciones real-time

---

## 💬 ¿Necesitas Ayuda?

- 📖 Lee el [README.md](./README.md) completo
- 🔍 Revisa la [documentación de Next.js](https://nextjs.org/docs)
- 🗃️ Consulta [Prisma Docs](https://www.prisma.io/docs)

---

**¡Feliz desarrollo! 🚀**


