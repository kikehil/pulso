'use client';

import { useState, useEffect } from 'react';
import { SearchForm } from '@/components/search-form';
import { Modal } from '@/components/modal';
import { Plus, Edit, Trash2, BookOpen, Calendar } from 'lucide-react';
import { getCareers, createCareer, updateCareer, deleteCareer, searchCareers, type Career } from './actions';
import { formatDate } from '@/lib/utils';

export default function CarrerasPage() {
  const [careers, setCareers] = useState<Career[]>([]);
  const [filteredCareers, setFilteredCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCareer, setEditingCareer] = useState<Career | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Cargar carreras
  useEffect(() => {
    loadCareers();
  }, []);

  const loadCareers = async () => {
    try {
      const data = await getCareers();
      setCareers(data);
      setFilteredCareers(data);
    } catch (err) {
      setError('Error al cargar las carreras');
    } finally {
      setLoading(false);
    }
  };

  // Búsqueda
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setFilteredCareers(careers);
      return;
    }

    try {
      const results = await searchCareers(query);
      setFilteredCareers(results);
    } catch (err) {
      setError('Error en la búsqueda');
    }
  };

  // Abrir modal para crear
  const handleCreate = () => {
    setEditingCareer(null);
    setFormData({ name: '', code: '', description: '' });
    setIsModalOpen(true);
    setError('');
    setSuccess('');
  };

  // Abrir modal para editar
  const handleEdit = (career: Career) => {
    setEditingCareer(career);
    setFormData({
      name: career.name,
      code: career.code,
      description: career.description || '',
    });
    setIsModalOpen(true);
    setError('');
    setSuccess('');
  };

  // Guardar carrera
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingCareer) {
        await updateCareer(editingCareer.id, formData);
        setSuccess('Carrera actualizada exitosamente');
      } else {
        await createCareer(formData);
        setSuccess('Carrera creada exitosamente');
      }

      await loadCareers();
      
      // Cerrar modal después de 800ms (tiempo para ver el mensaje)
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccess('');
      }, 800);
    } catch (err: any) {
      setError(err.message || 'Error al guardar la carrera');
    }
  };

  // Eliminar carrera
  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta carrera?')) return;

    try {
      await deleteCareer(id);
      setSuccess('Carrera eliminada exitosamente');
      await loadCareers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error al eliminar la carrera');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-dark">
            Gestión de Carreras
          </h1>
          <p className="text-gray mt-1 font-regular">
            Administra las carreras de tu universidad
          </p>
        </div>

        <button
          onClick={handleCreate}
          className="btn-primary inline-flex items-center gap-2 shadow-lg shadow-primary/20"
        >
          <Plus className="w-5 h-5" />
          Nueva Carrera
        </button>
      </div>

      {/* Mensajes */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          {success}
        </div>
      )}

      {/* Buscador */}
      <SearchForm
        placeholder="Buscar por nombre, código o descripción..."
        onSearch={handleSearch}
      />

      {/* Tabla de Carreras */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-white">
                  Código
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white">
                  Nombre de la Carrera
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white hidden md:table-cell">
                  Descripción
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white hidden lg:table-cell">
                  Fecha de Creación
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white">
                  Estado
                </th>
                <th className="px-6 py-4 text-right text-sm font-bold text-white">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray">
                    Cargando carreras...
                  </td>
                </tr>
              ) : filteredCareers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <BookOpen className="w-12 h-12 text-gray mx-auto mb-3 opacity-50" />
                    <p className="text-gray font-regular">
                      No se encontraron carreras
                    </p>
                  </td>
                </tr>
              ) : (
                filteredCareers.map((career) => (
                  <tr
                    key={career.id}
                    className="hover:bg-light transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="font-medium text-primary">
                        {career.code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-dark">
                        {career.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="text-sm text-gray line-clamp-2">
                        {career.description || 'Sin descripción'}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <div className="flex items-center gap-2 text-sm text-gray">
                        <Calendar className="w-4 h-4" />
                        {formatDate(career.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          career.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {career.isActive ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(career)}
                          className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(career.id)}
                          className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
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

      {/* Modal de Crear/Editar */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCareer ? 'Editar Carrera' : 'Nueva Carrera'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nombre de la Carrera */}
          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              Nombre de la Carrera *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Ej: Ingeniería en Sistemas"
              className="input-field"
            />
          </div>

          {/* Código */}
          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              Código *
            </label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value.toUpperCase() })
              }
              placeholder="Ej: ING-SIS"
              className="input-field"
              disabled={!!editingCareer}
            />
            {editingCareer && (
              <p className="text-xs text-gray mt-1">
                El código no puede modificarse una vez creado
              </p>
            )}
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Describe la carrera..."
              rows={4}
              className="input-field resize-none"
            />
          </div>

          {/* Botones */}
          <div className="flex items-center gap-3 pt-4">
            <button
              type="submit"
              className="btn-primary flex-1"
            >
              {editingCareer ? 'Actualizar' : 'Crear'} Carrera
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn-secondary flex-1"
            >
              Cancelar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

