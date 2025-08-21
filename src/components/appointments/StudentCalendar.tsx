import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { CheckCircle, XCircle, Clock as ClockIcon, Star } from 'lucide-react';
import { getUserAppointments } from '../../services/appointments';
import { getBlockedDatesForCalendar } from '../../services/schedule';
import { Holiday } from '../../services/holidays';
import { holidayPublicService } from '../../services/holidaysPublic';
import { holidayLocalService } from '../../services/holidaysLocal';
import { useSchedule } from '../../contexts/ScheduleContext';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar as BigCalendar, dateFnsLocalizer, Event } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, parse, startOfWeek, getDay, addDays, isAfter, isBefore, startOfDay } from 'date-fns';
import esES from 'date-fns/locale/es';


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
  const { getBlockedDates } = useSchedule();
  const [appointments, setAppointments] = useState<StudentAppointment[]>([]);
  // Cargar feriados al inicializar el componente
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  // Estado para la fecha seleccionada y error
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());
  const [error, setError] = useState('');
  const [blockedDates, setBlockedDates] = useState<string[]>([]);

  // Colores institucionales del sistema
  const COLOR_DISPONIBLE = 'rgba(142, 22, 26, 0.18)'; // Granate institucional transparente
  const COLOR_OCUPADO = 'rgba(52, 73, 94, 0.18)'; // Gris azul medio transparente
  const COLOR_BLOQUEADO = 'rgba(44, 62, 80, 0.35)'; // Gris azul oscuro transparente
  const COLOR_FERIADO = 'rgba(211, 183, 160, 0.25)'; // Beige metálico para feriados
  const COLOR_FERIADO_NACIONAL = 'rgba(142, 22, 26, 0.25)'; // Granate para feriados nacionales
  const COLOR_TEXTO_BLOQUEADO = '#34495e';
  const COLOR_TEXTO_NORMAL = '#2c3e50';
  const COLOR_TEXTO_FERIADO = '#8e161a';
  const COLOR_PASADO = 'rgba(44, 62, 80, 0.1)'; // Gris azul oscuro transparente
  const COLOR_FUTURO_LIMITE = 'rgba(52, 73, 94, 0.1)'; // Gris azul medio transparente

  useEffect(() => {
    console.log('📅 Calendario cambió a:', calendarMonth);
    console.log('🎉 Estado actual de holidays:', holidays.length, 'feriados');
    loadAppointments();
    loadBlockedDates();
    loadHolidays();
  }, [calendarMonth]);

  // Debug: Mostrar estado actual
  useEffect(() => {
    console.log('🔍 Estado actualizado:');
    console.log('- Holidays cargados:', holidays.length);
    console.log('- Appointments:', appointments.length);
    console.log('- Eventos de feriados que se van a mostrar:', holidays.map(h => h.name));
  }, [holidays, appointments]);

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

  const loadBlockedDates = async () => {
    try {
      // Usar el contexto global para obtener fechas bloqueadas
      const blockedDatesList = getBlockedDates();
      setBlockedDates(blockedDatesList);
      
    } catch (error) {
      console.error('Error loading blocked dates:', error);
    }
  };

  const loadHolidays = async () => {
    try {
      const year = calendarMonth.getFullYear();
      const month = calendarMonth.getMonth() + 1;
      console.log(`🎉 Cargando feriados para ${month}/${year}...`);
      
      // Usar servicio local para garantizar que siempre funcione
      const holidaysData = holidayLocalService.getHolidaysForMonth(year, month, 'Lima');
      console.log('🎉 Feriados cargados (servicio local):', holidaysData.length, 'encontrados');
      console.log('🎉 Detalle de feriados:', holidaysData);
      setHolidays(holidaysData);
      
      // También intentar cargar desde API si está disponible
      try {
        const connectionOk = await holidayPublicService.testConnection();
        if (connectionOk) {
          const apiHolidays = await holidayPublicService.getHolidaysForMonth(year, month, 'Lima');
          if (apiHolidays.length > 0) {
            console.log('✅ También cargados desde API:', apiHolidays.length);
            setHolidays(apiHolidays); // Usar los de la API si están disponibles
          }
        }
      } catch (apiError) {
        console.warn('⚠️ API no disponible, usando feriados locales:', apiError);
      }
    } catch (error) {
      console.error('❌ Error loading holidays:', error);
      // Como fallback, usar todos los feriados locales
      setHolidays(holidayLocalService.getAllHolidays());
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
    const dateString = toLocalDateString(date);
    return appointments.filter(appointment => appointment.date === dateString);
  };

  const getUpcomingAppointments = () => {
    const today = new Date();
    return appointments
      .filter(appointment => parseLocalDate(appointment.date) >= today)
      .sort((a, b) => parseLocalDate(a.date).getTime() - parseLocalDate(b.date).getTime())
      .slice(0, 5);
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

  // Transformar citas a eventos para Big Calendar
  const appointmentEvents: Event[] = appointments.map((appointment) => ({
    id: appointment.id,
    title: `${appointment.psychologist_name} (${appointment.status})`,
    start: parseLocalDateTime(appointment.date, appointment.time),
    end: parseLocalDateTime(appointment.date, appointment.time),
    resource: { type: 'appointment', data: appointment },
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

  // Combinar todos los eventos
  const events: Event[] = [...appointmentEvents, ...holidayEvents];

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

  // Lógica de validación igual al psicólogo
  const handleDateClick = (slotInfo: any) => {
    if (slotInfo && slotInfo.start) {
      const selected = new Date(slotInfo.start.getFullYear(), slotInfo.start.getMonth(), slotInfo.start.getDate());
      const today = new Date();
      const peruTime = new Date(today.toLocaleString("en-US", {timeZone: "America/Lima"}));
      const todayStart = startOfDay(peruTime);
      const futureLimit = addDays(todayStart, 14);
      const dayOfWeek = selected.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isToday = selected.toDateString() === peruTime.toDateString();
      
      // Verificar si es feriado
      const holiday = holidayLocalService.isHolidayDate(selected, holidays);
      if (holiday) {
        const scope = holiday.is_national ? 'Nacional' : `Regional (${holiday.region})`;
        setError(`🎉 FERIADO ${scope.toUpperCase()}: ${holiday.name} - No se atiende en días feriados. ${holiday.description}`);
        return;
      }
      
      // Validaciones
      if (isWeekend) {
        setError('❌ FECHA NO VÁLIDA: No se pueden agendar citas en fines de semana. Solo se atiende de lunes a viernes.');
        return;
      }
      if (isBefore(selected, todayStart)) {
        setError('❌ FECHA NO VÁLIDA: No se pueden agendar citas en días pasados. Solo se permiten fechas futuras.');
        return;
      }
      if (isAfter(selected, futureLimit)) {
        setError('❌ FECHA NO VÁLIDA: Solo se pueden agendar citas hasta 2 semanas en adelante. Esta fecha está fuera del límite permitido.');
        return;
      }
      if (isToday) {
        const currentTime = peruTime.getHours() * 60 + peruTime.getMinutes();
        const cutoffTime = 13 * 60 + 10;
        if (currentTime > cutoffTime) {
          setError('❌ FECHA NO VÁLIDA: El horario de agendamiento para el día actual ha finalizado (13:10). Por favor, selecciona un día futuro.');
          return;
        }
      }
      setError('');
      setSelectedDate(selected);
    }
  };

  // Navegación de meses: solo desde el mes actual en adelante
  const goToPreviousMonth = () => {
    const today = new Date();
    const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    setCalendarMonth(prev => {
      const previousMonth = new Date(prev.getFullYear(), prev.getMonth() - 1, 1);
      if (previousMonth < currentMonthStart) {
        setError('No puedes navegar a meses anteriores. Solo se permiten fechas desde este mes en adelante.');
        return prev;
      }
      return previousMonth;
    });
  };
  const goToNextMonth = () => {
    setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };
  const goToToday = () => {
    const today = new Date();
    setCalendarMonth(new Date(today.getFullYear(), today.getMonth(), 1));
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
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}
      <Card className="p-6">
        <BigCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          selectable
          style={{ height: 600, background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.07)', border: '1px solid #e5e7eb', fontFamily: 'Inter, sans-serif' }}
          messages={customMessages}
          formats={{
            ...customFormats,
            monthHeader: (date: Date) => {
              // Mostrar el mes y año en español
              return date.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
            },
            weekdayFormat: (date: Date) => {
              // Mostrar el nombre del día en español
              return date.toLocaleString('es-ES', { weekday: 'long' });
            }
          }}
          views={['month']}
          onSelectSlot={handleDateClick}
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
                    ? '0 6px 20px rgba(251, 191, 36, 0.6)'
                    : '0 6px 20px rgba(168, 85, 247, 0.6)',
                  minHeight: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                  transform: 'scale(1.02)'
                } 
              };
            }
            
            // Si es una cita
            if (event.resource?.data?.status === 'confirmada') {
              return { 
                style: { 
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.9) 0%, rgba(220, 38, 38, 0.8) 100%)',
                  color: '#ffffff',
                  borderRadius: 8,
                  border: '2px solid #dc2626',
                  fontWeight: 700,
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)'
                } 
              };
            }
            return { 
              style: { 
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.9) 0%, rgba(22, 163, 74, 0.8) 100%)',
                color: '#ffffff',
                borderRadius: 8,
                border: '2px solid #16a34a',
                fontWeight: 700,
                boxShadow: '0 4px 12px rgba(34, 197, 94, 0.4)'
              } 
            };
          }}
          dayPropGetter={(date: any) => {
            const today = new Date();
            const peruTime = new Date(today.toLocaleString("en-US", {timeZone: "America/Lima"}));
            const todayStart = startOfDay(peruTime);
            const futureLimit = addDays(todayStart, 14);
            const dayOfWeek = date.getDay();
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            
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
            
            if (isWeekend) {
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
      
      {/* Estilos CSS específicos para feriados */}
      <style>{`
        .rbc-calendar .rbc-date-cell:has(.holiday-marker) {
          position: relative;
        }
        
        .holiday-marker {
          position: absolute;
          top: 2px;
          right: 2px;
          width: 8px;
          height: 8px;
          background-color: #dc3545;
          border-radius: 50%;
          z-index: 10;
        }
        
        .holiday-marker.regional {
          background-color: #ffc107;
        }
        
        .rbc-event.holiday-event {
          background-color: ${COLOR_FERIADO_NACIONAL} !important;
          color: ${COLOR_TEXTO_FERIADO} !important;
          border: 2px solid #dc3545 !important;
          font-weight: 700 !important;
          text-shadow: 0 1px 2px rgba(0,0,0,0.1) !important;
        }
        
        .rbc-event.holiday-event.regional {
          background-color: ${COLOR_FERIADO} !important;
          border: 2px solid #ffc107 !important;
        }
      `}</style>
    </div>
  );
}; 