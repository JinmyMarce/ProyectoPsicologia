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
  Save
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { PageHeader } from '../ui/PageHeader';

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

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Agendar Cita Directamente"
        subtitle="Busca un estudiante y agenda una cita para él"
      >
        <p className="text-base text-gray-500 font-medium text-center">
          Instituto Túpac Amaru - Psicología Clínica
        </p>
      </PageHeader>

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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de la cita
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={getMinDate()}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8e161a] focus:border-transparent"
              />
              {selectedDate && (
                <p className="text-sm text-gray-600 mt-1">
                  {formatDate(selectedDate)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hora de la cita
              </label>
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                disabled={!selectedDate || loadingSlots}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8e161a] focus:border-transparent disabled:bg-gray-100"
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
                <p className="text-sm text-gray-600 mt-1">
                  <Loader2 className="w-3 h-3 inline mr-1 animate-spin" />
                  Cargando horarios disponibles...
                </p>
              )}
            </div>
          </div>

          {/* Horarios disponibles */}
          {selectedDate && availableSlots.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-gray-900 mb-3">Horarios Disponibles</h3>
              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                {availableSlots.map(slot => (
                  <button
                    key={slot.time}
                    onClick={() => setSelectedTime(slot.time)}
                    disabled={!slot.available}
                    className={`p-2 text-sm rounded-lg border transition-colors ${
                      selectedTime === slot.time
                        ? 'bg-[#8e161a] text-white border-[#8e161a]'
                        : slot.available
                        ? 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    }`}
                  >
                    {slot.time}
                  </button>
                ))}
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