// Extensión de tipos para NextAuth
// Este archivo debe estar en la raíz o en una carpeta types/

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

