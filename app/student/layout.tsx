import { Navbar } from '@/components/navbar';
import { StudentSidebar } from '@/components/student-sidebar';
import { SidebarProvider } from '@/contexts/sidebar-context';
import { SidebarLayoutWrapper } from '@/components/sidebar-layout-wrapper';
import { getCurrentUniversity, getCurrentUniversityId } from '@/lib/tenant';

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const universityId = await getCurrentUniversityId();
  const university = await getCurrentUniversity(universityId);

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-light">
        <StudentSidebar universityName={university?.name || 'Tecnologico de Panuco'} />
        <SidebarLayoutWrapper>
          <Navbar universityName={university?.name || 'Tecnologico de Panuco'} />
          {children}
        </SidebarLayoutWrapper>
      </div>
    </SidebarProvider>
  );
}


