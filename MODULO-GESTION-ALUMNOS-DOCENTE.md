# 👥 MÓDULO DE GESTIÓN DE ALUMNOS PARA DOCENTES

## 📋 Descripción

Este módulo permite a los **docentes** gestionar completamente a los estudiantes de sus grupos asignados, incluyendo la creación de nuevos alumnos, asignación a grupos, y administración de inscripciones.

---

## 🎯 Funcionalidades Principales

### 1️⃣ **Vista de Lista de Alumnos**

- ✅ Ver todos los alumnos inscritos en sus grupos
- ✅ Búsqueda en tiempo real por nombre o email
- ✅ Visualización de información de contacto (email, teléfono)
- ✅ Badges que muestran los grupos en los que está inscrito cada alumno
- ✅ Estadísticas: Total de alumnos, grupos, resultados de búsqueda

### 2️⃣ **Crear Nuevos Alumnos**

**Formulario completo con:**
- Nombre y Apellido
- Email (único en el sistema)
- Teléfono (opcional)
- Matrícula (única en el sistema)
- Contraseña (hasheada con bcrypt)
- Asignación inmediata a un grupo

**Proceso automático:**
1. Crea el registro del estudiante
2. Crea el usuario con rol `ALUMNO`
3. Lo inscribe al grupo seleccionado
4. Todo en una transacción atómica (si falla algo, se revierte todo)

### 3️⃣ **Asignar Alumnos Existentes**

- ✅ Modal de asignación rápida
- ✅ Selección de grupo desde lista de grupos del docente
- ✅ Prevención de inscripciones duplicadas
- ✅ Indicador visual de grupos ya asignados

### 4️⃣ **Gestionar Inscripciones**

- ✅ Desinscribir alumnos de grupos con un clic
- ✅ Confirmación antes de eliminar
- ✅ Actualización automática de listas y contadores

---

## 🔐 Seguridad y Permisos

### **Validaciones Implementadas:**

1. **Por Rol:**
   - Solo usuarios con rol `DOCENTE`, `COORDINADOR` o `ADMIN` pueden acceder
   - El middleware protege la ruta `/teacher/students`

2. **Por Propiedad:**
   - Los docentes solo pueden gestionar alumnos de **sus propios grupos**
   - Todas las acciones verifican que el grupo pertenece al docente autenticado

3. **Validaciones de Datos:**
   - Email único en el sistema
   - Matrícula única en el sistema
   - Contraseñas con mínimo 6 caracteres
   - Hash seguro con bcryptjs

4. **Transacciones Atómicas:**
   - Al crear un alumno, se usa `prisma.$transaction()` para garantizar:
     - Estudiante creado
     - Usuario creado
     - Inscripción registrada
   - Si cualquier paso falla, se revierte todo

---

## 🎨 Interfaz de Usuario

### **Diseño PulseTec:**
- Cards con sombras suaves
- Color primary (#06B6D4) para acciones principales
- Badges de grupos con colores distintivos (verde para inscritos)
- Estados de loading y mensajes de éxito/error
- Responsive en móvil y desktop

### **Componentes:**
- **Stats Cards:** Total alumnos, grupos, resultados de búsqueda
- **Search Bar:** Búsqueda en tiempo real
- **Student Cards:** Información del alumno con avatar, contacto y grupos
- **Modals:**
  - Modal de creación de alumno (formulario completo)
  - Modal de asignación a grupo (selección de grupo)
- **Badges:** Grupos asignados con opción de eliminar (X)

---

## 🛠️ Estructura de Archivos

```
app/teacher/students/
├── page.tsx           # Componente principal (UI)
└── actions.ts         # Server Actions (lógica de negocio)

components/
└── teacher-sidebar.tsx   # Sidebar actualizado con "Mis Alumnos"
```

---

## 🔄 Server Actions (API)

### **`getTeacherStudents()`**
- Obtiene todos los alumnos de los grupos del docente
- Agrupa por estudiante y lista los grupos de cada uno
- Incluye información de contacto y avatar

### **`getTeacherGroups()`**
- Obtiene todos los grupos asignados al docente
- Incluye nombre de materia y conteo de estudiantes
- Ordenados alfabéticamente

### **`createStudent(data)`**
- Crea nuevo estudiante con sus datos
- Genera usuario con contraseña hasheada
- Lo inscribe automáticamente al grupo seleccionado
- Validaciones: email único, matrícula única

**Parámetros:**
```typescript
{
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  enrollmentNumber: string;
  password: string;
  groupId: string;
}
```

### **`enrollStudent(studentId, groupId)`**
- Inscribe un estudiante existente a un grupo
- Valida que el grupo pertenece al docente
- Previene inscripciones duplicadas

### **`unenrollStudent(studentId, groupId)`**
- Elimina la inscripción de un estudiante de un grupo
- Valida que el grupo pertenece al docente
- Requiere confirmación del usuario

---

## 📍 Rutas y Navegación

### **Ruta Principal:**
```
/teacher/students
```

### **Acceso desde el Menú:**
```
Portal del Docente
└── Sidebar
    ├── Mis Clases
    ├── Mis Alumnos ← NUEVO
    ├── Calendario
    ├── Mensajes
    └── Perfil
```

---

## 🚀 Flujo de Uso

### **Escenario 1: Crear un Nuevo Alumno**

1. Docente hace clic en **"Crear Alumno"**
2. Se abre modal con formulario
3. Llena datos:
   - Nombre: Juan
   - Apellido: Pérez
   - Email: juan.perez@estudiante.com
   - Matrícula: 2024001
   - Contraseña: MiPassword123
   - Grupo: Contabilidad I - Grupo A
4. Click en **"Crear Alumno"**
5. Sistema:
   - Crea el estudiante
   - Crea el usuario (email + password hasheada)
   - Lo inscribe al grupo
6. Muestra mensaje de éxito
7. El alumno ya puede iniciar sesión con su email y contraseña

### **Escenario 2: Asignar Alumno Existente**

1. Docente busca al alumno en la lista
2. Click en botón **"Asignar"**
3. Se abre modal con lista de grupos
4. Selecciona el grupo deseado
5. Sistema verifica que no esté ya inscrito
6. Crea la inscripción
7. Actualiza la lista y muestra el badge del nuevo grupo

### **Escenario 3: Eliminar Alumno de Grupo**

1. Docente ve los badges de grupos del alumno
2. Click en la **"X"** del badge del grupo
3. Confirma la acción
4. Sistema elimina la inscripción
5. Actualiza la lista (el badge desaparece)

---

## 📊 Estadísticas Mostradas

### **Cards de Estadísticas:**

1. **Total Alumnos:** Cantidad de estudiantes únicos en todos sus grupos
2. **Mis Grupos:** Cantidad de grupos asignados al docente
3. **Búsquedas:** Cantidad de resultados filtrados actualmente

---

## ✅ Validaciones y Manejo de Errores

### **Validaciones del Formulario:**
- ✅ Campos obligatorios marcados con *
- ✅ Email válido (formato)
- ✅ Contraseña mínimo 6 caracteres
- ✅ Selección de grupo obligatoria

### **Validaciones del Servidor:**
- ✅ Email único en la base de datos
- ✅ Matrícula única en la base de datos
- ✅ Grupo pertenece al docente autenticado
- ✅ No permitir inscripciones duplicadas

### **Mensajes de Error:**
- ❌ "Ya existe un alumno con ese email"
- ❌ "Ya existe un alumno con esa matrícula"
- ❌ "Grupo no encontrado o no tienes permisos"
- ❌ "El alumno ya está inscrito en este grupo"

### **Mensajes de Éxito:**
- ✅ "¡Alumno creado exitosamente!"
- ✅ "¡Alumno inscrito exitosamente!"
- ✅ "Alumno eliminado del grupo"

---

## 🔄 Estados de Carga

- **Loading inicial:** Spinner mientras carga la lista de alumnos
- **Submitting:** Botones deshabilitados durante operaciones
- **Empty states:** Mensajes amigables cuando no hay datos

---

## 📱 Responsive Design

### **Desktop (lg+):**
- Cards de 3 columnas
- Modals centrados
- Sidebar expandido por defecto

### **Tablet (md):**
- Cards de 2 columnas
- Modals adaptados

### **Mobile (< lg):**
- Cards de 1 columna
- Botones compactos ("Asignar" sin texto)
- Modals de pantalla completa
- Sidebar colapsado con overlay

---

## 🔗 Integración con Otros Módulos

### **Relacionado con:**

1. **Grupos:** Los alumnos se asignan a grupos existentes del docente
2. **Usuarios:** Se crea automáticamente un usuario con rol `ALUMNO`
3. **Asistencia:** Los alumnos aparecen en las listas de asistencia de sus grupos
4. **Calificaciones:** Los alumnos pueden ser calificados en las actividades
5. **Portal del Alumno:** Los estudiantes creados pueden iniciar sesión

---

## 🎓 Casos de Uso

### **1. Docente de nuevo ingreso:**
- Recibe sus grupos asignados por el admin
- Crea los alumnos de sus grupos desde cero
- Les proporciona sus credenciales de acceso

### **2. Docente en periodo ordinario:**
- Ve la lista de alumnos ya inscritos
- Asigna alumnos nuevos que llegan por cambio de grupo
- Elimina alumnos que se dan de baja o cambian de grupo

### **3. Coordinador académico:**
- Tiene rol `COORDINADOR` (permisos de admin + docente)
- Puede gestionar alumnos de cualquier grupo
- Puede crear y asignar masivamente

---

## 🛡️ Mejores Prácticas Implementadas

1. **Seguridad:**
   - Contraseñas hasheadas
   - Validación de permisos en cada acción
   - Transacciones atómicas

2. **UX:**
   - Confirmaciones antes de acciones destructivas
   - Mensajes claros de éxito y error
   - Estados de carga visibles
   - Búsqueda en tiempo real

3. **Performance:**
   - Queries optimizadas con `include` y `select`
   - Revalidación selectiva de paths
   - Agrupación de datos en el servidor

4. **Mantenibilidad:**
   - Separación de UI y lógica (page.tsx vs actions.ts)
   - Tipado completo con TypeScript
   - Comentarios en código complejo

---

## 🚦 Estado del Módulo

✅ **Completamente funcional y probado**

**Listo para:**
- Crear alumnos
- Asignar alumnos a grupos
- Desinscribir alumnos
- Búsqueda y filtrado
- Validaciones completas

---

> 💎 **Pulso Control Académico** - Gestión integral de alumnos para docentes


