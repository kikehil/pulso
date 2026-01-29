'use client';

import { useState, useEffect } from 'react';
import { SearchForm } from '@/components/search-form';
import { Modal } from '@/components/modal';
import { MultiSelect, type MultiSelectOption } from '@/components/multi-select';
import { Plus, Edit, Trash2, GraduationCap, Mail, Phone, Briefcase } from 'lucide-react';
import {
  getTeachers,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getAvailableCareers,
  getAvailableSubjects,
  searchTeachers,
  type Teacher,
} from './actions';
import { formatDate } from '@/lib/utils';

export default function DocentesPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [careerOptions, setCareerOptions] = useState<MultiSelectOption[]>([]);
  const [subjectOptions, setSubjectOptions] = useState<MultiSelectOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    department: '',
    phone: '',
    careerIds: [] as string[],
    subjectIds: [] as string[],
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Cargar datos iniciales
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [teachersData, careersData, subjectsData] = await Promise.all([
        getTeachers(),
        getAvailableCareers(),
        getAvailableSubjects(),
      ]);

      setTeachers(teachersData);
      setFilteredTeachers(teachersData);

      setCareerOptions(
        careersData.map((career) => ({
          value: career.id,
          label: career.name,
          description: career.code,
        }))
      );

      setSubjectOptions(
        subjectsData.map((subject) => ({
          value: subject.id,
          label: subject.name,
          description: `${subject.code} - ${subject.careerCode}`,
        }))
      );
    } catch (err) {
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  // Búsqueda
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setFilteredTeachers(teachers);
      return;
    }

    try {
      const results = await searchTeachers(query);
      setFilteredTeachers(results);
    } catch (err) {
      setError('Error en la búsqueda');
    }
  };

  // Abrir modal para crear
  const handleCreate = () => {
    setEditingTeacher(null);
    setFormData({
      email: '',
      firstName: '',
      lastName: '',
      department: '',
      phone: '',
      careerIds: [],
      subjectIds: [],
    });
    setIsModalOpen(true);
    setError('');
    setSuccess('');
  };

  // Abrir modal para editar
  const handleEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      email: teacher.email,
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      department: teacher.department || '',
      phone: teacher.phone || '',
      careerIds: teacher.careers.map((c) => c.id),
      subjectIds: teacher.subjects.map((s) => s.id),
    });
    setIsModalOpen(true);
    setError('');
    setSuccess('');
  };

  // Guardar docente
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingTeacher) {
        await updateTeacher(editingTeacher.id, formData);
        setSuccess('Docente actualizado exitosamente');
      } else {
        await createTeacher(formData);
        setSuccess('Docente creado exitosamente');
      }

      await loadData();
      
      // Cerrar modal después de 800ms (tiempo para ver el mensaje)
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccess('');
      }, 800);
    } catch (err: any) {
      setError(err.message || 'Error al guardar el docente');
    }
  };

  // Eliminar docente
  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este docente?')) return;

    try {
      await deleteTeacher(id);
      setSuccess('Docente eliminado exitosamente');
      await loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error al eliminar el docente');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-dark">
            Gestión de Docentes
          </h1>
          <p className="text-gray mt-1 font-regular">
            Administra los docentes y sus asignaciones
          </p>
        </div>

        <button
          onClick={handleCreate}
          className="btn-primary inline-flex items-center gap-2 shadow-lg shadow-primary/20"
        >
          <Plus className="w-5 h-5" />
          Nuevo Docente
        </button>
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
        placeholder="Buscar por nombre, email o departamento..."
        onSearch={handleSearch}
      />

      {/* Cards de Docentes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12 text-gray">
            Cargando docentes...
          </div>
        ) : filteredTeachers.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <GraduationCap className="w-16 h-16 text-gray mx-auto mb-4 opacity-50" />
            <p className="text-gray font-regular">No se encontraron docentes</p>
          </div>
        ) : (
          filteredTeachers.map((teacher) => (
            <div
              key={teacher.id}
              className="card group hover:shadow-lg transition-all duration-200"
            >
              {/* Header Card */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-primary/20">
                    <span className="text-lg font-bold text-primary">
                      {teacher.firstName[0]}
                      {teacher.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-dark">
                      {teacher.firstName} {teacher.lastName}
                    </h3>
                    <p className="text-xs text-gray">
                      {teacher.department || 'Sin departamento'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(teacher)}
                    className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors opacity-0 group-hover:opacity-100"
                    title="Editar"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(teacher.id)}
                    className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Información de Contacto */}
              <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{teacher.email}</span>
                </div>
                {teacher.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <span>{teacher.phone}</span>
                  </div>
                )}
              </div>

              {/* Badges de Carreras */}
              {teacher.careers.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-gray mb-2 flex items-center gap-1">
                    <Briefcase className="w-3 h-3" />
                    Carreras
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {teacher.careers.map((career) => (
                      <span
                        key={career.id}
                        className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium"
                      >
                        {career.code}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Badges de Materias */}
              {teacher.subjects.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray mb-2 flex items-center gap-1">
                    <GraduationCap className="w-3 h-3" />
                    Materias ({teacher.subjects.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {teacher.subjects.slice(0, 3).map((subject) => (
                      <span
                        key={subject.id}
                        className="px-2 py-1 bg-purple-100 text-purple-700 rounded-md text-xs font-medium"
                      >
                        {subject.code}
                      </span>
                    ))}
                    {teacher.subjects.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">
                        +{teacher.subjects.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Estado */}
              <div className="mt-4 pt-3 border-t border-gray-200">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    teacher.isActive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {teacher.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de Crear/Editar */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTeacher ? 'Editar Docente' : 'Nuevo Docente'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información Personal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Nombre *
              </label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                placeholder="Juan"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Apellido *
              </label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                placeholder="Pérez"
                className="input-field"
              />
            </div>
          </div>

          {/* Email y Teléfono */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="docente@universidad.edu"
                className="input-field"
                disabled={!!editingTeacher}
              />
              {editingTeacher && (
                <p className="text-xs text-gray mt-1">
                  El email no puede modificarse
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Teléfono
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="+52 123 456 7890"
                className="input-field"
              />
            </div>
          </div>

          {/* Departamento */}
          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              Departamento
            </label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) =>
                setFormData({ ...formData, department: e.target.value })
              }
              placeholder="Ej: Facultad de Ingeniería"
              className="input-field"
            />
          </div>

          {/* Multi-Select Carreras */}
          <MultiSelect
            label="Carreras"
            required
            options={careerOptions}
            selected={formData.careerIds}
            onChange={(selected) =>
              setFormData({ ...formData, careerIds: selected })
            }
            placeholder="Selecciona las carreras..."
          />

          {/* Multi-Select Materias */}
          <MultiSelect
            label="Materias"
            options={subjectOptions}
            selected={formData.subjectIds}
            onChange={(selected) =>
              setFormData({ ...formData, subjectIds: selected })
            }
            placeholder="Selecciona las materias..."
          />

          {/* Botones */}
          <div className="flex items-center gap-3 pt-4">
            <button type="submit" className="btn-primary flex-1">
              {editingTeacher ? 'Actualizar' : 'Crear'} Docente
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
    </div>
  );
}

