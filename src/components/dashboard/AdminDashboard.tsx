import React, { useState, useEffect } from 'react';
import { getAppointments, getPsychologists } from '../../services/appointments';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { 
  Calendar, 
  Clock, 
  User as UserIcon, 
  Star, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Loader2,
  TrendingUp,
  Users,
  FileText,
  Settings,
  BarChart3
} from 'lucide-react';
import { PageHeader } from '../ui/PageHeader';

interface Appointment {
  id: number;
  user_email: string;
  psychologist_id: number;
  psychologist_name: string;
  date: string;
  time: string;
  reason: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

interface Psychologist {
  id: number;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  available: boolean;
}

interface AppointmentWithDetails extends Appointment {
  psychologist: Psychologist;
  student: {
    id: string;
    name: string;
    email: string;
  };
}

export function AdminDashboard() {
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
  const [psychologists, setPsychologists] = useState<Psychologist[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
    totalPsychologists: 0,
    activePsychologists: 0,
    totalStudents: 0,
    todayAppointments: 0,
    thisWeekAppointments: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Cargar citas y psicólogos
      const [appointmentsData, psychologistsData] = await Promise.all([
        getAppointments(),
        getPsychologists()
      ]);
      
      // Transformar datos de citas
      const appointmentsWithDetails = appointmentsData.map((appointment) => {
        const psychologist = psychologistsData.find(p => p.id === appointment.psychologist_id);
        return {
          ...appointment,
          psychologist: psychologist || {
            id: appointment.psychologist_id,
            name: 'Psicólogo no disponible',
            email: '',
            phone: '',
            specialization: 'No especificada',
            available: false
          },
          student: {
            id: appointment.user_email,
            name: 'Estudiante',
            email: appointment.user_email
          }
        };
      });
      
      setAppointments(appointmentsWithDetails);
      setPsychologists(psychologistsData);
      
      // Calcular estadísticas
      const today = new Date().toISOString().split('T')[0];
      const todayAppointments = appointmentsWithDetails.filter(a => a.date === today);
      
      // Calcular citas de esta semana
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const thisWeekAppointments = appointmentsWithDetails.filter(a => 
        new Date(a.date) >= oneWeekAgo
      );
      
      setStats({
        totalAppointments: appointmentsWithDetails.length,
        pendingAppointments: appointmentsWithDetails.filter(a => a.status === 'pending').length,
        completedAppointments: appointmentsWithDetails.filter(a => a.status === 'completed').length,
        totalPsychologists: psychologistsData.length,
        activePsychologists: psychologistsData.filter(p => p.available).length,
        totalStudents: new Set(appointmentsWithDetails.map(a => a.user_email)).size,
        todayAppointments: todayAppointments.length,
        thisWeekAppointments: thisWeekAppointments.length
      });
    } catch (error: any) {
      setError('Error al cargar los datos del dashboard');
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">Pendiente</Badge>;
      case 'confirmed':
        return <Badge variant="success">Confirmada</Badge>;
      case 'completed':
        return <Badge variant="info">Completada</Badge>;
      case 'cancelled':
        return <Badge variant="danger">Cancelada</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  const todayAppointments = appointments.filter(appointment => {
    const today = new Date().toISOString().split('T')[0];
    return appointment.date === today;
  });

  const pendingAppointments = appointments
    .filter(appointment => appointment.status === 'pending')
    .slice(0, 5);

  if (loading && appointments.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Dashboard Administrativo"
        subtitle="Gestión Integral del Sistema"
      >
        <p className="text-base text-gray-500 font-medium text-center">
          Instituto Túpac Amaru - Psicología Clínica
        </p>
      </PageHeader>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-3" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-r from-[#8e161a]/5 to-[#d3b7a0]/5 border border-[#8e161a]/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-[#8e161a] to-[#d3b7a0] rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{stats.totalAppointments}</p>
              <p className="text-sm font-medium text-gray-600">Total Citas</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-r from-[#8e161a]/5 to-[#d3b7a0]/5 border border-[#8e161a]/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-[#8e161a] to-[#d3b7a0] rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{stats.pendingAppointments}</p>
              <p className="text-sm font-medium text-gray-600">Pendientes</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-r from-[#8e161a]/5 to-[#d3b7a0]/5 border border-[#8e161a]/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-[#8e161a] to-[#d3b7a0] rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{stats.totalPsychologists}</p>
              <p className="text-sm font-medium text-gray-600">Psicólogos</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-r from-[#8e161a]/5 to-[#d3b7a0]/5 border border-[#8e161a]/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-[#8e161a] to-[#d3b7a0] rounded-lg flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{stats.totalStudents}</p>
              <p className="text-sm font-medium text-gray-600">Estudiantes</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Citas de hoy */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <Calendar className="w-6 h-6 mr-3 text-[#8e161a]" />
          Citas de Hoy
        </h2>

        {todayAppointments.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-600">No hay citas programadas para hoy</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todayAppointments.map((appointment) => (
              <div 
                key={appointment.id}
                className="p-4 bg-gradient-to-r from-[#8e161a]/5 to-[#d3b7a0]/5 rounded-lg border border-[#8e161a]/20"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-[#8e161a] to-[#d3b7a0] rounded-lg flex items-center justify-center">
                      <UserIcon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">
                        {appointment.psychologist_name}
                      </h3>
                      <p className="text-xs font-medium text-gray-600">
                        {appointment.user_email}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatTime(appointment.time)} - {appointment.reason}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(appointment.status)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Citas pendientes */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <Clock className="w-6 h-6 mr-3 text-[#8e161a]" />
          Citas Pendientes
        </h2>

        {pendingAppointments.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-600">No hay citas pendientes</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingAppointments.map((appointment) => (
              <div 
                key={appointment.id}
                className="p-4 bg-gradient-to-r from-[#8e161a]/5 to-[#d3b7a0]/5 rounded-lg border border-[#8e161a]/20"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-[#8e161a] to-[#d3b7a0] rounded-lg flex items-center justify-center">
                      <UserIcon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">
                        {appointment.psychologist_name}
                      </h3>
                      <p className="text-xs font-medium text-gray-600">
                        {appointment.user_email}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(appointment.date)} - {formatTime(appointment.time)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(appointment.status)}
                    <Button 
                      variant="outline"
                      size="sm"
                      className="rounded-lg text-xs"
                      onClick={() => window.location.href = `/appointments/${appointment.id}`}
                    >
                      Ver Detalles
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}