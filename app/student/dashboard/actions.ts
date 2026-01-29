'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getCurrentUniversityId } from '@/lib/tenant';

async function getCurrentStudentId() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.studentId) {
    throw new Error('No se encontró el ID del estudiante en la sesión');
  }
  
  return session.user.studentId;
}

export async function getStudentDashboard() {
  try {
    const studentId = await getCurrentStudentId();
    const universityId = await getCurrentUniversityId();

    // Obtener información del estudiante
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatarUrl: true,
        enrollmentId: true,
      },
    });

    if (!student) {
      return null;
    }

    // Obtener materias del estudiante
    const enrollments = await prisma.enrollment.findMany({
      where: {
        studentId,
        group: {
          isActive: true,
        },
      },
      include: {
        group: {
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
      },
    });

    // Calcular información de cada materia
    const subjects = await Promise.all(
      enrollments.map(async (enrollment) => {
        const groupId = enrollment.groupId;
        const courseId = enrollment.group.courseId;

        // Obtener calificación promedio (mock por ahora)
        const currentGrade = 8.5; // TODO: Calcular desde submissions

        // Obtener porcentaje de asistencia
        const attendanceSessions = await prisma.attendanceSession.count({
          where: {
            groupId,
          },
        });

        const presentRecords = await prisma.attendanceRecord.count({
          where: {
            studentId,
            status: 'PRESENTE',
            session: {
              groupId,
            },
          },
        });

        const attendancePercent =
          attendanceSessions > 0 ? (presentRecords / attendanceSessions) * 100 : 100;

        // Obtener tareas pendientes
        const pendingAssignments = await prisma.assignment.count({
          where: {
            subject: {
              courseId,
            },
            isActive: true,
            dueDate: {
              gte: new Date(),
            },
            submissions: {
              none: {
                studentId,
              },
            },
          },
        });

        return {
          id: enrollment.group.course.id,
          name: enrollment.group.course.name,
          code: enrollment.group.course.code,
          currentGrade,
          attendancePercent,
          pendingAssignments,
        };
      })
    );

    // Obtener tareas próximas a vencer
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    const assignments = await prisma.assignment.findMany({
      where: {
        universityId,
        isActive: true,
        dueDate: {
          gte: today,
          lte: nextWeek,
        },
      },
      include: {
        subject: {
          select: {
            name: true,
          },
        },
        submissions: {
          where: {
            studentId,
          },
          select: {
            id: true,
            submittedAt: true,
          },
        },
      },
      orderBy: {
        dueDate: 'asc',
      },
      take: 5,
    });

    const upcomingAssignments = assignments.map((assignment) => {
      const daysUntilDue = Math.ceil(
        (assignment.dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      return {
        id: assignment.id,
        title: assignment.title,
        subjectName: assignment.subject.name,
        dueDate: assignment.dueDate,
        daysUntilDue,
        status: assignment.submissions.length > 0 ? 'ENTREGADA' : 'PENDIENTE',
      };
    });

    return {
      student,
      subjects,
      upcomingAssignments,
    };
  } catch (error) {
    console.error('Error loading student dashboard:', error);
    return null;
  }
}


