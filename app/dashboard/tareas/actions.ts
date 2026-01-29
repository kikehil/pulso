'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUniversityId } from '@/lib/tenant';
import { revalidatePath } from 'next/cache';

export interface Assignment {
  id: string;
  title: string;
  description: string | null;
  dueDate: Date;
  createdAt: Date;
  isActive: boolean;
  subject: {
    id: string;
    name: string;
    code: string;
    course: {
      name: string;
      code: string;
    };
  };
  teacher: {
    id: string;
    firstName: string;
    lastName: string;
  };
  _count: {
    submissions: number;
  };
}

// Obtener tareas (filtradas según el rol)
export async function getAssignments(userRole: 'teacher' | 'student', userId: string): Promise<Assignment[]> {
  const universityId = await getCurrentUniversityId();

  if (userRole === 'teacher') {
    // Docentes ven solo sus tareas
    const assignments = await prisma.assignment.findMany({
      where: {
        universityId,
        teacherId: userId,
      },
      include: {
        subject: {
          include: {
            course: {
              select: {
                name: true,
                code: true,
              },
            },
          },
        },
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            submissions: true,
          },
        },
      },
      orderBy: {
        dueDate: 'asc',
      },
    });

    return assignments;
  } else {
    // Alumnos ven tareas de sus materias
    const studentSubjects = await prisma.studentSubject.findMany({
      where: {
        studentId: userId,
      },
      select: {
        subjectId: true,
      },
    });

    const subjectIds = studentSubjects.map((ss) => ss.subjectId);

    const assignments = await prisma.assignment.findMany({
      where: {
        universityId,
        subjectId: {
          in: subjectIds,
        },
      },
      include: {
        subject: {
          include: {
            course: {
              select: {
                name: true,
                code: true,
              },
            },
          },
        },
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            submissions: true,
          },
        },
      },
      orderBy: {
        dueDate: 'asc',
      },
    });

    return assignments;
  }
}

// Crear nueva tarea (solo docentes)
export async function createAssignment(data: {
  title: string;
  description: string;
  dueDate: string;
  subjectId: string;
  teacherId: string;
}) {
  const universityId = await getCurrentUniversityId();

  // Verificar que el docente tiene asignada la materia
  const teacherSubject = await prisma.teacherSubject.findUnique({
    where: {
      teacherId_subjectId: {
        teacherId: data.teacherId,
        subjectId: data.subjectId,
      },
    },
  });

  if (!teacherSubject) {
    throw new Error('No tienes permiso para crear tareas en esta materia');
  }

  const assignment = await prisma.assignment.create({
    data: {
      universityId,
      subjectId: data.subjectId,
      teacherId: data.teacherId,
      title: data.title,
      description: data.description,
      dueDate: new Date(data.dueDate),
    },
  });

  revalidatePath('/dashboard/tareas');
  return assignment;
}

// Actualizar tarea (solo el docente creador)
export async function updateAssignment(
  id: string,
  data: {
    title: string;
    description: string;
    dueDate: string;
    subjectId: string;
    teacherId: string;
  }
) {
  const universityId = await getCurrentUniversityId();

  // Verificar que la tarea pertenece al docente
  const existing = await prisma.assignment.findFirst({
    where: {
      id,
      universityId,
      teacherId: data.teacherId,
    },
  });

  if (!existing) {
    throw new Error('No tienes permiso para editar esta tarea');
  }

  // Verificar que el docente tiene asignada la nueva materia
  const teacherSubject = await prisma.teacherSubject.findUnique({
    where: {
      teacherId_subjectId: {
        teacherId: data.teacherId,
        subjectId: data.subjectId,
      },
    },
  });

  if (!teacherSubject) {
    throw new Error('No tienes permiso para asignar esta materia');
  }

  await prisma.assignment.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description,
      dueDate: new Date(data.dueDate),
      subjectId: data.subjectId,
    },
  });

  revalidatePath('/dashboard/tareas');
}

// Eliminar tarea (solo el docente creador)
export async function deleteAssignment(id: string, teacherId: string) {
  const universityId = await getCurrentUniversityId();

  const existing = await prisma.assignment.findFirst({
    where: {
      id,
      universityId,
      teacherId,
    },
  });

  if (!existing) {
    throw new Error('No tienes permiso para eliminar esta tarea');
  }

  await prisma.assignment.update({
    where: { id },
    data: {
      isActive: false,
    },
  });

  revalidatePath('/dashboard/tareas');
}

// Obtener materias del docente
export async function getTeacherSubjects(teacherId: string) {
  const universityId = await getCurrentUniversityId();

  const teacherSubjects = await prisma.teacherSubject.findMany({
    where: {
      teacherId,
    },
    include: {
      subject: {
        include: {
          course: {
            select: {
              name: true,
              code: true,
            },
          },
        },
      },
    },
  });

  return teacherSubjects.map((ts) => ({
    id: ts.subject.id,
    name: ts.subject.name,
    code: ts.subject.code,
    courseName: ts.subject.course.name,
    courseCode: ts.subject.course.code,
  }));
}

// Buscar tareas
export async function searchAssignments(
  query: string,
  userRole: 'teacher' | 'student',
  userId: string
): Promise<Assignment[]> {
  const universityId = await getCurrentUniversityId();

  if (userRole === 'teacher') {
    const assignments = await prisma.assignment.findMany({
      where: {
        universityId,
        teacherId: userId,
        OR: [
          { title: { contains: query } },
          { description: { contains: query } },
        ],
      },
      include: {
        subject: {
          include: {
            course: {
              select: {
                name: true,
                code: true,
              },
            },
          },
        },
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            submissions: true,
          },
        },
      },
      orderBy: {
        dueDate: 'asc',
      },
    });

    return assignments;
  } else {
    const studentSubjects = await prisma.studentSubject.findMany({
      where: {
        studentId: userId,
      },
      select: {
        subjectId: true,
      },
    });

    const subjectIds = studentSubjects.map((ss) => ss.subjectId);

    const assignments = await prisma.assignment.findMany({
      where: {
        universityId,
        subjectId: {
          in: subjectIds,
        },
        OR: [
          { title: { contains: query } },
          { description: { contains: query } },
        ],
      },
      include: {
        subject: {
          include: {
            course: {
              select: {
                name: true,
                code: true,
              },
            },
          },
        },
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            submissions: true,
          },
        },
      },
      orderBy: {
        dueDate: 'asc',
      },
    });

    return assignments;
  }
}


