'use client';

import { useState } from 'react';
import { Clock, MapPin, Edit2, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Schedule {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  classroom: string | null;
  subject: {
    id: string;
    name: string;
    code: string;
  };
  group: {
    id: string;
    name: string;
    code: string;
  };
}

interface CalendarWeekViewProps {
  schedules: Schedule[];
  isEditMode: boolean;
  onAddClass: (dayOfWeek: number, time: string) => void;
  onEditClass: (schedule: Schedule) => void;
  onDeleteClass: (scheduleId: string) => void;
}

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const HOURS = Array.from({ length: 10 }, (_, i) => i + 8); // 8:00 AM a 6:00 PM (más compacto)

export function CalendarWeekView({
  schedules,
  isEditMode,
  onAddClass,
  onEditClass,
  onDeleteClass,
}: CalendarWeekViewProps) {
  const router = useRouter();
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);

  // Función para verificar si hay una clase en un slot específico
  const getClassAtSlot = (day: number, hour: number) => {
    return schedules.find((schedule) => {
      if (schedule.dayOfWeek !== day) return false;
      
      const startHour = parseInt(schedule.startTime.split(':')[0]);
      const endHour = parseInt(schedule.endTime.split(':')[0]);
      
      return hour >= startHour && hour < endHour;
    });
  };

  // Función para verificar si es el bloque inicial de la clase
  const isStartBlock = (schedule: Schedule, hour: number) => {
    const startHour = parseInt(schedule.startTime.split(':')[0]);
    return hour === startHour;
  };

  // Función para calcular el número de horas que ocupa una clase
  const getClassSpan = (schedule: Schedule) => {
    const startHour = parseInt(schedule.startTime.split(':')[0]);
    const endHour = parseInt(schedule.endTime.split(':')[0]);
    return endHour - startHour;
  };

  // Verificar si una clase está en curso
  const isCurrentClass = (schedule: Schedule) => {
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    return (
      schedule.dayOfWeek === currentDay &&
      currentTime >= schedule.startTime &&
      currentTime <= schedule.endTime
    );
  };

  const handleCellClick = (day: number, hour: number) => {
    const classAtSlot = getClassAtSlot(day, hour);
    
    if (classAtSlot) {
      if (isEditMode) {
        onEditClass(classAtSlot);
      } else {
        // Navegar a la vista de pasar lista
        router.push(`/teacher/class/${classAtSlot.group.id}?tab=attendance`);
      }
    } else if (isEditMode) {
      onAddClass(day, `${hour.toString().padStart(2, '0')}:00`);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Grid del Calendario */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Header: Días de la semana */}
          <div className="grid grid-cols-8 border-b border-slate-200 bg-slate-50">
            <div className="p-2 text-xs font-semibold text-slate-600">Hora</div>
            {DAYS.slice(1, 6).map((day) => ( // Lunes a Viernes
              <div key={day} className="p-2 text-center">
                <div className="text-xs font-bold text-slate-900">{day}</div>
              </div>
            ))}
          </div>

          {/* Body: Horas y clases */}
          <div className="grid grid-cols-8">
            {HOURS.map((hour) => (
              <div key={hour} className="contents">
                {/* Columna de hora */}
                <div className="border-r border-slate-200 p-2 text-xs text-slate-600 font-medium bg-slate-50 flex items-center">
                  {hour.toString().padStart(2, '0')}:00
                </div>

                {/* Celdas para cada día (Lunes a Viernes) */}
                {[1, 2, 3, 4, 5].map((day) => {
                  const classAtSlot = getClassAtSlot(day, hour);
                  const cellKey = `${day}-${hour}`;
                  const isHovered = hoveredCell === cellKey;

                  // Si hay una clase y es el bloque inicial, renderizar la tarjeta
                  if (classAtSlot && isStartBlock(classAtSlot, hour)) {
                    const span = getClassSpan(classAtSlot);
                    const isCurrent = isCurrentClass(classAtSlot);

                    return (
                      <div
                        key={cellKey}
                        className="border-r border-b border-slate-200 p-1 relative"
                        style={{ gridRow: `span ${span}` }}
                      >
                        <div
                          onClick={() => handleCellClick(day, hour)}
                          className={`
                            h-full rounded-lg p-2 cursor-pointer transition-all duration-200
                            ${isCurrent 
                              ? 'bg-slate-900 border-2 border-cyan-400 animate-pulse' 
                              : 'bg-cyan-500 hover:bg-cyan-600'
                            }
                            text-white shadow-md hover:shadow-lg
                          `}
                        >
                          {/* Contenido de la clase */}
                          <div className="flex flex-col h-full justify-between">
                            <div>
                              <h4 className="font-bold text-xs mb-0.5 line-clamp-1">
                                {classAtSlot.subject.name}
                              </h4>
                              <p className="text-xs opacity-90 line-clamp-1">
                                {classAtSlot.group.name}
                              </p>
                            </div>

                            <div className="space-y-0.5 mt-1">
                              <div className="flex items-center gap-1 text-xs">
                                <Clock className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{classAtSlot.startTime}-{classAtSlot.endTime}</span>
                              </div>
                              {classAtSlot.classroom && (
                                <div className="flex items-center gap-1 text-xs">
                                  <MapPin className="w-3 h-3 flex-shrink-0" />
                                  <span className="truncate">{classAtSlot.classroom}</span>
                                </div>
                              )}
                            </div>

                            {/* Botones de edición (solo en modo edición) */}
                            {isEditMode && (
                              <div className="flex gap-1 mt-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onEditClass(classAtSlot);
                                  }}
                                  className="p-1 bg-white/20 hover:bg-white/30 rounded transition-colors"
                                  title="Editar"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm('¿Eliminar este horario?')) {
                                      onDeleteClass(classAtSlot.id);
                                    }
                                  }}
                                  className="p-1 bg-white/20 hover:bg-white/30 rounded transition-colors"
                                  title="Eliminar"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            )}

                            {/* Indicador de clase en curso */}
                            {isCurrent && (
                              <div className="absolute top-1 right-1 w-2 h-2 bg-green-400 rounded-full animate-ping" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // Si hay una clase pero no es el bloque inicial, no renderizar nada (el span cubre esta celda)
                  if (classAtSlot) {
                    return null;
                  }

                  // Celda vacía
                  return (
                    <div
                      key={cellKey}
                      className={`
                        border-r border-b border-slate-200 p-1 h-14 transition-all duration-200
                        ${isEditMode 
                          ? 'cursor-pointer hover:bg-cyan-50 border-dashed' 
                          : 'bg-slate-50/50'
                        }
                        ${isHovered ? 'bg-cyan-50' : ''}
                      `}
                      onClick={() => handleCellClick(day, hour)}
                      onMouseEnter={() => isEditMode && setHoveredCell(cellKey)}
                      onMouseLeave={() => setHoveredCell(null)}
                    >
                      {isEditMode && isHovered && (
                        <div className="flex items-center justify-center h-full text-cyan-500">
                          <span className="text-xl font-light">+</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Leyenda */}
      <div className="border-t border-slate-200 bg-slate-50 p-3">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-cyan-500"></div>
            <span className="text-slate-600">Clase Programada</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-slate-900 border-2 border-cyan-400"></div>
            <span className="text-slate-600">Clase en Curso</span>
          </div>
          {isEditMode && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded border-2 border-dashed border-slate-400"></div>
              <span className="text-slate-600">Click para Agregar</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

