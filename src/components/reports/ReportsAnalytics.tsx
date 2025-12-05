import React, { useState, useEffect } from 'react';
import { Report } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useAuth } from '../../contexts/AuthContext';
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
  AlertCircle,
  Sparkles,
  RefreshCw
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
  const { user } = useAuth();
  const [system, setSystem] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Determinar si es admin para aplicar el color correspondiente
  const isAdmin = user?.role === 'admin';

  const fetchSystem = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:8000/api/reports/system', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Error al obtener datos del sistema');
      }
      
      setSystem(data.data);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'No se pudieron cargar los datos del sistema.';
      setError(errorMessage);
      console.error('Error fetching system data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystem();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSystem();
    setRefreshing(false);
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

  // Animation classes
  const fadeInUp = "animate-fade-in";
  const stagger1 = "delay-[100ms]";

  if (loading && !system) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-violet-200 border-t-violet-600 rounded-full animate-spin mb-3 mx-auto"></div>
          <p className="text-xs font-semibold text-slate-500">Cargando análisis...</p>
        </div>
      </div>
    );
  }

  if (!system) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-semibold">No hay datos disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans selection:bg-slate-100 selection:text-slate-900 w-full overflow-x-hidden">
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
      {/* Header Section - Compact & Professional */}
      <div className="rounded-lg sm:rounded-xl lg:rounded-2xl shadow-2xl relative overflow-hidden mt-2 sm:mt-3 lg:mt-4 border border-white/10" style={{
        background: isAdmin 
          ? 'linear-gradient(180deg, #1e3a5f 0%, #1a2f4f 50%, #0f1b2e 100%)'
          : 'linear-gradient(180deg, #0a0e17 0%, #020408 50%, #000000 100%)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)'
      }}>
        {/* Subtle gradient overlay */}
        <div className={`absolute inset-0 ${isAdmin ? 'bg-gradient-to-tr from-blue-900/50 via-transparent to-indigo-900/30' : 'bg-gradient-to-tr from-[#09090b]/50 via-transparent to-[#09090b]/30'} animate-pulse`}></div>

        {/* Minimal decorative elements */}
        <div className={`absolute top-0 right-0 w-64 h-64 ${isAdmin ? 'bg-gradient-to-br from-blue-600/10 via-indigo-500/5' : 'bg-gradient-to-br from-[#0a0e17]/10 via-[#020408]/5'} to-transparent rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none`}></div>
        <div className={`absolute bottom-0 left-0 w-56 h-56 ${isAdmin ? 'bg-gradient-to-tr from-cyan-600/8' : 'bg-gradient-to-tr from-[#020408]/8'} to-transparent rounded-full blur-3xl -ml-12 -mb-12 pointer-events-none`}></div>

        {/* Subtle dots */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-12 left-16 w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
          <div className="absolute top-20 right-32 w-1 h-1 bg-slate-300 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute bottom-16 left-1/3 w-1.5 h-1.5 bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 pt-4 sm:pt-5 lg:pt-6 pb-5 sm:pb-6 lg:pb-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4">
            <div className={`${fadeInUp}`}>
              <div className="flex items-center space-x-2 mb-2">
                <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-xl text-white text-[10px] font-bold flex items-center tracking-wide uppercase shadow-lg border border-white/20 hover:bg-white/25 transition-all duration-300">
                  <Sparkles className="w-3 h-3 mr-1.5 animate-pulse" />
                  SUPER ADMIN
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black tracking-tight text-white mb-1.5 leading-tight drop-shadow-lg">
                Reportes y Análisis
              </h1>
              <p className="text-red-100 text-[11px] sm:text-xs md:text-sm max-w-2xl font-medium leading-relaxed drop-shadow-md">
                Análisis completo del sistema.
                <span className="hidden md:inline text-red-200/80"> Métricas, estadísticas y reportes.</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="text-xs xs:text-sm font-bold rounded-lg px-3 xs:px-4 py-1.5 xs:py-2 transition-all hover:scale-105 border border-white/20 text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 xs:w-4 xs:h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Actualizar
              </button>
              {/* Botón para descargar PDF profesional único */}
              <Button
                className="bg-white/15 backdrop-blur-xl text-white font-bold hover:bg-white/25 border border-white/20 transition-all duration-300"
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
                <Download className="w-4 h-4 mr-2" />
                Descargar PDF
              </Button>
            </div>
          </div>
        </div>

        {/* Wave pattern */}
        <div className="absolute bottom-0 left-0 right-0 h-12 overflow-hidden pointer-events-none">
          <svg className="absolute bottom-0 w-full h-full" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0 C150,80 350,80 600,40 C850,0 1050,0 1200,40 L1200,120 L0,120 Z" fill="white" fillOpacity="0.08" />
            <path d="M0,20 C200,100 400,100 600,60 C800,20 1000,20 1200,60 L1200,120 L0,120 Z" fill="white" fillOpacity="0.04" />
          </svg>
        </div>
      </div>

      <div className="w-full -mt-4 relative z-20 space-y-3 sm:space-4 lg:space-y-6">

      {/* Resumen de datos generales del sistema en tiempo real */}
      {loading ? (
        <div className="text-center text-slate-500 py-8 sm:py-12 bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
          <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin mx-auto mb-2 text-blue-600" />
          <p className="text-xs sm:text-sm">Cargando datos del sistema...</p>
        </div>
      ) : error ? (
        <div className="text-center text-red-600 py-8 sm:py-12 bg-white rounded-lg sm:rounded-xl shadow-sm border border-red-200 p-4 sm:p-6">
          <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2" />
          <p className="text-xs sm:text-sm">{error}</p>
        </div>
      ) : system && (
        <div className="space-y-3 sm:space-y-4 lg:space-y-6">
          {/* Estado del Servidor */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200 p-3 sm:p-4 lg:p-6">
            <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-slate-800 mb-2 sm:mb-3 lg:mb-4 flex items-center">
              <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 mr-1.5 sm:mr-2 text-slate-600 flex-shrink-0" />
              <span className="truncate">Estado del Servidor</span>
            </h2>
            <ul className="text-[11px] sm:text-xs md:text-sm text-slate-700 space-y-1.5 sm:space-y-2">
              <li className="flex flex-col xs:flex-row xs:flex-wrap gap-1"><b className="text-slate-900">Espacio en disco:</b> <span className="text-slate-600 break-words">{((system.disk.used / 1024 / 1024 / 1024).toFixed(1))} GB usado / {((system.disk.total / 1024 / 1024 / 1024).toFixed(1))} GB total ({system.disk.percent}%)</span></li>
              <li className="flex flex-col xs:flex-row xs:flex-wrap gap-1"><b className="text-slate-900">CPU:</b> <span className="text-slate-600 break-words">{Array.isArray(system.cpu) ? system.cpu[0] + ' (load avg)' : (system.cpu ?? 'N/A')}</span></li>
              <li className="flex flex-col xs:flex-row xs:flex-wrap gap-1"><b className="text-slate-900">Memoria RAM:</b> {system.memory ? <span className="font-mono text-slate-600 break-words">{system.memory}</span> : <span className="text-slate-600">N/A</span>}</li>
              <li className="flex flex-col xs:flex-row xs:flex-wrap gap-1"><b className="text-slate-900">Uptime:</b> <span className="text-slate-600 break-words">{system.uptime || 'N/A'}</span></li>
              <li className="flex flex-col xs:flex-row xs:flex-wrap gap-1"><b className="text-slate-900">Sistema:</b> <span className="text-slate-600 break-words">PHP {system.php_version}, Laravel {system.laravel_version}</span></li>
            </ul>
          </div>
          {/* Logs y Errores Recientes */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200 p-3 sm:p-4 lg:p-6">
            <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-slate-800 mb-2 sm:mb-3 lg:mb-4 flex items-center">
              <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 mr-1.5 sm:mr-2 text-slate-600 flex-shrink-0" />
              <span className="truncate">Logs y Errores Recientes</span>
            </h2>
            <ul className="text-[11px] sm:text-xs md:text-sm text-slate-700 space-y-1.5 sm:space-y-2 max-h-48 sm:max-h-64 overflow-y-auto">
              {system.last_errors && system.last_errors.length > 0 ? system.last_errors.map((err: string, idx: number) => (
                <li key={idx} className="break-words">{err}</li>
              )) : <li>No hay errores recientes.</li>}
            </ul>
          </div>
        </div>
      )}

      {/* Acciones rápidas */}
      <Card className="p-3 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-slate-800 mb-2 sm:mb-3 lg:mb-4 flex items-center">
          <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 mr-1.5 sm:mr-2 text-slate-600 flex-shrink-0" />
          <span className="truncate">Acciones Rápidas</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 lg:gap-4">
          <Button variant="outline" className="p-3 sm:p-4 h-auto flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <div className="text-left min-w-0">
              <div className="font-medium text-xs sm:text-sm">Reporte Mensual</div>
              <div className="text-[10px] sm:text-xs opacity-90">Generar reporte completo</div>
            </div>
          </Button>
          
          <Button variant="outline" className="p-3 sm:p-4 h-auto flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <Activity className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <div className="text-left min-w-0">
              <div className="font-medium text-xs sm:text-sm">Análisis de Tendencias</div>
              <div className="text-[10px] sm:text-xs opacity-90">Ver patrones y tendencias</div>
            </div>
          </Button>
          
          <Button variant="outline" className="p-3 sm:p-4 h-auto flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <PieChart className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <div className="text-left min-w-0">
              <div className="font-medium text-xs sm:text-sm">Distribución</div>
              <div className="text-[10px] sm:text-xs opacity-90">Análisis por categorías</div>
            </div>
          </Button>
          
          <Button variant="outline" className="p-3 sm:p-4 h-auto flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <Download className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <div className="text-left min-w-0">
              <div className="font-medium text-xs sm:text-sm">Exportar Datos</div>
              <div className="text-[10px] sm:text-xs opacity-90">Descargar en Excel/PDF</div>
            </div>
          </Button>
        </div>
      </Card>
      </div>
      </div>
    </div>
  );
}