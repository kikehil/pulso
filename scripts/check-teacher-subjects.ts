import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n═══════════════════════════════════════════════════');
  console.log('   👨‍🏫 DIAGNÓSTICO COMPLETO DEL DOCENTE');
  console.log('═══════════════════════════════════════════════════\n');

  try {
    // 1. Buscar usuario docente
    const teacherUser = await prisma.user.findFirst({
      where: { email: 'luzangela.hdzr@gmail.com' },
      include: {
        teacher: {
          include: {
            teacherSubjects: {
              include: {
                subject: {
                  include: {
                    course: true,
                  },
                },
              },
            },
            teacherCareers: {
              include: {
                course: true,
              },
            },
          },
        },
      },
    });

    if (!teacherUser) {
      console.log('❌ Usuario no encontrado');
      return;
    }

    console.log('✓ USUARIO ENCONTRADO');
    console.log(`  Email: ${teacherUser.email}`);
    console.log(`  Role: ${teacherUser.role}`);
    console.log(`  Active: ${teacherUser.isActive}`);
    console.log(`  Teacher ID: ${teacherUser.teacherId || 'NO ASIGNADO'}\n`);

    if (!teacherUser.teacher) {
      console.log('❌ PROBLEMA: El usuario NO tiene perfil de docente');
      console.log('\n💡 SOLUCIÓN: Ejecuta este comando:');
      console.log('   npx tsx scripts/fix-user-teacher-link.ts\n');
      return;
    }

    const teacher = teacherUser.teacher;
    console.log('✓ PERFIL DE DOCENTE ENCONTRADO');
    console.log(`  Nombre: ${teacher.firstName} ${teacher.lastName}`);
    console.log(`  Email: ${teacher.email}`);
    console.log(`  ID: ${teacher.id}\n`);

    // 2. Verificar carreras asignadas
    console.log('📚 CARRERAS ASIGNADAS:');
    if (teacher.teacherCareers.length === 0) {
      console.log('  ⚠️ El docente NO tiene carreras asignadas\n');
    } else {
      teacher.teacherCareers.forEach((tc) => {
        console.log(`  ✓ ${tc.course.name} (${tc.course.code})`);
      });
      console.log('');
    }

    // 3. Verificar materias asignadas
    console.log('📖 MATERIAS ASIGNADAS:');
    if (teacher.teacherSubjects.length === 0) {
      console.log('  ❌ El docente NO tiene materias asignadas');
      console.log('  📌 Por eso el Portal del Docente está vacío\n');
    } else {
      teacher.teacherSubjects.forEach((ts) => {
        console.log(`  ✓ ${ts.subject.name} (${ts.subject.code})`);
        console.log(`    Carrera: ${ts.subject.course.name}`);
      });
      console.log('');
    }

    // 4. Mostrar materias disponibles para asignar
    const university = await prisma.university.findFirst();
    const allSubjects = await prisma.subject.findMany({
      where: {
        course: {
          universityId: university?.id,
        },
      },
      include: {
        course: {
          select: { name: true, code: true },
        },
      },
    });

    console.log('📋 MATERIAS DISPONIBLES EN EL SISTEMA:');
    if (allSubjects.length === 0) {
      console.log('  ⚠️ NO HAY MATERIAS CREADAS EN EL SISTEMA');
      console.log('\n💡 SOLUCIÓN:');
      console.log('  1. Ve a http://localhost:3000/dashboard/materias');
      console.log('  2. Crea las materias necesarias');
      console.log('  3. Vuelve a ejecutar este script\n');
    } else {
      allSubjects.forEach((subject) => {
        console.log(`  - ${subject.name} (${subject.code})`);
        console.log(`    Carrera: ${subject.course.name}`);
      });
      console.log('');
    }

    // 5. Solución
    console.log('\n═══════════════════════════════════════════════════');
    console.log('   💡 SOLUCIÓN');
    console.log('═══════════════════════════════════════════════════\n');

    if (allSubjects.length === 0) {
      console.log('PASO 1: Crear materias');
      console.log('  → Ve a http://localhost:3000/dashboard/materias');
      console.log('  → Crea al menos una materia');
    } else if (teacher.teacherSubjects.length === 0) {
      console.log('PASO 1: Asignar materias al docente');
      console.log('  → Ve a http://localhost:3000/dashboard/docentes');
      console.log('  → Edita el docente y asigna materias');
      console.log('\nO ejecuta este comando para asignar automáticamente:');
      console.log(`  npx tsx scripts/assign-teacher-subjects.ts ${teacher.id}\n`);
    } else {
      console.log('✓ Todo está correcto');
      console.log('  El docente debería ver sus materias en el portal\n');
    }

    console.log('═══════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();


