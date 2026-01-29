import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n═══════════════════════════════════════════════════');
  console.log('   👥 VERIFICAR USUARIOS Y ROLES');
  console.log('═══════════════════════════════════════════════════\n');

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        teacherId: true,
        studentId: true,
      },
    });

    console.log(`📋 USUARIOS REGISTRADOS (${users.length}):\n`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Active: ${user.isActive}`);
      console.log(`   Teacher ID: ${user.teacherId || 'N/A'}`);
      console.log(`   Student ID: ${user.studentId || 'N/A'}\n`);
    });

    const hasAdmin = users.some(u => u.role === 'ADMIN');
    
    if (!hasAdmin) {
      console.log('⚠️ NO HAY USUARIOS CON ROL ADMIN\n');
      console.log('💡 SOLUCIÓN:');
      console.log('   Ejecuta: npx tsx scripts/create-admin-user.ts\n');
    } else {
      console.log('✓ Hay al menos un usuario ADMIN\n');
    }

    console.log('═══════════════════════════════════════════════════');
    console.log('   NOTA IMPORTANTE');
    console.log('═══════════════════════════════════════════════════\n');
    console.log('Para acceder al módulo de USUARIOS necesitas:');
    console.log('  - Rol: ADMIN');
    console.log('  - El middleware protege esta ruta\n');
    console.log('Usuario actual (luzangela.hdzr@gmail.com):');
    const currentUser = users.find(u => u.email === 'luzangela.hdzr@gmail.com');
    if (currentUser) {
      console.log(`  - Role actual: ${currentUser.role}`);
      if (currentUser.role !== 'ADMIN') {
        console.log('  - ❌ No puede acceder a /dashboard/usuarios');
        console.log('  - 💡 Necesitas iniciar sesión como ADMIN\n');
      } else {
        console.log('  - ✓ Puede acceder a /dashboard/usuarios\n');
      }
    }
    
    console.log('═══════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();


