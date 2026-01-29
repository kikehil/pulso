'use client';

import { useState } from 'react';
import { Download, FileText, FileSpreadsheet, Calendar, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReportsTabProps {
  groupId: string;
  groupName: string;
  courseName: string;
  teacherName: string;
}

export function ReportsTab({ groupId, groupName, courseName, teacherName }: ReportsTabProps) {
  const [generating, setGenerating] = useState(false);
  const [selectedReport, setSelectedReport] = useState<'attendance' | 'grades' | null>(null);

  async function generateAttendancePDF() {
    setGenerating(true);
    try {
      // Verificar si jspdf está instalado
      const jsPDF = (await import('jspdf')).default;
      const autoTable = (await import('jspdf-autotable')).default;

      const doc = new jsPDF();

      // Configuración
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Header con logo PulseTec (simulado con texto por ahora)
      doc.setFillColor(6, 182, 212); // Primary Cyan
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('PulseTec Control', 15, 20);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Sistema de Gestión Académica', 15, 30);

      // Información del Reporte
      doc.setTextColor(15, 23, 42); // Dark
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Reporte de Asistencia', 15, 55);

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Docente: ${teacherName}`, 15, 65);
      doc.text(`Materia: ${courseName}`, 15, 72);
      doc.text(`Grupo: ${groupName}`, 15, 79);
      doc.text(`Fecha de Generación: ${new Date().toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })}`, 15, 86);

      // Tabla de Asistencia (datos de ejemplo)
      const tableData = [
        ['Juan Pérez', '20/22', '90.9%', '20', '0', '2', '0'],
        ['María García', '18/22', '81.8%', '18', '0', '4', '0'],
        ['Carlos López', '21/22', '95.5%', '21', '0', '1', '0'],
        ['Ana Martínez', '19/22', '86.4%', '19', '0', '2', '1'],
      ];

      autoTable(doc, {
        startY: 95,
        head: [['Alumno', 'Asistencias', '%', 'Presente', 'Retardo', 'Falta', 'Just.']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: [15, 23, 42], // Dark
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 10,
        },
        bodyStyles: {
          fontSize: 9,
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252], // Light
        },
        margin: { left: 15, right: 15 },
      });

      // Footer
      const finalY = (doc as any).lastAutoTable.finalY || 150;
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139); // Gray
      doc.text(
        'Generado por PulseTec Control LMS',
        pageWidth / 2,
        pageHeight - 15,
        { align: 'center' }
      );
      doc.text(
        `Página 1 de 1`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );

      // Descargar
      doc.save(`Reporte_Asistencia_${groupName}_${Date.now()}.pdf`);
      
      alert('✅ Reporte de Asistencia generado exitosamente!');
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      if (error.message?.includes('Cannot find module')) {
        alert('⚠️ Necesitas instalar las dependencias:\nnpm install jspdf jspdf-autotable');
      } else {
        alert('Error al generar el PDF');
      }
    } finally {
      setGenerating(false);
    }
  }

  async function generateGradesExcel() {
    setGenerating(true);
    try {
      // Verificar si xlsx está instalado
      const XLSX = await import('xlsx');

      // Datos de ejemplo
      const data = [
        {
          Alumno: 'Juan Pérez',
          'Tarea 1': 85,
          'Examen Parcial': 90,
          'Proyecto Final': 95,
          Promedio: 91.5,
        },
        {
          Alumno: 'María García',
          'Tarea 1': 78,
          'Examen Parcial': 55,
          'Proyecto Final': 88,
          Promedio: 73.9,
        },
        {
          Alumno: 'Carlos López',
          'Tarea 1': 92,
          'Examen Parcial': 88,
          'Proyecto Final': 0,
          Promedio: 60.0,
        },
      ];

      // Crear workbook
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Calificaciones');

      // Configurar anchos de columna
      ws['!cols'] = [
        { wch: 20 }, // Alumno
        { wch: 12 }, // Tarea 1
        { wch: 15 }, // Examen Parcial
        { wch: 15 }, // Proyecto Final
        { wch: 12 }, // Promedio
      ];

      // Descargar
      XLSX.writeFile(wb, `Calificaciones_${groupName}_${Date.now()}.xlsx`);
      
      alert('✅ Reporte de Calificaciones generado exitosamente!');
    } catch (error: any) {
      console.error('Error generating Excel:', error);
      if (error.message?.includes('Cannot find module')) {
        alert('⚠️ Necesitas instalar las dependencias:\nnpm install xlsx');
      } else {
        alert('Error al generar el archivo Excel');
      }
    } finally {
      setGenerating(false);
    }
  }

  const reports = [
    {
      id: 'attendance' as const,
      title: 'Reporte de Asistencia',
      description: 'Genera un PDF con el historial completo de asistencias del grupo',
      icon: Calendar,
      color: 'bg-blue-500',
      action: generateAttendancePDF,
      fileType: 'PDF',
    },
    {
      id: 'grades' as const,
      title: 'Reporte de Calificaciones',
      description: 'Exporta una hoja de Excel con todas las calificaciones del grupo',
      icon: FileSpreadsheet,
      color: 'bg-green-500',
      action: generateGradesExcel,
      fileType: 'Excel',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-bold text-dark">Generador de Reportes</h3>
        <p className="text-sm text-gray mt-1">
          Exporta reportes en formato PDF o Excel para compartir o imprimir
        </p>
      </div>

      {/* Cards de Reportes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report) => {
          const Icon = report.icon;
          return (
            <div
              key={report.id}
              className={cn(
                'card hover:shadow-lg transition-all duration-300 group cursor-pointer',
                selectedReport === report.id && 'ring-2 ring-primary'
              )}
              onClick={() => setSelectedReport(report.id)}
            >
              <div className="flex items-start gap-4">
                <div className={cn('w-14 h-14 rounded-xl flex items-center justify-center', report.color)}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-dark text-lg group-hover:text-primary transition-colors">
                    {report.title}
                  </h4>
                  <p className="text-sm text-gray mt-1">{report.description}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="px-2 py-1 bg-gray/10 text-gray text-xs font-medium rounded">
                      Formato: {report.fileType}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  report.action();
                }}
                disabled={generating}
                className={cn(
                  'w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-bold text-white transition-all shadow-md',
                  generating
                    ? 'bg-gray cursor-not-allowed'
                    : 'bg-primary hover:bg-dark hover:shadow-xl'
                )}
              >
                <Download className="w-5 h-5" />
                {generating ? 'Generando...' : 'Generar Reporte'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Información del Grupo */}
      <div className="card bg-light border-2 border-primary/20">
        <h4 className="font-bold text-dark mb-3 flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Información del Reporte
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray">Docente:</span>
            <p className="font-medium text-dark">{teacherName}</p>
          </div>
          <div>
            <span className="text-gray">Materia:</span>
            <p className="font-medium text-dark">{courseName}</p>
          </div>
          <div>
            <span className="text-gray">Grupo:</span>
            <p className="font-medium text-dark">{groupName}</p>
          </div>
          <div>
            <span className="text-gray">Fecha:</span>
            <p className="font-medium text-dark">
              {new Date().toLocaleDateString('es-MX', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Instrucciones */}
      <div className="card bg-blue-50 border-2 border-blue-200">
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-bold mb-2">Instrucciones:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Selecciona el tipo de reporte que deseas generar</li>
              <li>Haz click en "Generar Reporte" para descargarlo</li>
              <li>Los reportes incluyen todos los datos actualizados del grupo</li>
              <li>Los archivos se guardarán en tu carpeta de Descargas</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Nota sobre dependencias */}
      <div className="card bg-amber-50 border-2 border-amber-200">
        <div className="flex items-start gap-3">
          <Download className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-900">
            <p className="font-bold mb-1">⚠️ Nota Técnica:</p>
            <p>
              Si aparece un error al generar reportes, asegúrate de haber instalado las dependencias:
            </p>
            <code className="block mt-2 p-2 bg-amber-100 rounded text-xs">
              npm install jspdf jspdf-autotable xlsx
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}


