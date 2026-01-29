# 🌳 Estructura Visual del Proyecto

```
MVP-LMS/
│
├── 📚 DOCUMENTACIÓN
│   ├── 📄 README.md                    # Documentación principal completa
│   ├── 🚀 INICIO-RAPIDO.md             # Guía de inicio en 5 minutos
│   ├── 🏗️  ARQUITECTURA.md              # Arquitectura técnica detallada
│   ├── 🛠️  COMANDOS.md                  # Referencia de comandos
│   ├── 📊 RESUMEN-PROYECTO.md          # Resumen ejecutivo
│   └── 🌳 ESTRUCTURA-VISUAL.md         # Este archivo
│
├── 📱 APP/ (Next.js 14 App Router)
│   ├── layout.tsx                      # Layout raíz con fuentes
│   ├── page.tsx                        # Home → redirect /dashboard
│   ├── globals.css                     # Tailwind + estilos personalizados
│   │
│   └── dashboard/
│       ├── 📐 layout.tsx               # Layout: Sidebar + Navbar
│       ├── 📊 page.tsx                 # ⭐ DASHBOARD PRINCIPAL
│       ├── ⚡ actions.ts               # Server Actions con filtrado
│       │
│       ├── students/
│       │   └── page.tsx                # Gestión de Estudiantes
│       ├── teachers/
│       │   └── page.tsx                # Gestión de Docentes
│       ├── courses/
│       │   └── page.tsx                # Gestión de Cursos
│       ├── groups/
│       │   └── page.tsx                # Gestión de Grupos
│       ├── assignments/
│       │   └── page.tsx                # Gestión de Tareas
│       └── settings/
│           └── page.tsx                # Configuración
│
├── 🎨 COMPONENTS/
│   ├── sidebar.tsx                     # 🖥️  Sidebar Desktop (colapsable)
│   ├── mobile-sidebar.tsx              # 📱 Sidebar Mobile (overlay)
│   ├── navbar.tsx                      # 🔝 Barra superior con búsqueda
│   └── metric-card.tsx                 # 📊 Tarjeta de métrica reutilizable
│
├── 🛠️  LIB/
│   ├── prisma.ts                       # Cliente Prisma (singleton)
│   ├── tenant.ts                       # ⭐ Lógica Multi-Tenant
│   └── utils.ts                        # Funciones helper (cn, formatDate, etc)
│
├── 🗄️  PRISMA/
│   ├── schema.prisma                   # ⭐ 8 Modelos + Relaciones
│   │   ├── University (Tenant)
│   │   ├── Student
│   │   ├── Teacher
│   │   ├── Course
│   │   ├── Group
│   │   ├── Enrollment
│   │   ├── Assignment
│   │   └── Submission
│   │
│   └── seed.ts                         # 🌱 Script de datos de prueba
│                                       # (2 universidades, 50 estudiantes, etc)
│
├── 🎨 PUBLIC/
│   └── README.md                       # Guía para assets estáticos
│
├── ⚙️  CONFIGURACIÓN
│   ├── package.json                    # Dependencias y scripts
│   ├── tsconfig.json                   # TypeScript config
│   ├── tailwind.config.ts              # ⭐ Tailwind + Paleta personalizada
│   ├── next.config.js                  # Next.js config
│   ├── postcss.config.js               # PostCSS config
│   ├── .gitignore                      # Git ignore rules
│   └── .gitattributes                  # Git attributes (LF)
│
└── 🚫 IGNORADOS (crear localmente)
    ├── .env                            # Variables de entorno
    ├── node_modules/                   # Dependencias
    └── .next/                          # Build de Next.js
```

---

## 📊 Dashboard Principal

```
┌────────────────────────────────────────────────────────────────┐
│  [Logo] Universidad Tecnológica Nacional    [🔍] [🔔] [👤]    │ ← Navbar
├────────────────────────────────────────────────────────────────┤
│ [☰]│ Dashboard - Panel de Control                              │
│ 📊 │ Resumen general de la actividad universitaria             │
│────┤                                                            │
│ 👥 │ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│ 👨‍🏫│ │👥  50    │ │👨‍🏫  8   │ │📁  16   │ │✅  12   │     │ ← Métricas
│ 📚 │ │Alumnos   │ │Docentes  │ │Grupos    │ │Tareas    │     │
│ 📁 │ │Totales   │ │          │ │Activos   │ │Hoy       │     │
│ 📝 │ └──────────┘ └──────────┘ └──────────┘ └──────────┘     │
│ ⚙️ │                                                            │
│    │ ┌─────────────────────┐ ┌─────────────────────┐          │
│    │ │ Estudiantes         │ │ Grupos Populares    │          │ ← Widgets
│    │ │ Recientes           │ │                     │          │
│    │ │ • Juan García       │ │ • POO - Grupo 1     │          │
│    │ │ • María López       │ │ • BD - Grupo 2      │          │
│    │ └─────────────────────┘ └─────────────────────┘          │
│    │                                                            │
│    │ ┌──────────────────────────────────────────────┐          │
│    │ │ Tareas Próximas a Vencer                     │          │
│    │ │ • Tarea 1 - Algoritmos (Vence: 15/02/26)    │          │
│    │ │ • Tarea 2 - Bases de Datos (Vence: 18/02/26)│          │
│    │ └──────────────────────────────────────────────┘          │
└────────────────────────────────────────────────────────────────┘
  ↑
Sidebar
```

---

## 🎨 Paleta de Colores

```
AZUL INSTITUCIONAL (Primary)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
██ #eff6ff  ██ #dbeafe  ██ #bfdbfe  ██ #93c5fd
50         100        200        300

██ #60a5fa  ██ #3b82f6  ██ #2563eb  ██ #1d4ed8
400        500        600 ⭐     700

██ #1e40af  ██ #1e3a8a  ██ #172554
800        900        950

GRIS PIZARRA (Slate)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
██ #f8fafc  ██ #f1f5f9  ██ #e2e8f0  ██ #cbd5e1
50         100        200        300

██ #94a3b8  ██ #64748b  ██ #475569  ██ #334155
400        500        600        700

██ #1e293b  ██ #0f172a  ██ #020617
800        900        950
```

---

## 🗄️  Modelos de Base de Datos

```
University (Tenant Principal)
│
├── Student ────┐
│   • id                                    
│   • universityId ←── 🔒 Filtro Multi-Tenant
│   • email, firstName, lastName
│   • enrollmentId
│   • isActive
│   └── Enrollment ──→ Group
│
├── Teacher ────┐
│   • id
│   • universityId ←── 🔒 Filtro Multi-Tenant
│   • email, firstName, lastName
│   • department
│   • isActive
│   ├── Course (1:N)
│   └── Group (1:N)
│
├── Course
│   • id
│   • universityId ←── 🔒 Filtro Multi-Tenant
│   • teacherId
│   • name, code, description
│   • isActive
│   ├── Group (1:N)
│   └── Assignment (1:N)
│
├── Group
│   • id
│   • universityId ←── 🔒 Filtro Multi-Tenant
│   • courseId, teacherId
│   • name, schedule
│   • isActive
│   └── Enrollment (N:M with Student)
│
├── Assignment
│   • id
│   • universityId ←── 🔒 Filtro Multi-Tenant
│   • courseId
│   • title, description
│   • dueDate, maxScore
│   • isActive
│   └── Submission (1:N)
│
└── Submission
    • id
    • assignmentId
    • studentId
    • content, fileUrl
    • score, feedback
    • submittedAt, gradedAt
```

---

## 🔄 Flujo Multi-Tenant

```
1. Usuario accede al Dashboard
          ↓
2. Layout obtiene university_id
   getCurrentUniversityId()
          ↓
3. Server Actions con filtrado automático
   getDashboardMetrics()
          ↓
4. Prisma filtra por universityId
   prisma.student.count({
     where: { universityId }  ← 🔒 Aislamiento
   })
          ↓
5. Retorna SOLO datos de esa universidad
          ↓
6. UI renderiza datos aislados
```

---

## 📱 Responsive Breakpoints

```
MOBILE (< 640px)
┌─────────────┐
│ [☰]   [🔔👤]│  ← Navbar compacto
├─────────────┤
│             │
│  ┌────────┐ │  ← Métricas: 1 columna
│  │   50   │ │
│  │Alumnos │ │
│  └────────┘ │
│             │
│  ┌────────┐ │
│  │   8    │ │
│  │Docentes│ │
│  └────────┘ │
│             │
└─────────────┘


TABLET (640px - 1024px)
┌────────────────────────┐
│ [☰]     [🔍] [🔔] [👤] │
├────────────────────────┤
│  ┌────────┐ ┌────────┐ │  ← Métricas: 2 columnas
│  │   50   │ │   8    │ │
│  │Alumnos │ │Docentes│ │
│  └────────┘ └────────┘ │
│  ┌────────┐ ┌────────┐ │
│  │   16   │ │   12   │ │
│  │Grupos  │ │Tareas  │ │
│  └────────┘ └────────┘ │
└────────────────────────┘


DESKTOP (> 1024px)
┌──┬─────────────────────────────────────────┐
│ D│      [🔍]         [🔔] [👤]             │
│ a├─────────────────────────────────────────┤
│ s│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐    │  ← Métricas: 4 columnas
│ h│ │  50  │ │  8   │ │  16  │ │  12  │    │
│ b│ │Alumn.│ │Docen.│ │Grupos│ │Tareas│    │
│ o│ └──────┘ └──────┘ └──────┘ └──────┘    │
│ a│                                         │
│ r│ ┌────────────┐ ┌────────────┐          │
│ d│ │Estudiantes │ │   Grupos   │          │
└──┴─────────────────────────────────────────┘
  ↑
Sidebar (colapsable)
```

---

## 🚀 Comandos de Inicio Rápido

```bash
# 1️⃣  Instalar
npm install

# 2️⃣  Configurar .env
DATABASE_URL="postgresql://..."
DEFAULT_UNIVERSITY_ID="universidad-demo"

# 3️⃣  Setup Base de Datos
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed

# 4️⃣  Iniciar
npm run dev

# 5️⃣  Abrir
http://localhost:3000

# ✅ ¡Listo!
```

---

## 📦 Dependencias Principales

```
PRODUCCIÓN
├── next@14.1.0                   Framework React
├── react@18.2.0                  UI Library
├── @prisma/client@5.8.0          ORM Client
├── lucide-react@0.309.0          Iconos
└── clsx@2.1.0                    Utilidad CSS

DESARROLLO
├── typescript@5.3.3              Lenguaje
├── tailwindcss@3.4.1             CSS Framework
├── prisma@5.8.0                  ORM CLI
└── tsx@4.7.0                     TypeScript Runner
```

---

## 🎯 4 Métricas del Dashboard

```
┌──────────────────────┐
│  👥  50              │  Alumnos Totales
│  Alumnos Totales     │  ────────────────
│  Estudiantes activos │  Query: student.count()
└──────────────────────┘  Filtro: universityId + isActive
       Azul              Color: bg-blue-100, text-blue-600

┌──────────────────────┐
│  👨‍🏫  8             │  Docentes
│  Docentes            │  ─────────
│  Profesores activos  │  Query: teacher.count()
└──────────────────────┘  Filtro: universityId + isActive
      Púrpura            Color: bg-purple-100, text-purple-600

┌──────────────────────┐
│  📁  16              │  Grupos Activos
│  Grupos Activos      │  ───────────────
│  Grupos en curso     │  Query: group.count()
└──────────────────────┘  Filtro: universityId + isActive
       Verde             Color: bg-green-100, text-green-600

┌──────────────────────┐
│  ✅  12              │  Tareas Entregadas Hoy
│  Tareas Entregadas   │  ──────────────────────
│  Entregas del día    │  Query: submission.count()
└──────────────────────┘  Filtro: submittedAt = today
      Naranja            Color: bg-orange-100, text-orange-600
```

---

## ✅ Estado del Proyecto

```
CONFIGURACIÓN          ████████████████████ 100%
BASE DE DATOS          ████████████████████ 100%
UI/UX                  ████████████████████ 100%
DASHBOARD              ████████████████████ 100%
MULTI-TENANT           ████████████████████ 100%
DOCUMENTACIÓN          ████████████████████ 100%

AUTENTICACIÓN          ░░░░░░░░░░░░░░░░░░░░   0%
CRUD COMPLETO          ░░░░░░░░░░░░░░░░░░░░   0%
SISTEMA DE ARCHIVOS    ░░░░░░░░░░░░░░░░░░░░   0%
NOTIFICACIONES         ░░░░░░░░░░░░░░░░░░░░   0%

Estado General: 🟢 OPERATIONAL
```

---

**Sistema LMS Multi-Tenant v1.0.0**  
**Desarrollado con**: Next.js 14 + Prisma + Tailwind CSS  
**Fecha**: Enero 2026


