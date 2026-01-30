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
const START_MINUTES = 8 * 60; // 08:00 (Más compacto)
const END_MINUTES = 18 * 60; // 18:00 (Más compacto)
const SLOT_MINUTES = 60; // Bloques de 1 hora para que quepan mejor
const TIME_SLOTS = Array.from(
  { length: Math.ceil((END_MINUTES - START_MINUTES) / SLOT_MINUTES) },
  (_, i) => START_MINUTES + i * SLOT_MINUTES
).filter((minutes) => minutes < END_MINUTES);

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
  const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map((value) => parseInt(value, 10));
    return hours * 60 + minutes;
  };

  const minutesToTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const getClassAtSlot = (day: number, slotMinutes: number) => {
    return schedules.find((schedule) => {
      if (schedule.dayOfWeek !== day) return false;
      
      const startMinutes = timeToMinutes(schedule.startTime);
      const endMinutes = timeToMinutes(schedule.endTime);
      
      // Una clase ocupa este slot si empieza antes o igual al fin del slot
      // y termina después del inicio del slot
      return startMinutes < (slotMinutes + SLOT_MINUTES) && endMinutes > slotMinutes;
    });
  };

  // Función para verificar si es el bloque inicial de la clase en este slot
  const isStartBlock = (schedule: Schedule, slotMinutes: number) => {
    const startMinutes = timeToMinutes(schedule.startTime);
    return slotMinutes <= startMinutes && startMinutes < (slotMinutes + SLOT_MINUTES);
  };

  // Función para calcular el número de filas que ocupa una clase
  const getClassSpan = (schedule: Schedule) => {
    const startMinutes = timeToMinutes(schedule.startTime);
    const endMinutes = timeToMinutes(schedule.endTime);
    return Math.max(1, Math.ceil((endMinutes - startMinutes) / SLOT_MINUTES));
  };

  // Verificar si una clase está en curso
  const isCurrentClass = (schedule: Schedule) => {
    const now = new Date();
    const currentDay = now.getDay();
    // Ajustar domingo (0) a lo que sea que use el sistema si es necesario, 
    // pero aquí DAYS[1-5] son Lunes-Viernes
    const currentTimeMinutes = now.getHours() * 60 + now.getMinutes();
    
    const startMinutes = timeToMinutes(schedule.startTime);
    const endMinutes = timeToMinutes(schedule.endTime);
    
    return (
      schedule.dayOfWeek === currentDay &&
      currentTimeMinutes >= startMinutes &&
      currentTimeMinutes <= endMinutes
    );
  };

  const handleCellClick = (day: number, slotMinutes: number) => {
    const classAtSlot = getClassAtSlot(day, slotMinutes);
    
    if (classAtSlot) {
      if (isEditMode) {
        onEditClass(classAtSlot);
      } else {
        router.push(`/teacher/class/${classAtSlot.group.id}?tab=attendance`);
      }
    } else if (isEditMode) {
      onAddClass(day, minutesToTime(slotMinutes));
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Grid del Calendario */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Header: Días de la semana */}
          <div className="grid grid-cols-6 border-b border-slate-200 bg-slate-50">
            <div className="p-2 text-[10px] uppercase tracking-wider font-bold text-slate-500 border-r border-slate-200">Hora</div>
            {DAYS.slice(1, 6).map((day) => ( // Lunes a Viernes
              <div key={day} className="p-2 text-center border-r border-slate-200 last:border-r-0">
                <div className="text-xs font-bold text-slate-900">{day}</div>
              </div>
            ))}
          </div>

          {/* Body: Horas y clases */}
          <div className="grid grid-cols-6 relative">
            {TIME_SLOTS.map((slotMinutes) => (
              <div key={slotMinutes} className="contents">
                {/* Columna de hora */}
                <div className="border-r border-b border-slate-200 p-1 text-[10px] text-slate-500 font-bold bg-slate-50/50 flex items-center justify-center h-12">
                  {minutesToTime(slotMinutes)}
                </div>

                {/* Celdas para cada día (Lunes a Viernes) */}
                {[1, 2, 3, 4, 5].map((day) => {
                  const classAtSlot = getClassAtSlot(day, slotMinutes);
                  const cellKey = `${day}-${slotMinutes}`;
                  const isHovered = hoveredCell === cellKey;

                  // Si hay una clase y es el bloque inicial, renderizar la tarjeta
                  if (classAtSlot && isStartBlock(classAtSlot, slotMinutes)) {
                    const span = getClassSpan(classAtSlot);
                    const isCurrent = isCurrentClass(classAtSlot);

                    return (
                      <div
                        key={cellKey}
                        className="border-r border-b border-slate-200 p-0.5 relative"
                        style={{ gridRow: `span ${span}` }}
                      >
                        <div
                          onClick={() => handleCellClick(day, slotMinutes)}
                          className={`
                            h-full rounded-md p-1.5 cursor-pointer transition-all duration-200 flex flex-col justify-between
                            ${isCurrent 
                              ? 'bg-slate-900 border-2 border-cyan-400 ring-2 ring-cyan-400/20' 
                              : 'bg-cyan-500 hover:bg-cyan-600 shadow-sm'
                            }
                            text-white
                          `}
                        >
                          <div>
                            <h4 className="font-bold text-[10px] leading-tight line-clamp-2">
                              {classAtSlot.subject.name}
                            </h4>
                            <p className="text-[9px] opacity-90 line-clamp-1 mt-0.5 font-medium">
                              {classAtSlot.group.name}
                            </p>
                          </div>

                          <div className="mt-1 pt-1 border-t border-white/20">
                            <div className="flex items-center gap-1 text-[9px] font-medium">
                              <Clock className="w-2.5 h-2.5 flex-shrink-0" />
                              <span className="truncate">{classAtSlot.startTime}</span>
                            </div>
                            {classAtSlot.classroom && (
                              <div className="flex items-center gap-1 text-[9px] font-medium opacity-90">
                                <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
                                <span className="truncate">{classAtSlot.classroom}</span>
                              </div>
                            )}
                          </div>

                          {/* Botones de edición reducidos */}
                          {isEditMode && (
                            <div className="absolute top-1 right-1 flex gap-0.5">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEditClass(classAtSlot);
                                }}
                                className="p-0.5 bg-white/20 hover:bg-white/40 rounded transition-colors"
                              >
                                <Edit2 className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }

                  // Si hay una clase pero no es el bloque inicial, no renderizar nada
                  if (classAtSlot) {
                    return null;
                  }

                  // Celda vacía
                  return (
                    <div
                      key={cellKey}
                      className={`
                        border-r border-b border-slate-200 h-12 transition-all duration-200
                        ${isEditMode 
                          ? 'cursor-pointer hover:bg-cyan-50/50 group' 
                          : 'bg-white'
                        }
                      `}
                      onClick={() => handleCellClick(day, slotMinutes)}
                      onMouseEnter={() => isEditMode && setHoveredCell(cellKey)}
                      onMouseLeave={() => setHoveredCell(null)}
                    >
                      {isEditMode && (
                        <div className="h-full w-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-cyan-400 text-lg font-light">+</span>
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

