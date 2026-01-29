import { getStudentDashboard } from './actions';
import { BookOpen, Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default async function StudentDashboardPage() {
  const dashboardData = await getStudentDashboard();

  if (!dashboardData) {
    return (
      <div className="card text-center py-12">
        <AlertCircle className="w-16 h-16 text-gray/30 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-dark mb-2">
          No se encontró información del estudiante
        </h3>
        <p className="text-gray">Contacta a tu administrador</p>
      </div>
    );
  }

  const { student, subjects, upcomingAssignments } = dashboardData;

  return (
    <div className="space-y-6">
      {/* Header de Bienvenida */}
      <div className="card bg-gradient-to-r from-primary to-dark text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold mb-1">
              ¡Hola, {student.firstName}! 👋
            </h1>
            <p className="opacity-90">
              Bienvenido a tu portal académico
            </p>
          </div>
          {student.avatarUrl && (
            <div className="w-16 h-16 rounded-full bg-white/20 overflow-hidden">
              <img
                src={student.avatarUrl}
                alt={student.firstName}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </div>

      {/* Tareas Próximas a Vencer */}
      {upcomingAssignments.length > 0 && (
        <div className="card border-2 border-amber-200 bg-amber-50">
          <div className="flex items-start gap-3">
            <Calendar className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-bold text-dark mb-2">
                📌 Tareas Próximas a Vencer
              </h3>
              <div className="space-y-2">
                {upcomingAssignments.slice(0, 3).map((assignment) => (
                  <Link
                    key={assignment.id}
                    href={`/student/assignments/${assignment.id}`}
                    className="block p-3 bg-white rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-dark">{assignment.title}</p>
                        <p className="text-xs text-gray">{assignment.subjectName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-amber-600 font-medium">
                          {assignment.daysUntilDue === 0
                            ? '¡Hoy!'
                            : `En ${assignment.daysUntilDue} día${assignment.daysUntilDue > 1 ? 's' : ''}`}
                        </p>
                        <p className={cn(
                          'text-xs font-medium',
                          assignment.status === 'ENTREGADA' ? 'text-green-600' : 'text-gray'
                        )}>
                          {assignment.status === 'ENTREGADA' ? '✓ Entregada' : 'Pendiente'}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              {upcomingAssignments.length > 3 && (
                <Link
                  href="/student/assignments"
                  className="block mt-3 text-sm text-primary hover:underline text-center"
                >
                  Ver todas las tareas →
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mis Materias */}
      <div>
        <h2 className="text-xl font-bold text-dark mb-4">Mis Materias</h2>
        
        {subjects.length === 0 ? (
          <div className="card text-center py-12">
            <BookOpen className="w-16 h-16 text-gray/30 mx-auto mb-4" />
            <p className="text-gray">No estás inscrito en ninguna materia</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject) => {
              const isApproved = subject.currentGrade >= 6.0;
              const isAtRisk = subject.attendancePercent < 70;

              return (
                <Link
                  key={subject.id}
                  href={`/student/subject/${subject.id}`}
                  className={cn(
                    'card hover:shadow-lg transition-all duration-300 group cursor-pointer border-l-4',
                    isAtRisk || !isApproved
                      ? 'border-red-500'
                      : 'border-green-500'
                  )}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-dark text-lg group-hover:text-primary transition-colors">
                        {subject.name}
                      </h3>
                      <p className="text-sm text-gray">{subject.code}</p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-primary" />
                    </div>
                  </div>

                  <div className="space-y-2 mt-4">
                    {/* Calificación */}
                    <div className="flex items-center justify-between p-2 bg-light rounded-lg">
                      <span className="text-sm text-gray">Calificación:</span>
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            'text-lg font-bold',
                            isApproved ? 'text-green-600' : 'text-red-600'
                          )}
                        >
                          {subject.currentGrade.toFixed(1)}
                        </span>
                        {isApproved ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                    </div>

                    {/* Asistencia */}
                    <div className="flex items-center justify-between p-2 bg-light rounded-lg">
                      <span className="text-sm text-gray">Asistencia:</span>
                      <span
                        className={cn(
                          'text-lg font-bold',
                          subject.attendancePercent >= 80
                            ? 'text-green-600'
                            : subject.attendancePercent >= 70
                            ? 'text-amber-600'
                            : 'text-red-600'
                        )}
                      >
                        {subject.attendancePercent.toFixed(0)}%
                      </span>
                    </div>

                    {/* Tareas Pendientes */}
                    {subject.pendingAssignments > 0 && (
                      <div className="flex items-center justify-between p-2 bg-amber-50 rounded-lg border border-amber-200">
                        <span className="text-sm text-amber-800">Tareas pendientes:</span>
                        <span className="text-lg font-bold text-amber-600">
                          {subject.pendingAssignments}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Estado General */}
                  <div className="mt-4 pt-3 border-t border-gray/10">
                    {isAtRisk || !isApproved ? (
                      <div className="flex items-center gap-2 text-red-600 text-sm font-medium">
                        <AlertCircle className="w-4 h-4" />
                        <span>Requiere atención</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                        <TrendingUp className="w-4 h-4" />
                        <span>¡Vas muy bien!</span>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}


