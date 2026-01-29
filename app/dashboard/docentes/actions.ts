'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUniversityId } from '@/lib/tenant';
import { revalidatePath } from 'next/cache';

export interface Teacher {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  department: string | null;
  phone: string | null;
  isActive: boolean;
  createdAt: Date;
  careers: {
    id: string;
    name: string;
    code: string;
  }[];
  subjects: {
    id: string;
    name: string;
    code: string;
  }[];
}

// Obtener todos los docentes
export async function getTeachers(): Promise<Teacher[]> {
  const universityId = await getCurrentUniversityId();

  const teachers = await prisma.teacher.findMany({
    where: {
      universityId,
    },
    include: {
      teacherCareers: {
        include: {
          course: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      },
      teacherSubjects: {
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

  return teachers.map((teacher) => ({
    id: teacher.id,
    email: teacher.email,
    firstName: teacher.firstName,
    lastName: teacher.lastName,
    department: teacher.department,
    phone: teacher.phone,
    isActive: teacher.isActive,
    createdAt: teacher.createdAt,
    careers: teacher.teacherCareers.map((tc) => tc.course),
    subjects: teacher.teacherSubjects.map((ts) => ts.subject),
  }));
}

// Crear nuevo docente
export async function createTeacher(data: {
  email: string;
  firstName: string;
  lastName: string;
  department?: string;
  phone?: string;
  careerIds: string[];
  subjectIds: string[];
}) {
  const universityId = await getCurrentUniversityId();

  // Verificar si ya existe un docente con el mismo email
  const existing = await prisma.teacher.findUnique({
    where: {
      email_universityId: {
        email: data.email,
        universityId,
      },
    },
  });

  if (existing) {
    throw new Error('Ya existe un docente con ese email');
  }

  // Crear docente con sus relaciones
  const teacher = await prisma.teacher.create({
    data: {
      universityId,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      department: data.department || null,
      phone: data.phone || null,
      isActive: true,
      teacherCareers: {
        create: data.careerIds.map((courseId) => ({
          courseId,
        })),
      },
      teacherSubjects: {
        create: data.subjectIds.map((subjectId) => ({
          subjectId,
        })),
      },
    },
  });

  revalidatePath('/dashboard/docentes');
  return teacher;
}

// Actualizar docente
export async function updateTeacher(
  id: string,
  data: {
    email: string;
    firstName: string;
    lastName: string;
    department?: string;
    phone?: string;
    careerIds: string[];
    subjectIds: string[];
  }
) {
  const universityId = await getCurrentUniversityId();

  // Verificar que el docente pertenece a la universidad
  const existing = await prisma.teacher.findFirst({
    where: {
      id,
      universityId,
    },
  });

  if (!existing) {
    throw new Error('Docente no encontrado');
  }

  // Actualizar docente y sus relaciones
  await prisma.$transaction([
    // Eliminar relaciones existentes
    prisma.teacherCareer.deleteMany({
      where: { teacherId: id },
    }),
    prisma.teacherSubject.deleteMany({
      where: { teacherId: id },
    }),
    // Actualizar docente
    prisma.teacher.update({
      where: { id },
      data: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        department: data.department || null,
        phone: data.phone || null,
        teacherCareers: {
          create: data.careerIds.map((courseId) => ({
            courseId,
          })),
        },
        teacherSubjects: {
          create: data.subjectIds.map((subjectId) => ({
            subjectId,
          })),
        },
      },
    }),
  ]);

  revalidatePath('/dashboard/docentes');
}

// Eliminar docente (soft delete)
export async function deleteTeacher(id: string) {
  const universityId = await getCurrentUniversityId();

  const existing = await prisma.teacher.findFirst({
    where: {
      id,
      universityId,
    },
  });

  if (!existing) {
    throw new Error('Docente no encontrado');
  }

  await prisma.teacher.update({
    where: { id },
    data: {
      isActive: false,
    },
  });

  revalidatePath('/dashboard/docentes');
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

// Obtener materias disponibles
export async function getAvailableSubjects() {
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
    },
    orderBy: {
      name: 'asc',
    },
  });

  return subjects.map((subject) => ({
    id: subject.id,
    name: subject.name,
    code: subject.code,
    careerName: subject.course.name,
    careerCode: subject.course.code,
  }));
}

// Buscar docentes
export async function searchTeachers(query: string): Promise<Teacher[]> {
  const universityId = await getCurrentUniversityId();

  const teachers = await prisma.teacher.findMany({
    where: {
      universityId,
      OR: [
        { firstName: { contains: query } },
        { lastName: { contains: query } },
        { email: { contains: query } },
        { department: { contains: query } },
      ],
    },
    include: {
      teacherCareers: {
        include: {
          course: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      },
      teacherSubjects: {
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

  return teachers.map((teacher) => ({
    id: teacher.id,
    email: teacher.email,
    firstName: teacher.firstName,
    lastName: teacher.lastName,
    department: teacher.department,
    phone: teacher.phone,
    isActive: teacher.isActive,
    createdAt: teacher.createdAt,
    careers: teacher.teacherCareers.map((tc) => tc.course),
    subjects: teacher.teacherSubjects.map((ts) => ts.subject),
  }));
}
