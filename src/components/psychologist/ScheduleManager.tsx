import React, { useState, useEffect } from 'react';
import { TimeSlot } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { 
  Calendar, 
  Clock, 
  Plus, 
  X, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Save,
  Trash2,
  Edit
} from 'lucide-react';

interface ScheduleSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  isBlocked: boolean;
}

export function ScheduleManager() {
  const [schedule, setSchedule] = useState<ScheduleSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [editingSlot, setEditingSlot] = useState<ScheduleSlot | null>(null);

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simular carga de horarios (en un caso real, harías una llamada a la API)
      const mockSchedule: ScheduleSlot[] = [
        {
          id: '1',
          date: '2024-01-20',
          startTime: '09:00',
          endTime: '10:00',
          isAvailable: true,
          isBlocked: false
        },
        {
          id: '2',
          date: '2024-01-20',
          startTime: '10:00',
          endTime: '11:00',
          isAvailable: true,
          isBlocked: false
        },
        {
          id: '3',
          date: '2024-01-20',
          startTime: '14:00',
          endTime: '15:00',
          isAvailable: false,
          isBlocked: true
        },
        {
          id: '4',
          date: '2024-01-21',
          startTime: '09:00',
          endTime: '10:00',
          isAvailable: true,
          isBlocked: false
        },
        {
          id: '5',
          date: '2024-01-21',
          startTime: '11:00',
          endTime: '12:00',
          isAvailable: true,
          isBlocked: false
        }
      ];
      
      setSchedule(mockSchedule);
    } catch (error: any) {
      setError('Error al cargar el horario');
      console.error('Error loading schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlot = () => {
    if (!selectedDate || !startTime || !endTime) {
      setError('Por favor completa todos los campos');
      return;
    }

    if (startTime >= endTime) {
      setError('La hora de inicio debe ser anterior a la hora de fin');
      return;
    }

    const newSlot: ScheduleSlot = {
      id: Date.now().toString(),
      date: selectedDate,
      startTime,
      endTime,
      isAvailable,
      isBlocked: false
    };

    setSchedule(prev => [...prev, newSlot]);
    
    // Limpiar formulario
    setSelectedDate('');
    setStartTime('');
    setEndTime('');
    setIsAvailable(true);
    setError(null);
  };

  const handleEditSlot = (slot: ScheduleSlot) => {
    setEditingSlot(slot);
    setSelectedDate(slot.date);
    setStartTime(slot.startTime);
    setEndTime(slot.endTime);
    setIsAvailable(slot.isAvailable);
  };

  const handleUpdateSlot = () => {
    if (!editingSlot || !selectedDate || !startTime || !endTime) {
      setError('Por favor completa todos los campos');
      return;
    }

    if (startTime >= endTime) {
      setError('La hora de inicio debe ser anterior a la hora de fin');
      return;
    }

    setSchedule(prev => 
      prev.map(slot => 
        slot.id === editingSlot.id 
          ? {
              ...slot,
              date: selectedDate,
              startTime,
              endTime,
              isAvailable
            }
          : slot
      )
    );

    // Limpiar formulario
    setEditingSlot(null);
    setSelectedDate('');
    setStartTime('');
    setEndTime('');
    setIsAvailable(true);
    setError(null);
  };

  const handleDeleteSlot = (slotId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este horario?')) {
      setSchedule(prev => prev.filter(slot => slot.id !== slotId));
    }
  };

  const handleToggleAvailability = (slotId: string) => {
    setSchedule(prev => 
      prev.map(slot => 
        slot.id === slotId 
          ? { ...slot, isAvailable: !slot.isAvailable }
          : slot
      )
    );
  };

  const handleSaveSchedule = async () => {
    try {
      setSaving(true);
      setError(null);
      
      // Simular guardado (en un caso real, harías una llamada a la API)
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

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
  ];

  const groupedSchedule = schedule.reduce((groups, slot) => {
    const date = slot.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(slot);
    return groups;
  }, {} as Record<string, ScheduleSlot[]>);

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
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Horarios</h1>
        <p className="text-gray-600">Configura tu disponibilidad para las citas</p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" />
          {success}
        </div>
      )}

      {/* Formulario para agregar/editar horarios */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {editingSlot ? 'Editar Horario' : 'Agregar Nuevo Horario'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Fecha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={getMinDate()}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Hora de inicio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hora de inicio
            </label>
            <select
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar</option>
              {timeSlots.map(time => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>

          {/* Hora de fin */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hora de fin
            </label>
            <select
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar</option>
              {timeSlots.map(time => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>

          {/* Disponibilidad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              value={isAvailable ? 'available' : 'unavailable'}
              onChange={(e) => setIsAvailable(e.target.value === 'available')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="available">Disponible</option>
              <option value="unavailable">No disponible</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          {editingSlot ? (
            <>
              <Button
                onClick={handleUpdateSlot}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Actualizar
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setEditingSlot(null);
                  setSelectedDate('');
                  setStartTime('');
                  setEndTime('');
                  setIsAvailable(true);
                }}
              >
                Cancelar
              </Button>
            </>
          ) : (
            <Button
              onClick={handleAddSlot}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar Horario
            </Button>
          )}
        </div>
      </Card>

      {/* Horarios existentes */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Horarios Configurados</h2>
          <Button
            onClick={handleSaveSchedule}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700"
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

        {Object.keys(groupedSchedule).length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No hay horarios configurados</p>
            <p className="text-sm text-gray-400">Agrega tu primer horario usando el formulario de arriba</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedSchedule).map(([date, slots]) => (
              <div key={date} className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  {formatDate(date)}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {slots.map((slot) => (
                    <div
                      key={slot.id}
                      className={`p-3 border rounded-lg flex items-center justify-between ${
                        slot.isAvailable 
                          ? 'border-green-200 bg-green-50' 
                          : 'border-red-200 bg-red-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">
                          {slot.startTime} - {slot.endTime}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant={slot.isAvailable ? "success" : "danger"}>
                          {slot.isAvailable ? "Disponible" : "No disponible"}
                        </Badge>
                        
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditSlot(slot)}
                            className="p-1"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleAvailability(slot.id)}
                            className="p-1"
                          >
                            {slot.isAvailable ? <X className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteSlot(slot.id)}
                            className="p-1 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Información adicional */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Información Importante</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Configuración de Horarios</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Los horarios se configuran por día y hora específica</li>
              <li>• Puedes marcar horarios como disponibles o no disponibles</li>
              <li>• Los estudiantes solo podrán agendar en horarios marcados como disponibles</li>
              <li>• Recuerda guardar los cambios después de hacer modificaciones</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Recomendaciones</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Configura horarios con al menos 24 horas de anticipación</li>
              <li>• Mantén horarios consistentes para mejor organización</li>
              <li>• Revisa regularmente tu disponibilidad</li>
              <li>• Comunica cambios importantes a los estudiantes</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}