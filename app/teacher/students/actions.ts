'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentTeacherId } from '@/lib/tenant';
import { hashPassword } from '@/lib/auth-utils';
import { revalidatePath } from 'next/cache';

// Obtener todos los alumnos de los grupos del docente
export async function getTeacherStudents() {
  try {
    const teacherId = await getCurrentTeacherId();

    // Obtener todos los grupos del docente
    const groups = await prisma.group.findMany({
      where: {
        teacherId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        code: true,
        course: {
          select: {
            name: true,
          },
        },
      },
    });

    const groupIds = groups.map((g) => g.id);

    // Obtener todos los estudiantes inscritos en esos grupos
    const enrollments = await prisma.enrollment.findMany({
      where: {
        groupId: {
          in: groupIds,
        },
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
            code: true,
            course: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // Agrupar por estudiante
    const studentsMap = new Map();

    enrollments.forEach((enrollment) => {
      const studentId = enrollment.student.id;

      if (!studentsMap.has(studentId)) {
        studentsMap.set(studentId, {
          ...enrollment.student,
          enrolledGroups: [],
        });
      }

      studentsMap.get(studentId).enrolledGroups.push({
        id: enrollment.group.id,
        groupName: enrollment.group.name,
        groupCode: enrollment.group.code,
        subjectName: enrollment.group.course.name,
      });
    });

    return Array.from(studentsMap.values());
  } catch (error) {
    console.error('Error al obtener alumnos:', error);
    throw new Error('Error al cargar los alumnos');
  }
}

// Obtener grupos del docente
export async function getTeacherGroups() {
  try {
    const teacherId = await getCurrentTeacherId();

    const groups = await prisma.group.findMany({
      where: {
        teacherId,
        isActive: true,
      },
      include: {
        course: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return groups.map((group) => ({
      id: group.id,
      name: group.name,
      code: group.code,
      subjectName: group.course.name,
      studentCount: group._count.enrollments,
    }));
  } catch (error) {
    console.error('Error al obtener grupos:', error);
    throw new Error('Error al cargar los grupos');
  }
}

// Crear nuevo estudiante
export async function createStudent(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  enrollmentNumber: string;
  password: string;
  groupId: string;
}) {
  try {
    const teacherId = await getCurrentTeacherId();

    // Verificar que el grupo pertenece al docente
    const group = await prisma.group.findFirst({
      where: {
        id: data.groupId,
        teacherId,
        isActive: true,
      },
      select: {
        universityId: true,
      },
    });

    if (!group) {
      throw new Error('Grupo no encontrado o no tienes permisos');
    }

    // Verificar si el email ya existe
    const existingEmail = await prisma.student.findFirst({
      where: {
        email: data.email,
        universityId: group.universityId,
      },
    });

    if (existingEmail) {
      throw new Error('Ya existe un alumno con ese email');
    }

    // Verificar si la matrícula ya existe
    const existingEnrollment = await prisma.student.findFirst({
      where: {
        enrollmentId: data.enrollmentNumber,
        universityId: group.universityId,
      },
    });

    if (existingEnrollment) {
      throw new Error('Ya existe un alumno con esa matrícula');
    }

    // Hash de la contraseña
    const hashedPassword = await hashPassword(data.password);

    // Crear el estudiante y el usuario en una transacción
    const result = await prisma.$transaction(async (tx) => {
      // 1. Crear el estudiante
      const student = await tx.student.create({
        data: {
          universityId: group.universityId,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          enrollmentId: data.enrollmentNumber,
        },
      });

      // 2. Crear el usuario
      await tx.user.create({
        data: {
          universityId: group.universityId,
          email: data.email,
          password: hashedPassword,
          role: 'ALUMNO',
          studentId: student.id,
          isActive: true,
        },
      });

      // 3. Inscribir al estudiante en el grupo
      await tx.enrollment.create({
        data: {
          studentId: student.id,
          groupId: data.groupId,
        },
      });

      return student;
    });

    revalidatePath('/teacher/students');
    revalidatePath('/teacher/dashboard');

    return result;
  } catch (error: any) {
    console.error('Error al crear estudiante:', error);
    throw new Error(error.message || 'Error al crear el alumno');
  }
}

// Inscribir estudiante existente a un grupo
export async function enrollStudent(studentId: string, groupId: string) {
  try {
    const teacherId = await getCurrentTeacherId();

    // Verificar que el grupo pertenece al docente
    const group = await prisma.group.findFirst({
      where: {
        id: groupId,
        teacherId,
        isActive: true,
      },
    });

    if (!group) {
      throw new Error('Grupo no encontrado o no tienes permisos');
    }

    // Verificar si el estudiante ya está inscrito
    const existing = await prisma.enrollment.findUnique({
      where: {
        studentId_groupId: {
          studentId,
          groupId,
        },
      },
    });

    if (existing) {
      throw new Error('El alumno ya está inscrito en este grupo');
    }

    // Crear la inscripción
    await prisma.enrollment.create({
      data: {
        studentId,
        groupId,
      },
    });

    revalidatePath('/teacher/students');
    revalidatePath('/teacher/dashboard');

    return { success: true };
  } catch (error: any) {
    console.error('Error al inscribir estudiante:', error);
    throw new Error(error.message || 'Error al inscribir al alumno');
  }
}

// Desinscribir estudiante de un grupo
export async function unenrollStudent(studentId: string, groupId: string) {
  try {
    const teacherId = await getCurrentTeacherId();

    // Verificar que el grupo pertenece al docente
    const group = await prisma.group.findFirst({
      where: {
        id: groupId,
        teacherId,
        isActive: true,
      },
    });

    if (!group) {
      throw new Error('Grupo no encontrado o no tienes permisos');
    }

    // Eliminar la inscripción
    await prisma.enrollment.delete({
      where: {
        studentId_groupId: {
          studentId,
          groupId,
        },
      },
    });

    revalidatePath('/teacher/students');
    revalidatePath('/teacher/dashboard');

    return { success: true };
  } catch (error: any) {
    console.error('Error al desinscribir estudiante:', error);
    throw new Error(error.message || 'Error al eliminar al alumno del grupo');
  }
}


