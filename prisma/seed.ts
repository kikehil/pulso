import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Limpiar datos existentes (opcional, para desarrollo)
  await prisma.submission.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.group.deleteMany();
  await prisma.teacherSubject.deleteMany();
  await prisma.teacherCareer.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.course.deleteMany();
  await prisma.student.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.user.deleteMany();
  await prisma.university.deleteMany();

  console.log('🗑️  Base de datos limpiada');

  // Crear universidades de prueba
  const university1 = await prisma.university.create({
    data: {
      id: 'universidad-demo',
      name: 'Universidad Tecnológica Nacional',
      slug: 'utn',
      domain: 'utn.edu.ar',
      logo: '/logos/utn.png',
    },
  });

  const university2 = await prisma.university.create({
    data: {
      name: 'Universidad de Buenos Aires',
      slug: 'uba',
      domain: 'uba.edu.ar',
      logo: '/logos/uba.png',
    },
  });

  console.log('🏫 Universidades creadas:', university1.name, university2.name);

  // ============================================
  // CREAR USUARIOS DEL SISTEMA
  // ============================================

  // 1. Usuario ADMIN
  const adminPassword = await bcrypt.hash('Admin123!', 10);
  const adminUser = await prisma.user.create({
    data: {
      universityId: university1.id,
      email: 'admin@tecnologico.edu.mx',
      password: adminPassword,
      role: 'ADMIN',
      isActive: true,
    },
  });
  console.log('👑 Usuario ADMIN creado:', adminUser.email);

  // 2. Usuario COORDINADOR (con perfil de Teacher)
  const coordinadorTeacher = await prisma.teacher.create({
    data: {
      universityId: university1.id,
      email: 'coordinador@tecnologico.edu.mx',
      firstName: 'Roberto',
      lastName: 'Coordinador',
      department: 'Coordinación Académica',
      phone: '+52 123 456 7890',
    },
  });

  const coordinadorPassword = await bcrypt.hash('Coord123!', 10);
  const coordinadorUser = await prisma.user.create({
    data: {
      universityId: university1.id,
      email: 'coordinador@tecnologico.edu.mx',
      password: coordinadorPassword,
      role: 'COORDINADOR',
      teacherId: coordinadorTeacher.id,
      isActive: true,
    },
  });
  console.log('👔 Usuario COORDINADOR creado:', coordinadorUser.email);

  // Crear docentes para UTN
  const teachers = [];
  const teacherNames = [
    { firstName: 'María', lastName: 'González', department: 'Facultad de Ingeniería' },
    { firstName: 'Juan', lastName: 'Rodríguez', department: 'Facultad de Sistemas' },
    { firstName: 'Ana', lastName: 'Martínez', department: 'Facultad de Ingeniería' },
    { firstName: 'Carlos', lastName: 'López', department: 'Facultad de Sistemas' },
    { firstName: 'Laura', lastName: 'Fernández', department: 'Facultad de Matemática' },
    { firstName: 'Pedro', lastName: 'Sánchez', department: 'Facultad de Ingeniería' },
    { firstName: 'Sofía', lastName: 'Romero', department: 'Facultad de Sistemas' },
    { firstName: 'Diego', lastName: 'Torres', department: 'Facultad de Matemática' },
  ];

  for (let i = 0; i < teacherNames.length; i++) {
    const teacher = teacherNames[i];
    const created = await prisma.teacher.create({
      data: {
        universityId: university1.id,
        email: `${teacher.firstName.toLowerCase()}.${teacher.lastName.toLowerCase()}@utn.edu.ar`,
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        department: teacher.department,
        phone: `+54 11 ${4000 + i * 100} ${5000 + i * 10}`,
      },
    });
    teachers.push(created);
  }

  console.log('👨‍🏫 Docentes creados:', teachers.length);

  // Crear usuarios DOCENTE para cada teacher
  for (let i = 0; i < teachers.length; i++) {
    const teacher = teachers[i];
    const password = await bcrypt.hash('Docente123!', 10);
    
    await prisma.user.create({
      data: {
        universityId: university1.id,
        email: teacher.email,
        password: password,
        role: 'DOCENTE',
        teacherId: teacher.id,
        isActive: true,
      },
    });
  }
  console.log('👨‍🏫 Usuarios DOCENTE creados:', teachers.length);

  // Crear estudiantes para UTN
  const students = [];
  const nombres = ['Juan', 'María', 'Carlos', 'Ana', 'Luis', 'Laura', 'Pedro', 'Sofía', 'Diego', 'Carmen'];
  const apellidos = ['García', 'Martínez', 'López', 'González', 'Rodríguez', 'Fernández', 'Pérez', 'Sánchez', 'Romero', 'Torres'];

  for (let i = 1; i <= 50; i++) {
    const firstName = nombres[Math.floor(Math.random() * nombres.length)];
    const lastName = apellidos[Math.floor(Math.random() * apellidos.length)];
    
    const student = await prisma.student.create({
      data: {
        universityId: university1.id,
        email: `estudiante${i}@utn.edu.ar`,
        firstName: firstName,
        lastName: `${lastName} ${i}`,
        enrollmentId: `E${i.toString().padStart(5, '0')}`,
      },
    });
    students.push(student);
  }

  console.log('👥 Estudiantes creados:', students.length);

  // Crear usuarios ALUMNO para cada estudiante
  for (let i = 0; i < students.length; i++) {
    const student = students[i];
    const password = await bcrypt.hash('Alumno123!', 10);
    
    await prisma.user.create({
      data: {
        universityId: university1.id,
        email: student.email,
        password: password,
        role: 'ALUMNO',
        studentId: student.id,
        isActive: true,
      },
    });
  }
  console.log('👥 Usuarios ALUMNO creados:', students.length);

  // Crear carreras (cursos)
  const courses = [];
  const coursesData = [
    { name: 'Ingeniería en Sistemas', code: 'ING-SIS', teacherId: teachers[0].id, description: 'Carrera orientada al desarrollo de software y sistemas computacionales.' },
    { name: 'Ingeniería Industrial', code: 'ING-IND', teacherId: teachers[1].id, description: 'Carrera enfocada en optimización de procesos y gestión industrial.' },
    { name: 'Ingeniería Mecánica', code: 'ING-MEC', teacherId: teachers[2].id, description: 'Carrera dedicada al diseño y análisis de sistemas mecánicos.' },
    { name: 'Licenciatura en Matemática', code: 'LIC-MAT', teacherId: teachers[3].id, description: 'Carrera de matemática pura y aplicada.' },
  ];

  for (const course of coursesData) {
    const created = await prisma.course.create({
      data: {
        universityId: university1.id,
        name: course.name,
        code: course.code,
        teacherId: course.teacherId,
        description: course.description,
      },
    });
    courses.push(created);
  }

  console.log('📚 Carreras creadas:', courses.length);

  // Crear materias para cada carrera
  const subjects = [];
  const subjectsData = [
    // Ingeniería en Sistemas
    { name: 'Algoritmos y Estructuras de Datos', code: 'AED-101', courseId: courses[0].id, credits: 6, semester: 1 },
    { name: 'Bases de Datos', code: 'BD-201', courseId: courses[0].id, credits: 6, semester: 2 },
    { name: 'Programación Orientada a Objetos', code: 'POO-102', courseId: courses[0].id, credits: 6, semester: 1 },
    { name: 'Desarrollo Web', code: 'DW-301', courseId: courses[0].id, credits: 5, semester: 3 },
    { name: 'Inteligencia Artificial', code: 'IA-401', courseId: courses[0].id, credits: 5, semester: 4 },
    
    // Ingeniería Industrial
    { name: 'Gestión de Operaciones', code: 'GO-201', courseId: courses[1].id, credits: 5, semester: 2 },
    { name: 'Control de Calidad', code: 'CC-301', courseId: courses[1].id, credits: 5, semester: 3 },
    { name: 'Seguridad Industrial', code: 'SI-202', courseId: courses[1].id, credits: 4, semester: 2 },
    
    // Ingeniería Mecánica
    { name: 'Mecánica de Fluidos', code: 'MF-301', courseId: courses[2].id, credits: 6, semester: 3 },
    { name: 'Termodinámica', code: 'TER-201', courseId: courses[2].id, credits: 6, semester: 2 },
    { name: 'Diseño Mecánico', code: 'DM-401', courseId: courses[2].id, credits: 5, semester: 4 },
    
    // Matemática
    { name: 'Cálculo I', code: 'CAL-101', courseId: courses[3].id, credits: 7, semester: 1 },
    { name: 'Álgebra Lineal', code: 'ALG-101', courseId: courses[3].id, credits: 6, semester: 1 },
    { name: 'Análisis Matemático', code: 'ANA-201', courseId: courses[3].id, credits: 7, semester: 2 },
  ];

  for (const subject of subjectsData) {
    const created = await prisma.subject.create({
      data: {
        universityId: university1.id,
        courseId: subject.courseId,
        name: subject.name,
        code: subject.code,
        credits: subject.credits,
        semester: subject.semester,
        description: `Materia de ${subject.name}`,
      },
    });
    subjects.push(created);
  }

  console.log('📖 Materias creadas:', subjects.length);

  // Asignar carreras y materias a docentes
  console.log('🔗 Asignando carreras y materias a docentes...');
  
  // Docente 0 - Ingeniería en Sistemas (múltiples materias)
  await prisma.teacherCareer.create({
    data: { teacherId: teachers[0].id, courseId: courses[0].id },
  });
  await prisma.teacherSubject.createMany({
    data: [
      { teacherId: teachers[0].id, subjectId: subjects[0].id }, // AED
      { teacherId: teachers[0].id, subjectId: subjects[2].id }, // POO
    ],
  });

  // Docente 1 - Ingeniería Industrial + Sistemas
  await prisma.teacherCareer.createMany({
    data: [
      { teacherId: teachers[1].id, courseId: courses[1].id },
      { teacherId: teachers[1].id, courseId: courses[0].id },
    ],
  });
  await prisma.teacherSubject.createMany({
    data: [
      { teacherId: teachers[1].id, subjectId: subjects[1].id }, // BD
      { teacherId: teachers[1].id, subjectId: subjects[5].id }, // GO
    ],
  });

  // Docente 2 - Ingeniería Mecánica
  await prisma.teacherCareer.create({
    data: { teacherId: teachers[2].id, courseId: courses[2].id },
  });
  await prisma.teacherSubject.createMany({
    data: [
      { teacherId: teachers[2].id, subjectId: subjects[8].id }, // MF
      { teacherId: teachers[2].id, subjectId: subjects[9].id }, // TER
      { teacherId: teachers[2].id, subjectId: subjects[10].id }, // DM
    ],
  });

  // Docente 3 - Matemática + Sistemas
  await prisma.teacherCareer.createMany({
    data: [
      { teacherId: teachers[3].id, courseId: courses[3].id },
      { teacherId: teachers[3].id, courseId: courses[0].id },
    ],
  });
  await prisma.teacherSubject.createMany({
    data: [
      { teacherId: teachers[3].id, subjectId: subjects[11].id }, // CAL
      { teacherId: teachers[3].id, subjectId: subjects[12].id }, // ALG
    ],
  });

  // Docente 4 - Matemática
  await prisma.teacherCareer.create({
    data: { teacherId: teachers[4].id, courseId: courses[3].id },
  });
  await prisma.teacherSubject.create({
    data: { teacherId: teachers[4].id, subjectId: subjects[13].id }, // ANA
  });

  // Docente 5 - Ingeniería en Sistemas
  await prisma.teacherCareer.create({
    data: { teacherId: teachers[5].id, courseId: courses[0].id },
  });
  await prisma.teacherSubject.createMany({
    data: [
      { teacherId: teachers[5].id, subjectId: subjects[3].id }, // DW
      { teacherId: teachers[5].id, subjectId: subjects[4].id }, // IA
    ],
  });

  console.log('✅ Relaciones creadas exitosamente');

  // Crear grupos (basados en las carreras)
  const groups = [];
  const schedules = ['Lunes 8:00-10:00', 'Martes 14:00-16:00', 'Miércoles 10:00-12:00', 'Jueves 16:00-18:00', 'Viernes 8:00-10:00'];

  for (let i = 0; i < courses.length; i++) {
    const course = courses[i];
    // Crear 2 grupos por carrera
    for (let j = 1; j <= 2; j++) {
      const group = await prisma.group.create({
        data: {
          universityId: university1.id,
          courseId: course.id,
          teacherId: course.teacherId,
          name: `${course.code} - Comisión ${j}`,
          code: `${course.code}-G${j}`,
          schedule: schedules[Math.floor(Math.random() * schedules.length)],
        },
      });
      groups.push(group);
    }
  }

  console.log('📁 Grupos creados:', groups.length);

  // Inscribir estudiantes en grupos
  let enrollmentCount = 0;
  for (const group of groups) {
    // Inscribir entre 5 y 15 estudiantes por grupo
    const numStudents = Math.floor(Math.random() * 11) + 5;
    const selectedStudents = students.sort(() => 0.5 - Math.random()).slice(0, numStudents);

    for (const student of selectedStudents) {
      try {
        await prisma.enrollment.create({
          data: {
            studentId: student.id,
            groupId: group.id,
          },
        });
        enrollmentCount++;
      } catch (error) {
        // Si el estudiante ya está inscrito, continuar
        continue;
      }
    }
  }

  console.log('📝 Inscripciones creadas:', enrollmentCount);

  // Crear tareas
  const assignments = [];
  const today = new Date();

  for (const subject of subjects) {
    const course = courses.find((c) => c.id === subject.courseId);
    // Crear 3 tareas por materia
    for (let i = 1; i <= 3; i++) {
      const dueDate = new Date(today);
      dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 30) + 1);

      const assignment = await prisma.assignment.create({
        data: {
          universityId: university1.id,
          subjectId: subject.id,
          teacherId: course?.teacherId || teachers[0].id,
          title: `Tarea ${i} - ${subject.name}`,
          description: `Trabajo práctico sobre los temas vistos en clase. Fecha límite: ${dueDate.toLocaleDateString()}`,
          dueDate: dueDate,
          maxScore: 100,
        },
      });
      assignments.push(assignment);
    }
  }

  console.log('📋 Tareas creadas:', assignments.length);

  // Crear entregas de tareas (algunas entregadas hoy)
  let submissionCount = 0;
  for (const assignment of assignments.slice(0, 5)) {
    // Para las primeras 5 tareas, crear entregas
    const subjectCourseId = subjects.find((s) => s.id === assignment.subjectId)?.courseId;
    const courseGroups = subjectCourseId
      ? groups.filter((g) => g.courseId === subjectCourseId)
      : [];
    
    for (const group of courseGroups) {
      const enrollments = await prisma.enrollment.findMany({
        where: { groupId: group.id },
      });

      // 50% de los estudiantes entregan
      for (const enrollment of enrollments) {
        if (Math.random() > 0.5) {
          const submittedAt = new Date(today);
          // Algunas entregas de hoy
          if (Math.random() > 0.7) {
            submittedAt.setHours(Math.floor(Math.random() * 24));
          } else {
            submittedAt.setDate(submittedAt.getDate() - Math.floor(Math.random() * 7));
          }

          const isGraded = Math.random() > 0.4;

          await prisma.submission.create({
            data: {
              assignmentId: assignment.id,
              studentId: enrollment.studentId,
              content: 'Trabajo completado según las especificaciones del curso.',
              submittedAt: submittedAt,
              score: isGraded ? Math.floor(Math.random() * 30) + 70 : null,
              feedback: isGraded ? 'Buen trabajo. Sigue así.' : null,
              gradedAt: isGraded ? new Date() : null,
            },
          });
          submissionCount++;
        }
      }
    }
  }

  console.log('✅ Entregas creadas:', submissionCount);

  console.log('\n🎉 Seed completado exitosamente!');
  console.log('\n📊 Resumen:');
  console.log(`   - Universidades: 2`);
  console.log(`   - Usuarios: ${teachers.length + students.length + 2} (Admin + Coordinador + Docentes + Alumnos)`);
  console.log(`   - Docentes: ${teachers.length}`);
  console.log(`   - Estudiantes: ${students.length}`);
  console.log(`   - Cursos: ${courses.length}`);
  console.log(`   - Grupos: ${groups.length}`);
  console.log(`   - Inscripciones: ${enrollmentCount}`);
  console.log(`   - Tareas: ${assignments.length}`);
  console.log(`   - Entregas: ${submissionCount}`);
  console.log('\n🔑 ID de universidad por defecto: universidad-demo');
  console.log('\n💡 Usa este ID en tu archivo .env como DEFAULT_UNIVERSITY_ID');
  console.log('\n👤 CREDENCIALES DE ACCESO:');
  console.log('\n   🔐 ADMINISTRADOR:');
  console.log('      Email: admin@tecnologico.edu.mx');
  console.log('      Password: Admin123!');
  console.log('\n   👔 COORDINADOR:');
  console.log('      Email: coordinador@tecnologico.edu.mx');
  console.log('      Password: Coord123!');
  console.log('\n   👨‍🏫 DOCENTES:');
  console.log('      Email: [nombre].[apellido]@utn.edu.ar');
  console.log('      Password: Docente123!');
  console.log('      Ejemplo: maria.gonzalez@utn.edu.ar');
  console.log('\n   👥 ALUMNOS:');
  console.log('      Email: estudiante[1-50]@utn.edu.ar');
  console.log('      Password: Alumno123!');
  console.log('      Ejemplo: estudiante1@utn.edu.ar');
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

