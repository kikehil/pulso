'use server';

import { prisma } from './prisma';

export type NotificationType =
  | 'TASK_GRADED'
  | 'TASK_SUBMITTED'
  | 'ABSENCE_MARKED'
  | 'TASK_DUE_SOON'
  | 'NEW_ASSIGNMENT';

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}

/**
 * Crear una notificación para un usuario
 */
export async function createNotification(params: CreateNotificationParams) {
  try {
    await prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        link: params.link,
        isRead: false,
      },
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}

/**
 * Notificar al alumno cuando se califica su tarea
 */
export async function notifyTaskGraded(params: {
  studentUserId: string;
  assignmentTitle: string;
  score: number;
  maxScore: number;
  assignmentId: string;
}) {
  await createNotification({
    userId: params.studentUserId,
    type: 'TASK_GRADED',
    title: '✅ Tarea Calificada',
    message: `Tu tarea "${params.assignmentTitle}" ha sido calificada: ${params.score}/${params.maxScore}`,
    link: `/student/assignments/${params.assignmentId}`,
  });
}

/**
 * Notificar al alumno cuando se marca una falta
 */
export async function notifyAbsenceMarked(params: {
  studentUserId: string;
  subjectName: string;
  date: Date;
}) {
  await createNotification({
    userId: params.studentUserId,
    type: 'ABSENCE_MARKED',
    title: '⚠️ Falta Registrada',
    message: `Se registró una falta en ${params.subjectName} el ${params.date.toLocaleDateString('es-MX')}`,
    link: '/student/dashboard',
  });
}

/**
 * Notificar al docente cuando un alumno envía una tarea
 */
export async function notifyTaskSubmitted(params: {
  teacherUserId: string;
  studentName: string;
  assignmentTitle: string;
  assignmentId: string;
}) {
  await createNotification({
    userId: params.teacherUserId,
    type: 'TASK_SUBMITTED',
    title: '📤 Nueva Entrega',
    message: `${params.studentName} ha entregado "${params.assignmentTitle}"`,
    link: `/teacher/assignments/${params.assignmentId}`, // Futuro: página de revisión
  });
}

/**
 * Notificar al alumno sobre tarea próxima a vencer
 */
export async function notifyTaskDueSoon(params: {
  studentUserId: string;
  assignmentTitle: string;
  dueDate: Date;
  assignmentId: string;
}) {
  const days = Math.ceil(
    (params.dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  await createNotification({
    userId: params.studentUserId,
    type: 'TASK_DUE_SOON',
    title: '⏰ Tarea Próxima a Vencer',
    message: `La tarea "${params.assignmentTitle}" vence en ${days} día${days !== 1 ? 's' : ''}`,
    link: `/student/assignments/${params.assignmentId}`,
  });
}

/**
 * Obtener notificaciones de un usuario
 */
export async function getUserNotifications(userId: string, unreadOnly = false) {
  return await prisma.notification.findMany({
    where: {
      userId,
      ...(unreadOnly && { isRead: false }),
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 20,
  });
}

/**
 * Marcar notificación como leída
 */
export async function markNotificationAsRead(notificationId: string) {
  try {
    await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
}

/**
 * Marcar todas las notificaciones de un usuario como leídas
 */
export async function markAllNotificationsAsRead(userId: string) {
  try {
    await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
  }
}

/**
 * Contar notificaciones no leídas
 */
export async function getUnreadNotificationCount(userId: string) {
  return await prisma.notification.count({
    where: {
      userId,
      isRead: false,
    },
  });
}


