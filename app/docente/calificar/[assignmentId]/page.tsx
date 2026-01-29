'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Save, FileText, AlertCircle, Check, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { getAssignmentSubmissions, gradeSubmission } from '../../../docente/actions';
import { formatDate } from '@/lib/utils';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  enrollmentId: string | null;
  avatarUrl: string | null;
  submission: {
    id: string;
    content: string | null;
    fileUrl: string | null;
    score: number | null;
    feedback: string | null;
    submittedAt: Date;
    gradedAt: Date | null;
  } | null;
}

interface Assignment {
  id: string;
  title: string;
  description: string | null;
  dueDate: Date;
  maxScore: number;
  subjectId: string;
  subject: {
    id: string;
    name: string;
    code: string;
  };
}

export default function CalificarPage() {
  const params = useParams();
  const assignmentId = params.assignmentId as string;

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Map<string, { score: number; feedback: string }>>(
    new Map()
  );
  const [saving, setSaving] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, [assignmentId]);

  const loadData = async () => {
    try {
      const data = await getAssignmentSubmissions(assignmentId);
      setAssignment(data.assignment);
      setStudents(data.students);

      // Pre-cargar calificaciones existentes
      const existingGrades = new Map();
      data.students.forEach((student) => {
        if (student.submission && student.submission.score !== null) {
          existingGrades.set(student.id, {
            score: student.submission.score,
            feedback: student.submission.feedback || '',
          });
        }
      });
      setGrades(existingGrades);
    } catch (err) {
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = (studentId: string, score: string) => {
    const numScore = parseFloat(score);
    if (isNaN(numScore) || numScore < 0) return;

    const currentGrade = grades.get(studentId) || { score: 0, feedback: '' };
    setGrades(new Map(grades.set(studentId, { ...currentGrade, score: numScore })));
  };

  const handleFeedbackChange = (studentId: string, feedback: string) => {
    const currentGrade = grades.get(studentId) || { score: 0, feedback: '' };
    setGrades(new Map(grades.set(studentId, { ...currentGrade, feedback })));
  };

  const handleSaveGrade = async (studentId: string, submissionId?: string) => {
    const grade = grades.get(studentId);
    if (!grade) return;

    if (!assignment) return;

    if (grade.score > assignment.maxScore) {
      setError(`La calificación no puede ser mayor a ${assignment.maxScore}`);
      setTimeout(() => setError(''), 3000);
      return;
    }

    setSaving(studentId);
    setError('');
    setSuccess('');

    try {
      await gradeSubmission({
        submissionId,
        assignmentId,
        studentId,
        score: grade.score,
        feedback: grade.feedback || undefined,
      });

      setSuccess('Calificación guardada exitosamente');
      await loadData(); // Recargar datos
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error al guardar la calificación');
    } finally {
      setSaving(null);
    }
  };

  const getSubmissionStatus = (student: Student) => {
    if (!student.submission) {
      return {
        label: 'Sin entregar',
        color: 'text-gray',
        bgColor: 'bg-gray-100',
        icon: <X className="w-4 h-4" />,
      };
    }

    if (student.submission.score !== null) {
      return {
        label: 'Calificada',
        color: 'text-green-700',
        bgColor: 'bg-green-100',
        icon: <Check className="w-4 h-4" />,
      };
    }

    return {
      label: 'Por calificar',
      color: 'text-amber-700',
      bgColor: 'bg-amber-100',
      icon: <FileText className="w-4 h-4" />,
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray">Cargando...</p>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="text-center py-12">
        <p className="text-gray">Tarea no encontrada</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/docente/tareas/${assignment.subjectId}`}
          className="p-2 rounded-lg hover:bg-light transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl lg:text-3xl font-bold text-dark">
            Calificar Entregas
          </h1>
          <p className="text-gray mt-1 font-regular">
            {assignment.title} • {assignment.subject.name}
          </p>
        </div>
      </div>

      {/* Info de la Tarea */}
      <div className="card bg-primary/5 border-primary/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm text-gray">Fecha de vencimiento</p>
            <p className="font-medium text-dark">{formatDate(assignment.dueDate)}</p>
          </div>
          <div>
            <p className="text-sm text-gray">Calificación máxima</p>
            <p className="font-bold text-dark text-2xl">{assignment.maxScore}</p>
          </div>
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
      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-2xl font-bold text-dark">{students.length}</p>
          <p className="text-sm text-gray">Total</p>
        </div>
        <div className="card text-center bg-green-50 border-green-200">
          <p className="text-2xl font-bold text-green-700">
            {students.filter((s) => s.submission && s.submission.score !== null).length}
          </p>
          <p className="text-sm text-green-600">Calificadas</p>
        </div>
        <div className="card text-center bg-amber-50 border-amber-200">
          <p className="text-2xl font-bold text-amber-700">
            {students.filter((s) => s.submission && s.submission.score === null).length}
          </p>
          <p className="text-sm text-amber-600">Pendientes</p>
        </div>
      </div>

      {/* Lista de Estudiantes */}
      <div className="space-y-4">
        {students.map((student) => {
          const status = getSubmissionStatus(student);
          const grade = grades.get(student.id);

          return (
            <div key={student.id} className="card">
              {/* Header del Estudiante */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
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
                  <div>
                    <p className="font-medium text-dark">
                      {student.firstName} {student.lastName}
                    </p>
                    <p className="text-sm text-gray">
                      {student.enrollmentId || student.email}
                    </p>
                  </div>
                </div>

                <span
                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}
                >
                  {status.icon}
                  {status.label}
                </span>
              </div>

              {/* Contenido de la Entrega */}
              {student.submission && (
                <div className="mb-4 p-3 bg-light rounded-lg">
                  <p className="text-sm text-gray mb-2">
                    Entregado el {formatDate(student.submission.submittedAt)}
                  </p>
                  {student.submission.content && (
                    <p className="text-sm text-dark">{student.submission.content}</p>
                  )}
                  {student.submission.fileUrl && (
                    <a
                      href={student.submission.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex items-center gap-1 mt-2"
                    >
                      <FileText className="w-4 h-4" />
                      Ver archivo adjunto
                    </a>
                  )}
                </div>
              )}

              {/* Formulario de Calificación */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">
                    Calificación (0-{assignment.maxScore})
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={assignment.maxScore}
                    step="0.1"
                    value={grade?.score || ''}
                    onChange={(e) => handleScoreChange(student.id, e.target.value)}
                    placeholder="0"
                    className="input-field"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-dark mb-2">
                    Retroalimentación (opcional)
                  </label>
                  <input
                    type="text"
                    value={grade?.feedback || ''}
                    onChange={(e) => handleFeedbackChange(student.id, e.target.value)}
                    placeholder="Escribe comentarios para el alumno..."
                    className="input-field"
                  />
                </div>
              </div>

              {/* Botón Guardar */}
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => handleSaveGrade(student.id, student.submission?.id)}
                  disabled={!grade || saving === student.id}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {saving === student.id ? 'Guardando...' : 'Guardar Calificación'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


