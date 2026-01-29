'use client';

import { useState, useEffect } from 'react';
import { Check, X, Clock, CheckCircle2 } from 'lucide-react';
import { getGroupStudents, getTodayAttendance, saveAttendance } from '@/app/teacher/class/[id]/actions';
import { PulseTecIcon } from './pulsetec-logo';
import { Modal } from './modal';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  enrollmentId: string | null;
  avatarUrl: string | null;
}

interface AttendanceRecord {
  studentId: string;
  status: string;
  notes?: string;
}

interface AttendanceTabProps {
  groupId: string;
}

export function AttendanceTab({ groupId }: AttendanceTabProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Map<string, { status: string; notes?: string }>>(new Map());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [attendancePercent, setAttendancePercent] = useState(0);
  
  // Modal de justificación
  const [isJustificationModalOpen, setIsJustificationModalOpen] = useState(false);
  const [currentStudentId, setCurrentStudentId] = useState<string | null>(null);
  const [justificationNote, setJustificationNote] = useState('');

  useEffect(() => {
    loadData();
  }, [groupId]);

  async function loadData() {
    try {
      const [studentsData, todaySession] = await Promise.all([
        getGroupStudents(groupId),
        getTodayAttendance(groupId),
      ]);

      setStudents(studentsData);

      // Cargar asistencia existente de hoy
      if (todaySession) {
        const attendanceMap = new Map();
        todaySession.records.forEach((record: any) => {
          attendanceMap.set(record.studentId, {
            status: record.status,
            notes: record.notes || undefined,
          });
        });
        setAttendance(attendanceMap);
        setAttendancePercent(todaySession.attendancePercent);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  }

  function setStudentStatus(studentId: string, status: string) {
    // Si es justificado, abrir modal
    if (status === 'JUSTIFICADO') {
      setCurrentStudentId(studentId);
      const existingRecord = attendance.get(studentId);
      setJustificationNote(existingRecord?.notes || '');
      setIsJustificationModalOpen(true);
      return;
    }

    setAttendance((prev) => {
      const newAttendance = new Map(prev);
      const current = newAttendance.get(studentId);
      if (current?.status === status) {
        newAttendance.delete(studentId);
      } else {
        newAttendance.set(studentId, { status });
      }
      return newAttendance;
    });
  }

  function handleSaveJustification() {
    if (!currentStudentId) return;

    setAttendance((prev) => {
      const newAttendance = new Map(prev);
      newAttendance.set(currentStudentId, {
        status: 'JUSTIFICADO',
        notes: justificationNote,
      });
      return newAttendance;
    });

    setIsJustificationModalOpen(false);
    setCurrentStudentId(null);
    setJustificationNote('');
  }

  async function handleSave() {
    setSaving(true);
    try {
      const attendanceData: AttendanceRecord[] = [];
      students.forEach((student) => {
        const record = attendance.get(student.id);
        const status = record?.status || 'FALTA';
        attendanceData.push({
          studentId: student.id,
          status,
          notes: record?.notes,
        });
      });

      const result = await saveAttendance(groupId, attendanceData);
      if (result.success && result.attendancePercent !== undefined) {
        setAttendancePercent(result.attendancePercent);
        alert('Asistencia guardada exitosamente');
      } else {
        alert('Error al guardar asistencia');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar asistencia');
    } finally {
      setSaving(false);
    }
  }

  // Calcular progreso
  const markedCount = attendance.size;
  const progress = students.length > 0 ? (markedCount / students.length) * 100 : 0;

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

  const today = new Date();
  const formattedDate = today.toLocaleDateString('es-ES', { 
    day: 'numeric', 
    month: 'short' 
  });

  return (
    <div className="space-y-6">
      {/* Card de Resumen de Asistencia */}
      <div className="bg-white rounded-2xl shadow-md p-6 relative">
        {/* Isotipo PulseTec */}
        <div className="absolute top-4 right-4 w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center p-1">
          <PulseTecIcon className="text-primary" />
        </div>

        {/* Título */}
        <h3 className="text-lg font-bold text-dark mb-6">
          Resumen de Asistencia
        </h3>

        {/* Porcentaje Principal */}
        <div className="mb-2">
          <p className={`text-5xl font-bold ${attendancePercent >= 90 ? 'text-dark' : attendancePercent >= 70 ? 'text-amber-600' : 'text-red-600'}`}>
            {attendancePercent.toFixed(0)}%
          </p>
        </div>

        {/* Fecha */}
        <p className="text-sm text-gray">
          Hoy, {formattedDate}
        </p>
      </div>

      {/* Barra de Progreso */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-dark">
            Progreso de toma de lista
          </p>
          <p className="text-sm text-gray">
            {markedCount} / {students.length} marcados
          </p>
        </div>
        <div className="w-full bg-gray/20 rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Tabla de Asistencia */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-light border-b border-gray/20">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray uppercase tracking-wider">
                  Alumno
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray uppercase tracking-wider">
                  Presente
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray uppercase tracking-wider">
                  Retardo
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray uppercase tracking-wider">
                  Falta
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray uppercase tracking-wider">
                  Justificado
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray/10">
              {students.map((student) => {
                const record = attendance.get(student.id);
                const status = record?.status;

                return (
                  <tr key={student.id} className="hover:bg-light/50 transition-colors">
                    {/* Columna del Alumno */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                          {student.avatarUrl ? (
                            <img
                              src={student.avatarUrl}
                              alt=""
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-medium text-primary">
                              {student.firstName[0]}{student.lastName[0]}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-dark">
                            {student.firstName} {student.lastName}
                          </p>
                          <p className="text-xs text-gray">
                            {student.enrollmentId || 'Sin matrícula'}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Botón Presente */}
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setStudentStatus(student.id, 'PRESENTE')}
                        className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                          status === 'PRESENTE'
                            ? 'bg-primary border-primary'
                            : 'border-gray hover:border-primary/50'
                        }`}
                      >
                        {status === 'PRESENTE' && <Check className="w-5 h-5 text-white" />}
                      </button>
                    </td>

                    {/* Botón Retardo */}
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setStudentStatus(student.id, 'RETARDO')}
                        className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                          status === 'RETARDO'
                            ? 'bg-amber-500 border-amber-500'
                            : 'border-gray hover:border-amber-500/50'
                        }`}
                      >
                        {status === 'RETARDO' && <Clock className="w-5 h-5 text-white" />}
                      </button>
                    </td>

                    {/* Botón Falta */}
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setStudentStatus(student.id, 'FALTA')}
                        className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                          status === 'FALTA'
                            ? 'bg-red-500 border-red-500'
                            : 'border-gray hover:border-red-500/50'
                        }`}
                      >
                        {status === 'FALTA' && <X className="w-5 h-5 text-white" />}
                      </button>
                    </td>

                    {/* Botón Justificado */}
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setStudentStatus(student.id, 'JUSTIFICADO')}
                        className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                          status === 'JUSTIFICADO'
                            ? 'bg-blue-500 border-blue-500'
                            : 'border-gray hover:border-blue-500/50'
                        }`}
                      >
                        {status === 'JUSTIFICADO' && <CheckCircle2 className="w-5 h-5 text-white" />}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Botón Guardar */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving || markedCount === 0}
          className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-dark transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {saving ? 'Guardando...' : 'Guardar Asistencia'}
        </button>
      </div>

      {/* Modal de Justificación */}
      <Modal
        isOpen={isJustificationModalOpen}
        onClose={() => {
          setIsJustificationModalOpen(false);
          setCurrentStudentId(null);
          setJustificationNote('');
        }}
        title="Justificar Inasistencia"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray">
            Ingresa el motivo de la justificación para{' '}
            <span className="font-medium text-dark">
              {currentStudentId &&
                students.find((s) => s.id === currentStudentId)?.firstName}{' '}
              {currentStudentId &&
                students.find((s) => s.id === currentStudentId)?.lastName}
            </span>
          </p>

          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              Motivo de justificación
            </label>
            <textarea
              value={justificationNote}
              onChange={(e) => setJustificationNote(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all resize-none"
              placeholder="Ej: Cita médica, tramite personal, etc."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsJustificationModalOpen(false);
                setCurrentStudentId(null);
                setJustificationNote('');
              }}
              className="flex-1 px-4 py-2 border border-gray/30 text-gray rounded-lg hover:bg-gray/5 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveJustification}
              disabled={!justificationNote.trim()}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-dark transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Guardar Justificación
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

