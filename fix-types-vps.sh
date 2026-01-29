#!/bin/bash

# Script para corregir error de tipos de NextAuth en el VPS
# Ejecutar directamente en el VPS

echo ""
echo "================================================================"
echo "  CORRIGIENDO ERROR DE TIPOS DE NEXT-AUTH"
echo "================================================================"
echo ""

PROJECT_DIR="/var/www/html/pulso"
cd $PROJECT_DIR

# 1. Crear directorio types si no existe
mkdir -p types

# 2. Crear archivo de tipos
cat > types/next-auth.d.ts << 'EOF'
// Extensión de tipos para NextAuth
import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      role: string;
      universityId: string;
      teacherId?: string;
      studentId?: string;
      name?: string | null;
      image?: string | null;
    };
  }

  interface User {
    id: string;
    email: string;
    role: string;
    universityId: string;
    teacherId?: string;
    studentId?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
    universityId: string;
    teacherId?: string;
    studentId?: string;
  }
}
EOF

echo "✓ Archivo types/next-auth.d.ts creado"

# 3. Actualizar tsconfig.json
if grep -q "types/\*\*/\*\.ts" tsconfig.json; then
    echo "✓ tsconfig.json ya incluye types/"
else
    # Agregar types/ al include
    sed -i 's/"include": \[/"include": ["types\/**\/*.ts", /' tsconfig.json
    echo "✓ tsconfig.json actualizado"
fi

# 4. Alternativa: Corregir el archivo problemático directamente
echo ""
echo "Aplicando fix alternativo en app/student/assignments/actions.ts..."

# Crear backup
cp app/student/assignments/actions.ts app/student/assignments/actions.ts.backup

# Usar type assertion para evitar el error
sed -i 's/if (!session?.user?.studentId)/if (!(session?.user as any)?.studentId)/' app/student/assignments/actions.ts
sed -i 's/return session.user.studentId;/return (session.user as any).studentId;/' app/student/assignments/actions.ts

echo "✓ Fix aplicado con type assertion"

echo ""
echo "================================================================"
echo "  CORRECCIONES APLICADAS"
echo "================================================================"
echo ""
echo "Se han aplicado 2 soluciones:"
echo "  1. Archivo de tipos creado en types/next-auth.d.ts"
echo "  2. Type assertion en app/student/assignments/actions.ts"
echo ""
echo "Ahora ejecuta:"
echo "  npm run build"
echo ""
echo "================================================================"

