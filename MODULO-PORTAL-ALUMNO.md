# 🎓 Portal del Alumno - PulseTec Control

## 🎯 Descripción General

Portal simplificado para que los **estudiantes** consulten su información académica, entreguen tareas y visualicen sus calificaciones. Diseñado con una interfaz tipo **app móvil**: limpia, simple y enfocada en las acciones más importantes.

---

## 🗂️ Estructura del Portal

### 1. **Dashboard Simplificado** (`/student/dashboard`)

#### Características:
- **Bienvenida Personalizada**: Saludo con nombre del alumno + avatar (si existe)
- **Tareas Próximas a Vencer**: Las 3 tareas más urgentes destacadas en un card especial
- **Cards de Materias**: Grid con todas las materias inscritas

#### Mini Resumen por Materia:
Cada card muestra:
- 📊 **Calificación Actual**: Promedio calculado en tiempo real
- 📅 **% de Asistencia**: Porcentaje basado en registros de asistencia
- 📝 **Tareas Pendientes**: Contador de tareas sin entregar

#### Sistema de Colores Semáforo:
```tsx
- 🟢 Verde (border-green-500): Calificación ≥ 6.0 Y Asistencia ≥ 70%
- 🔴 Rojo (border-red-500): Calificación < 6.0 O Asistencia < 70%
```

#### Estados Visuales:
- **"¡Vas muy bien!"** → Verde, si todo está OK
- **"Requiere atención"** → Rojo, si hay problemas

---

### 2. **Tareas del Alumno** (`/student/assignments`)

#### Vista Principal:

**Estadísticas en Cards:**
- ⏰ **Pendientes**: Tareas sin entregar (fondo amber)
- ✓ **Entregadas**: Esperando calificación (fondo azul)
- ✅ **Calificadas**: Ya tienen nota (fondo verde)

**3 Secciones:**

1. **Tareas Pendientes** (prioridad alta)
   - Borde izquierdo amarillo
   - Indica si vence "hoy", "mañana" o "en X días"
   - Badge rojo si ya está vencida: `¡Vencida!`
   - Badge amarillo si vence pronto (≤ 2 días)

2. **Esperando Calificación**
   - Borde izquierdo azul
   - Muestra fecha de entrega
   - Ícono de check azul

3. **Calificadas**
   - Borde izquierdo verde
   - Muestra calificación en grande
   - Muestra feedback del docente (si existe)

---

### 3. **Detalle de Tarea** (`/student/assignments/[id]`)

#### Header:
- Título de la tarea
- Materia y código
- Nombre del docente
- Fecha límite
- Badge de estado (Pendiente/Entregada/Calificada)

#### Si ya fue calificada:
```
✅ Tarea Calificada
- Calificación: 9.5 / 10
- Calificada el: 28 Ene 2026
- Retroalimentación del Docente: [Texto del feedback]
```

#### Si ya fue entregada (sin calificar):
```
⏳ Tarea Entregada - Esperando Calificación
- Entregada el: 27 Ene 2026
- [Muestra contenido enviado]
- [Link al archivo si existe]
```

#### Formulario de Entrega (si está pendiente):

**3 Opciones para entregar:**

1. **Texto**: Textarea para escribir respuesta
2. **URL**: Input para pegar enlace (Google Drive, Dropbox, etc.)
3. **Archivo**: Drag & Drop para subir archivos

**Componente Drag & Drop:**
- Zona visual para arrastrar archivos
- Click para seleccionar archivo
- Preview del archivo seleccionado
- Botón "Subir Archivo"
- Validación de tamaño (máx 10MB)
- Feedback visual durante la carga

**Botón Principal:**
```tsx
<Upload icon /> Entregar Tarea
```

#### Alerta si está vencida:
```
⚠️ Tarea Vencida
La fecha límite ya pasó. Contacta a tu docente si necesitas prórroga.
```

---

### 4. **Boleta de Calificaciones** (`/student/grades`)

#### Resumen General (Card Destacado):
```
Promedio General: 8.75
+ Badge de rendimiento:
  - 9.0+: "¡Excelente desempeño!"
  - 8.0-8.9: "¡Muy buen trabajo!"
  - 7.0-7.9: "Buen desempeño"
  - 6.0-6.9: "Desempeño aceptable"
  - <6.0: "Necesitas mejorar"
+ Contador: Materias totales
+ Contador: Materias aprobadas
```

#### Tabla por Materia:

Cada materia se muestra en un card expandible:

**Header:**
- Nombre de la materia
- Código
- Promedio (grande y destacado)
- Borde izquierdo con color según promedio:
  - 🟢 Verde: ≥ 9.0 (Excelente)
  - 🔵 Azul: 6.0-8.9 (Aprobado)
  - 🔴 Rojo: < 6.0 (Reprobado)

**Tabla de Actividades:**

| Actividad | Calificación | Fecha | Retroalimentación |
|-----------|--------------|-------|-------------------|
| Tarea 1   | 9.0 / 10     | 15 Ene | Excelente trabajo |
| Examen    | 8.5 / 10     | 20 Ene | Bien desarrollado |
| Proyecto  | 10.0 / 10    | 25 Ene | ¡Perfecto! |

**Footer:**
- Promedio de la materia (calculado automáticamente)
- Estado: Aprobado / Necesitas mejorar

**Leyenda:**
- 🟢 Excelente: 9.0 - 10.0
- 🔵 Aprobado: 6.0 - 8.9
- 🔴 Reprobado: 0.0 - 5.9
- ⚪ Sin Calificar: Pendiente

---

## 🎨 Diseño (PulseTec Control)

### Sidebar Simplificado:
```
- Mi Dashboard
- Mis Tareas
- Mis Calificaciones
- Mi Perfil
```

Solo 4 opciones, diseño minimalista.

### Colores y Estilo:
- **Primary**: #06B6D4 (Cyan)
- **Dark**: #0F172A (Slate-950)
- **Gray**: #64748B (Slate-500)
- **Light**: #F8FAFC (Slate-50)
- **Success**: #10B981 (Green)
- **Warning**: #F59E0B (Amber)
- **Error**: #EF4444 (Red)

### Tipografía:
- **Inter Bold**: Títulos y promedios
- **Inter Medium**: Botones y labels
- **Inter Regular**: Texto normal

### Cards:
- `shadow-sm` en reposo
- `hover:shadow-lg` al pasar el mouse
- `rounded-xl` bordes redondeados
- `border-l-4` borde izquierdo de color según estado

---

## 🔄 Flujo de Uso

### Escenario 1: Alumno Revisa Dashboard
1. Login como ALUMNO
2. Redirige a `/student/dashboard`
3. Ve sus materias con mini resumen
4. Ve tareas próximas a vencer
5. Click en una materia → Ver detalle (futuro)
6. Click en tarea urgente → Ir a entrega

### Escenario 2: Alumno Entrega Tarea
1. Va a "Mis Tareas" (`/student/assignments`)
2. Ve lista de tareas pendientes
3. Click en tarea
4. **Opción A**: Escribe respuesta en textarea
5. **Opción B**: Pega URL de Google Drive
6. **Opción C**: Arrastra archivo PDF
7. Click "Entregar Tarea"
8. Confirmación ✅
9. Estado cambia a "Entregada"

### Escenario 3: Alumno Consulta Calificaciones
1. Va a "Mis Calificaciones" (`/student/grades`)
2. Ve promedio general
3. Ve tabla con todas las materias
4. Cada materia muestra:
   - Promedio
   - Desglose de actividades
   - Retroalimentación del docente
5. Solo lectura (no puede editar)

---

## 📊 Cálculos Automáticos

### Calificación Actual (Promedio):
```typescript
const totalScore = Σ(score de cada actividad)
const totalMaxScore = Σ(maxScore de cada actividad)
const average = (totalScore / totalMaxScore) * 10
```

### % de Asistencia:
```typescript
const presentRecords = count(status === 'PRESENTE')
const totalSessions = count(todas las sesiones)
const attendancePercent = (presentRecords / totalSessions) * 100
```

---

## 🔐 Seguridad y Permisos

### Middleware:
```typescript
// Redirección automática al login
if (role === 'ALUMNO') {
  redirect('/student/dashboard')
}

// Protección de rutas
if (path.startsWith('/student') && role !== 'ALUMNO' && role !== 'ADMIN') {
  redirect('/dashboard')
}
```

### Server Actions:
Todas las funciones verifican el `studentId` desde la sesión:
```typescript
async function getCurrentStudentId() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.studentId) {
    throw new Error('No autorizado');
  }
  return session.user.studentId;
}
```

### Restricciones:
- ✅ Alumno solo ve **sus** materias
- ✅ Alumno solo ve **sus** tareas
- ✅ Alumno solo ve **sus** calificaciones
- ❌ Alumno **NO** puede editar calificaciones
- ❌ Alumno **NO** puede ver otros alumnos
- ❌ Alumno **NO** puede gestionar materias/grupos

---

## 📁 Estructura de Archivos

```
app/student/
├── dashboard/
│   ├── layout.tsx          # Layout con sidebar
│   ├── page.tsx            # Dashboard principal
│   └── actions.ts          # Server actions
├── assignments/
│   ├── page.tsx            # Lista de tareas
│   ├── actions.ts          # Server actions
│   └── [id]/
│       └── page.tsx        # Detalle y entrega
└── grades/
    ├── page.tsx            # Boleta de calificaciones
    └── actions.ts          # Server actions

components/
├── student-sidebar.tsx     # Sidebar simplificado
└── file-upload.tsx         # Drag & Drop component
```

---

## 🚀 Para Probar

### 1. Crear un usuario Alumno:
```typescript
// En Prisma Studio o script
{
  email: "alumno@test.com",
  password: "hashedPassword",
  role: "ALUMNO",
  isActive: true,
  studentId: "[ID de estudiante existente]"
}
```

### 2. Login y Navegación:
```
1. Login con alumno@test.com
2. Auto-redirige a /student/dashboard
3. Explora:
   - Dashboard → Cards de materias
   - Mis Tareas → Lista y entrega
   - Mis Calificaciones → Boleta completa
```

---

## ✨ Características Destacadas

### Dashboard:
- 🎯 Diseño tipo app móvil (simple y limpio)
- 🚦 Sistema de colores semáforo (verde/rojo)
- 📊 Mini resumen en cada materia
- ⚡ Tareas urgentes destacadas

### Tareas:
- 📤 3 formas de entregar (texto, URL, archivo)
- 🎨 Drag & Drop visual e intuitivo
- ⏰ Estados claros (Pendiente/Entregada/Calificada)
- 💬 Retroalimentación del docente visible

### Calificaciones:
- 📋 Boleta completa y detallada
- 🧮 Cálculos automáticos de promedios
- 📊 Desglose por actividad
- 🔒 Solo lectura (seguro)

---

## 📝 Notas Técnicas

### Mock Data:
Actualmente los componentes usan cálculos reales pero algunos datos son de ejemplo (como la calificación del dashboard que está en 8.5 hardcoded). Conecta con las server actions reales para datos en vivo.

### Upload de Archivos:
El componente `FileUpload` actualmente crea URLs temporales. En producción, deberías integrar con un servicio de almacenamiento como:
- AWS S3
- Cloudinary
- Firebase Storage
- Vercel Blob

### Optimizaciones Futuras:
- Caché de consultas frecuentes
- Infinite scroll para listas largas
- Notificaciones push para tareas próximas
- Vista de calendario con fechas de entrega

---

## ✅ Estado Actual

- ✅ **Dashboard**: Completo con cards y resumen
- ✅ **Tareas**: Lista, detalle y entrega funcional
- ✅ **Drag & Drop**: Componente visual completo
- ✅ **Boleta**: Tabla completa con promedios
- ✅ **Middleware**: Redirecciones por rol
- ✅ **Seguridad**: Validación de sesión
- ✅ **Diseño**: PulseTec Control aplicado
- ⏳ **Upload real**: Pendiente integrar almacenamiento
- ⏳ **Notificaciones**: Futura implementación

---

**¡El Portal del Alumno está completo y listo para usar! 🎓🚀**


