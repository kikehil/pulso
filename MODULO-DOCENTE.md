# 👨‍🏫 Portal del Docente - Documentación Completa

## 📋 Descripción General

Sistema completo para la gestión académica del docente, incluyendo Dashboard personalizado, Control de Asistencia y Calificaciones de tareas.

---

## 🎯 Características Implementadas

### 1. **Dashboard del Docente**

#### Vista Principal
- Grid de materias asignadas al docente logueado
- Tarjetas interactivas con información de cada materia
- Botones de acceso rápido: Pasar Lista, Tareas, Ver Alumnos
- Métricas: Total materias, alumnos, tareas pendientes, asistencias hoy

#### Tarjeta de Materia
```
┌─────────────────────────────────────┐
│  [📚] Matemáticas I                 │
│       MAT-101 • Ingeniería          │
│       🗓️ Semestre 1 • 👥 35 alumnos│
│  ┌──────┬──────┬──────┐             │
│  │Lista │Tareas│Alum. │             │
│  └──────┴──────┴──────┘             │
└─────────────────────────────────────┘
```

**Características:**
- ✅ Filtrado automático por ID del docente logueado
- ✅ Solo ve sus materias asignadas
- ✅ Contador de alumnos inscritos por materia
- ✅ Diseño PulseTec con hover effects

---

### 2. **Módulo de Asistencia**

#### Control Diario
Permite registrar la asistencia de los alumnos con tres estados:
- **PRESENTE** (Verde) - ✓
- **RETARDO** (Amarillo) - ⏱️
- **FALTA** (Rojo) - ✗

#### Interfaz
```
┌─────────────────────────────────────────────┐
│  Pasar Lista - Miércoles 28 de enero 2026  │
├─────────────────────────────────────────────┤
│  📊 Total: 35 | Presentes: 32 | Retardos: 2 │
│      Faltas: 1                              │
├─────────────────────────────────────────────┤
│  [👤] Juan Pérez               [✓][⏱️][✗]  │
│       20231234                              │
│  [👤] María García             [✓][⏱️][✗]  │
│       20231235                              │
│  ...                                        │
├─────────────────────────────────────────────┤
│              [💾 Guardar Asistencia (33)]   │
└─────────────────────────────────────────────┘
```

**Características:**
- ✅ Listado de alumnos con foto circular
- ✅ Botones visuales con colores PulseTec
  - Verde (#10B981) para Presente
  - Amarillo (#F59E0B) para Retardo
  - Rojo (#EF4444) para Falta
- ✅ Estadísticas en tiempo real
- ✅ Guardado múltiple (todos a la vez)
- ✅ Actualiza si ya existe registro del día
- ✅ Fecha automática (hoy)

#### Lógica de Base de Datos
```prisma
model Attendance {
  id           String   @id @default(cuid())
  universityId String
  studentId    String
  subjectId    String
  teacherId    String
  date         DateTime @default(now())
  status       String   // PRESENTE, RETARDO, FALTA
  notes        String?
  
  @@unique([studentId, subjectId, date])
}
```

---

### 3. **Módulo de Calificaciones**

#### Calificar Entregas
Permite revisar y calificar las entregas de tareas de los alumnos.

#### Interfaz
```
┌─────────────────────────────────────────────┐
│  Calificar Entregas                         │
│  Tarea 1 - Matemáticas I                   │
├─────────────────────────────────────────────┤
│  📊 Total: 35 | Calificadas: 28 | Pend: 7  │
├─────────────────────────────────────────────┤
│  ┌──────────────────────────────────────┐   │
│  │ [👤] Juan Pérez    [✓ Calificada]   │   │
│  │ Entregado: 25/01/2026                │   │
│  │ "Mi respuesta es..."                 │   │
│  │ 📎 Ver archivo                       │   │
│  │                                      │   │
│  │ Calificación: [95] /100              │   │
│  │ Feedback: [Excelente trabajo...]    │   │
│  │                      [💾 Guardar]    │   │
│  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

**Características:**
- ✅ Lista completa de alumnos (entregaron o no)
- ✅ Estados visuales:
  - **Sin entregar** (Gris) - Sin submission
  - **Por calificar** (Amarillo) - Submission sin score
  - **Calificada** (Verde) - Submission con score
- ✅ Input numérico para calificación (0-maxScore)
- ✅ Campo de retroalimentación (feedback)
- ✅ Visualización del contenido entregado
- ✅ Link a archivos adjuntos
- ✅ Guardado individual por alumno
- ✅ Fecha de calificación automática

#### Submission Model Actualizado
```prisma
model Submission {
  score        Int?
  feedback     String?
  gradedBy     String?  // ID del docente que calificó
  gradedAt     DateTime?
}
```

---

### 4. **Vista de Tareas**

Lista las tareas creadas por el docente para una materia específica.

#### Características:
- ✅ Grid de tareas con información completa
- ✅ Indicadores de fecha:
  - Rojo: Menos de 24 horas
  - Amarillo: Menos de 72 horas
  - Cyan: Más de 72 horas
- ✅ Contador de entregas por tarea
- ✅ Link directo a calificar
- ✅ Botón para crear nueva tarea

---

### 5. **Vista de Alumnos**

Directorio visual de alumnos inscritos en una materia.

#### Características:
- ✅ Grid de cards con foto
- ✅ Información de contacto
- ✅ Matrícula visible
- ✅ Email con mailto: link
- ✅ Solo lectura (sin edición)

---

## 🔒 Seguridad y Permisos

### Reglas Implementadas

1. **Filtrado Automático:**
   ```typescript
   const teacherId = getCurrentTeacherId(); // Del token/sesión
   
   // Solo ve sus materias
   where: { teacherId }
   ```

2. **Restricciones:**
   - ❌ No puede ver materias de otros docentes
   - ❌ No puede editar datos maestros de alumnos
   - ❌ No puede crear carreras ni materias nuevas
   - ✅ Solo gestiona el contenido de sus materias

3. **Scope de Datos:**
   - Materias asignadas via `TeacherSubject`
   - Alumnos inscritos via `StudentSubject`
   - Tareas creadas por él mismo

---

## 📁 Estructura de Archivos

### Backend (Server Actions)
```
app/docente/
├── actions.ts                           # Server actions principales
├── page.tsx                             # Dashboard del docente
├── layout.tsx                           # Layout del portal
├── asistencia/
│   └── [subjectId]/
│       └── page.tsx                     # Control de asistencia
├── tareas/
│   └── [subjectId]/
│       └── page.tsx                     # Lista de tareas
├── calificar/
│   └── [assignmentId]/
│       └── page.tsx                     # Calificar entregas
└── alumnos/
    └── [subjectId]/
        └── page.tsx                     # Directorio de alumnos
```

### Utilidades
```
lib/
└── types.ts                             # Tipos de asistencia
```

### Base de Datos
```
prisma/
└── schema.prisma                        # Modelo Attendance agregado
```

---

## 🎨 Diseño Visual (PulseTec Control)

### Colores por Módulo

| Módulo | Color Principal | Uso |
|--------|----------------|-----|
| Dashboard | #06B6D4 (Cyan) | Tarjetas, iconos |
| Asistencia (Presente) | #10B981 (Verde) | Botón activo |
| Asistencia (Retardo) | #F59E0B (Amarillo) | Botón activo |
| Asistencia (Falta) | #EF4444 (Rojo) | Botón activo |
| Calificaciones (Pendiente) | #F59E0B (Amarillo) | Badge |
| Calificaciones (Calificada) | #10B981 (Verde) | Badge |

### Componentes

- **Cards**: Fondo blanco, `rounded-xl`, `shadow-sm`
- **Botones de Estado**: `rounded-lg`, border 2px cuando activo
- **Avatares**: Circulares 40px-80px según contexto
- **Inputs**: Border #64748B → #06B6D4 focus
- **Badges**: Rounded full, colores según estado

---

## 🚀 Server Actions

### Dashboard
```typescript
getTeacherSubjects()
// Retorna materias asignadas al docente

getTeacherStats()
// Retorna métricas: materias, alumnos, pendientes, asistencias
```

### Asistencia
```typescript
getSubjectStudents(subjectId)
// Retorna alumnos + asistencia de hoy

saveAttendance({ subjectId, studentId, status, notes? })
// Guarda asistencia individual

bulkSaveAttendance({ subjectId, attendances[] })
// Guarda múltiples asistencias
```

### Calificaciones
```typescript
getSubjectAssignments(subjectId)
// Retorna tareas de la materia

getAssignmentSubmissions(assignmentId)
// Retorna alumnos + sus entregas

gradeSubmission({ submissionId?, assignmentId, studentId, score, feedback? })
// Califica una entrega
```

---

## 📊 Flujos de Trabajo

### 1. Pasar Lista

```
Docente entra a portal
↓
Selecciona materia
↓
Clic en "Pasar Lista"
↓
Ve lista de alumnos
↓
Marca estado (Presente/Retardo/Falta)
↓
Clic en "Guardar Asistencia"
↓
Registro guardado en DB
↓
Confirmación visual
```

### 2. Calificar Tarea

```
Docente entra a portal
↓
Selecciona materia
↓
Clic en "Tareas"
↓
Ve lista de tareas
↓
Clic en "Calificar" (tarea específica)
↓
Ve lista de alumnos + entregas
↓
Revisa entrega
↓
Ingresa calificación (0-100)
↓
Escribe feedback (opcional)
↓
Clic en "Guardar Calificación"
↓
Score y feedback guardados
↓
Fecha gradedAt registrada
```

### 3. Ver Alumnos

```
Docente entra a portal
↓
Selecciona materia
↓
Clic en "Ver Alumnos"
↓
Ve directorio con fotos
↓
Consulta información (solo lectura)
```

---

## 🎯 Casos de Uso

### Caso 1: Registro de Asistencia Diaria

**Escenario:** El docente imparte clase de Matemáticas I y debe pasar lista.

**Pasos:**
1. Entra al Portal del Docente
2. Ve la tarjeta de "Matemáticas I"
3. Clic en "Pasar Lista"
4. Sistema muestra 35 alumnos con sus fotos
5. Marca 32 como Presente, 2 como Retardo, 1 como Falta
6. Clic en "Guardar Asistencia (35)"
7. Sistema guarda en la tabla `attendances` con fecha de hoy
8. Confirma éxito

**Resultado:**
- 35 registros en DB
- Estadísticas actualizadas
- Métrica "Asistencias Hoy" incrementada

### Caso 2: Calificar Tarea Atrasada

**Escenario:** Hay entregas pendientes de calificar de una tarea.

**Pasos:**
1. Dashboard muestra "Por Calificar: 7"
2. Entra a "Tareas" de la materia
3. Ve tarea con badge "7 entregas"
4. Clic en "Calificar"
5. Ve lista de 35 alumnos
   - 28 ya calificados (verde)
   - 7 por calificar (amarillo)
6. Revisa entrega de Juan Pérez
7. Lee su respuesta y archivo adjunto
8. Asigna 95/100
9. Escribe feedback: "Excelente análisis, solo faltó la conclusión"
10. Clic en "Guardar Calificación"
11. Repite con los 6 restantes

**Resultado:**
- Todos los alumnos calificados
- Feedback visible para cada alumno
- `gradedBy` guarda ID del docente
- Métrica "Por Calificar" baja a 0

### Caso 3: Consultar Lista de Clase

**Escenario:** El docente necesita el email de un alumno.

**Pasos:**
1. Entra a Portal del Docente
2. Selecciona materia
3. Clic en "Ver Alumnos"
4. Ve grid con fotos y datos
5. Encuentra al alumno
6. Clic en su email (mailto:)
7. Abre su cliente de correo

**Resultado:**
- Consulta rápida de información
- Sin necesidad de ir a módulo de Alumnos general

---

## 🔧 Configuración y Setup

### 1. Migraciones Aplicadas

```bash
npx prisma generate
npx prisma db push
```

### 2. Modelos Agregados

- `Attendance` (nuevo)
- `Submission.gradedBy` (campo agregado)

### 3. Relaciones Actualizadas

- `University` → `attendances[]`
- `Student` → `attendances[]`
- `Teacher` → `attendances[]`
- `Subject` → `attendances[]`

---

## 🌐 URLs del Portal

| Ruta | Descripción |
|------|-------------|
| `/docente` | Dashboard principal |
| `/docente/asistencia/[subjectId]` | Pasar lista |
| `/docente/tareas/[subjectId]` | Ver tareas de materia |
| `/docente/calificar/[assignmentId]` | Calificar entregas |
| `/docente/alumnos/[subjectId]` | Directorio de alumnos |

---

## 📱 Responsive Design

### Desktop (>1024px)
- Grid 3 columnas para materias
- Tabla completa de asistencia
- Formularios de calificación expandidos

### Tablet (768px-1024px)
- Grid 2 columnas
- Scroll horizontal en tablas si necesario

### Mobile (<768px)
- Cards apiladas verticalmente
- Botones de asistencia en grid 3 columnas
- Inputs full-width

---

## 🎨 Capturas de Pantalla (Descripción)

### 1. Dashboard del Docente
- Header con título y métricas
- Grid de materias con iconos
- Botones de acceso rápido verde/cyan/purple
- Card de tips al final

### 2. Control de Asistencia
- Header con fecha completa
- Estadísticas en 4 cards (Total/Presente/Retardo/Falta)
- Lista de alumnos con fotos
- 3 botones por alumno con colores distintos
- Botón flotante "Guardar" sticky bottom

### 3. Calificar Entregas
- Info de la tarea en card destacada
- Estadísticas de calificación
- Cards por alumno con:
  - Foto + nombre
  - Badge de estado
  - Contenido de la entrega
  - Inputs de calificación y feedback
  - Botón guardar individual

### 4. Vista de Tareas
- Lista de tareas tipo cards
- Badges de fecha con colores
- Contador de entregas
- Botón "Calificar" destacado

### 5. Directorio de Alumnos
- Grid de cards con fotos grandes
- Información centrada
- Icons de contacto

---

## ✅ Checklist de Implementación

### Base de Datos
- [x] Modelo `Attendance` creado
- [x] Relaciones agregadas
- [x] Campo `gradedBy` en Submission
- [x] Índices para performance
- [x] Unique constraint (estudiante + materia + fecha)

### Backend
- [x] Server actions para dashboard
- [x] Server actions para asistencia
- [x] Server actions para calificaciones
- [x] Filtrado por teacherId
- [x] Seguridad implementada

### Frontend
- [x] Dashboard con materias
- [x] Vista de asistencia con estados
- [x] Vista de calificaciones
- [x] Vista de tareas
- [x] Vista de alumnos
- [x] Diseño PulseTec aplicado
- [x] Responsive design
- [x] Estados visuales (badges, colores)
- [x] Animaciones y hover effects

### Integración
- [x] Links en sidebar
- [x] Navegación entre vistas
- [x] Manejo de errores
- [x] Mensajes de éxito
- [x] Loading states

### Documentación
- [x] Documentación técnica
- [x] Casos de uso
- [x] Flujos de trabajo
- [x] Guía visual

---

## 🎯 Próximos Pasos (Opcionales)

### 1. Reportes y Estadísticas
- Gráficas de asistencia por alumno
- Promedio de calificaciones
- Exportar a PDF/Excel

### 2. Notificaciones
- Email a alumnos cuando son calificados
- Recordatorios de tareas sin calificar
- Alertas de asistencias bajas

### 3. Calificaciones Avanzadas
- Rúbricas personalizadas
- Calificación por criterios
- Comparación con promedio del grupo

### 4. Asistencia Avanzada
- Justificaciones de faltas
- Historial de asistencia por alumno
- Reportes mensuales

---

## 📞 Soporte

### Problemas Comunes

**P: No veo ninguna materia en mi dashboard**
R: Verifica que el docente tenga materias asignadas en `TeacherSubject`

**P: No puedo guardar la asistencia**
R: Verifica que los alumnos estén inscritos en la materia via `StudentSubject`

**P: Error al calificar**
R: Verifica que la calificación sea <= maxScore de la tarea

---

## 🌟 Características Destacadas

✨ **Dashboard Personalizado** - Solo ve sus materias
🎨 **Diseño Intuitivo** - Botones visuales con colores significativos
⚡ **Guardado Rápido** - Múltiples asistencias a la vez
📊 **Estadísticas en Tiempo Real** - Contadores actualizados al instante
🔒 **Seguridad** - Filtrado automático por docente
📱 **100% Responsive** - Funciona en cualquier dispositivo
♿ **Accesible** - Contraste adecuado, labels descriptivos

---

**Desarrollado con PulseTec Control Design System** 🚀

*Módulo Portal del Docente - Versión 1.0 - Enero 2026*


