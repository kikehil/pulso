'use client';

import { useState, useEffect } from 'react';
import { SearchForm } from '@/components/search-form';
import { Modal } from '@/components/modal';
import { ImageUpload } from '@/components/image-upload';
import { MultiSelect, type MultiSelectOption } from '@/components/multi-select';
import { Plus, Edit, Trash2, User, Mail, Hash, GraduationCap } from 'lucide-react';
import Image from 'next/image';
import {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  getAvailableCareers,
  getSubjectsByCareer,
  searchStudents,
  type Student,
} from './actions';
import { formatDate } from '@/lib/utils';

export default function AlumnosPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [careerOptions, setCareerOptions] = useState<MultiSelectOption[]>([]);
  const [subjectOptions, setSubjectOptions] = useState<MultiSelectOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    enrollmentId: '',
    avatarUrl: '',
    courseId: '',
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
      const [studentsData, careersData] = await Promise.all([
        getStudents(),
        getAvailableCareers(),
      ]);

      setStudents(studentsData);
      setFilteredStudents(studentsData);

      setCareerOptions(
        careersData.map((career) => ({
          value: career.id,
          label: career.name,
          description: career.code,
        }))
      );
    } catch (err) {
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  // Cargar materias cuando se selecciona una carrera
  const handleCareerChange = async (courseId: string) => {
    setFormData({ ...formData, courseId, subjectIds: [] });
    
    if (!courseId) {
      setSubjectOptions([]);
      return;
    }

    try {
      const subjects = await getSubjectsByCareer(courseId);
      setSubjectOptions(
        subjects.map((subject) => ({
          value: subject.id,
          label: subject.name,
          description: `${subject.code} - ${subject.credits} créditos`,
        }))
      );
    } catch (err) {
      setError('Error al cargar las materias');
    }
  };

  // Búsqueda
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setFilteredStudents(students);
      return;
    }

    try {
      const results = await searchStudents(query);
      setFilteredStudents(results);
    } catch (err) {
      setError('Error en la búsqueda');
    }
  };

  // Abrir modal para crear
  const handleCreate = () => {
    setEditingStudent(null);
    setImageFile(null);
    setFormData({
      email: '',
      firstName: '',
      lastName: '',
      enrollmentId: '',
      avatarUrl: '',
      courseId: '',
      subjectIds: [],
    });
    setSubjectOptions([]);
    setIsModalOpen(true);
    setError('');
    setSuccess('');
  };

  // Abrir modal para editar
  const handleEdit = async (student: Student) => {
    setEditingStudent(student);
    setImageFile(null);
    setFormData({
      email: student.email,
      firstName: student.firstName,
      lastName: student.lastName,
      enrollmentId: student.enrollmentId || '',
      avatarUrl: student.avatarUrl || '',
      courseId: student.course?.id || '',
      subjectIds: student.subjects.map((s) => s.id),
    });

    // Cargar materias de la carrera
    if (student.course) {
      const subjects = await getSubjectsByCareer(student.course.id);
      setSubjectOptions(
        subjects.map((subject) => ({
          value: subject.id,
          label: subject.name,
          description: `${subject.code} - ${subject.credits} créditos`,
        }))
      );
    }

    setIsModalOpen(true);
    setError('');
    setSuccess('');
  };

  // Guardar alumno
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validar carrera
    if (!formData.courseId) {
      setError('Debes seleccionar una carrera');
      return;
    }

    try {
      const dataToSend = {
        ...formData,
        avatarUrl: imageFile ? formData.avatarUrl : (editingStudent?.avatarUrl || ''),
      };

      if (editingStudent) {
        await updateStudent(editingStudent.id, dataToSend);
        setSuccess('Alumno actualizado exitosamente');
      } else {
        await createStudent(dataToSend);
        setSuccess('Alumno creado exitosamente');
      }

      await loadData();
      
      // Cerrar modal después de 800ms
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccess('');
      }, 800);
    } catch (err: any) {
      setError(err.message || 'Error al guardar el alumno');
    }
  };

  // Eliminar alumno
  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este alumno?')) return;

    try {
      await deleteStudent(id);
      setSuccess('Alumno eliminado exitosamente');
      await loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error al eliminar el alumno');
    }
  };

  // Handle image upload
  const handleImageChange = (file: File | null, previewUrl: string | null) => {
    setImageFile(file);
    setFormData({ ...formData, avatarUrl: previewUrl || '' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-dark">
            Gestión de Alumnos
          </h1>
          <p className="text-gray mt-1 font-regular">
            Administra los alumnos y sus inscripciones
          </p>
        </div>

        <button
          onClick={handleCreate}
          className="btn-primary inline-flex items-center gap-2 shadow-lg shadow-primary/20"
        >
          <Plus className="w-5 h-5" />
          Nuevo Alumno
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
        placeholder="Buscar por nombre, email o matrícula..."
        onSearch={handleSearch}
      />

      {/* Tabla */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray">
            Cargando alumnos...
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-12 text-center">
            <GraduationCap className="w-16 h-16 text-gray mx-auto mb-4 opacity-50" />
            <p className="text-gray font-regular">No se encontraron alumnos</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold">Alumno</th>
                  <th className="px-6 py-4 text-left text-sm font-bold">Matrícula</th>
                  <th className="px-6 py-4 text-left text-sm font-bold">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-bold">Carrera</th>
                  <th className="px-6 py-4 text-left text-sm font-bold">Materias</th>
                  <th className="px-6 py-4 text-left text-sm font-bold">Estado</th>
                  <th className="px-6 py-4 text-center text-sm font-bold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-light transition-colors"
                  >
                    {/* Alumno con foto */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                          {student.avatarUrl ? (
                            <Image
                              src={student.avatarUrl}
                              alt={`${student.firstName} ${student.lastName}`}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                              <User className="w-5 h-5 text-gray" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-dark">
                            {student.firstName} {student.lastName}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Matrícula */}
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray">
                        {student.enrollmentId || '-'}
                      </span>
                    </td>

                    {/* Email */}
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray">
                        {student.email}
                      </span>
                    </td>

                    {/* Carrera Badge */}
                    <td className="px-6 py-4">
                      {student.course ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-dark text-white">
                          {student.course.code}
                        </span>
                      ) : (
                        <span className="text-sm text-gray">Sin carrera</span>
                      )}
                    </td>

                    {/* Materias */}
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray">
                        {student.subjects.length} materia{student.subjects.length !== 1 ? 's' : ''}
                      </span>
                    </td>

                    {/* Estado */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          student.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {student.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(student)}
                          className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(student.id)}
                          className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Crear/Editar */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStudent ? 'Editar Alumno' : 'Nuevo Alumno'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Upload de Foto */}
          <ImageUpload
            value={formData.avatarUrl}
            onChange={handleImageChange}
            label="Foto de Perfil"
          />

          {/* Datos Personales */}
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

          {/* Email y Matrícula */}
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
                placeholder="alumno@universidad.edu"
                className="input-field"
                disabled={!!editingStudent}
              />
              {editingStudent && (
                <p className="text-xs text-gray mt-1">
                  El email no puede modificarse
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Matrícula
              </label>
              <input
                type="text"
                value={formData.enrollmentId}
                onChange={(e) =>
                  setFormData({ ...formData, enrollmentId: e.target.value })
                }
                placeholder="A00123456"
                className="input-field"
              />
            </div>
          </div>

          {/* Carrera (Single Select) */}
          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              Carrera *
            </label>
            <select
              required
              value={formData.courseId}
              onChange={(e) => handleCareerChange(e.target.value)}
              className="input-field"
            >
              <option value="">Selecciona una carrera...</option>
              {careerOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} ({option.description})
                </option>
              ))}
            </select>
          </div>

          {/* Materias (Multi Select) - Solo habilitado si hay carrera */}
          {formData.courseId && (
            <MultiSelect
              label="Materias"
              options={subjectOptions}
              selected={formData.subjectIds}
              onChange={(selected) =>
                setFormData({ ...formData, subjectIds: selected })
              }
              placeholder="Selecciona las materias..."
            />
          )}

          {!formData.courseId && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                💡 Selecciona una carrera para habilitar la selección de materias
              </p>
            </div>
          )}

          {/* Botones */}
          <div className="flex items-center gap-3 pt-4">
            <button type="submit" className="btn-primary flex-1">
              {editingStudent ? 'Actualizar' : 'Crear'} Alumno
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


