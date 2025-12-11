import React, { useState, useEffect } from 'react';
import { getPsychologistAppointments } from '@/services/appointments';
import { Appointment } from '@/services/appointments';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  Plus, 
  AlertCircle, 
  Clock as ClockIcon, 
  Settings,
  Users,
  MessageSquare,
  ClipboardList,
  Bell,
  Sparkles
} from 'lucide-react';

interface PsychologistStats {
  totalAppointments: number;
  pendingAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  todayAppointments: number;
  thisWeekAppointments: number;
  totalPatients: number;
  totalSessions: number;
}

export const PsychologistDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<PsychologistStats>({
    totalAppointments: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    todayAppointments: 0,
    thisWeekAppointments: 0,
    totalPatients: 0,
    totalSessions: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  // Variables de estado para futuras implementaciones
  // const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');
  // const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar citas del psicólogo
      const appointmentsData = await getPsychologistAppointments();
      setAppointments(appointmentsData);

      // Calcular estadísticas
      const today = new Date().toISOString().split('T')[0];
      const thisWeek = new Date();
      thisWeek.setDate(thisWeek.getDate() - 7);

      const statsData: PsychologistStats = {
        totalAppointments: appointmentsData.length,
        pendingAppointments: appointmentsData.filter(a => a.status === 'pending').length,
        completedAppointments: appointmentsData.filter(a => a.status === 'completed').length,
        cancelledAppointments: appointmentsData.filter(a => a.status === 'cancelled').length,
        todayAppointments: appointmentsData.filter(a => a.date === today).length,
        thisWeekAppointments: appointmentsData.filter(a => new Date(a.date) >= thisWeek).length,
        totalPatients: 0, // Assuming totalPatients is not provided in the original data
        totalSessions: 0 // Assuming totalSessions is not provided in the original data
      };

      setStats(statsData);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Funciones de utilidad para futuras implementaciones
  // const filteredAppointments = appointments.filter(appointment => {
  //   const matchesFilter = filter === 'all' || appointment.status === filter;
  //   const userEmail = appointment.user_email ? appointment.user_email.toLowerCase() : '';
  //   const reason = appointment.reason ? appointment.reason.toLowerCase() : '';
  //   const matchesSearch = userEmail.includes(searchTerm.toLowerCase()) ||
  //                        reason.includes(searchTerm.toLowerCase());
  //   return matchesFilter && matchesSearch;
  // });

  // const getStatusBadge = (status: string) => {
  //   const colors = {
  //     pending: 'bg-yellow-100 text-yellow-800',
  //     confirmed: 'bg-blue-100 text-blue-800',
  //     completed: 'bg-green-100 text-green-800',
  //     cancelled: 'bg-red-100 text-red-800'
  //   };

  //   const labels = {
  //     pending: 'Pendiente',
  //     confirmed: 'Confirmada',
  //     completed: 'Completada',
  //     cancelled: 'Cancelada'
  //   };

  //   return (
  //     <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
  //       {labels[status as keyof typeof labels] || status}
  //     </span>
  //   );
  // };

  // const handleStatusChange = async (appointmentId: number, newStatus: string) => {
  //   try {
  //     // Aquí implementarías la lógica para cambiar el estado de la cita
  //     console.log(`Cambiando estado de cita ${appointmentId} a ${newStatus}`);
  //     await loadDashboardData(); // Recargar datos
  //   } catch (err) {
  //     console.error('Error changing appointment status:', err);
  //     setError('Error al cambiar el estado de la cita');
  //   }
  // };

  const handleNavigation = (page: string) => {
    navigate(`/${page}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8e161a] mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans selection:bg-slate-100 selection:text-slate-900">
      {/* Header Section - Celeste Suave */}
      <div className="bg-gradient-to-br from-cyan-50 via-sky-50 to-cyan-50 rounded-2xl shadow-2xl relative overflow-hidden mx-2 sm:mx-3 mt-3 border border-cyan-200/40">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-100/50 via-transparent to-sky-100/30 animate-pulse"></div>

        {/* Minimal decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-cyan-100/50 via-sky-100/30 to-transparent rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-gradient-to-tr from-sky-100/40 to-transparent rounded-full blur-3xl -ml-12 -mb-12 pointer-events-none"></div>

        {/* Subtle dots */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-12 left-16 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></div>
          <div className="absolute top-20 right-32 w-1 h-1 bg-sky-300 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute bottom-16 left-1/3 w-1.5 h-1.5 bg-cyan-300 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="w-full px-4 sm:px-6 lg:px-8 pt-6 pb-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="px-3 py-1 rounded-full bg-white/70 text-cyan-700 text-[10px] font-bold flex items-center tracking-wide uppercase shadow-lg border border-cyan-300/50 hover:bg-white/80 transition-all duration-300 backdrop-blur-xl">
                  <Sparkles className="w-3 h-3 mr-1.5" />
                  SAPTA - Psicología
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-cyan-900 mb-1.5 leading-tight">
                Panel del Psicólogo
              </h1>
              <p className="text-cyan-800 text-sm max-w-2xl font-medium leading-relaxed">
                Gestión integral de pacientes y citas.
                <span className="hidden sm:inline text-cyan-700"> Aquí para apoyar tu labor profesional.</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden md:block">
                <div className="bg-white/80 backdrop-blur-xl rounded-xl p-3 border border-cyan-200/50 shadow-xl hover:shadow-2xl transition-all duration-500 group cursor-default relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-100/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="flex items-center gap-3 relative z-10">
                    <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 p-2 rounded-xl text-white shadow-lg group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-cyan-700 uppercase tracking-wider">
                        {currentTime.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </p>
                      <p className="text-lg font-black text-cyan-900 tabular-nums leading-none mt-0.5">
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

      {/* Estadísticas principales */}
      <div className="w-full px-3 sm:px-4 lg:px-6 -mt-4 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {/* Total Citas */}
          <div className="group relative bg-white rounded-xl shadow-md hover:shadow-lg p-3 border border-slate-200 hover:border-slate-300 overflow-hidden hover:-translate-y-0.5 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-slate-100/50 to-transparent rounded-full -mr-8 -mt-8 blur-2xl group-hover:from-slate-200/60 transition-all duration-500"></div>

            <div className="flex items-center justify-between mb-2 relative z-10">
              <div className="w-9 h-9 bg-gradient-to-br from-cyan-100 to-cyan-200 rounded-lg flex items-center justify-center text-cyan-700 shadow-sm group-hover:scale-110 group-hover:bg-cyan-300 transition-all duration-300">
                <Calendar className="w-4 h-4" />
              </div>
              <span className="text-[9px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full uppercase tracking-wider">Total</span>
            </div>

            <div className="flex items-baseline gap-1.5 relative z-10">
              <p className="text-3xl font-black text-slate-900 tracking-tight">{stats.totalAppointments}</p>
              <p className="text-sm font-bold text-slate-600">Citas</p>
            </div>
            <p className="text-[10px] font-semibold text-slate-500 mt-0.5 relative z-10">Historial completo</p>
          </div>

          {/* Pendientes */}
          <div className="group relative bg-white rounded-xl shadow-md hover:shadow-lg p-3 border border-slate-200 hover:border-slate-300 overflow-hidden hover:-translate-y-0.5 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-50/50 to-transparent rounded-full -mr-8 -mt-8 blur-2xl group-hover:from-amber-100/60 transition-all duration-500"></div>

            <div className="flex items-center justify-between mb-2 relative z-10">
              <div className="w-9 h-9 bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg flex items-center justify-center text-amber-700 shadow-sm group-hover:scale-110 group-hover:bg-amber-300 transition-all duration-300">
                <ClockIcon className="w-4 h-4" />
              </div>
              <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full uppercase tracking-wider">Próximas</span>
            </div>

            <div className="flex items-baseline gap-1.5 relative z-10">
              <p className="text-3xl font-black text-slate-900 tracking-tight">{stats.pendingAppointments}</p>
              <p className="text-sm font-bold text-slate-600">Pendientes</p>
            </div>
            <p className="text-[10px] font-semibold text-slate-500 mt-0.5 relative z-10">Por gestionar</p>
          </div>

          {/* Pacientes */}
          <div className="group relative bg-white rounded-xl shadow-md hover:shadow-lg p-3 border border-slate-200 hover:border-slate-300 overflow-hidden hover:-translate-y-0.5 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-50/50 to-transparent rounded-full -mr-8 -mt-8 blur-2xl group-hover:from-blue-100/60 transition-all duration-500"></div>

            <div className="flex items-center justify-between mb-2 relative z-10">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center text-blue-700 shadow-sm group-hover:scale-110 group-hover:bg-blue-300 transition-all duration-300">
                <Users className="w-4 h-4" />
              </div>
              <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-wider">Activos</span>
            </div>

            <div className="flex items-baseline gap-1.5 relative z-10">
              <p className="text-3xl font-black text-slate-900 tracking-tight">{stats.totalPatients}</p>
              <p className="text-sm font-bold text-slate-600">Pacientes</p>
            </div>
            <p className="text-[10px] font-semibold text-slate-500 mt-0.5 relative z-10">En seguimiento</p>
          </div>

          {/* Sesiones */}
          <div className="group relative bg-white rounded-xl shadow-md hover:shadow-lg p-3 border border-slate-200 hover:border-slate-300 overflow-hidden hover:-translate-y-0.5 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-50/50 to-transparent rounded-full -mr-8 -mt-8 blur-2xl group-hover:from-green-100/60 transition-all duration-500"></div>

            <div className="flex items-center justify-between mb-2 relative z-10">
              <div className="w-9 h-9 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-lg flex items-center justify-center text-emerald-700 shadow-sm group-hover:scale-110 group-hover:bg-emerald-300 transition-all duration-300">
                <ClipboardList className="w-4 h-4" />
              </div>
              <span className="text-[9px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full uppercase tracking-wider">Éxito</span>
            </div>

            <div className="flex items-baseline gap-1.5 relative z-10">
              <p className="text-3xl font-black text-slate-900 tracking-tight">{stats.totalSessions}</p>
              <p className="text-sm font-bold text-slate-600">Sesiones</p>
            </div>
            <p className="text-[10px] font-semibold text-slate-500 mt-0.5 relative z-10">Completadas</p>
          </div>
        </div>
      </div>

      {/* Grid principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 px-3 sm:px-4 lg:px-6">
        {/* Acciones rápidas - 2 columnas */}
        <section className="lg:col-span-2 h-full flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-800 flex items-center tracking-tight">
              <div className="w-7 h-7 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center mr-2 shadow-md">
                <Plus className="w-4 h-4 text-white" />
              </div>
              Acciones Rápidas
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 content-start">
            {/* Agendar Cita */}
            <button
              onClick={() => handleNavigation('appointments/direct')}
              className="group relative bg-white p-4 rounded-2xl shadow-md hover:shadow-lg border border-slate-200 hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-300 text-left overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 flex items-start space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-100 to-cyan-200 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:bg-cyan-300 transition-all duration-300">
                  <Calendar className="w-5 h-5 text-cyan-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base text-slate-900 group-hover:text-slate-700 transition-colors tracking-tight">Agendar Cita</h3>
                  <p className="text-xs text-slate-600 leading-snug font-medium">Programa cita directa</p>
                </div>
              </div>
            </button>

            {/* Ver Pacientes */}
            <button
              onClick={() => handleNavigation('patients')}
              className="group relative bg-white p-4 rounded-2xl shadow-md hover:shadow-lg border border-slate-200 hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-300 text-left overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 flex items-start space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:bg-blue-300 transition-all duration-300">
                  <Users className="w-5 h-5 text-blue-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base text-slate-900 group-hover:text-slate-700 transition-colors tracking-tight">Ver Pacientes</h3>
                  <p className="text-xs text-slate-600 leading-snug font-medium">Lista completa de pacientes</p>
                </div>
              </div>
            </button>

            {/* Registrar Sesión */}
            <button
              onClick={() => handleNavigation('sessions/register')}
              className="group relative bg-white p-4 rounded-2xl shadow-md hover:shadow-lg border border-slate-200 hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-300 text-left overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 flex items-start space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:bg-emerald-300 transition-all duration-300">
                  <MessageSquare className="w-5 h-5 text-emerald-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base text-slate-900 group-hover:text-slate-700 transition-colors tracking-tight">Registrar Sesión</h3>
                  <p className="text-xs text-slate-600 leading-snug font-medium">Documenta una sesión</p>
                </div>
              </div>
            </button>

            {/* Gestión de Horarios */}
            <button
              onClick={() => handleNavigation('schedule')}
              className="group relative bg-white p-4 rounded-2xl shadow-md hover:shadow-lg border border-slate-200 hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-300 text-left overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 flex items-start space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:bg-amber-300 transition-all duration-300">
                  <Settings className="w-5 h-5 text-amber-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base text-slate-900 group-hover:text-slate-700 transition-colors tracking-tight">Gestión de Horarios</h3>
                  <p className="text-xs text-slate-600 leading-snug font-medium">Configura disponibilidad</p>
                </div>
              </div>
            </button>
          </div>
        </section>

        {/* Gestión rápida - 1 columna */}
        <section className="flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-800 flex items-center tracking-tight">
              <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-2 shadow-md">
                <Bell className="w-4 h-4 text-white" />
              </div>
              Gestión Rápida
            </h2>
          </div>

          <div className="space-y-3">
            {/* Notificaciones */}
            <button
              onClick={() => handleNavigation('notifications')}
              className="group w-full bg-white p-4 rounded-2xl shadow-md hover:shadow-lg border border-slate-200 hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-300 text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-all duration-300">
                    <Bell className="w-5 h-5 text-blue-700" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-900">Notificaciones</p>
                    <p className="text-xs text-slate-600">Solicitudes de estudiantes</p>
                  </div>
                </div>
                {stats.pendingAppointments > 0 && (
                  <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
                    {stats.pendingAppointments}
                  </span>
                )}
              </div>
            </button>

            {/* Historial de Citas */}
            <button
              onClick={() => handleNavigation('appointments/history')}
              className="group w-full bg-white p-4 rounded-2xl shadow-md hover:shadow-lg border border-slate-200 hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-300 text-left"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-100 to-cyan-200 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-all duration-300">
                  <Clock className="w-5 h-5 text-cyan-700" />
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-900">Historial de Citas</p>
                  <p className="text-xs text-slate-600">Gestionar y revisar</p>
                </div>
              </div>
            </button>

            {/* Historial de Sesiones */}
            <button
              onClick={() => handleNavigation('sessions')}
              className="group w-full bg-white p-4 rounded-2xl shadow-md hover:shadow-lg border border-slate-200 hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-300 text-left"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-100 to-teal-200 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-all duration-300">
                  <ClipboardList className="w-5 h-5 text-teal-700" />
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-900">Historial de Sesiones</p>
                  <p className="text-xs text-slate-600">Filtrar por paciente</p>
                </div>
              </div>
            </button>
          </div>
        </section>
      </div>

      {/* Recordatorios y Alertas */}
      {stats.pendingAppointments > 0 && (
        <div className="px-3 sm:px-4 lg:px-6 mb-4">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl flex items-center justify-center shadow-md">
                  <AlertCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-amber-900">Recordatorio Importante</h3>
                  <p className="text-xs text-amber-700 mt-0.5">
                    Tienes {stats.pendingAppointments} citas pendientes de aprobación
                  </p>
                </div>
              </div>
              <button 
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 whitespace-nowrap"
                onClick={() => handleNavigation('notifications')}
              >
                Revisar
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="px-3 sm:px-4 lg:px-6 mb-4">
          <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-500 rounded-xl flex items-center justify-center shadow-md">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-red-900">Error</h3>
                <p className="text-xs text-red-700 mt-0.5">{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 
