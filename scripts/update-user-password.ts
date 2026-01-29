import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../lib/auth-utils';

const prisma = new PrismaClient();

async function updateUserPassword() {
  try {
    // Buscar el usuario
    const user = await prisma.user.findUnique({
      where: { email: 'luzangela.hdzr@gmail.com' },
      include: {
        teacher: true,
      },
    });

    if (!user) {
      console.log('❌ Usuario no encontrado');
      return;
    }

    console.log('\n📋 Estado actual del usuario:');
    console.log('   Email:', user.email);
    console.log('   Rol:', user.role);
    console.log('   Activo:', user.isActive ? '✓ Sí' : '✗ No');
    if (user.teacher) {
      console.log('   Nombre:', `${user.teacher.firstName} ${user.teacher.lastName}`);
    }

    // Actualizar contraseña y activar usuario
    const hashedPassword = await hashPassword('Netbios85*');

    await prisma.user.update({
      where: { email: 'luzangela.hdzr@gmail.com' },
      data: {
        password: hashedPassword,
        isActive: true,
      },
    });

    console.log('\n================================================');
    console.log('✓ Usuario actualizado exitosamente!');
    console.log('================================================');
    console.log('\nNuevas credenciales:');
    console.log('Email: luzangela.hdzr@gmail.com');
    console.log('Contraseña: Netbios85*');
    console.log('Estado: Activo ✓');
    console.log('\n⚠️  Asegúrate de escribir la contraseña exactamente:');
    console.log('    N mayúscula, etbios minúsculas, 85, asterisco (*)');
    console.log('================================================\n');

  } catch (error) {
    console.error('Error actualizando usuario:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

updateUserPassword();


