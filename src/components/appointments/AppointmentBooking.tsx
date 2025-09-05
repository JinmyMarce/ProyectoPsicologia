import { useState, useEffect } from 'react';
import { Calendar, Clock, User, AlertCircle, CheckCircle, FileText, CheckSquare } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSchedule } from '../../contexts/ScheduleContext';
import { getPsychologists, getUserAppointments } from '../../services/appointments';
import { getBlockedDatesForCalendar } from '../../services/schedule';
import { UnifiedCalendar } from '../ui/UnifiedCalendar';
import { MultiStepAppointmentModal } from './MultiStepAppointmentModal';
import { Card } from '../ui/Card';
import { AlertModal } from '../ui/AlertModal';
import { Badge } from '../ui/Badge';
import { holidayService, Holiday } from '../../services/holidays';


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

export function AppointmentBooking() {
  const { user } = useAuth();
  const { refreshBlockedSchedules } = useSchedule();
  const [psychologist, setPsychologist] = useState<Psychologist | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isFirstAppointment, setIsFirstAppointment] = useState<boolean | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState('');
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([]);
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



  // Función para cargar feriados desde la API
  const loadHolidays = async () => {
    try {
      const currentYear = new Date().getFullYear();
      const holidaysData = await holidayService.getHolidays(currentYear);
      setHolidays(holidaysData);
    } catch (error) {
      console.error('Error loading holidays:', error);
    }
  };

  // Función para cargar horarios bloqueados
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

  // Eventos del calendario que incluyen feriados reales
  const calendarEvents = [
    {
      id: 'test-available',
      title: 'Disponible - Psicólogo Dr. García',
      start: new Date(), // Hoy
      end: new Date(new Date().getTime() + 60 * 60 * 1000), // Una hora después
      type: 'available'
    },
    {
      id: 'test-blocked',
      title: 'Bloqueado - Cita Programada',
      start: new Date(new Date().getTime() + 24 * 60 * 60 * 1000), // Mañana
      end: new Date(new Date().getTime() + 25 * 60 * 60 * 1000),
      type: 'blocked'
    },
    // Agregar feriados reales desde la API
    ...holidays.map(holiday => ({
      id: `holiday-${holiday.id}`,
      title: `${holiday.name}`,
      start: new Date(holiday.date),
      end: new Date(holiday.date),
      type: 'holiday',
      resource: {
        type: 'holiday',
        data: holiday
      }
    })),
    {
      id: 'available-1',
      title: '✅ Disponible - Psicóloga Dra. López',
      start: new Date(2025, 0, 12, 10, 0), // 12 de enero
      end: new Date(2025, 0, 12, 11, 0),
      type: 'available'
    },
    {
      id: 'blocked-1',
      title: '❌ Ocupado - Sesión de Terapia',
      start: new Date(2025, 0, 16, 15, 0), // 16 de enero
      end: new Date(2025, 0, 16, 16, 0),
      type: 'blocked'
    }
  ];

  useEffect(() => {
    loadInitialData();
    loadHolidays();
  }, []);

  useEffect(() => {
    if (psychologist?.id) {
      loadBlockedDates();
    }
  }, [psychologist?.id]);

  // Escuchar cambios en los horarios bloqueados
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
    setAlertModal({
      isOpen: true,
      title,
      message,
      type
    });
  };

  const closeAlert = () => {
    setAlertModal(prev => ({ ...prev, isOpen: false }));
  };

  const loadInitialData = async () => {
    try {
      setLoadingData(true);
      setError('');
      
      // Cargar psicólogo y citas del usuario en paralelo
      const [psychologistData, appointmentsData] = await Promise.all([
        loadPsychologist(),
        loadUserAppointments()
      ]);
      
      // Verificar si es la primera cita
      setIsFirstAppointment(appointmentsData.length === 0);
      
      // Obtener las 3 citas más recientes
      const recent = appointmentsData
        .sort((a, b) => parseLocalDateTime(b.created_at, b.time).getTime() - parseLocalDateTime(a.created_at, a.time).getTime())
        .slice(0, 3);
      setRecentAppointments(recent);
      
    } catch (error) {
      console.error('Error cargando datos iniciales:', error);
      setError('Error al cargar los datos iniciales');
    } finally {
      setLoadingData(false);
    }
  };

  const loadPsychologist = async () => {
    try {
      const data = await getPsychologists();
      if (Array.isArray(data) && data.length > 0) {
        setPsychologist(data[0]);
        return data[0];
      } else {
        setError('No hay psicólogo disponible');
        return null;
      }
    } catch (error) {
      console.error('Error cargando psicólogo:', error);
      setError('Error al cargar el psicólogo disponible');
      setPsychologist(null);
      return null;
    }
  };

  const loadUserAppointments = async () => {
    try {
      const appointments = await getUserAppointments();
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
    
    // Recargar datos para actualizar la lista de citas recientes
    loadInitialData();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmada';
      case 'pending':
        return 'Pendiente';
      case 'cancelled':
        return 'Cancelada';
      case 'completed':
        return 'Completada';
      default:
        return status;
    }
  };

  function parseLocalDateTime(dateStr: string, timeStr: string): Date {
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hour, minute] = timeStr.split(':').map(Number);
    return new Date(year, month - 1, day, hour, minute);
  }

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-gray-800 mx-auto mb-4" style={{
                boxShadow: '0 20px 40px rgba(31, 41, 55, 0.2)'
              }}></div>
              <p className="text-lg text-gray-700 font-medium">Cargando sistema de agendamiento...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!psychologist) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-200">
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center" style={{
              boxShadow: '0 20px 40px rgba(31, 41, 55, 0.2)',
              border: '4px solid rgba(31, 41, 55, 0.1)'
            }}>
              <AlertCircle className="w-12 h-12 text-gray-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">No hay psicólogo disponible</h3>
            <p className="text-lg text-gray-600 mb-6">Por favor, intenta más tarde.</p>
            <button
              onClick={loadInitialData}
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-all duration-300 font-semibold text-base"
              style={{
                boxShadow: '0 12px 24px rgba(31, 41, 55, 0.3)'
              }}
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Título Principal */}
      <div className="text-center mb-6">
        <div className="inline-block px-20 py-4 content-card border border-gray-200 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight mb-2">
            Agendar Cita Psicológica
          </h1>
          <div className="w-28 h-1 bg-gradient-to-r from-gray-800 to-gray-600 mx-auto rounded-full"></div>
        </div>
      </div>

      {/* Mensajes de estado */}
      {success && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg shadow-sm">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <p className="text-green-800 font-medium text-sm">{success}</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg shadow-sm">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <p className="text-red-800 font-medium text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

            {/* Layout principal con calendario simplificado */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        
        {/* Cards de información útil */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          
          {/* Card del Psicólogo */}
          <Card className="p-3 content-card border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center shadow-lg">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xs font-bold text-gray-800">Psicólogo</h3>
                <p className="font-semibold text-gray-800 text-sm">
                  {psychologist?.name || 'Dr. María García'}
                </p>
                <p className="text-xs text-gray-600">
                  {psychologist?.specialization || 'Psicología Clínica'}
                </p>
              </div>
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${psychologist?.available ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className={`text-xs font-medium ${psychologist?.available ? 'text-green-600' : 'text-red-600'}`}>
                  {psychologist?.available ? '✓' : '✗'}
                </span>
              </div>
            </div>
          </Card>

          {/* Card de Horario */}
          <Card className="p-3 content-card border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center shadow-lg">
                <Clock className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xs font-bold text-gray-800">Horario</h3>
                <p className="font-semibold text-gray-800 text-sm">Lun-Vie 8:00-2:00</p>
                <p className="text-xs text-gray-600">45 min/sesión</p>
              </div>
              <div className="p-1.5 bg-green-100 rounded">
                <p className="text-xs text-green-700 font-medium">✓ Hoy</p>
              </div>
            </div>
          </Card>

          {/* Card de Reprogramar */}
          <Card className="p-3 content-card border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center shadow-lg">
                <Calendar className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xs font-bold text-gray-800">Reprogramar</h3>
                <p className="text-sm text-gray-600">reprogramar cita 24 horas antes</p>
              </div>
            </div>
          </Card>

          {/* Card de Información */}
          <Card className="p-3 content-card border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center shadow-lg">
                <AlertCircle className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xs font-bold text-gray-800">Importante</h3>
                <div className="space-y-1 mt-1">
                  <div className="flex items-center space-x-1">
                    <CheckSquare className="w-3 h-3 text-green-600" />
                    <p className="text-xs text-gray-700">Llegar 5 min antes</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Calendario directo sin Card wrapper */}
        <UnifiedCalendar
          onDateSelect={(selectedDate) => {
            const today = new Date();
            const dayOfWeek = selectedDate.getDay();
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            const isPast = selectedDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());
            
            // Calcular límite de 2 semanas
            const twoWeeksFromNow = new Date(today);
            twoWeeksFromNow.setDate(today.getDate() + 14);
            const isBeyondLimit = selectedDate > twoWeeksFromNow;
            
            // Validaciones del calendario del estudiante
            if (isPast) {
              showAlert(
                'Fecha No Válida',
                'No se pueden agendar citas en fechas pasadas. Por favor, selecciona una fecha futura.',
                'warning'
              );
              return;
            }
            
            if (isWeekend) {
              showAlert(
                'Fin de Semana',
                'No se pueden agendar citas en fines de semana (sábados y domingos). El servicio está disponible de lunes a viernes.',
                'info'
              );
              return;
            }
            
            if (isBeyondLimit) {
              showAlert(
                'Límite de Tiempo Excedido',
                'No se pueden agendar citas más allá de 2 semanas desde hoy. Este límite nos permite brindar un servicio de calidad.',
                'warning'
              );
              return;
            }
            
            // Verificar si es feriado
            const dayEvents = calendarEvents.filter((event: any) => {
              const eventDate = new Date(event.start);
              return eventDate.toDateString() === selectedDate.toDateString() && 
                     event.title.toLowerCase().includes('feriado');
            });
        
            if (dayEvents.length > 0) {
              const holidayName = dayEvents[0].title;
              showAlert(
                'Feriado Nacional',
                `Esta fecha es un feriado: ${holidayName}. No se pueden agendar citas en días festivos.`,
                'info'
              );
              return;
            }

            // Verificar si la fecha está bloqueada por el psicólogo
            const isBlockedByPsychologist = blockedDates.some(blockedDate => 
              blockedDate.toDateString() === selectedDate.toDateString()
            );

            if (isBlockedByPsychologist) {
              showAlert(
                'Fecha No Disponible',
                'Esta fecha no está disponible para agendar citas. El psicólogo ha bloqueado este día.',
                'warning'
              );
              return;
            }
            
            // Si pasa todas las validaciones, abrir modal
            setModalDate(format(selectedDate, 'yyyy-MM-dd'));
            setModalOpen(true);
          }}
          blockedDates={[
            ...calendarEvents
              .filter((event: any) => event.type === 'blocked')
              .map((event: any) => new Date(event.start)),
            ...blockedDates
          ]}
          holidays={holidays}
          showLegend={true}
          showNavigation={true}
          className="w-full"
        />

        {/* Panel de información adicional inferior */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          
          {/* Citas recientes */}
          {recentAppointments.length > 0 && (
            <Card className="p-6 content-card border border-gray-200 shadow-md">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center shadow-lg">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">Citas Recientes</h3>
              </div>
              <div className="space-y-3">
                {recentAppointments.map((appointment, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">
                          {format(parseLocalDateTime(appointment.date, appointment.time), 'dd/MM/yyyy')}
                        </p>
                        <p className="text-gray-600 text-xs">
                          {format(parseLocalDateTime(appointment.date, appointment.time), 'HH:mm')} - {appointment.psychologist_name}
                        </p>
                      </div>
                      <Badge className={`text-xs ${getStatusColor(appointment.status)}`}>
                        {getStatusText(appointment.status)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}


        </div>
      </div>

      {/* Modal de múltiples pasos */}
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

      {/* Modal de alertas profesionales */}
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

// Función helper para formatear fechas
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