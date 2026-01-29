'use client';

import { Sidebar } from '@/components/sidebar';
import { Navbar } from '@/components/navbar';
import { SidebarProvider } from '@/contexts/sidebar-context';
import { SidebarLayoutWrapper } from '@/components/sidebar-layout-wrapper';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-light">
        <Sidebar universityName="Tecnologico de Panuco" />
        <Navbar universityName="Tecnologico de Panuco" />
        
        {/* Main Content con padding dinámico que se ajusta automáticamente */}
        <SidebarLayoutWrapper>
          {children}
        </SidebarLayoutWrapper>
      </div>
    </SidebarProvider>
  );
}

