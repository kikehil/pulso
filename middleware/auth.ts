// Middleware de autenticación y autorización
// TODO: Implementar con NextAuth.js o middleware de Next.js

import { Role } from '@/lib/types';

// Rutas protegidas solo para ADMIN
export const ADMIN_ROUTES = [
  '/dashboard/usuarios',
  '/dashboard/configuracion/global',
  '/dashboard/settings/users',
];

// Rutas para DOCENTE
export const TEACHER_ROUTES = [
  '/dashboard/tareas',
  '/dashboard/docentes',
  '/dashboard/materias',
];

// Rutas para ALUMNO
export const STUDENT_ROUTES = [
  '/dashboard/tareas',
  '/dashboard/alumnos',
];

// Verificar si una ruta requiere rol ADMIN
export const requiresAdmin = (path: string): boolean => {
  return ADMIN_ROUTES.some(route => path.startsWith(route));
};

// Verificar si el usuario puede acceder a una ruta
export const canAccessRoute = (path: string, userRole: Role): boolean => {
  // ADMIN tiene acceso a todo
  if (userRole === 'ADMIN') return true;

  // ADMIN routes están bloqueadas para no-admin
  if (requiresAdmin(path)) return false;

  // DOCENTE tiene acceso a sus rutas
  if (userRole === 'DOCENTE') {
    return TEACHER_ROUTES.some(route => path.startsWith(route));
  }

  // ALUMNO tiene acceso a sus rutas
  if (userRole === 'ALUMNO') {
    return STUDENT_ROUTES.some(route => path.startsWith(route));
  }

  return false;
};

// Obtener redirect según rol si intenta acceder a ruta no permitida
export const getRedirectPath = (userRole: Role): string => {
  switch (userRole) {
    case 'ADMIN':
      return '/dashboard';
    case 'DOCENTE':
      return '/dashboard';
    case 'ALUMNO':
      return '/dashboard';
    default:
      return '/login';
  }
};

