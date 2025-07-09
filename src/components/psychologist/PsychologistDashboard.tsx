import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getPsychologistAppointments } from '@/services/appointments';
import { Appointment } from '@/services/appointments';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface PsychologistStats {
  totalAppointments: number;
  pendingAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  todayAppointments: number;
  thisWeekAppointments: number;
}

export const PsychologistDashboard: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<PsychologistStats>({
    totalAppointments: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    todayAppointments: 0,
    thisWeekAppointments: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('appointments');
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showPendingAppointments, setShowPendingAppointments] = useState(false);

  useEffect(() => {
    loadDashboardData();
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
        thisWeekAppointments: appointmentsData.filter(a => new Date(a.date) >= thisWeek).length
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
    const matchesSearch = appointment.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  const handleStatusChange = async (appointmentId: number, newStatus: string) => {
    try {
      // Aquí implementarías la lógica para cambiar el estado de la cita
      console.log(`Cambiando estado de cita ${appointmentId} a ${newStatus}`);
      await loadDashboardData(); // Recargar datos
    } catch (err) {
      console.error('Error changing appointment status:', err);
      setError('Error al cambiar el estado de la cita');
    }
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
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard del Psicólogo</h1>
          <p className="text-gray-600 mt-1">Bienvenido, {user?.name}</p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
            Notificaciones
          </button>
          <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
            Configuración
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Citas</p>
              <p className="text-2xl font-bold">{stats.totalAppointments}</p>
              <p className="text-xs text-gray-500">{stats.thisWeekAppointments} esta semana</p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pendingAppointments}</p>
              <p className="text-xs text-gray-500">Requieren confirmación</p>
            </div>
            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completadas</p>
              <p className="text-2xl font-bold text-green-600">{stats.completedAppointments}</p>
              <p className="text-xs text-gray-500">Sesiones realizadas</p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Hoy</p>
              <p className="text-2xl font-bold text-blue-600">{stats.todayAppointments}</p>
              <p className="text-xs text-gray-500">Citas programadas</p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        <div className="flex space-x-2 border-b border-gray-200">
          {[
            { key: 'appointments', label: 'Mis Citas' },
            { key: 'pending', label: 'Citas Pendientes' },
            { key: 'schedule', label: 'Horarios' },
            { key: 'patients', label: 'Pacientes' },
            { key: 'profile', label: 'Perfil' }
          ].map(({ key, label }) => (
            <button
              key={key}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === key 
                  ? 'border-[#8e161a] text-[#8e161a]' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {activeTab === 'appointments' && (
          <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Mis Citas</h2>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Buscar citas..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8e161a] focus:border-transparent"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <button className="border border-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                    Filtros
                  </button>
                  <button className="border border-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                    Exportar
                  </button>
                </div>
              </div>
            </div>
            <div className="p-6">
              {/* Filter Tabs */}
              <div className="flex space-x-2 mb-6">
                {[
                  { key: 'all', label: 'Todas' },
                  { key: 'pending', label: 'Pendientes' },
                  { key: 'confirmed', label: 'Confirmadas' },
                  { key: 'completed', label: 'Completadas' },
                  { key: 'cancelled', label: 'Canceladas' }
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                      filter === key 
                        ? 'bg-[#8e161a] text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setFilter(key as any)}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Appointments List */}
              <div className="space-y-4">
                {filteredAppointments.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <p className="text-gray-600">No se encontraron citas</p>
                  </div>
                ) : (
                  filteredAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {appointment.user_email}
                              </h3>
                              <p className="text-sm text-gray-600">{appointment.user_email}</p>
                            </div>
                            <div className="text-sm text-gray-500">
                              <p>{format(new Date(appointment.date), 'EEEE, d MMMM yyyy', { locale: es })}</p>
                              <p>{appointment.time}</p>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-700">{appointment.reason}</p>
                              {appointment.notes && (
                                <p className="text-xs text-gray-500 mt-1">{appointment.notes}</p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(appointment.status)}
                          <div className="flex space-x-1">
                            <button
                              className="border border-gray-300 text-gray-700 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                              onClick={() => handleStatusChange(appointment.id, 'confirmed')}
                              disabled={appointment.status === 'confirmed' || appointment.status === 'completed'}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                            <button
                              className="border border-gray-300 text-gray-700 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                              onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                              disabled={appointment.status === 'cancelled'}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                            <button className="border border-gray-300 text-gray-700 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pending' && (
          <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Citas Pendientes de Aprobación</h2>
              <p className="text-gray-600 mb-4">Revisa y aprueba las citas solicitadas por los estudiantes.</p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span className="text-yellow-800 font-medium">
                    Tienes {stats.pendingAppointments} citas pendientes de aprobación
                  </span>
                </div>
              </div>
              <button 
                className="bg-[#8e161a] text-white px-4 py-2 rounded-lg hover:bg-[#7a1418] transition-colors"
                onClick={() => setShowPendingAppointments(true)}
              >
                Ver Citas Pendientes
              </button>
            </div>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Gestión de Horarios</h2>
              <p className="text-gray-600 mb-4">Aquí podrás gestionar tu disponibilidad y horarios de atención.</p>
              <button className="bg-[#8e161a] text-white px-4 py-2 rounded-lg hover:bg-[#7a1418] transition-colors">
                Configurar Horarios
              </button>
            </div>
          </div>
        )}

        {activeTab === 'patients' && (
          <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Mis Pacientes</h2>
              <p className="text-gray-600 mb-4">Lista de pacientes y su historial de sesiones.</p>
              <button className="bg-[#8e161a] text-white px-4 py-2 rounded-lg hover:bg-[#7a1418] transition-colors">
                Ver Pacientes
              </button>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Mi Perfil</h2>
              <p className="text-gray-600 mb-4">Gestiona tu información personal y profesional.</p>
              <button className="bg-[#8e161a] text-white px-4 py-2 rounded-lg hover:bg-[#7a1418] transition-colors">
                Editar Perfil
              </button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center space-x-2">
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span className="text-red-800 font-semibold">{error}</span>
        </div>
      )}

      {/* Modal de Citas Pendientes */}
      {showPendingAppointments && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Citas Pendientes de Aprobación</h3>
              <button
                onClick={() => setShowPendingAppointments(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ✕
              </button>
            </div>
            
            {/* Aquí se importaría el componente PendingAppointments */}
            <div className="text-center py-8">
              <p className="text-gray-600">Componente de citas pendientes</p>
              <p className="text-sm text-gray-500">Se integrará el componente PendingAppointments aquí</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 