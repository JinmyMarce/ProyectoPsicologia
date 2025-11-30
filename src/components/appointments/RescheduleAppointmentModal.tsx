import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, Clock, User, Loader2, Info, AlertCircle, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Appointment {
  id: number;
  date: string;
  time: string;
  psychologist_name?: string;
  status: string;
}

interface RescheduleAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  onConfirm: (appointmentId: number, newDate: string, newTime: string) => Promise<void>;
}

const timeSlots = [
  '08:00', '08:45', '09:30', '10:15', '11:00', '11:45', '12:30', '13:15'
];

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
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

export const RescheduleAppointmentModal: React.FC<RescheduleAppointmentModalProps> = ({
  isOpen,
  onClose,
  appointment,
  onConfirm
}) => {
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      await onConfirm(appointment.id, newDate, newTime);
      onClose();
      setNewDate('');
      setNewTime('');
    } catch (error: any) {
      setError(error.message || 'Error al reprogramar la cita');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError('');
      setNewDate('');
      setNewTime('');
      onClose();
    }
  };

  if (!isOpen || !appointment) return null;

  // Solo permitir reprogramar citas confirmadas
  if (appointment.status !== 'confirmed') {
    return null;
  }

  return createPortal(
    <div 
      className="fixed inset-0 z-[10000] flex items-center justify-center" 
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        margin: 0,
        padding: 0,
        zIndex: 10000
      }}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={handleClose}
        style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh'
        }}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-hidden transform transition-all duration-300 ease-out border-2 border-slate-200 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-4 xs:p-5 sm:p-6 border-b-2 border-violet-700/20">
          <div className="flex justify-between items-center gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="text-lg xs:text-xl sm:text-2xl font-bold text-white tracking-tight">Reprogramar Cita</h3>
              <p className="text-xs xs:text-sm text-violet-100 font-medium mt-1">Selecciona nueva fecha y hora</p>
            </div>
            {!loading && (
              <button
                onClick={handleClose}
                className="w-8 h-8 xs:w-9 xs:h-9 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-all duration-300 border border-white/30 hover:border-white/50 flex-shrink-0"
                aria-label="Cerrar"
              >
                <X className="w-4 h-4 xs:w-5 xs:h-5 text-white" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 xs:p-5 sm:p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-4 xs:space-y-5">
            {/* Cita Actual */}
            <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-xl p-4 xs:p-5 border border-slate-200/50">
              <h4 className="font-bold text-slate-900 mb-3 text-base xs:text-lg flex items-center">
                <Info className="w-4 h-4 xs:w-5 xs:h-5 mr-2 text-blue-600" />
                Cita Actual
              </h4>
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
                <div className="bg-white rounded-lg p-3 border border-slate-200/50">
                  <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">Fecha</p>
                  <p className="text-sm xs:text-base font-bold text-slate-900 capitalize">{formatDate(appointment.date)}</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-slate-200/50">
                  <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">Hora</p>
                  <p className="text-sm xs:text-base font-bold text-slate-900">{formatTime(appointment.time)}</p>
                </div>
                {appointment.psychologist_name && (
                  <div className="bg-white rounded-lg p-3 border border-slate-200/50 xs:col-span-2">
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">Psicólogo</p>
                    <p className="text-sm xs:text-base font-bold text-slate-900 truncate">Dr. {appointment.psychologist_name}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Nueva Fecha y Hora */}
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm xs:text-base font-bold text-slate-700 mb-2">
                  Nueva fecha <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  min={getMinDate()}
                  className="w-full px-4 py-2.5 xs:py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-sm xs:text-base transition-all duration-300"
                />
              </div>

              <div>
                <label className="block text-sm xs:text-base font-bold text-slate-700 mb-2">
                  Nueva hora <span className="text-red-500">*</span>
                </label>
                <select
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full px-4 py-2.5 xs:py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-sm xs:text-base transition-all duration-300"
                >
                  <option value="">Seleccionar hora</option>
                  {timeSlots.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 xs:p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs xs:text-sm text-red-800 font-medium flex-1">{error}</p>
                </div>
              </div>
            )}

            <div className="bg-gradient-to-br from-amber-50 to-yellow-50/50 border border-amber-200/50 rounded-xl p-3 xs:p-4">
              <div className="flex items-start gap-2 xs:gap-3">
                <Info className="w-5 h-5 xs:w-6 xs:h-6 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs xs:text-sm text-amber-800">
                  <p className="font-bold mb-1.5">Importante:</p>
                  <ul className="space-y-1">
                    <li>• Solo puedes reprogramar con 24 horas de anticipación</li>
                    <li>• La nueva fecha debe ser al menos mañana</li>
                    <li>• El psicólogo será notificado del cambio</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col xs:flex-row gap-2 xs:gap-3 pt-2">
              <button
                onClick={handleClose}
                disabled={loading}
                className="flex-1 xs:flex-none px-4 xs:px-6 py-2.5 xs:py-3 bg-white border-2 border-slate-300 hover:border-slate-400 text-slate-700 rounded-xl transition-all duration-200 font-semibold text-xs xs:text-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                onClick={handleReschedule}
                disabled={loading || !newDate || !newTime}
                className="flex-1 px-4 xs:px-6 py-2.5 xs:py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 disabled:from-slate-300 disabled:to-slate-400 text-white rounded-xl transition-all duration-200 flex items-center justify-center shadow-lg shadow-violet-500/30 font-semibold text-xs xs:text-sm hover:scale-[1.02] disabled:hover:scale-100 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 xs:w-5 xs:h-5 mr-2 animate-spin" />
                    <span>Reprogramando...</span>
                  </>
                ) : (
                  <>
                    <Edit className="w-4 h-4 xs:w-5 xs:h-5 mr-2" />
                    <span>Reprogramar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

