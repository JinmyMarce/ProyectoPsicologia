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
      
      // Simular guardado
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('Horario guardado exitosamente');
      setTimeout(() => setSuccess(null), 3000);
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
                  SAPTA - Psicología
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-cyan-900 mb-1.5 leading-tight">
                Gestión de Horarios
              </h1>
              <p className="text-cyan-800 text-sm max-w-2xl font-medium leading-relaxed">
                Configura tu disponibilidad semanal.
                <span className="hidden sm:inline text-cyan-700"> Gestiona tus horarios de atención.</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white/80 backdrop-blur-xl rounded-xl px-4 py-2 border border-cyan-200/50 shadow-sm">
                <div className="text-sm font-semibold text-cyan-700">
                  Semana: {getWeekRange()}
                </div>
              </div>
              <Button
                onClick={handleSaveSchedule}
                disabled={saving}
                className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-2.5 rounded-xl shadow-lg transition-all duration-300"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Guardar Cambios
                  </>
                )}
              </Button>
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

      {/* Contenido colgando del header */}
      <div className="w-full px-3 sm:px-4 lg:px-6 -mt-4 relative z-20">
        <div className="max-w-7xl mx-auto space-y-6">

        {/* Alerts Elegantes */}
        {error && (
          <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center shadow-sm">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <div className="font-semibold">Error</div>
              <div className="text-sm">{error}</div>
            </div>
          </div>
        )}
        
        {success && (
          <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 text-green-700 px-6 py-4 rounded-xl flex items-center shadow-sm">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="font-semibold">Éxito</div>
              <div className="text-sm">{success}</div>
            </div>
          </div>
        )}

        {/* Calendario Semanal Elegante */}
        <div className="p-8 shadow-xl border border-gray-200 rounded-xl" style={{
          background: 'linear-gradient(145deg, #ffffff 0%, #fafbfc 100%)'
        }}>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center shadow-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                  Vista Semanal (Lunes - Viernes)
                </h2>
                <p className="text-gray-600 font-medium">
                  Horario: 8:00 AM - 2:00 PM | Sesiones de 45 minutos
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  const newDate = new Date(selectedWeek);
                  newDate.setDate(newDate.getDate() - 7);
                  setSelectedWeek(newDate);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-300 font-semibold"
              >
                ← Semana Anterior
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const newDate = new Date(selectedWeek);
                  newDate.setDate(newDate.getDate() + 7);
                  setSelectedWeek(newDate);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-300 font-semibold"
              >
                Siguiente Semana →
              </Button>
            </div>
          </div>

          {/* Leyenda Elegante */}
          <div className="flex items-center gap-8 mb-8 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-white border-2 border-gray-200 rounded-lg shadow-sm"></div>
              <span className="text-sm font-semibold text-gray-700">Sesión disponible</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-blue-100 border-2 border-blue-300 rounded-lg flex items-center justify-center shadow-sm">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-sm font-semibold text-gray-700">Sesión con cita</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-gray-200 border-2 border-gray-400 rounded-lg flex items-center justify-center shadow-sm">
                <Ban className="w-4 h-4 text-gray-600" />
              </div>
              <span className="text-sm font-semibold text-gray-700">Sesión inhabilitada</span>
            </div>
            <div className="ml-auto">
              <div className="text-xs font-medium text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
                ⏱️ Cada bloque = 45 minutos
              </div>
            </div>
          </div>

          {/* Calendario */}
          <div className="grid grid-cols-6 gap-4">
            {/* Header con horas */}
            <div className="col-span-1">
              <div className="h-12"></div>
              {schedule[0]?.blocks.map((block) => (
                <div key={block.id} className="h-12 flex items-center justify-center text-xs text-gray-500 border-b border-gray-100">
                  {block.startTime}
                </div>
              ))}
            </div>

            {/* Días de la semana */}
            {schedule.map((day) => (
              <div key={day.date} className="col-span-1">
                {/* Header del día */}
                <div 
                  className={`h-12 flex flex-col items-center justify-center text-sm font-medium border rounded-t-lg cursor-pointer transition-colors ${
                    day.isFullDayBlocked 
                      ? 'bg-gray-200 border-gray-400 text-gray-600' 
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => handleDayClick(day.date)}
                  title="Haz clic para inhabilitar todo el día"
                >
                  <div>{day.dayName}</div>
                  <div className="text-xs text-gray-500">{formatDate(day.date)}</div>
                  {day.isFullDayBlocked && (
                    <Ban className="w-4 h-4 text-gray-600 mt-1" />
                  )}
                </div>

                {/* Bloques de tiempo */}
                {day.blocks.map((block) => {
                  const status = getBlockStatus(block);
                  return (
                    <div
                      key={block.id}
                      className={`h-12 border-b border-r border-l ${getBlockColor(status)} cursor-pointer transition-colors flex items-center justify-center ${
                        status === 'available' ? 'hover:bg-red-50' : ''
                      }`}
                      onClick={() => status === 'available' && handleBlockClick(day.date, block.id)}
                      title={status === 'available' ? 'Haz clic para inhabilitar este bloque' : 'Bloque no disponible'}
                    >
                      {getBlockIcon(status)}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Resumen de Cambios */}
        {blockedDays.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
              Resumen de Cambios
            </h3>
            <div className="space-y-3">
              {blockedDays.map((blockedDay, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">
                      {formatDate(blockedDay.date)} - {blockedDay.reason}
                    </div>
                    <div className="text-sm text-gray-600">
                      {blockedDay.affectedAppointments} cita(s) afectada(s)
                    </div>
                  </div>
                  <Badge variant="warning" className="text-xs">
                    {blockedDay.affectedAppointments > 0 ? 'Notificaciones enviadas' : 'Sin citas afectadas'}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Información */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Info className="w-5 h-5 mr-2 text-blue-600" />
            Instrucciones
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">❌ Inhabilitar Día Completo</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Haz clic en el header del día</li>
                <li>• Selecciona tipo de motivo y especifica detalles</li>
                <li>• Se inhabilitarán todas las sesiones de 45 min del día</li>
                <li>• Se notificará automáticamente a los pacientes</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">🕒 Inhabilitar Sesiones Específicas</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Haz clic en una sesión disponible (blanco)</li>
                <li>• Selecciona tipo de motivo y especifica detalles</li>
                <li>• Solo esa sesión de 45 min quedará inhabilitada</li>
                <li>• El resto del día sigue disponible</li>
              </ul>
            </div>
          </div>
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Info className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h6 className="text-sm font-semibold text-blue-800 mb-1">Horario de Atención</h6>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Horario: Lunes a Viernes de 8:00 AM a 2:00 PM</li>
                  <li>• Duración de sesiones: 45 minutos</li>
                  <li>• Total de sesiones por día: 8 sesiones de 45 min</li>
                  <li>• Última sesión disponible: 13:15 - 14:00 PM</li>
                  <li>• Los cambios se sincronizan automáticamente con los calendarios</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
        </div>
      </div>

      {/* Modal para inhabilitar */}
      {showBlockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {blockingType === 'day' ? '🛑 Inhabilitar Día Completo' : '🚫 Inhabilitar Bloques'}
            </h3>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                {blockingType === 'day' 
                  ? `¿Estás seguro de que quieres inhabilitar todo el día ${formatDate(selectedDate)}?`
                  : `¿Estás seguro de que quieres inhabilitar ${selectedBlocks.length} bloque(s) de 45 minutos?`
                }
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Motivo:
              </label>
                              <select
                  value={blockReason}
                  onChange={(e) => {
                    setBlockReason(e.target.value);
                    setSpecificReason(''); // Limpiar motivo específico al cambiar tipo
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a]"
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
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivo Específico: <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={specificReason}
                  onChange={(e) => setSpecificReason(e.target.value)}
                  placeholder="Describe el motivo específico..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a]"
                  rows={3}
                  required
                />
              </div>
            )}

            <div className="flex gap-3">
                              <Button
                  onClick={handleConfirmBlock}
                  disabled={!blockReason || !specificReason}
                  className="bg-[#8e161a] hover:bg-[#7a1417] text-white flex-1 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  ✅ Confirmar
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
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}