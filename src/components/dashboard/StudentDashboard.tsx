import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  Plus, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle, 
  Clock as ClockIcon, 
  RefreshCw,
  Settings,
  Edit,
  X,
  Info,
  Phone,
  Mail,
  MapPin,
  Download,
  Eye,
  Activity
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useAuth } from '../../contexts/AuthContext';
import { getUserAppointments, cancelAppointment } from '../../services/appointments';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../ui/PageHeader';

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
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showAppointmentDetails, setShowAppointmentDetails] = useState(false);
  const [cancellingAppointment, setCancellingAppointment] = useState<number | null>(null);
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    if (user?.email) {
      loadAppointments();
    }
  }, [user]);

  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getUserAppointments();
      setAppointments(data);
    } catch (error) {
      console.error('Error cargando citas:', error);
      setError('Error al cargar las citas. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAppointments();
    setRefreshing(false);
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

  const handleCancelAppointment = async (appointmentId: number) => {
    if (!confirm('¿Estás seguro de que quieres cancelar esta cita?')) {
      return;
    }

    try {
      setCancellingAppointment(appointmentId);
      await cancelAppointment(appointmentId);
      await loadAppointments(); // Recargar citas
      setError('');
    } catch (error) {
      console.error('Error cancelando cita:', error);
      setError('Error al cancelar la cita. Intenta de nuevo.');
    } finally {
      setCancellingAppointment(null);
    }
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'cancelled':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const upcomingAppointments = appointments
    .filter(apt => apt.status === 'confirmed' || apt.status === 'pending')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  const totalAppointments = appointments.length;
  const completedAppointments = appointments.filter(apt => apt.status === 'completed').length;
  const pendingAppointments = appointments.filter(apt => apt.status === 'pending').length;

  return (
    <div className="space-y-6 content-card" style={{fontFamily: 'Inter, system-ui, sans-serif'}}>
      {/* Título Principal */}
      <div className="text-center mb-6">
        <div className="inline-block px-20 py-4 content-card border border-gray-200 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight mb-2">
            Mi Espacio de Bienestar - Espacio del Estudiante
          </h1>
          <div className="w-28 h-1 bg-gradient-to-r from-gray-800 to-gray-600 mx-auto rounded-full"></div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4 content-card border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center shadow-lg">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{totalAppointments}</p>
              <p className="text-sm font-semibold text-gray-600">Total de Citas</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 content-card border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center shadow-lg">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-700">{completedAppointments}</p>
              <p className="text-sm font-semibold text-gray-600">Citas Completadas</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 content-card border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center shadow-lg">
              <ClockIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-600">{pendingAppointments}</p>
              <p className="text-sm font-semibold text-gray-600">Citas Pendientes</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Acciones rápidas */}
      <Card className="p-6 content-card border border-gray-200 shadow-md mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <Plus className="w-6 h-6 mr-3 text-gray-800" />
          Acciones Rápidas
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button 
            className="bg-gray-800 hover:bg-gray-700 text-white p-4 text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
            onClick={() => handleNavigation('appointments')}
          >
            <Calendar className="w-5 h-5 mr-2" />
            Agendar Cita
          </Button>

          <Button 
            variant="outline"
            className="p-4 text-sm font-semibold rounded-lg border-2 border-gray-600 text-gray-600 hover:bg-gray-600 hover:text-white transition-all duration-300 shadow-md hover:shadow-lg"
            onClick={() => handleNavigation('reschedule')}
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Reprogramar Cita
          </Button>

          <Button 
            variant="outline"
            className="p-4 text-sm font-semibold rounded-lg border-2 border-gray-500 text-gray-500 hover:bg-gray-500 hover:text-white transition-all duration-300 shadow-md hover:shadow-lg"
            onClick={() => handleNavigation('appointments/history')}
          >
            <FileText className="w-5 h-5 mr-2" />
            Historial
          </Button>

          <Button 
            variant="outline"
            className="p-4 text-sm font-semibold rounded-lg border-2 border-gray-700 text-gray-700 hover:bg-gray-700 hover:text-white transition-all duration-300 shadow-md hover:shadow-lg"
            onClick={() => handleNavigation('notifications')}
          >
            <AlertCircle className="w-5 h-5 mr-2" />
            Notificaciones
          </Button>
        </div>
      </Card>

      {/* Próximas citas */}
      <Card className="p-6 bg-gradient-to-br from-white to-indigo-50 border border-indigo-300 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[#1e1b4b] flex items-center">
            <Clock className="w-6 h-6 mr-3 text-[#1e1b4b]" />
            Próximas Citas
          </h2>
          {error && (
            <div className="text-red-600 text-sm flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {error}
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 border-4 border-[#1e1b4b]/30 border-t-[#1e1b4b] rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm font-medium text-gray-600">Cargando citas...</p>
          </div>
        ) : upcomingAppointments.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-600 mb-3">No tienes citas próximas</p>
            <Button 
              onClick={() => handleNavigation('appointments')}
              className="text-sm font-semibold"
            >
              <Plus className="w-4 h-4 mr-2" />
              Agendar Cita
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingAppointments.map((appointment) => (
                          <div 
              key={appointment.id}
              className="p-4 bg-gradient-to-r from-white to-blue-50 rounded-lg border-2 border-blue-300 hover:shadow-lg transition-all duration-300 transform hover:scale-102"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#1e1b4b] to-[#1a0a0a] rounded-lg flex items-center justify-center shadow-md">
                    <User className="w-4 h-4 text-white" />
                  </div>
                    <div>
                      <h3 className="text-base font-bold text-[#1e1b4b] mb-1">
                        Dr. {appointment.psychologist_name}
                      </h3>
                      <div className="flex items-center space-x-3 text-xs font-semibold text-gray-700">
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(appointment.date).toLocaleDateString('es-ES', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {appointment.time}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1 font-medium">
                        Motivo: {appointment.reason}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={getStatusColor(appointment.status)} className="text-xs px-2 py-1">
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(appointment.status)}
                        <span>{getStatusText(appointment.status)}</span>
                      </div>
                    </Badge>
                    <div className="flex space-x-1">
                      <Button 
                        variant="outline"
                        size="sm"
                        className="rounded-lg p-2"
                        onClick={() => handleViewAppointmentDetails(appointment)}
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
                        <Button 
                          variant="outline"
                          size="sm"
                          className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                          onClick={() => handleCancelAppointment(appointment.id)}
                          disabled={cancellingAppointment === appointment.id}
                          title="Cancelar cita"
                        >
                          {cancellingAppointment === appointment.id ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <X className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>



      {/* Modal de detalles de cita */}
      {showAppointmentDetails && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Detalles de la Cita</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAppointmentDetails(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-600">Psicólogo</p>
                <p className="text-base font-semibold text-gray-900">Dr. {selectedAppointment.psychologist_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Fecha</p>
                <p className="text-base font-semibold text-gray-900">
                  {new Date(selectedAppointment.date).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Hora</p>
                <p className="text-base font-semibold text-gray-900">{selectedAppointment.time}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Motivo</p>
                <p className="text-base text-gray-900">{selectedAppointment.reason}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Estado</p>
                <Badge variant={getStatusColor(selectedAppointment.status)} className="mt-1">
                  {getStatusText(selectedAppointment.status)}
                </Badge>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowAppointmentDetails(false)}
              >
                Cerrar
              </Button>
              {(selectedAppointment.status === 'pending' || selectedAppointment.status === 'confirmed') && (
                <Button
                  variant="outline"
                  className="text-red-600 hover:bg-red-50"
                  onClick={() => {
                    handleCancelAppointment(selectedAppointment.id);
                    setShowAppointmentDetails(false);
                  }}
                >
                  Cancelar Cita
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}