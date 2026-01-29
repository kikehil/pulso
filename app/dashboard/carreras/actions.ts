'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUniversityId } from '@/lib/tenant';
import { revalidatePath } from 'next/cache';

export interface Career {
  id: string;
  name: string;
  code: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  teacherName?: string;
}

// Obtener todas las carreras
export async function getCareers(): Promise<Career[]> {
  const universityId = await getCurrentUniversityId();

  const courses = await prisma.course.findMany({
    where: {
      universityId,
    },
    include: {
      teacher: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return courses.map((course) => ({
    id: course.id,
    name: course.name,
    code: course.code,
    description: course.description,
    isActive: course.isActive,
    createdAt: course.createdAt,
    teacherName: course.teacher
      ? `${course.teacher.firstName} ${course.teacher.lastName}`
      : undefined,
  }));
}

// Crear nueva carrera
export async function createCareer(data: {
  name: string;
  code: string;
  description?: string;
}) {
  const universityId = await getCurrentUniversityId();

  // Verificar si ya existe una carrera con el mismo código
  const existing = await prisma.course.findUnique({
    where: {
      code_universityId: {
        code: data.code,
        universityId,
      },
    },
  });

  if (existing) {
    throw new Error('Ya existe una carrera con ese código');
  }

  // Crear carrera sin asignar docente (teacherId es opcional)
  const career = await prisma.course.create({
    data: {
      universityId,
      name: data.name,
      code: data.code,
      description: data.description || null,
      isActive: true,
      // teacherId se deja como null (opcional)
    },
  });

  revalidatePath('/dashboard/carreras');
  return career;
}

// Actualizar carrera
export async function updateCareer(
  id: string,
  data: {
    name: string;
    code: string;
    description?: string;
  }
) {
  const universityId = await getCurrentUniversityId();

  // Verificar que la carrera pertenece a la universidad
  const existing = await prisma.course.findFirst({
    where: {
      id,
      universityId,
    },
  });

  if (!existing) {
    throw new Error('Carrera no encontrada');
  }

  const career = await prisma.course.update({
    where: { id },
    data: {
      name: data.name,
      code: data.code,
      description: data.description || null,
    },
  });

  revalidatePath('/dashboard/carreras');
  return career;
}

// Eliminar carrera (soft delete)
export async function deleteCareer(id: string) {
  const universityId = await getCurrentUniversityId();

  // Verificar que la carrera pertenece a la universidad
  const existing = await prisma.course.findFirst({
    where: {
      id,
      universityId,
    },
  });

  if (!existing) {
    throw new Error('Carrera no encontrada');
  }

  await prisma.course.update({
    where: { id },
    data: {
      isActive: false,
    },
  });

  revalidatePath('/dashboard/carreras');
}

// Buscar carreras
export async function searchCareers(query: string): Promise<Career[]> {
  const universityId = await getCurrentUniversityId();

  const courses = await prisma.course.findMany({
    where: {
      universityId,
      OR: [
        { name: { contains: query } },
        { code: { contains: query } },
        { description: { contains: query } },
      ],
    },
    include: {
      teacher: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return courses.map((course) => ({
    id: course.id,
    name: course.name,
    code: course.code,
    description: course.description,
    isActive: course.isActive,
    createdAt: course.createdAt,
    teacherName: course.teacher
      ? `${course.teacher.firstName} ${course.teacher.lastName}`
      : undefined,
  }));
}
