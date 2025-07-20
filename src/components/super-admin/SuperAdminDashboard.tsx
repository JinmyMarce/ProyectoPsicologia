import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getAppointments } from '@/services/appointments';
import { getUsers } from '@/services/users';
import { Appointment } from '@/services/appointments';
import { User } from '@/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { DebugPanel } from './DebugPanel';
import { PageHeader } from '../ui/PageHeader';

interface SuperAdminStats {
  totalUsers: number;
  totalAppointments: number;
  pendingAppointments: number;
  completedAppointments: number;
  activePsychologists: number;
  activeStudents: number;
  activeAdmins: number;
  systemHealth: string;
}

export const SuperAdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<SuperAdminStats>({
    totalUsers: 0,
    totalAppointments: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
    activePsychologists: 0,
    activeStudents: 0,
    activeAdmins: 0,
    systemHealth: 'healthy'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showWelcome, setShowWelcome] = useState(true);
  const [userStatsFilter, setUserStatsFilter] = useState<'all' | 'active' | 'inactive'>('all');

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
      const statsData: SuperAdminStats = {
        totalUsers: usersData.length,
        totalAppointments: appointmentsData.length,
        pendingAppointments: appointmentsData.filter(a => a.status === 'pending').length,
        completedAppointments: appointmentsData.filter(a => a.status === 'completed').length,
        activePsychologists: usersData.filter(u => u.role === 'psychologist' && u.active).length,
        activeStudents: usersData.filter(u => u.role === 'student' && u.active).length,
        activeAdmins: usersData.filter(u => u.role === 'admin' && u.active).length,
        systemHealth: 'healthy'
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
    const matchesSearch = (appointment.patient_full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (appointment.user_email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (appointment.psychologist_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (appointment.reason?.toLowerCase() || '').includes(searchTerm.toLowerCase());
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

  const getSystemHealthBadge = (health: string) => {
    const colors = {
      healthy: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      critical: 'bg-red-100 text-red-800'
    };

    const labels = {
      healthy: 'Saludable',
      warning: 'Advertencia',
      critical: 'Crítico'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[health as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {labels[health as keyof typeof labels] || health}
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
            Panel del Super Administrador
          </span>
        </div>
      </PageHeader>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
              <p className="text-2xl font-bold">{users.length}</p>
              <p className="text-xs text-gray-500">En el sistema</p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
          </div>
        </div>
        {/* Tarjeta de Psicólogos */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Psicólogo</p>
              <p className="text-2xl font-bold text-purple-600">{users.filter(u => u.role === 'psychologist' && u.active).length}</p>
              <ul className="text-xs text-gray-700 mt-1">
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
        {/* Tarjeta de Administradores */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Administrador</p>
              <p className="text-2xl font-bold text-orange-600">{users.filter(u => u.role === 'admin' && u.active).length}</p>
              <ul className="text-xs text-gray-700 mt-1">
                {users.filter(u => u.role === 'admin' && u.active).map((u) => (
                  <li key={u.id}>{u.name}</li>
                ))}
              </ul>
            </div>
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
        </div>
        {/* Tarjeta de Super Administrador */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Super Administrador</p>
              <p className="text-2xl font-bold text-red-700">{users.filter(u => u.role === 'super_admin' && u.active).length}</p>
              <ul className="text-xs text-gray-700 mt-1">
                {users.filter(u => u.role === 'super_admin' && u.active).map((u) => (
                  <li key={u.id}>{u.name}</li>
                ))}
              </ul>
            </div>
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      {/* Tabla profesional de usuarios psicólogo y administrador */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 mb-8 p-0 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-[#8e161a]">Usuarios: Psicólogo y Administrador</h2>
        </div>
        <div className="p-0 md:p-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-[#f7f3f1]">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-[#8e161a] uppercase tracking-wider">Nombre</th>
                <th className="px-4 py-3 text-left font-bold text-[#8e161a] uppercase tracking-wider">Correo</th>
                <th className="px-4 py-3 text-left font-bold text-[#8e161a] uppercase tracking-wider">Rol</th>
                <th className="px-4 py-3 text-left font-bold text-[#8e161a] uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {users.filter(u => (u.role === 'psychologist' || u.role === 'admin')).map((user) => (
                <tr key={user.id} className="hover:bg-[#f8e8e8] transition-colors">
                  <td className="px-4 py-2 font-semibold text-gray-900 whitespace-nowrap">{user.name}</td>
                  <td className="px-4 py-2 text-gray-700 whitespace-nowrap">{user.email}</td>
                  <td className="px-4 py-2 text-[#8e161a] font-bold whitespace-nowrap">{user.role === 'psychologist' ? 'Psicólogo' : 'Administrador'}</td>
                  <td className="px-4 py-2">
                    {user.active ? (
                      <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-800 font-bold shadow">Activo</span>
                    ) : (
                      <span className="inline-block px-3 py-1 rounded-full bg-gray-200 text-gray-600 font-bold shadow">Inactivo</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center space-x-2">
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span className="text-red-800 font-semibold">{error}</span>
        </div>
      )}
      {/* Bloque de estadísticas visuales de usuarios (admin, psicólogo, super admin) mejorado y alineado */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 mt-8 mb-8 p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
          {/* Estadísticas a la izquierda */}
          <div className="flex-1 min-w-[220px] mb-6 md:mb-0 flex flex-col gap-4">
            <h2 className="text-lg md:text-xl font-extrabold text-[#8e161a] tracking-wide mb-2 flex items-center">
              <svg className="w-7 h-7 text-[#8e161a] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-7V7a4 4 0 10-8 0v2m8 0a4 4 0 01-8 0" /></svg>
              Estadísticas de Usuarios
            </h2>
            <div className="mb-2 flex space-x-2">
              <button className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors ${userStatsFilter === 'all' ? 'bg-[#8e161a] text-white' : 'bg-gray-100 text-[#8e161a]'}`} onClick={() => setUserStatsFilter('all')}>Todos</button>
              <button className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors ${userStatsFilter === 'active' ? 'bg-green-700 text-white' : 'bg-gray-100 text-green-700'}`} onClick={() => setUserStatsFilter('active')}>Activos</button>
              <button className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors ${userStatsFilter === 'inactive' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-700'}`} onClick={() => setUserStatsFilter('inactive')}>Inactivos</button>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center bg-orange-50 rounded-lg px-4 py-2 shadow-sm">
                <span className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center mr-3"><svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" /></svg></span>
                <span className="font-bold text-orange-700">Admin:</span>
                <span className="ml-2 text-gray-700">{users.filter(u => u.role === 'admin' && (userStatsFilter === 'all' || (userStatsFilter === 'active' ? u.active : !u.active))).length} <span className='font-bold'>({users.filter(u => u.role === 'admin' && u.active && (userStatsFilter !== 'inactive')).length} activos{userStatsFilter === 'all' ? `, ${users.filter(u => u.role === 'admin' && !u.active).length} inactivos` : ''})</span></span>
              </div>
              <div className="flex items-center bg-purple-50 rounded-lg px-4 py-2 shadow-sm">
                <span className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center mr-3"><svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg></span>
                <span className="font-bold text-purple-700">Psicólogo:</span>
                <span className="ml-2 text-gray-700">{users.filter(u => u.role === 'psychologist' && (userStatsFilter === 'all' || (userStatsFilter === 'active' ? u.active : !u.active))).length} <span className='font-bold'>({users.filter(u => u.role === 'psychologist' && u.active && (userStatsFilter !== 'inactive')).length} activos{userStatsFilter === 'all' ? `, ${users.filter(u => u.role === 'psychologist' && !u.active).length} inactivos` : ''})</span></span>
              </div>
              <div className="flex items-center bg-red-50 rounded-lg px-4 py-2 shadow-sm">
                <span className="w-6 h-6 rounded-full bg-red-700 flex items-center justify-center mr-3"><svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg></span>
                <span className="font-bold text-red-700">Super Admin:</span>
                <span className="ml-2 text-gray-700">{users.filter(u => u.role === 'super_admin' && (userStatsFilter === 'all' || (userStatsFilter === 'active' ? u.active : !u.active))).length} <span className='font-bold'>({users.filter(u => u.role === 'super_admin' && u.active && (userStatsFilter !== 'inactive')).length} activos{userStatsFilter === 'all' ? `, ${users.filter(u => u.role === 'super_admin' && !u.active).length} inactivos` : ''})</span></span>
              </div>
            </div>
          </div>
          {/* Opciones y gráfica a la derecha */}
          <div className="flex-1 flex flex-col items-center">
            <div className="mb-4 flex space-x-2">
              <button className={`px-4 py-2 rounded-t-lg font-bold text-sm transition-colors ${activeTab === 'bar' ? 'bg-[#8e161a] text-white' : 'bg-gray-100 text-[#8e161a]'}`} onClick={() => setActiveTab('bar')}>Barras</button>
              <button className={`px-4 py-2 rounded-t-lg font-bold text-sm transition-colors ${activeTab === 'pie' ? 'bg-[#8e161a] text-white' : 'bg-gray-100 text-[#8e161a]'}`} onClick={() => setActiveTab('pie')}>Pastel</button>
            </div>
            {/* Gráfica de Barras */}
            {activeTab === 'bar' && (
              <div className="w-full flex flex-col md:flex-row md:items-end md:space-x-8 justify-center items-center py-8 px-2 md:px-8">
                {['admin', 'psychologist', 'super_admin'].map((role, idx) => {
                  const total = users.filter(u => u.role === role && (userStatsFilter === 'all' || (userStatsFilter === 'active' ? u.active : !u.active))).length;
                  const activos = users.filter(u => u.role === role && u.active && (userStatsFilter !== 'inactive')).length;
                  const color = role === 'admin' ? 'bg-orange-500' : role === 'psychologist' ? 'bg-purple-600' : 'bg-red-700';
                  return (
                    <div key={role} className="flex flex-col items-center mx-2">
                      <div className={`w-14 md:w-20 h-44 flex items-end bg-gray-100 rounded-b-lg`}>
                        <div className={`${color} rounded-t-lg w-full transition-all duration-500`} style={{height: `${total ? (activos/total)*100 : 0}%`, minHeight: '8px'}}></div>
                      </div>
                      <span className="mt-3 text-sm font-bold text-[#8e161a] capitalize">{role === 'admin' ? 'Admin' : role === 'psychologist' ? 'Psicólogo' : 'Super Admin'}</span>
                      <span className="text-xs text-gray-600">{activos} / {total} activos</span>
                    </div>
                  );
                })}
              </div>
            )}
            {/* Gráfica de Pastel */}
            {activeTab === 'pie' && (
              <div className="flex flex-col items-center py-8 px-2 md:px-8">
                {/* Pie chart SVG */}
                <svg width="180" height="180" viewBox="0 0 36 36" className="mx-auto">
                  {(() => {
                    const roles = ['admin', 'psychologist', 'super_admin'];
                    const colors = ['#fb923c', '#a21caf', '#b91c1c'];
                    const totals = roles.map(r => users.filter(u => u.role === r && (userStatsFilter === 'all' || (userStatsFilter === 'active' ? u.active : !u.active))).length);
                    const sum = totals.reduce((a, b) => a + b, 0);
                    let acc = 0;
                    return roles.map((role, i) => {
                      const val = totals[i];
                      const percent = sum ? val / sum : 0;
                      const dash = percent * 100;
                      const dasharray = `${dash} ${100-dash}`;
                      const rotate = acc * 3.6;
                      acc += percent * 100;
                      return (
                        <circle
                          key={role}
                          r="16"
                          cx="18"
                          cy="18"
                          fill="transparent"
                          stroke={colors[i]}
                          strokeWidth="6"
                          strokeDasharray={dasharray}
                          strokeDashoffset={25}
                          transform={`rotate(${rotate} 18 18)`}
                        />
                      );
                    });
                  })()}
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 