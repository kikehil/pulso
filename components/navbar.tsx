'use client';

import { Search, Menu, User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { MobileSidebar } from './mobile-sidebar';
import { NotificationBell } from './notification-bell';

interface NavbarProps {
  universityName?: string;
}

export function Navbar({ universityName }: NavbarProps) {
  const { data: session } = useSession();
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const getRoleName = (role: string) => {
    const roles: { [key: string]: string } = {
      ADMIN: 'Administrador',
      DOCENTE: 'Docente',
      ALUMNO: 'Alumno',
      COORDINADOR: 'Coordinador',
    };
    return roles[role] || 'Usuario';
  };

  async function handleLogout() {
    await signOut({ callbackUrl: '/login' });
  }

  return (
    <>
      <MobileSidebar
        isOpen={showMobileSidebar}
        onClose={() => setShowMobileSidebar(false)}
        universityName={universityName}
      />
      <header className="fixed top-0 right-0 left-0 h-16 bg-white border-b border-gray-200 z-30 transition-all duration-300 shadow-sm lg:left-64">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Left Section - Mobile Menu & Search */}
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={() => setShowMobileSidebar(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-light transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5 text-gray" />
          </button>

          <div className="hidden md:flex items-center flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray" />
              <input
                type="text"
                placeholder="Buscar estudiantes, cursos, docentes..."
                className="search-input text-sm text-dark placeholder:text-gray"
              />
            </div>
          </div>
        </div>

        {/* Right Section - Notifications & Profile */}
        <div className="flex items-center gap-2">
          {/* Search Mobile */}
          <button className="md:hidden p-2 rounded-lg hover:bg-light transition-colors">
            <Search className="w-5 h-5 text-gray" />
          </button>

          {/* Notifications */}
          {session?.user?.id && <NotificationBell userId={session.user.id} />}

          {/* Profile */}
          <div className="relative ml-2 pl-2 border-l border-gray-200">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3 hover:bg-light rounded-lg p-2 transition-colors"
            >
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-dark">
                  {session?.user?.email || 'Usuario'}
                </p>
                <p className="text-xs text-gray">
                  {session?.user?.role ? getRoleName(session.user.role) : 'Cargando...'}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold shadow-md shadow-primary/20">
                <User className="w-5 h-5" />
              </div>
              <ChevronDown className="w-4 h-4 text-gray hidden sm:block" />
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="text-sm font-medium text-dark truncate">
                    {session?.user?.email}
                  </p>
                  <p className="text-xs text-gray mt-1">
                    {session?.user?.role ? getRoleName(session.user.role) : ''}
                  </p>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <button className="w-full px-4 py-2 text-left text-sm text-gray hover:bg-light transition-colors flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Mi Perfil
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm text-gray hover:bg-light transition-colors flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Configuración
                  </button>
                </div>

                {/* Logout */}
                <div className="border-t border-gray-200 pt-2">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
    </>
  );
}

