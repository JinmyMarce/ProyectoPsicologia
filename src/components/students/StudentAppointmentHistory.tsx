import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  Calendar,
  Clock,
  User,
  RefreshCw,
  AlertCircle,
  Clock as ClockIcon,
  X,
  Edit,
  Eye
} from 'lucide-react';
import { getUserAppointments, cancelAppointment, rescheduleAppointment } from '../../services/appointments';
import { useAuth } from '../../contexts/AuthContext';
import { CancelAppointmentModal } from '../appointments/CancelAppointmentModal';
import { RescheduleAppointmentModal } from '../appointments/RescheduleAppointmentModal';


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
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<AppointmentHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'completed' | 'cancelled' | 'rescheduled'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [appointmentToCancel, setAppointmentToCancel] = useState<AppointmentHistory | null>(null);
  const [appointmentToReschedule, setAppointmentToReschedule] = useState<AppointmentHistory | null>(null);

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

  const handleCancelClick = (appointment: AppointmentHistory) => {
    console.log('handleCancelClick llamado con:', appointment);
    console.log('Estado de la cita:', appointment.status);
    setAppointmentToCancel(appointment);
  };

  const handleConfirmCancel = async (appointmentId: number) => {
    try {
      await cancelAppointment(appointmentId);
      await loadAppointments(); // Recargar citas
      setAppointmentToCancel(null);
    } catch (error: any) {
      throw error; // El modal manejará el error
    }
  };

  const handleRescheduleClick = (appointment: AppointmentHistory) => {
    // Navegar a la interfaz de reprogramar
    navigate('/appointments/reschedule');
  };

  const handleConfirmReschedule = async (appointmentId: number, newDate: string, newTime: string) => {
    try {
      await rescheduleAppointment(appointmentId, newDate, newTime);
      await loadAppointments(); // Recargar citas
      setAppointmentToReschedule(null);
    } catch (error: any) {
      throw error; // El modal manejará el error
    }
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
    const statusLower = status?.toLowerCase() || '';
    switch (statusLower) {
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

  // Función para verificar si una cita puede ser cancelada
  const canCancelAppointment = (appointment: AppointmentHistory): boolean => {
    const status = (appointment.status || '').toLowerCase().trim();
    // Aceptar tanto en inglés como en español, y también si contiene la palabra
    return status === 'pending' || 
           status === 'pendiente' || 
           status.includes('pending') || 
           status.includes('pendiente');
  };

  // Función para verificar si una cita puede ser reprogramada
  const canRescheduleAppointment = (appointment: AppointmentHistory): boolean => {
    const status = (appointment.status || '').toLowerCase().trim();
    return status === 'confirmed' || status === 'confirmada';
  };


  const filteredAppointments = appointments.filter(appointment => {
    if (filter === 'all') return true;
    if (filter === 'rescheduled') return appointment.rescheduled_from || appointment.rescheduled_to;
    return appointment.status === filter;
  });

  // Ordenar por fecha más reciente (los más recientes primero)
  const sortedAppointments = filteredAppointments.sort((a, b) => {
    const dateA = parseLocalDate(a.date).getTime();
    const dateB = parseLocalDate(b.date).getTime();
    if (dateB !== dateA) {
      return dateB - dateA;
    }
    // Si las fechas son iguales, ordenar por hora (más reciente primero)
    return b.time.localeCompare(a.time);
  });

  // Paginación
  const totalPages = Math.ceil(sortedAppointments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAppointments = sortedAppointments.slice(startIndex, endIndex);

  // Resetear página cuando cambia el filtro
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);


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
  const cancelledAppointments = appointments.filter(apt => apt.status === 'cancelled').length;

  return (
    <div className="min-h-screen bg-gray-50 font-sans selection:bg-slate-100 selection:text-slate-900 overflow-x-hidden">
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
              <h1 className="text-2xl xs:text-3xl md:text-4xl font-black tracking-tight text-white mb-0.5 xs:mb-1 leading-tight drop-shadow-lg">
                Historial de Citas
              </h1>
              <p className="text-slate-300 text-xs xs:text-sm max-w-2xl font-medium leading-relaxed drop-shadow-md">
                Revisa todas tus sesiones anteriores
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

        {/* Wave pattern - Compacto */}
        <div className="absolute bottom-0 left-0 right-0 h-8 overflow-hidden pointer-events-none">
          <svg className="absolute bottom-0 w-full h-full" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0 C150,80 350,80 600,40 C850,0 1050,0 1200,40 L1200,120 L0,120 Z" fill="white" fillOpacity="0.08" />
            <path d="M0,20 C200,100 400,100 600,60 C800,20 1000,20 1200,60 L1200,120 L0,120 Z" fill="white" fillOpacity="0.04" />
          </svg>
        </div>
      </div>

      <div className="w-full max-w-full px-2 xs:px-3 sm:px-4 lg:px-6 -mt-2 relative z-20 pb-4 overflow-x-hidden">
        {/* Estadísticas - Copiado del Dashboard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total Citas */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:border-violet-100 transition-colors group">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Total Citas</p>
            <p className="text-3xl font-black text-slate-900 group-hover:text-violet-600 transition-colors">{totalAppointments}</p>
            <div className="h-1 w-8 bg-slate-100 mt-3 rounded-full overflow-hidden">
              <div className="h-full bg-slate-900 w-full rounded-full"></div>
            </div>
          </div>

          {/* Completadas */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:border-emerald-100 transition-colors group">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Completadas</p>
            <p className="text-3xl font-black text-slate-900 group-hover:text-emerald-600 transition-colors">{completedAppointments}</p>
            <div className="h-1 w-8 bg-slate-100 mt-3 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 w-[80%] rounded-full"></div>
            </div>
          </div>

          {/* Reprogramadas */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:border-amber-100 transition-colors group">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Reprogramadas</p>
            <p className="text-3xl font-black text-slate-900 group-hover:text-amber-600 transition-colors">{rescheduledAppointments}</p>
            <div className="h-1 w-8 bg-slate-100 mt-3 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 w-[60%] rounded-full"></div>
            </div>
          </div>

          {/* Canceladas */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:border-rose-100 transition-colors group">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Canceladas</p>
            <p className="text-3xl font-black text-slate-900 group-hover:text-rose-500 transition-colors">{cancelledAppointments}</p>
            <div className="h-1 w-8 bg-slate-100 mt-3 rounded-full overflow-hidden">
              <div className="h-full bg-rose-500 w-[10%] rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Filtros - Diseño Moderno */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-4 mb-6 border border-gray-100">
          <div className="flex flex-wrap gap-2 justify-center items-center">
            {[
              { key: 'all', label: 'Todas' },
              { key: 'completed', label: 'Completadas' },
              { key: 'cancelled', label: 'Canceladas' },
              { key: 'rescheduled', label: 'Reprogramadas' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key as any)}
                className={`
                  px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300
                  ${filter === key
                    ? 'bg-gradient-to-r from-[#1e2a37] to-[#2d3e4f] text-white shadow-lg shadow-[#1e2a37]/30 transform scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                  }
                  hover:scale-105 active:scale-95
                `}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de citas */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-md p-4 border border-slate-200">
            <div className="flex items-center justify-center py-6">
              <div className="w-7 h-7 border-3 border-slate-200 border-t-slate-600 rounded-full animate-spin"></div>
              <span className="ml-3 text-slate-600 font-semibold text-base">Cargando historial...</span>
            </div>
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl shadow-md p-4 border border-red-200">
            <div className="text-center py-6">
              <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
              <p className="text-red-600 font-semibold text-sm">{error}</p>
            </div>
          </div>
        ) : sortedAppointments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-4 border border-slate-200">
            <div className="text-center py-6">
              <div className="w-14 h-14 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-slate-100/50">
                <Calendar className="w-7 h-7 text-slate-600" />
              </div>
              <h3 className="text-slate-900 font-bold mb-1.5 text-lg">No hay citas en el historial</h3>
              <p className="text-base text-slate-500 leading-relaxed">Cuando tengas citas, aparecerán aquí</p>
            </div>
          </div>
        ) : (
          <>
            {/* Header con encabezados - Solo visible en pantallas grandes */}
            <div className="hidden lg:block bg-gradient-to-r from-[#1e2a37] to-[#2d3e4f] rounded-lg mb-2 sticky top-0 z-10">
              <div className="p-2.5 pr-4 lg:pr-6">
                <div className="grid grid-cols-[50px_2fr_2fr_1fr_1.5fr_280px] gap-3 lg:gap-4 xl:gap-6 2xl:gap-8 w-full items-center">
                  <div></div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-white/90 uppercase font-semibold truncate block">Psicólogo</span>
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-white/90 uppercase font-semibold truncate block">Fecha de la Cita</span>
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-white/90 uppercase font-semibold truncate block">Hora de la Cita</span>
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-white/90 uppercase font-semibold truncate block">Fecha de Agendamiento</span>
                  </div>
                  <div className="text-right pr-6 lg:pr-8 xl:pr-10 min-w-0 flex-shrink-0">
                    <span className="text-[10px] text-white/90 uppercase font-semibold">Estado / Acciones</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              {paginatedAppointments.map((appointment) => {
                // Debug: verificar estado de la cita
                const statusLower = appointment.status?.toLowerCase() || '';
                const isPending = statusLower === 'pending';
                const isConfirmed = statusLower === 'confirmed';
                
                if (isPending) {
                  console.log('Cita pendiente encontrada:', {
                    id: appointment.id,
                    status: appointment.status,
                    statusLower: statusLower,
                    psychologist: appointment.psychologist_name
                  });
                }
                
                return (
                  <div key={appointment.id} className="bg-white rounded-lg border border-gray-200 hover:border-[#1e2a37]/30 hover:shadow-sm transition-all duration-200">
                    {/* Layout para pantallas grandes (lg+) */}
                    <div className="hidden lg:block p-2.5">
                      <div className="grid grid-cols-[50px_2fr_2fr_1fr_1.5fr_280px] gap-3 lg:gap-4 xl:gap-6 2xl:gap-8 w-full items-center">
                        {/* Avatar/Icono */}
                        <div className="w-9 h-9 bg-gradient-to-br from-[#1e2a37] to-[#2d3e4f] rounded-lg flex items-center justify-center flex-shrink-0">
                          <User className="w-4.5 h-4.5 text-white" />
                        </div>
                        
                        {/* Psicólogo */}
                        <div className="min-w-0">
                          <h3 className="text-xs font-semibold text-[#1e2a37] truncate">
                            {appointment.psychologist_name}
                          </h3>
                        </div>

                        {/* Fecha */}
                        <div className="min-w-0">
                          <span className="text-xs text-[#1e2a37] font-medium flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-[#1e2a37] flex-shrink-0" />
                            <span className="truncate">
                              {parseLocalDate(appointment.date).toLocaleDateString('es-ES', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </span>
                          </span>
                        </div>

                        {/* Hora */}
                        <div>
                          <span className="text-xs text-[#1e2a37] font-medium flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#1e2a37] flex-shrink-0" />
                            {formatTime(appointment.time)}
                          </span>
                        </div>

                        {/* Fecha de agendamiento */}
                        <div className="min-w-0">
                          <span className="text-xs text-gray-600 flex items-center gap-1">
                            <ClockIcon className="w-3 h-3 flex-shrink-0" />
                            <span className="whitespace-nowrap">
                              {new Date(appointment.created_at).toLocaleDateString('es-ES', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </span>
                          </span>
                        </div>

                        {/* Estado y Acciones - A la derecha */}
                        <div className="flex items-center justify-end gap-2 flex-nowrap">
                          <Badge variant={getStatusColor(appointment.status)} className="text-[9px] px-2 py-0.5 font-medium rounded flex-shrink-0 whitespace-nowrap">
                            {getStatusText(appointment.status)}
                          </Badge>
                          {(canCancelAppointment(appointment) || (appointment.status || '').toLowerCase().includes('pendiente') || (appointment.status || '').toLowerCase().includes('pending')) && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('Cancelar cita - Estado:', appointment.status, 'Cita completa:', appointment);
                                handleCancelClick(appointment);
                              }}
                              title="Cancelar cita"
                              className="px-2 py-0.5 text-white bg-[#4A0A0A] hover:bg-[#5A0A0A] active:bg-[#3A0A0A] rounded transition-all border border-[#4A0A0A] hover:border-[#5A0A0A] font-semibold text-xs flex items-center gap-1 shadow-md hover:shadow-lg whitespace-nowrap flex-shrink-0"
                              style={{ display: 'inline-flex' }}
                            >
                              <X className="w-3 h-3 flex-shrink-0" />
                              <span>Cancelar</span>
                            </button>
                          )}
                          {canRescheduleAppointment(appointment) && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleRescheduleClick(appointment);
                              }}
                              title="Reprogramar cita"
                              className="px-2 py-0.5 text-white bg-violet-600 hover:bg-violet-700 active:bg-violet-800 rounded transition-all border border-violet-600 hover:border-violet-700 font-semibold text-xs flex items-center gap-1 shadow-md hover:shadow-lg whitespace-nowrap flex-shrink-0"
                            >
                              <Edit className="w-3 h-3 flex-shrink-0" />
                              <span>Reprogramar</span>
                            </button>
                          )}
                          {((appointment.status || '').toLowerCase() === 'completed' || (appointment.status || '').toLowerCase() === 'completada') && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                // Aquí puedes agregar lógica para ver detalles de la cita completada
                                console.log('Ver detalles de cita completada:', appointment);
                              }}
                              title="Ver detalles de cita completada"
                              className="px-2 py-1 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded transition-all border border-slate-300 hover:border-slate-400 font-semibold text-xs flex items-center gap-1 shadow-sm hover:shadow-md whitespace-nowrap flex-shrink-0"
                              style={{ display: 'inline-flex' }}
                            >
                              <Eye className="w-3 h-3 flex-shrink-0" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Layout para pantallas medianas (md) */}
                    <div className="hidden md:block lg:hidden p-3">
                      <div className="grid grid-cols-[50px_1fr_120px] gap-4 w-full items-start">
                        {/* Avatar/Icono */}
                        <div className="w-10 h-10 bg-gradient-to-br from-[#1e2a37] to-[#2d3e4f] rounded-lg flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        
                        {/* Información principal */}
                        <div className="space-y-2 min-w-0">
                          {/* Psicólogo y Estado */}
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-sm font-semibold text-[#1e2a37] truncate">
                              {appointment.psychologist_name}
                            </h3>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Badge variant={getStatusColor(appointment.status)} className="text-[9px] px-2 py-0.5 font-medium rounded">
                                {getStatusText(appointment.status)}
                              </Badge>
                              {(canCancelAppointment(appointment) || (appointment.status || '').toLowerCase().includes('pendiente') || (appointment.status || '').toLowerCase().includes('pending')) && (
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    console.log('Cancelar cita - Estado:', appointment.status, 'Cita completa:', appointment);
                                    handleCancelClick(appointment);
                                  }}
                                  title="Cancelar cita"
                                  className="px-2 py-1 text-white bg-[#4A0A0A] hover:bg-[#5A0A0A] active:bg-[#3A0A0A] rounded transition-all border border-[#4A0A0A] hover:border-[#5A0A0A] font-semibold text-xs flex items-center gap-1 shadow-md hover:shadow-lg whitespace-nowrap flex-shrink-0"
                                  style={{ display: 'inline-flex' }}
                                >
                                  <X className="w-3 h-3 flex-shrink-0" />
                                  <span>Cancelar</span>
                                </button>
                              )}
                              {canRescheduleAppointment(appointment) && (
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleRescheduleClick(appointment);
                                  }}
                                  title="Reprogramar cita"
                                  className="px-3 py-1.5 text-white bg-violet-600 hover:bg-violet-700 active:bg-violet-800 rounded-lg transition-all border-2 border-violet-600 hover:border-violet-700 font-bold text-xs flex items-center gap-1.5 shadow-lg hover:shadow-xl whitespace-nowrap flex-shrink-0"
                                >
                                  <Edit className="w-3.5 h-3.5 flex-shrink-0" />
                                  <span>Reprogramar</span>
                                </button>
                              )}
                              {((appointment.status || '').toLowerCase() === 'completed' || (appointment.status || '').toLowerCase() === 'completada') && (
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    console.log('Ver detalles de cita completada:', appointment);
                                  }}
                                  title="Ver detalles de cita completada"
                                  className="px-2 py-1 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded transition-all border border-slate-300 hover:border-slate-400 font-semibold text-xs flex items-center gap-1 shadow-sm hover:shadow-md whitespace-nowrap flex-shrink-0"
                                  style={{ display: 'inline-flex' }}
                                >
                                  <Eye className="w-3 h-3 flex-shrink-0" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Fecha y Hora */}
                          <div className="space-y-1">
                            <span className="text-xs text-[#1e2a37] font-medium flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-[#1e2a37] flex-shrink-0" />
                              {parseLocalDate(appointment.date).toLocaleDateString('es-ES', {
                                weekday: 'short',
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>
                            <span className="text-xs text-[#1e2a37] font-medium flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-[#1e2a37] flex-shrink-0" />
                              {formatTime(appointment.time)}
                            </span>
                            <span className="text-xs text-gray-600 flex items-center gap-1.5">
                              <ClockIcon className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="whitespace-nowrap">
                                Agendado: {new Date(appointment.created_at).toLocaleDateString('es-ES', {
                                  weekday: 'long',
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric'
                                })}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Layout para pantallas pequeñas (sm y menores) */}
                    <div className="md:hidden p-3">
                      <div className="flex gap-3">
                        {/* Avatar/Icono */}
                        <div className="w-10 h-10 bg-gradient-to-br from-[#1e2a37] to-[#2d3e4f] rounded-lg flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        
                        {/* Información */}
                        <div className="flex-1 space-y-2 min-w-0">
                          {/* Psicólogo y Estado */}
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-sm font-semibold text-[#1e2a37]">
                              {appointment.psychologist_name}
                            </h3>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Badge variant={getStatusColor(appointment.status)} className="text-[9px] px-2 py-0.5 font-medium rounded">
                                {getStatusText(appointment.status)}
                              </Badge>
                              {(canCancelAppointment(appointment) || (appointment.status || '').toLowerCase().includes('pendiente') || (appointment.status || '').toLowerCase().includes('pending')) && (
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    console.log('Cancelar cita - Estado:', appointment.status, 'Cita completa:', appointment);
                                    handleCancelClick(appointment);
                                  }}
                                  title="Cancelar cita"
                                  className="px-2 py-1 text-white bg-[#4A0A0A] hover:bg-[#5A0A0A] active:bg-[#3A0A0A] rounded transition-all border border-[#4A0A0A] hover:border-[#5A0A0A] font-semibold text-xs flex items-center gap-1 shadow-md hover:shadow-lg whitespace-nowrap flex-shrink-0"
                                  style={{ display: 'inline-flex' }}
                                >
                                  <X className="w-3 h-3 flex-shrink-0" />
                                  <span>Cancelar</span>
                                </button>
                              )}
                              {canRescheduleAppointment(appointment) && (
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleRescheduleClick(appointment);
                                  }}
                                  title="Reprogramar cita"
                                  className="px-3 py-1.5 text-white bg-violet-600 hover:bg-violet-700 active:bg-violet-800 rounded-lg transition-all border-2 border-violet-600 hover:border-violet-700 font-bold text-xs flex items-center gap-1.5 shadow-lg hover:shadow-xl whitespace-nowrap flex-shrink-0"
                                >
                                  <Edit className="w-3.5 h-3.5 flex-shrink-0" />
                                  <span>Reprogramar</span>
                                </button>
                              )}
                              {((appointment.status || '').toLowerCase() === 'completed' || (appointment.status || '').toLowerCase() === 'completada') && (
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    console.log('Ver detalles de cita completada:', appointment);
                                  }}
                                  title="Ver detalles de cita completada"
                                  className="px-2 py-1 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded transition-all border border-slate-300 hover:border-slate-400 font-semibold text-xs flex items-center gap-1 shadow-sm hover:shadow-md whitespace-nowrap flex-shrink-0"
                                  style={{ display: 'inline-flex' }}
                                >
                                  <Eye className="w-3 h-3 flex-shrink-0" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Información detallada */}
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5 text-[#1e2a37] flex-shrink-0" />
                              <span className="text-xs text-[#1e2a37] font-medium">
                                {parseLocalDate(appointment.date).toLocaleDateString('es-ES', {
                                  weekday: 'short',
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-3.5 h-3.5 text-[#1e2a37] flex-shrink-0" />
                              <span className="text-xs text-[#1e2a37] font-medium">
                                {formatTime(appointment.time)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <ClockIcon className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                              <span className="text-xs text-gray-600">
                                Agendado: {new Date(appointment.created_at).toLocaleDateString('es-ES', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          
          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="text-sm border-[#8e161a] text-[#8e161a] hover:bg-[#8e161a] hover:text-white"
              >
                Anterior
              </Button>
              <span className="text-sm font-medium text-[#1e2a37]">
                Página {currentPage} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="text-sm border-[#8e161a] text-[#8e161a] hover:bg-[#8e161a] hover:text-white"
              >
                Siguiente
              </Button>
            </div>
          )}
          </>
        )}
      </div>

      {/* Modal de Cancelación de Cita */}
      <CancelAppointmentModal
        isOpen={appointmentToCancel !== null}
        onClose={() => setAppointmentToCancel(null)}
        appointment={appointmentToCancel}
        onConfirm={handleConfirmCancel}
      />

      {/* Modal de Reprogramación de Cita */}
      <RescheduleAppointmentModal
        isOpen={appointmentToReschedule !== null}
        onClose={() => setAppointmentToReschedule(null)}
        appointment={appointmentToReschedule}
        onConfirm={handleConfirmReschedule}
      />
    </div>
  );
} 






























