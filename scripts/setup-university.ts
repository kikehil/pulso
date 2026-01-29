import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const universityId = process.env.DEFAULT_UNIVERSITY_ID || 'universidad-demo';

  // Verificar si existe
  const existing = await prisma.university.findUnique({
    where: { id: universityId },
  });

  if (existing) {
    console.log('✅ Universidad ya existe:', existing.name);
    return;
  }

  // Crear universidad
  const university = await prisma.university.create({
    data: {
      id: universityId,
      name: 'Universidad Demo',
      slug: 'universidad-demo',
      domain: 'demo.universidad.edu',
    },
  });

  console.log('✅ Universidad creada:', university.name);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

