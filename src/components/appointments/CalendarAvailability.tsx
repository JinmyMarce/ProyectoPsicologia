import React, { useEffect, useState } from 'react';
import { Calendar, AlertCircle, CheckCircle, Clock, Loader2, Lock, Info, Star } from 'lucide-react';
import { getAvailableSlots } from '../../services/appointments';
import { holidayLocalService } from '../../services/holidaysLocal';
import { Holiday } from '../../services/holidays';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Calendar as BigCalendar, dateFnsLocalizer, Event } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, parse, startOfWeek, getDay, addDays, isAfter, isBefore, startOfDay } from 'date-fns';
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

interface CalendarAvailabilityProps {
  psychologistId: string;
  selectedDate: string;
  onDateSelect: (date: string) => void;
}

interface DayAvailability {
  date: string;
  isAvailable: boolean;
  isBlocked: boolean;
  availableSlots: number;
  isToday: boolean;
  isPast: boolean;
  isFutureLimit: boolean; // Nueva propiedad para días fuera del límite de 2 semanas
}

export const CalendarAvailability: React.FC<CalendarAvailabilityProps> = ({ 
  psychologistId, 
  selectedDate, 
  onDateSelect 
}) => {
  const [monthDays, setMonthDays] = useState<DayAvailability[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1); // Comenzar desde este mes actual
  });

  useEffect(() => {
    if (psychologistId) {
      loadMonthAvailability();
    }
  }, [psychologistId, currentMonth]);

  useEffect(() => {
    if (psychologistId && monthDays.length > 0) {
      preloadAvailability();
    }
  }, [psychologistId, monthDays.length]);

  const loadMonthAvailability = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      
      // Cargar feriados para el mes actual
      const holidaysData = holidayLocalService.getHolidaysForMonth(year, month + 1, 'Lima');
      console.log('🎉 [CALENDARIO DISPONIBILIDAD] Feriados cargados:', holidaysData.length, 'encontrados');
      setHolidays(holidaysData);
      const lastDay = new Date(year, month + 1, 0);
      
      // Usar zona horaria de Perú
      const today = new Date();
      const peruTime = new Date(today.toLocaleString("en-US", {timeZone: "America/Lima"}));
      const todayStart = startOfDay(peruTime);
      
      // Calcular límite de 2 semanas (14 días) desde hoy
      const futureLimit = addDays(todayStart, 14);
      
      // Verificar horario de corte para el día actual (13:10)
      const currentTime = peruTime.getHours() * 60 + peruTime.getMinutes(); // Convertir a minutos
      const cutoffTime = 13 * 60 + 10; // 13:10 en minutos
      const isAfterCutoff = currentTime > cutoffTime;
      
      // Generar días del mes con validaciones mejoradas
      const days: DayAvailability[] = [];
      
      for (let d = 1; d <= lastDay.getDate(); d++) {
        const date = new Date(year, month, d);
        const dateStr = toLocalDateString(date);
        const isToday = date.toDateString() === peruTime.toDateString();
        const isPast = isBefore(date, todayStart) && !isToday;
        const isFutureLimit = isAfter(date, futureLimit);
        
        // Verificar si es fin de semana (sábado = 6, domingo = 0) - BLOQUEADO PERMANENTEMENTE
        const dayOfWeek = date.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        
        // Verificar si es feriado
        const isHoliday = holidayLocalService.isHolidayDate(date, holidaysData) !== null;
        
        // Aplicar restricciones adicionales para el día actual
        let isTodayBlocked = false;
        if (isToday && isAfterCutoff) {
          isTodayBlocked = true;
        }
        
        // Solo los días laborables (lunes a viernes), futuros y dentro del límite están disponibles
        // Los fines de semana y feriados están BLOQUEADOS PERMANENTEMENTE para todos los años
        // El día actual se bloquea si ya pasó el horario de corte
        let isAvailable = !isPast && !isWeekend && !isHoliday && !isFutureLimit && !isTodayBlocked;
        let isBlocked = isWeekend || isHoliday || isPast || isFutureLimit || isTodayBlocked;
        let availableSlots = 0;
        
        days.push({ 
          date: dateStr, 
          isAvailable, 
          isBlocked, 
          availableSlots,
          isToday,
          isPast,
          isFutureLimit
        });
      }
      
      setMonthDays(days);
    } catch (err) {
      console.error('Error loading month availability:', err);
      setError('Error al cargar la disponibilidad del calendario');
    } finally {
      setLoading(false);
    }
  };

  // Función para verificar disponibilidad de una fecha específica
  const checkDateAvailability = async (date: string) => {
    if (!psychologistId) return;
    
    try {
      // Verificar si es fin de semana antes de hacer la llamada - BLOQUEADO PERMANENTEMENTE
      const dateObj = parseLocalDate(date);
      const dayOfWeek = dateObj.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      if (isWeekend) {
        // Para fines de semana, marcar como no disponible sin hacer llamada al servidor
        // Los fines de semana están BLOQUEADOS PERMANENTEMENTE para todos los años
        setMonthDays(prev => prev.map(day => 
          day.date === date 
            ? { ...day, isAvailable: false, availableSlots: 0 }
            : day
        ));
        return false;
      }
      
      // Verificar si es un día pasado usando zona horaria de Perú
      const today = new Date();
      const peruTime = new Date(today.toLocaleString("en-US", {timeZone: "America/Lima"}));
      const todayStart = startOfDay(peruTime);
      const dateToCheck = parseLocalDate(date);
      
      if (isBefore(dateToCheck, todayStart)) {
        // Para días pasados, marcar como no disponible
        setMonthDays(prev => prev.map(day => 
          day.date === date 
            ? { ...day, isAvailable: false, availableSlots: 0 }
            : day
        ));
        return false;
      }
      
      // Verificar límite de 2 semanas
      const futureLimit = addDays(todayStart, 14);
      if (isAfter(dateToCheck, futureLimit)) {
        // Para días fuera del límite, marcar como no disponible
        setMonthDays(prev => prev.map(day => 
          day.date === date 
            ? { ...day, isAvailable: false, availableSlots: 0 }
            : day
        ));
        return false;
      }
      
      const slots = await getAvailableSlots(parseInt(psychologistId), date);
      const availableSlots = Array.isArray(slots) ? slots.filter(slot => slot.available).length : 0;
      const isAvailable = availableSlots > 0;
      
      // Actualizar el estado del día específico
      setMonthDays(prev => prev.map(day => 
        day.date === date 
          ? { ...day, isAvailable, availableSlots }
          : day
      ));
      
      return isAvailable;
    } catch (error: any) {
      // No mostrar error en consola para casos esperados (fines de semana, días pasados)
      if (error?.response?.status !== 422) {
        console.error(`Error checking availability for ${date}:`, error);
      }
      
      // Marcar como no disponible en caso de error
      setMonthDays(prev => prev.map(day => 
        day.date === date 
          ? { ...day, isAvailable: false, availableSlots: 0 }
          : day
      ));
      
      return false;
    }
  };

  // Función para precargar disponibilidad de días próximos
  const preloadAvailability = async () => {
    if (!psychologistId) return;
    
    // Usar zona horaria de Perú
    const today = new Date();
    const peruTime = new Date(today.toLocaleString("en-US", {timeZone: "America/Lima"}));
    const todayStart = startOfDay(peruTime);
    
    // Precargar disponibilidad para los próximos 14 días (límite de 2 semanas)
    for (let i = 0; i < 14; i++) {
      const date = addDays(todayStart, i);
      const dateStr = toLocalDateString(date);
      
      // Verificar si es día laborable (lunes a viernes) - BLOQUEADO PERMANENTEMENTE
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      // Solo verificar si el día está en el mes actual y es laborable
      // Los fines de semana están BLOQUEADOS PERMANENTEMENTE para todos los años
      if (date.getMonth() === currentMonth.getMonth() && 
          date.getFullYear() === currentMonth.getFullYear() && 
          !isWeekend) {
        await checkDateAvailability(dateStr);
      }
    }
  };

  const handleDateClick = async (slotInfo: any) => {
    // Verificar si es fin de semana - BLOQUEADO PERMANENTEMENTE
    const dateStr = toLocalDateString(slotInfo.start);
    const dateObj = parseLocalDate(dateStr);
    const dayOfWeek = dateObj.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    if (isWeekend) {
      setError('❌ FECHA NO VÁLIDA: No se pueden agendar citas en fines de semana. Solo se atiende de lunes a viernes.');
      return;
    }
    
    // Verificar si es un día pasado
    const today = new Date();
    const peruTime = new Date(today.toLocaleString("en-US", {timeZone: "America/Lima"}));
    const todayStart = startOfDay(peruTime);
    
    if (isBefore(dateObj, todayStart)) {
      setError('❌ FECHA NO VÁLIDA: No se pueden agendar citas en días pasados. Solo se permiten fechas futuras.');
      return;
    }
    
    // Verificar límite de 2 semanas
    const futureLimit = addDays(todayStart, 14);
    if (isAfter(dateObj, futureLimit)) {
      setError('❌ FECHA NO VÁLIDA: Solo se pueden agendar citas hasta 2 semanas en adelante. Esta fecha está fuera del límite permitido.');
      return;
    }
    
    // Verificar horario de corte para el día actual (13:10)
    const isToday = dateObj.toDateString() === peruTime.toDateString();
    if (isToday) {
      const currentTime = peruTime.getHours() * 60 + peruTime.getMinutes(); // Convertir a minutos
      const cutoffTime = 13 * 60 + 10; // 13:10 en minutos
      
      if (currentTime > cutoffTime) {
        setError('❌ FECHA NO VÁLIDA: El horario de agendamiento para el día actual ha finalizado (13:10). Por favor, selecciona un día futuro.');
        return;
      }
    }
    
    const day = monthDays.find(d => d.date === dateStr);
    if (day && day.isAvailable) {
      onDateSelect(dateStr);
    }
  };

  const goToPreviousMonth = () => {
    const today = new Date();
    const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    
    setCurrentMonth(prev => {
      const previousMonth = new Date(prev.getFullYear(), prev.getMonth() - 1, 1);
      // No permitir navegar a meses anteriores al mes actual
      if (previousMonth < currentMonthStart) {
        setError('❌ FECHA NO VÁLIDA: No puedes navegar a meses anteriores. Solo se permiten fechas desde este mes en adelante.');
        return prev;
      }
      return previousMonth;
    });
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const dayNamesFull = [
    'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'
  ];

  const customFormats = {
    weekdayFormat: (date: Date) => dayNamesFull[date.getDay()]
  };

  // Simulación de días ocupados para ejemplo visual (puedes reemplazar por tu lógica real)
  const diasOcupados = [
    '2025-07-10', '2025-07-14', '2025-07-15', '2025-07-16', '2025-07-17',
    '2025-07-21', '2025-07-22', '2025-07-23', '2025-07-24',
    '2025-07-28', '2025-07-29', '2025-07-30'
  ];

  // Transformar días a eventos para FullCalendar
  const events: any[] = monthDays.map(day => {
    if (diasOcupados.includes(day.date)) {
      return {
        id: day.date,
        title: '',
        start: parseLocalDateTime(day.date, '00:00'),
        end: parseLocalDateTime(day.date, '23:59'),
        allDay: true,
        resource: { ...day, ocupado: true },
      };
    }
    if (day.isAvailable) {
      return {
        id: day.date,
        title: '',
        start: parseLocalDateTime(day.date, '00:00'),
        end: parseLocalDateTime(day.date, '23:59'),
        allDay: true,
        resource: { ...day, ocupado: false },
      };
    }
    return null;
  }).filter(Boolean);

  // Transformar días disponibles a eventos para Big Calendar
  const availabilityEvents: Event[] = monthDays
    .filter(day => day.isAvailable)
    .map(day => ({
      id: `available-${day.date}`,
      title: `${day.availableSlots} horarios disponibles`,
      start: new Date(day.date),
      end: new Date(day.date),
      resource: { type: 'availability', data: day },
      allDay: true,
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

  // Combinar eventos de disponibilidad y feriados
  const allEvents = [...availabilityEvents, ...holidayEvents];

  const handleSelectSlot = (slotInfo: any) => {
    const dateStr = toLocalDateString(slotInfo.start);
    const day = monthDays.find(d => d.date === dateStr);
    if (day && day.isAvailable) {
      onDateSelect(dateStr);
    }
  };

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
    noEventsInRange: 'No hay disponibilidad en este rango',
  };

  // Colores claros y suaves con transparencia - Nueva paleta profesional
  const COLOR_DISPONIBLE = 'rgba(142, 22, 26, 0.3)'; // Granate institucional transparente
  const COLOR_OCUPADO = 'rgba(52, 73, 94, 0.3)'; // Gris azul medio transparente
  const COLOR_BLOQUEADO = 'rgba(44, 62, 80, 0.3)'; // Gris azul oscuro para fin de semana
  const COLOR_PASADO = 'rgba(30, 41, 59, 0.3)'; // Azul marino oscuro para días pasados // Púrpura claro para día pasado
  const COLOR_FUTURO_LIMITE = 'rgba(244, 211, 94, 0.3)'; // Mostaza transparente
  const COLOR_FERIADO = 'rgba(142, 22, 26, 0.4)'; // Granate para feriados nacionales
  const COLOR_FERIADO_REGIONAL = 'rgba(30, 41, 59, 0.4)'; // Azul marino para feriados regionales
  const COLOR_TEXTO_BLOQUEADO = '#64748b'; // Azul gris medio
  const COLOR_TEXTO_NORMAL = '#1e293b'; // Azul marino oscuro
  const COLOR_TEXTO_OCUPADO = '#b91c1c'; // Granate light para texto ocupado
  const COLOR_BORDE_ACTUAL = '#0369a1'; // Azul profesional para día actual
  const COLOR_BORDE_SELECCIONADO = '#8e161a'; // Granate oscuro para seleccionado

  // Día actual y seleccionado
  const today = new Date();
  const isSameDay = (date1: Date, date2: Date) =>
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate();

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
    <Card className="p-6 bg-gradient-to-br from-white to-gray-50">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold flex items-center text-gray-800">
            <Calendar className="w-6 h-6 mr-3 text-[#8e161a]" />
            Selecciona un día disponible
          </h3>
          {/* Elimino aquí la barra de navegación personalizada */}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
          <Info className="w-4 h-4 text-blue-600" />
          <span>Solo puedes agendar citas hasta 2 semanas en adelante, de lunes a viernes</span>
        </div>
      </div>
      <BigCalendar
        localizer={localizer}
        events={allEvents}
        startAccessor="start"
        endAccessor="end"
        selectable
        style={{ height: 600, background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.07)', border: '1px solid #e5e7eb', fontFamily: 'Inter, sans-serif' }}
        messages={customMessages}
        formats={{
          ...customFormats,
          monthHeader: (date: Date) => {
            return date.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
          },
          weekdayFormat: (date: Date) => {
            return date.toLocaleString('es-ES', { weekday: 'long' });
          }
        }}
        views={['month']}
        onSelectSlot={handleDateClick}
        eventPropGetter={() => ({ style: { display: 'none' } }) // Ocultar eventos visuales, solo fondo de celda
        }
        dayPropGetter={(date: any) => {
          const month = currentMonth.getMonth();
          const year = currentMonth.getFullYear();
          if (
            date.getFullYear() < year ||
            (date.getFullYear() === year && date.getMonth() < month)
          ) {
            return { style: { backgroundColor: 'transparent', color: COLOR_TEXTO_NORMAL } };
          }
          const today = new Date();
          const peruTime = new Date(today.toLocaleString("en-US", {timeZone: "America/Lima"}));
          const todayStart = startOfDay(peruTime);
          const twoWeeksLimit = addDays(todayStart, 14);
          // Solo colorea el primer día del límite
          if (
            date.getFullYear() === twoWeeksLimit.getFullYear() &&
            date.getMonth() === twoWeeksLimit.getMonth() &&
            date.getDate() === twoWeeksLimit.getDate()
          ) {
            return { style: { backgroundColor: COLOR_FUTURO_LIMITE, color: '#a16207', opacity: 1, cursor: 'not-allowed', fontWeight: 600 } };
          }
          // Días después del límite: sin color especial
          if (isAfter(date, twoWeeksLimit)) {
            return { style: { backgroundColor: 'transparent', color: COLOR_TEXTO_NORMAL, cursor: 'not-allowed', opacity: 0.7 } };
          }
          if (isBefore(date, todayStart) && date.getMonth() === month && date.getFullYear() === year) {
            return { style: { backgroundColor: COLOR_PASADO, color: COLOR_TEXTO_NORMAL } };
          }
          const dateStr = toLocalDateString(date);
          const dayData = monthDays.find(d => d.date === dateStr);
          let style: any = {
            fontWeight: 700,
            fontSize: 18,
            borderRadius: 12,
            minHeight: '60px',
            height: '60px',
            width: '100%',
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: 0,
            padding: 0,
            background: 'none',
            color: COLOR_TEXTO_NORMAL,
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            transition: 'background 0.3s, color 0.3s, box-shadow 0.3s',
            position: 'relative',
            cursor: 'pointer',
            zIndex: 0
          };

          // Aplicar colores según el estado del día (excepto para el día actual)
          if (isSameDay(date, today)) {
            // Para el día actual: solo borde azul, sin color de fondo
            style.background = 'transparent';
            style.color = COLOR_TEXTO_NORMAL;
            style.border = `2px solid ${COLOR_BORDE_ACTUAL}`;
            style.boxShadow = `0 4px 12px rgba(59, 130, 246, 0.3)`;
            style.cursor = dayData?.isAvailable ? 'pointer' : 'not-allowed';
            style.opacity = 1;
          } else {
            // Para otros días: aplicar colores normales
            if (dayData?.isPast) {
              style.background = COLOR_PASADO;
              style.color = '#34495e'; // Gris azul medio para día pasado
              style.cursor = 'not-allowed';
              style.opacity = 1;
            } else if (dayData?.isFutureLimit) {
              style.background = COLOR_FUTURO_LIMITE;
              style.color = '#2c3e50'; // Gris azul oscuro para fuera de límite
              style.cursor = 'not-allowed';
              style.opacity = 1;
            } else if (dayData?.isBlocked) {
              // Verificar si es feriado para darle color específico
              const holiday = holidayLocalService.isHolidayDate(date, holidays);
              if (holiday) {
                style.background = holiday.is_national ? COLOR_FERIADO : COLOR_FERIADO_REGIONAL;
                style.color = holiday.is_national ? '#8e161a' : '#d3b7a0';
                style.boxShadow = '0 4px 16px rgba(248,113,113,0.20)';
              } else {
                style.background = COLOR_BLOQUEADO;
                style.color = '#34495e'; // Gris azul medio para fin de semana
              }
              style.cursor = 'not-allowed';
              style.opacity = 1;
            } else if (dayData?.isAvailable) {
              style.background = COLOR_DISPONIBLE;
              style.color = '#8e161a'; // Granate institucional para disponible
              style.cursor = 'pointer';
              style.opacity = 1;
              style.boxShadow = '0 4px 16px rgba(142, 22, 26, 0.10)';
            } else {
              // Para días que no están disponibles pero no están bloqueados (ocupados)
              style.background = COLOR_OCUPADO;
              style.color = '#2c3e50'; // Gris azul oscuro para ocupado
              style.cursor = 'not-allowed';
              style.opacity = 1;
              style.boxShadow = '0 4px 16px rgba(52, 73, 94, 0.10)';
            }
          }

          // Efecto hover solo para días disponibles
          if (dayData?.isAvailable) {
            style[":hover"] = {
              background: 'rgba(16,185,129,0.25)',
              color: '#065f46',
              boxShadow: '0 6px 24px rgba(16,185,129,0.18)'
            };
          }

          return { style };
        }}
        eventPropGetter={() => ({ style: { display: 'none' } }) // Ocultar eventos visuales, solo fondo de celda
        }
        dayPropGetter={(date: any) => {
          const today = new Date();
          const peruTime = new Date(today.toLocaleString("en-US", {timeZone: "America/Lima"}));
          const todayStart = startOfDay(peruTime);
          const futureLimit = addDays(todayStart, 14);
          const dayOfWeek = date.getDay();
          
          // Verificar si es feriado
          const holiday = holidayLocalService.isHolidayDate(date, holidays);
          
          if (holiday) {
            // Día feriado: fondo especial con borde
            const isNational = holiday.is_national;
            return { 
              style: { 
                backgroundColor: isNational ? 'rgba(251, 191, 36, 0.25)' : 'rgba(168, 85, 247, 0.25)',
                color: isNational ? '#d97706' : '#7c3aed',
                fontWeight: 700,
                borderRadius: 12,
                boxShadow: isNational ? '0 4px 12px rgba(251, 191, 36, 0.3)' : '0 4px 12px rgba(168, 85, 247, 0.3)',
                border: isNational ? '2px solid #f59e0b' : '2px solid #8b5cf6',
                cursor: 'not-allowed',
                pointerEvents: 'none',
                position: 'relative'
              } 
            };
          }
          
          if (dayOfWeek === 0 || dayOfWeek === 6) {
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
          
          // Si es un evento de disponibilidad
          if (event.resource?.type === 'availability') {
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
                    padding: '4px',
                    fontSize: '10px',
                    fontWeight: 700,
                    textAlign: 'center',
                    lineHeight: '1.2',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '2px',
                    marginBottom: '2px'
                  }}>
                    <span style={{ fontSize: '8px' }}>⭐</span>
                    <span style={{ 
                      fontSize: '8px',
                      fontWeight: 800,
                      color: isNational ? '#92400e' : '#581c87'
                    }}>
                      {isNational ? 'NACIONAL' : 'REGIONAL'}
                    </span>
                  </div>
                  <div style={{
                    fontSize: '9px',
                    fontWeight: 600,
                    color: isNational ? '#92400e' : '#581c87',
                    wordBreak: 'break-word',
                    hyphens: 'auto',
                    maxHeight: '100%',
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical'
                  }}>
                    {holiday.name}
                  </div>
                </div>
              );
            }
            
            // Para otros eventos (disponibilidad)
            return (
              <div style={{ padding: '2px 4px', fontSize: '11px' }}>
                {props.title}
              </div>
            );
          }
        }}
      />
      {/* Leyenda visual mejorada con colores más atractivos */}
      <div className="mt-6 p-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl border border-blue-200 shadow-xl">
        <h4 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
          <span className="w-8 h-8 mr-3 text-blue-600">📅</span>
          Leyenda de Disponibilidad
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-white shadow-lg border border-green-200 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 border-2 border-green-600 shadow-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">✓</span>
            </div>
            <div>
              <span className="text-sm font-bold text-gray-800">Disponible</span>
              <p className="text-xs text-gray-600">Puedes agendar cita</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 p-4 rounded-xl bg-white shadow-lg border border-red-200 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-400 to-rose-500 border-2 border-red-600 shadow-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">✗</span>
            </div>
            <div>
              <span className="text-sm font-bold text-gray-800">Ocupado</span>
              <p className="text-xs text-gray-600">Cita ya agendada</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 p-4 rounded-xl bg-white shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-gray-400 to-slate-500 border-2 border-gray-600 shadow-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">⊘</span>
            </div>
            <div>
              <span className="text-sm font-bold text-gray-800">No disponible</span>
              <p className="text-xs text-gray-600">Bloqueado o fuera de límite</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 p-4 rounded-xl bg-white shadow-lg border border-orange-200 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 border-2 border-orange-600 shadow-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">⭐</span>
            </div>
            <div>
              <span className="text-sm font-bold text-gray-800">Feriado Nacional</span>
              <p className="text-xs text-gray-600">No se atiende en todo el país</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 p-4 rounded-xl bg-white shadow-lg border border-purple-200 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-400 to-violet-500 border-2 border-purple-600 shadow-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">⭐</span>
            </div>
            <div>
              <span className="text-sm font-bold text-gray-800">Feriado Regional</span>
              <p className="text-xs text-gray-600">Feriado específico de Lima</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 p-4 rounded-xl bg-white shadow-lg border border-yellow-200 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 border-2 border-yellow-600 shadow-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">☀</span>
            </div>
            <div>
              <span className="text-sm font-bold text-gray-800">Fin de semana</span>
              <p className="text-xs text-gray-600">No se atiende sábados ni domingos</p>
            </div>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="mt-4 bg-red-50 border-2 border-red-300 text-red-700 px-6 py-4 rounded-xl flex items-center shadow-lg animate-pulse">
          <AlertCircle className="w-6 h-6 mr-4 flex-shrink-0" />
          <div>
            <p className="text-lg font-bold">{error}</p>
            <p className="text-sm mt-1">Por favor, selecciona una fecha válida</p>
          </div>
        </div>
      )}
    </Card>
  );
};
