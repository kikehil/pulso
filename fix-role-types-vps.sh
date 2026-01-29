#!/bin/bash

# Script para corregir tipos Role en el VPS
# Ejecutar directamente en el VPS

cd /var/www/html/pulso

echo "Corrigiendo tipos Role en app/dashboard/usuarios/actions.ts..."

# Crear backup
cp app/dashboard/usuarios/actions.ts app/dashboard/usuarios/actions.ts.backup

# Reemplazar return users; en getUsers() (línea ~60)
sed -i '60s/return users;/return users.map((user) => ({\n    ...user,\n    role: user.role as Role,\n  })) as UserWithProfile[];/' app/dashboard/usuarios/actions.ts

# Reemplazar return users; en searchUsers() (línea ~306)
sed -i '306s/return users;/return users.map((user) => ({\n    ...user,\n    role: user.role as Role,\n  })) as UserWithProfile[];/' app/dashboard/usuarios/actions.ts

# Mejor solución: usar un script de Python o Node para hacer el reemplazo correcto
# Por ahora, edición manual es más segura

echo "✓ Backup creado: app/dashboard/usuarios/actions.ts.backup"
echo ""
echo "IMPORTANTE: El reemplazo con sed puede no funcionar bien con multilínea."
echo "Es mejor editar manualmente con nano."
echo ""
echo "Edita el archivo:"
echo "  nano app/dashboard/usuarios/actions.ts"
echo ""
echo "Busca 'return users;' (2 veces) y reemplaza con:"
echo "  return users.map((user) => ({"
echo "    ...user,"
echo "    role: user.role as Role,"
echo "  })) as UserWithProfile[];"

