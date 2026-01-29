'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUniversityId } from '@/lib/tenant';

// Interfaz para las métricas del dashboard
export interface DashboardMetrics {
  totalStudents: number;
  totalTeachers: number;
  activeGroups: number;
  todaySubmissions: number;
}

// Obtener todas las métricas del dashboard filtradas por university_id
export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const universityId = await getCurrentUniversityId();

  // Obtener estudiantes totales
  const totalStudents = await prisma.student.count({
    where: {
      universityId,
      isActive: true,
    },
  });

  // Obtener docentes totales
  const totalTeachers = await prisma.teacher.count({
    where: {
      universityId,
      isActive: true,
    },
  });

  // Obtener grupos activos
  const activeGroups = await prisma.group.count({
    where: {
      universityId,
      isActive: true,
    },
  });

  // Obtener tareas entregadas hoy
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todaySubmissions = await prisma.submission.count({
    where: {
      submittedAt: {
        gte: today,
        lt: tomorrow,
      },
      assignment: {
        universityId,
      },
    },
  });

  return {
    totalStudents,
    totalTeachers,
    activeGroups,
    todaySubmissions,
  };
}

// Obtener estudiantes recientes
export async function getRecentStudents(limit: number = 5) {
  const universityId = await getCurrentUniversityId();

  return await prisma.student.findMany({
    where: {
      universityId,
      isActive: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      enrollmentId: true,
      createdAt: true,
    },
  });
}

// Obtener grupos con más estudiantes
export async function getTopGroups(limit: number = 5) {
  const universityId = await getCurrentUniversityId();

  const groups = await prisma.group.findMany({
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
      teacher: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
      _count: {
        select: {
          enrollments: true,
        },
      },
    },
    orderBy: {
      enrollments: {
        _count: 'desc',
      },
    },
    take: limit,
  });

  return groups;
}

// Obtener tareas próximas a vencer
export async function getUpcomingAssignments(limit: number = 5) {
  const universityId = await getCurrentUniversityId();
  const now = new Date();

  return await prisma.assignment.findMany({
    where: {
      universityId,
      isActive: true,
      dueDate: {
        gte: now,
      },
    },
    include: {
      subject: {
        select: {
          name: true,
          code: true,
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
    take: limit,
  });
}

