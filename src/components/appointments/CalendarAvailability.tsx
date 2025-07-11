import React, { useEffect, useState } from 'react';
import { Calendar, AlertCircle, CheckCircle, Clock, Loader2, Lock } from 'lucide-react';
import { getAvailableSlots } from '../../services/appointments';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
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
}

export const CalendarAvailability: React.FC<CalendarAvailabilityProps> = ({ 
  psychologistId, 
  selectedDate, 
  onDateSelect 
}) => {
  const [monthDays, setMonthDays] = useState<DayAvailability[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

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
    if (!psychologistId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const lastDay = new Date(year, month + 1, 0);
      
      // Usar zona horaria de Perú
      const today = new Date();
      const peruTime = new Date(today.toLocaleString("en-US", {timeZone: "America/Lima"}));
      
      // Generar días del mes sin hacer llamadas individuales
      const days: DayAvailability[] = [];
      
      for (let d = 1; d <= lastDay.getDate(); d++) {
        const date = new Date(year, month, d);
        const dateStr = date.toISOString().split('T')[0];
        const isToday = date.toDateString() === peruTime.toDateString();
        const isPast = date < peruTime && !isToday;
        
        // Verificar si es fin de semana (sábado = 6, domingo = 0)
        const dayOfWeek = date.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        // Solo los días laborables (lunes a viernes) y futuros están disponibles
        let isAvailable = !isPast && !isWeekend;
        let isBlocked = isWeekend;
        let availableSlots = 0;
        
        days.push({ 
          date: dateStr, 
          isAvailable, 
          isBlocked, 
          availableSlots,
          isToday,
          isPast
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
      // Verificar si es fin de semana antes de hacer la llamada
      const dateObj = new Date(date);
      const dayOfWeek = dateObj.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      if (isWeekend) {
        // Para fines de semana, marcar como no disponible sin hacer llamada al servidor
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
      const todayStr = peruTime.toISOString().split('T')[0];
      
      if (date < todayStr) {
        // Para días pasados, marcar como no disponible
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
    
    // Precargar disponibilidad para los próximos 7 días laborables
    for (let i = 0; i < 14; i++) { // Revisar más días para encontrar 7 laborables
      const date = new Date(peruTime.getTime() + i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      
      // Verificar si es día laborable (lunes a viernes)
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      // Solo verificar si el día está en el mes actual y es laborable
      if (date.getMonth() === currentMonth.getMonth() && 
          date.getFullYear() === currentMonth.getFullYear() && 
          !isWeekend) {
        await checkDateAvailability(dateStr);
      }
    }
  };

  const handleDateClick = async (date: string, isAvailable: boolean) => {
    // Verificar si es fin de semana
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    if (isWeekend) {
      setError('No se pueden agendar citas en fines de semana. Solo se atiende de lunes a viernes.');
      return;
    }
    
    if (isAvailable) {
      // Verificar disponibilidad real antes de seleccionar
      const realAvailability = await checkDateAvailability(date);
      if (realAvailability) {
        onDateSelect(date);
      }
    }
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
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

  // Transformar días a eventos para Big Calendar
  const events: Event[] = monthDays.map(day => {
    if (diasOcupados.includes(day.date)) {
      return {
        id: day.date,
        title: '',
        start: new Date(day.date),
        end: new Date(day.date),
        allDay: true,
        resource: { ...day, ocupado: true },
      };
    }
    if (day.isAvailable) {
      return {
        id: day.date,
        title: '',
        start: new Date(day.date),
        end: new Date(day.date),
        allDay: true,
        resource: { ...day, ocupado: false },
      };
    }
    return null;
  }).filter(Boolean) as Event[];

  const handleSelectSlot = (slotInfo: any) => {
    const dateStr = slotInfo.start.toISOString().split('T')[0];
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

  // Colores y gradientes para los estados
  const COLOR_DISPONIBLE = 'linear-gradient(135deg, #1db954 60%, #43e97b 100%)';
  const COLOR_OCUPADO = 'linear-gradient(135deg, #8e161a 60%, #b31217 100%)';
  const COLOR_BLOQUEADO = 'rgba(200,200,200,0.35)';
  const COLOR_TEXTO_BLOQUEADO = '#b0b0b0';
  const COLOR_TEXTO_NORMAL = '#222';
  const COLOR_TEXTO_OCUPADO = '#fff';
  const COLOR_BORDE_ACTUAL = '#2563eb'; // azul institucional
  const COLOR_BORDE_SELECCIONADO = '#8e161a'; // granate

  // Día actual y seleccionado
  const today = new Date();
  const isSameDay = (date1: Date, date2: Date) =>
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate();

  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold flex items-center mb-4">
          <Calendar className="w-5 h-5 mr-2 text-[#8e161a]" />
          Selecciona un día disponible
        </h3>
      <BigCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        selectable
        style={{ height: 500, background: '#fff', borderRadius: 20, boxShadow: '0 4px 32px rgba(0,0,0,0.10)', border: '1px solid #e5e7eb', fontFamily: 'Inter, sans-serif', padding: 8 }}
        messages={customMessages}
        formats={customFormats}
        views={['month']}
        onSelectSlot={handleSelectSlot}
        eventPropGetter={(event: any) => {
          if (event.resource.ocupado) {
            // Ocupado: gradiente granate oscuro
            return { style: { background: COLOR_OCUPADO, color: COLOR_TEXTO_OCUPADO, borderRadius: 12, border: 'none', fontWeight: 700, transition: 'background 0.3s, color 0.3s' } };
          }
          // Disponible: gradiente verde
          return { style: { background: COLOR_DISPONIBLE, color: COLOR_TEXTO_NORMAL, borderRadius: 12, border: 'none', fontWeight: 700, transition: 'background 0.3s, color 0.3s' } };
        }}
        dayPropGetter={(date: any) => {
          const day = date.getDay();
          let style: any = { fontWeight: 700, fontSize: 18, transition: 'all 0.2s' };
          if (day === 0 || day === 6) {
            style.background = COLOR_BLOQUEADO;
            style.color = COLOR_TEXTO_BLOQUEADO;
            style.pointerEvents = 'none';
            style.opacity = 1;
            style.cursor = 'not-allowed';
          }
          if (isSameDay(date, today)) {
            style.border = `2px solid ${COLOR_BORDE_ACTUAL}`;
            style.borderRadius = 12;
          }
          // Puedes agregar lógica para día seleccionado si tienes un estado para ello
          return { style };
        }}
        components={{
          event: () => null // No mostrar badges ni íconos
        }}
      />
      {/* Leyenda visual profesional */}
      <div className="flex gap-6 mt-6 text-base items-center justify-center">
        <div className="flex items-center gap-2"><span className="inline-block w-5 h-5 rounded-full" style={{background: 'linear-gradient(135deg, #1db954 60%, #43e97b 100%)', boxShadow: '0 2px 8px #1db95444'}}></span> Disponible</div>
        <div className="flex items-center gap-2"><span className="inline-block w-5 h-5 rounded-full" style={{background: 'linear-gradient(135deg, #8e161a 60%, #b31217 100%)', boxShadow: '0 2px 8px #8e161a44'}}></span> Ocupado</div>
        <div className="flex items-center gap-2"><span className="inline-block w-5 h-5 rounded-full bg-gray-300"></span> No disponible</div>
        <div className="flex items-center gap-2"><span className="inline-block w-5 h-5 rounded-full border-2 border-blue-600"></span> Día actual</div>
      </div>
    </Card>
  );
};
