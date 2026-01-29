import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PulseTecLogo, PulseTecIcon } from './pulsetec-logo';

interface PulseTecCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  showLogo?: boolean;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Card siguiendo el estilo de PulseTec Control
 * - Fondo blanco con bordes redondeados y sombra suave
 * - Isotipo PulseTec en esquina superior
 * - Título en Inter Medium #0F172A
 * - Porcentaje/valor principal en grande y negrita #0F172A
 */
export function PulseTecCard({
  title,
  value,
  subtitle,
  icon: Icon,
  showLogo = false,
  className,
  children,
}: PulseTecCardProps) {
  return (
    <div className={cn('card group relative overflow-hidden', className)}>
      {/* Isotipo PulseTec en esquina superior derecha */}
      {showLogo && (
        <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-30 transition-opacity">
          <PulseTecLogo size="sm" />
        </div>
      )}
      
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-dark mb-2">{title}</h3>
          <p className="text-4xl font-bold text-dark group-hover:text-primary transition-colors">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray mt-2 font-regular">{subtitle}</p>
          )}
        </div>
        
        {Icon && (
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shadow-md">
            <Icon className="w-6 h-6 text-primary" />
          </div>
        )}
      </div>
      
      {children}
    </div>
  );
}

/**
 * Card de Asistencia - Estilo específico PulseTec
 * Muestra porcentaje de asistencia con el isotipo
 */
interface AttendanceCardProps {
  percentage: number;
  title?: string;
  totalStudents?: number;
  presentStudents?: number;
}

export function AttendanceCard({
  percentage,
  title = "Resumen de Asistencia",
  totalStudents,
  presentStudents,
}: AttendanceCardProps) {
  return (
    <div className="card group relative overflow-hidden">
      {/* Isotipo en esquina superior derecha */}
      <div className="absolute top-4 right-4 opacity-15 group-hover:opacity-25 transition-opacity">
        <PulseTecLogo size="md" />
      </div>
      
      {/* Contenido */}
      <div className="relative z-10">
        <h3 className="text-sm font-medium text-dark mb-4">{title}</h3>
        
        {/* Porcentaje principal */}
        <div className="mb-4">
          <p className="text-5xl font-bold text-dark">{percentage}%</p>
          <p className="text-xs text-gray mt-1 font-regular">de asistencia total</p>
        </div>
        
        {/* Detalles adicionales */}
        {totalStudents && presentStudents && (
          <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
            <div>
              <p className="text-xs text-gray font-regular">Presentes</p>
              <p className="text-lg font-bold text-primary">{presentStudents}</p>
            </div>
            <div>
              <p className="text-xs text-gray font-regular">Total</p>
              <p className="text-lg font-medium text-dark">{totalStudents}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

