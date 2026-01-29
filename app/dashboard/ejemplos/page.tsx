import { SearchForm } from '@/components/search-form';
import { PulseTecCard, AttendanceCard } from '@/components/pulsetec-card';
import { PulseTecLogo } from '@/components/pulsetec-logo';
import { 
  Users, 
  TrendingUp, 
  GraduationCap, 
  BookOpen,
  Award,
  Activity
} from 'lucide-react';

/**
 * Página de ejemplos de componentes PulseTec Control
 * Muestra todos los componentes disponibles con el diseño aplicado
 */
export default function EjemplosPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-dark">
          Componentes PulseTec Control
        </h1>
        <p className="text-gray mt-1 font-regular">
          Biblioteca completa de componentes con el sistema de diseño aplicado
        </p>
      </div>

      {/* Isotipo PulseTec */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-dark">Isotipo PulseTec</h2>
        <div className="card">
          <div className="flex items-center gap-8">
            <div>
              <p className="text-sm text-gray mb-2 font-regular">Small</p>
              <PulseTecLogo size="sm" />
            </div>
            <div>
              <p className="text-sm text-gray mb-2 font-regular">Medium</p>
              <PulseTecLogo size="md" />
            </div>
            <div>
              <p className="text-sm text-gray mb-2 font-regular">Large</p>
              <PulseTecLogo size="lg" />
            </div>
          </div>
        </div>
      </section>

      {/* Formulario de Búsqueda */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-dark">Formulario de Búsqueda</h2>
        <div className="card">
          <SearchForm placeholder="Buscar estudiantes por nombre, email o matrícula..." />
          
          <div className="mt-6 p-4 bg-light rounded-lg">
            <p className="text-sm font-medium text-dark mb-2">Características:</p>
            <ul className="text-sm text-gray space-y-1 font-regular">
              <li>• Border default: <code className="text-primary">#64748B</code></li>
              <li>• Focus: Border <code className="text-primary">#06B6D4</code> con resplandor</li>
              <li>• Botón primary: <code className="text-primary">#06B6D4</code> sólido</li>
              <li>• Icono de búsqueda incluido</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Card de Asistencia */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-dark">Card de Asistencia</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AttendanceCard
            percentage={95}
            totalStudents={150}
            presentStudents={142}
          />
          
          <AttendanceCard
            percentage={88}
            title="Asistencia Docentes"
            totalStudents={25}
            presentStudents={22}
          />
        </div>
        
        <div className="card">
          <p className="text-sm font-medium text-dark mb-2">Características:</p>
          <ul className="text-sm text-gray space-y-1 font-regular">
            <li>• Isotipo PulseTec en esquina superior derecha</li>
            <li>• Porcentaje en grande y negrita (<code className="text-primary">#0F172A</code>)</li>
            <li>• Título en Inter Medium</li>
            <li>• Sombra suave y bordes redondeados</li>
            <li>• Hover con transiciones suaves</li>
          </ul>
        </div>
      </section>

      {/* Cards Estándar */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-dark">Cards con Isotipo</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <PulseTecCard
            title="Total Estudiantes"
            value="150"
            subtitle="Estudiantes activos"
            icon={Users}
            showLogo={true}
          />
          
          <PulseTecCard
            title="Tasa de Crecimiento"
            value="+12%"
            subtitle="vs mes anterior"
            icon={TrendingUp}
            showLogo={true}
          />
          
          <PulseTecCard
            title="Cursos Activos"
            value="24"
            subtitle="En este período"
            icon={BookOpen}
            showLogo={true}
          />
        </div>
      </section>

      {/* Botones */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-dark">Botones</h2>
        <div className="card">
          <div className="flex flex-wrap items-center gap-4">
            <button className="btn-primary shadow-lg shadow-primary/20">
              Botón Primary
            </button>
            
            <button className="btn-primary inline-flex items-center gap-2 shadow-lg shadow-primary/20">
              <Users className="w-5 h-5" />
              Con Icono
            </button>
            
            <button className="btn-secondary">
              Botón Secondary
            </button>
            
            <button className="btn-secondary inline-flex items-center gap-2">
              <Award className="w-5 h-5" />
              Secondary con Icono
            </button>
          </div>
          
          <div className="mt-6 p-4 bg-light rounded-lg">
            <p className="text-sm font-medium text-dark mb-2">Especificaciones:</p>
            <ul className="text-sm text-gray space-y-1 font-regular">
              <li>• Primary: Fondo <code className="text-primary">#06B6D4</code>, texto blanco</li>
              <li>• Secondary: Fondo gris claro, texto dark</li>
              <li>• Font: Inter Medium</li>
              <li>• Hover con transiciones suaves</li>
              <li>• Sombra con color primary en botones principales</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Inputs */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-dark">Inputs</h2>
        <div className="card">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Input Básico
              </label>
              <input
                type="text"
                placeholder="Escribe aquí..."
                className="input-field"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="correo@ejemplo.com"
                className="input-field"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Búsqueda
              </label>
              <div className="relative">
                <Activity className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="search-input"
                />
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-light rounded-lg">
            <p className="text-sm font-medium text-dark mb-2">Estados:</p>
            <ul className="text-sm text-gray space-y-1 font-regular">
              <li>• Default: Border <code className="text-primary">#64748B</code></li>
              <li>• Focus: Border <code className="text-primary">#06B6D4</code> + ring suave</li>
              <li>• Placeholder: Color <code className="text-primary">#64748B</code></li>
              <li>• Transiciones suaves en todos los estados</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Paleta de Colores */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-dark">Paleta de Colores</h2>
        <div className="card">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <div className="w-full h-20 bg-primary rounded-lg mb-2"></div>
              <p className="text-sm font-medium text-dark">Primary</p>
              <p className="text-xs text-gray font-regular">#06B6D4</p>
            </div>
            
            <div>
              <div className="w-full h-20 bg-dark rounded-lg mb-2"></div>
              <p className="text-sm font-medium text-dark">Dark</p>
              <p className="text-xs text-gray font-regular">#0F172A</p>
            </div>
            
            <div>
              <div className="w-full h-20 bg-gray rounded-lg mb-2"></div>
              <p className="text-sm font-medium text-dark">Gray</p>
              <p className="text-xs text-gray font-regular">#64748B</p>
            </div>
            
            <div>
              <div className="w-full h-20 bg-light rounded-lg mb-2 border border-gray-200"></div>
              <p className="text-sm font-medium text-dark">Light</p>
              <p className="text-xs text-gray font-regular">#F8FAFC</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tipografía */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-dark">Tipografía - Inter</h2>
        <div className="card">
          <div className="space-y-4">
            <div>
              <p className="text-3xl font-bold text-dark">
                Heading Bold - Inter Bold
              </p>
              <p className="text-xs text-gray font-regular">
                font-bold (700) - Para títulos y encabezados
              </p>
            </div>
            
            <div>
              <p className="text-lg font-medium text-dark">
                Button Text - Inter Medium
              </p>
              <p className="text-xs text-gray font-regular">
                font-medium (500) - Para botones y etiquetas
              </p>
            </div>
            
            <div>
              <p className="text-base font-regular text-dark">
                Body Text - Inter Regular
              </p>
              <p className="text-xs text-gray font-regular">
                font-regular (400) - Para cuerpo de texto y párrafos
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}


