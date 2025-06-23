import React, { useState, useEffect } from 'react';
import { getAppointments, updateAppointment } from '../../services/appointments';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { 
  Calendar, 
  Clock, 
  User, 
  Star, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Loader2,
  TrendingUp,
  Users,
  FileText,
  Video
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

interface AppointmentWithStudent extends Appointment {
  student: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

export function PsychologistDashboard() {
  const [appointments, setAppointments] = useState<AppointmentWithStudent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    today: 0
  });

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const appointmentsData = await getAppointments();
      
      // Transformar los datos para incluir información del estudiante
      const appointmentsWithStudent = appointmentsData.map((appointment) => ({
        ...appointment,
        student: {
          id: appointment.user_email,
          name: 'Estudiante', // En un caso real, obtendrías los datos del estudiante
          email: appointment.user_email,
          avatar: undefined
        }
      }));
      
      setAppointments(appointmentsWithStudent);
      
      // Calcular estadísticas
      const today = new Date().toISOString().split('T')[0];
      const todayAppointments = appointmentsWithStudent.filter(a => a.date === today);
      
      setStats({
        total: appointmentsWithStudent.length,
        pending: appointmentsWithStudent.filter(a => a.status === 'pending').length,
        confirmed: appointmentsWithStudent.filter(a => a.status === 'confirmed').length,
        completed: appointmentsWithStudent.filter(a => a.status === 'completed').length,
        cancelled: appointmentsWithStudent.filter(a => a.status === 'cancelled').length,
        today: todayAppointments.length
      });
    } catch (error: any) {
      setError('Error al cargar las citas');
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAppointmentStatus = async (appointmentId: number, newStatus: string) => {
    try {
      await updateAppointment(appointmentId, {
        status: newStatus as 'pending' | 'confirmed' | 'completed' | 'cancelled'
      });
      
      // Actualizar la lista de citas
      setAppointments(prev => 
        prev.map(app => 
          app.id === appointmentId 
            ? { ...app, status: newStatus as 'pending' | 'confirmed' | 'completed' | 'cancelled' }
            : app
        )
      );
      
      // Recargar estadísticas
      loadAppointments();
    } catch (error: any) {
      setError('Error al actualizar el estado de la cita');
      console.error('Error updating appointment:', error);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
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

  const upcomingAppointments = appointments
    .filter(appointment => appointment.status === 'confirmed' || appointment.status === 'pending')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
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
    <div className="space-y-8">
      <PageHeader 
        title="Dashboard del Psicólogo"
        subtitle="Gestión de Citas y Pacientes"
      >
        <p className="text-xl text-gray-500 font-semibold text-center">
          Instituto Túpac Amaru - Psicología Clínica
        </p>
      </PageHeader>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-2xl flex items-center">
          <AlertCircle className="w-8 h-8 mr-4" />
          <p className="text-xl font-bold">{error}</p>
        </div>
      )}

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Card className="p-8 bg-gradient-to-r from-[#8e161a]/5 to-[#d3b7a0]/5 border-2 border-[#8e161a]/20">
          <div className="flex items-center space-x-6">
            <div className="w-16 h-16 bg-gradient-to-r from-[#8e161a] to-[#d3b7a0] rounded-2xl flex items-center justify-center">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900">{stats.total}</p>
              <p className="text-lg font-bold text-gray-600">Total Citas</p>
            </div>
          </div>
        </Card>

        <Card className="p-8 bg-gradient-to-r from-[#8e161a]/5 to-[#d3b7a0]/5 border-2 border-[#8e161a]/20">
          <div className="flex items-center space-x-6">
            <div className="w-16 h-16 bg-gradient-to-r from-[#8e161a] to-[#d3b7a0] rounded-2xl flex items-center justify-center">
              <Clock className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900">{stats.today}</p>
              <p className="text-lg font-bold text-gray-600">Citas Hoy</p>
            </div>
          </div>
        </Card>

        <Card className="p-8 bg-gradient-to-r from-[#8e161a]/5 to-[#d3b7a0]/5 border-2 border-[#8e161a]/20">
          <div className="flex items-center space-x-6">
            <div className="w-16 h-16 bg-gradient-to-r from-[#8e161a] to-[#d3b7a0] rounded-2xl flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900">{stats.completed}</p>
              <p className="text-lg font-bold text-gray-600">Completadas</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Citas de hoy */}
      <Card className="p-8">
        <h2 className="text-4xl font-black text-gray-900 mb-8 flex items-center">
          <Calendar className="w-12 h-12 mr-6 text-[#8e161a]" />
          Citas de Hoy
        </h2>

        {todayAppointments.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl font-bold text-gray-600">No hay citas programadas para hoy</p>
          </div>
        ) : (
          <div className="space-y-4">
            {todayAppointments.map((appointment) => (
              <div 
                key={appointment.id}
                className="p-6 bg-gradient-to-r from-[#8e161a]/5 to-[#d3b7a0]/5 rounded-2xl border-2 border-[#8e161a]/20"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-[#8e161a] to-[#d3b7a0] rounded-xl flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-gray-900">
                        {appointment.student.name}
                      </h3>
                      <p className="text-lg font-semibold text-gray-600">
                        {appointment.student.email}
                      </p>
                      <p className="text-base text-gray-500">
                        {formatTime(appointment.time)} - {appointment.reason}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    {getStatusBadge(appointment.status)}
                    <Button 
                      variant="outline"
                      className="rounded-xl"
                      onClick={() => handleUpdateAppointmentStatus(appointment.id, 'completed')}
                    >
                      Completar
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Próximas citas */}
      <Card className="p-8">
        <h2 className="text-4xl font-black text-gray-900 mb-8 flex items-center">
          <Clock className="w-12 h-12 mr-6 text-[#8e161a]" />
          Próximas Citas
        </h2>

        {upcomingAppointments.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl font-bold text-gray-600">No hay citas próximas</p>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingAppointments.map((appointment) => (
              <div 
                key={appointment.id}
                className="p-6 bg-gradient-to-r from-[#8e161a]/5 to-[#d3b7a0]/5 rounded-2xl border-2 border-[#8e161a]/20"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-[#8e161a] to-[#d3b7a0] rounded-xl flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-gray-900">
                        {appointment.student.name}
                      </h3>
                      <p className="text-lg font-semibold text-gray-600">
                        {appointment.student.email}
                      </p>
                      <p className="text-base text-gray-500">
                        {formatDate(appointment.date)} - {formatTime(appointment.time)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    {getStatusBadge(appointment.status)}
                    <div className="flex space-x-2">
                      {appointment.status === 'pending' && (
                        <Button 
                          variant="outline"
                          className="rounded-xl"
                          onClick={() => handleUpdateAppointmentStatus(appointment.id, 'confirmed')}
                        >
                          Confirmar
                        </Button>
                      )}
                      <Button 
                        variant="outline"
                        className="rounded-xl"
                        onClick={() => window.location.href = `/appointments/${appointment.id}`}
                      >
                        Ver Detalles
                      </Button>
                    </div>
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