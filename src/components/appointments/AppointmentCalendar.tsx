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
  Loader2,
  Star
} from 'lucide-react';
import { PageHeader } from '../ui/PageHeader';
import { dateFnsLocalizer, Event } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, parse, startOfWeek, getDay, startOfDay, addDays, isBefore, isAfter } from 'date-fns';
import esES from 'date-fns/locale/es';
import { Tooltip } from '../ui/Tooltip';
import { holidayLocalService } from '../../services/holidaysLocal';
import { Holiday } from '../../services/holidays';

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

// Colores institucionales del sistema
const COLOR_DISPONIBLE = 'rgba(142, 22, 26, 0.18)'; // Granate institucional transparente
const COLOR_OCUPADO = 'rgba(52, 73, 94, 0.18)'; // Gris azul medio transparente
const COLOR_BLOQUEADO = 'rgba(44, 62, 80, 0.35)'; // Gris azul oscuro transparente
const COLOR_TEXTO_BLOQUEADO = '#34495e'; // Gris azul medio
const COLOR_TEXTO_NORMAL = '#2c3e50'; // Gris azul oscuro

export function AppointmentCalendar() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [psychologists, setPsychologists] = useState<Psychologist[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Cargar feriados al inicializar el componente
  const [holidays, setHolidays] = useState<Holiday[]>([]);

  useEffect(() => {
    // Cargar todos los feriados disponibles
    const allHolidays = holidayLocalService.getAllHolidays();
    setHolidays(allHolidays);
  }, []);

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
      
      // Cargar feriados
      const holidaysData = holidayLocalService.getAllHolidays();
      setHolidays(holidaysData);
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

  // Agregar eventos de feriados al calendario
  const holidayEvents: Event[] = holidays.map((holiday) => ({
    id: `holiday-${holiday.id}`,
    title: `🎉 ${holiday.name}`,
    start: parseLocalDate(holiday.date),
    end: parseLocalDate(holiday.date),
    resource: { type: 'holiday', data: holiday },
    allDay: true,
  }));

  // Combinar eventos de citas y feriados
  const allEvents = [...events, ...holidayEvents];

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
          events={allEvents}
          startAccessor="start"
          endAccessor="end"
          selectable
          style={{ height: 600, background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.07)', border: '1px solid #e5e7eb', fontFamily: 'Inter, sans-serif' }}
          messages={customMessages}
          formats={customFormats}
          views={['month']}
          onSelectSlot={handleSelectSlot}
          dayPropGetter={(date: any) => {
            const today = new Date();
            const peruTime = new Date(today.toLocaleString("en-US", {timeZone: "America/Lima"}));
            const todayStart = startOfDay(peruTime);
            const futureLimit = addDays(todayStart, 14);
            const day = date.getDay();
            
            // Verificar si es feriado
            const holiday = holidayLocalService.isHolidayDate(date, holidays);
            
            if (holiday) {
              // Día feriado: diseño moderno y atractivo
              const isNational = holiday.is_national;
              return { 
                style: { 
                  background: isNational 
                    ? 'linear-gradient(135deg, rgba(251, 191, 36, 0.95) 0%, rgba(245, 158, 11, 0.9) 100%)'
                    : 'linear-gradient(135deg, rgba(168, 85, 247, 0.95) 0%, rgba(139, 92, 246, 0.9) 100%)',
                  color: isNational ? '#92400e' : '#581c87',
                  fontWeight: 800,
                  borderRadius: 16,
                  boxShadow: isNational 
                    ? '0 8px 25px rgba(251, 191, 36, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                    : '0 8px 25px rgba(168, 85, 247, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                  border: isNational 
                    ? '3px solid #f59e0b'
                    : '3px solid #8b5cf6',
                  cursor: 'not-allowed',
                  pointerEvents: 'none',
                  position: 'relative',
                  transform: 'scale(1.05)',
                  transition: 'all 0.3s ease',
                  textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)'
                } 
              };
            }
            
            if (day === 0 || day === 6) {
              return { 
                style: { 
                  background: 'linear-gradient(135deg, rgba(253, 186, 116, 0.9) 0%, rgba(251, 146, 60, 0.8) 100%)',
                  color: '#c2410c',
                  pointerEvents: 'none',
                  cursor: 'not-allowed',
                  fontWeight: 700,
                  borderRadius: 12,
                  boxShadow: '0 6px 20px rgba(253, 186, 116, 0.4)',
                  border: '2px solid #f97316',
                  opacity: 0.9,
                  backdropFilter: 'blur(5px)',
                  WebkitBackdropFilter: 'blur(5px)'
                } 
              };
            }
            if (isBefore(date, todayStart)) {
              return { 
                style: { 
                  background: 'linear-gradient(135deg, rgba(156, 163, 175, 0.7) 0%, rgba(107, 114, 128, 0.6) 100%)',
                  color: '#374151',
                  fontWeight: 600,
                  borderRadius: 12,
                  boxShadow: '0 4px 15px rgba(156, 163, 175, 0.3)',
                  border: '1px solid #9ca3af',
                  cursor: 'not-allowed',
                  opacity: 0.7,
                  backdropFilter: 'blur(5px)',
                  WebkitBackdropFilter: 'blur(5px)'
                } 
              };
            }
            if (isAfter(date, futureLimit)) {
              return { 
                style: { 
                  background: 'linear-gradient(135deg, rgba(253, 224, 71, 0.7) 0%, rgba(250, 204, 21, 0.6) 100%)',
                  color: '#a16207',
                  fontWeight: 600,
                  opacity: 0.8,
                  borderRadius: 12,
                  boxShadow: '0 4px 15px rgba(253, 224, 71, 0.3)',
                  border: '1px solid #facc15',
                  backdropFilter: 'blur(5px)',
                  WebkitBackdropFilter: 'blur(5px)'
                } 
              };
            }
            return { 
              style: { 
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.9) 0%, rgba(22, 163, 74, 0.8) 100%)',
                color: '#064e3b',
                fontWeight: 700,
                borderRadius: 12,
                boxShadow: '0 6px 20px rgba(34, 197, 94, 0.4)',
                border: '2px solid #16a34a',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                backdropFilter: 'blur(5px)',
                WebkitBackdropFilter: 'blur(5px)',
                '&:hover': {
                  transform: 'scale(1.02)',
                  boxShadow: '0 8px 25px rgba(34, 197, 94, 0.6)'
                }
              } 
            };
          }}
          eventPropGetter={(event: any) => {
            // Si es un evento de feriado
            if (event.resource?.type === 'holiday') {
              const holiday = event.resource.data;
              const isNational = holiday.is_national;
              return { 
                style: { 
                  background: isNational 
                    ? 'linear-gradient(135deg, rgba(251, 191, 36, 1) 0%, rgba(245, 158, 11, 0.95) 100%)'
                    : 'linear-gradient(135deg, rgba(168, 85, 247, 1) 0%, rgba(139, 92, 246, 0.95) 100%)',
                  color: isNational ? '#92400e' : '#581c87',
                  borderRadius: 12,
                  border: isNational 
                    ? '3px solid #f59e0b'
                    : '3px solid #8b5cf6',
                  fontWeight: 800,
                  fontSize: '12px',
                  padding: '8px 12px',
                  textAlign: 'center',
                  boxShadow: isNational 
                    ? '0 8px 25px rgba(251, 191, 36, 0.7)'
                    : '0 8px 25px rgba(168, 85, 247, 0.7)',
                  minHeight: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                  transform: 'scale(1.02)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)'
                } 
              };
            }
            
            // Si es una cita
            if (event.resource.ocupado) {
              return { 
                style: { 
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.95) 0%, rgba(220, 38, 38, 0.9) 100%)',
                  color: '#ffffff',
                  borderRadius: 10,
                  border: '2px solid #dc2626',
                  fontWeight: 700,
                  boxShadow: '0 6px 20px rgba(239, 68, 68, 0.5)',
                  backdropFilter: 'blur(5px)',
                  WebkitBackdropFilter: 'blur(5px)'
                } 
              };
            }
            return { 
              style: { 
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.95) 0%, rgba(22, 163, 74, 0.9) 100%)',
                color: '#ffffff',
                borderRadius: 10,
                border: '2px solid #16a34a',
                fontWeight: 700,
                boxShadow: '0 6px 20px rgba(34, 197, 94, 0.5)',
                backdropFilter: 'blur(5px)',
                WebkitBackdropFilter: 'blur(5px)'
              } 
            };
          }}
          components={{
            event: (props: any) => {
              // Si es un evento de feriado
              if (props.event.resource?.type === 'holiday') {
                const holiday = props.event.resource.data;
                const isNational = holiday.is_national;
                return (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '6px',
                      fontSize: '11px',
                      fontWeight: 700,
                      textAlign: 'center',
                      lineHeight: '1.3',
                      overflow: 'hidden',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)'
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '3px',
                      marginBottom: '3px'
                    }}>
                      <span style={{ 
                        fontSize: '10px',
                        filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))'
                      }}>⭐</span>
                      <span style={{ 
                        fontSize: '9px',
                        fontWeight: 800,
                        color: isNational ? '#92400e' : '#581c87',
                        textShadow: '0 1px 2px rgba(255,255,255,0.8)',
                        letterSpacing: '0.5px'
                      }}>
                        {isNational ? 'NACIONAL' : 'REGIONAL'}
                      </span>
                    </div>
                    <div style={{
                      fontSize: '10px',
                      fontWeight: 600,
                      color: isNational ? '#92400e' : '#581c87',
                      wordBreak: 'break-word',
                      hyphens: 'auto',
                      maxHeight: '100%',
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      textShadow: '0 1px 2px rgba(255,255,255,0.8)',
                      lineHeight: '1.2'
                    }}>
                      {holiday.name}
                    </div>
                  </div>
                );
              }
              
              // Para otros eventos (citas)
              return (
                <div style={{ 
                  padding: '4px 6px', 
                  fontSize: '11px',
                  fontWeight: 600,
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                }}>
                  {props.title}
                </div>
              );
            }
          }}
        />
        {/* Leyenda visual moderna y atractiva */}
        <div className="mt-8 p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 rounded-3xl border border-blue-200/50 shadow-2xl backdrop-blur-sm">
          <h4 className="text-2xl font-bold text-gray-800 mb-8 flex items-center justify-center">
            <span className="w-10 h-10 mr-4 text-blue-600 bg-white rounded-full flex items-center justify-center shadow-lg">📅</span>
            Leyenda de Disponibilidad
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="flex items-center gap-5 p-6 rounded-2xl bg-white/80 shadow-xl border border-green-200/50 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 border-2 border-green-600 shadow-xl flex items-center justify-center">
                <span className="text-white text-lg font-bold">✓</span>
              </div>
              <div>
                <span className="text-base font-bold text-gray-800">Disponible</span>
                <p className="text-sm text-gray-600 mt-1">Puedes agendar cita</p>
              </div>
            </div>
            
            <div className="flex items-center gap-5 p-6 rounded-2xl bg-white/80 shadow-xl border border-red-200/50 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-400 to-rose-500 border-2 border-red-600 shadow-xl flex items-center justify-center">
                <span className="text-white text-lg font-bold">✗</span>
              </div>
              <div>
                <span className="text-base font-bold text-gray-800">Ocupado</span>
                <p className="text-sm text-gray-600 mt-1">Cita ya agendada</p>
              </div>
            </div>
            
            <div className="flex items-center gap-5 p-6 rounded-2xl bg-white/80 shadow-xl border border-gray-200/50 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-400 to-slate-500 border-2 border-gray-600 shadow-xl flex items-center justify-center">
                <span className="text-white text-lg font-bold">⊘</span>
              </div>
              <div>
                <span className="text-base font-bold text-gray-800">No disponible</span>
                <p className="text-sm text-gray-600 mt-1">Bloqueado o fuera de límite</p>
              </div>
            </div>
            
            <div className="flex items-center gap-5 p-6 rounded-2xl bg-white/80 shadow-xl border border-orange-200/50 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 border-2 border-orange-600 shadow-xl flex items-center justify-center">
                <span className="text-white text-lg font-bold">⭐</span>
              </div>
              <div>
                <span className="text-base font-bold text-gray-800">Feriado Nacional</span>
                <p className="text-sm text-gray-600 mt-1">No se atiende en todo el país</p>
              </div>
            </div>
            
            <div className="flex items-center gap-5 p-6 rounded-2xl bg-white/80 shadow-xl border border-purple-200/50 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-400 to-violet-500 border-2 border-purple-600 shadow-xl flex items-center justify-center">
                <span className="text-white text-lg font-bold">⭐</span>
              </div>
              <div>
                <span className="text-base font-bold text-gray-800">Feriado Regional</span>
                <p className="text-sm text-gray-600 mt-1">Feriado específico de Lima</p>
              </div>
            </div>
            
            <div className="flex items-center gap-5 p-6 rounded-2xl bg-white/80 shadow-xl border border-yellow-200/50 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 border-2 border-yellow-600 shadow-xl flex items-center justify-center">
                <span className="text-white text-lg font-bold">☀</span>
              </div>
              <div>
                <span className="text-base font-bold text-gray-800">Fin de semana</span>
                <p className="text-sm text-gray-600 mt-1">No se atiende sábados ni domingos</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}