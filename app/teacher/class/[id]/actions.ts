'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { revalidatePath } from 'next/cache';

async function getCurrentTeacherId() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.teacherId) {
    throw new Error('No se encontró el ID del docente en la sesión');
  }
  
  return session.user.teacherId;
}

export async function getClassDetails(groupId: string) {
  try {
    const teacherId = await getCurrentTeacherId();

    const group = await prisma.group.findFirst({
      where: {
        id: groupId,
        teacherId,
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
    });

    if (!group) {
      throw new Error('Grupo no encontrado');
    }

    return {
      id: group.id,
      subjectName: group.course.name,
      subjectCode: group.course.code,
      groupName: group.name,
      groupCode: group.code,
      courseName: group.course.name,
      studentCount: group._count.enrollments,
      teacherName: group.teacher ? `${group.teacher.firstName} ${group.teacher.lastName}` : undefined,
    };
  } catch (error) {
    console.error('Error al obtener detalles de la clase:', error);
    throw error;
  }
}

export async function getGroupStudents(groupId: string) {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: {
        groupId,
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            enrollmentId: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        student: {
          lastName: 'asc',
        },
      },
    });

    return enrollments.map((e) => e.student);
  } catch (error) {
    console.error('Error al obtener estudiantes:', error);
    throw error;
  }
}

export async function getTodayAttendance(groupId: string) {
  try {
    const teacherId = await getCurrentTeacherId();
    
    // Obtener fecha de hoy (solo fecha, sin hora)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Buscar sesión de asistencia de hoy
    const session = await prisma.attendanceSession.findFirst({
      where: {
        teacherId,
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        records: {
          include: {
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    return session;
  } catch (error) {
    console.error('Error al obtener asistencia:', error);
    throw error;
  }
}

export async function saveAttendance(
  groupId: string,
  attendanceData: Array<{ studentId: string; status: string; notes?: string }>
) {
  try {
    const teacherId = await getCurrentTeacherId();
    
    // Obtener el curso del grupo
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      select: { courseId: true, universityId: true },
    });

    if (!group) {
      throw new Error('Grupo no encontrado');
    }

    // Fecha de hoy
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Buscar o crear sesión de asistencia
    let session = await prisma.attendanceSession.findFirst({
      where: {
        teacherId,
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    if (!session) {
      session = await prisma.attendanceSession.create({
        data: {
          universityId: group.universityId,
          subjectId: group.courseId,
          teacherId,
          date: today,
        },
      });
    }

    // Calcular estadísticas
    const totalStudents = attendanceData.length;
    const presentCount = attendanceData.filter((a) => a.status === 'PRESENTE').length;
    const lateCount = attendanceData.filter((a) => a.status === 'RETARDO').length;
    const absentCount = attendanceData.filter((a) => a.status === 'FALTA').length;
    const justifiedCount = attendanceData.filter((a) => a.status === 'JUSTIFICADO').length;
    
    // Algoritmo del Pulso
    const attendancePercent = 
      ((presentCount + lateCount * 0.5) / totalStudents) * 100;

    // Actualizar estadísticas de la sesión
    await prisma.attendanceSession.update({
      where: { id: session.id },
      data: {
        totalStudents,
        presentCount,
        lateCount,
        absentCount,
        justifiedCount,
        attendancePercent,
      },
    });

    // Guardar registros individuales
    for (const record of attendanceData) {
      await prisma.attendanceRecord.upsert({
        where: {
          sessionId_studentId: {
            sessionId: session.id,
            studentId: record.studentId,
          },
        },
        update: {
          status: record.status,
          notes: record.notes || null,
        },
        create: {
          sessionId: session.id,
          studentId: record.studentId,
          status: record.status,
          notes: record.notes || null,
        },
      });
    }

    revalidatePath(`/teacher/class/${groupId}`);
    return { success: true, attendancePercent };
  } catch (error) {
    console.error('Error al guardar asistencia:', error);
    return { success: false, error: 'Error al guardar asistencia' };
  }
}

