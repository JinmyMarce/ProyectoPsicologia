import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { BarChart3, Users, Calendar, Download, Activity, Sparkles, UserCheck, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

export function AdminStats() {
  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('http://localhost:8000/api/reports/admin-stats', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || `Error ${res.status}: ${res.statusText}`);
        }
        
        const data = await res.json();
        if (data.success && data.data) {
          setStats(data.data);
        } else {
          throw new Error(data.message || 'Error al procesar las estadísticas');
        }
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'No se pudieron cargar las estadísticas.';
        setError(errorMessage);
        console.error('Error fetching admin stats:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const downloadPDF = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/reports/download-admin-stats-pdf', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      if (res.ok) {
        // Verificar si la respuesta es un PDF
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/pdf')) {
          const blob = await res.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `estadisticas_admin_${new Date().toISOString().split('T')[0]}.pdf`;
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
        alert(errorMessage);
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'No se pudo descargar el PDF.';
      alert(errorMessage);
      console.error('Error downloading PDF:', e);
    }
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3 mx-auto"></div>
          <p className="text-xs font-semibold text-slate-500">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 font-sans flex items-center justify-center">
        <div className="text-center px-4">
          <AlertCircle className="w-12 h-12 text-red-300 mx-auto mb-3" />
          <p className="text-red-600 font-semibold mb-2 text-sm sm:text-base">Error al cargar estadísticas</p>
          <p className="text-gray-500 text-xs sm:text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 font-sans flex items-center justify-center">
        <div className="text-center px-4">
          <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm sm:text-base">No hay datos disponibles</p>
        </div>
      </div>
    );
  }

  // Calcular tasas
  const completionRate = stats.total_appointments > 0 
    ? ((stats.completed_appointments / stats.total_appointments) * 100).toFixed(1)
    : '0';
  const cancellationRate = stats.total_appointments > 0 
    ? ((stats.cancelled_appointments / stats.total_appointments) * 100).toFixed(1)
    : '0';

  return (
    <div className="min-h-screen bg-gray-50 font-sans selection:bg-slate-100 selection:text-slate-900 w-full overflow-x-hidden">
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
        {/* Header Section - Mismo diseño que AdminDashboard */}
        <div className="rounded-lg sm:rounded-xl lg:rounded-2xl shadow-2xl relative overflow-hidden mt-2 sm:mt-3 lg:mt-4 border border-white/10" style={{
          background: 'linear-gradient(180deg, #1e3a5f 0%, #1a2f4f 50%, #0f1b2e 100%)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)'
        }}>
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/50 via-transparent to-indigo-900/30 animate-pulse"></div>

          {/* Minimal decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-600/10 via-indigo-500/5 to-transparent rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-gradient-to-tr from-cyan-600/8 to-transparent rounded-full blur-3xl -ml-12 -mb-12 pointer-events-none"></div>

          {/* Subtle dots */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-12 left-16 w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
            <div className="absolute top-20 right-32 w-1 h-1 bg-slate-300 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute bottom-16 left-1/3 w-1.5 h-1.5 bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>

          <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 pt-4 sm:pt-5 lg:pt-6 pb-5 sm:pb-6 lg:pb-8 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-white/15 backdrop-blur-xl text-white text-[9px] sm:text-[10px] font-bold flex items-center tracking-wide uppercase shadow-lg border border-white/20 hover:bg-white/25 transition-all duration-300">
                    <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1 sm:mr-1.5 animate-pulse flex-shrink-0" />
                    <span className="hidden xs:inline">ADMINISTRADOR</span>
                    <span className="xs:hidden">ADMIN</span>
                  </span>
                </div>
                <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-black tracking-tight text-white mb-1 sm:mb-1.5 leading-tight drop-shadow-lg">
                  Estadísticas del Sistema
                </h1>
                <p className="text-blue-100 text-[10px] sm:text-[11px] md:text-xs lg:text-sm max-w-2xl font-medium leading-relaxed drop-shadow-md">
                  Resumen completo de usuarios y citas.
                  <span className="hidden sm:inline text-blue-200/80"> Métricas y análisis en tiempo real.</span>
                </p>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto">
                <Button
                  className="bg-white/15 backdrop-blur-xl text-white font-bold hover:bg-white/25 border border-white/20 transition-all duration-300 text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2.5 w-full md:w-auto"
                  onClick={downloadPDF}
                >
                  <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                  <span className="hidden sm:inline">Descargar PDF</span>
                  <span className="sm:hidden">PDF</span>
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

        <div className="w-full -mt-4 relative z-20 space-y-3 sm:space-y-4 lg:space-y-6">
          {/* Tarjetas de estadísticas principales - Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            {/* Total Usuarios */}
            <div className="group relative bg-white rounded-lg sm:rounded-xl shadow-md hover:shadow-lg p-3 sm:p-4 border border-slate-200 hover:border-slate-300 overflow-hidden hover:-translate-y-0.5 transition-all duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-slate-100/50 to-transparent rounded-full -mr-8 -mt-8 blur-2xl group-hover:from-slate-200/60 transition-all duration-500"></div>
              <div className="flex items-center justify-between mb-2 relative z-10">
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-lg flex items-center justify-center text-indigo-700 shadow-sm group-hover:scale-110 group-hover:bg-indigo-300 transition-all duration-300">
                  <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <span className="text-[8px] sm:text-[9px] font-bold text-slate-600 bg-slate-100 px-1.5 sm:px-2 py-0.5 rounded-full uppercase tracking-wider">Total</span>
              </div>
              <div className="flex items-baseline gap-1 sm:gap-1.5 relative z-10">
                <p className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">{stats.total_users}</p>
                <p className="text-[10px] sm:text-xs md:text-sm font-bold text-slate-600">Usuarios</p>
              </div>
              <p className="text-[8px] sm:text-[9px] md:text-[10px] font-semibold text-slate-500 mt-0.5 relative z-10">En el sistema</p>
            </div>

            {/* Psicólogos */}
            <div className="group relative bg-white rounded-lg sm:rounded-xl shadow-md hover:shadow-lg p-3 sm:p-4 border border-slate-200 hover:border-slate-300 overflow-hidden hover:-translate-y-0.5 transition-all duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-50/50 to-transparent rounded-full -mr-8 -mt-8 blur-2xl group-hover:from-purple-100/60 transition-all duration-500"></div>
              <div className="flex items-center justify-between mb-2 relative z-10">
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center text-purple-700 shadow-sm group-hover:scale-110 group-hover:bg-purple-300 transition-all duration-300">
                  <UserCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <span className="text-[8px] sm:text-[9px] font-bold text-purple-700 bg-purple-50 px-1.5 sm:px-2 py-0.5 rounded-full uppercase tracking-wider">Activos</span>
              </div>
              <div className="flex items-baseline gap-1 sm:gap-1.5 relative z-10">
                <p className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">{stats.total_psychologists}</p>
                <p className="text-[10px] sm:text-xs md:text-sm font-bold text-slate-600">Psicólogos</p>
              </div>
              <p className="text-[8px] sm:text-[9px] md:text-[10px] font-semibold text-slate-500 mt-0.5 relative z-10">Profesionales</p>
            </div>

            {/* Estudiantes */}
            <div className="group relative bg-white rounded-lg sm:rounded-xl shadow-md hover:shadow-lg p-3 sm:p-4 border border-slate-200 hover:border-slate-300 overflow-hidden hover:-translate-y-0.5 transition-all duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-50/50 to-transparent rounded-full -mr-8 -mt-8 blur-2xl group-hover:from-blue-100/60 transition-all duration-500"></div>
              <div className="flex items-center justify-between mb-2 relative z-10">
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center text-blue-700 shadow-sm group-hover:scale-110 group-hover:bg-blue-300 transition-all duration-300">
                  <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <span className="text-[8px] sm:text-[9px] font-bold text-blue-700 bg-blue-50 px-1.5 sm:px-2 py-0.5 rounded-full uppercase tracking-wider">Activos</span>
              </div>
              <div className="flex items-baseline gap-1 sm:gap-1.5 relative z-10">
                <p className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">{stats.total_students}</p>
                <p className="text-[10px] sm:text-xs md:text-sm font-bold text-slate-600">Estudiantes</p>
              </div>
              <p className="text-[8px] sm:text-[9px] md:text-[10px] font-semibold text-slate-500 mt-0.5 relative z-10">Registrados</p>
            </div>
          </div>

          {/* Resumen de Citas - Responsive Card */}
          <Card className="p-4 sm:p-6 bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-slate-800 mb-4 flex items-center">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-slate-600" />
              Resumen de Citas
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {/* Total Citas */}
              <div className="text-center p-3 sm:p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 mx-auto text-indigo-600 mb-2" />
                <div className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 mb-1">{stats.total_appointments}</div>
                <div className="text-[10px] sm:text-xs text-slate-600 font-medium">Total Citas</div>
              </div>
              
              {/* Completadas */}
              <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 mx-auto text-green-600 mb-2" />
                <div className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 mb-1">{stats.completed_appointments}</div>
                <div className="text-[10px] sm:text-xs text-slate-600 font-medium">Completadas</div>
                <div className="text-[9px] sm:text-[10px] text-green-600 font-semibold mt-1">{completionRate}%</div>
              </div>
              
              {/* Pendientes */}
              <div className="text-center p-3 sm:p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 mx-auto text-yellow-600 mb-2" />
                <div className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 mb-1">{stats.pending_appointments}</div>
                <div className="text-[10px] sm:text-xs text-slate-600 font-medium">Pendientes</div>
              </div>
              
              {/* Canceladas */}
              <div className="text-center p-3 sm:p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                <XCircle className="w-5 h-5 sm:w-6 sm:h-6 mx-auto text-red-600 mb-2" />
                <div className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 mb-1">{stats.cancelled_appointments}</div>
                <div className="text-[10px] sm:text-xs text-slate-600 font-medium">Canceladas</div>
                <div className="text-[9px] sm:text-[10px] text-red-600 font-semibold mt-1">{cancellationRate}%</div>
              </div>
            </div>
            
            {/* Tasas de rendimiento */}
            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-slate-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="p-3 sm:p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs sm:text-sm font-semibold text-slate-700">Tasa de Completitud</span>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-green-700">{completionRate}%</div>
                </div>
                <div className="p-3 sm:p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs sm:text-sm font-semibold text-slate-700">Tasa de Cancelación</span>
                    <XCircle className="w-4 h-4 text-red-600" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-red-700">{cancellationRate}%</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
