import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Si no hay token y intenta acceder a rutas protegidas, redirigir a login
    if (!token && path !== '/login') {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // Si ya está autenticado y va a /login, redirigir según rol
    if (token && path === '/login') {
      const role = token.role as string;
      if (role === 'DOCENTE') {
        return NextResponse.redirect(new URL('/teacher/dashboard', req.url));
      } else if (role === 'COORDINADOR') {
        return NextResponse.redirect(new URL('/teacher/dashboard', req.url));
      } else if (role === 'ALUMNO') {
        return NextResponse.redirect(new URL('/student/dashboard', req.url));
      }
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Protección por roles
    const role = token?.role as string;

    // Redirección automática según rol
    if (path === '/dashboard') {
      if (role === 'DOCENTE') {
        return NextResponse.redirect(new URL('/teacher/dashboard', req.url));
      } else if (role === 'COORDINADOR') {
        return NextResponse.redirect(new URL('/teacher/dashboard', req.url));
      } else if (role === 'ALUMNO') {
        return NextResponse.redirect(new URL('/student/dashboard', req.url));
      }
    }

    // Solo ADMIN y COORDINADOR pueden acceder a /dashboard/usuarios
    if (path.startsWith('/dashboard/usuarios') && role !== 'ADMIN' && role !== 'COORDINADOR') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // DOCENTE, COORDINADOR y ADMIN pueden acceder a /teacher/*
    if (path.startsWith('/teacher') && role !== 'DOCENTE' && role !== 'COORDINADOR' && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // ALUMNO, ADMIN y COORDINADOR pueden acceder a /student/*
    if (path.startsWith('/student') && role !== 'ALUMNO' && role !== 'ADMIN' && role !== 'COORDINADOR') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Solo DOCENTE, COORDINADOR y ADMIN pueden acceder a /docente (legacy)
    if (path.startsWith('/docente') && role !== 'DOCENTE' && role !== 'COORDINADOR' && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // ADMIN y COORDINADOR pueden acceder a /dashboard/*
    if (path.startsWith('/dashboard') && role !== 'ADMIN' && role !== 'COORDINADOR') {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Permitir acceso a /login sin token
        if (req.nextUrl.pathname === '/login') {
          return true;
        }
        // Para el resto de rutas, requerir token
        return !!token;
      },
    },
  }
);

// Configurar qué rutas proteger
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/docente/:path*',
    '/teacher/:path*',
    '/student/:path*',
    '/login',
  ],
};

