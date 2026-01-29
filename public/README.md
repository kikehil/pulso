# 📁 Public Assets

Esta carpeta contiene archivos estáticos servidos por Next.js.

## Estructura Recomendada

```
public/
├── logos/              # Logos de universidades
│   ├── utn.png
│   └── uba.png
├── images/             # Imágenes generales
├── icons/              # Iconos personalizados
└── fonts/              # Fuentes personalizadas (si es necesario)
```

## Uso

Los archivos en `public/` son accesibles desde la raíz:

```tsx
// Acceso desde componentes
<img src="/logos/utn.png" alt="Logo UTN" />

// O con Next.js Image
import Image from 'next/image';

<Image src="/logos/utn.png" alt="Logo" width={100} height={100} />
```

## Notas

- ⚠️ **No** uses rutas que empiecen con `/_next`
- ✅ Optimiza imágenes antes de subirlas
- ✅ Usa WebP para mejor compresión
- ✅ Nombra archivos en minúsculas con guiones: `logo-universidad.png`


