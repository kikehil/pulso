'use client';

import { useState, useEffect } from 'react';
import { SearchForm } from '@/components/search-form';
import { Modal } from '@/components/modal';
import { ToggleSwitch } from '@/components/toggle-switch';
import { Plus, Edit, Trash2, User, Shield, Key, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  resetPassword,
  getAvailableProfiles,
  searchUsers,
  type UserWithProfile,
} from './actions';
import { Role } from '@/lib/types';

export default function UsuariosPage() {
  const [users, setUsers] = useState<UserWithProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserWithProfile[]>([]);
  const [availableProfiles, setAvailableProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithProfile | null>(null);
  const [resetPasswordUserId, setResetPasswordUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'ALUMNO' as Role,
    profileId: '',
  });
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Cargar datos iniciales
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const usersData = await getUsers();
      setUsers(usersData);
      setFilteredUsers(usersData);
    } catch (err) {
      setError('Error al cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  // Cargar perfiles disponibles cuando cambia el rol
  const handleRoleChange = async (role: Role) => {
    setFormData({ ...formData, role, profileId: '' });
    
    // ADMIN y COORDINADOR no necesitan perfil vinculado
    if (role === 'ADMIN' || role === 'COORDINADOR') {
      setAvailableProfiles([]);
      return;
    }

    try {
      const profiles = await getAvailableProfiles(role);
      setAvailableProfiles(profiles);
    } catch (err) {
      setError('Error al cargar los perfiles');
    }
  };

  // Búsqueda
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setFilteredUsers(users);
      return;
    }

    try {
      const results = await searchUsers(query);
      setFilteredUsers(results);
    } catch (err) {
      setError('Error en la búsqueda');
    }
  };

  // Abrir modal para crear
  const handleCreate = () => {
    setEditingUser(null);
    setFormData({
      email: '',
      password: '',
      role: 'ALUMNO',
      profileId: '',
    });
    setAvailableProfiles([]);
    setIsModalOpen(true);
    setError('');
    setSuccess('');
  };

  // Abrir modal para editar
  const handleEdit = async (user: UserWithProfile) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      password: '', // No se muestra la contraseña
      role: user.role,
      profileId: user.teacher?.id || user.student?.id || '',
    });

    // Cargar perfiles disponibles (ADMIN y COORDINADOR no los necesitan)
    if (user.role !== 'ADMIN' && user.role !== 'COORDINADOR') {
      const profiles = await getAvailableProfiles(user.role);
      setAvailableProfiles(profiles);
    }

    setIsModalOpen(true);
    setError('');
    setSuccess('');
  };

  // Guardar usuario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingUser) {
        await updateUser(editingUser.id, {
          email: formData.email,
          role: formData.role,
          isActive: editingUser.isActive,
          profileId: formData.profileId || undefined,
        });
        setSuccess('Usuario actualizado exitosamente');
      } else {
        if (!formData.password) {
          setError('La contraseña es requerida');
          return;
        }

        await createUser({
          email: formData.email,
          password: formData.password,
          role: formData.role,
          profileId: formData.profileId || undefined,
        });
        setSuccess('Usuario creado exitosamente');
      }

      await loadData();

      setTimeout(() => {
        setIsModalOpen(false);
        setSuccess('');
      }, 800);
    } catch (err: any) {
      setError(err.message || 'Error al guardar el usuario');
    }
  };

  // Toggle estado
  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await toggleUserStatus(id, !currentStatus);
      await loadData();
      setSuccess(`Usuario ${!currentStatus ? 'activado' : 'desactivado'} exitosamente`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Error al cambiar el estado');
    }
  };

  // Eliminar usuario
  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.')) return;

    try {
      await deleteUser(id);
      setSuccess('Usuario eliminado exitosamente');
      await loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Error al eliminar el usuario');
    }
  };

  // Abrir modal de restablecer contraseña
  const handleOpenResetPassword = (userId: string) => {
    setResetPasswordUserId(userId);
    setNewPassword('');
    setIsResetPasswordModalOpen(true);
    setError('');
    setSuccess('');
  };

  // Restablecer contraseña
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!resetPasswordUserId) return;

    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      await resetPassword(resetPasswordUserId, newPassword);
      setSuccess('Contraseña restablecida exitosamente');
      
      setTimeout(() => {
        setIsResetPasswordModalOpen(false);
        setSuccess('');
        setResetPasswordUserId(null);
      }, 800);
    } catch (err: any) {
      setError(err.message || 'Error al restablecer la contraseña');
    }
  };

  // Obtener badge de rol
  const getRoleBadge = (role: Role) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium bg-dark text-white">
            <Shield className="w-3 h-3" />
            ADMIN
          </span>
        );
      case 'COORDINADOR':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium bg-purple-600 text-white">
            <Shield className="w-3 h-3" />
            COORDINADOR
          </span>
        );
      case 'DOCENTE':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium bg-primary text-white">
            <User className="w-3 h-3" />
            DOCENTE
          </span>
        );
      case 'ALUMNO':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium bg-gray text-white">
            <User className="w-3 h-3" />
            ALUMNO
          </span>
        );
    }
  };

  // Obtener nombre del usuario
  const getUserName = (user: UserWithProfile) => {
    if (user.teacher) {
      return `${user.teacher.firstName} ${user.teacher.lastName}`;
    }
    if (user.student) {
      return `${user.student.firstName} ${user.student.lastName}`;
    }
    return user.email.split('@')[0];
  };

  // Obtener avatar del usuario
  const getUserAvatar = (user: UserWithProfile) => {
    return user.teacher?.avatarUrl || user.student?.avatarUrl || null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-dark">
            Gestión de Usuarios
          </h1>
          <p className="text-gray mt-1 font-regular">
            Administra usuarios y permisos del sistema
          </p>
        </div>

        <button
          onClick={handleCreate}
          className="btn-primary inline-flex items-center gap-2 shadow-lg shadow-primary/20"
        >
          <Plus className="w-5 h-5" />
          Nuevo Usuario
        </button>
      </div>

      {/* Mensajes */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
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
        placeholder="Buscar por nombre o email..."
        onSearch={handleSearch}
      />

      {/* Tabla */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray">
            Cargando usuarios...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center">
            <User className="w-16 h-16 text-gray mx-auto mb-4 opacity-50" />
            <p className="text-gray font-regular">No se encontraron usuarios</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold">Usuario</th>
                  <th className="px-6 py-4 text-left text-sm font-bold">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-bold">Rol</th>
                  <th className="px-6 py-4 text-center text-sm font-bold">Estado</th>
                  <th className="px-6 py-4 text-center text-sm font-bold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-light transition-colors"
                  >
                    {/* Usuario con foto */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                          {getUserAvatar(user) ? (
                            <Image
                              src={getUserAvatar(user)!}
                              alt={getUserName(user)}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                              <User className="w-5 h-5 text-gray" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-dark">
                            {getUserName(user)}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray">
                        {user.email}
                      </span>
                    </td>

                    {/* Rol Badge */}
                    <td className="px-6 py-4">
                      {getRoleBadge(user.role)}
                    </td>

                    {/* Toggle Estado */}
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <ToggleSwitch
                          checked={user.isActive}
                          onChange={() => handleToggleStatus(user.id, user.isActive)}
                        />
                      </div>
                    </td>

                    {/* Acciones */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenResetPassword(user.id)}
                          className="p-2 rounded-lg hover:bg-yellow-50 text-yellow-600 transition-colors"
                          title="Restablecer contraseña"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Crear/Editar */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              Email *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="usuario@universidad.edu"
              className="input-field"
            />
          </div>

          {/* Contraseña (solo al crear) */}
          {!editingUser && (
            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Contraseña *
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="Mínimo 6 caracteres"
                minLength={6}
                className="input-field"
              />
            </div>
          )}

          {/* Rol */}
          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              Rol *
            </label>
            <select
              required
              value={formData.role}
              onChange={(e) => handleRoleChange(e.target.value as Role)}
              className="input-field"
            >
              <option value="ALUMNO">Alumno</option>
              <option value="DOCENTE">Docente</option>
              <option value="COORDINADOR">Coordinador</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </div>

          {/* Vincular perfil */}
          {formData.role !== 'ADMIN' && formData.role !== 'COORDINADOR' && (
            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Vincular con perfil existente (opcional)
              </label>
              <select
                value={formData.profileId}
                onChange={(e) =>
                  setFormData({ ...formData, profileId: e.target.value })
                }
                className="input-field"
              >
                <option value="">Sin vincular</option>
                {availableProfiles.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.firstName} {profile.lastName} ({profile.email})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray mt-1">
                Vincula este usuario con un perfil de {formData.role === 'DOCENTE' ? 'docente' : 'alumno'} existente
              </p>
            </div>
          )}
          
          {/* Mensaje informativo para COORDINADOR */}
          {formData.role === 'COORDINADOR' && (
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-sm text-purple-800">
                <Shield className="w-4 h-4 inline mr-1" />
                <strong>Coordinador:</strong> Este rol tiene permisos de Admin + Docente. 
                Deberás asignarle materias desde el módulo de Grupos.
              </p>
            </div>
          )}

          {/* Botones */}
          <div className="flex items-center gap-3 pt-4">
            <button
              type="submit"
              className="btn-primary flex-1"
            >
              {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
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

      {/* Modal de Restablecer Contraseña */}
      <Modal
        isOpen={isResetPasswordModalOpen}
        onClose={() => setIsResetPasswordModalOpen(false)}
        title="Restablecer Contraseña"
        size="md"
      >
        <form onSubmit={handleResetPassword} className="space-y-6">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Importante:</strong> El usuario recibirá esta nueva contraseña y deberá cambiarla en su primer inicio de sesión.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              Nueva Contraseña *
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              minLength={6}
              className="input-field"
            />
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Restablecer Contraseña
            </button>
            <button
              type="button"
              onClick={() => setIsResetPasswordModalOpen(false)}
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

