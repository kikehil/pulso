'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  User,
  ChevronLeft,
  ChevronRight,
  Home,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PulsoLogo } from './pulso-logo';
import { useSidebar } from '@/contexts/sidebar-context';

interface StudentSidebarProps {
  universityName?: string;
}

const menuItems = [
  {
    title: 'Mi Dashboard',
    icon: LayoutDashboard,
    href: '/student/dashboard',
  },
  {
    title: 'Mis Tareas',
    icon: FileText,
    href: '/student/assignments',
  },
  {
    title: 'Mis Calificaciones',
    icon: BarChart3,
    href: '/student/grades',
  },
  {
    title: 'Mi Perfil',
    icon: User,
    href: '/student/profile',
  },
];

export function StudentSidebar({ universityName = 'Tecnologico de Panuco' }: StudentSidebarProps) {
  const { collapsed, setCollapsed } = useSidebar();
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const { data: session } = useSession();
  
  // Verificar si el usuario tiene permisos administrativos
  const hasAdminAccess = session?.user?.role === 'ADMIN' || session?.user?.role === 'COORDINADOR';

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // En móvil, iniciar colapsado
  useEffect(() => {
    if (isMobile) {
      setCollapsed(true);
    }
  }, [isMobile, setCollapsed]);

  // Auto-colapso al hacer click fuera (solo en móvil)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        isMobile &&
        !collapsed &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setCollapsed(true);
      }
    }

    if (!collapsed && isMobile) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [collapsed, setCollapsed, isMobile]);

  return (
    <>
      {/* Overlay en móvil */}
      {!collapsed && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}
      
      <aside
        ref={sidebarRef}
        className={cn(
          'fixed left-0 top-0 h-screen bg-dark border-r border-dark-800 transition-all duration-300 z-40 flex flex-col',
          isMobile ? (collapsed ? '-translate-x-full w-64' : 'translate-x-0 w-64') : (collapsed ? 'w-20' : 'w-64'),
          'lg:translate-x-0'
        )}
      >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-dark-800 h-16">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <PulsoLogo variant="compact" showText={true} className="scale-90" />
          </div>
        )}
        {collapsed && (
          <div className="w-10 h-10 mx-auto">
            <PulsoLogo variant="icon-only" showText={false} />
          </div>
        )}
      </div>

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-1">
        {/* Botón de Inicio Destacado */}
        <Link
          href="/student/dashboard"
          className={cn(
            'sidebar-link mb-3',
            pathname === '/student/dashboard' && 'active',
            collapsed && 'justify-center'
          )}
          title={collapsed ? 'Inicio' : undefined}
        >
          <Home className={cn('w-5 h-5 flex-shrink-0', collapsed && 'mx-auto')} />
          {!collapsed && <span className="font-bold">Inicio</span>}
        </Link>

        {/* Separador */}
        {!collapsed && (
          <div className="my-3 border-t border-dark-800" />
        )}

        {/* Items del Menú Principal */}
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'sidebar-link',
                isActive && 'active',
                collapsed && 'justify-center'
              )}
              title={collapsed ? item.title : undefined}
            >
              <Icon className={cn('w-5 h-5 flex-shrink-0', collapsed && 'mx-auto')} />
              {!collapsed && <span>{item.title}</span>}
            </Link>
          );
        })}

        {/* Dashboard Administrativo (solo para Admin y Coordinador) */}
        {hasAdminAccess && (
          <>
            {!collapsed && (
              <div className="my-3 border-t border-dark-800" />
            )}
            <Link
              href="/dashboard"
              className={cn(
                'sidebar-link bg-primary/10 hover:bg-primary/20 border border-primary/30',
                pathname.startsWith('/dashboard') && 'active',
                collapsed && 'justify-center'
              )}
              title={collapsed ? 'Panel Administrativo' : undefined}
            >
              <Settings className={cn('w-5 h-5 flex-shrink-0 text-primary', collapsed && 'mx-auto')} />
              {!collapsed && (
                <span className="text-primary font-medium">Panel Administrativo</span>
              )}
            </Link>
          </>
        )}
      </nav>

      {/* Toggle Button - Solo en desktop */}
      {!isMobile && (
        <div className="p-4 border-t border-dark-800">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              'w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-gray hover:bg-dark-800 hover:text-primary transition-all duration-200',
              collapsed && 'px-2'
            )}
            aria-label={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <>
                <ChevronLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Colapsar</span>
              </>
            )}
          </button>
        </div>
      )}
    </aside>
    </>
  );
}

