# 🏗️ Arquitectura del Sistema LMS Multi-Tenant

## 📋 Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Arquitectura Multi-Tenant](#arquitectura-multi-tenant)
3. [Estructura de Carpetas](#estructura-de-carpetas)
4. [Flujo de Datos](#flujo-de-datos)
5. [Modelos de Base de Datos](#modelos-de-base-de-datos)
6. [Componentes Principales](#componentes-principales)
7. [Seguridad](#seguridad)

---

## 🎯 Visión General

Sistema LMS (Learning Management System) diseñado con arquitectura multi-tenant, donde cada universidad es un tenant independiente con sus propios datos aislados.

### Stack Tecnológico

```
Frontend:  Next.js 14 (App Router) + React 18 + TypeScript
Estilos:   Tailwind CSS 3.4
Base de Datos: PostgreSQL + Prisma ORM
UI Icons:  Lucide React
```

---

## 🏢 Arquitectura Multi-Tenant

### Modelo: Shared Database, Shared Schema

Todos los tenants comparten la misma base de datos y esquema, pero los datos están aislados mediante la columna `universityId`.

```
┌─────────────────────────────────────────┐
│         PostgreSQL Database              │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │   Universidad A (universityId: 1)   │ │
│  │   - Estudiantes                     │ │
│  │   - Docentes                        │ │
│  │   - Cursos                          │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │   Universidad B (universityId: 2)   │ │
│  │   - Estudiantes                     │ │
│  │   - Docentes                        │ │
│  │   - Cursos                          │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### Ventajas

✅ **Eficiencia de Recursos**: Menor costo operativo
✅ **Mantenimiento Simple**: Una sola base de datos
✅ **Escalabilidad**: Fácil agregar nuevos tenants
✅ **Backups Centralizados**: Un solo backup para todos

### Consideraciones

⚠️ **Aislamiento de Datos**: Crítico implementar filtrado correcto
⚠️ **Performance**: Índices en `universityId` son esenciales
⚠️ **Seguridad**: Validación estricta del tenant en cada query

---

## 📁 Estructura de Carpetas

```
MVP-LMS/
│
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Layout raíz (HTML, fuentes)
│   ├── page.tsx                  # Página principal (redirect a dashboard)
│   ├── globals.css               # Estilos globales + Tailwind
│   │
│   └── dashboard/                # Área del dashboard
│       ├── layout.tsx            # Layout con Sidebar + Navbar
│       ├── page.tsx              # Dashboard principal
│       ├── actions.ts            # Server Actions (API)
│       │
│       ├── students/             # Gestión de estudiantes
│       │   └── page.tsx
│       ├── teachers/             # Gestión de docentes
│       │   └── page.tsx
│       ├── courses/              # Gestión de cursos
│       │   └── page.tsx
│       ├── groups/               # Gestión de grupos
│       │   └── page.tsx
│       ├── assignments/          # Gestión de tareas
│       │   └── page.tsx
│       └── settings/             # Configuración
│           └── page.tsx
│
├── components/                   # Componentes React reutilizables
│   ├── sidebar.tsx               # Sidebar desktop (colapsable)
│   ├── mobile-sidebar.tsx        # Sidebar mobile (overlay)
│   ├── navbar.tsx                # Barra superior con búsqueda
│   └── metric-card.tsx           # Tarjeta de métrica
│
├── lib/                          # Utilidades y lógica de negocio
│   ├── prisma.ts                 # Cliente de Prisma (singleton)
│   ├── tenant.ts                 # Lógica multi-tenant
│   └── utils.ts                  # Funciones helper
│
├── prisma/                       # Prisma ORM
│   ├── schema.prisma             # Esquema de la base de datos
│   └── seed.ts                   # Script de seed
│
├── public/                       # Archivos estáticos
│
├── package.json                  # Dependencias NPM
├── tsconfig.json                 # Configuración TypeScript
├── tailwind.config.ts            # Configuración Tailwind
├── next.config.js                # Configuración Next.js
├── postcss.config.js             # Configuración PostCSS
│
├── README.md                     # Documentación principal
├── INICIO-RAPIDO.md              # Guía de inicio rápido
└── ARQUITECTURA.md               # Este archivo
```

---

## 🔄 Flujo de Datos

### Request Flow

```
1. Usuario → HTTP Request
            ↓
2. Next.js App Router
            ↓
3. Server Component / Server Action
            ↓
4. lib/tenant.ts (getCurrentUniversityId)
            ↓
5. Prisma Client + Filtro universityId
            ↓
6. PostgreSQL Database
            ↓
7. Datos Filtrados ← Response
            ↓
8. UI Component Rendering
            ↓
9. HTML/JSON → Usuario
```

### Ejemplo Práctico

```typescript
// 1. Usuario accede a /dashboard
export default async function DashboardPage() {
  // 2. Obtener ID de la universidad actual (tenant)
  const universityId = await getCurrentUniversityId();
  
  // 3. Consultar métricas filtradas por tenant
  const metrics = await getDashboardMetrics();
  
  // 4. Renderizar con datos aislados
  return <Dashboard metrics={metrics} />;
}

// Server Action con filtrado
export async function getDashboardMetrics() {
  const universityId = await getCurrentUniversityId();
  
  // ✅ Filtrado automático por tenant
  const totalStudents = await prisma.student.count({
    where: { universityId }  // 🔑 Clave del aislamiento
  });
  
  return { totalStudents };
}
```

---

## 🗄️ Modelos de Base de Datos

### Diagrama de Relaciones

```
University (Tenant)
    ↓ 1:N
    ├── Student
    │       ↓ N:M (via Enrollment)
    │       └── Group ← Course ← Teacher
    │
    ├── Teacher
    │       ↓ 1:N
    │       ├── Course
    │       └── Group
    │
    ├── Course
    │       ↓ 1:N
    │       ├── Group
    │       └── Assignment
    │               ↓ 1:N
    │               └── Submission ← Student
    │
    └── Group
            ↓ 1:N
            └── Enrollment (Student ↔ Group)
```

### Modelos Principales

#### University (Tenant)
- **Propósito**: Representa cada universidad (tenant)
- **Campos clave**: `id`, `name`, `slug`, `domain`
- **Relaciones**: Padre de todos los demás modelos

#### Student
- **Propósito**: Estudiantes de la universidad
- **Filtrado**: `universityId`
- **Relaciones**: Enrollments, Submissions

#### Teacher
- **Propósito**: Docentes de la universidad
- **Filtrado**: `universityId`
- **Relaciones**: Courses, Groups

#### Course
- **Propósito**: Cursos/Materias
- **Filtrado**: `universityId`
- **Relaciones**: Groups, Assignments, Teacher

#### Group
- **Propósito**: Grupos de estudio/clases
- **Filtrado**: `universityId`
- **Relaciones**: Course, Teacher, Enrollments

#### Assignment
- **Propósito**: Tareas/Trabajos
- **Filtrado**: `universityId`
- **Relaciones**: Course, Submissions

#### Submission
- **Propósito**: Entregas de tareas
- **Filtrado**: Via `assignment.universityId`
- **Relaciones**: Assignment, Student

#### Enrollment
- **Propósito**: Relación Estudiante ↔ Grupo
- **Filtrado**: Via `group.universityId`

---

## 🎨 Componentes Principales

### Layout System

```
RootLayout (app/layout.tsx)
    └── DashboardLayout (app/dashboard/layout.tsx)
            ├── Sidebar (Desktop)
            ├── Navbar
            │   └── MobileSidebar (Mobile)
            └── Main Content
                    └── Page Component
```

### Sidebar Component

```typescript
<Sidebar universityName="UTN">
  // Features:
  - ✅ Colapsable (Desktop)
  - ✅ Navegación con highlight de ruta activa
  - ✅ Iconos Lucide React
  - ✅ Transiciones suaves
</Sidebar>
```

### Navbar Component

```typescript
<Navbar universityName="UTN">
  // Features:
  - ✅ Búsqueda global
  - ✅ Notificaciones
  - ✅ Perfil de usuario
  - ✅ Mobile menu trigger
  - ✅ Responsive
</Navbar>
```

### MetricCard Component

```typescript
<MetricCard
  title="Alumnos Totales"
  value={150}
  icon={Users}
  iconBgColor="bg-blue-100"
  iconColor="text-blue-600"
/>
```

---

## 🔐 Seguridad

### Aislamiento de Datos

#### 1. Filtrado a Nivel de Query

```typescript
// ✅ CORRECTO: Siempre filtrar por universityId
const students = await prisma.student.findMany({
  where: {
    universityId: currentUniversityId,  // 🔒 Aislamiento
  }
});

// ❌ INCORRECTO: Sin filtrado
const students = await prisma.student.findMany();
```

#### 2. Índices de Base de Datos

```prisma
model Student {
  id           String @id
  universityId String
  
  @@index([universityId])  // 🚀 Performance + Seguridad
}
```

#### 3. Middleware de Prisma (Futuro)

```typescript
// Prisma Middleware para forzar filtrado automático
prisma.$use(async (params, next) => {
  if (params.model && params.action === 'findMany') {
    params.args.where = {
      ...params.args.where,
      universityId: await getCurrentUniversityId()
    };
  }
  return next(params);
});
```

### Validación de Tenant

```typescript
export async function validateUniversity(id: string) {
  const university = await prisma.university.findUnique({
    where: { id }
  });
  
  if (!university) {
    throw new Error('Universidad no válida');
  }
  
  return university;
}
```

### Estrategias de Identificación de Tenant

1. **Por Subdominio**: `utn.lms.com` → `utn`
2. **Por Cookie/Sesión**: Usuario autenticado
3. **Por Path**: `/university/:slug/dashboard`
4. **Por Variable de Entorno**: Desarrollo

**Implementación Actual**: Variable de entorno (desarrollo)

**Recomendado para Producción**: Cookie/Sesión post-autenticación

---

## 📊 Performance

### Optimizaciones Implementadas

1. **Server Components**: Renderizado en servidor
2. **Server Actions**: Sin overhead de API Routes
3. **Índices de Base de Datos**: En `universityId`
4. **Prisma Connection Pooling**: Cliente singleton

### Recomendaciones Futuras

- [ ] Implementar caching con Redis
- [ ] Lazy loading de componentes pesados
- [ ] Optimistic UI updates
- [ ] Prefetching de datos críticos
- [ ] CDN para assets estáticos

---

## 🚀 Escalabilidad

### Capacidad Actual

- ✅ Múltiples universidades en una DB
- ✅ Miles de estudiantes por universidad
- ✅ Cientos de cursos concurrentes

### Escalar a Mayor Volumen

1. **Database Sharding**: Dividir por región/universidad
2. **Read Replicas**: Para consultas pesadas
3. **Microservicios**: Separar módulos críticos
4. **Message Queue**: Para operaciones asíncronas

---

## 📈 Próximas Mejoras Arquitectónicas

1. **Event-Driven Architecture**: Para notificaciones
2. **CQRS Pattern**: Separar lecturas y escrituras
3. **GraphQL API**: Para clientes móviles
4. **WebSockets**: Actualizaciones en tiempo real
5. **Kubernetes**: Orquestación de contenedores

---

**Documentación actualizada: Enero 2026**


