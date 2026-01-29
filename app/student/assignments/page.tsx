import { getStudentAssignments } from './actions';
import Link from 'next/link';
import { Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default async function StudentAssignmentsPage() {
  const assignments = await getStudentAssignments();

  const pending = assignments.filter((a) => a.status === 'PENDIENTE');
  const submitted = assignments.filter((a) => a.status === 'ENTREGADA');
  const graded = assignments.filter((a) => a.status === 'CALIFICADA');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-dark">Mis Tareas</h1>
        <p className="text-gray mt-1">
          Gestiona tus entregas y consulta tus calificaciones
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-amber-50 border-2 border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-amber-800 font-medium">Pendientes</p>
              <p className="text-3xl font-bold text-amber-600 mt-1">{pending.length}</p>
            </div>
            <Clock className="w-12 h-12 text-amber-400" />
          </div>
        </div>

        <div className="card bg-blue-50 border-2 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-800 font-medium">Entregadas</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{submitted.length}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-blue-400" />
          </div>
        </div>

        <div className="card bg-green-50 border-2 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-800 font-medium">Calificadas</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{graded.length}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-400" />
          </div>
        </div>
      </div>

      {/* Tareas Pendientes */}
      {pending.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-dark mb-4">📌 Tareas Pendientes</h2>
          <div className="space-y-3">
            {pending.map((assignment) => (
              <Link
                key={assignment.id}
                href={`/student/assignments/${assignment.id}`}
                className="card hover:shadow-lg transition-all duration-300 border-l-4 border-amber-500"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-dark text-lg">{assignment.title}</h3>
                    <p className="text-sm text-gray mt-1">{assignment.subjectName}</p>
                    {assignment.description && (
                      <p className="text-sm text-gray mt-2 line-clamp-2">
                        {assignment.description}
                      </p>
                    )}
                  </div>
                  <div className="ml-4 text-right">
                    <div
                      className={cn(
                        'px-3 py-1 rounded-full text-xs font-medium',
                        assignment.isOverdue
                          ? 'bg-red-100 text-red-700'
                          : assignment.isDueSoon
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-blue-100 text-blue-700'
                      )}
                    >
                      {assignment.isOverdue
                        ? '¡Vencida!'
                        : assignment.isDueSoon
                        ? `Vence ${assignment.dueText}`
                        : `Vence ${assignment.dueText}`}
                    </div>
                    <p className="text-xs text-gray mt-2">
                      {format(assignment.dueDate, "dd MMM yyyy 'a las' HH:mm", { locale: es })}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Tareas Entregadas */}
      {submitted.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-dark mb-4">⏳ Esperando Calificación</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {submitted.map((assignment) => (
              <Link
                key={assignment.id}
                href={`/student/assignments/${assignment.id}`}
                className="card hover:shadow-lg transition-all duration-300 border-l-4 border-blue-500"
              >
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle className="w-6 h-6 text-blue-500" />
                  <div className="flex-1">
                    <h3 className="font-bold text-dark">{assignment.title}</h3>
                    <p className="text-sm text-gray">{assignment.subjectName}</p>
                  </div>
                </div>
                <div className="text-sm text-gray">
                  Entregada el{' '}
                  {assignment.submittedAt &&
                    format(assignment.submittedAt, "dd MMM 'a las' HH:mm", { locale: es })}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Tareas Calificadas */}
      {graded.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-dark mb-4">✅ Calificadas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {graded.map((assignment) => (
              <Link
                key={assignment.id}
                href={`/student/assignments/${assignment.id}`}
                className="card hover:shadow-lg transition-all duration-300 border-l-4 border-green-500"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-dark">{assignment.title}</h3>
                    <p className="text-sm text-gray">{assignment.subjectName}</p>
                  </div>
                  <div className="text-right">
                    <div
                      className={cn(
                        'text-2xl font-bold',
                        (assignment.score ?? 0) >= 6 ? 'text-green-600' : 'text-red-600'
                      )}
                    >
                      {assignment.score !== null ? assignment.score.toFixed(1) : '-'}
                    </div>
                    <div className="text-xs text-gray">
                      de {assignment.maxScore}
                    </div>
                  </div>
                </div>
                {assignment.feedback && (
                  <div className="p-3 bg-light rounded-lg text-sm text-gray">
                    💬 {assignment.feedback}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Estado vacío */}
      {assignments.length === 0 && (
        <div className="card text-center py-12">
          <Calendar className="w-16 h-16 text-gray/30 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-dark mb-2">No hay tareas</h3>
          <p className="text-gray">No tienes tareas asignadas en este momento</p>
        </div>
      )}
    </div>
  );
}


