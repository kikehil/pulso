console.log('\n═══════════════════════════════════════════════════');
console.log('   🔍 VERIFICAR VARIABLES DE ENTORNO');
console.log('═══════════════════════════════════════════════════\n');

console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✓ Definida' : '❌ NO definida');
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL || '❌ NO definida');
console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? '✓ Definida' : '❌ NO definida');

if (!process.env.NEXTAUTH_SECRET) {
  console.log('\n❌ PROBLEMA: NEXTAUTH_SECRET no está definida');
  console.log('\n💡 SOLUCIÓN:');
  console.log('Agrega esta línea al archivo .env:');
  console.log('NEXTAUTH_SECRET=tu-secreto-muy-seguro-y-aleatorio-aqui\n');
}

console.log('\n═══════════════════════════════════════════════════\n');

