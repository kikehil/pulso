import NextAuth, { AuthOptions, User as NextAuthUser } from 'next-auth';
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
        } as NextAuthUser;

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

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

