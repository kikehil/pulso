'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Mail, User } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { getSubjectStudents } from '../../actions';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  enrollmentId: string | null;
  avatarUrl: string | null;
}

export default function AlumnosDocentePage() {
  const params = useParams();
  const subjectId = params.subjectId as string;

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudents();
  }, [subjectId]);

  const loadStudents = async () => {
    try {
      const data = await getSubjectStudents(subjectId);
      setStudents(data);
    } catch (error) {
      console.error('Error al cargar estudiantes:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/docente"
          className="p-2 rounded-lg hover:bg-light transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-dark">
            Lista de Alumnos
          </h1>
          <p className="text-gray mt-1 font-regular">
            {students.length} estudiante{students.length !== 1 ? 's' : ''} inscrito{students.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Grid de Alumnos */}
      {loading ? (
        <div className="text-center text-gray py-12">
          Cargando alumnos...
        </div>
      ) : students.length === 0 ? (
        <div className="card text-center py-12">
          <User className="w-16 h-16 text-gray mx-auto mb-4 opacity-50" />
          <p className="text-gray font-regular">
            No hay alumnos inscritos en esta materia
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((student) => (
            <div
              key={student.id}
              className="card hover:shadow-lg transition-all duration-200"
            >
              {/* Avatar y Nombre */}
              <div className="flex flex-col items-center text-center mb-4">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 mb-3">
                  {student.avatarUrl ? (
                    <Image
                      src={student.avatarUrl}
                      alt={`${student.firstName} ${student.lastName}`}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/10">
                      <span className="text-2xl font-bold text-primary">
                        {student.firstName[0]}{student.lastName[0]}
                      </span>
                    </div>
                  )}
                </div>

                <h3 className="font-bold text-dark text-lg">
                  {student.firstName} {student.lastName}
                </h3>
              </div>

              {/* Información */}
              <div className="space-y-2 text-sm">
                {student.enrollmentId && (
                  <div className="flex items-center gap-2 text-gray">
                    <User className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{student.enrollmentId}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <a
                    href={`mailto:${student.email}`}
                    className="truncate hover:text-primary transition-colors"
                  >
                    {student.email}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


