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
  XCircle,
  Loader2,
  RefreshCw,
  Edit,
  Info
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getUserAppointments } from '../../services/appointments';
import { PageHeader } from '../ui/PageHeader';

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
    <div className="space-y-6">
      <PageHeader 
        title="Reprogramar Citas"
        subtitle="Reprograma tus citas con 24 horas de anticipación"
      >
        <div className="flex items-center justify-between">
          <p className="text-base text-gray-500 font-medium text-center">
            Instituto Túpac Amaru - Psicología Clínica
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="ml-4"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
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

      {/* Información importante */}
      <Card className="p-6 bg-blue-50 border border-blue-200">
        <div className="flex items-start space-x-3">
          <Info className="w-6 h-6 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">Política de Reprogramación</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Solo puedes reprogramar citas confirmadas</li>
              <li>• Debes hacerlo con al menos 24 horas de anticipación</li>
              <li>• La nueva fecha debe ser al menos mañana</li>
              <li>• El psicólogo será notificado automáticamente</li>
              <li>• Solo se muestran las citas que puedes reprogramar</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Lista de citas reprogramables */}
      {loading ? (
        <Card className="p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-[#8e161a]"></Loader2>
            <span className="ml-3 text-gray-600">Cargando citas...</span>
          </div>
        </Card>
      ) : reschedulableAppointments.length === 0 ? (
        <Card className="p-6">
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-semibold">No hay citas para reprogramar</p>
            <p className="text-gray-500 text-sm mt-2">
              Solo se muestran citas confirmadas con más de 24 horas de anticipación
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {reschedulableAppointments.map((appointment) => (
            <Card key={appointment.id} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Cita con {appointment.psychologist_name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {new Date(appointment.date).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <Badge variant="info">Reprogramable</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Hora: {appointment.time}
                  </p>
                  <p className="text-sm text-gray-600">
                    <User className="w-4 h-4 inline mr-1" />
                    Psicólogo: {appointment.psychologist_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Agendada: {new Date(appointment.created_at).toLocaleDateString('es-ES')}
                  </p>
                  <p className="text-sm text-green-600">
                    <CheckCircle className="w-4 h-4 inline mr-1" />
                    Confirmada
                  </p>
                </div>
              </div>

              {appointment.reason && (
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Motivo de Consulta</h4>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {appointment.reason}
                  </p>
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  onClick={() => openRescheduleModal(appointment)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Reprogramar
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