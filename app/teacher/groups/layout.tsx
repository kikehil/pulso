import { TeacherSidebar } from '@/components/teacher-sidebar';
import { Navbar } from '@/components/navbar';
import { getCurrentUniversity, getCurrentUniversityId } from '@/lib/tenant';
import { SidebarProvider } from '@/contexts/sidebar-context';
import { SidebarLayoutWrapper } from '@/components/sidebar-layout-wrapper';

export default async function TeacherGroupsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const universityId = await getCurrentUniversityId();
  const university = await getCurrentUniversity(universityId);

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-light">
        <TeacherSidebar universityName={university?.name || 'Tecnologico de Panuco'} />
        <SidebarLayoutWrapper>
          <Navbar universityName={university?.name || 'Tecnologico de Panuco'} />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </SidebarLayoutWrapper>
      </div>
    </SidebarProvider>
  );
}


