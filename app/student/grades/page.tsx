import { getStudentGrades } from './actions';
import { BarChart3, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default async function StudentGradesPage() {
  const gradesData = await getStudentGrades();

  if (!gradesData) {
    return (
      <div className="card text-center py-12">
        <AlertCircle className="w-16 h-16 text-gray/30 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-dark mb-2">
          No se encontraron calificaciones
        </h3>
        <p className="text-gray">Contacta a tu administrador</p>
      </div>
    );
  }

  const { student, subjects } = gradesData;
  const overallAverage =
    subjects.length > 0
      ? subjects.reduce((sum, s) => sum + s.average, 0) / subjects.length
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-dark">Mis Calificaciones</h1>
        <p className="text-gray mt-1">
          Consulta tu boleta y desempeño académico
        </p>
      </div>

      {/* Resumen General */}
      <div className="card bg-gradient-to-r from-primary to-dark text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90 mb-1">Promedio General</p>
            <div className="flex items-center gap-3">
              <p className="text-5xl font-bold">{overallAverage.toFixed(2)}</p>
              {overallAverage >= 6.0 ? (
                <TrendingUp className="w-8 h-8" />
              ) : (
                <TrendingDown className="w-8 h-8" />
              )}
            </div>
            <p className="text-sm opacity-90 mt-2">
              {overallAverage >= 9.0
                ? '¡Excelente desempeño!'
                : overallAverage >= 8.0
                ? '¡Muy buen trabajo!'
                : overallAverage >= 7.0
                ? 'Buen desempeño'
                : overallAverage >= 6.0
                ? 'Desempeño aceptable'
                : 'Necesitas mejorar'}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <div className="px-4 py-2 bg-white/20 rounded-lg text-center">
              <p className="text-xs opacity-90">Materias</p>
              <p className="text-2xl font-bold">{subjects.length}</p>
            </div>
            <div className="px-4 py-2 bg-white/20 rounded-lg text-center">
              <p className="text-xs opacity-90">Aprobadas</p>
              <p className="text-2xl font-bold">
                {subjects.filter((s) => s.average >= 6.0).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de Calificaciones por Materia */}
      {subjects.length === 0 ? (
        <div className="card text-center py-12">
          <BarChart3 className="w-16 h-16 text-gray/30 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-dark mb-2">
            No hay calificaciones registradas
          </h3>
          <p className="text-gray">
            Las calificaciones aparecerán aquí cuando tus profesores las registren
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {subjects.map((subject) => {
            const isApproved = subject.average >= 6.0;
            const isExcellent = subject.average >= 9.0;

            return (
              <div
                key={subject.id}
                className={cn(
                  'card border-l-4 transition-all duration-300 hover:shadow-lg',
                  isExcellent
                    ? 'border-green-500'
                    : isApproved
                    ? 'border-blue-500'
                    : 'border-red-500'
                )}
              >
                {/* Header de la Materia */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-dark">{subject.name}</h3>
                    <p className="text-sm text-gray">{subject.code}</p>
                  </div>
                  <div className="text-right">
                    <div
                      className={cn(
                        'px-4 py-2 rounded-lg',
                        isExcellent
                          ? 'bg-green-100'
                          : isApproved
                          ? 'bg-blue-100'
                          : 'bg-red-100'
                      )}
                    >
                      <p className="text-xs font-medium text-gray">Promedio</p>
                      <p
                        className={cn(
                          'text-3xl font-bold',
                          isExcellent
                            ? 'text-green-700'
                            : isApproved
                            ? 'text-blue-700'
                            : 'text-red-700'
                        )}
                      >
                        {subject.average.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tabla de Calificaciones por Actividad */}
                {subject.grades.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-light">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray uppercase">
                            Actividad
                          </th>
                          <th className="px-4 py-2 text-center text-xs font-medium text-gray uppercase">
                            Calificación
                          </th>
                          <th className="px-4 py-2 text-center text-xs font-medium text-gray uppercase">
                            Fecha
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray uppercase">
                            Retroalimentación
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray/10">
                        {subject.grades.map((grade) => {
                          const gradeValue = grade.score !== null ? grade.score : 0;
                          const gradePercent = (gradeValue / grade.maxScore) * 100;

                          return (
                            <tr key={grade.id} className="hover:bg-light/50">
                              <td className="px-4 py-3">
                                <p className="font-medium text-dark text-sm">
                                  {grade.assignmentTitle}
                                </p>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <div className="flex flex-col items-center">
                                  <span
                                    className={cn(
                                      'text-lg font-bold',
                                      gradePercent >= 60
                                        ? 'text-green-600'
                                        : 'text-red-600'
                                    )}
                                  >
                                    {grade.score !== null ? grade.score.toFixed(1) : '-'}
                                  </span>
                                  <span className="text-xs text-gray">
                                    de {grade.maxScore}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-center text-sm text-gray">
                                {grade.gradedAt
                                  ? new Date(grade.gradedAt).toLocaleDateString('es-MX')
                                  : '-'}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray">
                                {grade.feedback || '-'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot className="bg-light">
                        <tr>
                          <td className="px-4 py-3 font-bold text-dark">Promedio:</td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={cn(
                                'text-xl font-bold',
                                isApproved ? 'text-green-600' : 'text-red-600'
                              )}
                            >
                              {subject.average.toFixed(2)}
                            </span>
                          </td>
                          <td colSpan={2}></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}

                {/* Estado */}
                <div className="mt-4 pt-3 border-t border-gray/10 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    {isApproved ? (
                      <>
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="text-green-600 font-medium">
                          {isExcellent ? '¡Excelente!' : 'Aprobado'}
                        </span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <span className="text-red-600 font-medium">Necesitas mejorar</span>
                      </>
                    )}
                  </div>
                  <div className="text-sm text-gray">
                    {subject.grades.length} actividad{subject.grades.length !== 1 ? 'es' : ''}{' '}
                    calificada{subject.grades.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Leyenda */}
      <div className="card bg-light">
        <h4 className="font-bold text-dark mb-3">Escala de Evaluación</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="font-medium text-dark">Excelente</span>
            </div>
            <p className="text-xs text-gray">9.0 - 10.0</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="font-medium text-dark">Aprobado</span>
            </div>
            <p className="text-xs text-gray">6.0 - 8.9</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="font-medium text-dark">Reprobado</span>
            </div>
            <p className="text-xs text-gray">0.0 - 5.9</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-4 h-4 bg-gray rounded"></div>
              <span className="font-medium text-dark">Sin Calificar</span>
            </div>
            <p className="text-xs text-gray">Pendiente</p>
          </div>
        </div>
      </div>
    </div>
  );
}


