'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { getCurrentUniversityId } from '@/lib/tenant';
import { revalidatePath } from 'next/cache';
import { notifyTaskSubmitted } from '@/lib/notifications';

async function getCurrentStudentId() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    throw new Error('No hay sesión activa');
  }
  
  if (!(session.user as any)?.studentId) {
    throw new Error('No se encontró el ID del estudiante en la sesión');
  }
  
  return (session.user as any).studentId;
}

export async function getStudentAssignments() {
  try {
    const studentId = await getCurrentStudentId();
    const universityId = await getCurrentUniversityId();

    const assignments = await prisma.assignment.findMany({
      where: {
        universityId,
        isActive: true,
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
            score: true,
            feedback: true,
            submittedAt: true,
            gradedAt: true,
          },
        },
      },
      orderBy: {
        dueDate: 'asc',
      },
    });

    const now = new Date();

    return assignments.map((assignment) => {
      const submission = assignment.submissions[0];
      const isOverdue = assignment.dueDate < now && !submission;
      const timeUntilDue = assignment.dueDate.getTime() - now.getTime();
      const daysUntilDue = Math.ceil(timeUntilDue / (1000 * 60 * 60 * 24));
      const isDueSoon = daysUntilDue <= 2 && daysUntilDue >= 0;

      let status: 'PENDIENTE' | 'ENTREGADA' | 'CALIFICADA' = 'PENDIENTE';
      if (submission) {
        status = submission.gradedAt ? 'CALIFICADA' : 'ENTREGADA';
      }

      let dueText = '';
      if (daysUntilDue === 0) {
        dueText = 'hoy';
      } else if (daysUntilDue === 1) {
        dueText = 'mañana';
      } else if (daysUntilDue > 1) {
        dueText = `en ${daysUntilDue} días`;
      }

      return {
        id: assignment.id,
        title: assignment.title,
        description: assignment.description,
        subjectName: assignment.subject.name,
        dueDate: assignment.dueDate,
        maxScore: assignment.maxScore,
        isOverdue,
        isDueSoon,
        dueText,
        status,
        score: submission?.score ?? null,
        feedback: submission?.feedback ?? null,
        submittedAt: submission?.submittedAt ?? null,
      };
    });
  } catch (error) {
    console.error('Error loading student assignments:', error);
    return [];
  }
}

export async function getAssignmentDetail(assignmentId: string) {
  try {
    const studentId = await getCurrentStudentId();

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        subject: {
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
        submissions: {
          where: {
            studentId,
          },
        },
      },
    });

    if (!assignment) {
      return null;
    }

    const submission = assignment.submissions[0];

    return {
      id: assignment.id,
      title: assignment.title,
      description: assignment.description,
      subjectName: assignment.subject.name,
      subjectCode: assignment.subject.code,
      teacherName: `${assignment.teacher.firstName} ${assignment.teacher.lastName}`,
      dueDate: assignment.dueDate,
      maxScore: assignment.maxScore,
      submission: submission
        ? {
            id: submission.id,
            content: submission.content,
            fileUrl: submission.fileUrl,
            score: submission.score,
            feedback: submission.feedback,
            submittedAt: submission.submittedAt,
            gradedAt: submission.gradedAt,
          }
        : null,
    };
  } catch (error) {
    console.error('Error loading assignment detail:', error);
    return null;
  }
}

export async function submitAssignment(data: {
  assignmentId: string;
  content?: string;
  fileUrl?: string;
}) {
  try {
    const studentId = await getCurrentStudentId();

    // Obtener información para la notificación
    const assignment = await prisma.assignment.findUnique({
      where: { id: data.assignmentId },
      include: {
        teacher: {
          include: {
            user: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: {
        firstName: true,
        lastName: true,
      },
    });

    if (!assignment || !student) {
      return { success: false, error: 'Datos no encontrados' };
    }

    // Verificar si ya existe una entrega
    const existingSubmission = await prisma.submission.findUnique({
      where: {
        assignmentId_studentId: {
          assignmentId: data.assignmentId,
          studentId,
        },
      },
    });

    const isNewSubmission = !existingSubmission;

    if (existingSubmission) {
      // Actualizar la entrega existente
      await prisma.submission.update({
        where: { id: existingSubmission.id },
        data: {
          content: data.content,
          fileUrl: data.fileUrl,
          submittedAt: new Date(),
        },
      });
    } else {
      // Crear nueva entrega
      await prisma.submission.create({
        data: {
          assignmentId: data.assignmentId,
          studentId,
          content: data.content,
          fileUrl: data.fileUrl,
          submittedAt: new Date(),
        },
      });
    }

    // Notificar al docente solo si es una nueva entrega
    if (isNewSubmission && assignment.teacher.user?.id) {
      await notifyTaskSubmitted({
        teacherUserId: assignment.teacher.user.id,
        studentName: `${student.firstName} ${student.lastName}`,
        assignmentTitle: assignment.title,
        assignmentId: data.assignmentId,
      });
    }

    revalidatePath(`/student/assignments/${data.assignmentId}`);
    revalidatePath('/student/assignments');
    revalidatePath('/student/dashboard');

    return { success: true };
  } catch (error) {
    console.error('Error submitting assignment:', error);
    return { success: false, error: 'Error al entregar la tarea' };
  }
}

