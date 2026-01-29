'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Save, AlertCircle, CheckCircle, Clock, XCircle, FileCheck } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { AttendanceSummaryCard } from '@/components/attendance-summary-card';
import { ATTENDANCE_STATUS, type AttendanceStatus, getAttendanceStatusColor } from '@/lib/types';
import { calculateAttendanceStats } from '@/lib/attendance';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  enrollmentId: string | null;
  avatarUrl: string | null;
}

export default function AsistenciaV2Page() {
  const params = useParams();
  const subjectId = params.subjectId as string;

  const [students, setStudents] = useState<Student[]>([]);
  const [attendances, setAttendances] = useState<Map<string, AttendanceStatus>>(new Map());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [subjectName, setSubjectName] = useState('');

  useEffect(() => {
    loadStudents();
  }, [subjectId]);

  const loadStudents = async () => {
    try {
      // TODO: Implementar getSubjectStudentsV2 que use el nuevo sistema
      // Por ahora simulamos datos
      const mockStudents: Student[] = [
        {
          id: '1',
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juan@mail.com',
          enrollmentId: '20231001',
          avatarUrl: null,
        },
        {
          id: '2',
          firstName: 'María',
          lastName: 'García',
          email: 'maria@mail.com',
          enrollmentId: '20231002',
          avatarUrl: null,
        },
        // Agregar más estudiantes de prueba...
      ];
      setStudents(mockStudents);
      setSubjectName('Matemáticas I');
    } catch (err) {
      setError('Error al cargar los estudiantes');
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceChange = (studentId: string, status: AttendanceStatus) => {
    setAttendances(new Map(attendances.set(studentId, status)));
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const attendanceList = Array.from(attendances.entries()).map(
        ([studentId, status]) => ({
          studentId,
          status,
        })
      );

      if (attendanceList.length === 0) {
        setError('No hay asistencias para guardar');
        setSaving(false);
        return;
      }

      // TODO: Implementar saveAttendanceSession
      // await saveAttendanceSession({ subjectId, attendances: attendanceList });

      setSuccess(`Asistencia guardada para ${attendanceList.length} estudiantes`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error al guardar la asistencia');
    } finally {
      setSaving(false);
    }
  };

  // Calcular estadísticas en tiempo real
  const records = Array.from(attendances.values()).map((status) => ({ status }));
  const stats = calculateAttendanceStats(records, students.length);

  // Progreso de marcado (cuántos alumnos ya tienen estado asignado)
  const markedCount = attendances.size;
  const progressPercent = students.length > 0 ? (markedCount / students.length) * 100 : 0;

  const getStatusButton = (
    studentId: string,
    status: AttendanceStatus,
    icon: React.ReactNode,
    label: string
  ) => {
    const isSelected = attendances.get(studentId) === status;
    const colors = getAttendanceStatusColor(status);

    return (
      <button
        onClick={() => handleAttendanceChange(studentId, status)}
        className={`
          relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-200
          ${
            isSelected
              ? 'border-transparent shadow-lg scale-110'
              : 'border-gray-300 hover:border-gray-400 hover:scale-105'
          }
        `}
        style={{
          backgroundColor: isSelected ? colors.fill : 'transparent',
          color: isSelected ? '#FFFFFF' : '#9CA3AF',
        }}
        title={label}
      >
        {icon}
      </button>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/docente"
          className="p-2 rounded-lg hover:bg-light transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl lg:text-3xl font-bold text-dark">
            Control de Asistencia
          </h1>
          <p className="text-gray mt-1 font-regular">
            {subjectName} • {new Date().toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>

      {/* Mensajes */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          {success}
        </div>
      )}

      {/* Barra de Progreso de Marcado */}
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-dark">
            Progreso de Marcado
          </span>
          <span className="text-sm font-bold text-primary">
            {markedCount}/{students.length}
          </span>
        </div>
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-xs text-gray mt-2">
          {markedCount === students.length
            ? '¡Todos los alumnos marcados! 🎉'
            : `Faltan ${students.length - markedCount} alumnos por marcar`}
        </p>
      </div>

      {/* Grid de Estadísticas y Resumen */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card de Resumen de Asistencia */}
        <AttendanceSummaryCard
          percentage={stats.attendancePercent}
          totalStudents={stats.totalStudents}
          presentStudents={stats.presentCount}
          lateStudents={stats.lateCount}
          showDetails={true}
        />

        {/* Estadísticas Detalladas */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="card text-center bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-700">{stats.presentCount}</p>
            <p className="text-sm text-green-600 font-medium">Presentes</p>
          </div>

          <div className="card text-center bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-yellow-700">{stats.lateCount}</p>
            <p className="text-sm text-yellow-600 font-medium">Retardos</p>
          </div>

          <div className="card text-center bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-red-700">{stats.absentCount}</p>
            <p className="text-sm text-red-600 font-medium">Faltas</p>
          </div>

          <div className="card text-center bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <FileCheck className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-700">{stats.justifiedCount}</p>
            <p className="text-sm text-blue-600 font-medium">Justificadas</p>
          </div>
        </div>
      </div>

      {/* Tabla de Alumnos */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark text-white">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold">Alumno</th>
                <th className="px-6 py-4 text-center text-sm font-bold">Presente</th>
                <th className="px-6 py-4 text-center text-sm font-bold">Retardo</th>
                <th className="px-6 py-4 text-center text-sm font-bold">Falta</th>
                <th className="px-6 py-4 text-center text-sm font-bold">Justificada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray">
                    Cargando estudiantes...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray">
                    No hay estudiantes inscritos en esta materia
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr
                    key={student.id}
                    className={`hover:bg-light transition-colors ${
                      attendances.has(student.id) ? 'bg-primary/5' : ''
                    }`}
                  >
                    {/* Columna Alumno */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                          {student.avatarUrl ? (
                            <Image
                              src={student.avatarUrl}
                              alt={`${student.firstName} ${student.lastName}`}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray">
                              <span className="text-sm font-bold">
                                {student.firstName[0]}{student.lastName[0]}
                              </span>
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-dark">
                            {student.firstName} {student.lastName}
                          </p>
                          <p className="text-xs text-gray">
                            {student.enrollmentId || student.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Botones de Estado */}
                    <td className="px-6 py-4 text-center">
                      {getStatusButton(
                        student.id,
                        ATTENDANCE_STATUS.PRESENTE,
                        <CheckCircle className="w-6 h-6" />,
                        'Presente'
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getStatusButton(
                        student.id,
                        ATTENDANCE_STATUS.RETARDO,
                        <Clock className="w-6 h-6" />,
                        'Retardo'
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getStatusButton(
                        student.id,
                        ATTENDANCE_STATUS.FALTA,
                        <XCircle className="w-6 h-6" />,
                        'Falta'
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getStatusButton(
                        student.id,
                        ATTENDANCE_STATUS.JUSTIFICADO,
                        <FileCheck className="w-6 h-6" />,
                        'Justificada'
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Botón Guardar Flotante */}
      {students.length > 0 && (
        <div className="sticky bottom-6 flex justify-end">
          <button
            onClick={handleSaveAll}
            disabled={saving || attendances.size === 0}
            className="btn-primary shadow-2xl inline-flex items-center gap-3 px-8 py-4 text-lg"
          >
            <Save className="w-6 h-6" />
            {saving ? 'Guardando...' : `Guardar Asistencia (${attendances.size})`}
          </button>
        </div>
      )}
    </div>
  );
}


