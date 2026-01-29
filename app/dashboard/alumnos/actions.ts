'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUniversityId } from '@/lib/tenant';
import { revalidatePath } from 'next/cache';

export interface Student {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  enrollmentId: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  createdAt: Date;
  course: {
    id: string;
    name: string;
    code: string;
  } | null;
  subjects: {
    id: string;
    name: string;
    code: string;
  }[];
}

// Obtener todos los alumnos
export async function getStudents(): Promise<Student[]> {
  const universityId = await getCurrentUniversityId();

  const students = await prisma.student.findMany({
    where: {
      universityId,
    },
    include: {
      course: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
      studentSubjects: {
        include: {
          subject: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return students.map((student) => ({
    id: student.id,
    email: student.email,
    firstName: student.firstName,
    lastName: student.lastName,
    enrollmentId: student.enrollmentId,
    avatarUrl: student.avatarUrl,
    isActive: student.isActive,
    createdAt: student.createdAt,
    course: student.course,
    subjects: student.studentSubjects.map((ss) => ss.subject),
  }));
}

// Crear nuevo alumno
export async function createStudent(data: {
  email: string;
  firstName: string;
  lastName: string;
  enrollmentId?: string;
  avatarUrl?: string;
  courseId: string;
  subjectIds: string[];
}) {
  const universityId = await getCurrentUniversityId();

  // Verificar si ya existe un alumno con el mismo email
  const existing = await prisma.student.findUnique({
    where: {
      email_universityId: {
        email: data.email,
        universityId,
      },
    },
  });

  if (existing) {
    throw new Error('Ya existe un alumno con ese email');
  }

  // Crear alumno con sus relaciones
  const student = await prisma.student.create({
    data: {
      universityId,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      enrollmentId: data.enrollmentId || null,
      avatarUrl: data.avatarUrl || null,
      courseId: data.courseId,
      studentSubjects: {
        create: data.subjectIds.map((subjectId) => ({
          subjectId,
        })),
      },
    },
  });

  revalidatePath('/dashboard/alumnos');
  return student;
}

// Actualizar alumno
export async function updateStudent(
  id: string,
  data: {
    email: string;
    firstName: string;
    lastName: string;
    enrollmentId?: string;
    avatarUrl?: string;
    courseId: string;
    subjectIds: string[];
  }
) {
  const universityId = await getCurrentUniversityId();

  // Verificar que el alumno pertenece a la universidad
  const existing = await prisma.student.findFirst({
    where: {
      id,
      universityId,
    },
  });

  if (!existing) {
    throw new Error('Alumno no encontrado');
  }

  // Actualizar alumno y sus relaciones
  await prisma.$transaction([
    // Eliminar relaciones existentes de materias
    prisma.studentSubject.deleteMany({
      where: { studentId: id },
    }),
    // Actualizar alumno
    prisma.student.update({
      where: { id },
      data: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        enrollmentId: data.enrollmentId || null,
        avatarUrl: data.avatarUrl || null,
        courseId: data.courseId,
        studentSubjects: {
          create: data.subjectIds.map((subjectId) => ({
            subjectId,
          })),
        },
      },
    }),
  ]);

  revalidatePath('/dashboard/alumnos');
}

// Eliminar alumno (soft delete)
export async function deleteStudent(id: string) {
  const universityId = await getCurrentUniversityId();

  const existing = await prisma.student.findFirst({
    where: {
      id,
      universityId,
    },
  });

  if (!existing) {
    throw new Error('Alumno no encontrado');
  }

  await prisma.student.update({
    where: { id },
    data: {
      isActive: false,
    },
  });

  revalidatePath('/dashboard/alumnos');
}

// Obtener carreras disponibles
export async function getAvailableCareers() {
  const universityId = await getCurrentUniversityId();

  const careers = await prisma.course.findMany({
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

  return careers;
}

// Obtener materias por carrera
export async function getSubjectsByCareer(courseId: string) {
  const universityId = await getCurrentUniversityId();

  const subjects = await prisma.subject.findMany({
    where: {
      universityId,
      courseId,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      code: true,
      credits: true,
      semester: true,
    },
    orderBy: {
      semester: 'asc',
    },
  });

  return subjects;
}

// Buscar alumnos
export async function searchStudents(query: string): Promise<Student[]> {
  const universityId = await getCurrentUniversityId();

  const students = await prisma.student.findMany({
    where: {
      universityId,
      OR: [
        { firstName: { contains: query } },
        { lastName: { contains: query } },
        { email: { contains: query } },
        { enrollmentId: { contains: query } },
      ],
    },
    include: {
      course: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
      studentSubjects: {
        include: {
          subject: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return students.map((student) => ({
    id: student.id,
    email: student.email,
    firstName: student.firstName,
    lastName: student.lastName,
    enrollmentId: student.enrollmentId,
    avatarUrl: student.avatarUrl,
    isActive: student.isActive,
    createdAt: student.createdAt,
    course: student.course,
    subjects: student.studentSubjects.map((ss) => ss.subject),
  }));
}


