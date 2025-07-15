import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Calendar, Clock, User, CheckCircle, XCircle, Clock as ClockIcon } from 'lucide-react';
import { getUserAppointments } from '../../services/appointments';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar as BigCalendar, dateFnsLocalizer, Event } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import esES from 'date-fns/locale/es';
import { Tooltip } from '../ui/Tooltip';

const locales = {
  'es': esES,
};
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

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

  // Colores para los estados
  const COLOR_DISPONIBLE = 'rgba(29, 185, 84, 0.18)'; // Verde claro transparente
  const COLOR_OCUPADO = 'rgba(142, 22, 26, 0.18)'; // Granate oscuro claro transparente
  const COLOR_BLOQUEADO = 'rgba(200,200,200,0.35)'; // Gris claro transparente
  const COLOR_TEXTO_BLOQUEADO = '#b0b0b0';
  const COLOR_TEXTO_NORMAL = '#222';

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

  // Transformar citas a eventos para Big Calendar
  const events: Event[] = appointments.map((appointment) => ({
    id: appointment.id,
    title: `${appointment.psychologist_name} (${appointment.status})`,
    start: new Date(`${appointment.date}T${appointment.time}`),
    end: new Date(`${appointment.date}T${appointment.time}`),
    resource: appointment,
    allDay: false,
  }));

  const customMessages = {
    next: 'Siguiente',
    previous: 'Anterior',
    today: 'Hoy',
    month: 'Mes',
    week: 'Semana',
    day: 'Día',
    agenda: 'Agenda',
    date: 'Fecha',
    time: 'Hora',
    event: 'Evento',
    noEventsInRange: 'No hay eventos en este rango',
  };

  const handleSelectSlot = (slotInfo: any) => {
    // slotInfo contiene la fecha y hora seleccionada
    if (slotInfo && slotInfo.start) {
      // Ajuste para evitar desfase de zona horaria
      const selected = new Date(slotInfo.start.getFullYear(), slotInfo.start.getMonth(), slotInfo.start.getDate());
      setSelectedDate(selected);
    }
  };

  const customFormats = {
    monthHeader: (date: Date) => {
      return format(date, 'MMMM yyyy', { locale: esES });
    },
    dayHeader: (date: Date) => {
      return format(date, 'EEEE dd', { locale: esES });
    },
    dayRangeHeader: (date: Date) => {
      return `${format(date, 'dd', { locale: esES })} - ${format(date, 'dd MMM', { locale: esES })}`;
    },
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
      <Card className="p-6">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          selectable
          style={{ height: 600, background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.07)', border: '1px solid #e5e7eb', fontFamily: 'Inter, sans-serif' }}
          messages={customMessages}
          formats={customFormats}
          views={['month']}
          onSelectSlot={handleSelectSlot}
          eventPropGetter={(event: any) => {
            if (event.resource.ocupado) {
              // Ocupado: granate oscuro claro transparente
              return { style: { backgroundColor: COLOR_OCUPADO, color: COLOR_TEXTO_NORMAL, borderRadius: 8, border: 'none', fontWeight: 600 } };
            }
            // Disponible: verde claro transparente
            return { style: { backgroundColor: COLOR_DISPONIBLE, color: COLOR_TEXTO_NORMAL, borderRadius: 8, border: 'none', fontWeight: 600 } };
          }}
          dayPropGetter={(date: any) => {
            const day = date.getDay();
            if (day === 0 || day === 6) {
              return { style: { backgroundColor: COLOR_BLOQUEADO, color: COLOR_TEXTO_BLOQUEADO, pointerEvents: 'none', opacity: 1, cursor: 'not-allowed', fontWeight: 600 } };
            }
            return { style: { color: COLOR_TEXTO_NORMAL, fontWeight: 600 } };
          }}
          components={{
            event: () => null // No mostrar badges ni íconos
          }}
        />
        {/* Leyenda visual minimalista */}
        <div className="flex gap-6 mt-4 text-sm items-center">
          <div className="flex items-center gap-2"><span className="inline-block w-4 h-4 rounded bg-[rgba(29,185,84,0.18)] border border-[#1db954]"></span> Disponible</div>
          <div className="flex items-center gap-2"><span className="inline-block w-4 h-4 rounded bg-[rgba(142,22,26,0.18)] border border-[#8e161a]"></span> Ocupado</div>
          <div className="flex items-center gap-2"><span className="inline-block w-4 h-4 rounded bg-[rgba(200,200,200,0.35)] border border-gray-300"></span> No disponible</div>
        </div>
      </Card>
    </div>
  );
}; 