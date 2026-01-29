'use client';

import { useState, useEffect } from 'react';
import { Save, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getGradebookData, updateGrade } from '@/app/teacher/class/[id]/actions';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
}

interface Assignment {
  id: string;
  title: string;
  maxScore: number;
  weight: number; // Peso en porcentaje para el promedio
}

interface Grade {
  studentId: string;
  assignmentId: string;
  score: number | null;
}

interface GradebookData {
  students: Student[];
  assignments: Assignment[];
  grades: Grade[];
}

interface GradebookTabProps {
  groupId: string;
}

export function GradebookTab({ groupId }: GradebookTabProps) {
  const [data, setData] = useState<GradebookData>({
    students: [],
    assignments: [],
    grades: [],
  });
  const [loading, setLoading] = useState(true);
  const [editingCell, setEditingCell] = useState<{
    studentId: string;
    assignmentId: string;
  } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadGradebookData();
  }, [groupId]);

  async function loadGradebookData() {
    setLoading(true);
    try {
      const result = await getGradebookData(groupId);
      setData(result);
    } catch (error) {
      console.error('Error loading gradebook:', error);
      alert('Error al cargar las calificaciones');
    } finally {
      setLoading(false);
    }
  }

  function getGrade(studentId: string, assignmentId: string): number | null {
    const grade = data.grades.find(
      (g) => g.studentId === studentId && g.assignmentId === assignmentId
    );
    return grade?.score ?? null;
  }

  function calculateAverage(studentId: string): number {
    let totalWeightedScore = 0;
    let totalWeight = 0;

    data.assignments.forEach((assignment) => {
      const score = getGrade(studentId, assignment.id);
      if (score !== null) {
        totalWeightedScore += (score / assignment.maxScore) * assignment.weight;
        totalWeight += assignment.weight;
      }
    });

    return totalWeight > 0 ? (totalWeightedScore / totalWeight) * 10 : 0;
  }

  function handleCellClick(studentId: string, assignmentId: string) {
    const currentGrade = getGrade(studentId, assignmentId);
    setEditingCell({ studentId, assignmentId });
    setEditValue(currentGrade !== null ? currentGrade.toString() : '');
  }

  function handleCellBlur() {
    if (editingCell) {
      saveGrade(editingCell.studentId, editingCell.assignmentId, editValue);
    }
    setEditingCell(null);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      handleCellBlur();
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
  }

  async function saveGrade(studentId: string, assignmentId: string, value: string) {
    const numValue = parseFloat(value);
    
    // Validación
    const assignment = data.assignments.find((a) => a.id === assignmentId);
    if (!assignment) return;
    
    if (isNaN(numValue) || numValue < 0 || numValue > assignment.maxScore) {
      alert(`La calificación debe estar entre 0 y ${assignment.maxScore}`);
      return;
    }

    setSaving(true);
    try {
      await updateGrade({ groupId, studentId, assignmentId, score: numValue });
      
      // Actualizar estado local
      setData((prev) => {
        const existingGradeIndex = prev.grades.findIndex(
          (g) => g.studentId === studentId && g.assignmentId === assignmentId
        );
        
        const newGrades = [...prev.grades];
        if (existingGradeIndex >= 0) {
          newGrades[existingGradeIndex] = { studentId, assignmentId, score: numValue };
        } else {
          newGrades.push({ studentId, assignmentId, score: numValue });
        }
        
        return { ...prev, grades: newGrades };
      });
    } catch (error) {
      console.error('Error saving grade:', error);
      alert('Error al guardar la calificación');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray">Cargando calificaciones...</p>
        </div>
      </div>
    );
  }

  if (data.students.length === 0) {
    return (
      <div className="card text-center py-12">
        <AlertCircle className="w-16 h-16 text-gray/30 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-dark mb-2">
          No hay alumnos en este grupo
        </h3>
        <p className="text-gray">Agrega alumnos al grupo para gestionar calificaciones</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-dark">Libro de Calificaciones</h3>
          <p className="text-sm text-gray mt-1">
            Haz click en cualquier celda para editar. Los promedios se calculan automáticamente.
          </p>
        </div>
        {saving && (
          <div className="flex items-center gap-2 text-primary">
            <Save className="w-4 h-4 animate-pulse" />
            <span className="text-sm">Guardando...</span>
          </div>
        )}
      </div>

      {/* Gradebook Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-dark text-white">
                <th className="px-4 py-3 text-left text-sm font-bold sticky left-0 bg-dark z-10">
                  Alumno
                </th>
                {data.assignments.map((assignment) => (
                  <th key={assignment.id} className="px-4 py-3 text-center text-sm font-bold min-w-[120px]">
                    <div>{assignment.title}</div>
                    <div className="text-xs opacity-80 font-normal">
                      Max: {assignment.maxScore} | Peso: {assignment.weight}%
                    </div>
                  </th>
                ))}
                <th className="px-4 py-3 text-center text-sm font-bold min-w-[100px] bg-primary">
                  Promedio
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray/10">
              {data.students.map((student) => {
                const average = calculateAverage(student.id);
                const isFailing = average < 6.0;

                return (
                  <tr key={student.id} className="hover:bg-light/50 transition-colors">
                    {/* Columna de Alumno */}
                    <td className="px-4 py-3 sticky left-0 bg-white z-10 border-r border-gray/10">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                          {student.avatarUrl ? (
                            <img
                              src={student.avatarUrl}
                              alt=""
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-xs font-medium text-primary">
                              {student.firstName[0]}{student.lastName[0]}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-dark text-sm">
                            {student.firstName} {student.lastName}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Columnas de Calificaciones */}
                    {data.assignments.map((assignment) => {
                      const score = getGrade(student.id, assignment.id);
                      const isEditing =
                        editingCell?.studentId === student.id &&
                        editingCell?.assignmentId === assignment.id;
                      const normalizedScore = score !== null ? (score / assignment.maxScore) * 10 : null;
                      const cellIsFailing = normalizedScore !== null && normalizedScore < 6.0;

                      return (
                        <td
                          key={assignment.id}
                          className={cn(
                            'px-4 py-3 text-center cursor-pointer transition-colors',
                            isEditing && 'bg-primary/10',
                            !isEditing && 'hover:bg-gray/5',
                            cellIsFailing && !isEditing && 'bg-red-50'
                          )}
                          onClick={() => !isEditing && handleCellClick(student.id, assignment.id)}
                        >
                          {isEditing ? (
                            <input
                              type="number"
                              min="0"
                              max={assignment.maxScore}
                              step="0.5"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={handleCellBlur}
                              onKeyDown={handleKeyDown}
                              autoFocus
                              className="w-full px-2 py-1 text-center border-2 border-primary rounded focus:outline-none"
                            />
                          ) : (
                            <div className="flex flex-col items-center">
                              <span
                                className={cn(
                                  'text-base font-bold',
                                  cellIsFailing ? 'text-red-600' : 'text-dark'
                                )}
                              >
                                {score !== null ? score.toFixed(1) : '-'}
                              </span>
                              {normalizedScore !== null && (
                                <span className="text-xs text-gray">
                                  ({normalizedScore.toFixed(1)}/10)
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                      );
                    })}

                    {/* Columna de Promedio */}
                    <td
                      className={cn(
                        'px-4 py-3 text-center font-bold text-lg border-l-2 border-primary/20',
                        isFailing ? 'bg-red-100 text-red-700' : 'bg-green-50 text-green-700'
                      )}
                    >
                      <div className="flex items-center justify-center gap-2">
                        {isFailing ? (
                          <TrendingDown className="w-5 h-5" />
                        ) : (
                          <TrendingUp className="w-5 h-5" />
                        )}
                        <span>{average.toFixed(2)}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* Footer con promedios por actividad */}
            <tfoot>
              <tr className="bg-light border-t-2 border-dark/10">
                <td className="px-4 py-3 text-sm font-bold text-dark sticky left-0 bg-light z-10">
                  Promedio Grupal
                </td>
                {data.assignments.map((assignment) => {
                  const scores = data.students
                    .map((s) => getGrade(s.id, assignment.id))
                    .filter((score): score is number => score !== null);
                  const avg = scores.length > 0
                    ? scores.reduce((sum, s) => sum + s, 0) / scores.length
                    : 0;

                  return (
                    <td key={assignment.id} className="px-4 py-3 text-center text-sm font-bold text-dark">
                      {avg.toFixed(1)}
                    </td>
                  );
                })}
                <td className="px-4 py-3 text-center text-sm font-bold text-primary">
                  {(
                    data.students.reduce((sum, s) => sum + calculateAverage(s.id), 0) /
                    data.students.length
                  ).toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Leyenda */}
      <div className="flex items-center gap-6 text-sm text-gray">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-50 border border-red-200 rounded"></div>
          <span>Calificación reprobatoria (&lt; 6.0)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-50 border border-green-200 rounded"></div>
          <span>Promedio aprobatorio (≥ 6.0)</span>
        </div>
      </div>
    </div>
  );
}


