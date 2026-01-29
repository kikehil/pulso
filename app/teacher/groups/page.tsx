'use client';

import { useState, useEffect } from 'react';
import {
  FolderOpen,
  Users,
  BookOpen,
  Calendar,
  Edit2,
  Trash2,
  Plus,
  AlertCircle,
  CheckCircle,
  UserPlus,
  GraduationCap,
} from 'lucide-react';
import Link from 'next/link';
import { getTeacherGroupsDetailed, getAllCourses, deleteGroup, deleteCourse } from './actions';
import { CourseModal } from '@/components/modals/course-modal';
import { GroupModal } from '@/components/modals/group-modal';
import { AssignStudentsModal } from '@/components/modals/assign-students-modal';

interface Group {
  id: string;
  name: string;
  code: string;
  subjectId?: string;
  schedule: string | null;
  isActive: boolean;
  course: {
    id: string;
    name: string;
    code: string;
  };
  _count: {
    enrollments: number;
  };
}

interface Course {
  id: string;
  name: string;
  code: string;
  credits: number;
  description: string | null;
  isActive: boolean;
}

export default function TeacherGroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'groups' | 'courses'>('groups');

  // Modal states
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [assignStudentsModalOpen, setAssignStudentsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [groupsData, coursesData] = await Promise.all([
        getTeacherGroupsDetailed(),
        getAllCourses(),
      ]);
      setGroups(groupsData);
      setCourses(coursesData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleDeleteGroup = async (groupId: string, groupName: string) => {
    if (!confirm(`¿Estás seguro de eliminar el grupo "${groupName}"?`)) return;

    const result = await deleteGroup(groupId);
    if (result.success) {
      await loadData();
    } else {
      alert(result.error);
    }
  };

  const handleDeleteCourse = async (courseId: string, courseName: string) => {
    if (!confirm(`¿Estás seguro de eliminar la materia "${courseName}"?`)) return;

    const result = await deleteCourse(courseId);
    if (result.success) {
      await loadData();
    } else {
      alert(result.error);
    }
  };

  const handleEditGroup = (group: Group) => {
    setEditingGroup({
      ...group,
      subjectId: group.course.id, // course.id ahora contiene el subjectId gracias al mapeo
      schedule: group.schedule || '',
    });
    setGroupModalOpen(true);
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setCourseModalOpen(true);
  };

  const handleAssignStudents = (group: Group) => {
    setSelectedGroup(group);
    setAssignStudentsModalOpen(true);
  };

  const filteredGroups = groups.filter(
    (group) =>
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCourses = courses.filter(
    (course) =>
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeGroups = filteredGroups.filter((g) => g.isActive);
  const inactiveGroups = filteredGroups.filter((g) => !g.isActive);
  const activeCourses = filteredCourses.filter((c) => c.isActive);
  const inactiveCourses = filteredCourses.filter((c) => !c.isActive);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-dark">Gestión Académica</h1>
            <p className="text-gray mt-1">Administra tus materias, grupos y estudiantes</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setEditingCourse(null);
                setCourseModalOpen(true);
              }}
              className="btn-secondary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nueva Materia</span>
            </button>
            <button
              onClick={() => {
                setEditingGroup(null);
                setGroupModalOpen(true);
              }}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nuevo Grupo</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <FolderOpen className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray">Grupos</p>
                <p className="text-2xl font-bold text-dark">{activeGroups.length}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray">Materias</p>
                <p className="text-2xl font-bold text-dark">{activeCourses.length}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray">Estudiantes</p>
                <p className="text-2xl font-bold text-dark">
                  {activeGroups.reduce((sum, g) => sum + g._count.enrollments, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray">Promedio</p>
                <p className="text-2xl font-bold text-dark">
                  {activeGroups.length > 0
                    ? Math.round(
                        activeGroups.reduce((sum, g) => sum + g._count.enrollments, 0) /
                          activeGroups.length
                      )
                    : 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="card">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('groups')}
              className={`flex-1 px-6 py-3 font-medium transition-colors ${
                activeTab === 'groups'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray hover:text-dark'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <FolderOpen className="w-4 h-4" />
                Mis Grupos
              </div>
            </button>
            <button
              onClick={() => setActiveTab('courses')}
              className={`flex-1 px-6 py-3 font-medium transition-colors ${
                activeTab === 'courses'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray hover:text-dark'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <BookOpen className="w-4 h-4" />
                Materias
              </div>
            </button>
          </div>

          {/* Search Bar */}
          <div className="p-4">
            <div className="relative">
              <input
                type="text"
                placeholder={
                  activeTab === 'groups'
                    ? 'Buscar por grupo, materia o código...'
                    : 'Buscar por materia o código...'
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                {activeTab === 'groups' ? (
                  <FolderOpen className="w-5 h-5 text-gray" />
                ) : (
                  <BookOpen className="w-5 h-5 text-gray" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'groups' ? (
          <div className="space-y-6">
            {/* Active Groups */}
            {activeGroups.length > 0 && (
              <div className="card">
                <h2 className="text-lg font-bold text-dark mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Grupos Activos
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeGroups.map((group) => (
                    <div
                      key={group.id}
                      className="p-4 border-2 border-gray-200 rounded-xl hover:border-primary hover:shadow-lg transition-all duration-200 group/card"
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-dark text-lg group-hover/card:text-primary transition-colors line-clamp-1">
                            {group.course.name}
                          </h3>
                          <p className="text-sm text-gray">{group.course.code}</p>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-5 h-5 text-primary" />
                        </div>
                      </div>

                      {/* Group Info */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <FolderOpen className="w-4 h-4 text-gray" />
                          <span className="text-dark font-medium">{group.name}</span>
                          <span className="text-xs text-gray">({group.code})</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <Users className="w-4 h-4 text-gray" />
                          <span className="text-gray">
                            {group._count.enrollments}{' '}
                            {group._count.enrollments === 1 ? 'alumno' : 'alumnos'}
                          </span>
                        </div>

                        {group.schedule && (
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-gray" />
                            <span className="text-gray text-xs">{group.schedule}</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-3 border-t border-gray-200">
                        <Link
                          href={`/teacher/class/${group.id}`}
                          className="flex-1 btn-secondary text-center text-sm py-2"
                        >
                          Ver Clase
                        </Link>
                        <button
                          onClick={() => handleAssignStudents(group)}
                          className="btn-primary p-2"
                          title="Asignar alumnos"
                        >
                          <UserPlus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditGroup(group)}
                          className="btn-secondary p-2"
                          title="Editar grupo"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteGroup(group.id, group.name)}
                          className="btn-secondary p-2 text-red-600 hover:bg-red-50"
                          title="Eliminar grupo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Inactive Groups */}
            {inactiveGroups.length > 0 && (
              <div className="card bg-slate-50">
                <h2 className="text-lg font-bold text-dark mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-slate-500" />
                  Grupos Inactivos
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {inactiveGroups.map((group) => (
                    <div
                      key={group.id}
                      className="p-4 border-2 border-slate-300 rounded-xl bg-white opacity-60"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-dark text-lg line-clamp-1">
                            {group.course.name}
                          </h3>
                          <p className="text-sm text-gray">{group.course.code}</p>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-5 h-5 text-slate-500" />
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <FolderOpen className="w-4 h-4 text-gray" />
                          <span className="text-dark font-medium">{group.name}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <Users className="w-4 h-4 text-gray" />
                          <span className="text-gray">
                            {group._count.enrollments}{' '}
                            {group._count.enrollments === 1 ? 'alumno' : 'alumnos'}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-3 border-t border-slate-300">
                        <button
                          onClick={() => handleEditGroup(group)}
                          className="flex-1 btn-secondary text-sm py-2"
                        >
                          Reactivar
                        </button>
                        <button
                          onClick={() => handleDeleteGroup(group.id, group.name)}
                          className="btn-secondary p-2 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {filteredGroups.length === 0 && (
              <div className="card text-center py-12">
                <FolderOpen className="w-16 h-16 text-gray/30 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-dark mb-2">
                  {searchTerm ? 'No se encontraron grupos' : 'No tienes grupos creados'}
                </h3>
                <p className="text-gray mb-4">
                  {searchTerm
                    ? 'Intenta con otros términos de búsqueda'
                    : 'Crea tu primer grupo para comenzar'}
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => {
                      setEditingGroup(null);
                      setGroupModalOpen(true);
                    }}
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Crear Grupo
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Active Courses */}
            {activeCourses.length > 0 && (
              <div className="card">
                <h2 className="text-lg font-bold text-dark mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Materias Activas
                </h2>

                <div className="space-y-3">
                  {activeCourses.map((course) => {
                    const courseGroups = groups.filter((g) => g.course.id === course.id);
                    const totalStudents = courseGroups.reduce(
                      (sum, g) => sum + g._count.enrollments,
                      0
                    );

                    return (
                      <div
                        key={course.id}
                        className="p-4 border-2 border-gray-200 rounded-xl hover:border-primary transition-all"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <BookOpen className="w-5 h-5 text-primary" />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-bold text-dark text-lg">{course.name}</h3>
                                <p className="text-sm text-gray mb-2">
                                  {course.code} • {course.credits} créditos
                                </p>
                                {course.description && (
                                  <p className="text-sm text-gray">{course.description}</p>
                                )}
                                <div className="flex items-center gap-4 mt-2">
                                  <span className="text-xs text-gray flex items-center gap-1">
                                    <FolderOpen className="w-3 h-3" />
                                    {courseGroups.length}{' '}
                                    {courseGroups.length === 1 ? 'grupo' : 'grupos'}
                                  </span>
                                  <span className="text-xs text-gray flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    {totalStudents}{' '}
                                    {totalStudents === 1 ? 'estudiante' : 'estudiantes'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditCourse(course)}
                              className="btn-secondary p-2"
                              title="Editar materia"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCourse(course.id, course.name)}
                              className="btn-secondary p-2 text-red-600 hover:bg-red-50"
                              title="Eliminar materia"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Inactive Courses */}
            {inactiveCourses.length > 0 && (
              <div className="card bg-slate-50">
                <h2 className="text-lg font-bold text-dark mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-slate-500" />
                  Materias Inactivas
                </h2>

                <div className="space-y-3">
                  {inactiveCourses.map((course) => (
                    <div
                      key={course.id}
                      className="p-4 border-2 border-slate-300 rounded-xl bg-white opacity-60"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-bold text-dark">{course.name}</h3>
                          <p className="text-sm text-gray">
                            {course.code} • {course.credits} créditos
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditCourse(course)}
                            className="btn-secondary p-2"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCourse(course.id, course.name)}
                            className="btn-secondary p-2 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {filteredCourses.length === 0 && (
              <div className="card text-center py-12">
                <BookOpen className="w-16 h-16 text-gray/30 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-dark mb-2">
                  {searchTerm ? 'No se encontraron materias' : 'No tienes materias creadas'}
                </h3>
                <p className="text-gray mb-4">
                  {searchTerm
                    ? 'Intenta con otros términos de búsqueda'
                    : 'Crea tu primera materia para comenzar'}
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => {
                      setEditingCourse(null);
                      setCourseModalOpen(true);
                    }}
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Crear Materia
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <CourseModal
        isOpen={courseModalOpen}
        onClose={() => {
          setCourseModalOpen(false);
          setEditingCourse(null);
        }}
        onSuccess={loadData}
        course={
          editingCourse
            ? { ...editingCourse, description: editingCourse.description ?? '' }
            : null
        }
      />

      <GroupModal
        isOpen={groupModalOpen}
        onClose={() => {
          setGroupModalOpen(false);
          setEditingGroup(null);
        }}
        onSuccess={loadData}
        group={
          editingGroup
            ? {
                id: editingGroup.id,
                name: editingGroup.name,
                code: editingGroup.code,
                subjectId: editingGroup.subjectId ?? editingGroup.course.id,
                schedule: editingGroup.schedule ?? '',
                isActive: editingGroup.isActive,
              }
            : null
        }
      />

      {selectedGroup && (
        <AssignStudentsModal
          isOpen={assignStudentsModalOpen}
          onClose={() => {
            setAssignStudentsModalOpen(false);
            setSelectedGroup(null);
          }}
          onSuccess={loadData}
          groupId={selectedGroup.id}
          groupName={selectedGroup.name}
          courseName={selectedGroup.course.name}
        />
      )}
    </>
  );
}
