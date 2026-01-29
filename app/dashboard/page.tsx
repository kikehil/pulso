import { Users, GraduationCap, FolderKanban, FileCheck } from 'lucide-react';
import { MetricCard } from '@/components/metric-card';
import { AttendanceCard } from '@/components/pulsetec-card';
import { getDashboardMetrics, getRecentStudents, getTopGroups, getUpcomingAssignments } from './actions';
import { formatNumber, formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  // Obtener métricas con filtrado por university_id
  const metrics = await getDashboardMetrics();
  const recentStudents = await getRecentStudents(5);
  const topGroups = await getTopGroups(5);
  const upcomingAssignments = await getUpcomingAssignments(5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-dark">
          Dashboard - Panel de Control
        </h1>
        <p className="text-gray mt-1 font-regular">
          Resumen general de la actividad universitaria
        </p>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <MetricCard
          title="Alumnos Totales"
          value={formatNumber(metrics.totalStudents)}
          icon={Users}
          iconBgColor="bg-primary/10"
          iconColor="text-primary"
          subtitle="Estudiantes activos"
        />
        
        <MetricCard
          title="Docentes"
          value={formatNumber(metrics.totalTeachers)}
          icon={GraduationCap}
          iconBgColor="bg-purple-100"
          iconColor="text-purple-600"
          subtitle="Profesores activos"
        />
        
        <MetricCard
          title="Grupos Activos"
          value={formatNumber(metrics.activeGroups)}
          icon={FolderKanban}
          iconBgColor="bg-emerald-100"
          iconColor="text-emerald-600"
          subtitle="Grupos en curso"
        />
        
        <MetricCard
          title="Tareas Entregadas Hoy"
          value={formatNumber(metrics.todaySubmissions)}
          icon={FileCheck}
          iconBgColor="bg-amber-100"
          iconColor="text-amber-600"
          subtitle="Entregas del día"
        />
      </div>

      {/* Secciones adicionales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card de Asistencia - Estilo PulseTec */}
        <AttendanceCard
          percentage={95}
          totalStudents={metrics.totalStudents}
          presentStudents={Math.round(metrics.totalStudents * 0.95)}
        />
        
        {/* Estudiantes Recientes */}
        <div className="card lg:col-span-2">
          <div className="card-header">
            <h2 className="card-title">Estudiantes Recientes</h2>
          </div>
          
          <div className="space-y-3">
            {recentStudents.length > 0 ? (
              recentStudents.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-light hover:bg-primary/5 hover:border hover:border-primary/20 transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm ring-2 ring-primary/20">
                      {student.firstName[0]}{student.lastName[0]}
                    </div>
                    <div>
                      <p className="font-medium text-dark text-sm">
                        {student.firstName} {student.lastName}
                      </p>
                      <p className="text-xs text-gray">{student.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray font-regular">
                      {formatDate(student.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray py-8 text-sm font-regular">
                No hay estudiantes registrados
              </p>
            )}
          </div>
        </div>

        {/* Grupos Populares */}
        <div className="card lg:col-span-2">
          <div className="card-header">
            <h2 className="card-title">Grupos con Más Estudiantes</h2>
          </div>
          
          <div className="space-y-3">
            {topGroups.length > 0 ? (
              topGroups.map((group) => (
                <div
                  key={group.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-light hover:bg-primary/5 hover:border hover:border-primary/20 transition-all duration-200 cursor-pointer"
                >
                  <div>
                    <p className="font-medium text-dark text-sm">
                      {group.name}
                    </p>
                    <p className="text-xs text-gray">
                      {group.course.name}
                      {group.teacher && ` - ${group.teacher.firstName} ${group.teacher.lastName}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium shadow-sm">
                      {group._count.enrollments} estudiantes
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray py-8 text-sm font-regular">
                No hay grupos activos
              </p>
            )}
          </div>
        </div>

        {/* Tareas Próximas */}
        <div className="card lg:col-span-3">
          <div className="card-header">
            <h2 className="card-title">Tareas Próximas a Vencer</h2>
          </div>
          
          <div className="space-y-3">
            {upcomingAssignments.length > 0 ? (
              upcomingAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-light hover:bg-primary/5 hover:border hover:border-primary/20 transition-all duration-200 gap-2 cursor-pointer"
                >
                  <div className="flex-1">
                    <p className="font-medium text-dark text-sm">
                      {assignment.title}
                    </p>
                    <p className="text-xs text-gray">
                      {assignment.subject.name} ({assignment.subject.code})
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray font-medium">
                      {assignment._count.submissions} entregas
                    </span>
                    <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium whitespace-nowrap shadow-sm">
                      Vence: {formatDate(assignment.dueDate)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray py-8 text-sm font-regular">
                No hay tareas próximas
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

