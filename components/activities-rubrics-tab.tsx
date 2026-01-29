'use client';

import { useState, useEffect } from 'react';
import { Plus, FileText, Edit, Trash2 } from 'lucide-react';
import { Modal } from './modal';
import { RubricEditor } from './rubric-editor';

interface Activity {
  id: string;
  title: string;
  description: string | null;
  dueDate: Date;
  maxScore: number;
  hasRubric: boolean;
  rubricTitle?: string;
}

interface ActivitiesRubricsTabProps {
  groupId: string;
}

export function ActivitiesRubricsTab({ groupId }: ActivitiesRubricsTabProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    maxScore: 100,
    useRubric: false,
  });

  const [rubricData, setRubricData] = useState({
    title: '',
    description: '',
    criteria: [{ description: '', maxPoints: 0 }],
  });

  useEffect(() => {
    // loadActivities();
    setLoading(false);
  }, [groupId]);

  function handleCreate() {
    setEditingActivity(null);
    setFormData({
      title: '',
      description: '',
      dueDate: '',
      maxScore: 100,
      useRubric: false,
    });
    setRubricData({
      title: '',
      description: '',
      criteria: [{ description: '', maxPoints: 0 }],
    });
    setIsModalOpen(true);
  }

  function addCriterion() {
    setRubricData((prev) => ({
      ...prev,
      criteria: [...prev.criteria, { description: '', maxPoints: 0 }],
    }));
  }

  function updateCriterion(index: number, field: 'description' | 'maxPoints', value: string | number) {
    setRubricData((prev) => {
      const newCriteria = [...prev.criteria];
      newCriteria[index] = {
        ...newCriteria[index],
        [field]: value,
      };
      return { ...prev, criteria: newCriteria };
    });
  }

  function removeCriterion(index: number) {
    setRubricData((prev) => ({
      ...prev,
      criteria: prev.criteria.filter((_, i) => i !== index),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Aquí iría la lógica de guardar
    alert('Funcionalidad de guardar próximamente (esperando schema update)');
    setIsModalOpen(false);
  }

  const totalPoints = rubricData.criteria.reduce((sum, c) => sum + (Number(c.maxPoints) || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray">Cargando actividades...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con botón de crear */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-dark">Actividades y Rúbricas</h3>
          <p className="text-sm text-gray mt-1">
            Crea actividades evaluables con rúbricas personalizadas
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-dark transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Nueva Actividad
        </button>
      </div>

      {/* Lista de actividades */}
      {activities.length === 0 ? (
        <div className="card text-center py-12">
          <FileText className="w-16 h-16 text-gray/30 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-dark mb-2">
            No hay actividades creadas
          </h3>
          <p className="text-gray mb-4">
            Crea tu primera actividad con rúbrica de evaluación
          </p>
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-dark transition-colors"
          >
            <Plus className="w-4 h-4" />
            Crear Actividad
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activities.map((activity) => (
            <div key={activity.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-bold text-dark">{activity.title}</h4>
                  <p className="text-sm text-gray mt-1">{activity.description}</p>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-light rounded-lg transition-colors">
                    <Edit className="w-4 h-4 text-gray" />
                  </button>
                  <button className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray/10">
                <span className="text-xs text-gray">
                  Vence: {new Date(activity.dueDate).toLocaleDateString()}
                </span>
                {activity.hasRubric && (
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded">
                    Con rúbrica
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de creación */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingActivity ? 'Editar Actividad' : 'Nueva Actividad'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Información básica */}
          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              Título de la Actividad *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              placeholder="Ej: Ensayo sobre la Revolución Mexicana"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all resize-none"
              placeholder="Describe la actividad..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Fecha de entrega *
              </label>
              <input
                type="date"
                required
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Puntos máximos
              </label>
              <input
                type="number"
                value={formData.maxScore}
                onChange={(e) => setFormData({ ...formData, maxScore: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Toggle para usar rúbrica */}
          <div className="flex items-center gap-3 p-4 bg-light rounded-lg">
            <input
              type="checkbox"
              id="useRubric"
              checked={formData.useRubric}
              onChange={(e) => setFormData({ ...formData, useRubric: e.target.checked })}
              className="w-4 h-4 text-primary border-gray rounded focus:ring-primary"
            />
            <label htmlFor="useRubric" className="text-sm font-medium text-dark cursor-pointer">
              Evaluar con rúbrica personalizada
            </label>
          </div>

          {/* Editor de Rúbrica (condicional) */}
          {formData.useRubric && (
            <RubricEditor
              rubricData={rubricData}
              setRubricData={setRubricData}
              onAddCriterion={addCriterion}
              onUpdateCriterion={updateCriterion}
              onRemoveCriterion={removeCriterion}
              totalPoints={totalPoints}
            />
          )}

          {/* Botones */}
          <div className="flex gap-3 pt-4 border-t border-gray/10">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-4 py-2 border border-gray/30 text-gray rounded-lg hover:bg-gray/5 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-dark transition-colors shadow-sm"
            >
              {editingActivity ? 'Actualizar' : 'Crear Actividad'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}


