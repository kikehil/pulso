'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUniversityId } from '@/lib/tenant';
import { revalidatePath } from 'next/cache';

// Obtener todas las materias
export async function getSubjects() {
  try {
    const universityId = await getCurrentUniversityId();

    const subjects = await prisma.subject.findMany({
      where: {
        universityId,
        isActive: true,
      },
      include: {
        course: {
          select: {
            name: true,
            code: true,
          },
        },
        teacherSubjects: {
          include: {
            teacher: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        _count: {
          select: {
            studentSubjects: true,
            assignments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return subjects;
  } catch (error) {
    console.error('Error fetching subjects:', error);
    throw new Error('Error al obtener las materias');
  }
}

// Crear una nueva materia
export async function createSubject(data: {
  name: string;
  code: string;
  description?: string;
  courseId: string;
  credits?: number;
}) {
  try {
    const universityId = await getCurrentUniversityId();

    const subject = await prisma.subject.create({
      data: {
        ...data,
        universityId,
      },
    });

    revalidatePath('/dashboard/materias');
    return { success: true, data: subject };
  } catch (error) {
    console.error('Error creating subject:', error);
    return { success: false, error: 'Error al crear la materia' };
  }
}

// Actualizar materia
export async function updateSubject(
  id: string,
  data: {
    name?: string;
    code?: string;
    description?: string;
    courseId?: string;
    credits?: number;
  }
) {
  try {
    const universityId = await getCurrentUniversityId();

    const subject = await prisma.subject.update({
      where: {
        id,
        universityId,
      },
      data,
    });

    revalidatePath('/dashboard/materias');
    return { success: true, data: subject };
  } catch (error) {
    console.error('Error updating subject:', error);
    return { success: false, error: 'Error al actualizar la materia' };
  }
}

// Eliminar materia (soft delete)
export async function deleteSubject(id: string) {
  try {
    const universityId = await getCurrentUniversityId();

    await prisma.subject.update({
      where: {
        id,
        universityId,
      },
      data: {
        isActive: false,
      },
    });

    revalidatePath('/dashboard/materias');
    return { success: true };
  } catch (error) {
    console.error('Error deleting subject:', error);
    return { success: false, error: 'Error al eliminar la materia' };
  }
}

// Obtener carreras para el selector
export async function getCourses() {
  try {
    const universityId = await getCurrentUniversityId();

    const courses = await prisma.course.findMany({
      where: {
        universityId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        code: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return courses;
  } catch (error) {
    console.error('Error fetching courses:', error);
    throw new Error('Error al obtener las carreras');
  }
}

// Buscar materias
export async function searchSubjects(query: string) {
  try {
    const universityId = await getCurrentUniversityId();

    const subjects = await prisma.subject.findMany({
      where: {
        universityId,
        isActive: true,
        OR: [
          { name: { contains: query } },
          { code: { contains: query } },
          { description: { contains: query } },
        ],
      },
      include: {
        course: {
          select: {
            name: true,
            code: true,
          },
        },
        teacherSubjects: {
          include: {
            teacher: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        _count: {
          select: {
            studentSubjects: true,
            assignments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return subjects;
  } catch (error) {
    console.error('Error searching subjects:', error);
    throw new Error('Error al buscar materias');
  }
}


