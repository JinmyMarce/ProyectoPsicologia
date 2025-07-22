import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getAppointments } from '@/services/appointments';
import { getUsers } from '@/services/users';
import { Appointment } from '@/services/appointments';
import { User } from '@/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { PageHeader } from '../ui/PageHeader';
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
  const [activeTab, setActiveTab] = useState('appointments');
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');
  const [searchTerm, setSearchTerm] = useState('');
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

  const filteredAppointments = appointments.filter(appointment => {
    const matchesFilter = filter === 'all' || appointment.status === filter;
    const matchesSearch = appointment.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.psychologist_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.reason.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };

    const labels = {
      pending: 'Pendiente',
      confirmed: 'Confirmada',
      completed: 'Completada',
      cancelled: 'Cancelada'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      student: 'bg-blue-100 text-blue-800',
      psychologist: 'bg-purple-100 text-purple-800',
      admin: 'bg-orange-100 text-orange-800',
      super_admin: 'bg-red-100 text-red-800'
    };

    const labels = {
      student: 'Estudiante',
      psychologist: 'Psicólogo',
      admin: 'Administrador',
      super_admin: 'Super Admin'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {labels[role as keyof typeof labels] || role}
      </span>
    );
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

  // Manejo especial de error 403 (sin permisos)
  if (error && error.includes('No tienes permisos')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-3xl font-bold text-red-700 mb-4">Acceso restringido</div>
          <div className="text-lg text-red-600 font-semibold">No tienes permisos para ver la información de usuarios. Solo puedes crear psicólogos.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-0 pt-1 space-y-6 font-serif" style={{fontFamily: 'Georgia, Times, serif'}}>
      {/* Header */}
      <PageHeader title={''}>
          {showWelcome && (
            <div className="mb-4 text-2xl font-semibold text-[#8e161a] text-center transition-opacity duration-1000" style={{fontFamily: 'Georgia, Times, serif', opacity: showWelcome ? 1 : 0}}>
              ¡Bienvenido, {user?.name || 'Usuario'}!
            </div>
          )}
        <div className="w-full flex flex-col items-center justify-center mt-1 mb-2">
          <span
            className="text-2xl font-extrabold text-white text-center px-6 py-2 rounded-xl shadow-lg"
            style={{
              fontFamily: 'Gasters, sans-serif',
              letterSpacing: '0.04em',
              background: 'linear-gradient(90deg, #8e161a 60%, #d3b7a0 100%)',
              boxShadow: '0 2px 12px 0 rgba(142,22,26,0.10)',
              border: '2px solid #8e161a',
              textShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}
          >
            Panel Bienestar (Tupac Amaru)
          </span>
        </div>
      </PageHeader>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 1. Total de usuarios activos (cualquier rol) */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Usuarios Activos</p>
              <p className="text-2xl font-bold">{users.filter(u => u.active).length}</p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* 2. Admins activos y nombre completo */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Admins Activos</p>
              <p className="text-2xl font-bold text-orange-600">{users.filter(u => u.role === 'admin' && u.active).length}</p>
              <ul className="text-xs text-gray-500 mt-1">
                {users.filter(u => u.role === 'admin' && u.active).map((u) => (
                  <li key={u.id}>{u.name}</li>
                ))}
              </ul>
            </div>
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
              </svg>
            </div>
          </div>
        </div>

        {/* 3. Psicólogos activos: nombre y número */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Psicólogos Activos</p>
              <p className="text-2xl font-bold text-purple-700">{users.filter(u => u.role === 'psychologist' && u.active).length}</p>
              <ul className="text-xs text-gray-500 mt-1">
                {users.filter(u => u.role === 'psychologist' && u.active).map((u) => (
                  <li key={u.id}>{u.name}</li>
                ))}
              </ul>
            </div>
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </div>

        {/* 4. Pacientes estudiantes activos */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Pacientes Estudiantes Activos</p>
              <p className="text-2xl font-semibold text-red-700">{users.filter(u => u.role === 'student' && u.active).length}</p>
              <p className="text-xs text-gray-400">En el sistema</p>
            </div>
            <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Panel 2: Últimos Usuarios Registrados */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 mt-8 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#8e161a]">Últimos Usuarios Registrados</h2>
            <button
            className="bg-[#8e161a] text-white px-4 py-2 rounded-lg hover:bg-[#7a1418] transition-colors text-sm font-semibold"
            onClick={() => navigate('/users')}
          >
            Ver Usuarios
            </button>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-2 text-left font-semibold text-gray-700">Nombre</th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700">Rol</th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700">Fecha Registro</th>
            </tr>
          </thead>
          <tbody>
            {users
              .filter(u => u.role === 'student' || u.role === 'psychologist')
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .slice(0, 5)
              .map((user) => (
                <tr key={user.id} className="border-b last:border-b-0">
                  <td className="px-4 py-2">{user.name}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${user.role === 'psychologist' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                      {user.role === 'psychologist' ? 'Psicólogo' : 'Estudiante'}
                          </span>
                  </td>
                  <td className="px-4 py-2">{new Date(user.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Elimino la sección de citas debajo de las cartas */}
      {/* Main Content */}
      {/* <div className="space-y-6"> ... citas ... </div> */}

      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center space-x-2">
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span className="text-red-800 font-semibold">{error}</span>
        </div>
      )}
    </div>
  );
}; 