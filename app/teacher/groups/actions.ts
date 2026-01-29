'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentTeacherId, getCurrentUniversityId } from '@/lib/tenant';
import { revalidatePath } from 'next/cache';

// ============ GRUPOS ============

// Obtener grupos detallados del docente
export async function getTeacherGroupsDetailed() {
  try {
    const teacherId = await getCurrentTeacherId();

    const groups = await prisma.group.findMany({
      where: {
        teacherId,
      },
      include: {
        course: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
      orderBy: [
        { isActive: 'desc' },
        { name: 'asc' },
      ],
    });

    // Mapear para usar subject en lugar de course donde esté disponible
    return groups.map(group => ({
      id: group.id,
      name: group.name,
      code: group.code,
      schedule: group.schedule,
      isActive: group.isActive,
      course: {
        id: group.subject?.id || group.course.id,
        name: group.subject?.name || group.course.name,
        code: group.subject?.code || group.course.code,
      },
      _count: group._count,
    }));
  } catch (error) {
    console.error('Error al obtener grupos:', error);
    throw new Error('Error al cargar los grupos');
  }
}

// Crear grupo
export async function createGroup(data: {
  name: string;
  code: string;
  subjectId: string; // Cambiado de courseId a subjectId
  schedule?: string;
  isActive: boolean;
}) {
  try {
    const teacherId = await getCurrentTeacherId();
    const universityId = await getCurrentUniversityId();

    // Obtener la materia para saber a qué carrera pertenece
    const subject = await prisma.subject.findUnique({
      where: { id: data.subjectId },
      select: { courseId: true },
    });

    if (!subject) {
      return { success: false, error: 'Materia no encontrada' };
    }

    const group = await prisma.group.create({
      data: {
        name: data.name,
        code: data.code,
        courseId: subject.courseId, // Heredar courseId de la materia
        subjectId: data.subjectId,
        teacherId,
        universityId,
        schedule: data.schedule || null,
        isActive: data.isActive,
      },
    });

    // Asignar la materia al docente si aún no está asignada
    const existingAssignment = await prisma.teacherSubject.findFirst({
      where: {
        teacherId,
        subjectId: data.subjectId,
      },
    });

    if (!existingAssignment) {
      await prisma.teacherSubject.create({
        data: {
          teacherId,
          subjectId: data.subjectId,
        },
      });
    }

    revalidatePath('/teacher/groups');
    revalidatePath('/teacher/dashboard');
    
    return { success: true, group };
  } catch (error: any) {
    console.error('Error al crear grupo:', error);
    
    if (error.code === 'P2002') {
      return { success: false, error: 'Ya existe un grupo con ese código' };
    }
    
    return { success: false, error: 'Error al crear el grupo' };
  }
}

// Actualizar grupo
export async function updateGroup(groupId: string, data: {
  name: string;
  code: string;
  subjectId: string; // Cambiado de courseId a subjectId
  schedule?: string;
  isActive: boolean;
}) {
  try {
    const teacherId = await getCurrentTeacherId();

    // Verificar que el grupo pertenece al docente
    const group = await prisma.group.findFirst({
      where: { id: groupId, teacherId },
    });

    if (!group) {
      return { success: false, error: 'Grupo no encontrado' };
    }

    // Obtener la materia para saber a qué carrera pertenece
    const subject = await prisma.subject.findUnique({
      where: { id: data.subjectId },
      select: { courseId: true },
    });

    if (!subject) {
      return { success: false, error: 'Materia no encontrada' };
    }

    const updated = await prisma.group.update({
      where: { id: groupId },
      data: {
        name: data.name,
        code: data.code,
        courseId: subject.courseId,
        subjectId: data.subjectId,
        schedule: data.schedule || null,
        isActive: data.isActive,
      },
    });

    revalidatePath('/teacher/groups');
    revalidatePath('/teacher/dashboard');
    
    return { success: true, group: updated };
  } catch (error: any) {
    console.error('Error al actualizar grupo:', error);
    
    if (error.code === 'P2002') {
      return { success: false, error: 'Ya existe un grupo con ese código' };
    }
    
    return { success: false, error: 'Error al actualizar el grupo' };
  }
}

// Eliminar grupo
export async function deleteGroup(groupId: string) {
  try {
    const teacherId = await getCurrentTeacherId();

    // Verificar que el grupo pertenece al docente
    const group = await prisma.group.findFirst({
      where: { id: groupId, teacherId },
    });

    if (!group) {
      return { success: false, error: 'Grupo no encontrado' };
    }

    // Verificar si tiene estudiantes inscritos
    const enrollmentCount = await prisma.enrollment.count({
      where: { groupId },
    });

    if (enrollmentCount > 0) {
      return { 
        success: false, 
        error: 'No se puede eliminar un grupo con estudiantes inscritos. Primero desinscribe a todos los estudiantes.' 
      };
    }

    await prisma.group.delete({
      where: { id: groupId },
    });

    revalidatePath('/teacher/groups');
    revalidatePath('/teacher/dashboard');
    
    return { success: true };
  } catch (error) {
    console.error('Error al eliminar grupo:', error);
    return { success: false, error: 'Error al eliminar el grupo' };
  }
}

// ============ MATERIAS (SUBJECTS) ============

// Obtener todas las materias disponibles
export async function getAllCourses() {
  try {
    const universityId = await getCurrentUniversityId();
    const teacherId = await getCurrentTeacherId();

    const subjects = await prisma.subject.findMany({
      where: { universityId },
      select: {
        id: true,
        name: true,
        code: true,
        credits: true,
        description: true,
        isActive: true,
        courseId: true,
        course: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return subjects.map(subject => ({
      id: subject.id,
      name: subject.name,
      code: subject.code,
      credits: subject.credits,
      description: subject.description,
      isActive: subject.isActive,
    }));
  } catch (error) {
    console.error('Error al obtener materias:', error);
    throw new Error('Error al cargar las materias');
  }
}

// Crear materia
export async function createCourse(data: {
  name: string;
  code: string;
  credits: number;
  description?: string;
  isActive: boolean;
}) {
  try {
    const universityId = await getCurrentUniversityId();

    // Obtener el primer curso/carrera disponible o crear uno por defecto
    let course = await prisma.course.findFirst({
      where: { universityId },
    });

    if (!course) {
      // Crear un curso genérico si no existe ninguno
      course = await prisma.course.create({
        data: {
          name: 'Curso General',
          code: 'GEN',
          universityId,
        },
      });
    }

    const subject = await prisma.subject.create({
      data: {
        name: data.name,
        code: data.code,
        credits: data.credits,
        description: data.description || null,
        universityId,
        courseId: course.id,
        isActive: data.isActive,
      },
    });

    revalidatePath('/teacher/groups');
    
    return { success: true, course: subject };
  } catch (error: any) {
    console.error('Error al crear materia:', error);
    
    if (error.code === 'P2002') {
      return { success: false, error: 'Ya existe una materia con ese código' };
    }
    
    return { success: false, error: 'Error al crear la materia' };
  }
}

// Actualizar materia
export async function updateCourse(subjectId: string, data: {
  name: string;
  code: string;
  credits: number;
  description?: string;
  isActive: boolean;
}) {
  try {
    const subject = await prisma.subject.update({
      where: { id: subjectId },
      data: {
        name: data.name,
        code: data.code,
        credits: data.credits,
        description: data.description || null,
        isActive: data.isActive,
      },
    });

    revalidatePath('/teacher/groups');
    
    return { success: true, course: subject };
  } catch (error: any) {
    console.error('Error al actualizar materia:', error);
    
    if (error.code === 'P2002') {
      return { success: false, error: 'Ya existe una materia con ese código' };
    }
    
    return { success: false, error: 'Error al actualizar la materia' };
  }
}

// Eliminar materia
export async function deleteCourse(subjectId: string) {
  try {
    // Verificar si tiene asignaciones a docentes
    const assignmentCount = await prisma.teacherSubject.count({
      where: { subjectId },
    });

    if (assignmentCount > 0) {
      return { 
        success: false, 
        error: 'No se puede eliminar una materia con docentes asignados. Primero desasigna todos los docentes.' 
      };
    }

    await prisma.subject.delete({
      where: { id: subjectId },
    });

    revalidatePath('/teacher/groups');
    
    return { success: true };
  } catch (error) {
    console.error('Error al eliminar materia:', error);
    return { success: false, error: 'Error al eliminar la materia' };
  }
}

// ============ ESTUDIANTES ============

// Obtener estudiantes disponibles para asignar
export async function getAvailableStudents(groupId?: string) {
  try {
    const universityId = await getCurrentUniversityId();

    // Si se proporciona groupId, excluir estudiantes ya inscritos en ese grupo
    const enrolledStudentIds = groupId
      ? await prisma.enrollment
          .findMany({
            where: { groupId },
            select: { studentId: true },
          })
          .then((enrollments) => enrollments.map((e) => e.studentId))
      : [];

    const students = await prisma.student.findMany({
      where: {
        universityId,
        id: {
          notIn: enrolledStudentIds,
        },
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        user: {
          name: 'asc',
        },
      },
    });

    return students.map((student) => ({
      id: student.id,
      name: student.user.name || 'Sin nombre',
      email: student.user.email,
      enrollmentNumber: student.enrollmentNumber,
    }));
  } catch (error) {
    console.error('Error al obtener estudiantes:', error);
    throw new Error('Error al cargar los estudiantes');
  }
}

// Obtener estudiantes inscritos en un grupo
export async function getGroupStudents(groupId: string) {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { groupId },
      include: {
        student: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        student: {
          user: {
            name: 'asc',
          },
        },
      },
    });

    return enrollments.map((enrollment) => ({
      enrollmentId: enrollment.id,
      studentId: enrollment.student.id,
      name: enrollment.student.user.name || 'Sin nombre',
      email: enrollment.student.user.email,
      enrollmentNumber: enrollment.student.enrollmentNumber,
      status: enrollment.status,
      enrolledAt: enrollment.createdAt,
    }));
  } catch (error) {
    console.error('Error al obtener estudiantes del grupo:', error);
    throw new Error('Error al cargar los estudiantes del grupo');
  }
}

// Asignar estudiante a grupo
export async function assignStudentToGroup(studentId: string, groupId: string) {
  try {
    const teacherId = await getCurrentTeacherId();

    // Verificar que el grupo pertenece al docente
    const group = await prisma.group.findFirst({
      where: { id: groupId, teacherId },
    });

    if (!group) {
      return { success: false, error: 'Grupo no encontrado' };
    }

    // Verificar si el estudiante ya está inscrito
    const existing = await prisma.enrollment.findFirst({
      where: { studentId, groupId },
    });

    if (existing) {
      return { success: false, error: 'El estudiante ya está inscrito en este grupo' };
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        studentId,
        groupId,
        status: 'ACTIVE',
      },
    });

    revalidatePath('/teacher/groups');
    revalidatePath('/teacher/students');
    
    return { success: true, enrollment };
  } catch (error) {
    console.error('Error al asignar estudiante:', error);
    return { success: false, error: 'Error al asignar el estudiante' };
  }
}

// Desasignar estudiante de grupo
export async function removeStudentFromGroup(enrollmentId: string) {
  try {
    const teacherId = await getCurrentTeacherId();

    // Verificar que el enrollment pertenece a un grupo del docente
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        id: enrollmentId,
        group: { teacherId },
      },
    });

    if (!enrollment) {
      return { success: false, error: 'Inscripción no encontrada' };
    }

    await prisma.enrollment.delete({
      where: { id: enrollmentId },
    });

    revalidatePath('/teacher/groups');
    revalidatePath('/teacher/students');
    
    return { success: true };
  } catch (error) {
    console.error('Error al desasignar estudiante:', error);
    return { success: false, error: 'Error al desasignar el estudiante' };
  }
}
