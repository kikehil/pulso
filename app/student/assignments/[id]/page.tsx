'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getAssignmentDetail, submitAssignment } from '../actions';
import { Calendar, User, BookOpen, Upload, Link as LinkIcon, CheckCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { FileUpload } from '@/components/file-upload';

interface AssignmentDetail {
  id: string;
  title: string;
  description: string | null;
  subjectName: string;
  subjectCode: string;
  teacherName: string;
  dueDate: Date;
  maxScore: number;
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

export default function AssignmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const assignmentId = params.id as string;

  const [assignment, setAssignment] = useState<AssignmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [submissionContent, setSubmissionContent] = useState('');
  const [submissionUrl, setSubmissionUrl] = useState('');

  useEffect(() => {
    loadAssignment();
  }, [assignmentId]);

  async function loadAssignment() {
    setLoading(true);
    try {
      const data = await getAssignmentDetail(assignmentId);
      setAssignment(data);
      
      if (data?.submission) {
        setSubmissionContent(data.submission.content || '');
        setSubmissionUrl(data.submission.fileUrl || '');
      }
    } catch (error) {
      console.error('Error loading assignment:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    if (!submissionContent && !submissionUrl) {
      alert('Debes ingresar un texto o una URL');
      return;
    }

    setSubmitting(true);
    try {
      const result = await submitAssignment({
        assignmentId,
        content: submissionContent,
        fileUrl: submissionUrl,
      });

      if (result.success) {
        alert('✅ Tarea entregada exitosamente!');
        await loadAssignment();
      } else {
        alert(result.error || 'Error al entregar la tarea');
      }
    } catch (error) {
      console.error('Error submitting:', error);
      alert('Error al entregar la tarea');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray">Cargando tarea...</p>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="card text-center py-12">
        <AlertCircle className="w-16 h-16 text-gray/30 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-dark mb-2">Tarea no encontrada</h3>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-dark transition-colors"
        >
          Volver
        </button>
      </div>
    );
  }

  const isOverdue = assignment.dueDate < new Date() && !assignment.submission;
  const isGraded = assignment.submission?.gradedAt !== null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => router.back()}
          className="text-primary hover:underline mb-4 flex items-center gap-2"
        >
          ← Volver a Mis Tareas
        </button>
        
        <div className="card">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-2xl lg:text-3xl font-bold text-dark mb-2">
                {assignment.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray">
                <span className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  {assignment.subjectName} ({assignment.subjectCode})
                </span>
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {assignment.teacherName}
                </span>
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Vence: {format(assignment.dueDate, "dd 'de' MMMM yyyy 'a las' HH:mm", { locale: es })}
                </span>
              </div>
            </div>

            <div className="ml-4">
              <div
                className={cn(
                  'px-4 py-2 rounded-lg text-center',
                  isGraded
                    ? 'bg-green-100 border-2 border-green-300'
                    : assignment.submission
                    ? 'bg-blue-100 border-2 border-blue-300'
                    : isOverdue
                    ? 'bg-red-100 border-2 border-red-300'
                    : 'bg-amber-100 border-2 border-amber-300'
                )}
              >
                <p className="text-xs font-medium">
                  {isGraded
                    ? 'Calificada'
                    : assignment.submission
                    ? 'Entregada'
                    : isOverdue
                    ? 'Vencida'
                    : 'Pendiente'}
                </p>
                {isGraded && (
                  <p className="text-2xl font-bold text-green-700 mt-1">
                    {assignment.submission?.score}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Descripción */}
          {assignment.description && (
            <div className="p-4 bg-light rounded-lg">
              <p className="text-sm text-gray whitespace-pre-wrap">
                {assignment.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Calificación y Feedback (si ya fue calificada) */}
      {isGraded && assignment.submission && (
        <div className="card bg-green-50 border-2 border-green-200">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-bold text-green-900 mb-2">
                ✅ Tarea Calificada
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-green-800">Calificación:</p>
                  <p className="text-3xl font-bold text-green-700">
                    {assignment.submission.score} / {assignment.maxScore}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-green-800">Calificada el:</p>
                  <p className="text-sm font-medium text-green-700">
                    {assignment.submission.gradedAt &&
                      format(assignment.submission.gradedAt, "dd 'de' MMMM 'a las' HH:mm", {
                        locale: es,
                      })}
                  </p>
                </div>
              </div>
              {assignment.submission.feedback && (
                <div className="p-3 bg-white rounded-lg">
                  <p className="text-sm font-medium text-green-900 mb-1">
                    💬 Retroalimentación del Docente:
                  </p>
                  <p className="text-sm text-gray">
                    {assignment.submission.feedback}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Entrega Existente (sin calificar) */}
      {assignment.submission && !isGraded && (
        <div className="card bg-blue-50 border-2 border-blue-200">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-bold text-blue-900 mb-2">
                ⏳ Tarea Entregada - Esperando Calificación
              </h3>
              <p className="text-sm text-blue-800 mb-3">
                Entregada el{' '}
                {format(assignment.submission.submittedAt, "dd 'de' MMMM 'a las' HH:mm", {
                  locale: es,
                })}
              </p>
              {assignment.submission.content && (
                <div className="p-3 bg-white rounded-lg mb-3">
                  <p className="text-sm text-gray whitespace-pre-wrap">
                    {assignment.submission.content}
                  </p>
                </div>
              )}
              {assignment.submission.fileUrl && (
                <a
                  href={assignment.submission.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline flex items-center gap-2"
                >
                  <LinkIcon className="w-4 h-4" />
                  Ver archivo/enlace
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Formulario de Entrega */}
      {!assignment.submission && (
        <div className="card">
          <h3 className="text-xl font-bold text-dark mb-4">
            📤 Entregar Tarea
          </h3>

          <div className="space-y-4">
            {/* Textarea para contenido */}
            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Contenido de la Entrega
              </label>
              <textarea
                value={submissionContent}
                onChange={(e) => setSubmissionContent(e.target.value)}
                rows={6}
                className="w-full px-4 py-3 border border-gray/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all resize-none"
                placeholder="Escribe tu respuesta aquí..."
              />
            </div>

            {/* URL de archivo o enlace */}
            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                URL de Archivo o Enlace (opcional)
              </label>
              <div className="flex gap-2">
                <LinkIcon className="w-5 h-5 text-gray mt-3" />
                <input
                  type="url"
                  value={submissionUrl}
                  onChange={(e) => setSubmissionUrl(e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  placeholder="https://drive.google.com/..."
                />
              </div>
              <p className="text-xs text-gray mt-2">
                Puedes pegar un enlace de Google Drive, Dropbox, OneDrive, etc.
              </p>
            </div>

            {/* Drag & Drop File Upload */}
            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                O arrastra un archivo aquí
              </label>
              <FileUpload
                onFileUploaded={(url) => setSubmissionUrl(url)}
              />
            </div>

            {/* Botón de Entregar */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSubmit}
                disabled={submitting || (!submissionContent && !submissionUrl)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold text-white transition-all shadow-lg',
                  submitting || (!submissionContent && !submissionUrl)
                    ? 'bg-gray cursor-not-allowed'
                    : 'bg-primary hover:bg-dark hover:shadow-xl'
                )}
              >
                <Upload className="w-5 h-5" />
                {submitting ? 'Entregando...' : 'Entregar Tarea'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alerta si está vencida */}
      {isOverdue && (
        <div className="card bg-red-50 border-2 border-red-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-red-900 mb-1">Tarea Vencida</h4>
              <p className="text-sm text-red-800">
                La fecha límite de entrega ya pasó. Contacta a tu docente si necesitas una prórroga.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


