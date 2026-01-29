'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUniversityId } from '@/lib/tenant';
import { revalidatePath } from 'next/cache';

// Obtener todos los grupos
export async function getGroups() {
  try {
    const universityId = await getCurrentUniversityId();

    const groups = await prisma.group.findMany({
      where: {
        universityId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        code: true,
        courseId: true, // ✓ Agregado para poder filtrar alumnos por carrera
        semester: true,
        academicYear: true,
        maxStudents: true,
        course: {
          select: {
            name: true,
            code: true,
          },
        },
        enrollments: {
          include: {
            student: {
              select: {
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return groups;
  } catch (error) {
    console.error('Error fetching groups:', error);
    throw new Error('Error al obtener los grupos');
  }
}

// Crear un nuevo grupo
export async function createGroup(data: {
  name: string;
  code: string;
  courseId: string;
  semester?: string;
  academicYear?: string;
  maxStudents?: number;
}) {
  try {
    const universityId = await getCurrentUniversityId();

    console.log('=== SERVER: Creando grupo ===');
    console.log('universityId:', universityId);
    console.log('data:', data);

    const group = await prisma.group.create({
      data: {
        name: data.name,
        code: data.code,
        semester: data.semester || null,
        academicYear: data.academicYear || null,
        maxStudents: data.maxStudents || null,
        university: {
          connect: { id: universityId },
        },
        course: {
          connect: { id: data.courseId },
        },
      },
    });

    console.log('✓ Grupo creado:', group.id);
    revalidatePath('/dashboard/grupos');
    return { success: true, data: group };
  } catch (error: any) {
    console.error('❌ Error creating group:', error);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    return { 
      success: false, 
      error: `Error al crear el grupo: ${error.message || 'Error desconocido'}` 
    };
  }
}

// Actualizar grupo
export async function updateGroup(
  id: string,
  data: {
    name?: string;
    code?: string;
    courseId?: string;
    semester?: string;
    academicYear?: string;
    maxStudents?: number;
  }
) {
  try {
    const universityId = await getCurrentUniversityId();

    const group = await prisma.group.update({
      where: {
        id,
        universityId,
      },
      data: {
        ...data,
        maxStudents: data.maxStudents || null,
      },
    });

    revalidatePath('/dashboard/grupos');
    return { success: true, data: group };
  } catch (error) {
    console.error('Error updating group:', error);
    return { success: false, error: 'Error al actualizar el grupo' };
  }
}

// Eliminar grupo (soft delete)
export async function deleteGroup(id: string) {
  try {
    const universityId = await getCurrentUniversityId();

    await prisma.group.update({
      where: {
        id,
        universityId,
      },
      data: {
        isActive: false,
      },
    });

    revalidatePath('/dashboard/grupos');
    return { success: true };
  } catch (error) {
    console.error('Error deleting group:', error);
    return { success: false, error: 'Error al eliminar el grupo' };
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

// Obtener alumnos disponibles para asignar a un grupo
export async function getAvailableStudents(courseId: string) {
  try {
    const universityId = await getCurrentUniversityId();

    const students = await prisma.student.findMany({
      where: {
        universityId,
        courseId,
        isActive: true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        enrollmentId: true,
        avatarUrl: true,
      },
      orderBy: {
        lastName: 'asc',
      },
    });

    return students;
  } catch (error) {
    console.error('Error fetching students:', error);
    throw new Error('Error al obtener los alumnos');
  }
}

// Obtener alumnos de un grupo específico
export async function getGroupStudents(groupId: string) {
  try {
    const universityId = await getCurrentUniversityId();

    const enrollments = await prisma.enrollment.findMany({
      where: {
        groupId,
        student: {
          universityId,
          isActive: true,
        },
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            enrollmentId: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        student: {
          lastName: 'asc',
        },
      },
    });

    return enrollments.map((e) => e.student);
  } catch (error) {
    console.error('Error fetching group students:', error);
    throw new Error('Error al obtener los alumnos del grupo');
  }
}

// Asignar alumnos a un grupo
export async function assignStudentsToGroup(groupId: string, studentIds: string[]) {
  try {
    const universityId = await getCurrentUniversityId();

    // Verificar que el grupo existe
    const group = await prisma.group.findFirst({
      where: {
        id: groupId,
        universityId,
      },
    });

    if (!group) {
      return { success: false, error: 'Grupo no encontrado' };
    }

    console.log('=== Asignando alumnos al grupo ===');
    console.log('Group ID:', groupId);
    console.log('Student IDs:', studentIds);

    // Crear enrollments para cada estudiante
    // ✓ CORREGIDO: Solo usar campos que existen en el modelo Enrollment
    await Promise.all(
      studentIds.map((studentId) =>
        prisma.enrollment.upsert({
          where: {
            studentId_groupId: {
              studentId,
              groupId,
            },
          },
          update: {}, // No actualizar si ya existe
          create: {
            studentId,
            groupId,
            // enrolledAt se crea automáticamente con @default(now())
          },
        })
      )
    );

    console.log('✓ Alumnos asignados exitosamente');
    revalidatePath('/dashboard/grupos');
    return { success: true };
  } catch (error: any) {
    console.error('❌ Error assigning students:', error);
    console.error('Error message:', error.message);
    return { success: false, error: `Error al asignar alumnos: ${error.message}` };
  }
}

// Remover alumno de un grupo
export async function removeStudentFromGroup(groupId: string, studentId: string) {
  try {
    await prisma.enrollment.delete({
      where: {
        studentId_groupId: {
          studentId,
          groupId,
        },
      },
    });

    revalidatePath('/dashboard/grupos');
    return { success: true };
  } catch (error) {
    console.error('Error removing student:', error);
    return { success: false, error: 'Error al remover alumno' };
  }
}

// Buscar grupos
export async function searchGroups(query: string) {
  try {
    const universityId = await getCurrentUniversityId();

    const groups = await prisma.group.findMany({
      where: {
        universityId,
        isActive: true,
        OR: [
          { name: { contains: query } },
          { code: { contains: query } },
          { semester: { contains: query } },
          { academicYear: { contains: query } },
        ],
      },
      select: {
        id: true,
        name: true,
        code: true,
        courseId: true, // ✓ Agregado para mantener consistencia
        semester: true,
        academicYear: true,
        maxStudents: true,
        course: {
          select: {
            name: true,
            code: true,
          },
        },
        enrollments: {
          include: {
            student: {
              select: {
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return groups;
  } catch (error) {
    console.error('Error searching groups:', error);
    throw new Error('Error al buscar grupos');
  }
}

