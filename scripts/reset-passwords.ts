import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../lib/auth-utils';

const prisma = new PrismaClient();

async function main() {
  console.log('\n═══════════════════════════════════════════════════');
  console.log('   🔐 RESETEAR CONTRASEÑAS DE USUARIOS');
  console.log('═══════════════════════════════════════════════════\n');

  try {
    // Resetear contraseña del admin
    const adminPassword = await hashPassword('admin123');
    const admin = await prisma.user.update({
      where: { email: 'admin@universidad.edu' },
      data: { 
        password: adminPassword,
        isActive: true,
      },
    });
    console.log('✓ Admin actualizado');
    console.log(`  Email: ${admin.email}`);
    console.log('  Password: admin123');

    // Resetear contraseña de luzangela
    const luzPassword = await hashPassword('password123');
    const luz = await prisma.user.update({
      where: { email: 'luzangela.hdzr@gmail.com' },
      data: { 
        password: luzPassword,
        isActive: true,
      },
    });
    console.log('\n✓ Docente actualizado');
    console.log(`  Email: ${luz.email}`);
    console.log('  Password: password123');

    // Resetear contraseña del otro docente
    const docentePassword = await hashPassword('docente123');
    const docente = await prisma.user.update({
      where: { email: 'docente@universidad.edu' },
      data: { 
        password: docentePassword,
        isActive: true,
      },
    });
    console.log('\n✓ Docente 2 actualizado');
    console.log(`  Email: ${docente.email}`);
    console.log('  Password: docente123');

    console.log('\n═══════════════════════════════════════════════════');
    console.log('   ✅ CONTRASEÑAS RESETEADAS EXITOSAMENTE');
    console.log('═══════════════════════════════════════════════════\n');

    console.log('CREDENCIALES PARA INICIAR SESIÓN:\n');
    console.log('1. ADMIN:');
    console.log('   Email: admin@universidad.edu');
    console.log('   Password: admin123\n');
    
    console.log('2. DOCENTE (Luz Angela):');
    console.log('   Email: luzangela.hdzr@gmail.com');
    console.log('   Password: password123\n');
    
    console.log('3. DOCENTE (Demo):');
    console.log('   Email: docente@universidad.edu');
    console.log('   Password: docente123\n');

    console.log('═══════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();


