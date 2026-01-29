'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RubricCriterion {
  id: string;
  description: string;
  maxPoints: number;
  order: number;
}

interface Rubric {
  id: string;
  title: string;
  description: string | null;
  totalWeight: number;
  criteria: RubricCriterion[];
}

interface ExistingGrade {
  criteriaId: string;
  points: number;
  feedback: string | null;
}

interface RubricGradingProps {
  rubric: Rubric;
  submissionId: string;
  existingGrades?: ExistingGrade[];
  onSave: (grades: { criteriaId: string; points: number; feedback: string }[]) => Promise<void>;
  isReadOnly?: boolean;
}

/**
 * Componente para calificar con Rúbrica
 * 
 * El docente ve cada criterio y asigna puntos individuales.
 * El sistema calcula la calificación final automáticamente.
 */
export function RubricGrading({
  rubric,
  submissionId,
  existingGrades = [],
  onSave,
  isReadOnly = false,
}: RubricGradingProps) {
  const [grades, setGrades] = useState<{
    [criteriaId: string]: { points: number; feedback: string };
  }>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Inicializar con calificaciones existentes o valores por defecto
    const initialGrades: { [key: string]: { points: number; feedback: string } } = {};
    
    rubric.criteria.forEach((criterion) => {
      const existingGrade = existingGrades.find(
        (g) => g.criteriaId === criterion.id
      );
      initialGrades[criterion.id] = {
        points: existingGrade?.points || 0,
        feedback: existingGrade?.feedback || '',
      };
    });

    setGrades(initialGrades);
  }, [rubric.criteria, existingGrades]);

  const updateGrade = (criteriaId: string, field: 'points' | 'feedback', value: number | string) => {
    setGrades((prev) => ({
      ...prev,
      [criteriaId]: {
        ...prev[criteriaId],
        [field]: value,
      },
    }));
  };

  const totalScore = Object.values(grades).reduce((sum, grade) => sum + grade.points, 0);
  const maxTotalScore = rubric.criteria.reduce((sum, criterion) => sum + criterion.maxPoints, 0);
  const percentage = maxTotalScore > 0 ? (totalScore / maxTotalScore) * 100 : 0;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const gradesArray = Object.entries(grades).map(([criteriaId, data]) => ({
        criteriaId,
        points: data.points,
        feedback: data.feedback,
      }));
      await onSave(gradesArray);
    } catch (error) {
      console.error('Error saving grades:', error);
      alert('Error al guardar la calificación');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header de la Rúbrica */}
      <div className="card p-6 bg-primary/5 border-2 border-primary/20">
        <h3 className="text-xl font-bold text-dark mb-2">{rubric.title}</h3>
        {rubric.description && (
          <p className="text-sm text-gray">{rubric.description}</p>
        )}
      </div>

      {/* Tabla de Criterios */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark text-white">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-bold">
                  Criterio
                </th>
                <th className="px-4 py-3 text-center text-sm font-bold w-32">
                  Puntos
                </th>
                <th className="px-4 py-3 text-left text-sm font-bold">
                  Retroalimentación
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray/10">
              {rubric.criteria
                .sort((a, b) => a.order - b.order)
                .map((criterion) => {
                  const grade = grades[criterion.id] || { points: 0, feedback: '' };
                  const isMaxScore = grade.points === criterion.maxPoints;

                  return (
                    <tr
                      key={criterion.id}
                      className={cn(
                        'hover:bg-light/50 transition-colors',
                        isMaxScore && 'bg-green-50/50'
                      )}
                    >
                      {/* Descripción del criterio */}
                      <td className="px-4 py-4">
                        <div className="flex items-start gap-2">
                          {isMaxScore && (
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          )}
                          <div>
                            <p className="font-medium text-dark">{criterion.description}</p>
                            <p className="text-xs text-gray mt-1">
                              Máximo: {criterion.maxPoints} puntos
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Input de puntos */}
                      <td className="px-4 py-4">
                        <input
                          type="number"
                          min="0"
                          max={criterion.maxPoints}
                          step="0.5"
                          value={grade.points}
                          onChange={(e) =>
                            updateGrade(
                              criterion.id,
                              'points',
                              Math.min(Number(e.target.value), criterion.maxPoints)
                            )
                          }
                          disabled={isReadOnly}
                          className={cn(
                            'w-20 px-3 py-2 border rounded-lg text-center font-bold transition-all',
                            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary',
                            isMaxScore
                              ? 'border-green-500 text-green-700 bg-green-50'
                              : 'border-gray/30 text-dark',
                            isReadOnly && 'bg-gray-50 cursor-not-allowed'
                          )}
                        />
                      </td>

                      {/* Feedback */}
                      <td className="px-4 py-4">
                        <textarea
                          value={grade.feedback}
                          onChange={(e) =>
                            updateGrade(criterion.id, 'feedback', e.target.value)
                          }
                          disabled={isReadOnly}
                          rows={2}
                          placeholder="Comentarios opcionales..."
                          className={cn(
                            'w-full px-3 py-2 border border-gray/30 rounded-lg text-sm resize-none',
                            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all',
                            isReadOnly && 'bg-gray-50 cursor-not-allowed'
                          )}
                        />
                      </td>
                    </tr>
                  );
                })}
            </tbody>

            {/* Footer con totales */}
            <tfoot className="bg-dark text-white">
              <tr>
                <td className="px-4 py-4 text-left font-bold text-lg">
                  CALIFICACIÓN FINAL
                </td>
                <td className="px-4 py-4 text-center">
                  <div className="text-2xl font-bold">
                    {totalScore.toFixed(1)}
                  </div>
                  <div className="text-xs opacity-80">
                    de {maxTotalScore}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-white/20 rounded-full h-2 overflow-hidden">
                      <div
                        className={cn(
                          'h-full transition-all duration-300',
                          percentage >= 90
                            ? 'bg-green-400'
                            : percentage >= 70
                            ? 'bg-yellow-400'
                            : 'bg-red-400'
                        )}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Botón de guardar */}
      {!isReadOnly && (
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={cn(
              'flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-white transition-all shadow-lg',
              isSaving
                ? 'bg-gray cursor-not-allowed'
                : 'bg-primary hover:bg-dark hover:shadow-xl'
            )}
          >
            <Save className="w-5 h-5" />
            {isSaving ? 'Guardando...' : 'Guardar Calificación'}
          </button>
        </div>
      )}

      {/* Mensaje de éxito si está en modo lectura y calificado */}
      {isReadOnly && totalScore > 0 && (
        <div className="card p-4 bg-green-50 border-2 border-green-200 text-center">
          <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-green-800">
            Esta actividad ya fue calificada
          </p>
        </div>
      )}
    </div>
  );
}


