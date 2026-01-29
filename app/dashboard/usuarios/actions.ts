'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUniversityId } from '@/lib/tenant';
import { hashPassword } from '@/lib/auth-utils';
import { revalidatePath } from 'next/cache';
import { Role } from '@/lib/types';

export interface UserWithProfile {
  id: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  teacher: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  } | null;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  } | null;
}

// Obtener todos los usuarios
export async function getUsers(): Promise<UserWithProfile[]> {
  const universityId = await getCurrentUniversityId();

  const users = await prisma.user.findMany({
    where: {
      universityId,
    },
    include: {
      teacher: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
        },
      },
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Convertir role de string a Role type
  return users.map((user) => ({
    ...user,
    role: user.role as Role,
  })) as UserWithProfile[];
}

// Crear nuevo usuario
export async function createUser(data: {
  email: string;
  password: string;
  role: Role;
  profileId?: string; // ID del perfil existente (teacherId o studentId)
}) {
  const universityId = await getCurrentUniversityId();

  // Verificar si el email ya existe
  const existing = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  });

  if (existing) {
    throw new Error('Ya existe un usuario con ese email');
  }

  // Hash de contraseña
  const hashedPassword = await hashPassword(data.password);

  // Crear usuario
  const user = await prisma.user.create({
    data: {
      universityId,
      email: data.email,
      password: hashedPassword,
      role: data.role,
      teacherId: data.role === 'DOCENTE' ? data.profileId : undefined,
      studentId: data.role === 'ALUMNO' ? data.profileId : undefined,
    },
  });

  revalidatePath('/dashboard/usuarios');
  return user;
}

// Actualizar usuario
export async function updateUser(
  id: string,
  data: {
    email: string;
    role: Role;
    isActive: boolean;
    profileId?: string;
  }
) {
  const universityId = await getCurrentUniversityId();

  // Verificar que el usuario pertenece a la universidad
  const existing = await prisma.user.findFirst({
    where: {
      id,
      universityId,
    },
  });

  if (!existing) {
    throw new Error('Usuario no encontrado');
  }

  // Actualizar usuario
  await prisma.user.update({
    where: { id },
    data: {
      email: data.email,
      role: data.role,
      isActive: data.isActive,
      teacherId: data.role === 'DOCENTE' ? data.profileId : null,
      studentId: data.role === 'ALUMNO' ? data.profileId : null,
    },
  });

  revalidatePath('/dashboard/usuarios');
}

// Toggle estado del usuario
export async function toggleUserStatus(id: string, isActive: boolean) {
  const universityId = await getCurrentUniversityId();

  const existing = await prisma.user.findFirst({
    where: {
      id,
      universityId,
    },
  });

  if (!existing) {
    throw new Error('Usuario no encontrado');
  }

  await prisma.user.update({
    where: { id },
    data: {
      isActive,
    },
  });

  revalidatePath('/dashboard/usuarios');
}

// Eliminar usuario
export async function deleteUser(id: string) {
  const universityId = await getCurrentUniversityId();

  const existing = await prisma.user.findFirst({
    where: {
      id,
      universityId,
    },
  });

  if (!existing) {
    throw new Error('Usuario no encontrado');
  }

  await prisma.user.delete({
    where: { id },
  });

  revalidatePath('/dashboard/usuarios');
}

// Restablecer contraseña
export async function resetPassword(id: string, newPassword: string) {
  const universityId = await getCurrentUniversityId();

  const existing = await prisma.user.findFirst({
    where: {
      id,
      universityId,
    },
  });

  if (!existing) {
    throw new Error('Usuario no encontrado');
  }

  const hashedPassword = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id },
    data: {
      password: hashedPassword,
    },
  });

  revalidatePath('/dashboard/usuarios');
}

// Obtener perfiles disponibles según rol
export async function getAvailableProfiles(role: Role) {
  const universityId = await getCurrentUniversityId();

  if (role === 'DOCENTE') {
    const teachers = await prisma.teacher.findMany({
      where: {
        universityId,
        user: null, // Solo docentes sin usuario asignado
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    });
    return teachers;
  } else if (role === 'ALUMNO') {
    const students = await prisma.student.findMany({
      where: {
        universityId,
        user: null, // Solo alumnos sin usuario asignado
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    });
    return students;
  }

  return [];
}

// Buscar usuarios
export async function searchUsers(query: string): Promise<UserWithProfile[]> {
  const universityId = await getCurrentUniversityId();

  const users = await prisma.user.findMany({
    where: {
      universityId,
      OR: [
        { email: { contains: query } },
        {
          teacher: {
            OR: [
              { firstName: { contains: query } },
              { lastName: { contains: query } },
            ],
          },
        },
        {
          student: {
            OR: [
              { firstName: { contains: query } },
              { lastName: { contains: query } },
            ],
          },
        },
      ],
    },
    include: {
      teacher: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
        },
      },
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Convertir role de string a Role type
  return users.map((user) => ({
    ...user,
    role: user.role as Role,
  })) as UserWithProfile[];
}

