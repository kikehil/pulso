# 🧪 Instrucciones de Testing - Módulo de Usuarios

## 🚀 Inicio Rápido

### 1. Verificar que el servidor esté corriendo

```bash
# El servidor debe estar en http://localhost:3000
# Si no está corriendo, ejecutar:
npm run dev
```

### 2. Acceder al módulo

```
URL: http://localhost:3000/dashboard/usuarios
```

---

## 📝 Casos de Prueba

### ✅ CASO 1: Crear Usuario ADMIN

**Objetivo:** Crear un administrador sin vincular a ningún perfil

**Pasos:**
1. Acceder a `http://localhost:3000/dashboard/usuarios`
2. Hacer clic en el botón **"+ Nuevo Usuario"** (esquina superior derecha)
3. Completar el formulario:
   - **Email:** `admin@universidad.edu`
   - **Contraseña:** `Admin123!`
   - **Rol:** Seleccionar **"Administrador"**
   - **Vincular perfil:** Dejar en **"Sin vincular"**
4. Hacer clic en **"Crear Usuario"**

**Resultado Esperado:**
- ✅ Mensaje verde: "Usuario creado exitosamente"
- ✅ Modal se cierra automáticamente después de 800ms
- ✅ Usuario aparece en la tabla con:
  - Avatar genérico (icono de usuario)
  - Email: `admin@universidad.edu`
  - Badge **ADMIN** con fondo #0F172A (azul oscuro)
  - Toggle en estado **ON** (cyan)

**Captura Visual:**
```
┌─────────────────────────────────────────┐
│ [👤]  Admin │ admin@... │ [ADMIN] │ [●──]│
│ (genérico) │           │ #0F172A │  ON  │
└─────────────────────────────────────────┘
```

---

### ✅ CASO 2: Crear Usuario DOCENTE (Vinculado)

**Objetivo:** Crear un docente y vincularlo con un perfil existente

**Pre-requisito:** Debe existir al menos un docente sin usuario asignado

**Pasos:**
1. Hacer clic en **"+ Nuevo Usuario"**
2. Completar:
   - **Email:** `profesor@universidad.edu`
   - **Contraseña:** `Docente123!`
   - **Rol:** Seleccionar **"Docente"**
3. **Observar:** El dropdown "Vincular perfil" se llena automáticamente
4. Seleccionar un perfil de docente de la lista
5. Hacer clic en **"Crear Usuario"**

**Resultado Esperado:**
- ✅ Usuario creado exitosamente
- ✅ En la tabla aparece:
  - Avatar del docente (foto circular si tiene, o genérico)
  - Nombre completo del docente
  - Email del usuario
  - Badge **DOCENTE** con fondo #06B6D4 (cyan)
  - Toggle en ON

**Captura Visual:**
```
┌─────────────────────────────────────────┐
│ [📷] Juan P.│ prof@... │[DOCENTE]│ [●──]│
│ (su foto)  │          │ #06B6D4 │  ON  │
└─────────────────────────────────────────┘
```

---

### ✅ CASO 3: Crear Usuario ALUMNO (Vinculado)

**Objetivo:** Crear un alumno y vincularlo con un perfil existente

**Pre-requisito:** Debe existir al menos un alumno sin usuario asignado

**Pasos:**
1. Hacer clic en **"+ Nuevo Usuario"**
2. Completar:
   - **Email:** `alumno@universidad.edu`
   - **Contraseña:** `Alumno123!`
   - **Rol:** Seleccionar **"Alumno"**
3. Seleccionar un perfil de alumno de la lista
4. Hacer clic en **"Crear Usuario"**

**Resultado Esperado:**
- ✅ Usuario creado exitosamente
- ✅ Badge **ALUMNO** con fondo #64748B (gris)
- ✅ Avatar del alumno visible

**Captura Visual:**
```
┌─────────────────────────────────────────┐
│ [📷] María G│ alum@... │ [ALUMNO]│ [●──]│
│ (su foto)  │          │ #64748B │  ON  │
└─────────────────────────────────────────┘
```

---

### ✅ CASO 4: Toggle de Estado (Desactivar)

**Objetivo:** Desactivar un usuario sin eliminarlo

**Pasos:**
1. Localizar un usuario en la tabla
2. En la columna **"Estado"**, hacer clic en el **Toggle Switch**
3. Observar la animación del toggle

**Resultado Esperado:**
- ✅ Toggle se mueve de derecha a izquierda
- ✅ Color cambia de #06B6D4 (cyan) a #D1D5DB (gris)
- ✅ Mensaje verde: "Usuario desactivado exitosamente"
- ✅ Usuario permanece en la tabla pero con estado OFF

**Animación:**
```
Antes:  [●──────] ON  (cyan)
Después:[──────●] OFF (gris)
```

**Nota:** El usuario no podrá acceder al sistema, pero sus datos permanecen intactos.

---

### ✅ CASO 5: Toggle de Estado (Reactivar)

**Objetivo:** Reactivar un usuario desactivado

**Pasos:**
1. Localizar un usuario con toggle en OFF
2. Hacer clic en el toggle

**Resultado Esperado:**
- ✅ Toggle se mueve de izquierda a derecha
- ✅ Color cambia de gris a cyan
- ✅ Mensaje verde: "Usuario activado exitosamente"
- ✅ Usuario puede acceder nuevamente al sistema

---

### ✅ CASO 6: Búsqueda por Email

**Objetivo:** Buscar usuarios por su dirección de email

**Pasos:**
1. En el buscador superior, escribir: `admin@`
2. Observar los resultados en tiempo real

**Resultado Esperado:**
- ✅ Tabla se filtra automáticamente
- ✅ Solo muestra usuarios cuyo email contiene "admin@"
- ✅ Búsqueda es case-insensitive

---

### ✅ CASO 7: Búsqueda por Nombre

**Objetivo:** Buscar usuarios por nombre del perfil vinculado

**Pasos:**
1. En el buscador, escribir: `Juan`
2. Observar los resultados

**Resultado Esperado:**
- ✅ Muestra usuarios cuyo perfil vinculado tiene "Juan" en nombre o apellido
- ✅ Búsqueda en tiempo real

---

### ✅ CASO 8: Editar Usuario

**Objetivo:** Modificar email y rol de un usuario existente

**Pasos:**
1. Localizar un usuario en la tabla
2. Hacer clic en el icono de **lápiz (✏️)** en la columna "Acciones"
3. Modal de edición se abre con datos pre-cargados
4. Modificar:
   - **Email:** Cambiar a `nuevo.email@universidad.edu`
   - **Rol:** Cambiar a otro rol
5. Hacer clic en **"Guardar Cambios"**

**Resultado Esperado:**
- ✅ Mensaje verde: "Usuario actualizado exitosamente"
- ✅ Modal se cierra automáticamente
- ✅ Tabla se actualiza con nuevos datos
- ✅ Badge de rol cambia de color según el nuevo rol

**Nota:** La contraseña NO se muestra ni se modifica en edición.

---

### ✅ CASO 9: Restablecer Contraseña

**Objetivo:** Cambiar la contraseña de un usuario

**Pasos:**
1. Localizar un usuario en la tabla
2. Hacer clic en el icono de **llave (🔑)** en "Acciones"
3. Modal de "Restablecer Contraseña" se abre
4. Leer la advertencia en amarillo
5. Ingresar nueva contraseña: `NuevaPass123!`
6. Hacer clic en **"Restablecer Contraseña"**

**Resultado Esperado:**
- ✅ Mensaje verde: "Contraseña restablecida exitosamente"
- ✅ Modal se cierra automáticamente
- ✅ Usuario debe usar la nueva contraseña en su próximo login

**Advertencia Visible:**
```
┌──────────────────────────────────────┐
│ ⚠️  Importante:                      │
│ El usuario recibirá esta nueva       │
│ contraseña y deberá cambiarla en     │
│ su primer inicio de sesión.          │
└──────────────────────────────────────┘
```

---

### ✅ CASO 10: Eliminar Usuario

**Objetivo:** Eliminar permanentemente un usuario

**Pasos:**
1. Localizar un usuario en la tabla
2. Hacer clic en el icono de **papelera (🗑️)** en "Acciones"
3. Aparece confirmación del navegador: "¿Estás seguro de eliminar este usuario?"
4. Hacer clic en **"Aceptar"**

**Resultado Esperado:**
- ✅ Mensaje verde: "Usuario eliminado exitosamente"
- ✅ Usuario desaparece de la tabla
- ✅ Eliminación es permanente (no se puede deshacer)

**Advertencia:** Esta acción NO se puede deshacer. Los datos se eliminan de la base de datos.

---

### ✅ CASO 11: Validación de Email Duplicado

**Objetivo:** Verificar que no se puedan crear usuarios con email duplicado

**Pasos:**
1. Hacer clic en **"+ Nuevo Usuario"**
2. Ingresar un email que ya existe: `admin@universidad.edu`
3. Completar contraseña y rol
4. Hacer clic en **"Crear Usuario"**

**Resultado Esperado:**
- ❌ Mensaje rojo: "Ya existe un usuario con ese email"
- ✅ Modal permanece abierto
- ✅ Usuario NO se crea

---

### ✅ CASO 12: Validación de Contraseña Corta

**Objetivo:** Verificar validación de longitud mínima de contraseña

**Pasos:**
1. Hacer clic en **"+ Nuevo Usuario"**
2. Ingresar contraseña corta: `123`
3. Intentar enviar el formulario

**Resultado Esperado:**
- ❌ Navegador muestra error nativo: "Mínimo 6 caracteres"
- ✅ Formulario no se envía
- ✅ Usuario NO se crea

---

### ✅ CASO 13: Hover en Fila de Tabla

**Objetivo:** Verificar efectos visuales en hover

**Pasos:**
1. Pasar el cursor sobre una fila de la tabla
2. Observar cambios visuales

**Resultado Esperado:**
- ✅ Fondo de la fila cambia a #F8FAFC (gris muy claro)
- ✅ Transición suave de 150ms
- ✅ Botones de acción se mantienen visibles

---

### ✅ CASO 14: Focus en Input

**Objetivo:** Verificar estilo de focus en inputs

**Pasos:**
1. Abrir modal de crear usuario
2. Hacer clic en el campo "Email"
3. Observar cambios visuales

**Resultado Esperado:**
- ✅ Borde cambia de #64748B a #06B6D4
- ✅ Aparece ring cyan alrededor del input
- ✅ Transición suave

**Visual:**
```
Reposo: ┌────────────────┐
        │                │  Border: #64748B
        └────────────────┘

Focus:  ┌────────────────┐
        │ |              │  Border: #06B6D4
        └────────────────┘  Ring: rgba(6,182,212,0.1)
```

---

### ✅ CASO 15: Responsive Mobile

**Objetivo:** Verificar diseño en dispositivos móviles

**Pasos:**
1. Abrir DevTools (F12)
2. Activar modo responsive
3. Cambiar a iPhone 12 Pro (390px)
4. Navegar por el módulo

**Resultado Esperado:**
- ✅ Tabla se adapta con scroll horizontal
- ✅ Botón "Nuevo Usuario" se mantiene visible
- ✅ Modal ocupa 95% del ancho
- ✅ Inputs y botones son táctiles (mínimo 44px)

---

### ✅ CASO 16: Limpiar Búsqueda

**Objetivo:** Verificar que se pueda limpiar el filtro de búsqueda

**Pasos:**
1. Escribir algo en el buscador: `admin`
2. Tabla se filtra
3. Borrar el texto del buscador
4. Observar la tabla

**Resultado Esperado:**
- ✅ Tabla vuelve a mostrar todos los usuarios
- ✅ Actualización en tiempo real

---

### ✅ CASO 17: Cerrar Modal con X

**Objetivo:** Verificar que se pueda cerrar el modal sin guardar

**Pasos:**
1. Abrir modal de crear usuario
2. Completar algunos campos
3. Hacer clic en la **X** de la esquina superior derecha

**Resultado Esperado:**
- ✅ Modal se cierra
- ✅ Datos NO se guardan
- ✅ Tabla permanece sin cambios

---

### ✅ CASO 18: Cerrar Modal con Cancelar

**Objetivo:** Verificar botón "Cancelar"

**Pasos:**
1. Abrir modal de crear usuario
2. Completar algunos campos
3. Hacer clic en **"Cancelar"**

**Resultado Esperado:**
- ✅ Modal se cierra
- ✅ Datos NO se guardan
- ✅ Igual que cerrar con X

---

### ✅ CASO 19: Vincular Perfil - Cambio de Rol

**Objetivo:** Verificar que el dropdown de perfiles se actualiza al cambiar rol

**Pasos:**
1. Abrir modal de crear usuario
2. Seleccionar rol **"Docente"**
3. Observar dropdown de perfiles (debe mostrar docentes)
4. Cambiar rol a **"Alumno"**
5. Observar dropdown de perfiles (debe mostrar alumnos)

**Resultado Esperado:**
- ✅ Dropdown se actualiza automáticamente
- ✅ Muestra solo perfiles del rol seleccionado
- ✅ Solo muestra perfiles sin usuario asignado

---

### ✅ CASO 20: Tabla Vacía

**Objetivo:** Verificar mensaje cuando no hay usuarios

**Pasos:**
1. (Simular) Eliminar todos los usuarios
2. Observar la tabla vacía

**Resultado Esperado:**
- ✅ Icono de usuario grande en gris
- ✅ Mensaje: "No se encontraron usuarios"
- ✅ Diseño centrado y limpio

---

## 🎨 Verificación de Diseño PulseTec

### Colores
- [ ] Badge ADMIN: #0F172A (Midnight Blue)
- [ ] Badge DOCENTE: #06B6D4 (Electric Cyan)
- [ ] Badge ALUMNO: #64748B (Cool Gray)
- [ ] Toggle ON: #06B6D4
- [ ] Toggle OFF: #D1D5DB
- [ ] Botón primario: #06B6D4
- [ ] Input focus: #06B6D4

### Tipografía
- [ ] Título página: Inter Bold
- [ ] Encabezados tabla: Inter Bold
- [ ] Badges: Inter Medium
- [ ] Cuerpo: Inter Regular

### Espaciado
- [ ] Padding cards: p-6
- [ ] Gap entre elementos: gap-4 o gap-6
- [ ] Bordes redondeados: rounded-xl

---

## 🐛 Problemas Conocidos y Soluciones

### Problema 1: Modal no se cierra
**Solución:** Verificar que el servidor esté corriendo. Refrescar la página.

### Problema 2: Toggle no responde
**Solución:** Verificar consola del navegador. Puede haber error de red.

### Problema 3: No aparecen perfiles para vincular
**Solución:** Primero crear perfiles de Docente/Alumno en sus respectivos módulos.

### Problema 4: Email duplicado
**Solución:** Cada email debe ser único. Usar otro email o eliminar el usuario existente.

---

## 📊 Checklist de Testing Completo

### Funcionalidad
- [ ] Crear usuario ADMIN
- [ ] Crear usuario DOCENTE vinculado
- [ ] Crear usuario ALUMNO vinculado
- [ ] Editar usuario existente
- [ ] Eliminar usuario con confirmación
- [ ] Toggle activar/desactivar
- [ ] Restablecer contraseña
- [ ] Búsqueda por email
- [ ] Búsqueda por nombre
- [ ] Limpiar búsqueda

### Validaciones
- [ ] Email duplicado rechazado
- [ ] Contraseña mínima 6 caracteres
- [ ] Campos requeridos validados
- [ ] Confirmación antes de eliminar

### Diseño
- [ ] Badges con colores correctos
- [ ] Toggle estilo iOS
- [ ] Avatares circulares
- [ ] Hover en filas
- [ ] Focus en inputs
- [ ] Animaciones suaves

### Responsive
- [ ] Desktop (>1024px)
- [ ] Tablet (768-1024px)
- [ ] Mobile (<768px)

### Accesibilidad
- [ ] Botones con títulos (title)
- [ ] Inputs con labels
- [ ] Contraste de colores adecuado
- [ ] Navegación con teclado

---

## 🎯 Criterios de Aceptación

### ✅ El módulo está listo si:
1. Todos los casos de prueba pasan exitosamente
2. No hay errores en consola del navegador
3. No hay errores en terminal del servidor
4. Diseño PulseTec aplicado correctamente
5. Responsive funciona en todos los tamaños
6. Validaciones funcionan correctamente
7. Mensajes de éxito/error se muestran
8. Animaciones son suaves
9. Documentación está completa
10. Código está limpio y comentado

---

## 📞 Reporte de Bugs

Si encuentras algún problema:

1. **Captura de pantalla** del error
2. **Pasos para reproducir** el problema
3. **Mensaje de error** (si hay)
4. **Navegador y versión** utilizada
5. **Tamaño de pantalla** (si es problema responsive)

---

## 🚀 Comandos Útiles

```bash
# Iniciar servidor
npm run dev

# Detener servidor
Ctrl + C

# Reiniciar base de datos
npx prisma db push --force-reset

# Ver base de datos
npx prisma studio

# Generar cliente Prisma
npx prisma generate
```

---

## ✅ Testing Completado

Una vez completados todos los casos de prueba, el módulo está listo para producción.

**Fecha de testing:** _________________

**Tester:** _________________

**Resultado:** ☐ APROBADO  ☐ CON OBSERVACIONES  ☐ RECHAZADO

**Observaciones:**
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

---

**Desarrollado con PulseTec Control Design System** 🧪


