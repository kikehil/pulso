/**
 * Utilidades para manejo de Multi-Tenant y Sesión
 * Este archivo contiene las funciones para obtener y validar el university_id (tenant)
 * y datos del usuario autenticado
 */

import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from './prisma';

// ============ SESIÓN DE USUARIO ============

// Obtener sesión actual
export async function getCurrentSession() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    throw new Error('No hay sesión activa');
  }
  return session;
}

// Obtener ID del usuario actual
export async function getCurrentUserId(): Promise<string> {
  const session = await getCurrentSession();
  return session.user.id;
}

// Obtener rol del usuario actual
export async function getCurrentUserRole(): Promise<string> {
  const session = await getCurrentSession();
  return session.user.role;
}

// Obtener ID del docente actual
export async function getCurrentTeacherId(): Promise<string> {
  const session = await getCurrentSession();
  
  if (session.user.role !== 'DOCENTE' && session.user.role !== 'COORDINADOR') {
    throw new Error('El usuario no es un docente');
  }
  
  if (!session.user.teacherId) {
    throw new Error('El usuario no tiene un teacherId asociado');
  }
  
  return session.user.teacherId;
}

// Obtener ID del estudiante actual
export async function getCurrentStudentId(): Promise<string> {
  const session = await getCurrentSession();
  
  if (session.user.role !== 'ALUMNO') {
    throw new Error('El usuario no es un estudiante');
  }
  
  if (!session.user.studentId) {
    throw new Error('El usuario no tiene un studentId asociado');
  }
  
  return session.user.studentId;
}

// ============ TENANT / UNIVERSIDAD ============

// Obtener ID de la universidad actual desde la sesión
export async function getCurrentUniversityId(): Promise<string> {
  try {
    const session = await getServerSession(authOptions);
    
    // Si hay sesión, usar el universityId del usuario
    if (session?.user?.universityId) {
      return session.user.universityId;
    }
  } catch (error) {
    console.log('No hay sesión activa, usando fallback');
  }

  // Fallback: Desde cookies (para desarrollo)
  const cookieStore = cookies();
  const universityId = cookieStore.get('university_id')?.value;
  
  if (universityId) {
    return universityId;
  }

  // Fallback final: Desde variable de entorno
  const defaultUniversityId = process.env.DEFAULT_UNIVERSITY_ID || 'default-university';
  return defaultUniversityId;
}

// Validar que el tenant existe
export async function validateUniversity(universityId: string): Promise<boolean> {
  const university = await prisma.university.findUnique({
    where: { id: universityId },
  });
  
  return !!university;
}

// Obtener información de la universidad actual
export async function getCurrentUniversity(universityId: string) {
  return await prisma.university.findUnique({
    where: { id: universityId },
  });
}

// Middleware helper para filtrar por tenant
export function tenantFilter(universityId: string) {
  return {
    universityId: universityId,
  };
}


