import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  Activity,
  Users,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  RefreshCw,
  Download,
  Eye,
  Settings,
  Sparkles
} from 'lucide-react';

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalAppointments: number;
  pendingAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  totalPsychologists: number;
  activePsychologists: number;
  totalStudents: number;
  activeStudents: number;
  systemUptime: string;
  lastBackup: string;
  diskUsage: number;
  memoryUsage: number;
  cpuUsage: number;
}

interface RecentActivity {
  id: number;
  action: string;
  user: string;
  timestamp: string;
  details: string;
  type: 'info' | 'warning' | 'error' | 'success';
}

export function SystemMonitoring() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [refreshing, setRefreshing] = useState(false);

  // NUEVO: Estado para logs y métricas
  const [logs, setLogs] = useState<any[]>([]);
  const [showLogs, setShowLogs] = useState(false);
  const [metrics, setMetrics] = useState<any | null>(null);
  const [showMetrics, setShowMetrics] = useState(false);
  const [modal, setModal] = useState<{type: string, open: boolean}>({type: '', open: false});
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchSystemStats();
    fetchRecentActivity();
  }, [selectedTimeRange]);

  const fetchSystemStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8000/api/reports/analytics?range=${selectedTimeRange}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener estadísticas del sistema');
      }

      const data = await response.json();
      setStats(data.data || {});
    } catch (error) {
      setError('Error al cargar estadísticas del sistema');
      console.error('Error fetching system stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSystemStats();
    await fetchRecentActivity();
    setRefreshing(false);
  };

  const fetchRecentActivity = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/reports/activity', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener actividad reciente');
      }

      const data = await response.json();
      setRecentActivity(data.data || []);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Activity className="w-4 h-4 text-blue-600" />;
    }
  };

  const getActivityBadgeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // FUNCIONES PARA CADA ACCIÓN
  const handleShowLogs = async () => {
    setShowLogs(true);
    setActionMessage(null);
    try {
      const response = await fetch('http://localhost:8000/api/reports/activity', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      setLogs(data.data || []);
    } catch (e) {
      setLogs([]);
      setActionMessage('No se pudieron cargar los logs.');
    }
  };

  const handleShowMetrics = async () => {
    setShowMetrics(true);
    setActionMessage(null);
    try {
      const response = await fetch('http://localhost:8000/api/reports/system', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      setMetrics(data.data || null);
    } catch (e) {
      setMetrics(null);
      setActionMessage('No se pudieron cargar las métricas.');
    }
  };

  const handleAction = async (type: string) => {
    setModal({type, open: false});
    setActionMessage(null);
    // Simulación de endpoints
    let url = '';
    if (type === 'backup') url = 'http://localhost:8000/api/backup/create';
    if (type === 'restore') url = 'http://localhost:8000/api/backup/restore';
    if (type === 'update') url = 'http://localhost:8000/api/system/update';
    if (type === 'cleanup') url = 'http://localhost:8000/api/system/cleanup';
    if (!url) {
      setActionMessage('Funcionalidad no disponible.');
      return;
    }
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      setActionMessage(data.message || 'Acción realizada.');
    } catch (e) {
      setActionMessage('No se pudo completar la acción.');
    }
  };

  // Animation classes
  const fadeInUp = "animate-fade-in";
  const stagger1 = "delay-[100ms]";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-violet-200 border-t-violet-600 rounded-full animate-spin mb-3 mx-auto"></div>
          <p className="text-xs font-semibold text-slate-500">Cargando monitoreo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans selection:bg-slate-100 selection:text-slate-900 w-full overflow-x-hidden">
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
      {/* Header Section - Compact & Professional */}
      <div className="rounded-lg sm:rounded-xl lg:rounded-2xl shadow-2xl relative overflow-hidden mt-2 sm:mt-3 lg:mt-4 border border-white/10" style={{
        background: 'linear-gradient(180deg, #0a0e17 0%, #020408 50%, #000000 100%)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)'
      }}>
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#09090b]/50 via-transparent to-[#09090b]/30 animate-pulse"></div>

        {/* Minimal decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#0a0e17]/10 via-[#020408]/5 to-transparent rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-gradient-to-tr from-[#020408]/8 to-transparent rounded-full blur-3xl -ml-12 -mb-12 pointer-events-none"></div>

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
                Monitoreo del Sistema
              </h1>
              <p className="text-red-100 text-[11px] sm:text-xs md:text-sm max-w-2xl font-medium leading-relaxed drop-shadow-md">
                Supervisa y gestiona el rendimiento del sistema.
                <span className="hidden md:inline text-red-200/80"> Logs, métricas y mantenimiento.</span>
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="text-xs xs:text-sm font-bold rounded-lg px-3 xs:px-4 py-1.5 xs:py-2 transition-all hover:scale-105 border border-white/20 text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 xs:w-4 xs:h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
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

      <div className="w-full -mt-4 relative z-20">

      {/* Acciones del sistema en tarjetas profesionales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mt-4 sm:mt-6">
        {/* Monitoreo de Actividad (Logs) */}
        <Card className="p-4 sm:p-6 lg:p-8 rounded-lg sm:rounded-xl shadow-md hover:shadow-lg border border-slate-200 hover:border-slate-300 bg-white hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-green-200 rounded-full flex items-center justify-center mb-4 shadow">
              <Eye className="w-8 h-8 text-green-700" />
            </div>
            <h4 className="font-bold text-xl text-green-900 mb-2">Monitoreo de Actividad (Logs)</h4>
            <p className="text-sm text-gray-600 mb-4 text-center">
              Accede a registros detallados de todas las acciones importantes realizadas por los usuarios.
            </p>
            <Button variant="outline" className="w-full font-bold border-green-400 text-green-700 hover:bg-green-100" onClick={handleShowLogs}>
              Ver Logs
            </Button>
            {showLogs && (
              <div className="mt-6 w-full max-h-56 overflow-y-auto bg-white rounded-xl border border-green-100 p-3 shadow-inner">
                <h5 className="font-bold mb-2 text-green-800">Última Actividad</h5>
                {logs.length === 0 && <p className="text-gray-400">No hay registros.</p>}
                <ul className="text-xs space-y-1">
                  {logs.map((log: any, idx: number) => (
                    <li key={idx} className="border-b border-gray-100 py-1">
                      <span className="font-semibold text-green-700">{log.user || 'Sistema'}:</span> {log.action} <span className="text-gray-400">({log.timestamp})</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>
        {/* Gestión de Copias de Seguridad (Backups) */}
        <Card className="p-4 sm:p-6 lg:p-8 rounded-lg sm:rounded-xl shadow-md hover:shadow-lg border border-slate-200 hover:border-slate-300 bg-white hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center mb-4 shadow">
              <Download className="w-8 h-8 text-blue-700" />
            </div>
            <h4 className="font-bold text-xl text-blue-900 mb-2">Gestión de Copias de Seguridad</h4>
            <p className="text-sm text-gray-600 mb-4 text-center">
              Programa, monitorea e inicia o restaura copias de seguridad de la base de datos y archivos.
            </p>
            <Button variant="outline" className="w-full font-bold border-blue-400 text-blue-700 hover:bg-blue-100" onClick={() => setModal({type: 'backup', open: true})}>
              Crear/Restaurar Backup
            </Button>
          </div>
        </Card>
        {/* Monitoreo de Rendimiento */}
        <Card className="p-4 sm:p-6 lg:p-8 rounded-lg sm:rounded-xl shadow-md hover:shadow-lg border border-slate-200 hover:border-slate-300 bg-white hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-orange-200 rounded-full flex items-center justify-center mb-4 shadow">
              <BarChart3 className="w-8 h-8 text-orange-700" />
            </div>
            <h4 className="font-bold text-xl text-orange-900 mb-2">Monitoreo de Rendimiento</h4>
            <p className="text-sm text-gray-600 mb-4 text-center">
              Consulta métricas sobre la carga del servidor, velocidad de respuesta y errores del sistema.
            </p>
            <Button variant="outline" className="w-full font-bold border-orange-400 text-orange-700 hover:bg-orange-100" onClick={handleShowMetrics}>
              Ver Métricas
            </Button>
            {showMetrics && metrics && (
              <div className="mt-6 w-full bg-white rounded-xl border border-orange-100 p-3 shadow-inner text-xs">
                <div className="mb-2"><b>Disco:</b> <span className="text-orange-700">{metrics.disk.percent}% usado</span></div>
                <div className="mb-2"><b>Uptime:</b> <span className="text-orange-700">{metrics.uptime || 'N/A'}</span></div>
                <div className="mb-2"><b>PHP:</b> <span className="text-orange-700">{metrics.php_version}</span>, <b>Laravel:</b> <span className="text-orange-700">{metrics.laravel_version}</span></div>
                <div className="mt-2"><b>Últimos Errores:</b>
                  <ul className="list-disc ml-4">
                    {metrics.last_errors && metrics.last_errors.length > 0 ? metrics.last_errors.map((err: string, idx: number) => (
                      <li key={idx}>{err}</li>
                    )) : <li>No hay errores recientes.</li>}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </Card>
        {/* Gestión de Actualizaciones */}
        <Card className="p-4 sm:p-6 lg:p-8 rounded-lg sm:rounded-xl shadow-md hover:shadow-lg border border-slate-200 hover:border-slate-300 bg-white hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-purple-200 rounded-full flex items-center justify-center mb-4 shadow">
              <Settings className="w-8 h-8 text-purple-700" />
            </div>
            <h4 className="font-bold text-xl text-purple-900 mb-2">Gestión de Actualizaciones</h4>
            <p className="text-sm text-gray-600 mb-4 text-center">
              Aplica actualizaciones del software del sistema de forma segura y controlada.
            </p>
            <Button variant="outline" className="w-full font-bold border-purple-400 text-purple-700 hover:bg-purple-100" onClick={() => setModal({type: 'update', open: true})}>
              Actualizar Sistema
            </Button>
          </div>
        </Card>
        {/* Limpieza de Datos */}
        <Card className="p-4 sm:p-6 lg:p-8 rounded-lg sm:rounded-xl shadow-md hover:shadow-lg border border-slate-200 hover:border-slate-300 bg-white hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-red-200 rounded-full flex items-center justify-center mb-4 shadow">
              <AlertTriangle className="w-8 h-8 text-red-700" />
            </div>
            <h4 className="font-bold text-xl text-red-900 mb-2">Limpieza de Datos</h4>
            <p className="text-sm text-gray-600 mb-4 text-center">
              Elimina datos obsoletos o temporales para optimizar el rendimiento del sistema.
            </p>
            <Button variant="outline" className="w-full font-bold border-red-400 text-red-700 hover:bg-red-100" onClick={() => setModal({type: 'cleanup', open: true})}>
              Limpiar Datos
            </Button>
          </div>
        </Card>
      </div>
      </div>
      </div>

      {/* MODAL DE CONFIRMACIÓN PARA ACCIONES */}
      {modal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-bold mb-4">¿Estás seguro?</h3>
            <p className="mb-6">Esta acción puede afectar el sistema. ¿Deseas continuar?</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setModal({type: '', open: false})}>Cancelar</Button>
              <Button className="bg-[#8e161a] text-white" onClick={() => handleAction(modal.type)}>Confirmar</Button>
            </div>
          </div>
        </div>
      )}
      {/* MENSAJE DE ACCIÓN */}
      {actionMessage && (
        <div className="fixed bottom-6 right-6 bg-white border border-gray-300 rounded-lg shadow-lg px-6 py-3 z-50">
          <span>{actionMessage}</span>
          <Button variant="ghost" size="sm" className="ml-4" onClick={() => setActionMessage(null)}>Cerrar</Button>
        </div>
      )}

      {/* Error modal */}
      {error && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="text-center">
                <div className="bg-red-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
                <p className="text-gray-600 mb-6">{error}</p>
                <Button
                  onClick={() => setError(null)}
                  className="bg-[#8e161a] hover:bg-[#6b1115]"
                >
                  Cerrar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 