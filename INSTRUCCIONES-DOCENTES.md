# 🚀 Instrucciones Rápidas - Módulo de Docentes

## ⚡ Inicio Rápido (2 minutos)

### Paso 1: Migrar Base de Datos (solo una vez)

Ejecuta el script automatizado:

```powershell
.\migrate-docentes.ps1
```

**¿Qué hace este script?**
- ✅ Detiene el servidor automáticamente
- ✅ Genera el cliente de Prisma
- ✅ Aplica la migración (crea tablas nuevas)
- ✅ Ofrece poblar con datos de ejemplo
- ✅ Reinicia el servidor

**Responde "S" a todas las preguntas para una configuración completa.**

---

### Paso 2: Abrir el Módulo

Una vez que el servidor esté corriendo:

```
http://localhost:3000/dashboard/docentes
```

---

## 📋 ¿Qué vas a ver?

### Vista Principal
- **Cards de docentes** con diseño profesional
- **Búsqueda** por nombre, email o departamento
- **Botón "Nuevo Docente"** en la parte superior

### Cada Card Muestra:
- ✅ Avatar con iniciales
- ✅ Nombre completo y departamento
- ✅ Email y teléfono
- ✅ **Badges de carreras** (color cyan)
- ✅ **Badges de materias** (color purple)
- ✅ Estado (Activo/Inactivo)
- ✅ Botones de editar/eliminar (visibles al pasar el mouse)

---

## ➕ Crear un Docente

### 1. Click en "Nuevo Docente"
Se abrirá un modal con el formulario.

### 2. Completa los Campos:

**Información Personal:**
- **Nombre*** (requerido)
- **Apellido*** (requerido)
- **Email*** (requerido, único)
- **Teléfono** (opcional)
- **Departamento** (opcional)

**Asignaciones:**
- **Carreras*** (requerido, multi-select)
- **Materias** (opcional, multi-select)

### 3. Usar el Multi-Select

El componente multi-select funciona así:

```
┌─────────────────────────────────────┐
│ Carreras *                          │
├─────────────────────────────────────┤
│ [ING-SIS ×] [LIC-MAT ×]            │ ← Items seleccionados
├─────────────────────────────────────┤
│ 2 seleccionados              [▼]   │ ← Click para abrir
└─────────────────────────────────────┘
```

**Al hacer click:**
```
┌─────────────────────────────────────┐
│ [🔍 Buscar...]                      │ ← Busca en tiempo real
├─────────────────────────────────────┤
│ ☑ Ingeniería en Sistemas            │
│   ING-SIS                           │
├─────────────────────────────────────┤
│ ☑ Licenciatura en Matemática        │
│   LIC-MAT                           │
├─────────────────────────────────────┤
│ ☐ Ingeniería Industrial             │
│   ING-IND                           │
└─────────────────────────────────────┘
```

**Características:**
- ✅ Selecciona múltiples opciones
- ✅ Busca escribiendo en el campo
- ✅ Elimina items clickeando la X
- ✅ Checkboxes visuales

### 4. Guardar
Click en "Crear Docente" y ¡listo!

---

## ✏️ Editar un Docente

### 1. Pasa el mouse sobre una card
Aparecerán los botones de acción.

### 2. Click en el ícono de lápiz ✏️
Se abrirá el modal con los datos pre-cargados.

### 3. Modifica lo que necesites
- ✅ Cambiar departamento
- ✅ Actualizar teléfono
- ✅ Agregar/quitar carreras
- ✅ Agregar/quitar materias

**Nota:** El email NO se puede modificar.

### 4. Guardar cambios
Click en "Actualizar Docente".

---

## 🗑️ Eliminar un Docente

### 1. Click en el ícono de basura 🗑️
Aparecerá una confirmación.

### 2. Confirmar
El docente se marcará como inactivo (soft delete).

**Nota:** No se eliminan datos, solo se desactiva.

---

## 🔍 Buscar Docentes

### Usa la barra de búsqueda
Escribe cualquier parte de:
- Nombre
- Apellido
- Email
- Departamento

**Los resultados se filtran en tiempo real.**

---

## 📊 Datos de Ejemplo (Si ejecutaste el seed)

El seed incluye:

### 4 Carreras
1. **Ingeniería en Sistemas** (ING-SIS)
2. **Ingeniería Industrial** (ING-IND)
3. **Ingeniería Mecánica** (ING-MEC)
4. **Licenciatura en Matemática** (LIC-MAT)

### 14 Materias
Distribuidas en las 4 carreras:
- AED-101 (Algoritmos y Estructuras de Datos)
- BD-201 (Bases de Datos)
- POO-102 (Programación Orientada a Objetos)
- DW-301 (Desarrollo Web)
- IA-401 (Inteligencia Artificial)
- GO-201 (Gestión de Operaciones)
- CC-301 (Control de Calidad)
- SI-202 (Seguridad Industrial)
- MF-301 (Mecánica de Fluidos)
- TER-201 (Termodinámica)
- DM-401 (Diseño Mecánico)
- CAL-101 (Cálculo I)
- ALG-101 (Álgebra Lineal)
- ANA-201 (Análisis Matemático)

### 8 Docentes
Con nombres como:
- María González
- Juan Rodríguez
- Ana Martínez
- Carlos López
- Laura Fernández
- Pedro Sánchez
- Diego Torres

**Cada uno con:**
- ✅ Email institucional
- ✅ Teléfono
- ✅ Departamento
- ✅ Carreras asignadas
- ✅ Materias asignadas

---

## 🎨 Guía Visual de Colores

### Badges de Carreras
**Color:** Electric Cyan (#06B6D4)
```
[ING-SIS] [ING-IND] [LIC-MAT]
```

### Badges de Materias
**Color:** Purple
```
[AED-101] [BD-201] [POO-102]
```

### Botones
**Color:** Primary (#06B6D4)
- Nuevo Docente
- Crear/Actualizar
- Botones de acción

### Inputs en Focus
**Border:** Cambia de #64748B a #06B6D4
**Ring:** Resplandor cyan suave

---

## 📱 Versión Mobile

El módulo es 100% responsive:

### Mobile (< 768px)
- Cards en 1 columna
- Badges en múltiples líneas
- Botones accesibles sin hover

### Tablet (768px - 1024px)
- Cards en 2 columnas
- Vista completa

### Desktop (> 1024px)
- Cards en 3 columnas
- Hover effects elegantes
- Botones visibles solo al pasar el mouse

---

## 🛠️ Comandos Útiles

### Ver la base de datos
```powershell
npx prisma studio
```
Abre en http://localhost:5555

### Re-aplicar migración
```powershell
npx prisma generate
npx prisma db push
```

### Poblar con datos de ejemplo
```powershell
npm run prisma:seed
```

### Resetear todo (⚠️ borra datos)
```powershell
rm prisma\dev.db
npx prisma db push
npm run prisma:seed
```

---

## ❓ Preguntas Frecuentes

### P: ¿Puedo crear docentes sin asignar materias?
**R:** Sí, las materias son opcionales. Solo las carreras son obligatorias.

### P: ¿Cuántas carreras puedo asignar?
**R:** No hay límite. Puedes asignar todas las carreras disponibles.

### P: ¿Qué pasa si elimino un docente?
**R:** Se hace un "soft delete", el docente se marca como inactivo pero no se eliminan sus datos.

### P: ¿Puedo modificar el email?
**R:** No, el email es único e inmutable después de crear el docente.

### P: No aparecen opciones en el multi-select de carreras
**R:** Primero debes crear carreras en `/dashboard/carreras`

### P: ¿Dónde están las materias?
**R:** Si ejecutaste el seed, ya están creadas. Si no, necesitas crearlas manualmente via Prisma Studio.

### P: ¿Cómo agrego más materias?
**R:** Por ahora usa Prisma Studio (`npx prisma studio`). El CRUD de materias se implementará próximamente.

---

## 🎯 Flujo Típico de Uso

### 1. Primera Vez
```
Ejecutar migrate-docentes.ps1 → Poblar con seed → Explorar datos de ejemplo
```

### 2. Uso Diario
```
Abrir /dashboard/docentes → Buscar docente → Ver información → Editar si es necesario
```

### 3. Agregar Docentes
```
Click "Nuevo Docente" → Completar formulario → Seleccionar carreras/materias → Guardar
```

---

## 🆘 Problemas y Soluciones

### Error: "Column not found: phone"
**Causa:** No se aplicó la migración  
**Solución:**
```powershell
npx prisma db push
```

### Error: "No se encontraron carreras"
**Causa:** No hay carreras creadas  
**Solución:** Ve a `/dashboard/carreras` y crea algunas

### Error: "@prisma/client did not initialize"
**Causa:** Cliente no generado  
**Solución:**
```powershell
npx prisma generate
```

### El servidor no inicia
**Causa:** Proceso de Node bloqueado  
**Solución:**
```powershell
Stop-Process -Name node -Force
npm run dev
```

---

## 📞 Ayuda Adicional

Para más información técnica, consulta:
- `MODULO-DOCENTES.md` - Documentación completa
- `MIGRACION-DOCENTES.md` - Guía de migración detallada
- `RESUMEN-DOCENTES.md` - Resumen ejecutivo

---

## ✅ Checklist Rápido

Antes de empezar, verifica:
- [ ] Ejecuté `migrate-docentes.ps1`
- [ ] El servidor está corriendo (`npm run dev`)
- [ ] Tengo carreras creadas
- [ ] (Opcional) Ejecuté el seed para datos de ejemplo

¡Listo para usar! 🎉

---

**Versión**: 1.0.0  
**Fecha**: Enero 2026  
**Módulo**: Docentes con Relaciones M:N  
**Estilo**: PulseTec Control


