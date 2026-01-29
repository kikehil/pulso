# 👔 MÓDULO DE COORDINADOR - PULSO CONTROL ACADÉMICO

## 🎯 Descripción General

El rol **COORDINADOR** es un rol híbrido que combina los permisos de **ADMIN** y **DOCENTE**, diseñado para personal académico que necesita tanto gestionar la institución como impartir clases.

---

## 🔐 PERMISOS DEL ROL COORDINADOR

### ✅ **Permisos de Administrador**
- Gestionar Alumnos (crear, editar, eliminar, inscribir)
- Gestionar Docentes (crear, editar, asignar materias)
- Gestionar Coordinadores (crear, editar otros coordinadores)
- Gestionar Carreras y Materias
- Gestionar Grupos
- Ver y gestionar Usuarios del sistema
- Acceso completo al Dashboard de Admin (`/dashboard`)

### ✅ **Permisos de Docente**
- Ver "Mis Clases" (grupos asignados)
- Acceder al Calendario de Horarios
- Tomar Asistencia y calcular estadísticas
- Crear y gestionar Actividades y Rúbricas
- Calificar tareas y ver entregas de alumnos
- Generar Reportes (PDF de asistencia, Excel de calificaciones)
- Acceso completo al Portal del Docente (`/teacher/dashboard`)

### ✅ **Permisos Adicionales**
- Supervisar el Portal del Alumno (`/student/*`)
- Acceso a notificaciones de toda la institución
- Crear y gestionar otros coordinadores

---

## 📊 BASE DE DATOS

### Modelo User (Actualizado)

```prisma
model User {
  id           String   @id @default(cuid())
  universityId String
  email        String   @unique
  password     String   // Hash bcrypt
  role         String   @default("ALUMNO") // ADMIN, DOCENTE, ALUMNO, COORDINADOR ← NUEVO
  isActive     Boolean  @default(true)
  
  // Relaciones opcionales con perfiles
  teacherId    String?  @unique  // Si es COORDINADOR o DOCENTE
  studentId    String?  @unique
  
  // ... relaciones
}
```

**Roles Disponibles:**
- `ADMIN` - Administrador puro
- `DOCENTE` - Docente puro
- `ALUMNO` - Estudiante
- `COORDINADOR` - **NUEVO** - Permisos de Admin + Docente

---

## 🛡️ MIDDLEWARE Y SEGURIDAD

### Redirecciones Automáticas

```typescript
// middleware.ts

// Al hacer login:
if (role === 'COORDINADOR') {
  redirect('/teacher/dashboard'); // Redirige al portal docente por defecto
}

// Permisos de acceso:
- /dashboard/* → ADMIN, COORDINADOR ✅
- /teacher/* → DOCENTE, COORDINADOR, ADMIN ✅
- /student/* → ALUMNO, COORDINADOR, ADMIN ✅
- /dashboard/usuarios → ADMIN, COORDINADOR ✅
```

### Validación en Server Actions

```typescript
// Ejemplo: Crear un alumno
export async function createStudent(data) {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;
  
  // Solo ADMIN y COORDINADOR pueden crear alumnos
  if (role !== 'ADMIN' && role !== 'COORDINADOR') {
    throw new Error('No tienes permisos');
  }
  
  // ... lógica de creación
}
```

---

## 🎨 INTERFAZ DE USUARIO

### 1. **Página de Gestión de Coordinadores**

**Ruta:** `/dashboard/coordinadores`

**Características:**
- Lista de todos los coordinadores registrados
- Buscador por nombre o email
- Cards de estadísticas:
  - Total de coordinadores
  - Coordinadores activos
  - Coordinadores con clases asignadas
- Tabla con información completa
- Botones de acción (Editar, Eliminar)
- Info card explicando los permisos del rol

**Diseño:**
```
┌─────────────────────────────────────────────────────┐
│ 🛡️ Coordinadores                  [+ Nuevo Coord]  │
├─────────────────────────────────────────────────────┤
│ [Total: 5] [Activos: 4] [Con Clases: 3]           │
├─────────────────────────────────────────────────────┤
│ 🔍 Buscar coordinadores...                         │
├─────────────────────────────────────────────────────┤
│ Nombre         Email           Depto      Estado   │
│ Juan Pérez     juan@...        Admin      Activo   │
│ María López    maria@...       Sistemas   Activo   │
└─────────────────────────────────────────────────────┘
```

### 2. **Sidebar del Admin (Actualizado)**

**Nuevo ítem de menú:**
```typescript
{
  title: 'Coordinadores',
  icon: Shield,
  href: '/dashboard/coordinadores',
}
```

**Posición:** Entre "Docentes" y "Carreras"

### 3. **Navbar (Actualizado)**

**Función `getRoleName()` actualizada:**
```typescript
const roles = {
  ADMIN: 'Administrador',
  DOCENTE: 'Docente',
  ALUMNO: 'Alumno',
  COORDINADOR: 'Coordinador', // ← NUEVO
};
```

**Badge de rol:** Se muestra "Coordinador" en el menú de perfil

---

## 🔄 FLUJO DE USUARIO COORDINADOR

### Al Iniciar Sesión:

1. **Login** → Email + Contraseña
2. **Validación** → NextAuth verifica credenciales
3. **Redirección** → `/teacher/dashboard` (Portal Docente)
4. **Sidebar visible:**
   - Mis Clases
   - Calendario
   - Mensajes
   - Perfil

### Navegación Disponible:

```
Coordinador puede acceder a:
├── /teacher/dashboard        ← Vista principal
├── /teacher/calendar         ← Calendario de horarios
├── /teacher/class/[id]       ← Gestión de clase específica
│   ├── Tab: Asistencia
│   ├── Tab: Actividades y Rúbricas
│   ├── Tab: Calificaciones
│   └── Tab: Reportes
├── /dashboard                ← Dashboard de Admin
├── /dashboard/alumnos        ← Gestión de alumnos
├── /dashboard/docentes       ← Gestión de docentes
├── /dashboard/coordinadores  ← Gestión de coordinadores
├── /dashboard/carreras       ← Gestión de carreras
├── /dashboard/materias       ← Gestión de materias
├── /dashboard/grupos         ← Gestión de grupos
├── /dashboard/usuarios       ← Gestión de usuarios
└── /student/*                ← Supervisión del portal alumno
```

---

## 📋 CREACIÓN DE UN COORDINADOR

### Opción 1: Desde la UI (Futuro)

```
1. Admin/Coordinador va a /dashboard/coordinadores
2. Click en "Nuevo Coordinador"
3. Formulario:
   - Email *
   - Contraseña *
   - Nombre *
   - Apellido *
   - Departamento
   - Teléfono
4. Sistema crea:
   - Usuario con role='COORDINADOR'
   - Perfil de Teacher (para poder dar clases)
5. El coordinador puede:
   - Iniciar sesión
   - Ver sus clases (si se le asignan)
   - Gestionar la institución
```

### Opción 2: Desde la Base de Datos (Actual)

```sql
-- 1. Crear el perfil de Teacher
INSERT INTO teachers (id, universityId, email, firstName, lastName, isActive)
VALUES ('teacher_coord_1', 'univ_id', 'coordinador@ejemplo.com', 'Juan', 'Pérez', 1);

-- 2. Crear el usuario con rol COORDINADOR
INSERT INTO users (id, universityId, email, password, role, teacherId, isActive)
VALUES (
  'user_coord_1',
  'univ_id',
  'coordinador@ejemplo.com',
  '$2a$10$...', -- Hash de la contraseña
  'COORDINADOR',
  'teacher_coord_1',
  1
);
```

---

## 🎨 DISEÑO PULSETEC

### Colores del Rol Coordinador

```css
/* Color principal: Púrpura (diferenciador) */
.coordinator-badge {
  background: #9333EA;  /* Purple 600 */
  color: white;
}

.coordinator-icon {
  background: #F3E8FF;  /* Purple 100 */
  color: #9333EA;       /* Purple 600 */
}

/* En la página de coordinadores */
.coordinator-card {
  border-left: 4px solid #9333EA;
}
```

### Iconos

- **Ícono principal:** `Shield` (Lucide React)
- **Color:** Púrpura (#9333EA)
- **Uso:** Sidebar, cards, badges

---

## 🚀 FUNCIONALIDADES IMPLEMENTADAS

### ✅ Backend
- [x] Modelo User actualizado con rol COORDINADOR
- [x] Middleware con permisos de COORDINADOR
- [x] Redirecciones automáticas según rol
- [x] Validación de permisos en rutas

### ✅ Frontend
- [x] Página `/dashboard/coordinadores`
- [x] Ítem de menú en Sidebar Admin
- [x] Badge de rol en Navbar
- [x] Diseño PulseTec aplicado

### 🔄 Pendiente (Fase 2)
- [ ] Formulario de creación de coordinadores
- [ ] Edición de coordinadores existentes
- [ ] Asignación de materias/grupos a coordinadores
- [ ] Dashboard específico para coordinadores
- [ ] Reportes de actividad de coordinadores

---

## 📖 CASOS DE USO

### Caso 1: Coordinador de Carrera
```
Perfil: Coordinador de Ingeniería en Sistemas
Tareas:
- Gestiona alumnos de la carrera
- Imparte 2 materias (Programación I y Base de Datos)
- Revisa el desempeño general de la carrera
- Genera reportes para la dirección
```

### Caso 2: Coordinador Académico
```
Perfil: Coordinador Académico General
Tareas:
- Supervisa a todos los docentes
- Gestiona horarios y grupos
- Imparte 1 materia (Metodología de la Investigación)
- Accede a estadísticas globales
```

### Caso 3: Coordinador de Área
```
Perfil: Coordinador del Área de Matemáticas
Tareas:
- Gestiona docentes del área
- Imparte 3 materias de matemáticas
- Revisa calificaciones del área
- Coordina actividades interdisciplinarias
```

---

## 🔍 DIFERENCIAS ENTRE ROLES

| Característica | ADMIN | DOCENTE | COORDINADOR | ALUMNO |
|---------------|-------|---------|-------------|--------|
| Gestionar Alumnos | ✅ | ❌ | ✅ | ❌ |
| Gestionar Docentes | ✅ | ❌ | ✅ | ❌ |
| Impartir Clases | ❌ | ✅ | ✅ | ❌ |
| Tomar Asistencia | ❌ | ✅ | ✅ | ❌ |
| Calificar Tareas | ❌ | ✅ | ✅ | ❌ |
| Ver Dashboard Admin | ✅ | ❌ | ✅ | ❌ |
| Ver Portal Docente | ❌ | ✅ | ✅ | ❌ |
| Entregar Tareas | ❌ | ❌ | ❌ | ✅ |
| Ver Calificaciones | ❌ | ✅ | ✅ | ✅ |

---

## 🐛 TROUBLESHOOTING

### Problema: "Coordinador no puede acceder al dashboard"
**Solución:** Verifica que el middleware esté actualizado y que el rol sea exactamente 'COORDINADOR' (mayúsculas).

### Problema: "Coordinador no aparece en la lista de docentes"
**Solución:** Asegúrate de que el usuario tenga un `teacherId` asociado en la tabla `users`.

### Problema: "No puedo crear un coordinador"
**Solución:** Actualmente la creación es manual. Implementa el formulario o usa SQL directo.

---

## 📄 ARCHIVOS MODIFICADOS

```
prisma/
└── schema.prisma                    # Rol COORDINADOR agregado

middleware.ts                        # Permisos y redirecciones

components/
├── navbar.tsx                       # Badge de rol
└── sidebar.tsx                      # Ítem de menú "Coordinadores"

app/
└── dashboard/
    └── coordinadores/
        └── page.tsx                 # Nueva página de gestión
```

---

## ✅ ESTADO DEL MÓDULO

**Status:** ✅ **IMPLEMENTADO Y FUNCIONAL**

- ✅ Rol COORDINADOR en base de datos
- ✅ Middleware con permisos completos
- ✅ Página de gestión de coordinadores
- ✅ Integración en sidebar y navbar
- ✅ Diseño PulseTec aplicado

**Versión:** 1.0.0  
**Fecha:** 28 de Enero de 2026  
**Autor:** Pulso Control Académico

---

> 💎 **Pulso Control**: "El latido de tu gestión académica"


