import React, { useState } from 'react';
import { UnifiedCalendar } from './UnifiedCalendar';
import { Card } from './Card';
import { Button } from './Button';
import { Badge } from './Badge';
import { Calendar, Clock, User, MapPin, Info, Settings, Users, GraduationCap, Shield, Download, RefreshCw, Search, Filter } from 'lucide-react';
import { addDays, format } from 'date-fns';
import './unified-calendar.css';

export const UnifiedCalendarDemo: React.FC = () => {
  const [selectedUserType, setSelectedUserType] = useState<'student' | 'psychologist' | 'tutor' | 'admin'>('student');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState({
    showAvailable: true,
    showBlocked: true,
    showHolidays: true,
    showAppointments: true,
    showWeekends: true,
    showPast: false
  });

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
    alert(`Cita agendada para el ${format(selectedDate!, 'EEEE, d \'de\' MMMM')}`);
    setShowAppointmentForm(false);
    setSelectedDate(null);
  };

  const handleExport = () => {
    alert('Exportando calendario...');
  };

  const handleRefresh = () => {
    alert('Actualizando calendario...');
  };

  const handleFilterChange = (filters: any) => {
    setActiveFilters(filters);
    console.log('Filtros actualizados:', filters);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    console.log('Búsqueda:', query);
  };

  const getUserTypeInfo = () => {
    switch (selectedUserType) {
      case 'psychologist':
        return {
          title: 'Calendario del Psicólogo',
          description: 'Gestiona tu agenda y horarios de atención',
          icon: <User className="w-8 h-8 text-purple-600" />,
          color: 'purple',
          features: ['Gestionar horarios', 'Ver citas programadas', 'Bloquear fechas', 'Estadísticas de atención']
        };
      case 'tutor':
        return {
          title: 'Calendario del Tutor',
          description: 'Supervisa y coordina las actividades estudiantiles',
          icon: <GraduationCap className="w-8 h-8 text-orange-600" />,
          color: 'orange',
          features: ['Supervisar citas', 'Coordinar actividades', 'Ver estadísticas', 'Gestionar horarios']
        };
      case 'admin':
        return {
          title: 'Calendario Administrativo',
          description: 'Administra y supervisa todo el sistema',
          icon: <Shield className="w-8 h-8 text-pink-600" />,
          color: 'pink',
          features: ['Supervisar todo el sistema', 'Gestionar usuarios', 'Ver estadísticas globales', 'Configurar feriados']
        };
      default:
        return {
          title: 'Calendario del Estudiante',
          description: 'Agenda tu cita psicológica de manera fácil y rápida',
          icon: <Calendar className="w-8 h-8 text-[#8e161a]" />,
          color: 'granate',
          features: ['Agendar citas', 'Ver horarios disponibles', 'Gestionar citas existentes', 'Ver feriados']
        };
    }
  };

  const userTypeInfo = getUserTypeInfo();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header de la página */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#8e161a] to-[#b91c1c] rounded-full mb-6">
            <Calendar className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Calendario Unificado Mejorado
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Un calendario avanzado con toolbar completo para todos los tipos de usuarios del Instituto Túpac Amaru
          </p>
        </div>

        {/* Selector de tipo de usuario */}
        <Card className="mb-8">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Selecciona tu tipo de usuario
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button
                onClick={() => setSelectedUserType('student')}
                className={`h-24 flex flex-col items-center justify-center gap-2 ${
                  selectedUserType === 'student' ? 'bg-[#8e161a] hover:bg-[#b91c1c]' : ''
                }`}
              >
                <Calendar className="w-6 h-6" />
                <span>Estudiante</span>
              </Button>

              <Button
                onClick={() => setSelectedUserType('psychologist')}
                className={`h-24 flex flex-col items-center justify-center gap-2 ${
                  selectedUserType === 'psychologist' ? 'bg-purple-600 hover:bg-purple-700' : ''
                }`}
              >
                <User className="w-6 h-6" />
                <span>Psicólogo</span>
              </Button>

              <Button
                onClick={() => setSelectedUserType('tutor')}
                className={`h-24 flex flex-col items-center justify-center gap-2 ${
                  selectedUserType === 'tutor' ? 'bg-orange-600 hover:bg-orange-700' : ''
                }`}
              >
                <GraduationCap className="w-6 h-6" />
                <span>Tutor</span>
              </Button>

              <Button
                onClick={() => setSelectedUserType('admin')}
                className={`h-24 flex flex-col items-center justify-center gap-2 ${
                  selectedUserType === 'admin' ? 'bg-pink-600 hover:bg-pink-700' : ''
                }`}
              >
                <Shield className="w-6 h-6" />
                <span>Administrador</span>
              </Button>
            </div>
          </div>
        </Card>

        {/* Información del usuario seleccionado */}
        <Card className="mb-6">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-100 rounded-xl">
                  {userTypeInfo.icon}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {userTypeInfo.title}
                  </h2>
                  <p className="text-gray-600">
                    {userTypeInfo.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {userTypeInfo.features.map((feature, index) => (
                      <Badge key={index} className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowAppointmentForm(true)}
                  className="flex items-center gap-2"
                >
                  <Clock className="w-4 h-4" />
                  Agendar Cita
                </Button>
                <Button
                  className="flex items-center gap-2 bg-[#8e161a] hover:bg-[#b91c1c]"
                >
                  <Settings className="w-4 h-4" />
                  Configuración
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Calendario unificado con toolbar */}
        <UnifiedCalendar
          userType={selectedUserType}
          onDateSelect={handleDateSelect}
          selectedDate={selectedDate}
          availableDates={availableDates}
          blockedDates={blockedDates}
          holidays={holidays}
          appointments={appointments}
          showStats={true}
          showLegend={true}
          showNavigation={true}
          showToolbar={true}
          onExport={handleExport}
          onRefresh={handleRefresh}
          onFilterChange={handleFilterChange}
          onSearch={handleSearch}
          className={`${selectedUserType}-theme`}
        />

        {/* Información del toolbar */}
        <Card className="mt-6">
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-[#8e161a]" />
              Funcionalidades del Toolbar
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <Search className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="font-medium text-blue-800">Búsqueda Avanzada</div>
                  <div className="text-sm text-blue-600">Busca citas, fechas y eventos</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <Filter className="w-5 h-5 text-green-600" />
                <div>
                  <div className="font-medium text-green-800">Filtros Inteligentes</div>
                  <div className="text-sm text-green-600">Muestra/oculta tipos de días</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <Download className="w-5 h-5 text-purple-600" />
                <div>
                  <div className="font-medium text-purple-800">Exportación</div>
                  <div className="text-sm text-purple-600">Exporta horarios en PDF/Excel</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                <RefreshCw className="w-5 h-5 text-orange-600" />
                <div>
                  <div className="font-medium text-orange-800">Actualización</div>
                  <div className="text-sm text-orange-600">Refresca datos en tiempo real</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                <Calendar className="w-5 h-5 text-red-600" />
                <div>
                  <div className="font-medium text-red-800">Vista Rápida</div>
                  <div className="text-sm text-red-600">Cambia entre mes, cuadrícula y lista</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <Users className="w-5 h-5 text-gray-600" />
                <div>
                  <div className="font-medium text-gray-800">Temas Adaptativos</div>
                  <div className="text-sm text-gray-600">Colores según tipo de usuario</div>
                </div>
              </div>
            </div>
          </div>
        </Card>

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
                        {format(selectedDate, 'EEEE, d \'de\' MMMM')}
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
                      {selectedUserType === 'student' ? 'Psicólogo preferido' : 'Estudiante'}
                    </label>
                    <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a]">
                      <option>Cualquier {selectedUserType === 'student' ? 'psicólogo' : 'estudiante'} disponible</option>
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

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Tipos de Usuario
              </h3>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Estudiantes:</strong> Agendar citas</p>
              <p><strong>Psicólogos:</strong> Gestionar agenda</p>
              <p><strong>Tutores:</strong> Supervisar actividades</p>
              <p><strong>Administradores:</strong> Control total</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
