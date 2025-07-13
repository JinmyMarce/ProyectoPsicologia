import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
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
import { PageHeader } from '../ui/PageHeader';

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
    <div className="space-y-6">
      <PageHeader 
        title="Historial de Citas"
        subtitle="Todas las citas que has tenido, incluyendo las reprogramadas"
      >
        <div className="flex items-center justify-between">
          <p className="text-base text-gray-500 font-medium text-center">
            Instituto Túpac Amaru - Psicología Clínica
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="ml-4"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </PageHeader>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-4 bg-gradient-to-r from-[#8e161a]/5 to-[#d3b7a0]/5 border border-[#8e161a]/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-[#8e161a] to-[#d3b7a0] rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{totalAppointments}</p>
              <p className="text-sm font-medium text-gray-600">Total de Citas</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-r from-[#8e161a]/5 to-[#d3b7a0]/5 border border-[#8e161a]/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-[#8e161a] to-[#d3b7a0] rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{completedAppointments}</p>
              <p className="text-sm font-medium text-gray-600">Citas Completadas</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-r from-[#8e161a]/5 to-[#d3b7a0]/5 border border-[#8e161a]/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-[#8e161a] to-[#d3b7a0] rounded-lg flex items-center justify-center">
              <ClockIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{rescheduledAppointments}</p>
              <p className="text-sm font-medium text-gray-600">Citas Reprogramadas</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="p-6">
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'Todas' },
            { key: 'completed', label: 'Completadas' },
            { key: 'cancelled', label: 'Canceladas' },
            { key: 'rescheduled', label: 'Reprogramadas' }
          ].map(({ key, label }) => (
            <Button
              key={key}
              variant={filter === key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(key as any)}
              className="text-sm"
            >
              {label}
            </Button>
          ))}
        </div>
      </Card>

      {/* Lista de citas */}
      {loading ? (
        <Card className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8e161a]"></div>
            <span className="ml-3 text-gray-600">Cargando historial...</span>
          </div>
        </Card>
      ) : error ? (
        <Card className="p-6">
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 font-semibold">{error}</p>
          </div>
        </Card>
      ) : filteredAppointments.length === 0 ? (
        <Card className="p-6">
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-semibold">No hay citas en el historial</p>
            <p className="text-gray-500 text-sm mt-2">Cuando tengas citas, aparecerán aquí</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => (
            <Card key={appointment.id} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Cita con {appointment.psychologist_name}
                  </h3>
                  <p className="text-sm text-gray-600">
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
                <div>
                  <p className="text-sm text-gray-600">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Hora: {appointment.time}
                  </p>
                  <p className="text-sm text-gray-600">
                    <User className="w-4 h-4 inline mr-1" />
                    Psicólogo: {appointment.psychologist_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Agendada: {new Date(appointment.created_at).toLocaleDateString('es-ES')}
                  </p>
                  {(appointment.rescheduled_from || appointment.rescheduled_to) && (
                    <p className="text-sm text-yellow-600">
                      <ClockIcon className="w-4 h-4 inline mr-1" />
                      Cita reprogramada
                    </p>
                  )}
                </div>
              </div>

              {appointment.reason && (
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <FileText className="w-4 h-4 mr-1" />
                    Motivo de Consulta
                  </h4>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {appointment.reason}
                  </p>
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewDetails(appointment)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Ver Detalles
                </Button>
              </div>
            </Card>
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
  );
} 