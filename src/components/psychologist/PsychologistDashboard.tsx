import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getPsychologistAppointments } from '@/services/appointments';
import { Appointment } from '@/services/appointments';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
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
  Users,
  MessageSquare,
  ClipboardList,
  Search,
  Filter,
  Bell
} from 'lucide-react';
import { PageHeader } from '../ui/PageHeader';

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
  const { user } = useAuth();
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
  const [activeTab, setActiveTab] = useState('appointments');
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showPendingAppointments, setShowPendingAppointments] = useState(false);
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

  const filteredAppointments = appointments.filter(appointment => {
    const matchesFilter = filter === 'all' || appointment.status === filter;
    const userEmail = appointment.user_email ? appointment.user_email.toLowerCase() : '';
    const reason = appointment.reason ? appointment.reason.toLowerCase() : '';
    const matchesSearch = userEmail.includes(searchTerm.toLowerCase()) ||
                         reason.includes(searchTerm.toLowerCase());
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
    <div className="space-y-6 font-serif" style={{fontFamily: 'Georgia, Times, serif'}}>
      {/* Título Principal */}
      <div className="text-center mb-6">
        <div className="inline-block px-20 py-4 bg-white border border-gray-200 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight mb-2">
            Panel del Psicólogo - Gestión de Pacientes
          </h1>
          <div className="w-28 h-1 bg-gradient-to-r from-gray-800 to-gray-600 mx-auto rounded-full"></div>
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-800">{stats.totalAppointments}</p>
              <p className="text-sm font-medium text-gray-600">Total Citas</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
              <ClockIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-700">{stats.pendingAppointments}</p>
              <p className="text-sm font-medium text-gray-600">Citas Pendientes</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-600">{stats.totalPatients}</p>
              <p className="text-sm font-medium text-gray-600">Pacientes</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-500 rounded-lg flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-500">{stats.totalSessions}</p>
              <p className="text-sm font-medium text-gray-600">Sesiones</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Acciones rápidas */}
      <Card className="p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <Plus className="w-6 h-6 mr-3 text-gray-800" />
          Acciones Rápidas
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button 
            className="bg-gray-800 hover:bg-gray-700 text-white p-4 text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
            onClick={() => handleNavigation('appointments/direct')}
          >
            <Calendar className="w-5 h-5 mr-2" />
            Agendar Cita Directamente
          </Button>

          <Button 
            variant="outline"
            className="p-4 text-sm font-semibold rounded-lg border border-gray-600 text-gray-600 hover:bg-gray-600 hover:text-white transition-all duration-300"
            onClick={() => handleNavigation('patients')}
          >
            <Users className="w-5 h-5 mr-2" />
            Ver Pacientes
          </Button>

          <Button 
            variant="outline"
            className="p-4 text-sm font-semibold rounded-lg border border-gray-500 text-gray-500 hover:bg-gray-500 hover:text-white transition-all duration-300"
            onClick={() => handleNavigation('sessions/register')}
          >
            <MessageSquare className="w-5 h-5 mr-2" />
            Registrar Sesión
          </Button>

          <Button 
            variant="outline"
            className="p-4 text-sm font-semibold rounded-lg border border-gray-700 text-gray-700 hover:bg-gray-700 hover:text-white transition-all duration-300"
            onClick={() => handleNavigation('schedule')}
          >
            <Settings className="w-5 h-5 mr-2" />
            Gestión de Horarios
          </Button>
        </div>
      </Card>

      {/* Secciones principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gestión de Citas */}
        <Card className="p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-gray-800" />
              Gestión de Citas
            </h3>
            <Badge variant="warning" className="text-sm">
              {stats.pendingAppointments} pendientes
            </Badge>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Bell className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">Solicitudes de Citas</p>
                  <p className="text-sm text-gray-600">Recibe notificaciones de estudiantes</p>
                </div>
              </div>
              <Button size="sm" onClick={() => handleNavigation('notifications')}>
                Ver Notificaciones
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-gray-900">Citas Pendientes</p>
                  <p className="text-sm text-gray-600">Aprobar o rechazar solicitudes</p>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => handleNavigation('appointments/history')}>
                Gestionar
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Plus className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-gray-900">Agendar Cita Directamente</p>
                  <p className="text-sm text-gray-600">Buscar por DNI o correo</p>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => handleNavigation('appointments/direct')}>
                Agendar
              </Button>
            </div>
          </div>
        </Card>

        {/* Gestión de Pacientes y Sesiones */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <Users className="w-5 h-5 mr-2 text-[#8e161a]" />
              Pacientes y Sesiones
            </h3>
            <Badge variant="info" className="text-sm">
              {stats.totalPatients} pacientes
            </Badge>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="font-medium text-gray-900">Registro de Pacientes</p>
                  <p className="text-sm text-gray-600">Lista completa con filtros</p>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => handleNavigation('patients')}>
                Ver Pacientes
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <MessageSquare className="w-5 h-5 text-indigo-600" />
                <div>
                  <p className="font-medium text-gray-900">Registro de Sesión</p>
                  <p className="text-sm text-gray-600">Buscar por DNI, datos automáticos</p>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => handleNavigation('sessions/register')}>
                Registrar
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 bg-teal-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <ClipboardList className="w-5 h-5 text-teal-600" />
                <div>
                  <p className="font-medium text-gray-900">Historial de Sesiones</p>
                  <p className="text-sm text-gray-600">Filtrar por estudiante</p>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => handleNavigation('sessions')}>
                Ver Historial
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Recordatorios y Alertas */}
      {stats.pendingAppointments > 0 && (
        <Card className="p-6 border-l-4 border-yellow-400 bg-yellow-50">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-6 h-6 text-yellow-600" />
            <div>
              <h3 className="font-semibold text-yellow-800">Recordatorio Importante</h3>
              <p className="text-yellow-700">
                Tienes {stats.pendingAppointments} citas pendientes de aprobación. 
                Revisa las solicitudes y toma una decisión.
              </p>
            </div>
            <Button size="sm" onClick={() => handleNavigation('notifications')}>
              Revisar Ahora
            </Button>
          </div>
        </Card>
      )}

      {error && (
        <Card className="p-6 border-l-4 border-red-400 bg-red-50">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="font-semibold text-red-800">Error</h3>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}; 