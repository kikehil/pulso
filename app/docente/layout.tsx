'use client';

import { Sidebar } from '@/components/sidebar';
import { Navbar } from '@/components/navbar';
import { SidebarProvider } from '@/contexts/sidebar-context';
import { SidebarLayoutWrapper } from '@/components/sidebar-layout-wrapper';

export default function DocenteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-light">
      {/* Sidebar */}
      <Sidebar universityName="Tecnologico de Panuco" />
      
      {/* Navbar */}
      <Navbar universityName="Tecnologico de Panuco" />
        
        {/* Main Content con padding dinámico */}
        <SidebarLayoutWrapper>
          {children}
        </SidebarLayoutWrapper>
      </div>
    </SidebarProvider>
  );
}

