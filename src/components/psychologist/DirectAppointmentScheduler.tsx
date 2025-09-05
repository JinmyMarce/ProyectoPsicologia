import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { 
  Calendar, 
  Clock, 
  User, 
  Search, 
  Plus, 
  X, 
  CheckCircle,
  AlertCircle,
  Loader2,
  Save,
  Settings
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { PageHeader } from '../ui/PageHeader';
import { useNavigate } from 'react-router-dom';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, parse, startOfWeek, getDay, addDays, isAfter, isBefore, startOfDay } from 'date-fns';
import esES from 'date-fns/locale/es';

interface Student {
  id: number;
  name: string;
  email: string;
  dni: string;
  career: string;
  semester: string;
  phone: string;
}

interface AppointmentSlot {
  date: string;
  time: string;
  available: boolean;
}

export function DirectAppointmentScheduler() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'dni' | 'email'>('dni');
  const [searching, setSearching] = useState(false);
  const [student, setStudent] = useState<Student | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState<AppointmentSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
  ];

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setError('Por favor ingresa un DNI o correo electrónico');
      return;
    }

    setSearching(true);
    setError('');
    setStudent(null);

    try {
      // Simular búsqueda de estudiante (en un caso real, harías una llamada a la API)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data - en un caso real esto vendría de la API
      const mockStudent: Student = {
        id: 1,
        name: 'María González López',
        email: searchType === 'email' ? searchTerm : 'maria.gonzalez@issta.edu.pe',
        dni: searchType === 'dni' ? searchTerm : '12345678',
        career: 'Psicología',
        semester: '5',
        phone: '999888777'
      };

      setStudent(mockStudent);
      setSuccess('Estudiante encontrado');
    } catch (error: any) {
      setError('Estudiante no encontrado. Verifica el DNI o correo electrónico.');
    } finally {
      setSearching(false);
    }
  };

  const loadAvailableSlots = async () => {
    if (!selectedDate) return;

    setLoadingSlots(true);
    setError('');

    try {
      // Simular carga de horarios disponibles
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const slots: AppointmentSlot[] = timeSlots.map(time => ({
        date: selectedDate,
        time,
        available: Math.random() > 0.3 // 70% de probabilidad de estar disponible
      }));

      setAvailableSlots(slots);
    } catch (error: any) {
      setError('Error al cargar los horarios disponibles');
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    if (selectedDate) {
      loadAvailableSlots();
    }
  }, [selectedDate]);

  const handleScheduleAppointment = async () => {
    if (!student || !selectedDate || !selectedTime) {
      setError('Por favor completa todos los campos');
      return;
    }

    setSaving(true);
    setError('');

    try {
      // Simular agendamiento de cita
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('Cita agendada exitosamente');
      
      // Limpiar formulario
      setStudent(null);
      setSelectedDate('');
      setSelectedTime('');
      setSearchTerm('');
      setAvailableSlots([]);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError('Error al agendar la cita. Intenta de nuevo.');
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

  const locales = { 'es': esES };
  const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
    getDay,
    locales,
  });

  return (
    <div className="space-y-6">
      {/* Título Principal */}
      <div className="text-center mb-6">
        <div className="inline-block px-20 py-4 bg-white border border-gray-200 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight mb-2">
            Agendar Cita Directamente
          </h1>
          <div className="w-28 h-1 bg-gradient-to-r from-gray-800 to-gray-600 mx-auto rounded-full"></div>
        </div>
      </div>

      {/* Botón de gestión de horarios */}
      <div className="flex justify-end mb-4">
        <Button
          onClick={() => navigate('/schedule')}
          className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-300"
        >
          <Settings className="w-5 h-5 mr-2" />
          Gestión de Horarios
        </Button>
      </div>

      {/* Mensajes de estado */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 flex items-center space-x-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
          <p className="text-red-800 font-bold text-lg">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 flex items-center space-x-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
          <p className="text-green-800 font-bold text-lg">{success}</p>
        </div>
      )}

      {/* Búsqueda de estudiante */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <Search className="w-6 h-6 mr-3 text-[#8e161a]" />
          Buscar Estudiante
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de búsqueda
            </label>
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value as 'dni' | 'email')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8e161a] focus:border-transparent"
            >
              <option value="dni">DNI</option>
              <option value="email">Correo Electrónico</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {searchType === 'dni' ? 'DNI del estudiante' : 'Correo electrónico'}
            </label>
            <div className="flex space-x-2">
              <Input
                type={searchType === 'dni' ? 'text' : 'email'}
                placeholder={searchType === 'dni' ? '12345678' : 'estudiante@issta.edu.pe'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={handleSearch}
                disabled={searching || !searchTerm.trim()}
                className="px-6"
              >
                {searching ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Search className="w-4 h-4 mr-2" />
                )}
                Buscar
              </Button>
            </div>
          </div>
        </div>

        {/* Información del estudiante encontrado */}
        {student && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-green-900">{student.name}</h3>
                <p className="text-sm text-green-700">
                  {student.career} - {student.semester}° Semestre
                </p>
                <p className="text-sm text-green-700">
                  DNI: {student.dni} | Tel: {student.phone}
                </p>
                <p className="text-sm text-green-700">{student.email}</p>
              </div>
              <Badge variant="success">Estudiante Encontrado</Badge>
            </div>
          </div>
        )}
      </Card>

      {/* Selección de fecha y hora */}
      {student && (
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Calendar className="w-6 h-6 mr-3 text-[#8e161a]" />
            Seleccionar Fecha y Hora
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de la cita
              </label>
              <div className="bg-white rounded-3xl shadow-2xl p-6 border-2 border-gray-100">
                <div className="mb-4 text-center">
                  <h3 className="text-xl font-bold text-[#1e293b] mb-2">📅 Calendario Profesional</h3>
                  <p className="text-[#475569]">Selecciona la fecha para la cita</p>
                </div>
                <BigCalendar
                  localizer={localizer}
                  events={[]}
                  startAccessor="start"
                  endAccessor="end"
                  selectable
                  style={{ 
                    height: 450, 
                    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', 
                    borderRadius: 24, 
                    boxShadow: 'inset 0 2px 20px rgba(0,0,0,0.05)', 
                    border: '2px solid #e2e8f0', 
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                  views={['month']}
                  onSelectSlot={(slotInfo) => setSelectedDate(slotInfo.start.toISOString().split('T')[0])}
                  dayPropGetter={(date) => {
                    const today = new Date();
                    const peruTime = new Date(today.toLocaleString("en-US", {timeZone: "America/Lima"}));
                    const todayStart = startOfDay(peruTime);
                    const futureLimit = addDays(todayStart, 14);
                    const day = date.getDay();
                    
                    if (day === 0 || day === 6) {
                      return { 
                        style: { 
                          backgroundColor: 'linear-gradient(135deg, #fed7aa 0%, #fb923c 100%)', 
                          color: '#ea580c', 
                          pointerEvents: 'none', 
                          cursor: 'not-allowed', 
                          fontWeight: 700, 
                          borderRadius: 16, 
                          boxShadow: '0 6px 20px rgba(253, 186, 116, 0.25)', 
                          border: '2px solid #fed7aa',
                          transform: 'scale(0.95)',
                          opacity: 0.7
                        } 
                      };
                    }
                    if (isBefore(date, todayStart)) {
                      return { 
                        style: { 
                          background: 'linear-gradient(135deg, #e4e7eb 0%, #d1d5db 100%)', 
                          color: '#6b7280', 
                          fontWeight: 700, 
                          borderRadius: 16, 
                          boxShadow: '0 6px 20px rgba(156, 163, 175, 0.2)', 
                          border: '2px solid #e5e7eb', 
                          cursor: 'not-allowed',
                          opacity: 0.6,
                          transform: 'scale(0.95)'
                        } 
                      };
                    }
                    if (isAfter(date, futureLimit)) {
                      return { 
                        style: { 
                          background: 'linear-gradient(135deg, #fef3c7 0%, #fde047 100%)', 
                          color: '#b45309', 
                          fontWeight: 700, 
                          opacity: 0.8, 
                          borderRadius: 16, 
                          boxShadow: '0 6px 20px rgba(253, 224, 71, 0.25)', 
                          border: '2px solid #fef3c7',
                          transform: 'scale(0.98)'
                        } 
                      };
                    }
                    return { 
                      style: { 
                        background: selectedDate === date.toISOString().split('T')[0] 
                          ? 'linear-gradient(135deg, #8e161a 0%, #b91c1c 100%)' 
                          : 'linear-gradient(135deg, #d1fae5 0%, #86efac 100%)', 
                        color: selectedDate === date.toISOString().split('T')[0] ? '#ffffff' : '#047857', 
                        fontWeight: 700, 
                        borderRadius: 16, 
                        boxShadow: selectedDate === date.toISOString().split('T')[0] 
                          ? '0 8px 25px rgba(142, 22, 26, 0.4)' 
                          : '0 6px 20px rgba(16, 185, 129, 0.25)', 
                        border: selectedDate === date.toISOString().split('T')[0] 
                          ? '2px solid #8e161a' 
                          : '2px solid #86efac', 
                        cursor: 'pointer',
                        transform: selectedDate === date.toISOString().split('T')[0] ? 'scale(1.05)' : 'scale(1)',
                        transition: 'all 0.3s ease'
                      } 
                    };
                  }}
                  components={{ 
                    event: () => null,
                    toolbar: (props) => (
                      <div className="flex items-center justify-between mb-6 p-4 bg-gradient-to-r from-[#8e161a] to-[#b91c1c] rounded-2xl text-white">
                        <button 
                          onClick={() => props.onNavigate('PREV')}
                          className="bg-white/20 hover:bg-white/30 p-3 rounded-xl transition-all duration-300 font-bold"
                        >
                          ← Anterior
                        </button>
                        <div className="text-center">
                          <h3 className="text-2xl font-bold">{props.label}</h3>
                        </div>
                        <button 
                          onClick={() => props.onNavigate('NEXT')}
                          className="bg-white/20 hover:bg-white/30 p-3 rounded-xl transition-all duration-300 font-bold"
                        >
                          Siguiente →
                        </button>
                      </div>
                    )
                  }}
                />
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-2xl p-6 border-2 border-gray-100">
              <div className="mb-4 text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">🕐 Horarios Disponibles</h3>
                <p className="text-gray-600">Selecciona la hora de atención</p>
              </div>
              
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                disabled={!selectedDate || loadingSlots}
                className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#8e161a]/20 focus:border-[#8e161a] disabled:bg-gray-50 transition-all duration-300 text-lg font-semibold bg-gradient-to-br from-white to-gray-50"
              >
                <option value="">🔘 Seleccionar hora profesional</option>
                {availableSlots
                  .filter(slot => slot.available)
                  .map(slot => (
                    <option key={slot.time} value={slot.time}>
                      ⏰ {slot.time}
                    </option>
                  ))}
              </select>
              
              {loadingSlots && (
                <div className="mt-4 p-4 bg-blue-50 rounded-2xl border border-blue-200">
                  <p className="text-blue-800 font-semibold flex items-center justify-center">
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    🔄 Cargando horarios disponibles del profesional...
                  </p>
                </div>
              )}
              
              {selectedDate && !loadingSlots && availableSlots.length > 0 && (
                <div className="mt-4 p-4 bg-green-50 rounded-2xl border border-green-200">
                  <p className="text-green-800 font-semibold text-center">
                    ✅ {availableSlots.filter(slot => slot.available).length} horarios disponibles encontrados
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Horarios disponibles con diseño profesional */}
          {selectedDate && availableSlots.length > 0 && (
            <div className="mt-8">
              <div className="bg-white rounded-3xl shadow-2xl p-8 border-2 border-gray-100">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">⏰ Horarios Profesionales Disponibles</h3>
                  <p className="text-gray-600">Haz clic en el horario que prefieras para la cita</p>
                  <div className="mt-3 inline-block px-6 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full">
                    <span className="text-blue-800 font-bold">📅 {formatDate(selectedDate)}</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                  {availableSlots.map(slot => (
                    <button
                      key={slot.time}
                      onClick={() => setSelectedTime(slot.time)}
                      disabled={!slot.available}
                      className={`p-4 text-sm font-bold rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                        selectedTime === slot.time
                          ? 'bg-gradient-to-r from-[#8e161a] to-[#b91c1c] text-white border-[#8e161a] shadow-xl scale-110'
                          : slot.available
                          ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 border-green-200 hover:bg-gradient-to-r hover:from-green-100 hover:to-emerald-100 shadow-lg'
                          : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-400 border-gray-300 cursor-not-allowed opacity-50'
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <Clock className="w-4 h-4 mb-1" />
                        <span>{slot.time}</span>
                        {selectedTime === slot.time && (
                          <div className="text-xs mt-1">✅ Seleccionado</div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                
                {selectedTime && (
                  <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200">
                    <div className="text-center">
                      <h4 className="text-lg font-bold text-green-900 mb-2">🎯 Horario Seleccionado</h4>
                      <p className="text-green-800">
                        <strong>{formatDate(selectedDate)}</strong> a las <strong>{selectedTime}</strong>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Botón para agendar */}
          {selectedDate && selectedTime && (
            <div className="mt-6">
              <Button
                onClick={handleScheduleAppointment}
                disabled={saving}
                className="w-full md:w-auto"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Agendar Cita
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Información adicional */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Información Importante</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Búsqueda de Estudiantes</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Puedes buscar por DNI o correo electrónico</li>
              <li>• Solo aparecen estudiantes registrados en el sistema</li>
              <li>• Verifica que los datos sean correctos antes de agendar</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Agendamiento Directo</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Las citas se agendan automáticamente como confirmadas</li>
              <li>• El estudiante recibirá una notificación</li>
              <li>• Puedes reprogramar si es necesario</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
} 