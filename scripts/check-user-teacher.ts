import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUser() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'luzangela.hdzr@gmail.com' },
      include: {
        teacher: {
          include: {
            teacherSubjects: {
              include: {
                subject: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      console.log('❌ Usuario no encontrado');
      return;
    }

    console.log('\n================================================================');
    console.log('           INFORMACION DEL USUARIO');
    console.log('================================================================\n');
    console.log('Email:', user.email);
    console.log('Rol:', user.role);
    console.log('Activo:', user.isActive ? '✓ Sí' : '✗ No');
    console.log('Teacher ID:', user.teacherId || '❌ NO TIENE');

    if (user.teacher) {
      console.log('\n--- PERFIL DE DOCENTE ---');
      console.log('ID:', user.teacher.id);
      console.log('Nombre:', `${user.teacher.firstName} ${user.teacher.lastName}`);
      console.log('Email:', user.teacher.email);
      
      console.log('\n--- MATERIAS ASIGNADAS ---');
      if (user.teacher.teacherSubjects.length === 0) {
        console.log('❌ No tiene materias asignadas');
      } else {
        user.teacher.teacherSubjects.forEach((ts, index) => {
          console.log(`${index + 1}. ${ts.subject.name} (${ts.subject.code})`);
        });
      }
    } else {
      console.log('\n❌ NO TIENE PERFIL DE DOCENTE VINCULADO');
    }

    console.log('\n================================================================\n');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();


