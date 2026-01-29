# 🎨 Guía de Diseño - PulseTec Control

Sistema de diseño completo para mantener consistencia visual en todos los proyectos.

---

## 🎨 Paleta de Colores

### Colores Principales

```css
/* Primary - Cyan Tecnológico */
--primary: #06B6D4;

/* Dark - Slate Oscuro */
--dark: #0F172A;

/* Gray - Slate Medio */
--gray: #64748B;

/* Light - Fondo Claro */
--light: #F8FAFC;
```

### Uso de Colores

| Color | Uso Principal | Ejemplos |
|-------|---------------|----------|
| **Primary (#06B6D4)** | Acciones, enlaces, hover, botones principales | Botones CTA, links activos, iconos principales |
| **Dark (#0F172A)** | Textos, sidebar, fondos oscuros | Títulos, texto de cuerpo, sidebar background |
| **Gray (#64748B)** | Textos secundarios, iconos inactivos | Subtítulos, placeholders, iconos sidebar |
| **Light (#F8FAFC)** | Fondo de aplicación, fondos sutiles | Background principal, cards hover |

---

## 🔤 Tipografía

### Fuente: Inter

```css
font-family: 'Inter', system-ui, sans-serif;
```

### Pesos y Uso

| Peso | Nombre | Uso | Tailwind |
|------|--------|-----|----------|
| **400** | Regular | Cuerpo de texto, párrafos | `font-regular` |
| **500** | Medium | Botones, etiquetas | `font-medium` |
| **700** | Bold | Títulos, encabezados | `font-bold` |

### Jerarquía de Texto

```tsx
// H1 - Títulos principales
<h1 className="text-3xl font-bold text-dark">Dashboard</h1>

// H2 - Subtítulos de sección
<h2 className="text-xl font-bold text-dark">Estudiantes Recientes</h2>

// H3 - Títulos de cards
<h3 className="text-lg font-bold text-dark">Total Estudiantes</h3>

// Cuerpo - Texto regular
<p className="text-sm font-regular text-gray">Descripción...</p>

// Botones
<button className="font-medium">Aceptar</button>
```

---

## 🎴 Componentes

### 1. Cards

```tsx
// Card básica - PulseTec
<div className="card">
  <h3 className="card-title">Título</h3>
  <p className="card-subtitle">Subtítulo</p>
</div>
```

**Características:**
- ✅ Fondo blanco
- ✅ Bordes redondeados (`rounded-xl`)
- ✅ Sombra suave (`shadow-sm`)
- ✅ Hover con sombra más pronunciada (`hover:shadow-md`)

### 2. Metric Cards (Cards de Métricas)

```tsx
<MetricCard
  title="Alumnos Totales"
  value="150"
  subtitle="Estudiantes activos"
  icon={Users}
  iconBgColor="bg-primary/10"
  iconColor="text-primary"
/>
```

**Características:**
- ✅ Valor principal en grande y bold
- ✅ Icono con fondo suave
- ✅ Hover cambia color del valor a primary
- ✅ Sombra en el icono

### 3. Botones

#### Botón Primary

```tsx
<button className="btn-primary">
  Guardar Cambios
</button>
```

**Estilo:**
- Background: `#06B6D4`
- Texto: Blanco
- Hover: `#0891b2`
- Sombra: `shadow-lg shadow-primary/20`

#### Botón Secondary

```tsx
<button className="btn-secondary">
  Cancelar
</button>
```

**Estilo:**
- Background: Gris claro
- Texto: Dark
- Hover: Gris más oscuro

### 4. Inputs y Formularios

#### Input Básico

```tsx
<input 
  type="text" 
  className="input-field"
  placeholder="Escribe aquí..."
/>
```

**Estados:**
- Default: Border `#64748B` (gray)
- Focus: Border `#06B6D4` (primary) + Ring suave
- Disabled: Opacidad reducida

#### Input de Búsqueda

```tsx
<SearchForm placeholder="Buscar estudiantes..." />
```

**Características:**
- ✅ Icono de búsqueda a la izquierda
- ✅ Focus con border primary
- ✅ Ring suave en focus (`ring-primary/20`)
- ✅ Placeholder en gray

### 5. Sidebar

```tsx
// Desktop Sidebar
<aside className="bg-dark border-r border-dark-800">
  <nav className="sidebar-link">
    <Icon className="text-gray" />
    <span className="text-gray">Dashboard</span>
  </nav>
</aside>
```

**Características:**
- ✅ Fondo: `#0F172A` (dark)
- ✅ Iconos: `#64748B` (gray)
- ✅ Hover: Text y fondo cambian a primary
- ✅ Activo: Fondo primary, texto blanco

### 6. Navbar

```tsx
<header className="bg-white border-b shadow-sm">
  <input className="search-input" placeholder="Buscar..." />
  <Bell className="text-gray hover:text-primary" />
</header>
```

**Características:**
- ✅ Fondo blanco
- ✅ Sombra suave
- ✅ Iconos en gray
- ✅ Hover de iconos a primary

---

## 📐 Espaciado y Tamaños

### Espaciado

| Uso | Tailwind | Píxeles |
|-----|----------|---------|
| Gap entre cards | `gap-6` | 24px |
| Padding en cards | `p-6` | 24px |
| Margin entre secciones | `space-y-6` | 24px |
| Gap en inputs | `gap-3` | 12px |

### Bordes Redondeados

| Elemento | Tailwind |
|----------|----------|
| Cards | `rounded-xl` |
| Botones | `rounded-lg` |
| Inputs | `rounded-lg` |
| Iconos | `rounded-xl` |
| Avatares | `rounded-full` |

### Sombras

```css
/* Sombra suave - Cards */
shadow-sm

/* Sombra media - Hover */
shadow-md

/* Sombra con color - Botones */
shadow-lg shadow-primary/20
```

---

## 🎭 Estados Interactivos

### Hover

```tsx
// Card hover
hover:shadow-md
hover:bg-primary/5
hover:border-primary/20

// Botón hover
hover:bg-primary-600

// Link hover
hover:text-primary

// Sidebar item hover
hover:bg-primary/10
hover:text-primary
```

### Focus (Inputs)

```tsx
focus:border-primary
focus:ring-2
focus:ring-primary/20
focus:outline-none
```

### Active (Sidebar)

```tsx
className="sidebar-link active"
// Aplica:
// bg-primary
// text-white
// font-medium
```

---

## 📱 Responsive Design

### Breakpoints

```tsx
// Mobile first approach
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
```

| Breakpoint | Tailwind | Píxeles |
|------------|----------|---------|
| Mobile | (default) | < 640px |
| Tablet | `sm:` | ≥ 640px |
| Desktop | `lg:` | ≥ 1024px |
| Extra Large | `xl:` | ≥ 1280px |

### Sidebar Responsive

- **Mobile**: Oculto, se abre con overlay
- **Desktop**: Fijo, colapsable a 80px

---

## 🎯 Ejemplos de Uso

### Dashboard Header

```tsx
<div>
  <h1 className="text-2xl lg:text-3xl font-bold text-dark">
    Dashboard - Panel de Control
  </h1>
  <p className="text-gray mt-1 font-regular">
    Resumen general de la actividad universitaria
  </p>
</div>
```

### Card de Estudiante

```tsx
<div className="p-3 rounded-lg bg-light hover:bg-primary/5 hover:border hover:border-primary/20 transition-all duration-200 cursor-pointer">
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm ring-2 ring-primary/20">
      JD
    </div>
    <div>
      <p className="font-medium text-dark text-sm">Juan Pérez</p>
      <p className="text-xs text-gray">juan@universidad.edu</p>
    </div>
  </div>
</div>
```

### Botón con Icono

```tsx
<button className="btn-primary inline-flex items-center gap-2 shadow-lg shadow-primary/20">
  <UserPlus className="w-5 h-5" />
  Agregar Estudiante
</button>
```

### Badge/Tag

```tsx
<span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium shadow-sm">
  15 estudiantes
</span>
```

---

## ✅ Checklist de Diseño

Antes de considerar un componente terminado, verifica:

- [ ] Usa la paleta de colores PulseTec
- [ ] Tipografía Inter con pesos correctos
- [ ] Bordes redondeados apropiados
- [ ] Sombras suaves
- [ ] Hover states implementados
- [ ] Focus states en inputs
- [ ] Responsive en mobile, tablet y desktop
- [ ] Transiciones suaves (`transition-all duration-200`)
- [ ] Iconos en tamaño consistente
- [ ] Espaciado consistente

---

## 🚫 No Hacer

❌ **NO** usar colores fuera de la paleta
❌ **NO** mezclar diferentes sistemas de sombras
❌ **NO** usar `font-semibold` (usar `font-medium` o `font-bold`)
❌ **NO** olvidar estados hover/focus
❌ **NO** usar bordes cuadrados (`rounded-none`)
❌ **NO** sobrecargar con sombras muy pronunciadas

---

## ✅ Sí Hacer

✅ **SÍ** mantener consistencia en espaciado
✅ **SÍ** usar transiciones en hover
✅ **SÍ** agregar feedback visual (hover, focus)
✅ **SÍ** considerar mobile-first
✅ **SÍ** usar la jerarquía tipográfica
✅ **SÍ** mantener contraste accesible

---

## 🎨 Recursos

### Generar Colores

```bash
# Primary variations
primary-50 to primary-900

# Custom colors
bg-primary/10  # 10% opacity
text-primary/70  # 70% opacity
```

### Fuentes

```html
<!-- Google Fonts -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" rel="stylesheet">
```

### Iconos

```tsx
import { Users, Search, Bell, Settings } from 'lucide-react';

<Users className="w-5 h-5 text-primary" />
```

---

## 📦 Componentes PulseTec Disponibles

1. **SearchForm** - Formulario de búsqueda
2. **PulseTecCard** - Card estilo PulseTec
3. **MetricCard** - Card de métricas
4. **Sidebar** - Sidebar con estilo dark
5. **Navbar** - Barra superior
6. **MobileSidebar** - Sidebar mobile con overlay

---

## 🔄 Actualizaciones

**Última actualización**: Enero 2026  
**Versión**: 1.0.0

---

**Mantén este diseño en todos los proyectos para consistencia visual profesional.**


