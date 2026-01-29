'use client';

import { useState, useEffect } from 'react';
import { SearchForm } from '@/components/search-form';
import { Modal } from '@/components/modal';
import { DatePicker } from '@/components/date-picker';
import { Plus, Edit, Trash2, Calendar, Clock, BookOpen, AlertCircle } from 'lucide-react';
import {
  getAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  getTeacherSubjects,
  searchAssignments,
  type Assignment,
} from './actions';
import { formatDate } from '@/lib/utils';

// TODO: Obtener del contexto de autenticación
const CURRENT_USER = {
  id: 'teacher-1', // Cambiar según el usuario logueado
  role: 'teacher' as 'teacher' | 'student',
};

export default function TareasPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [filteredAssignments, setFilteredAssignments] = useState<Assignment[]>([]);
  const [subjectOptions, setSubjectOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    subjectId: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Cargar datos iniciales
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [assignmentsData, subjectsData] = await Promise.all([
        getAssignments(CURRENT_USER.role, CURRENT_USER.id),
        CURRENT_USER.role === 'teacher' ? getTeacherSubjects(CURRENT_USER.id) : Promise.resolve([]),
      ]);

      setAssignments(assignmentsData);
      setFilteredAssignments(assignmentsData);
      setSubjectOptions(subjectsData);
    } catch (err) {
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  // Búsqueda
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setFilteredAssignments(assignments);
      return;
    }

    try {
      const results = await searchAssignments(query, CURRENT_USER.role, CURRENT_USER.id);
      setFilteredAssignments(results);
    } catch (err) {
      setError('Error en la búsqueda');
    }
  };

  // Abrir modal para crear
  const handleCreate = () => {
    setEditingAssignment(null);
    setFormData({
      title: '',
      description: '',
      dueDate: '',
      subjectId: '',
    });
    setIsModalOpen(true);
    setError('');
    setSuccess('');
  };

  // Abrir modal para editar
  const handleEdit = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setFormData({
      title: assignment.title,
      description: assignment.description || '',
      dueDate: new Date(assignment.dueDate).toISOString().slice(0, 16),
      subjectId: assignment.subject.id,
    });
    setIsModalOpen(true);
    setError('');
    setSuccess('');
  };

  // Guardar tarea
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.subjectId) {
      setError('Debes seleccionar una materia');
      return;
    }

    try {
      const dataToSend = {
        ...formData,
        teacherId: CURRENT_USER.id,
      };

      if (editingAssignment) {
        await updateAssignment(editingAssignment.id, dataToSend);
        setSuccess('Tarea actualizada exitosamente');
      } else {
        await createAssignment(dataToSend);
        setSuccess('Tarea creada exitosamente');
      }

      await loadData();

      // Cerrar modal después de 800ms
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccess('');
      }, 800);
    } catch (err: any) {
      setError(err.message || 'Error al guardar la tarea');
    }
  };

  // Eliminar tarea
  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta tarea?')) return;

    try {
      await deleteAssignment(id, CURRENT_USER.id);
      setSuccess('Tarea eliminada exitosamente');
      await loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Error al eliminar la tarea');
    }
  };

  // Verificar si la fecha está próxima (menos de 24h)
  const isDateUrgent = (dueDate: Date) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffHours = (due.getTime() - now.getTime()) / (1000 * 60 * 60);
    return diffHours > 0 && diffHours < 24;
  };

  // Verificar si la fecha ya pasó
  const isDateOverdue = (dueDate: Date) => {
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-dark">
            {CURRENT_USER.role === 'teacher' ? 'Mis Tareas' : 'Tareas Asignadas'}
          </h1>
          <p className="text-gray mt-1 font-regular">
            {CURRENT_USER.role === 'teacher'
              ? 'Administra las tareas de tus materias'
              : 'Visualiza y entrega tus tareas'}
          </p>
        </div>

        {CURRENT_USER.role === 'teacher' && (
          <button
            onClick={handleCreate}
            className="btn-primary inline-flex items-center gap-2 shadow-lg shadow-primary/20"
          >
            <Plus className="w-5 h-5" />
            Nueva Tarea
          </button>
        )}
      </div>

      {/* Mensajes */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          {success}
        </div>
      )}

      {/* Buscador */}
      <SearchForm
        placeholder="Buscar tareas por título o descripción..."
        onSearch={handleSearch}
      />

      {/* Grid de Cards */}
      {loading ? (
        <div className="text-center py-12 text-gray">
          Cargando tareas...
        </div>
      ) : filteredAssignments.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray mx-auto mb-4 opacity-50" />
          <p className="text-gray font-regular">No se encontraron tareas</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssignments.map((assignment) => {
            const isUrgent = isDateUrgent(assignment.dueDate);
            const isOverdue = isDateOverdue(assignment.dueDate);

            return (
              <div
                key={assignment.id}
                className="card group hover:shadow-lg transition-all duration-200"
              >
                {/* Encabezado de la Card */}
                <div className="mb-4">
                  <p className="text-xs text-gray font-medium mb-2">
                    {assignment.subject.code} - {assignment.subject.name}
                  </p>
                  <h3 className="text-lg font-bold text-dark line-clamp-2">
                    {assignment.title}
                  </h3>
                </div>

                {/* Descripción */}
                {assignment.description && (
                  <p className="text-sm text-gray mb-4 line-clamp-3">
                    {assignment.description}
                  </p>
                )}

                {/* Indicador de Fecha */}
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className={`w-4 h-4 ${
                    isOverdue ? 'text-red-600' : isUrgent ? 'text-red-500' : 'text-gray'
                  }`} />
                  <span className={`text-sm font-medium ${
                    isOverdue ? 'text-red-600' : isUrgent ? 'text-red-500' : 'text-gray'
                  }`}>
                    {isOverdue ? 'Vencida' : isUrgent ? 'Próxima a vencer' : 'Vence'}: {' '}
                    {new Date(assignment.dueDate).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                {/* Información adicional */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray" />
                    <span className="text-xs text-gray">
                      {assignment._count.submissions} entrega{assignment._count.submissions !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Acciones (solo para docente creador) */}
                  {CURRENT_USER.role === 'teacher' && assignment.teacher.id === CURRENT_USER.id && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(assignment)}
                        className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(assignment.id)}
                        className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Badge de estado urgente */}
                {isUrgent && !isOverdue && (
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                      <AlertCircle className="w-3 h-3" />
                      Urgente
                    </span>
                  </div>
                )}

                {/* Badge de vencida */}
                {isOverdue && (
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-600 text-white rounded-full text-xs font-medium">
                      Vencida
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Crear/Editar */}
      {CURRENT_USER.role === 'teacher' && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingAssignment ? 'Editar Tarea' : 'Nueva Tarea'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Selector de Materia */}
            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Materia *
              </label>
              <select
                required
                value={formData.subjectId}
                onChange={(e) =>
                  setFormData({ ...formData, subjectId: e.target.value })
                }
                className="input-field"
              >
                <option value="">Selecciona una materia...</option>
                {subjectOptions.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.code} - {subject.name} ({subject.courseCode})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray mt-1">
                Solo puedes crear tareas para materias asignadas a ti
              </p>
            </div>

            {/* Título */}
            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Título *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Ej: Tarea 1 - Algoritmos de Ordenamiento"
                className="input-field"
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe los objetivos y requisitos de la tarea..."
                rows={5}
                className="input-field resize-none"
              />
            </div>

            {/* Fecha de Vencimiento */}
            <DatePicker
              label="Fecha de Vencimiento"
              required
              value={formData.dueDate}
              onChange={(date) => setFormData({ ...formData, dueDate: date })}
            />

            {/* Botones */}
            <div className="flex items-center gap-3 pt-4">
              <button
                type="submit"
                className="btn-primary flex-1 hover:bg-dark transition-colors"
              >
                {editingAssignment ? 'Actualizar' : 'Crear'} Tarea
              </button>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="btn-secondary flex-1"
              >
                Cancelar
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}


