import { useState, useEffect } from 'react';
import { Input } from '../ui/Input';
import { 
  Calendar, 
  Search, 
  Plus, 
  CheckCircle,
  AlertCircle,
  Loader2,
  Settings
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, parse, startOfWeek, getDay, addDays, isAfter, isBefore, startOfDay } from 'date-fns';
import esES from 'date-fns/locale/es';

// Nuevo diseño simplificado - Versión mejorada

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
  // const { user } = useAuth();
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

  // const getMinDate = () => {
  //   const today = new Date();
  //   return today.toISOString().split('T')[0];
  // };

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
    <div className="min-h-screen bg-gray-50">
      {/* Header moderno */}
      <div className="bg-gradient-to-br from-cyan-50 via-sky-50 to-cyan-50 rounded-2xl shadow-2xl relative overflow-hidden mx-2 sm:mx-3 mt-3 mb-6 border border-cyan-200/40">
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-100/50 via-transparent to-sky-100/30 animate-pulse"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-cyan-100/50 via-sky-100/30 to-transparent rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        
        <div className="w-full px-4 sm:px-6 lg:px-8 pt-6 pb-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="px-3 py-1 rounded-full bg-white/70 text-cyan-700 text-[10px] font-bold flex items-center tracking-wide uppercase shadow-lg border border-cyan-300/50">
                  <Plus className="w-3 h-3 mr-1.5" />
                  Agendar Directamente
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-cyan-900 mb-1.5 leading-tight">
                Programar Cita Directa
              </h1>
              <p className="text-cyan-800 text-sm max-w-2xl font-medium leading-relaxed">
                Busca un estudiante por DNI o correo y agenda una cita de forma inmediata.
              </p>
            </div>
            <button
              onClick={() => navigate('/schedule')}
              className="bg-white/80 backdrop-blur-xl rounded-xl px-4 py-2 border border-cyan-300/40 text-cyan-800 hover:bg-white/90 shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-2 font-semibold text-sm"
            >
              <Settings className="w-4 h-4" />
              Gestionar Horarios
            </button>
          </div>
        </div>
      </div>

      <div className="px-2 sm:px-3 space-y-4">

        {/* Mensajes de estado */}
        {error && (
          <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-red-800 font-bold text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-green-800 font-bold text-sm">{success}</p>
          </div>
        )}

        {/* Búsqueda de estudiante */}
        <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
          <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center mr-3 shadow-lg">
              <Search className="w-5 h-5 text-white" />
            </div>
            Buscar Estudiante
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Tipo de búsqueda
              </label>
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value as 'dni' | 'email')}
                className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
              >
                <option value="dni">DNI</option>
                <option value="email">Correo Electrónico</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2">
                {searchType === 'dni' ? 'DNI del estudiante' : 'Correo electrónico'}
              </label>
              <div className="flex gap-2">
                <Input
                  type={searchType === 'dni' ? 'text' : 'email'}
                  placeholder={searchType === 'dni' ? '12345678' : 'estudiante@issta.edu.pe'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
                <button
                  onClick={handleSearch}
                  disabled={searching || !searchTerm.trim()}
                  className="px-6 py-2.5 bg-gradient-to-br from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {searching ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  Buscar
                </button>
              </div>
            </div>
          </div>

          {/* Información del estudiante encontrado */}
          {student && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-green-900">{student.name}</h3>
                  <p className="text-sm text-green-700 font-semibold">
                    {student.career} - {student.semester}° Semestre
                  </p>
                  <p className="text-sm text-green-700">
                    DNI: {student.dni} | Tel: {student.phone}
                  </p>
                  <p className="text-sm text-green-700">{student.email}</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-green-200 text-green-800 text-xs font-bold">
                  ✓ Encontrado
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Selección de fecha y hora */}
        {student && (
          <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
            <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center mr-3 shadow-lg">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              Seleccionar Fecha y Hora
            </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">
                Fecha de la cita
              </label>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div className="mb-3">
                  <h3 className="text-base font-bold text-slate-800">Selecciona una fecha</h3>
                  <p className="text-xs text-slate-600">Haz clic en el día disponible</p>
                </div>
                <BigCalendar
                  localizer={localizer}
                  events={[]}
                  startAccessor="start"
                  endAccessor="end"
                  selectable
                  style={{ 
                    height: 400, 
                    background: '#ffffff', 
                    borderRadius: '0.75rem',
                    border: '1px solid #e2e8f0', 
                    fontFamily: 'system-ui, sans-serif',
                    fontSize: '13px'
                  }}
                  views={['month']}
                  onSelectSlot={(slotInfo) => setSelectedDate(slotInfo.start.toISOString().split('T')[0])}
                  dayPropGetter={(date) => {
                    const today = new Date();
                    const peruTime = new Date(today.toLocaleString("en-US", {timeZone: "America/Lima"}));
                    const todayStart = startOfDay(peruTime);
                    const futureLimit = addDays(todayStart, 30);
                    const day = date.getDay();
                    const isSelected = selectedDate === date.toISOString().split('T')[0];
                    
                    // Fines de semana
                    if (day === 0 || day === 6) {
                      return { 
                        style: { 
                          backgroundColor: '#f1f5f9', 
                          color: '#94a3b8', 
                          pointerEvents: 'none', 
                          cursor: 'not-allowed'
                        } 
                      };
                    }
                    // Días pasados
                    if (isBefore(date, todayStart)) {
                      return { 
                        style: { 
                          backgroundColor: '#f8fafc', 
                          color: '#cbd5e1', 
                          cursor: 'not-allowed'
                        } 
                      };
                    }
                    // Días muy lejanos
                    if (isAfter(date, futureLimit)) {
                      return { 
                        style: { 
                          backgroundColor: '#fef3c7', 
                          color: '#b45309',
                          opacity: 0.7
                        } 
                      };
                    }
                    // Día seleccionado o disponible
                    return { 
                      style: { 
                        backgroundColor: isSelected ? '#0891b2' : '#e0f2fe', 
                        color: isSelected ? '#ffffff' : '#0c4a6e', 
                        fontWeight: isSelected ? '700' : '500',
                        border: isSelected ? '2px solid #0891b2' : 'none',
                        cursor: 'pointer',
                        borderRadius: '0.375rem'
                      } 
                    };
                  }}
                  components={{ 
                    event: () => null,
                    toolbar: (props) => (
                      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
                        <button 
                          onClick={() => props.onNavigate('PREV')}
                          className="px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-all"
                        >
                          ← Anterior
                        </button>
                        <div className="text-sm font-bold text-slate-800">
                          {props.label}
                        </div>
                        <button 
                          onClick={() => props.onNavigate('NEXT')}
                          className="px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-all"
                        >
                          Siguiente →
                        </button>
                      </div>
                    )
                  }}
                />
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div className="mb-3">
                <h3 className="text-base font-bold text-slate-800">Hora de la cita</h3>
                <p className="text-xs text-slate-600">Selecciona un horario disponible</p>
              </div>
              
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                disabled={!selectedDate || loadingSlots}
                className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 disabled:bg-slate-100 disabled:cursor-not-allowed transition-all text-sm font-semibold"
              >
                <option value="">Seleccionar hora</option>
                {availableSlots
                  .filter(slot => slot.available)
                  .map(slot => (
                    <option key={slot.time} value={slot.time}>
                      {slot.time}
                    </option>
                  ))}
              </select>
              
              {loadingSlots && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-blue-800 text-xs font-semibold flex items-center justify-center">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Cargando horarios...
                  </p>
                </div>
              )}
              
              {selectedDate && !loadingSlots && availableSlots.length > 0 && (
                <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-green-800 text-xs font-semibold text-center">
                    {availableSlots.filter(slot => slot.available).length} horarios disponibles
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Horarios disponibles */}
          {selectedDate && availableSlots.length > 0 && (
            <div className="mt-4">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div className="mb-3">
                  <h3 className="text-sm font-bold text-slate-800">Horarios Disponibles</h3>
                  <p className="text-xs text-slate-600">{formatDate(selectedDate)}</p>
                </div>
                <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                  {availableSlots.map(slot => (
                    <button
                      key={slot.time}
                      onClick={() => setSelectedTime(slot.time)}
                      disabled={!slot.available}
                      className={`p-2 text-xs font-semibold rounded-lg border transition-all ${
                        selectedTime === slot.time
                          ? 'bg-cyan-500 text-white border-cyan-600'
                          : slot.available
                          ? 'bg-white text-slate-700 border-slate-200 hover:border-cyan-400 hover:bg-slate-50'
                          : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                      }`}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
                
                {selectedTime && (
                  <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-green-800 text-xs font-semibold text-center">
                      Seleccionado: <strong>{selectedTime}</strong>
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Botón para agendar */}
          {selectedDate && selectedTime && (
            <div className="mt-6">
              <button
                onClick={handleScheduleAppointment}
                disabled={saving}
                className="w-full md:w-auto px-6 py-3 bg-gradient-to-br from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Plus className="w-5 h-5" />
                )}
                Agendar Cita
              </button>
            </div>
          )}
          </div>
        )}

        {/* Información adicional */}
        <div className="bg-white rounded-xl shadow-md border border-slate-200 p-4">
          <h2 className="text-sm font-bold text-slate-800 mb-3">Información Importante</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-xs font-bold text-slate-700 mb-2">Búsqueda de Estudiantes</h3>
              <ul className="text-xs text-slate-600 space-y-1">
                <li>• Buscar por DNI o correo electrónico</li>
                <li>• Solo estudiantes registrados</li>
                <li>• Verificar datos antes de agendar</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xs font-bold text-slate-700 mb-2">Agendamiento Directo</h3>
              <ul className="text-xs text-slate-600 space-y-1">
                <li>• Citas confirmadas automáticamente</li>
                <li>• Notificación al estudiante</li>
                <li>• Reprogramación disponible</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 