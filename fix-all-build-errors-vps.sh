#!/bin/bash

# Script para corregir TODOS los errores de build de una vez
# Ejecutar en el VPS: bash fix-all-build-errors-vps.sh

cd /var/www/html/pulso

echo "================================================================"
echo "  CORRIGIENDO TODOS LOS ERRORES DE BUILD"
echo "================================================================"
echo ""

# 1. Corregir app/dashboard/usuarios/actions.ts - tipos Role
echo "[1/5] Corrigiendo tipos Role en usuarios/actions.ts..."

# Crear archivo temporal con el fix
cat > /tmp/fix_getUsers.txt << 'EOF'
  // Convertir role de string a Role type
  return users.map((user) => ({
    ...user,
    role: user.role as Role,
  })) as UserWithProfile[];
EOF

# Reemplazar return users; en getUsers (línea ~60)
sed -i '/^  });$/{N; s/^  });\n\n  return users;$/  });\n\n  \/\/ Convertir role de string a Role type\n  return users.map((user) => ({\n    ...user,\n    role: user.role as Role,\n  })) as UserWithProfile[];/}' app/dashboard/usuarios/actions.ts

# Si no funcionó, hacerlo manualmente
if grep -q "return users;" app/dashboard/usuarios/actions.ts; then
    # Reemplazar primera ocurrencia (getUsers)
    sed -i '0,/return users;/s/return users;/return users.map((user) => ({ ...user, role: user.role as Role, })) as UserWithProfile[];/' app/dashboard/usuarios/actions.ts
    # Reemplazar segunda ocurrencia (searchUsers)
    sed -i '0,/return users;/s/return users;/return users.map((user) => ({ ...user, role: user.role as Role, })) as UserWithProfile[];/' app/dashboard/usuarios/actions.ts
fi

echo "✓ Tipos Role corregidos"

# 2. Corregir app/dashboard/usuarios/page.tsx - teacherId/studentId
echo ""
echo "[2/5] Corrigiendo teacherId/studentId en usuarios/page.tsx..."

sed -i 's/user\.teacherId/user.teacher?.id/g' app/dashboard/usuarios/page.tsx
sed -i 's/user\.studentId/user.student?.id/g' app/dashboard/usuarios/page.tsx

echo "✓ teacherId/studentId corregidos"

# 3. Verificar que lib/auth-config.ts existe
echo ""
echo "[3/5] Verificando lib/auth-config.ts..."

if [ ! -f "lib/auth-config.ts" ]; then
    echo "⚠️  lib/auth-config.ts no existe, creándolo..."
    mkdir -p lib
    
    cat > lib/auth-config.ts << 'EOFAUTH'
// Configuración de NextAuth separada para poder exportarla
import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth-utils';

// Extender tipos de NextAuth
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

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email y contraseña son requeridos');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            teacher: true,
            student: true,
          },
        });

        if (!user || !user.isActive) {
          throw new Error('Usuario no encontrado o inactivo');
        }

        const isPasswordValid = await verifyPassword(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error('Contraseña incorrecta');
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          universityId: user.universityId,
          teacherId: user.teacherId || undefined,
          studentId: user.studentId || undefined,
        };
      },
    }),
  ],
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.universityId = user.universityId;
        token.teacherId = user.teacherId;
        token.studentId = user.studentId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.universityId = token.universityId;
        session.user.teacherId = token.teacherId;
        session.user.studentId = token.studentId;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
};
EOFAUTH
    echo "✓ lib/auth-config.ts creado"
else
    echo "✓ lib/auth-config.ts ya existe"
fi

# 4. Actualizar todas las importaciones de authOptions
echo ""
echo "[4/5] Actualizando importaciones de authOptions..."

find app -name "*.ts" -type f -exec sed -i "s|from '@/app/api/auth/\[\.\.\.nextauth\]/route'|from '@/lib/auth-config'|g" {} \;
find lib -name "*.ts" -type f -exec sed -i "s|from '@/app/api/auth/\[\.\.\.nextauth\]/route'|from '@/lib/auth-config'|g" {} \;

echo "✓ Importaciones actualizadas"

# 5. Verificar que app/api/auth/[...nextauth]/route.ts importa desde lib/auth-config
echo ""
echo "[5/5] Verificando route.ts..."

if grep -q "export const authOptions" app/api/auth/\[...nextauth\]/route.ts; then
    echo "⚠️  route.ts aún exporta authOptions, corrigiendo..."
    cat > app/api/auth/\[...nextauth\]/route.ts << 'EOFROUTE'
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth-config';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
EOFROUTE
    echo "✓ route.ts corregido"
else
    echo "✓ route.ts ya está correcto"
fi

echo ""
echo "================================================================"
echo "  TODAS LAS CORRECCIONES APLICADAS"
echo "================================================================"
echo ""
echo "Ahora ejecuta:"
echo "  npm run build"
echo ""
echo "Si aún hay errores, compártelos y los corregimos."
echo "================================================================"

