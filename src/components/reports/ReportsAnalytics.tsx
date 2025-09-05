import React, { useState, useEffect } from 'react';
import { Report } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar, 
  Download, 
  Filter,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  FileText,
  PieChart,
  Activity,
  AlertCircle
} from 'lucide-react';

interface AnalyticsData {
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  pendingAppointments: number;
  totalPsychologists: number;
  activePsychologists: number;
  totalStudents: number;
  averageRating: number;
  monthlyData: {
    month: string;
    appointments: number;
    completed: number;
    cancelled: number;
  }[];
  psychologistPerformance: {
    name: string;
    appointments: number;
    rating: number;
    completionRate: number;
  }[];
  appointmentTypes: {
    type: string;
    count: number;
    percentage: number;
  }[];
}

export function ReportsAnalytics() {
  const [system, setSystem] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSystem() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('http://localhost:8000/api/reports/system', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });
        const data = await res.json();
        setSystem(data.data);
      } catch (e) {
        setError('No se pudieron cargar los datos del sistema.');
      } finally {
        setLoading(false);
      }
    }
    fetchSystem();
  }, []);

  const generateReport = async (type: string) => {
    try {
      // Simular generación de reporte
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert(`Reporte de ${type} generado exitosamente`);
    } catch (error: any) {
      setError('Error al generar el reporte');
      console.error('Error generating report:', error);
    }
  };

  const downloadReport = async (type: string) => {
    try {
      // Simular descarga
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert(`Descargando reporte de ${type}...`);
    } catch (error: any) {
      setError('Error al descargar el reporte');
      console.error('Error downloading report:', error);
    }
  };

  if (loading && !system) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-600" />
          <p className="text-gray-600">Cargando análisis...</p>
        </div>
      </div>
    );
  }

  if (!system) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No hay datos disponibles</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Título Principal */}
      <div className="text-center mb-6">
        <div className="inline-block px-20 py-4 bg-white border border-gray-200 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight mb-2">
            Reportes y Análisis del Sistema
          </h1>
          <div className="w-28 h-1 bg-gradient-to-r from-gray-800 to-gray-600 mx-auto rounded-full"></div>
        </div>
      </div>

      {/* Botón para descargar PDF profesional único */}
      <div className="flex justify-end mb-6">
        <Button
          className="bg-[#8e161a] text-white font-bold hover:bg-[#6b1115]"
          onClick={async () => {
            try {
              const res = await fetch('http://localhost:8000/api/reports/download-system-pdf', {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
              });
              const blob = await res.blob();
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'reporte_superadmin.pdf';
              document.body.appendChild(a);
              a.click();
              a.remove();
              window.URL.revokeObjectURL(url);
            } catch (e) {
              alert('No se pudo descargar el PDF profesional.');
            }
          }}
        >
          Descargar PDF Profesional Único
        </Button>
      </div>

      {/* Resumen de datos generales del sistema en tiempo real */}
      {loading ? (
        <div className="text-center text-gray-500 py-12">Cargando datos del sistema...</div>
      ) : error ? (
        <div className="text-center text-red-600 py-12">{error}</div>
      ) : system && (
        <div className="space-y-8">
          {/* Estado del Servidor */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold text-[#8e161a] mb-4">Estado del Servidor</h2>
            <ul className="text-sm text-gray-700 space-y-1">
              <li><b>Espacio en disco:</b> {((system.disk.used / 1024 / 1024 / 1024).toFixed(1))} GB usado / {((system.disk.total / 1024 / 1024 / 1024).toFixed(1))} GB total ({system.disk.percent}%)</li>
              <li><b>CPU:</b> {Array.isArray(system.cpu) ? system.cpu[0] + ' (load avg)' : (system.cpu ?? 'N/A')}</li>
              <li><b>Memoria RAM:</b> {system.memory ? <span className="font-mono">{system.memory}</span> : 'N/A'}</li>
              <li><b>Uptime:</b> {system.uptime || 'N/A'}</li>
              <li><b>Sistema:</b> PHP {system.php_version}, Laravel {system.laravel_version}</li>
            </ul>
          </div>
          {/* Logs y Errores Recientes */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold text-[#8e161a] mb-4">Logs y Errores Recientes</h2>
            <ul className="text-sm text-gray-700 space-y-1">
              {system.last_errors && system.last_errors.length > 0 ? system.last_errors.map((err: string, idx: number) => (
                <li key={idx}>{err}</li>
              )) : <li>No hay errores recientes.</li>}
            </ul>
          </div>
        </div>
      )}

      {/* Controles principales (si los quieres dejar, si no, elimínalos también) */}
      {/* Elimino los controles principales y cualquier referencia a dateRange/setDateRange */}

      {/* Acciones rápidas */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button variant="outline" className="p-4 h-auto">
            <BarChart3 className="w-5 h-5 mr-2" />
            <div className="text-left">
              <div className="font-medium">Reporte Mensual</div>
              <div className="text-sm opacity-90">Generar reporte completo</div>
            </div>
          </Button>
          
          <Button variant="outline" className="p-4 h-auto">
            <Activity className="w-5 h-5 mr-2" />
            <div className="text-left">
              <div className="font-medium">Análisis de Tendencias</div>
              <div className="text-sm opacity-90">Ver patrones y tendencias</div>
            </div>
          </Button>
          
          <Button variant="outline" className="p-4 h-auto">
            <PieChart className="w-5 h-5 mr-2" />
            <div className="text-left">
              <div className="font-medium">Distribución</div>
              <div className="text-sm opacity-90">Análisis por categorías</div>
            </div>
          </Button>
          
          <Button variant="outline" className="p-4 h-auto">
            <Download className="w-5 h-5 mr-2" />
            <div className="text-left">
              <div className="font-medium">Exportar Datos</div>
              <div className="text-sm opacity-90">Descargar en Excel/PDF</div>
            </div>
          </Button>
        </div>
      </Card>
    </div>
  );
}