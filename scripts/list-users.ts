import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listUsers() {
  try {
    const users = await prisma.user.findMany({
      include: {
        teacher: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        student: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        university: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log('\n================================================================');
    console.log('                    USUARIOS REGISTRADOS');
    console.log('================================================================\n');

    if (users.length === 0) {
      console.log('No hay usuarios registrados en el sistema.\n');
      return;
    }

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`);
      console.log(`   Rol: ${user.role}`);
      console.log(`   Estado: ${user.isActive ? '✓ Activo' : '✗ Inactivo'}`);
      console.log(`   Universidad: ${user.university.name}`);
      
      if (user.teacher) {
        console.log(`   Perfil: ${user.teacher.firstName} ${user.teacher.lastName} (Docente)`);
      } else if (user.student) {
        console.log(`   Perfil: ${user.student.firstName} ${user.student.lastName} (Alumno)`);
      }
      
      console.log(`   Creado: ${user.createdAt.toLocaleString('es-MX')}`);
      console.log('   ---');
    });

    console.log(`\nTotal de usuarios: ${users.length}`);
    console.log('================================================================\n');

  } catch (error) {
    console.error('Error al listar usuarios:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listUsers();


