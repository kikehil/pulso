# 📊 Módulo de Rúbricas y Evaluación - PulseTec Control

## 🎯 Descripción General

Sistema completo de **evaluación basada en rúbricas** que permite a los docentes crear actividades con criterios de evaluación personalizados y calificar de manera estructurada y objetiva.

---

## 🗄️ Base de Datos (Schema)

### 1. **Modelo `Rubric`**
Rúbrica principal que contiene los criterios de evaluación.

```prisma
model Rubric {
  id           String   @id @default(cuid())
  universityId String
  teacherId    String
  title        String
  description  String?
  totalWeight  Float    @default(100) // Peso total en %
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  // Relaciones
  university   University @relation(fields: [universityId], references: [id], onDelete: Cascade)
  teacher      Teacher @relation(fields: [teacherId], references: [id])
  criteria     RubricCriteria[]
  assignments  Assignment[]

  @@index([universityId])
  @@index([teacherId])
  @@map("rubrics")
}
```

### 2. **Modelo `RubricCriteria`**
Criterios individuales de cada rúbrica.

```prisma
model RubricCriteria {
  id          String   @id @default(cuid())
  rubricId    String
  description String
  maxPoints   Float    // Puntaje máximo para este criterio
  order       Int      @default(0) // Para ordenar los criterios
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relaciones
  rubric      Rubric @relation(fields: [rubricId], references: [id], onDelete: Cascade)
  grades      RubricGrade[]

  @@index([rubricId])
  @@map("rubric_criteria")
}
```

### 3. **Modelo `RubricGrade`**
Calificación individual por criterio para cada entrega.

```prisma
model RubricGrade {
  id           String   @id @default(cuid())
  criteriaId   String
  submissionId String
  points       Float    // Puntos otorgados para este criterio
  feedback     String?  // Comentario específico del criterio
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  // Relaciones
  criteria     RubricCriteria @relation(fields: [criteriaId], references: [id], onDelete: Cascade)
  submission   Submission @relation(fields: [submissionId], references: [id], onDelete: Cascade)

  @@unique([criteriaId, submissionId])
  @@index([criteriaId])
  @@index([submissionId])
  @@map("rubric_grades")
}
```

### 4. **Relaciones con modelos existentes**

**En `Assignment`:**
```prisma
rubricId    String?
rubric      Rubric?  @relation(fields: [rubricId], references: [id])
```

**En `Submission`:**
```prisma
rubricGrades RubricGrade[]
```

**En `University`:**
```prisma
rubrics     Rubric[]
```

**En `Teacher`:**
```prisma
rubrics     Rubric[]
```

---

## 🎨 Componentes UI Creados

### 1. **`ActivitiesRubricsTab`** (`components/activities-rubrics-tab.tsx`)
- Tab principal para gestión de actividades
- Lista de actividades con rúbricas asignadas
- Modal de creación/edición
- Toggle para activar evaluación con rúbrica

**Características:**
- Grid de tarjetas para actividades existentes
- Botón "Nueva Actividad" (Primary Cyan #06B6D4)
- Estado vacío amigable
- Integración con RubricEditor

### 2. **`RubricEditor`** (`components/rubric-editor.tsx`)
- Editor dinámico de criterios de rúbrica
- Tabla interactiva para agregar/eliminar criterios
- Validación automática (total debe sumar 100pts)

**Características:**
- Agregar/eliminar filas dinámicamente
- Input para descripción de criterio
- Input numérico para puntaje máximo
- Indicador visual si el total ≠ 100pts
- Footer con suma total en tiempo real
- Mínimo 1 criterio obligatorio

**Ejemplo de uso:**
```tsx
<RubricEditor
  rubricData={rubricData}
  setRubricData={setRubricData}
  onAddCriterion={addCriterion}
  onUpdateCriterion={updateCriterion}
  onRemoveCriterion={removeCriterion}
  totalPoints={totalPoints}
/>
```

### 3. **`RubricGrading`** (`components/rubric-grading.tsx`)
- Interfaz de calificación con rúbrica
- Calcula automáticamente la nota final
- Permite feedback por criterio

**Características:**
- Tabla con todos los criterios de la rúbrica
- Input numérico para asignar puntos (0 hasta maxPoints)
- Textarea para retroalimentación individual
- Cálculo automático de:
  - Suma total de puntos
  - Porcentaje final
  - Barra de progreso visual
- Color dinámico según rendimiento:
  - Verde ≥ 90%
  - Amarillo ≥ 70%
  - Rojo < 70%
- Icono de check verde cuando se alcanza el puntaje máximo
- Modo lectura para ver calificaciones guardadas

---

## 🔄 Flujo de Uso

### Para el Docente:

1. **Crear Actividad con Rúbrica:**
   - Va a `/teacher/class/[groupId]`
   - Click en tab "Actividades y Rúbricas"
   - Click en "Nueva Actividad"
   - Llena título, descripción, fecha de entrega
   - Activa "Evaluar con rúbrica personalizada"
   - Define título y descripción de la rúbrica
   - Agrega criterios:
     - Ej: "Contenido" → 40 pts
     - "Ortografía" → 20 pts
     - "Presentación" → 20 pts
     - "Creatividad" → 20 pts
   - Total debe sumar 100 pts
   - Guarda la actividad

2. **Calificar Entrega con Rúbrica:**
   - Ve a la lista de entregas de la actividad
   - Selecciona la entrega de un alumno
   - Se muestra el componente `RubricGrading`
   - Asigna puntos a cada criterio
   - Opcionalmente agrega feedback por criterio
   - El sistema calcula automáticamente la nota final
   - Click en "Guardar Calificación"

### Para el Alumno (futuro):
- Ver la rúbrica antes de entregar
- Ver su calificación desglosada por criterios
- Leer el feedback específico de cada criterio

---

## 🎯 Algoritmo de Cálculo

**Fórmula:**
```typescript
const totalScore = Σ(puntosOtorgadosPorCriterio)
const maxTotalScore = Σ(puntosMaximosPorCriterio)
const percentage = (totalScore / maxTotalScore) * 100
```

**Ejemplo:**
```
Criterio 1: 35/40 pts
Criterio 2: 18/20 pts
Criterio 3: 15/20 pts
Criterio 4: 20/20 pts
---
Total: 88/100 pts → 88%
```

---

## 🎨 Diseño y Estilo (PulseTec Control)

### Colores:
- **Primary:** #06B6D4 (Electric Cyan)
- **Dark:** #0F172A (Midnight Blue)
- **Gray:** #64748B (Cool Gray)
- **Light:** #F8FAFC (Off White)
- **Success:** Verde (#10B981) para ≥90%
- **Warning:** Amarillo (#F59E0B) para 70-89%
- **Error:** Rojo (#EF4444) para <70%

### Tipografía:
- **Inter Bold** para títulos
- **Inter Medium** para botones y labels
- **Inter Regular** para texto

### Componentes:
- Cards con `shadow-sm`, `rounded-xl`
- Inputs con borde `#64748B`, focus `#06B6D4` con ring
- Botones Primary: `bg-primary text-white hover:bg-dark`
- Tablas: Header `bg-dark text-white`

---

## 📋 Pendiente (Post Schema Update)

Una vez que actualices el schema en Prisma:

1. **Server Actions para Rúbricas:**
   - `createActivityWithRubric()`
   - `getActivitiesByGroup()`
   - `getActivityWithRubric(id)`
   - `gradeSubmissionWithRubric()`
   - `getStudentSubmissionGrades()`

2. **Integración Completa:**
   - Guardar actividades con rúbricas en BD
   - Listar actividades en el tab
   - Editar/eliminar actividades
   - Conectar con el sistema de entregas de alumnos

3. **Vista del Alumno:**
   - Ver rúbrica antes de entregar
   - Ver calificación desglosada

---

## ✅ Status Actual

- ✅ **Sidebar auto-colapso** al click fuera
- ✅ **Modelos de BD** definidos (pendiente integrar al schema)
- ✅ **Editor de Rúbricas** dinámico y funcional
- ✅ **Validación automática** (suma 100pts)
- ✅ **Componente de calificación** con cálculo automático
- ✅ **Interfaz de creación** de actividades
- ⏳ **Persistencia en BD** (esperando schema update)
- ⏳ **Server Actions** (esperando schema update)
- ⏳ **Vista de alumno** (siguiente fase)

---

## 🚀 Para Probar Ahora

1. Recarga la página (`F5`)
2. Ve a `/teacher/dashboard`
3. Click en un grupo (ej: "CONTADOR")
4. Click en tab "Actividades y Rúbricas"
5. Click en "Nueva Actividad"
6. Activa "Evaluar con rúbrica personalizada"
7. Agrega múltiples criterios
8. Observa la validación en tiempo real
9. Prueba agregar/eliminar criterios

**El sidebar ahora se colapsa automáticamente al hacer click fuera! ✨**

---

## 📝 Notas del Desarrollador

- El sistema está diseñado para ser **flexible y escalable**
- Cada criterio es independiente, permitiendo feedback granular
- El cálculo es automático, eliminando errores humanos
- La UI sigue fielmente el diseño PulseTec Control
- El componente `RubricGrading` es reutilizable en diferentes contextos


