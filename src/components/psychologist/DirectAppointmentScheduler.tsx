import { useState, useEffect } from 'react';
import { Input } from '../ui/Input';
import { 
  Calendar, 
  Search, 
  Plus, 
  CheckCircle,
  AlertCircle,
  Loader2,
  Settings,
  Clock,
  User,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  X,
  Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, getDay, startOfWeek, endOfWeek, isPast, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { searchStudent } from '../../services/appointments';
import { holidayService, Holiday } from '../../services/holidays';
import { localHolidayService } from '../../services/holidaysLocal';
import { getBlockedDatesForCalendar } from '../../services/schedule';
import { useAuth } from '../../contexts/AuthContext';

interface Student {
  id: number;
  name: string;
  email: string;
  dni: string;
  career: string;
  semester: string;
  phone: string;
  avatar?: string;
  google_avatar?: string;
}

interface AppointmentSlot {
  date: string;
  time: string;
  available: boolean;
}

export function DirectAppointmentScheduler() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'dni' | 'email'>('dni');
  const [searching, setSearching] = useState(false);
  const [student, setStudent] = useState<Student | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState<AppointmentSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [avatarError, setAvatarError] = useState(false);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [holidaysLoaded, setHolidaysLoaded] = useState(false);
  const [blockedDates, setBlockedDates] = useState<Date[]>([]);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'info' | 'success' | 'warning' | 'error'>('info');
  const [showAlert, setShowAlert] = useState(false);

  const timeSlots = [
    '08:00', '08:45', '09:30', '10:15', '11:00', '11:45', '12:30', '13:15'
  ];

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setError('Por favor ingresa un DNI o correo electrónico');
      return;
    }

    // Validar DNI: solo 8 números
    if (searchType === 'dni') {
      const dniRegex = /^\d{8}$/;
      if (!dniRegex.test(searchTerm.trim())) {
        setError('El DNI debe tener exactamente 8 números');
        return;
      }
    }

    setSearching(true);
    setError('');
    setStudent(null);
    setAvatarError(false);

    try {
      // Buscar estudiante en la base de datos
      const students = await searchStudent(searchTerm);
      
      if (students.length === 0) {
        setError('Estudiante no encontrado. Verifica el DNI o correo electrónico.');
        return;
      }

      // Tomar el primer resultado
      const foundStudent = students[0];
      
      // Mapear los datos de la API al formato del componente
      const studentData: Student = {
        id: foundStudent.id,
        name: foundStudent.name,
        email: foundStudent.email,
        dni: foundStudent.dni || '',
        career: foundStudent.career || 'No especificado',
        semester: foundStudent.semester || 'N/A',
        phone: foundStudent.phone || 'No disponible',
        avatar: (foundStudent as any).avatar,
        google_avatar: (foundStudent as any).google_avatar
      };

      setStudent(studentData);
    } catch (error: any) {
      console.error('Error searching student:', error);
      setError(error.message || 'Estudiante no encontrado. Verifica el DNI o correo electrónico.');
    } finally {
      setSearching(false);
    }
  };

  const loadAvailableSlots = async () => {
    if (!selectedDate) return;

    setLoadingSlots(true);
    setError('');

    try {
      // Simular carga de horarios disponibles
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      // Eliminar duplicados usando Set
      const uniqueTimes = Array.from(new Set(timeSlots));
      // Todos los horarios están disponibles por defecto (el psicólogo puede agendar en cualquier horario)
      const slots: AppointmentSlot[] = uniqueTimes.map(time => ({
        date: dateString,
        time,
        available: true // Todos disponibles por defecto
      }));

      setAvailableSlots(slots);
    } catch (error: any) {
      setError('Error al cargar los horarios disponibles');
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    if (selectedDate) {
      loadAvailableSlots();
    }
  }, [selectedDate]);

  const handleScheduleAppointment = async () => {
    if (!student || !selectedDate || !selectedTime) {
      setError('Por favor completa todos los campos');
      return;
    }

    setSaving(true);
    setError('');

    try {
      // Simular agendamiento de cita
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('Cita agendada exitosamente');
      
      // Limpiar formulario
      setStudent(null);
      setSelectedDate(null);
      setSelectedTime('');
      setSearchTerm('');
      setAvailableSlots([]);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError('Error al agendar la cita. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  // Función para mostrar alertas (copiada del calendario del estudiante)
  const showAlertMessage = (title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setAlertMessage(`${title}\n\n${message}`);
    setAlertType(type);
    setShowAlert(true);
    setTimeout(() => {
      setShowAlert(false);
      setAlertMessage('');
    }, 5000);
  };

  // Cargar feriados (copiado del calendario del estudiante)
  const loadHolidays = async () => {
    try {
      const currentYear = new Date().getFullYear();
      let holidaysData: Holiday[] = [];
      
      try {
        holidaysData = await localHolidayService.getHolidays(currentYear, 'Lima');
        if (holidaysData.length > 0) {
          setHolidays(holidaysData);
          setHolidaysLoaded(true);
          return;
        }
      } catch (localError) {
        console.log('Servicio local no disponible, usando remoto');
      }
      
      holidaysData = await holidayService.getHolidays(currentYear, 'Lima');
      setHolidays(holidaysData);
      setHolidaysLoaded(true);
    } catch (error) {
      console.error('Error loading holidays:', error);
      setHolidays([]);
      setHolidaysLoaded(true);
    }
  };

  // Cargar fechas bloqueadas (copiado del calendario del estudiante)
  const loadBlockedDates = async () => {
    try {
      if (user?.id) {
        const currentDate = new Date();
        const month = currentDate.getMonth();
        const year = currentDate.getFullYear();
        const blockedDatesStrings = await getBlockedDatesForCalendar(user.id, month, year);
        const blockedDatesArray = blockedDatesStrings.map(dateString => new Date(dateString));
        setBlockedDates(blockedDatesArray);
      }
    } catch (error) {
      console.error('Error loading blocked dates:', error);
    }
  };

  // Cargar feriados y fechas bloqueadas al montar el componente
  useEffect(() => {
    loadHolidays();
    loadBlockedDates();
  }, [user?.id]);

  // Función mejorada de selección de fecha - Psicólogo puede agendar desde mañana hasta 3 semanas
  const handleDateSelect = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDateNormalized = new Date(date);
    selectedDateNormalized.setHours(0, 0, 0, 0);
    
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const isPastOrToday = selectedDateNormalized <= today;

    // Límite de 3 semanas (21 días)
    const threeWeeksFromNow = new Date(today);
    threeWeeksFromNow.setDate(today.getDate() + 21);
    threeWeeksFromNow.setHours(23, 59, 59, 999);
    const isBeyondLimit = selectedDateNormalized > threeWeeksFromNow;

    if (isPastOrToday) {
      showAlertMessage('Fecha No Válida', 'No se pueden agendar citas en fechas pasadas o el día de hoy. Debe ser desde mañana.', 'warning');
      return;
    }
    
    if (isBeyondLimit) {
      showAlertMessage('Límite Excedido', 'Solo se pueden agendar citas con hasta 3 semanas de anticipación (21 días).', 'warning');
      return;
    }
    
    if (isWeekend) {
      showAlertMessage('Fin de Semana', 'No se pueden agendar citas en fines de semana. Por favor, selecciona un día hábil (lunes a viernes).', 'info');
      return;
    }

    // Verificar feriados (ajustar por zona horaria)
    const dayEvents = holidays.filter((holiday) => {
      const holidayDate = new Date(holiday.date + 'T00:00:00');
      return holidayDate.toDateString() === selectedDateNormalized.toDateString();
    });

    if (dayEvents.length > 0) {
      showAlertMessage('Feriado', `Es feriado: ${dayEvents[0].name}.\n\nPor favor, selecciona un día hábil.`, 'info');
      return;
    }

    // Verificar fechas bloqueadas
    const isBlockedByPsychologist = blockedDates.some(blockedDate => {
      const blockedDateNormalized = new Date(blockedDate);
      blockedDateNormalized.setHours(0, 0, 0, 0);
      return blockedDateNormalized.toDateString() === selectedDateNormalized.toDateString();
    });
    if (isBlockedByPsychologist) {
      showAlertMessage('No Disponible', 'Este día está bloqueado por ti.', 'warning');
      return;
    }
    
    setSelectedDate(date);
    setSelectedTime(''); // Reset time when date changes
    setError('');
  };

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const getDaysInMonth = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans selection:bg-slate-100 selection:text-slate-900">
      {/* Header Section - Celeste Suave (Diseño del psicólogo) */}
      <div className="bg-gradient-to-br from-cyan-50 via-sky-50 to-cyan-50 rounded-2xl shadow-2xl relative overflow-hidden mx-2 sm:mx-3 mt-3 border border-cyan-200/40">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-100/50 via-transparent to-sky-100/30 animate-pulse"></div>

        {/* Minimal decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-cyan-100/50 via-sky-100/30 to-transparent rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-gradient-to-tr from-sky-100/40 to-transparent rounded-full blur-3xl -ml-12 -mb-12 pointer-events-none"></div>

        {/* Subtle dots */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-12 left-16 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></div>
          <div className="absolute top-20 right-32 w-1 h-1 bg-sky-300 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute bottom-16 left-1/3 w-1.5 h-1.5 bg-cyan-300 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="w-full px-4 sm:px-6 lg:px-8 pt-6 pb-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="px-3 py-1 rounded-full bg-white/70 text-cyan-700 text-[10px] font-bold flex items-center tracking-wide uppercase shadow-lg border border-cyan-300/50 hover:bg-white/80 transition-all duration-300 backdrop-blur-xl">
                  <Sparkles className="w-3 h-3 mr-1.5" />
                  Agendar Directamente
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-cyan-900 mb-1.5 leading-tight">
                Programar Cita Directa
              </h1>
              <p className="text-cyan-800 text-sm max-w-2xl font-medium leading-relaxed">
                Busca un estudiante por DNI o correo y agenda una cita de forma inmediata.
                <span className="hidden sm:inline text-cyan-700"> Sistema rápido y eficiente.</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/schedule')}
                className="bg-white/80 backdrop-blur-xl rounded-xl px-4 py-2 border border-cyan-200/50 text-cyan-800 hover:bg-white/90 shadow-xl hover:shadow-2xl transition-all duration-500 flex items-center gap-2 font-semibold text-sm"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Gestionar Horarios</span>
                <span className="sm:hidden">Horarios</span>
              </button>
            </div>
          </div>
        </div>

        {/* Wave pattern */}
        <div className="absolute bottom-0 left-0 right-0 h-12 overflow-hidden pointer-events-none">
          <svg className="absolute bottom-0 w-full h-full" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0 C150,80 350,80 600,40 C850,0 1050,0 1200,40 L1200,120 L0,120 Z" fill="white" fillOpacity="0.08" />
            <path d="M0,20 C200,100 400,100 600,60 C800,20 1000,20 1200,60 L1200,120 L0,120 Z" fill="white" fillOpacity="0.04" />
          </svg>
        </div>
      </div>

      {/* Contenido que cuelga del header */}
      <div className="w-full px-3 sm:px-4 lg:px-6 -mt-4 relative z-20">
        {/* Búsqueda de estudiante - Compacto con información al costado */}
        <div className="bg-white rounded-xl shadow-lg border border-cyan-200/50 p-4 sm:p-5 mb-4 sm:mb-6">
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 items-start">
            {/* Búsqueda - Más ancho para llenar el espacio */}
            <div className="flex-1 min-w-0 lg:flex-[2]">
              <h2 className="text-base sm:text-lg font-black text-cyan-900 mb-3 sm:mb-4 flex items-center">
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-slate-900 rounded-lg flex items-center justify-center mr-2 sm:mr-3 shadow-md">
                  <Search className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <span className="text-sm sm:text-lg">Buscar Estudiante</span>
              </h2>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full">
                <div className="flex-shrink-0 sm:w-32 lg:w-36">
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Tipo
                  </label>
                  <select
                    value={searchType}
                    onChange={(e) => {
                      const newType = e.target.value as 'dni' | 'email';
                      setSearchType(newType);
                      // Limpiar el campo si cambia el tipo
                      setSearchTerm('');
                      setError('');
                    }}
                    className="w-full px-3 py-2 border-2 border-cyan-200 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all text-sm font-semibold bg-white hover:border-cyan-300"
                  >
                    <option value="dni">DNI</option>
                    <option value="email">Correo</option>
                  </select>
                </div>

                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    {searchType === 'dni' ? 'DNI del estudiante' : 'Correo electrónico'}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type={searchType === 'dni' ? 'text' : 'email'}
                      inputMode={searchType === 'dni' ? 'numeric' : 'email'}
                      placeholder={searchType === 'dni' ? '12345678' : 'estudiante@issta.edu.pe'}
                      value={searchTerm}
                      onChange={(e) => {
                        // Solo permitir números para DNI y máximo 8 dígitos
                        if (searchType === 'dni') {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 8);
                          setSearchTerm(value);
                        } else {
                          setSearchTerm(e.target.value);
                        }
                      }}
                      onKeyPress={(e) => {
                        // Prevenir caracteres no numéricos en DNI
                        if (searchType === 'dni' && !/[0-9]/.test(e.key) && e.key !== 'Enter' && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab') {
                          e.preventDefault();
                        }
                        if (e.key === 'Enter') {
                          handleSearch();
                        }
                      }}
                      maxLength={searchType === 'dni' ? 8 : undefined}
                      className="flex-1 px-3 py-2 border-2 border-cyan-200 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all text-sm font-semibold bg-white hover:border-cyan-300 focus:outline-none"
                    />
                    <button
                      onClick={handleSearch}
                      disabled={searching || !searchTerm.trim()}
                      className="px-5 py-2 bg-slate-900 hover:bg-slate-950 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {searching ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Search className="w-4 h-4" />
                      )}
                      <span className="hidden sm:inline">Buscar</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Información del estudiante o error - Responsive */}
            <div className="w-full lg:flex-1 lg:flex-initial lg:min-w-[320px] flex items-center justify-center pt-0 lg:pt-6">
              {student ? (
                <div className="w-full bg-gradient-to-r from-cyan-50/90 to-sky-50/90 backdrop-blur-sm border-2 border-cyan-200/60 rounded-xl p-3 sm:p-3.5 shadow-md">
                  <div className="flex items-center gap-2 sm:gap-3">
                    {/* Foto del estudiante a la izquierda */}
                    <div className="flex-shrink-0">
                      {(student.avatar || student.google_avatar) && !avatarError ? (
                        <img
                          src={student.avatar || student.google_avatar}
                          alt={student.name}
                          className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover border-2 border-cyan-300 shadow-lg"
                          onError={() => setAvatarError(true)}
                        />
                      ) : (
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg">
                          <User className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                        </div>
                      )}
                    </div>
                    
                    {/* Información del estudiante */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                        <h3 className="font-bold text-cyan-900 text-xs sm:text-sm truncate">{student.name}</h3>
                        <span className="px-2 py-0.5 rounded-full bg-cyan-200/80 text-cyan-800 text-[10px] font-bold flex items-center gap-1 shadow-sm flex-shrink-0 w-fit">
                          <CheckCircle className="w-3 h-3" />
                          Encontrado
                        </span>
                      </div>
                      <p className="text-xs text-cyan-800 font-semibold mb-0.5">
                        {student.career} - {student.semester}° Semestre
                      </p>
                      <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 text-[10px] sm:text-[11px] text-cyan-700">
                        <span className="font-medium">DNI: {student.dni}</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="font-medium">Tel: {student.phone}</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="truncate font-medium block sm:inline">{student.email}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : error && error.includes('no encontrado') ? (
                <div className="w-full bg-gradient-to-r from-red-50/90 to-rose-50/90 backdrop-blur-sm border-2 border-red-200/60 rounded-xl p-3 sm:p-3.5 shadow-md">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-10 h-10 bg-red-100/80 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-red-800 font-bold text-xs sm:text-sm">{error}</p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Selección de fecha y hora */}
        {student && (
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-sky-200/50 p-4 sm:p-5 lg:p-6">
            <h2 className="text-base sm:text-lg font-black text-sky-900 mb-4 sm:mb-5 flex items-center">
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-sky-400 to-cyan-500 rounded-lg flex items-center justify-center mr-2 sm:mr-3 shadow-md">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="text-sm sm:text-lg">Seleccionar Fecha y Hora</span>
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-4">
              {/* Calendario del psicólogo - Diseño restaurado y responsive */}
              <div className="lg:col-span-3">
                <div className="bg-gradient-to-br from-sky-50 via-cyan-50 to-sky-50 rounded-xl sm:rounded-2xl p-2 sm:p-3 lg:p-4 border-2 border-sky-200/70 shadow-xl">
                  <div className="bg-white rounded-lg sm:rounded-xl overflow-hidden shadow-2xl border-2 border-sky-300/80">
                    {/* Header del calendario - Azul marino oscuro metálico */}
                    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-2 sm:p-3 lg:p-4 border-b-2 border-slate-700 shadow-inner">
                      <div className="flex items-center justify-between">
                        <button
                          onClick={prevMonth}
                          className="p-1.5 sm:p-2 hover:bg-slate-700/70 rounded-lg transition-all text-white hover:scale-110 active:scale-95"
                          aria-label="Mes anterior"
                        >
                          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                        <h3 className="text-sm sm:text-base lg:text-lg font-bold text-white uppercase tracking-wider px-2">
                          {format(currentMonth, 'MMMM yyyy', { locale: es })}
                        </h3>
                        <button
                          onClick={nextMonth}
                          className="p-1.5 sm:p-2 hover:bg-slate-700/70 rounded-lg transition-all text-white hover:scale-110 active:scale-95"
                          aria-label="Mes siguiente"
                        >
                          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Días de la semana */}
                    <div className="grid grid-cols-7 gap-0.5 sm:gap-1 p-1.5 sm:p-2 lg:p-2.5 bg-gradient-to-b from-sky-50/95 to-white border-b-2 border-sky-200">
                      {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day, index) => (
                        <div
                          key={day}
                          className={`text-center text-xs sm:text-sm font-bold py-1 sm:py-2 ${
                            index >= 5 ? 'text-slate-400' : 'text-sky-800 font-black'
                          }`}
                        >
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Días del calendario */}
                    <div className="grid grid-cols-7 gap-1 sm:gap-1.5 p-1.5 sm:p-2 lg:p-2.5 bg-gradient-to-b from-white to-sky-50/30">
                      {getDaysInMonth().map((day, dayIdx) => {
                        const isCurrentMonth = isSameMonth(day, currentMonth);
                        const isSelected = selectedDate && isSameDay(day, selectedDate);
                        const isTodayDate = isToday(day);
                        const dayOfWeek = getDay(day);
                        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                        
                        // Verificar si es feriado (ajustar por zona horaria)
                        const dayEvents = holidays.filter((holiday) => {
                          const holidayDate = new Date(holiday.date + 'T00:00:00');
                          const dayDate = new Date(day);
                          dayDate.setHours(0, 0, 0, 0);
                          return holidayDate.toDateString() === dayDate.toDateString();
                        });
                        const isHoliday = dayEvents.length > 0;
                        
                        // Verificar si está bloqueado
                        const isBlockedByPsychologist = blockedDates.some(blockedDate => blockedDate.toDateString() === day.toDateString());
                        
                        // Validación: puede agendar desde mañana hasta 3 semanas (21 días)
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const dayDate = new Date(day);
                        dayDate.setHours(0, 0, 0, 0);
                        const threeWeeksFromNow = new Date(today);
                        threeWeeksFromNow.setDate(today.getDate() + 21);
                        threeWeeksFromNow.setHours(23, 59, 59, 999);
                        
                        const isPastOrToday = dayDate <= today;
                        const isBeyondLimit = dayDate > threeWeeksFromNow;
                        const isAvailable = isCurrentMonth && !isPastOrToday && !isBeyondLimit && !isWeekend && !isHoliday && !isBlockedByPsychologist;
                        
                        return (
                          <button
                            key={dayIdx}
                            onClick={() => isAvailable && handleDateSelect(day)}
                            disabled={!isAvailable}
                            className={`
                              aspect-square p-1 sm:p-1.5 text-xs sm:text-sm font-semibold rounded-lg sm:rounded-xl transition-all relative
                              ${!isCurrentMonth 
                                ? 'text-slate-300 cursor-not-allowed bg-slate-50/50' 
                                : isPastOrToday
                                ? 'text-slate-300 bg-slate-50 cursor-not-allowed border-2 border-slate-200'
                                : isBeyondLimit
                                ? 'text-slate-300 bg-slate-50 cursor-not-allowed border-2 border-slate-200'
                                : isWeekend
                                ? 'text-slate-300 bg-slate-50 cursor-not-allowed border-2 border-slate-200'
                                : isHoliday
                                ? 'bg-red-50 text-red-700 border-2 border-red-400 cursor-not-allowed shadow-sm'
                                : isBlockedByPsychologist
                                ? 'bg-slate-100 text-slate-400 border-2 border-slate-300 cursor-not-allowed'
                                : isSelected
                                ? 'bg-gradient-to-br from-sky-500 to-cyan-600 text-white shadow-xl scale-110 border-2 border-sky-600 font-bold ring-2 ring-sky-300 ring-offset-2'
                                : isTodayDate
                                ? 'bg-blue-100 text-blue-800 border-2 border-blue-500 hover:bg-blue-200 font-bold shadow-md hover:shadow-lg'
                                : 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-400 border-2 border-emerald-300 hover:shadow-lg hover:scale-105'
                              }
                            `}
                          >
                            {format(day, 'd')}
                            {isHoliday && (
                              <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full shadow-sm"></div>
                            )}
                            {isBlockedByPsychologist && (
                              <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-slate-400 rounded-full shadow-sm"></div>
                            )}
                            {!isHoliday && !isBlockedByPsychologist && !isPastOrToday && !isBeyondLimit && !isWeekend && isCurrentMonth && (
                              <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-sm"></div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Leyenda del calendario */}
                  <div className="mt-2 sm:mt-3 bg-white/80 backdrop-blur-sm rounded-lg p-2 sm:p-2.5 border border-sky-200/60 shadow-sm">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded bg-emerald-50 border-2 border-emerald-300"></div>
                        <span className="text-slate-700 font-medium">Disponible</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded bg-blue-100 border-2 border-blue-500"></div>
                        <span className="text-slate-700 font-medium">Hoy</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded bg-red-50 border-2 border-red-400"></div>
                        <span className="text-slate-700 font-medium">Feriado</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded bg-slate-100 border-2 border-slate-300"></div>
                        <span className="text-slate-700 font-medium">No disponible</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded bg-gradient-to-br from-sky-500 to-cyan-600 border-2 border-sky-600"></div>
                        <span className="text-slate-700 font-medium">Seleccionado</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Horarios disponibles al costado */}
              {selectedDate && (
                <div className="lg:col-span-2 mt-4 lg:mt-0">
                  <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border-2 border-sky-200/60 p-3 sm:p-4 lg:p-5">
                    <h3 className="text-base sm:text-lg font-black text-sky-900 mb-3 sm:mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-sky-600" />
                      <span className="text-sm sm:text-lg">Horarios Disponibles</span>
                    </h3>
                    
                    {loadingSlots ? (
                      <div className="p-3 sm:p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                        <p className="text-blue-800 text-xs sm:text-sm font-semibold flex items-center justify-center">
                          <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                          Cargando horarios...
                        </p>
                      </div>
                    ) : availableSlots.length > 0 ? (
                      <>
                        <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-gradient-to-r from-sky-50 to-cyan-50 rounded-lg border-2 border-sky-200/70">
                          <p className="text-xs sm:text-sm font-bold text-sky-800 text-center">
                            {formatDate(selectedDate)}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-2.5 mb-4 sm:mb-6">
                          {availableSlots
                            .filter((slot, index, self) => 
                              index === self.findIndex(s => s.time === slot.time)
                            )
                            .map(slot => (
                              <button
                                key={slot.time}
                                onClick={() => setSelectedTime(slot.time)}
                                disabled={!slot.available}
                                className={`p-2 sm:p-2.5 text-xs font-bold rounded-lg sm:rounded-xl border-2 transition-all ${
                                  selectedTime === slot.time
                                    ? 'bg-gradient-to-br from-sky-500 to-cyan-600 text-white border-sky-600 shadow-lg scale-105'
                                    : slot.available
                                    ? 'bg-white text-slate-700 border-slate-300 hover:border-sky-400 hover:bg-sky-50 hover:shadow-md hover:scale-105'
                                    : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                                }`}
                              >
                                {slot.time}
                              </button>
                            ))}
                        </div>

                        {/* Resumen de la cita y botón de agendar */}
                        {selectedTime && (
                          <>
                            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t-2 border-sky-200/60">
                              <div className="bg-gradient-to-br from-cyan-50 to-sky-50 rounded-lg sm:rounded-xl p-2.5 sm:p-3 border-2 border-cyan-200/70 shadow-md">
                                <h3 className="text-xs sm:text-sm font-black text-cyan-900 mb-2 flex items-center gap-2">
                                  <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-700" />
                                  <span className="text-xs sm:text-sm">Resumen de la Cita</span>
                                </h3>
                                
                                {student && (
                                  <div className="space-y-1.5 sm:space-y-2 mb-2 sm:mb-3">
                                    <div className="bg-white/80 rounded-lg p-1.5 sm:p-2 border border-cyan-200/50">
                                      <p className="text-[9px] sm:text-[10px] font-bold text-cyan-800 uppercase mb-0.5">Estudiante</p>
                                      <p className="text-xs font-semibold text-cyan-900 truncate">{student.name}</p>
                                      <p className="text-[9px] sm:text-[10px] text-cyan-700">{student.career} - {student.semester}° Semestre</p>
                                    </div>
                                    
                                    <div className="bg-white/80 rounded-lg p-1.5 sm:p-2 border border-cyan-200/50">
                                      <p className="text-[9px] sm:text-[10px] font-bold text-cyan-800 uppercase mb-0.5">Fecha</p>
                                      <p className="text-xs font-semibold text-cyan-900">{formatDate(selectedDate)}</p>
                                    </div>
                                    
                                    <div className="bg-white/80 rounded-lg p-1.5 sm:p-2 border border-cyan-200/50">
                                      <p className="text-[9px] sm:text-[10px] font-bold text-cyan-800 uppercase mb-0.5">Hora</p>
                                      <p className="text-xs font-semibold text-cyan-900">{selectedTime}</p>
                                    </div>
                                    
                                    <div className="pt-1.5 sm:pt-2 border-t border-cyan-200/50">
                                      <div className="flex items-center gap-1 sm:gap-1.5 text-[9px] sm:text-[10px] text-cyan-700">
                                        <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                        <span className="font-bold">Cita lista para agendar</span>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Botón para agendar */}
                                <button
                                  onClick={handleScheduleAppointment}
                                  disabled={saving}
                                  className="w-full px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-br from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white font-bold rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 text-xs sm:text-sm"
                                >
                                  {saving ? (
                                    <>
                                      <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                                      <span>Agendando...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                      <span>Agendar Cita</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </>
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal de alerta (copiado del calendario del estudiante) */}
      {showAlert && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`bg-white rounded-xl shadow-2xl max-w-md w-full p-6 ${
            alertType === 'error' ? 'border-2 border-red-500' :
            alertType === 'warning' ? 'border-2 border-amber-500' :
            alertType === 'success' ? 'border-2 border-green-500' :
            'border-2 border-blue-500'
          }`}>
            <div className="flex items-start gap-4">
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                alertType === 'error' ? 'bg-red-100' :
                alertType === 'warning' ? 'bg-amber-100' :
                alertType === 'success' ? 'bg-green-100' :
                'bg-blue-100'
              }`}>
                {alertType === 'error' ? (
                  <AlertCircle className="w-6 h-6 text-red-600" />
                ) : alertType === 'warning' ? (
                  <AlertCircle className="w-6 h-6 text-amber-600" />
                ) : alertType === 'success' ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-blue-600" />
                )}
              </div>
              <div className="flex-1">
                <h3 className={`font-bold text-lg mb-2 ${
                  alertType === 'error' ? 'text-red-900' :
                  alertType === 'warning' ? 'text-amber-900' :
                  alertType === 'success' ? 'text-green-900' :
                  'text-blue-900'
                }`}>
                  {alertMessage.split('\n\n')[0]}
                </h3>
                <p className="text-sm text-slate-700 whitespace-pre-line">
                  {alertMessage.split('\n\n').slice(1).join('\n\n')}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAlert(false);
                  setAlertMessage('');
                }}
                className="flex-shrink-0 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
