import { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { 
  Calendar, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Save,
  User,
  Ban,
  AlertTriangle,
  Info,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { 
  createScheduleBlock, 
  getBlockedSchedules, 
  getAvailabilityForDate,
  BlockedSchedule 
} from '../../services/schedule';
import { useSchedule } from '../../contexts/ScheduleContext';

interface TimeBlock {
  id: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  hasAppointment: boolean;
  isBlocked: boolean;
  reason?: string;
}

interface DaySchedule {
  date: string;
  dayName: string;
  isFullDayBlocked: boolean;
  fullDayReason?: string;
  blocks: TimeBlock[];
}

interface BlockedDay {
  date: string;
  reason: string;
  affectedAppointments: number;
}

export function ScheduleManager() {
  const { addBlockedSchedule } = useSchedule();
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<Date>(new Date());
  const [blockedDays, setBlockedDays] = useState<BlockedDay[]>([]);
  const [, setBlockedSchedules] = useState<BlockedSchedule[]>([]);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockingType, setBlockingType] = useState<'day' | 'blocks'>('day');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedBlocks, setSelectedBlocks] = useState<string[]>([]);
  const [blockReason, setBlockReason] = useState('');
  const [specificReason, setSpecificReason] = useState('');

  // Generar bloques de 45 minutos de 8:00 a 13:15
  const generateTimeBlocks = (): TimeBlock[] => {
    const blocks: TimeBlock[] = [];
    
    // Definir exactamente los bloques de 45 minutos de 8:00 a 14:00
    const timeSlots = [
      { start: '08:00', end: '08:45' },
      { start: '08:45', end: '09:30' },
      { start: '09:30', end: '10:15' },
      { start: '10:15', end: '11:00' },
      { start: '11:00', end: '11:45' },
      { start: '11:45', end: '12:30' },
      { start: '12:30', end: '13:15' },
      { start: '13:15', end: '14:00' }
    ];
    
    timeSlots.forEach(slot => {
      blocks.push({
        id: `${slot.start}-${slot.end}`,
        startTime: slot.start,
        endTime: slot.end,
        isAvailable: true,
        hasAppointment: false, // Se cargará desde el backend
        isBlocked: false
      });
    });
    
    return blocks;
  };

  // Generar horario semanal (Lunes a Viernes)
  const generateWeeklySchedule = (): DaySchedule[] => {
    const days: DaySchedule[] = [];
    const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
    
    // Obtener el lunes de la semana seleccionada
    const monday = new Date(selectedWeek);
    const dayOfWeek = monday.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    monday.setDate(monday.getDate() - daysToMonday);
    
    for (let i = 0; i < 5; i++) {
      const currentDate = new Date(monday);
      currentDate.setDate(monday.getDate() + i);
      
      days.push({
        date: currentDate.toISOString().split('T')[0],
        dayName: dayNames[i],
        isFullDayBlocked: false,
        blocks: generateTimeBlocks()
      });
    }
    
    return days;
  };

  useEffect(() => {
    loadSchedule();
    loadBlockedSchedules();
  }, [selectedWeek]);

  const loadSchedule = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Generar horario base
      const weeklySchedule = generateWeeklySchedule();
      
      // Cargar datos reales del backend para cada día
      const updatedSchedule = await Promise.all(
        weeklySchedule.map(async (day) => {
          try {
            // Obtener disponibilidad real para este día
            const availability = await getAvailabilityForDate(1, day.date);
            if (availability && availability.blocks) {
              return {
                ...day,
                isFullDayBlocked: availability.isFullDayBlocked || false,
                fullDayReason: availability.fullDayReason || null,
                blocks: availability.blocks.map((block: any) => ({
                  id: block.id,
                  startTime: block.startTime,
                  endTime: block.endTime,
                  isAvailable: block.isAvailable !== undefined ? block.isAvailable : true,
                  hasAppointment: block.hasAppointment || false,
                  isBlocked: block.isBlocked || false,
                  reason: block.reason || null
                }))
              };
            }
          } catch (error) {
            console.error(`Error loading availability for ${day.date}:`, error);
          }
          // Si hay error o no hay disponibilidad, usar el horario base generado
          return day;
        })
      );
      
      setSchedule(updatedSchedule);
      
    } catch (error: any) {
      setError('Error al cargar el horario');
      console.error('Error loading schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBlockedSchedules = async () => {
    try {
      // Obtener horarios bloqueados del servicio
      const startDate = new Date(selectedWeek);
      startDate.setDate(startDate.getDate() - 7);
      const endDate = new Date(selectedWeek);
      endDate.setDate(endDate.getDate() + 21);
      
      // Cargar datos reales del backend
      const schedules = await getBlockedSchedules(1, startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]);
      setBlockedSchedules(schedules);
      
    } catch (error: any) {
      console.error('Error loading blocked schedules:', error);
    }
  };

  const handleDayClick = (date: string) => {
    setSelectedDate(date);
    setBlockingType('day');
    setShowBlockModal(true);
  };

  const handleBlockClick = (date: string, blockId: string) => {
    setSelectedDate(date);
    setSelectedBlocks([blockId]);
    setBlockingType('blocks');
    setShowBlockModal(true);
  };

  // Función para bloquear múltiples horarios (no utilizada actualmente)
  // const handleBlockMultiple = (date: string, blockIds: string[]) => {
  //   setSelectedDate(date);
  //   setSelectedBlocks(blockIds);
  //   setBlockingType('blocks');
  //   setShowBlockModal(true);
  // };

  const handleConfirmBlock = async () => {
    if (!blockReason.trim()) {
      setError('Por favor ingresa un motivo');
      return;
    }

    try {
      // Crear el bloqueo en el backend
      // Construir el motivo completo
      const fullReason = `${blockReason}: ${specificReason}`;

      const blockData = {
        psychologistId: 1, // ID del psicólogo actual
        date: selectedDate,
        startTime: blockingType === 'blocks' ? selectedBlocks[0]?.split('-')[0] : undefined,
        endTime: blockingType === 'blocks' ? selectedBlocks[0]?.split('-')[1] : undefined,
        isFullDayBlocked: blockingType === 'day',
        reason: fullReason
      };

      // Crear bloqueo usando la API real
      const newBlock = await createScheduleBlock(blockData);

      // Actualizar estado local y contexto global
      setBlockedSchedules(prev => [...prev, newBlock]);
      addBlockedSchedule(newBlock);
      
      setSchedule(prev => 
        prev.map(day => {
          if (day.date === selectedDate) {
            if (blockingType === 'day') {
              // Bloquear día completo
              const updatedBlocks = day.blocks.map(block => ({
                ...block,
                isBlocked: true,
                reason: blockReason
              }));
              
              setBlockedDays(prev => [...prev, {
                date: selectedDate,
                reason: blockReason,
                affectedAppointments: day.blocks.filter(b => b.hasAppointment).length
              }]);
              
              return {
                ...day,
                isFullDayBlocked: true,
                fullDayReason: blockReason,
                blocks: updatedBlocks
              };
            } else {
              // Bloquear bloques específicos
              const updatedBlocks = day.blocks.map(block => 
                selectedBlocks.includes(block.id) 
                  ? { ...block, isBlocked: true, reason: blockReason }
                  : block
              );
              
              const affectedAppointments = day.blocks
                .filter(b => selectedBlocks.includes(b.id) && b.hasAppointment).length;
              
              if (affectedAppointments > 0) {
                setBlockedDays(prev => [...prev, {
                  date: selectedDate,
                  reason: blockReason,
                  affectedAppointments
                }]);
              }
              
              return { ...day, blocks: updatedBlocks };
            }
          }
          return day;
        })
      );

      // Simular notificación a pacientes
      const affectedCount = newBlock.affectedAppointments;
      
      if (affectedCount > 0) {
        setSuccess(`Se han notificado a ${affectedCount} paciente(s) sobre la cancelación de sus citas`);
      } else {
        setSuccess('Horario actualizado exitosamente');
      }

      // Limpiar modal
      setShowBlockModal(false);
      setBlockReason('');
      setSelectedBlocks([]);
      setError(null);
      
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (error: any) {
      setError('Error al crear el bloqueo de horario');
      console.error('Error creating schedule block:', error);
    }
  };

  const handleSaveSchedule = async () => {
    try {
      setSaving(true);
      setError(null);
      
      // Recargar horarios bloqueados para asegurar sincronización
      await loadBlockedSchedules();
      
      // Recargar el horario completo
      await loadSchedule();
      
      // Emitir evento global para notificar a todos los calendarios
      window.dispatchEvent(new CustomEvent('scheduleUpdated', {
        detail: { 
          message: 'Los horarios han sido actualizados',
          timestamp: new Date().toISOString()
        }
      }));
      
      setSuccess('Horario guardado exitosamente. Los cambios se han reflejado en todos los calendarios.');
      setTimeout(() => setSuccess(null), 5000);
    } catch (error: any) {
      setError('Error al guardar el horario');
      console.error('Error saving schedule:', error);
    } finally {
      setSaving(false);
    }
  };

  const getBlockStatus = (block: TimeBlock) => {
    if (block.isBlocked) return 'blocked';
    if (block.hasAppointment) return 'occupied';
    return 'available';
  };

  const getBlockColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-white border-gray-200 hover:bg-green-50';
      case 'occupied': return 'bg-blue-100 border-blue-300';
      case 'blocked': return 'bg-gray-200 border-gray-400';
      default: return 'bg-white border-gray-200';
    }
  };

  const getBlockIcon = (status: string) => {
    switch (status) {
      case 'available': return null;
      case 'occupied': return <User className="w-4 h-4 text-blue-600" />;
      case 'blocked': return <Ban className="w-4 h-4 text-gray-600" />;
      default: return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short'
    });
  };

  const getDayAbbreviation = (dayName: string) => {
    const abbreviations: { [key: string]: string } = {
      'Lunes': 'Lun',
      'Martes': 'Mar',
      'Miércoles': 'Mié',
      'Jueves': 'Jue',
      'Viernes': 'Vie'
    };
    return abbreviations[dayName] || dayName;
  };

  const getWeekRange = () => {
    const monday = new Date(selectedWeek);
    const dayOfWeek = monday.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    monday.setDate(monday.getDate() - daysToMonday);
    
    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);
    
    return `${formatDate(monday.toISOString().split('T')[0])} - ${formatDate(friday.toISOString().split('T')[0])}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Cargando horario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans selection:bg-slate-100 selection:text-slate-900">
      {/* Header Section - Celeste Suave (igual al dashboard del psicólogo) */}
      <div className="bg-gradient-to-br from-cyan-50 via-sky-50 to-cyan-50 rounded-lg sm:rounded-xl md:rounded-2xl shadow-2xl relative overflow-hidden mx-2 sm:mx-3 md:mx-4 mt-2 sm:mt-3 border border-cyan-200/40">
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

        <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 pt-3 sm:pt-4 md:pt-5 pb-4 sm:pb-5 md:pb-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 sm:gap-3 md:gap-4">
            <div className="flex-1 min-w-0 w-full">
              <div className="flex items-center space-x-1.5 sm:space-x-2 mb-1 sm:mb-1.5 md:mb-2">
                <span className="px-2 sm:px-2.5 md:px-3 py-0.5 rounded-full bg-white/70 text-cyan-700 text-[9px] sm:text-[10px] font-bold flex items-center tracking-wide uppercase shadow-lg border border-cyan-300/50 hover:bg-white/80 transition-all duration-300 backdrop-blur-xl">
                  <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1 sm:mr-1.5" />
                  <span className="hidden sm:inline">SAPTA - Psicología</span>
                  <span className="sm:hidden">SAPTA</span>
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black tracking-tight text-cyan-900 mb-1 sm:mb-1.5 leading-tight">
                Gestión de Horarios
              </h1>
              <p className="text-cyan-800 text-[11px] sm:text-xs md:text-sm max-w-2xl font-medium leading-relaxed">
                Configura tu disponibilidad semanal.
                <span className="hidden sm:inline text-cyan-700"> Gestiona tus horarios de atención.</span>
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap w-full md:w-auto justify-start md:justify-end mt-2 md:mt-0">
              <div className="bg-white/80 backdrop-blur-xl rounded-lg px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 border border-cyan-200/50 shadow-sm">
                <div className="text-[10px] sm:text-xs md:text-sm font-semibold text-cyan-700 whitespace-nowrap">
                  <span className="hidden sm:inline">Semana: </span>
                  <span className="text-[9px] sm:text-[10px] md:text-xs lg:text-sm">{getWeekRange()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave pattern */}
        <div className="absolute bottom-0 left-0 right-0 h-8 overflow-hidden pointer-events-none">
          <svg className="absolute bottom-0 w-full h-full" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0 C150,80 350,80 600,40 C850,0 1050,0 1200,40 L1200,120 L0,120 Z" fill="white" fillOpacity="0.08" />
            <path d="M0,20 C200,100 400,100 600,60 C800,20 1000,20 1200,60 L1200,120 L0,120 Z" fill="white" fillOpacity="0.04" />
          </svg>
        </div>
      </div>

      {/* Contenido colgando del header */}
      <div className="w-full px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8 -mt-3 sm:-mt-4 relative z-20">
        <div className="w-full space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6">

        {/* Alerts Elegantes */}
        {error && (
          <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 text-red-700 px-3 sm:px-4 md:px-5 lg:px-6 py-2.5 sm:py-3 md:py-3.5 lg:py-4 rounded-lg sm:rounded-xl flex items-start sm:items-center shadow-sm">
            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-red-100 flex items-center justify-center mr-2 sm:mr-2.5 md:mr-3 flex-shrink-0 mt-0.5 sm:mt-0">
              <AlertCircle className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 text-red-600" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-xs sm:text-sm mb-0.5">Error</div>
              <div className="text-[10px] sm:text-xs md:text-sm break-words leading-relaxed">{error}</div>
            </div>
          </div>
        )}
        
        {success && (
          <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 text-green-700 px-3 sm:px-4 md:px-5 lg:px-6 py-2.5 sm:py-3 md:py-3.5 lg:py-4 rounded-lg sm:rounded-xl flex items-start sm:items-center shadow-sm">
            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-green-100 flex items-center justify-center mr-2 sm:mr-2.5 md:mr-3 flex-shrink-0 mt-0.5 sm:mt-0">
              <CheckCircle className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 text-green-600" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-xs sm:text-sm mb-0.5">Éxito</div>
              <div className="text-[10px] sm:text-xs md:text-sm break-words leading-relaxed">{success}</div>
            </div>
          </div>
        )}

        {/* Leyenda - Card separado colgado del header */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-lg border border-cyan-200/50 p-3 sm:p-3.5 md:p-4 lg:p-5">
          <div className="flex flex-col gap-3 sm:gap-4 md:gap-5 lg:gap-6">
            {/* Primera fila: Título y Botón */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-3 md:gap-4">
              {/* Título y horario */}
              <div className="flex-1 min-w-0 w-full sm:w-auto">
                <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-black text-slate-900 tracking-tight mb-1 leading-tight">
                  Vista Semanal (Lunes - Viernes)
                </h2>
                <p className="text-slate-600 font-medium text-[9px] sm:text-[10px] md:text-xs lg:text-sm leading-tight">
                  Horario: 8:00 AM - 2:00 PM | Sesiones de 45 minutos
                </p>
              </div>
              
              {/* Botón Guardar Cambios */}
              <div className="flex-shrink-0 w-full sm:w-auto">
                <Button
                  onClick={handleSaveSchedule}
                  disabled={saving}
                  className="w-full sm:w-auto bg-slate-800 hover:bg-slate-900 text-white px-3 sm:px-4 md:px-5 lg:px-6 py-1.5 sm:py-2 md:py-2.5 rounded-lg shadow-lg transition-all duration-300 text-[11px] sm:text-xs md:text-sm whitespace-nowrap"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin mr-1.5 sm:mr-2" />
                      <span className="text-[10px] sm:text-xs md:text-sm">Guardando...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                      <span className="hidden md:inline">Guardar Cambios</span>
                      <span className="md:hidden text-[10px] sm:text-xs">Guardar</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            {/* Segunda fila: Leyenda */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 md:gap-3 lg:gap-4">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 bg-white border-2 border-gray-200 rounded-lg shadow-sm flex-shrink-0"></div>
                <span className="text-[9px] sm:text-[10px] md:text-xs lg:text-sm font-semibold text-gray-700 whitespace-nowrap">Sesión disponible</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 bg-blue-100 border-2 border-blue-300 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                  <User className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-blue-600" />
                </div>
                <span className="text-[9px] sm:text-[10px] md:text-xs lg:text-sm font-semibold text-gray-700 whitespace-nowrap">Sesión con cita</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 bg-gray-200 border-2 border-gray-400 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                  <Ban className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-gray-600" />
                </div>
                <span className="text-[9px] sm:text-[10px] md:text-xs lg:text-sm font-semibold text-gray-700 whitespace-nowrap">Sesión inhabilitada</span>
              </div>
            </div>
          </div>
        </div>

        {/* Calendario Semanal Elegante */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-lg border border-slate-200 p-1 sm:p-1.5 md:p-3 lg:p-4 xl:p-6">
          {/* Contenedor con scroll horizontal solo en móviles y tablets */}
          <div className="overflow-x-auto lg:overflow-x-visible -mx-1 sm:-mx-1.5 md:-mx-3 lg:mx-0 px-1 sm:px-1.5 md:px-3 lg:px-0" style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'thin' }}>
            {/* Calendario - Ocupa todo el ancho en pantallas grandes */}
            <div className="w-full min-w-[320px] sm:min-w-[380px] md:min-w-[500px] lg:min-w-0">
              <div className="grid grid-cols-6 gap-0 sm:gap-0.5 md:gap-0.5 lg:gap-1 xl:gap-2 w-full">
                {/* Header con horas */}
                <div className="col-span-1 sticky left-0 z-10 bg-white lg:static shadow-sm lg:shadow-none min-w-[45px] sm:min-w-[50px] md:min-w-[60px] lg:min-w-[70px]">
                  <div className="h-8 sm:h-10 md:h-14 lg:h-16 xl:h-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-t-lg flex items-center justify-center px-0.5">
                    <span className="text-[7px] sm:text-[8px] md:text-[9px] lg:text-xs xl:text-sm font-bold text-white uppercase">Hora</span>
                  </div>
                  {schedule[0]?.blocks.map((block) => (
                    <div key={block.id} className="h-7 sm:h-9 md:h-12 lg:h-14 xl:h-16 flex items-center justify-center text-[7px] sm:text-[8px] md:text-[9px] lg:text-xs xl:text-sm font-bold text-slate-700 border-b border-r border-slate-200 bg-slate-50 px-0.5">
                      {block.startTime}
                    </div>
                  ))}
                </div>

                {/* Días de la semana */}
                {schedule.map((day) => (
                  <div key={day.date} className="col-span-1 min-w-[50px] sm:min-w-[55px] md:min-w-[65px] lg:min-w-[75px]">
                    {/* Header del día */}
                    <div 
                      className={`h-8 sm:h-10 md:h-14 lg:h-16 xl:h-20 flex flex-col items-center justify-center text-[7px] sm:text-[8px] md:text-[9px] lg:text-xs xl:text-sm font-bold border-2 rounded-t-lg cursor-pointer transition-all duration-200 px-0.5 ${
                        day.isFullDayBlocked 
                          ? 'bg-gradient-to-br from-slate-300 to-slate-400 border-slate-500 text-slate-700' 
                          : 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700 text-white hover:from-slate-800 hover:via-slate-700 hover:to-slate-800 shadow-md'
                      }`}
                      onClick={() => handleDayClick(day.date)}
                      title="Haz clic para inhabilitar todo el día"
                    >
                      <div className="font-black text-[8px] sm:text-[9px] md:text-xs lg:text-sm xl:text-base leading-tight text-center">
                        <span className="md:hidden">{getDayAbbreviation(day.dayName)}</span>
                        <span className="hidden md:inline">{day.dayName}</span>
                      </div>
                      <div className="text-[5px] sm:text-[6px] md:text-[7px] lg:text-[9px] xl:text-xs font-medium mt-0.5 opacity-90 leading-tight">{formatDate(day.date)}</div>
                      {day.isFullDayBlocked && (
                        <Ban className="w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-3 md:h-3 lg:w-4 lg:h-4 xl:w-5 xl:h-5 mt-0.5" />
                      )}
                    </div>

                    {/* Bloques de tiempo */}
                    {day.blocks.map((block) => {
                      const status = getBlockStatus(block);
                      return (
                        <div
                          key={block.id}
                          className={`h-7 sm:h-9 md:h-12 lg:h-14 xl:h-16 border-b border-r border-l-2 ${getBlockColor(status)} cursor-pointer transition-all duration-200 flex items-center justify-center ${
                            status === 'available' ? 'hover:bg-red-50 hover:border-red-400 hover:shadow-md hover:scale-[1.02]' : ''
                          }`}
                          onClick={() => status === 'available' && handleBlockClick(day.date, block.id)}
                          title={status === 'available' ? 'Haz clic para inhabilitar este bloque' : 'Bloque no disponible'}
                        >
                          {getBlockIcon(status) && (
                            <div className="scale-70 sm:scale-80 md:scale-90 lg:scale-100">
                              {getBlockIcon(status)}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Resumen de Cambios */}
        {blockedDays.length > 0 && (
          <div className="bg-white rounded-lg sm:rounded-xl shadow-lg border border-slate-200 p-3 sm:p-4 md:p-5 lg:p-6 xl:p-7">
            <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-slate-900 mb-3 sm:mb-4 md:mb-5 flex items-center">
              <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg bg-amber-100 flex items-center justify-center mr-2 sm:mr-2.5 md:mr-3 flex-shrink-0">
                <AlertTriangle className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 text-amber-600" />
              </div>
              <span className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl">Resumen de Cambios</span>
            </h3>
            <div className="space-y-2.5 sm:space-y-3 md:space-y-4">
              {blockedDays.map((blockedDay, index) => (
                <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-3 md:gap-4 p-3 sm:p-3.5 md:p-4 bg-amber-50 border-2 border-amber-200 rounded-lg hover:bg-amber-100 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-900 text-xs sm:text-sm md:text-base lg:text-lg break-words">
                      {formatDate(blockedDay.date)} - {blockedDay.reason}
                    </div>
                    <div className="text-[10px] sm:text-xs md:text-sm lg:text-base text-slate-600 mt-0.5 sm:mt-1">
                      {blockedDay.affectedAppointments} cita(s) afectada(s)
                    </div>
                  </div>
                  <Badge variant="warning" className="text-[9px] sm:text-xs md:text-sm px-2 sm:px-2.5 py-0.5 sm:py-1 md:py-1.5 whitespace-nowrap flex-shrink-0">
                    {blockedDay.affectedAppointments > 0 ? 'Notificaciones enviadas' : 'Sin citas afectadas'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        </div>
      </div>

      {/* Modal para inhabilitar */}
      {showBlockModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4" onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowBlockModal(false);
            setBlockReason('');
            setSpecificReason('');
            setSelectedBlocks([]);
            setError(null);
          }
        }}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto mx-2 sm:mx-4">
            {/* Header del modal */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 rounded-t-xl">
              <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  {blockingType === 'day' ? (
                    <Ban className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 text-white" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 text-white" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm sm:text-base md:text-lg font-bold text-white leading-tight">
                    {blockingType === 'day' ? 'Inhabilitar Día Completo' : 'Inhabilitar Bloques'}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-white/80 mt-0.5 leading-tight">
                    {blockingType === 'day' 
                      ? `Día: ${formatDate(selectedDate)}`
                      : `${selectedBlocks.length} bloque(s) seleccionado(s)`
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Contenido del modal */}
            <div className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4">
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-2.5 sm:p-3">
                <p className="text-[10px] sm:text-xs md:text-sm text-blue-800 font-medium leading-relaxed">
                  {blockingType === 'day' 
                    ? `¿Estás seguro de que quieres inhabilitar todo el día ${formatDate(selectedDate)}? Se notificará automáticamente a los pacientes afectados.`
                    : `¿Estás seguro de que quieres inhabilitar ${selectedBlocks.length} bloque(s) de 45 minutos? Se notificará automáticamente a los pacientes afectados.`
                  }
                </p>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">
                  Tipo de Motivo <span className="text-red-500">*</span>
                </label>
                <select
                  value={blockReason}
                  onChange={(e) => {
                    setBlockReason(e.target.value);
                    setSpecificReason('');
                  }}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition-all text-xs sm:text-sm font-medium bg-white hover:border-slate-400"
                >
                  <option value="">Seleccionar tipo de motivo...</option>
                  <option value="Emergencia">Emergencia</option>
                  <option value="Reunión">Reunión</option>
                  <option value="Feriado">Feriado</option>
                  <option value="Día Libre">Día Libre</option>
                  <option value="Fuerza Mayor">Fuerza Mayor</option>
                  <option value="Capacitación">Capacitación</option>
                  <option value="Consulta Médica">Consulta Médica</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              {blockReason && (
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">
                    Motivo Específico <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={specificReason}
                    onChange={(e) => setSpecificReason(e.target.value)}
                    placeholder="Describe el motivo específico..."
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition-all text-xs sm:text-sm font-medium bg-white hover:border-slate-400 resize-none"
                    rows={3}
                    required
                  />
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
                <Button
                  onClick={handleConfirmBlock}
                  disabled={!blockReason || !specificReason}
                  className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 hover:from-slate-800 hover:via-slate-700 hover:to-slate-800 text-white flex-1 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold py-2 sm:py-2.5 shadow-lg transition-all duration-200 text-xs sm:text-sm"
                >
                  Confirmar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowBlockModal(false);
                    setBlockReason('');
                    setSpecificReason('');
                    setSelectedBlocks([]);
                    setError(null);
                  }}
                  className="flex-1 border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 font-semibold py-2 sm:py-2.5 transition-all duration-200 text-xs sm:text-sm"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}