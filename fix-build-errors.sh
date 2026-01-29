#!/bin/bash

# Script para corregir errores de build
# Ejecutar en el VPS antes de npm run build

echo ""
echo "================================================================"
echo "  CORRIGIENDO ERRORES DE BUILD"
echo "================================================================"
echo ""

PROJECT_DIR="/var/www/html/pulso"
cd $PROJECT_DIR

# 1. Agregar función faltante en lib/types.ts
echo "[1/2] Agregando getAttendanceLevel a lib/types.ts..."

# Buscar la última línea del archivo y agregar la función
cat >> lib/types.ts << 'EOF'

// Obtener nivel de asistencia basado en porcentaje
export const getAttendanceLevel = (percent: number): {
  level: 'excellent' | 'good' | 'warning' | 'danger';
  label: string;
  color: string;
} => {
  if (percent >= 90) {
    return { level: 'excellent', label: 'Excelente', color: 'text-green-600' };
  }
  if (percent >= 80) {
    return { level: 'good', label: 'Bueno', color: 'text-cyan-600' };
  }
  if (percent >= 70) {
    return { level: 'warning', label: 'Regular', color: 'text-yellow-600' };
  }
  return { level: 'danger', label: 'Bajo', color: 'text-red-600' };
};
EOF

echo "✓ Función getAttendanceLevel agregada"

# 2. Corregir referencias a prisma.attendance en app/docente/actions.ts
echo ""
echo "[2/2] Corrigiendo referencias a modelo Attendance..."

# Reemplazar prisma.attendance por prisma.attendanceRecord
sed -i 's/prisma\.attendance/prisma.attendanceRecord/g' app/docente/actions.ts

# También corregir el unique constraint que usa un nombre incorrecto
sed -i 's/studentId_subjectId_date/studentId_date/g' app/docente/actions.ts

echo "✓ Referencias corregidas"

echo ""
echo "================================================================"
echo "  CORRECCIONES APLICADAS"
echo "================================================================"
echo ""
echo "Se han corregido:"
echo "  1. Función getAttendanceLevel agregada a lib/types.ts"
echo "  2. prisma.attendance -> prisma.attendanceRecord en actions.ts"
echo ""
echo "Ahora puedes ejecutar:"
echo "  npm run build"
echo ""
echo "================================================================"

