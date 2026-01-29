import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugCourses() {
  try {
    const university = await prisma.university.findUnique({
      where: { id: 'universidad-demo' },
    });

    if (!university) {
      console.log('❌ Universidad no encontrada');
      return;
    }

    const courses = await prisma.course.findMany({
      where: {
        universityId: university.id,
        isActive: true,
      },
    });

    console.log('\n================================================================');
    console.log('           CARRERAS DISPONIBLES PARA GRUPOS');
    console.log('================================================================\n');

    if (courses.length === 0) {
      console.log('❌ No hay carreras registradas');
      console.log('\nPor favor, crea al menos una carrera en:');
      console.log('http://localhost:3000/dashboard/carreras\n');
    } else {
      console.log(`✓ Total de carreras: ${courses.length}\n`);
      courses.forEach((course, index) => {
        console.log(`${index + 1}. ${course.name}`);
        console.log(`   ID: ${course.id}`);
        console.log(`   Código: ${course.code}`);
        console.log('   ---');
      });
    }

    console.log('\n================================================================\n');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugCourses();


