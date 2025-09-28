import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { 
  Calendar, 
  Clock, 
  User, 
  AlertCircle,
  CheckCircle,
  Loader2,
  RefreshCw,
  Edit,
  Info
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getUserAppointments } from '../../services/appointments';

interface Appointment {
  id: number;
  user_email: string;
  psychologist_name: string;
  date: string;
  time: string;
  reason: string;
  status: string;
  created_at: string;
}

interface RescheduleModalProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  onReschedule: (appointmentId: number, newDate: string, newTime: string) => Promise<void>;
}

const RescheduleModal: React.FC<RescheduleModalProps> = ({
  appointment,
  isOpen,
  onClose,
  onReschedule
}) => {
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
  ];

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const handleReschedule = async () => {
    if (!appointment || !newDate || !newTime) {
      setError('Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onReschedule(appointment.id, newDate, newTime);
      onClose();
    } catch (error: any) {
      setError(error.message || 'Error al reprogramar la cita');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !appointment) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">Reprogramar Cita</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
          >
            ✕
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Cita Actual</h4>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">
                <Calendar className="w-4 h-4 inline mr-1" />
                {new Date(appointment.date).toLocaleDateString('es-ES', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              <p className="text-sm text-gray-600">
                <Clock className="w-4 h-4 inline mr-1" />
                {appointment.time}
              </p>
              <p className="text-sm text-gray-600">
                <User className="w-4 h-4 inline mr-1" />
                {appointment.psychologist_name}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nueva fecha
            </label>
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              min={getMinDate()}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8e161a] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nueva hora
            </label>
            <select
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8e161a] focus:border-transparent"
            >
              <option value="">Seleccionar hora</option>
              {timeSlots.map(time => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <Info className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Importante:</p>
                <ul className="mt-1 space-y-1">
                  <li>• Solo puedes reprogramar con 24 horas de anticipación</li>
                  <li>• La nueva fecha debe ser al menos mañana</li>
                  <li>• El psicólogo será notificado del cambio</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              onClick={handleReschedule}
              disabled={loading || !newDate || !newTime}
              className="flex-1"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Edit className="w-4 h-4 mr-2" />
              )}
              Reprogramar
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export function RescheduleAppointment() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [rescheduleModal, setRescheduleModal] = useState<{
    isOpen: boolean;
    appointment: Appointment | null;
  }>({
    isOpen: false,
    appointment: null
  });

  useEffect(() => {
    if (user?.email) {
      loadAppointments();
    }
  }, [user]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getUserAppointments();
      setAppointments(data);
    } catch (error) {
      console.error('Error cargando citas:', error);
      setError('Error al cargar las citas. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAppointments();
    setRefreshing(false);
  };

  const canReschedule = (appointment: Appointment) => {
    const appointmentDate = new Date(appointment.date);
    const now = new Date();
    const timeDiff = appointmentDate.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    
    return hoursDiff >= 24 && appointment.status === 'confirmed';
  };

  const handleReschedule = async (appointmentId: number, newDate: string, newTime: string) => {
    try {
      // Simular reprogramación de cita (en un caso real, harías una llamada a la API)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('Cita reprogramada exitosamente');
      await loadAppointments(); // Recargar citas
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      throw new Error(error.message || 'Error al reprogramar la cita');
    }
  };

  const openRescheduleModal = (appointment: Appointment) => {
    setRescheduleModal({
      isOpen: true,
      appointment
    });
  };

  const closeRescheduleModal = () => {
    setRescheduleModal({
      isOpen: false,
      appointment: null
    });
  };

  const reschedulableAppointments = appointments.filter(canReschedule);

  return (
    <div className="space-y-6" style={{fontFamily: 'Inter, system-ui, sans-serif'}}>
      {/* Título Principal */}
      <div className="text-center mb-6">
        <div className="inline-block px-20 py-4 content-card border border-gray-200 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight mb-2">
            Reprogramar Citas
          </h1>
          <div className="w-28 h-1 bg-gradient-to-r from-gray-800 to-gray-600 mx-auto rounded-full"></div>
        </div>
      </div>


      {/* Mensajes de estado con diseño elegante */}
      {error && (
        <div className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 rounded-lg p-5 shadow-md mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="text-red-800 font-bold text-lg">Error</h4>
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-500 rounded-lg p-5 shadow-md mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="text-green-800 font-bold text-lg">Éxito</h4>
              <p className="text-green-700 font-medium">{success}</p>
            </div>
          </div>
        </div>
      )}


      {/* Políticas de Reprogramación - Diseño Compacto */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-md border border-gray-200 mb-6 p-4">
        {/* Header con botón integrado */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-[#6d1115] rounded-lg flex items-center justify-center shadow-sm">
              <Info className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-[#1e2a37] font-bold text-lg">Políticas de Reprogramación</h3>
              <p className="text-[#1e2a37]/70 text-xs">Conoce las reglas para reprogramar tus citas</p>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="border-[#6d1115] text-[#6d1115] hover:bg-[#6d1115] hover:text-white font-medium shadow-sm hover:shadow-md transition-all duration-300 text-xs px-3 py-1"
          >
            <RefreshCw className={`w-3 h-3 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
        
        {/* Reglas compactas en una sola fila */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          <div className="flex items-center space-x-2 p-2 bg-white rounded-md shadow-sm border border-gray-100">
            <div className="w-5 h-5 bg-[#6d1115] rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-xs">1</span>
            </div>
            <div>
              <h4 className="text-[#1e2a37] font-semibold text-xs">Solo Confirmadas</h4>
              <p className="text-[#1e2a37] text-xs leading-tight">Citas ya confirmadas</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 p-2 bg-white rounded-md shadow-sm border border-gray-100">
            <div className="w-5 h-5 bg-[#c2b280] rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-[#1e2a37] font-bold text-xs">2</span>
            </div>
            <div>
              <h4 className="text-[#1e2a37] font-semibold text-xs">24h Anticipación</h4>
              <p className="text-[#1e2a37] text-xs leading-tight">Mínimo 24 horas</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 p-2 bg-white rounded-md shadow-sm border border-gray-100">
            <div className="w-5 h-5 bg-[#6d1115] rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-xs">3</span>
            </div>
            <div>
              <h4 className="text-[#1e2a37] font-semibold text-xs">Fecha Mínima</h4>
              <p className="text-[#1e2a37] text-xs leading-tight">Al menos mañana</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 p-2 bg-white rounded-md shadow-sm border border-gray-100">
            <div className="w-5 h-5 bg-[#c2b280] rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-[#1e2a37] font-bold text-xs">4</span>
            </div>
            <div>
              <h4 className="text-[#1e2a37] font-semibold text-xs">Notificación</h4>
              <p className="text-[#1e2a37] text-xs leading-tight">Automática</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 p-2 bg-white rounded-md shadow-sm border border-gray-100">
            <div className="w-5 h-5 bg-[#6d1115] rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-xs">5</span>
            </div>
            <div>
              <h4 className="text-[#1e2a37] font-semibold text-xs">Filtrado</h4>
              <p className="text-[#1e2a37] text-xs leading-tight">Inteligente</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de citas reprogramables con diseño mejorado */}
      {loading ? (
        <Card className="p-8 content-card border border-gray-200 shadow-lg rounded-xl">
          <div className="flex items-center justify-center py-12">
            <div className="w-12 h-12 bg-gradient-to-br from-[#6d1115] to-[#4a0e10] rounded-full flex items-center justify-center shadow-lg">
              <Loader2 className="w-6 h-6 text-white animate-spin"></Loader2>
            </div>
            <span className="ml-4 text-[#1e2a37] font-semibold text-lg">Cargando citas...</span>
          </div>
        </Card>
      ) : reschedulableAppointments.length === 0 ? (
        <Card className="p-8 content-card border border-gray-200 shadow-lg rounded-xl">
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-br from-[#6d1115] to-[#4a0e10] rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
              <Calendar className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-[#1e2a37] font-bold text-xl mb-2">No hay citas para reprogramar</h3>
            <p className="text-gray-600 font-medium">
              Solo se muestran citas confirmadas con más de 24 horas de anticipación
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {reschedulableAppointments.map((appointment) => (
            <Card key={appointment.id} className="p-8 content-card border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-start space-x-5">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#6d1115] to-[#4a0e10] rounded-xl flex items-center justify-center shadow-lg">
                    <Calendar className="w-8 h-8 text-white" />
                  </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                    Cita con {appointment.psychologist_name}
                  </h3>
                    <p className="text-gray-600 font-semibold">
                    {new Date(appointment.date).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                </div>
                <Badge className="bg-gradient-to-r from-green-100 to-green-200 text-green-800 font-semibold px-4 py-2 rounded-full shadow-md">
                  Reprogramable
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Hora</p>
                      <p className="text-gray-900 font-semibold">{appointment.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <User className="w-4 h-4 text-purple-600" />
                    </div>
                <div>
                      <p className="text-sm text-gray-500 font-medium">Psicólogo</p>
                      <p className="text-gray-900 font-semibold">{appointment.psychologist_name}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Agendada</p>
                      <p className="text-gray-900 font-semibold">{new Date(appointment.created_at).toLocaleDateString('es-ES')}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div>
                      <p className="text-sm text-gray-500 font-medium">Estado</p>
                      <p className="text-green-600 font-semibold">Confirmada</p>
                    </div>
                  </div>
                </div>
              </div>

              {appointment.reason && (
                <div className="mb-6">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Info className="w-4 h-4 text-indigo-600" />
                    </div>
                    <h4 className="font-bold text-gray-900 text-lg">Motivo de Consulta</h4>
                  </div>
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
                    <p className="text-gray-800 font-medium leading-relaxed">
                    {appointment.reason}
                  </p>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  onClick={() => openRescheduleModal(appointment)}
                  className="bg-gradient-to-r from-[#6d1115] to-[#4a0e10] hover:from-[#4a0e10] hover:to-[#6d1115] text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <Edit className="w-5 h-5 mr-2" />
                  Reprogramar Cita
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de reprogramación */}
      <RescheduleModal
        appointment={rescheduleModal.appointment}
        isOpen={rescheduleModal.isOpen}
        onClose={closeRescheduleModal}
        onReschedule={handleReschedule}
      />
    </div>
  );
} 