'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, FileText, Calendar, Users, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getSubjectAssignments } from '../../actions';
import { formatDate } from '@/lib/utils';

interface Assignment {
  id: string;
  title: string;
  description: string | null;
  dueDate: Date;
  maxScore: number;
  _count: {
    submissions: number;
  };
}

export default function TareasDocentePage() {
  const params = useParams();
  const subjectId = params.subjectId as string;

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssignments();
  }, [subjectId]);

  const loadAssignments = async () => {
    try {
      const data = await getSubjectAssignments(subjectId);
      setAssignments(data);
    } catch (error) {
      console.error('Error al cargar tareas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDueDateColor = (dueDate: Date) => {
    const now = new Date();
    const timeLeft = new Date(dueDate).getTime() - now.getTime();
    const hoursLeft = timeLeft / (1000 * 60 * 60);

    if (hoursLeft < 0) return 'text-gray-500 bg-gray-100';
    if (hoursLeft < 24) return 'text-red-700 bg-red-100';
    if (hoursLeft < 72) return 'text-amber-700 bg-amber-100';
    return 'text-primary bg-primary/10';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/docente"
            className="p-2 rounded-lg hover:bg-light transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-dark">
              Mis Tareas
            </h1>
            <p className="text-gray mt-1 font-regular">
              Administra las tareas de esta materia
            </p>
          </div>
        </div>

        <Link
          href={`/dashboard/tareas`}
          className="btn-primary inline-flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nueva Tarea
        </Link>
      </div>

      {/* Lista de Tareas */}
      {loading ? (
        <div className="text-center text-gray py-12">
          Cargando tareas...
        </div>
      ) : assignments.length === 0 ? (
        <div className="card text-center py-12">
          <FileText className="w-16 h-16 text-gray mx-auto mb-4 opacity-50" />
          <p className="text-gray font-regular mb-4">
            No hay tareas creadas para esta materia
          </p>
          <Link
            href={`/dashboard/tareas`}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Crear Primera Tarea
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {assignments.map((assignment) => (
            <Link
              key={assignment.id}
              href={`/docente/calificar/${assignment.id}`}
              className="card hover:shadow-lg transition-all duration-200 cursor-pointer group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Info de la Tarea */}
                <div className="flex-1">
                  <h3 className="font-bold text-dark text-lg group-hover:text-primary transition-colors mb-2">
                    {assignment.title}
                  </h3>
                  {assignment.description && (
                    <p className="text-sm text-gray line-clamp-2 mb-3">
                      {assignment.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getDueDateColor(
                        assignment.dueDate
                      )}`}
                    >
                      <Calendar className="w-3 h-3" />
                      Vence: {formatDate(assignment.dueDate)}
                    </span>

                    <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                      <Users className="w-3 h-3" />
                      {assignment._count.submissions} entregas
                    </span>

                    <span className="text-xs font-medium text-gray">
                      Máx: {assignment.maxScore} pts
                    </span>
                  </div>
                </div>

                {/* Botón de Acción */}
                <div className="sm:ml-4">
                  <div className="px-4 py-2 bg-primary/10 text-primary rounded-lg group-hover:bg-primary group-hover:text-white transition-colors text-center">
                    <FileText className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-xs font-medium">Calificar</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Tip */}
      <div className="card bg-primary/5 border-primary/20">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray">
            <strong className="text-dark">Nota:</strong> Haz clic en cualquier tarea para ver las
            entregas y calificar a los alumnos. Puedes crear nuevas tareas desde el módulo
            principal de Tareas.
          </div>
        </div>
      </div>
    </div>
  );
}


