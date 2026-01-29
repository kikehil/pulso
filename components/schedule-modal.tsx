'use client';

import { useState, useEffect } from 'react';
import { X, Clock, MapPin, AlertCircle } from 'lucide-react';

interface Group {
  id: string;
  name: string;
  code: string;
  course: {
    id: string;
    name: string;
  };
}

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    groupId: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    classroom?: string;
  }) => Promise<void>;
  groups: Group[];
  initialData?: {
    id?: string;
    groupId?: string;
    dayOfWeek: number;
    startTime: string;
    endTime?: string;
    classroom?: string;
  };
  isEditing?: boolean;
}

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export function ScheduleModal({
  isOpen,
  onClose,
  onSave,
  groups,
  initialData,
  isEditing = false,
}: ScheduleModalProps) {
  const [formData, setFormData] = useState({
    groupId: '',
    dayOfWeek: initialData?.dayOfWeek ?? 1,
    startTime: initialData?.startTime ?? '08:00',
    endTime: '09:00',
    classroom: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      // Si es modo edición, prellenar todos los campos
      if (isEditing && initialData.groupId && initialData.endTime) {
        setFormData({
          groupId: initialData.groupId,
          dayOfWeek: initialData.dayOfWeek,
          startTime: initialData.startTime,
          endTime: initialData.endTime,
          classroom: initialData.classroom || '',
        });
      } else {
        // Si es nuevo, solo prellenar día y hora de inicio
        setFormData((prev) => ({
          ...prev,
          dayOfWeek: initialData.dayOfWeek,
          startTime: initialData.startTime,
        }));
        
        // Calcular endTime (1 hora después por defecto)
        const [hours, minutes] = initialData.startTime.split(':').map(Number);
        const endHour = (hours + 1).toString().padStart(2, '0');
        setFormData((prev) => ({
          ...prev,
          endTime: `${endHour}:${minutes.toString().padStart(2, '0')}`,
        }));
      }
    }
  }, [initialData, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (!formData.groupId) {
      setError('Selecciona una materia y grupo');
      return;
    }

    if (formData.startTime >= formData.endTime) {
      setError('La hora de fin debe ser posterior a la hora de inicio');
      return;
    }

    setLoading(true);

    try {
      await onSave(formData);
      onClose();
      // Reset form
      setFormData({
        groupId: '',
        dayOfWeek: 1,
        startTime: '08:00',
        endTime: '09:00',
        classroom: '',
      });
    } catch (err) {
      setError('Error al guardar el horario');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">
            {isEditing ? 'Editar Clase' : 'Nueva Clase'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error Alert */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Selector de Materia/Grupo */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Materia y Grupo *
            </label>
            <select
              value={formData.groupId}
              onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
              required
            >
              <option value="">Selecciona un grupo</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  📚 {group.course.name} | 👥 {group.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500 mt-1">
              Selecciona la materia y el grupo para este horario
            </p>
          </div>

          {/* Día de la semana */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Día de la Semana *
            </label>
            <select
              value={formData.dayOfWeek}
              onChange={(e) => setFormData({ ...formData, dayOfWeek: parseInt(e.target.value) })}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
              required
            >
              {DAYS.slice(1, 6).map((day, index) => ( // Lunes a Viernes
                <option key={index + 1} value={index + 1}>
                  {day}
                </option>
              ))}
            </select>
          </div>

          {/* Hora de Inicio y Fin */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Hora Inicio *
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Hora Fin *
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          {/* Aula (Opcional) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Aula (Opcional)
            </label>
            <input
              type="text"
              value={formData.classroom}
              onChange={(e) => setFormData({ ...formData, classroom: e.target.value })}
              placeholder="Ej: C-12, Lab 2, Aula 301"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-cyan-500 text-white font-medium rounded-lg hover:bg-cyan-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear Clase')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

