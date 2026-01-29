'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUniversityId } from '@/lib/tenant';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';

// Obtener el ID del docente desde la sesión actual
async function getCurrentTeacherId() {
  const session = await getServerSession(authOptions);
  
  console.log('=== getCurrentTeacherId ===');
  console.log('Session:', JSON.stringify(session, null, 2));
  
  if (!session?.user?.teacherId) {
    console.error('❌ No teacherId in session');
    throw new Error('No se encontró el ID del docente en la sesión. Por favor inicia sesión nuevamente.');
  }
  
  console.log('✓ Teacher ID found:', session.user.teacherId);
  return session.user.teacherId;
}

// ===============================
// DASHBOARD DEL DOCENTE
// ===============================

export async function getTeacherSubjects() {
  try {
    const universityId = await getCurrentUniversityId();
    const teacherId = await getCurrentTeacherId();

    console.log('=== getTeacherSubjects ===');
    console.log('University ID:', universityId);
    console.log('Teacher ID:', teacherId);

    const teacherSubjects = await prisma.teacherSubject.findMany({
      where: {
        teacherId,
      },
      include: {
        subject: {
          include: {
            course: {
              select: {
                name: true,
                code: true,
              },
            },
            _count: {
              select: {
                studentSubjects: true, // Contar alumnos inscritos
              },
            },
          },
        },
      },
    });

    console.log('Found teacher subjects:', teacherSubjects.length);

    const result = teacherSubjects.map((ts) => ({
      id: ts.subject.id,
      name: ts.subject.name,
      code: ts.subject.code,
      credits: ts.subject.credits,
      semester: ts.subject.semester,
      courseName: ts.subject.course.name,
      courseCode: ts.subject.course.code,
      studentCount: ts.subject._count.studentSubjects,
    }));

    console.log('Returning subjects:', result);
    return result;
  } catch (error) {
    console.error('❌ Error in getTeacherSubjects:', error);
    throw error;
  }
}

// ===============================
// MÓDULO DE ASISTENCIA
// ===============================

export async function getSubjectStudents(subjectId: string) {
  const universityId = await getCurrentUniversityId();

  const studentSubjects = await prisma.studentSubject.findMany({
    where: {
      subjectId,
      student: {
        universityId,
        isActive: true,
      },
    },
    include: {
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
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

  // Obtener asistencia de hoy usando AttendanceSession
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todaySession = await prisma.attendanceSession.findFirst({
    where: {
      subjectId,
      date: {
        gte: today,
        lt: tomorrow,
      },
    },
    include: {
      records: true,
    },
  });

  const attendanceMap = new Map(
    todaySession?.records.map((r) => [r.studentId, r]) || []
  );

  return studentSubjects.map((ss) => ({
    ...ss.student,
    attendance: attendanceMap.get(ss.student.id) || null,
  }));
}

export async function saveAttendance(data: {
  subjectId: string;
  studentId: string;
  status: string;
  notes?: string;
}) {
  const universityId = await getCurrentUniversityId();
  const teacherId = await getCurrentTeacherId();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Buscar o crear sesión de asistencia de hoy
  let session = await prisma.attendanceSession.findFirst({
    where: {
      subjectId: data.subjectId,
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
        universityId,
        subjectId: data.subjectId,
        teacherId,
        date: today,
      },
    });
  }

  // Upsert del registro de asistencia
  await prisma.attendanceRecord.upsert({
    where: {
      sessionId_studentId: {
        sessionId: session.id,
        studentId: data.studentId,
      },
    },
    update: {
      status: data.status,
      notes: data.notes,
    },
    create: {
      sessionId: session.id,
      studentId: data.studentId,
      status: data.status,
      notes: data.notes,
    },
  });

  revalidatePath(`/docente/asistencia/${data.subjectId}`);
}

export async function bulkSaveAttendance(data: {
  subjectId: string;
  attendances: Array<{
    studentId: string;
    status: string;
    notes?: string;
  }>;
}) {
  const universityId = await getCurrentUniversityId();
  const teacherId = await getCurrentTeacherId();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Buscar o crear sesión de asistencia de hoy
  let session = await prisma.attendanceSession.findFirst({
    where: {
      subjectId: data.subjectId,
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
        universityId,
        subjectId: data.subjectId,
        teacherId,
        date: today,
      },
    });
  }

  // Guardar cada registro de asistencia
  await Promise.all(
    data.attendances.map((attendance) =>
      prisma.attendanceRecord.upsert({
        where: {
          sessionId_studentId: {
            sessionId: session.id,
            studentId: attendance.studentId,
          },
        },
        update: {
          status: attendance.status,
          notes: attendance.notes,
        },
        create: {
          sessionId: session.id,
          studentId: attendance.studentId,
          status: attendance.status,
          notes: attendance.notes,
        },
      })
    )
  );

  revalidatePath(`/docente/asistencia/${data.subjectId}`);
}

// ===============================
// MÓDULO DE CALIFICACIONES
// ===============================

export async function getSubjectAssignments(subjectId: string) {
  const universityId = await getCurrentUniversityId();
  const teacherId = await getCurrentTeacherId();

  const assignments = await prisma.assignment.findMany({
    where: {
      universityId,
      subjectId,
      teacherId,
      isActive: true,
    },
    include: {
      _count: {
        select: {
          submissions: true,
        },
      },
    },
    orderBy: {
      dueDate: 'desc',
    },
  });

  return assignments;
}

export async function getAssignmentSubmissions(assignmentId: string) {
  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: {
      subject: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
    },
  });

  if (!assignment) {
    throw new Error('Tarea no encontrada');
  }

  // Obtener todos los estudiantes de la materia
  const studentSubjects = await prisma.studentSubject.findMany({
    where: {
      subjectId: assignment.subjectId,
    },
    include: {
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          enrollmentId: true,
          avatarUrl: true,
        },
      },
    },
  });

  // Obtener las entregas
  const submissions = await prisma.submission.findMany({
    where: {
      assignmentId,
    },
  });

  const submissionsMap = new Map(
    submissions.map((s) => [s.studentId, s])
  );

  return {
    assignment,
    students: studentSubjects.map((ss) => ({
      ...ss.student,
      submission: submissionsMap.get(ss.student.id) || null,
    })),
  };
}

export async function gradeSubmission(data: {
  submissionId?: string;
  assignmentId: string;
  studentId: string;
  score: number;
  feedback?: string;
}) {
  const teacherId = await getCurrentTeacherId();

  if (data.submissionId) {
    // Actualizar entrega existente
    await prisma.submission.update({
      where: { id: data.submissionId },
      data: {
        score: data.score,
        feedback: data.feedback,
        gradedBy: teacherId,
        gradedAt: new Date(),
      },
    });
  } else {
    // Crear entrega (para casos donde el alumno no entregó pero se califica)
    await prisma.submission.create({
      data: {
        assignmentId: data.assignmentId,
        studentId: data.studentId,
        score: data.score,
        feedback: data.feedback,
        gradedBy: teacherId,
        gradedAt: new Date(),
      },
    });
  }

  revalidatePath(`/docente/calificar/${data.assignmentId}`);
}

// ===============================
// ESTADÍSTICAS DEL DOCENTE
// ===============================

export async function getTeacherStats() {
  const universityId = await getCurrentUniversityId();
  const teacherId = await getCurrentTeacherId();

  // Total de materias asignadas
  const totalSubjects = await prisma.teacherSubject.count({
    where: { teacherId },
  });

  // Total de alumnos (únicos en todas las materias)
  const teacherSubjects = await prisma.teacherSubject.findMany({
    where: { teacherId },
    select: { subjectId: true },
  });

  const subjectIds = teacherSubjects.map((ts) => ts.subjectId);

  const uniqueStudents = await prisma.studentSubject.findMany({
    where: {
      subjectId: { in: subjectIds },
    },
    distinct: ['studentId'],
  });

  const totalStudents = uniqueStudents.length;

  // Tareas pendientes de calificar
  const assignments = await prisma.assignment.findMany({
    where: {
      teacherId,
      isActive: true,
    },
    select: { id: true },
  });

  const assignmentIds = assignments.map((a) => a.id);

  const pendingGrades = await prisma.submission.count({
    where: {
      assignmentId: { in: assignmentIds },
      score: null,
    },
  });

  // Asistencia hoy
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayAttendances = await prisma.attendanceSession.count({
    where: {
      teacherId,
      date: {
        gte: today,
        lt: tomorrow,
      },
    },
  });

  return {
    totalSubjects,
    totalStudents,
    pendingGrades,
    todayAttendances,
  };
}

