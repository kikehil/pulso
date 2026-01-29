'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { getCurrentUniversityId } from '@/lib/tenant';

async function getCurrentStudentId() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.studentId) {
    throw new Error('No se encontró el ID del estudiante en la sesión');
  }
  
  return session.user.studentId;
}

export async function getStudentGrades() {
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
        enrollmentId: true,
      },
    });

    if (!student) {
      return null;
    }

    // Obtener inscripciones del estudiante
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

    // Para cada materia, obtener calificaciones
    const subjects = await Promise.all(
      enrollments.map(async (enrollment) => {
        const courseId = enrollment.group.courseId;

        // Obtener entregas calificadas del estudiante en esta materia
        const submissions = await prisma.submission.findMany({
          where: {
            studentId,
            score: {
              not: null,
            },
            assignment: {
              subject: {
                courseId,
              },
            },
          },
          include: {
            assignment: {
              select: {
                id: true,
                title: true,
                maxScore: true,
              },
            },
          },
          orderBy: {
            gradedAt: 'desc',
          },
        });

        // Calcular promedio
        const totalScore = submissions.reduce((sum, sub) => sum + (sub.score || 0), 0);
        const totalMaxScore = submissions.reduce(
          (sum, sub) => sum + sub.assignment.maxScore,
          0
        );
        const average =
          totalMaxScore > 0 ? (totalScore / totalMaxScore) * 10 : 0;

        return {
          id: enrollment.group.course.id,
          name: enrollment.group.course.name,
          code: enrollment.group.course.code,
          average,
          grades: submissions.map((sub) => ({
            id: sub.id,
            assignmentTitle: sub.assignment.title,
            score: sub.score,
            maxScore: sub.assignment.maxScore,
            feedback: sub.feedback,
            gradedAt: sub.gradedAt,
          })),
        };
      })
    );

    return {
      student,
      subjects,
    };
  } catch (error) {
    console.error('Error loading student grades:', error);
    return null;
  }
}


