'use client';

import { useState, useEffect } from 'react';
import { X, Users, Search, UserPlus, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import {
  getAvailableStudents,
  getGroupStudents,
  assignStudentToGroup,
  removeStudentFromGroup,
} from '@/app/teacher/groups/actions';

interface Student {
  id: string;
  name: string;
  email: string;
  enrollmentNumber: string | null;
}

interface EnrolledStudent extends Student {
  enrollmentId: string;
  studentId: string;
  enrolledAt: Date;
}

interface AssignStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  groupId: string;
  groupName: string;
  courseName: string;
}

export function AssignStudentsModal({
  isOpen,
  onClose,
  onSuccess,
  groupId,
  groupName,
  courseName,
}: AssignStudentsModalProps) {
  const [availableStudents, setAvailableStudents] = useState<Student[]>([]);
  const [enrolledStudents, setEnrolledStudents] = useState<EnrolledStudent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'add' | 'enrolled'>('add');

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, groupId]);

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [available, enrolled] = await Promise.all([
        getAvailableStudents(groupId),
        getGroupStudents(groupId),
      ]);
      setAvailableStudents(available);
      setEnrolledStudents(enrolled);
    } catch (err) {
      setError('Error al cargar los estudiantes');
    } finally {
      setLoading(false);
    }
  }

  async function handleAssignStudent(studentId: string) {
    setError('');
    setSuccess('');
    try {
      const result = await assignStudentToGroup(studentId, groupId);
      if (result.success) {
        setSuccess('Estudiante asignado correctamente');
        await loadData();
        onSuccess();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.error || 'Error al asignar estudiante');
      }
    } catch (err) {
      setError('Error al asignar estudiante');
    }
  }

  async function handleRemoveStudent(enrollmentId: string) {
    if (!confirm('¿Estás seguro de desasignar este estudiante del grupo?')) return;

    setError('');
    setSuccess('');
    try {
      const result = await removeStudentFromGroup(enrollmentId);
      if (result.success) {
        setSuccess('Estudiante desasignado correctamente');
        await loadData();
        onSuccess();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.error || 'Error al desasignar estudiante');
      }
    } catch (err) {
      setError('Error al desasignar estudiante');
    }
  }

  const filteredAvailableStudents = availableStudents.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.enrollmentNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEnrolledStudents = enrolledStudents.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.enrollmentNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-dark">Gestionar Alumnos</h2>
              <p className="text-sm text-gray">
                {courseName} - {groupName}
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

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('add')}
            className={`flex-1 px-6 py-3 font-medium transition-colors ${
              activeTab === 'add'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray hover:text-dark'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <UserPlus className="w-4 h-4" />
              Agregar Alumnos ({availableStudents.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab('enrolled')}
            className={`flex-1 px-6 py-3 font-medium transition-colors ${
              activeTab === 'enrolled'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray hover:text-dark'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Users className="w-4 h-4" />
              Inscritos ({enrolledStudents.length})
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700 text-sm">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Search */}
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Buscar por nombre, email o matrícula..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray" />
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-3"></div>
              <p className="text-gray">Cargando estudiantes...</p>
            </div>
          ) : (
            <>
              {/* Add Students Tab */}
              {activeTab === 'add' && (
                <div className="space-y-2">
                  {filteredAvailableStudents.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray/30 mx-auto mb-3" />
                      <p className="text-gray">
                        {searchTerm
                          ? 'No se encontraron estudiantes'
                          : 'Todos los estudiantes ya están inscritos'}
                      </p>
                    </div>
                  ) : (
                    filteredAvailableStudents.map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-primary transition-colors"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-dark">{student.name}</p>
                          <p className="text-sm text-gray">{student.email}</p>
                          {student.enrollmentNumber && (
                            <p className="text-xs text-gray">
                              Matrícula: {student.enrollmentNumber}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => handleAssignStudent(student.id)}
                          className="btn-primary py-2 px-4 text-sm"
                        >
                          <UserPlus className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Enrolled Students Tab */}
              {activeTab === 'enrolled' && (
                <div className="space-y-2">
                  {filteredEnrolledStudents.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray/30 mx-auto mb-3" />
                      <p className="text-gray">
                        {searchTerm
                          ? 'No se encontraron estudiantes'
                          : 'No hay estudiantes inscritos en este grupo'}
                      </p>
                    </div>
                  ) : (
                    filteredEnrolledStudents.map((student) => (
                      <div
                        key={student.enrollmentId}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-dark">{student.name}</p>
                          <p className="text-sm text-gray">{student.email}</p>
                          {student.enrollmentNumber && (
                            <p className="text-xs text-gray">
                              Matrícula: {student.enrollmentNumber}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemoveStudent(student.enrollmentId)}
                          className="btn-secondary py-2 px-4 text-sm text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <button onClick={onClose} className="btn-secondary w-full">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

