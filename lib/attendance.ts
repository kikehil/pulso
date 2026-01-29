// Algoritmo del Pulso - Cálculo de Asistencia
// Fórmula: (Presentes + (Retardos * 0.5) + (Justificados * 0.8)) / Total * 100

export interface AttendanceStats {
  totalStudents: number;
  presentCount: number;
  lateCount: number;
  absentCount: number;
  justifiedCount: number;
  attendancePercent: number;
}

/**
 * Calcula el porcentaje de asistencia según el Algoritmo del Pulso
 * 
 * @param present - Número de alumnos presentes (valor completo: 1.0)
 * @param late - Número de alumnos con retardo (valor parcial: 0.5)
 * @param absent - Número de alumnos ausentes (sin valor: 0.0)
 * @param justified - Número de faltas justificadas (valor parcial: 0.8)
 * @param total - Total de alumnos inscritos
 * @returns Porcentaje de asistencia (0-100)
 */
export function calculateAttendancePercent(
  present: number,
  late: number,
  absent: number,
  justified: number,
  total: number
): number {
  if (total === 0) return 0;

  // Fórmula del Pulso
  const effectiveAttendance = present + (late * 0.5) + (justified * 0.8);
  const percent = (effectiveAttendance / total) * 100;

  // Redondear a 2 decimales
  return Math.round(percent * 100) / 100;
}

/**
 * Calcula estadísticas completas de asistencia
 * 
 * @param records - Array de registros de asistencia con status
 * @param totalStudents - Total de estudiantes inscritos
 * @returns Objeto con estadísticas completas
 */
export function calculateAttendanceStats(
  records: Array<{ status: string }>,
  totalStudents: number
): AttendanceStats {
  const presentCount = records.filter((r) => r.status === 'PRESENTE').length;
  const lateCount = records.filter((r) => r.status === 'RETARDO').length;
  const absentCount = records.filter((r) => r.status === 'FALTA').length;
  const justifiedCount = records.filter((r) => r.status === 'JUSTIFICADO').length;

  const attendancePercent = calculateAttendancePercent(
    presentCount,
    lateCount,
    absentCount,
    justifiedCount,
    totalStudents
  );

  return {
    totalStudents,
    presentCount,
    lateCount,
    absentCount,
    justifiedCount,
    attendancePercent,
  };
}

/**
 * Obtiene el nivel de asistencia según el porcentaje
 */
export function getAttendanceLevel(percent: number): {
  label: string;
  color: string;
  emoji: string;
} {
  if (percent >= 95) return { label: 'Excelente', color: '#0F172A', emoji: '🌟' };
  if (percent >= 90) return { label: 'Muy Bueno', color: '#06B6D4', emoji: '✅' };
  if (percent >= 80) return { label: 'Bueno', color: '#06B6D4', emoji: '👍' };
  if (percent >= 70) return { label: 'Regular', color: '#F59E0B', emoji: '⚠️' };
  if (percent >= 60) return { label: 'Bajo', color: '#EF4444', emoji: '⚠️' };
  return { label: 'Crítico', color: '#DC2626', emoji: '🚨' };
}


