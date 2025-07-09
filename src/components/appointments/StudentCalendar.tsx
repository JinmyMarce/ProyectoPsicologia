import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Calendar, Clock, User, CheckCircle, XCircle, Clock as ClockIcon } from 'lucide-react';
import { getUserAppointments } from '../../services/appointments';
import { useAuth } from '../../contexts/AuthContext';

interface StudentAppointment {
  id: number;
  user_email: string;
  psychologist_name: string;
  date: string;
  time: string;
  reason: string;
  status: string;
  created_at: string;
}

export const StudentCalendar: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<StudentAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getUserAppointments();
      setAppointments(data);
    } catch (error: any) {
      setError(error.message || 'Error al cargar las citas');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmada':
        return 'bg-green-100 text-green-800';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelada':
        return 'bg-red-100 text-red-800';
      case 'completada':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmada':
        return 'Confirmada';
      case 'pendiente':
        return 'Pendiente';
      case 'cancelada':
        return 'Cancelada';
      case 'completada':
        return 'Completada';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmada':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelada':
        return <XCircle className="w-4 h-4" />;
      default:
        return <ClockIcon className="w-4 h-4" />;
    }
  };

  const getAppointmentsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return appointments.filter(appointment => appointment.date === dateString);
  };

  const getUpcomingAppointments = () => {
    const today = new Date();
    return appointments
      .filter(appointment => new Date(appointment.date) >= today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8e161a]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  const upcomingAppointments = getUpcomingAppointments();
  const selectedDateAppointments = getAppointmentsForDate(selectedDate);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Mi Calendario</h2>
        <Badge variant="info" className="text-sm">
          {appointments.length} citas totales
        </Badge>
      </div>

      {/* Próximas citas */}
      {upcomingAppointments.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-[#8e161a]" />
            Próximas Citas
          </h3>
          <div className="space-y-3">
            {upcomingAppointments.map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(appointment.status)}
                    <Badge className={getStatusColor(appointment.status)}>
                      {getStatusText(appointment.status)}
                    </Badge>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {new Date(appointment.date).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="text-sm text-gray-600">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {appointment.time} - Dr. {appointment.psychologist_name}
                    </p>
                  </div>
                </div>
                {appointment.reason && (
                  <div className="text-sm text-gray-600 max-w-xs">
                    <p className="font-medium">Motivo:</p>
                    <p className="truncate">{appointment.reason}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Calendario mensual */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-[#8e161a]" />
          Calendario Mensual
        </h3>
        
        <div className="grid grid-cols-7 gap-1 mb-4">
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
          
          {Array.from({ length: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).getDay() }, (_, i) => (
            <div key={`empty-${i}`} className="h-10"></div>
          ))}
          
          {Array.from({ length: new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate() }, (_, i) => {
            const day = i + 1;
            const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
            const dayAppointments = getAppointmentsForDate(date);
            const isToday = date.toDateString() === new Date().toDateString();
            
            return (
              <div
                key={day}
                className={`h-10 border border-gray-200 flex items-center justify-center text-sm cursor-pointer hover:bg-gray-50 ${
                  isToday ? 'bg-[#8e161a] text-white' : ''
                }`}
                onClick={() => setSelectedDate(date)}
              >
                <div className="relative">
                  {day}
                  {dayAppointments.length > 0 && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Citas del día seleccionado */}
        {selectedDateAppointments.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium text-gray-900 mb-2">
              Citas del {selectedDate.toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </h4>
            <div className="space-y-2">
              {selectedDateAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge className={getStatusColor(appointment.status)}>
                      {getStatusText(appointment.status)}
                    </Badge>
                    <div>
                      <p className="font-medium text-gray-900">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {appointment.time}
                      </p>
                      <p className="text-sm text-gray-600">
                        Dr. {appointment.psychologist_name}
                      </p>
                    </div>
                  </div>
                  {appointment.reason && (
                    <div className="text-sm text-gray-600 max-w-xs">
                      <p className="font-medium">Motivo:</p>
                      <p className="truncate">{appointment.reason}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}; 