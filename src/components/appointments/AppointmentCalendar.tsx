import React, { useState } from 'react';
import { UnifiedCalendar } from '../ui/UnifiedCalendar';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Calendar, Clock, User, MapPin, Info, Plus } from 'lucide-react';
import { addDays, format } from 'date-fns';

export const AppointmentCalendar: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);

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
    setShowAppointmentModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Header - Dashboard Style */}
      <div className="bg-gradient-to-br from-slate-200 via-gray-100 to-blue-200 rounded-2xl shadow-xl relative overflow-hidden mx-4 mt-4 border border-slate-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8 relative z-10">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-2">Calendario de Citas</h1>
            <div className="w-28 h-1 bg-gradient-to-r from-slate-600 to-blue-600 mx-auto rounded-full mb-4"></div>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto font-medium">
              Visualiza y gestiona todas las citas del sistema de manera centralizada
            </p>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 via-violet-400/20 to-transparent rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-violet-400/10 to-transparent rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Información del sistema */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 mb-8 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-50 to-amber-50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-gradient-to-br from-[#8e161a] to-[#b91c1c] rounded-2xl flex items-center justify-center shadow-lg text-white transform rotate-3">
                <Info className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  Sistema de Citas
                </h2>
                <p className="text-gray-600 font-medium mb-2">
                  Gestión centralizada de citas psicológicas
                </p>
                <div className="flex items-center gap-3">
                  <Badge className="bg-green-100 text-green-700 border-green-200 px-3 py-1 rounded-full font-bold text-xs shadow-sm">
                    Estado: Activo
                  </Badge>
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200 px-3 py-1 rounded-full font-bold text-xs shadow-sm">
                    Citas: 2 programadas
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => setShowAppointmentModal(true)}
                className="bg-gradient-to-r from-[#8e161a] to-[#b91c1c] hover:from-[#b91c1c] hover:to-[#8e161a] text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Nueva Cita
              </Button>
            </div>
          </div>
        </div>

        {/* Calendario principal */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden mb-8">
          <UnifiedCalendar
            userType="student"
            onDateSelect={handleDateSelect}
            selectedDate={selectedDate}
            availableDates={availableDates}
            blockedDates={blockedDates}
            appointments={appointments}
            showLegend={true}
            showNavigation={true}
            className="w-full"
          />
        </div>

        {/* Modal para nueva cita */}
        {showAppointmentModal && selectedDate && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 transform transition-all scale-100">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#8e161a]" />
                  Nueva Cita
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAppointmentModal(false)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full w-8 h-8 p-0 flex items-center justify-center transition-colors"
                >
                  ✕
                </Button>
              </div>

              <div className="p-6 space-y-5">
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-center gap-3 shadow-sm">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">Fecha Seleccionada</p>
                    <span className="font-bold text-blue-900 text-lg">
                      {format(selectedDate, 'EEEE, d \'de\' MMMM')}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Horario preferido
                  </label>
                  <select className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] bg-gray-50 transition-all font-medium text-gray-700">
                    <option>9:00 AM</option>
                    <option>10:00 AM</option>
                    <option>11:00 AM</option>
                    <option>2:00 PM</option>
                    <option>3:00 PM</option>
                    <option>4:00 PM</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Psicólogo preferido
                  </label>
                  <select className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] bg-gray-50 transition-all font-medium text-gray-700">
                    <option>Cualquier psicólogo disponible</option>
                    <option>Dr. María González</option>
                    <option>Dr. Carlos Rodríguez</option>
                    <option>Dra. Ana Martínez</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Motivo de la consulta
                  </label>
                  <textarea
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] bg-gray-50 transition-all font-medium text-gray-700 placeholder-gray-400"
                    placeholder="Describe brevemente el motivo de tu consulta..."
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <Button
                    type="button"
                    className="flex-1 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-bold py-3 rounded-xl shadow-sm transition-all"
                    onClick={() => setShowAppointmentModal(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    className="flex-1 bg-gradient-to-r from-[#8e161a] to-[#b91c1c] hover:from-[#b91c1c] hover:to-[#8e161a] text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
                  >
                    Confirmar Cita
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Información adicional */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-green-100 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Horarios de Atención
              </h3>
            </div>
            <div className="space-y-3 text-sm text-gray-600 pl-1">
              <p className="flex justify-between border-b border-gray-100 pb-2">
                <span className="font-medium">Lunes a Viernes:</span>
                <span className="font-bold text-gray-800">9:00 AM - 6:00 PM</span>
              </p>
              <p className="flex justify-between border-b border-gray-100 pb-2">
                <span className="font-medium">Sábados:</span>
                <span className="font-bold text-gray-800">9:00 AM - 1:00 PM</span>
              </p>
              <p className="flex justify-between pt-1">
                <span className="font-medium">Domingos:</span>
                <span className="font-bold text-red-500">No se atiende</span>
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-100 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Ubicación
              </h3>
            </div>
            <div className="space-y-3 text-sm text-gray-600 pl-1">
              <p className="font-bold text-gray-900 text-lg">Centro de Psicología</p>
              <p className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                Edificio A, 2do Piso
              </p>
              <p className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                Instituto Túpac Amaru
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-purple-100 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <User className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Psicólogos Disponibles
              </h3>
            </div>
            <div className="space-y-3 text-sm text-gray-600 pl-1">
              <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="w-8 h-8 bg-purple-50 rounded-full flex items-center justify-center font-bold text-purple-600 text-xs">MG</div>
                <span className="font-medium">Dr. María González</span>
              </div>
              <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="w-8 h-8 bg-indigo-50 rounded-full flex items-center justify-center font-bold text-indigo-600 text-xs">CR</div>
                <span className="font-medium">Dr. Carlos Rodríguez</span>
              </div>
              <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="w-8 h-8 bg-violet-50 rounded-full flex items-center justify-center font-bold text-violet-600 text-xs">AM</div>
                <span className="font-medium">Dra. Ana Martínez</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};








