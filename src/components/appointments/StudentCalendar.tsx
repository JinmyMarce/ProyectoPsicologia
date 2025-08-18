import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { CheckCircle, XCircle, Clock as ClockIcon } from 'lucide-react';
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

  // Transformar feriados a eventos para Big Calendar
  const holidayEvents: Event[] = holidays.map((holiday) => {
    const holidayDate = new Date(holiday.date);
    return {
      id: `holiday-${holiday.id}`,
      title: `🎉 ${holiday.name}`,
      start: holidayDate,
      end: holidayDate,
      resource: { type: 'holiday', data: holiday },
      allDay: true,
    };
  });

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
            // Estilos para feriados
            if (event.resource?.type === 'holiday') {
              const holiday = event.resource.data;
              const backgroundColor = holiday.is_national ? COLOR_FERIADO_NACIONAL : COLOR_FERIADO;
              return { 
                style: { 
                  backgroundColor, 
                  color: COLOR_TEXTO_FERIADO, 
                  borderRadius: 8, 
                  border: 'none', 
                  fontWeight: 700,
                  fontSize: '12px',
                  textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                } 
              };
            }
            
            // Estilos para citas
            if (event.resource?.type === 'appointment') {
              const appointment = event.resource.data;
              if (appointment.status === 'confirmada') {
                return { style: { backgroundColor: COLOR_DISPONIBLE, color: COLOR_TEXTO_NORMAL, borderRadius: 8, border: 'none', fontWeight: 600 } };
              } else if (appointment.status === 'cancelada' || appointment.status === 'rechazada') {
                return { style: { backgroundColor: COLOR_OCUPADO, color: COLOR_TEXTO_NORMAL, borderRadius: 8, border: 'none', fontWeight: 600 } };
              }
            }
            
            // Estilo por defecto
            return { style: { backgroundColor: COLOR_DISPONIBLE, color: COLOR_TEXTO_NORMAL, borderRadius: 8, border: 'none', fontWeight: 600 } };
          }}
          dayPropGetter={(date: any) => {
            const currentMonth = calendarMonth.getMonth();
            const currentYear = calendarMonth.getFullYear();
            const dateStr = toLocalDateString(date);
            
            // Si el día pertenece a un mes diferente al mostrado actualmente, no aplicar color ni estilos
            if (
              date.getFullYear() !== currentYear ||
              date.getMonth() !== currentMonth
            ) {
              return { style: { backgroundColor: 'transparent', color: COLOR_TEXTO_NORMAL } };
            }
            
            // Verificar si el día es feriado
            const holiday = holidayLocalService.isHolidayDate(date, holidays);
            if (holiday) {
              console.log('🎉 DÍA FERIADO DETECTADO:', date, holiday.name);
              const backgroundColor = holiday.is_national ? COLOR_FERIADO_NACIONAL : COLOR_FERIADO;
              return { 
                style: { 
                  backgroundColor, 
                  color: COLOR_TEXTO_FERIADO, 
                  fontWeight: 700, 
                  borderRadius: 12, 
                  boxShadow: '0 4px 12px rgba(220, 53, 69, 0.3)', 
                  border: '2px solid #dc3545', 
                  cursor: 'pointer',
                  position: 'relative'
                } 
              };
            }

            // Verificar si el día está bloqueado por el psicólogo
            const isBlockedByPsychologist = blockedDates.includes(dateStr);
            if (isBlockedByPsychologist) {
              return { style: { backgroundColor: COLOR_OCUPADO, color: '#b91c1c', fontWeight: 600, borderRadius: 12, boxShadow: '0 4px 12px rgba(220, 38, 38, 0.2)', border: 'none', cursor: 'not-allowed' } };
            }
            
            // Lógica para el límite de 2 semanas
            const today = new Date();
            const peruTime = new Date(today.toLocaleString("en-US", {timeZone: "America/Lima"}));
            const todayStart = startOfDay(peruTime);
            const futureLimit = addDays(todayStart, 14);
            if (isAfter(date, futureLimit)) {
              // Día fuera del límite de agendamiento
              return { style: { backgroundColor: COLOR_FUTURO_LIMITE, color: COLOR_TEXTO_NORMAL, fontWeight: 600, opacity: 0.7, borderRadius: 12, boxShadow: '0 4px 12px rgba(253, 224, 71, 0.15)', border: 'none' } };
            }
            const day = date.getDay();
            if (day === 0 || day === 6) {
              return { style: { backgroundColor: COLOR_BLOQUEADO, color: COLOR_TEXTO_BLOQUEADO, pointerEvents: 'none', opacity: 1, cursor: 'not-allowed', fontWeight: 600, borderRadius: 12, boxShadow: '0 4px 12px rgba(253, 186, 116, 0.15)', border: 'none' } };
            }
            // Día pasado
            if (isBefore(date, todayStart)) {
              return { style: { backgroundColor: COLOR_PASADO, color: '#7c3aed', fontWeight: 600, borderRadius: 12, boxShadow: '0 4px 12px rgba(124, 58, 237, 0.15)', border: 'none', cursor: 'not-allowed' } };
            }
            // Día normal disponible
            return { style: { color: COLOR_TEXTO_NORMAL, fontWeight: 600, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: 'none' } };
          }}
        />
        {/* Leyenda visual igual que el psicólogo */}
        <div className="mt-8 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
          <h4 className="text-base font-semibold text-gray-800 mb-4 flex items-center">
            <span className="w-5 h-5 mr-2 text-blue-600">ℹ️</span>
            Leyenda de disponibilidad
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-3">
              <h5 className="text-sm font-medium text-gray-700 mb-3">Estados principales</h5>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{background: COLOR_DISPONIBLE, color: '#059669'}}></div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Disponible</span>
                    <p className="text-xs text-gray-500">Puedes agendar cita</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{background: COLOR_OCUPADO, color: '#b91c1c'}}></div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Ocupado/Bloqueado</span>
                    <p className="text-xs text-gray-500">No disponible o bloqueado por psicólogo</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h5 className="text-sm font-medium text-gray-700 mb-3">Restricciones</h5>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{background: COLOR_BLOQUEADO, color: '#d97706'}}></div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Fin de semana</span>
                    <p className="text-xs text-gray-500">No se atiende</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{background: COLOR_PASADO, color: '#7c3aed'}}></div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Día pasado</span>
                    <p className="text-xs text-gray-500">No disponible</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h5 className="text-sm font-medium text-gray-700 mb-3">Límites de tiempo</h5>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{background: COLOR_FUTURO_LIMITE, color: '#a16207'}}></div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Fuera de límite</span>
                    <p className="text-xs text-gray-500">Más de 2 semanas</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold border-2 border-blue-500 text-blue-600"></div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Día actual</span>
                    <p className="text-xs text-gray-500">Hoy</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h5 className="text-sm font-medium text-gray-700 mb-3">Feriados</h5>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{background: COLOR_FERIADO_NACIONAL, color: COLOR_TEXTO_FERIADO}}>🏛️</div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Feriado Nacional</span>
                    <p className="text-xs text-gray-500">No se atiende en todo el país</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{background: COLOR_FERIADO, color: COLOR_TEXTO_FERIADO}}>🏢</div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Feriado Regional</span>
                    <p className="text-xs text-gray-500">Feriado específico de Lima</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="w-4 h-4 text-blue-600">ℹ️</span>
              </div>
              <div>
                <h6 className="text-sm font-semibold text-blue-800 mb-1">Información importante</h6>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Solo puedes navegar y agendar desde este mes en adelante</li>
                  <li>• Solo se pueden agendar citas hasta 2 semanas en adelante</li>
                  <li>• El horario de atención es de lunes a viernes</li>
                  <li>• Los fines de semana y feriados no se atiende</li>
                  <li>• Los feriados nacionales y regionales están marcados automáticamente</li>
                  <li>• No se pueden agendar citas en días pasados</li>
                </ul>
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