#!/bin/bash

# ================================================================
# SCRIPT COMPLETO PARA CORREGIR TODOS LOS ERRORES DE BUILD
# ================================================================
# Ejecutar en el VPS: bash FIX-COMPLETO-VPS.sh
# ================================================================

set -e  # Detener en caso de error

cd /var/www/html/pulso

echo ""
echo "================================================================"
echo "  CORRIGIENDO TODOS LOS ERRORES DE BUILD"
echo "================================================================"
echo ""

# ================================================================
# 1. CREAR lib/auth-config.ts
# ================================================================
echo "[1/6] Verificando lib/auth-config.ts..."

if [ ! -f "lib/auth-config.ts" ]; then
    echo "   Creando lib/auth-config.ts..."
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

        console.log('🔐 AUTHORIZE - Email:', credentials.email);

        // Buscar usuario en la base de datos
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            teacher: true,
            student: true,
          },
        });

        if (!user) {
          console.log('❌ Usuario no encontrado');
          throw new Error('Usuario no encontrado');
        }

        console.log('✓ Usuario encontrado - Role:', user.role, '- Teacher ID:', user.teacherId);

        // Verificar si el usuario está activo
        if (!user.isActive) {
          throw new Error('Tu cuenta ha sido desactivada. Contacta al administrador.');
        }

        // Verificar contraseña
        const isPasswordValid = await verifyPassword(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          console.log('❌ Contraseña incorrecta');
          throw new Error('Contraseña incorrecta');
        }

        console.log('✓ Contraseña correcta');

        // Retornar usuario con datos completos
        const authUser = {
          id: user.id,
          email: user.email,
          role: user.role,
          universityId: user.universityId,
          teacherId: user.teacherId || undefined,
          studentId: user.studentId || undefined,
        };

        console.log('✓ Returning user - teacherId:', authUser.teacherId);
        return authUser;
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
        console.log('🔑 JWT - teacherId:', user.teacherId);
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
      console.log('📋 SESSION - teacherId:', session.user?.teacherId);
      return session;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  secret: process.env.NEXTAUTH_SECRET,
};
EOFAUTH
    echo "   ✓ lib/auth-config.ts creado"
else
    echo "   ✓ lib/auth-config.ts ya existe"
fi

# ================================================================
# 2. CORREGIR app/api/auth/[...nextauth]/route.ts
# ================================================================
echo ""
echo "[2/6] Corrigiendo app/api/auth/[...nextauth]/route.ts..."

cat > "app/api/auth/[...nextauth]/route.ts" << 'EOFROUTE'
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth-config';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
EOFROUTE

echo "   ✓ route.ts corregido"

# ================================================================
# 3. CORREGIR TODAS LAS IMPORTACIONES DE authOptions
# ================================================================
echo ""
echo "[3/6] Corrigiendo importaciones de authOptions..."

# Buscar y reemplazar en todos los archivos .ts
find app -name "*.ts" -type f -exec sed -i "s|from '@/app/api/auth/\[\.\.\.nextauth\]/route'|from '@/lib/auth-config'|g" {} \;
find lib -name "*.ts" -type f -exec sed -i "s|from '@/app/api/auth/\[\.\.\.nextauth\]/route'|from '@/lib/auth-config'|g" {} \;

echo "   ✓ Importaciones corregidas"

# ================================================================
# 4. CORREGIR TIPOS ROLE EN usuarios/actions.ts
# ================================================================
echo ""
echo "[4/6] Corrigiendo tipos Role en usuarios/actions.ts..."

# Crear archivo temporal con el fix
cat > /tmp/fix_role_return.txt << 'EOFROLE'
  // Convertir role de string a Role type
  return users.map((user) => ({
    ...user,
    role: user.role as Role,
  })) as UserWithProfile[];
EOFROLE

# Reemplazar "return users;" en getUsers (después de la línea con orderBy)
if grep -q "return users;" app/dashboard/usuarios/actions.ts; then
    # Reemplazar primera ocurrencia (getUsers)
    sed -i '0,/return users;/s/return users;/return users.map((user) => ({ ...user, role: user.role as Role, })) as UserWithProfile[];/' app/dashboard/usuarios/actions.ts
    
    # Reemplazar segunda ocurrencia (searchUsers) si existe
    if grep -q "return users;" app/dashboard/usuarios/actions.ts; then
        sed -i '0,/return users;/s/return users;/return users.map((user) => ({ ...user, role: user.role as Role, })) as UserWithProfile[];/' app/dashboard/usuarios/actions.ts
    fi
    
    echo "   ✓ Tipos Role corregidos"
else
    echo "   ✓ Tipos Role ya están corregidos"
fi

# ================================================================
# 5. CORREGIR teacherId/studentId EN usuarios/page.tsx
# ================================================================
echo ""
echo "[5/6] Corrigiendo teacherId/studentId en usuarios/page.tsx..."

sed -i 's/user\.teacherId/user.teacher?.id/g' app/dashboard/usuarios/page.tsx
sed -i 's/user\.studentId/user.student?.id/g' app/dashboard/usuarios/page.tsx

echo "   ✓ teacherId/studentId corregidos"

# ================================================================
# 6. CREAR types/next-auth.d.ts SI NO EXISTE
# ================================================================
echo ""
echo "[6/6] Verificando types/next-auth.d.ts..."

if [ ! -f "types/next-auth.d.ts" ]; then
    echo "   Creando types/next-auth.d.ts..."
    mkdir -p types
    cat > types/next-auth.d.ts << 'EOFTYPES'
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
EOFTYPES
    echo "   ✓ types/next-auth.d.ts creado"
else
    echo "   ✓ types/next-auth.d.ts ya existe"
fi

# ================================================================
# 7. CORREGIR app/docente/actions.ts - prisma.attendance
# ================================================================
echo ""
echo "[7/7] Corrigiendo app/docente/actions.ts (prisma.attendance)..."

# Reemplazar prisma.attendance.findMany por AttendanceSession
sed -i 's/prisma\.attendance\.findMany/prisma.attendanceSession.findFirst/g' app/docente/actions.ts
sed -i 's/prisma\.attendance\.count/prisma.attendanceSession.count/g' app/docente/actions.ts
sed -i 's/prisma\.attendance\.upsert/prisma.attendanceRecord.upsert/g' app/docente/actions.ts

# Nota: Los cambios complejos de lógica deben hacerse manualmente
# Este script corrige las referencias básicas
echo "   ⚠️  Referencias básicas corregidas"
echo "   ⚠️  Puede requerir ajustes manuales en la lógica"

# ================================================================
# RESUMEN
# ================================================================
echo ""
echo "================================================================"
echo "  TODAS LAS CORRECCIONES APLICADAS"
echo "================================================================"
echo ""
echo "Archivos corregidos:"
echo "  ✓ lib/auth-config.ts"
echo "  ✓ app/api/auth/[...nextauth]/route.ts"
echo "  ✓ Todas las importaciones de authOptions"
echo "  ✓ app/dashboard/usuarios/actions.ts (tipos Role)"
echo "  ✓ app/dashboard/usuarios/page.tsx (teacherId/studentId)"
echo "  ✓ types/next-auth.d.ts"
echo "  ✓ app/docente/actions.ts (prisma.attendance -> AttendanceSession)"
echo ""
echo "Ahora ejecuta:"
echo "  npm run build"
echo ""
echo "Si aún hay errores, compártelos y los corregimos."
echo "================================================================"
echo ""

