import React, { useState, useEffect } from 'react';
import { getUserAppointments, getPsychologists } from '../../services/appointments';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { 
  Calendar, 
  Clock, 
  User, 
  ChevronLeft, 
  ChevronRight,
  CheckCircle,
  AlertCircle,
  XCircle,
  Loader2
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

export function AppointmentCalendar() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [psychologists, setPsychologists] = useState<Psychologist[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCalendarData();
  }, []);

  const loadCalendarData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [appointmentsData, psychologistsData] = await Promise.all([
        getUserAppointments(),
        getPsychologists()
      ]);
      
      setAppointments(appointmentsData);
      setPsychologists(psychologistsData);
    } catch (error: any) {
      setError('Error al cargar los datos del calendario');
      console.error('Error loading calendar data:', error);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days = [];
    
    // Agregar días del mes anterior para completar la primera semana
    for (let i = 0; i < startingDay; i++) {
      const prevDate = new Date(year, month, -startingDay + i + 1);
      days.push({ date: prevDate, isCurrentMonth: false });
    }
    
    // Agregar días del mes actual
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(year, month, i);
      days.push({ date: currentDate, isCurrentMonth: true });
    }
    
    // Agregar días del mes siguiente para completar la última semana
    const remainingDays = 42 - days.length; // 6 semanas * 7 días
    for (let i = 1; i <= remainingDays; i++) {
      const nextDate = new Date(year, month + 1, i);
      days.push({ date: nextDate, isCurrentMonth: false });
    }
    
    return days;
  };

  const getAppointmentsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return appointments.filter(appointment => appointment.date === dateString);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const goToPreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const days = getDaysInMonth(currentDate);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Cargando calendario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Calendario de Citas"
        subtitle="Vista Mensual de Citas"
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

      {/* Controles del calendario */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={goToPreviousMonth}
              className="rounded-lg p-2"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            
            <h2 className="text-xl font-bold text-gray-900">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            
            <Button
              variant="outline"
              onClick={goToNextMonth}
              className="rounded-lg p-2"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
          
          <Button
            onClick={goToToday}
            className="rounded-lg px-4 py-2 text-sm"
          >
            Hoy
          </Button>
        </div>

        {/* Calendario */}
        <div className="grid grid-cols-7 gap-1">
          {/* Días de la semana */}
          {dayNames.map(day => (
            <div key={day} className="p-3 text-center font-semibold text-sm text-gray-700 bg-gray-100 rounded-lg">
              {day}
            </div>
          ))}
          
          {/* Días del mes */}
          {days.map((day, index) => {
            const dayAppointments = getAppointmentsForDate(day.date);
            const isCurrentMonth = day.isCurrentMonth;
            const isTodayDate = isToday(day.date);
            
            return (
              <div
                key={index}
                className={`min-h-24 p-2 border border-gray-200 rounded-lg transition-all duration-300 ${
                  isTodayDate
                    ? 'border-[#8e161a] bg-gradient-to-r from-[#8e161a]/10 to-[#d3b7a0]/10'
                    : isCurrentMonth
                    ? 'hover:border-[#8e161a]/50'
                    : 'bg-gray-50'
                }`}
              >
                <div className={`text-xs font-bold mb-1 ${
                  isTodayDate
                    ? 'text-[#8e161a]'
                    : isCurrentMonth
                    ? 'text-gray-900'
                    : 'text-gray-400'
                }`}>
                  {day.date.getDate()}
                </div>
                
                <div className="space-y-1">
                  {dayAppointments.slice(0, 2).map(appointment => (
                    <div
                      key={appointment.id}
                      className="p-1 bg-white rounded border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
                      onClick={() => window.location.href = `/appointments/${appointment.id}`}
                    >
                      <div className="flex items-center space-x-1 mb-1">
                        {getStatusIcon(appointment.status)}
                        <span className="text-xs font-medium text-gray-600">
                          {formatTime(appointment.time)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-800 font-medium truncate">
                        {appointment.psychologist_name}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {appointment.user_email}
                      </div>
                    </div>
                  ))}
                  
                  {dayAppointments.length > 2 && (
                    <div className="text-xs text-gray-500 text-center py-1">
                      +{dayAppointments.length - 2} más
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Leyenda */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Leyenda</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-yellow-500" />
            <span className="text-xs font-medium">Pendiente</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-xs font-medium">Confirmada</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-medium">Completada</span>
          </div>
          <div className="flex items-center space-x-2">
            <XCircle className="w-4 h-4 text-red-500" />
            <span className="text-xs font-medium">Cancelada</span>
          </div>
        </div>
      </Card>
    </div>
  );
}