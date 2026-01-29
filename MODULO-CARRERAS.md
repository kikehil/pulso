# 📚 Módulo de Carreras - PulseTec Control

## ✅ Implementación Completa

He creado el módulo completo de **Gestión de Carreras** con el estilo PulseTec Control.

---

## 🎯 Características Implementadas

### ✅ 1. Interfaz Completa
- **Formulario de búsqueda** con estilo PulseTec
- **Tabla profesional** con encabezados en Midnight Blue (#0F172A)
- **Botones de acción** en Electric Cyan (#06B6D4)
- **Modal de creación/edición** con animaciones
- **Responsive** en todos los dispositivos

### ✅ 2. Funcionalidades
- ✅ Crear nueva carrera
- ✅ Editar carrera existente
- ✅ Eliminar carrera (soft delete)
- ✅ Buscar carreras
- ✅ Validación de código único
- ✅ Filtrado por universidad (multi-tenant)

### ✅ 3. Campos del Formulario
- **Nombre de la Carrera** (requerido)
- **Código** (requerido, único, no editable después de crear)
- **Descripción** (opcional, textarea)

### ✅ 4. Estilo PulseTec Control
- Encabezados de tabla: **#0F172A** (Midnight Blue)
- Botones de acción: **#06B6D4** (Electric Cyan)
- Inputs con borde **#64748B** que cambia a **#06B6D4** al focus
- Modal con backdrop blur y animaciones
- Hover effects profesionales

---

## 📁 Archivos Creados

### 1. **Modal Component** (`components/modal.tsx`)
Componente modal reutilizable con:
- Overlay con backdrop blur
- Animaciones de entrada/salida
- Cierre con ESC o click fuera
- Tamaños configurables (sm, md, lg, xl)
- Diseño PulseTec Control

```tsx
<Modal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  title="Nueva Carrera"
  size="md"
>
  {/* Contenido */}
</Modal>
```

### 2. **Server Actions** (`app/dashboard/carreras/actions.ts`)
Funciones del servidor:
- `getCareers()` - Obtener todas las carreras
- `createCareer()` - Crear nueva carrera
- `updateCareer()` - Actualizar carrera
- `deleteCareer()` - Eliminar carrera (soft delete)
- `searchCareers()` - Buscar carreras

**Características:**
- ✅ Filtrado automático por `university_id`
- ✅ Validación de código único
- ✅ Revalidación de cache automática
- ✅ Tipado completo con TypeScript

### 3. **Página de Carreras** (`app/dashboard/carreras/page.tsx`)
Interfaz completa con:
- Tabla con todas las carreras
- Botones de crear, editar y eliminar
- Búsqueda en tiempo real
- Modal de formulario
- Mensajes de éxito/error
- Loading states

---

## 🎨 Diseño de la Tabla

```
┌─────────────────────────────────────────────────────────┐
│ Gestión de Carreras              [+ Nueva Carrera]     │
├─────────────────────────────────────────────────────────┤
│ [🔍 Buscar por nombre, código...]                      │
├─────────────────────────────────────────────────────────┤
│ Código │ Nombre       │ Descripción │ Estado │ Acciones│ ← #0F172A
├─────────────────────────────────────────────────────────┤
│ ING-SIS│ Ingeniería...│ Carrera...  │ Activa │ ✏️ 🗑️  │
│ ING-IND│ Ingeniería...│ Formación...│ Activa │ ✏️ 🗑️  │
└─────────────────────────────────────────────────────────┘
```

---

## 📝 Modal de Creación

```
┌──────────────────────────────┐
│ Nueva Carrera           [X]  │
├──────────────────────────────┤
│                              │
│ Nombre de la Carrera *       │
│ ┌──────────────────────────┐ │
│ │ Ingeniería en Sistemas   │ │ ← border: #64748B
│ └──────────────────────────┘ │   focus: #06B6D4
│                              │
│ Código *                     │
│ ┌──────────────────────────┐ │
│ │ ING-SIS                  │ │
│ └──────────────────────────┘ │
│                              │
│ Descripción                  │
│ ┌──────────────────────────┐ │
│ │                          │ │
│ │ (textarea...)            │ │
│ └──────────────────────────┘ │
│                              │
│ [Crear Carrera] [Cancelar]  │
└──────────────────────────────┘
   ↑ #06B6D4
```

---

## 🚀 Cómo Usar

### Ver el Módulo
```
http://localhost:3000/dashboard/carreras
```

### Crear Carrera
1. Click en "Nueva Carrera"
2. Completa el formulario
3. Click en "Crear Carrera"

### Editar Carrera
1. Click en el ícono de editar (✏️)
2. Modifica los campos
3. Click en "Actualizar Carrera"

### Buscar Carrera
1. Escribe en el buscador
2. Los resultados se filtran automáticamente

### Eliminar Carrera
1. Click en el ícono de eliminar (🗑️)
2. Confirma la eliminación
3. La carrera se marca como inactiva

---

## 🎯 Especificaciones Técnicas

### Tabla
```tsx
// Encabezados en Midnight Blue
<thead className="bg-dark">
  <th className="text-white font-bold">Código</th>
</thead>

// Rows con hover
<tr className="hover:bg-light transition-colors">
```

### Inputs
```tsx
// Input con estilo PulseTec
<input
  type="text"
  className="input-field"  // border-gray → focus:border-primary
  placeholder="..."
/>
```

### Botones
```tsx
// Botón primary
<button className="btn-primary">
  Crear Carrera
</button>

// Botón de acción (editar)
<button className="p-2 hover:bg-primary/10 text-primary">
  <Edit className="w-4 h-4" />
</button>
```

---

## 📊 Validaciones

### Código Único
- El código debe ser único por universidad
- No se puede modificar después de crear
- Se convierte automáticamente a mayúsculas

### Campos Requeridos
- **Nombre**: Obligatorio
- **Código**: Obligatorio, único
- **Descripción**: Opcional

---

## 🔐 Seguridad Multi-Tenant

Todas las consultas están filtradas por `university_id`:

```typescript
const universityId = await getCurrentUniversityId();

const careers = await prisma.course.findMany({
  where: {
    universityId,  // 🔒 Filtrado automático
  },
});
```

Esto garantiza que:
- ✅ Cada universidad ve solo sus carreras
- ✅ No hay acceso cruzado entre universidades
- ✅ Aislamiento completo de datos

---

## 🎨 Personalización

### Cambiar Colores
Si necesitas ajustar colores, edita `tailwind.config.ts`:

```typescript
colors: {
  primary: '#06B6D4',  // Botones
  dark: '#0F172A',     // Encabezados
  gray: '#64748B',     // Bordes
}
```

### Agregar Campos
Para agregar más campos al formulario:

1. Agrega el campo en el formulario (`page.tsx`)
2. Actualiza el type en `actions.ts`
3. Modifica las funciones de crear/actualizar

---

## 📱 Responsive Design

### Mobile (< 640px)
- Tabla con scroll horizontal
- Columnas de descripción ocultas
- Botones en stack vertical

### Tablet (640px - 1024px)
- 2 columnas visibles
- Botones en horizontal

### Desktop (> 1024px)
- Todas las columnas visibles
- Vista completa

---

## ✅ Checklist de Funcionalidades

- [x] Listar todas las carreras
- [x] Crear nueva carrera
- [x] Editar carrera existente
- [x] Eliminar carrera (soft delete)
- [x] Buscar carreras
- [x] Validar código único
- [x] Filtrado por universidad
- [x] Modal con animaciones
- [x] Inputs con estilo PulseTec
- [x] Tabla con encabezados #0F172A
- [x] Botones en #06B6D4
- [x] Responsive en todos los dispositivos
- [x] Mensajes de éxito/error
- [x] Loading states

---

## 🔄 Actualizado en Sidebar

El enlace en el sidebar ahora apunta a "Carreras" en lugar de "Cursos":

```tsx
{
  title: 'Carreras',
  icon: BookOpen,
  href: '/dashboard/carreras',
}
```

---

## 🎉 ¡Listo para Usar!

El módulo está completamente funcional y sigue todos los estándares de diseño PulseTec Control.

**Accede a**: `http://localhost:3000/dashboard/carreras`

---

## 📚 Próximas Mejoras Sugeridas

1. **Asignación de Coordinador**: Seleccionar docente responsable
2. **Grupos por Carrera**: Mostrar cantidad de grupos
3. **Estudiantes Inscritos**: Contador de estudiantes
4. **Exportar a Excel**: Descarga de listado
5. **Importar desde CSV**: Carga masiva
6. **Filtros Avanzados**: Por estado, fecha, etc.
7. **Paginación**: Para muchas carreras
8. **Ordenamiento**: Por columnas

---

**Versión**: 1.0.0  
**Fecha**: Enero 2026  
**Estilo**: PulseTec Control  
**Estado**: ✅ Completado


