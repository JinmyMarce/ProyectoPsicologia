import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, FileText, Plus, ArrowRight, CheckCircle, AlertCircle, Clock as ClockIcon } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useAuth } from '../../contexts/AuthContext';
import { getUserAppointments } from '../../services/appointments';
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

export function StudentDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.email) {
      loadAppointments();
    }
  }, [user]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const data = await getUserAppointments(user!.email);
      setAppointments(data);
    } catch (error) {
      console.error('Error cargando citas:', error);
      setError('Error al cargar las citas');
    } finally {
      setLoading(false);
    }
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

  const upcomingAppointments = appointments.filter(apt => 
    apt.status === 'confirmed' || apt.status === 'pending'
  ).slice(0, 3);

  const totalAppointments = appointments.length;
  const completedAppointments = appointments.filter(apt => apt.status === 'completed').length;
  const pendingAppointments = appointments.filter(apt => apt.status === 'pending').length;

  return (
    <div className="space-y-6">
      <PageHeader 
        title={`Bienvenido, ${user?.name}`}
        subtitle="Dashboard de Estudiante"
      >
        <p className="text-base text-gray-500 font-medium text-center">
          Instituto Túpac Amaru - Psicología Clínica
        </p>
      </PageHeader>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
              <p className="text-lg font-bold text-gray-900">{pendingAppointments}</p>
              <p className="text-sm font-medium text-gray-600">Citas Pendientes</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Acciones rápidas */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <Plus className="w-6 h-6 mr-3 text-[#8e161a]" />
          Acciones Rápidas
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button 
            className="p-4 text-sm font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            onClick={() => window.location.href = '/appointments'}
          >
            <Calendar className="w-5 h-5 mr-2" />
            Agendar Nueva Cita
          </Button>

          <Button 
            variant="outline"
            className="p-4 text-sm font-semibold rounded-lg border border-[#8e161a] text-[#8e161a] hover:bg-[#8e161a] hover:text-white transition-all duration-300 transform hover:scale-105"
            onClick={() => window.location.href = '/appointments/history'}
          >
            <FileText className="w-5 h-5 mr-2" />
            Ver Historial
          </Button>

          <Button 
            variant="outline"
            className="p-4 text-sm font-semibold rounded-lg border border-[#8e161a] text-[#8e161a] hover:bg-[#8e161a] hover:text-white transition-all duration-300 transform hover:scale-105"
            onClick={() => window.location.href = '/notifications'}
          >
            <AlertCircle className="w-5 h-5 mr-2" />
            Notificaciones
          </Button>
        </div>
      </Card>

      {/* Próximas citas */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <Clock className="w-6 h-6 mr-3 text-[#8e161a]" />
          Próximas Citas
        </h2>

        {loading ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 border-4 border-[#8e161a]/30 border-t-[#8e161a] rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm font-medium text-gray-600">Cargando citas...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <p className="text-sm font-medium text-red-600">{error}</p>
          </div>
        ) : upcomingAppointments.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-600 mb-3">No tienes citas próximas</p>
            <Button 
              onClick={() => window.location.href = '/appointments'}
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
                className="p-4 bg-gradient-to-r from-[#8e161a]/5 to-[#d3b7a0]/5 rounded-lg border border-[#8e161a]/20 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-[#8e161a] to-[#d3b7a0] rounded-lg flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 mb-1">
                        Dr. {appointment.psychologist_name}
                      </h3>
                      <div className="flex items-center space-x-4 text-xs font-medium text-gray-600">
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
                      <p className="text-xs text-gray-500 mt-1 font-medium">
                        Motivo: {appointment.reason}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={getStatusColor(appointment.status)} className="text-xs px-2 py-1">
                      {getStatusText(appointment.status)}
                    </Badge>
                    <Button 
                      variant="outline"
                      size="sm"
                      className="rounded-lg p-2"
                      onClick={() => window.location.href = `/appointments/${appointment.id}`}
                    >
                      <ArrowRight className="w-4 h-4" />
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