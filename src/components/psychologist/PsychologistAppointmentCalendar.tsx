import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { 
  Calendar, 
  Clock, 
  User, 
  Settings, 
  Plus, 
  X, 
  Sparkles,
  Filter,
  Search,
  RefreshCw,
  Edit,
  Trash2,
  Eye,
  CalendarClock,
  Users,
  TrendingUp,
  BarChart3,
  FileText,
  CheckCircle,
  AlertCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Download,
  Upload
} from 'lucide-react';
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getUserAppointments, Appointment, rescheduleAppointment } from '../../services/appointments';
import { getMySchedule, createMySchedule, blockMySchedule, unblockMySchedule, deleteMySchedule, ScheduleSlot } from '../../services/schedule';
import { DirectAppointmentScheduler } from './DirectAppointmentScheduler';

interface PatientFilter {
  name: string;
  dni: string;
  status: 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled';
  dateFrom: string;
  dateTo: string;
}


interface AppointmentHistory {
  total: number;
  completed: number;
  cancelled: number;
  pending: number;
  byMonth: Array<{
    month: string;
    count: number;
  }>;
}

export const PsychologistAppointmentCalendar: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  
  // Estados para gestión de disponibilidad
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [scheduleSlots, setScheduleSlots] = useState<ScheduleSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<ScheduleSlot | null>(null);
  const [blockReason, setBlockReason] = useState('');
  
  // Estados para filtros de pacientes
  const [showFilters, setShowFilters] = useState(false);
  const [patientFilters, setPatientFilters] = useState<PatientFilter>({
    name: '',
    dni: '',
    status: 'all',
    dateFrom: '',
    dateTo: ''
  });
  
  // Estados para reprogramación
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  
  // Estados para historial
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [appointmentHistory, setAppointmentHistory] = useState<AppointmentHistory | null>(null);
  const [historyView, setHistoryView] = useState<'list' | 'stats'>('list');
  
  // Estados para agendamiento directo
  const [showDirectScheduler, setShowDirectScheduler] = useState(false);

  useEffect(() => {
    loadAppointments();
    loadSchedule();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getUserAppointments();
      setAppointments(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar las citas');
    } finally {
      setLoading(false);
    }
  };

  const loadSchedule = async () => {
    try {
      const today = new Date();
      const startDate = format(startOfMonth(today), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(today), 'yyyy-MM-dd');
      
      const schedule = await getMySchedule({
        date_from: startDate,
        date_to: endDate
      });
      
      if (Array.isArray(schedule)) {
        setScheduleSlots(schedule);
      }
    } catch (err) {
      console.error('Error loading schedule:', err);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAppointments();
    await loadSchedule();
    setRefreshing(false);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    // Cargar horarios disponibles para la fecha seleccionada
    loadDateSchedule(date);
  };

  const loadDateSchedule = async (date: Date) => {
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const schedule = await getMySchedule({
        date_from: dateStr,
        date_to: dateStr
      });
      
      if (Array.isArray(schedule)) {
        setScheduleSlots(schedule);
        setShowAvailabilityModal(true);
      }
    } catch (err) {
      console.error('Error loading date schedule:', err);
    }
  };

  const handleBlockSlot = async () => {
    if (!selectedDate || !blockReason.trim()) {
      setError('Por favor, completa todos los campos');
      return;
    }

    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      await blockMySchedule(selectedSlot?.id || 0, { reason: blockReason });
      await loadSchedule();
      setShowBlockModal(false);
      setBlockReason('');
      setSelectedSlot(null);
      handleRefresh();
    } catch (err: any) {
      setError(err.message || 'Error al bloquear el horario');
    }
  };

  const handleUnblockSlot = async (slotId: number) => {
    try {
      await unblockMySchedule(slotId);
      await loadSchedule();
      handleRefresh();
    } catch (err: any) {
      setError(err.message || 'Error al desbloquear el horario');
    }
  };

  const handleReschedule = async () => {
    if (!selectedAppointment || !newDate || !newTime) {
      setError('Por favor, completa todos los campos');
      return;
    }

    try {
      await rescheduleAppointment(selectedAppointment.id, newDate, newTime);
      await loadAppointments();
      setShowRescheduleModal(false);
      setSelectedAppointment(null);
      setNewDate('');
      setNewTime('');
      handleRefresh();
    } catch (err: any) {
      setError(err.message || 'Error al reprogramar la cita');
    }
  };

  const loadAppointmentHistory = async () => {
    try {
      const allAppointments = await getUserAppointments();
      
      const history: AppointmentHistory = {
        total: allAppointments.length,
        completed: allAppointments.filter(a => a.status === 'completed').length,
        cancelled: allAppointments.filter(a => a.status === 'cancelled').length,
        pending: allAppointments.filter(a => a.status === 'pending').length,
        byMonth: []
      };

      // Agrupar por mes
      const monthlyData: { [key: string]: number } = {};
      allAppointments.forEach(apt => {
        const month = format(parseISO(apt.date), 'yyyy-MM');
        monthlyData[month] = (monthlyData[month] || 0) + 1;
      });

      history.byMonth = Object.entries(monthlyData).map(([month, count]) => ({
        month,
        count
      })).sort((a, b) => a.month.localeCompare(b.month));

      setAppointmentHistory(history);
    } catch (err) {
      console.error('Error loading history:', err);
    }
  };

  // Filtrar citas según los filtros aplicados
  const filteredAppointments = useMemo(() => {
    return appointments.filter(apt => {
      if (patientFilters.name && !apt.patient_full_name?.toLowerCase().includes(patientFilters.name.toLowerCase())) {
        return false;
      }
      if (patientFilters.dni && apt.patient_dni !== patientFilters.dni) {
        return false;
      }
      if (patientFilters.status !== 'all' && apt.status !== patientFilters.status) {
        return false;
      }
      if (patientFilters.dateFrom && apt.date < patientFilters.dateFrom) {
        return false;
      }
      if (patientFilters.dateTo && apt.date > patientFilters.dateTo) {
        return false;
      }
      return true;
    });
  }, [appointments, patientFilters]);

  // Preparar datos para el calendario
  const calendarAppointments = useMemo(() => {
    return appointments.map(apt => ({
      id: apt.id,
      date: apt.date,
      time: apt.time,
      psychologist_name: apt.psychologist_name || user?.name || '',
      status: apt.status
    }));
  }, [appointments, user]);

  const availableDates = useMemo(() => {
    const dates = scheduleSlots
      .filter(slot => slot.is_available && !slot.is_blocked)
      .map(slot => parseISO(slot.date));
    return Array.from(new Set(dates.map(d => format(d, 'yyyy-MM-dd'))))
      .map(d => parseISO(d));
  }, [scheduleSlots]);

  const blockedDates = useMemo(() => {
    return scheduleSlots
      .filter(slot => slot.is_blocked || !slot.is_available)
      .map(slot => parseISO(slot.date));
  }, [scheduleSlots]);

  const clearFilters = () => {
    setPatientFilters({
      name: '',
      dni: '',
      status: 'all',
      dateFrom: '',
      dateTo: ''
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans selection:bg-slate-100 selection:text-slate-900">
      <div className="max-w-7xl mx-auto">
        {/* Header Section - Estilo exclusivo psicólogo */}
        <div className="bg-gradient-to-br from-cyan-50 via-sky-50 to-cyan-50 rounded-2xl shadow-2xl relative overflow-hidden mx-2 sm:mx-3 mt-3 border border-cyan-200/40">
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-100/50 via-transparent to-sky-100/30 animate-pulse"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-cyan-100/50 via-sky-100/30 to-transparent rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-gradient-to-tr from-sky-100/40 to-transparent rounded-full blur-3xl -ml-12 -mb-12 pointer-events-none"></div>

          <div className="w-full px-4 sm:px-6 lg:px-8 pt-6 pb-8 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="px-3 py-1 rounded-full bg-white/70 backdrop-blur-xl text-cyan-700 text-[10px] font-bold flex items-center tracking-wide uppercase shadow-sm border border-cyan-300/50 hover:bg-white/80 transition-all duration-300">
                    <Sparkles className="w-3 h-3 mr-1.5" />
                    SAPTA
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-cyan-900 mb-1.5 leading-tight">
                  Calendario de Citas - Psicólogo
                </h1>
                <p className="text-cyan-800 text-sm max-w-2xl font-medium leading-relaxed">
                  Gestiona tu agenda, disponibilidad y citas con herramientas avanzadas.
                  <span className="hidden sm:inline text-cyan-700"> Filtros, reprogramación y estadísticas detalladas.</span>
                </p>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <Button
                  onClick={() => navigate('/profile')}
                  className="bg-white/80 backdrop-blur-xl rounded-xl px-4 py-2 border border-cyan-300/40 text-cyan-800 hover:bg-white/90 shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-2 font-semibold text-sm"
                >
                  <User className="w-4 h-4" />
                  Mi Perfil
                </Button>
                <Button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="bg-white/80 backdrop-blur-xl rounded-xl px-4 py-2 border border-cyan-300/40 text-cyan-800 hover:bg-white/90 shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-2 font-semibold text-sm"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  Actualizar
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

        <div className="w-full px-3 sm:px-4 lg:px-6 -mt-4 relative z-20">
          {/* Mensajes de error */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Barra de herramientas avanzadas */}
          <div className="bg-white rounded-xl shadow-md p-4 mb-4 border border-cyan-200">
            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={() => setShowDirectScheduler(true)}
                className="bg-gradient-to-r from-cyan-300 to-sky-300 hover:from-cyan-400 hover:to-sky-400 text-cyan-900 font-semibold shadow-md transition-all duration-300 px-4 py-2 text-sm rounded-lg flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Agendar Cita Directa
              </Button>
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                className="border-2 border-cyan-300 text-cyan-700 font-semibold bg-white hover:bg-cyan-50 hover:border-cyan-400 transition-all duration-300 px-4 py-2 text-sm rounded-lg flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filtros de Pacientes
                {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
              <Button
                onClick={() => {
                  loadAppointmentHistory();
                  setShowHistoryModal(true);
                }}
                variant="outline"
                className="border-2 border-cyan-300 text-cyan-700 font-semibold bg-white hover:bg-cyan-50 hover:border-cyan-400 transition-all duration-300 px-4 py-2 text-sm rounded-lg flex items-center gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                Historial y Estadísticas
              </Button>
              <Button
                onClick={() => setShowAvailabilityModal(true)}
                variant="outline"
                className="border-2 border-cyan-300 text-cyan-700 font-semibold bg-white hover:bg-cyan-50 hover:border-cyan-400 transition-all duration-300 px-4 py-2 text-sm rounded-lg flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Gestión de Disponibilidad
              </Button>
            </div>

            {/* Panel de filtros expandible */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-cyan-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre del Paciente</label>
                    <Input
                      type="text"
                      placeholder="Buscar por nombre..."
                      value={patientFilters.name}
                      onChange={(e) => setPatientFilters({ ...patientFilters, name: e.target.value })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">DNI</label>
                    <Input
                      type="text"
                      placeholder="Buscar por DNI..."
                      value={patientFilters.dni}
                      onChange={(e) => setPatientFilters({ ...patientFilters, dni: e.target.value })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Estado</label>
                    <select
                      value={patientFilters.status}
                      onChange={(e) => setPatientFilters({ ...patientFilters, status: e.target.value as any })}
                      className="w-full px-3 py-2 border border-cyan-200 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400"
                    >
                      <option value="all">Todos</option>
                      <option value="pending">Pendiente</option>
                      <option value="confirmed">Confirmada</option>
                      <option value="completed">Completada</option>
                      <option value="cancelled">Cancelada</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Desde</label>
                    <Input
                      type="date"
                      value={patientFilters.dateFrom}
                      onChange={(e) => setPatientFilters({ ...patientFilters, dateFrom: e.target.value })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Hasta</label>
                    <Input
                      type="date"
                      value={patientFilters.dateTo}
                      onChange={(e) => setPatientFilters({ ...patientFilters, dateTo: e.target.value })}
                      className="w-full"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={clearFilters}
                      variant="outline"
                      className="w-full border border-gray-300 text-gray-600 hover:bg-gray-50"
                    >
                      Limpiar Filtros
                    </Button>
                  </div>
                </div>
                <div className="mt-3 text-sm text-cyan-700 font-medium">
                  Mostrando {filteredAppointments.length} de {appointments.length} citas
                </div>
              </div>
            )}
          </div>

          {/* Calendario principal - ELIMINADO: Solo se usa calendario simple en agendar cita directamente */}

          {/* Lista de citas filtradas */}
          <Card className="mb-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-cyan-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Citas Programadas
                </h2>
                <Badge className="bg-cyan-100 text-cyan-800 border-cyan-200">
                  {filteredAppointments.length} citas
                </Badge>
              </div>
              
              {loading ? (
                <div className="text-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-cyan-600" />
                  <p className="mt-2 text-gray-600">Cargando citas...</p>
                </div>
              ) : filteredAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-600">No hay citas que coincidan con los filtros</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="border border-cyan-200 rounded-lg p-4 hover:shadow-md transition-all duration-300 bg-gradient-to-r from-cyan-50/50 to-white"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-cyan-200 to-sky-200 rounded-lg flex items-center justify-center">
                              <User className="w-5 h-5 text-cyan-800" />
                            </div>
                            <div>
                              <h3 className="font-bold text-cyan-900">{appointment.patient_full_name || 'Paciente'}</h3>
                              <p className="text-sm text-cyan-700">DNI: {appointment.patient_dni || 'N/A'}</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {format(parseISO(appointment.date), 'dd/MM/yyyy', { locale: es })}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {appointment.time}
                            </div>
                            <Badge
                              className={
                                appointment.status === 'confirmed'
                                  ? 'bg-green-100 text-green-800 border-green-200'
                                  : appointment.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                  : appointment.status === 'completed'
                                  ? 'bg-blue-100 text-blue-800 border-blue-200'
                                  : 'bg-red-100 text-red-800 border-red-200'
                              }
                            >
                              {appointment.status === 'confirmed' ? 'Confirmada' :
                               appointment.status === 'pending' ? 'Pendiente' :
                               appointment.status === 'completed' ? 'Completada' : 'Cancelada'}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedAppointment(appointment);
                              setNewDate(appointment.date);
                              setNewTime(appointment.time);
                              setShowRescheduleModal(true);
                            }}
                            className="text-cyan-600 hover:bg-cyan-50"
                            title="Reprogramar"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedAppointment(appointment);
                              // Aquí se podría abrir un modal de detalles
                            }}
                            className="text-cyan-600 hover:bg-cyan-50"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Modal de Agendamiento Directo */}
      {showDirectScheduler && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-cyan-200">
            <div className="bg-gradient-to-r from-cyan-500 to-sky-500 p-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Agendar Cita Directa</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDirectScheduler(false)}
                className="text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <DirectAppointmentScheduler />
            </div>
          </div>
        </div>
      )}

      {/* Modal de Gestión de Disponibilidad */}
      {showAvailabilityModal && selectedDate && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-cyan-200">
            <div className="bg-gradient-to-r from-cyan-500 to-sky-500 p-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">
                Gestión de Disponibilidad - {format(selectedDate, 'dd/MM/yyyy', { locale: es })}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowAvailabilityModal(false);
                  setSelectedDate(null);
                }}
                className="text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={() => {
                      setSelectedSlot(null);
                      setShowBlockModal(true);
                    }}
                    className="bg-gradient-to-r from-cyan-300 to-sky-300 hover:from-cyan-400 hover:to-sky-400 text-cyan-900 font-semibold"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Crear Horario
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedSlot(null);
                      setShowBlockModal(true);
                    }}
                    variant="outline"
                    className="border-2 border-red-300 text-red-700 hover:bg-red-50"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Bloquear Horario
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold text-cyan-900">Horarios del día:</h4>
                  {scheduleSlots.length === 0 ? (
                    <p className="text-gray-600 text-sm">No hay horarios configurados para este día</p>
                  ) : (
                    scheduleSlots.map((slot) => (
                      <div
                        key={slot.id}
                        className="flex items-center justify-between p-3 border border-cyan-200 rounded-lg bg-cyan-50/50"
                      >
                        <div className="flex items-center gap-3">
                          <Clock className="w-4 h-4 text-cyan-700" />
                          <span className="font-medium text-cyan-900">
                            {slot.start_time} - {slot.end_time}
                          </span>
                          {slot.is_blocked && (
                            <Badge className="bg-red-100 text-red-800 border-red-200">
                              Bloqueado
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {slot.is_blocked ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleUnblockSlot(slot.id!)}
                              className="text-green-600 hover:bg-green-50"
                            >
                              Desbloquear
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedSlot(slot);
                                setShowBlockModal(true);
                              }}
                              className="text-red-600 hover:bg-red-50"
                            >
                              Bloquear
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Bloqueo */}
      {showBlockModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-cyan-200">
            <div className="bg-gradient-to-r from-cyan-500 to-sky-500 p-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Bloquear Horario</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowBlockModal(false);
                  setBlockReason('');
                  setSelectedSlot(null);
                }}
                className="text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Motivo del bloqueo
                  </label>
                  <textarea
                    rows={3}
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                    className="w-full px-3 py-2 border border-cyan-200 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400"
                    placeholder="Describe el motivo del bloqueo..."
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      setShowBlockModal(false);
                      setBlockReason('');
                      setSelectedSlot(null);
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleBlockSlot}
                    className="flex-1 bg-gradient-to-r from-cyan-300 to-sky-300 hover:from-cyan-400 hover:to-sky-400 text-cyan-900 font-semibold"
                  >
                    Bloquear
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Reprogramación */}
      {showRescheduleModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-cyan-200">
            <div className="bg-gradient-to-r from-cyan-500 to-sky-500 p-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Reprogramar Cita</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowRescheduleModal(false);
                  setSelectedAppointment(null);
                  setNewDate('');
                  setNewTime('');
                }}
                className="text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Paciente
                  </label>
                  <p className="text-gray-900 font-medium">{selectedAppointment.patient_full_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nueva Fecha
                  </label>
                  <Input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nueva Hora
                  </label>
                  <Input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      setShowRescheduleModal(false);
                      setSelectedAppointment(null);
                      setNewDate('');
                      setNewTime('');
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleReschedule}
                    className="flex-1 bg-gradient-to-r from-cyan-300 to-sky-300 hover:from-cyan-400 hover:to-sky-400 text-cyan-900 font-semibold"
                  >
                    Reprogramar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Historial y Estadísticas */}
      {showHistoryModal && appointmentHistory && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-cyan-200">
            <div className="bg-gradient-to-r from-cyan-500 to-sky-500 p-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Historial y Estadísticas de Citas</h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setHistoryView(historyView === 'list' ? 'stats' : 'list')}
                  className="text-white hover:bg-white/20"
                >
                  {historyView === 'list' ? <BarChart3 className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHistoryModal(false)}
                  className="text-white hover:bg-white/20"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {historyView === 'stats' ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-cyan-50 to-sky-50 p-4 rounded-lg border border-cyan-200">
                      <div className="text-sm text-cyan-700 font-medium mb-1">Total</div>
                      <div className="text-2xl font-bold text-cyan-900">{appointmentHistory.total}</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                      <div className="text-sm text-green-700 font-medium mb-1">Completadas</div>
                      <div className="text-2xl font-bold text-green-900">{appointmentHistory.completed}</div>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-4 rounded-lg border border-yellow-200">
                      <div className="text-sm text-yellow-700 font-medium mb-1">Pendientes</div>
                      <div className="text-2xl font-bold text-yellow-900">{appointmentHistory.pending}</div>
                    </div>
                    <div className="bg-gradient-to-br from-red-50 to-rose-50 p-4 rounded-lg border border-red-200">
                      <div className="text-sm text-red-700 font-medium mb-1">Canceladas</div>
                      <div className="text-2xl font-bold text-red-900">{appointmentHistory.cancelled}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-cyan-900 mb-3">Citas por Mes</h4>
                    <div className="space-y-2">
                      {appointmentHistory.byMonth.map((item) => (
                        <div key={item.month} className="flex items-center justify-between p-3 bg-cyan-50 rounded-lg border border-cyan-200">
                          <span className="font-medium text-cyan-900">
                            {format(parseISO(item.month + '-01'), 'MMMM yyyy', { locale: es })}
                          </span>
                          <Badge className="bg-cyan-200 text-cyan-900 border-cyan-300">
                            {item.count} citas
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {appointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="border border-cyan-200 rounded-lg p-4 bg-gradient-to-r from-cyan-50/50 to-white"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-cyan-900">{apt.patient_full_name}</h4>
                          <p className="text-sm text-cyan-700">
                            {format(parseISO(apt.date), 'dd/MM/yyyy', { locale: es })} a las {apt.time}
                          </p>
                        </div>
                        <Badge
                          className={
                            apt.status === 'confirmed'
                              ? 'bg-green-100 text-green-800 border-green-200'
                              : apt.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                              : apt.status === 'completed'
                              ? 'bg-blue-100 text-blue-800 border-blue-200'
                              : 'bg-red-100 text-red-800 border-red-200'
                          }
                        >
                          {apt.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

