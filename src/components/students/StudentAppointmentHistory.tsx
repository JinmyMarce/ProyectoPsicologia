import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  Calendar,
  Clock,
  User,
  FileText,
  RefreshCw,
  Eye,
  AlertCircle,
  CheckCircle,
  XCircle,
  X,
  Clock as ClockIcon
} from 'lucide-react';
import { getUserAppointments } from '../../services/appointments';
import { useAuth } from '../../contexts/AuthContext';


interface AppointmentHistory {
  id: number;
  user_email: string;
  psychologist_name: string;
  date: string;
  time: string;
  reason: string;
  status: string;
  created_at: string;
  rescheduled_from?: number;
  rescheduled_to?: number;
  notes?: string;
}

export function StudentAppointmentHistory() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<AppointmentHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'completed' | 'cancelled' | 'rescheduled'>('all');
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentHistory | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (user?.email) {
      loadAppointments();
    }
  }, [user]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getUserAppointments();
      setAppointments(data);
    } catch (error) {
      console.error('Error cargando historial:', error);
      setError('Error al cargar el historial de citas. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAppointments();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'danger';
      case 'rescheduled':
        return 'warning';
      case 'confirmed':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completada';
      case 'cancelled':
        return 'Cancelada';
      case 'rescheduled':
        return 'Reprogramada';
      case 'confirmed':
        return 'Confirmada';
      case 'pending':
        return 'Pendiente';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'rescheduled':
        return <ClockIcon className="w-4 h-4 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    if (filter === 'all') return true;
    if (filter === 'rescheduled') return appointment.rescheduled_from || appointment.rescheduled_to;
    return appointment.status === filter;
  });

  const handleViewDetails = (appointment: AppointmentHistory) => {
    setSelectedAppointment(appointment);
    setShowDetails(true);
  };

  // Función para parsear fecha local
  function parseLocalDate(dateStr: string): Date {
    if (!dateStr) return new Date();
    // Si es un string ISO, parsearlo directamente
    if (dateStr.includes('T')) {
      return new Date(dateStr);
    }
    // Si es formato YYYY-MM-DD
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateStr.split('-').map(Number);
      return new Date(year, month - 1, day);
    }
    // Intentar parsear como fecha estándar
    return new Date(dateStr);
  }

  // Función para formatear fecha legible
  const formatDate = (dateString: string) => {
    try {
      const date = parseLocalDate(dateString);
      return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  // Función para formatear hora correctamente (HH:mm)
  const formatTime = (timeString: string | null | undefined) => {
    if (!timeString) return 'N/A';
    
    // Si es un objeto o tiene formato extraño, intentar extraer solo la hora
    let timeStr = String(timeString);
    
    // Si contiene espacio, tomar solo la parte de tiempo
    if (timeStr.includes(' ')) {
      timeStr = timeStr.split(' ')[1] || timeStr.split(' ')[0];
    }
    
    // Remover cualquier caracter no numérico excepto ":"
    timeStr = timeStr.replace(/[^\d:]/g, '');
    
    // Si ya está en formato HH:mm, devolverlo
    if (timeStr.match(/^\d{2}:\d{2}$/)) {
      return timeStr;
    }
    
    // Intentar parsear diferentes formatos
    const parts = timeStr.split(':');
    if (parts.length >= 2) {
      let hours = parseInt(parts[0], 10);
      let minutes = parseInt(parts[1], 10);
      
      // Validar valores
      if (isNaN(hours) || isNaN(minutes)) {
        return timeString; // Devolver original si no se puede parsear
      }
      
      // Asegurar formato de 2 dígitos
      hours = Math.max(0, Math.min(23, hours));
      minutes = Math.max(0, Math.min(59, minutes));
      
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }
    
    return timeString;
  };

  const totalAppointments = appointments.length;
  const completedAppointments = appointments.filter(apt => apt.status === 'completed').length;
  const rescheduledAppointments = appointments.filter(apt => apt.rescheduled_from || apt.rescheduled_to).length;

  return (
    <div className="h-screen overflow-hidden bg-gray-50 font-sans selection:bg-slate-100 selection:text-slate-900">
      {/* Header Section - Compact & Professional */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl xs:rounded-2xl shadow-2xl relative overflow-hidden mx-1.5 xs:mx-2 sm:mx-3 mt-2 xs:mt-3 border border-white/10">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-800/50 via-transparent to-slate-800/30 animate-pulse"></div>

        {/* Minimal decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-slate-600/10 via-slate-500/5 to-transparent rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-gradient-to-tr from-slate-700/8 to-transparent rounded-full blur-3xl -ml-12 -mb-12 pointer-events-none"></div>

        {/* Subtle dots */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-12 left-16 w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
          <div className="absolute top-20 right-32 w-1 h-1 bg-slate-300 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute bottom-16 left-1/3 w-1.5 h-1.5 bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="w-full px-3 xs:px-4 sm:px-6 lg:px-8 pt-4 xs:pt-5 pb-5 xs:pb-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 xs:gap-3">
            <div className="animate-fade-in">
              <div className="flex items-center space-x-1.5 xs:space-x-2 mb-1 xs:mb-1.5">
                <span className="px-2 xs:px-2.5 py-0.5 xs:py-1 rounded-full bg-white/15 backdrop-blur-xl text-white text-[8px] xs:text-[9px] font-bold flex items-center tracking-wide uppercase shadow-lg border border-white/20">
                  <Calendar className="w-2.5 h-2.5 xs:w-3 xs:h-3 mr-1 xs:mr-1.5" />
                  Historial
                </span>
              </div>
              <h1 className="text-xl xs:text-2xl md:text-3xl font-black tracking-tight text-white mb-0.5 xs:mb-1 leading-tight drop-shadow-lg">
                Historial de Citas
              </h1>
              <p className="text-slate-300 text-[10px] xs:text-xs max-w-2xl font-medium leading-relaxed drop-shadow-md">
                Revisa todas tus sesiones anteriores
              </p>
            </div>
          </div>
        </div>

        {/* Wave pattern - Compacto */}
        <div className="absolute bottom-0 left-0 right-0 h-8 overflow-hidden pointer-events-none">
          <svg className="absolute bottom-0 w-full h-full" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0 C150,80 350,80 600,40 C850,0 1050,0 1200,40 L1200,120 L0,120 Z" fill="white" fillOpacity="0.08" />
            <path d="M0,20 C200,100 400,100 600,60 C800,20 1000,20 1200,60 L1200,120 L0,120 Z" fill="white" fillOpacity="0.04" />
          </svg>
        </div>
      </div>

      <div className="w-full px-2 xs:px-3 sm:px-4 lg:px-6 -mt-2 relative z-20 overflow-y-auto h-[calc(100vh-10.5rem)]">
        {/* Estadísticas - Compactas y Responsivas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 xs:gap-2.5 mb-3 animate-fade-in delay-[100ms]">
          {/* Total Citas */}
          <div className="group relative bg-white rounded-xl shadow-md hover:shadow-lg p-2.5 border border-slate-200 hover:border-slate-300 overflow-hidden hover:-translate-y-0.5 transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-slate-100/50 to-transparent rounded-full -mr-6 -mt-6 blur-2xl group-hover:from-slate-200/60 transition-all duration-500"></div>
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-lg flex items-center justify-center text-indigo-700 shadow-sm group-hover:scale-110 transition-all duration-300">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-900 tracking-tight leading-none">{totalAppointments}</p>
                  <p className="text-xs font-bold text-slate-600 mt-0.5">Total Citas</p>
                </div>
              </div>
            </div>
          </div>

          {/* Completadas */}
          <div className="group relative bg-white rounded-xl shadow-md hover:shadow-lg p-2.5 border border-slate-200 hover:border-slate-300 overflow-hidden hover:-translate-y-0.5 transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-50/50 to-transparent rounded-full -mr-6 -mt-6 blur-2xl group-hover:from-green-100/60 transition-all duration-500"></div>
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-lg flex items-center justify-center text-emerald-700 shadow-sm group-hover:scale-110 transition-all duration-300">
                  <CheckCircle className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-900 tracking-tight leading-none">{completedAppointments}</p>
                  <p className="text-xs font-bold text-slate-600 mt-0.5">Completadas</p>
                </div>
              </div>
            </div>
          </div>

          {/* Reprogramadas */}
          <div className="group relative bg-white rounded-xl shadow-md hover:shadow-lg p-2.5 border border-slate-200 hover:border-slate-300 overflow-hidden hover:-translate-y-0.5 transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-50/50 to-transparent rounded-full -mr-6 -mt-6 blur-2xl group-hover:from-amber-100/60 transition-all duration-500"></div>
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg flex items-center justify-center text-amber-700 shadow-sm group-hover:scale-110 transition-all duration-300">
                  <ClockIcon className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-900 tracking-tight leading-none">{rescheduledAppointments}</p>
                  <p className="text-xs font-bold text-slate-600 mt-0.5">Reprogramadas</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros - Compactos y Responsivos */}
        <div className="flex flex-wrap gap-1 xs:gap-1.5 justify-center items-center mb-3">
          {[
            { key: 'all', label: 'Todas' },
            { key: 'completed', label: 'Completadas' },
            { key: 'cancelled', label: 'Canceladas' },
            { key: 'rescheduled', label: 'Reprogramadas' }
          ].map(({ key, label }) => (
            <Button
              key={key}
              variant={filter === key ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter(key as any)}
              className="text-[10px] font-bold rounded-lg px-3 py-1.5 transition-all hover:scale-105"
            >
              {label}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="text-[10px] font-bold rounded-lg px-3 py-1.5 transition-all hover:scale-105"
          >
            <RefreshCw className={`w-3 h-3 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>

        {/* Lista de citas */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-md p-4 border border-slate-200">
            <div className="flex items-center justify-center py-6">
              <div className="w-7 h-7 border-3 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
              <span className="ml-3 text-slate-600 font-semibold text-xs">Cargando historial...</span>
            </div>
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl shadow-md p-4 border border-red-200">
            <div className="text-center py-6">
              <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
              <p className="text-red-600 font-semibold text-sm">{error}</p>
            </div>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-4 border border-slate-200">
            <div className="text-center py-6">
              <div className="w-14 h-14 bg-gradient-to-br from-violet-100 to-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-violet-100/50">
                <Calendar className="w-7 h-7 text-violet-500" />
              </div>
              <h3 className="text-slate-900 font-bold mb-1.5 text-sm">No hay citas en el historial</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Cuando tengas citas, aparecerán aquí</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredAppointments.map((appointment) => (
              <div key={appointment.id} className="group relative bg-white rounded-xl shadow-md hover:shadow-lg p-3 xs:p-4 border border-slate-200 hover:border-slate-300 transition-all duration-300 hover:-translate-y-0.5 overflow-hidden">
                <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-slate-50/50 to-transparent rounded-full -mr-10 -mt-10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative z-10">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3 mb-3">
                    <div className="flex-1 min-w-0 w-full">
                      <div className="flex items-center gap-2 xs:gap-2.5 mb-1.5">
                        <div className="w-7 h-7 xs:w-8 xs:h-8 bg-gradient-to-br from-violet-100 to-purple-200 rounded-lg flex items-center justify-center shadow-sm border border-violet-100 flex-shrink-0">
                          <Calendar className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-violet-700" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight truncate">
                            {appointment.psychologist_name}
                          </h3>
                          <p className="text-[10px] sm:text-xs font-semibold text-slate-600 mt-0.5">
                            {formatDate(appointment.date)} • {formatTime(appointment.time)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 self-start sm:self-center flex-shrink-0">
                      {getStatusIcon(appointment.status)}
                      <Badge variant={getStatusColor(appointment.status)} className="text-[9px] xs:text-[10px] px-1.5 xs:px-2 py-0.5 uppercase tracking-wider font-bold shadow-sm rounded-lg">
                        {getStatusText(appointment.status)}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-2 border border-blue-100/50">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wide">Hora Cita</p>
                          <p className="text-sm font-bold text-slate-900">{formatTime(appointment.time)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-2 border border-emerald-100/50">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide">Psicólogo</p>
                          <p className="text-sm font-bold text-slate-900 truncate">{appointment.psychologist_name.split(' ')[0]}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-lg p-2 border border-violet-100/50">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-violet-600 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-bold text-violet-700 uppercase tracking-wide">Fecha Cita</p>
                          <p className="text-sm font-bold text-slate-900">{formatDate(appointment.date)}</p>
                        </div>
                      </div>
                    </div>
                    {(appointment.rescheduled_from || appointment.rescheduled_to) && (
                      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-2 border border-amber-100/50">
                        <div className="flex items-center gap-1.5">
                          <ClockIcon className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wide">Estado</p>
                            <p className="text-sm font-bold text-slate-900">Reprog.</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {appointment.reason && (
                    <div className="mb-3 bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-lg p-2.5 xs:p-3 border border-slate-200/50">
                      <h4 className="font-bold text-slate-900 mb-1.5 text-xs sm:text-sm flex items-center">
                        <FileText className="w-3 h-3 xs:w-3.5 xs:h-3.5 mr-1.5 text-blue-600" />
                        Motivo
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed line-clamp-2">{appointment.reason}</p>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      onClick={() => handleViewDetails(appointment)}
                      className="w-full sm:w-auto px-3 py-1.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-lg transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-lg font-bold text-[10px] xs:text-xs hover:scale-105"
                    >
                      <Eye className="w-3 h-3 xs:w-3.5 xs:h-3.5 mr-1.5" />
                      Ver Detalles
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal de detalles - Moderno y Compacto */}
        {showDetails && selectedAppointment && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center z-50 p-3 sm:p-4" onClick={() => setShowDetails(false)}>
            <div 
              className="bg-white rounded-xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-hidden border border-slate-200 relative" 
              onClick={(e) => e.stopPropagation()}
              style={{
                boxShadow: `
                  0 32px 64px rgba(0, 0, 0, 0.16), 
                  0 16px 32px rgba(0, 0, 0, 0.12),
                  0 8px 16px rgba(0, 0, 0, 0.08)
                `
              }}
            >
              {/* Header del Modal */}
              <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-3 xs:p-4 border-b border-violet-700/20">
                <div className="flex justify-between items-center gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base xs:text-lg font-black text-white tracking-tight">Detalles de la Cita</h3>
                    <p className="text-[10px] xs:text-xs text-violet-100 font-medium mt-0.5">Información completa de la sesión</p>
                  </div>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="w-7 h-7 xs:w-8 xs:h-8 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-all duration-300 border border-white/30 hover:border-white/50 flex-shrink-0"
                  >
                    <X className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-white" />
                  </button>
                </div>
              </div>

              {/* Contenido del Modal */}
              <div className="p-3 xs:p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
                <div className="space-y-2.5 xs:space-y-3">
                  {/* Información Principal - Compacta y Responsiva */}
                  <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 xs:gap-2.5">
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-2.5 xs:p-3 border border-blue-200/50">
                      <div className="flex items-center gap-1.5 xs:gap-2 mb-1.5">
                        <Calendar className="w-3 h-3 xs:w-3.5 xs:h-3.5 text-blue-600 flex-shrink-0" />
                        <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wide">Fecha de la Cita</p>
                      </div>
                      <p className="text-xs xs:text-sm font-bold text-slate-900 leading-tight">
                        {formatDate(selectedAppointment.date)}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-2.5 xs:p-3 border border-emerald-200/50">
                      <div className="flex items-center gap-1.5 xs:gap-2 mb-1.5">
                        <Clock className="w-3 h-3 xs:w-3.5 xs:h-3.5 text-emerald-600 flex-shrink-0" />
                        <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide">Hora de la Cita</p>
                      </div>
                      <p className="text-xs xs:text-sm font-bold text-slate-900">{formatTime(selectedAppointment.time)}</p>
                    </div>
                  </div>

                  {/* Psicólogo y Estado */}
                  <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 xs:gap-2.5">
                    <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-lg p-2.5 xs:p-3 border border-violet-200/50">
                      <div className="flex items-center gap-1.5 xs:gap-2 mb-1.5">
                        <User className="w-3 h-3 xs:w-3.5 xs:h-3.5 text-violet-600 flex-shrink-0" />
                        <p className="text-[10px] font-bold text-violet-700 uppercase tracking-wide">Psicólogo</p>
                      </div>
                      <p className="text-xs xs:text-sm font-bold text-slate-900 truncate">{selectedAppointment.psychologist_name}</p>
                    </div>
                    <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-lg p-2.5 xs:p-3 border border-slate-200/50">
                      <div className="flex items-center gap-1.5 xs:gap-2 mb-1.5">
                        {getStatusIcon(selectedAppointment.status)}
                        <p className="text-[10px] font-bold text-slate-700 uppercase tracking-wide">Estado</p>
                      </div>
                      <Badge variant={getStatusColor(selectedAppointment.status)} className="text-[9px] xs:text-[10px] px-1.5 xs:px-2 py-0.5 uppercase tracking-wider font-bold shadow-sm rounded-lg">
                        {getStatusText(selectedAppointment.status)}
                      </Badge>
                    </div>
                  </div>

                  {/* Información adicional - Cuándo se agendó */}
                  <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-lg p-2.5 xs:p-3 border border-slate-200/50">
                    <div className="flex items-center gap-1.5 xs:gap-2 mb-1.5 xs:mb-2">
                      <Calendar className="w-3 h-3 xs:w-3.5 xs:h-3.5 text-slate-600 flex-shrink-0" />
                      <p className="text-[10px] font-bold text-slate-700 uppercase tracking-wide">Agendada el</p>
                    </div>
                    <p className="text-xs xs:text-sm font-bold text-slate-900">
                      {new Date(selectedAppointment.created_at).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>

                  {/* Motivo de Consulta */}
                  {selectedAppointment.reason && (
                    <div className="bg-gradient-to-br from-blue-50/50 to-violet-50/30 rounded-lg p-2.5 xs:p-3 border border-blue-200/50">
                      <h4 className="font-bold text-slate-900 mb-1.5 xs:mb-2 text-xs xs:text-sm flex items-center">
                        <FileText className="w-3 h-3 xs:w-3.5 xs:h-3.5 mr-1.5 text-blue-600 flex-shrink-0" />
                        Motivo de Consulta
                      </h4>
                      <p className="text-xs xs:text-sm text-slate-700 leading-relaxed bg-white/60 p-2 xs:p-2.5 rounded-lg border border-blue-200/30">
                        {selectedAppointment.reason}
                      </p>
                    </div>
                  )}

                  {/* Notas */}
                  {selectedAppointment.notes && (
                    <div className="bg-gradient-to-br from-slate-50 to-gray-50/30 rounded-lg p-2.5 xs:p-3 border border-slate-200/50">
                      <h4 className="font-bold text-slate-900 mb-1.5 xs:mb-2 text-xs xs:text-sm flex items-center">
                        <FileText className="w-3 h-3 xs:w-3.5 xs:h-3.5 mr-1.5 text-slate-600 flex-shrink-0" />
                        Notas Adicionales
                      </h4>
                      <p className="text-xs xs:text-sm text-slate-700 leading-relaxed bg-white/60 p-2 xs:p-2.5 rounded-lg border border-slate-200/30">
                        {selectedAppointment.notes}
                      </p>
                    </div>
                  )}

                  {/* Información de Reprogramación */}
                  {(selectedAppointment.rescheduled_from || selectedAppointment.rescheduled_to) && (
                    <div className="bg-gradient-to-br from-amber-50 to-yellow-50/50 rounded-lg p-3 border border-amber-200/50">
                      <h4 className="font-bold text-slate-900 mb-2 text-xs flex items-center">
                        <ClockIcon className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
                        Reprogramación
                      </h4>
                      <div className="bg-white/60 p-2.5 rounded-lg border border-amber-200/30">
                        <p className="text-amber-800 text-sm font-medium leading-relaxed">
                          Esta cita fue reprogramada. Si necesitas más información, contacta al psicólogo.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 