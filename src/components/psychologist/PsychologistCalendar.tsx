import React, { useState, useEffect } from 'react';
import { UnifiedCalendar } from '../ui/UnifiedCalendar';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Calendar, Clock, User, Settings, Plus, X } from 'lucide-react';
import { addDays, format } from 'date-fns';

export const PsychologistCalendar: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showBlockDateModal, setShowBlockDateModal] = useState(false);
  const [blockDate, setBlockDate] = useState('');
  const [blockReason, setBlockReason] = useState('');

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
    // Aquí se podría abrir un modal para gestionar la fecha
  };

  const handleBlockDate = () => {
    if (blockDate && blockReason) {
      // Aquí se implementaría la lógica para bloquear la fecha
      console.log('Bloqueando fecha:', blockDate, 'Razón:', blockReason);
      setShowBlockDateModal(false);
      setBlockDate('');
      setBlockReason('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header de la página */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full mb-4">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Calendario del Psicólogo
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Gestiona tu agenda y horarios de atención
          </p>
        </div>

        {/* Información del psicólogo */}
        <Card className="mb-6">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Dr. María González
                  </h2>
                  <p className="text-gray-600">
                    Psicóloga Clínica - Especialista en Terapia Cognitivo-Conductual
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <Badge className="bg-green-50 text-green-700 border-green-200">
                      Estado: Activo
                    </Badge>
                    <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                      Citas: 2 programadas
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => setShowBlockDateModal(true)}
                  className="flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Bloquear Fecha
                </Button>
                <Button
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
                >
                  <Settings className="w-4 h-4" />
                  Configuración
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Calendario principal - ELIMINADO: Solo se usa calendario simple en agendar cita directamente */}
        <div className="bg-white rounded-xl shadow-md border border-cyan-200 p-6 text-center">
          <p className="text-gray-600">El calendario completo ha sido removido. Usa "Agendar Cita Directamente" para programar citas.</p>
        </div>

        {/* Modal para bloquear fecha */}
        {showBlockDateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    Bloquear Fecha
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowBlockDateModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha a bloquear
                    </label>
                    <input
                      type="date"
                      value={blockDate}
                      onChange={(e) => setBlockDate(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Razón del bloqueo
                    </label>
                    <textarea
                      rows={3}
                      value={blockReason}
                      onChange={(e) => setBlockReason(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Describe la razón del bloqueo..."
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      className="flex-1"
                      onClick={() => setShowBlockDateModal(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="button"
                      onClick={handleBlockDate}
                      className="flex-1 bg-purple-600 hover:bg-purple-700"
                    >
                      Bloquear Fecha
                    </Button>
                  </div>
                </div>
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
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Gestión de Pacientes
              </h3>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• Ver agenda personal</p>
              <p>• Bloquear fechas no disponibles</p>
              <p>• Gestionar citas existentes</p>
              <p>• Configurar horarios</p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Settings className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Configuración
              </h3>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• Personalizar horarios</p>
              <p>• Establecer límites de citas</p>
              <p>• Configurar notificaciones</p>
              <p>• Gestionar preferencias</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
