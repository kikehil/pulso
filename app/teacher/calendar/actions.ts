'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Obtener el teacherId del usuario logueado
async function getCurrentTeacherId() {
  const session = await getServerSession(authOptions);
  const user = await prisma.user.findUnique({
    where: { email: session?.user?.email! },
    select: { teacherId: true },
  });
  
  if (!user?.teacherId) {
    throw new Error('No tienes permisos de docente');
  }
  
  return user.teacherId;
}

// Obtener todos los horarios del docente
export async function getTeacherSchedules() {
  try {
    const teacherId = await getCurrentTeacherId();

    const schedules = await prisma.classSchedule.findMany({
      where: {
        teacherId,
        isActive: true,
      },
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' },
      ],
    });

    return { success: true, schedules };
  } catch (error) {
    console.error('Error al obtener horarios:', error);
    return { success: false, error: 'Error al cargar horarios' };
  }
}

// Obtener materias asignadas al docente para el dropdown
export async function getTeacherSubjectsForSchedule() {
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
            id: true,
            name: true,
          },
        },
      },
    });

    return { success: true, groups };
  } catch (error) {
    console.error('Error al obtener grupos:', error);
    return { success: false, error: 'Error al cargar grupos' };
  }
}

// Crear un nuevo horario
export async function createSchedule(data: {
  groupId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  classroom?: string;
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
      include: {
        course: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!group) {
      return { success: false, error: 'Grupo no encontrado o no tienes permisos' };
    }

    // Obtener el subjectId del grupo
    const subject = await prisma.subject.findFirst({
      where: {
        courseId: group.courseId,
        isActive: true,
      },
    });

    if (!subject) {
      return { success: false, error: 'Materia no encontrada' };
    }

    // Validar conflictos de horario
    const conflict = await prisma.classSchedule.findFirst({
      where: {
        teacherId,
        dayOfWeek: data.dayOfWeek,
        isActive: true,
        OR: [
          {
            AND: [
              { startTime: { lte: data.startTime } },
              { endTime: { gt: data.startTime } },
            ],
          },
          {
            AND: [
              { startTime: { lt: data.endTime } },
              { endTime: { gte: data.endTime } },
            ],
          },
          {
            AND: [
              { startTime: { gte: data.startTime } },
              { endTime: { lte: data.endTime } },
            ],
          },
        ],
      },
    });

    if (conflict) {
      return { 
        success: false, 
        error: 'Conflicto de horario: Ya tienes una clase programada en este horario' 
      };
    }

    // Crear el horario
    const schedule = await prisma.classSchedule.create({
      data: {
        subjectId: subject.id,
        groupId: data.groupId,
        teacherId,
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        classroom: data.classroom,
      },
    });

    revalidatePath('/teacher/calendar');
    return { success: true, schedule };
  } catch (error) {
    console.error('Error al crear horario:', error);
    return { success: false, error: 'Error al crear horario' };
  }
}

// Actualizar un horario
export async function updateSchedule(data: {
  id: string;
  dayOfWeek?: number;
  startTime?: string;
  endTime?: string;
  classroom?: string;
}) {
  try {
    const teacherId = await getCurrentTeacherId();

    // Verificar permisos
    const schedule = await prisma.classSchedule.findFirst({
      where: {
        id: data.id,
        teacherId,
      },
    });

    if (!schedule) {
      return { success: false, error: 'Horario no encontrado o no tienes permisos' };
    }

    // Si se modifican día/hora, validar conflictos
    if (data.dayOfWeek !== undefined || data.startTime || data.endTime) {
      const conflict = await prisma.classSchedule.findFirst({
        where: {
          teacherId,
          dayOfWeek: data.dayOfWeek ?? schedule.dayOfWeek,
          isActive: true,
          id: { not: data.id },
          OR: [
            {
              AND: [
                { startTime: { lte: data.startTime ?? schedule.startTime } },
                { endTime: { gt: data.startTime ?? schedule.startTime } },
              ],
            },
            {
              AND: [
                { startTime: { lt: data.endTime ?? schedule.endTime } },
                { endTime: { gte: data.endTime ?? schedule.endTime } },
              ],
            },
          ],
        },
      });

      if (conflict) {
        return { 
          success: false, 
          error: 'Conflicto de horario: Ya tienes una clase programada en este horario' 
        };
      }
    }

    const updatedSchedule = await prisma.classSchedule.update({
      where: { id: data.id },
      data: {
        ...(data.dayOfWeek !== undefined && { dayOfWeek: data.dayOfWeek }),
        ...(data.startTime && { startTime: data.startTime }),
        ...(data.endTime && { endTime: data.endTime }),
        ...(data.classroom !== undefined && { classroom: data.classroom }),
      },
    });

    revalidatePath('/teacher/calendar');
    return { success: true, schedule: updatedSchedule };
  } catch (error) {
    console.error('Error al actualizar horario:', error);
    return { success: false, error: 'Error al actualizar horario' };
  }
}

// Eliminar un horario
export async function deleteSchedule(scheduleId: string) {
  try {
    const teacherId = await getCurrentTeacherId();

    // Verificar permisos
    const schedule = await prisma.classSchedule.findFirst({
      where: {
        id: scheduleId,
        teacherId,
      },
    });

    if (!schedule) {
      return { success: false, error: 'Horario no encontrado o no tienes permisos' };
    }

    await prisma.classSchedule.update({
      where: { id: scheduleId },
      data: { isActive: false },
    });

    revalidatePath('/teacher/calendar');
    return { success: true };
  } catch (error) {
    console.error('Error al eliminar horario:', error);
    return { success: false, error: 'Error al eliminar horario' };
  }
}


