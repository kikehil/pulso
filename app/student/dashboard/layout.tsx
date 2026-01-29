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
      <div className="min-h-screen bg-light flex">
        <StudentSidebar universityName={university?.name || 'Tecnologico de Panuco'} />
        <SidebarLayoutWrapper>
          <Navbar universityName={university?.name || 'Tecnologico de Panuco'} />
          <main className="flex-1 overflow-y-auto pt-16">
            <div className="p-4 lg:p-6 max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </SidebarLayoutWrapper>
      </div>
    </SidebarProvider>
  );
}


