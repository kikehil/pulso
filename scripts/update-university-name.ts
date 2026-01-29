import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateUniversityName() {
  try {
    const university = await prisma.university.update({
      where: { id: 'universidad-demo' },
      data: {
        name: 'Tecnologico de Panuco',
      },
    });

    console.log('\n================================================================');
    console.log('✓ Nombre de universidad actualizado!');
    console.log('================================================================\n');
    console.log('Nombre anterior: Universidad Demo');
    console.log('Nombre nuevo: Tecnologico de Panuco');
    console.log('\n================================================================\n');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateUniversityName();


