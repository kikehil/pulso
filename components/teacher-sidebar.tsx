'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
  Calendar,
  MessageSquare,
  User,
  ChevronLeft,
  ChevronRight,
  Users,
  FolderOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PulsoLogo } from './pulso-logo';
import { useSidebar } from '@/contexts/sidebar-context';

interface TeacherSidebarProps {
  universityName?: string;
}

const menuItems = [
  {
    title: 'Mis Clases',
    icon: BookOpen,
    href: '/teacher/dashboard',
  },
  {
    title: 'Mis Alumnos',
    icon: Users,
    href: '/teacher/students',
  },
  {
    title: 'Mis Grupos',
    icon: FolderOpen,
    href: '/teacher/groups',
  },
  {
    title: 'Calendario',
    icon: Calendar,
    href: '/teacher/calendar',
  },
  {
    title: 'Mensajes',
    icon: MessageSquare,
    href: '/teacher/messages',
    badge: 'Próximamente',
  },
  {
    title: 'Perfil',
    icon: User,
    href: '/teacher/profile',
  },
];

export function TeacherSidebar({ universityName = 'Tecnologico de Panuco' }: TeacherSidebarProps) {
  const { collapsed, setCollapsed } = useSidebar();
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
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

  // Auto-colapso al hacer click fuera (solo en móvil cuando está abierto)
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
      {/* Overlay oscuro en móvil cuando el sidebar está abierto */}
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
          // En móvil: ancho completo cuando está abierto, oculto cuando está cerrado
          // En desktop: comportamiento normal (colapsado = w-20, expandido = w-64)
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
                collapsed && 'justify-center',
                'relative'
              )}
              title={collapsed ? item.title : undefined}
            >
              <Icon className={cn('w-5 h-5 flex-shrink-0', collapsed && 'mx-auto')} />
              {!collapsed && (
                <span className="flex-1">{item.title}</span>
              )}
              {!collapsed && item.badge && (
                <span className="px-2 py-0.5 bg-primary/20 text-primary text-[10px] font-medium rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
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

