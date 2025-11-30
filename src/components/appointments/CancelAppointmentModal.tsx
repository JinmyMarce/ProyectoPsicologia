import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertTriangle, Calendar, Clock, User, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Appointment {
  id: number;
  date: string;
  time: string;
  psychologist_name?: string;
  status: string;
}

interface CancelAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  onConfirm: (appointmentId: number) => Promise<void>;
}

export const CancelAppointmentModal: React.FC<CancelAppointmentModalProps> = ({
  isOpen,
  onClose,
  appointment,
  onConfirm
}) => {
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !appointment) {
    console.log('CancelAppointmentModal: No se muestra - isOpen:', isOpen, 'appointment:', appointment);
    return null;
  }

  // Solo permitir cancelar citas pendientes (verificación flexible)
  const status = (appointment.status || '').toLowerCase().trim();
  const canCancel = status === 'pending' || 
                    status === 'pendiente' || 
                    status.includes('pending') || 
                    status.includes('pendiente');
  
  console.log('CancelAppointmentModal: Estado de la cita:', appointment.status, 'Status normalizado:', status, 'Puede cancelar:', canCancel);
  
  if (!canCancel) {
    console.log('CancelAppointmentModal: No se puede cancelar - Estado:', appointment.status);
    return null;
  }

  const handleConfirm = async () => {
    try {
      setIsCancelling(true);
      setError(null);
      await onConfirm(appointment.id);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al cancelar la cita. Por favor, intenta de nuevo.');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleClose = () => {
    if (!isCancelling) {
      setError(null);
      onClose();
    }
  };

  const appointmentDate = new Date(appointment.date);
  const formattedDate = format(appointmentDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
  const formattedDateShort = format(appointmentDate, "d 'de' MMMM, yyyy", { locale: es });

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
      <div className="relative bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 ease-out border-2 border-slate-200 animate-in fade-in zoom-in-95 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 border-b-2 border-orange-300 rounded-t-xl sm:rounded-t-2xl p-4 xs:p-5 sm:p-6 relative overflow-hidden">
          {/* Patrón decorativo */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-orange-200/40 to-amber-200/30 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-amber-200/30 to-orange-200/20 rounded-full blur-2xl -ml-16 -mb-16 pointer-events-none"></div>
          
          <div className="flex items-start justify-between relative z-10">
            <div className="flex items-start gap-3 xs:gap-4 flex-1">
              <div className="bg-gradient-to-br from-orange-100 to-amber-100 border-2 border-orange-300 rounded-xl p-2.5 xs:p-3 flex-shrink-0 shadow-xl">
                <AlertTriangle className="w-5 h-5 xs:w-6 xs:h-6 text-orange-700" strokeWidth={2.5} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg xs:text-xl sm:text-2xl font-bold text-orange-900 leading-tight mb-1">
                  Cancelar Cita
                </h3>
                <p className="text-xs xs:text-sm text-orange-700/80 font-medium">
                  Esta acción no se puede deshacer
                </p>
              </div>
            </div>
            {!isCancelling && (
              <button
                onClick={handleClose}
                className="text-orange-600 hover:text-orange-700 hover:bg-orange-100 rounded-lg p-1.5 transition-colors flex-shrink-0"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4 xs:p-5 sm:p-6 bg-gradient-to-br from-white via-slate-50/30 to-white">
          {/* Información de la cita */}
          <div className="mb-5 xs:mb-6 space-y-3 xs:space-y-4">
            {/* Mensaje de advertencia */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl p-3 xs:p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 xs:w-6 xs:h-6 text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm xs:text-base font-bold text-orange-900 mb-1">
                    ⚠️ Advertencia Importante
                  </p>
                  <p className="text-xs xs:text-sm text-orange-800 leading-relaxed">
                    Esta acción no se puede deshacer. Al cancelar esta cita, perderás tu horario reservado y deberás agendar una nueva cita si deseas continuar con tu atención psicológica.
                  </p>
                </div>
              </div>
            </div>

            <p className="text-sm xs:text-base text-slate-700 font-semibold leading-relaxed">
              ¿Estás seguro de que deseas cancelar esta cita?
            </p>
            
            <div className="bg-gradient-to-br from-slate-50 to-gray-50 border border-slate-200 rounded-xl p-4 xs:p-5 space-y-3">
              {/* Fecha */}
              <div className="flex items-start gap-3">
                <div className="bg-white rounded-lg p-2 border border-slate-200 flex-shrink-0">
                  <Calendar className="w-4 h-4 xs:w-5 xs:h-5 text-slate-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-1">Fecha</p>
                  <p className="text-sm xs:text-base text-slate-900 font-semibold capitalize">
                    <span className="hidden xs:inline">{formattedDate}</span>
                    <span className="xs:hidden">{formattedDateShort}</span>
                  </p>
                </div>
              </div>
              
              {/* Hora */}
              <div className="flex items-start gap-3">
                <div className="bg-white rounded-lg p-2 border border-slate-200 flex-shrink-0">
                  <Clock className="w-4 h-4 xs:w-5 xs:h-5 text-slate-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-1">Hora</p>
                  <p className="text-sm xs:text-base text-slate-900 font-semibold">{appointment.time}</p>
                </div>
              </div>
              
              {/* Psicólogo */}
              {appointment.psychologist_name && (
                <div className="flex items-start gap-3">
                  <div className="bg-white rounded-lg p-2 border border-slate-200 flex-shrink-0">
                    <User className="w-4 h-4 xs:w-5 xs:h-5 text-slate-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-1">Psicólogo</p>
                    <p className="text-sm xs:text-base text-slate-900 font-semibold">Dr. {appointment.psychologist_name}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 xs:mb-5 bg-red-50 border border-red-200 rounded-xl p-3 xs:p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs xs:text-sm text-red-700 font-medium flex-1">{error}</p>
            </div>
          )}
          
          {/* Actions */}
          <div className="flex flex-col xs:flex-row gap-2 xs:gap-3">
            <button
              onClick={handleClose}
              disabled={isCancelling}
              className="flex-1 px-4 xs:px-6 py-2.5 xs:py-3 rounded-xl font-semibold text-xs xs:text-sm transition-all duration-200 border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              No, mantener cita
            </button>
            <button
              onClick={handleConfirm}
              disabled={isCancelling}
              className="flex-1 px-4 xs:px-6 py-2.5 xs:py-3 rounded-xl font-semibold text-xs xs:text-sm transition-all duration-200 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isCancelling ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Cancelando...</span>
                </>
              ) : (
                'Sí, cancelar cita'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

