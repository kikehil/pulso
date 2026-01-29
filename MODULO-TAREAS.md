# 📝 Módulo de Tareas - PulseTec Control

## ✅ Implementación Completa

Módulo profesional de gestión de tareas con lógica de permisos, indicadores de fecha y diseño en grid de cards.

---

## 🎯 Características Implementadas

### ✅ 1. Lógica y Base de Datos
- **Relación con Materia**: Cada tarea está vinculada a una materia específica
- **Campos completos**: Título, Descripción (Textarea), Fecha de Vencimiento, Materia ID
- **Reglas de Visibilidad**:
  - ✅ Docentes solo pueden crear tareas para materias asignadas
  - ✅ Alumnos solo ven tareas de sus materias inscritas
  - ✅ Solo el docente creador puede editar/eliminar

### ✅ 2. Interfaz de Creación (Modal)
- **Selector de Materia**: Dropdown que lista solo materias del docente
- **Inputs PulseTec**: Border #64748B → #06B6D4 en focus
- **DatePicker**: Limpio con icono de calendario
- **Botón Guardar**: Color #06B6D4, hover #0F172A
- **Textarea**: Para descripción con altura ajustable

### ✅ 3. Vista de Tablero (Grid de Cards)
- **Diseño Grid**: Responsive (1-2-3 columnas)
- **Estilo Card**: Fondo blanco, shadow-sm, rounded-xl
- **Encabezado**: Materia en gris (#64748B) + Título en Bold (#0F172A)
- **Indicador de Fecha**:
  - ✅ Icono de calendario
  - ✅ Texto rojo si < 24h
  - ✅ Badge "Urgente" si próxima a vencer
  - ✅ Badge "Vencida" si ya pasó
- **Acciones**: Botones sutiles visibles solo en hover (docente creador)

---

## 📁 Archivos Creados

### 1. **Componente DatePicker**
`components/date-picker.tsx`

**Características:**
- ✅ Input nativo datetime-local
- ✅ Icono de calendario
- ✅ Validación de fecha mínima
- ✅ Estilo PulseTec completo

### 2. **Server Actions**
`app/dashboard/tareas/actions.ts`

**Funciones:**
- `getAssignments()` - Filtradas por rol (docente/alumno)
- `createAssignment()` - Con validación de permisos
- `updateAssignment()` - Solo docente creador
- `deleteAssignment()` - Solo docente creador
- `getTeacherSubjects()` - Materias del docente
- `searchAssignments()` - Búsqueda con filtros de rol

### 3. **Página Principal**
`app/dashboard/tareas/page.tsx`

**Vista:**
- Grid responsive de cards
- Modal de formulario
- Indicadores visuales de fecha
- Permisos según rol
- Búsqueda en tiempo real

---

## 🗄️ Cambios en Base de Datos

### Modelo Assignment Actualizado

```prisma
model Assignment {
  id          String   @id @default(cuid())
  universityId String
  subjectId   String   // 🆕 Relacionado con Materia
  teacherId   String   // 🆕 Docente creador
  title       String
  description String?
  dueDate     DateTime
  maxScore    Int      @default(100)
  isActive    Boolean  @default(true)
  
  // Relaciones
  subject     Subject   // 🆕 Relación con materia
  teacher     Teacher   // 🆕 Relación con docente
  submissions Submission[]
}
```

**Cambios clave:**
- ❌ Eliminado: `courseId` (era carrera)
- ✅ Agregado: `subjectId` (ahora es materia)
- ✅ Agregado: `teacherId` (docente creador)

---

## 🎨 Diseño de las Cards

```
┌────────────────────────────────────────────┐
│ [Badge Urgente]                            │ ← Si < 24h
│                                            │
│ AED-101 - Algoritmos y Estructuras        │ ← Materia (gris)
│                                            │
│ Tarea 1 - Implementar Quicksort           │ ← Título (Bold)
│                                            │
│ Implementar el algoritmo Quicksort        │ ← Descripción
│ en Python y analizar su complejidad...    │   (truncada)
│                                            │
│ 📅 Vence: 28 ene 2026, 23:59             │ ← Fecha (rojo si urgente)
│                                            │
├────────────────────────────────────────────┤
│ 🕐 3 entregas              [✏️] [🗑️]      │ ← Contador + Acciones
└────────────────────────────────────────────┘
```

### Estados de Fecha

**Normal (> 24h)**
```
📅 Vence: 30 ene 2026, 18:00
Color: #64748B (Gray)
```

**Urgente (< 24h)**
```
📅 Próxima a vencer: 28 ene 2026, 23:59
Color: #EF4444 (Red-500)
Badge: "Urgente" (bg-red-100, text-red-700)
```

**Vencida**
```
📅 Vencida: 25 ene 2026, 12:00
Color: #DC2626 (Red-600)
Badge: "Vencida" (bg-red-600, text-white)
```

---

## 🔐 Lógica de Permisos

### Docente

**Puede:**
- ✅ Ver solo SUS tareas creadas
- ✅ Crear tareas para materias asignadas a él
- ✅ Editar sus propias tareas
- ✅ Eliminar sus propias tareas

**No puede:**
- ❌ Ver tareas de otros docentes
- ❌ Crear tareas para materias no asignadas
- ❌ Editar/eliminar tareas de otros

**Validación:**
```typescript
// Al crear
const teacherSubject = await prisma.teacherSubject.findUnique({
  where: {
    teacherId_subjectId: {
      teacherId: data.teacherId,
      subjectId: data.subjectId,
    },
  },
});

if (!teacherSubject) {
  throw new Error('No tienes permiso para crear tareas en esta materia');
}
```

### Alumno

**Puede:**
- ✅ Ver tareas de sus materias inscritas
- ✅ Entregar tareas (futuro)

**No puede:**
- ❌ Crear tareas
- ❌ Editar tareas
- ❌ Eliminar tareas
- ❌ Ver tareas de materias no inscritas

**Filtrado:**
```typescript
// Obtener materias del alumno
const studentSubjects = await prisma.studentSubject.findMany({
  where: { studentId: userId },
});

// Filtrar tareas
const assignments = await prisma.assignment.findMany({
  where: {
    subjectId: { in: subjectIds },
  },
});
```

---

## 💡 Funcionalidades Especiales

### 1. **Selector de Materia Filtrado**

Solo muestra materias asignadas al docente:

```typescript
const getTeacherSubjects = async (teacherId: string) => {
  const teacherSubjects = await prisma.teacherSubject.findMany({
    where: { teacherId },
    include: {
      subject: {
        include: {
          course: true, // Para mostrar carrera
        },
      },
    },
  });
  
  return teacherSubjects.map(ts => ({
    id: ts.subject.id,
    name: ts.subject.name,
    code: ts.subject.code,
    courseName: ts.subject.course.name,
  }));
};
```

### 2. **Indicador Visual de Urgencia**

```typescript
const isDateUrgent = (dueDate: Date) => {
  const now = new Date();
  const due = new Date(dueDate);
  const diffHours = (due.getTime() - now.getTime()) / (1000 * 60 * 60);
  return diffHours > 0 && diffHours < 24;
};

const isDateOverdue = (dueDate: Date) => {
  return new Date(dueDate) < new Date();
};
```

### 3. **Acciones Visibles en Hover**

```tsx
<div className="opacity-0 group-hover:opacity-100 transition-opacity">
  <button onClick={() => handleEdit(assignment)}>
    <Edit className="w-4 h-4" />
  </button>
  <button onClick={() => handleDelete(assignment.id)}>
    <Trash2 className="w-4 h-4" />
  </button>
</div>
```

### 4. **DatePicker Nativo Mejorado**

```tsx
<input
  type="datetime-local"
  min={today}  // No permite fechas pasadas
  className="input-field"
/>
```

---

## 🎯 Flujo de Uso

### Docente: Crear Tarea

1. Click "Nueva Tarea"
2. **Seleccionar materia** (dropdown filtrado)
3. **Escribir título** (requerido)
4. **Escribir descripción** (opcional, textarea)
5. **Seleccionar fecha** (DatePicker, mínimo hoy)
6. Click "Crear Tarea"
7. Modal se cierra automáticamente
8. Card aparece en el grid

### Docente: Editar Tarea

1. Hover sobre card
2. Click botón Editar (✏️)
3. Modal se abre con datos pre-cargados
4. Modificar lo necesario
5. Click "Actualizar Tarea"
6. Card se actualiza

### Alumno: Ver Tareas

1. Accede a `/dashboard/tareas`
2. Ve solo tareas de sus materias
3. Puede ver:
   - Título y descripción
   - Fecha de vencimiento
   - Estado (urgente/vencida)
   - Número de entregas
4. **No ve** botones de editar/eliminar

---

## 📊 Estructura de Datos

### Assignment Completo

```typescript
{
  id: "cuid",
  title: "Tarea 1 - Quicksort",
  description: "Implementar algoritmo...",
  dueDate: "2026-01-30T18:00:00Z",
  subject: {
    id: "cuid",
    name: "Algoritmos y Estructuras de Datos",
    code: "AED-101",
    course: {
      name: "Ingeniería en Sistemas",
      code: "ING-SIS"
    }
  },
  teacher: {
    id: "cuid",
    firstName: "María",
    lastName: "González"
  },
  _count: {
    submissions: 15  // Entregas recibidas
  }
}
```

---

## 🎨 Colores PulseTec Aplicados

### Cards
```css
background: #FFFFFF (White)
box-shadow: 0 1px 3px rgba(0,0,0,0.1)
border-radius: 1rem (16px)
padding: 1.5rem (24px)
```

### Encabezado Card
```css
/* Materia */
color: #64748B (Gray)
font-size: 0.75rem (12px)
font-weight: 500 (Medium)

/* Título */
color: #0F172A (Dark)
font-size: 1.125rem (18px)
font-weight: 700 (Bold)
```

### Indicador de Fecha
```css
/* Normal */
color: #64748B (Gray)

/* Urgente */
color: #EF4444 (Red-500)

/* Vencida */
color: #DC2626 (Red-600)
```

### Botones
```css
/* Botón Crear */
background: #06B6D4 (Primary)
hover: #0F172A (Dark)

/* Botón Editar */
color: #06B6D4 (Primary)
hover-bg: rgba(6,182,212,0.1)

/* Botón Eliminar */
color: #EF4444 (Red-500)
hover-bg: #FEE2E2 (Red-50)
```

### Badges
```css
/* Badge Urgente */
background: #FEE2E2 (Red-100)
color: #B91C1C (Red-700)

/* Badge Vencida */
background: #DC2626 (Red-600)
color: #FFFFFF (White)
```

---

## 📱 Responsive Design

### Desktop (> 1024px)
```
Grid: 3 columnas
Gap: 1.5rem
Cards: Ancho completo
Hover: Acciones visibles
```

### Tablet (768px - 1024px)
```
Grid: 2 columnas
Gap: 1.5rem
Cards: Ancho completo
```

### Mobile (< 768px)
```
Grid: 1 columna
Gap: 1rem
Cards: Ancho completo
Acciones: Siempre visibles
```

---

## 🔄 Comparación: Antes vs Ahora

| Característica | Antes | Ahora |
|---------------|-------|-------|
| Relación | Carrera (Course) | Materia (Subject) ✅ |
| Creador | No especificado | Docente (Teacher) ✅ |
| Permisos | No implementados | Por rol completo ✅ |
| Vista | Lista/Tabla | Grid de Cards ✅ |
| Fecha | Simple | Con indicadores visuales ✅ |
| Acciones | Siempre visibles | Hover (docente) ✅ |

---

## ✅ Checklist de Funcionalidades

### Base de Datos
- [x] Modelo Assignment actualizado
- [x] Relación con Subject
- [x] Relación con Teacher
- [x] Índices optimizados

### Lógica de Negocio
- [x] Docentes solo ven sus tareas
- [x] Alumnos ven tareas de sus materias
- [x] Validación de permisos al crear
- [x] Validación de permisos al editar
- [x] Validación de permisos al eliminar

### Interfaz
- [x] Grid responsive de cards
- [x] Modal de formulario
- [x] DatePicker limpio
- [x] Selector de materia filtrado
- [x] Textarea para descripción
- [x] Inputs estilo PulseTec

### Indicadores Visuales
- [x] Fecha normal (gris)
- [x] Fecha urgente (rojo)
- [x] Badge "Urgente"
- [x] Badge "Vencida"
- [x] Contador de entregas
- [x] Acciones en hover

### Funcionalidades
- [x] Crear tarea
- [x] Editar tarea
- [x] Eliminar tarea (soft delete)
- [x] Buscar tareas
- [x] Filtrado por rol
- [x] Modal se cierra automáticamente

---

## 🆘 Solución de Problemas

### No aparecen materias en el dropdown
**Causa:** El docente no tiene materias asignadas  
**Solución:** Ve a `/dashboard/docentes` y asigna materias al docente

### Error "No tienes permiso..."
**Causa:** Intentando crear tarea para materia no asignada  
**Solución:** Solo puedes crear tareas para tus materias

### No puedo editar una tarea
**Causa:** Solo el docente creador puede editar  
**Solución:** Verifica que seas el creador de la tarea

### Los alumnos no ven tareas
**Causa:** No están inscritos en materias  
**Solución:** Ve a `/dashboard/alumnos` y asigna materias

---

## 📈 Próximas Mejoras

1. **Sistema de Entregas**: Módulo completo de submissions
2. **Calificaciones**: Calificar entregas con feedback
3. **Archivos Adjuntos**: Subir archivos en tareas
4. **Notificaciones**: Alertas de tareas próximas
5. **Calendario**: Vista de calendario con tareas
6. **Estadísticas**: Gráficos de entregas
7. **Comentarios**: Sistema de comentarios en tareas
8. **Plantillas**: Plantillas de tareas reutilizables

---

## 🎉 ¡Listo para Usar!

### Migración Aplicada ✅
```bash
npx prisma generate
npx prisma db push
```

### Acceder al Módulo
```
http://localhost:3000/dashboard/tareas
```

### Probar como Docente
1. Asegúrate de tener materias asignadas
2. Click "Nueva Tarea"
3. Selecciona materia
4. Completa formulario
5. Guardar

### Probar como Alumno
1. Asegúrate de estar inscrito en materias
2. Ve a `/dashboard/tareas`
3. Visualiza tareas disponibles
4. No verás botones de editar/eliminar

---

**Versión**: 1.0.0  
**Fecha**: Enero 2026  
**Estilo**: PulseTec Control  
**Estado**: ✅ Completado con Permisos y Lógica de Negocio


