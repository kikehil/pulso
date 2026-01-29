'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Pencil, Trash2, BookOpen, Users, FileText } from 'lucide-react';
import { Modal } from '@/components/modal';
import {
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  getCourses,
  searchSubjects,
} from './actions';

type Subject = {
  id: string;
  name: string;
  code: string;
  description: string | null;
  credits: number | null;
  course: {
    name: string;
    code: string;
  };
  teacherSubjects: Array<{
    teacher: {
      firstName: string;
      lastName: string;
    };
  }>;
  _count: {
    studentSubjects: number;
    assignments: number;
  };
};

type Course = {
  id: string;
  name: string;
  code: string;
};

export default function MateriasPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    courseId: '',
    credits: '',
  });

  // Cargar datos iniciales
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [subjectsData, coursesData] = await Promise.all([
        getSubjects(),
        getCourses(),
      ]);
      setSubjects(subjectsData);
      setCourses(coursesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  // Buscar materias
  async function handleSearch() {
    if (!searchQuery.trim()) {
      loadData();
      return;
    }

    try {
      setLoading(true);
      const results = await searchSubjects(searchQuery);
      setSubjects(results);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  }

  // Abrir modal para crear
  function handleCreate() {
    setEditingSubject(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      courseId: '',
      credits: '',
    });
    setIsModalOpen(true);
  }

  // Abrir modal para editar
  function handleEdit(subject: Subject) {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      code: subject.code,
      description: subject.description || '',
      courseId: subject.course ? '' : '', // Se necesita el ID real de la carrera
      credits: subject.credits?.toString() || '',
    });
    setIsModalOpen(true);
  }

  // Guardar materia (crear o actualizar)
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const submitData = {
        name: formData.name,
        code: formData.code,
        description: formData.description || undefined,
        courseId: formData.courseId,
        credits: formData.credits ? parseInt(formData.credits) : undefined,
      };

      if (editingSubject) {
        const result = await updateSubject(editingSubject.id, submitData);
        if (result.success) {
          await loadData();
          setTimeout(() => setIsModalOpen(false), 300);
        }
      } else {
        const result = await createSubject(submitData);
        if (result.success) {
          await loadData();
          setTimeout(() => setIsModalOpen(false), 300);
        }
      }
    } catch (error) {
      console.error('Error saving subject:', error);
    }
  }

  // Eliminar materia
  async function handleDelete(id: string) {
    if (!confirm('¿Estás seguro de eliminar esta materia?')) return;

    try {
      const result = await deleteSubject(id);
      if (result.success) {
        await loadData();
      }
    } catch (error) {
      console.error('Error deleting subject:', error);
    }
  }

  if (loading && subjects.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray">Cargando materias...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark">Materias</h1>
          <p className="text-gray mt-1">Gestiona las materias del plan de estudios</p>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-dark transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Nueva Materia
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray" />
          <input
            type="text"
            placeholder="Buscar por nombre, código o descripción..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full pl-10 pr-4 py-2 border border-gray/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
          />
        </div>
        <button
          onClick={handleSearch}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-dark transition-colors shadow-sm"
        >
          Buscar
        </button>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects.map((subject) => (
          <div
            key={subject.id}
            className="bg-white rounded-xl shadow-sm border border-gray/10 p-6 hover:shadow-md transition-shadow"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-bold text-dark text-lg mb-1">{subject.name}</h3>
                <p className="text-sm text-gray">
                  {subject.code} {subject.credits && `• ${subject.credits} créditos`}
                </p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleEdit(subject)}
                  className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                  title="Editar"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(subject.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Description */}
            {subject.description && (
              <p className="text-sm text-gray mb-4 line-clamp-2">{subject.description}</p>
            )}

            {/* Career Badge */}
            <div className="mb-4">
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-dark text-white text-xs rounded-full">
                <BookOpen className="w-3 h-3" />
                {subject.course.name}
              </span>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm text-gray">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{subject._count.studentSubjects} alumnos</span>
              </div>
              <div className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                <span>{subject._count.assignments} tareas</span>
              </div>
            </div>

            {/* Teachers */}
            {subject.teacherSubjects.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray/10">
                <p className="text-xs text-gray mb-1">Docentes:</p>
                <div className="flex flex-wrap gap-1">
                  {subject.teacherSubjects.map((ts, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-1 bg-primary/10 text-primary rounded"
                    >
                      {ts.teacher.firstName} {ts.teacher.lastName}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {subjects.length === 0 && !loading && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray/30 mx-auto mb-4" />
          <p className="text-gray">No hay materias registradas</p>
          <button
            onClick={handleCreate}
            className="mt-4 text-primary hover:underline"
          >
            Crear la primera materia
          </button>
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSubject ? 'Editar Materia' : 'Nueva Materia'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-dark mb-1">
              Nombre de la Materia *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              placeholder="Ej: Matemáticas I"
            />
          </div>

          {/* Código */}
          <div>
            <label className="block text-sm font-medium text-dark mb-1">
              Código *
            </label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="w-full px-4 py-2 border border-gray/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              placeholder="Ej: MAT101"
            />
          </div>

          {/* Carrera */}
          <div>
            <label className="block text-sm font-medium text-dark mb-1">
              Carrera *
            </label>
            <select
              required
              value={formData.courseId}
              onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
              className="w-full px-4 py-2 border border-gray/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
            >
              <option value="">Selecciona una carrera</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name} ({course.code})
                </option>
              ))}
            </select>
          </div>

          {/* Créditos */}
          <div>
            <label className="block text-sm font-medium text-dark mb-1">
              Créditos
            </label>
            <input
              type="number"
              min="0"
              value={formData.credits}
              onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
              className="w-full px-4 py-2 border border-gray/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              placeholder="Ej: 6"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-dark mb-1">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all resize-none"
              placeholder="Descripción de la materia..."
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-4 py-2 border border-gray/30 text-gray rounded-lg hover:bg-gray/5 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-dark transition-colors shadow-sm"
            >
              {editingSubject ? 'Actualizar' : 'Crear Materia'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}


