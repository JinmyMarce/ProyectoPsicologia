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

  const totalAppointments = appointments.length;
  const completedAppointments = appointments.filter(apt => apt.status === 'completed').length;
  const rescheduledAppointments = appointments.filter(apt => apt.rescheduled_from || apt.rescheduled_to).length;

  return (
    <div className="min-h-screen bg-gray-50 pb-8 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Título Principal - Con diseño del StudentDashboard */}
      <div className="bg-gradient-to-br from-slate-200 via-gray-100 to-blue-200 rounded-2xl shadow-xl relative overflow-hidden mx-4 mt-4 border border-slate-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8 relative z-10">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-2">Historial de Citas</h1>
            <div className="w-28 h-1 bg-gradient-to-r from-slate-600 to-blue-600 mx-auto rounded-full"></div>
          </div>
        </div>
        {/* Decorative backgrounds */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 via-violet-400/20 to-transparent rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-violet-400/10 to-transparent rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        {/* Estadísticas - Con colores del StudentDashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-white via-slate-50 to-slate-100/50 rounded-2xl shadow-lg hover:shadow-2xl p-4 border border-slate-200/50 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm border border-slate-200">
                <Calendar className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{totalAppointments}</p>
                <p className="text-sm font-semibold text-gray-600">Total de Citas</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white via-emerald-50/50 to-teal-50/30 rounded-2xl shadow-lg hover:shadow-2xl p-4 border border-emerald-200/50 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm border border-emerald-200">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{completedAppointments}</p>
                <p className="text-sm font-semibold text-gray-600">Citas Completadas</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white via-blue-50/50 to-violet-50/30 rounded-2xl shadow-lg hover:shadow-2xl p-4 border border-blue-200/50 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm border border-blue-200">
                <ClockIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{rescheduledAppointments}</p>
                <p className="text-sm font-semibold text-gray-600">Citas Reprogramadas</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Filtros con botón de actualizar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap gap-2 justify-center items-center mb-6">
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
              className="text-sm"
            >
              {label}
            </Button>
          ))}
          {/* Botón de actualizar junto a los filtros */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="text-sm ml-2"
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Lista de citas */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600 font-medium">Cargando historial...</span>
            </div>
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-red-200">
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 font-semibold">{error}</p>
            </div>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-semibold">No hay citas en el historial</p>
              <p className="text-gray-500 text-sm mt-2">Cuando tengas citas, aparecerán aquí</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => (
              <div key={appointment.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl p-6 border border-gray-200 transition-all duration-300 hover:-translate-y-1">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      Cita con {appointment.psychologist_name}
                    </h3>
                    <p className="text-sm text-gray-600 font-medium">
                      {new Date(appointment.date).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(appointment.status)}
                    <Badge variant={getStatusColor(appointment.status)}>
                      {getStatusText(appointment.status)}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <p className="text-sm text-gray-600 flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-blue-600" />
                      <span className="font-semibold">Hora:</span>
                      <span className="ml-1">{appointment.time}</span>
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <p className="text-sm text-gray-600 flex items-center">
                      <User className="w-4 h-4 mr-2 text-emerald-600" />
                      <span className="font-semibold">Psicólogo:</span>
                      <span className="ml-1">{appointment.psychologist_name}</span>
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <p className="text-sm text-gray-600 flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-violet-600" />
                      <span className="font-semibold">Agendada:</span>
                      <span className="ml-1">{new Date(appointment.created_at).toLocaleDateString('es-ES')}</span>
                    </p>
                  </div>
                  {(appointment.rescheduled_from || appointment.rescheduled_to) && (
                    <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                      <p className="text-sm text-yellow-700 flex items-center">
                        <ClockIcon className="w-4 h-4 mr-2" />
                        <span className="font-semibold">Cita reprogramada</span>
                      </p>
                    </div>
                  )}
                </div>

                {appointment.reason && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-blue-600" />
                      Motivo de Consulta
                    </h4>
                    <p className="text-sm text-gray-700 bg-blue-50 p-4 rounded-lg border border-blue-200">
                      {appointment.reason}
                    </p>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    onClick={() => handleViewDetails(appointment)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-lg hover:from-blue-700 hover:to-violet-700 transition-all duration-300 flex items-center shadow-md hover:shadow-lg font-medium"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Ver Detalles
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal de detalles */}
        {showDetails && selectedAppointment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Detalles de la Cita</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDetails(false)}
                >
                  ✕
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Información General</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Psicólogo</p>
                      <p className="font-medium">{selectedAppointment.psychologist_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Estado</p>
                      <Badge variant={getStatusColor(selectedAppointment.status)}>
                        {getStatusText(selectedAppointment.status)}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Fecha</p>
                      <p className="font-medium">
                        {new Date(selectedAppointment.date).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Hora</p>
                      <p className="font-medium">{selectedAppointment.time}</p>
                    </div>
                  </div>
                </div>

                {selectedAppointment.reason && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Motivo de Consulta</h4>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                      {selectedAppointment.reason}
                    </p>
                  </div>
                )}

                {selectedAppointment.notes && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Notas</h4>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                      {selectedAppointment.notes}
                    </p>
                  </div>
                )}

                {(selectedAppointment.rescheduled_from || selectedAppointment.rescheduled_to) && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Información de Reprogramación</h4>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-yellow-800 text-sm">
                        Esta cita fue reprogramada. Si necesitas más información, contacta al psicólogo.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 