import { TeacherSidebar } from '@/components/teacher-sidebar';
import { Navbar } from '@/components/navbar';
import { getCurrentUniversity, getCurrentUniversityId } from '@/lib/tenant';
import { SidebarProvider } from '@/contexts/sidebar-context';
import { SidebarLayoutWrapper } from '@/components/sidebar-layout-wrapper';

export default async function TeacherDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const universityId = await getCurrentUniversityId();
  const university = await getCurrentUniversity(universityId);

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-light">
        <TeacherSidebar universityName={university?.name || 'Tecnologico de Panuco'} />
        <SidebarLayoutWrapper>
          <Navbar universityName={university?.name || 'Tecnologico de Panuco'} />
          {children}
        </SidebarLayoutWrapper>
      </div>
    </SidebarProvider>
  );
}


