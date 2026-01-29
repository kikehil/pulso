# 🎓 LMS Multi-Tenant - Sistema de Gestión Universitario

Sistema de gestión de aprendizaje (LMS) multi-tenant diseñado específicamente para universidades. Construido con Next.js 14, Tailwind CSS y Prisma.

## 🚀 Características Principales

### ✅ Multi-Tenant
- **Aislamiento por Universidad**: Cada universidad (tenant) tiene sus propios datos completamente aislados
- **Filtrado Automático**: Todas las consultas se filtran automáticamente por `university_id`
- **Escalable**: Arquitectura diseñada para soportar múltiples universidades en la misma base de datos

### 🎨 Diseño Profesional
- **Paleta de Colores**: Azul institucional, gris pizarra y blanco
- **100% Responsive**: Optimizado para móvil, tablet y desktop
- **Sidebar Colapsable**: Navegación fluida con sidebar que se colapsa
- **UI Moderna**: Componentes diseñados con mejores prácticas de UX

### 📊 Dashboard del Admin Universidad
Visualiza métricas clave en tiempo real:
- 👥 **Alumnos Totales**: Estudiantes activos en la universidad
- 👨‍🏫 **Docentes**: Profesores activos
- 📚 **Grupos Activos**: Grupos de estudio en curso
- 📝 **Tareas Entregadas Hoy**: Seguimiento diario de entregas

### 🗄️ Modelo de Datos Completo
- Universidades (Tenants)
- Estudiantes
- Docentes
- Cursos
- Grupos
- Tareas/Asignaciones
- Entregas

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Estilos**: Tailwind CSS 3.4
- **Base de Datos**: PostgreSQL con Prisma ORM
- **Iconos**: Lucide React
- **Utilidades**: clsx para manejo de clases

## 📋 Requisitos Previos

- Node.js 18+ 
- PostgreSQL 14+
- npm o yarn

## 🔧 Instalación

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar Base de Datos

Crea un archivo `.env` en la raíz del proyecto:

```env
DATABASE_URL="postgresql://usuario:password@localhost:5432/lms_multitenant?schema=public"
DEFAULT_UNIVERSITY_ID="universidad-demo"
```

### 3. Generar Cliente de Prisma

```bash
npm run prisma:generate
```

### 4. Ejecutar Migraciones

```bash
npm run prisma:migrate
```

### 5. (Opcional) Poblar Base de Datos

Crea un archivo `prisma/seed.ts` para datos de prueba:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Crear universidad de prueba
  const university = await prisma.university.create({
    data: {
      id: 'universidad-demo',
      name: 'Universidad Tecnológica',
      slug: 'uni-tech',
      domain: 'unitech.edu',
    },
  });

  console.log('Universidad creada:', university);

  // Crear estudiantes de prueba
  for (let i = 1; i <= 25; i++) {
    await prisma.student.create({
      data: {
        universityId: university.id,
        email: `estudiante${i}@unitech.edu`,
        firstName: `Estudiante`,
        lastName: `${i}`,
        enrollmentId: `E${i.toString().padStart(5, '0')}`,
      },
    });
  }

  // Crear docentes de prueba
  for (let i = 1; i <= 8; i++) {
    await prisma.teacher.create({
      data: {
        universityId: university.id,
        email: `docente${i}@unitech.edu`,
        firstName: `Profesor`,
        lastName: `${i}`,
        department: 'Facultad de Ingeniería',
      },
    });
  }

  console.log('Datos de prueba creados exitosamente');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Agrega el script en `package.json`:

```json
"prisma:seed": "tsx prisma/seed.ts"
```

Y ejecuta:

```bash
npm install -D tsx
npm run prisma:seed
```

### 6. Iniciar Servidor de Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📁 Estructura del Proyecto

```
MVP-LMS/
├── app/
│   ├── dashboard/
│   │   ├── layout.tsx          # Layout del dashboard con Sidebar y Navbar
│   │   ├── page.tsx             # Dashboard principal con métricas
│   │   ├── actions.ts           # Server actions con filtrado por tenant
│   │   ├── students/            # Gestión de estudiantes
│   │   ├── teachers/            # Gestión de docentes
│   │   ├── courses/             # Gestión de cursos
│   │   ├── groups/              # Gestión de grupos
│   │   ├── assignments/         # Gestión de tareas
│   │   └── settings/            # Configuración
│   ├── layout.tsx               # Layout raíz
│   ├── page.tsx                 # Página principal (redirige al dashboard)
│   └── globals.css              # Estilos globales
├── components/
│   ├── sidebar.tsx              # Sidebar colapsable
│   ├── navbar.tsx               # Navbar superior
│   └── metric-card.tsx          # Tarjeta de métrica
├── lib/
│   ├── prisma.ts                # Cliente de Prisma
│   ├── tenant.ts                # Utilidades multi-tenant
│   └── utils.ts                 # Utilidades generales
├── prisma/
│   └── schema.prisma            # Esquema de la base de datos
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## 🔐 Arquitectura Multi-Tenant

### Filtrado por Universidad

Todas las consultas se filtran automáticamente por `university_id`:

```typescript
// lib/tenant.ts
export async function getCurrentUniversityId(): Promise<string> {
  // Obtiene el ID de la universidad actual desde cookies, sesión o dominio
  return universityId;
}

// app/dashboard/actions.ts
export async function getDashboardMetrics() {
  const universityId = await getCurrentUniversityId();
  
  const totalStudents = await prisma.student.count({
    where: {
      universityId, // ✅ Filtrado automático
      isActive: true,
    },
  });
  
  // ... más consultas filtradas
}
```

### Modelos con Tenant

Cada modelo principal incluye `universityId`:

```prisma
model Student {
  id           String   @id @default(cuid())
  universityId String   // 🔑 Clave del tenant
  email        String
  // ...
  
  university   University @relation(fields: [universityId], references: [id])
  
  @@index([universityId])
}
```

## 🎨 Paleta de Colores

### Azul Institucional (Primary)
- `primary-50` a `primary-950`
- Color principal: `#2563eb` (primary-600)

### Gris Pizarra (Slate)
- `slate-50` a `slate-950`
- Textos y fondos

### Blanco
- Fondos de tarjetas y contenedores

## 📱 Responsive Design

- **Mobile First**: Diseñado primero para móvil
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Sidebar Colapsable**: Se adapta automáticamente
- **Grid Responsivo**: Las métricas se adaptan a cualquier pantalla

```tsx
// Ejemplo de grid responsive
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Tarjetas de métricas */}
</div>
```

## 🚀 Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run start        # Servidor de producción
npm run lint         # Linter
npm run prisma:generate   # Generar cliente Prisma
npm run prisma:migrate    # Ejecutar migraciones
npm run prisma:studio     # Abrir Prisma Studio (GUI)
```

## 📊 Prisma Studio

Para explorar y editar tus datos visualmente:

```bash
npm run prisma:studio
```

Abre [http://localhost:5555](http://localhost:5555)

## 🔜 Próximos Pasos

### Funcionalidades a Implementar
1. **Autenticación**: Next-Auth con roles (Admin Universidad, Docente, Estudiante)
2. **Gestión de Estudiantes**: CRUD completo con búsqueda y filtros
3. **Gestión de Docentes**: CRUD completo con asignación de cursos
4. **Gestión de Cursos**: Creación y edición de cursos
5. **Gestión de Grupos**: Asignación de estudiantes a grupos
6. **Gestión de Tareas**: Creación, calificación y feedback
7. **Reportes y Estadísticas**: Gráficos avanzados con Chart.js
8. **Notificaciones**: Sistema de notificaciones en tiempo real
9. **Gestión de Archivos**: Upload de materiales y tareas
10. **Multi-idioma**: i18n con español e inglés

### Mejoras Técnicas
- Tests unitarios y de integración (Jest, React Testing Library)
- CI/CD con GitHub Actions
- Docker para desarrollo y producción
- Rate limiting y seguridad
- Logs y monitoreo (Sentry, LogRocket)

## 📝 Convenciones de Código

- **TypeScript**: Tipado estricto
- **Server Components**: Por defecto en Next.js 14
- **Server Actions**: Para mutaciones de datos
- **Tailwind CSS**: Clases utilitarias sin CSS custom
- **Prettier**: Formateo automático

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 👥 Soporte

Para preguntas, problemas o sugerencias:
- 📧 Email: soporte@ejemplo.com
- 💬 Discord: [Servidor de la comunidad](#)
- 📚 Documentación: [docs.ejemplo.com](#)

---

**Desarrollado con ❤️ para universidades modernas**


