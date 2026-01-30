'use client';

import { useSession } from 'next-auth/react';
import { User, Mail, Shield, GraduationCap, Building2 } from 'lucide-react';

export default function StudentProfilePage() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl lg:text-3xl font-bold text-dark">Mi Perfil</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card de Información Principal */}
        <div className="lg:col-span-1">
          <div className="card text-center p-8">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              {user?.image ? (
                <img
                  src={user.image}
                  alt={user.name || 'Estudiante'}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 text-primary" />
              )}
            </div>
            <h2 className="text-xl font-bold text-dark">{user?.name || 'Estudiante'}</h2>
            <p className="text-gray text-sm mb-4">Alumno</p>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
              Activo
            </div>
          </div>
        </div>

        {/* Detalles de la Cuenta */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h3 className="text-lg font-bold text-dark mb-6 border-b pb-4">Detalles de la Cuenta</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-light rounded-lg">
                  <Mail className="w-5 h-5 text-gray" />
                </div>
                <div>
                  <p className="text-xs text-gray uppercase font-bold tracking-wider">Correo Electrónico</p>
                  <p className="text-dark font-medium">{user?.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-light rounded-lg">
                  <Shield className="w-5 h-5 text-gray" />
                </div>
                <div>
                  <p className="text-xs text-gray uppercase font-bold tracking-wider">Rol de Usuario</p>
                  <p className="text-dark font-medium">Estudiante</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-light rounded-lg">
                  <GraduationCap className="w-5 h-5 text-gray" />
                </div>
                <div>
                  <p className="text-xs text-gray uppercase font-bold tracking-wider">Matrícula</p>
                  <p className="text-dark font-medium">{(user as any)?.enrollmentId || 'No asignada'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-light rounded-lg">
                  <Building2 className="w-5 h-5 text-gray" />
                </div>
                <div>
                  <p className="text-xs text-gray uppercase font-bold tracking-wider">Universidad</p>
                  <p className="text-dark font-medium">Tecnológico de Pánuco</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-amber-50 border-amber-200">
            <div className="flex items-start gap-3">
              <Shield className="w-6 h-6 text-amber-600 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-amber-800">Seguridad</h4>
                <p className="text-sm text-amber-700 mt-1">
                  Para cambiar tu contraseña o actualizar tu información personal, por favor contacta al departamento de servicios escolares de tu institución.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

