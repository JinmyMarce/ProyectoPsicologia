import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  Calendar,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  Loader2,
  RefreshCw,
  Edit,
  Info,
  X,
  FileText
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getUserAppointments } from '../../services/appointments';

// Funciones compartidas para formatear fecha y hora
function parseLocalDate(dateStr: string): Date {
  if (!dateStr) return new Date();
  if (dateStr.includes('T')) {
    return new Date(dateStr);
  }
  if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
  return new Date(dateStr);
}

const formatDate = (dateString: string) => {
  try {
    const date = parseLocalDate(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    return dateString;
  }
};

const formatTime = (timeString: string | null | undefined) => {
  if (!timeString) return 'N/A';
  let timeStr = String(timeString);
  if (timeStr.includes(' ')) {
    timeStr = timeStr.split(' ')[1] || timeStr.split(' ')[0];
  }
  timeStr = timeStr.replace(/[^\d:]/g, '');
  if (timeStr.match(/^\d{2}:\d{2}$/)) {
    return timeStr;
  }
  const parts = timeStr.split(':');
  if (parts.length >= 2) {
    let hours = parseInt(parts[0], 10);
    let minutes = parseInt(parts[1], 10);
    if (isNaN(hours) || isNaN(minutes)) {
      return timeString;
    }
    hours = Math.max(0, Math.min(23, hours));
    minutes = Math.max(0, Math.min(59, minutes));
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }
  return timeString;
};

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

interface RescheduleModalProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  onReschedule: (appointmentId: number, newDate: string, newTime: string) => Promise<void>;
}

const RescheduleModal: React.FC<RescheduleModalProps> = ({
  appointment,
  isOpen,
  onClose,
  onReschedule
}) => {
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const timeSlots = [
    '08:00', '08:45', '09:30', '10:15', '11:00', '11:45', '12:30', '13:15'
  ];

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const handleReschedule = async () => {
    if (!appointment || !newDate || !newTime) {
      setError('Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onReschedule(appointment.id, newDate, newTime);
      onClose();
    } catch (error: any) {
      setError(error.message || 'Error al reprogramar la cita');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !appointment) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center z-50 p-3 sm:p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden border border-slate-200 relative" 
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: `
            0 32px 64px rgba(0, 0, 0, 0.16), 
            0 16px 32px rgba(0, 0, 0, 0.12),
            0 8px 16px rgba(0, 0, 0, 0.08)
          `
        }}
      >
        {/* Header del Modal */}
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-3 xs:p-4 border-b border-violet-700/20">
          <div className="flex justify-between items-center gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="text-lg xs:text-xl font-black text-white tracking-tight">Reprogramar Cita</h3>
              <p className="text-xs xs:text-sm text-violet-100 font-medium mt-0.5">Selecciona nueva fecha y hora</p>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 xs:w-8 xs:h-8 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-all duration-300 border border-white/30 hover:border-white/50 flex-shrink-0"
            >
              <X className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Contenido del Modal */}
        <div className="p-3 xs:p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="space-y-3">
            {/* Cita Actual */}
            <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-lg p-3 border border-slate-200/50">
              <h4 className="font-bold text-slate-900 mb-2 text-base flex items-center">
                <Info className="w-4 h-4 mr-2 text-blue-600" />
                Cita Actual
              </h4>
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-2.5">
                <div className="bg-white rounded-lg p-2.5 border border-slate-200/50">
                  <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">Fecha</p>
                  <p className="text-sm font-bold text-slate-900">{formatDate(appointment.date)}</p>
                </div>
                <div className="bg-white rounded-lg p-2.5 border border-slate-200/50">
                  <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">Hora</p>
                  <p className="text-sm font-bold text-slate-900">{formatTime(appointment.time)}</p>
                </div>
                <div className="bg-white rounded-lg p-2.5 border border-slate-200/50 xs:col-span-2">
                  <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">Psicólogo</p>
                  <p className="text-sm font-bold text-slate-900 truncate">{appointment.psychologist_name}</p>
                </div>
              </div>
            </div>

            {/* Nueva Fecha y Hora */}
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Nueva fecha
                </label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  min={getMinDate()}
                  className="w-full px-4 py-2.5 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-base transition-all duration-300"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Nueva hora
                </label>
                <select
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-base transition-all duration-300"
                >
                  <option value="">Seleccionar hora</option>
                  {timeSlots.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-red-800 text-sm font-medium">{error}</p>
                </div>
              </div>
            )}

            <div className="bg-gradient-to-br from-amber-50 to-yellow-50/50 border border-amber-200/50 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-amber-800">
                  <p className="font-bold mb-1.5">Importante:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Solo puedes reprogramar con 24 horas de anticipación</li>
                    <li>• La nueva fecha debe ser al menos mañana</li>
                    <li>• El psicólogo será notificado del cambio</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={handleReschedule}
                disabled={loading || !newDate || !newTime}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 disabled:from-slate-300 disabled:to-slate-400 text-white rounded-lg transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-lg font-bold text-sm hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Edit className="w-5 h-5 mr-2" />
                )}
                Reprogramar
              </button>
              <button
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2.5 bg-white border-2 border-slate-300 hover:border-slate-400 text-slate-700 rounded-lg transition-all duration-300 flex items-center justify-center font-bold text-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export function RescheduleAppointment() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [rescheduleModal, setRescheduleModal] = useState<{
    isOpen: boolean;
    appointment: Appointment | null;
  }>({
    isOpen: false,
    appointment: null
  });

  const loadAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getUserAppointments();
      setAppointments(data);
    } catch (error) {
      console.error('Error cargando citas:', error);
      setError('Error al cargar las citas. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.email) {
      loadAppointments();
    }
  }, [user, loadAppointments]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAppointments();
    setRefreshing(false);
  };

  const canReschedule = (appointment: Appointment) => {
    const appointmentDate = new Date(appointment.date);
    const now = new Date();
    const timeDiff = appointmentDate.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);

    return hoursDiff >= 24 && appointment.status === 'confirmed';
  };

  const handleReschedule = async (appointmentId: number, newDate: string, newTime: string) => {
    try {
      // Simular reprogramación de cita (en un caso real, harías una llamada a la API)
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSuccess('Cita reprogramada exitosamente');
      await loadAppointments(); // Recargar citas

      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      throw new Error(error.message || 'Error al reprogramar la cita');
    }
  };

  const openRescheduleModal = (appointment: Appointment) => {
    setRescheduleModal({
      isOpen: true,
      appointment
    });
  };

  const closeRescheduleModal = () => {
    setRescheduleModal({
      isOpen: false,
      appointment: null
    });
  };

  const reschedulableAppointments = appointments.filter(canReschedule);

  return (
    <div className="h-screen overflow-hidden bg-gray-50 font-sans selection:bg-slate-100 selection:text-slate-900">
      {/* Header Section - Compact & Professional */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl xs:rounded-2xl shadow-2xl relative overflow-hidden mx-1.5 xs:mx-2 sm:mx-3 mt-2 xs:mt-3 border border-white/10">
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

        <div className="w-full px-3 xs:px-4 sm:px-6 lg:px-8 pt-4 xs:pt-5 pb-5 xs:pb-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 xs:gap-3">
            <div className="animate-fade-in">
              <div className="flex items-center space-x-1.5 xs:space-x-2 mb-1 xs:mb-1.5">
                <span className="px-2.5 xs:px-3 py-1 xs:py-1.5 rounded-full bg-white/15 backdrop-blur-xl text-white text-[10px] xs:text-xs font-bold flex items-center tracking-wide uppercase shadow-lg border border-white/20">
                  <RefreshCw className="w-3 h-3 xs:w-3.5 xs:h-3.5 mr-1 xs:mr-1.5" />
                  Reprogramar
                </span>
              </div>
              <h1 className="text-2xl xs:text-3xl md:text-4xl font-black tracking-tight text-white mb-1 xs:mb-1.5 leading-tight drop-shadow-lg">
                Reprogramar Citas
              </h1>
              <p className="text-slate-300 text-xs xs:text-sm max-w-2xl font-medium leading-relaxed drop-shadow-md">
                Modifica tus citas confirmadas con al menos 24 horas de anticipación
              </p>
            </div>
          </div>
        </div>

        {/* Wave pattern - Compacto */}
        <div className="absolute bottom-0 left-0 right-0 h-8 overflow-hidden pointer-events-none">
          <svg className="absolute bottom-0 w-full h-full" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0 C150,80 350,80 600,40 C850,0 1050,0 1200,40 L1200,120 L0,120 Z" fill="white" fillOpacity="0.08" />
            <path d="M0,20 C200,100 400,100 600,60 C800,20 1000,20 1200,60 L1200,120 L0,120 Z" fill="white" fillOpacity="0.04" />
          </svg>
        </div>
      </div>

      <div className="w-full px-2 xs:px-3 sm:px-4 lg:px-6 -mt-2 relative z-20 overflow-y-auto h-[calc(100vh-8rem)] xs:h-[calc(100vh-9rem)] sm:h-[calc(100vh-10rem)]">
        {/* Mensajes de estado - Compactos */}
        {error && (
          <div className="mb-3 bg-red-50 border border-red-200 rounded-xl p-3 shadow-sm flex items-center space-x-2.5 animate-fade-in">
            <div className="bg-red-100 p-1.5 rounded-full flex-shrink-0">
              <AlertCircle className="w-4 h-4 text-red-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-red-800 font-bold text-sm">Error</h4>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-3 shadow-sm flex items-center space-x-2.5 animate-fade-in">
            <div className="bg-green-100 p-1.5 rounded-full flex-shrink-0">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-green-800 font-bold text-sm">Éxito</h4>
              <p className="text-green-700 text-sm">{success}</p>
            </div>
          </div>
        )}

        {/* Políticas de Reprogramación - Compactas */}
        <div className="bg-white rounded-xl shadow-md border border-slate-200 mb-3 p-3 xs:p-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-50/50 to-orange-50/50 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none"></div>

          {/* Header con botón integrado */}
          <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2 xs:gap-3 mb-3 relative z-10">
            <div className="flex items-center space-x-2.5 xs:space-x-3">
              <div className="w-8 h-8 xs:w-9 xs:h-9 bg-amber-100 rounded-lg flex items-center justify-center shadow-sm border border-amber-200">
                <Info className="w-4 h-4 xs:w-5 xs:h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-slate-900 font-bold text-base xs:text-lg">Políticas de Reprogramación</h3>
                <p className="text-slate-500 text-xs xs:text-sm">Reglas para gestionar tus citas</p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="text-xs xs:text-sm font-bold rounded-lg px-3 xs:px-4 py-1.5 xs:py-2 transition-all hover:scale-105"
            >
              <RefreshCw className={`w-3.5 h-3.5 xs:w-4 xs:h-4 mr-1.5 ${refreshing ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>

          {/* Reglas compactas */}
          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 gap-2 xs:gap-2.5 relative z-10">
            {[
              { id: 1, title: 'Solo Confirmadas', desc: 'Citas confirmadas', color: 'bg-blue-100 text-blue-700' },
              { id: 2, title: '24h Anticipación', desc: 'Mínimo 24 horas', color: 'bg-indigo-100 text-indigo-700' },
              { id: 3, title: 'Fecha Mínima', desc: 'Al menos mañana', color: 'bg-violet-100 text-violet-700' },
              { id: 4, title: 'Notificación', desc: 'Automática', color: 'bg-purple-100 text-purple-700' },
              { id: 5, title: 'Filtrado', desc: 'Inteligente', color: 'bg-fuchsia-100 text-fuchsia-700' }
            ].map((rule) => (
              <div key={rule.id} className="bg-slate-50 rounded-lg p-2 xs:p-2.5 border border-slate-100 hover:shadow-md transition-all duration-300 group">
                <div className="flex items-center space-x-1.5 xs:space-x-2 mb-1">
                  <div className={`w-6 h-6 xs:w-7 xs:h-7 ${rule.color} rounded-full flex items-center justify-center font-bold text-xs xs:text-sm group-hover:scale-110 transition-transform flex-shrink-0`}>
                    {rule.id}
                  </div>
                  <h4 className="text-slate-900 font-bold text-xs xs:text-sm truncate">{rule.title}</h4>
                </div>
                <p className="text-slate-500 text-[10px] xs:text-xs pl-7 xs:pl-8">{rule.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Lista de citas reprogramables */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-md p-4 border border-slate-200 text-center">
            <div className="flex items-center justify-center py-6">
              <div className="w-7 h-7 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
              <span className="ml-3 text-slate-600 font-semibold text-sm">Cargando citas...</span>
            </div>
          </div>
        ) : reschedulableAppointments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-4 border border-slate-200 text-center">
            <div className="text-center py-6">
              <div className="w-14 h-14 bg-gradient-to-br from-violet-100 to-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-violet-100/50">
                <Calendar className="w-7 h-7 text-violet-500" />
              </div>
              <h3 className="text-slate-900 font-bold mb-1.5 text-base">No hay citas para reprogramar</h3>
              <p className="text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
                Solo se muestran citas confirmadas con más de 24 horas de anticipación. Si no ves tu cita aquí, es posible que ya no se pueda reprogramar.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {reschedulableAppointments.map((appointment) => (
              <div key={appointment.id} className="group relative bg-white rounded-xl shadow-md hover:shadow-lg p-3 xs:p-4 border border-slate-200 hover:border-slate-300 transition-all duration-300 hover:-translate-y-0.5 overflow-hidden">
                <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-slate-50/50 to-transparent rounded-full -mr-10 -mt-10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative z-10">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3 mb-3">
                    <div className="flex-1 min-w-0 w-full">
                      <div className="flex items-center gap-2 xs:gap-2.5 mb-1.5">
                        <div className="w-8 h-8 xs:w-10 xs:h-10 bg-gradient-to-br from-violet-100 to-purple-200 rounded-lg flex items-center justify-center shadow-sm border border-violet-100 flex-shrink-0">
                          <Calendar className="w-4 h-4 xs:w-5 xs:h-5 text-violet-700" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate">
                            {appointment.psychologist_name}
                          </h3>
                          <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-0.5">
                            {formatDate(appointment.date)} • {formatTime(appointment.time)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 self-start sm:self-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <Badge className="bg-green-50 text-green-700 border-green-200 px-2.5 py-1 text-xs xs:text-sm font-bold rounded-lg">
                        Reprogramable
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-2.5 border border-blue-100/50">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-blue-700 uppercase tracking-wide">Hora Cita</p>
                          <p className="text-base font-bold text-slate-900">{formatTime(appointment.time)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-2.5 border border-emerald-100/50">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide">Psicólogo</p>
                          <p className="text-base font-bold text-slate-900 truncate">{appointment.psychologist_name.split(' ')[0]}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-lg p-2.5 border border-violet-100/50">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-violet-600 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-violet-700 uppercase tracking-wide">Agendada</p>
                          <p className="text-base font-bold text-slate-900">{new Date(appointment.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-2.5 border border-green-100/50">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-green-700 uppercase tracking-wide">Estado</p>
                          <p className="text-base font-bold text-slate-900">Confirmada</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {appointment.reason && (
                    <div className="mb-3 bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-lg p-3 xs:p-4 border border-slate-200/50">
                      <h4 className="font-bold text-slate-900 mb-2 text-sm flex items-center">
                        <FileText className="w-4 h-4 mr-2 text-blue-600" />
                        Motivo
                      </h4>
                      <p className="text-sm text-slate-700 leading-relaxed line-clamp-2">{appointment.reason}</p>
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => openRescheduleModal(appointment)}
                      className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-lg transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-lg font-bold text-xs xs:text-sm hover:scale-105"
                    >
                      <Edit className="w-3.5 h-3.5 xs:w-4 xs:h-4 mr-1.5" />
                      Reprogramar Cita
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de reprogramación */}
      <RescheduleModal
        appointment={rescheduleModal.appointment}
        isOpen={rescheduleModal.isOpen}
        onClose={closeRescheduleModal}
        onReschedule={handleReschedule}
      />
    </div>
  );
}