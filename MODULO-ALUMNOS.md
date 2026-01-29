# 👨‍🎓 Módulo de Alumnos - PulseTec Control

## ✅ Implementación Completa

Módulo profesional de gestión de alumnos con upload de foto, selección única de carrera y múltiples materias.

---

## 🎯 Características Implementadas

### ✅ 1. Upload de Foto de Perfil
- **Preview circular** con tamaño 96x96px
- **Avatar genérico** en gris (#64748B) por defecto
- **Botón Electric Cyan** (#06B6D4) para subir foto
- **Drag & Drop** para arrastrar imágenes
- **Validaciones**: JPG, PNG, GIF (máx 5MB)
- **Botón eliminar** en la esquina del preview

### ✅ 2. Formulario de Alta Completo
- **Datos Personales**: Nombre, Apellido, Email, Matrícula
- **Inputs PulseTec**: Border #64748B → #06B6D4 en focus
- **Carrera**: Single select obligatorio (dropdown)
- **Materias**: Multi-select habilitado solo después de seleccionar carrera
- **Validación**: Email único por universidad

### ✅ 3. Vista en Tabla
- **Foto miniatura** circular (40x40px) junto al nombre
- **Badge de carrera** con fondo Midnight Blue (#0F172A) y texto blanco
- **Contador de materias** inscritas
- **Botones minimalistas** de Editar/Eliminar
- **Hover effects** en las filas
- **Responsive** completo

### ✅ 4. Lógica de Negocio
- **Carrera obligatoria**: No se puede crear alumno sin carrera
- **Materias por carrera**: Solo se muestran materias de la carrera seleccionada
- **Relación 1:N**: Un alumno → Una carrera
- **Relación N:M**: Un alumno → Múltiples materias

---

## 📁 Archivos Creados

### 1. **Componente de Upload**
`components/image-upload.tsx`

**Características:**
- ✅ Preview circular con Image de Next.js
- ✅ Avatar genérico con icono User
- ✅ Drag & drop funcional
- ✅ Validación de tipo y tamaño
- ✅ Botón eliminar foto
- ✅ Estilo PulseTec completo

### 2. **Server Actions**
`app/dashboard/alumnos/actions.ts`

**Funciones:**
- `getStudents()` - Con carrera y materias
- `createStudent()` - Con relaciones
- `updateStudent()` - Actualiza relaciones
- `deleteStudent()` - Soft delete
- `getAvailableCareers()` - Para el dropdown
- `getSubjectsByCareer()` - Materias filtradas por carrera
- `searchStudents()` - Búsqueda completa

### 3. **Página Principal**
`app/dashboard/alumnos/page.tsx`

**Vista:**
- Tabla responsive con todas las columnas
- Upload de foto en modal
- Dropdown para carrera
- Multi-select para materias (habilitado condicionalmente)
- Búsqueda en tiempo real

---

## 🗄️ Cambios en Base de Datos

### Modelo Student Actualizado

```prisma
model Student {
  id           String   @id @default(cuid())
  universityId String
  courseId     String?   // 🆕 Carrera única (single select)
  email        String
  firstName    String
  lastName     String
  enrollmentId String?
  avatarUrl    String?   // Para la foto de perfil
  isActive     Boolean  @default(true)
  
  // Relaciones
  course          Course? @relation(...)           // 🆕 Carrera única
  studentSubjects StudentSubject[]                 // 🆕 Materias múltiples
}
```

### Nueva Tabla: StudentSubject

```prisma
model StudentSubject {
  id         String   @id @default(cuid())
  studentId  String
  subjectId  String
  enrolledAt DateTime @default(now())
  
  student   Student @relation(...)
  subject   Subject @relation(...)
  
  @@unique([studentId, subjectId])
}
```

---

## 🎨 Diseño PulseTec Aplicado

### Tabla

```
┌─────────────────────────────────────────────────────────────────┐
│ ENCABEZADO (Midnight Blue #0F172A con texto blanco)            │
├─────────────────────────────────────────────────────────────────┤
│ 👤 Foto | Nombre | Matrícula | Email | [Badge Carrera] | ...  │
├─────────────────────────────────────────────────────────────────┤
│ 🔵 Juan  | A00123  | juan@... | [ING-SIS] | 5 materias | ✏️🗑️ │
│    Pérez |         |          |           |            |       │
├─────────────────────────────────────────────────────────────────┤
│ 🔵 María | A00124  | maria@.. | [ING-IND] | 3 materias | ✏️🗑️ │
│    López |         |          |           |            |       │
└─────────────────────────────────────────────────────────────────┘
```

### Upload de Foto

```
┌────────────────────────────────────────┐
│ Foto de Perfil                         │
├────────────────────────────────────────┤
│  ┌──────┐                              │
│  │  👤  │  [📤 Subir Foto]            │ ← Botón Cyan
│  └──────┘  JPG, PNG o GIF. Máx 5MB   │
│  Preview    ┌──────────────────────┐  │
│  Circular   │ O arrastra imagen    │  │ ← Drag & Drop
│             └──────────────────────┘  │
└────────────────────────────────────────┘
```

### Lógica de Materias

```
┌────────────────────────────────────────┐
│ Carrera *                              │
│ [Selecciona una carrera...     ▼]     │
└────────────────────────────────────────┘
              ↓ Selecciona carrera
┌────────────────────────────────────────┐
│ Materias                               │
│ [MAT-101 ×] [FIS-101 ×]               │
│ 2 seleccionados              [▼]      │
└────────────────────────────────────────┘
```

**Si NO hay carrera:**
```
┌────────────────────────────────────────┐
│ 💡 Selecciona una carrera para        │
│    habilitar la selección de materias │
└────────────────────────────────────────┘
```

---

## 🎯 Flujo de Uso

### Crear Alumno

1. **Click "Nuevo Alumno"**
2. **Subir foto** (opcional):
   - Click en "Subir Foto" o arrastra imagen
   - Preview aparece en círculo
   - Click X para eliminar
3. **Completar datos**:
   - Nombre, Apellido (requeridos)
   - Email (requerido, único)
   - Matrícula (opcional)
4. **Seleccionar carrera** (requerido):
   - Dropdown con lista de carreras
   - Se habilita el multi-select de materias
5. **Seleccionar materias** (opcional):
   - Solo materias de la carrera seleccionada
   - Multi-select con búsqueda
6. **Guardar**:
   - Validaciones automáticas
   - Modal se cierra en 800ms
   - Tabla se actualiza

### Editar Alumno

1. **Click en botón Editar (✏️)**
2. **Foto se carga** si existe
3. **Email bloqueado** (no editable)
4. **Modificar lo necesario**
5. **Cambiar carrera**:
   - Se recargan materias de la nueva carrera
   - Materias anteriores se eliminan
6. **Guardar cambios**

---

## 📊 Estructura de Datos

### Student (Alumno)

```typescript
{
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  enrollmentId: string | null;
  avatarUrl: string | null;       // 🆕 Foto de perfil
  isActive: boolean;
  course: {                        // 🆕 Carrera única
    id: string;
    name: string;
    code: string;
  } | null;
  subjects: Array<{                // 🆕 Materias múltiples
    id: string;
    name: string;
    code: string;
  }>;
}
```

---

## 🎨 Colores PulseTec

### Encabezados de Tabla
```css
background: #0F172A (Midnight Blue)
color: #FFFFFF (White)
font: Inter Bold
```

### Badge de Carrera
```css
background: #0F172A (Midnight Blue)
color: #FFFFFF (White)
padding: 4px 12px
border-radius: 6px
font: Inter Medium
```

### Botón Subir Foto
```css
color: #06B6D4 (Electric Cyan)
background: rgba(6, 182, 212, 0.1)
hover: rgba(6, 182, 212, 0.2)
```

### Avatar Genérico
```css
background: #E5E7EB (Gray-200)
icon-color: #64748B (Gray)
```

### Inputs
```css
border: #64748B (Gray)     /* Estado normal */
focus-border: #06B6D4      /* Al hacer focus */
focus-ring: rgba(6, 182, 212, 0.2)
```

---

## 📱 Responsive Design

### Desktop (> 1024px)
- Tabla completa con todas las columnas
- Fotos 40x40px
- Acciones visibles

### Tablet (768px - 1024px)
- Tabla con scroll horizontal
- Todas las columnas visibles
- Fotos 36x36px

### Mobile (< 768px)
- Tabla con scroll horizontal
- Columnas prioritarias visibles
- Fotos 32x32px
- Botones de acción compactos

---

## 🔐 Validaciones

### Frontend
- ✅ Email formato válido
- ✅ Carrera requerida
- ✅ Nombres no vacíos
- ✅ Imagen tipo y tamaño válidos

### Backend
- ✅ Email único por universidad
- ✅ Carrera existe y pertenece a universidad
- ✅ Materias existen y pertenecen a la carrera
- ✅ Alumno pertenece a universidad (multi-tenant)

---

## 💡 Características Especiales

### 1. **Materias Filtradas Dinámicamente**

Al seleccionar una carrera, automáticamente se cargan solo las materias de esa carrera:

```typescript
const handleCareerChange = async (courseId: string) => {
  // Limpiar materias seleccionadas
  setFormData({ ...formData, courseId, subjectIds: [] });
  
  // Cargar materias de la carrera
  const subjects = await getSubjectsByCareer(courseId);
  setSubjectOptions(subjects);
};
```

### 2. **Habilitación Condicional**

El multi-select de materias solo se habilita si hay una carrera seleccionada:

```tsx
{formData.courseId && (
  <MultiSelect
    label="Materias"
    options={subjectOptions}
    selected={formData.subjectIds}
    onChange={...}
  />
)}

{!formData.courseId && (
  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
    💡 Selecciona una carrera para habilitar la selección de materias
  </div>
)}
```

### 3. **Preview Inmediato de Imagen**

```typescript
const handleFileChange = (file: File | null) => {
  const reader = new FileReader();
  reader.onloadend = () => {
    const previewUrl = reader.result as string;
    setPreview(previewUrl);
    onChange(file, previewUrl);
  };
  reader.readAsDataURL(file);
};
```

### 4. **Drag & Drop**

```typescript
const handleDrop = (e: React.DragEvent) => {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  if (file) handleFileChange(file);
};
```

---

## 🆘 Solución de Problemas

### No aparecen carreras en el dropdown
**Causa:** No hay carreras creadas  
**Solución:** Ve a `/dashboard/carreras` y crea algunas

### No aparecen materias después de seleccionar carrera
**Causa:** La carrera no tiene materias asignadas  
**Solución:** Necesitas crear materias asociadas a esa carrera

### Error al subir imagen
**Causa:** Imagen muy grande o formato no soportado  
**Solución:** Usa JPG, PNG o GIF menor a 5MB

### La foto no se guarda
**Causa:** Las imágenes se guardan como base64 en el campo `avatarUrl`  
**Solución:** Para producción, considera usar un servicio de almacenamiento (S3, Cloudinary)

---

## 📈 Próximas Mejoras

1. **Upload a Cloud Storage**: Integrar S3/Cloudinary para fotos
2. **Kardex**: Ver historial de calificaciones
3. **Horarios**: Visualizar horario del alumno
4. **Asistencias**: Registro y visualización
5. **Pagos**: Estado de pagos y colegiaturas
6. **Documentos**: Subir y gestionar documentos
7. **Exportar**: Lista de alumnos a Excel/PDF
8. **Importar**: Carga masiva desde CSV

---

## ✅ Checklist de Funcionalidades

- [x] Vista en tabla con foto miniatura
- [x] Upload de foto con preview circular
- [x] Avatar genérico por defecto
- [x] Drag & drop para imágenes
- [x] Validación de imagen (tipo y tamaño)
- [x] Formulario completo de datos
- [x] Carrera única (single select obligatorio)
- [x] Materias múltiples (multi-select condicional)
- [x] Materias filtradas por carrera
- [x] Badge de carrera Midnight Blue
- [x] Botones minimalistas
- [x] Búsqueda en tiempo real
- [x] Email único validado
- [x] Soft delete
- [x] Responsive completo
- [x] Estilo PulseTec aplicado

---

## 🎉 ¡Listo para Usar!

### Aplicar Migración (Ya aplicada)
```bash
npx prisma generate
npx prisma db push
```

### Acceder al Módulo
```
http://localhost:3000/dashboard/alumnos
```

---

**Versión**: 1.0.0  
**Fecha**: Enero 2026  
**Estilo**: PulseTec Control  
**Estado**: ✅ Completado con Upload de Foto y Lógica de Negocio


