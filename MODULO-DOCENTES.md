# 👨‍🏫 Módulo de Docentes - PulseTec Control

## ✅ Implementación Completa

Módulo profesional de gestión de docentes con relaciones muchos-a-muchos para Carreras y Materias.

---

## 🎯 Características Implementadas

### ✅ 1. Base de Datos Actualizada
- **Nuevas tablas**: Subject, TeacherCareer, TeacherSubject
- **Relaciones muchos-a-muchos** completamente implementadas
- **Migración** sin pérdida de datos

### ✅ 2. Componente Multi-Select
- Dropdown con checkboxes
- Búsqueda integrada
- Badges visuales
- Estilo PulseTec Control

### ✅ 3. Vista en Cards
- Diseño limpio y profesional
- **Badges de carreras** con código
- **Badges de materias** con límite visual (+N)
- Información de contacto
- Hover effects suaves

### ✅ 4. Formulario Completo
- Asignación múltiple de carreras
- Asignación múltiple de materias
- Validación de email único
- Todos los campos necesarios

---

## 📁 Archivos Creados

### 1. **Schema de Prisma Actualizado**
`prisma/schema.prisma`

**Modelos nuevos:**
- `Subject` - Materias/Asignaturas
- `TeacherCareer` - Relación Docente-Carrera
- `TeacherSubject` - Relación Docente-Materia

**Modificaciones:**
- `Teacher` - Agregado campo `phone` y relaciones

### 2. **Componente Multi-Select**
`components/multi-select.tsx`

**Características:**
- ✅ Dropdown con checkboxes
- ✅ Búsqueda en tiempo real
- ✅ Badges para items seleccionados
- ✅ Eliminar items individualmente
- ✅ Diseño PulseTec (border #64748B → #06B6D4)

### 3. **Server Actions**
`app/dashboard/docentes/actions.ts`

**Funciones:**
- `getTeachers()` - Con carreras y materias
- `createTeacher()` - Con relaciones
- `updateTeacher()` - Actualiza relaciones
- `deleteTeacher()` - Soft delete
- `getAvailableCareers()` - Para el selector
- `getAvailableSubjects()` - Para el selector
- `searchTeachers()` - Búsqueda completa

### 4. **Página Principal**
`app/dashboard/docentes/page.tsx`

**Vista:**
- Grid responsive de cards
- Información completa del docente
- Badges de carreras y materias
- Botones de acción hover
- Modal de formulario

---

## 🎨 Diseño de las Cards

```
┌───────────────────────────────────┐
│ JD  Juan Pérez          [✏️] [🗑️] │ ← Avatar + Nombre
│     Facultad de Ingeniería        │   Hover actions
├───────────────────────────────────┤
│ 📧 juan@universidad.edu           │
│ 📱 +52 123 456 7890               │
├───────────────────────────────────┤
│ 💼 Carreras                        │
│ [ING-SIS] [ING-IND]               │ ← Badges cyan
├───────────────────────────────────┤
│ 🎓 Materias (5)                    │
│ [MAT-101] [FIS-101] [PRO-101] [+2]│ ← Badges purple
├───────────────────────────────────┤
│ Estado: Activo                     │
└───────────────────────────────────┘
```

---

## 📝 Multi-Select en Acción

```
┌─────────────────────────────────────┐
│ Carreras *                          │
├─────────────────────────────────────┤
│ [ING-SIS ×] [ING-IND ×]            │ ← Badges seleccionados
├─────────────────────────────────────┤
│ 2 seleccionados              [▼]   │ ← Trigger
└─────────────────────────────────────┘
        ↓ Click
┌─────────────────────────────────────┐
│ [🔍 Buscar...]                      │
├─────────────────────────────────────┤
│ ☑ Ingeniería en Sistemas            │
│   ING-SIS                           │
├─────────────────────────────────────┤
│ ☑ Ingeniería Industrial             │
│   ING-IND                           │
├─────────────────────────────────────┤
│ ☐ Ingeniería Mecánica               │
│   ING-MEC                           │
└─────────────────────────────────────┘
```

---

## 🚀 Cómo Usar

### 1. Aplicar Migración (IMPORTANTE)

```bash
# Detener servidor
Ctrl + C

# Generar cliente
npx prisma generate

# Aplicar migración
npx prisma db push

# Reiniciar
npm run dev
```

### 2. Acceder al Módulo

```
http://localhost:3000/dashboard/docentes
```

### 3. Crear Docente

1. Click en "Nuevo Docente"
2. Completa información personal
3. Selecciona carreras (multi-select)
4. Selecciona materias (multi-select)
5. Guardar

### 4. Ver Información

Cada card muestra:
- Avatar con iniciales
- Nombre completo
- Departamento
- Email y teléfono
- **Badges de carreras** asignadas
- **Badges de materias** (máximo 3 visibles + contador)
- Estado activo/inactivo

---

## 🎯 Relaciones Implementadas

### Docente → Carreras (Muchos a Muchos)

```typescript
// Un docente puede estar en múltiples carreras
const teacher = await prisma.teacher.create({
  data: {
    // ... datos personales
    teacherCareers: {
      create: [
        { courseId: 'carrera1-id' },
        { courseId: 'carrera2-id' },
      ],
    },
  },
});
```

### Docente → Materias (Muchos a Muchos)

```typescript
// Un docente puede enseñar múltiples materias
const teacher = await prisma.teacher.create({
  data: {
    // ... datos personales
    teacherSubjects: {
      create: [
        { subjectId: 'materia1-id' },
        { subjectId: 'materia2-id' },
        { subjectId: 'materia3-id' },
      ],
    },
  },
});
```

---

## 📊 Estructura de Datos

### Teacher (Docente)
```typescript
{
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  department: string | null;
  phone: string | null;  // 🆕 NUEVO
  isActive: boolean;
  careers: Array<{
    id: string;
    name: string;
    code: string;
  }>;
  subjects: Array<{
    id: string;
    name: string;
    code: string;
  }>;
}
```

### Subject (Materia)
```typescript
{
  id: string;
  universityId: string;
  courseId: string;      // Carrera a la que pertenece
  name: string;
  code: string;
  credits: number;
  semester: number;
  description: string;
  isActive: boolean;
}
```

---

## 🎨 Estilos PulseTec

### Badges de Carreras
```tsx
<span className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium">
  ING-SIS
</span>
```
**Color:** Electric Cyan (#06B6D4)

### Badges de Materias
```tsx
<span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-md text-xs font-medium">
  MAT-101
</span>
```
**Color:** Purple (diferenciación visual)

### Multi-Select
```tsx
// Border default
border: #64748B

// Focus
border: #06B6D4
ring: rgba(6, 182, 212, 0.2)

// Checkboxes marcados
background: #06B6D4
```

---

## 🔐 Validaciones

### Email Único
- El email debe ser único por universidad
- No se puede modificar después de crear

### Carreras Requeridas
- Al menos una carrera debe ser asignada
- Validación en el formulario

### Materias Opcionales
- Las materias son opcionales
- Se pueden asignar después

---

## 📱 Responsive Design

### Mobile (< 768px)
- Cards en 1 columna
- Badges en wrap
- Acciones en hover táctil

### Tablet (768px - 1024px)
- Cards en 2 columnas
- Vista completa

### Desktop (> 1024px)
- Cards en 3 columnas
- Hover effects avanzados
- Botones de acción visibles solo en hover

---

## 🔄 Actualización de Datos

### Editar Docente
Al editar:
1. Se cargan las carreras actuales
2. Se cargan las materias actuales
3. Se pueden modificar ambas
4. Se eliminan relaciones anteriores
5. Se crean nuevas relaciones

```typescript
// Transacción para actualizar relaciones
await prisma.$transaction([
  // 1. Eliminar relaciones existentes
  prisma.teacherCareer.deleteMany({ where: { teacherId: id } }),
  prisma.teacherSubject.deleteMany({ where: { teacherId: id } }),
  
  // 2. Crear nuevas relaciones
  prisma.teacher.update({
    where: { id },
    data: {
      teacherCareers: { create: [...] },
      teacherSubjects: { create: [...] },
    },
  }),
]);
```

---

## 💡 Características Especiales

### 1. **Búsqueda Integrada en Multi-Select**
```tsx
<input
  type="text"
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  placeholder="Buscar..."
/>
```
Filtra opciones en tiempo real

### 2. **Badges Eliminables**
```tsx
<span className="inline-flex items-center gap-1">
  {option.label}
  <button onClick={() => removeOption(value)}>
    <X className="w-3 h-3" />
  </button>
</span>
```
Click en X para remover

### 3. **Contador Visual**
```tsx
{teacher.subjects.slice(0, 3).map(...)}
{teacher.subjects.length > 3 && (
  <span>+{teacher.subjects.length - 3}</span>
)}
```
Muestra máximo 3 materias + contador

### 4. **Hover Actions**
```tsx
<button className="opacity-0 group-hover:opacity-100">
  <Edit />
</button>
```
Botones visibles solo al pasar el mouse

---

## 🆘 Solución de Problemas

### No aparecen carreras en el selector
**Solución:** Crea carreras en `/dashboard/carreras` primero

### No aparecen materias en el selector
**Solución:** Necesitas crear materias (ver MIGRACION-DOCENTES.md)

### Error al guardar relaciones
**Solución:** Ejecuta `npx prisma db push` de nuevo

### Los badges no se muestran
**Solución:** Verifica que el docente tenga carreras/materias asignadas

---

## 📈 Próximas Mejoras

1. **Módulo de Materias**: CRUD completo para materias
2. **Horarios**: Asignar horarios a docentes
3. **Carga Académica**: Ver carga total del docente
4. **Filtros Avanzados**: Por carrera, departamento, etc.
5. **Exportar**: Lista de docentes a Excel
6. **Importar**: Carga masiva desde CSV
7. **Estadísticas**: Gráficos de distribución

---

## ✅ Checklist de Funcionalidades

- [x] Listar docentes con badges
- [x] Crear docente con multi-select
- [x] Editar docente y relaciones
- [x] Eliminar docente (soft delete)
- [x] Buscar docentes
- [x] Asignar múltiples carreras
- [x] Asignar múltiples materias
- [x] Multi-select con búsqueda
- [x] Badges visuales limpios
- [x] Cards estilo PulseTec
- [x] Responsive completo
- [x] Validación de datos
- [x] Filtrado por universidad

---

## 🎉 ¡Listo para Usar!

**Recuerda aplicar la migración primero:**
```bash
npx prisma generate
npx prisma db push
```

**Luego accede a:**
```
http://localhost:3000/dashboard/docentes
```

---

**Versión**: 1.0.0  
**Fecha**: Enero 2026  
**Estilo**: PulseTec Control  
**Estado**: ✅ Completado con Relaciones M:N


