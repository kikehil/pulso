'use client';

import { Plus, Trash2, AlertCircle } from 'lucide-react';

interface RubricCriterion {
  description: string;
  maxPoints: number;
}

interface RubricData {
  title: string;
  description: string;
  criteria: RubricCriterion[];
}

interface RubricEditorProps {
  rubricData: RubricData;
  setRubricData: (data: RubricData) => void;
  onAddCriterion: () => void;
  onUpdateCriterion: (index: number, field: 'description' | 'maxPoints', value: string | number) => void;
  onRemoveCriterion: (index: number) => void;
  totalPoints: number;
}

export function RubricEditor({
  rubricData,
  setRubricData,
  onAddCriterion,
  onUpdateCriterion,
  onRemoveCriterion,
  totalPoints,
}: RubricEditorProps) {
  return (
    <div className="space-y-4 p-4 border-2 border-primary/20 rounded-lg bg-primary/5">
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-dark">Editor de Rúbrica</h4>
        {totalPoints !== 100 && (
          <div className="flex items-center gap-2 text-amber-600 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>Total: {totalPoints}pts (debe sumar 100)</span>
          </div>
        )}
      </div>

      {/* Información de la rúbrica */}
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-dark mb-2">
            Título de la Rúbrica *
          </label>
          <input
            type="text"
            required
            value={rubricData.title}
            onChange={(e) =>
              setRubricData({ ...rubricData, title: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
            placeholder="Ej: Rúbrica de Ensayo"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-dark mb-2">
            Descripción general
          </label>
          <textarea
            value={rubricData.description}
            onChange={(e) =>
              setRubricData({ ...rubricData, description: e.target.value })
            }
            rows={2}
            className="w-full px-4 py-2 border border-gray/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all resize-none"
            placeholder="Descripción opcional de la rúbrica..."
          />
        </div>
      </div>

      {/* Tabla de Criterios */}
      <div>
        <label className="block text-sm font-medium text-dark mb-2">
          Criterios de Evaluación
        </label>
        
        <div className="bg-white rounded-lg overflow-hidden border border-gray/20">
          <table className="w-full">
            <thead className="bg-light">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray uppercase">
                  Criterio
                </th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray uppercase w-32">
                  Puntos
                </th>
                <th className="px-4 py-2 w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray/10">
              {rubricData.criteria.map((criterion, index) => (
                <tr key={index} className="hover:bg-light/50 transition-colors">
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      required
                      value={criterion.description}
                      onChange={(e) =>
                        onUpdateCriterion(index, 'description', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray/30 rounded focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                      placeholder="Ej: Ortografía y gramática"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      required
                      min="0"
                      max="100"
                      value={criterion.maxPoints}
                      onChange={(e) =>
                        onUpdateCriterion(
                          index,
                          'maxPoints',
                          Number(e.target.value)
                        )
                      }
                      className="w-full px-3 py-2 border border-gray/30 rounded focus:outline-none focus:ring-1 focus:ring-primary text-sm text-center"
                      placeholder="0"
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => onRemoveCriterion(index)}
                      disabled={rubricData.criteria.length === 1}
                      className="p-1 hover:bg-red-50 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Eliminar criterio"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-light border-t-2 border-dark/10">
                <td className="px-4 py-3 text-sm font-bold text-dark">
                  TOTAL
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`text-sm font-bold ${
                      totalPoints === 100
                        ? 'text-green-600'
                        : 'text-amber-600'
                    }`}
                  >
                    {totalPoints} pts
                  </span>
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>

        <button
          type="button"
          onClick={onAddCriterion}
          className="mt-3 flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray/30 text-gray rounded-lg hover:border-primary hover:text-primary transition-colors w-full justify-center"
        >
          <Plus className="w-4 h-4" />
          Agregar Criterio
        </button>
      </div>

      {/* Ayuda */}
      <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <p>
          <strong>Consejo:</strong> Divide la evaluación en criterios claros.
          Ej: Contenido (40pts), Ortografía (20pts), Presentación (20pts),
          Creatividad (20pts).
        </p>
      </div>
    </div>
  );
}


