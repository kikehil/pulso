# 👥 Módulo de Grupos - PulseTec Control

## 📋 Descripción General

Módulo completo para la gestión de grupos/clases, asignación de alumnos y organización por carreras, semestres y ciclos escolares.

---

## ✨ Funcionalidades Principales

### 1. **Gestión de Grupos (CRUD)**
- ✅ Crear grupos vinculados a carreras
- ✅ Editar información del grupo
- ✅ Eliminar grupos (soft delete)
- ✅ Búsqueda por nombre, código, semestre o año

### 2. **Asignación de Alumnos**
- ✅ Ver lista de alumnos actuales del grupo
- ✅ Agregar múltiples alumnos a la vez
- ✅ Remover alumnos individualmente
- ✅ Control de capacidad máxima
- ✅ Filtro automático por carrera

### 3. **Visualización Avanzada**
- ✅ Grid de cards responsive
- ✅ Preview de avatares de alumnos
- ✅ Contador de inscritos vs máximo
- ✅ Badge de carrera asignada
- ✅ Información de semestre y ciclo

---

## 📝 Campos de un Grupo

| Campo | Tipo | Descripción | Requerido |
|-------|------|-------------|-----------|
| **Nombre** | String | Nombre descriptivo (ej: "Grupo A") | ✅ Sí |
| **Código** | String | Código único (ej: "1A", "2B") | ✅ Sí |
| **Carrera** | Relación | Carrera a la que pertenece | ✅ Sí |
| **Semestre** | String | Semestre del grupo (ej: "1", "2") | ❌ No |
| **Año Académico** | String | Ciclo escolar (ej: "2026") | ❌ No |
| **Máximo de Alumnos** | Number | Capacidad del grupo | ❌ No |

---

## 🎨 Diseño UI - PulseTec Control

### **Cards de Grupos**
```
┌─────────────────────────────────┐
│ Grupo A                    ✏️ 🗑️ │
│ 1A                              │
│                                 │
│ [Badge: Ingeniería en Sistemas] │
│                                 │
│ 📅 Semestre 1                   │
│ 📅 Ciclo 2026                   │
│ 👥 25 alumnos / 30 máx          │
│                                 │
│ [Avatares: 👤 👤 👤 +22]         │
│                                 │
│ [➕ Gestionar Alumnos]          │
└─────────────────────────────────┘
```

### **Colores y Estilos**
- **Cards**: Fondo blanco (#FFFFFF), sombra suave (shadow-sm)
- **Badges**: Midnight Blue (#0F172A) con texto blanco
- **Botones de acción**: Electric Cyan (#06B6D4)
- **Hover**: Transición suave a Dark (#0F172A)
- **Inputs**: Border #64748B → #06B6D4 en focus

---

## 🔄 Flujo de Uso

### **1. Crear un Grupo**
```
Usuario → Click "Nuevo Grupo"
  ↓
Modal → Llenar formulario:
  - Nombre: "Grupo A"
  - Código: "1A"
  - Carrera: Seleccionar
  - Semestre: "1"
  - Año: "2026"
  - Máximo: 30
  ↓
Click "Crear Grupo"
  ↓
✓ Grupo creado y visible en el grid
```

### **2. Asignar Alumnos**
```
Usuario → Click "Gestionar Alumnos" en card
  ↓
Modal → Ver alumnos actuales
  ↓
Multi-select → Seleccionar nuevos alumnos
  ↓
Click "Agregar Seleccionados"
  ↓
✓ Alumnos asignados al grupo
```

### **3. Remover Alumno**
```
Usuario → Click "Gestionar Alumnos"
  ↓
Lista de alumnos actuales
  ↓
Click 🗑️ junto al alumno
  ↓
Confirmar
  ↓
✓ Alumno removido del grupo
```

---

## 📊 Estructura de Datos

### **Modelo Group (Prisma)**
```prisma
model Group {
  id           String   @id @default(cuid())
  universityId String
  courseId     String
  name         String
  code         String
  semester     String?
  academicYear String?
  maxStudents  Int?
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  university  University   @relation(...)
  course      Course       @relation(...)
  enrollments Enrollment[]

  @@unique([code, universityId])
  @@map("groups")
}
```

### **Modelo Enrollment (Relación Alumno-Grupo)**
```prisma
model Enrollment {
  id             String   @id @default(cuid())
  universityId   String
  studentId      String
  groupId        String
  courseId       String
  enrollmentDate DateTime

  student    Student    @relation(...)
  group      Group      @relation(...)
  course     Course     @relation(...)

  @@unique([studentId, groupId])
  @@map("enrollments")
}
```

---

## 🎯 Casos de Uso

### **Caso 1: Organizar Primer Semestre**
```
Carrera: Ingeniería en Sistemas
Grupos:
  - 1A (30 alumnos) - Turno matutino
  - 1B (28 alumnos) - Turno matutino
  - 1C (25 alumnos) - Turno vespertino
```

### **Caso 2: Control de Capacidad**
```
Grupo 2A:
- Máximo: 30 alumnos
- Actual: 28 alumnos
- Estado: ✓ Disponible (2 lugares)

Grupo 2B:
- Máximo: 30 alumnos
- Actual: 30 alumnos
- Estado: ⚠️ Lleno
```

### **Caso 3: Organización por Ciclo**
```
Ciclo Escolar 2026-A:
  - 1A, 1B, 1C (Primer semestre)
  - 2A, 2B (Segundo semestre)
  - 3A (Tercer semestre)

Ciclo Escolar 2026-B:
  - 1A, 1B (Primer semestre)
  - 2A, 2B, 2C (Segundo semestre)
```

---

## 🚀 Funciones Server Actions

### **Principales**

#### `getGroups()`
Obtiene todos los grupos con sus alumnos y estadísticas.

#### `createGroup(data)`
Crea un nuevo grupo vinculado a una carrera.

#### `updateGroup(id, data)`
Actualiza la información de un grupo existente.

#### `deleteGroup(id)`
Elimina un grupo (soft delete).

#### `assignStudentsToGroup(groupId, studentIds[])`
Asigna múltiples alumnos a un grupo.

#### `removeStudentFromGroup(groupId, studentId)`
Remueve un alumno específico del grupo.

#### `getGroupStudents(groupId)`
Obtiene la lista de alumnos de un grupo.

#### `getAvailableStudents(courseId)`
Obtiene alumnos disponibles para asignar (filtrado por carrera).

---

## 🎨 Componentes UI

### **1. Grid de Cards**
- Diseño responsive (1 col mobile, 2 tablet, 3 desktop)
- Hover effect con sombra
- Información completa del grupo

### **2. Modal de Creación/Edición**
- Formulario con validación
- Selectors de carrera
- Inputs estilo PulseTec
- Botones primarios y secundarios

### **3. Modal de Gestión de Alumnos**
- Lista de alumnos actuales (con remover)
- Multi-select para agregar nuevos
- Contador de seleccionados
- Preview de avatares

### **4. Search Bar**
- Input con icono de búsqueda
- Búsqueda por nombre, código, semestre, año
- Enter para buscar

---

## 📱 Responsive Design

### **Desktop (lg+)**
- Grid 3 columnas
- Modales centrados 600px
- Sidebar visible

### **Tablet (md)**
- Grid 2 columnas
- Modales 90% ancho

### **Mobile (sm)**
- Grid 1 columna
- Modales fullscreen
- Sidebar colapsado

---

## ⚡ Características Avanzadas

### **1. Control de Capacidad**
```typescript
if (group.maxStudents && group._count.enrollments >= group.maxStudents) {
  // Mostrar estado "Lleno"
  // Deshabilitar botón de agregar
}
```

### **2. Preview de Alumnos**
Muestra hasta 3 avatares en la card:
```jsx
<div className="flex -space-x-2">
  {/* Primeros 3 alumnos */}
</div>
<span>+{remaining} más</span>
```

### **3. Badges Dinámicos**
```jsx
<span className="badge badge-dark">
  <BookOpen /> {group.course.name}
</span>
```

### **4. Validación de Duplicados**
El esquema Prisma previene:
- ✅ Mismo código por universidad
- ✅ Mismo alumno en el mismo grupo

---

## 🔐 Seguridad y Permisos

### **Nivel de Acceso**
- **ADMIN**: Acceso completo a gestión de grupos
- **DOCENTE**: Solo visualización (según lo asignado)
- **ALUMNO**: No tiene acceso a este módulo

### **Validaciones**
- ✅ Verificar `universityId` en todas las queries
- ✅ Soft delete (no eliminar permanentemente)
- ✅ Validar capacidad antes de asignar
- ✅ Prevenir duplicados en enrollments

---

## 📁 Estructura de Archivos

```
app/dashboard/grupos/
├── page.tsx              # Interfaz principal
└── actions.ts            # Server actions

components/
├── modal.tsx             # Usado para modales
└── multi-select.tsx      # Selector múltiple de alumnos
```

---

## 🐛 Troubleshooting

### **Problema: No se muestran grupos**
```bash
# Verificar que existen grupos en la BD
npx prisma studio
# Navegar a: http://localhost:5555 → groups
```

### **Problema: Error al asignar alumnos**
```typescript
// Verificar que los alumnos pertenecen a la carrera del grupo
// Solo se pueden asignar alumnos de la misma carrera
```

### **Problema: No aparecen alumnos disponibles**
```sql
-- Verificar que hay alumnos con courseId
SELECT * FROM students WHERE courseId = '...';
```

---

## 🎓 Buenas Prácticas

### **Nomenclatura de Grupos**
```
✅ Bueno:
- "1A", "1B", "2A" (código por semestre)
- "Grupo Matutino A"
- "ING-2026-1A"

❌ Evitar:
- Nombres muy largos
- Códigos sin estructura
- Duplicados sin identificador
```

### **Organización Recomendada**
```
Carrera: Ingeniería en Sistemas
  Semestre 1:
    - 1A (Turno matutino)
    - 1B (Turno vespertino)
  Semestre 2:
    - 2A (Turno matutino)
    - 2B (Turno vespertino)
```

---

## 🔄 Próximas Mejoras

- [ ] Asignar docente titular al grupo
- [ ] Horarios por grupo
- [ ] Historial de cambios
- [ ] Exportar lista de alumnos (PDF/Excel)
- [ ] Clonar grupos entre ciclos
- [ ] Estadísticas por grupo
- [ ] Integración con asistencias

---

## 📞 Soporte

Para dudas sobre el módulo de Grupos:
- Verifica que la carrera existe antes de crear grupos
- Los alumnos deben tener `courseId` para aparecer en el selector
- El campo `code` debe ser único por universidad

---

**Módulo de Grupos PulseTec Control - 2026** 👥


