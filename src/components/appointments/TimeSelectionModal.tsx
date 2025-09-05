import React, { useState, useEffect } from 'react';
import { Clock, Calendar, X, ArrowRight, CheckCircle, AlertCircle, Star, Shield } from 'lucide-react';
import { getAvailableSlots } from '../../services/appointments';
import '../../styles/appointment-modal.css';

interface TimeSlot {
  id: number;
  time: string;
  available: boolean;
}

interface TimeSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  psychologistId: number;
  selectedDate: string;
  onTimeSelected: (time: string) => void;
}

export const TimeSelectionModal: React.FC<TimeSelectionModalProps> = ({
  isOpen,
  onClose,
  psychologistId,
  selectedDate,
  onTimeSelected
}) => {
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTime, setSelectedTime] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && psychologistId && selectedDate) {
      loadAvailableSlots();
    }
  }, [isOpen, psychologistId, selectedDate]);

  const loadAvailableSlots = async () => {
    try {
      setLoading(true);
      setError('');
      const slots = await getAvailableSlots(psychologistId, selectedDate);
      
      // Filtrar horarios si es para hoy mismo
      let filteredSlots = Array.isArray(slots) ? slots : [];
      
      // Verificar si la fecha seleccionada es hoy
      const today = new Date().toISOString().split('T')[0];
      if (selectedDate === today) {
        const currentTime = new Date();
        const minimumTime = new Date(currentTime.getTime() + 60 * 60 * 1000); // 60 minutos después
        
        filteredSlots = slots.filter((slot: TimeSlot) => {
          const [hours, minutes] = slot.time.split(':').map(Number);
          const slotTime = new Date();
          slotTime.setHours(hours, minutes, 0, 0);
          
          return slotTime >= minimumTime;
        });
        
        console.log(`🕐 Horarios filtrados para hoy: ${filteredSlots.length} disponibles después de las ${minimumTime.getHours()}:${minimumTime.getMinutes().toString().padStart(2, '0')}`);
      }
      
      setAvailableSlots(filteredSlots);
    } catch (error) {
      console.error('Error cargando horarios:', error);
      setError('Error al cargar los horarios disponibles');
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleContinue = () => {
    if (selectedTime) {
      onTimeSelected(selectedTime);
    }
  };

  function parseLocalDate(dateStr: string): Date {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  const formatDate = (dateString: string) => {
    const date = parseLocalDate(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-white via-gray-50 to-slate-50 rounded-lg shadow-2xl max-w-xl w-full mx-3 max-h-[85vh] overflow-y-auto border border-gray-200" style={{
        boxShadow: `
          0 32px 64px rgba(0, 0, 0, 0.12), 
          0 16px 32px rgba(0, 0, 0, 0.08),
          0 8px 16px rgba(0, 0, 0, 0.04),
          inset 0 1px 0 rgba(255, 255, 255, 0.9)
        `
      }}>
        <div className="p-3">
          {/* Header Compacto */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 flex items-center justify-center shadow-md border border-slate-600">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <div className="absolute -inset-0.5 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg blur opacity-20 -z-10"></div>
              </div>
              <div>
                <h2 className="text-base font-black text-gray-900 tracking-tight">
                  Selecciona tu Horario
                </h2>
                <p className="text-slate-600 text-xs font-medium">
                  Elige el momento perfecto para tu consulta
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg bg-white hover:bg-red-50 flex items-center justify-center transition-all duration-300 shadow-sm border border-gray-200 hover:border-red-300 hover:shadow-md"
            >
              <X className="w-3.5 h-3.5 text-gray-600 hover:text-red-600" />
            </button>
          </div>

          {/* Información de la fecha seleccionada - Compacto */}
          <div className="mb-3">
            <div className="bg-gradient-to-r from-slate-50 via-gray-50 to-slate-100 rounded-lg p-2.5 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800 flex items-center justify-center shadow-sm border border-slate-500">
                  <Calendar className="w-3 h-3 text-white" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-900">
                    Fecha Seleccionada
                  </h3>
                  <p className="text-gray-700 capitalize font-semibold text-xs">
                    {formatDate(selectedDate)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Estado de carga - Compacto */}
          {loading && (
            <div className="text-center py-8">
              <div className="relative mb-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-slate-700 mx-auto" style={{
                  boxShadow: '0 8px 16px rgba(51, 65, 85, 0.2)'
                }}></div>
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-2 tracking-tight">Cargando horarios disponibles...</h3>
              <p className="text-slate-600 text-sm font-medium">Buscando los mejores horarios para ti</p>
            </div>
          )}

          {/* Error - Compacto */}
          {error && (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center mx-auto mb-4 shadow-lg border-2 border-red-400">
                <AlertCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-2 tracking-tight">Error al cargar horarios</h3>
              <p className="text-slate-600 mb-4 text-sm font-medium">{error}</p>
              <button
                onClick={loadAvailableSlots}
                className="px-4 py-2 bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-lg hover:from-slate-800 hover:to-slate-900 transition-all duration-300 font-semibold text-sm shadow-lg"
              >
                Reintentar
              </button>
            </div>
          )}

          {/* Horarios disponibles - Compacto */}
          {!loading && !error && availableSlots.length > 0 && (
            <div className="mb-3">
              <div className="bg-gradient-to-br from-white to-slate-50 rounded-lg p-2.5 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded-md bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800 flex items-center justify-center shadow-sm border border-slate-500">
                    <CheckCircle className="w-2.5 h-2.5 text-white" />
                  </div>
                  <h3 className="text-xs font-black text-gray-900 tracking-tight">
                    Horarios Disponibles
                  </h3>
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs font-bold border border-gray-200">
                    {availableSlots.length} opciones
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => handleTimeSelect(slot.time)}
                      className={`
                        p-4 rounded-lg transition-all duration-300 transform hover:scale-105 text-center relative border-2 group
                        ${selectedTime === slot.time
                          ? 'bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 text-white shadow-lg scale-105 border-slate-600'
                          : 'bg-white hover:bg-slate-50 text-gray-700 hover:text-gray-800 shadow-sm hover:shadow-md border-slate-200 hover:border-slate-300'
                        }
                      `}
                    >
                      <div className="relative z-10">
                        <div className="text-sm font-bold mb-0.5">
                          {slot.time}
                        </div>
                        <div className="text-xs font-medium opacity-80">
                          {selectedTime === slot.time ? 'Seleccionado' : 'Disponible'}
                        </div>
                        
                        {/* Icono de check para el seleccionado */}
                        {selectedTime === slot.time && (
                          <div className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-md">
                            <CheckCircle className="w-2.5 h-2.5 text-slate-900" />
                          </div>
                        )}
                        
                        {/* Efecto de brillo sutil */}
                        {selectedTime === slot.time && (
                          <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/10 to-transparent"></div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Sin horarios disponibles - Compacto */}
          {!loading && !error && availableSlots.length === 0 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center mx-auto mb-4 shadow-lg border-2 border-amber-400">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-2 tracking-tight">No hay horarios disponibles</h3>
              <p className="text-slate-600 mb-4 text-sm font-medium">
                Lo sentimos, no hay horarios disponibles para esta fecha. 
                Por favor, selecciona otra fecha.
              </p>
            </div>
          )}

          {/* Información adicional - Compacto */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
            <div className="flex items-center gap-2 p-2.5 bg-gradient-to-br from-white to-slate-50 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800 flex items-center justify-center shadow-sm border border-slate-500">
                <Clock className="w-3 h-3 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-gray-800 text-xs">Duración: 50 min</h4>
                <p className="text-gray-600 text-xs">Sesión completa</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-2.5 bg-gradient-to-br from-white to-slate-50 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800 flex items-center justify-center shadow-sm border border-slate-500">
                <Shield className="w-3 h-3 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-gray-800 text-xs">Confidencial</h4>
                <p className="text-gray-600 text-xs">Datos protegidos</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-2.5 bg-gradient-to-br from-white to-slate-50 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800 flex items-center justify-center shadow-sm border border-slate-500">
                <Star className="w-3 h-3 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-gray-800 text-xs">Gratuito</h4>
                <p className="text-gray-600 text-xs">Sin costo</p>
              </div>
            </div>
          </div>

          {/* Botones de acción - Compactos */}
          <div className="flex justify-between items-center pt-3 border-t border-slate-200">
            <button
              onClick={onClose}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-300 font-semibold text-xs flex items-center gap-1.5 shadow-sm hover:shadow-md"
            >
              Cancelar
            </button>
            
            <button
              onClick={handleContinue}
              disabled={!selectedTime}
              className={`
                px-3 py-1.5 rounded-lg font-semibold text-xs transition-all duration-300 flex items-center gap-1.5 shadow-lg
                ${selectedTime
                  ? 'bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 text-white hover:from-slate-800 hover:to-slate-900 transform hover:scale-105 hover:shadow-xl'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              Continuar
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 