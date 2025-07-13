import React, { useEffect, useState } from 'react';
import { Calendar, AlertCircle, CheckCircle, Clock, Loader2, Lock, Info } from 'lucide-react';
import { getAvailableSlots } from '../../services/appointments';
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
      const todayStart = startOfDay(peruTime);
      
      // Calcular límite de 2 semanas (14 días) desde hoy
      const futureLimit = addDays(todayStart, 14);
      
      // Generar días del mes con validaciones mejoradas
      const days: DayAvailability[] = [];
      
      for (let d = 1; d <= lastDay.getDate(); d++) {
        const date = new Date(year, month, d);
        const dateStr = date.toISOString().split('T')[0];
        const isToday = date.toDateString() === peruTime.toDateString();
        const isPast = isBefore(date, todayStart) && !isToday;
        const isFutureLimit = isAfter(date, futureLimit);
        
        // Verificar si es fin de semana (sábado = 6, domingo = 0)
        const dayOfWeek = date.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        
        // Solo los días laborables (lunes a viernes), futuros y dentro del límite están disponibles
        let isAvailable = !isPast && !isWeekend && !isFutureLimit;
        let isBlocked = isWeekend || isPast || isFutureLimit;
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
      const todayStart = startOfDay(peruTime);
      const dateToCheck = new Date(date);
      
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
    
    // Verificar si es un día pasado
    const today = new Date();
    const peruTime = new Date(today.toLocaleString("en-US", {timeZone: "America/Lima"}));
    const todayStart = startOfDay(peruTime);
    
    if (isBefore(dateObj, todayStart)) {
      setError('No se pueden agendar citas en días pasados.');
      return;
    }
    
    // Verificar límite de 2 semanas
    const futureLimit = addDays(todayStart, 14);
    if (isAfter(dateObj, futureLimit)) {
      setError('Solo se pueden agendar citas hasta 2 semanas en adelante.');
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

  // Nuevos colores modernos y atractivos con transparencia
  const COLOR_DISPONIBLE = 'rgba(16, 185, 129, 0.15)'; // Verde transparente
  const COLOR_OCUPADO = 'rgba(220, 38, 38, 0.15)'; // Rojo transparente
  const COLOR_BLOQUEADO = 'rgba(156, 163, 175, 0.15)'; // Gris transparente
  const COLOR_PASADO = 'rgba(107, 114, 128, 0.15)'; // Gris oscuro transparente
  const COLOR_FUTURO_LIMITE = 'rgba(245, 158, 11, 0.15)'; // Naranja transparente
  const COLOR_TEXTO_BLOQUEADO = '#6b7280';
  const COLOR_TEXTO_NORMAL = '#1f2937';
  const COLOR_TEXTO_OCUPADO = '#dc2626';
  const COLOR_BORDE_ACTUAL = '#3b82f6';
  const COLOR_BORDE_SELECCIONADO = '#8e161a';

  // Día actual y seleccionado
  const today = new Date();
  const isSameDay = (date1: Date, date2: Date) =>
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate();

  return (
    <Card className="p-6 bg-gradient-to-br from-white to-gray-50">
      <div className="mb-6">
        <h3 className="text-xl font-bold flex items-center mb-2 text-gray-800">
          <Calendar className="w-6 h-6 mr-3 text-[#8e161a]" />
          Selecciona un día disponible
        </h3>
        <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
          <Info className="w-4 h-4 text-blue-600" />
          <span>Solo puedes agendar citas hasta 2 semanas en adelante, de lunes a viernes</span>
        </div>
      </div>
      
      <BigCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        selectable
        style={{ 
          height: 500, 
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', 
          borderRadius: 24, 
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)', 
          border: '1px solid #e2e8f0', 
          fontFamily: 'Inter, sans-serif', 
          padding: 16,
          overflow: 'hidden'
        }}
        messages={customMessages}
        formats={customFormats}
        views={['month']}
        onSelectSlot={handleSelectSlot}
        eventPropGetter={() => ({ style: { display: 'none' } }) // Ocultar eventos visuales, solo fondo de celda
        }
        dayPropGetter={(date: any) => {
          const dateStr = date.toISOString().split('T')[0];
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

          // Fin de semana
          if (date.getDay() === 0 || date.getDay() === 6) {
            style.background = COLOR_BLOQUEADO;
            style.color = COLOR_TEXTO_BLOQUEADO;
            style.pointerEvents = 'none';
            style.opacity = 0.7;
            style.cursor = 'not-allowed';
          } else if (dayData?.isPast) {
            style.background = COLOR_PASADO;
            style.color = COLOR_TEXTO_BLOQUEADO;
            style.cursor = 'not-allowed';
            style.opacity = 0.7;
          } else if (dayData?.isFutureLimit) {
            style.background = COLOR_FUTURO_LIMITE;
            style.color = COLOR_TEXTO_NORMAL;
            style.cursor = 'not-allowed';
            style.opacity = 0.8;
          } else if (dayData?.isAvailable) {
            style.background = COLOR_DISPONIBLE;
            style.color = COLOR_TEXTO_NORMAL;
            style.cursor = 'pointer';
            style.opacity = 1;
            style.boxShadow = '0 4px 16px rgba(16,185,129,0.10)';
          } else if (dayData && !dayData.isAvailable) {
            style.background = COLOR_OCUPADO;
            style.color = COLOR_TEXTO_OCUPADO;
            style.cursor = 'not-allowed';
            style.opacity = 1;
            style.boxShadow = '0 4px 16px rgba(220,38,38,0.10)';
          }

          // Día actual
          if (isSameDay(date, today)) {
            style.border = `2px solid ${COLOR_BORDE_ACTUAL}`;
            style.boxShadow = `0 0 0 2px rgba(59, 130, 246, 0.10)`;
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
        components={{
          event: () => null // No mostrar badges ni íconos
        }}
      />
      
      {/* Leyenda visual mejorada */}
      <div className="mt-8 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
        <h4 className="text-base font-semibold text-gray-800 mb-4 flex items-center">
          <Info className="w-5 h-5 mr-2 text-blue-600" />
          Leyenda de disponibilidad
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Columna 1 - Estados principales */}
          <div className="space-y-3">
            <h5 className="text-sm font-medium text-gray-700 mb-3">Estados principales</h5>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{background: COLOR_DISPONIBLE, color: '#065f46'}}>
                  15
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Disponible</span>
                  <p className="text-xs text-gray-500">Puedes agendar cita</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{background: COLOR_OCUPADO, color: '#991b1b'}}>
                  20
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Ocupado</span>
                  <p className="text-xs text-gray-500">No hay horarios disponibles</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Columna 2 - Restricciones */}
          <div className="space-y-3">
            <h5 className="text-sm font-medium text-gray-700 mb-3">Restricciones</h5>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{background: COLOR_BLOQUEADO, color: '#374151'}}>
                  22
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Fin de semana</span>
                  <p className="text-xs text-gray-500">No se atiende</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{background: COLOR_PASADO, color: '#374151'}}>
                  10
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Día pasado</span>
                  <p className="text-xs text-gray-500">No disponible</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Columna 3 - Límites */}
          <div className="space-y-3">
            <h5 className="text-sm font-medium text-gray-700 mb-3">Límites de tiempo</h5>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{background: COLOR_FUTURO_LIMITE, color: '#92400e'}}>
                  30
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Fuera de límite</span>
                  <p className="text-xs text-gray-500">Más de 2 semanas</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold border-2 border-blue-500 text-blue-600">
                  15
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Día actual</span>
                  <p className="text-xs text-gray-500">Hoy</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Información adicional */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Info className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h6 className="text-sm font-semibold text-blue-800 mb-1">Información importante</h6>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Solo se pueden agendar citas hasta 2 semanas en adelante</li>
                <li>• El horario de atención es de lunes a viernes</li>
                <li>• Los fines de semana no se atiende</li>
                <li>• No se pueden agendar citas en días pasados</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-3" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}
    </Card>
  );
};
