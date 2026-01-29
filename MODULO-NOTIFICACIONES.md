# 🔔 Sistema de Notificaciones - PulseTec Control

## 🎯 Descripción General

Sistema completo de **notificaciones en tiempo real** que mantiene a los usuarios informados sobre eventos importantes. La "campanita" en la barra superior muestra un punto rojo cuando hay notificaciones sin leer.

---

## 🗄️ Base de Datos

### Modelo `Notification`:

```prisma
model Notification {
  id        String   @id @default(cuid())
  userId    String   // Usuario que recibe la notificación
  type      String   // Tipo de notificación
  title     String   // Título corto
  message   String   // Mensaje descriptivo
  link      String?  // URL para navegar (opcional)
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())
  
  user      User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([isRead])
  @@index([createdAt])
}
```

### Tipos de Notificaciones:

| Tipo | Icono | Descripción |
|------|-------|-------------|
| `TASK_GRADED` | ✅ | Docente calificó una tarea del alumno |
| `TASK_SUBMITTED` | 📤 | Alumno entregó una tarea |
| `ABSENCE_MARKED` | ⚠️ | Se marcó una falta al alumno |
| `TASK_DUE_SOON` | ⏰ | Tarea próxima a vencer (24-48h) |
| `NEW_ASSIGNMENT` | 📝 | Nueva tarea asignada |

---

## 🚀 Disparadores Implementados

### 1. **Alumno Entrega Tarea** → Notificar al Docente

**Ubicación**: `app/student/assignments/actions.ts` → `submitAssignment()`

```typescript
// Después de crear/actualizar la entrega
if (isNewSubmission && assignment.teacher.user?.id) {
  await notifyTaskSubmitted({
    teacherUserId: assignment.teacher.user.id,
    studentName: `${student.firstName} ${student.lastName}`,
    assignmentTitle: assignment.title,
    assignmentId: data.assignmentId,
  });
}
```

**Resultado**:
```
🔔 Docente recibe:
Título: "📤 Nueva Entrega"
Mensaje: "Juan Pérez ha entregado 'Tarea 1'"
Link: /teacher/assignments/[id] (futuro)
```

---

### 2. **Docente Califica Tarea** → Notificar al Alumno

**Para implementar en el futuro**:

```typescript
// En la función de calificar tarea del docente
import { notifyTaskGraded } from '@/lib/notifications';

// Después de guardar la calificación
await notifyTaskGraded({
  studentUserId: student.user.id,
  assignmentTitle: assignment.title,
  score: grade.score,
  maxScore: assignment.maxScore,
  assignmentId: assignment.id,
});
```

**Resultado**:
```
🔔 Alumno recibe:
Título: "✅ Tarea Calificada"
Mensaje: "Tu tarea 'Ensayo' ha sido calificada: 9.5/10"
Link: /student/assignments/[id]
```

---

### 3. **Docente Marca Falta** → Notificar al Alumno

**Para implementar**:

```typescript
// En saveAttendance() cuando status === 'FALTA'
import { notifyAbsenceMarked } from '@/lib/notifications';

if (record.status === 'FALTA') {
  await notifyAbsenceMarked({
    studentUserId: student.user.id,
    subjectName: subject.name,
    date: new Date(),
  });
}
```

**Resultado**:
```
🔔 Alumno recibe:
Título: "⚠️ Falta Registrada"
Mensaje: "Se registró una falta en Matemáticas el 28/01/2026"
Link: /student/dashboard
```

---

## 🎨 Componente UI: `NotificationBell`

### Ubicación:
`components/notification-bell.tsx`

### Características:

#### **Icono de Campana:**
- Campana gris en estado normal
- **Punto rojo** con contador si hay notificaciones sin leer
- Animación al hacer hover

```tsx
{unreadCount > 0 && (
  <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full">
    {unreadCount > 9 ? '9+' : unreadCount}
  </span>
)}
```

#### **Dropdown:**
- Se abre al hacer click en la campana
- Muestra las últimas 10 notificaciones
- Auto-cierra al hacer click fuera

**Header del Dropdown:**
```
┌────────────────────────────┐
│ Notificaciones             │
│         [Marcar todas ✓]   │
└────────────────────────────┘
```

**Item de Notificación:**
```
┌────────────────────────────┐
│ • 📤 Nueva Entrega         │ [✓]
│   Juan Pérez ha entregado  │
│   "Tarea 1"                │
│   hace 5 minutos           │
└────────────────────────────┘
```

- **Punto azul** a la izquierda si no está leída
- **Fondo azul claro** (`bg-primary/5`) si no está leída
- **Icono de check** para marcar como leída
- **Click en item** → Navegar al link + marcar como leída

**Footer:**
```
┌────────────────────────────┐
│ Ver todas las notificaciones │
└────────────────────────────┘
```

---

## 📊 Funciones de la Librería

Archivo: `lib/notifications.ts`

### 1. **createNotification()**
Crear una notificación genérica.

```typescript
await createNotification({
  userId: 'user123',
  type: 'TASK_GRADED',
  title: '✅ Tarea Calificada',
  message: 'Tu tarea ha sido calificada: 9.5/10',
  link: '/student/assignments/abc123',
});
```

### 2. **notifyTaskGraded()**
Notificar al alumno cuando se califica su tarea.

```typescript
await notifyTaskGraded({
  studentUserId: 'student123',
  assignmentTitle: 'Ensayo sobre X',
  score: 9.5,
  maxScore: 10,
  assignmentId: 'assignment123',
});
```

### 3. **notifyTaskSubmitted()**
Notificar al docente cuando el alumno entrega.

```typescript
await notifyTaskSubmitted({
  teacherUserId: 'teacher123',
  studentName: 'Juan Pérez',
  assignmentTitle: 'Tarea 1',
  assignmentId: 'assignment123',
});
```

### 4. **notifyAbsenceMarked()**
Notificar al alumno cuando se marca una falta.

```typescript
await notifyAbsenceMarked({
  studentUserId: 'student123',
  subjectName: 'Matemáticas',
  date: new Date(),
});
```

### 5. **getUserNotifications()**
Obtener notificaciones de un usuario.

```typescript
const notifications = await getUserNotifications(userId, unreadOnly);
```

### 6. **markNotificationAsRead()**
Marcar una notificación como leída.

```typescript
await markNotificationAsRead(notificationId);
```

### 7. **markAllNotificationsAsRead()**
Marcar todas como leídas.

```typescript
await markAllNotificationsAsRead(userId);
```

### 8. **getUnreadNotificationCount()**
Contar notificaciones sin leer.

```typescript
const count = await getUnreadNotificationCount(userId);
```

---

## 🔌 API Routes

### 1. **GET `/api/notifications`**
Obtener notificaciones del usuario.

**Query Params:**
- `userId`: ID del usuario

**Response:**
```json
{
  "notifications": [...],
  "unreadCount": 3
}
```

### 2. **GET `/api/notifications/count`**
Contar notificaciones sin leer.

**Query Params:**
- `userId`: ID del usuario

**Response:**
```json
{
  "count": 3
}
```

### 3. **POST `/api/notifications/[id]/read`**
Marcar una notificación como leída.

**Params:**
- `id`: ID de la notificación

**Response:**
```json
{
  "success": true
}
```

### 4. **POST `/api/notifications/read-all`**
Marcar todas las notificaciones de un usuario como leídas.

**Body:**
```json
{
  "userId": "user123"
}
```

**Response:**
```json
{
  "success": true
}
```

---

## ⚙️ Cómo Agregar Nuevos Disparadores

### Paso 1: Definir el tipo de notificación
En `lib/notifications.ts`:
```typescript
export type NotificationType = 
  | 'EXISTING_TYPES'
  | 'NEW_TYPE'; // Agregar aquí
```

### Paso 2: Crear la función helper
En `lib/notifications.ts`:
```typescript
export async function notifyNewEvent(params: {
  userId: string;
  someData: string;
}) {
  await createNotification({
    userId: params.userId,
    type: 'NEW_TYPE',
    title: '🎯 Título',
    message: `Mensaje: ${params.someData}`,
    link: '/some/link',
  });
}
```

### Paso 3: Llamar la función en la acción correspondiente
En el archivo de server action:
```typescript
import { notifyNewEvent } from '@/lib/notifications';

// Dentro de la función
await notifyNewEvent({
  userId: targetUser.id,
  someData: 'datos relevantes',
});
```

### Paso 4: Agregar el icono correspondiente
En `components/notification-bell.tsx`:
```typescript
function getNotificationIcon(type: string) {
  switch (type) {
    // ... casos existentes
    case 'NEW_TYPE':
      return '🎯'; // Agregar aquí
    default:
      return '🔔';
  }
}
```

---

## 🔄 Actualización Automática

El componente `NotificationBell` actualiza el contador cada **30 segundos**:

```typescript
useEffect(() => {
  loadUnreadCount();
  const interval = setInterval(loadUnreadCount, 30000);
  return () => clearInterval(interval);
}, [userId]);
```

Para cambiar la frecuencia, modifica `30000` (milisegundos).

---

## 🎨 Diseño PulseTec Control

### Colores:
- **Punto rojo**: `bg-red-500` (notificaciones sin leer)
- **Fondo no leída**: `bg-primary/5` (azul suave)
- **Punto indicador**: `bg-primary` (azul claro)
- **Hover**: `hover:bg-light/50`

### Tipografía:
- **Título**: Inter Medium, 14px
- **Mensaje**: Inter Regular, 12px
- **Tiempo**: Inter Regular, 11px, `text-gray/70`

### Iconos:
- Campana: `Bell` de Lucide
- Check: `Check` (marcar como leída)
- Check doble: `CheckCheck` (marcar todas)

---

## 📋 Ejemplos de Notificaciones

### Tarea Calificada:
```
✅ Tarea Calificada
Tu tarea "Ensayo sobre la Revolución" ha sido calificada: 9.5/10
hace 10 minutos
→ Click: /student/assignments/abc123
```

### Nueva Entrega:
```
📤 Nueva Entrega
Juan Pérez ha entregado "Tarea 1"
hace 2 minutos
→ Click: /teacher/assignments/abc123
```

### Falta Registrada:
```
⚠️ Falta Registrada
Se registró una falta en Matemáticas el 28/01/2026
hace 1 hora
→ Click: /student/dashboard
```

### Tarea Próxima a Vencer:
```
⏰ Tarea Próxima a Vencer
La tarea "Proyecto Final" vence en 2 días
hace 5 horas
→ Click: /student/assignments/abc123
```

---

## ✅ Estado Actual

- ✅ **Modelo de BD**: Implementado
- ✅ **Librería de funciones**: Completa
- ✅ **API Routes**: Implementadas
- ✅ **Componente UI**: Completo con dropdown
- ✅ **Integración en Navbar**: Listo
- ✅ **Trigger**: Alumno entrega tarea → Notifica al docente
- ⏳ **Trigger**: Docente califica → Notificar al alumno (pendiente)
- ⏳ **Trigger**: Marca falta → Notificar al alumno (pendiente)
- ⏳ **Página de notificaciones**: `/notifications` (futura)

---

## 🚀 Para Probar

### 1. Reiniciar el servidor:
```bash
# Detener
Ctrl + C

# Ejecutar prisma generate
npx prisma generate

# Reiniciar
npm run dev
```

### 2. Probar entrega de tarea:
```
1. Login como ALUMNO
2. Ve a "Mis Tareas"
3. Entra a una tarea pendiente
4. Entrega la tarea (texto o URL)
5. Logout
6. Login como DOCENTE (que tiene asignada esa tarea)
7. Click en la campanita
8. Deberías ver: "📤 Nueva Entrega: [Alumno] ha entregado [Tarea]"
```

### 3. Verificar contador:
- El punto rojo debe aparecer con el número de notificaciones
- El dropdown debe mostrar las notificaciones
- Click en una notificación → Marca como leída + navega

---

## 📝 Notas Técnicas

### Performance:
- Las notificaciones se cargan solo al abrir el dropdown
- El contador se actualiza cada 30 segundos (configurable)
- Límite de 10 notificaciones en el dropdown
- Límite de 20 notificaciones en la API

### Seguridad:
- Las API routes NO validan sesión actualmente (mejora futura)
- Considera agregar validación de que el `userId` coincide con la sesión

### Mejoras Futuras:
- WebSockets para notificaciones en tiempo real (sin polling)
- Push notifications en el navegador
- Sonido al recibir notificación
- Página completa de historial de notificaciones
- Filtros por tipo de notificación
- Notificaciones por email (opcional)

---

**¡El sistema de notificaciones está completo y funcional! 🔔✨**


