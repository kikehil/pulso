// Tipos y constantes compartidos

// Roles del sistema (SQLite no soporta enums nativos)
export const ROLES = {
  ADMIN: 'ADMIN',
  DOCENTE: 'DOCENTE',
  ALUMNO: 'ALUMNO',
  COORDINADOR: 'COORDINADOR',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

// Validar si un string es un rol válido
export const isValidRole = (role: string): role is Role => {
  return Object.values(ROLES).includes(role as Role);
};

// Obtener nombre legible del rol
export const getRoleName = (role: Role): string => {
  switch (role) {
    case ROLES.ADMIN:
      return 'Administrador';
    case ROLES.COORDINADOR:
      return 'Coordinador';
    case ROLES.DOCENTE:
      return 'Docente';
    case ROLES.ALUMNO:
      return 'Alumno';
    default:
      return 'Desconocido';
  }
};

// Estados de asistencia
export const ATTENDANCE_STATUS = {
  PRESENTE: 'PRESENTE',
  RETARDO: 'RETARDO',
  FALTA: 'FALTA',
  JUSTIFICADO: 'JUSTIFICADO',
} as const;

export type AttendanceStatus = typeof ATTENDANCE_STATUS[keyof typeof ATTENDANCE_STATUS];

// Obtener nombre legible del estado de asistencia
export const getAttendanceStatusName = (status: AttendanceStatus): string => {
  switch (status) {
    case ATTENDANCE_STATUS.PRESENTE:
      return 'Presente';
    case ATTENDANCE_STATUS.RETARDO:
      return 'Retardo';
    case ATTENDANCE_STATUS.FALTA:
      return 'Falta';
    case ATTENDANCE_STATUS.JUSTIFICADO:
      return 'Justificado';
    default:
      return 'Desconocido';
  }
};

// Obtener color del estado de asistencia
export const getAttendanceStatusColor = (status: AttendanceStatus): {
  bg: string;
  text: string;
  border: string;
  fill: string;
} => {
  switch (status) {
    case ATTENDANCE_STATUS.PRESENTE:
      return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300', fill: '#06B6D4' };
    case ATTENDANCE_STATUS.RETARDO:
      return { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300', fill: '#F59E0B' };
    case ATTENDANCE_STATUS.FALTA:
      return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300', fill: '#EF4444' };
    case ATTENDANCE_STATUS.JUSTIFICADO:
      return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300', fill: '#3B82F6' };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300', fill: '#9CA3AF' };
  }
};

// Obtener color del porcentaje de asistencia
export const getAttendancePercentColor = (percent: number): string => {
  if (percent >= 90) return '#0F172A'; // Midnight Blue - Excelente
  if (percent >= 80) return '#06B6D4'; // Cyan - Bueno
  if (percent >= 70) return '#F59E0B'; // Amarillo - Regular
  return '#EF4444'; // Rojo - Bajo
};

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

