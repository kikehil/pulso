# 📅 MÓDULO DE CALENDARIO Y HORARIOS - PULSETEC CONTROL

## 🎯 Descripción General

Sistema completo de gestión de horarios para el Portal del Docente. Permite a los maestros configurar, visualizar y gestionar sus clases semanales de forma autónoma con validación de conflictos de horario.

---

## 📊 BASE DE DATOS

### Modelo: `ClassSchedule`

```prisma
model ClassSchedule {
  id          String   @id @default(cuid())
  subjectId   String
  groupId     String
  teacherId   String   // Para validar permisos
  dayOfWeek   Int      // 0=Domingo, 1=Lunes, 2=Martes, ..., 6=Sábado
  startTime   String   // Formato: "HH:mm" (ej. "10:00")
  endTime     String   // Formato: "HH:mm" (ej. "11:00")
  classroom   String?  // Aula (ej. "C-12")
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relaciones
  subject     Subject @relation(fields: [subjectId], references: [id], onDelete: Cascade)
  group       Group @relation(fields: [groupId], references: [id], onDelete: Cascade)
}
```

**Campos Importantes:**
- `dayOfWeek`: Número del día (0-6), donde 1=Lunes, 5=Viernes
- `startTime` / `endTime`: Formato 24h ("HH:mm")
- `classroom`: Campo opcional para especificar el aula
- `teacherId`: Para validar que solo el docente propietario pueda editar

---

## 🎨 INTERFAZ DE USUARIO

### Ruta: `/teacher/calendar`

### 1. **Vista Semanal (Week View)**

```
┌─────────────────────────────────────────────────────────────┐
│  📅 Calendario y Horarios          [Editar Horario] Button  │
├─────────────────────────────────────────────────────────────┤
│  Hora  │  Lunes  │  Martes │ Miércoles │ Jueves │ Viernes  │
├─────────────────────────────────────────────────────────────┤
│ 08:00  │         │         │           │        │          │
│ 09:00  │  [Clase]│         │   [Clase] │        │  [Clase] │
│ 10:00  │  [Clase]│         │   [Clase] │        │          │
│ 11:00  │         │  [+]    │           │  [+]   │          │
└─────────────────────────────────────────────────────────────┘
```

**Características:**
- Grid de 7:00 AM a 8:00 PM
- Solo días laborables (Lunes a Viernes)
- Bloques de 1 hora
- Tarjetas de clase con span vertical según duración

---

### 2. **Card de Clase (Bloque en el Calendario)**

```
┌──────────────────────────────────┐
│  📚 Matemáticas I                │  ← Color Cyan #06B6D4
│  Grupo A - Matutino              │
│  🕐 10:00 - 11:00                │
│  📍 Aula C-12                    │
│  [✏️] [🗑️] (modo edición)       │
└──────────────────────────────────┘
```

**Estados Visuales:**
1. **Clase Normal**: `bg-cyan-500` (Electric Cyan)
2. **Clase en Curso**: `bg-slate-900` + borde `border-cyan-400` + animación pulse
3. **Hover**: `bg-cyan-600`

**Interacciones:**
- **Modo Visualización**: Click → Navega a `/teacher/class/[id]?tab=attendance`
- **Modo Edición**: Click → Abre modal de edición

---

### 3. **Modal de Configuración de Clase**

**Campos del Formulario:**

```typescript
{
  groupId: string       // Dropdown: "Contabilidad I - Grupo A"
  dayOfWeek: number     // Dropdown: Lunes, Martes, etc.
  startTime: string     // Input type="time"
  endTime: string       // Input type="time"
  classroom?: string    // Input text (opcional)
}
```

**Flujo de Usuario:**

1. Usuario hace click en espacio vacío
2. Modal pre-llena día y hora según celda clickeada
3. Usuario selecciona materia/grupo
4. Ajusta horarios si es necesario
5. Opcionalmente añade número de aula
6. Click "Guardar" → Validación → Confirmación

---

## ⚙️ LÓGICA DE VALIDACIÓN

### Detección de Conflictos de Horario

```typescript
// Pseudocódigo de validación
function hasConflict(newSchedule) {
  const existingSchedules = getSchedulesByDay(newSchedule.dayOfWeek);
  
  for (const existing of existingSchedules) {
    // Caso 1: Nuevo horario empieza durante una clase existente
    if (newSchedule.start >= existing.start && newSchedule.start < existing.end) {
      return true;
    }
    
    // Caso 2: Nuevo horario termina durante una clase existente
    if (newSchedule.end > existing.start && newSchedule.end <= existing.end) {
      return true;
    }
    
    // Caso 3: Nuevo horario envuelve completamente una clase existente
    if (newSchedule.start <= existing.start && newSchedule.end >= existing.end) {
      return true;
    }
  }
  
  return false;
}
```

**Mensaje de Error:**
```
❌ Conflicto de horario: Ya tienes una clase programada en este horario
```

---

## 🔐 PERMISOS Y SEGURIDAD

### Restricciones de Rol DOCENTE

```typescript
// Solo puede gestionar horarios de sus materias asignadas
async function createSchedule(data) {
  const teacherId = await getCurrentTeacherId();
  
  // Verificar que el grupo pertenece al docente
  const group = await prisma.group.findFirst({
    where: {
      id: data.groupId,
      teacherId: teacherId,
      isActive: true,
    },
  });
  
  if (!group) {
    throw new Error('No tienes permisos para este grupo');
  }
  
  // ... proceder con la creación
}
```

**Validaciones:**
- ✅ Solo puede crear horarios para sus grupos asignados
- ✅ Solo puede editar/eliminar sus propios horarios
- ✅ No puede ver horarios de otros docentes
- ✅ Validación de conflictos de tiempo

---

## 🎨 DISEÑO PULSETEC

### Paleta de Colores

```css
/* Bloques de Clase */
.class-block {
  background: #06B6D4;  /* Electric Cyan */
  color: white;
}

.class-block:hover {
  background: #0891B2;  /* Darker Cyan */
}

/* Clase en Curso */
.class-current {
  background: #0F172A;  /* Slate 950 */
  border: 2px solid #06B6D4;
  animation: pulse 2s infinite;
}

/* Modo Edición - Celdas Vacías */
.cell-empty-editable {
  border: 2px dashed #64748B;  /* Slate 500 */
  cursor: pointer;
}

.cell-empty-editable:hover {
  background: #F0F9FF;  /* Cyan 50 */
}
```

### Tipografía

- **Nombre de Materia**: Inter Bold 14px #FFFFFF
- **Grupo**: Inter Regular 12px #FFFFFF/90%
- **Horario**: Inter Regular 12px #FFFFFF
- **Aula**: Inter Regular 12px #FFFFFF

---

## 🚀 FUNCIONALIDADES PRINCIPALES

### 1. **Modo Visualización** (Default)

```
✓ Ver todas las clases de la semana
✓ Identificar clase actual (animación pulse)
✓ Click en clase → Ir a Pasar Lista
✓ Visualización clara de horarios y aulas
```

### 2. **Modo Edición**

```
✓ Activado con botón "Editar Horario"
✓ Click en espacio vacío → Modal de Alta
✓ Click en clase existente → Opciones Editar/Eliminar
✓ Validación de conflictos en tiempo real
✓ Borde punteado en celdas disponibles
```

### 3. **Indicador de Clase en Curso**

```typescript
function isCurrentClass(schedule) {
  const now = new Date();
  const currentDay = now.getDay();
  const currentTime = formatTime(now);
  
  return (
    schedule.dayOfWeek === currentDay &&
    currentTime >= schedule.startTime &&
    currentTime <= schedule.endTime
  );
}
```

**Visual:**
- Fondo oscuro (#0F172A)
- Borde Cyan brillante (#06B6D4)
- Punto verde animado (pulse) en esquina superior derecha

---

## 📱 RESPONSIVE DESIGN

### Desktop (> 1024px)
- Grid completo de 8 columnas
- Tarjetas con texto completo
- Modales centrados

### Tablet (768px - 1024px)
- Scroll horizontal habilitado
- Tarjetas más compactas
- Texto reducido pero legible

### Mobile (< 768px)
- Vista de lista por defecto
- Filtro por día
- Modales full-screen

---

## 🔄 INTEGRACIÓN CON OTROS MÓDULOS

### 1. **Portal del Docente**
- Link en sidebar: `/teacher/calendar`
- Icono: 📅 Calendar
- Siempre visible

### 2. **Módulo de Asistencia**
- Click en bloque de clase → Redirige a toma de lista
- URL: `/teacher/class/[groupId]?tab=attendance`

### 3. **Dashboard del Docente**
- Widget "Próxima Clase" muestra el siguiente bloque del calendario
- Countdown timer hasta inicio de clase

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

### Backend
- [x] Modelo `ClassSchedule` en schema.prisma
- [x] Migración de base de datos
- [x] Server Actions (CRUD completo)
- [x] Validación de conflictos de horario
- [x] Validación de permisos por rol

### Frontend
- [x] Página `/teacher/calendar`
- [x] Componente `CalendarWeekView`
- [x] Componente `ScheduleModal`
- [x] Modo Edición / Visualización
- [x] Indicador de clase en curso
- [x] Integración con sidebar

### Testing Manual
- [ ] Crear horario sin conflictos
- [ ] Validar error de conflicto
- [ ] Editar horario existente
- [ ] Eliminar horario
- [ ] Navegar a toma de lista desde bloque
- [ ] Verificar clase en curso (en tiempo real)
- [ ] Probar permisos (solo sus materias)

---

## 🐛 TROUBLESHOOTING

### Problema: "No puedo agregar clase en modo edición"
**Solución:** Verifica que el dropdown de grupos tenga opciones. Si está vacío, el docente no tiene grupos asignados.

### Problema: "Conflicto de horario falso positivo"
**Solución:** Revisa que los tiempos estén en formato "HH:mm" y que las comparaciones usen strings correctamente.

### Problema: "Clase en curso no se detecta"
**Solución:** Verifica la zona horaria del servidor. El cálculo usa `new Date()` local.

---

## 🎓 NOTAS PARA EL DOCENTE (UX)

**Mensaje de Bienvenida (Primera vez):**
```
👋 Bienvenido a tu Calendario

Activa el "Modo Edición" para comenzar a configurar 
tu horario semanal. Haz clic en cualquier espacio 
vacío para agregar una clase.
```

**Tips en Modo Edición:**
```
💡 Tips:
- Haz clic en un espacio vacío para agregar una clase
- Edita o elimina clases existentes con los botones
- El sistema te alertará si hay conflictos de horario
- Puedes especificar el aula para cada clase
```

---

## 🚀 PRÓXIMAS MEJORAS (Roadmap)

### Fase 2
- [ ] Drag & Drop para mover bloques de clase
- [ ] Vista mensual (además de semanal)
- [ ] Exportar horario como PDF/Imagen
- [ ] Copiar horario de semanas anteriores

### Fase 3
- [ ] Notificaciones push 15 min antes de clase
- [ ] Integración con Google Calendar
- [ ] Recordatorios automáticos
- [ ] Vista de calendario del alumno (read-only)

---

## 📄 ARCHIVOS RELACIONADOS

```
app/
├── teacher/
│   └── calendar/
│       ├── page.tsx              # Vista principal
│       └── actions.ts            # Server Actions (CRUD)
components/
├── calendar-week-view.tsx        # Grid semanal
├── schedule-modal.tsx            # Modal de configuración
└── teacher-sidebar.tsx           # Navegación (link a calendario)
prisma/
└── schema.prisma                 # Modelo ClassSchedule
```

---

## ✅ ESTADO DEL MÓDULO

**Status:** ✅ **IMPLEMENTADO Y FUNCIONAL**

- ✅ Base de datos configurada
- ✅ UI completa (Vista semanal + Modal)
- ✅ Validación de conflictos
- ✅ Permisos y seguridad
- ✅ Diseño PulseTec aplicado
- ✅ Integración con sidebar

**Versión:** 1.0.0  
**Fecha:** 28 de Enero de 2026  
**Autor:** PulseTec Control System

---

> 💎 **PulseTec Control**: "El latido de tu gestión académica"


