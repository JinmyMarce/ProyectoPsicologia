import React, { useEffect, useState } from 'react';
import { Calendar, AlertCircle, CheckCircle, Loader2, Info, Search, User, Star } from 'lucide-react';
import { getAvailableSlots, createAppointment, searchStudent, Student } from '../../services/appointments';
import { getBlockedDatesForCalendar } from '../../services/schedule';
import { holidayService } from '../../services/holidays';
import { holidayLocalService } from '../../services/holidaysLocal';
import { Holiday } from '../../services/holidays';
import { useSchedule } from '../../contexts/ScheduleContext';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Calendar as BigCalendar, dateFnsLocalizer, Event } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, parse, startOfWeek, getDay, addDays, isAfter, isBefore, startOfDay } from 'date-fns';
import esES from 'date-fns/locale/es';
import { PageHeader } from '../ui/PageHeader';
import { TimeSelectionModal } from '../appointments/TimeSelectionModal';

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



interface DayAvailability {
  date: string;
  isAvailable: boolean;
  isBlocked: boolean;
  availableSlots: number;
  isToday: boolean;
  isPast: boolean;
  isFutureLimit: boolean;
}

interface AppointmentSlot {
  time: string;
  available: boolean;
  appointment?: any;
}

export const PsychologistCalendar: React.FC = () => {
  const { getBlockedDates } = useSchedule();
  const [monthDays, setMonthDays] = useState<DayAvailability[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1); // Comenzar desde este mes actual
  });
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'dni' | 'email'>('dni');
  const [searching, setSearching] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<AppointmentSlot[]>([]);
  const [selectedTime, setSelectedTime] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showTimeSelection, setShowTimeSelection] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);

  // Función para validar DNI (solo 8 números)
  const validateDNI = (value: string) => {
    if (searchType === 'dni') {
      // Solo permitir números y máximo 8 dígitos
      const numericValue = value.replace(/[^0-9]/g, '');
      return numericValue.slice(0, 8);
    }
    return value;
  };

  // Funciones utilitarias para fechas locales
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

  useEffect(() => {
    loadMonthAvailability();
    loadBlockedDates();
    loadHolidays();
  }, [currentMonth]);

  const loadMonthAvailability = async () => {
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
        
        // Aplicar restricciones adicionales para el día actual
        let isTodayBlocked = false;
        if (isToday && isAfterCutoff) {
          isTodayBlocked = true;
        }
        
        // Solo los días laborables (lunes a viernes), futuros y dentro del límite están disponibles
        // Los fines de semana están BLOQUEADOS PERMANENTEMENTE para todos los años
        // El día actual se bloquea si ya pasó el horario de corte
        let isAvailable = !isPast && !isWeekend && !isFutureLimit && !isTodayBlocked;
        let isBlocked = isWeekend || isPast || isFutureLimit || isTodayBlocked;
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
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;
      console.log(`🎉 [PSICÓLOGO] Cargando feriados para ${month}/${year}...`);
      
      // Usar servicio local para garantizar que siempre funcione
      const holidaysData = holidayLocalService.getHolidaysForMonth(year, month, 'Lima');
      console.log('🎉 [PSICÓLOGO] Feriados cargados:', holidaysData.length, 'encontrados');
      setHolidays(holidaysData);
    } catch (error) {
      console.error('❌ [PSICÓLOGO] Error loading holidays:', error);
      // Como fallback, usar todos los feriados locales
      setHolidays(holidayLocalService.getAllHolidays());
    }
  };

  const handleSearchStudent = async () => {
    if (!searchTerm.trim()) {
      setError('Por favor ingresa un DNI o correo electrónico');
      return;
    }

    // Validación específica para DNI
    if (searchType === 'dni') {
      if (!/^\d{8}$/.test(searchTerm.trim())) {
        setError('El DNI debe tener exactamente 8 números');
        return;
      }
    }

    setSearching(true);
    setError(null);
    setSelectedStudent(null);

    try {
      // Buscar estudiante usando la API real
      const students = await searchStudent(searchTerm.trim());
      
      if (students && students.length > 0) {
        // Si hay múltiples resultados, tomar el primero que coincida exactamente
        let foundStudent = students[0];
        
        if (searchType === 'dni') {
          foundStudent = students.find(student => student.dni === searchTerm.trim()) || students[0];
        } else {
          foundStudent = students.find(student => student.email.toLowerCase() === searchTerm.toLowerCase()) || students[0];
        }
        
        setSelectedStudent(foundStudent);
        setSuccess(`Estudiante encontrado: ${foundStudent.name}`);
      } else {
        setError('No se encontró ningún estudiante con esos datos');
      }
    } catch (err: any) {
      setError(err.message || 'Error al buscar el estudiante');
    } finally {
      setSearching(false);
    }
  };

  const handleDateClick = async (date: string, isAvailable: boolean) => {
    if (!selectedStudent) {
      setError('Primero debes seleccionar un estudiante');
      return;
    }

    // Verificar si es fin de semana - BLOQUEADO PERMANENTEMENTE
    const dateObj = parseLocalDate(date);
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
    
    if (isAvailable) {
      setSelectedDate(date);
      setSelectedTime('');
      setShowTimeSelection(true); // Mostrar el modal directamente
    }
  };

  const loadAvailableSlots = async (date: string) => {
    setLoadingSlots(true);
    setError(null);

    try {
      // Usar la API real para obtener horarios disponibles
      const slots = await getAvailableSlots(1, date); // ID del psicólogo actual
      setAvailableSlots(slots);
      setShowTimeSelection(true);
    } catch (err) {
      setError('Error al cargar los horarios disponibles');
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setShowTimeSelection(false); // Cerrar el modal de selección de horarios
    setShowSummary(true); // Mostrar el modal de resumen
  };

  const handleCreateAppointment = async () => {
    if (!selectedStudent || !selectedDate || !selectedTime) {
      setError('Faltan datos para crear la cita');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Usar el endpoint específico del psicólogo para agendar directamente
      const response = await fetch('/api/psychologist-dashboard/appointments/schedule-for-student', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          student_identifier: selectedStudent.dni, // Usar DNI como identificador
          fecha: selectedDate,
          hora: selectedTime,
          duracion: 45, // Duración estándar de 45 minutos
          motivo_consulta: 'Cita agendada directamente por el psicólogo'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al agendar la cita');
      }

      setSuccess(`Cita agendada exitosamente para ${selectedStudent.name} el ${selectedDate} a las ${selectedTime}`);
      
      // Limpiar formulario
      setSelectedDate('');
      setSelectedTime('');
      setShowTimeSelection(false);
      setShowSummary(false);
      setSelectedStudent(null);
      setSearchTerm('');
      
      // Recargar disponibilidad
      await loadMonthAvailability();
      
    } catch (err: any) {
      setError(err.message || 'Error al crear la cita');
    } finally {
      setSaving(false);
    }
  };

  const goToPreviousMonth = () => {
    const today = new Date();
    const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    
    setCurrentMonth(prev => {
      const previousMonth = new Date(prev.getFullYear(), prev.getMonth() - 1, 1);
      // No permitir navegar a meses anteriores al mes actual
      if (previousMonth < currentMonthStart) {
        setError('No puedes navegar a meses anteriores. Solo se permiten fechas desde este mes en adelante.');
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

  // Usar fechas bloqueadas del servicio
  const diasOcupados = blockedDates;

  // Transformar feriados a eventos para BigCalendar
  const holidayEvents: Event[] = holidays.map((holiday) => ({
    id: `holiday-${holiday.id}`,
    title: `🎉 ${holiday.name}`,
    start: parseLocalDate(holiday.date),
    end: parseLocalDate(holiday.date),
    resource: { type: 'holiday', data: holiday },
    allDay: true,
  }));

  // Transformar días a eventos para BigCalendar
  const dayEvents: any[] = monthDays.map(day => {
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

  // Combinar todos los eventos
  const events: any[] = [...dayEvents, ...holidayEvents];

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

  // Colores claros y suaves con transparencia
  const COLOR_DISPONIBLE = 'rgba(134, 239, 172, 0.3)'; // Verde claro transparente
  const COLOR_OCUPADO = 'rgba(252, 165, 165, 0.3)'; // Rojo claro transparente
  const COLOR_BLOQUEADO = 'rgba(253, 186, 116, 0.3)'; // Naranja claro para fin de semana
  const COLOR_PASADO = 'rgba(196, 181, 253, 0.3)'; // Púrpura claro para día pasado
  const COLOR_FUTURO_LIMITE = 'rgba(253, 224, 71, 0.3)'; // Amarillo claro transparente
  const COLOR_FERIADO = 'rgba(255, 193, 7, 0.5)'; // Amarillo para feriados regionales
  const COLOR_FERIADO_NACIONAL = 'rgba(220, 53, 69, 0.5)'; // Rojo para feriados nacionales
  const COLOR_TEXTO_BLOQUEADO = '#6b7280';
  const COLOR_TEXTO_NORMAL = '#1f2937';
  const COLOR_TEXTO_OCUPADO = '#dc2626';
  const COLOR_TEXTO_FERIADO = '#d63031';
  const COLOR_BORDE_ACTUAL = '#3b82f6';
  const COLOR_BORDE_SELECCIONADO = '#8e161a';

  // Día actual y seleccionado
  const today = new Date();
  const isSameDay = (date1: Date, date2: Date) =>
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate();

  // Leyenda visual mejorada con colores más atractivos
  const Legend = () => (
    <div className="mt-8 p-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl border border-blue-200 shadow-xl">
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
            <p className="text-xs text-gray-600">No hay horarios disponibles</p>
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
      
      {/* Información adicional mejorada */}
      <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-lg">
        <div className="flex items-start gap-4">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-lg">
            <span className="text-white text-sm font-bold">ℹ</span>
          </div>
          <div>
            <h6 className="text-lg font-bold text-blue-800 mb-3">Información importante</h6>
            <ul className="text-sm text-blue-700 space-y-2">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Solo se pueden agendar citas hasta 2 semanas en adelante
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                El horario de atención es de lunes a viernes
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Los fines de semana no se atiende
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                No se pueden agendar citas en días pasados
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Agendar Cita Directamente"
        subtitle="Busca un estudiante y agenda una cita para él"
      >
        <p className="text-base text-gray-500 font-medium text-center">
          Instituto Túpac Amaru - Psicología Clínica
        </p>
      </PageHeader>

      {/* Mensajes de estado */}
      {error && (
        <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-6 flex items-center space-x-4 shadow-lg animate-pulse">
          <AlertCircle className="w-8 h-8 text-red-600 flex-shrink-0" />
          <div>
            <p className="text-red-800 font-bold text-lg">{error}</p>
            <p className="text-red-600 text-sm mt-1">Por favor, selecciona una fecha válida</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 flex items-center space-x-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
          <p className="text-green-800 font-bold text-lg">{success}</p>
        </div>
      )}

      {/* Búsqueda de estudiante */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <Search className="w-5 h-5 mr-2 text-[#8e161a]" />
          Buscar Estudiante
        </h3>
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Buscar por</label>
              <select
                value={searchType}
                onChange={e => setSearchType(e.target.value as 'dni' | 'email')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8e161a] focus:border-transparent"
              >
                <option value="dni">DNI</option>
                <option value="email">Correo electrónico</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {searchType === 'dni' ? 'DNI del estudiante' : 'Correo electrónico'}
              </label>
              <input
                type={searchType === 'dni' ? 'text' : 'email'}
                placeholder={searchType === 'dni' ? '12345678' : 'estudiante@issta.edu.pe'}
                value={searchTerm}
                onChange={e => setSearchTerm(validateDNI(e.target.value))}
                onKeyDown={e => e.key === 'Enter' && handleSearchStudent()}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8e161a] focus:border-transparent"
                autoComplete="off"
                maxLength={searchType === 'dni' ? 8 : undefined}
              />
            </div>
            <div>
              <Button
                onClick={handleSearchStudent}
                disabled={searching || !searchTerm.trim()}
                className="px-6"
              >
                {searching ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
                Buscar
              </Button>
            </div>
          </div>
          {selectedStudent && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h4 className="font-semibold text-blue-900 flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Estudiante Seleccionado
                </h4>
                <div className="space-y-1 text-sm">
                  <p className="font-medium text-blue-900">{selectedStudent.name}</p>
                  <p className="text-blue-700">{selectedStudent.email}</p>
                  <p className="text-blue-700">DNI: {selectedStudent.dni}</p>
                  <p className="text-blue-700">{selectedStudent.career} - {selectedStudent.semester}° Semestre</p>
                  <p className="text-blue-700">Tel: {selectedStudent.phone}</p>
                </div>
              </div>
              <Badge variant="success" className="mt-2 md:mt-0">Encontrado</Badge>
            </div>
          )}
        </div>
      </Card>

      {/* Calendario Profesional Mejorado */}
      <div className="bg-white rounded-3xl shadow-2xl p-8 border-2 border-gray-100">
        <div className="mb-6 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">📅 Calendario de Disponibilidad Profesional</h3>
          <p className="text-gray-600">Haz clic en un día para configurar horarios o agendar citas</p>
        </div>
        <BigCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          selectable
          style={{ 
            height: 650, 
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', 
            borderRadius: 24, 
            boxShadow: 'inset 0 2px 20px rgba(0,0,0,0.05)', 
            border: '2px solid #e2e8f0', 
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '14px',
            fontWeight: '600'
          }}
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
            
            // Si es una cita
            if (event.resource?.status === 'confirmada') {
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
          components={{
            toolbar: (props: any) => (
              <div className="flex items-center justify-between mb-8 p-6 bg-gradient-to-r from-[#8e161a] to-[#b91c1c] rounded-2xl text-white">
                <button 
                  onClick={() => props.onNavigate('PREV')}
                  className="bg-white/20 hover:bg-white/30 p-3 rounded-xl transition-all duration-300 font-bold"
                >
                  ← Anterior
                </button>
                <div className="text-center">
                  <h3 className="text-2xl font-bold">{props.label}</h3>
                  <p className="text-sm opacity-90">Gestión Profesional de Horarios</p>
                </div>
                <button 
                  onClick={() => props.onNavigate('NEXT')}
                  className="bg-white/20 hover:bg-white/30 p-3 rounded-xl transition-all duration-300 font-bold"
                >
                  Siguiente →
                </button>
              </div>
            )
          }}
          dayPropGetter={(date: any) => {
            const today = new Date();
            const peruTime = new Date(today.toLocaleString("en-US", {timeZone: "America/Lima"}));
            const todayStart = startOfDay(peruTime);
            const futureLimit = addDays(todayStart, 14);
            const day = date.getDay();
            
            // Verificar si es feriado
            const holiday = holidayLocalService.isHolidayDate(date, holidays);
            
            if (holiday) {
              // Día feriado: diseño más atractivo con gradientes y efectos
              const isNational = holiday.is_national;
              return { 
                style: { 
                  background: isNational 
                    ? 'linear-gradient(135deg, rgba(251, 191, 36, 0.9) 0%, rgba(245, 158, 11, 0.8) 100%)'
                    : 'linear-gradient(135deg, rgba(168, 85, 247, 0.9) 0%, rgba(139, 92, 246, 0.8) 100%)',
                  color: isNational ? '#92400e' : '#581c87',
                  fontWeight: 800,
                  borderRadius: 16,
                  boxShadow: isNational 
                    ? '0 8px 25px rgba(251, 191, 36, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                    : '0 8px 25px rgba(168, 85, 247, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                  border: isNational 
                    ? '3px solid #f59e0b'
                    : '3px solid #8b5cf6',
                  cursor: 'not-allowed',
                  pointerEvents: 'none',
                  position: 'relative',
                  transform: 'scale(1.05)',
                  transition: 'all 0.3s ease',
                  textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                } 
              };
            }
            
            if (day === 0 || day === 6) {
              return { 
                style: { 
                  background: 'linear-gradient(135deg, rgba(253, 186, 116, 0.8) 0%, rgba(251, 146, 60, 0.7) 100%)',
                  color: '#c2410c',
                  pointerEvents: 'none',
                  cursor: 'not-allowed',
                  fontWeight: 700,
                  borderRadius: 12,
                  boxShadow: '0 4px 15px rgba(253, 186, 116, 0.3)',
                  border: '2px solid #f97316',
                  opacity: 0.8
                } 
              };
            }
            if (isBefore(date, todayStart)) {
              return { 
                style: { 
                  background: 'linear-gradient(135deg, rgba(156, 163, 175, 0.6) 0%, rgba(107, 114, 128, 0.5) 100%)',
                  color: '#374151',
                  fontWeight: 600,
                  borderRadius: 12,
                  boxShadow: '0 4px 12px rgba(156, 163, 175, 0.2)',
                  border: '1px solid #9ca3af',
                  cursor: 'not-allowed',
                  opacity: 0.6
                } 
              };
            }
            if (isAfter(date, futureLimit)) {
              return { 
                style: { 
                  background: 'linear-gradient(135deg, rgba(253, 224, 71, 0.6) 0%, rgba(250, 204, 21, 0.5) 100%)',
                  color: '#a16207',
                  fontWeight: 600,
                  opacity: 0.7,
                  borderRadius: 12,
                  boxShadow: '0 4px 12px rgba(253, 224, 71, 0.2)',
                  border: '1px solid #facc15'
                } 
              };
            }
            return { 
              style: { 
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.8) 0%, rgba(22, 163, 74, 0.7) 100%)',
                color: '#064e3b',
                fontWeight: 700,
                borderRadius: 12,
                boxShadow: '0 4px 15px rgba(34, 197, 94, 0.3)',
                border: '2px solid #16a34a',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textShadow: '0 1px 2px rgba(0,0,0,0.1)'
              } 
            };
          }}
          components={{
            toolbar: (props: any) => {
              // Solo permitir avanzar o volver a hoy, no retroceder
              const today = new Date();
              const currentMonth = props.date.getMonth();
              const currentYear = props.date.getFullYear();
              const minMonth = today.getMonth();
              const minYear = today.getFullYear();
              const canGoPrev = currentYear > minYear || (currentYear === minYear && currentMonth > minMonth);
              return (
                <div className="rbc-toolbar">
                  <span className="rbc-btn-group">
                    <button type="button" onClick={() => props.onNavigate('TODAY')}>Hoy</button>
                    <button type="button" onClick={() => props.onNavigate('PREV')} disabled={!canGoPrev}>Anterior</button>
                    <button type="button" onClick={() => props.onNavigate('NEXT')}>Siguiente</button>
                  </span>
                  <span className="rbc-toolbar-label">{props.label}</span>
                </div>
              );
            },
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
              
              // Para otros eventos (citas o disponibilidad)
              return (
                <div style={{ padding: '2px 4px', fontSize: '11px' }}>
                  {props.title}
                </div>
              );
            }
          }}
        />
      </div>

      {/* Leyenda */}
      <Legend />

      {/* Modal de selección de horarios */}
      <TimeSelectionModal
        isOpen={showTimeSelection}
        onClose={() => setShowTimeSelection(false)}
        psychologistId={1} // ID del psicólogo actual
        selectedDate={selectedDate}
        onTimeSelected={handleTimeSelect}
      />

      {/* Modal de Resumen de Cita */}
      {showSummary && selectedStudent && selectedDate && selectedTime && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Confirmar Cita</h3>
              <button
                onClick={() => setShowSummary(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ✕
              </button>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 mb-6">
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                Resumen de la Cita
              </h4>

              <div className="space-y-4">
                {/* Información del estudiante */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h5 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <User className="w-4 h-4 mr-2 text-[#8e161a]" />
                    Estudiante
                  </h5>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-900">{selectedStudent.name}</p>
                    <p className="text-xs text-gray-600">DNI: {selectedStudent.dni}</p>
                    <p className="text-xs text-gray-600">{selectedStudent.email}</p>
                    <p className="text-xs text-gray-500">{selectedStudent.career} - {selectedStudent.semester}° semestre</p>
                  </div>
                </div>

                {/* Fecha y hora */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h5 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-[#8e161a]" />
                    Fecha y Hora
                  </h5>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-900">
                      {parseLocalDate(selectedDate).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="text-sm text-gray-600">{selectedTime} - 45 minutos</p>
                  </div>
                </div>

                {/* Información importante */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h5 className="font-semibold text-yellow-800 mb-2">
                    ⚠️ Información Importante
                  </h5>
                  <ul className="text-xs text-yellow-700 space-y-1">
                    <li>• La cita se agendará directamente como confirmada</li>
                    <li>• El estudiante recibirá una notificación automática</li>
                    <li>• No requiere aprobación adicional</li>
                    <li>• Duración: 45 minutos</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-between gap-4 pt-6 border-t border-gray-200">
              <Button 
                variant="outline" 
                onClick={() => setShowSummary(false)}
                className="px-6 py-3"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleCreateAppointment} 
                disabled={saving}
                className="px-8 py-3 bg-[#8e161a] hover:bg-[#7a1417] text-white font-semibold"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Agendando...
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4 mr-2" />
                    Agendar Cita
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 