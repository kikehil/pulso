'use client';

import { useState, useEffect } from 'react';
import { X, BookOpen, AlertCircle } from 'lucide-react';
import { createCourse, updateCourse } from '@/app/teacher/groups/actions';

interface Course {
  id?: string;
  name: string;
  code: string;
  credits: number;
  description?: string;
  isActive: boolean;
}

interface CourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  course?: Course | null;
}

export function CourseModal({ isOpen, onClose, onSuccess, course }: CourseModalProps) {
  const [formData, setFormData] = useState<Course>({
    name: '',
    code: '',
    credits: 3,
    description: '',
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (course) {
      setFormData(course);
    } else {
      setFormData({
        name: '',
        code: '',
        credits: 3,
        description: '',
        isActive: true,
      });
    }
    setError('');
  }, [course, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = course?.id
        ? await updateCourse(course.id, formData)
        : await createCourse(formData);

      if (result.success) {
        onSuccess();
        onClose();
      } else {
        setError(result.error || 'Error al guardar la materia');
      }
    } catch (err) {
      setError('Error al guardar la materia');
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
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-dark">
                {course ? 'Editar Materia' : 'Nueva Materia'}
              </h2>
              <p className="text-sm text-gray">
                {course ? 'Modifica la información de la materia' : 'Completa los datos de la materia'}
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
              Nombre de la Materia *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
              placeholder="Ej: Contabilidad I"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              Código *
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="input-field"
              placeholder="Ej: CONT-101"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              Créditos *
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={formData.credits}
              onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field min-h-[80px]"
              placeholder="Breve descripción de la materia..."
              rows={3}
            />
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
              Materia activa
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
              disabled={loading}
            >
              {loading ? 'Guardando...' : course ? 'Actualizar' : 'Crear Materia'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

