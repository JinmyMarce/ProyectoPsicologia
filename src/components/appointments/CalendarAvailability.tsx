import React, { useEffect, useState } from 'react';
import { Calendar, AlertCircle, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { getAvailableSlots } from '../../services/appointments';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface CalendarAvailabilityProps {
  psychologistId: string;
  selectedDate: string;
  onDateSelect: (date: string) => void;
}

interface DayAvailability {
  date: string;
  isAvailable: boolean;
  isBlocked: boolean;
  availableSlots: number;
  isToday: boolean;
  isPast: boolean;
}

export const CalendarAvailability: React.FC<CalendarAvailabilityProps> = ({ 
  psychologistId, 
  selectedDate, 
  onDateSelect 
}) => {
  const [monthDays, setMonthDays] = useState<DayAvailability[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (psychologistId) {
      loadMonthAvailability();
    }
  }, [psychologistId, currentMonth]);

  const loadMonthAvailability = async () => {
    if (!psychologistId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const lastDay = new Date(year, month + 1, 0);
      const today = new Date();
      
      // Generar días del mes sin hacer llamadas individuales
      const days: DayAvailability[] = [];
      
      for (let d = 1; d <= lastDay.getDate(); d++) {
        const date = new Date(year, month, d);
        const dateStr = date.toISOString().split('T')[0];
        const isToday = date.toDateString() === today.toDateString();
        const isPast = date < today && !isToday;
        
        // Por defecto, asumimos que los días futuros están disponibles
        // Solo verificaremos disponibilidad cuando el usuario seleccione una fecha
        let isAvailable = !isPast;
        let isBlocked = false;
        let availableSlots = 0;
        
        days.push({ 
          date: dateStr, 
          isAvailable, 
          isBlocked, 
          availableSlots,
          isToday,
          isPast
        });
      }
      
      setMonthDays(days);
    } catch (err) {
      console.error('Error loading month availability:', err);
      setError('Error al cargar la disponibilidad del calendario');
    } finally {
      setLoading(false);
    }
  };

  // Función para verificar disponibilidad de una fecha específica
  const checkDateAvailability = async (date: string) => {
    if (!psychologistId) return;
    
    try {
      const slots = await getAvailableSlots(parseInt(psychologistId), date);
      const availableSlots = Array.isArray(slots) ? slots.filter(slot => slot.available).length : 0;
      const isAvailable = availableSlots > 0;
      
      // Actualizar el estado del día específico
      setMonthDays(prev => prev.map(day => 
        day.date === date 
          ? { ...day, isAvailable, availableSlots }
          : day
      ));
      
      return isAvailable;
    } catch (error) {
      console.error(`Error checking availability for ${date}:`, error);
      return false;
    }
  };

  const handleDateClick = async (date: string, isAvailable: boolean) => {
    if (isAvailable) {
      // Verificar disponibilidad real antes de seleccionar
      const realAvailability = await checkDateAvailability(date);
      if (realAvailability) {
        onDateSelect(date);
      }
    }
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-[#8e161a]" />
          Selecciona un día disponible
        </h3>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousMonth}
            disabled={loading}
          >
            ←
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
            disabled={loading}
          >
            Hoy
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextMonth}
            disabled={loading}
          >
            →
          </Button>
        </div>
      </div>

      <div className="text-center mb-4">
        <h4 className="text-xl font-bold text-gray-900">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h4>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center space-x-2 mb-4">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-800 font-semibold">{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-[#8e161a] mr-2" />
          <span className="text-gray-600">Cargando calendario...</span>
        </div>
      ) : (
        <>
          {/* Días de la semana */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {dayNames.map(day => (
              <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Días del mes */}
          <div className="grid grid-cols-7 gap-2">
            {monthDays.map(day => {
              const isSelected = day.date === selectedDate;
              const date = new Date(day.date);
              
              return (
                <button
                  key={day.date}
                  className={`p-3 rounded-lg text-sm font-semibold border transition-all duration-200 min-h-[60px] flex flex-col items-center justify-center
                    ${isSelected ? 'bg-[#8e161a] text-white border-[#8e161a] shadow-lg' : ''}
                    ${day.isAvailable && !isSelected ? 'bg-green-50 border-green-400 hover:bg-green-100 hover:shadow-md' : ''}
                    ${day.isBlocked ? 'bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed' : ''}
                    ${day.isPast ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' : ''}
                    ${!day.isAvailable && !day.isBlocked && !day.isPast ? 'bg-yellow-50 border-yellow-400 text-yellow-700 cursor-not-allowed' : ''}
                  `}
                  disabled={day.isPast}
                  onClick={() => handleDateClick(day.date, day.isAvailable)}
                  title={
                    day.isPast
                      ? 'Fecha pasada'
                      : day.isBlocked
                      ? 'Día bloqueado por el psicólogo'
                      : day.isAvailable
                      ? day.availableSlots > 0 ? `${day.availableSlots} horarios disponibles` : 'Verificar disponibilidad'
                      : 'Sin horarios disponibles'
                  }
                >
                  <span className={`${day.isToday ? 'font-bold' : ''}`}>
                    {date.getDate()}
                  </span>
                  {day.isToday && (
                    <div className="w-1 h-1 bg-[#8e161a] rounded-full mt-1"></div>
                  )}
                  {day.isAvailable && !isSelected && day.availableSlots > 0 && (
                    <div className="flex items-center mt-1">
                      <Clock className="w-3 h-3 text-green-600 mr-1" />
                      <span className="text-xs text-green-600">{day.availableSlots}</span>
                    </div>
                  )}
                  {day.isAvailable && isSelected && (
                    <CheckCircle className="w-4 h-4 mt-1" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Leyenda */}
          <div className="text-xs text-gray-500 mt-4 flex flex-wrap gap-4 justify-center">
            <span className="flex items-center">
              <span className="inline-block w-3 h-3 bg-green-200 rounded-full mr-2" />
              Disponible
            </span>
            <span className="flex items-center">
              <span className="inline-block w-3 h-3 bg-yellow-200 rounded-full mr-2" />
              Sin horarios
            </span>
            <span className="flex items-center">
              <span className="inline-block w-3 h-3 bg-gray-300 rounded-full mr-2" />
              Bloqueado
            </span>
            <span className="flex items-center">
              <span className="inline-block w-3 h-3 bg-gray-200 rounded-full mr-2" />
              Fecha pasada
            </span>
          </div>

          {/* Información adicional */}
          {selectedDate && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Fecha seleccionada:</strong> {new Date(selectedDate).toLocaleDateString('es-ES', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          )}
        </>
      )}
    </Card>
  );
};
