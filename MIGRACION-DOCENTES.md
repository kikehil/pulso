# 🔄 Migración de Base de Datos - Módulo de Docentes

## ⚠️ IMPORTANTE

El módulo de docentes requiere **actualizar la base de datos** porque:
1. Se agregaron nuevos modelos (Subject, TeacherCareer, TeacherSubject)
2. Se modificó el modelo Teacher
3. Se agregaron relaciones muchos-a-muchos

---

## 🚀 Pasos para Aplicar la Migración

### 1. Detener el Servidor
```bash
Ctrl + C
```

### 2. Generar Cliente de Prisma
```bash
npx prisma generate
```

### 3. Aplicar Migración
```bash
npx prisma db push
```

Este comando:
- ✅ Crea las nuevas tablas (subjects, teacher_careers, teacher_subjects)
- ✅ Agrega campos nuevos a teachers (phone)
- ✅ Mantiene los datos existentes

### 4. Reiniciar Servidor
```bash
npm run dev
```

---

## 📊 Cambios en la Base de Datos

### Nuevas Tablas Creadas

#### 1. **subjects** (Materias)
```sql
- id: String (PK)
- universityId: String (FK)
- courseId: String (FK) → course
- name: String
- code: String (único por universidad)
- credits: Int
- semester: Int (opcional)
- description: String (opcional)
- isActive: Boolean
- createdAt: DateTime
- updatedAt: DateTime
```

#### 2. **teacher_careers** (Relación Docente-Carrera)
```sql
- id: String (PK)
- teacherId: String (FK) → teacher
- courseId: String (FK) → course
- assignedAt: DateTime
```

#### 3. **teacher_subjects** (Relación Docente-Materia)
```sql
- id: String (PK)
- teacherId: String (FK) → teacher
- subjectId: String (FK) → subject
- assignedAt: DateTime
```

### Modificaciones a Tablas Existentes

#### **teachers**
Campos agregados:
- `phone`: String (opcional) - Teléfono del docente

---

## 🔄 Relaciones Muchos a Muchos

### Docente ↔ Carreras
Un docente puede enseñar en múltiples carreras  
Una carrera puede tener múltiples docentes

```
Teacher (1) ←→ (N) TeacherCareer (N) ←→ (1) Course
```

### Docente ↔ Materias
Un docente puede enseñar múltiples materias  
Una materia puede ser enseñada por múltiples docentes

```
Teacher (1) ←→ (N) TeacherSubject (N) ←→ (1) Subject
```

---

## 📝 Migración de Datos Existentes (Opcional)

Si ya tienes docentes y quieres asignarlos automáticamente:

### Script de Migración de Datos

```typescript
// scripts/migrate-teachers.ts
import { prisma } from '../lib/prisma';

async function migrateTeachers() {
  const teachers = await prisma.teacher.findMany({
    include: {
      courses: true, // Cursos donde el docente es coordinador
    },
  });

  for (const teacher of teachers) {
    // Asignar automáticamente a las carreras de sus cursos
    for (const course of teacher.courses) {
      await prisma.teacherCareer.create({
        data: {
          teacherId: teacher.id,
          courseId: course.id,
        },
      }).catch(() => {
        // Ignorar si ya existe
      });
    }
  }

  console.log('Migración completada');
}

migrateTeachers();
```

---

## ✅ Verificar Migración

### Ver Tablas Creadas
```bash
npx prisma studio
```

Abre http://localhost:5555 y verifica:
- ✅ Tabla `subjects` existe
- ✅ Tabla `teacher_careers` existe
- ✅ Tabla `teacher_subjects` existe
- ✅ Campo `phone` en `teachers`

### Probar en la Aplicación
1. Abre http://localhost:3000/dashboard/docentes
2. Intenta crear un nuevo docente
3. Asigna carreras y materias
4. Verifica que se guarde correctamente

---

## 🐛 Solución de Problemas

### Error: "Column not found"
**Solución**: Ejecuta `npx prisma db push` de nuevo

### Error: "Foreign key constraint failed"
**Solución**: Primero crea algunas carreras en `/dashboard/carreras`

### Error: "UNIQUE constraint failed"
**Solución**: Verifica que no haya códigos duplicados

### No se muestran las materias
**Solución**: Necesitas crear materias primero (ver próxima sección)

---

## 📚 Crear Materias de Ejemplo

Por ahora las materias deben crearse manualmente via Prisma Studio:

1. Ejecuta `npx prisma studio`
2. Ve a la tabla `subjects`
3. Crea nuevas materias con:
   - `universityId`: ID de tu universidad
   - `courseId`: ID de una carrera existente
   - `name`: "Matemáticas I"
   - `code`: "MAT-101"
   - `credits`: 5
   - `semester`: 1

O con este script:

```typescript
// scripts/seed-subjects.ts
import { prisma } from '../lib/prisma';

async function seedSubjects() {
  const university = await prisma.university.findFirst();
  const course = await prisma.course.findFirst();

  if (!university || !course) {
    console.log('Necesitas crear una universidad y carrera primero');
    return;
  }

  const subjects = [
    { name: 'Matemáticas I', code: 'MAT-101', credits: 5, semester: 1 },
    { name: 'Física I', code: 'FIS-101', credits: 5, semester: 1 },
    { name: 'Programación I', code: 'PRO-101', credits: 6, semester: 1 },
    { name: 'Cálculo Diferencial', code: 'CAL-201', credits: 5, semester: 2 },
    { name: 'Estructuras de Datos', code: 'EST-201', credits: 6, semester: 2 },
  ];

  for (const subject of subjects) {
    await prisma.subject.create({
      data: {
        universityId: university.id,
        courseId: course.id,
        ...subject,
      },
    }).catch(() => {
      // Ignorar si ya existe
    });
  }

  console.log('Materias creadas');
}

seedSubjects();
```

---

## 🎯 Resumen de Comandos

```bash
# 1. Detener servidor
Ctrl + C

# 2. Generar cliente Prisma
npx prisma generate

# 3. Aplicar migración
npx prisma db push

# 4. Ver base de datos (opcional)
npx prisma studio

# 5. Reiniciar servidor
npm run dev
```

---

## ✅ Checklist

- [ ] Detener servidor
- [ ] Ejecutar `npx prisma generate`
- [ ] Ejecutar `npx prisma db push`
- [ ] Verificar en Prisma Studio
- [ ] Reiniciar servidor
- [ ] Probar crear docente
- [ ] Verificar badges de carreras

---

## 🆘 Si Algo Sale Mal

### Resetear Base de Datos (⚠️ Borra todos los datos)
```bash
rm prisma/dev.db
npx prisma db push
npm run prisma:seed
```

Esto:
- Elimina la base de datos actual
- Crea una nueva con el nuevo schema
- Pobla con datos de prueba

---

**¡Listo para usar el módulo de docentes!** 🎓

Una vez completada la migración, podrás:
- ✅ Crear docentes
- ✅ Asignar múltiples carreras
- ✅ Asignar múltiples materias
- ✅ Ver badges en las cards
- ✅ Buscar y filtrar


