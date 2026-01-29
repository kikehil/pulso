'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Search,
  X,
  Mail,
  Phone,
  AlertCircle,
  CheckCircle,
  UserCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  getTeacherStudents,
  getTeacherGroups,
  createStudent,
  enrollStudent,
  unenrollStudent,
} from './actions';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  enrolledGroups: {
    id: string;
    groupName: string;
    groupCode: string;
    subjectName: string;
  }[];
}

interface Group {
  id: string;
  name: string;
  code: string;
  subjectName: string;
  studentCount: number;
}

export default function TeacherStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [studentsData, groupsData] = await Promise.all([
        getTeacherStudents(),
        getTeacherGroups(),
      ]);
      setStudents(studentsData);
      setGroups(groupsData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      showMessage('error', 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  }

  function showMessage(type: 'success' | 'error', text: string) {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  }

  async function handleCreateStudent(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      enrollmentNumber: formData.get('enrollmentNumber') as string,
      password: formData.get('password') as string,
      groupId: formData.get('groupId') as string,
    };

    try {
      await createStudent(data);
      showMessage('success', '¡Alumno creado exitosamente!');
      setShowCreateModal(false);
      loadData();
      (e.target as HTMLFormElement).reset();
    } catch (error: any) {
      showMessage('error', error.message || 'Error al crear el alumno');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEnrollStudent(groupId: string) {
    if (!selectedStudent) return;

    setSubmitting(true);
    try {
      await enrollStudent(selectedStudent.id, groupId);
      showMessage('success', '¡Alumno inscrito exitosamente!');
      setShowEnrollModal(false);
      setSelectedStudent(null);
      loadData();
    } catch (error: any) {
      showMessage('error', error.message || 'Error al inscribir al alumno');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUnenrollStudent(studentId: string, groupId: string) {
    if (!confirm('¿Estás seguro de eliminar este alumno del grupo?')) return;

    try {
      await unenrollStudent(studentId, groupId);
      showMessage('success', 'Alumno eliminado del grupo');
      loadData();
    } catch (error: any) {
      showMessage('error', error.message || 'Error al eliminar al alumno');
    }
  }

  const filteredStudents = students.filter(
    (student) =>
      student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray">Cargando alumnos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-dark">Mis Alumnos</h1>
          <p className="text-gray mt-1">Gestiona los estudiantes de tus grupos</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>Crear Alumno</span>
        </button>
      </div>

      {/* Message Alert */}
      {message && (
        <div
          className={cn(
            'p-4 rounded-lg border flex items-center gap-3',
            message.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          )}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <p>{message.text}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-gray">Total Alumnos</p>
              <p className="text-2xl font-bold text-dark">{students.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray">Mis Grupos</p>
              <p className="text-2xl font-bold text-dark">{groups.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray">Búsquedas</p>
              <p className="text-2xl font-bold text-dark">{filteredStudents.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray" />
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Students List */}
      <div className="card">
        <h2 className="text-lg font-bold text-dark mb-4">Lista de Alumnos</h2>

        {filteredStudents.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray/30 mx-auto mb-4" />
            <p className="text-gray">
              {searchTerm ? 'No se encontraron alumnos' : 'Aún no tienes alumnos registrados'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredStudents.map((student) => (
              <div
                key={student.id}
                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      {student.avatarUrl ? (
                        <img
                          src={student.avatarUrl}
                          alt={student.firstName}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-primary font-bold text-lg">
                          {student.firstName[0]}
                          {student.lastName[0]}
                        </span>
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className="font-bold text-dark">
                        {student.firstName} {student.lastName}
                      </h3>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-1 text-sm text-gray">
                        <span className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {student.email}
                        </span>
                        {student.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            {student.phone}
                          </span>
                        )}
                      </div>

                      {/* Enrolled Groups */}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {student.enrolledGroups.map((group) => (
                          <div
                            key={group.id}
                            className="flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-200 rounded-full"
                          >
                            <span className="text-xs font-medium text-green-800">
                              {group.subjectName} - {group.groupName}
                            </span>
                            <button
                              onClick={() => handleUnenrollStudent(student.id, group.id)}
                              className="text-green-600 hover:text-red-600 transition-colors"
                              title="Eliminar del grupo"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedStudent(student);
                      setShowEnrollModal(true);
                    }}
                    className="btn-secondary text-sm flex items-center gap-1"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span className="hidden sm:inline">Asignar</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Student Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-dark">Crear Nuevo Alumno</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray hover:text-dark"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateStudent} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Nombre *</label>
                    <input
                      type="text"
                      name="firstName"
                      required
                      className="input-field"
                      placeholder="Juan"
                    />
                  </div>
                  <div>
                    <label className="label">Apellido *</label>
                    <input
                      type="text"
                      name="lastName"
                      required
                      className="input-field"
                      placeholder="Pérez"
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Email *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="input-field"
                    placeholder="juan.perez@estudiante.com"
                  />
                </div>

                <div>
                  <label className="label">Teléfono</label>
                  <input
                    type="tel"
                    name="phone"
                    className="input-field"
                    placeholder="1234567890"
                  />
                </div>

                <div>
                  <label className="label">Matrícula *</label>
                  <input
                    type="text"
                    name="enrollmentNumber"
                    required
                    className="input-field"
                    placeholder="2024001"
                  />
                </div>

                <div>
                  <label className="label">Contraseña *</label>
                  <input
                    type="password"
                    name="password"
                    required
                    minLength={6}
                    className="input-field"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>

                <div>
                  <label className="label">Asignar a Grupo *</label>
                  <select name="groupId" required className="input-field">
                    <option value="">Seleccionar grupo...</option>
                    {groups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.subjectName} - {group.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="btn-secondary flex-1"
                    disabled={submitting}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary flex-1" disabled={submitting}>
                    {submitting ? 'Creando...' : 'Crear Alumno'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Enroll Student Modal */}
      {showEnrollModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-dark">Asignar a Grupo</h2>
                <button
                  onClick={() => {
                    setShowEnrollModal(false);
                    setSelectedStudent(null);
                  }}
                  className="text-gray hover:text-dark"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-gray mb-4">
                Selecciona el grupo para asignar a{' '}
                <strong>
                  {selectedStudent.firstName} {selectedStudent.lastName}
                </strong>
              </p>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {groups.map((group) => {
                  const isEnrolled = selectedStudent.enrolledGroups.some((g) => g.id === group.id);

                  return (
                    <button
                      key={group.id}
                      onClick={() => handleEnrollStudent(group.id)}
                      disabled={isEnrolled || submitting}
                      className={cn(
                        'w-full p-4 rounded-lg border-2 text-left transition-all',
                        isEnrolled
                          ? 'border-green-300 bg-green-50 cursor-not-allowed'
                          : 'border-gray-200 hover:border-primary hover:bg-primary/5'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-dark">{group.subjectName}</p>
                          <p className="text-sm text-gray">
                            {group.name} - {group.studentCount} alumnos
                          </p>
                        </div>
                        {isEnrolled && (
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => {
                  setShowEnrollModal(false);
                  setSelectedStudent(null);
                }}
                className="btn-secondary w-full mt-4"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


