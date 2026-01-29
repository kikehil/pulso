import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../lib/auth-utils';

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    // Verificar si la universidad existe
    let university = await prisma.university.findUnique({
      where: { id: 'universidad-demo' },
    });

    if (!university) {
      console.log('Creando universidad demo...');
      university = await prisma.university.create({
        data: {
          id: 'universidad-demo',
          name: 'Universidad Demo',
          slug: 'universidad-demo',
          domain: 'demo.universidad.edu',
        },
      });
      console.log('✓ Universidad creada');
    }

    // Verificar si ya existe el admin
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@tecnologico.edu.mx' },
    });

    if (existingAdmin) {
      console.log('El usuario admin ya existe');
      console.log('Email: admin@tecnologico.edu.mx');
      console.log('Contraseña: Admin123!');
      return;
    }

    // Crear usuario admin
    const hashedPassword = await hashPassword('Admin123!');

    const admin = await prisma.user.create({
      data: {
        email: 'admin@tecnologico.edu.mx',
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true,
        universityId: university.id,
      },
    });

    console.log('\n================================================');
    console.log('✓ Usuario Administrador creado exitosamente!');
    console.log('================================================');
    console.log('\nCredenciales de acceso:');
    console.log('Email: admin@tecnologico.edu.mx');
    console.log('Contraseña: Admin123!');
    console.log('\n⚠️  IMPORTANTE: Cambia la contraseña después del primer login!');
    console.log('================================================\n');

    // Crear un docente de prueba
    const teacherHashedPassword = await hashPassword('Docente123!');

    const teacher = await prisma.teacher.create({
      data: {
        universityId: university.id,
        email: 'docente@tecnologico.edu.mx',
        firstName: 'Carlos',
        lastName: 'Rodríguez',
        phone: '555-0101',
      },
    });

    const docenteUser = await prisma.user.create({
      data: {
        email: 'docente@tecnologico.edu.mx',
        password: teacherHashedPassword,
        role: 'DOCENTE',
        isActive: true,
        universityId: university.id,
        teacherId: teacher.id,
      },
    });

    console.log('✓ Usuario Docente de prueba creado!');
    console.log('Email: docente@tecnologico.edu.mx');
    console.log('Contraseña: Docente123!\n');

  } catch (error) {
    console.error('Error creando usuario admin:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();


