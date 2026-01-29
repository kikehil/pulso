'use client';

import { useState, useEffect } from 'react';
import { X, FolderOpen, AlertCircle } from 'lucide-react';
import { createGroup, updateGroup, getAllCourses } from '@/app/teacher/groups/actions';

interface Subject {
  id: string;
  name: string;
  code: string;
}

interface Group {
  id?: string;
  name: string;
  code: string;
  subjectId: string; // Cambiado de courseId a subjectId
  schedule?: string;
  isActive: boolean;
}

interface GroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  group?: Group | null;
}

export function GroupModal({ isOpen, onClose, onSuccess, group }: GroupModalProps) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [formData, setFormData] = useState<Group>({
    name: '',
    code: '',
    subjectId: '',
    schedule: '',
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadSubjects();
    }
  }, [isOpen]);

  useEffect(() => {
    if (group) {
      setFormData(group);
    } else {
      setFormData({
        name: '',
        code: '',
        subjectId: '',
        schedule: '',
        isActive: true,
      });
    }
    setError('');
  }, [group, isOpen]);

  async function loadSubjects() {
    setLoadingSubjects(true);
    try {
      const data = await getAllCourses(); // La función se llama getAllCourses pero retorna Subjects
      setSubjects(data.filter((c) => c.isActive));
    } catch (err) {
      setError('Error al cargar las materias');
    } finally {
      setLoadingSubjects(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = group?.id
        ? await updateGroup(group.id, formData)
        : await createGroup(formData);

      if (result.success) {
        onSuccess();
        onClose();
      } else {
        setError(result.error || 'Error al guardar el grupo');
      }
    } catch (err) {
      setError('Error al guardar el grupo');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FolderOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-dark">
                {group ? 'Editar Grupo' : 'Nuevo Grupo'}
              </h2>
              <p className="text-sm text-gray">
                {group ? 'Modifica la información del grupo' : 'Completa los datos del grupo'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              Materia *
            </label>
            <select
              value={formData.subjectId}
              onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
              className="input-field"
              required
              disabled={loadingSubjects}
            >
              <option value="">
                {loadingSubjects ? 'Cargando materias...' : 'Selecciona una materia'}
              </option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name} ({subject.code})
                </option>
              ))}
            </select>
            {subjects.length === 0 && !loadingSubjects && (
              <p className="text-xs text-amber-600 mt-1">
                No hay materias disponibles. Crea una primero.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              Nombre del Grupo *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
              placeholder="Ej: Grupo A"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              Código del Grupo *
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="input-field"
              placeholder="Ej: GRP-A"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              Horario
            </label>
            <input
              type="text"
              value={formData.schedule}
              onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
              className="input-field"
              placeholder="Ej: Lun/Mié 10:00-12:00"
            />
            <p className="text-xs text-gray mt-1">
              También puedes configurar el horario en el módulo de Calendario
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 text-primary rounded focus:ring-primary"
            />
            <label htmlFor="isActive" className="text-sm text-dark">
              Grupo activo
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={loading || subjects.length === 0}
            >
              {loading ? 'Guardando...' : group ? 'Actualizar' : 'Crear Grupo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

