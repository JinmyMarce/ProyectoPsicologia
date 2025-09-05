import React, { useState } from 'react';
import { StudentCalendar } from './StudentCalendar';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Calendar, Clock, User, MapPin, Info } from 'lucide-react';
import { addDays, format } from 'date-fns';
import { es } from 'date-fns/locale';

export const StudentCalendarDemo: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);

  // Datos de ejemplo para la demostración
  const availableDates = [
    addDays(new Date(), 1),
    addDays(new Date(), 3),
    addDays(new Date(), 5),
    addDays(new Date(), 8),
    addDays(new Date(), 10),
    addDays(new Date(), 12),
    addDays(new Date(), 15),
    addDays(new Date(), 17),
    addDays(new Date(), 20),
    addDays(new Date(), 22),
    addDays(new Date(), 25),
    addDays(new Date(), 27),
    addDays(new Date(), 30),
  ];

  const blockedDates = [
    addDays(new Date(), 2),
    addDays(new Date(), 4),
    addDays(new Date(), 7),
    addDays(new Date(), 9),
    addDays(new Date(), 11),
    addDays(new Date(), 14),
    addDays(new Date(), 16),
    addDays(new Date(), 19),
    addDays(new Date(), 21),
    addDays(new Date(), 24),
    addDays(new Date(), 26),
    addDays(new Date(), 29),
  ];

  const holidays = [
    {
      id: 1,
      name: 'Año Nuevo',
      date: '2025-01-01',
      description: 'Feriado nacional'
    },
    {
      id: 2,
      name: 'Día de la Independencia',
      date: '2025-07-28',
      description: 'Feriado nacional'
    },
    {
      id: 3,
      name: 'Navidad',
      date: '2025-12-25',
      description: 'Feriado nacional'
    }
  ];

  const appointments = [
    {
      id: 1,
      date: '2025-01-15',
      time: '10:00 AM',
      psychologist_name: 'Dr. María González',
      status: 'confirmada'
    },
    {
      id: 2,
      date: '2025-01-22',
      time: '2:00 PM',
      psychologist_name: 'Dr. Carlos Rodríguez',
      status: 'pendiente'
    }
  ];

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setShowAppointmentForm(true);
  };

  const handleAppointmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí iría la lógica para enviar la cita
    alert(`Cita agendada para el ${format(selectedDate!, 'EEEE, d \'de\' MMMM', { locale: es })}`);
    setShowAppointmentForm(false);
    setSelectedDate(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header de la página */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#8e161a] to-[#b91c1c] rounded-full mb-4">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Calendario del Estudiante
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Sistema de agendamiento de citas psicológicas diseñado específicamente para estudiantes
          </p>
        </div>

        {/* Información del estudiante */}
        <Card className="mb-6">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Juan Carlos Pérez
                  </h2>
                  <p className="text-gray-600">
                    Estudiante de Psicología - 5to Semestre
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Estado: Activo
                    </Badge>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      Citas: 2 programadas
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={() => setShowAppointmentForm(true)}
                >
                  <Clock className="w-4 h-4" />
                  Agendar Cita
                </Button>
                <Button 
                  className="flex items-center gap-2 bg-[#8e161a] hover:bg-[#b91c1c]"
                >
                  <Info className="w-4 h-4" />
                  Ver Historial
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Calendario principal */}
        <StudentCalendar
          onDateSelect={handleDateSelect}
          selectedDate={selectedDate}
          availableDates={availableDates}
          blockedDates={blockedDates}
          holidays={holidays}
          appointments={appointments}
        />

        {/* Formulario de cita */}
        {showAppointmentForm && selectedDate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    Agendar Cita
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAppointmentForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </Button>
                </div>
                
                <form onSubmit={handleAppointmentSubmit} className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 text-blue-800">
                      <Calendar className="w-4 h-4" />
                      <span className="font-semibold">
                        {format(selectedDate, 'EEEE, d \'de\' MMMM', { locale: es })}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Horario preferido
                    </label>
                    <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a]">
                      <option>9:00 AM</option>
                      <option>10:00 AM</option>
                      <option>11:00 AM</option>
                      <option>2:00 PM</option>
                      <option>3:00 PM</option>
                      <option>4:00 PM</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Psicólogo preferido
                    </label>
                    <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a]">
                      <option>Cualquier psicólogo disponible</option>
                      <option>Dr. María González</option>
                      <option>Dr. Carlos Rodríguez</option>
                      <option>Dra. Ana Martínez</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Motivo de la consulta
                    </label>
                    <textarea 
                      rows={3}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a]"
                      placeholder="Describe brevemente el motivo de tu consulta..."
                    />
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowAppointmentForm(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-[#8e161a] hover:bg-[#b91c1c]"
                    >
                      Confirmar Cita
                    </Button>
                  </div>
                </form>
              </div>
            </Card>
          </div>
        )}

        {/* Información adicional */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Horarios de Atención
              </h3>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Lunes a Viernes:</strong> 9:00 AM - 6:00 PM</p>
              <p><strong>Sábados:</strong> 9:00 AM - 1:00 PM</p>
              <p><strong>Domingos:</strong> No se atiende</p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Ubicación
              </h3>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Centro de Psicología</strong></p>
              <p>Edificio A, 2do Piso</p>
              <p>Instituto Túpac Amaru</p>
            </div>
          </Card>


        </div>
      </div>
    </div>
  );
};


