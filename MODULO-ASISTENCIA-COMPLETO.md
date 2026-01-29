# 📊 Módulo de Asistencia Completo - "Algoritmo del Pulso"

## 🎯 Descripción General

Sistema avanzado de control de asistencia con cálculo automático de estadísticas en tiempo real, diseñado con el **Algoritmo del Pulso** de PulseTec Control.

---

## 🧮 El Algoritmo del Pulso

### Fórmula Matemática

```
Porcentaje = ((Presentes × 1.0) + (Retardos × 0.5) + (Justificadas × 0.8)) / Total × 100
```

### Ponderaciones

| Estado | Valor | Justificación |
|--------|-------|---------------|
| **PRESENTE** | 1.0 (100%) | Asistencia completa |
| **RETARDO** | 0.5 (50%) | Llegó tarde pero asistió |
| **JUSTIFICADO** | 0.8 (80%) | Falta con justificante válido |
| **FALTA** | 0.0 (0%) | Ausencia sin justificar |

### Ejemplo de Cálculo

**Escenario:** Clase de 30 alumnos
- 25 Presentes
- 3 Retardos
- 1 Justificada
- 1 Falta

**Cálculo:**
```
Efectivo = (25 × 1.0) + (3 × 0.5) + (1 × 0.8) + (1 × 0.0)
Efectivo = 25 + 1.5 + 0.8 + 0
Efectivo = 27.3

Porcentaje = (27.3 / 30) × 100 = 91%
```

---

## 🗄️ Base de Datos

### Modelo: AttendanceSession (Sesión de Asistencia)

```prisma
model AttendanceSession {
  id           String   @id @default(cuid())
  universityId String
  subjectId    String
  teacherId    String
  date         DateTime @default(now())
  notes        String?
  
  // Estadísticas calculadas automáticamente
  totalStudents      Int      @default(0)
  presentCount       Int      @default(0)
  lateCount          Int      @default(0)
  absentCount        Int      @default(0)
  justifiedCount     Int      @default(0)
  attendancePercent  Float    @default(0)
  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  // Relaciones
  university   University @relation(...)
  subject      Subject @relation(...)
  teacher      Teacher @relation(...)
  records      AttendanceRecord[]

  @@unique([subjectId, date])
}
```

**Características:**
- ✅ Una sesión por materia por día
- ✅ Estadísticas pre-calculadas para performance
- ✅ Relación uno-a-muchos con registros individuales

### Modelo: AttendanceRecord (Registro Individual)

```prisma
model AttendanceRecord {
  id           String   @id @default(cuid())
  sessionId    String
  studentId    String
  status       String   // PRESENTE, RETARDO, FALTA, JUSTIFICADO
  notes        String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  // Relaciones
  session      AttendanceSession @relation(...)
  student      Student @relation(...)

  @@unique([sessionId, studentId])
}
```

**Características:**
- ✅ Un registro por alumno por sesión
- ✅ 4 estados posibles
- ✅ Campo de notas opcional

---

## 🎨 Componente UI: AttendanceSummaryCard

### Diseño Visual

```
┌─────────────────────────────────────┐
│ [P~] Resumen de Asistencia          │  ← Isotipo + Título
│      Hoy, 28 Ene                    │  ← Fecha
│                                     │
│      95.0%  🌟                      │  ← Porcentaje + Emoji
│      Excelente                      │  ← Nivel
│                                     │
│  ────────────────────────────────   │  ← Separador
│  Presentes    Total                 │
│     28 + 2      30                  │  ← Detalles
│                                     │
│  ████████████████████░░░░░░░░░░░░   │  ← Barra de progreso
└─────────────────────────────────────┘
```

### Características

1. **Isotipo PulseTec**
   - Esquina superior izquierda
   - Opacidad 10% como marca de agua
   - Tamaño 16x16 (w-16 h-16)

2. **Título**
   - "Resumen de Asistencia"
   - Inter Bold
   - Color #0F172A (Midnight Blue)

3. **Porcentaje Principal**
   - Tamaño gigante: `text-6xl` (60px)
   - Inter Bold
   - Color dinámico según nivel:
     - ≥90%: #0F172A (Midnight Blue)
     - 80-89%: #06B6D4 (Cyan)
     - 70-79%: #F59E0B (Amarillo)
     - <70%: #EF4444 (Rojo)

4. **Emoji de Nivel**
   - 🌟 Excelente (≥95%)
   - ✅ Muy Bueno (90-94%)
   - 👍 Bueno (80-89%)
   - ⚠️ Regular (70-79%)
   - ⚠️ Bajo (60-69%)
   - 🚨 Crítico (<60%)

5. **Barra de Progreso**
   - Altura 1 (h-1)
   - Fondo #E5E7EB (gray-200)
   - Fill con color dinámico
   - Animación suave (transition-all duration-500)

---

## 🖥️ Interfaz de Toma de Lista

### Tabla Limpia

```
┌────────────────────────────────────────────────────────────┐
│ Alumno          │ Presente │ Retardo │ Falta │ Justificada │
├────────────────────────────────────────────────────────────┤
│ [👤] Juan Pérez │   [●]    │   [ ]   │  [ ]  │    [ ]      │
│      20231001   │          │         │       │             │
├────────────────────────────────────────────────────────────┤
│ [👤] María G.   │   [ ]    │   [●]   │  [ ]  │    [ ]      │
│      20231002   │          │         │       │             │
└────────────────────────────────────────────────────────────┘
```

### Botones Circulares de Estado

**Diseño:**
- Forma: Círculo (rounded-full)
- Tamaño: 48x48px (w-12 h-12)
- Borde: 2px
- Estados:
  - **Inactivo:** Borde gris (#D1D5DB), fondo transparente, icono gris
  - **Activo:** Sin borde, fondo con color del estado, icono blanco

**Colores por Estado:**

| Estado | Color Fill | Icono |
|--------|-----------|-------|
| Presente | #06B6D4 (Cyan) | CheckCircle |
| Retardo | #F59E0B (Amarillo) | Clock |
| Falta | #EF4444 (Rojo) | XCircle |
| Justificada | #3B82F6 (Azul) | FileCheck |

**Animaciones:**
- Hover: `scale-105` (5% más grande)
- Seleccionado: `scale-110` + `shadow-lg`
- Transición: 200ms

---

## 📊 Barra de Progreso de Marcado

### Ubicación
Encima de las estadísticas, muestra cuántos alumnos ya tienen estado asignado.

### Diseño
```
┌─────────────────────────────────────┐
│ Progreso de Marcado          28/30  │
│ ████████████████████████░░░░░░░░░░  │
│ Faltan 2 alumnos por marcar         │
└─────────────────────────────────────┘
```

**Características:**
- Altura: 12px (h-3)
- Fondo: #E5E7EB (gray-200)
- Fill: Gradiente primary (from-primary to-primary/70)
- Animación: duration-500 ease-out
- Texto dinámico:
  - En progreso: "Faltan X alumnos por marcar"
  - Completo: "¡Todos los alumnos marcados! 🎉"

---

## 📈 Estadísticas en Tiempo Real

### Grid de 4 Cards

```
┌──────────┬──────────┬──────────┬──────────┐
│ Presentes│ Retardos │  Faltas  │Justific. │
│    28    │    2     │    0     │    0     │
└──────────┴──────────┴──────────┴──────────┘
```

**Diseño de cada Card:**
- Gradiente de fondo (from-{color}-50 to-{color}-100)
- Borde de color ({color}-200)
- Icono grande (w-8 h-8)
- Número en text-3xl font-bold
- Label en text-sm font-medium

**Colores:**
- Presentes: Verde (green-50/100/200/600/700)
- Retardos: Amarillo (yellow-50/100/200/600/700)
- Faltas: Rojo (red-50/100/200/600/700)
- Justificadas: Azul (blue-50/100/200/600/700)

---

## ⚙️ Lógica de Cálculo (Backend)

### Función: calculateAttendancePercent

```typescript
function calculateAttendancePercent(
  present: number,
  late: number,
  absent: number,
  justified: number,
  total: number
): number {
  if (total === 0) return 0;

  const effectiveAttendance = 
    present + (late * 0.5) + (justified * 0.8);
  
  const percent = (effectiveAttendance / total) * 100;

  return Math.round(percent * 100) / 100; // 2 decimales
}
```

### Función: calculateAttendanceStats

```typescript
function calculateAttendanceStats(
  records: Array<{ status: string }>,
  totalStudents: number
): AttendanceStats {
  const presentCount = records.filter(r => r.status === 'PRESENTE').length;
  const lateCount = records.filter(r => r.status === 'RETARDO').length;
  const absentCount = records.filter(r => r.status === 'FALTA').length;
  const justifiedCount = records.filter(r => r.status === 'JUSTIFICADO').length;

  const attendancePercent = calculateAttendancePercent(
    presentCount, lateCount, absentCount, justifiedCount, totalStudents
  );

  return {
    totalStudents,
    presentCount,
    lateCount,
    absentCount,
    justifiedCount,
    attendancePercent,
  };
}
```

### Actualización Automática

Cada vez que el docente marca un alumno:
1. Se actualiza el Map local de asistencias
2. Se recalculan las estadísticas en tiempo real
3. Se actualiza la UI (porcentaje, cards, barra)
4. Al guardar, se persiste en la sesión con estadísticas pre-calculadas

---

## 🎨 Paleta de Colores Completa

### Estados de Asistencia

| Estado | Nombre | Hex | RGB | Uso |
|--------|--------|-----|-----|-----|
| Presente | Electric Cyan | #06B6D4 | rgb(6, 182, 212) | Botón, fill |
| Retardo | Amber | #F59E0B | rgb(245, 158, 11) | Botón, fill |
| Falta | Red | #EF4444 | rgb(239, 68, 68) | Botón, fill |
| Justificada | Blue | #3B82F6 | rgb(59, 130, 246) | Botón, fill |

### Niveles de Porcentaje

| Nivel | Nombre | Hex | Rango |
|-------|--------|-----|-------|
| Excelente | Midnight Blue | #0F172A | ≥95% |
| Muy Bueno | Electric Cyan | #06B6D4 | 90-94% |
| Bueno | Electric Cyan | #06B6D4 | 80-89% |
| Regular | Amber | #F59E0B | 70-79% |
| Bajo | Red | #EF4444 | 60-69% |
| Crítico | Dark Red | #DC2626 | <60% |

---

## 🔄 Flujo de Trabajo Completo

### 1. Inicio de Sesión

```
Docente → Selecciona materia → Clic "Pasar Lista"
↓
Sistema crea/recupera AttendanceSession del día
↓
Carga lista de alumnos inscritos (StudentSubject)
↓
Muestra tabla vacía o con registros existentes
```

### 2. Marcado de Asistencia

```
Docente hace clic en botón de estado
↓
Estado se guarda en Map local
↓
Se recalculan estadísticas en tiempo real
↓
UI se actualiza:
  - Porcentaje en AttendanceSummaryCard
  - Cards de estadísticas
  - Barra de progreso de marcado
  - Color del porcentaje según nivel
```

### 3. Guardado

```
Docente hace clic en "Guardar Asistencia"
↓
Sistema crea/actualiza AttendanceSession
↓
Calcula estadísticas finales
↓
Guarda estadísticas en la sesión
↓
Crea/actualiza AttendanceRecord por cada alumno
↓
Confirma éxito
```

---

## 📱 Responsive Design

### Desktop (>1024px)
- Tabla completa con 5 columnas
- Grid 1 + 2 para resumen y estadísticas
- Botones circulares 48x48px

### Tablet (768px-1024px)
- Tabla con scroll horizontal
- Grid apilado verticalmente
- Botones 40x40px

### Mobile (<768px)
- Cards apiladas en lugar de tabla
- Botones en grid 2x2
- Porcentaje más grande (text-7xl)

---

## 🧪 Casos de Prueba

### Caso 1: Asistencia Perfecta

**Input:**
- 30 alumnos
- 30 Presentes
- 0 Retardos
- 0 Faltas
- 0 Justificadas

**Output:**
- Porcentaje: 100%
- Color: #0F172A (Midnight Blue)
- Nivel: Excelente 🌟

### Caso 2: Asistencia con Retardos

**Input:**
- 30 alumnos
- 25 Presentes
- 5 Retardos
- 0 Faltas
- 0 Justificadas

**Cálculo:**
```
Efectivo = 25 + (5 × 0.5) = 27.5
Porcentaje = (27.5 / 30) × 100 = 91.67%
```

**Output:**
- Porcentaje: 91.67%
- Color: #0F172A (Midnight Blue)
- Nivel: Muy Bueno ✅

### Caso 3: Asistencia Baja

**Input:**
- 30 alumnos
- 18 Presentes
- 2 Retardos
- 10 Faltas
- 0 Justificadas

**Cálculo:**
```
Efectivo = 18 + (2 × 0.5) = 19
Porcentaje = (19 / 30) × 100 = 63.33%
```

**Output:**
- Porcentaje: 63.33%
- Color: #EF4444 (Rojo)
- Nivel: Bajo ⚠️

---

## 📊 Métricas y Reportes

### Métricas Disponibles

1. **Por Sesión:**
   - Porcentaje de asistencia
   - Conteo por estado
   - Total de alumnos

2. **Por Alumno (futuro):**
   - Porcentaje individual
   - Racha de asistencias
   - Alertas de bajo rendimiento

3. **Por Materia (futuro):**
   - Promedio de asistencia
   - Tendencias semanales/mensuales
   - Comparativa con otras materias

---

## 🎯 Ventajas del Sistema

### Para el Docente

✅ **Rápido:** Botones circulares grandes, fáciles de presionar
✅ **Visual:** Colores significativos, feedback inmediato
✅ **Inteligente:** Cálculo automático, sin matemáticas manuales
✅ **Informativo:** Estadísticas en tiempo real
✅ **Flexible:** 4 estados (incluye justificadas)

### Para la Institución

✅ **Datos precisos:** Algoritmo matemático consistente
✅ **Histórico:** Sesiones guardadas con estadísticas
✅ **Reportes:** Datos estructurados para análisis
✅ **Auditoría:** Registro de quién y cuándo marcó

### Para el Alumno (futuro)

✅ **Transparencia:** Ve su porcentaje de asistencia
✅ **Alertas:** Notificación si baja del 80%
✅ **Justificaciones:** Puede subir documentos

---

## 🚀 Próximas Mejoras

### Fase 2: Reportes

- [ ] Exportar a PDF/Excel
- [ ] Gráficas de tendencias
- [ ] Comparativas entre grupos
- [ ] Dashboard de asistencia general

### Fase 3: Automatización

- [ ] Recordatorios automáticos
- [ ] Notificaciones a alumnos con baja asistencia
- [ ] Integración con sistema de justificaciones
- [ ] QR code para registro automático

### Fase 4: Análisis Avanzado

- [ ] Machine Learning para predecir deserción
- [ ] Correlación asistencia-calificaciones
- [ ] Alertas tempranas
- [ ] Recomendaciones personalizadas

---

## 📞 Soporte

### Problemas Comunes

**P: El porcentaje no se actualiza**
R: Verifica que los estados estén en el Map local. Revisa la consola.

**P: Los colores no cambian**
R: Asegúrate de que `getAttendancePercentColor` esté importado.

**P: No se guardan los registros**
R: Verifica que la sesión se esté creando correctamente.

---

## ✅ Checklist de Implementación

### Base de Datos
- [x] Modelo `AttendanceSession` creado
- [x] Modelo `AttendanceRecord` creado
- [x] Relaciones configuradas
- [x] Índices para performance
- [x] Unique constraints

### Backend
- [x] Algoritmo del Pulso implementado
- [x] Función de cálculo de porcentaje
- [x] Función de estadísticas
- [x] Función de niveles

### Frontend
- [x] Componente `AttendanceSummaryCard`
- [x] Página de toma de lista
- [x] Botones circulares de estado
- [x] Barra de progreso de marcado
- [x] Estadísticas en tiempo real
- [x] Colores dinámicos

### Diseño
- [x] Paleta PulseTec aplicada
- [x] Isotipo en card
- [x] Animaciones suaves
- [x] Responsive design

---

## 🌟 Características Destacadas

🎨 **Diseño Intuitivo** - Botones circulares con colores significativos
🧮 **Algoritmo Inteligente** - Ponderación justa de estados
📊 **Estadísticas en Vivo** - Cálculo automático mientras marcas
🎯 **Feedback Visual** - Colores que alertan sobre niveles bajos
⚡ **Performance** - Estadísticas pre-calculadas en sesión
📱 **100% Responsive** - Funciona en todos los dispositivos

---

**Desarrollado con PulseTec Control Design System** 🚀

*Módulo de Asistencia Completo - Versión 2.0 - Enero 2026*


