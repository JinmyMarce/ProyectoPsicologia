import React, { useState, useEffect } from 'react';
import { Clock, Calendar, X, ArrowRight } from 'lucide-react';
import { getAvailableSlots } from '../../services/appointments';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

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
      setAvailableSlots(Array.isArray(slots) ? slots : []);
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Seleccionar Horario</h2>
                <p className="text-sm text-gray-600">Paso 1 de 4</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Fecha seleccionada */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-blue-900">
                {formatDate(selectedDate)}
              </span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Horarios disponibles */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Cargando horarios...</span>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 mb-4">Horarios disponibles:</h3>
              
              {/* Información sobre horarios */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <div className="flex items-start space-x-2">
                  <div className="text-blue-600 mt-0.5">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Horarios de atención:</p>
                    <p className="mt-1">Lunes a Viernes de 8:00 AM a 2:00 PM. Cada sesión dura 45 minutos.</p>
                  </div>
                </div>
              </div>
              
              {availableSlots.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No hay horarios disponibles para esta fecha</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {availableSlots
                    .filter(slot => slot.available)
                    .map(slot => (
                      <button
                        key={slot.id}
                        onClick={() => handleTimeSelect(slot.time)}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                          selectedTime === slot.time
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-lg font-bold">{slot.time}</div>
                          <div className="text-sm text-gray-600">45 min</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {slot.time === '08:00' ? 'Primera cita' : 
                             slot.time === '13:15' ? 'Última cita' : 'Cita regular'}
                          </div>
                        </div>
                      </button>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* Botones */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 mr-2"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleContinue}
              disabled={!selectedTime || loading}
              className="flex-1 ml-2"
            >
              Continuar
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}; 