'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/contexts/sidebar-context';

interface SidebarLayoutWrapperProps {
  children: ReactNode;
}

export function SidebarLayoutWrapper({ children }: SidebarLayoutWrapperProps) {
  const { collapsed } = useSidebar();

  return (
    <main
      className={cn(
        'pt-16 transition-all duration-300 min-h-screen',
        collapsed ? 'lg:pl-20' : 'lg:pl-64'
      )}
    >
      <div className="p-4 lg:p-6 max-w-7xl mx-auto">
        {children}
      </div>
    </main>
  );
}


