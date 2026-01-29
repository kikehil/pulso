'use client';

import { PulseTecIcon } from './pulsetec-logo';
import { getAttendancePercentColor, getAttendanceLevel } from '@/lib/types';

interface AttendanceSummaryCardProps {
  percentage: number;
  totalStudents: number;
  presentStudents: number;
  lateStudents?: number;
  date?: Date;
  showDetails?: boolean;
}

/**
 * Card de Resumen de Asistencia - Diseño PulseTec
 * Muestra el porcentaje de asistencia con el isotipo y estadísticas
 */
export function AttendanceSummaryCard({
  percentage,
  totalStudents,
  presentStudents,
  lateStudents = 0,
  date = new Date(),
  showDetails = true,
}: AttendanceSummaryCardProps) {
  const percentColor = getAttendancePercentColor(percentage);
  const level = getAttendanceLevel(percentage);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'short',
    }).format(date);
  };

  return (
    <div className="card relative overflow-hidden">
      {/* Isotipo PulseTec en la esquina */}
      <div className="absolute top-4 left-4 opacity-10">
        <PulseTecIcon className="w-16 h-16" />
      </div>

      {/* Contenido */}
      <div className="relative z-10">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <PulseTecIcon className="w-6 h-6 text-primary" />
            <h3 className="text-sm font-bold text-dark">
              Resumen de Asistencia
            </h3>
          </div>
          <p className="text-xs text-gray">
            Hoy, {formatDate(date)}
          </p>
        </div>

        {/* Porcentaje Principal */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span
              className="text-6xl font-bold transition-colors duration-300"
              style={{ color: percentColor }}
            >
              {percentage.toFixed(1)}%
            </span>
          </div>
          <p
            className="text-sm font-medium mt-1"
            style={{ color: percentColor }}
          >
            {level.label}
          </p>
        </div>

        {/* Detalles */}
        {showDetails && (
          <div className="pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray text-xs">Presentes</p>
                <p className="font-bold text-dark">
                  {presentStudents}{lateStudents > 0 && ` + ${lateStudents}`}
                </p>
              </div>
              <div>
                <p className="text-gray text-xs">Total</p>
                <p className="font-bold text-dark">{totalStudents}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Barra de progreso visual */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
        <div
          className="h-full transition-all duration-500 ease-out"
          style={{
            width: `${Math.min(percentage, 100)}%`,
            backgroundColor: percentColor,
          }}
        />
      </div>
    </div>
  );
}


