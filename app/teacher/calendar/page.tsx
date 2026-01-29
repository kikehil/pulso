'use client';

import { useEffect, useState } from 'react';
import { Calendar as CalendarIcon, Edit2, Save, AlertCircle } from 'lucide-react';
import { CalendarWeekView } from '@/components/calendar-week-view';
import { ScheduleModal } from '@/components/schedule-modal';
import {
  getTeacherSchedules,
  getTeacherSubjectsForSchedule,
  createSchedule,
  deleteSchedule,
} from './actions';

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

interface Group {
  id: string;
  name: string;
  code: string;
  course: {
    id: string;
    name: string;
  };
}

export default function CalendarPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditingSchedule, setIsEditingSchedule] = useState(false);
  const [currentScheduleId, setCurrentScheduleId] = useState<string | null>(null);
  const [modalInitialData, setModalInitialData] = useState<{
    id?: string;
    groupId?: string;
    dayOfWeek: number;
    startTime: string;
    endTime?: string;
    classroom?: string;
  } | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Cargar horarios y grupos
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [schedulesRes, groupsRes] = await Promise.all([
        getTeacherSchedules(),
        getTeacherSubjectsForSchedule(),
      ]);

      if (schedulesRes.success && schedulesRes.schedules) {
        setSchedules(schedulesRes.schedules as any);
      }

      if (groupsRes.success && groupsRes.groups) {
        setGroups(groupsRes.groups as any);
      }
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar el calendario');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClass = (dayOfWeek: number, time: string) => {
    setIsEditingSchedule(false);
    setCurrentScheduleId(null);
    setModalInitialData({ dayOfWeek, startTime: time });
    setIsModalOpen(true);
  };

  const handleEditClass = (schedule: Schedule) => {
    setIsEditingSchedule(true);
    setCurrentScheduleId(schedule.id);
    setModalInitialData({
      id: schedule.id,
      groupId: schedule.group.id,
      dayOfWeek: schedule.dayOfWeek,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      classroom: schedule.classroom || '',
    });
    setIsModalOpen(true);
  };

  const handleDeleteClass = async (scheduleId: string) => {
    try {
      const result = await deleteSchedule(scheduleId);
      
      if (result.success) {
        await loadData();
      } else {
        alert(result.error || 'Error al eliminar el horario');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Error al eliminar el horario');
    }
  };

  const handleSaveSchedule = async (data: {
    groupId: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    classroom?: string;
  }) => {
    try {
      // Por ahora solo crear (update pendiente en actions.ts)
      const result = await createSchedule(data);
      
      if (result.success) {
        await loadData();
        setIsModalOpen(false);
        setModalInitialData(undefined);
        setIsEditingSchedule(false);
        setCurrentScheduleId(null);
      } else {
        throw new Error(result.error || 'Error al guardar horario');
      }
    } catch (err: any) {
      alert(err.message || 'Error al guardar el horario');
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-cyan-500 rounded-xl flex items-center justify-center">
            <CalendarIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Calendario y Horarios
            </h1>
            <p className="text-sm text-slate-600">
              Gestiona tus clases semanales
            </p>
          </div>
        </div>

        {/* Botón de Modo Edición */}
        <button
          onClick={() => setIsEditMode(!isEditMode)}
          className={`
            flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all
            ${isEditMode
              ? 'bg-green-500 text-white hover:bg-green-600'
              : 'bg-cyan-500 text-white hover:bg-cyan-600'
            }
          `}
        >
          {isEditMode ? (
            <>
              <Save className="w-5 h-5" />
              Terminar Edición
            </>
          ) : (
            <>
              <Edit2 className="w-5 h-5" />
              Editar Horario
            </>
          )}
        </button>
      </div>

      {/* Alerta de Modo Edición */}
      {isEditMode && (
        <div className="flex items-start gap-3 p-4 bg-cyan-50 border border-cyan-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-cyan-900">
              Modo de Edición Activado
            </p>
            <p className="text-sm text-cyan-700 mt-1">
              Haz clic en un espacio vacío para agregar una nueva clase, o en una clase existente para editarla o eliminarla.
            </p>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Calendario Semanal */}
      <CalendarWeekView
        schedules={schedules}
        isEditMode={isEditMode}
        onAddClass={handleAddClass}
        onEditClass={handleEditClass}
        onDeleteClass={handleDeleteClass}
      />

      {/* Modal de Configuración */}
      <ScheduleModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setModalInitialData(undefined);
          setIsEditingSchedule(false);
          setCurrentScheduleId(null);
        }}
        onSave={handleSaveSchedule}
        groups={groups}
        initialData={modalInitialData}
        isEditing={isEditingSchedule}
      />

      {/* Empty State */}
      {schedules.length === 0 && !isEditMode && (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CalendarIcon className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            No tienes clases programadas
          </h3>
          <p className="text-slate-600 mb-4">
            Activa el modo de edición para comenzar a configurar tu horario
          </p>
          <button
            onClick={() => setIsEditMode(true)}
            className="px-6 py-2.5 bg-cyan-500 text-white font-medium rounded-lg hover:bg-cyan-600 transition-colors"
          >
            Configurar Horario
          </button>
        </div>
      )}
    </div>
  );
}

