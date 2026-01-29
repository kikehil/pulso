'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { BookOpen, Calendar, ClipboardList, BarChart3 } from 'lucide-react';
import { getClassDetails } from './actions';
import { AttendanceTab } from '@/components/attendance-tab';
import { ActivitiesRubricsTab } from '@/components/activities-rubrics-tab';
import { GradebookTab } from '@/components/gradebook-tab';
import { ReportsTab } from '@/components/reports-tab';

interface ClassDetails {
  id: string;
  subjectName: string;
  subjectCode: string;
  groupName: string;
  groupCode: string;
  courseName: string;
  studentCount: number;
  teacherName?: string;
}

type TabType = 'attendance' | 'activities' | 'grades' | 'reports';

const tabs = [
  { id: 'attendance' as TabType, label: 'Asistencia', icon: ClipboardList },
  { id: 'activities' as TabType, label: 'Actividades y Rúbricas', icon: Calendar },
  { id: 'grades' as TabType, label: 'Calificaciones', icon: BarChart3 },
  { id: 'reports' as TabType, label: 'Reportes', icon: BookOpen },
];

export default function ClassDetailPage() {
  const params = useParams();
  const classId = params.id as string;
  
  const [activeTab, setActiveTab] = useState<TabType>('attendance');
  const [classDetails, setClassDetails] = useState<ClassDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClassDetails();
  }, []);

  async function loadClassDetails() {
    try {
      const data = await getClassDetails(classId);
      setClassDetails(data);
    } catch (error) {
      console.error('Error al cargar detalles de la clase:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray">Cargando clase...</p>
        </div>
      </div>
    );
  }

  if (!classDetails) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray">No se encontró la clase</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con información de la clase */}
      <div className="card">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-dark mb-1">
              {classDetails.subjectName}
            </h1>
            <p className="text-gray">
              {classDetails.subjectCode} • {classDetails.groupName} ({classDetails.groupCode})
            </p>
          </div>
          <div className="text-right">
            <div className="px-4 py-2 bg-primary/10 rounded-lg">
              <p className="text-xs text-gray font-medium">Alumnos inscritos</p>
              <p className="text-2xl font-bold text-primary">{classDetails.studentCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sistema de Tabs */}
      <div className="card p-0">
        {/* Tab Headers */}
        <div className="border-b border-gray/20">
          <div className="flex overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-6 py-4 font-medium text-sm transition-all whitespace-nowrap
                    border-b-2 -mb-px
                    ${isActive 
                      ? 'border-primary text-primary' 
                      : 'border-transparent text-gray hover:text-dark hover:bg-light/50'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'attendance' && <AttendanceTab groupId={classId} />}
          
          {activeTab === 'activities' && <ActivitiesRubricsTab groupId={classId} />}
          
          {activeTab === 'grades' && <GradebookTab groupId={classId} />}
          
          {activeTab === 'reports' && (
            <ReportsTab
              groupId={classId}
              groupName={`${classDetails.groupName} (${classDetails.groupCode})`}
              courseName={classDetails.subjectName}
              teacherName={classDetails.teacherName || 'Docente'}
            />
          )}
        </div>
      </div>
    </div>
  );
}

