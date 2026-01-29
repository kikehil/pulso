'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Users, Calendar as CalendarIcon, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { getTeacherClasses } from './actions';

interface TeacherClass {
  id: string;
  subjectName: string;
  subjectCode: string;
  groupName: string;
  groupCode: string;
  schedule: string | null;
  studentCount: number;
  courseName: string;
}

export default function TeacherDashboard() {
  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClasses();
  }, []);

  async function loadClasses() {
    try {
      const data = await getTeacherClasses();
      setClasses(data);
    } catch (error) {
      console.error('Error al cargar clases:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-dark">
          Mis Clases
        </h1>
        <p className="text-gray mt-1 font-regular">
          Gestiona tus materias y grupos asignados
        </p>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray">Cargando tus clases...</p>
          </div>
        </div>
      ) : classes.length === 0 ? (
        // Empty State
        <div className="card text-center py-16">
          <div className="w-24 h-24 rounded-full bg-gray/10 flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-12 h-12 text-gray/50" />
          </div>
          <h3 className="text-xl font-bold text-dark mb-2">
            No tienes asignaciones activas
          </h3>
          <p className="text-gray max-w-md mx-auto">
            Actualmente no tienes clases asignadas. Contacta al administrador si esto es un error.
          </p>
        </div>
      ) : (
        // Grid de Clases
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((clase) => (
            <Link
              key={clase.id}
              href={`/teacher/class/${clase.id}`}
              className="card hover:shadow-xl hover:border-primary/30 transition-all duration-300 group cursor-pointer"
            >
              {/* Icono de Materia */}
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <BookOpen className="w-7 h-7 text-primary" />
                </div>
              </div>

              {/* Información de la Materia */}
              <div className="mb-4">
                <h3 className="text-lg font-bold text-dark mb-1 group-hover:text-primary transition-colors">
                  {clase.subjectName}
                </h3>
                <p className="text-sm text-gray">
                  {clase.subjectCode}
                </p>
              </div>

              {/* Información del Grupo */}
              <div className="mb-4">
                <p className="text-sm text-gray font-medium">
                  {clase.groupName}
                </p>
                {clase.schedule && (
                  <p className="text-xs text-gray/70 mt-1">
                    {clase.schedule}
                  </p>
                )}
              </div>

              {/* Badge de Alumnos */}
              <div className="flex items-center gap-2 pt-4 border-t border-gray/10">
                <Users className="w-4 h-4 text-gray" />
                <span className="text-sm text-gray font-medium">
                  {clase.studentCount} {clase.studentCount === 1 ? 'alumno' : 'alumnos'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}


