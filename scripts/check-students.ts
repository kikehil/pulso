import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n═══════════════════════════════════════════════════');
  console.log('   📊 VERIFICANDO ALUMNOS EN LA BASE DE DATOS');
  console.log('═══════════════════════════════════════════════════\n');

  try {
    // Obtener universidad
    const university = await prisma.university.findFirst();
    if (!university) {
      console.log('❌ No hay universidad creada.');
      return;
    }

    console.log(`✓ Universidad encontrada: ${university.name}`);
    console.log(`  ID: ${university.id}\n`);

    // Obtener carreras
    const courses = await prisma.course.findMany({
      where: { universityId: university.id, isActive: true },
      select: { id: true, name: true, code: true },
    });

    console.log(`📚 CARRERAS DISPONIBLES (${courses.length}):`);
    courses.forEach((course) => {
      console.log(`  - ${course.name} (${course.code}) [ID: ${course.id}]`);
    });

    // Obtener alumnos por carrera
    console.log('\n👨‍🎓 ALUMNOS POR CARRERA:');
    for (const course of courses) {
      const students = await prisma.student.findMany({
        where: {
          universityId: university.id,
          courseId: course.id,
          isActive: true,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          enrollmentId: true,
        },
      });

      console.log(`\n  📌 ${course.name} (${course.code}):`);
      if (students.length === 0) {
        console.log('    ⚠️ No hay alumnos inscritos en esta carrera');
      } else {
        console.log(`    ✓ Total: ${students.length} alumnos`);
        students.forEach((student) => {
          console.log(`      - ${student.firstName} ${student.lastName} (${student.enrollmentId})`);
        });
      }
    }

    // Obtener grupos
    const groups = await prisma.group.findMany({
      where: { universityId: university.id, isActive: true },
      include: {
        course: { select: { name: true, code: true } },
        _count: { select: { enrollments: true } },
      },
    });

    console.log(`\n\n📋 GRUPOS CREADOS (${groups.length}):`);
    groups.forEach((group) => {
      console.log(`  - ${group.name} (${group.code})`);
      console.log(`    Carrera: ${group.course.name}`);
      console.log(`    Alumnos inscritos: ${group._count.enrollments}`);
      console.log(`    Course ID: ${group.courseId}`);
    });

    console.log('\n═══════════════════════════════════════════════════');
    console.log('   ✓ VERIFICACIÓN COMPLETA');
    console.log('═══════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();


