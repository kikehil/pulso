import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n═══════════════════════════════════════════════════');
  console.log('   🔍 VERIFICAR SESIÓN Y TEACHERID');
  console.log('═══════════════════════════════════════════════════\n');

  try {
    const user = await prisma.user.findFirst({
      where: { email: 'luzangela.hdzr@gmail.com' },
      include: {
        teacher: true,
      },
    });

    if (!user) {
      console.log('❌ Usuario no encontrado');
      return;
    }

    console.log('✓ USUARIO ENCONTRADO');
    console.log('  Email:', user.email);
    console.log('  Role:', user.role);
    console.log('  Active:', user.isActive);
    console.log('  Teacher ID en User:', user.teacherId);
    console.log('  Tiene perfil Teacher:', user.teacher ? 'SÍ' : 'NO');

    if (user.teacherId && !user.teacher) {
      console.log('\n⚠️ PROBLEMA: teacherId existe pero no hay relación');
      console.log('   Esto puede causar que la sesión no cargue correctamente');
    }

    if (!user.teacherId && user.teacher) {
      console.log('\n❌ PROBLEMA: Hay perfil Teacher pero no está vinculado en User');
      console.log('   Teacher ID del perfil:', user.teacher.id);
      console.log('\n💡 SOLUCIÓN: Actualizar el campo teacherId en User');
      
      await prisma.user.update({
        where: { id: user.id },
        data: { teacherId: user.teacher.id },
      });
      
      console.log('✓ Campo teacherId actualizado');
    }

    if (user.teacherId && user.teacher) {
      console.log('\n✓ TODO CORRECTO');
      console.log('  El usuario tiene teacherId y perfil vinculados');
      
      // Verificar materias
      const teacherSubjects = await prisma.teacherSubject.findMany({
        where: { teacherId: user.teacherId },
        include: {
          subject: {
            select: { name: true, code: true },
          },
        },
      });
      
      console.log('\n📖 MATERIAS ASIGNADAS:');
      if (teacherSubjects.length === 0) {
        console.log('  ⚠️ No hay materias asignadas');
      } else {
        teacherSubjects.forEach((ts) => {
          console.log(`  ✓ ${ts.subject.name} (${ts.subject.code})`);
        });
      }
    }

    console.log('\n═══════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();


