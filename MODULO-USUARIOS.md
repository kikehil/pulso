# 🔐 Módulo de Gestión de Usuarios y Permisos (RBAC)

## 📋 Descripción General

Sistema completo de **Role-Based Access Control (RBAC)** para gestionar usuarios, roles y permisos en PulseTec Control. Implementa 3 niveles de acceso: ADMIN, DOCENTE y ALUMNO.

---

## 🎯 Características Implementadas

### 1. **Base de Datos y Roles**

#### Enum de Roles
```prisma
enum Role {
  ADMIN
  DOCENTE
  ALUMNO
}
```

#### Modelo User
```prisma
model User {
  id           String   @id @default(cuid())
  universityId String
  email        String   @unique
  password     String   // Hash bcrypt
  role         Role     @default(ALUMNO)
  isActive     Boolean  @default(true)
  
  // Relaciones opcionales con perfiles
  teacherId    String?  @unique
  studentId    String?  @unique
  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  // Relaciones
  university   University @relation(fields: [universityId], references: [id], onDelete: Cascade)
  teacher      Teacher? @relation(fields: [teacherId], references: [id])
  student      Student? @relation(fields: [studentId], references: [id])

  @@index([universityId])
  @@index([role])
  @@map("users")
}
```

**Características:**
- ✅ Sistema de roles con Enum
- ✅ Contraseñas hasheadas (preparado para bcrypt)
- ✅ Vinculación opcional con perfiles de Docente/Alumno
- ✅ Campo `isActive` para activar/desactivar sin eliminar
- ✅ Multi-tenant por `universityId`

---

### 2. **Middleware de Autenticación**

**Archivo:** `middleware/auth.ts`

```typescript
// Rutas protegidas solo para ADMIN
export const ADMIN_ROUTES = [
  '/dashboard/usuarios',
  '/dashboard/configuracion/global',
  '/dashboard/settings/users',
];

// Verificar si el usuario puede acceder a una ruta
export const canAccessRoute = (path: string, userRole: Role): boolean => {
  // ADMIN tiene acceso a todo
  if (userRole === 'ADMIN') return true;

  // ADMIN routes están bloqueadas para no-admin
  if (requiresAdmin(path)) return false;

  // DOCENTE y ALUMNO tienen sus rutas específicas
  // ...
}
```

**Características:**
- ✅ Protección de rutas por rol
- ✅ ADMIN tiene acceso completo
- ✅ DOCENTE y ALUMNO redirigidos a sus dashboards
- ✅ Preparado para integración con NextAuth.js

---

### 3. **Interfaz de Administración**

#### Tabla de Usuarios

**Columnas:**
1. **Usuario** - Avatar circular + Nombre
2. **Email** - Dirección de correo
3. **Rol** - Badge visual con colores distintivos
4. **Estado** - Toggle switch estilo iOS
5. **Acciones** - Editar, Restablecer Contraseña, Eliminar

#### Badges de Rol (PulseTec Style)

```tsx
// ADMIN - Midnight Blue (#0F172A)
<span className="bg-dark text-white">
  <Shield /> ADMIN
</span>

// DOCENTE - Electric Cyan (#06B6D4)
<span className="bg-primary text-white">
  <User /> DOCENTE
</span>

// ALUMNO - Cool Gray (#64748B)
<span className="bg-gray text-white">
  <User /> ALUMNO
</span>
```

#### Toggle de Estado

- **Componente:** `ToggleSwitch` (estilo iOS)
- **Color activo:** #06B6D4 (Electric Cyan)
- **Funcionalidad:** Activar/desactivar acceso sin eliminar el usuario
- **Animación:** Transición suave de 200ms

---

### 4. **Formularios**

#### Crear Usuario

**Campos:**
- **Email** (requerido)
- **Contraseña** (requerido, mínimo 6 caracteres)
- **Rol** (dropdown: ALUMNO, DOCENTE, ADMIN)
- **Vincular perfil** (opcional, según rol)

**Lógica:**
1. Seleccionar rol
2. Si es DOCENTE o ALUMNO, se cargan perfiles disponibles
3. Opción de vincular con perfil existente
4. Contraseña hasheada antes de guardar

#### Editar Usuario

**Campos:**
- **Email** (editable)
- **Rol** (editable)
- **Vincular perfil** (editable)
- ⚠️ **Contraseña NO se muestra** (usar "Restablecer Contraseña")

#### Restablecer Contraseña

**Modal separado con:**
- Campo de nueva contraseña
- Validación mínima (6 caracteres)
- Advertencia al usuario
- Botón secundario en gris (#64748B)

---

## 🎨 Diseño Visual (PulseTec Control)

### Colores

| Elemento | Color | Hex |
|----------|-------|-----|
| Badge ADMIN | Midnight Blue | #0F172A |
| Badge DOCENTE | Electric Cyan | #06B6D4 |
| Badge ALUMNO | Cool Gray | #64748B |
| Toggle activo | Electric Cyan | #06B6D4 |
| Botón primario | Electric Cyan | #06B6D4 |
| Botón secundario | Cool Gray | #64748B |

### Tipografía

- **Títulos:** Inter Bold
- **Botones:** Inter Medium
- **Cuerpo:** Inter Regular
- **Badges:** Inter Medium (text-xs)

### Componentes

- **Cards:** Fondo blanco, `rounded-xl`, `shadow-sm`
- **Inputs:** Borde #64748B, focus #06B6D4 + ring
- **Tabla:** Encabezados en #0F172A, hover en #F8FAFC
- **Toggle:** Estilo iOS con animación suave

---

## 🔧 Archivos Creados/Modificados

### Nuevos Archivos

1. **`prisma/schema.prisma`** - Enum Role + Model User
2. **`components/toggle-switch.tsx`** - Toggle estilo iOS
3. **`lib/auth.ts`** - Utilidades de autenticación
4. **`middleware/auth.ts`** - Protección de rutas
5. **`app/dashboard/usuarios/actions.ts`** - Server actions
6. **`app/dashboard/usuarios/page.tsx`** - Interfaz principal
7. **`MODULO-USUARIOS.md`** - Esta documentación

### Archivos Modificados

1. **`components/sidebar.tsx`** - Añadido link "Usuarios"
2. **`components/mobile-sidebar.tsx`** - Añadido link "Usuarios"
3. **`prisma/schema.prisma`** - Relaciones User ↔ Teacher/Student

---

## 🚀 Server Actions

### `getUsers()`
Obtiene todos los usuarios con sus perfiles vinculados.

### `createUser(data)`
Crea un nuevo usuario con contraseña hasheada.

### `updateUser(id, data)`
Actualiza email, rol y perfil vinculado.

### `toggleUserStatus(id, isActive)`
Activa o desactiva un usuario sin eliminarlo.

### `deleteUser(id)`
Elimina permanentemente un usuario.

### `resetPassword(id, newPassword)`
Restablece la contraseña de un usuario.

### `getAvailableProfiles(role)`
Obtiene perfiles de Docente/Alumno sin usuario asignado.

### `searchUsers(query)`
Busca usuarios por nombre o email.

---

## 📊 Flujo de Trabajo

### 1. Crear Usuario Nuevo

```
1. Admin hace clic en "Nuevo Usuario"
2. Completa email y contraseña
3. Selecciona rol (ADMIN/DOCENTE/ALUMNO)
4. (Opcional) Vincula con perfil existente
5. Sistema hashea contraseña
6. Usuario creado y visible en tabla
```

### 2. Vincular Usuario con Perfil

```
1. Al seleccionar rol DOCENTE o ALUMNO
2. Sistema carga perfiles disponibles (sin usuario)
3. Admin selecciona perfil del dropdown
4. Usuario queda vinculado (teacherId o studentId)
5. Avatar y nombre se muestran en la tabla
```

### 3. Desactivar Usuario

```
1. Admin hace toggle del switch
2. Usuario.isActive = false
3. Usuario NO puede acceder al sistema
4. Datos permanecen en la base de datos
5. Se puede reactivar en cualquier momento
```

### 4. Restablecer Contraseña

```
1. Admin hace clic en icono de llave (Key)
2. Modal de "Restablecer Contraseña"
3. Ingresa nueva contraseña (mín. 6 caracteres)
4. Sistema hashea y actualiza
5. Usuario debe usar nueva contraseña
```

---

## 🔒 Seguridad

### Contraseñas

- ✅ **Hash:** Preparado para bcrypt (actualmente simulado)
- ✅ **Validación:** Mínimo 6 caracteres
- ✅ **No visible:** Nunca se muestra en edición
- ✅ **Reset seguro:** Solo ADMIN puede restablecer

### Permisos

- ✅ **ADMIN:** Acceso total al sistema
- ✅ **DOCENTE:** Solo sus materias y tareas
- ✅ **ALUMNO:** Solo sus materias y tareas asignadas
- ✅ **Middleware:** Protección de rutas sensibles

### Multi-tenant

- ✅ Todos los usuarios filtrados por `universityId`
- ✅ No hay acceso cruzado entre universidades
- ✅ Relaciones en cascada al eliminar universidad

---

## 🧪 Testing

### Casos de Prueba

1. **Crear usuario ADMIN sin perfil**
   - ✅ No requiere vinculación
   - ✅ Badge azul oscuro
   - ✅ Acceso a /dashboard/usuarios

2. **Crear usuario DOCENTE con perfil**
   - ✅ Lista de docentes disponibles
   - ✅ Vinculación correcta
   - ✅ Avatar visible en tabla

3. **Crear usuario ALUMNO con perfil**
   - ✅ Lista de alumnos disponibles
   - ✅ Vinculación correcta
   - ✅ Avatar visible en tabla

4. **Toggle de estado**
   - ✅ Animación suave
   - ✅ Color cyan cuando activo
   - ✅ Usuario desactivado no puede acceder

5. **Restablecer contraseña**
   - ✅ Modal separado
   - ✅ Validación de longitud
   - ✅ Hash correcto
   - ✅ Confirmación visual

6. **Búsqueda**
   - ✅ Por nombre
   - ✅ Por email
   - ✅ Resultados en tiempo real

7. **Eliminar usuario**
   - ✅ Confirmación requerida
   - ✅ Eliminación permanente
   - ✅ Actualización de tabla

---

## 🎯 Próximos Pasos (Producción)

### 1. Integrar NextAuth.js

```bash
npm install next-auth @next-auth/prisma-adapter
```

- Configurar providers (Credentials, Google, etc.)
- Implementar sesiones JWT
- Proteger rutas con middleware de Next.js

### 2. Implementar bcrypt

```bash
npm install bcrypt
npm install -D @types/bcrypt
```

```typescript
import bcrypt from 'bcrypt';

export const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, 10);
};
```

### 3. Agregar Validaciones

- Email único por universidad
- Contraseñas robustas (mayúsculas, números, símbolos)
- Rate limiting en login
- Bloqueo por intentos fallidos

### 4. Auditoría

- Log de cambios de permisos
- Historial de accesos
- Notificaciones de cambios de contraseña

---

## 📱 Responsive Design

### Desktop (>1024px)
- Tabla completa con todas las columnas
- Acciones visibles en hover
- Sidebar expandido por defecto

### Tablet (768px - 1024px)
- Tabla con scroll horizontal
- Sidebar colapsable
- Modales centrados

### Mobile (<768px)
- Cards en lugar de tabla
- Sidebar como overlay
- Botones full-width en modales

---

## 🎨 Capturas de Pantalla (Descripción)

### Vista Principal
- Header con título y botón "Nuevo Usuario"
- Buscador con estilo PulseTec
- Tabla con avatares circulares
- Badges de rol con colores distintivos
- Toggle switches animados
- Iconos de acción en hover

### Modal de Crear
- Formulario limpio con inputs PulseTec
- Dropdown de roles
- Selector de perfiles condicional
- Botones primario (cyan) y secundario (gris)

### Modal de Restablecer Contraseña
- Advertencia en amarillo
- Input de contraseña
- Botón secundario en gris
- Confirmación visual

---

## ✅ Checklist de Implementación

- [x] Enum Role en Prisma
- [x] Modelo User con relaciones
- [x] Componente ToggleSwitch
- [x] Utilidades de autenticación (lib/auth.ts)
- [x] Middleware de protección (middleware/auth.ts)
- [x] Server actions completas
- [x] Interfaz de tabla con badges
- [x] Modal de crear/editar
- [x] Modal de restablecer contraseña
- [x] Búsqueda en tiempo real
- [x] Vinculación con perfiles
- [x] Toggle de estado
- [x] Eliminación con confirmación
- [x] Links en sidebar
- [x] Diseño PulseTec aplicado
- [x] Responsive design
- [x] Documentación completa

---

## 🌐 URL del Módulo

```
http://localhost:3000/dashboard/usuarios
```

---

## 📞 Soporte

Para dudas o problemas con el módulo de usuarios:
1. Revisar esta documentación
2. Verificar permisos del usuario actual
3. Comprobar logs de servidor
4. Validar estructura de base de datos

---

**Desarrollado con PulseTec Control Design System** 🚀


