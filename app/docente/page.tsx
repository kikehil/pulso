'use client';

import { useState, useEffect } from 'react';
import { MetricCard } from '@/components/metric-card';
import { BookOpen, Users, FileCheck, Calendar, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { getTeacherSubjects, getTeacherStats } from './actions';

interface TeacherSubject {
  id: string;
  name: string;
  code: string;
  credits: number;
  semester: number | null;
  courseName: string;
  courseCode: string;
  studentCount: number;
}

interface TeacherStats {
  totalSubjects: number;
  totalStudents: number;
  pendingGrades: number;
  todayAttendances: number;
}

export default function DocenteDashboard() {
  const [subjects, setSubjects] = useState<TeacherSubject[]>([]);
  const [stats, setStats] = useState<TeacherStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      console.log('🔄 Loading teacher data...');
      const [subjectsData, statsData] = await Promise.all([
        getTeacherSubjects(),
        getTeacherStats(),
      ]);
      console.log('✓ Subjects loaded:', subjectsData);
      console.log('✓ Stats loaded:', statsData);
      setSubjects(subjectsData);
      setStats(statsData);
    } catch (error) {
      console.error('❌ Error al cargar datos:', error);
      // Mostrar el error en la UI también
      alert('Error al cargar datos. Por favor verifica la consola o inicia sesión nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-dark">
          Portal del Docente
        </h1>
        <p className="text-gray mt-1 font-regular">
          Gestiona tus materias, asistencias y calificaciones
        </p>
      </div>

      {/* Métricas */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <MetricCard
            title="Mis Materias"
            value={stats.totalSubjects.toString()}
            icon={BookOpen}
            iconBgColor="bg-primary/10"
            iconColor="text-primary"
            subtitle="Asignadas"
          />
          
          <MetricCard
            title="Mis Alumnos"
            value={stats.totalStudents.toString()}
            icon={Users}
            iconBgColor="bg-purple-100"
            iconColor="text-purple-600"
            subtitle="Total"
          />
          
          <MetricCard
            title="Por Calificar"
            value={stats.pendingGrades.toString()}
            icon={FileCheck}
            iconBgColor="bg-amber-100"
            iconColor="text-amber-600"
            subtitle="Entregas pendientes"
          />
          
          <MetricCard
            title="Asistencias Hoy"
            value={stats.todayAttendances.toString()}
            icon={Calendar}
            iconBgColor="bg-emerald-100"
            iconColor="text-emerald-600"
            subtitle="Registradas"
          />
        </div>
      )}

      {/* Materias Asignadas */}
      <div>
        <h2 className="text-xl font-bold text-dark mb-4">
          Mis Materias
        </h2>

        {loading ? (
          <div className="text-center text-gray py-12">
            Cargando materias...
          </div>
        ) : subjects.length === 0 ? (
          <div className="card text-center py-12">
            <BookOpen className="w-16 h-16 text-gray mx-auto mb-4 opacity-50" />
            <p className="text-gray font-regular">
              No tienes materias asignadas
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject) => (
              <div
                key={subject.id}
                className="card hover:shadow-lg transition-all duration-300 group"
              >
                {/* Header de la Card */}
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-bold text-dark text-lg group-hover:text-primary transition-colors">
                        {subject.name}
                      </h3>
                      <p className="text-sm text-gray">
                        {subject.code} • {subject.courseName}
                      </p>
                    </div>
                    <div className="ml-3">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-3 text-sm text-gray">
                    {subject.semester && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Semestre {subject.semester}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {subject.studentCount} alumnos
                    </span>
                  </div>
                </div>

                {/* Botones de Acción */}
                <div className="grid grid-cols-3 gap-2">
                  <Link
                    href={`/docente/asistencia/${subject.id}`}
                    className="flex flex-col items-center gap-2 p-3 rounded-lg bg-light hover:bg-green-50 hover:border hover:border-green-300 transition-all duration-200 text-center"
                  >
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-xs font-medium text-dark">
                      Pasar Lista
                    </span>
                  </Link>

                  <Link
                    href={`/docente/tareas/${subject.id}`}
                    className="flex flex-col items-center gap-2 p-3 rounded-lg bg-light hover:bg-primary/10 hover:border hover:border-primary transition-all duration-200 text-center"
                  >
                    <FileCheck className="w-5 h-5 text-primary" />
                    <span className="text-xs font-medium text-dark">
                      Tareas
                    </span>
                  </Link>

                  <Link
                    href={`/docente/alumnos/${subject.id}`}
                    className="flex flex-col items-center gap-2 p-3 rounded-lg bg-light hover:bg-purple-50 hover:border hover:border-purple-300 transition-all duration-200 text-center"
                  >
                    <Users className="w-5 h-5 text-purple-600" />
                    <span className="text-xs font-medium text-dark">
                      Ver Alumnos
                    </span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tips y Atajos */}
      <div className="card bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Clock className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-dark mb-2">
              Accesos Rápidos
            </h3>
            <ul className="space-y-1 text-sm text-gray">
              <li>• <strong>Pasar Lista:</strong> Registra la asistencia diaria de tus alumnos</li>
              <li>• <strong>Tareas:</strong> Crea nuevas tareas y califica las entregas</li>
              <li>• <strong>Ver Alumnos:</strong> Consulta la lista completa con fotos</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

