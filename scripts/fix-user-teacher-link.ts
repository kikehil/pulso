import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixUserTeacherLink() {
  try {
    // Buscar el usuario
    const user = await prisma.user.findUnique({
      where: { email: 'luzangela.hdzr@gmail.com' },
    });

    if (!user) {
      console.log('❌ Usuario no encontrado');
      return;
    }

    // Buscar si ya existe un teacher con ese email
    let teacher = await prisma.teacher.findFirst({
      where: { email: 'luzangela.hdzr@gmail.com' },
      include: {
        teacherSubjects: {
          include: {
            subject: true,
          },
        },
      },
    });

    if (!teacher) {
      // Crear el perfil de teacher
      console.log('Creando perfil de docente...');
      teacher = await prisma.teacher.create({
        data: {
          universityId: user.universityId,
          email: user.email,
          firstName: 'Luz Angela',
          lastName: 'Hernández',
          phone: '555-0103',
        },
        include: {
          teacherSubjects: {
            include: {
              subject: true,
            },
          },
        },
      });
      console.log('✓ Perfil de docente creado');
    } else {
      console.log('✓ Perfil de docente ya existe');
    }

    // Vincular el user con el teacher
    await prisma.user.update({
      where: { id: user.id },
      data: {
        teacherId: teacher.id,
      },
    });

    console.log('\n================================================================');
    console.log('           VINCULACION COMPLETADA');
    console.log('================================================================\n');
    console.log('Usuario:', user.email);
    console.log('Teacher ID:', teacher.id);
    console.log('Nombre:', `${teacher.firstName} ${teacher.lastName}`);
    console.log('\nMaterias asignadas:', teacher.teacherSubjects.length);
    
    if (teacher.teacherSubjects.length > 0) {
      teacher.teacherSubjects.forEach((ts, index) => {
        console.log(`  ${index + 1}. ${ts.subject.name} (${ts.subject.code})`);
      });
    }

    console.log('\n✓ Ahora puedes acceder al Portal del Docente!');
    console.log('================================================================\n');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixUserTeacherLink();


