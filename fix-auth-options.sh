#!/bin/bash

# Script para corregir error de authOptions
# Ejecutar en el VPS

cd /var/www/html/pulso

echo "Corrigiendo app/student/assignments/actions.ts..."

# Eliminar importaciones problemáticas
sed -i "/import { getServerSession } from 'next-auth';/d" app/student/assignments/actions.ts
sed -i "/import { authOptions } from '@\/app\/api\/auth\/\[\.\.\.nextauth\]\/route';/d" app/student/assignments/actions.ts

# Eliminar la función getCurrentStudentId local (líneas 10-20 aproximadamente)
sed -i '/^async function getCurrentStudentId() {/,/^}$/d' app/student/assignments/actions.ts

# Verificar que getCurrentStudentId esté importado desde lib/tenant
if ! grep -q "getCurrentStudentId.*from '@/lib/tenant'" app/student/assignments/actions.ts; then
    # Agregar import si no existe
    sed -i "/import { getCurrentUniversityId } from '@\/lib\/tenant';/s/from '@\/lib\/tenant';/from '@\/lib\/tenant';\nimport { getCurrentStudentId } from '@\/lib\/tenant';/" app/student/assignments/actions.ts
    # O mejor, reemplazar la línea completa
    sed -i "s/import { getCurrentUniversityId } from '@\/lib\/tenant';/import { getCurrentUniversityId, getCurrentStudentId } from '@\/lib\/tenant';/" app/student/assignments/actions.ts
fi

echo "✓ Archivo corregido"
echo ""
echo "Ahora ejecuta: npm run build"

