'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, Clock, XCircle, Save, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { getSubjectStudents, bulkSaveAttendance } from '../../actions';
import { ATTENDANCE_STATUS, type AttendanceStatus, getAttendanceStatusColor } from '@/lib/types';

interface StudentWithAttendance {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  enrollmentId: string | null;
  avatarUrl: string | null;
  attendance: {
    id: string;
    status: string;
    notes: string | null;
  } | null;
}

export default function AsistenciaPage() {
  const params = useParams();
  const subjectId = params.subjectId as string;

  const [students, setStudents] = useState<StudentWithAttendance[]>([]);
  const [attendances, setAttendances] = useState<Map<string, AttendanceStatus>>(new Map());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadStudents();
  }, [subjectId]);

  const loadStudents = async () => {
    try {
      const studentsData = await getSubjectStudents(subjectId);
      setStudents(studentsData);

      // Cargar asistencias existentes
      const existingAttendances = new Map<string, AttendanceStatus>();
      studentsData.forEach((student) => {
        if (student.attendance) {
          existingAttendances.set(
            student.id,
            student.attendance.status as AttendanceStatus
          );
        }
      });
      setAttendances(existingAttendances);
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

      await bulkSaveAttendance({
        subjectId,
        attendances: attendanceList,
      });

      setSuccess(`Asistencia guardada para ${attendanceList.length} estudiantes`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error al guardar la asistencia');
    } finally {
      setSaving(false);
    }
  };

  const getAttendanceButton = (
    studentId: string,
    status: AttendanceStatus,
    label: string,
    icon: React.ReactNode
  ) => {
    const isSelected = attendances.get(studentId) === status;
    const colors = getAttendanceStatusColor(status);

    return (
      <button
        onClick={() => handleAttendanceChange(studentId, status)}
        className={`
          flex flex-col items-center gap-1 p-3 rounded-lg transition-all duration-200
          ${
            isSelected
              ? `${colors.bg} ${colors.text} border-2 ${colors.border} shadow-md`
              : 'bg-light border-2 border-transparent hover:bg-gray-50'
          }
        `}
      >
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </button>
    );
  };

  // Calcular estadísticas
  const stats = {
    total: students.length,
    presente: Array.from(attendances.values()).filter(
      (s) => s === ATTENDANCE_STATUS.PRESENTE
    ).length,
    retardo: Array.from(attendances.values()).filter(
      (s) => s === ATTENDANCE_STATUS.RETARDO
    ).length,
    falta: Array.from(attendances.values()).filter(
      (s) => s === ATTENDANCE_STATUS.FALTA
    ).length,
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
            Pasar Lista
          </h1>
          <p className="text-gray mt-1 font-regular">
            Registra la asistencia de hoy • {new Date().toLocaleDateString('es-ES', {
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

      {/* Estadísticas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card text-center">
          <p className="text-2xl font-bold text-dark">{stats.total}</p>
          <p className="text-sm text-gray">Total</p>
        </div>
        <div className="card text-center bg-green-50 border-green-200">
          <p className="text-2xl font-bold text-green-700">{stats.presente}</p>
          <p className="text-sm text-green-600">Presentes</p>
        </div>
        <div className="card text-center bg-yellow-50 border-yellow-200">
          <p className="text-2xl font-bold text-yellow-700">{stats.retardo}</p>
          <p className="text-sm text-yellow-600">Retardos</p>
        </div>
        <div className="card text-center bg-red-50 border-red-200">
          <p className="text-2xl font-bold text-red-700">{stats.falta}</p>
          <p className="text-sm text-red-600">Faltas</p>
        </div>
      </div>

      {/* Lista de Estudiantes */}
      <div className="card">
        {loading ? (
          <div className="text-center text-gray py-12">
            Cargando estudiantes...
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray">No hay estudiantes inscritos en esta materia</p>
          </div>
        ) : (
          <div className="space-y-4">
            {students.map((student) => (
              <div
                key={student.id}
                className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg bg-light border border-gray-200"
              >
                {/* Foto y Nombre */}
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                    {student.avatarUrl ? (
                      <Image
                        src={student.avatarUrl}
                        alt={`${student.firstName} ${student.lastName}`}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray">
                        <span className="text-lg font-bold">
                          {student.firstName[0]}{student.lastName[0]}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-dark">
                      {student.firstName} {student.lastName}
                    </p>
                    <p className="text-sm text-gray">
                      {student.enrollmentId || student.email}
                    </p>
                  </div>
                </div>

                {/* Botones de Estado */}
                <div className="grid grid-cols-3 gap-2 sm:w-auto w-full">
                  {getAttendanceButton(
                    student.id,
                    ATTENDANCE_STATUS.PRESENTE,
                    'Presente',
                    <CheckCircle className="w-5 h-5" />
                  )}
                  {getAttendanceButton(
                    student.id,
                    ATTENDANCE_STATUS.RETARDO,
                    'Retardo',
                    <Clock className="w-5 h-5" />
                  )}
                  {getAttendanceButton(
                    student.id,
                    ATTENDANCE_STATUS.FALTA,
                    'Falta',
                    <XCircle className="w-5 h-5" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Botón Guardar */}
      {students.length > 0 && (
        <div className="sticky bottom-6 flex justify-end">
          <button
            onClick={handleSaveAll}
            disabled={saving || attendances.size === 0}
            className="btn-primary shadow-xl inline-flex items-center gap-2 px-8"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Guardando...' : `Guardar Asistencia (${attendances.size})`}
          </button>
        </div>
      )}
    </div>
  );
}


