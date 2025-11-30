import { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  User,
  FileText,
  Plus,
  CheckCircle,
  Clock as ClockIcon,
  RefreshCw,
  X,
  Activity,
  ChevronRight,
  Sparkles,
  BarChart3,
  HeartHandshake
} from 'lucide-react';

import { WellnessWidget } from './WellnessWidget';
import { QuickTestModal } from './QuickTestModal';

import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useAuth } from '../../contexts/AuthContext';
import { getUserAppointments, cancelAppointment, rescheduleAppointment } from '../../services/appointments';
import { useNavigate } from 'react-router-dom';
import { CancelAppointmentModal } from '../appointments/CancelAppointmentModal';
import { RescheduleAppointmentModal } from '../appointments/RescheduleAppointmentModal';
import { Edit } from 'lucide-react';

interface Appointment {
  id: number;
  user_email: string;
  psychologist_name: string;
  date: string;
  time: string;
  reason: string;
  status: string;
  created_at: string;
}

interface StudentDashboardProps {
  onPageChange?: (page: string) => void;
}

export function StudentDashboard({ onPageChange }: StudentDashboardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showAppointmentDetails, setShowAppointmentDetails] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showQuickTestModal, setShowQuickTestModal] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<Appointment | null>(null);
  const [appointmentToReschedule, setAppointmentToReschedule] = useState<Appointment | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (user?.email) {
      loadAppointments();
    }
  }, [user]);



  const loadAppointments = async () => {
    try {
      setLoading(true);

      const data = await getUserAppointments();
      setAppointments(data);
    } catch (error) {
      console.error('Error cargando citas:', error);
    } finally {
      setLoading(false);
    }
  };



  const handleNavigation = (page: string) => {
    if (onPageChange) {
      onPageChange(page);
    } else {
      switch (page) {
        case 'appointments':
          navigate('/appointments');
          break;
        case 'reschedule':
          navigate('/appointments/reschedule');
          break;
        case 'appointments/history':
          navigate('/appointments/history');
          break;
        case 'notifications':
          navigate('/notifications');
          break;
        case 'profile':
          navigate('/profile');
          break;
        case 'documents':
          navigate('/documents');
          break;
        default:
          navigate('/');
      }
    }
  };

  const handleCancelClick = (appointment: Appointment) => {
    setAppointmentToCancel(appointment);
  };

  const handleConfirmCancel = async (appointmentId: number) => {
    await cancelAppointment(appointmentId);
    await loadAppointments(); // Recargar citas
    setAppointmentToCancel(null);
  };

  const handleRescheduleClick = (appointment: Appointment) => {
    setAppointmentToReschedule(appointment);
  };

  const handleConfirmReschedule = async (appointmentId: number, newDate: string, newTime: string) => {
    await rescheduleAppointment(appointmentId, newDate, newTime);
    await loadAppointments(); // Recargar citas
    setAppointmentToReschedule(null);
  };

  const handleViewAppointmentDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowAppointmentDetails(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'confirmed':
        return 'success';
      case 'completed':
        return 'info';
      case 'cancelled':
        return 'danger';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'confirmed':
        return 'Confirmada';
      case 'completed':
        return 'Completada';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  };



  const upcomingAppointments = appointments
    .filter(apt => apt.status === 'confirmed' || apt.status === 'pending')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  const totalAppointments = appointments.length;
  const completedAppointments = appointments.filter(apt => apt.status === 'completed').length;
  const pendingAppointments = appointments.filter(apt => apt.status === 'pending').length;

  // Animation classes
  const fadeInUp = "animate-fade-in";
  const stagger1 = "delay-[100ms]";
  const stagger3 = "delay-[300ms]";

  return (
    <div className="min-h-screen bg-gray-50 font-sans selection:bg-slate-100 selection:text-slate-900">
      {/* Header Section - Compact & Professional */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl relative overflow-hidden mx-2 sm:mx-3 mt-3 border border-white/10">
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

        <div className="w-full px-4 sm:px-6 lg:px-8 pt-6 pb-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className={`${fadeInUp}`}>
              <div className="flex items-center space-x-2 mb-2">
                <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-xl text-white text-[10px] font-bold flex items-center tracking-wide uppercase shadow-lg border border-white/20 hover:bg-white/25 transition-all duration-300">
                  <Sparkles className="w-3 h-3 mr-1.5 animate-pulse" />
                  SAPTA
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-1.5 leading-tight drop-shadow-lg">
                Bienvenido a SAPTA
              </h1>
              <p className="text-slate-300 text-sm max-w-2xl font-medium leading-relaxed drop-shadow-md">
                Espacio de bienestar mental.
                <span className="hidden sm:inline text-slate-400"> Aquí para apoyarte.</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowQuickTestModal(true)}
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-200 hover:text-white rounded-xl transition-all border border-rose-500/20 backdrop-blur-sm group"
              >
                <HeartHandshake className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold uppercase tracking-wider">Ayuda</span>
              </button>

              <div className={`hidden md:block ${fadeInUp} ${stagger1}`}>
                <div className="bg-white/15 backdrop-blur-xl rounded-xl p-3 border border-white/20 shadow-xl hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] transition-all duration-500 group cursor-default relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="flex items-center gap-3 relative z-10">
                    <div className="bg-white/90 p-2 rounded-xl text-slate-700 shadow-lg group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-white/70 uppercase tracking-wider">
                        {currentTime.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </p>
                      <p className="text-lg font-black text-white tabular-nums leading-none mt-0.5 drop-shadow-lg">
                        {currentTime.toLocaleTimeString('es-ES')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
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

      <div className="w-full px-3 sm:px-4 lg:px-6 -mt-4 relative z-20">
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 ${fadeInUp} ${stagger1}`}>
          {/* Total Citas - Neutral */}
          <div className="group relative bg-white rounded-xl shadow-md hover:shadow-lg p-3 border border-slate-200 hover:border-slate-300 overflow-hidden hover:-translate-y-0.5 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-slate-100/50 to-transparent rounded-full -mr-8 -mt-8 blur-2xl group-hover:from-slate-200/60 transition-all duration-500"></div>

            <div className="flex items-center justify-between mb-2 relative z-10">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-lg flex items-center justify-center text-indigo-700 shadow-sm group-hover:scale-110 group-hover:bg-indigo-300 transition-all duration-300">
                <Calendar className="w-4 h-4" />
              </div>
              <span className="text-[9px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full uppercase tracking-wider">Total</span>
            </div>

            <div className="flex items-baseline gap-1.5 relative z-10">
              <p className="text-3xl font-black text-slate-900 tracking-tight">{totalAppointments}</p>
              <p className="text-sm font-bold text-slate-600">Citas</p>
            </div>
            <p className="text-[10px] font-semibold text-slate-500 mt-0.5 relative z-10">Historial completo</p>
          </div>

          {/* Completadas - Subtle Success */}
          <div className="group relative bg-white rounded-xl shadow-md hover:shadow-lg p-3 border border-slate-200 hover:border-slate-300 overflow-hidden hover:-translate-y-0.5 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-50/50 to-transparent rounded-full -mr-8 -mt-8 blur-2xl group-hover:from-green-100/60 transition-all duration-500"></div>

            <div className="flex items-center justify-between mb-2 relative z-10">
              <div className="w-9 h-9 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-lg flex items-center justify-center text-emerald-700 shadow-sm group-hover:scale-110 group-hover:bg-emerald-300 transition-all duration-300">
                <CheckCircle className="w-4 h-4" />
              </div>
              <span className="text-[9px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full uppercase tracking-wider">Éxito</span>
            </div>

            <div className="flex items-baseline gap-1.5 relative z-10">
              <p className="text-3xl font-black text-slate-900 tracking-tight">{completedAppointments}</p>
              <p className="text-sm font-bold text-slate-600">Sesiones</p>
            </div>
            <p className="text-[10px] font-semibold text-slate-500 mt-0.5 relative z-10">Finalizadas</p>
          </div>

          {/* Pendientes - Subtle Info */}
          <div className="group relative bg-white rounded-xl shadow-md hover:shadow-lg p-3 border border-slate-200 hover:border-slate-300 overflow-hidden hover:-translate-y-0.5 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-50/50 to-transparent rounded-full -mr-8 -mt-8 blur-2xl group-hover:from-blue-100/60 transition-all duration-500"></div>

            <div className="flex items-center justify-between mb-2 relative z-10">
              <div className="w-9 h-9 bg-gradient-to-br from-cyan-100 to-blue-200 rounded-lg flex items-center justify-center text-blue-700 shadow-sm group-hover:scale-110 group-hover:bg-blue-300 transition-all duration-300">
                <ClockIcon className="w-4 h-4" />
              </div>
              <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-wider">Próximas</span>
            </div>

            <div className="flex items-baseline gap-1.5 relative z-10">
              <p className="text-3xl font-black text-slate-900 tracking-tight">{pendingAppointments}</p>
              <p className="text-sm font-bold text-slate-600">Pendientes</p>
            </div>
            <p className="text-[10px] font-semibold text-slate-500 mt-0.5 relative z-10">Por asistir</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Quick Actions - Compact Modern */}
          <section className="lg:col-span-2 h-full flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-800 flex items-center tracking-tight">
                <Activity className="w-3.5 h-3.5 mr-1.5 text-slate-600" />
                Acciones Rápidas
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 content-start">
              {/* Agendar Cita */}
              <button
                onClick={() => handleNavigation('appointments')}
                className="group relative bg-white p-4 rounded-2xl shadow-md hover:shadow-lg border border-slate-200 hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-300 text-left overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-violet-100 to-purple-200 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:bg-purple-300 transition-all duration-300">
                    <Calendar className="w-5 h-5 text-violet-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base text-slate-900 group-hover:text-slate-700 transition-colors tracking-tight">Agendar Cita</h3>
                    <p className="text-xs text-slate-600 leading-snug font-medium">Programa una nueva sesión</p>
                  </div>
                  <div className="self-center opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 duration-300">
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              </button>

              {/* Reprogramar */}
              <button
                onClick={() => handleNavigation('reschedule')}
                className="group relative bg-white p-4 rounded-2xl shadow-md hover:shadow-lg border border-slate-200 hover:border-slate-400 hover:-translate-y-0.5 transition-all duration-300 text-left overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-cyan-200 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:bg-cyan-300 transition-all duration-300">
                    <RefreshCw className="w-5 h-5 text-blue-700 group-hover:text-cyan-800 group-hover:rotate-180" style={{ transition: 'all 0.5s' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base text-slate-900 group-hover:text-slate-700 transition-colors tracking-tight">Reprogramar</h3>
                    <p className="text-xs text-slate-600 leading-snug font-medium">Modificar citas</p>
                  </div>
                </div>
              </button>

              {/* Historial */}
              <button
                onClick={() => handleNavigation('appointments/history')}
                className="group relative bg-white p-4 rounded-2xl shadow-md hover:shadow-lg border border-slate-200 hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-300 text-left overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-200 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:bg-purple-300 transition-all duration-300">
                    <FileText className="w-5 h-5 text-indigo-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base text-slate-900 group-hover:text-slate-700 transition-colors tracking-tight">Historial</h3>
                    <p className="text-xs text-slate-600 leading-snug font-medium">Revisa sesiones pasadas</p>
                  </div>
                  <div className="self-center opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 duration-300">
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              </button>

              {/* Estadísticas */}
              <button
                onClick={() => setShowStatsModal(true)}
                className="group relative bg-white p-4 rounded-2xl shadow-md hover:shadow-lg border border-slate-200 hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-300 text-left overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-pink-100 to-rose-200 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:bg-rose-300 transition-all duration-300">
                    <BarChart3 className="w-5 h-5 text-pink-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base text-slate-900 group-hover:text-slate-700 transition-colors tracking-tight">Estadísticas</h3>
                    <p className="text-xs text-slate-600 leading-snug font-medium">Ver progreso</p>
                  </div>
                  <div className="self-center opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 duration-300">
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              </button>
            </div>

            {/* Wellness Widget */}
            <div className="mt-4">
              <WellnessWidget />
            </div>
          </section>

          {/* Sidebar - Upcoming Appointments - Neutral */}
          <div className={`lg:col-span-1 ${fadeInUp} ${stagger3}`}>
            <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden lg:sticky lg:top-6 lg:max-h-[calc(100vh-8rem)]">
              {/* Header */}
              <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                <h2 className="font-bold text-slate-800 flex items-center text-sm tracking-tight">
                  <Clock className="w-4 h-4 mr-2.5 text-slate-600" />
                  Próximas Citas
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl px-3 py-1.5 transition-all"
                  onClick={() => handleNavigation('appointments/history')}
                >
                  Ver todas
                </Button>
              </div>

              <div className="p-5 lg:overflow-y-auto lg:max-h-[calc(100vh-16rem)]">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                    <div className="w-8 h-8 border-3 border-violet-200 border-t-violet-600 rounded-full animate-spin mb-3"></div>
                    <p className="text-xs font-semibold text-slate-500">Cargando citas...</p>
                  </div>
                ) : upcomingAppointments.length === 0 ? (
                  <div className="text-center py-8 px-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-violet-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-100/50">
                      <Calendar className="w-8 h-8 text-violet-500" />
                    </div>
                    <h3 className="text-slate-900 font-bold mb-2 text-sm">Sin citas programadas</h3>
                    <p className="text-xs text-slate-500 mb-5 leading-relaxed max-w-[200px] mx-auto">
                      Agenda tu próxima sesión de bienestar
                    </p>
                    <Button
                      onClick={() => handleNavigation('appointments')}
                      className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg shadow-violet-500/30 py-2.5 rounded-xl font-bold text-xs transition-all hover:scale-105"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Agendar Cita
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4 relative">
                    {/* Modern Timeline line */}
                    <div className="absolute left-[15px] top-3 bottom-3 w-0.5 bg-gradient-to-b from-violet-200 via-purple-200 to-violet-200"></div>

                    {upcomingAppointments.map((appointment, index) => (
                      <div
                        key={appointment.id}
                        className="relative pl-9 group"
                      >
                        {/* Premium Timeline indicator */}
                        <div className={`absolute left-0 top-3 w-8 h-8 rounded-xl flex items-center justify-center z-10 transition-all duration-300 shadow-md ${index === 0
                          ? 'bg-gradient-to-br from-violet-600 to-purple-600 text-white shadow-violet-500/40 scale-110'
                          : 'bg-white border-2 border-violet-200 text-violet-400 group-hover:border-violet-400'
                          }`}>
                          <span className="text-xs font-black">{index + 1}</span>
                        </div>

                        <div className="bg-white/90 backdrop-blur-sm border border-violet-100/50 rounded-2xl p-4 shadow-md hover:shadow-xl hover:border-violet-300/50 hover:-translate-y-0.5 transition-all duration-300">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="text-xs font-bold text-violet-500 uppercase tracking-wide mb-1">
                                {new Date(appointment.date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' })}
                              </p>
                              <div className="flex items-baseline space-x-2">
                                <p className="text-lg font-black text-slate-900 tracking-tight">{appointment.time}</p>
                                <span className="text-xs text-slate-500 font-semibold uppercase">
                                  {new Date(appointment.date).toLocaleDateString('es-ES', { month: 'short' })}
                                </span>
                              </div>
                            </div>
                            <Badge variant={getStatusColor(appointment.status)} className="text-[10px] px-2.5 py-1 uppercase tracking-wider font-bold shadow-sm rounded-lg">
                              {getStatusText(appointment.status)}
                            </Badge>
                          </div>

                          <div className="flex items-center mb-4 bg-gradient-to-r from-violet-50 to-purple-50 p-3 rounded-xl border border-violet-100/50">
                            <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-sm mr-3 text-violet-500 border border-violet-100">
                              <User className="w-4 h-4" />
                            </div>
                            <p className="text-xs font-bold text-slate-700 truncate">Dr. {appointment.psychologist_name}</p>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 text-xs font-bold border-violet-200 hover:bg-violet-50 hover:text-violet-700 hover:border-violet-400 rounded-xl py-2 transition-all"
                              onClick={() => handleViewAppointmentDetails(appointment)}
                            >
                              Ver Detalles
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>


          </div>
        </div>




      </div>

      {/* Modal de Estadísticas - Professional Light Design */}
      {
        showStatsModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden transform transition-all scale-100 relative flex flex-col max-h-[90vh]">
              {/* Header Premium */}
              <div className="bg-slate-900 px-8 py-6 relative overflow-hidden flex-shrink-0">
                <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/20 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full -ml-10 -mb-10 blur-3xl"></div>

                <div className="relative z-10 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10">
                      <BarChart3 className="w-6 h-6 text-violet-400" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white tracking-tight">
                        Mis Estadísticas
                      </h3>
                      <p className="text-slate-400 text-sm font-medium">Análisis detallado de tu progreso</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowStatsModal(false)}
                    className="bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white p-2.5 rounded-xl transition-all backdrop-blur-sm border border-transparent hover:border-white/10"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Columna Izquierda: Métricas Principales */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Grid de KPIs */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:border-violet-100 transition-colors group">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Total</p>
                        <p className="text-3xl font-black text-slate-900 group-hover:text-violet-600 transition-colors">{totalAppointments}</p>
                        <div className="h-1 w-8 bg-slate-100 mt-3 rounded-full overflow-hidden">
                          <div className="h-full bg-slate-900 w-full rounded-full"></div>
                        </div>
                      </div>
                      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:border-emerald-100 transition-colors group">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Asistidas</p>
                        <p className="text-3xl font-black text-slate-900 group-hover:text-emerald-600 transition-colors">{completedAppointments}</p>
                        <div className="h-1 w-8 bg-slate-100 mt-3 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 w-[80%] rounded-full"></div>
                        </div>
                      </div>
                      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:border-blue-100 transition-colors group">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Pendientes</p>
                        <p className="text-3xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">{pendingAppointments}</p>
                        <div className="h-1 w-8 bg-slate-100 mt-3 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 w-[40%] rounded-full"></div>
                        </div>
                      </div>
                      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:border-rose-100 transition-colors group">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Canceladas</p>
                        <p className="text-3xl font-black text-slate-900 group-hover:text-rose-500 transition-colors">
                          {appointments.filter(a => a.status === 'cancelled').length}
                        </p>
                        <div className="h-1 w-8 bg-slate-100 mt-3 rounded-full overflow-hidden">
                          <div className="h-full bg-rose-500 w-[10%] rounded-full"></div>
                        </div>
                      </div>
                    </div>

                    {/* Gráfico de Asistencia Principal */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
                      <div className="flex justify-between items-start mb-8 relative z-10">
                        <div>
                          <h4 className="font-bold text-slate-900 text-lg flex items-center">
                            <Activity className="w-5 h-5 mr-2 text-violet-500" />
                            Tasa de Asistencia
                          </h4>
                          <p className="text-sm text-slate-500 mt-1">Tu compromiso con las sesiones programadas</p>
                        </div>
                        <div className="text-right">
                          <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600">
                            {totalAppointments > 0
                              ? Math.round((completedAppointments / totalAppointments) * 100)
                              : 0}%
                          </p>
                        </div>
                      </div>

                      <div className="relative h-6 bg-slate-100 rounded-full overflow-hidden mb-4">
                        <div
                          className="absolute top-0 left-0 h-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-violet-500 bg-[length:200%_100%] animate-shimmer rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${totalAppointments > 0 ? (completedAppointments / totalAppointments) * 100 : 0}%` }}
                        ></div>
                      </div>

                      <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                        <span>0%</span>
                        <span>Meta: 80%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  </div>

                  {/* Columna Derecha: Insights y Logros */}
                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-3xl shadow-lg text-white relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>

                      <div className="relative z-10">
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm border border-white/10">
                          <Sparkles className="w-6 h-6 text-yellow-400" />
                        </div>
                        <h4 className="font-bold text-lg mb-2">Nivel de Compromiso</h4>
                        <p className="text-slate-300 text-sm mb-4 leading-relaxed">
                          {totalAppointments > 0 && (completedAppointments / totalAppointments) >= 0.8
                            ? "¡Excelente! Estás demostrando un gran compromiso con tu bienestar."
                            : "Sigue esforzándote. La constancia es clave para el progreso."}
                        </p>

                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                          <div className={`w-2 h-2 rounded-full ${totalAppointments > 0 && (completedAppointments / totalAppointments) >= 0.8 ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                          Estado: {totalAppointments > 0 && (completedAppointments / totalAppointments) >= 0.8 ? 'Óptimo' : 'En Progreso'}
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                      <h4 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wider">Desglose</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <div className="flex items-center">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 mr-3"></div>
                            <span className="text-sm font-bold text-slate-600">Completadas</span>
                          </div>
                          <span className="text-sm font-black text-slate-900">{completedAppointments}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <div className="flex items-center">
                            <div className="w-2 h-2 rounded-full bg-blue-500 mr-3"></div>
                            <span className="text-sm font-bold text-slate-600">Pendientes</span>
                          </div>
                          <span className="text-sm font-black text-slate-900">{pendingAppointments}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white px-8 py-6 flex justify-end border-t border-slate-100 flex-shrink-0">
                <Button
                  onClick={() => setShowStatsModal(false)}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-slate-200 transition-all hover:scale-105 active:scale-95"
                >
                  Entendido
                </Button>
              </div>
            </div>
          </div>
        )
      }

      {/* Modal de detalles de cita - Professional Light Design */}
      {
        showAppointmentDetails && selectedAppointment && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all scale-100 relative">
              <div className="bg-slate-900 px-8 py-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-10 -mt-10 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full -ml-10 -mb-10 blur-3xl"></div>

                <div className="relative z-10 flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-bold text-white flex items-center mb-2 tracking-tight">
                      Detalles de la Cita
                    </h3>
                    <p className="text-slate-400 text-sm font-medium">Información completa de tu sesión</p>
                  </div>
                  <button
                    onClick={() => setShowAppointmentDetails(false)}
                    className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors backdrop-blur-sm"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-8 space-y-6 bg-white">
                <div className="flex items-center p-5 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mr-5 flex-shrink-0 shadow-sm text-slate-500 border border-slate-100">
                    <User className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Psicólogo Asignado</p>
                    <p className="text-xl font-bold text-slate-900 tracking-tight">Dr. {selectedAppointment.psychologist_name}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="p-5 bg-white rounded-2xl border border-gray-100 hover:border-blue-100 hover:shadow-sm transition-all group">
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-2 flex items-center tracking-widest">
                      <Calendar className="w-3 h-3 mr-1.5" /> Fecha
                    </p>
                    <p className="text-slate-900 font-black text-xl group-hover:text-blue-600 transition-colors">
                      {new Date(selectedAppointment.date).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short'
                      })}
                    </p>
                    <p className="text-xs text-slate-500 font-medium mt-1">{new Date(selectedAppointment.date).getFullYear()}</p>
                  </div>
                  <div className="p-5 bg-white rounded-2xl border border-gray-100 hover:border-blue-100 hover:shadow-sm transition-all group">
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-2 flex items-center tracking-widest">
                      <Clock className="w-3 h-3 mr-1.5" /> Hora
                    </p>
                    <p className="text-slate-900 font-black text-xl group-hover:text-blue-600 transition-colors">{selectedAppointment.time}</p>
                    <p className="text-xs text-slate-500 font-medium mt-1">Duración: 45 min</p>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mb-3 tracking-widest">Motivo de la consulta</p>
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 text-slate-700 text-sm leading-relaxed italic font-medium">
                    "{selectedAppointment.reason}"
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-6">
                  <p className="text-sm font-bold text-slate-500">Estado actual:</p>
                  <Badge variant={getStatusColor(selectedAppointment.status)} className="px-4 py-1.5 text-xs shadow-sm uppercase tracking-wider font-bold rounded-lg">
                    {getStatusText(selectedAppointment.status)}
                  </Badge>
                </div>
              </div>

              <div className="bg-gray-50 px-8 py-6 flex justify-end space-x-4 border-t border-gray-100">
                <Button
                  variant="outline"
                  onClick={() => setShowAppointmentDetails(false)}
                  className="bg-white border-gray-200 hover:bg-gray-50 text-slate-600 font-bold px-6 rounded-xl"
                >
                  Cerrar
                </Button>
                {selectedAppointment.status === 'pending' && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAppointmentDetails(false);
                      handleCancelClick(selectedAppointment);
                    }}
                    className="bg-red-50 border-red-100 text-red-600 hover:bg-red-100 hover:border-red-200 font-bold px-6 rounded-xl"
                  >
                    Cancelar Cita
                  </Button>
                )}
                {selectedAppointment.status === 'confirmed' && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAppointmentDetails(false);
                      handleRescheduleClick(selectedAppointment);
                    }}
                    className="bg-violet-50 border-violet-100 text-violet-600 hover:bg-violet-100 hover:border-violet-200 font-bold px-6 rounded-xl"
                  >
                    Reprogramar Cita
                  </Button>
                )}
              </div>
            </div>
          </div>
        )
      }

      <QuickTestModal
        isOpen={showQuickTestModal}
        onClose={() => setShowQuickTestModal(false)}
      />

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
    </div >
  );
}