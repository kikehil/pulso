'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PulseTecIcon } from './pulsetec-logo';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
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
    href: '/docente',
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

export function MobileSidebar({ isOpen, onClose, universityName = 'Tecnologico de Panuco' }: MobileSidebarProps) {
  const pathname = usePathname();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-dark border-r border-dark-800 z-50 flex flex-col lg:hidden shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-dark-800 h-16">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/30 p-1.5">
              <PulseTecIcon className="text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-white text-sm leading-tight">
                {universityName}
              </span>
              <span className="text-xs text-gray font-regular">Admin LMS</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-dark-800 transition-colors"
            aria-label="Cerrar menú"
          >
            <X className="w-5 h-5 text-gray hover:text-primary" />
          </button>
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
                onClick={onClose}
                className={cn('sidebar-link', isActive && 'active')}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

