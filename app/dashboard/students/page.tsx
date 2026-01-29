import { SearchForm } from '@/components/search-form';
import { PulseTecCard } from '@/components/pulsetec-card';
import { Users, UserPlus, GraduationCap, TrendingUp } from 'lucide-react';

export default function StudentsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-dark">
            Gestión de Estudiantes
          </h1>
          <p className="text-gray mt-1 font-regular">
            Administra los estudiantes de tu universidad
          </p>
        </div>
        
        <button className="btn-primary inline-flex items-center gap-2 shadow-lg shadow-primary/20">
          <UserPlus className="w-5 h-5" />
          Agregar Estudiante
        </button>
      </div>

      {/* Buscador - Estilo PulseTec */}
      <SearchForm placeholder="Buscar estudiantes por nombre, email o matrícula..." />

      {/* Cards de Resumen con isotipo PulseTec */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <PulseTecCard
          title="Total Estudiantes"
          value="0"
          subtitle="Estudiantes activos"
          icon={Users}
          showLogo={true}
        />
        
        <PulseTecCard
          title="Nuevos este Mes"
          value="0"
          subtitle="Inscritos recientemente"
          icon={TrendingUp}
          showLogo={true}
        />
        
        <PulseTecCard
          title="En Curso"
          value="0"
          subtitle="Estudiantes cursando"
          icon={GraduationCap}
          showLogo={true}
        />
        
        <PulseTecCard
          title="Graduados"
          value="0"
          subtitle="Estudiantes graduados"
          icon={GraduationCap}
          showLogo={true}
        />
      </div>

      {/* Tabla de Estudiantes */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Lista de Estudiantes</h2>
        </div>
        
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray mx-auto mb-4 opacity-50" />
          <p className="text-gray font-regular mb-2">
            Módulo de estudiantes en desarrollo
          </p>
          <p className="text-sm text-gray/70 font-regular">
            Aquí podrás ver y gestionar todos los estudiantes de tu universidad
          </p>
        </div>
      </div>
    </div>
  );
}

