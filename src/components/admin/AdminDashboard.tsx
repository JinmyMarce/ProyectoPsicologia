import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getAppointments } from '@/services/appointments';
import { getUsers } from '@/services/users';
import { Appointment } from '@/services/appointments';
import { User } from '@/types';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../ui/Badge';
import {
  Calendar,
  FileText,
  Users,
  Sparkles,
  BarChart3,
  Shield,
  UserCheck,
  Settings,
  TrendingUp,
  FileBarChart,
  UserPlus,
  ClipboardList,
  Bell,
  Download,
  Filter,
  Zap,
  RefreshCw
} from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  totalAppointments: number;
  pendingAppointments: number;
  completedAppointments: number;
  activePsychologists: number;
  activeStudents: number;
}

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalAppointments: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
    activePsychologists: 0,
    activeStudents: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('bar');
  const [userStatsFilter, setUserStatsFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar citas
      const appointmentsData = await getAppointments();
      setAppointments(appointmentsData);

      // Cargar usuarios
      const usersData = await getUsers();
      setUsers(usersData);

      // Calcular estadísticas
      const statsData: AdminStats = {
        totalUsers: usersData.length,
        totalAppointments: appointmentsData.length,
        pendingAppointments: appointmentsData.filter(a => a.status === 'pending').length,
        completedAppointments: appointmentsData.filter(a => a.status === 'completed').length,
        activePsychologists: usersData.filter(u => u.role === 'psychologist' && u.active).length,
        activeStudents: usersData.filter(u => u.role === 'student' && u.active).length
      };

      setStats(statsData);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Animation classes
  const fadeInUp = "animate-fade-in";
  const stagger1 = "delay-[100ms]";
  const stagger3 = "delay-[300ms]";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-violet-200 border-t-violet-600 rounded-full animate-spin mb-3 mx-auto"></div>
          <p className="text-xs font-semibold text-slate-500">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  // Manejo especial de error 403 (sin permisos)
  if (error && error.includes('No tienes permisos')) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-6 bg-white/50 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200">
          <div className="text-3xl font-bold text-red-500 mb-4">Acceso restringido</div>
          <p className="text-lg text-slate-700">No tienes los permisos necesarios para ver este contenido.</p>
          <p className="text-sm text-slate-500 mt-2">Por favor, contacta al administrador si crees que es un error.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans selection:bg-slate-100 selection:text-slate-900 w-full overflow-x-hidden">
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
      {/* Header Section - Compact & Professional */}
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
            <div className={`${fadeInUp} flex-1 min-w-0`}>
              <div className="flex items-center space-x-2 mb-2">
                <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-white/15 backdrop-blur-xl text-white text-[9px] sm:text-[10px] font-bold flex items-center tracking-wide uppercase shadow-lg border border-white/20 hover:bg-white/25 transition-all duration-300">
                  <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1 sm:mr-1.5 animate-pulse flex-shrink-0" />
                  <span className="hidden xs:inline">ADMINISTRADOR</span>
                  <span className="xs:hidden">ADMIN</span>
                </span>
              </div>
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-black tracking-tight text-white mb-1 sm:mb-1.5 leading-tight drop-shadow-lg">
                Panel de Administrador
              </h1>
              <p className="text-blue-100 text-[10px] sm:text-[11px] md:text-xs lg:text-sm max-w-2xl font-medium leading-relaxed drop-shadow-md">
                Gestión de usuarios y citas del sistema.
                <span className="hidden sm:inline text-blue-200/80"> Control y supervisión de actividades.</span>
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto">
              <div className={`${fadeInUp} ${stagger1} w-full md:w-auto`}>
                <div className="bg-white/15 backdrop-blur-xl rounded-lg sm:rounded-xl p-2 sm:p-3 border border-white/20 shadow-xl hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] transition-all duration-500 group cursor-default relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="flex items-center gap-2 sm:gap-3 relative z-10">
                    <div className="bg-white/90 p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-slate-700 shadow-lg group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300 flex-shrink-0">
                      <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[8px] sm:text-[9px] font-bold text-white/70 uppercase tracking-wider truncate">
                        {currentTime.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </p>
                      <p className="text-sm sm:text-base md:text-lg font-black text-white tabular-nums leading-none mt-0.5 drop-shadow-lg">
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

      <div className="w-full -mt-4 relative z-20">

        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 ${fadeInUp} ${stagger1}`}>
          {/* Total Usuarios - Neutral */}
          <div className="group relative bg-white rounded-lg sm:rounded-xl shadow-md hover:shadow-lg p-3 sm:p-4 border border-slate-200 hover:border-slate-300 overflow-hidden hover:-translate-y-0.5 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-slate-100/50 to-transparent rounded-full -mr-8 -mt-8 blur-2xl group-hover:from-slate-200/60 transition-all duration-500"></div>

            <div className="flex items-center justify-between mb-2 relative z-10">
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-lg flex items-center justify-center text-indigo-700 shadow-sm group-hover:scale-110 group-hover:bg-indigo-300 transition-all duration-300">
                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <span className="text-[8px] sm:text-[9px] font-bold text-slate-600 bg-slate-100 px-1.5 sm:px-2 py-0.5 rounded-full uppercase tracking-wider">Total</span>
            </div>

            <div className="flex items-baseline gap-1 sm:gap-1.5 relative z-10">
              <p className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">{stats.totalUsers}</p>
              <p className="text-[10px] sm:text-xs md:text-sm font-bold text-slate-600">Usuarios</p>
            </div>
            <p className="text-[8px] sm:text-[9px] md:text-[10px] font-semibold text-slate-500 mt-0.5 relative z-10">En el sistema</p>
          </div>

          {/* Psicólogos - Subtle Purple */}
          <div className="group relative bg-white rounded-lg sm:rounded-xl shadow-md hover:shadow-lg p-3 sm:p-4 border border-slate-200 hover:border-slate-300 overflow-hidden hover:-translate-y-0.5 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-50/50 to-transparent rounded-full -mr-8 -mt-8 blur-2xl group-hover:from-purple-100/60 transition-all duration-500"></div>

            <div className="flex items-center justify-between mb-2 relative z-10">
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center text-purple-700 shadow-sm group-hover:scale-110 group-hover:bg-purple-300 transition-all duration-300">
                <UserCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <span className="text-[8px] sm:text-[9px] font-bold text-purple-700 bg-purple-50 px-1.5 sm:px-2 py-0.5 rounded-full uppercase tracking-wider">Activos</span>
            </div>

            <div className="flex items-baseline gap-1 sm:gap-1.5 relative z-10">
              <p className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">{stats.activePsychologists}</p>
              <p className="text-[10px] sm:text-xs md:text-sm font-bold text-slate-600">Psicólogos</p>
            </div>
            <p className="text-[8px] sm:text-[9px] md:text-[10px] font-semibold text-slate-500 mt-0.5 relative z-10">Profesionales</p>
          </div>

          {/* Estudiantes - Subtle Blue */}
          <div className="group relative bg-white rounded-lg sm:rounded-xl shadow-md hover:shadow-lg p-3 sm:p-4 border border-slate-200 hover:border-slate-300 overflow-hidden hover:-translate-y-0.5 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-50/50 to-transparent rounded-full -mr-8 -mt-8 blur-2xl group-hover:from-blue-100/60 transition-all duration-500"></div>

            <div className="flex items-center justify-between mb-2 relative z-10">
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center text-blue-700 shadow-sm group-hover:scale-110 group-hover:bg-blue-300 transition-all duration-300">
                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <span className="text-[8px] sm:text-[9px] font-bold text-blue-700 bg-blue-50 px-1.5 sm:px-2 py-0.5 rounded-full uppercase tracking-wider">Activos</span>
            </div>

            <div className="flex items-baseline gap-1 sm:gap-1.5 relative z-10">
              <p className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">{stats.activeStudents}</p>
              <p className="text-[10px] sm:text-xs md:text-sm font-bold text-slate-600">Estudiantes</p>
            </div>
            <p className="text-[8px] sm:text-[9px] md:text-[10px] font-semibold text-slate-500 mt-0.5 relative z-10">Registrados</p>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {/* Widget de Estadísticas Rápidas */}
          <section className="w-full">
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200 p-3 sm:p-4">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h2 className="text-xs sm:text-sm md:text-base font-bold text-slate-800 flex items-center tracking-tight">
                  <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 mr-2 text-slate-600 flex-shrink-0" />
                  <span className="hidden sm:inline">Resumen Rápido</span>
                  <span className="sm:hidden">Resumen</span>
                </h2>
                <button
                  onClick={loadDashboardData}
                  className="text-slate-600 hover:text-slate-900 transition-colors p-1 hover:bg-slate-100 rounded-lg"
                  title="Actualizar datos"
                >
                  <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-2 sm:p-3 border border-blue-200 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/reports')}>
                  <div className="text-[8px] sm:text-[9px] font-semibold text-blue-700 uppercase tracking-wide mb-1">Citas Totales</div>
                  <div className="text-lg sm:text-xl md:text-2xl font-black text-blue-900">{stats.totalAppointments}</div>
                  <div className="text-[8px] sm:text-[9px] text-blue-600 mt-1">
                    {stats.completedAppointments} completadas
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-2 sm:p-3 border border-green-200 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/reports')}>
                  <div className="text-[8px] sm:text-[9px] font-semibold text-green-700 uppercase tracking-wide mb-1">Citas Pendientes</div>
                  <div className="text-lg sm:text-xl md:text-2xl font-black text-green-900">{stats.pendingAppointments}</div>
                  <div className="text-[8px] sm:text-[9px] text-green-600 mt-1">
                    Requieren atención
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-2 sm:p-3 border border-purple-200 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/users')}>
                  <div className="text-[8px] sm:text-[9px] font-semibold text-purple-700 uppercase tracking-wide mb-1">Psicólogos</div>
                  <div className="text-lg sm:text-xl md:text-2xl font-black text-purple-900">{stats.activePsychologists}</div>
                  <div className="text-[8px] sm:text-[9px] text-purple-600 mt-1">
                    Activos en el sistema
                  </div>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-2 sm:p-3 border border-orange-200 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/users')}>
                  <div className="text-[8px] sm:text-[9px] font-semibold text-orange-700 uppercase tracking-wide mb-1">Estudiantes</div>
                  <div className="text-lg sm:text-xl md:text-2xl font-black text-orange-900">{stats.activeStudents}</div>
                  <div className="text-[8px] sm:text-[9px] text-orange-600 mt-1">
                    Registrados activos
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Tabla de usuarios - Full Width */}
          <section className="w-full flex flex-col">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 mb-3 sm:mb-4">
              <h2 className="text-xs sm:text-sm md:text-base font-bold text-slate-800 flex items-center tracking-tight">
                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 mr-2 text-slate-600 flex-shrink-0" />
                <span className="hidden sm:inline">Últimos Usuarios Registrados</span>
                <span className="sm:hidden">Últimos Usuarios</span>
              </h2>
              <div className="flex items-center gap-2">
                <button
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 sm:px-3 py-1.5 rounded-md transition-all duration-200 flex items-center gap-1.5 font-medium text-xs sm:text-sm"
                  onClick={() => navigate('/users')}
                  title="Crear nuevo usuario"
                >
                  <UserPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Nuevo</span>
                </button>
                <button
                  className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-800 hover:text-slate-900 px-2.5 sm:px-3 py-1.5 rounded-md transition-all duration-200 flex items-center gap-1.5 font-medium text-xs sm:text-sm"
                  onClick={() => navigate('/users')}
                >
                  Ver Todos
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-3 sm:p-4 border-b border-slate-200 bg-slate-50/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <h2 className="font-bold text-slate-800 flex items-center text-xs sm:text-sm tracking-tight">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-slate-600 flex-shrink-0" />
                  <span className="hidden xs:inline">Lista de Usuarios</span>
                  <span className="xs:hidden">Usuarios</span>
                </h2>
              </div>
              
              {/* Vista móvil: Cards */}
              <div className="block md:hidden p-2.5 sm:p-3 space-y-2.5 sm:space-y-3">
                {users.filter(u => u.role === 'student' || u.role === 'psychologist').length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Users className="w-10 h-10 text-slate-300 mb-2" />
                    <p className="text-sm font-semibold text-slate-500">No hay usuarios registrados</p>
                    <p className="text-xs text-slate-400 mt-1">Los usuarios aparecerán aquí cuando se registren</p>
                  </div>
                ) : (
                  users
                    .filter(u => u.role === 'student' || u.role === 'psychologist')
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .slice(0, 5)
                    .map((user) => (
                    <div key={user.id} className="bg-white border border-slate-200 rounded-lg p-2.5 sm:p-3 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900 text-xs sm:text-sm truncate">{user.name}</h3>
                          <p className="text-[10px] sm:text-xs text-slate-500 truncate mt-0.5">{user.email}</p>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap flex-shrink-0">
                          <Badge variant={user.role === 'psychologist' ? 'info' : 'default'} className="text-[8px] sm:text-[9px] px-1.5 sm:px-2 py-0.5 uppercase tracking-wider font-bold shadow-sm rounded-md whitespace-nowrap">
                            {user.role === 'psychologist' ? 'Psicólogo' : 'Estudiante'}
                          </Badge>
                          {user.active ? (
                            <Badge variant="success" className="text-[8px] sm:text-[9px] px-1.5 sm:px-2 py-0.5 uppercase tracking-wider font-bold shadow-sm rounded-md whitespace-nowrap">
                              Activo
                            </Badge>
                          ) : (
                            <Badge variant="default" className="text-[8px] sm:text-[9px] px-1.5 sm:px-2 py-0.5 uppercase tracking-wider font-bold shadow-sm rounded-md whitespace-nowrap">
                              Inactivo
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-[9px] sm:text-[10px] text-slate-400 mt-1">
                        {new Date(user.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Vista desktop: Tabla */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold text-slate-700 uppercase tracking-wider text-[10px] sm:text-xs">Nombre</th>
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold text-slate-700 uppercase tracking-wider text-[10px] sm:text-xs hidden lg:table-cell">Correo</th>
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold text-slate-700 uppercase tracking-wider text-[10px] sm:text-xs">Rol</th>
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold text-slate-700 uppercase tracking-wider text-[10px] sm:text-xs hidden xl:table-cell">Fecha Registro</th>
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold text-slate-700 uppercase tracking-wider text-[10px] sm:text-xs">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-50">
                    {users.filter(u => u.role === 'student' || u.role === 'psychologist').length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <Users className="w-10 h-10 text-slate-300 mb-2" />
                            <p className="text-sm font-semibold text-slate-500">No hay usuarios registrados</p>
                            <p className="text-xs text-slate-400 mt-1">Los usuarios aparecerán aquí cuando se registren</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      users
                        .filter(u => u.role === 'student' || u.role === 'psychologist')
                        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                        .slice(0, 5)
                        .map((user) => (
                        <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-3 sm:px-4 py-2 sm:py-3">
                            <div className="flex flex-col">
                              <span className="font-semibold text-slate-900 text-xs sm:text-sm">{user.name}</span>
                              <span className="text-slate-500 text-[10px] sm:text-xs font-medium lg:hidden mt-0.5">{user.email}</span>
                            </div>
                          </td>
                          <td className="px-3 sm:px-4 py-2 sm:py-3 hidden lg:table-cell">
                            <span className="text-slate-600 text-xs font-medium break-all">{user.email}</span>
                          </td>
                          <td className="px-3 sm:px-4 py-2 sm:py-3">
                            <Badge variant={user.role === 'psychologist' ? 'info' : 'default'} className="text-[9px] sm:text-[10px] px-2 sm:px-2.5 py-0.5 uppercase tracking-wider font-bold shadow-sm rounded-md">
                              {user.role === 'psychologist' ? 'Psicólogo' : 'Estudiante'}
                            </Badge>
                          </td>
                          <td className="px-3 sm:px-4 py-2 sm:py-3 hidden xl:table-cell">
                            <span className="text-slate-600 text-[10px] sm:text-xs font-medium">
                              {new Date(user.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </td>
                          <td className="px-3 sm:px-4 py-2 sm:py-3">
                            {user.active ? (
                              <Badge variant="success" className="text-[9px] sm:text-[10px] px-2 sm:px-2.5 py-0.5 uppercase tracking-wider font-bold shadow-sm rounded-md">
                                Activo
                              </Badge>
                            ) : (
                              <Badge variant="default" className="text-[9px] sm:text-[10px] px-2 sm:px-2.5 py-0.5 uppercase tracking-wider font-bold shadow-sm rounded-md">
                                Inactivo
                              </Badge>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Estadísticas Visuales - Full Width */}
          <div className={`w-full ${fadeInUp} ${stagger3}`}>
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200 overflow-hidden" style={{ backgroundColor: '#ffffff' }}>
              {/* Header Profesional */}
              <div className="p-3 sm:p-4 border-b border-slate-200 bg-slate-50/80">
                <h2 className="font-bold text-slate-800 flex items-center text-sm sm:text-base tracking-tight">
                  <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-slate-600" />
                  Estadísticas
                </h2>
              </div>

              <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                {/* Filtros Profesionales */}
                <div className="flex gap-1 sm:gap-1.5">
                  <button 
                    className={`flex-1 px-2 sm:px-2.5 py-1.5 rounded-lg font-semibold text-[9px] sm:text-[10px] transition-all ${userStatsFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`} 
                    onClick={() => setUserStatsFilter('all')}
                  >
                    Todos
                  </button>
                  <button 
                    className={`flex-1 px-2 sm:px-2.5 py-1.5 rounded-lg font-semibold text-[9px] sm:text-[10px] transition-all ${userStatsFilter === 'active' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`} 
                    onClick={() => setUserStatsFilter('active')}
                  >
                    Activos
                  </button>
                  <button 
                    className={`flex-1 px-2 sm:px-2.5 py-1.5 rounded-lg font-semibold text-[9px] sm:text-[10px] transition-all ${userStatsFilter === 'inactive' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`} 
                    onClick={() => setUserStatsFilter('inactive')}
                  >
                    Inactivos
                  </button>
                </div>

                {/* Grid: Estadísticas a la izquierda, Gráficas a la derecha */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {/* Estadísticas Profesionales - Lado Izquierdo */}
                  <div className="space-y-2 sm:space-y-2.5">
                    {[
                      { role: 'psychologist', label: 'Psicólogo', icon: UserCheck, bg: 'bg-purple-50', border: 'border-purple-200', iconBg: 'bg-purple-100', iconColor: 'text-purple-600', textColor: 'text-purple-700' },
                      { role: 'student', label: 'Estudiante', icon: Users, bg: 'bg-blue-50', border: 'border-blue-200', iconBg: 'bg-blue-100', iconColor: 'text-blue-600', textColor: 'text-blue-700' }
                    ].map(({ role, label, icon: Icon, bg, border, iconBg, iconColor, textColor }) => {
                      const total = users.filter(u => u.role === role && (userStatsFilter === 'all' || (userStatsFilter === 'active' ? u.active : !u.active))).length;
                      const activos = users.filter(u => u.role === role && u.active && (userStatsFilter !== 'inactive')).length;
                      const inactivos = users.filter(u => u.role === role && !u.active).length;
                      return (
                        <div key={role} className={`group relative ${bg} p-2 sm:p-2.5 rounded-lg border ${border} shadow-sm hover:shadow-md transition-all duration-200`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center flex-1 min-w-0">
                              <div className={`w-6 h-6 sm:w-7 sm:h-7 ${iconBg} rounded-lg flex items-center justify-center mr-2 sm:mr-2.5 flex-shrink-0`}>
                                <Icon className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${iconColor}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-[9px] sm:text-[10px] font-bold ${textColor} uppercase tracking-wider truncate`}>{label}</p>
                                <div className="flex flex-col xs:flex-row items-start xs:items-baseline gap-0.5 xs:gap-1 sm:gap-1.5 mt-0.5">
                                  <p className="text-sm sm:text-base font-black text-slate-900 leading-none">{total}</p>
                                  <span className="text-[8px] sm:text-[9px] font-medium text-slate-600">
                                    ({activos} activos{userStatsFilter === 'all' && inactivos > 0 ? `, ${inactivos} inactivos` : ''})
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Gráficas - Lado Derecho */}
                  <div className="space-y-3">
                    {/* Tabs Profesionales */}
                    <div className="flex gap-1 sm:gap-1.5 bg-slate-100 p-0.5 sm:p-1 rounded-lg">
                      <button 
                        className={`flex-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md font-semibold text-[9px] sm:text-[10px] transition-all ${activeTab === 'bar' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`} 
                        onClick={() => setActiveTab('bar')}
                      >
                        Barras
                      </button>
                      <button 
                        className={`flex-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md font-semibold text-[9px] sm:text-[10px] transition-all ${activeTab === 'pie' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`} 
                        onClick={() => setActiveTab('pie')}
                      >
                        Pastel
                      </button>
                    </div>

                    {/* Gráfica de Barras Profesional */}
                    {activeTab === 'bar' && (
                      <div className="w-full bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-lg p-2 sm:p-3 md:p-4 border border-slate-200 overflow-x-auto">
                        {(() => {
                          // Calcular valores para psicólogos y estudiantes
                          const values = ['psychologist', 'student'].map(role => {
                            const totalReal = users.filter(u => u.role === role).length;
                            const activos = users.filter(u => u.role === role && u.active && (userStatsFilter !== 'inactive')).length;
                            const totalFiltrado = users.filter(u => u.role === role && (userStatsFilter === 'all' || (userStatsFilter === 'active' ? u.active : !u.active))).length;
                            return { role, value: totalReal, activos, total: totalFiltrado };
                          });
                          
                          const maxValue = Math.max(...values.map(v => v.value), 1);
                          
                          return (
                            <div className="flex items-end justify-between gap-1.5 sm:gap-2 md:gap-3 h-24 sm:h-28 md:h-32 lg:h-40 relative min-w-[200px]">
                              {/* Eje Y con valores numéricos */}
                              <div className="absolute inset-0 flex flex-col justify-between pb-5 sm:pb-6 md:pb-8 lg:pb-10 pr-1 sm:pr-1.5 md:pr-2">
                                {[maxValue, Math.ceil(maxValue * 0.75), Math.ceil(maxValue * 0.5), Math.ceil(maxValue * 0.25), 0].map((val) => (
                                  <div key={val} className="flex items-center w-full">
                                    <span className="text-[7px] sm:text-[8px] font-medium text-slate-400 mr-1 sm:mr-2 w-4 sm:w-6 md:w-8 text-right">{val}</span>
                                    <div className="flex-1 border-t border-slate-200/60"></div>
                                  </div>
                                ))}
                              </div>
                              
                              {/* Barras */}
                              {values.map(({ role, value, activos, total }) => {
                                const heightPercentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
                                const totalTodos = values.reduce((sum, v) => sum + v.value, 0);
                                const porcentaje = totalTodos > 0 ? (value / totalTodos) * 100 : 0;
                                
                                const gradients = {
                                  psychologist: 'from-purple-500 via-purple-600 to-purple-700',
                                  student: 'from-blue-500 via-blue-600 to-blue-700'
                                };
                                
                                const labels = {
                                  psychologist: 'Psicólogo',
                                  student: 'Estudiante'
                                };
                                
                                return (
                                  <div key={role} className="flex flex-col items-center flex-1 relative z-10 group min-w-[60px] sm:min-w-[70px] md:min-w-[80px]">
                                    <div className="w-full flex flex-col items-center h-full justify-end pb-5 sm:pb-6 md:pb-8 lg:pb-10">
                                      {/* Barra con gradiente y sombra */}
                                      <div className="w-full max-w-[40px] sm:max-w-[50px] md:max-w-[60px] relative" style={{ height: '100%' }}>
                                        <div 
                                          className={`w-full bg-gradient-to-t ${gradients[role as keyof typeof gradients]} rounded-t-lg shadow-lg group-hover:shadow-xl transition-all duration-500 relative overflow-hidden`}
                                          style={{ 
                                            height: `${heightPercentage}%`,
                                            minHeight: value > 0 ? '4px' : '0px'
                                          }}
                                        >
                                          {/* Efecto de brillo */}
                                          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-white/40 rounded-t-lg"></div>
                                          
                                          {/* Valor y porcentaje en la parte superior de la barra */}
                                          {value > 0 && heightPercentage > 20 && (
                                            <div className="absolute -top-3 sm:-top-4 md:-top-5 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                                              <span className="text-[7px] sm:text-[8px] md:text-[9px] font-bold text-slate-700 bg-white px-1 sm:px-1.5 py-0.5 rounded shadow-sm border border-slate-200">
                                                {value} <span className="hidden md:inline">({porcentaje.toFixed(1)}%)</span>
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      
                                      {/* Etiqueta del rol */}
                                      <div className="mt-1 sm:mt-1.5 md:mt-2 text-center w-full">
                                        <p className="text-[7px] sm:text-[8px] md:text-[9px] font-bold text-slate-700 uppercase tracking-wider break-words">
                                          {labels[role as keyof typeof labels]}
                                        </p>
                                        <p className="text-[6px] sm:text-[7px] md:text-[8px] text-slate-500 mt-0.5 font-medium">
                                          {activos}/{total}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {/* Gráfica de Pastel Profesional */}
                    {activeTab === 'pie' && (
                      <div className="flex flex-col lg:flex-row items-center lg:items-start gap-2 sm:gap-3 md:gap-4 py-2 sm:py-3 md:py-4 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-lg p-2 sm:p-3 md:p-4 border border-slate-200">
                        {/* Gráfica de Pastel */}
                        <div className="relative w-[80px] h-[80px] sm:w-[90px] sm:h-[90px] md:w-[110px] md:h-[110px] lg:w-[120px] lg:h-[120px] flex-shrink-0">
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 42 42" preserveAspectRatio="xMidYMid meet">
                            {(() => {
                              const roles = ['psychologist', 'student'];
                              const colors = ['#a21caf', '#3b82f6'];
                              const totals = roles.map(r => users.filter(u => u.role === r && (userStatsFilter === 'all' || (userStatsFilter === 'active' ? u.active : !u.active))).length);
                              const sum = totals.reduce((a, b) => a + b, 0);
                              
                              if (sum === 0) {
                                return (
                                  <circle
                                    cx="21"
                                    cy="21"
                                    r="15"
                                    fill="none"
                                    stroke="#e2e8f0"
                                    strokeWidth="6"
                                  />
                                );
                              }
                              
                              let currentAngle = 0;
                              return roles.map((role, i) => {
                                const val = totals[i];
                                if (val === 0) return null;
                                
                                const percent = val / sum;
                                const angle = percent * 360;
                                
                                const startAngle = currentAngle;
                                currentAngle += angle;
                                
                                const x1 = 21 + 15 * Math.cos((startAngle * Math.PI) / 180);
                                const y1 = 21 + 15 * Math.sin((startAngle * Math.PI) / 180);
                                const x2 = 21 + 15 * Math.cos((currentAngle * Math.PI) / 180);
                                const y2 = 21 + 15 * Math.sin((currentAngle * Math.PI) / 180);
                                
                                const largeArc = angle > 180 ? 1 : 0;
                                
                                return (
                                  <path
                                    key={role}
                                    d={`M 21 21 L ${x1} ${y1} A 15 15 0 ${largeArc} 1 ${x2} ${y2} Z`}
                                    fill={colors[i]}
                                  />
                                );
                              }).filter(Boolean);
                            })()}
                            {/* Círculo central blanco */}
                            <circle
                              cx="21"
                              cy="21"
                              r="9"
                              fill="white"
                            />
                          </svg>
                          {/* Contenido central */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                              <p className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-slate-900 leading-none">
                                {users.filter(u => (userStatsFilter === 'all' || (userStatsFilter === 'active' ? u.active : !u.active)) && ['psychologist', 'student'].includes(u.role)).length}
                              </p>
                              <p className="text-[7px] sm:text-[8px] md:text-[9px] lg:text-[10px] text-slate-600 font-medium uppercase tracking-wider mt-0.5">Total</p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Leyenda al Costado */}
                        <div className="flex-1 w-full lg:w-auto space-y-1.5 sm:space-y-2">
                          {['psychologist', 'student'].map((role, i) => {
                            const colors = ['#a21caf', '#3b82f6'];
                            const labels = ['Psicólogo', 'Estudiante'];
                            const totals = users.filter(u => u.role === role && (userStatsFilter === 'all' || (userStatsFilter === 'active' ? u.active : !u.active))).length;
                            const allUsers = users.filter(u => (userStatsFilter === 'all' || (userStatsFilter === 'active' ? u.active : !u.active)) && ['psychologist', 'student'].includes(u.role)).length;
                            const percentage = allUsers > 0 ? ((totals / allUsers) * 100).toFixed(0) : 0;
                            
                            return (
                              <div key={role} className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-1.5 xs:gap-2 bg-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-2 sm:gap-2.5">
                                  <div 
                                    className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full shadow-sm flex-shrink-0" 
                                    style={{ backgroundColor: colors[i] }}
                                  ></div>
                                  <span className="text-[8px] sm:text-[9px] md:text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                                    {labels[i]}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                  <span className="text-[8px] sm:text-[9px] md:text-[10px] font-black text-slate-900">{totals}</span>
                                  <span className="text-[7px] sm:text-[8px] md:text-[9px] font-medium text-slate-500 bg-slate-100 px-1 sm:px-1.5 py-0.5 rounded">
                                    {percentage}%
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center space-x-2 mt-4">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-red-800 font-semibold">{error}</span>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};
