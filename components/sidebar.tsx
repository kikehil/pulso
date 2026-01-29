'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  FolderKanban,
  FileText,
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PulsoLogo } from './pulso-logo';
import { useSidebar } from '@/contexts/sidebar-context';

interface SidebarProps {
  universityName?: string;
}

const menuItems = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
  },
  {
    title: 'Portal Docente',
    icon: GraduationCap,
    href: '/teacher/dashboard',
  },
  {
    title: 'Alumnos',
    icon: Users,
    href: '/dashboard/alumnos',
  },
  {
    title: 'Docentes',
    icon: GraduationCap,
    href: '/dashboard/docentes',
  },
  {
    title: 'Coordinadores',
    icon: Shield,
    href: '/dashboard/coordinadores',
  },
  {
    title: 'Carreras',
    icon: BookOpen,
    href: '/dashboard/carreras',
  },
  {
    title: 'Materias',
    icon: BookOpen,
    href: '/dashboard/materias',
  },
  {
    title: 'Grupos',
    icon: FolderKanban,
    href: '/dashboard/grupos',
  },
  {
    title: 'Tareas',
    icon: FileText,
    href: '/dashboard/tareas',
  },
  {
    title: 'Usuarios',
    icon: Shield,
    href: '/dashboard/usuarios',
  },
  {
    title: 'Configuración',
    icon: Settings,
    href: '/dashboard/settings',
  },
];

export function Sidebar({ universityName = 'Tecnologico de Panuco' }: SidebarProps) {
  const { collapsed, setCollapsed, toggleCollapsed } = useSidebar();
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Cerrar sidebar al hacer click fuera (solo cuando NO está colapsado)
  // TEMPORALMENTE DESACTIVADO - el auto-hide causaba problemas
  // useEffect(() => {
  //   function handleClickOutside(event: MouseEvent) {
  //     // Solo aplicar en desktop cuando el sidebar NO está colapsado
  //     if (
  //       !collapsed &&
  //       sidebarRef.current &&
  //       !sidebarRef.current.contains(event.target as Node)
  //     ) {
  //       setCollapsed(true);
  //     }
  //   }

  //   // Solo agregar el listener cuando el sidebar está expandido
  //   if (!collapsed) {
  //     document.addEventListener('mousedown', handleClickOutside);
  //     return () => {
  //       document.removeEventListener('mousedown', handleClickOutside);
  //     };
  //   }
  // }, [collapsed, setCollapsed]);

  return (
    <aside
      ref={sidebarRef}
      className={cn(
        'fixed left-0 top-0 h-screen bg-dark border-r border-dark-800 transition-all duration-300 z-40 flex flex-col',
        collapsed ? 'w-20' : 'w-64',
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
      </nav>

      {/* Toggle Button */}
      <div className="p-4 border-t border-dark-800">
        <button
          onClick={toggleCollapsed}
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
    </aside>
  );
}

