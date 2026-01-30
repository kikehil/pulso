import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error('Por favor proporciona un email');
    process.exit(1);
  }

  console.log(`🔍 Buscando usuario y estudiante para: ${email}`);

  const user = await prisma.user.findUnique({
    where: { email },
    include: { student: true }
  });

  if (!user) {
    console.error('❌ Usuario no encontrado en la tabla users');
    return;
  }

  console.log(`✓ Usuario encontrado: ID=${user.id}, Role=${user.role}, StudentID=${user.studentId}`);

  const student = await prisma.student.findFirst({
    where: { email }
  });

  if (!student) {
    console.error('❌ No se encontró un registro en la tabla students con ese email');
    return;
  }

  console.log(`✓ Estudiante encontrado: ID=${student.id}, Nombre=${student.firstName} ${student.lastName}`);

  if (user.studentId === student.id) {
    console.log('✅ El usuario ya está correctamente vinculado al estudiante');
    return;
  }

  console.log('🔄 Vinculando usuario con estudiante...');
  await prisma.user.update({
    where: { id: user.id },
    data: { studentId: student.id }
  });

  console.log('✅ Vinculación completada exitosamente');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

