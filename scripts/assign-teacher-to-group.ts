import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n═══════════════════════════════════════════════════');
  console.log('   👨‍🏫 ASIGNAR DOCENTE AL GRUPO');
  console.log('═══════════════════════════════════════════════════\n');

  try {
    // Buscar docente
    const teacher = await prisma.teacher.findFirst({
      where: { email: 'luzangela.hdzr@gmail.com' },
    });

    if (!teacher) {
      console.log('❌ Docente no encontrado');
      return;
    }

    console.log('✓ Docente encontrado:', teacher.email);
    console.log('  ID:', teacher.id);

    // Buscar grupo CONTADOR
    const group = await prisma.group.findFirst({
      where: { code: 'CP301' },
      include: {
        course: true,
      },
    });

    if (!group) {
      console.log('\n❌ Grupo CONTADOR no encontrado');
      return;
    }

    console.log('\n✓ Grupo encontrado:', group.name);
    console.log('  Código:', group.code);
    console.log('  Carrera:', group.course.name);

    // Asignar docente al grupo
    const updated = await prisma.group.update({
      where: { id: group.id },
      data: { teacherId: teacher.id },
    });

    console.log('\n✓ Docente asignado al grupo exitosamente!');
    console.log('  Grupo:', updated.name);
    console.log('  Teacher ID:', updated.teacherId);

    console.log('\n═══════════════════════════════════════════════════');
    console.log('   ✅ ASIGNACIÓN COMPLETA');
    console.log('═══════════════════════════════════════════════════\n');

    console.log('AHORA PRUEBA:');
    console.log('  1. Cierra el navegador completamente');
    console.log('  2. Abre una nueva ventana');
    console.log('  3. Ve a http://localhost:3000/login');
    console.log('  4. Inicia sesión con:');
    console.log('     Email: luzangela.hdzr@gmail.com');
    console.log('     Password: password123');
    console.log('  5. Serás redirigido a /teacher/dashboard');
    console.log('  6. Deberías ver el grupo CONTADOR!\n');

    console.log('═══════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();


