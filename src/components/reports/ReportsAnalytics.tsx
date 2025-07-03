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
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [reportType, setReportType] = useState<'overview' | 'appointments' | 'psychologists' | 'students'>('overview');

  useEffect(() => {
    loadAnalyticsData();
  }, [dateRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simular carga de datos (en un caso real, harías una llamada a la API)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockData: AnalyticsData = {
        totalAppointments: 1247,
        completedAppointments: 1189,
        cancelledAppointments: 45,
        pendingAppointments: 13,
        totalPsychologists: 8,
        activePsychologists: 7,
        totalStudents: 523,
        averageRating: 4.7,
        monthlyData: [
          { month: 'Ene', appointments: 120, completed: 115, cancelled: 3 },
          { month: 'Feb', appointments: 135, completed: 128, cancelled: 5 },
          { month: 'Mar', appointments: 142, completed: 138, cancelled: 2 },
          { month: 'Abr', appointments: 156, completed: 149, cancelled: 4 },
          { month: 'May', appointments: 168, completed: 162, cancelled: 3 },
          { month: 'Jun', appointments: 189, completed: 182, cancelled: 5 },
          { month: 'Jul', appointments: 178, completed: 172, cancelled: 4 },
          { month: 'Ago', appointments: 159, completed: 153, cancelled: 3 }
        ],
        psychologistPerformance: [
          { name: 'Dr. Ana García', appointments: 156, rating: 4.9, completionRate: 98 },
          { name: 'Dr. Luis Mendoza', appointments: 142, rating: 4.8, completionRate: 96 },
          { name: 'Dr. Carmen Silva', appointments: 128, rating: 4.7, completionRate: 94 },
          { name: 'Dr. Roberto Vargas', appointments: 115, rating: 4.6, completionRate: 92 },
          { name: 'Dr. María López', appointments: 98, rating: 4.5, completionRate: 90 }
        ],
        appointmentTypes: [
          { type: 'Primera consulta', count: 245, percentage: 20 },
          { type: 'Seguimiento', count: 567, percentage: 45 },
          { type: 'Evaluación', count: 189, percentage: 15 },
          { type: 'Emergencia', count: 89, percentage: 7 },
          { type: 'Otros', count: 157, percentage: 13 }
        ]
      };
      
      setAnalyticsData(mockData);
    } catch (error: any) {
      setError('Error al cargar los datos de análisis');
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading && !analyticsData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#8e161a] via-cyan-400/30 to-violet-700/40 animate-gradient-shift p-6 flex flex-col items-center justify-center">
        <div className="w-full max-w-5xl mx-auto space-y-8 animate-fade-in-up">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Cargando análisis...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#8e161a] via-cyan-400/30 to-violet-700/40 animate-gradient-shift p-6 flex flex-col items-center justify-center">
        <div className="w-full max-w-5xl mx-auto space-y-8 animate-fade-in-up">
          <div className="text-center py-12">
            <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No hay datos disponibles</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#8e161a] via-cyan-400/30 to-violet-700/40 animate-gradient-shift p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-5xl mx-auto space-y-8 animate-fade-in-up">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reportes y Análisis</h1>
          <p className="text-gray-600">Análisis detallado del sistema de citas psicológicas</p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        {/* Controles */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-4">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="week">Esta semana</option>
                <option value="month">Este mes</option>
                <option value="quarter">Este trimestre</option>
                <option value="year">Este año</option>
              </select>
              
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="overview">Vista general</option>
                <option value="appointments">Citas</option>
                <option value="psychologists">Psicólogos</option>
                <option value="students">Estudiantes</option>
              </select>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={() => generateReport(reportType)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <FileText className="w-4 h-4 mr-2" />
                Generar Reporte
              </Button>
              
              <Button
                onClick={() => downloadReport(reportType)}
                variant="outline"
              >
                <Download className="w-4 h-4 mr-2" />
                Descargar
              </Button>
            </div>
          </div>
        </Card>

        {/* Métricas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Citas</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.totalAppointments}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completadas</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.completedAppointments}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Users className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Psicólogos Activos</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.activePsychologists}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Calificación Promedio</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.averageRating}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Gráfico de tendencias */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Tendencia de Citas</h2>
          <div className="h-64 flex items-end justify-between gap-2">
            {analyticsData.monthlyData.map((data, index) => (
              <div key={data.month} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-gray-200 rounded-t mb-2 relative">
                  <div 
                    className="bg-blue-500 rounded-t transition-all duration-500"
                    style={{ 
                      height: `${(data.appointments / Math.max(...analyticsData.monthlyData.map(d => d.appointments))) * 200}px` 
                    }}
                  ></div>
                </div>
                <span className="text-xs text-gray-600">{data.month}</span>
                <span className="text-xs font-medium text-gray-900">{data.appointments}</span>
              </div>
            ))}
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Rendimiento de psicólogos */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Rendimiento de Psicólogos</h2>
            <div className="space-y-3">
              {analyticsData.psychologistPerformance.map((psychologist, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 font-semibold text-sm">
                        {psychologist.name.split(' ').map((n: string) => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">{psychologist.name}</h4>
                      <p className="text-xs text-gray-600">{psychologist.appointments} citas</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{psychologist.rating}</span>
                      <span className="text-yellow-500">★</span>
                    </div>
                    <p className="text-xs text-gray-600">{psychologist.completionRate}% completadas</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Tipos de citas */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Tipos de Citas</h2>
            <div className="space-y-3">
              {analyticsData.appointmentTypes.map((type, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded"
                      style={{
                        backgroundColor: [
                          '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'
                        ][index % 5]
                      }}
                    ></div>
                    <span className="text-sm font-medium text-gray-900">{type.type}</span>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{type.count}</p>
                    <p className="text-xs text-gray-600">{type.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Estadísticas adicionales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">
                {analyticsData.cancelledAppointments}
              </div>
              <p className="text-sm text-gray-600">Citas Canceladas</p>
              <p className="text-xs text-gray-500 mt-1">
                {((analyticsData.cancelledAppointments / analyticsData.totalAppointments) * 100).toFixed(1)}% del total
              </p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-2">
                {analyticsData.pendingAppointments}
              </div>
              <p className="text-sm text-gray-600">Citas Pendientes</p>
              <p className="text-xs text-gray-500 mt-1">
                {((analyticsData.pendingAppointments / analyticsData.totalAppointments) * 100).toFixed(1)}% del total
              </p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {analyticsData.totalStudents}
              </div>
              <p className="text-sm text-gray-600">Estudiantes Únicos</p>
              <p className="text-xs text-gray-500 mt-1">
                Promedio: {(analyticsData.totalAppointments / analyticsData.totalStudents).toFixed(1)} citas/estudiante
              </p>
            </div>
          </Card>
        </div>

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
    </div>
  );
}