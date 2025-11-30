import { useState, useEffect } from 'react';
import { User, Clock, AlertCircle, CheckCircle, Sparkles, Info, Mail, Phone } from 'lucide-react';
import { getPsychologists, getUserAppointments } from '../../services/appointments';
import { getBlockedDatesForCalendar } from '../../services/schedule';
import { UnifiedCalendar } from '../ui/UnifiedCalendar';
import { MultiStepAppointmentModal } from './MultiStepAppointmentModal';
import { AlertModal } from '../ui/AlertModal';
import { holidayService, Holiday } from '../../services/holidays';
import { localHolidayService } from '../../services/holidaysLocal';
import { useAuth } from '../../contexts/AuthContext';

interface Psychologist {
  id: number;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  available: boolean;
}

interface Appointment {
  id: number;
  user_email: string;
  psychologist_name: string;
  date: string;
  time: string;
  reason: string;
  status: string;
  created_at: string;
}

function format(date: Date, formatStr: string): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return formatStr
    .replace('dd', day)
    .replace('MM', month)
    .replace('yyyy', year.toString())
    .replace('HH', hours)
    .replace('mm', minutes);
}

export function AppointmentBooking() {
  const { user } = useAuth();
  const [psychologist, setPsychologist] = useState<Psychologist | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isFirstAppointment, setIsFirstAppointment] = useState<boolean | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState('');
  const [loadingData, setLoadingData] = useState(true);
  const [blockedDates, setBlockedDates] = useState<Date[]>([]);
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });

  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [holidaysLoaded, setHolidaysLoaded] = useState(false);
  const [userAppointments, setUserAppointments] = useState<Appointment[]>([]);

  const loadHolidays = async () => {
    try {
      const currentYear = new Date().getFullYear();
      // Usar servicio local primero para máxima velocidad (síncrono, sin red)
      let holidaysData: Holiday[] = [];
      
      try {
        holidaysData = await localHolidayService.getHolidays(currentYear, 'Lima');
        // Si el servicio local devuelve datos, usarlos inmediatamente
        if (holidaysData.length > 0) {
          setHolidays(holidaysData);
          setHolidaysLoaded(true);
          return;
        }
      } catch (localError) {
        // Si falla el servicio local, continuar con el servicio remoto
        console.log('Servicio local no disponible, usando remoto');
      }
      
      // Fallback al servicio remoto solo si es necesario
      holidaysData = await holidayService.getHolidays(currentYear, 'Lima');
      setHolidays(holidaysData);
      setHolidaysLoaded(true);
    } catch (error) {
      console.error('Error loading holidays:', error);
      // En caso de error, usar array vacío para no bloquear la interfaz
      setHolidays([]);
      setHolidaysLoaded(true);
    }
  };

  const loadBlockedDates = async () => {
    try {
      if (psychologist?.id) {
        const currentDate = new Date();
        const month = currentDate.getMonth();
        const year = currentDate.getFullYear();
        const blockedDatesStrings = await getBlockedDatesForCalendar(psychologist.id, month, year);
        const blockedDatesArray = blockedDatesStrings.map(dateString => new Date(dateString));
        setBlockedDates(blockedDatesArray);
      }
    } catch (error) {
      console.error('Error loading blocked dates:', error);
    }
  };

  const calendarEvents = [
    ...holidays.map(holiday => ({
      id: `holiday-${holiday.id}`,
      title: `${holiday.name}`,
      start: new Date(holiday.date),
      end: new Date(holiday.date),
      type: 'holiday'
    }))
  ];

  // Cargar feriados PRIMERO, antes que todo
  useEffect(() => {
    loadHolidays();
  }, []);

  // Cargar datos iniciales después de que los feriados estén listos o en paralelo
  useEffect(() => {
    // Si los feriados ya están cargados, cargar datos iniciales
    // Si no, esperar un poco y cargar de todos modos para no bloquear
    const timer = setTimeout(() => {
      loadInitialData();
    }, holidaysLoaded ? 0 : 100); // Si feriados ya cargados, cargar inmediatamente, sino esperar 100ms
    
    return () => clearTimeout(timer);
  }, [holidaysLoaded]);

  useEffect(() => {
    if (psychologist?.id) {
      loadBlockedDates();
    }
  }, [psychologist?.id]);


  useEffect(() => {
    const handleScheduleBlocked = () => {
      if (psychologist?.id) {
        loadBlockedDates();
      }
    };
    window.addEventListener('scheduleBlocked', handleScheduleBlocked);
    window.addEventListener('scheduleUnblocked', handleScheduleBlocked);
    return () => {
      window.removeEventListener('scheduleBlocked', handleScheduleBlocked);
      window.removeEventListener('scheduleUnblocked', handleScheduleBlocked);
    };
  }, [psychologist?.id]);

  const showAlert = (title: string, message: string, type: 'info' | 'warning' | 'error' | 'success' = 'info') => {
    setAlertModal({ isOpen: true, title, message, type });
  };

  const closeAlert = () => {
    setAlertModal(prev => ({ ...prev, isOpen: false }));
  };

  const loadInitialData = async () => {
    const startTime = Date.now();
    try {
      setLoadingData(true);
      setError('');
      // Cargar psicólogo y citas en paralelo para máxima velocidad
      const [, appointmentsData] = await Promise.all([loadPsychologist(), loadUserAppointments()]);
      setIsFirstAppointment(appointmentsData.length === 0);
      // Sección de citas recientes eliminada
    } catch (error) {
      console.error('Error cargando datos iniciales:', error);
      setError('Error al cargar los datos iniciales');
    } finally {
      // Ocultar loading rápidamente, máximo 1 segundo
      const loadTime = Date.now() - startTime;
      const minLoadTime = 300; // Mínimo 300ms para mejor UX
      const remainingTime = Math.max(0, minLoadTime - loadTime);
      setTimeout(() => {
        setLoadingData(false);
      }, remainingTime);
    }
  };

  const loadPsychologist = async () => {
    try {
      const data = await getPsychologists();
      console.log('Psicólogos recibidos:', data);
      
      if (Array.isArray(data) && data.length > 0) {
        // Priorizar psicólogos que no sean "demo" o "test"
        const validPsychologists = data.filter(p => {
          if (!p.name || p.name.trim() === '') return false;
          
          const nameLower = p.name.toLowerCase();
          const emailLower = (p.email || '').toLowerCase();
          
          // Excluir psicólogos con "demo" o "test" en nombre o email
          if (nameLower.includes('demo') || 
              nameLower.includes('test') ||
              emailLower.includes('demo') ||
              emailLower.includes('test')) {
            return false;
          }
          
          return true;
        });
        
        // Si hay psicólogos válidos, usar el primero
        if (validPsychologists.length > 0) {
          const validPsychologist = validPsychologists[0];
          console.log('Psicólogo válido seleccionado:', validPsychologist);
          setPsychologist(validPsychologist);
          return validPsychologist;
        } else if (data.length > 0) {
          // Si no hay psicólogos válidos pero hay datos, usar el primero disponible que tenga nombre
          const firstValid = data.find(p => p.name && p.name.trim() !== '');
          if (firstValid) {
            console.log('Usando primer psicólogo disponible:', firstValid);
            setPsychologist(firstValid);
            return firstValid;
          }
        }
        
        console.log('No hay psicólogos disponibles');
        setPsychologist(null);
        return null;
      } else {
        console.log('No hay datos de psicólogos');
        setPsychologist(null);
        return null;
      }
    } catch (error) {
      console.error('Error cargando psicólogo:', error);
      setPsychologist(null);
      return null;
    }
  };

  const loadUserAppointments = async () => {
    try {
      const appointments = await getUserAppointments();
      setUserAppointments(appointments);
      setIsFirstAppointment(appointments.length === 0);
      return appointments;
    } catch (error) {
      console.error('Error cargando citas del usuario:', error);
      return [];
    }
  };

  const handleAppointmentSuccess = () => {
    setSuccess('Cita agendada exitosamente');
    setModalOpen(false);
    setModalDate('');
    loadInitialData();
    // Auto-cerrar mensaje de éxito después de 5 segundos
    setTimeout(() => {
      setSuccess('');
    }, 5000);
  };


  function parseLocalDateTime(dateStr: string, timeStr: string): Date {
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hour, minute] = timeStr.split(':').map(Number);
    return new Date(year, month - 1, day, hour, minute);
  }

  if (loadingData) {
    return (
      <div className="h-screen overflow-hidden bg-gray-50 font-sans flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-12 h-12 mx-auto mb-4">
            <div className="absolute inset-0 border-2 border-slate-200 rounded-full"></div>
            <div className="absolute inset-0 border-2 border-slate-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-sm text-slate-600 font-semibold animate-pulse">Cargando sistema...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 font-sans selection:bg-violet-200 selection:text-violet-900">
      {/* Header Section - Compact & Professional */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl relative overflow-hidden mx-2 sm:mx-3 mt-3 border border-white/10">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-800/50 via-transparent to-slate-800/30 animate-pulse"></div>

        {/* Minimal decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-slate-600/10 via-slate-500/5 to-transparent rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-gradient-to-tr from-slate-700/8 to-transparent rounded-full blur-3xl -ml-12 -mb-12 pointer-events-none"></div>

        {/* Subtle dots */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-12 left-16 w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
          <div className="absolute top-20 right-32 w-1 h-1 bg-slate-300 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute bottom-16 left-1/3 w-1.5 h-1.5 bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="w-full px-4 sm:px-6 lg:px-8 pt-6 pb-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="animate-fade-in">
              <div className="flex items-center space-x-2 mb-2">
                <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-xl text-white text-[10px] font-bold flex items-center tracking-wide uppercase shadow-lg border border-white/20 hover:bg-white/25 transition-all duration-300">
                  <Sparkles className="w-3 h-3 mr-1.5 animate-pulse" />
                  SAPTA
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-1.5 leading-tight drop-shadow-lg">
                Agendamiento de Citas
              </h1>
              <p className="text-slate-300 text-sm max-w-2xl font-medium leading-relaxed drop-shadow-md">
                Gestiona tus sesiones psicológicas de manera eficiente.
                <span className="hidden sm:inline text-slate-400"> Selecciona una fecha y horario disponible.</span>
              </p>
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

      <div className="w-full px-2 sm:px-3 lg:px-4 -mt-4 relative z-20">
        <div className="space-y-2.5 sm:space-y-3">

          {(error || success) && (
            <div className="grid grid-cols-1 gap-3 sm:gap-4 animate-fade-in">
              {error && (
                <div className="p-4 sm:p-5 bg-gradient-to-br from-white to-red-50/50 border border-red-200/50 rounded-2xl flex items-start space-x-4 shadow-lg shadow-red-100/50 hover:shadow-xl hover:shadow-red-200/50 hover:-translate-y-0.5 transition-all duration-300 backdrop-blur-sm">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-red-200 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-red-800 mb-1.5">Error</h4>
                    <p className="text-sm text-red-700 leading-relaxed">{error}</p>
                  </div>
                </div>
              )}
              {success && (
                <div className="p-4 sm:p-5 bg-gradient-to-br from-white to-green-50 border border-green-200 rounded-2xl flex items-start space-x-4 shadow-lg shadow-green-100 animate-fade-in backdrop-blur-sm">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-green-800 mb-1.5">Éxito</h4>
                    <p className="text-sm text-green-700 leading-relaxed">{success}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Información del Psicólogo y Horario - Diseño Moderno Estilo Dashboard */}
          <div className="group relative bg-white rounded-xl shadow-md hover:shadow-lg p-4 sm:p-5 border border-slate-200 hover:border-slate-300 overflow-hidden hover:-translate-y-0.5 transition-all duration-300 animate-fade-in">
            {/* Fondos decorativos al estilo dashboard */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-100/50 to-purple-100/50 rounded-full -mr-8 -mt-8 blur-2xl group-hover:from-indigo-200/60 group-hover:to-purple-200/60 transition-all duration-500"></div>
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-emerald-100/50 to-teal-100/50 rounded-full -ml-8 -mb-8 blur-2xl group-hover:from-emerald-200/60 group-hover:to-teal-200/60 transition-all duration-500"></div>
            
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-6 relative z-10">
              {/* Información del Psicólogo */}
              {psychologist && (
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  {/* Avatar al estilo dashboard */}
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-lg flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:bg-indigo-300 transition-all duration-300">
                      <User className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-700 relative z-10" strokeWidth={2.5} />
                    </div>
                  </div>

                  {/* Información de texto al estilo dashboard */}
                  <div className="min-w-0 flex-1 space-y-2 relative z-10">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-tight">
                        {psychologist.name}
                      </h3>
                      {psychologist.available && (
                        <span className="text-[9px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Disponible
                        </span>
                      )}
                    </div>
                    
                    {psychologist.specialization && (
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold text-slate-600 leading-relaxed">
                          {psychologist.specialization.replace(/Clínica|clínica|Clínica\s*/gi, '').trim()}
                        </p>
                      </div>
                    )}
                    
                    {/* Información de contacto al estilo dashboard */}
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      {psychologist.email && (
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-50 border border-slate-200/60">
                          <span className="text-[9px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                            Psicólogo
                          </span>
                          <Mail className="w-3 h-3 text-slate-500" />
                          <span className="text-[10px] text-slate-600 font-medium truncate max-w-[150px]">
                            {psychologist.email}
                          </span>
                        </div>
                      )}
                      {psychologist.phone && (
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-50 border border-slate-200/60">
                          <Phone className="w-3 h-3 text-slate-500" />
                          <span className="text-[10px] text-slate-600 font-medium">
                            {psychologist.phone}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Horario de Atención - Estilo Dashboard Responsivo */}
              <div className="flex justify-start lg:justify-end relative z-10 w-full lg:w-auto">
                <div className="group/schedule relative bg-white rounded-lg xs:rounded-xl shadow-md hover:shadow-lg px-3 xs:px-4 py-2 xs:py-3 border border-slate-200 hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-300 w-full xs:min-w-[150px] sm:min-w-[170px] md:min-w-[190px]">
                  {/* Fondo decorativo al estilo dashboard */}
                  <div className="absolute top-0 right-0 w-12 xs:w-16 h-12 xs:h-16 bg-gradient-to-br from-cyan-100/50 to-blue-100/50 rounded-full -mr-4 xs:-mr-6 -mt-4 xs:-mt-6 blur-xl group-hover/schedule:from-cyan-200/60 group-hover/schedule:to-blue-200/60 transition-all duration-500"></div>
                  
                  {/* Icono y contenido */}
                  <div className="flex items-center gap-2 xs:gap-3 relative z-10">
                    {/* Icono al estilo dashboard */}
                    <div className="w-9 h-9 xs:w-10 xs:h-10 bg-gradient-to-br from-cyan-100 to-blue-200 rounded-lg flex items-center justify-center shadow-sm group-hover/schedule:scale-110 group-hover/schedule:bg-blue-300 transition-all duration-300 flex-shrink-0">
                      <Clock className="w-4 h-4 xs:w-5 xs:h-5 text-blue-700 relative z-10" strokeWidth={2.5} />
                    </div>
                    
                    {/* Texto del horario */}
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-[8px] xs:text-[9px] text-slate-500 font-bold uppercase tracking-wider leading-none mb-1 xs:mb-1.5">
                        Horario
                      </span>
                      <div className="space-y-0.5">
                        <span className="block text-[10px] xs:text-[11px] font-bold text-slate-900 leading-tight">
                          Lun - Vie
                        </span>
                        <span className="block text-xs xs:text-sm font-black text-slate-900 leading-tight tracking-tight">
                          8:00 AM - 1:00 PM
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 w-full">
            <div className="w-full lg:w-[78%] lg:px-2">
              {holidaysLoaded ? (
                <UnifiedCalendar
                  holidays={holidays}
                  onDateSelect={(selectedDate) => {
                  const today = new Date();
                  const dayOfWeek = selectedDate.getDay();
                  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                  const isPast = selectedDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());
                  const twoWeeksFromNow = new Date(today);
                  twoWeeksFromNow.setDate(today.getDate() + 14);
                  const isBeyondLimit = selectedDate > twoWeeksFromNow;

                  if (isPast) {
                    showAlert('Fecha No Válida', 'No se pueden agendar citas en fechas pasadas.', 'warning');
                    return;
                  }
                  if (isWeekend) {
                    showAlert('Fin de Semana', 'No se pueden agendar citas en fines de semana.', 'info');
                    return;
                  }
                  if (isBeyondLimit) {
                    showAlert('Límite Excedido', 'Solo se pueden agendar citas con hasta 2 semanas de anticipación.', 'warning');
                    return;
                  }

                  const dayEvents = calendarEvents.filter((event: any) => {
                    const eventDate = new Date(event.start);
                    return eventDate.toDateString() === selectedDate.toDateString();
                  });

                  if (dayEvents.length > 0) {
                    showAlert('Feriado', `Es feriado: ${dayEvents[0].title}.`, 'info');
                    return;
                  }

                  const isBlockedByPsychologist = blockedDates.some(blockedDate => blockedDate.toDateString() === selectedDate.toDateString());
                  if (isBlockedByPsychologist) {
                    showAlert('No Disponible', 'El psicólogo ha bloqueado este día.', 'warning');
                    return;
                  }

                  // Validar si ya tiene una cita en la semana seleccionada
                  const selectedWeekStart = new Date(selectedDate);
                  selectedWeekStart.setDate(selectedDate.getDate() - selectedDate.getDay() + 1);
                  selectedWeekStart.setHours(0, 0, 0, 0);
                  
                  const selectedWeekEnd = new Date(selectedWeekStart);
                  selectedWeekEnd.setDate(selectedWeekStart.getDate() + 6);
                  selectedWeekEnd.setHours(23, 59, 59, 999);
                  
                  const hasAppointmentInSelectedWeek = userAppointments.some(apt => {
                    if (apt.status === 'cancelled') return false;
                    const aptDate = new Date(apt.date);
                    return aptDate >= selectedWeekStart && aptDate <= selectedWeekEnd;
                  });
                  
                  if (hasAppointmentInSelectedWeek) {
                    showAlert('Límite de Citas Semanal', 'Solo puedes agendar una cita por semana.\n\nYa tienes una cita agendada en esta semana. Por favor, selecciona otra semana para agendar una nueva cita.', 'warning');
                    return;
                  }

                  setModalDate(format(selectedDate, 'yyyy-MM-dd'));
                  setModalOpen(true);
                }}
                blockedDates={[...calendarEvents.filter((event: any) => event.type === 'blocked').map((event: any) => new Date(event.start)), ...blockedDates]}
                showLegend={false}
                showNavigation={true}
                className="w-full"
                />
              ) : (
                <div className="flex items-center justify-center h-96 bg-white rounded-xl border border-slate-200">
                  <div className="text-center">
                    <div className="relative w-8 h-8 mx-auto mb-2">
                      <div className="absolute inset-0 border-2 border-slate-200 rounded-full"></div>
                      <div className="absolute inset-0 border-2 border-slate-600 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <p className="text-xs text-slate-600">Cargando calendario...</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Leyenda del Calendario - Al lado en desktop, abajo en móvil */}
            <div className="w-full lg:w-[22%] bg-white rounded-3xl shadow-xl border border-slate-200/50 overflow-hidden sticky top-6 h-fit hover:shadow-2xl hover:border-slate-300/50 transition-all duration-300">
              <div className="p-3 sm:p-4 border-b border-slate-200/50 bg-white">
                <h2 className="font-bold text-slate-800 flex items-center text-[10px] sm:text-xs tracking-tight">
                  <Info className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-[#6B1F1F]" />
                  Leyenda de Calendario de Citas
                </h2>
              </div>
              <div className="p-3 sm:p-4">
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4">
                  <div className="group flex items-center gap-1.5 p-2 rounded-xl bg-gradient-to-br from-emerald-50/80 to-green-100/50 border border-emerald-200/50 hover:from-emerald-100 hover:to-green-200/80 hover:border-emerald-300 hover:shadow-md hover:scale-105 transition-all duration-300 cursor-default">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-md ring-2 ring-emerald-200 flex-shrink-0 group-hover:ring-emerald-300"></div>
                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-700">Disponible</span>
                  </div>
                  <div className="group flex items-center gap-1.5 p-2 rounded-xl bg-gradient-to-br from-amber-50/80 to-yellow-100/50 border border-amber-200/50 hover:from-amber-100 hover:to-yellow-200/80 hover:border-amber-300 hover:shadow-md hover:scale-105 transition-all duration-300 cursor-default">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-md ring-2 ring-amber-200 flex-shrink-0 group-hover:ring-amber-300"></div>
                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-700">Ocupado</span>
                  </div>
                  <div className="group flex items-center gap-1.5 p-2 rounded-xl bg-gradient-to-br from-blue-50/80 to-blue-100/50 border border-blue-200/50 hover:from-blue-100 hover:to-blue-200/80 hover:border-blue-300 hover:shadow-md hover:scale-105 transition-all duration-300 cursor-default">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-md ring-2 ring-blue-200 flex-shrink-0 group-hover:ring-blue-300"></div>
                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-700">Hoy</span>
                  </div>
                  <div className="group flex items-center gap-1.5 p-2 rounded-xl bg-gradient-to-br from-red-50/80 to-red-100/50 border border-red-200/50 hover:from-red-100 hover:to-red-200/80 hover:border-red-300 hover:shadow-md hover:scale-105 transition-all duration-300 cursor-default">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-md ring-2 ring-red-200 flex-shrink-0 group-hover:ring-red-300"></div>
                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-700">Feriado</span>
                  </div>
                  <div className="group flex items-center gap-1.5 p-2 rounded-xl bg-gradient-to-br from-slate-50/80 to-slate-100/50 border border-slate-200/50 hover:from-slate-100 hover:to-slate-200/80 hover:border-slate-300 hover:shadow-md hover:scale-105 transition-all duration-300 cursor-default">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-400 shadow-md ring-2 ring-slate-200 flex-shrink-0 group-hover:ring-slate-300"></div>
                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-700">Fin de Semana</span>
                  </div>
                  <div className="group flex items-center gap-1.5 p-2 rounded-xl bg-gradient-to-br from-pink-50/80 to-pink-100/50 border border-pink-200/50 hover:from-pink-100 hover:to-pink-200/80 hover:border-pink-300 hover:shadow-md hover:scale-105 transition-all duration-300 cursor-default">
                    <div className="w-2.5 h-2.5 rounded-full bg-pink-500 shadow-md ring-2 ring-pink-200 flex-shrink-0 group-hover:ring-pink-300"></div>
                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-700">No laborable</span>
                  </div>
                  <div className="group flex items-center gap-1.5 p-2 rounded-xl bg-gradient-to-br from-gray-100/80 to-gray-200/50 border border-gray-300/50 hover:from-gray-200 hover:to-gray-300/80 hover:border-gray-400 hover:shadow-md hover:scale-105 transition-all duration-300 cursor-default">
                    <div className="w-2.5 h-2.5 rounded-full bg-gray-800 shadow-md ring-2 ring-gray-300 flex-shrink-0 group-hover:ring-gray-400"></div>
                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-700">Bloqueado</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {modalOpen && psychologist && (
        <MultiStepAppointmentModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          psychologistId={psychologist.id}
          selectedDate={modalDate}
          isFirstAppointment={isFirstAppointment || false}
          onSuccess={handleAppointmentSuccess}
        />
      )}

      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={closeAlert}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
      />
    </div>
  );
}