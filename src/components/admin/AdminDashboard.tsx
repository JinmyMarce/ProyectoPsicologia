import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getAppointments } from '@/services/appointments';
import { getUsers } from '@/services/users';
import { Appointment } from '@/services/appointments';
import { User } from '@/types';
import { useNavigate } from 'react-router-dom';

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
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    loadDashboardData();
    const timer = setTimeout(() => setShowWelcome(false), 5000);
    return () => clearTimeout(timer);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#09090b]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8e161a] mx-auto"></div>
          <p className="mt-4 text-zinc-400">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  // Manejo especial de error 403 (sin permisos)
  if (error && error.includes('No tienes permisos')) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#09090b]">
        <div className="text-center p-6 bg-[#18181b]/50 backdrop-blur-sm rounded-xl shadow-lg border border-white/5">
          <div className="text-3xl font-bold text-red-500 mb-4">Acceso restringido</div>
          <p className="text-lg text-zinc-300">No tienes los permisos necesarios para ver este contenido.</p>
          <p className="text-sm text-zinc-500 mt-2">Por favor, contacta al administrador si crees que es un error.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] p-4 sm:p-6 space-y-6 font-sans selection:bg-red-500/30 selection:text-red-200">
      {/* Título Principal */}
      <div className="text-center mb-8 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-20 bg-red-900/10 blur-[60px] rounded-full pointer-events-none"></div>
        <div className="inline-block px-8 py-3 bg-[#18181b]/80 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl relative z-10">
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-1">
            Panel de Administración
          </h1>
          <div className="flex items-center justify-center gap-2 text-zinc-400 text-sm font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            Sistema de Bienestar
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total de usuarios activos */}
        <div className="bg-[#18181b]/50 backdrop-blur-sm p-5 rounded-xl shadow-lg border border-white/5 hover:bg-white/5 transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Usuarios Activos</p>
              <p className="text-3xl font-black text-white">{users.filter(u => u.active).length}</p>
            </div>
            <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* 2. Admins activos */}
        <div className="bg-[#18181b]/50 backdrop-blur-sm p-5 rounded-xl shadow-lg border border-white/5 hover:bg-white/5 transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Admins</p>
              <p className="text-3xl font-black text-white">{users.filter(u => u.role === 'admin' && u.active).length}</p>
              <div className="flex -space-x-2 mt-2 overflow-hidden">
                {users.filter(u => u.role === 'admin' && u.active).slice(0, 3).map((u) => (
                  <div key={u.id} className="inline-block h-6 w-6 rounded-full ring-2 ring-[#18181b] bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-white" title={u.name}>
                    {u.name.charAt(0)}
                  </div>
                ))}
              </div>
            </div>
            <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center border border-red-500/20 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
              </svg>
            </div>
          </div>
        </div>

        {/* 3. Psicólogos activos */}
        <div className="bg-[#18181b]/50 backdrop-blur-sm p-5 rounded-xl shadow-lg border border-white/5 hover:bg-white/5 transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Psicólogos</p>
              <p className="text-3xl font-black text-white">{users.filter(u => u.role === 'psychologist' && u.active).length}</p>
              <div className="flex -space-x-2 mt-2 overflow-hidden">
                {users.filter(u => u.role === 'psychologist' && u.active).slice(0, 3).map((u) => (
                  <div key={u.id} className="inline-block h-6 w-6 rounded-full ring-2 ring-[#18181b] bg-purple-900/50 flex items-center justify-center text-[10px] font-bold text-purple-200" title={u.name}>
                    {u.name.charAt(0)}
                  </div>
                ))}
              </div>
            </div>
            <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center border border-purple-500/20 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </div>

        {/* 4. Pacientes estudiantes */}
        <div className="bg-[#18181b]/50 backdrop-blur-sm p-5 rounded-xl shadow-lg border border-white/5 hover:bg-white/5 transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Estudiantes</p>
              <p className="text-3xl font-black text-white">{users.filter(u => u.role === 'student' && u.active).length}</p>
              <p className="text-[10px] text-zinc-500 font-medium mt-1">Registrados</p>
            </div>
            <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Panel 2: Últimos Usuarios Registrados */}
      <div className="bg-[#18181b]/50 backdrop-blur-sm rounded-xl shadow-lg border border-white/5 overflow-hidden mt-8">
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
          <h2 className="text-lg font-bold text-white tracking-tight">Últimos Usuarios</h2>
          <button
            className="bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white px-4 py-2 rounded-lg transition-all text-xs font-bold uppercase tracking-wider border border-white/5"
            onClick={() => navigate('/users')}
          >
            Ver Todos
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-500 uppercase bg-white/5 border-b border-white/5">
              <tr>
                <th className="px-6 py-3 font-bold">Nombre</th>
                <th className="px-6 py-3 font-bold">Rol</th>
                <th className="px-6 py-3 font-bold">Fecha Registro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users
                .filter(u => u.role === 'student' || u.role === 'psychologist')
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .slice(0, 5)
                .map((user) => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-medium text-zinc-300">{user.name}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider border ${user.role === 'psychologist'
                          ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                          : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                        }`}>
                        {user.role === 'psychologist' ? 'Psicólogo' : 'Estudiante'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-500 font-medium">
                      {new Date(user.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center space-x-3 text-red-400">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span className="font-medium text-sm">{error}</span>
        </div>
      )}
    </div>
  );
};