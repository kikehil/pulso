'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Pencil, Trash2, Users, BookOpen, Calendar, UserPlus } from 'lucide-react';
import { Modal } from '@/components/modal';
import { MultiSelect } from '@/components/multi-select';
import {
  getGroups,
  createGroup,
  updateGroup,
  deleteGroup,
  getCourses,
  getAvailableStudents,
  getGroupStudents,
  assignStudentsToGroup,
  removeStudentFromGroup,
  searchGroups,
} from './actions';

type Group = {
  id: string;
  name: string;
  code: string;
  courseId: string; // ✓ Agregado para poder obtener alumnos por carrera
  semester: string | null;
  academicYear: string | null;
  maxStudents: number | null;
  course: {
    name: string;
    code: string;
  };
  enrollments: Array<{
    student: {
      firstName: string;
      lastName: string;
      avatarUrl: string | null;
    };
  }>;
  _count: {
    enrollments: number;
  };
};

type Course = {
  id: string;
  name: string;
  code: string;
};

type Student = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  enrollmentId: string | null;
  avatarUrl: string | null;
};

export default function GruposPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal de creación/edición
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  
  // Modal de asignación de alumnos
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [availableStudents, setAvailableStudents] = useState<Student[]>([]);
  const [groupStudents, setGroupStudents] = useState<Student[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [isAssigning, setIsAssigning] = useState(false); // ✓ Estado de loading

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    courseId: '',
    semester: '',
    academicYear: '',
    maxStudents: '',
  });

  // Cargar datos iniciales
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [groupsData, coursesData] = await Promise.all([
        getGroups(),
        getCourses(),
      ]);
      setGroups(groupsData);
      setCourses(coursesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  // Buscar grupos
  async function handleSearch() {
    if (!searchQuery.trim()) {
      loadData();
      return;
    }

    try {
      setLoading(true);
      const results = await searchGroups(searchQuery);
      setGroups(results);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  }

  // Abrir modal para crear
  function handleCreate() {
    setEditingGroup(null);
    setFormData({
      name: '',
      code: '',
      courseId: '',
      semester: '',
      academicYear: new Date().getFullYear().toString(),
      maxStudents: '30',
    });
    setIsModalOpen(true);
  }

  // Abrir modal para editar
  function handleEdit(group: Group) {
    setEditingGroup(group);
    
    // Buscar el courseId basado en el nombre de la carrera
    const course = courses.find(c => c.name === group.course.name);
    
    setFormData({
      name: group.name,
      code: group.code,
      courseId: course?.id || '',
      semester: group.semester || '',
      academicYear: group.academicYear || '',
      maxStudents: group.maxStudents?.toString() || '',
    });
    setIsModalOpen(true);
  }

  // Guardar grupo (crear o actualizar)
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validar que se haya seleccionado una carrera
    if (!formData.courseId) {
      alert('Por favor selecciona una carrera');
      return;
    }

    try {
      const submitData = {
        name: formData.name,
        code: formData.code,
        courseId: formData.courseId,
        semester: formData.semester || undefined,
        academicYear: formData.academicYear || undefined,
        maxStudents: formData.maxStudents ? parseInt(formData.maxStudents) : undefined,
      };

      console.log('Enviando datos:', submitData); // Debug

      if (editingGroup) {
        const result = await updateGroup(editingGroup.id, submitData);
        if (result.success) {
          await loadData();
          setTimeout(() => setIsModalOpen(false), 300);
        } else {
          alert(result.error || 'Error al actualizar el grupo');
        }
      } else {
        const result = await createGroup(submitData);
        if (result.success) {
          await loadData();
          setTimeout(() => setIsModalOpen(false), 300);
        } else {
          alert(result.error || 'Error al crear el grupo');
        }
      }
    } catch (error) {
      console.error('Error saving group:', error);
      alert('Error al guardar el grupo. Revisa la consola.');
    }
  }

  // Eliminar grupo
  async function handleDelete(id: string) {
    if (!confirm('¿Estás seguro de eliminar este grupo? Los alumnos no se eliminarán.')) return;

    try {
      const result = await deleteGroup(id);
      if (result.success) {
        await loadData();
      }
    } catch (error) {
      console.error('Error deleting group:', error);
    }
  }

  // Abrir modal de asignación de alumnos
  async function handleAssignStudents(group: Group) {
    setSelectedGroup(group);
    
    try {
      const [available, current] = await Promise.all([
        getAvailableStudents(group.courseId), // ✓ Corregido: usa courseId en lugar de course.name
        getGroupStudents(group.id),
      ]);
      
      setAvailableStudents(available);
      setGroupStudents(current);
      setSelectedStudentIds([]);
      setIsAssignModalOpen(true);
    } catch (error) {
      console.error('Error loading students:', error);
    }
  }

  // Asignar alumnos seleccionados
  async function handleSaveAssignments() {
    if (!selectedGroup || selectedStudentIds.length === 0) return;

    setIsAssigning(true);
    try {
      console.log('🔄 Asignando alumnos...', selectedStudentIds);
      const result = await assignStudentsToGroup(selectedGroup.id, selectedStudentIds);
      
      if (result.success) {
        console.log('✓ Alumnos asignados exitosamente');
        await loadData();
        setSelectedStudentIds([]); // Limpiar selección
        setIsAssignModalOpen(false);
      } else {
        console.error('❌ Error:', result.error);
        alert(result.error || 'Error al asignar alumnos');
      }
    } catch (error) {
      console.error('❌ Error assigning students:', error);
      alert('Error al asignar alumnos. Por favor intenta de nuevo.');
    } finally {
      setIsAssigning(false);
    }
  }

  // Remover alumno del grupo
  async function handleRemoveStudent(studentId: string) {
    if (!selectedGroup) return;
    if (!confirm('¿Remover este alumno del grupo?')) return;

    try {
      const result = await removeStudentFromGroup(selectedGroup.id, studentId);
      if (result.success) {
        const updated = await getGroupStudents(selectedGroup.id);
        setGroupStudents(updated);
        await loadData();
      }
    } catch (error) {
      console.error('Error removing student:', error);
    }
  }

  if (loading && groups.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray">Cargando grupos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark">Grupos</h1>
          <p className="text-gray mt-1">Gestiona los grupos y asignaciones de alumnos</p>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-dark transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Nuevo Grupo
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray" />
          <input
            type="text"
            placeholder="Buscar por nombre, código, semestre o año..."
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

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map((group) => (
          <div
            key={group.id}
            className="bg-white rounded-xl shadow-sm border border-gray/10 p-6 hover:shadow-md transition-shadow"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-bold text-dark text-lg mb-1">{group.name}</h3>
                <p className="text-sm text-gray">{group.code}</p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleEdit(group)}
                  className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                  title="Editar"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(group.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Career Badge */}
            <div className="mb-4">
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-dark text-white text-xs rounded-full">
                <BookOpen className="w-3 h-3" />
                {group.course.name}
              </span>
            </div>

            {/* Info */}
            <div className="space-y-2 mb-4 text-sm text-gray">
              {group.semester && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Semestre {group.semester}</span>
                </div>
              )}
              {group.academicYear && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Ciclo {group.academicYear}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>
                  {group._count.enrollments} alumnos
                  {group.maxStudents && ` / ${group.maxStudents} máx`}
                </span>
              </div>
            </div>

            {/* Students Preview */}
            {group.enrollments.length > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex -space-x-2">
                  {group.enrollments.slice(0, 3).map((enrollment, idx) => (
                    <div
                      key={idx}
                      className="w-8 h-8 rounded-full bg-primary/20 border-2 border-white flex items-center justify-center"
                      title={`${enrollment.student.firstName} ${enrollment.student.lastName}`}
                    >
                      {enrollment.student.avatarUrl ? (
                        <img
                          src={enrollment.student.avatarUrl}
                          alt=""
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-medium text-primary">
                          {enrollment.student.firstName[0]}{enrollment.student.lastName[0]}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                {group.enrollments.length > 3 && (
                  <span className="text-xs text-gray">
                    +{group.enrollments.length - 3} más
                  </span>
                )}
              </div>
            )}

            {/* Assign Button */}
            <button
              onClick={() => handleAssignStudents(group)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-white transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span className="text-sm font-medium">Gestionar Alumnos</span>
            </button>
          </div>
        ))}
      </div>

      {groups.length === 0 && !loading && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray/30 mx-auto mb-4" />
          <p className="text-gray">No hay grupos registrados</p>
          <button
            onClick={handleCreate}
            className="mt-4 text-primary hover:underline"
          >
            Crear el primer grupo
          </button>
        </div>
      )}

      {/* Modal de Creación/Edición */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingGroup ? 'Editar Grupo' : 'Nuevo Grupo'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-dark mb-1">
              Nombre del Grupo *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              placeholder="Ej: Grupo A"
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
              placeholder="Ej: 1A"
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

          {/* Semestre y Año Académico */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark mb-1">
                Semestre
              </label>
              <input
                type="text"
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                className="w-full px-4 py-2 border border-gray/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                placeholder="Ej: 1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1">
                Año Académico
              </label>
              <input
                type="text"
                value={formData.academicYear}
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                className="w-full px-4 py-2 border border-gray/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                placeholder="Ej: 2026"
              />
            </div>
          </div>

          {/* Máximo de Alumnos */}
          <div>
            <label className="block text-sm font-medium text-dark mb-1">
              Máximo de Alumnos
            </label>
            <input
              type="number"
              min="1"
              value={formData.maxStudents}
              onChange={(e) => setFormData({ ...formData, maxStudents: e.target.value })}
              className="w-full px-4 py-2 border border-gray/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              placeholder="Ej: 30"
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
              {editingGroup ? 'Actualizar' : 'Crear Grupo'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de Asignación de Alumnos */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title={`Gestionar Alumnos - ${selectedGroup?.name || ''}`}
      >
        <div className="space-y-4">
          {/* Alumnos Actuales */}
          <div>
            <h3 className="font-medium text-dark mb-2">
              Alumnos en el grupo ({groupStudents.length})
            </h3>
            <div className="max-h-48 overflow-y-auto space-y-2 border border-gray/20 rounded-lg p-2">
              {groupStudents.length === 0 ? (
                <p className="text-sm text-gray text-center py-4">No hay alumnos asignados</p>
              ) : (
                groupStudents.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-2 bg-light rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        {student.avatarUrl ? (
                          <img
                            src={student.avatarUrl}
                            alt=""
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-xs font-medium text-primary">
                            {student.firstName[0]}{student.lastName[0]}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-dark">
                          {student.firstName} {student.lastName}
                        </p>
                        <p className="text-xs text-gray">{student.enrollmentId}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveStudent(student.id)}
                      className="text-red-500 hover:bg-red-50 p-1 rounded transition-colors"
                      title="Remover"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Agregar Nuevos Alumnos */}
          <div>
            <MultiSelect
              label="Agregar Alumnos"
              options={availableStudents
                .filter((s) => !groupStudents.find((gs) => gs.id === s.id))
                .map((s) => ({
                  value: s.id,
                  label: `${s.firstName} ${s.lastName} (${s.enrollmentId || s.email})`,
                }))}
              selected={selectedStudentIds}
              onChange={setSelectedStudentIds}
              placeholder="Selecciona alumnos para agregar..."
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsAssignModalOpen(false)}
              className="flex-1 px-4 py-2 border border-gray/30 text-gray rounded-lg hover:bg-gray/5 transition-colors"
            >
              Cerrar
            </button>
            <button
              onClick={handleSaveAssignments}
              disabled={selectedStudentIds.length === 0 || isAssigning}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-dark transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAssigning ? 'Asignando...' : `Agregar Seleccionados (${selectedStudentIds.length})`}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

