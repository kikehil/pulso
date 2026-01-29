'use client';

import { useState, useEffect } from 'react';
import { Users, UserPlus, Search, Edit2, Trash2, Shield, GraduationCap } from 'lucide-react';

interface Coordinator {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  department: string | null;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function CoordinatorsPage() {
  const [coordinators, setCoordinators] = useState<Coordinator[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // TODO: Implementar fetch de coordinadores desde la API
  useEffect(() => {
    // Simulación de carga
    setTimeout(() => {
      setCoordinators([]);
      setLoading(false);
    }, 500);
  }, []);

  const filteredCoordinators = coordinators.filter(
    (coordinator) =>
      coordinator.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coordinator.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coordinator.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Coordinadores</h1>
            <p className="text-sm text-slate-600">
              Gestiona los coordinadores con permisos de Admin y Docente
            </p>
          </div>
        </div>

        <button className="btn-primary flex items-center gap-2">
          <UserPlus className="w-5 h-5" />
          <span>Nuevo Coordinador</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Total Coordinadores</p>
              <p className="text-3xl font-bold text-slate-900">{coordinators.length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Coordinadores Activos</p>
              <p className="text-3xl font-bold text-green-600">
                {coordinators.filter((c) => c.isActive).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Con Clases Asignadas</p>
              <p className="text-3xl font-bold text-cyan-600">0</p>
            </div>
            <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-cyan-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar coordinadores por nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                  Coordinador
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                  Departamento
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                  Teléfono
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                  Estado
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
                      <span className="text-slate-600">Cargando...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredCoordinators.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                        <Shield className="w-8 h-8 text-slate-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">
                          No hay coordinadores registrados
                        </h3>
                        <p className="text-sm text-slate-600">
                          Comienza agregando el primer coordinador
                        </p>
                      </div>
                      <button className="btn-primary mt-2">
                        <UserPlus className="w-5 h-5 mr-2" />
                        Agregar Coordinador
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCoordinators.map((coordinator) => (
                  <tr key={coordinator.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <Shield className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {coordinator.firstName} {coordinator.lastName}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{coordinator.email}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {coordinator.department || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {coordinator.phone || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          coordinator.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {coordinator.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="p-2 text-slate-600 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <Shield className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-purple-900 mb-2">
              Acerca del Rol Coordinador
            </h3>
            <p className="text-sm text-purple-800 leading-relaxed">
              Los <strong>Coordinadores</strong> tienen permisos combinados de Administrador y
              Docente. Pueden:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-purple-800">
              <li>✅ Gestionar alumnos, docentes, carreras y grupos (como Admin)</li>
              <li>✅ Ver y gestionar sus propias clases (como Docente)</li>
              <li>✅ Acceder al calendario y tomar asistencia</li>
              <li>✅ Crear y calificar actividades</li>
              <li>✅ Supervisar el portal del alumno</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}


