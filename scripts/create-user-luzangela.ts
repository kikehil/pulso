import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../lib/auth-utils';

const prisma = new PrismaClient();

async function createUser() {
  try {
    // Verificar si la universidad existe
    const university = await prisma.university.findUnique({
      where: { id: 'universidad-demo' },
    });

    if (!university) {
      throw new Error('Universidad no encontrada');
    }

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: 'luzangela.hdzr@gmail.com' },
    });

    if (existingUser) {
      console.log('El usuario ya existe');
      console.log('Email: luzangela.hdzr@gmail.com');
      return;
    }

    // Crear docente
    const teacher = await prisma.teacher.create({
      data: {
        universityId: university.id,
        email: 'luzangela.hdzr@gmail.com',
        firstName: 'Luz Angela',
        lastName: 'Hernández',
        phone: '555-0102',
      },
    });

    // Crear usuario con contraseña "Netbios85*"
    const hashedPassword = await hashPassword('Netbios85*');

    const user = await prisma.user.create({
      data: {
        email: 'luzangela.hdzr@gmail.com',
        password: hashedPassword,
        role: 'DOCENTE',
        isActive: true,
        universityId: university.id,
        teacherId: teacher.id,
      },
    });

    console.log('\n================================================');
    console.log('✓ Usuario creado exitosamente!');
    console.log('================================================');
    console.log('\nCredenciales de acceso:');
    console.log('Email: luzangela.hdzr@gmail.com');
    console.log('Contraseña: Netbios85*');
    console.log('Rol: DOCENTE');
    console.log('\n================================================\n');

  } catch (error) {
    console.error('Error creando usuario:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createUser();


