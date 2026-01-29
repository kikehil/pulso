'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

async function getCurrentTeacherId() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.teacherId) {
    throw new Error('No se encontró el ID del docente en la sesión');
  }
  
  return session.user.teacherId;
}

export async function getTeacherClasses() {
  try {
    const teacherId = await getCurrentTeacherId();

    console.log('📚 Obteniendo clases para teacher:', teacherId);

    // Obtener grupos asignados al docente
    const groups = await prisma.group.findMany({
      where: {
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
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    console.log('✓ Grupos encontrados:', groups.length);

    // Transformar a formato para la UI
    const classes = groups.map((group) => ({
      id: group.id,
      subjectName: group.course.name,
      subjectCode: group.course.code,
      groupName: group.name,
      groupCode: group.code,
      schedule: group.schedule,
      studentCount: group._count.enrollments,
      courseName: group.course.name,
    }));

    return classes;
  } catch (error) {
    console.error('❌ Error al obtener clases del docente:', error);
    throw error;
  }
}


