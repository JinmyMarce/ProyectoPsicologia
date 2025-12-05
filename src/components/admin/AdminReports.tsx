import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useAuth } from '../../contexts/AuthContext';
import { 
  BarChart3, 
  Users, 
  Calendar, 
  Download, 
  RefreshCw,
  UserCheck,
  UserX,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  TrendingUp,
  Sparkles,
  Target,
  PieChart,
  LineChart,
  Filter
} from 'lucide-react';

interface UserStats {
  total_users: number;
  active_users: number;
  inactive_users: number;
  verified_users: number;
  unverified_users: number;
  by_role: {
    students: number;
    psychologists: number;
    admins: number;
  };
}

interface AppointmentStats {
  totalAppointments: number;
  completedAppointments: number;
  pendingAppointments: number;
  cancelledAppointments: number;
  totalPsychologists: number;
  activePsychologists: number;
  totalStudents: number;
  monthlyData: Array<{
    month: string;
    appointments: number;
    completed: number;
    cancelled: number;
  }>;
  psychologistPerformance: Array<{
    name: string;
    appointments: number;
    rating: number;
    completionRate: number;
  }>;
  appointmentTypes: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
}

export function AdminReports() {
  const { user } = useAuth();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [appointmentStats, setAppointmentStats] = useState<AppointmentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Obtener estadísticas de usuarios
      const usersRes = await fetch('http://localhost:8000/api/users/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      if (!usersRes.ok) {
        const errorData = await usersRes.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${usersRes.status}: Error al obtener estadísticas de usuarios`);
      }
      
      const usersData = await usersRes.json();
      if (usersData.success && usersData.data) {
        setUserStats(usersData.data);
      } else {
        throw new Error(usersData.message || 'Error al procesar estadísticas de usuarios');
      }

      // Obtener estadísticas detalladas de citas
      const rangeMap = { week: '7d', month: '30d', quarter: '90d', year: '365d' };
      const appointmentsRes = await fetch(`http://localhost:8000/api/reports/analytics?range=${rangeMap[dateRange]}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      if (appointmentsRes.ok) {
        const appointmentsData = await appointmentsRes.json();
        if (appointmentsData.success) {
          setAppointmentStats(appointmentsData.data);
        }
      }


    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Error al cargar los datos';
      setError(errorMessage);
      console.error('Error fetching reports:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const downloadPDF = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const res = await fetch('http://localhost:8000/api/reports/generate-pdf', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'analytics',
          filters: { range: dateRange }
        })
      });
      
      if (res.ok) {
        // Verificar si la respuesta es un PDF
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/pdf')) {
          // El backend devuelve el PDF directamente
          const blob = await res.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `reporte_admin_${new Date().toISOString().split('T')[0]}.pdf`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(url);
        } else {
          // Intentar parsear como JSON para ver el error
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || 'Error: La respuesta no es un PDF válido');
        }
      } else {
        const errorData = await res.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Error ${res.status}: ${res.statusText}`;
        setError(errorMessage);
        alert(errorMessage);
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Error al descargar el PDF';
      setError(errorMessage);
      alert(errorMessage);
      console.error('Error downloading PDF:', e);
    } finally {
      setRefreshing(false);
    }
  };

  // Calcular tasas y porcentajes
  const completionRate = appointmentStats && appointmentStats.totalAppointments > 0
    ? ((appointmentStats.completedAppointments / appointmentStats.totalAppointments) * 100).toFixed(1)
    : '0';
  
  const cancellationRate = appointmentStats && appointmentStats.totalAppointments > 0
    ? ((appointmentStats.cancelledAppointments / appointmentStats.totalAppointments) * 100).toFixed(1)
    : '0';


  if (loading && !userStats) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3 mx-auto"></div>
          <p className="text-xs font-semibold text-slate-500">Cargando reportes detallados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans selection:bg-slate-100 selection:text-slate-900 w-full overflow-x-hidden">
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
        {/* Header Section */}
        <div className="rounded-lg sm:rounded-xl lg:rounded-2xl shadow-2xl relative overflow-hidden mt-2 sm:mt-3 lg:mt-4 border border-white/10" style={{
          background: 'linear-gradient(180deg, #1e3a5f 0%, #1a2f4f 50%, #0f1b2e 100%)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)'
        }}>
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/50 via-transparent to-indigo-900/30"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-600/10 via-indigo-500/5 to-transparent rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-gradient-to-tr from-cyan-600/8 to-transparent rounded-full blur-3xl -ml-12 -mb-12 pointer-events-none"></div>

          <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 pt-4 sm:pt-5 lg:pt-6 pb-5 sm:pb-6 lg:pb-8 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-white/15 backdrop-blur-xl text-white text-[9px] sm:text-[10px] font-bold flex items-center tracking-wide uppercase shadow-lg border border-white/20 hover:bg-white/25 transition-all duration-300">
                    <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1 sm:mr-1.5 animate-pulse flex-shrink-0" />
                    <span className="hidden xs:inline">ADMINISTRADOR</span>
                    <span className="xs:hidden">ADMIN</span>
                  </span>
                </div>
                <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-black tracking-tight text-white mb-1 sm:mb-1.5 leading-tight drop-shadow-lg">
                  Reportes Detallados y Análisis
                </h1>
                <p className="text-blue-100 text-[10px] sm:text-[11px] md:text-xs lg:text-sm max-w-2xl font-medium leading-relaxed drop-shadow-md">
                  Análisis exhaustivo de usuarios, actividad y rendimiento del sistema.
                  <span className="hidden sm:inline text-blue-200/80"> Métricas avanzadas, tendencias y estadísticas detalladas.</span>
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full md:w-auto">
                {/* Filtro de fecha */}
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-2 sm:px-3 py-2 border border-white/20 w-full sm:w-auto">
                  <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white flex-shrink-0" />
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value as any)}
                    className="bg-transparent text-white text-[10px] sm:text-xs font-semibold border-none outline-none cursor-pointer w-full"
                  >
                    <option value="week" className="bg-slate-800">Última semana</option>
                    <option value="month" className="bg-slate-800">Último mes</option>
                    <option value="quarter" className="bg-slate-800">Último trimestre</option>
                    <option value="year" className="bg-slate-800">Último año</option>
                  </select>
                </div>
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="text-[10px] sm:text-xs font-bold rounded-lg px-2 sm:px-3 xs:px-4 py-1.5 sm:py-2 transition-all hover:scale-105 border border-white/20 text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-1.5 w-full sm:w-auto"
                >
                  <RefreshCw className={`w-3.5 h-3.5 xs:w-4 xs:h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  <span className="hidden xs:inline">Actualizar</span>
                  <span className="xs:hidden">Refrescar</span>
                </button>
                <Button
                  className="bg-white/15 backdrop-blur-xl text-white font-bold hover:bg-white/25 border border-white/20 transition-all duration-300 text-[10px] sm:text-xs px-2 sm:px-3 xs:px-4 py-1.5 sm:py-2 w-full sm:w-auto justify-center"
                  onClick={downloadPDF}
                >
                  <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Exportar PDF</span>
                  <span className="sm:hidden">PDF</span>
                </Button>
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-12 overflow-hidden pointer-events-none">
            <svg className="absolute bottom-0 w-full h-full" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M0,0 C150,80 350,80 600,40 C850,0 1050,0 1200,40 L1200,120 L0,120 Z" fill="white" fillOpacity="0.08" />
              <path d="M0,20 C200,100 400,100 600,60 C800,20 1000,20 1200,60 L1200,120 L0,120 Z" fill="white" fillOpacity="0.04" />
            </svg>
          </div>
        </div>

        <div className="w-full -mt-4 relative z-20 space-y-3 sm:space-y-4 lg:space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Resumen Ejecutivo */}
          {userStats && appointmentStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <Card className="p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg sm:rounded-xl shadow-sm border border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-lg flex items-center justify-center shadow-md">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">
                  {userStats?.total_users ?? 0}
                </div>
                <div className="text-xs sm:text-sm text-slate-700 font-medium">Total Usuarios</div>
                <div className="mt-2 text-xs text-slate-600">
                  {userStats?.active_users ?? 0} activos • {userStats?.inactive_users ?? 0} inactivos
                </div>
              </Card>

              <Card className="p-4 sm:p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg sm:rounded-xl shadow-sm border border-green-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-lg flex items-center justify-center shadow-md">
                    <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <Target className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">
                  {appointmentStats?.totalAppointments ?? 0}
                </div>
                <div className="text-xs sm:text-sm text-slate-700 font-medium">Total Citas</div>
                <div className="mt-2 text-xs text-slate-600">
                  {completionRate}% completadas • {cancellationRate}% canceladas
                </div>
              </Card>

              <Card className="p-4 sm:p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg sm:rounded-xl shadow-sm border border-purple-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500 rounded-lg flex items-center justify-center shadow-md">
                    <UserCheck className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <Target className="w-5 h-5 text-purple-600" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">
                  {appointmentStats?.activePsychologists ?? 0}
                </div>
                <div className="text-xs sm:text-sm text-slate-700 font-medium">Psicólogos Activos</div>
                <div className="mt-2 text-xs text-slate-600">
                  {appointmentStats?.totalPsychologists ?? 0} totales
                </div>
              </Card>

              <Card className="p-4 sm:p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg sm:rounded-xl shadow-sm border border-orange-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-500 rounded-lg flex items-center justify-center shadow-md">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">
                  {appointmentStats?.totalStudents ?? 0}
                </div>
                <div className="text-xs sm:text-sm text-slate-700 font-medium">Estudiantes</div>
                <div className="mt-2 text-xs text-slate-600">
                  {userStats?.by_role?.students ?? 0} registrados
                </div>
              </Card>
            </div>
          )}

          {/* Tendencias Mensuales */}
          {appointmentStats && appointmentStats.monthlyData && appointmentStats.monthlyData.length > 0 && (
            <Card className="p-4 sm:p-6 bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200">
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-slate-800 mb-4 flex items-center">
                <LineChart className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-slate-600" />
                Tendencias Mensuales de Citas
              </h2>
              <div className="space-y-3">
                {appointmentStats.monthlyData.map((month, index) => {
                  const monthStr = month?.month || '';
                  const appointments = month?.appointments || 0;
                  const completed = month?.completed || 0;
                  const cancelled = month?.cancelled || 0;
                  const pending = Math.max(0, appointments - completed - cancelled);
                  
                  let monthName = 'Mes desconocido';
                  try {
                    if (monthStr) {
                      monthName = new Date(monthStr + '-01').toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
                    }
                  } catch (e) {
                    monthName = monthStr || 'Mes desconocido';
                  }
                  
                  const completionPercent = appointments > 0 
                    ? ((completed / appointments) * 100).toFixed(1)
                    : '0';
                  const cancellationPercent = appointments > 0 
                    ? ((cancelled / appointments) * 100).toFixed(1)
                    : '0';
                  
                  return (
                    <div key={index} className="p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-slate-900 capitalize">{monthName}</span>
                        <span className="text-sm font-bold text-slate-700">{appointments} citas</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                        <div className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0" />
                          <span className="text-slate-600 break-words">{completed} completadas ({completionPercent}%)</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <XCircle className="w-3 h-3 text-red-600 flex-shrink-0" />
                          <span className="text-slate-600 break-words">{cancelled} canceladas ({cancellationPercent}%)</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-yellow-600 flex-shrink-0" />
                          <span className="text-slate-600 break-words">{pending} pendientes</span>
                        </div>
                      </div>
                      <div className="mt-2 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full flex">
                          <div 
                            className="bg-green-500" 
                            style={{ width: `${Math.min(100, parseFloat(completionPercent))}%` }}
                          ></div>
                          <div 
                            className="bg-red-500" 
                            style={{ width: `${Math.min(100 - parseFloat(completionPercent), parseFloat(cancellationPercent))}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Análisis Detallado de Usuarios */}
          {userStats && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
              <Card className="p-4 sm:p-6 bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200">
                <h2 className="text-base sm:text-lg md:text-xl font-bold text-slate-800 mb-4 flex items-center">
                  <PieChart className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-slate-600" />
                  Distribución por Rol
                </h2>
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-orange-50 rounded-lg gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-orange-500 flex-shrink-0"></div>
                      <span className="font-medium text-sm sm:text-base text-slate-900">Estudiantes</span>
                    </div>
                    <div className="text-left sm:text-right">
                      <div className="font-bold text-slate-900">{userStats?.by_role?.students ?? 0}</div>
                      <div className="text-xs text-slate-600">
                        {userStats?.total_users && userStats.total_users > 0 ? ((userStats.by_role?.students ?? 0) / userStats.total_users * 100).toFixed(1) : 0}%
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-purple-50 rounded-lg gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500 flex-shrink-0"></div>
                      <span className="font-medium text-sm sm:text-base text-slate-900">Psicólogos</span>
                    </div>
                    <div className="text-left sm:text-right">
                      <div className="font-bold text-slate-900">{userStats?.by_role?.psychologists ?? 0}</div>
                      <div className="text-xs text-slate-600">
                        {userStats?.total_users && userStats.total_users > 0 ? ((userStats.by_role?.psychologists ?? 0) / userStats.total_users * 100).toFixed(1) : 0}%
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-blue-50 rounded-lg gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500 flex-shrink-0"></div>
                      <span className="font-medium text-sm sm:text-base text-slate-900">Administradores</span>
                    </div>
                    <div className="text-left sm:text-right">
                      <div className="font-bold text-slate-900">{userStats?.by_role?.admins ?? 0}</div>
                      <div className="text-xs text-slate-600">
                        {userStats?.total_users && userStats.total_users > 0 ? ((userStats.by_role?.admins ?? 0) / userStats.total_users * 100).toFixed(1) : 0}%
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-4 sm:p-6 bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200">
                <h2 className="text-base sm:text-lg md:text-xl font-bold text-slate-800 mb-4 flex items-center">
                  <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-slate-600" />
                  Estado de Usuarios
                </h2>
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-green-50 rounded-lg gap-2">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span className="font-medium text-sm sm:text-base text-slate-900">Usuarios Activos</span>
                    </div>
                    <div className="text-left sm:text-right">
                      <div className="font-bold text-slate-900">{userStats?.active_users ?? 0}</div>
                      <div className="text-xs text-slate-600">
                        {userStats?.total_users && userStats.total_users > 0 ? ((userStats.active_users ?? 0) / userStats.total_users * 100).toFixed(1) : 0}%
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-red-50 rounded-lg gap-2">
                    <div className="flex items-center gap-2">
                      <UserX className="w-4 h-4 text-red-600 flex-shrink-0" />
                      <span className="font-medium text-sm sm:text-base text-slate-900">Usuarios Inactivos</span>
                    </div>
                    <div className="text-left sm:text-right">
                      <div className="font-bold text-slate-900">{userStats?.inactive_users ?? 0}</div>
                      <div className="text-xs text-slate-600">
                        {userStats?.total_users && userStats.total_users > 0 ? ((userStats.inactive_users ?? 0) / userStats.total_users * 100).toFixed(1) : 0}%
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-blue-50 rounded-lg gap-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <span className="font-medium text-sm sm:text-base text-slate-900">Usuarios Verificados</span>
                    </div>
                    <div className="text-left sm:text-right">
                      <div className="font-bold text-slate-900">{userStats?.verified_users ?? 0}</div>
                      <div className="text-xs text-slate-600">
                        {userStats?.total_users && userStats.total_users > 0 ? ((userStats.verified_users ?? 0) / userStats.total_users * 100).toFixed(1) : 0}%
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
