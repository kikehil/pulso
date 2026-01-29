// Utilities para autenticación y manejo de roles
// TODO: Integrar con NextAuth.js en producción

import { Role } from '@/lib/types';

// Simulación de usuario actual (reemplazar con NextAuth/JWT)
export const getCurrentUser = () => {
  // TODO: Obtener del token/sesión real
  return {
    id: 'user-admin-1',
    email: 'admin@universidad.edu',
    role: 'ADMIN' as Role,
    universityId: 'universidad-demo',
  };
};

// Verificar si el usuario tiene un rol específico
export const hasRole = (userRole: Role, allowedRoles: Role[]): boolean => {
  return allowedRoles.includes(userRole);
};

// Verificar si el usuario es admin
export const isAdmin = (userRole: Role): boolean => {
  return userRole === 'ADMIN';
};

// Verificar si el usuario es docente
export const isTeacher = (userRole: Role): boolean => {
  return userRole === 'DOCENTE';
};

// Verificar si el usuario es alumno
export const isStudent = (userRole: Role): boolean => {
  return userRole === 'ALUMNO';
};

// Obtener dashboard según rol
export const getDashboardPath = (role: Role): string => {
  switch (role) {
    case 'ADMIN':
      return '/dashboard';
    case 'DOCENTE':
      return '/dashboard';
    case 'ALUMNO':
      return '/dashboard';
    default:
      return '/dashboard';
  }
};

// Hash de contraseña (usar bcrypt en producción)
export const hashPassword = async (password: string): Promise<string> => {
  // TODO: Implementar bcrypt
  // return await bcrypt.hash(password, 10);
  return `hashed_${password}`; // Simulación
};

// Verificar contraseña
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  // TODO: Implementar bcrypt
  // return await bcrypt.compare(password, hash);
  return hash === `hashed_${password}`; // Simulación
};

