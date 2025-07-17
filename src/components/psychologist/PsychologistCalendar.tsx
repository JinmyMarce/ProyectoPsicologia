import React, { useEffect, useState } from 'react';
import { Calendar, AlertCircle, CheckCircle, Clock, Loader2, Lock, Info, Search, User, Plus } from 'lucide-react';
import { getAvailableSlots, createAppointment, searchStudent, Student } from '../../services/appointments';
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

  // Simulación de días ocupados para ejemplo visual (puedes reemplazar por tu lógica real)
  const diasOcupados = [
    '2025-07-10', '2025-07-14', '2025-07-15', '2025-07-16', '2025-07-17',
    '2025-07-21', '2025-07-22', '2025-07-23', '2025-07-24',
    '2025-07-28', '2025-07-29', '2025-07-30'
  ];

  // Transformar días a eventos para BigCalendar
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

  // Leyenda visual igual que el estudiante
  const Legend = () => (
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
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{background: COLOR_DISPONIBLE, color: '#059669'}}>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Disponible</span>
                <p className="text-xs text-gray-500">Puedes agendar cita</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{background: COLOR_OCUPADO, color: '#b91c1c'}}>
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
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{background: COLOR_BLOQUEADO, color: '#d97706'}}>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Fin de semana</span>
                <p className="text-xs text-gray-500">No se atiende</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{background: COLOR_PASADO, color: '#7c3aed'}}>
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
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{background: COLOR_FUTURO_LIMITE, color: '#a16207'}}>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Fuera de límite</span>
                <p className="text-xs text-gray-500">Más de 2 semanas</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold border-2 border-blue-500 text-blue-600">
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

      {/* Calendario */}
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
            return date.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
          },
          weekdayFormat: (date: Date) => {
            return date.toLocaleString('es-ES', { weekday: 'long' });
          }
        }}
        views={['month']}
        onSelectSlot={handleDateClick}
        eventPropGetter={() => ({ style: { display: 'none' } })}
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

          if (dayData) {
            // Aplicar colores según el estado del día (excepto para el día actual)
            if (dayData.isToday) {
              // Para el día actual: solo borde azul, sin color de fondo
              style.background = 'transparent';
              style.color = COLOR_TEXTO_NORMAL;
              style.border = `2px solid ${COLOR_BORDE_ACTUAL}`;
              style.boxShadow = `0 4px 12px rgba(59, 130, 246, 0.3)`;
              style.cursor = dayData.isAvailable ? 'pointer' : 'not-allowed';
            } else {
              // Para otros días: aplicar colores normales
              if (dayData.isPast) {
                style.background = COLOR_PASADO;
                style.color = '#7c3aed'; // Púrpura para día pasado
                style.cursor = 'not-allowed';
                style.borderRadius = 12;
                style.fontWeight = 700;
                style.boxShadow = '0 4px 12px rgba(124, 58, 237, 0.15)';
                style.border = 'none';
              } else if (dayData.isFutureLimit) {
                style.background = COLOR_FUTURO_LIMITE;
                style.color = '#a16207'; // Amarillo oscuro para fuera de límite
                style.cursor = 'not-allowed';
                style.borderRadius = 12;
                style.fontWeight = 700;
                style.boxShadow = '0 4px 12px rgba(253, 224, 71, 0.15)';
                style.border = 'none';
              } else if (dayData.isBlocked) {
                style.background = COLOR_BLOQUEADO;
                style.color = '#d97706'; // Naranja claro para fin de semana
                style.cursor = 'not-allowed';
              } else if (dayData.isAvailable) {
                style.background = COLOR_DISPONIBLE;
                style.color = '#059669'; // Verde oscuro para disponible
                style.cursor = 'pointer';
                style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.2)';
              } else {
                // Para días que no están disponibles pero no están bloqueados (ocupados)
                style.background = COLOR_OCUPADO;
                style.color = '#b91c1c'; // Rojo oscuro para ocupado
                style.cursor = 'not-allowed';
                style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.2)';
              }
            }

            // Aplicar borde rojo para el día seleccionado (sobrescribe el borde azul si es necesario)
            if (dateStr === selectedDate) {
              style.border = `2px solid ${COLOR_BORDE_SELECCIONADO}`;
              style.boxShadow = `0 4px 12px rgba(142, 22, 26, 0.3)`;
            }
          }

          return { style };
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
          event: () => null
        }}
      />

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