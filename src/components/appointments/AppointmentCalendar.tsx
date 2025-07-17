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
import { dateFnsLocalizer, Event } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, parse, startOfWeek, getDay, startOfDay, addDays, isBefore, isAfter } from 'date-fns';
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

// Colores para los estados
const COLOR_DISPONIBLE = 'rgba(29, 185, 84, 0.18)'; // Verde claro transparente
const COLOR_OCUPADO = 'rgba(142, 22, 26, 0.18)'; // Granate oscuro claro transparente
const COLOR_BLOQUEADO = 'rgba(200,200,200,0.35)'; // Gris claro transparente
const COLOR_TEXTO_BLOQUEADO = '#b0b0b0';
const COLOR_TEXTO_NORMAL = '#222';

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
    const dateString = toLocalDateString(date);
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

  // Transformar citas a eventos para Big Calendar
  const events: Event[] = appointments.map((appointment) => ({
    id: appointment.id,
    title: `${appointment.psychologist_name} (${appointment.status})`,
    start: new Date(`${appointment.date}T${appointment.time}`),
    end: new Date(`${appointment.date}T${appointment.time}`),
    resource: appointment,
    allDay: false,
  }));

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

  const customFormats = {
    monthHeader: ({ date }: { date: Date }) => {
      return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
    },
    dayHeader: ({ date }: { date: Date }) => {
      return dayNames[date.getDay()];
    },
  };

  const handleSelectSlot = (slotInfo: any) => {
    // Aquí puedes implementar la lógica para seleccionar un slot
    // Por ejemplo, abrir un modal para seleccionar la hora
    console.log('Slot seleccionado:', slotInfo);
    // Puedes pasar la fecha y hora seleccionada al estado o a una función de confirmación
  };

  function toLocalDateString(date: Date): string {
    return `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2,'0')}-${date.getDate().toString().padStart(2,'0')}`;
  }

  function parseLocalDate(dateStr: string): Date {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
  function parseLocalDateTime(dateStr: string, timeStr: string): Date {
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hour, minute] = timeStr.split(':').map(Number);
    return new Date(year, month - 1, day, hour, minute);
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
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-3" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}
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
            const today = new Date();
            const peruTime = new Date(today.toLocaleString("en-US", {timeZone: "America/Lima"}));
            const todayStart = startOfDay(peruTime);
            const futureLimit = addDays(todayStart, 14);
            const day = date.getDay();
            if (day === 0 || day === 6) {
              return { style: { backgroundColor: 'rgba(253, 186, 116, 0.3)', color: '#d97706', pointerEvents: 'none', cursor: 'not-allowed', fontWeight: 600, borderRadius: 12, boxShadow: '0 4px 12px rgba(253, 186, 116, 0.15)', border: 'none' } };
            }
            if (isBefore(date, todayStart)) {
              return { style: { backgroundColor: 'rgba(196, 181, 253, 0.3)', color: '#7c3aed', fontWeight: 600, borderRadius: 12, boxShadow: '0 4px 12px rgba(124, 58, 237, 0.15)', border: 'none', cursor: 'not-allowed' } };
            }
            if (isAfter(date, futureLimit)) {
              return { style: { backgroundColor: 'rgba(253, 224, 71, 0.3)', color: '#a16207', fontWeight: 600, opacity: 0.7, borderRadius: 12, boxShadow: '0 4px 12px rgba(253, 224, 71, 0.15)', border: 'none' } };
            }
            return { style: { backgroundColor: 'rgba(134, 239, 172, 0.3)', color: '#059669', fontWeight: 600, borderRadius: 12, boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)', border: 'none', cursor: 'pointer' } };
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
}