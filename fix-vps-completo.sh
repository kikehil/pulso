#!/bin/bash

# Script COMPLETO para corregir TODOS los errores en el VPS
# Ejecutar: bash fix-vps-completo.sh

cd /var/www/html/pulso

echo "================================================================"
echo "  CORRIGIENDO TODOS LOS ERRORES DE BUILD"
echo "================================================================"
echo ""

# 1. Crear lib/auth-config.ts si no existe
echo "[1/4] Verificando lib/auth-config.ts..."
if [ ! -f "lib/auth-config.ts" ]; then
    echo "Creando lib/auth-config.ts..."
    mkdir -p lib
    cat > lib/auth-config.ts << 'EOFAUTH'
import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth-utils';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      role: string;
      universityId: string;
      teacherId?: string;
      studentId?: string;
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
          include: { teacher: true, student: true },
        });
        if (!user || !user.isActive) {
          throw new Error('Usuario no encontrado o inactivo');
        }
        const isPasswordValid = await verifyPassword(credentials.password, user.password);
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
  pages: { signIn: '/login', signOut: '/login', error: '/login' },
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
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  secret: process.env.NEXTAUTH_SECRET,
};
EOFAUTH
    echo "✓ lib/auth-config.ts creado"
else
    echo "✓ lib/auth-config.ts ya existe"
fi

# 2. Corregir todas las importaciones de authOptions
echo ""
echo "[2/4] Corrigiendo importaciones de authOptions..."
find app -name "*.ts" -type f -exec sed -i "s|from '@/app/api/auth/\[\.\.\.nextauth\]/route'|from '@/lib/auth-config'|g" {} \;
find lib -name "*.ts" -type f -exec sed -i "s|from '@/app/api/auth/\[\.\.\.nextauth\]/route'|from '@/lib/auth-config'|g" {} \;
echo "✓ Importaciones corregidas"

# 3. Corregir route.ts
echo ""
echo "[3/4] Corrigiendo app/api/auth/[...nextauth]/route.ts..."
cat > app/api/auth/\[...nextauth\]/route.ts << 'EOFROUTE'
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth-config';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
EOFROUTE
echo "✓ route.ts corregido"

# 4. Corregir tipos Role y teacherId/studentId
echo ""
echo "[4/4] Corrigiendo tipos en usuarios..."

# Tipos Role en actions.ts
if grep -q "return users;" app/dashboard/usuarios/actions.ts; then
    sed -i 's/return users;/return users.map((user) => ({ ...user, role: user.role as Role, })) as UserWithProfile[];/g' app/dashboard/usuarios/actions.ts
fi

# teacherId/studentId en page.tsx
sed -i 's/user\.teacherId/user.teacher?.id/g' app/dashboard/usuarios/page.tsx
sed -i 's/user\.studentId/user.student?.id/g' app/dashboard/usuarios/page.tsx

echo "✓ Tipos corregidos"

echo ""
echo "================================================================"
echo "  TODAS LAS CORRECCIONES APLICADAS"
echo "================================================================"
echo ""
echo "Ejecuta: npm run build"
echo "================================================================"

